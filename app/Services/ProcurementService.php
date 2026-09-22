<?php

namespace App\Services;

use App\Models\Application;
use App\Models\Procurement;
use App\Models\Assistance;

class ProcurementService
{
    protected ApplicationService $applicationService;

    public function __construct(ApplicationService $applicationService)
    {
        $this->applicationService = $applicationService;
    }

    /**
     * Save or update RAB items and progress.
     */
    public function updateProcurement(Application $application, array $data, ?string $actor = null): Procurement
    {
        $rabItems = $data['rab_items'] ?? [];
        $totalRab = 0;

        foreach ($rabItems as $item) {
            $totalRab += (float) ($item['total'] ?? 0);
        }

        $progress = (int) ($data['progress_percentage'] ?? 0);

        $procurement = Procurement::updateOrCreate(
            ['application_id' => $application->id],
            [
                'rab_items' => $rabItems,
                'total_rab' => $totalRab > 0 ? $totalRab : (float) ($data['total_rab'] ?? 0),
                'progress_percentage' => $progress,
                'contractor_or_vendor' => $data['contractor_or_vendor'] ?? 'TPK Desa Jarak',
                'field_notes' => $data['field_notes'] ?? null,
                'start_date' => $data['start_date'] ?? now()->toDateString(),
                'completion_date' => $progress === 100 ? now()->toDateString() : null,
            ]
        );

        if ($progress >= 100) {
            $this->applicationService->updateStatus($application, 'READY_FOR_HANDOVER', $actor, [
                'progress' => 100,
            ]);
        } elseif ($progress > 0) {
            $this->applicationService->updateStatus($application, 'PROCUREMENT_IN_PROGRESS', $actor, [
                'progress' => $progress,
            ]);
        }

        return $procurement;
    }
}
