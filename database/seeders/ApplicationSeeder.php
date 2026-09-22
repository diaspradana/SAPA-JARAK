<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Hamlet;
use App\Models\Beneficiary;
use App\Models\Application;
use App\Models\Verification;
use App\Models\Funding;
use App\Models\Procurement;
use App\Models\Handover;
use App\Models\User;
use App\Models\Notification;
use App\Models\AuditLog;

class ApplicationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $kls = Hamlet::where('code', 'KLS')->first();
        $jl  = Hamlet::where('code', 'JL')->first();
        $jk  = Hamlet::where('code', 'JK')->first();
        $sg  = Hamlet::where('code', 'SG')->first();
        $sb  = Hamlet::where('code', 'SB')->first();

        $kasunKls = User::where('email', 'kasun.kalasan@jarak-kediri.desa.id')->first();
        $kades = User::where('role', 'kades')->first();

        // 1. Completed Application (RTLH - #JRK-KLS-2026-009)
        $ben1 = Beneficiary::create([
            'name' => 'Bpk. Suparno',
            'nik' => '3506120101750001',
            'kk_number' => '3506120101750000',
            'phone' => '085712349001',
            'hamlet_id' => $kls->id,
            'rt' => '03',
            'rw' => '02',
            'address' => 'RT 03 / RW 02, Dusun Kalasan, Desa Jarak',
            'is_unregistered' => false,
            'dtks_status' => 'Desil 1 (Sangat Miskin)',
        ]);

        $app1 = Application::create([
            'ticket_number' => '#JRK-KLS-2026-009',
            'beneficiary_id' => $ben1->id,
            'hamlet_id' => $kls->id,
            'reporter_name' => 'Bpk. Suparno',
            'reporter_phone' => '085712349001',
            'reporter_relationship' => 'Diri Sendiri',
            'assistance_type' => 'RTLH',
            'status' => 'COMPLETED',
            'description' => 'Dinding bambu lapuk dan atap ruang tengah bocor parah saat musim hujan.',
            'needs_description' => 'Paket rehabilitasi dinding hebel, perbaikan kaso atap, dan semen lantai.',
            'priority_score' => 92,
            'urgency_level' => 'TINGGI',
            'submitted_at' => now()->subDays(20),
            'verified_at' => now()->subDays(16),
            'approved_at' => now()->subDays(12),
            'completed_at' => now()->subDays(2),
        ]);

        Verification::create([
            'application_id' => $app1->id,
            'verifier_id' => $kasunKls?->id,
            'verification_level' => 'KASUN',
            'latitude' => -7.868512,
            'longitude' => 112.185241,
            'parameters_checklist' => [
                'dinding_rusak' => true,
                'lantai_tanah' => true,
                'atap_bocor' => true,
                'tidak_ada_mck' => false,
            ],
            'calculated_score' => 92,
            'recommendation' => 'LAYAK',
            'notes' => 'Kondisi faktual lapangan memprihatinkan, direkomendasikan prioritas utama APBDes 2026.',
            'verified_at' => now()->subDays(16),
        ]);

        Funding::create([
            'application_id' => $app1->id,
            'source' => 'APBDES_DANA_DESA',
            'fiscal_year' => '2026',
            'account_code' => '02.01.05 Sub-Bidang Rehab RTLH',
            'allocated_budget' => 17500000,
            'realized_budget' => 17250000,
            'approved_by' => $kades?->id,
            'approved_at' => now()->subDays(12),
            'status' => 'DISBURSED',
        ]);

        Procurement::create([
            'application_id' => $app1->id,
            'rab_items' => [
                ['item' => 'Semen Gresik 40kg', 'volume' => 35, 'unit' => 'Sak', 'price' => 58000, 'total' => 2030000],
                ['item' => 'Pasir Pasang Cor', 'volume' => 2, 'unit' => 'Rit/Truk', 'price' => 850000, 'total' => 1700000],
                ['item' => 'Bata Ringan Hebel 7.5cm', 'volume' => 7, 'unit' => 'm3', 'price' => 620000, 'total' => 4340000],
                ['item' => 'Genteng Karangpilang Good', 'volume' => 600, 'unit' => 'Pcs', 'price' => 2800, 'total' => 1680000],
                ['item' => 'Upah Tukang & Pembantu (Swadaya)', 'volume' => 14, 'unit' => 'HOK', 'price' => 110000, 'total' => 1540000],
            ],
            'total_rab' => 17250000,
            'progress_percentage' => 100,
            'contractor_or_vendor' => 'TPK Dusun Kalasan & UD Sumber Bangunan',
            'start_date' => now()->subDays(10)->toDateString(),
            'completion_date' => now()->subDays(2)->toDateString(),
        ]);

        Handover::create([
            'application_id' => $app1->id,
            'bast_number' => '045.2/BAST-RTLH/09/2026',
            'handover_date' => now()->subDays(2)->toDateString(),
            'recipient_name' => 'Bpk. Suparno',
            'official_id' => $kades?->id,
            'notes' => 'Pekerjaan telah rampung 100% dan diserahterimakan dengan baik disaksikan Kasun Kalasan.',
            'is_published_to_transparency' => true,
        ]);

        // 2. Wheelchair Assistance Application (#JRK-JL-2026-004) - In Progress
        $ben2 = Beneficiary::create([
            'name' => 'Ibu Siti Aminah',
            'nik' => '3506124508820003',
            'kk_number' => '3506124508820000',
            'phone' => '081399887711',
            'hamlet_id' => $jl->id,
            'rt' => '01',
            'rw' => '01',
            'address' => 'RT 01 / RW 01, Dusun Jarak Lor, Desa Jarak',
            'is_unregistered' => false,
            'dtks_status' => 'Desil 2 (Miskin)',
        ]);

        $app2 = Application::create([
            'ticket_number' => '#JRK-JL-2026-004',
            'beneficiary_id' => $ben2->id,
            'hamlet_id' => $jl->id,
            'reporter_name' => 'Ahmad Rofi (Anak Kandung)',
            'reporter_phone' => '081399887711',
            'reporter_relationship' => 'Anak Kandung',
            'assistance_type' => 'DISABILITAS',
            'status' => 'APPROVED',
            'description' => 'Lumpuh pasca stroke sejak 2 tahun lalu, kesulitan mobilisasi untuk kontrol ke Puskesmas.',
            'needs_description' => 'Kursi roda standar dewasa roda velg racing lipat.',
            'priority_score' => 88,
            'urgency_level' => 'TINGGI',
            'submitted_at' => now()->subDays(6),
            'verified_at' => now()->subDays(3),
            'approved_at' => now()->subDays(1),
        ]);

        Funding::create([
            'application_id' => $app2->id,
            'source' => 'APBDES_DANA_DESA',
            'fiscal_year' => '2026',
            'account_code' => '02.01.07 Bantuan Sosial Disabilitas',
            'allocated_budget' => 2200000,
            'realized_budget' => 2150000,
            'approved_by' => $kades?->id,
            'approved_at' => now()->subDays(1),
            'status' => 'ALLOCATED',
        ]);

        // 3. New Application Waiting for Kasun Survey (#JRK-SG-2026-012)
        $ben3 = Beneficiary::create([
            'name' => 'Mbah Karyo Utomo',
            'nik' => '3506121102500005',
            'kk_number' => '3506121102500000',
            'phone' => '085233445566',
            'hamlet_id' => $sg->id,
            'rt' => '02',
            'rw' => '01',
            'address' => 'RT 02 / RW 01, Dusun Sagi, Desa Jarak',
            'is_unregistered' => false,
            'dtks_status' => 'Desil 1',
        ]);

        Application::create([
            'ticket_number' => '#JRK-SG-2026-012',
            'beneficiary_id' => $ben3->id,
            'hamlet_id' => $sg->id,
            'reporter_name' => 'Sugeng (Tetangga)',
            'reporter_phone' => '085233445566',
            'reporter_relationship' => 'Tetangga',
            'assistance_type' => 'RTLH',
            'status' => 'WAITING_KASUN_VERIFICATION',
            'description' => 'Lansia sebatang kara, dinding dapur ambruk sebagian terkena hujan angin deras.',
            'needs_description' => 'Rehabilitasi dinding dapur dan sanitasi dasar.',
            'priority_score' => 75,
            'urgency_level' => 'SEDANG',
            'submitted_at' => now()->subHours(14),
        ]);
    }
}
