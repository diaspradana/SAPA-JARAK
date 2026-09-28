# 08. Peta Jalan Pengembangan Sistem (Development Roadmap & Action Plan)

Dokumen ini memaparkan rencana aksi rekayasa perangkat lunak (*software engineering action plan*) yang terstruktur dalam 6 fase prioritas untuk meningkatkan sistem SAPA-JARAK dari status purwarupa interaktif (*interactive prototype*) menjadi sistem operasional siap rilis (*production-ready*) di lingkungan Pemerintah Desa Jarak.

---

## 1. Ikhtisar Garis Waktu Pengembangan (Phased Timeline)

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ FASE 1: Integrasi Jaringan Frontend-to-Backend (Sprint 1 — 2 Minggu)                   │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ FASE 2: Autentikasi Produksi Sanctum & Proteksi Rute (Sprint 2 — 2 Minggu)             │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ FASE 3: Penyimpanan Berkas & Pengaburan Wajah Otomatis (Sprint 3 — 2 Minggu)           │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ FASE 4: Aktivasi Gateway WhatsApp Live & Antrean Pesan (Sprint 4 — 1 Minggu)           │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ FASE 5: Rangkaian Pengujian Otomatis & Pipa CI/CD (Sprint 5 — 1 Minggu)                │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ FASE 6: PWA Offline Sync & Uji Coba Lapangan 5 Dusun (Sprint 6 — 2 Minggu)             │
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

### Fase 2: Autentikasi Produksi Sanctum & Proteksi Rute
**Tujuan**: Menggantikan tombol demo `RoleSwitcher` dengan sistem login formal yang aman untuk aparatur desa.

1. **Implementasi Halaman Login Resmi (`LoginView.jsx`)**:
   - Formulir login email dan kata sandi dengan validasi keamanan.
   - Penanganan *remember me* dan batas percobaan login (*Rate Limiting Throttling*).
2. **Pengamanan Rute Privat (*Route Guards*)**:
   - Memastikan pengguna publik tidak dapat membuka dashboard validasi Pemdes.
   - Memastikan akun Kasun Kalasan hanya dapat melihat dan menyurvei tiket Dusun Kalasan.
3. **Penyimpanan Token Sanctum**:
   - Menggunakan Laravel Sanctum SPA Cookie Session (*stateful authentication*) untuk mencegah pencurian token via XSS.

---

### Fase 3: Penyimpanan Berkas & Pengaburan Wajah Otomatis (Privacy AI)
**Tujuan**: Mengamankan foto dokumentasi fisik warga rentan dan mematuhi [PRD Seksi 18](../PRD_SAPA-JARAK_Laravel.md).

1. **Endpoint Pengunggahan Berkas**:
   - Membangun endpoint `POST /api/documents/upload` yang memvalidasi ukuran berkas (maks 5MB), MIME type (`image/jpeg`, `image/png`, `image/webp`), dan menghasilkan tautan publik.
   - Konfigurasi perintah `php artisan storage:link`.
2. **Penyamaran Wajah Otomatis (*Face Blur Engine*)**:
   - Opsi A: Integrasi pustaka sisi klien `face-api.js` (TensorFlow.js) untuk mendeteksi koordinat wajah pada foto sebelum diunggah ke server.
   - Opsi B: Pemrosesan sisi server menggunakan ekstensi PHP GD/Imagick dengan modul deteksi wajah otomatis.
   - Foto versi publik otomatis dikaburkan, sementara foto asli beresolusi penuh hanya dapat diakses oleh Kades dan Kasi Kesra melalui tautan bertanda tangan (*signed URL*).

---

### Fase 4: Aktivasi Gateway WhatsApp Live & Antrean Pesan
**Tujuan**: Menghubungkan gateway Fonnte / WhatsApp Business API asli milik Pemerintah Desa Jarak.

1. **Pendaftaran Akun Gateway & Kredensial**:
   - Memasukkan token API Fonnte pada variabel `.env` (`WHATSAPP_SIMULATION_MODE=false`).
2. **Implementasi Antrean Latar Belakang (*Background Queues*)**:
   - Memindahkan pengiriman notifikasi dari proses synchronous ke antrean asynchronous menggunakan Laravel Queue (`php artisan queue:work` atau database queue) agar respon API tetap kilat (<100ms).
3. **Webhook Penerimaan Balasan**:
   - Membangun endpoint `POST /api/webhook/whatsapp` untuk menerima pesan balasan dari warga (misal: konfirmasi kehadiran survei).

---

### Fase 5: Rangkaian Pengujian Otomatis & Pipa CI/CD
**Tujuan**: Menjamin stabilitas kode, mencegah regresi, dan mengotomatiskan deployment.

1. **Pengujian Unit & Fitur Backend (PHPUnit / Pest)**:
   - Pengujian kalkulator kelayakan RTLH dan Disabilitas (`ScoringServiceTest.php`).
   - Pengujian siklus hidup status tiket (`ApplicationWorkflowTest.php`).
   - Pengujian proteksi middleware peran (`RoleAccessTest.php`).
2. **Pengujian Antarmuka Frontend (Vitest)**:
   - Pengujian kalkulasi real-time komponen `ScoreMeter.jsx`.
   - Pengujian validasi input formulir `SubmissionWizardView.jsx`.
3. **Pipa CI/CD GitHub Actions**:
   - Menjalankan linter, pengujian PHPUnit, dan `npm run build` otomatis pada setiap aktivitas push ke branch utama.

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
