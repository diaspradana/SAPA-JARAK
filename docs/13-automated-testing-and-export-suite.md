# 13. Dokumentasi Pengujian Otomatis & Rangkaian Uji Ekspor (Automated Testing & Export Suite)

Dokumen ini merangkum arsitektur pengujian otomatis (*automated testing suite*), konfigurasi test runner PHPUnit, rincian skenario pengujian unit dan fitur pada modul ekspor spreadsheet/CSV, serta panduan eksekusi pengujian dalam container Docker.

---

## 1. Arsitektur Lingkungan Pengujian (*Testing Environment*)

Pengujian otomatis backend dibangun di atas kerangka kerja **PHPUnit 11** dan utilitas pengujian Laravel 11. Konfigurasi didefinisikan pada berkas [`phpunit.xml`](../phpunit.xml):

- **Database Mesin Pengujian**: SQLite *In-Memory* (`:memory:`). Tidak mencemari basis data produksi/MySQL lokal dan tidak memerlukan migrasi persisten yang lambat.
- **Isolasi Transaksi Database**: Menggunakan *trait* `Illuminate\Foundation\Testing\RefreshDatabase` untuk menjalankan migrasi schema sekali dan mereset tabel secara terisolasi pada setiap skenario uji.
- **Autentikasi & Otorisasi Pengujian**: Menggunakan `Laravel\Sanctum\Sanctum::actingAs()` untuk memverifikasi token dan hak akses peran (`role:kades`, `role:kasun`, `admin`, dan tamu tanpa autentikasi).
- **Kecepatan Eksekusi**: Seluruh rangkaian 14 tes dengan 73 assertions tuntas dieksekusi dalam **$\approx 1.5$ detik**.

---

## 2. Rincian Berkas Pengujian (*Test Suites*)

### 2.1 Pengujian Unit Mesin Ekspor ([`tests/Unit/ExportServiceTest.php`](../tests/Unit/ExportServiceTest.php))

Fokus pengujian adalah memvalidasi integritas logika pemformatan data, efisiensi memori, preservasi angka identitas, dan kepatuhan standar format berkas pada layanan [`App\Services\ExportService`](../app/Services/ExportService.php).

| No | Nama Metode Pengujian | Deskripsi & Validasi Utama |
| :---: | :--- | :--- |
| 1 | `test_export_spj_csv_generates_valid_utf8_bom_and_totals` | Memverifikasi kehadiran *Byte Order Mark* UTF-8 (`\xEF\xBB\xBF`) di byte pertama, header kolom CSV, nomor tiket, nomor BAST, formula proteksi NIK (`3506...`), serta kalkulasi baris total akumulasi anggaran (Pagu: 17.500.000, Realisasi: 17.250.000, Sisa: 250.000). |
| 2 | `test_export_spj_csv_supports_semicolon_delimiter` | Memverifikasi kustomisasi pemisah kolom menggunakan titik-koma (`;`) untuk sistem Windows Excel dengan pengaturan wilayah Indonesia (`?delimiter=;`). |
| 3 | `test_export_spj_excel_generates_valid_spreadsheetml` | Memvalidasi sintaks XML Spreadsheet 2003 (`SpreadsheetML`): deklarasi XML, `<Workbook>`, definisi *styles* korporat (`Header`, `Currency`, `Total`), pemformatan sel numerik mata uang, dan ekstensi berkas `.xls`. |
| 4 | `test_export_beneficiaries_contains_full_official_data` | Memverifikasi bahwa ekspor master register aparatur desa memuat identitas lengkap tanpa sensor (Nama lengkap, 16 digit NIK, 16 digit KK, nomor kontak/telepon, status DTKS, skor kelayakan, dan status verifikasi). |
| 5 | `test_export_public_transparency_masks_beneficiary_identity` | Memverifikasi kepatuhan privasi UU No. 27/2022: nama warga disamarkan menjadi `Bpk. S*****`, serta memastikan nama asli dan 16 digit NIK tidak bocor ke output transparansi publik. |
| 6 | `test_export_kasun_queue_scopes_to_kasun_hamlet` | Memverifikasi isolasi wilayah administratif: saat diekspor oleh Kasun Kalasan, hanya pengajuan di Dusun Kalasan yang muncul, sementara data Dusun Sagi disaring keluar. |

---

### 2.2 Pengujian Integrasi HTTP API ([`tests/Feature/ExportApiTest.php`](../tests/Feature/ExportApiTest.php))

Fokus pengujian adalah memverifikasi rute antarmuka pemrograman aplikasi HTTP, otorisasi Sanctum, kode status HTTP, serta header biner berkas yang dikirimkan ke peramban.

| No | Nama Metode Pengujian | Endpoint yang Diuji | Ekspektasi Respon |
| :---: | :--- | :--- | :--- |
| 1 | `test_public_transparency_export_csv_without_auth` | `GET /api/public/transparency/export?format=csv` | `200 OK`, `Content-Type: text/csv; charset=UTF-8`, `Content-Disposition: attachment; filename=...csv` |
| 2 | `test_public_transparency_export_excel_without_auth` | `GET /api/public/transparency/export?format=excel` | `200 OK`, `Content-Type: application/vnd.ms-excel; charset=UTF-8`, `filename=...xls` |
| 3 | `test_desa_spj_export_unauthenticated_returns_401` | `GET /api/desa/reports/spj/export` | `401 Unauthorized`, `{"success": false, "message": "Unauthenticated..."}` |
| 4 | `test_desa_spj_export_csv_authenticated_kades` | `GET /api/desa/reports/spj/export?format=csv` | `200 OK`, `Content-Type: text/csv; charset=UTF-8` dengan token Kades |
| 5 | `test_desa_spj_excel_shortcut_authenticated_kades` | `GET /api/desa/reports/spj/excel` | `200 OK`, `Content-Type: application/vnd.ms-excel; charset=UTF-8` (Shortcut Excel) |
| 6 | `test_desa_spj_csv_shortcut_authenticated_kades` | `GET /api/desa/reports/spj/csv` | `200 OK`, `Content-Type: text/csv; charset=UTF-8` (Shortcut CSV) |
| 7 | `test_desa_beneficiaries_export_authenticated_kades` | `GET /api/desa/reports/beneficiaries/export?format=csv` | `200 OK`, `Content-Type: text/csv; charset=UTF-8`, `filename=Rekapitulasi_Penerima_Bansos_...` |
| 8 | `test_kasun_reports_export_authenticated_kasun` | `GET /api/kasun/reports/export?format=csv` | `200 OK`, `Content-Type: text/csv; charset=UTF-8`, `filename=Antrean_Survei_Kasun_...` |

---

## 3. Panduan Menjalankan Pengujian (*Execution Guide*)

### Menjalankan Seluruh Pengujian via Docker:
```bash
docker exec sapa_jarak_app vendor/bin/phpunit
```

### Menjalankan Unit Test Spesifik Modul Ekspor:
```bash
docker exec sapa_jarak_app vendor/bin/phpunit tests/Unit/ExportServiceTest.php
```

### Menjalankan Feature Test Spesifik Endpoint Ekspor:
```bash
docker exec sapa_jarak_app vendor/bin/phpunit tests/Feature/ExportApiTest.php
```

### Menjalankan Pengujian dengan Output Rinci (*Testdox*):
```bash
docker exec sapa_jarak_app vendor/bin/phpunit --testdox
```

Contoh Output Lulus:
```text
PHPUnit 11.5.56 by Sebastian Bergmann and contributors.

Runtime:       PHP 8.4.26
Configuration: /var/www/html/phpunit.xml

Export Service (Tests\Unit\ExportService)
 ✔ Export spj csv generates valid utf8 bom and totals
 ✔ Export spj csv supports semicolon delimiter
 ✔ Export spj excel generates valid spreadsheetml
 ✔ Export beneficiaries contains full official data
 ✔ Export public transparency masks beneficiary identity
 ✔ Export kasun queue scopes to kasun hamlet

Export Api (Tests\Feature\ExportApi)
 ✔ Public transparency export csv without auth
 ✔ Public transparency export excel without auth
 ✔ Desa spj export unauthenticated returns 401
 ✔ Desa spj export csv authenticated kades
 ✔ Desa spj excel shortcut authenticated kades
 ✔ Desa spj csv shortcut authenticated kades
 ✔ Desa beneficiaries export authenticated kades
 ✔ Kasun reports export authenticated kasun

OK (14 tests, 73 assertions)
Time: 00:01.519, Memory: 16.00 MB
```
