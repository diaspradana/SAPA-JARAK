# 04. Analisis Kesenjangan & Fitur Belum Terimplementasi (Gap Analysis & Unimplemented Features)

Dokumen ini menyajikan analisis kritis dan komparatif antara spesifikasi kebutuhan pada [PRD SAPA-JARAK](../PRD_SAPA-JARAK_Laravel.md) dan [Spesifikasi Desain](../design.md) terhadap kondisi aktual basis kode (*actual codebase*). 

Analisis ini menguraikan fitur yang **belum diimplementasikan**, fitur yang **masih bersifat simulasi/mock**, serta utang teknis (*technical debt*) yang harus diselesaikan sebelum sistem dapat digunakan secara operasional di Pemerintah Desa Jarak.

---

## 1. Matriks Kepatuhan Kebutuhan Fungsional (PRD vs Implementasi)

| ID | Deskripsi Kebutuhan PRD | Prioritas | Status UI Frontend | Status Backend API | Kesiapan Produksi | Keterangan & Kesenjangan |
|:---|:---|:---:|:---:|:---:|:---:|:---|
| **FR-001** | Pengajuan bantuan oleh publik | **Must** | ✅ Selesai | ✅ Selesai | 🟡 Perlu Integrasi | Frontend masih menyimpan ke `localStorage`, belum `POST` ke API Laravel. |
| **FR-002** | Pengajuan untuk orang lain / warga terlantar | **Must** | ✅ Selesai | ✅ Selesai | 🟢 Siap | Bypass NIK/KK berfungsi baik di frontend maupun model backend. |
| **FR-003** | Verifikasi OTP WhatsApp | **Must** | 🟡 Simulasi | 🟡 Simulasi | 🟡 Perlu Gateway | Menggunakan kode generator lokal & simulasi UI modal (gateway belum live). |
| **FR-004** | Generator nomor tiket unik | **Must** | ✅ Selesai | ✅ Selesai | 🟢 Siap | Format `#JRK-{DUSUN}-{TAHUN}-{SEQ}` identik di JS dan PHP. |
| **FR-005** | Pelacakan status via tiket | **Must** | ✅ Selesai | ✅ Selesai | 🟡 Perlu Integrasi | Tampilan stepper lengkap, query masih membaca state peramban. |
| **FR-006** | Antrean Kasun berdasarkan dusun | **Must** | ✅ Selesai | ✅ Selesai | 🟡 Perlu Integrasi | Filter dusun aktif di UI dan controller `KasunController@queue`. |
| **FR-007** | Kasun melakukan survei lapangan | **Must** | ✅ Selesai | ✅ Selesai | 🟡 Perlu Integrasi | Formulir survei lengkap, data disimpan di client state. |
| **FR-008** | Geotagging koordinat GPS | **Must** | ✅ Selesai | ✅ Selesai | 🟢 Siap | Menggunakan HTML5 Geolocation API dengan fallback sentroid dusun. |
| **FR-009** | Automatic Eligibility Scoring | **Must** | ✅ Selesai | ✅ Selesai | 🟢 Siap | Rumus RTLH (4x25%) & Disabilitas (40-30-30%) identik di JS dan PHP. |
| **FR-010** | Validasi & Musdes Pemdes | **Must** | ✅ Selesai | ✅ Selesai | 🟡 Perlu Integrasi | Antarmuka validasi lengkap, data belum tersinkronisasi ke server. |
| **FR-011** | Cek duplikasi bantuan | **Must** | 🟡 Sederhana | 🟡 Sederhana | 🟡 Perlu Penguatan | Hanya mencocokkan string KK/NIK pada data aktif tahun berjalan. |
| **FR-012** | Alokasi sumber dana (APBDes/BKK/dll) | **Must** | ✅ Selesai | ✅ Selesai | 🟡 Perlu Integrasi | 4 sumber dana telah dimodelkan di JS dan database SQL. |
| **FR-013** | Pengelolaan pengadaan & RAB | **Should** | ✅ Selesai | ✅ Selesai | 🟡 Perlu Integrasi | Kalkulator RAB dan persentase pengerjaan berfungsi di antarmuka. |
| **FR-014** | Unggah & Terbitkan BAST | **Must** | ✅ Selesai | ✅ Selesai | 🟡 Perlu Integrasi | Tanda tangan digital canvas aktif, BAST tampil dan siap cetak. |
| **FR-015** | Dokumentasi progres 0%, 50%, 100% | **Must** | ✅ Selesai | ✅ Selesai | 🟢 Siap di API | Penyimpanan fisik multi-part, kompresi Intervention Image, dan dual-storage privasi aktif di API. |
| **FR-016** | Dashboard transparansi publik | **Must** | ✅ Selesai | ✅ Selesai | 🟡 Perlu Integrasi | Open ledger dan agregat metrik berfungsi penuh di UI. |
| **FR-017** | Notifikasi status via WhatsApp | **Must** | 🟡 Simulasi | 🟡 Simulasi | 🟡 Perlu Gateway | Frontend menampilkan modal pesan; backend memiliki HTTP scaffold Fonnte. |
| **FR-018** | Ekspor Laporan PDF | **Must** | 🟡 Client Print | ✅ Selesai | 🟢 Siap di API | Generator server-side DomPDF aktif untuk Tanda Terima, BAST, dan Laporan SPJ APBDes. |
| **FR-019** | Ekspor Laporan Excel/CSV | **Must** | ✅ Selesai | 🟡 JSON Saja | 🟢 Siap di UI | Ekspor CSV langsung dari browser berhasil; backend baru menyediakan JSON. |
| **FR-020** | Log jejak audit kepatuhan (Audit Log) | **Should** | ❌ Belum Ada di UI | ✅ Selesai | 🟡 Backend Saja | Model & migrasi `audit_logs` ada di Laravel, namun belum ada tab audit di UI. |
| **FR-021** | Privacy masking data warga | **Must** | ✅ Selesai | ✅ Selesai | 🟢 Siap | NIK/Nama disamarkan (`Bpk. S*****`) di antarmuka dan accessor model. |
| **FR-022** | Antarmuka Mobile-First | **Must** | ✅ Selesai | N/A | 🟢 Siap | Desain responsif Tailwind CSS sangat baik di viewport ponsel. |
| **FR-023** | Penyimpanan draft offline (PWA) | **Should** | 🟡 Sebagian | N/A | 🔴 Belum Ada SW | Menggunakan `localStorage`, belum ada Service Worker PWA sejati. |
| **FR-024** | Panduan suara aksesibilitas | **Should** | ✅ Selesai | N/A | 🟢 Siap | Native Web Speech Synthesis API Bahasa Indonesia berjalan baik. |

---

## 2. Analisis Kesenjangan Kritis (*Critical Architectural Gaps*)

### 2.1 Kesenjangan Utama: Frontend Berjalan Mandiri (Belum Tersambung HTTP API)
- **Kondisi Saat Ini**:
  - Seluruh alur kerja di antarmuka React (`src/`) berjalan di atas `AppContext.jsx` yang memanfaatkan `localStorage` dan dataset bawaan `src/data/initialData.js`.
  - Backend Laravel (`app/Http/Controllers/Api/` dan `routes/api.php`) memiliki seluruh endpoint dan logika service yang ekuivalen, namun **tidak ada pemanggilan jaringan (`fetch` atau `axios`) sama sekali dari sisi React ke endpoint `/api/*`**.
- **Dampak**:
  - Perubahan data yang dilakukan oleh satu pengguna (misal Kasun melakukan survei) hanya tersimpan di peramban perangkat tersebut dan **tidak terlihat oleh admin desa di komputer kantor desa**.
- **Solusi yang Dibutuhkan**:
  - Membangun API Client layer (menggunakan Axios atau Fetch wrapper) di direktori `src/services/apiClient.js`.
  - Mengubah fungsi-fungsi mutasi di `AppContext.jsx` (`submitApplication`, `submitKasunSurvey`, `approveDesaFunding`, dll) menjadi pemanggilan `async/await` ke endpoint Laravel.

---

### 2.2 Sistem Autentikasi Produksi & Manajemen Sesi (*Production Auth*)
- **Status Implementasi (Backend Selesai ✅)**:
  - Telah diimplementasikan endpoint `POST /api/auth/login` (verifikasi email dan password bcrypt) yang menerbitkan **Laravel Sanctum Personal Access Token**.
  - Endpoint `POST /api/auth/logout` dan `GET /api/auth/me` untuk manajemen sesi aktif.
  - Endpoint demo `POST /api/auth/switch-role` diperbarui untuk menerbitkan Sanctum Bearer Token yang sah.
  - Middleware `auth:sanctum` dan `CheckUserRole.php` dipasang pada seluruh grup rute `/api/kasun/*` dan `/api/desa/*` dengan respons error 401 (Unauthenticated) dan 403 (Unauthorized Role) berformat JSON terstandar.
  - Dokumentasi API diperbarui pada [docs/05-api-reference.md Seksi 5](05-api-reference.md).
- **Langkah Frontend Lanjutan (Opsional)**:
  - Halaman antarmuka login formal (`LoginView.jsx`) dan Route Guard pada React Router.

---

### 2.3 Integrasi Gateway WhatsApp Live (*Live WhatsApp Gateway*)
- **Kondisi Saat Ini**:
  - Pengiriman pesan WhatsApp berjalan dalam **mode simulasi (*simulation mode*)**.
  - Frontend memunculkan pop-up modal (`WhatsAppPreviewModal.jsx`) dan laci riwayat (`NotificationDrawer.jsx`).
  - Backend memiliki konfigurasi Fonnte di `config/services.php`:
    ```php
    'whatsapp' => [
        'url' => env('WHATSAPP_GATEWAY_URL', 'https://api.fonnte.com/send'),
        'token' => env('WHATSAPP_API_TOKEN', 'mock_token_sapa_jarak_2026'),
        'simulation' => env('WHATSAPP_SIMULATION_MODE', true),
    ]
    ```
- **Fitur yang Belum Ada**:
  - Kredensial akun resmi Fonnte / Twilio / Meta WhatsApp Cloud API dari Pemerintah Desa Jarak.
  - Penanganan pesan gagal kirim (*Retry Mechanism & Dead Letter Queue*).
  - Webhook penerima balasan pesan atau status terkirim/terbaca (*Delivery Receipt Webhook*).

---

### 2.4 Penyimpanan Berkas & Pengunggahan Foto (*File & Media Storage*)
- **Status Implementasi (Backend Selesai ✅)**:
  - Telah diinstal pustaka `intervention/image` (v4.3) dengan driver GD murni untuk kompresi gambar sisi server (*image optimization*). Kamera smartphone beresolusi tinggi otomatis diturunkan skalanya ke dimensi maksimal 1920×1920 piksel dan dikompresi ke JPEG kualitas 82 (mereduksi ukuran berkas dari 5–10MB menjadi ~150–300KB).
  - Layanan [`App\Services\MediaStorageService`](../app/Services/MediaStorageService.php) dibuat untuk mengelola siklus hidup berkas:
    - **Validasi Ketat**: Membatasi ukuran berkas maksimal 10MB dan memvalidasi MIME type (`image/jpeg`, `image/png`, `image/webp`, `application/pdf`).
    - **Arsitektur Penyimpanan Ganda (*Dual-Storage Architecture*)**:
      - *Penyimpanan Internal* (`storage/app/internal/documents/YYYY/`): Menyimpan berkas asli beresolusi penuh. Hanya dapat diakses oleh aparatur terautentikasi (`kades`, `kasi_kesra`, `sekdes`, `admin`, `kasun`).
      - *Penyimpanan Publik* (`storage/app/public/documents/YYYY/`): Khusus untuk foto dokumentasi warga (`FOTO_KONDISI_AWAL`, `FOTO_SURVEI_KASUN`, `FOTO_PROGRES_50`, `FOTO_SELESAI_100`). Terintegrasi dengan [`ImagePrivacyService`](../app/Services/ImagePrivacyService.php) dan microservice FastAPI untuk deteksi & pengaburan wajah otomatis (*automatic face blurring*) sebelum dipublikasikan ke portal transparansi desa.
    - **Proteksi Identitas Sensitif**: Berkas bertipe `KTP_KK` dan `SURAT_KETERANGAN_DOKTER` secara mutlak dipaksa berstatus `INTERNAL_ONLY` dan tidak pernah diterbitkan salinan publiknya.
  - Endpoint RESTful API pada [`App\Http\Controllers\Api\DocumentController`](../app/Http/Controllers/Api/DocumentController.php):
    - `POST /api/documents/upload`: Unggah berkas fisik multi-part (dapat mandiri sebagai draf atau langsung terhubung ke tiket).
    - `GET /api/documents`: Daftar riwayat berkas (otomatis terfilter `PUBLIC_MASKED` bagi masyarakat publik).
    - `GET /api/documents/{id}`: Metadata detail berkas dan URL publik.
    - `GET /api/documents/{id}/file`: Streaming/unduhan berkas fisik biner (terproteksi hak akses untuk versi asli/internal).
    - `DELETE /api/documents/{id}`: Penghapusan dokumen dan berkas fisik dari disk (terproteksi `auth:sanctum`).
  - Pemohon publik dapat menyertakan `document_ids` saat mengirimkan formulir tiket (`POST /api/public/applications`), dan hasil pelacakan tiket (`GET /api/public/applications/track/{ticket}`) otomatis menyertakan relasi berkas publik.
  - Dokumentasi API lengkap diperbarui pada [docs/05-api-reference.md Seksi 7](05-api-reference.md).

---

### 2.5 Penyamaran Wajah Otomatis (*Face Detection & Blurring*)
- **Kondisi PRD**:
  - [PRD Seksi 18](../PRD_SAPA-JARAK_Laravel.md) menyatakan: *Original Photo ➔ Face Detection ➔ Automatic Blur ➔ Public Version* untuk melindungi martabat dan privasi warga rentan.
- **Status Implementasi (Selesai ✅)**:
  - Telah diimplementasikan menggunakan microservice FastAPI (`ml_service/face_blur.py`) yang dioptimalkan khusus untuk VPS 1 vCPU (< 40MB RAM, < 35ms latensi) dengan OpenCV Haar Cascades dan elliptical Gaussian feathering.
  - Dokumentasi lengkap tersedia di [docs/10-face-blur-privacy-service.md](10-face-blur-privacy-service.md).
  - Backend Laravel terintegrasi melalui [`App\Services\ImagePrivacyService`](../app/Services/ImagePrivacyService.php).

---

### 2.6 Pembuatan Laporan PDF di Sisi Server (*Server-Side PDF Engine*)
- **Status Implementasi (Backend Selesai ✅)**:
  - Telah diinstal paket `barryvdh/laravel-dompdf` (v3.1) yang berjalan *pure PHP* tanpa dependensi Chromium/NodeJS yang rakus memori (sangat aman untuk VPS berspesifikasi 1 vCPU / 1GB RAM, *footprint* < 15MB RAM per render).
  - Layanan [`App\Services\PdfService`](../app/Services/PdfService.php) dibuat untuk menghasilkan berkas PDF biner dari template Blade terstruktur:
    - `generateReceiptPdf`: Bukti Tanda Terima Pendaftaran (A4 portrait) dengan nomor tiket, kode QR verifikasi status, rincian bantuan, dan klausul persetujuan UU PDP No. 27/2022.
    - `generateBastPdf`: Berita Acara Serah Terima (BAST) resmi (A4 portrait) dengan identitas penerima, nomor BAST, nominal alokasi APBDes, serta kolom tanda tangan para pihak (Penerima Manfaat, Kasun, Kasi Kesra, dan Kepala Desa).
    - `generateSpjPdf`: Laporan Pertanggungjawaban Realisasi Anggaran APBDes (A4 landscape) yang menyajikan tabel rekapitulasi realisasi belanja per dusun, sisa pagu, persentase serapan, dan tanda tangan legalitas Pemdes.
  - Tiga endpoint HTTP unduh PDF biner aktif:
    - `GET /api/public/applications/{ticket}/pdf` (Publik / Tanpa autentikasi agar warga dapat langsung mengunduh bukti tiket).
    - `GET /api/desa/applications/{id}/bast/pdf` (Terproteksi `auth:sanctum`, hak akses: `kades`, `kasi_kesra`, `sekdes`, `admin`).
    - `GET /api/desa/reports/spj/pdf` (Terproteksi `auth:sanctum`, hak akses: `kades`, `kasi_kesra`, `sekdes`, `admin`).
  - Dokumentasi API lengkap diperbarui pada [docs/05-api-reference.md Seksi 2.5, 4.6, dan 4.7](05-api-reference.md).

---

### 2.7 Kemampuan Offline PWA & Service Worker (*Offline Sync*)
- **Kondisi Saat Ini**:
  - Aplikasi memiliki mode hemat kuota (*Low-Bandwidth Mode*), namun belum memiliki file `service-worker.js` atau Web App Manifest (`manifest.json`) untuk instalasi aplikasi layar utama (*Add to Home Screen*).
- **Fitur yang Belum Ada**:
  - Penyimpanan antrean formulir survei Kasun ke IndexedDB saat berada di wilayah tanpa sinyal internet.
  - Sinkronisasi otomatis (*background sync*) saat perangkat kembali terhubung ke jaringan internet.

---

### 2.8 Pengujian Otomatis (*Automated Testing Suite*)
- **Kondisi Terkini (Sedang Dikerjakan di Branch `backend-rz` 🟡)**:
  - File konfigurasi [`phpunit.xml`](file:///home/ascension/Projects/SAPA-JARAK/phpunit.xml) dan test runner telah ditambahkan.
  - Pengujian kalkulator penilaian kelayakan dan validasi parameter telah diimplementasikan pada [`tests/Feature/ScoringApiTest.php`](file:///home/ascension/Projects/SAPA-JARAK/tests/Feature/ScoringApiTest.php) (mencakup pengujian RTLH, Disabilitas, dan validasi 422).
  - Rincian lengkap dicatat pada [docs/11-team-backend-rz-scoring-and-testing.md](11-team-backend-rz-scoring-and-testing.md).
- **Kebutuhan Pengujian Lanjutan**:
  - Feature test alur pengajuan tiket dan verifikasi OTP (`ApplicationSubmissionTest.php`).
  - Feature test validasi otorisasi peran kasun dan desa.
  - Frontend unit test (Vitest) atau E2E (Playwright / Cypress).

---

### 2.9 Panel Pengaturan Administrasi Desa (*Admin Settings Panel*)
- **Kondisi PRD**:
  - [PRD Seksi 21](../PRD_SAPA-JARAK_Laravel.md) menguraikan fungsi manajemen aparatur, penyesuaian bobot parameter scoring, dan pengawasan log audit.
- **Kondisi Saat Ini**:
  - Pengaturan nama dusun, kasun, dan bobot scoring masih berada di file konfigurasi statis (`desaConfig.js` dan `ScoringService.php`).
  - Belum ada antarmuka bagi admin desa untuk menambah aparatur baru atau mengubah bobot persentase scoring secara dinamis dari dashboard.
