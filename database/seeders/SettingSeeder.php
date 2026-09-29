<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Setting;

class SettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $settings = [
            // 1. Profil & Wilayah Desa Jarak
            [
                'key' => 'village.name',
                'value' => 'Desa Jarak',
                'group' => 'village',
                'type' => 'string',
                'description' => 'Nama resmi pemerintah desa',
            ],
            [
                'key' => 'village.district',
                'value' => 'Kecamatan Plosoklaten',
                'group' => 'village',
                'type' => 'string',
                'description' => 'Nama kecamatan wilayah desa',
            ],
            [
                'key' => 'village.regency',
                'value' => 'Kabupaten Kediri',
                'group' => 'village',
                'type' => 'string',
                'description' => 'Nama kabupaten wilayah desa',
            ],
            [
                'key' => 'village.province',
                'value' => 'Jawa Timur',
                'group' => 'village',
                'type' => 'string',
                'description' => 'Provinsi wilayah desa',
            ],
            [
                'key' => 'village.postal_code',
                'value' => '64175',
                'group' => 'village',
                'type' => 'string',
                'description' => 'Kode pos kantor desa',
            ],
            [
                'key' => 'village.office_address',
                'value' => 'Jl. Raya Jarak No. 12, Desa Jarak, Kec. Plosoklaten, Kab. Kediri',
                'group' => 'village',
                'type' => 'string',
                'description' => 'Alamat kantor balai desa',
            ],
            [
                'key' => 'village.office_phone',
                'value' => '(0354) 7482910',
                'group' => 'village',
                'type' => 'string',
                'description' => 'Nomor telepon kantor balai desa',
            ],
            [
                'key' => 'village.whatsapp_center',
                'value' => '0812-3456-7890',
                'group' => 'village',
                'type' => 'string',
                'description' => 'Nomor WhatsApp resmi layanan aduan desa',
            ],
            [
                'key' => 'village.email',
                'value' => 'pemdes@jarak-kediri.desa.id',
                'group' => 'village',
                'type' => 'string',
                'description' => 'Alamat surel resmi pemerintah desa',
            ],
            [
                'key' => 'village.operating_hours',
                'value' => 'Senin – Jumat: 08.00 – 15.30 WIB',
                'group' => 'village',
                'type' => 'string',
                'description' => 'Jam operasional kantor balai desa',
            ],
            [
                'key' => 'village.head_name',
                'value' => 'Bpk. Drs. H. Supriyadi',
                'group' => 'village',
                'type' => 'string',
                'description' => 'Nama Kepala Desa Jarak aktif',
            ],
            [
                'key' => 'village.secretary_name',
                'value' => 'Bpk. Hendro Siswanto',
                'group' => 'village',
                'type' => 'string',
                'description' => 'Nama Sekretaris Desa Jarak aktif',
            ],
            [
                'key' => 'village.active_budget_year',
                'value' => '2026',
                'group' => 'village',
                'type' => 'integer',
                'description' => 'Tahun anggaran APBDes yang sedang berjalan',
            ],
            [
                'key' => 'village.coordinates',
                'value' => json_encode(['lat' => -7.904512, 'lng' => 112.189421]),
                'group' => 'village',
                'type' => 'json',
                'description' => 'Koordinat lintang dan bujur kantor desa Jarak',
            ],

            // 2. Parameter Pembobotan Scoring (Dynamic Scoring Weights)
            [
                'key' => 'scoring.rtlh_weights',
                'value' => json_encode([
                    'dinding' => 25,
                    'lantai' => 25,
                    'atap' => 25,
                    'mck' => 25,
                ]),
                'group' => 'scoring',
                'type' => 'json',
                'description' => 'Bobot persentase parameter kriteria RTLH (total 100%)',
            ],
            [
                'key' => 'scoring.disability_weights',
                'value' => json_encode([
                    'tingkat_disabilitas' => 40,
                    'kondisi_ekonomi' => 30,
                    'rekomendasi_nakes' => 30,
                ]),
                'group' => 'scoring',
                'type' => 'json',
                'description' => 'Bobot persentase parameter kriteria Disabilitas (total 100%)',
            ],
            [
                'key' => 'scoring.minimum_passing_score',
                'value' => '50',
                'group' => 'scoring',
                'type' => 'integer',
                'description' => 'Skor minimal kelayakan (passing grade) penerima bantuan',
            ],
            [
                'key' => 'scoring.high_urgency_threshold',
                'value' => '75',
                'group' => 'scoring',
                'type' => 'integer',
                'description' => 'Batas skor minimum untuk prioritas urgensi TINGGI',
            ],

            // 3. Pengaturan Notifikasi & Gateway
            [
                'key' => 'notification.whatsapp_enabled',
                'value' => '1',
                'group' => 'notification',
                'type' => 'boolean',
                'description' => 'Status aktif pengiriman notifikasi WhatsApp',
            ],
            [
                'key' => 'notification.simulation_mode',
                'value' => '1',
                'group' => 'notification',
                'type' => 'boolean',
                'description' => 'Mode simulasi sandbox WhatsApp tanpa memotong kuota gateway',
            ],
            [
                'key' => 'notification.auto_notify_kasun',
                'value' => '1',
                'group' => 'notification',
                'type' => 'boolean',
                'description' => 'Kirim notifikasi otomatis ke Kasun saat ada pengajuan baru di wilayahnya',
            ],
            [
                'key' => 'notification.auto_notify_applicant',
                'value' => '1',
                'group' => 'notification',
                'type' => 'boolean',
                'description' => 'Kirim notifikasi otomatis ke pelapor/warga saat status tiket berubah',
            ],

            // 4. Pengaturan Transparansi Publik & Privasi Data
            [
                'key' => 'transparency.privacy_masking_enabled',
                'value' => '1',
                'group' => 'transparency',
                'type' => 'boolean',
                'description' => 'Enforce penyensoran NIK dan nama warga pada portal transparansi publik (UU PDP No. 27/2022)',
            ],
            [
                'key' => 'transparency.open_ledger_enabled',
                'value' => '1',
                'group' => 'transparency',
                'type' => 'boolean',
                'description' => 'Izinkan publik melihat buku kas realisasi bansos APBDes',
            ],
            [
                'key' => 'transparency.data_retention_years',
                'value' => '5',
                'group' => 'transparency',
                'type' => 'integer',
                'description' => 'Lama penyimpanan data riwayat bantuan sebelum diarsipkan (tahun)',
            ],
        ];

        foreach ($settings as $setting) {
            Setting::updateOrCreate(
                ['key' => $setting['key']],
                $setting
            );
        }
    }
}
