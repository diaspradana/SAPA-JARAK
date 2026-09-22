<?php

namespace App\Services;

use App\Models\Application;
use App\Models\Funding;
use App\Models\User;

class FundingService
{
    protected ApplicationService $applicationService;

    public function __construct(ApplicationService $applicationService)
    {
        $this->applicationService = $applicationService;
    }

    /**
     * Allocate funding source and budget.
     */
    public function allocateFunding(Application $application, User $official, array $data): Funding
    {
        $funding = Funding::updateOrCreate(
            ['application_id' => $application->id],
            [
                'source' => $data['source'] ?? 'APBDES_DANA_DESA',
                'fiscal_year' => $data['fiscal_year'] ?? date('Y'),
                'account_code' => $data['account_code'] ?? '02.01.05 Sub-Bidang RTLH',
                'allocated_budget' => $data['allocated_budget'] ?? 15000000,
                'realized_budget' => $data['realized_budget'] ?? 0,
                'approved_by' => $official->id,
                'approved_at' => now(),
                'status' => 'ALLOCATED',
            ]
        );

        $this->applicationService->updateStatus($application, 'APPROVED', $official->name, [
            'funding_source' => $funding->source,
            'budget' => $funding->allocated_budget,
        ]);

        return $funding;
    }
}
