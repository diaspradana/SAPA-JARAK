<?php

namespace Tests\Feature;

use App\Models\Application;
use App\Models\ApplicationScore;
use App\Models\Beneficiary;
use App\Models\Hamlet;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SubmitSurveyApiTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Siapkan data pengajuan (hamlet + beneficiary + application) untuk pengujian.
     */
    private function createSurveyApplication(string $assistanceType = 'RTLH', string $status = 'KASUN_VERIFICATION'): Application
    {
        $hamlet = Hamlet::create([
            'name' => 'Dusun Kalasan',
            'code' => 'KLS',
            'head_name' => 'Bapak Sukarjo',
            'head_phone' => '081234567890',
            'status' => 'active',
        ]);

        $beneficiary = Beneficiary::create([
            'name' => 'Sukarni',
            'nik' => '3507123456780001',
            'kk_number' => '3507123456780002',
            'phone' => '081298765432',
            'hamlet_id' => $hamlet->id,
            'rt' => '01',
            'rw' => '02',
            'address' => 'Dusun Kalasan RT 01 RW 02',
            'is_unregistered' => false,
            'dtks_status' => 'Desil 1',
        ]);

        return Application::create([
            'ticket_number' => '#JRK-KLS-2026-001',
            'beneficiary_id' => $beneficiary->id,
            'hamlet_id' => $hamlet->id,
            'reporter_name' => $beneficiary->name,
            'reporter_phone' => $beneficiary->phone,
            'reporter_relationship' => 'Diri Sendiri',
            'assistance_type' => $assistanceType,
            'status' => $status,
            'description' => 'Kondisi rumah tidak layak huni',
            'needs_description' => 'Butuh perbaikan atap dan dinding',
            'submitted_at' => now(),
        ]);
    }

    /**
     * Survei RTLH tersimpan di application_scores dan status maju ke FORWARDED_TO_VILLAGE.
     */
    public function test_submit_rtlh_survey_persists_score_and_forwards_application(): void
    {
        $application = $this->createSurveyApplication('RTLH', 'KASUN_VERIFICATION');

        $response = $this->postJson("/api/applications/{$application->id}/submit-survey", [
            'latitude'       => -7.8685,
            'longitude'      => 112.1852,
            'recommendation' => 'LAYAK',
            'notes'          => 'Dinding bambu, lantai tanah, atap bocor; MCK belum tersedia.',
            'parameters'     => [
                'dinding_rusak' => true,  // 25
                'lantai_tanah'  => true,  // 25
                'atap_bocor'    => true,  // 25
                'tidak_ada_mck' => false, // 0
            ],
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Hasil survei tiket #JRK-KLS-2026-001 berhasil disimpan dan diteruskan ke Pemerintah Desa.',
                'data' => [
                    'application_id'  => $application->id,
                    'ticket_number'   => '#JRK-KLS-2026-001',
                    'assistance_type' => 'RTLH',
                    'total_score'     => 75,
                    'urgency'         => 'TINGGI',
                    'is_eligible'     => true,
                    'breakdown'       => [
                        'dinding_bambu_gedek' => 25,
                        'lantai_tanah_rusak'  => 25,
                        'atap_rapuh_bocor'    => 25,
                        'sanitasi_mck'        => 0,
                    ],
                    'status'          => 'FORWARDED_TO_VILLAGE',
                ],
            ]);

        $this->assertDatabaseCount('application_scores', 1);
        $this->assertDatabaseHas('application_scores', [
            'application_id' => $application->id,
            'criterion_id'   => null,
            'total_score'    => 75,
            'urgency'        => 'TINGGI',
            'is_eligible'    => true,
        ]);

        $score = ApplicationScore::where('application_id', $application->id)->firstOrFail();
        $this->assertSame([
            'dinding_bambu_gedek' => 25,
            'lantai_tanah_rusak'  => 25,
            'atap_rapuh_bocor'    => 25,
            'sanitasi_mck'        => 0,
        ], $score->breakdown);

        $this->assertDatabaseHas('applications', [
            'id'             => $application->id,
            'status'         => 'FORWARDED_TO_VILLAGE',
            'priority_score' => 75,
            'urgency_level'  => 'TINGGI',
        ]);

        $this->assertNotNull($application->fresh()->verified_at);
        $this->assertDatabaseHas('audit_logs', [
            'application_id' => $application->id,
            'action'         => 'STATUS_CHANGED',
        ]);
    }

    /**
     * Survei DISABILITAS tersimpan di application_scores dan status maju ke FORWARDED_TO_VILLAGE.
     */
    public function test_submit_disability_survey_persists_score_and_forwards_application(): void
    {
        $application = $this->createSurveyApplication('DISABILITAS', 'KASUN_VERIFICATION');

        $response = $this->postJson("/api/applications/{$application->id}/submit-survey", [
            'recommendation' => 'LAYAK',
            'notes'          => 'Ketergantungan tinggi, ekonomi keluarga prasejahtera.',
            'parameters'     => [
                'tingkat_disabilitas' => 35,   // 35
                'kondisi_ekonomi'     => 25,   // 25
                'rekomendasi_nakes'   => true, // 30
            ],
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
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
                    'status'          => 'FORWARDED_TO_VILLAGE',
                ],
            ]);

        $this->assertDatabaseCount('application_scores', 1);
        $this->assertDatabaseHas('application_scores', [
            'application_id' => $application->id,
            'total_score'    => 90,
            'urgency'        => 'TINGGI',
            'is_eligible'    => true,
        ]);

        $score = ApplicationScore::where('application_id', $application->id)->firstOrFail();
        $this->assertSame([
            'tingkat_disabilitas' => 35,
            'kondisi_ekonomi'     => 25,
            'rekomendasi_nakes'   => 30,
        ], $score->breakdown);

        $this->assertDatabaseHas('applications', [
            'id'            => $application->id,
            'status'        => 'FORWARDED_TO_VILLAGE',
            'urgency_level' => 'TINGGI',
        ]);
    }

    /**
     * Submit survei ditolak (403) bila status pengajuan bukan KASUN_VERIFICATION.
     */
    public function test_submit_survey_is_forbidden_when_status_is_not_kasun_verification(): void
    {
        $application = $this->createSurveyApplication('RTLH', 'SUBMITTED');

        $response = $this->postJson("/api/applications/{$application->id}/submit-survey", [
            'parameters' => [
                'dinding_rusak' => true,
                'lantai_tanah'  => true,
                'atap_bocor'    => true,
                'tidak_ada_mck' => true,
            ],
        ]);

        $response->assertStatus(403)
            ->assertJson([
                'success' => false,
                'data' => [
                    'application_id'  => $application->id,
                    'current_status'  => 'SUBMITTED',
                    'required_status' => 'KASUN_VERIFICATION',
                ],
            ]);

        $this->assertDatabaseCount('application_scores', 0);
        $this->assertDatabaseHas('applications', [
            'id'     => $application->id,
            'status' => 'SUBMITTED',
        ]);
    }

    /**
     * Validasi gagal (422) bila payload survei tidak menyertakan parameters.
     */
    public function test_submit_survey_validation_fails_when_parameters_are_missing(): void
    {
        $application = $this->createSurveyApplication('RTLH', 'KASUN_VERIFICATION');

        $response = $this->postJson("/api/applications/{$application->id}/submit-survey", [
            'recommendation' => 'LAYAK',
            'notes'          => 'Survei tanpa parameter penilaian.',
        ]);

        $response->assertStatus(422)
            ->assertJson([
                'success' => false,
                'message' => 'Validasi data survei lapangan gagal.',
            ])
            ->assertJsonValidationErrors(['parameters']);

        $this->assertDatabaseCount('application_scores', 0);
    }

    /**
     * Endpoint mengembalikan 404 bila pengajuan tidak ditemukan.
     */
    public function test_submit_survey_returns_not_found_for_unknown_application(): void
    {
        $response = $this->postJson('/api/applications/9999/submit-survey', [
            'parameters' => [
                'dinding_rusak' => true,
                'lantai_tanah'  => true,
                'atap_bocor'    => true,
                'tidak_ada_mck' => false,
            ],
        ]);

        $response->assertStatus(404);
        $this->assertDatabaseCount('application_scores', 0);
    }

    /**
     * Submit ulang survei memperbarui baris skor yang sama (tidak membuat duplikat).
     */
    public function test_resubmitting_survey_updates_existing_score_row(): void
    {
        $application = $this->createSurveyApplication('RTLH', 'KASUN_VERIFICATION');

        $firstResponse = $this->postJson("/api/applications/{$application->id}/submit-survey", [
            'parameters' => [
                'dinding_rusak' => true,
                'lantai_tanah'  => true,
                'atap_bocor'    => true,
                'tidak_ada_mck' => false,
            ],
        ]);

        $firstResponse->assertStatus(200)->assertJsonPath('data.total_score', 75);
        $firstScoreId = $firstResponse->json('data.score_id');

        // Status dikembalikan ke tahap verifikasi Kasun sebelum koreksi survei
        // (refresh() agar perubahan status dari request pertama ikut terbaca).
        $application->refresh()->update(['status' => 'KASUN_VERIFICATION']);

        $secondResponse = $this->postJson("/api/applications/{$application->id}/submit-survey", [
            'parameters' => [
                'dinding_rusak' => true,  // 25
                'lantai_tanah'  => true,  // 25
                'atap_bocor'    => false, // 0
                'tidak_ada_mck' => false, // 0
            ],
        ]);

        $secondResponse->assertStatus(200)
            ->assertJsonPath('data.total_score', 50)
            ->assertJsonPath('data.urgency', 'SEDANG')
            ->assertJsonPath('data.is_eligible', true)
            ->assertJsonPath('data.score_id', $firstScoreId);

        $this->assertDatabaseCount('application_scores', 1);
        $this->assertDatabaseHas('application_scores', [
            'application_id' => $application->id,
            'total_score'    => 50,
            'urgency'        => 'SEDANG',
            'is_eligible'    => true,
        ]);

        $this->assertDatabaseHas('applications', [
            'id'             => $application->id,
            'status'         => 'FORWARDED_TO_VILLAGE',
            'priority_score' => 50,
            'urgency_level'  => 'SEDANG',
        ]);
    }
}
