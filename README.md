# 🏛️ SAPA-JARAK (Sistem Aspirasi & Bantuan Sosial Trans-Desa)

> **Platform Transparansi Bantuan Alat Bantu Disabilitas dan Rehabilitasi RTLH Berjenjang 3 Tingkat**  
> *Pemerintah Desa Jarak, Kecamatan Plosoklaten, Kabupaten Kediri, Jawa Timur*

[![Laravel](https://img.shields.io/badge/Laravel-11.x-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)](https://laravel.com)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-Components-000000?style=for-the-badge&logo=shadcnui&logoColor=white)](https://ui.shadcn.com)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

---

## 📖 Tentang SAPA-JARAK

**SAPA-JARAK** adalah platform civic tech enterprise yang dirancang khusus untuk memfasilitasi pengajuan, verifikasi faktual lapangan, penganggaran musyawarah desa (Musdes), pengadaan barang/material, hingga serah terima resmi (BAST) bantuan sosial di **Desa Jarak, Kecamatan Plosoklaten, Kabupaten Kediri**.

Sistem ini memecahkan tiga tantangan mendasar dalam penyaluran bantuan desa:
1. **Keterbatasan Akses Warga Rentan**: Formulir pengajuan ramah mobile, mendukung pengajuan untuk orang lain / warga terlantar tanpa berkas.
2. **Kesenjangan Data Lapangan**: Mekanisme verifikasi faktual langsung oleh Kepala Dusun (Kasun) setempat menggunakan geotagging koordinat GPS dan *Automatic Scoring Engine*.
3. **Akuntabilitas & Transparansi Anggaran**: *Public Open Ledger* realisasi anggaran per dusun dengan proteksi data pribadi (*Privacy by Design*).

---

## 🌟 Fitur Utama Sistem

### 1. 👥 Mekanisme Verifikasi 3 Tingkat (*3-Tier Verification*)
```text
┌────────────────────────────────┐
│   WARGA / MASYARAKAT PUBLIK    │ ➔ Pengajuan bantuan & OTP WhatsApp
└───────────────┬────────────────┘
                │
                ▼
┌────────────────────────────────┐
│   KEPALA DUSUN (SURVEYOR)      │ ➔ Survei faktual, geotagging, scoring, & rekomendasi
└───────────────┬────────────────┘
                │
                ▼
┌────────────────────────────────┐
│   PEMERINTAH DESA (MUSDES)     │ ➔ Validasi desil DTKS, pos dana, RAB, & BAST Kades
└────────────────────────────────┘
```

### 2. 📱 WhatsApp Gateway & OTP Verification
- Validasi nomor pelapor melalui kode OTP 6-digit interaktif.
- Notifikasi pembaruan status pengajuan secara *real-time* ke nomor WhatsApp warga pada setiap tahap proses.

### 3. 🎯 Automatic Eligibility Scoring Engine
- **Rehabilitasi RTLH (Bobot 100%)**:
  - Struktur dinding bambu/gedek (25%)
  - Lantai tanah / semen rusak (25%)
  - Atap rapuh / bocor (25%)
  - Sanitasi MCK tidak layak (25%)
- **Alat Bantu Disabilitas (Bobot 100%)**:
  - Tingkat disabilitas / ketergantungan (40%)
  - Kondisi ekonomi keluarga (30%)
  - Rekomendasi nakes Puskesmas (30%)
- Penentuan tingkat urgensi otomatis: **TINGGI (≥75)**, **SEDANG (50-74)**, **RENDAH (<50)**.

### 4. 💰 Multi-Source Funding Management
Fleksibilitas penentuan sumber pembiayaan bantuan:
- **APBDes / Dana Desa Jarak**
- **Bantuan Keuangan Khusus (BKK) Kabupaten Kediri**
- **Dinas Sosial Kabupaten Kediri**
- **BAZNAS Kabupaten Kediri**
- **Swadaya Masyarakat**

### 5. 📑 Manajemen RAB Material & Pengerjaan Fisik
- Rekapitulasi Rencana Anggaran Biaya (RAB) harga satuan bahan/material.
- Pemantauan progres pengerjaan bertahap: **0% → 50% → 100%**.

### 6. ✍️ Berita Acara Serah Terima (BAST) & Digital Signature
- Format surat resmi BAST berkop Pemerintah Desa Jarak siap cetak A4.
- Penandatanganan digital oleh penerima manfaat dan Kepala Desa.
- Publikasi otomatis 1-klik ke buku register transparansi terbuka.

### 7. 🛡️ Privacy by Design & Open Ledger Transparansi
- Pelindung data pribadi warga: NIK, nomor KK, dan nomor telepon disamarkan secara otomatis pada dashboard publik (cth: `Bpk. S***** — RT 03 — Dusun Kalasan`).
- Rekapitulasi realisasi anggaran per dusun, jenis bantuan, dan status pengerjaan yang dapat diakses oleh seluruh masyarakat.

### 8. 🌓 Universal Dark & Light Mode & Desain shadcn/ui
- Sistem desain berbasis komponen **shadcn/ui** dengan palet warna resmi **Deep Emerald & Slate Civic**.
- Dukungan mode gelap/terang menyeluruh di semua tampilan publik dan dashboard internal.
- Notifikasi feedback modern menggunakan **SweetAlert2**.

---

## 🗂️ Cakupan Wilayah (5 Dusun Resmi Desa Jarak)

| Kode | Nama Dusun | Kepala Dusun (Kasun) | Kontak Telepon |
|:---|:---|:---|:---|
| `JL` | **Dusun Jarak Lor** | Bpk. Suwandi | `0812-3456-7801` |
| `JK` | **Dusun Jarak Kidul** | Bpk. Budi Santoso | `0812-3456-7802` |
| `KLS` | **Dusun Kalasan** | Bpk. Agus Santoso | `0812-3456-7803` |
| `SG` | **Dusun Sagi** | Bpk. Bambang Purnomo | `0812-3456-7804` |
| `SB` | **Dusun Simbar** | Bpk. Djoko Supriyanto | `0812-3456-7805` |

---

## 💻 Tech Stack

### Backend
- **Framework**: Laravel 11.x
- **Bahasa**: PHP 8.2+
- **Database**: Relational SQL (SQLite default, MySQL / PostgreSQL ready)
- **ORM**: Eloquent ORM dengan 12 Migrations, Seeders, & Foreign Key constraints
- **Auth & Security**: Laravel Sanctum, Role-based Middleware, Rate Limiting

### Frontend
- **Framework & Build Tool**: React 18, Vite 5
- **Design System**: shadcn/ui + Radix UI Primitives
- **Styling**: Tailwind CSS 3.4, HSL Civic Theme Variables
- **Icons & Alerts**: Lucide React, SweetAlert2
- **Animasi & Interaksi**: AOS (Animate on Scroll), Tailwind Animate

---

## 📁 Struktur Direktori Proyek

```text
c:\Rickthor7\SAPA-JARAK
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Controller.php
│   │   │   └── Api/
│   │   │       ├── PublicApplicationController.php   # Pengajuan warga, OTP, lacak tiket
│   │   │       ├── PublicTransparencyController.php  # Open ledger & metrik transparansi
│   │   │       ├── KasunController.php               # Antrean survei & submit scoring
│   │   │       ├── DesaController.php                # Validasi Musdes, RAB, BAST, SPJ
│   │   │       └── AuthController.php                # Sesi & role switcher interaktif
│   │   └── Middleware/
│   │       └── CheckUserRole.php                     # Role-based access control
│   │
│   ├── Models/                                       # 12 Eloquent Models
│   │   ├── User.php, Hamlet.php, Beneficiary.php, Application.php
│   │   ├── Verification.php, Assistance.php, Funding.php, Procurement.php
│   │   └── Handover.php, Document.php, Notification.php, AuditLog.php
│   │
│   └── Services/                                     # 8 Dedicated Business Services
│       ├── ScoringService.php                        # Kalkulator scoring kelayakan
│       ├── ApplicationService.php                    # Generator nomor tiket & state transitions
│       ├── VerificationService.php                   # Geotagging & survei faktual
│       ├── FundingService.php                        # Alokasi sumber dana APBDes/BKK
│       ├── ProcurementService.php                    # RAB & progress material
│       ├── TransparencyService.php                   # Masking data & ledger publik
│       ├── ReportingService.php                      # Rekap SPJ APBDes
│       └── WhatsAppNotificationService.php           # Gateway WhatsApp & OTP
│
├── database/
│   ├── database.sqlite                               # File database SQLite
│   ├── migrations/                                   # 12 File migrasi DDL tabel SQL
│   └── seeders/                                      # Seeder dusun, aparatur, dan tiket
│
├── resources/
│   └── views/
│       └── spa.blade.php                             # Template Blade pembungkus SPA React
│
├── routes/
│   ├── api.php                                       # 16 RESTful API endpoints
│   ├── web.php                                       # Web route & fallback SPA
│   └── console.php                                   # Artisan CLI commands
│
├── src/                                              # Source code antarmuka React
│   ├── components/
│   │   ├── ui/                                       # Komponen shadcn/ui (Button, Card, Table, dll)
│   │   ├── layout/                                   # Navbar, Footer, RoleSwitcher, Drawer
│   │   ├── public/                                   # Hero, ServiceCards, Tracking, Contact
│   │   └── common/                                   # MapPicker, ScoreMeter, StatusBadge, BAST Modal
│   ├── views/                                        # Halaman Publik, Kasun, & Pemdes
│   └── context/                                      # AppContext & State Management
│
├── public/                                           # Entry point web & aset statis terkompilasi
├── artisan, composer.json, package.json, .env
```

---

## ⚙️ Panduan Instalasi & Menjalankan Proyek

### 1. Prasyarat Sistem
Pastikan komputer telah terinstal:
- **PHP** `>= 8.2` (ekstensi `pdo_sqlite`, `pdo_mysql`, `mbstring`, `curl` aktif)
- **Composer** `>= 2.x`
- **Node.js** `>= 18.x` dan **NPM**

### 2. Kloning & Pengaturan Lingkungan
```bash
# Salin file konfigurasi lingkungan
cp .env.example .env

# Generate Application Key
php artisan key:generate
```

### 3. Instalasi Dependensi Backend & Database SQL
```bash
# Instal dependensi PHP via Composer
composer install

# Jalankan migrasi seluruh 12 tabel dan isi data awal (seeders)
php artisan migrate:fresh --seed
```

### 4. Instalasi Dependensi Frontend
```bash
# Instal dependensi JavaScript
npm install

# Jalankan server frontend development (port 3000)
npm run dev

# Atau kompilasi bundle produksi
npm run build
```

### 5. Menjalankan Server Backend Laravel
```bash
php artisan serve --port=8000
```
Aplikasi backend siap menerima permintaan di `http://localhost:8000`.

---

## 📡 Referensi RESTful API Endpoints

### 🟢 Modul Publik (`/api/public`)
| Method | Endpoint | Deskripsi |
|:---|:---|:---|
| `GET` | `/api/public/hamlets` | Mendapatkan daftar 5 Dusun resmi Desa Jarak |
| `POST` | `/api/public/otp/request` | Meminta kode OTP verifikasi WhatsApp pelapor |
| `POST` | `/api/public/applications` | Mengirim formulir pengajuan bantuan sosial baru |
| `GET` | `/api/public/applications/track/{ticket}` | Melacak detail status tiket pengajuan |
| `GET` | `/api/public/transparency/metrics` | Mendapatkan agregat statistik bantuan desa |
| `GET` | `/api/public/transparency/ledger` | Mengambil data buku register terbuka teranomisasi |

### 🟡 Modul Kepala Dusun (`/api/kasun`)
| Method | Endpoint | Deskripsi |
|:---|:---|:---|
| `GET` | `/api/kasun/queue` | Mendapatkan antrean pengajuan di wilayah dusun |
| `POST` | `/api/kasun/applications/{id}/survey` | Mengirim hasil survei lapangan, geotagging & scoring |

### 🔴 Modul Pemerintah Desa (`/api/desa`)
| Method | Endpoint | Deskripsi |
|:---|:---|:---|
| `GET` | `/api/desa/dashboard` | Mengambil rekapitulasi data register bantuan desa |
| `POST` | `/api/desa/applications/{id}/validate` | Validasi Musdes & penetapan pos anggaran |
| `POST` | `/api/desa/applications/{id}/procurement` | Menyimpan rincian RAB & progres fisik pengerjaan |
| `POST` | `/api/desa/applications/{id}/handover` | Menerbitkan BAST dan menyelesaikan status bantuan |
| `GET` | `/api/desa/reports/spj` | Mengunduh/menampilkan laporan pertanggungjawaban SPJ |

---

## 🧪 Akun Uji Coba & Demo Role Switcher

Sistem dilengkapi tombol cepat alih peran (*Role Switcher*) di bilah navigasi atas:

1. **Warga / Pelapor**: Mode publik tanpa login untuk pengajuan dan lacak tiket.
2. **Kepala Dusun (Kasun)**:
   - Email: `kasun.kalasan@jarak-kediri.desa.id`
   - Password: `password`
3. **Pemerintah Desa (Kasi Kesra / Kades)**:
   - Email: `kades@jarak-kediri.desa.id` / `kesra@jarak-kediri.desa.id`
   - Password: `password`

---

## 📄 Lisensi & Kontribusi

Sistem ini dikembangkan untuk **Pemerintah Desa Jarak, Kecamatan Plosoklaten, Kabupaten Kediri**.  
Didistribusikan di bawah lisensi **MIT License**.
