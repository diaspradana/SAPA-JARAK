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

        return response()->json([
            'success' => true,
            'message' => "Kode OTP telah dikirimkan ke nomor WhatsApp {$phone}.",
            'simulation_otp' => $otp, // Useful for demo & testing
        ]);
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
        ]);

        // Verify OTP from notifications table (last 10 mins)
        $validOtp = Notification::where('recipient_phone', $validated['reporter_phone'])
            ->where('event_type', 'OTP_VERIFICATION')
            ->where('otp_code', $validated['otp'])
            ->where('created_at', '>=', now()->subMinutes(15))
            ->exists();

        // For flexible development, accept demo OTP '123456' as well
        if (!$validOtp && $validated['otp'] !== '123456') {
            return response()->json([
                'success' => false,
                'message' => 'Kode OTP tidak valid atau telah kedaluwarsa.',
            ], 422);
        }

        $application = $this->applicationService->createApplication($validated);

        // Send confirmation WhatsApp message
        $this->whatsappService->notifyStatusChange($application, 'SUBMITTED', 'Pengajuan berhasil diterima dan masuk ke antrean verifikasi Kasun.');

        return response()->json([
            'success' => true,
            'message' => 'Pengajuan bantuan sosial berhasil dibuat.',
            'data' => [
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
}
