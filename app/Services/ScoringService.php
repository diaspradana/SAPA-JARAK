<?php

namespace App\Services;

class ScoringService
{
    /**
     * Calculate score for RTLH assistance.
     * Weight:
     * - Dinding bambu/gedek (25%)
     * - Lantai tanah/semen rusak (25%)
     * - Atap rapuh/bocor (25%)
     * - Tidak memiliki sanitasi MCK (25%)
     */
    public function calculateRtlhScore(array $params): array
    {
        $dinding = !empty($params['dinding_rusak']) ? 25 : 0;
        $lantai = !empty($params['lantai_tanah']) ? 25 : 0;
        $atap = !empty($params['atap_bocor']) ? 25 : 0;
        $mck = !empty($params['tidak_ada_mck']) ? 25 : 0;

        $totalScore = $dinding + $lantai + $atap + $mck;

        return [
            'total_score' => $totalScore,
            'breakdown' => [
                'dinding_bambu_gedek' => $dinding,
                'lantai_tanah_rusak' => $lantai,
                'atap_rapuh_bocor' => $atap,
                'sanitasi_mck' => $mck,
            ],
            'urgency' => $this->determineUrgency($totalScore),
            'is_eligible' => $totalScore >= 50,
        ];
    }

    /**
     * Calculate score for Disabilitas assistance.
     * Weight:
     * - Tingkat disabilitas / ketergantungan (40%)
     * - Kondisi ekonomi keluarga (30%)
     * - Rekomendasi nakes Puskesmas (30%)
     */
    public function calculateDisabilityScore(array $params): array
    {
        $disabilitasLevel = (int) ($params['tingkat_disabilitas'] ?? 0); // 0 - 40
        $ekonomi = (int) ($params['kondisi_ekonomi'] ?? 0); // 0 - 30
        $nakes = !empty($params['rekomendasi_nakes']) ? 30 : 0; // 0 or 30

        $totalScore = min(100, $disabilitasLevel + $ekonomi + $nakes);

        return [
            'total_score' => $totalScore,
            'breakdown' => [
                'tingkat_disabilitas' => $disabilitasLevel,
                'kondisi_ekonomi' => $ekonomi,
                'rekomendasi_nakes' => $nakes,
            ],
            'urgency' => $this->determineUrgency($totalScore),
            'is_eligible' => $totalScore >= 50,
        ];
    }

    /**
     * Determine urgency category.
     */
    public function determineUrgency(int $score): string
    {
        if ($score >= 75) return 'TINGGI';
        if ($score >= 50) return 'SEDANG';
        return 'RENDAH';
    }
}
