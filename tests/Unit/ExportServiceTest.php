<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\Application;
use App\Models\Beneficiary;
use App\Models\Funding;
use App\Models\Hamlet;
use App\Models\Handover;
use App\Models\User;
use App\Models\Verification;
use App\Services\ExportService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ExportServiceTest extends TestCase
{
    use RefreshDatabase;

    protected ExportService $exportService;
    protected Hamlet $hamletKalasan;
    protected Hamlet $hamletSagi;
    protected User $kades;
    protected User $kasunKalasan;

    protected function setUp(): void
    {
        parent::setUp();
        $this->exportService = app(ExportService::class);

        // Seed basic master data
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

        $this->kasunKalasan = User::create([
            'name' => 'Bpk. Suwandi',
            'email' => 'kasun.kalasan@jarak.desa.id',
            'password' => bcrypt('password'),
            'role' => 'kasun',
            'hamlet_id' => $this->hamletKalasan->id,
            'phone' => '0813-8822-1101',
        ]);
    }

    /**
     * Helper to capture streamed output from StreamedResponse.
     */
    protected function captureStreamOutput(StreamedResponse $response): string
    {
        ob_start();
        $response->sendContent();
        return (string) ob_get_clean();
    }

    /**
     * Test SPJ CSV export generates valid RFC 4180 format with UTF-8 BOM and totals.
     */
    public function test_export_spj_csv_generates_valid_utf8_bom_and_totals(): void
    {
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

        $response = $this->exportService->exportSpj(['year' => date('Y')], 'csv');

        $this->assertEquals('text/csv; charset=UTF-8', $response->headers->get('Content-Type'));
        $this->assertStringContainsString('attachment; filename=', $response->headers->get('Content-Disposition'));

        $output = $this->captureStreamOutput($response);

        // Verify UTF-8 BOM is at the start
        $this->assertStringStartsWith("\xEF\xBB\xBF", $output);

        // Verify Header and row contents
        $this->assertStringContainsString('No,"No. Tiket","Nama Penerima",NIK,Dusun', $output);
        $this->assertStringContainsString('#JRK-KLS-2026-009', $output);
        $this->assertStringContainsString('Bpk. Suparno', $output);
        $this->assertStringContainsString('045.2/BAST-RTLH/09/2026', $output);

        // Verify 16-digit NIK is preserved with text formula wrapper in CSV
        $this->assertStringContainsString('3506120101750001', $output);

        // Verify Summary row
        $this->assertStringContainsString('TOTAL REALISASI APBDES', $output);
        $this->assertStringContainsString('17500000', $output);
        $this->assertStringContainsString('17250000', $output);
        $this->assertStringContainsString('250000', $output);
    }

    /**
     * Test SPJ CSV export supports custom semicolon delimiter.
     */
    public function test_export_spj_csv_supports_semicolon_delimiter(): void
    {
        $beneficiary = Beneficiary::create([
            'name' => 'Bpk. Waris',
            'nik' => '3506121102750005',
            'hamlet_id' => $this->hamletKalasan->id,
            'rt' => '01',
            'rw' => '01',
            'address' => 'RT 01 / RW 01, Dusun Kalasan',
        ]);

        $app = Application::create([
            'ticket_number' => '#JRK-KLS-2026-010',
            'beneficiary_id' => $beneficiary->id,
            'hamlet_id' => $this->hamletKalasan->id,
            'assistance_type' => 'RTLH',
            'status' => 'COMPLETED',
            'completed_at' => now(),
        ]);

        Funding::create([
            'application_id' => $app->id,
            'source' => 'APBDES_DANA_DESA',
            'allocated_budget' => 15000000,
            'realized_budget' => 15000000,
        ]);

        $response = $this->exportService->exportSpj(['delimiter' => ';'], 'csv');
        $output = $this->captureStreamOutput($response);

        // Semicolon delimiter should be present in headers and data rows
        $this->assertStringContainsString('No;"No. Tiket";"Nama Penerima";NIK;Dusun', $output);
        $this->assertStringContainsString(';"Bpk. Waris";', $output);
    }

    /**
     * Test SPJ Excel export generates valid SpreadsheetML XML structure.
     */
    public function test_export_spj_excel_generates_valid_spreadsheetml(): void
    {
        $beneficiary = Beneficiary::create([
            'name' => 'Ibu Siti Aminah',
            'nik' => '3506124508820003',
            'hamlet_id' => $this->hamletKalasan->id,
            'rt' => '01',
            'rw' => '01',
            'address' => 'RT 01 / RW 01, Dusun Kalasan',
        ]);

        $app = Application::create([
            'ticket_number' => '#JRK-KLS-2026-011',
            'beneficiary_id' => $beneficiary->id,
            'hamlet_id' => $this->hamletKalasan->id,
            'assistance_type' => 'DISABILITAS',
            'status' => 'COMPLETED',
            'completed_at' => now(),
        ]);

        Funding::create([
            'application_id' => $app->id,
            'source' => 'BKK_KABUPATEN',
            'allocated_budget' => 2500000,
            'realized_budget' => 2400000,
        ]);

        $response = $this->exportService->exportSpj([], 'excel');

        $this->assertEquals('application/vnd.ms-excel; charset=UTF-8', $response->headers->get('Content-Type'));
        $this->assertStringContainsString('.xls', $response->headers->get('Content-Disposition'));

        $output = $this->captureStreamOutput($response);

        // Verify SpreadsheetML XML tags
        $this->assertStringContainsString('<?xml version="1.0" encoding="UTF-8"?>', $output);
        $this->assertStringContainsString('<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"', $output);
        $this->assertStringContainsString('<Style ss:ID="Header">', $output);
        $this->assertStringContainsString('<Style ss:ID="Currency">', $output);
        $this->assertStringContainsString('<Cell ss:StyleID="Header"><Data ss:Type="String">No. Tiket</Data></Cell>', $output);
        $this->assertStringContainsString('<Data ss:Type="String">#JRK-KLS-2026-011</Data>', $output);
        $this->assertStringContainsString('<Data ss:Type="String">3506124508820003</Data>', $output);
        $this->assertStringContainsString('<Cell ss:StyleID="Currency"><Data ss:Type="Number">2400000</Data></Cell>', $output);
        $this->assertStringContainsString('TOTAL REALISASI APBDES', $output);
    }

    /**
     * Test Beneficiaries master export contains full unmasked data.
     */
    public function test_export_beneficiaries_contains_full_official_data(): void
    {
        $beneficiary = Beneficiary::create([
            'name' => 'Bpk. Ahmad Dahlan',
            'nik' => '3506120101800002',
            'kk_number' => '3506120101800000',
            'phone' => '081298765432',
            'hamlet_id' => $this->hamletKalasan->id,
            'rt' => '02',
            'rw' => '01',
            'address' => 'RT 02 / RW 01, Dusun Kalasan',
            'dtks_status' => 'Desil 1',
        ]);

        Application::create([
            'ticket_number' => '#JRK-KLS-2026-020',
            'beneficiary_id' => $beneficiary->id,
            'hamlet_id' => $this->hamletKalasan->id,
            'assistance_type' => 'RTLH',
            'status' => 'APPROVED',
            'priority_score' => 95,
            'submitted_at' => now(),
        ]);

        $response = $this->exportService->exportBeneficiaries([], 'csv');
        $output = $this->captureStreamOutput($response);

        // Header verification
        $this->assertStringContainsString('No,"No. Tiket","Tanggal Masuk","Nama Penerima",NIK,"No. KK","No. Telepon / WA",Dusun', $output);

        // Row verification with full official info
        $this->assertStringContainsString('#JRK-KLS-2026-020', $output);
        $this->assertStringContainsString('Bpk. Ahmad Dahlan', $output);
        $this->assertStringContainsString('3506120101800002', $output);
        $this->assertStringContainsString('3506120101800000', $output);
        $this->assertStringContainsString('081298765432', $output);
        $this->assertStringContainsString('Desil 1', $output);
        $this->assertStringContainsString('95', $output);
        $this->assertStringContainsString('APPROVED', $output);
        $this->assertStringContainsString('TOTAL REKAPITULASI BANSOS', $output);
    }

    /**
     * Test Public Transparency export respects privacy masking rules.
     */
    public function test_export_public_transparency_masks_beneficiary_identity(): void
    {
        $beneficiary = Beneficiary::create([
            'name' => 'Bpk. Sugeng Wibowo',
            'nik' => '3506120101700008',
            'hamlet_id' => $this->hamletKalasan->id,
            'rt' => '04',
            'rw' => '02',
            'address' => 'RT 04 / RW 02, Dusun Kalasan',
        ]);

        Application::create([
            'ticket_number' => '#JRK-KLS-2026-030',
            'beneficiary_id' => $beneficiary->id,
            'hamlet_id' => $this->hamletKalasan->id,
            'assistance_type' => 'RTLH',
            'status' => 'COMPLETED',
            'completed_at' => now(),
        ]);

        $response = $this->exportService->exportPublicLedger([], 'csv');
        $output = $this->captureStreamOutput($response);

        // Should contain masked name and NO raw full name or NIK
        $this->assertStringContainsString('Bpk. S*****', $output);
        $this->assertStringNotContainsString('Sugeng Wibowo', $output);
        $this->assertStringNotContainsString('3506120101700008', $output);
    }

    /**
     * Test Kasun queue export scopes records strictly to Kasun's hamlet.
     */
    public function test_export_kasun_queue_scopes_to_kasun_hamlet(): void
    {
        // Kalasan application
        $b1 = Beneficiary::create([
            'name' => 'Warga Kalasan',
            'nik' => '3506120101700001',
            'hamlet_id' => $this->hamletKalasan->id,
            'address' => 'RT 01 / RW 01, Dusun Kalasan',
        ]);
        $appKalasan = Application::create([
            'ticket_number' => '#JRK-KLS-QUEUE-1',
            'beneficiary_id' => $b1->id,
            'hamlet_id' => $this->hamletKalasan->id,
            'assistance_type' => 'RTLH',
            'status' => 'WAITING_KASUN_VERIFICATION',
            'submitted_at' => now(),
        ]);
        Verification::create([
            'application_id' => $appKalasan->id,
            'verifier_id' => $this->kasunKalasan->id,
            'recommendation' => 'LAYAK',
            'calculated_score' => 88,
            'notes' => 'Layak mendapatkan RTLH',
        ]);

        // Sagi application
        $b2 = Beneficiary::create([
            'name' => 'Warga Sagi',
            'nik' => '3506120101700002',
            'hamlet_id' => $this->hamletSagi->id,
            'address' => 'RT 02 / RW 01, Dusun Sagi',
        ]);
        Application::create([
            'ticket_number' => '#JRK-SGI-QUEUE-2',
            'beneficiary_id' => $b2->id,
            'hamlet_id' => $this->hamletSagi->id,
            'assistance_type' => 'RTLH',
            'status' => 'WAITING_KASUN_VERIFICATION',
            'submitted_at' => now(),
        ]);

        // Export as Kasun Kalasan
        $response = $this->exportService->exportKasunQueue([], $this->kasunKalasan, 'csv');
        $output = $this->captureStreamOutput($response);

        // Must include Kalasan record
        $this->assertStringContainsString('#JRK-KLS-QUEUE-1', $output);
        $this->assertStringContainsString('Warga Kalasan', $output);
        $this->assertStringContainsString('LAYAK', $output);

        // Must NOT include Sagi record
        $this->assertStringNotContainsString('#JRK-SGI-QUEUE-2', $output);
        $this->assertStringNotContainsString('Warga Sagi', $output);
    }
}
