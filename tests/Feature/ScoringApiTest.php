<?php

namespace Tests\Feature;

use Tests\TestCase;

class ScoringApiTest extends TestCase
{
    /**
     * Test successful RTLH scoring preview calculation.
     */
    public function test_rtlh_scoring_calculation_success(): void
    {
        $payload = [
            'assistance_type' => 'RTLH',
            'parameters' => [
                'dinding_rusak' => true,   // 25
                'lantai_tanah'  => true,   // 25
                'atap_bocor'    => true,   // 25
                'tidak_ada_mck' => false,  // 0
            ],
        ];

        $response = $this->postJson('/api/scoring/calculate', $payload);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Simulasi perhitungan skor kelayakan berhasil dihitung.',
                'data' => [
                    'assistance_type' => 'RTLH',
                    'total_score'     => 75,
                    'urgency'         => 'TINGGI',
                    'is_eligible'     => true,
                    'breakdown'       => [
                        'dinding_bambu_gedek' => 25,
                        'lantai_tanah_rusak' => 25,
                        'atap_rapuh_bocor'   => 25,
                        'sanitasi_mck'       => 0,
                    ],
                ],
            ]);
    }

    /**
     * Test successful Disabilitas scoring preview calculation.
     */
    public function test_disability_scoring_calculation_success(): void
    {
        $payload = [
            'assistance_type' => 'DISABILITAS',
            'parameters' => [
                'tingkat_disabilitas' => 35, // 35
                'kondisi_ekonomi'     => 25, // 25
                'rekomendasi_nakes'   => true, // 30
            ],
        ];

        $response = $this->postJson('/api/scoring/calculate', $payload);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Simulasi perhitungan skor kelayakan berhasil dihitung.',
                'data' => [
                    'assistance_type' => 'DISABILITAS',
                    'total_score'     => 90,
                    'urgency'         => 'TINGGI',
                    'is_eligible'     => true,
                    'breakdown'       => [
                        'tingkat_disabilitas' => 35,
                        'kondisi_ekonomi'     => 25,
                        'rekomendasi_nakes'   => 30,
                    ],
                ],
            ]);
    }

    /**
     * Test validation error when assistance_type is missing or invalid.
     */
    public function test_invalid_assistance_type_validation_fails(): void
    {
        $payload = [
            'assistance_type' => 'INVALID_TYPE',
            'parameters' => [
                'dinding_rusak' => true,
            ],
        ];

        $response = $this->postJson('/api/scoring/calculate', $payload);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
                'message' => 'Validasi kriteria penilaian gagal.',
            ])
            ->assertJsonValidationErrors(['assistance_type']);
    }

    /**
     * Test validation error when RTLH mandatory criteria parameters are missing.
     */
    public function test_rtlh_missing_parameters_validation_fails(): void
    {
        $payload = [
            'assistance_type' => 'RTLH',
            'parameters' => [
                'dinding_rusak' => true,
                // missing lantai_tanah, atap_bocor, tidak_ada_mck
            ],
        ];

        $response = $this->postJson('/api/scoring/calculate', $payload);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
                'message' => 'Validasi kriteria penilaian gagal.',
            ])
            ->assertJsonValidationErrors([
                'parameters.lantai_tanah',
                'parameters.atap_bocor',
                'parameters.tidak_ada_mck',
            ]);
    }

    /**
     * Test validation error when Disabilitas parameter exceeds maximum allowed value.
     */
    public function test_disability_parameter_exceeding_max_validation_fails(): void
    {
        $payload = [
            'assistance_type' => 'DISABILITAS',
            'parameters' => [
                'tingkat_disabilitas' => 50, // Max is 40
                'kondisi_ekonomi'     => 20,
                'rekomendasi_nakes'   => false,
            ],
        ];

        $response = $this->postJson('/api/scoring/calculate', $payload);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
                'message' => 'Validasi kriteria penilaian gagal.',
            ])
            ->assertJsonValidationErrors(['parameters.tingkat_disabilitas']);
    }
}
