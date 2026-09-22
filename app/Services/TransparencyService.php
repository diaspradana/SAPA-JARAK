<?php

namespace App\Services;

use App\Models\Application;
use App\Models\Funding;
use App\Models\Hamlet;

class TransparencyService
{
    /**
     * Get aggregate metrics for public transparency dashboard.
     */
    public function getPublicMetrics(): array
    {
        $totalApplications = Application::count();
        $totalCompleted = Application::where('status', 'COMPLETED')->count();
        $totalRtlh = Application::where('assistance_type', 'RTLH')->count();
        $totalDisability = Application::where('assistance_type', 'DISABILITAS')->count();

        $totalAllocatedBudget = (float) Funding::sum('allocated_budget');
        $totalRealizedBudget = (float) Funding::sum('realized_budget');

        return [
            'total_applications' => $totalApplications,
            'total_completed' => $totalCompleted,
            'total_rtlh' => $totalRtlh,
            'total_disability' => $totalDisability,
            'total_allocated_budget' => $totalAllocatedBudget,
            'total_realized_budget' => $totalRealizedBudget,
            'completion_rate' => $totalApplications > 0 ? round(($totalCompleted / $totalApplications) * 100, 1) : 0,
        ];
    }

    /**
     * Get privacy-masked open ledger entries.
     */
    public function getPublicLedger(array $filters = []): array
    {
        $query = Application::with(['beneficiary', 'hamlet', 'funding', 'procurement', 'handover'])
            ->whereIn('status', [
                'APPROVED',
                'FUNDING_ALLOCATED',
                'PROCUREMENT_IN_PROGRESS',
                'READY_FOR_HANDOVER',
                'COMPLETED'
            ]);

        if (!empty($filters['hamlet_id'])) {
            $query->where('hamlet_id', $filters['hamlet_id']);
        }

        if (!empty($filters['assistance_type'])) {
            $query->where('assistance_type', $filters['assistance_type']);
        }

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('ticket_number', 'like', "%{$search}%");
            });
        }

        $items = $query->latest('updated_at')->paginate($filters['per_page'] ?? 15);

        $transformed = $items->map(function ($app) {
            return [
                'id' => $app->id,
                'ticket_number' => $app->ticket_number,
                'masked_beneficiary' => $app->beneficiary ? $app->beneficiary->masked_name : 'Warga Jarak',
                'hamlet_name' => $app->hamlet ? $app->hamlet->name : '-',
                'rt' => $app->beneficiary ? $app->beneficiary->rt : '01',
                'assistance_type' => $app->assistance_type,
                'status' => $app->status,
                'funding_source' => $app->funding ? $app->funding->source : 'APBDES_DANA_DESA',
                'allocated_budget' => $app->funding ? (float) $app->funding->allocated_budget : 0,
                'realized_budget' => $app->funding ? (float) $app->funding->realized_budget : 0,
                'progress' => $app->procurement ? $app->procurement->progress_percentage : ($app->status === 'COMPLETED' ? 100 : 0),
                'completed_at' => $app->completed_at ? $app->completed_at->format('d M Y') : null,
            ];
        });

        return [
            'data' => $transformed,
            'current_page' => $items->currentPage(),
            'last_page' => $items->lastPage(),
            'total' => $items->total(),
        ];
    }
}
