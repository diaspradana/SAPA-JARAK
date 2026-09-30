<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Application;
use App\Services\VerificationService;
use App\Services\WhatsAppNotificationService;

class KasunController extends Controller
{
    protected VerificationService $verificationService;
    protected WhatsAppNotificationService $whatsappService;

    public function __construct(VerificationService $verificationService, WhatsAppNotificationService $whatsappService)
    {
        $this->verificationService = $verificationService;
        $this->whatsappService = $whatsappService;
    }

    /**
     * Get queue of applications for Kasun workspace.
     */
    public function queue(Request $request)
    {
        $user = $request->user();
        $query = Application::with(['beneficiary', 'hamlet', 'latestVerification']);

        if ($user && $user->hamlet_id) {
            $query->where('hamlet_id', $user->hamlet_id);
        } elseif ($request->has('hamlet_id')) {
            $query->where('hamlet_id', $request->input('hamlet_id'));
        }

        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }

        $applications = $query->latest('submitted_at')->get();

        return response()->json([
            'success' => true,
            'data' => $applications,
            'counts' => [
                'total' => $applications->count(),
                'waiting_survey' => $applications->whereIn('status', ['SUBMITTED', 'WAITING_KASUN_VERIFICATION'])->count(),
                'forwarded' => $applications->where('status', 'FORWARDED_TO_VILLAGE')->count(),
                'returned' => $applications->where('status', 'RETURNED_WITH_NOTES')->count(),
            ],
        ]);
    }

    /**
     * Submit field survey evaluation.
     */
    public function submitSurvey(Request $request, int $id)
    {
        $application = Application::findOrFail($id);
        $user = $request->user() ?? \App\Models\User::where('role', 'kasun')->first();

        $validated = $request->validate([
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'parameters' => 'required|array',
            'recommendation' => 'required|in:LAYAK,DIKEMBALIKAN,TIDAK_LAYAK',
            'notes' => 'required|string',
            'signature_svg' => 'nullable|string',
        ]);

        $verification = $this->verificationService->submitKasunSurvey($application, $user, $validated);

        // Send WhatsApp notification to citizen
        $statusNote = ($validated['recommendation'] === 'LAYAK')
            ? "Hasil survei lapangan menyatakan LAYAK dan telah diteruskan ke Pemerintah Desa."
            : "Pengajuan dikembalikan oleh Kasun: {$validated['notes']}";

        $this->whatsappService->notifyStatusChange($application->fresh(), $application->fresh()->status, $statusNote);

        return response()->json([
            'success' => true,
            'message' => 'Hasil verifikasi survei lapangan berhasil disimpan dan disinkronkan.',
            'data' => [
                'verification_id' => $verification->id,
                'score' => $verification->calculated_score,
                'status' => $application->fresh()->status,
            ],
        ]);
    }

    /**
     * Get real-time AI Decision Support Recommendation from FastAPI microservice.
     */
    public function getAiRecommendation(Request $request)
    {
        $payload = [
            'tanggungan_keluarga' => (int) $request->input('tanggungan_keluarga', 3),
            'usia_kepala_keluarga' => (int) $request->input('usia_kepala_keluarga', 54),
            'ada_disabilitas_lansia' => (int) $request->input('ada_disabilitas_lansia', 0),
            'desil_dtks' => (int) $request->input('desil_dtks', 1),
            'daya_listrik_va' => (int) $request->input('daya_listrik_va', 450),
            'pendapatan_bulanan' => (float) $request->input('pendapatan_bulanan', 650000.0),
            'kondisi_dinding' => (string) $request->input('kondisi_dinding', 'gedek'),
            'kondisi_lantai' => (string) $request->input('kondisi_lantai', 'tanah'),
            'kondisi_atap' => (string) $request->input('kondisi_atap', 'rapuh_bocor'),
            'sanitasi_mck' => (string) $request->input('sanitasi_mck', 'tidak_ada'),
            'status_tanah' => (string) $request->input('status_tanah', 'milik_sendiri'),
        ];

        $recommendation = $this->verificationService->getMlRecommendation($payload);

        return response()->json([
            'success' => true,
            'data' => $recommendation,
        ]);
    }

    /**
     * Export Kasun survey queue & assessment data to Excel (.xls) or CSV.
     */
    public function export(Request $request, \App\Services\ExportService $exportService)
    {
        $user = $request->user();
        $filters = $request->only(['hamlet_id', 'status', 'delimiter']);
        $format = $request->input('format', 'csv');
        return $exportService->exportKasunQueue($filters, $user, $format);
    }
}
