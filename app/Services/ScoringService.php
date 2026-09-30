<?php

namespace App\Services;

use App\Models\Setting;

class ScoringService
{
    /**
     * Calculate score for RTLH assistance.
     * Dynamic weights from settings with static fallback.
     */
    public function calculateRtlhScore(array $params): array
    {
        $weights = Setting::get('scoring.rtlh_weights', [
            'dinding' => 25,
            'lantai' => 25,
            'atap' => 25,
            'mck' => 25,
        ]);

        $wDinding = (int) ($weights['dinding'] ?? 25);
        $wLantai  = (int) ($weights['lantai'] ?? 25);
        $wAtap    = (int) ($weights['atap'] ?? 25);
        $wMck     = (int) ($weights['mck'] ?? 25);

        $dinding = !empty($params['dinding_rusak']) ? $wDinding : 0;
        $lantai = !empty($params['lantai_tanah']) ? $wLantai : 0;
        $atap = !empty($params['atap_bocor']) ? $wAtap : 0;
        $mck = !empty($params['tidak_ada_mck']) ? $wMck : 0;

        $totalScore = $dinding + $lantai + $atap + $mck;
        $minScore = (int) Setting::get('scoring.minimum_passing_score', 50);

        return [
            'total_score' => $totalScore,
            'breakdown' => [
                'dinding_bambu_gedek' => $dinding,
                'lantai_tanah_rusak' => $lantai,
                'atap_rapuh_bocor' => $atap,
                'sanitasi_mck' => $mck,
            ],
            'urgency' => $this->determineUrgency($totalScore),
            'is_eligible' => $totalScore >= $minScore,
        ];
    }

    /**
     * Calculate score for Disabilitas assistance.
     * Dynamic weights from settings with static fallback.
     */
    public function calculateDisabilityScore(array $params): array
    {
        $weights = Setting::get('scoring.disability_weights', [
            'tingkat_disabilitas' => 40,
            'kondisi_ekonomi' => 30,
            'rekomendasi_nakes' => 30,
        ]);

        $wDisabilitas = (int) ($weights['tingkat_disabilitas'] ?? 40);
        $wEkonomi     = (int) ($weights['kondisi_ekonomi'] ?? 30);
        $wNakes       = (int) ($weights['rekomendasi_nakes'] ?? 30);

        $disabilitasInput = (int) ($params['tingkat_disabilitas'] ?? 0);
        $disabilitasLevel = min($wDisabilitas, $disabilitasInput);

        $ekonomiInput = (int) ($params['kondisi_ekonomi'] ?? 0);
        $ekonomi = min($wEkonomi, $ekonomiInput);

        $nakes = !empty($params['rekomendasi_nakes']) ? $wNakes : 0;

        $totalScore = min(100, $disabilitasLevel + $ekonomi + $nakes);
        $minScore = (int) Setting::get('scoring.minimum_passing_score', 50);

        return [
            'total_score' => $totalScore,
            'breakdown' => [
                'tingkat_disabilitas' => $disabilitasLevel,
                'kondisi_ekonomi' => $ekonomi,
                'rekomendasi_nakes' => $nakes,
            ],
            'urgency' => $this->determineUrgency($totalScore),
            'is_eligible' => $totalScore >= $minScore,
        ];
    }

    /**
     * Determine urgency category.
     */
    public function determineUrgency(int $score): string
    {
        $highThreshold = (int) Setting::get('scoring.high_urgency_threshold', 75);
        $minScore = (int) Setting::get('scoring.minimum_passing_score', 50);

        if ($score >= $highThreshold) return 'TINGGI';
        if ($score >= $minScore) return 'SEDANG';
        return 'RENDAH';
    }
}
