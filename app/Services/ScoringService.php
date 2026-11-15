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

        $dinding = array_key_exists('wallCondition', $params)
            ? $this->scoreSelectedOption($params['wallCondition'], [
                'gedek_bambu' => 25,
                'setengah_tembok_rusak' => 18,
                'bata_retak' => 10,
                'layak' => 0,
            ], 25, $wDinding)
            : (!empty($params['dinding_rusak']) ? $wDinding : 0);
        $lantai = array_key_exists('floorCondition', $params)
            ? $this->scoreSelectedOption($params['floorCondition'], [
                'tanah' => 25,
                'semen_pecah' => 18,
                'ubin_rusak' => 10,
                'keramik_baik' => 0,
            ], 25, $wLantai)
            : (!empty($params['lantai_tanah']) ? $wLantai : 0);
        $atap = array_key_exists('roofCondition', $params)
            ? $this->scoreSelectedOption($params['roofCondition'], [
                'rapuh_bocor_parah' => 25,
                'reng_rusak' => 18,
                'bocor_ringan' => 10,
                'kokoh' => 0,
            ], 25, $wAtap)
            : (!empty($params['atap_bocor']) ? $wAtap : 0);
        $mck = array_key_exists('sanitationCondition', $params)
            ? $this->scoreSelectedOption($params['sanitationCondition'], [
                'tidak_ada_mck' => 25,
                'mck_numpang' => 18,
                'mck_tidak_layak' => 12,
                'mck_mandiri_layak' => 0,
            ], 25, $wMck)
            : (!empty($params['tidak_ada_mck']) ? $wMck : 0);

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

        $disabilitasLevel = array_key_exists('disabilityLevel', $params)
            ? $this->scoreSelectedOption($params['disabilityLevel'], [
                'berat_total' => 40,
                'sedang_ketergantungan' => 30,
                'ringan_adaptif' => 18,
                'mandiri' => 5,
            ], 40, $wDisabilitas)
            : min($wDisabilitas, (int) ($params['tingkat_disabilitas'] ?? 0));

        $ekonomi = array_key_exists('economicCondition', $params)
            ? $this->scoreSelectedOption($params['economicCondition'], [
                'ekstrem_desil_1' => 30,
                'sangat_miskin_desil_2' => 22,
                'rentan_miskin' => 14,
                'mampu' => 0,
            ], 30, $wEkonomi)
            : min($wEkonomi, (int) ($params['kondisi_ekonomi'] ?? 0));
        $nakes = array_key_exists('healthRecommendation', $params)
            ? $this->scoreSelectedOption($params['healthRecommendation'], [
                'rekomendasi_nakes_prioritas' => 30,
                'rekomendasi_bidan_desa' => 22,
                'keterangan_umum' => 12,
                'tidak_ada' => 0,
            ], 30, $wNakes)
            : (!empty($params['rekomendasi_nakes']) ? $wNakes : 0);

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

    private function scoreSelectedOption(mixed $value, array $scores, int $defaultMax, int $configuredMax): int
    {
        if (!is_string($value) || !array_key_exists($value, $scores)) {
            return 0;
        }

        return (int) round(($scores[$value] / $defaultMax) * $configuredMax);
    }
}
