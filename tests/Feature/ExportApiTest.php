<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Application;
use App\Models\Beneficiary;
use App\Models\Funding;
use App\Models\Hamlet;
use App\Models\Handover;
use App\Models\User;
use App\Models\Verification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;

class ExportApiTest extends TestCase
{
    use RefreshDatabase;

    protected Hamlet $hamletKalasan;
    protected Hamlet $hamletSagi;
    protected User $kades;
    protected User $kasun;

    protected function setUp(): void
    {
        parent::setUp();

        $this->hamletKalasan = Hamlet::create([
            'name' => 'Kalasan',
            'code' => 'KLS',
            'leader_name' => 'Bpk. Suwandi',
            'leader_phone' => '0813-8822-1101',
            'rt_count' => 6,
            'rw_count' => 2,
            'status' => 'active',
        ]);

        $this->hamletSagi = Hamlet::create([
            'name' => 'Sagi',
            'code' => 'SGI',
            'leader_name' => 'Bpk. Bambang Sutrisno',
            'leader_phone' => '0812-7744-2202',
            'rt_count' => 8,
            'rw_count' => 2,
            'status' => 'active',
        ]);

        $this->kades = User::create([
            'name' => 'Bpk. Drs. H. Supriyadi',
            'email' => 'kades@jarak.desa.id',
            'password' => bcrypt('password'),
            'role' => 'kades',
            'phone' => '0812-3456-7890',
        ]);

        $this->kasun = User::create([
            'name' => 'Bpk. Suwandi',
            'email' => 'kasun.kalasan@jarak.desa.id',
            'password' => bcrypt('password'),
            'role' => 'kasun',
            'hamlet_id' => $this->hamletKalasan->id,
            'phone' => '0813-8822-1101',
        ]);

        // Create sample completed application
        $beneficiary = Beneficiary::create([
            'name' => 'Bpk. Suparno',
            'nik' => '3506120101750001',
            'kk_number' => '3506120101750000',
            'phone' => '085712349001',
            'hamlet_id' => $this->hamletKalasan->id,
            'rt' => '03',
            'rw' => '02',
            'address' => 'RT 03 / RW 02, Dusun Kalasan',
        ]);

        $app = Application::create([
            'ticket_number' => '#JRK-KLS-2026-009',
            'beneficiary_id' => $beneficiary->id,
            'hamlet_id' => $this->hamletKalasan->id,
            'assistance_type' => 'RTLH',
            'status' => 'COMPLETED',
            'completed_at' => now(),
            'submitted_at' => now()->subDays(10),
        ]);

        Funding::create([
            'application_id' => $app->id,
            'source' => 'APBDES_DANA_DESA',
            'fiscal_year' => '2026',
            'account_code' => '02.01.05 Sub-Bidang RTLH',
            'allocated_budget' => 17500000,
            'realized_budget' => 17250000,
            'status' => 'DISBURSED',
        ]);

        Handover::create([
            'application_id' => $app->id,
            'bast_number' => '045.2/BAST-RTLH/09/2026',
            'handover_date' => now(),
            'recipient_name' => 'Bpk. Suparno',
            'official_id' => $this->kades->id,
        ]);

        Verification::create([
            'application_id' => $app->id,
            'verifier_id' => $this->kasun->id,
            'recommendation' => 'LAYAK',
            'calculated_score' => 92,
            'notes' => 'Sangat layak menerima bantuan.',
        ]);
    }

    /**
     * Test Public Transparency CSV export is accessible without authentication.
     */
    public function test_public_transparency_export_csv_without_auth(): void
    {
        $response = $this->get('/api/public/transparency/export?format=csv');

        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'text/csv; charset=UTF-8');
        $this->assertStringContainsString('attachment; filename=', $response->headers->get('Content-Disposition'));
    }

    /**
     * Test Public Transparency Excel export is accessible without authentication.
     */
    public function test_public_transparency_export_excel_without_auth(): void
    {
        $response = $this->get('/api/public/transparency/export?format=excel');

        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'application/vnd.ms-excel; charset=UTF-8');
        $this->assertStringContainsString('.xls', $response->headers->get('Content-Disposition'));
    }

    /**
     * Test Desa SPJ export requires Sanctum authentication.
     */
    public function test_desa_spj_export_unauthenticated_returns_401(): void
    {
        $response = $this->getJson('/api/desa/reports/spj/export');

        $response->assertStatus(401);
        $response->assertJson([
            'success' => false,
            'message' => 'Unauthenticated: Token otentikasi tidak ditemukan atau tidak valid.',
        ]);
    }

    /**
     * Test Desa SPJ export CSV with authenticated Kades.
     */
    public function test_desa_spj_export_csv_authenticated_kades(): void
    {
        Sanctum::actingAs($this->kades);

        $response = $this->get('/api/desa/reports/spj/export?format=csv');

        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'text/csv; charset=UTF-8');
        $this->assertStringContainsString('Laporan_SPJ_Bansos_Desa_Jarak_', $response->headers->get('Content-Disposition'));
    }

    /**
     * Test Desa SPJ Excel shortcut endpoint with authenticated Kades.
     */
    public function test_desa_spj_excel_shortcut_authenticated_kades(): void
    {
        Sanctum::actingAs($this->kades);

        $response = $this->get('/api/desa/reports/spj/excel');

        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'application/vnd.ms-excel; charset=UTF-8');
        $this->assertStringContainsString('.xls', $response->headers->get('Content-Disposition'));
    }

    /**
     * Test Desa SPJ CSV shortcut endpoint with authenticated Kades.
     */
    public function test_desa_spj_csv_shortcut_authenticated_kades(): void
    {
        Sanctum::actingAs($this->kades);

        $response = $this->get('/api/desa/reports/spj/csv');

        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'text/csv; charset=UTF-8');
        $this->assertStringContainsString('.csv', $response->headers->get('Content-Disposition'));
    }

    /**
     * Test Desa Beneficiaries master export with authenticated Kades.
     */
    public function test_desa_beneficiaries_export_authenticated_kades(): void
    {
        Sanctum::actingAs($this->kades);

        $response = $this->get('/api/desa/reports/beneficiaries/export?format=csv');

        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'text/csv; charset=UTF-8');
        $this->assertStringContainsString('Rekapitulasi_Penerima_Bansos_Desa_Jarak_', $response->headers->get('Content-Disposition'));
    }

    /**
     * Test Kasun survey queue export with authenticated Kasun.
     */
    public function test_kasun_reports_export_authenticated_kasun(): void
    {
        Sanctum::actingAs($this->kasun);

        $response = $this->get('/api/kasun/reports/export?format=csv');

        $response->assertStatus(200);
        $response->assertHeader('Content-Type', 'text/csv; charset=UTF-8');
        $this->assertStringContainsString('Antrean_Survei_Kasun_', $response->headers->get('Content-Disposition'));
    }
}
