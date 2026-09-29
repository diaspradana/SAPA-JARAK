<?php

namespace Tests\Feature;

use App\Models\Application;
use App\Models\ApplicationScore;
use App\Models\Beneficiary;
use App\Models\Hamlet;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class VillageApplicationListApiTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Penomoran berurutan untuk tiket/NIK agar data unik antar pengajuan.
     */
    private int $sequence = 0;

    /**
     * Buat data dusun (hamlet) untuk pengujian filter wilayah.
     */
    private function createHamlet(string $name = 'Dusun Kalasan', string $code = 'KLS'): Hamlet
    {
        return Hamlet::create([
            'name' => $name,
            'code' => $code,
            'head_name' => 'Bapak Sukarjo',
            'head_phone' => '081234567890',
            'status' => 'active',
        ]);
    }

    /**
     * Buat pengajuan lengkap (beneficiary + application) dengan nilai default
     * yang sudah berada pada tahap peninjauan desa.
     */
    private function createVillageApplication(array $attributes = [], array $beneficiary = [], ?Hamlet $hamlet = null): Application
    {
        $this->sequence++;

        $hamlet ??= Hamlet::firstOrCreate(
            ['code' => 'KLS'],
            [
                'name' => 'Dusun Kalasan',
                'head_name' => 'Bapak Sukarjo',
                'head_phone' => '081234567890',
                'status' => 'active',
            ]
        );

        $beneficiaryModel = Beneficiary::create([
            'name' => $beneficiary['name'] ?? 'Sukarni',
            'nik' => $beneficiary['nik'] ?? sprintf('3507123456%06d', $this->sequence),
            'kk_number' => sprintf('3507123457%06d', $this->sequence),
            'phone' => $beneficiary['phone'] ?? '081298765432',
            'hamlet_id' => $hamlet->id,
            'rt' => '01',
            'rw' => '02',
            'address' => $beneficiary['address'] ?? "Dusun {$hamlet->name} RT 01 RW 02",
            'is_unregistered' => false,
            'dtks_status' => $beneficiary['dtks_status'] ?? 'Desil 1',
        ]);

        return Application::create(array_merge([
            'ticket_number' => sprintf('#JRK-%s-2026-%03d', $hamlet->code, $this->sequence),
            'beneficiary_id' => $beneficiaryModel->id,
            'hamlet_id' => $hamlet->id,
            'reporter_name' => $beneficiaryModel->name,
            'reporter_phone' => $beneficiaryModel->phone,
            'reporter_relationship' => 'Diri Sendiri',
            'assistance_type' => 'RTLH',
            'status' => 'FORWARDED_TO_VILLAGE',
            'description' => 'Kondisi rumah tidak layak huni',
            'needs_description' => 'Butuh perbaikan atap dan dinding',
            'priority_score' => 0,
            'urgency_level' => 'SEDANG',
            'submitted_at' => now(),
            'verified_at' => now(),
        ], $attributes));
    }

    /**
     * Simpan baris skor agregat hasil survei Kasun untuk satu pengajuan.
     */
    private function attachScore(Application $application, int $totalScore, string $urgency = 'SEDANG', bool $isEligible = true): ApplicationScore
    {
        return ApplicationScore::create([
            'application_id' => $application->id,
            'criterion_id' => null,
            'value' => null,
            'total_score' => $totalScore,
            'breakdown' => [
                'dinding_bambu_gedek' => 25,
                'lantai_tanah_rusak' => 25,
                'atap_rapuh_bocor' => 25,
                'sanitasi_mck' => 0,
            ],
            'urgency' => $urgency,
            'is_eligible' => $isEligible,
        ]);
    }

    /**
     * Hanya pengajuan berstatus FORWARDED_TO_VILLAGE / VILLAGE_REVIEW yang tampil.
     */
    public function test_village_list_returns_only_village_review_stage_applications(): void
    {
        $forwarded = $this->createVillageApplication(['status' => 'FORWARDED_TO_VILLAGE']);
        $this->attachScore($forwarded, 75, 'TINGGI');

        $reviewed = $this->createVillageApplication(['status' => 'VILLAGE_REVIEW', 'assistance_type' => 'DISABILITAS']);
        $this->attachScore($reviewed, 60, 'SEDANG');

        // Status di luar tahap peninjauan desa tidak boleh muncul.
        $this->createVillageApplication(['status' => 'SUBMITTED']);
        $this->createVillageApplication(['status' => 'KASUN_VERIFICATION']);
        $this->createVillageApplication(['status' => 'APPROVED']);
        $this->createVillageApplication(['status' => 'COMPLETED']);

        $response = $this->getJson('/api/village/applications');

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('message', 'Daftar pengajuan tahap peninjauan desa berhasil diambil.')
            ->assertJsonPath('meta.total', 2)
            ->assertJsonPath('meta.current_page', 1)
            ->assertJsonPath('meta.per_page', 10)
            ->assertJsonPath('meta.last_page', 1)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [[
                    'id',
                    'ticket_number',
                    'status',
                    'assistance_type',
                    'priority_score',
                    'urgency_level',
                    'total_score',
                    'effective_score',
                    'is_eligible',
                    'breakdown',
                    'submitted_at',
                    'beneficiary' => ['id', 'name', 'nik', 'masked_name'],
                    'hamlet' => ['id', 'name', 'code'],
                ]],
                'meta' => ['current_page', 'per_page', 'total', 'last_page', 'from', 'to'],
                'filters',
            ]);

        $tickets = array_column($response->json('data'), 'ticket_number');
        $this->assertEqualsCanonicalizing(
            [$forwarded->ticket_number, $reviewed->ticket_number],
            $tickets
        );
    }

    /**
     * Default sorting: skor tertinggi berada di urutan paling atas.
     */
    public function test_village_list_is_sorted_by_highest_score_first(): void
    {
        $lowest = $this->createVillageApplication(['priority_score' => 50, 'urgency_level' => 'SEDANG']);
        $this->attachScore($lowest, 50, 'SEDANG');

        $highest = $this->createVillageApplication(['priority_score' => 90, 'urgency_level' => 'TINGGI']);
        $this->attachScore($highest, 90, 'TINGGI');

        $middle = $this->createVillageApplication(['priority_score' => 75, 'urgency_level' => 'TINGGI']);
        $this->attachScore($middle, 75, 'TINGGI');

        // Belum punya baris skor survei: pakai priority_score sebagai cadangan.
        $scoreless = $this->createVillageApplication(['priority_score' => 65, 'urgency_level' => 'SEDANG']);

        $response = $this->getJson('/api/village/applications');

        $response->assertStatus(200)
            ->assertJsonPath('meta.total', 4)
            ->assertJsonPath('filters.sort_by', 'score')
            ->assertJsonPath('filters.sort_dir', 'desc')
            ->assertJsonPath('data.0.ticket_number', $highest->ticket_number)
            ->assertJsonPath('data.0.effective_score', fn ($score) => (float) $score === 90.0)
            ->assertJsonPath('data.0.is_eligible', true)
            ->assertJsonPath('data.1.ticket_number', $middle->ticket_number)
            ->assertJsonPath('data.1.effective_score', fn ($score) => (float) $score === 75.0)
            ->assertJsonPath('data.2.ticket_number', $scoreless->ticket_number)
            ->assertJsonPath('data.2.effective_score', fn ($score) => (float) $score === 65.0)
            ->assertJsonPath('data.2.total_score', null)
            ->assertJsonPath('data.3.ticket_number', $lowest->ticket_number)
            ->assertJsonPath('data.3.effective_score', fn ($score) => (float) $score === 50.0);

        $scores = array_column($response->json('data'), 'effective_score');
        $this->assertEquals([90, 75, 65, 50], $scores);
    }

    /**
     * Filter berdasarkan jenis bantuan (RTLH / DISABILITAS).
     */
    public function test_village_list_can_be_filtered_by_assistance_type(): void
    {
        $rtlh = $this->createVillageApplication(['assistance_type' => 'RTLH', 'priority_score' => 75]);
        $this->attachScore($rtlh, 75, 'TINGGI');

        $this->createVillageApplication(['assistance_type' => 'RTLH', 'priority_score' => 25]);
        $disabilitas = $this->createVillageApplication(['assistance_type' => 'DISABILITAS', 'priority_score' => 80]);
        $this->attachScore($disabilitas, 80, 'TINGGI');

        $response = $this->getJson('/api/village/applications?assistance_type=DISABILITAS');

        $response->assertStatus(200)
            ->assertJsonPath('meta.total', 1)
            ->assertJsonPath('filters.assistance_type', 'DISABILITAS')
            ->assertJsonPath('data.0.ticket_number', $disabilitas->ticket_number)
            ->assertJsonPath('data.0.assistance_type', 'DISABILITAS');

        $this->assertCount(1, $response->json('data'));
    }

    /**
     * Filter berdasarkan dusun (hamlet_id).
     */
    public function test_village_list_can_be_filtered_by_hamlet_id(): void
    {
        $kalasan = $this->createHamlet('Dusun Kalasan', 'KLS');
        $krajan = $this->createHamlet('Dusun Krajan', 'KRJ');

        $this->createVillageApplication(['hamlet_id' => $kalasan->id, 'priority_score' => 80], [], $kalasan);
        $this->createVillageApplication(['hamlet_id' => $kalasan->id, 'priority_score' => 70], [], $kalasan);
        $target = $this->createVillageApplication(['hamlet_id' => $krajan->id, 'priority_score' => 60], [], $krajan);

        $response = $this->getJson("/api/village/applications?hamlet_id={$krajan->id}");

        $response->assertStatus(200)
            ->assertJsonPath('meta.total', 1)
            ->assertJsonPath('filters.hamlet_id', $krajan->id)
            ->assertJsonPath('data.0.ticket_number', $target->ticket_number)
            ->assertJsonPath('data.0.hamlet.id', $krajan->id)
            ->assertJsonPath('data.0.hamlet.name', 'Dusun Krajan');
    }

    /**
     * Filter berdasarkan tingkat urgensi hasil kalkulasi skor.
     */
    public function test_village_list_can_be_filtered_by_urgency_level(): void
    {
        $tinggi = $this->createVillageApplication(['priority_score' => 80, 'urgency_level' => 'TINGGI']);
        $this->attachScore($tinggi, 80, 'TINGGI');

        $rendahA = $this->createVillageApplication(['priority_score' => 25, 'urgency_level' => 'RENDAH']);
        $this->attachScore($rendahA, 25, 'RENDAH', false);
        $rendahB = $this->createVillageApplication(['priority_score' => 10, 'urgency_level' => 'RENDAH']);
        $this->attachScore($rendahB, 10, 'RENDAH', false);

        $response = $this->getJson('/api/village/applications?urgency_level=RENDAH');

        $response->assertStatus(200)
            ->assertJsonPath('meta.total', 2)
            ->assertJsonPath('filters.urgency_level', 'RENDAH')
            ->assertJsonPath('data.0.effective_score', fn ($score) => (float) $score === 25.0)
            ->assertJsonPath('data.0.urgency_level', 'RENDAH')
            ->assertJsonPath('data.1.urgency_level', 'RENDAH');
    }

    /**
     * Pencarian berdasarkan nama atau NIK penerima bantuan.
     */
    public function test_village_list_can_be_searched_by_beneficiary_name_or_nik(): void
    {
        $mardiyanto = $this->createVillageApplication(
            ['priority_score' => 70],
            ['name' => 'Mardiyanto', 'nik' => '3507129999888877']
        );
        $sukarni = $this->createVillageApplication(
            ['priority_score' => 60],
            ['name' => 'Sukarni', 'nik' => '3507123456780001']
        );

        $byName = $this->getJson('/api/village/applications?search=mardiyanto');
        $byName->assertStatus(200)
            ->assertJsonPath('meta.total', 1)
            ->assertJsonPath('filters.search', 'mardiyanto')
            ->assertJsonPath('data.0.ticket_number', $mardiyanto->ticket_number);

        $byNik = $this->getJson('/api/village/applications?search=3507123456780001');
        $byNik->assertStatus(200)
            ->assertJsonPath('meta.total', 1)
            ->assertJsonPath('data.0.ticket_number', $sukarni->ticket_number)
            ->assertJsonPath('data.0.beneficiary.nik', '3507123456780001');
    }

    /**
     * Paginasi default 10 data per halaman beserta meta informasinya.
     */
    public function test_village_list_is_paginated_with_meta_information(): void
    {
        for ($i = 12; $i >= 1; $i--) {
            $application = $this->createVillageApplication(['priority_score' => $i * 5, 'urgency_level' => 'SEDANG']);
            $this->attachScore($application, $i * 5, 'SEDANG');
        }

        $firstPage = $this->getJson('/api/village/applications');

        $firstPage->assertStatus(200)
            ->assertJsonPath('meta.current_page', 1)
            ->assertJsonPath('meta.per_page', 10)
            ->assertJsonPath('meta.total', 12)
            ->assertJsonPath('meta.last_page', 2)
            ->assertJsonPath('meta.from', 1)
            ->assertJsonPath('meta.to', 10)
            ->assertJsonPath('data.0.effective_score', fn ($score) => (float) $score === 60.0)
            ->assertJsonPath('data.9.effective_score', fn ($score) => (float) $score === 15.0);

        $this->assertCount(10, $firstPage->json('data'));

        $secondPage = $this->getJson('/api/village/applications?page=2');

        $secondPage->assertStatus(200)
            ->assertJsonPath('meta.current_page', 2)
            ->assertJsonPath('meta.total', 12)
            ->assertJsonPath('data.0.effective_score', fn ($score) => (float) $score === 10.0)
            ->assertJsonPath('data.1.effective_score', fn ($score) => (float) $score === 5.0);

        $this->assertCount(2, $secondPage->json('data'));

        // Ukuran halaman dapat disesuaikan klien (maksimal 100).
        $custom = $this->getJson('/api/village/applications?per_page=15');
        $custom->assertStatus(200)
            ->assertJsonPath('meta.per_page', 15)
            ->assertJsonPath('meta.last_page', 1);
        $this->assertCount(12, $custom->json('data'));
    }

    /**
     * Filter dapat dikombinasikan dan arah pengurutan dapat dibalik.
     */
    public function test_village_list_filters_can_be_combined_with_sort_direction(): void
    {
        $kalasan = $this->createHamlet('Dusun Kalasan', 'KLS');
        $krajan = $this->createHamlet('Dusun Krajan', 'KRJ');

        $primary = $this->createVillageApplication(
            ['hamlet_id' => $kalasan->id, 'assistance_type' => 'RTLH', 'priority_score' => 75, 'urgency_level' => 'TINGGI'],
            ['name' => 'Sukarni'],
            $kalasan
        );
        $this->attachScore($primary, 75, 'TINGGI');

        $runnerUp = $this->createVillageApplication(
            ['hamlet_id' => $kalasan->id, 'assistance_type' => 'RTLH', 'priority_score' => 55, 'urgency_level' => 'TINGGI'],
            ['name' => 'Sukarni'],
            $kalasan
        );
        $this->attachScore($runnerUp, 55, 'TINGGI');

        // Data yang harus tersaring keluar: beda dusun dan beda jenis bantuan.
        $this->createVillageApplication(
            ['hamlet_id' => $krajan->id, 'assistance_type' => 'RTLH', 'priority_score' => 90, 'urgency_level' => 'TINGGI'],
            ['name' => 'Sukarni'],
            $krajan
        );
        $this->createVillageApplication(
            ['hamlet_id' => $kalasan->id, 'assistance_type' => 'DISABILITAS', 'priority_score' => 95, 'urgency_level' => 'TINGGI'],
            ['name' => 'Sukarni'],
            $kalasan
        );

        $query = http_build_query([
            'assistance_type' => 'RTLH',
            'hamlet_id' => $kalasan->id,
            'urgency_level' => 'TINGGI',
            'search' => 'sukarni',
        ]);

        $descending = $this->getJson("/api/village/applications?{$query}");
        $descending->assertStatus(200)
            ->assertJsonPath('meta.total', 2)
            ->assertJsonPath('data.0.ticket_number', $primary->ticket_number)
            ->assertJsonPath('data.1.ticket_number', $runnerUp->ticket_number);

        $ascending = $this->getJson("/api/village/applications?{$query}&sort_dir=asc");
        $ascending->assertStatus(200)
            ->assertJsonPath('filters.sort_dir', 'asc')
            ->assertJsonPath('data.0.ticket_number', $runnerUp->ticket_number)
            ->assertJsonPath('data.1.ticket_number', $primary->ticket_number);
    }

    /**
     * Nilai filter yang tidak valid ditolak dengan 422.
     */
    public function test_village_list_rejects_invalid_filter_values(): void
    {
        $this->createVillageApplication(['priority_score' => 75]);

        $invalidType = $this->getJson('/api/village/applications?assistance_type=XYZ');
        $invalidType->assertStatus(422)
            ->assertJsonPath('success', false)
            ->assertJsonPath('message', 'Validasi parameter filter daftar pengajuan desa gagal.')
            ->assertJsonValidationErrors(['assistance_type']);

        $invalidUrgency = $this->getJson('/api/village/applications?urgency_level=KRITIS');
        $invalidUrgency->assertStatus(422)
            ->assertJsonValidationErrors(['urgency_level']);

        $invalidHamlet = $this->getJson('/api/village/applications?hamlet_id=9999');
        $invalidHamlet->assertStatus(422)
            ->assertJsonValidationErrors(['hamlet_id']);

        $invalidSort = $this->getJson('/api/village/applications?sort_by=ticket_number');
        $invalidSort->assertStatus(422)
            ->assertJsonValidationErrors(['sort_by']);
    }

    /**
     * Sorting memakai waktu submit bila diminta klien (sort_by=submitted_at).
     */
    public function test_village_list_can_be_sorted_by_submitted_at(): void
    {
        $older = $this->createVillageApplication([
            'priority_score' => 90,
            'submitted_at' => now()->subDays(3),
        ]);
        $newer = $this->createVillageApplication([
            'priority_score' => 40,
            'submitted_at' => now()->subDay(),
        ]);

        $response = $this->getJson('/api/village/applications?sort_by=submitted_at&sort_dir=desc');

        $response->assertStatus(200)
            ->assertJsonPath('filters.sort_by', 'submitted_at')
            ->assertJsonPath('data.0.ticket_number', $newer->ticket_number)
            ->assertJsonPath('data.1.ticket_number', $older->ticket_number);
    }

}
