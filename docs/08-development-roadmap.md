# 08. Peta Jalan Pengembangan Sistem (Development Roadmap & Action Plan)

Dokumen ini memaparkan rencana aksi rekayasa perangkat lunak (*software engineering action plan*) yang terstruktur dalam 6 fase prioritas untuk meningkatkan sistem SAPA-JARAK dari status purwarupa interaktif (*interactive prototype*) menjadi sistem operasional siap rilis (*production-ready*) di lingkungan Pemerintah Desa Jarak.

---

## 1. Ikhtisar Garis Waktu Pengembangan (Phased Timeline)

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ FASE 1: Integrasi Jaringan Frontend-to-Backend (Backend Siap 🟢, Client Pending 🟡)   │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ FASE 2: Autentikasi Produksi Sanctum & Proteksi Rute (SELESAI DI BACKEND ✅)           │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ FASE 3: Penyimpanan Berkas & Pengaburan Wajah Deep Learning YuNet (SELESAI ✅)         │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ FASE 4: Aktivasi Gateway WhatsApp Live & Antrean Pesan (Scaffold Siap 🟡)              │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ FASE 5: Rangkaian Pengujian Otomatis PHPUnit 11 & Pipa CI/CD GHCR (SELESAI ✅)         │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ FASE 6: Ekspor Dokumen Spreadsheet O(1) & PWA Offline Sync (Ekspor Selesai ✅)        │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Rincian Fase Pengembangan

### Fase 1: Integrasi Jaringan Frontend-to-Backend (Prioritas Tertinggi)
**Tujuan**: Menghubungkan antarmuka React dengan controller RESTful API Laravel agar seluruh mutasi tersimpan di basis data terpusat.

1. **Pembangunan Lapisan Klien HTTP**:
   - Menambahkan berkas layanan `src/services/apiClient.js` menggunakan `axios` atau `fetch`.
   - Mengonfigurasi `baseURL` dinamis membaca variabel lingkungan `VITE_API_URL`.
   - Menambahkan interceptor untuk penanganan kesalahan jaringan (Network Error, 401 Unauthorized, 422 Validation Error).
2. **Refaktorisasi Mutasi State di `AppContext.jsx`**:
   - Memutakhirkan `submitApplication()` untuk memanggil `POST /api/public/applications`.
   - Memutakhirkan `submitKasunSurvey()` untuk memanggil `POST /api/kasun/applications/{id}/survey`.
   - Memutakhirkan `approveDesaFunding()` untuk memanggil `POST /api/desa/applications/{id}/validate`.
   - Memutakhirkan `updateProcurementProgress()` untuk memanggil `POST /api/desa/applications/{id}/procurement`.
   - Memutakhirkan `completeHandoverBAST()` untuk memanggil `POST /api/desa/applications/{id}/handover`.
3. **Mekanisme Fallback Otomatis**:
   - Jika server backend tidak dapat dihubungi, sistem secara cerdas tetap mengizinkan penggunaan mode offline `localStorage` agar demo tidak terganggu.

---

### Fase 2: Autentikasi Produksi Sanctum & Proteksi Rute (Backend Selesai ✅)
**Tujuan**: Menggantikan tombol demo `RoleSwitcher` dengan sistem login formal yang aman untuk aparatur desa.
- **Status Backend**: Telah aktif dan diverifikasi via `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/switch-role`, `POST /api/auth/logout`, dan middleware `role:kades,kasi_kesra,sekdes,kasun,admin`.
- **Kebutuhan Frontend**: Menyediakan formulir login kedinasan yang menyimpan Bearer Token ke browser storage dan memasukkannya ke header `Authorization: Bearer <token>`.

---

### Fase 3: Penyimpanan Berkas & Pengaburan Wajah Otomatis (Privacy AI) (Selesai ✅)
**Tujuan**: Mengamankan foto dokumentasi fisik warga rentan dan mematuhi [PRD Seksi 18](../PRD_SAPA-JARAK_Laravel.md).
- **Status Backend & AI**:
  - Endpoint upload multi-part (`POST /api/documents/upload`) dengan kompresi `Intervention\Image` (downscale maks 1920px).
  - Arsitektur Dual-Storage: `storage/app/internal/` (foto asli) vs `storage/app/public/documents/` (foto tersensor).
  - Microservice Deep Learning OpenCV YuNet 232 KB (`ml_service/face_blur.py`) dengan teknik TV Mosaic Pixelate aktif untuk sensor wajah warga.

---

### Fase 4: Aktivasi Gateway WhatsApp Live & Antrean Pesan (Scaffold Siap 🟡)
**Tujuan**: Menghubungkan gateway Fonnte / WhatsApp Business API asli milik Pemerintah Desa Jarak.

1. **Pendaftaran Akun Gateway & Kredensial**:
   - Memasukkan token API Fonnte pada variabel `.env` (`WHATSAPP_SIMULATION_MODE=false`).
2. **Implementasi Antrean Latar Belakang (*Background Queues*)**:
   - Memindahkan pengiriman notifikasi dari proses synchronous ke antrean asynchronous menggunakan Laravel Queue (`php artisan queue:work` atau database queue) agar respon API tetap kilat (<100ms).
3. **Webhook Penerimaan Balasan**:
   - Membangun endpoint `POST /api/webhook/whatsapp` untuk menerima pesan balasan dari warga (misal: konfirmasi kehadiran survei).

---

### Fase 5: Rangkaian Pengujian Otomatis & Pipa CI/CD (Selesai ✅)
**Tujuan**: Menjamin stabilitas kode, mencegah regresi, dan mengotomatiskan deployment.
- **Status Backend**:
  - Konfigurasi `phpunit.xml` aktif dengan in-memory SQLite (`:memory:`).
  - Rangkaian pengujian unit [`ExportServiceTest.php`](../tests/Unit/ExportServiceTest.php) dan pengujian fitur [`ExportApiTest.php`](../tests/Feature/ExportApiTest.php) tuntas dieksekusi 100% (*14 tests, 73 assertions*).
  - Pipeline GitHub Actions [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml) aktif membangun Docker image GHCR dan auto-deploy zero-downtime ke VPS. Rincian lengkap tersedia di [docs/12-ci-cd-pipeline-architecture.md](./12-ci-cd-pipeline-architecture.md) dan [docs/13-automated-testing-and-export-suite.md](./13-automated-testing-and-export-suite.md).
   - Pengujian siklus hidup status tiket (`ApplicationWorkflowTest.php`).
   - Pengujian proteksi middleware peran (`RoleAccessTest.php`).
2. **Pengujian Antarmuka Frontend (Vitest)**:
   - Pengujian kalkulasi real-time komponen `ScoreMeter.jsx`.
   - Pengujian validasi input formulir `SubmissionWizardView.jsx`.
3. **Pipa CI/CD GitHub Actions**:
   - Menjalankan linter, pengujian PHPUnit, dan `npm run build` otomatis pada setiap aktivitas push ke branch utama.
   - Pembangunan kontainer Docker multi-stage di GitHub Actions dan pengunggahan ke GHCR.
   - Deployment otomatis zero-downtime ke server VPS Desa via SSH.
   - *Arsitektur dan konfigurasi alur lengkap didokumentasikan pada [docs/12-ci-cd-pipeline-architecture.md](./12-ci-cd-pipeline-architecture.md).*

---

### Fase 6: PWA Offline Sync & Uji Coba Lapangan 5 Dusun
**Tujuan**: Memastikan Kepala Dusun dapat melakukan survei di daerah blank spot lereng bukit tanpa hambatan sinyal.

1. **Registrasi Service Worker & Manifest PWA**:
   - Menyediakan `manifest.json` agar aplikasi dapat dipasang di layar utama smartphone (*Add to Home Screen*).
   - Menyimpan seluruh aset visual (JS, CSS, ikon) ke Cache Storage peramban.
2. **Sinkronisasi Latar Belakang (*Background Sync via IndexedDB*)**:
   - Kasun dapat mengisi seluruh form survei dan mengambil foto GPS saat berada di wilayah tanpa sinyal.
   - Begitu ponsel kembali mendapatkan sinyal 4G/WiFi di balai desa, antrean survei otomatis terunggah ke basis data server.
3. **Sosialisasi & Pelatihan Aparatur**:
   - Pelatihan operasional bagi Kasi Kesra, Sekretaris Desa, dan 5 Kepala Dusun Desa Jarak.
