<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\CalculateScoreRequest;
use App\Http\Requests\SubmitSurveyRequest;
use App\Services\ApplicationService;
use App\Services\ScoringService;
use App\Models\Application;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ApplicationController extends Controller
{
    protected ScoringService $scoringService;
    protected ApplicationService $applicationService;

    public function __construct(ScoringService $scoringService, ApplicationService $applicationService)
    {
        $this->scoringService = $scoringService;
        $this->applicationService = $applicationService;
    }

    /**
     * Preview / Simulate scoring calculation dry-run without persisting to database.
     */
    public function calculateScore(CalculateScoreRequest $request): JsonResponse
    {
        $assistanceType = strtoupper($request->input('assistance_type'));
        $parameters = $request->input('parameters', []);

        if ($assistanceType === 'RTLH') {
            $result = $this->scoringService->calculateRtlhScore($parameters);
        } else {
            $result = $this->scoringService->calculateDisabilityScore($parameters);
        }

        return response()->json([
            'success' => true,
            'message' => 'Simulasi perhitungan skor kelayakan berhasil dihitung.',
            'data' => [
                'assistance_type' => $assistanceType,
                'total_score'     => $result['total_score'],
                'urgency'         => $result['urgency'],
                'is_eligible'     => $result['is_eligible'],
                'breakdown'       => $result['breakdown'],
            ],
        ], 200);
    }

    /**
     * Optional: Get detailed score simulation for an existing application.
     */
    public function calculateForApplication(CalculateScoreRequest $request, int $id): JsonResponse
    {
        $application = Application::findOrFail($id);
        $parameters = $request->input('parameters', []);

        if ($application->assistance_type === 'RTLH') {
            $result = $this->scoringService->calculateRtlhScore($parameters);
        } else {
            $result = $this->scoringService->calculateDisabilityScore($parameters);
        }

        return response()->json([
            'success' => true,
            'message' => "Simulasi penilaian untuk tiket {$application->ticket_number} berhasil.",
            'data' => [
                'application_id'  => $application->id,
                'ticket_number'   => $application->ticket_number,
                'assistance_type' => $application->assistance_type,
                'total_score'     => $result['total_score'],
                'urgency'         => $result['urgency'],
                'is_eligible'     => $result['is_eligible'],
                'breakdown'       => $result['breakdown'],
            ],
        ], 200);
    }

    /**
     * Simpan hasil survei lapangan Kasun: hitung skor, persist ke
     * application_scores, lalu teruskan tiket ke Pemerintah Desa.
     */
    public function submitSurvey(SubmitSurveyRequest $request, int $id): JsonResponse
    {
        $application = Application::findOrFail($id);

        if ($application->status !== 'KASUN_VERIFICATION') {
            return response()->json([
                'success' => false,
                'message' => "Survei hanya dapat disubmit saat status pengajuan KASUN_VERIFICATION. Status saat ini: {$application->status}.",
                'data' => [
                    'application_id'  => $application->id,
                    'current_status'  => $application->status,
                    'required_status' => 'KASUN_VERIFICATION',
                ],
            ], 403);
        }

        $parameters = $request->input('parameters', []);

        $result = ($application->assistance_type === 'RTLH')
            ? $this->scoringService->calculateRtlhScore($parameters)
            : $this->scoringService->calculateDisabilityScore($parameters);

        [$application, $score] = DB::transaction(function () use ($application, $request, $result) {
            // Satu baris agregat per pengajuan; diperbarui bila survei disubmit ulang.
            $score = $application->score()->updateOrCreate(
                ['application_id' => $application->id],
                [
                    'criterion_id' => null,
                    'value'        => null,
                    'total_score'  => $result['total_score'],
                    'breakdown'    => $result['breakdown'],
                    'urgency'      => $result['urgency'],
                    'is_eligible'  => $result['is_eligible'],
                ]
            );

            $application->priority_score = (int) $result['total_score'];
            $application->urgency_level = $result['urgency'];

            // Transisi status + pencatatan audit trail memakai ApplicationService.
            $this->applicationService->updateStatus(
                $application,
                'FORWARDED_TO_VILLAGE',
                $request->user()?->name ?? 'Kasun',
                [
                    'total_score'     => $result['total_score'],
                    'urgency'         => $result['urgency'],
                    'recommendation'  => $request->input('recommendation', 'LAYAK'),
                ]
            );

            return [$application, $score];
        });

        return response()->json([
            'success' => true,
            'message' => "Hasil survei tiket {$application->ticket_number} berhasil disimpan dan diteruskan ke Pemerintah Desa.",
            'data' => [
                'application_id'  => $application->id,
                'ticket_number'   => $application->ticket_number,
                'assistance_type' => $application->assistance_type,
                'total_score'     => $result['total_score'],
                'urgency'         => $result['urgency'],
                'is_eligible'     => $result['is_eligible'],
                'breakdown'       => $result['breakdown'],
                'status'          => $application->status,
                'score_id'        => $score->id,
            ],
        ], 200);
    }
}
