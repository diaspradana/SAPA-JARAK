<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\ApplicationService;
use App\Services\WhatsAppNotificationService;
use App\Models\Application;
use App\Models\Hamlet;
use App\Models\Notification;

class PublicApplicationController extends Controller
{
    protected ApplicationService $applicationService;
    protected WhatsAppNotificationService $whatsappService;

    public function __construct(ApplicationService $applicationService, WhatsAppNotificationService $whatsappService)
    {
        $this->applicationService = $applicationService;
        $this->whatsappService = $whatsappService;
    }

    /**
     * Request OTP via WhatsApp before submission.
     */
    public function requestOtp(Request $request)
    {
        $request->validate([
            'phone' => 'required|string|min:9',
            'name' => 'nullable|string',
        ]);

        $otp = (string) rand(100000, 999999);
        $phone = $request->input('phone');
        $name = $request->input('name');

        $this->whatsappService->sendOtp($phone, $otp, $name);

        $response = [
            'success' => true,
            'message' => "Kode OTP telah dikirimkan ke nomor WhatsApp {$phone}.",
        ];
        if (app()->environment(['local', 'testing'])) {
            $response['simulation_otp'] = $otp;
        }

        return response()->json($response);
    }

    /**
     * Verify OTP and submit assistance application.
     */
    public function submit(Request $request)
    {
        $validated = $request->validate([
            'beneficiary_name' => 'required|string|max:150',
            'nik' => 'nullable|string|max:20',
            'kk_number' => 'nullable|string|max:20',
            'beneficiary_phone' => 'nullable|string|max:30',
            'hamlet_id' => 'required|exists:hamlets,id',
            'rt' => 'nullable|string|max:5',
            'rw' => 'nullable|string|max:5',
            'address' => 'required|string',
            'is_unregistered' => 'nullable|boolean',
            'assistance_type' => 'required|in:DISABILITAS,RTLH',
            'reporter_name' => 'nullable|string',
            'reporter_phone' => 'required|string',
            'reporter_relationship' => 'nullable|string',
            'description' => 'nullable|string',
            'needs_description' => 'nullable|string',
            'otp' => 'required|string',
            'document_ids' => 'nullable|array',
            'document_ids.*' => 'integer|exists:documents,id',
        ]);

        // Verify OTP from notifications table (last 10 mins)
        $validOtp = Notification::where('recipient_phone', $validated['reporter_phone'])
            ->where('event_type', 'OTP_VERIFICATION')
            ->where('otp_code', $validated['otp'])
            ->where('created_at', '>=', now()->subMinutes(15))
            ->exists();

        $demoOtpAllowed = app()->environment(['local', 'testing']) && $validated['otp'] === '123456';
        if (!$validOtp && !$demoOtpAllowed) {
            return response()->json([
                'success' => false,
                'message' => 'Kode OTP tidak valid atau telah kedaluwarsa.',
            ], 422);
        }

        $application = $this->applicationService->createApplication($validated);

        // Link any pre-uploaded documents to this new application
        if (!empty($validated['document_ids'])) {
            \App\Models\Document::whereIn('id', $validated['document_ids'])
                ->whereNull('application_id')
                ->update(['application_id' => $application->id]);
        }

        // Send confirmation WhatsApp message
        $this->whatsappService->notifyStatusChange($application, 'SUBMITTED', 'Pengajuan berhasil diterima dan masuk ke antrean verifikasi Kasun.');

        return response()->json([
            'success' => true,
            'message' => 'Pengajuan bantuan sosial berhasil dibuat.',
            'data' => [
                'id' => $application->id,
                'ticket_number' => $application->ticket_number,
                'status' => $application->status,
                'submitted_at' => $application->submitted_at->toISOString(),
            ],
        ], 201);
    }

    /**
     * Track application by ticket number.
     */
    public function track(Request $request, string $ticket)
    {
        $ticket = trim($ticket);
        if (!str_starts_with($ticket, '#')) {
            $ticket = '#' . $ticket;
        }

        $application = Application::with([
            'beneficiary',
            'hamlet',
            'latestVerification.verifier',
            'funding',
            'procurement',
            'handover',
            'documents' => fn($q) => $q->where('visibility', 'PUBLIC_MASKED'),
            'auditLogs' => fn($q) => $q->latest()
        ])->where('ticket_number', $ticket)->first();

        if (!$application) {
            return response()->json([
                'success' => false,
                'message' => "Pengajuan dengan nomor tiket {$ticket} tidak ditemukan dalam sistem.",
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $application,
        ]);
    }

    /**
     * Get list of official hamlets (Dusun).
     */
    public function hamlets()
    {
        return response()->json([
            'success' => true,
            'data' => Hamlet::where('status', 'active')->get(),
        ]);
    }

    /**
     * Download registration receipt as server-side generated PDF.
     */
    public function downloadReceiptPdf(string $ticket, \App\Services\PdfService $pdfService)
    {
        $normalizedTicket = ltrim($ticket, '#');
        $application = Application::with(['beneficiary', 'hamlet'])
            ->where('ticket_number', $normalizedTicket)
            ->orWhere('ticket_number', "#{$normalizedTicket}")
            ->first();

        if (!$application) {
            return response()->json([
                'success' => false,
                'message' => "Pengajuan dengan nomor tiket {$ticket} tidak ditemukan.",
            ], 404);
        }

        return $pdfService->generateReceiptPdf($application);
    }
    /**
     * Get all applications belonging to the authenticated warga.
     */
    public function myApplications(Request $request)
    {
        $user = $request->user();
        $applications = Application::with([
            'beneficiary',
            'hamlet',
            'latestVerification.verifier',
            'funding',
            'procurement',
            'handover',
            'auditLogs' => fn ($q) => $q->latest(),
            'documents' => fn($q) => $q->where('visibility', 'PUBLIC_MASKED'),
        ])
            ->where(function ($q) use ($user) {
                $q->where('reporter_phone', $user->phone);
                if ($user->nik) {
                    $q->orWhereHas('beneficiary', fn($bq) => $bq->where('nik', $user->nik));
                }
            })
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['success' => true, 'data' => $applications]);
    }

    /**
     * Get notifications for the authenticated warga.
     */
    public function myNotifications(Request $request)
    {
        $user = $request->user();
        $notifications = Notification::where('recipient_phone', $user->phone)
            ->orderBy('created_at', 'desc')
            ->limit(50)
            ->get();

        return response()->json(['success' => true, 'data' => $notifications]);
    }

    /**
     * Submit a pengaduan (complaint / inquiry) from a warga.
     */
    public function submitPengaduan(Request $request)
    {
        $validated = $request->validate([
            'type'          => 'required|in:PERTANYAAN,KOREKSI_DATA,KELUHAN',
            'ticket_number' => 'nullable|string|max:30',
            'message'       => 'required|string|min:10|max:2000',
        ]);

        $user = $request->user();
        $pengaduanNumber = 'PDU-' . strtoupper(substr($validated['type'], 0, 3)) . '-' . date('Ymd') . '-' . rand(1000, 9999);

        \App\Models\AuditLog::create([
            'user_id'     => $user->id,
            'actor_name'  => $user->name,
            'action'      => 'PENGADUAN_SUBMITTED',
            'entity_type' => 'Pengaduan',
            'entity_id'   => null,
            'new_values'  => array_merge($validated, ['pengaduan_number' => $pengaduanNumber]),
            'ip_address'  => $request->ip(),
            'user_agent'  => $request->userAgent(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Pengaduan berhasil dikirim. Tim desa akan menindaklanjuti dalam 2x24 jam.',
            'data'    => ['pengaduan_number' => $pengaduanNumber],
        ], 201);
    }

    /**
     * Update profile for the authenticated warga.
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();
        $validated = $request->validate([
            'name'      => 'sometimes|required|string|max:150',
            'email'     => "sometimes|nullable|email|max:150|unique:users,email,{$user->id}",
            'phone'     => "sometimes|required|string|max:30|unique:users,phone,{$user->id}",
            'nik'       => "sometimes|nullable|string|max:20|unique:users,nik,{$user->id}",
            'kk_number' => 'sometimes|nullable|string|max:20',
            'rt'        => 'sometimes|nullable|string|max:5',
            'rw'        => 'sometimes|nullable|string|max:5',
            'address'   => 'sometimes|nullable|string|max:255',
        ]);

        $user->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Profil berhasil diperbarui di server.',
            'data' => $user->load('hamlet'),
        ]);
    }
}