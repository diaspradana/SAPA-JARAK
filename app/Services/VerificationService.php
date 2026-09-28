<?php

namespace App\Services;

use App\Models\Application;
use App\Models\Verification;
use App\Models\User;
use App\Models\AuditLog;
use Illuminate\Support\Facades\Http;

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

        // 2. Query AI / ML Assistant for Decision Support (Non-intrusive sidecar)
        $aiPayload = [
            'tanggungan_keluarga' => $application->beneficiary->family_members_count ?? 3,
            'usia_kepala_keluarga' => 54,
            'ada_disabilitas_lansia' => ($application->assistance_type === 'DISABILITAS') ? 1 : 0,
            'desil_dtks' => 1,
            'daya_listrik_va' => 450,
            'pendapatan_bulanan' => 650000.0,
            'kondisi_dinding' => str_contains(strtolower($data['parameters']['wallCondition'] ?? ''), 'gedek') ? 'gedek' : 'layak',
            'kondisi_lantai' => str_contains(strtolower($data['parameters']['floorCondition'] ?? ''), 'tanah') ? 'tanah' : 'keramik',
            'kondisi_atap' => str_contains(strtolower($data['parameters']['roofCondition'] ?? ''), 'rapuh') ? 'rapuh_bocor' : 'kokoh',
            'sanitasi_mck' => str_contains(strtolower($data['parameters']['sanitationCondition'] ?? ''), 'tidak_ada') ? 'tidak_ada' : 'mandiri',
            'status_tanah' => 'milik_sendiri',
        ];
        $aiRecommendation = $this->getMlRecommendation($aiPayload);

        // 3. Create verification record
        $verification = Verification::create([
            'application_id' => $application->id,
            'verifier_id' => $kasun->id,
            'verification_level' => 'KASUN',
            'latitude' => $data['latitude'] ?? -7.8685,
            'longitude' => $data['longitude'] ?? 112.1852,
            'parameters_checklist' => [
                'input' => $data['parameters'] ?? [],
                'breakdown' => $scoreResult['breakdown'],
                'ai_recommendation' => $aiRecommendation,
            ],
            'calculated_score' => $scoreResult['total_score'],
            'recommendation' => $data['recommendation'] ?? 'LAYAK',
            'notes' => $data['notes'] ?? 'Kondisi faktual telah diverifikasi oleh Kasun.',
            'signature_svg' => $data['signature_svg'] ?? null,
            'verified_at' => now(),
        ]);

        // 4. Update application priority score and status
        $application->priority_score = $scoreResult['total_score'];
        $application->urgency_level = $scoreResult['urgency'];

        $newStatus = ($data['recommendation'] === 'DIKEMBALIKAN')
            ? 'RETURNED_WITH_NOTES'
            : 'FORWARDED_TO_VILLAGE';

        $this->applicationService->updateStatus($application, $newStatus, $kasun->name, [
            'score' => $scoreResult['total_score'],
            'recommendation' => $data['recommendation'],
            'ai_confidence' => $aiRecommendation['confidence'] ?? null,
        ]);

        return $verification;
    }

    /**
     * Helper to query smart decision support from the Python FastAPI ML microservice.
     * Implements graceful fallback if the ML container is offline or times out.
     */
    public function getMlRecommendation(array $citizenData): array
    {
        try {
            $mlHost = env('ML_SERVICE_URL', 'http://ai_assistant:8001');
            $response = Http::timeout(2.0)->post("{$mlHost}/predict", $citizenData);

            if ($response->successful()) {
                return $response->json();
            }
        } catch (\Throwable $e) {
            // Graceful silent fallback if ML container is offline or times out
        }

        return [
            'status' => 'fallback',
            'predicted_class' => 'MANUAL_CALCULATION',
            'confidence' => null,
            'recommendation_text' => 'Menggunakan rumus reguler baku Desa Jarak.',
            'reasons' => ['Kalkulasi deterministik berbasis Peraturan Desa Jarak']
        ];
    }
}
