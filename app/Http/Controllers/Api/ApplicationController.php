<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\CalculateScoreRequest;
use App\Services\ScoringService;
use App\Models\Application;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ApplicationController extends Controller
{
    protected ScoringService $scoringService;

    public function __construct(ScoringService $scoringService)
    {
        $this->scoringService = $scoringService;
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
}
