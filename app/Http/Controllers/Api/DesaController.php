<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Application;
use App\Models\Handover;
use App\Services\ApplicationService;
use App\Services\FundingService;
use App\Services\ProcurementService;
use App\Services\ReportingService;
use App\Services\WhatsAppNotificationService;

class DesaController extends Controller
{
    protected ApplicationService $applicationService;
    protected FundingService $fundingService;
    protected ProcurementService $procurementService;
    protected ReportingService $reportingService;
    protected WhatsAppNotificationService $whatsappService;

    public function __construct(
        ApplicationService $applicationService,
        FundingService $fundingService,
        ProcurementService $procurementService,
        ReportingService $reportingService,
        WhatsAppNotificationService $whatsappService
    ) {
        $this->applicationService = $applicationService;
        $this->fundingService = $fundingService;
        $this->procurementService = $procurementService;
        $this->reportingService = $reportingService;
        $this->whatsappService = $whatsappService;
    }

    /**
     * Dashboard overview for Desa administration.
     */
    public function dashboard()
    {
        $applications = Application::with(['beneficiary', 'hamlet', 'latestVerification', 'funding', 'procurement', 'handover'])->latest()->get();

        return response()->json([
            'success' => true,
            'data' => $applications,
            'counts' => [
                'total' => $applications->count(),
                'need_validation' => $applications->where('status', 'FORWARDED_TO_VILLAGE')->count(),
                'in_procurement' => $applications->whereIn('status', ['APPROVED', 'FUNDING_ALLOCATED', 'PROCUREMENT_IN_PROGRESS'])->count(),
                'ready_handover' => $applications->where('status', 'READY_FOR_HANDOVER')->count(),
                'completed' => $applications->where('status', 'COMPLETED')->count(),
            ],
        ]);
    }

    /**
     * Validate & Approve in Musdes with Funding Allocation.
     */
    public function validateAndFund(Request $request, int $id)
    {
        $application = Application::findOrFail($id);
        $user = $request->user() ?? \App\Models\User::where('role', 'kades')->first();

        $validated = $request->validate([
            'decision' => 'required|in:APPROVED,REJECTED',
            'source' => 'required_if:decision,APPROVED|string',
            'allocated_budget' => 'required_if:decision,APPROVED|numeric',
            'account_code' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        if ($validated['decision'] === 'APPROVED') {
            $funding = $this->fundingService->allocateFunding($application, $user, [
                'source' => $validated['source'],
                'allocated_budget' => $validated['allocated_budget'],
                'account_code' => $validated['account_code'] ?? '02.01.05',
            ]);

            $this->whatsappService->notifyStatusChange(
                $application->fresh(),
                'APPROVED',
                "Bantuan telah disetujui dalam Musdes dengan sumber pendanaan {$funding->source} sebesar Rp " . number_format($funding->allocated_budget, 0, ',', '.')
            );
        } else {
            $this->applicationService->updateStatus($application, 'REJECTED', $user->name, [
                'reason' => $validated['notes'] ?? 'Tidak memenuhi kriteria kelayakan Musdes.',
            ]);

            $this->whatsappService->notifyStatusChange(
                $application->fresh(),
                'REJECTED',
                $validated['notes'] ?? 'Pengajuan belum dapat disetujui dalam Musdes periode ini.'
            );
        }

        return response()->json([
            'success' => true,
            'message' => 'Keputusan validasi dan pendanaan berhasil dicatat.',
            'status' => $application->fresh()->status,
        ]);
    }

    /**
     * Update RAB and Procurement Progress.
     */
    public function updateProcurement(Request $request, int $id)
    {
        $application = Application::findOrFail($id);
        $user = $request->user() ?? \App\Models\User::where('role', 'kasi_kesra')->first();

        $validated = $request->validate([
            'rab_items' => 'nullable|array',
            'total_rab' => 'nullable|numeric',
            'progress_percentage' => 'required|integer|min:0|max:100',
            'contractor_or_vendor' => 'nullable|string',
            'field_notes' => 'nullable|string',
        ]);

        $procurement = $this->procurementService->updateProcurement($application, $validated, $user->name);

        return response()->json([
            'success' => true,
            'message' => 'Data RAB dan progres pengadaan berhasil disimpan.',
            'data' => $procurement,
            'status' => $application->fresh()->status,
        ]);
    }

    /**
     * Submit BAST and complete application.
     */
    public function completeHandover(Request $request, int $id)
    {
        $application = Application::findOrFail($id);
        $user = $request->user() ?? \App\Models\User::where('role', 'kades')->first();

        $validated = $request->validate([
            'bast_number' => 'required|string',
            'handover_date' => 'required|date',
            'recipient_name' => 'required|string',
            'signature_recipient_svg' => 'nullable|string',
            'signature_official_svg' => 'nullable|string',
            'notes' => 'nullable|string',
        ]);

        $handover = Handover::updateOrCreate(
            ['application_id' => $application->id],
            [
                'bast_number' => $validated['bast_number'],
                'handover_date' => $validated['handover_date'],
                'recipient_name' => $validated['recipient_name'],
                'official_id' => $user->id,
                'signature_recipient_svg' => $validated['signature_recipient_svg'] ?? null,
                'signature_official_svg' => $validated['signature_official_svg'] ?? null,
                'notes' => $validated['notes'] ?? 'Serah terima resmi telah dilakukan.',
                'is_published_to_transparency' => true,
            ]
        );

        // Transition status to COMPLETED
        $this->applicationService->updateStatus($application, 'COMPLETED', $user->name, [
            'bast_number' => $handover->bast_number,
        ]);

        $this->whatsappService->notifyStatusChange(
            $application->fresh(),
            'COMPLETED',
            "Serah terima bantuan telah selesai dengan nomor BAST {$handover->bast_number}. Dokumentasi telah dipublikasikan ke register terbuka desa."
        );

        return response()->json([
            'success' => true,
            'message' => 'Berita Acara Serah Terima (BAST) berhasil diterbitkan dan status bantuan telah SELESAI.',
            'data' => $handover,
            'status' => $application->fresh()->status,
        ]);
    }

    /**
     * Generate SPJ Report.
     */
    public function spjReport(Request $request)
    {
        $filters = $request->only(['hamlet_id', 'year']);
        $report = $this->reportingService->generateSpjReport($filters);

        return response()->json([
            'success' => true,
            'data' => $report,
        ]);
    }
}
