<?php

namespace App\Services;

use App\Models\Application;
use App\Models\Verification;
use App\Models\User;
use App\Models\AuditLog;

class VerificationService
{
    protected ScoringService $scoringService;
    protected ApplicationService $applicationService;

    public function __construct(ScoringService $scoringService, ApplicationService $applicationService)
    {
        $this->scoringService = $scoringService;
        $this->applicationService = $applicationService;
    }

    /**
     * Submit field survey result by Kasun.
     */
    public function submitKasunSurvey(Application $application, User $kasun, array $data): Verification
    {
        // 1. Calculate scoring based on assistance type
        if ($application->assistance_type === 'RTLH') {
            $scoreResult = $this->scoringService->calculateRtlhScore($data['parameters'] ?? []);
        } else {
            $scoreResult = $this->scoringService->calculateDisabilityScore($data['parameters'] ?? []);
        }

        // 2. Create verification record
        $verification = Verification::create([
            'application_id' => $application->id,
            'verifier_id' => $kasun->id,
            'verification_level' => 'KASUN',
            'latitude' => $data['latitude'] ?? -7.8685,
            'longitude' => $data['longitude'] ?? 112.1852,
            'parameters_checklist' => [
                'input' => $data['parameters'] ?? [],
                'breakdown' => $scoreResult['breakdown'],
            ],
            'calculated_score' => $scoreResult['total_score'],
            'recommendation' => $data['recommendation'] ?? 'LAYAK',
            'notes' => $data['notes'] ?? 'Kondisi faktual telah diverifikasi oleh Kasun.',
            'signature_svg' => $data['signature_svg'] ?? null,
            'verified_at' => now(),
        ]);

        // 3. Update application priority score and status
        $application->priority_score = $scoreResult['total_score'];
        $application->urgency_level = $scoreResult['urgency'];

        $newStatus = ($data['recommendation'] === 'DIKEMBALIKAN')
            ? 'RETURNED_WITH_NOTES'
            : 'FORWARDED_TO_VILLAGE';

        $this->applicationService->updateStatus($application, $newStatus, $kasun->name, [
            'score' => $scoreResult['total_score'],
            'recommendation' => $data['recommendation'],
        ]);

        return $verification;
    }
}
