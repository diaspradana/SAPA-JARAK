# 📚 Dokumentasi Resmi Sistem SAPA-JARAK
### Sistem Aspirasi & Bantuan Sosial Trans-Desa
**Pemerintah Desa Jarak, Kecamatan Plosoklaten, Kabupaten Kediri, Jawa Timur**

---

Selamat datang di pusat dokumentasi teknis dan fungsional **SAPA-JARAK**. Direktori `docs/` ini menyajikan tinjauan menyeluruh mengenai arsitektur sistem, spesifikasi fungsional, analisis kesenjangan implementasi (*gap analysis*), referensi API, skema basis data, panduan instalasi, serta peta jalan (*roadmap*) pengembangan ke depan.

Dokumentasi ini disusun berdasarkan kode sumber aktual (*source code*), konfigurasi basis data, [PRD SAPA-JARAK](../PRD_SAPA-JARAK_Laravel.md), dan [Spesifikasi Desain](../design.md).

---

## 🗂️ Daftar Isi Dokumentasi

| No | Dokumen | Ringkasan Konten | Tautan |
|:---|:---|:---|:---|
| **01** | **System Overview** | Ringkasan eksekutif, profil Desa Jarak, latar belakang masalah, prinsip civic tech, dan arsitektur 3 tingkat (*3-tier*). | [01-system-overview.md](./01-system-overview.md) |
| **02** | **Architecture & Design** | Arsitektur Laravel 11 Backend + React 18 Frontend, sistem dual-layer (Simulasi vs REST API), UI/UX Design System shadcn/ui, palet warna, dark mode, dan mode low-bandwidth. | [02-architecture-and-design.md](./02-architecture-and-design.md) |
| **03** | **Implemented Features** | Audit lengkap seluruh fitur yang **sudah diimplementasikan** di antarmuka web, state management, scoring engine, BAST modal, dan backend services. | [03-implemented-features.md](./03-implemented-features.md) |
| **04** | **Unimplemented & Gap Analysis** | **Analisis komparatif detail:** Apa yang belum diimplementasikan, fitur yang masih bersifat simulasi (*mocked/localStorage*), kendala integrasi API, dan utang teknis (*technical debt*). | [04-unimplemented-and-gap-analysis.md](./04-unimplemented-and-gap-analysis.md) |
| **05** | **RESTful API Reference** | Dokumentasi lengkap 43 endpoint API Laravel (`/api/public/*`, `/api/kasun/*`, `/api/desa/*`, `/api/auth/*`, `/api/documents/*`, `/api/admin/*`), format payload JSON, parameter, dan respon. | [05-api-reference.md](./05-api-reference.md) |
| **06** | **Database Schema & Data Dictionary** | Diagram ERD Mermaid, struktur 13 tabel SQL, relasi foreign key, tipe data, indeks, dan diagram mesin status (*state machine*). | [06-database-schema.md](./06-database-schema.md) |
| **07** | **Setup & Deployment Guide** | Panduan instalasi dari nol, prasyarat sistem, migrasi & seeder, kompilasi aset Vite, konfigurasi `.env`, dan panduan produksi. | [07-setup-and-deployment-guide.md](./07-setup-and-deployment-guide.md) |
| **08** | **Development Roadmap** | Rencana aksi bertahap (*action plan*) untuk menghubungkan frontend ke API backend, migrasi auth Sanctum produksi, integrasi gateway WhatsApp resmi, dan pengujian otomatis. | [08-development-roadmap.md](./08-development-roadmap.md) |
| **09** | **ML Implementation Roadmap** | Rencana implementasi Machine Learning: DSS Prioritas Kelayakan Bantuan (RandomForest) dan arsitektur microservice FastAPI. | [09-machine-learning-implementation-roadmap.md](./09-machine-learning-implementation-roadmap.md) |
| **10** | **Privacy AI Face Blurring** | Spesifikasi teknis sensor wajah otomatis (*Face Blurring Engine*) berbasis Deep Learning OpenCV YuNet 232 KB & mode Pixelate TV. | [10-face-blur-privacy-service.md](./10-face-blur-privacy-service.md) |
| **11** | **Backend Testing & Scoring** | Dokumentasi pengerjaan tim backend-rz: kalkulator simulasi scoring preview dan implementasi test suite PHPUnit. | [11-team-backend-rz-scoring-and-testing.md](./11-team-backend-rz-scoring-and-testing.md) |
| **12** | **CI/CD Pipeline Architecture** | Arsitektur pipeline CI/CD GitHub Actions: kompilasi cloud runner, registri GHCR, dan deployment otomatis zero-downtime ke VPS 1 vCPU. | [12-ci-cd-pipeline-architecture.md](./12-ci-cd-pipeline-architecture.md) |
| **13** | **Automated Testing & Export Suite** | Dokumentasi rangkaian pengujian otomatis PHPUnit 11 (Unit & Feature Tests), isolasi in-memory SQLite, verifikasi modul ekspor spreadsheet/CSV, dan panduan eksekusi pengujian. | [13-automated-testing-and-export-suite.md](./13-automated-testing-and-export-suite.md) |

---

## 🏛️ Sekilas Tentang SAPA-JARAK

SAPA-JARAK adalah platform *civic technology* tata kelola bantuan sosial berjenjang yang melayani 5 dusun resmi di Desa Jarak:
1. **Dusun Kalasan** (Kode: `KLS`)
2. **Dusun Sagi** (Kode: `SGI`)
3. **Dusun Jarak Lor** (Kode: `JRL`)
4. **Dusun Jarak Kidul** (Kode: `JRK`)
5. **Dusun Simbar / Kalasan Barat** (Kode: `SMB`)

Sistem mengelola dua kluster bantuan sosial prioritas:
- **Rehabilitasi Rumah Tidak Layak Huni (RTLH)** (Plafon anggaran ~Rp 15.000.000)
- **Pengadaan Alat Bantu Disabilitas** (Kursi Roda CP/Standar, Kruk, Walker, Hearing Aid ~Rp 3.500.000)

---

## ⚡ Status Proyek Saat Ini (Quick Summary)

- **Frontend (React 18 + Vite)**: 
  - Status: **100% Berfungsi sebagai Interactive Client-Side SPA**.
  - Menggunakan state engine internal (`AppContext.jsx`) yang menyimpan seluruh mutasi data ke `localStorage`.
  - Dilengkapi fitur canggih: Geotagging GPS, Tanda Tangan Digital Canvas, Kalkulator RAB dinamis, 5 Dokumen Resmi Kedinasan cetak A4, Panduan Suara Web Speech TTS, dan Simulasi WhatsApp Gateway.
- **Backend (Laravel 11 + SQLite/MySQL)**:
  - Status: **100% Struktur API & Domain Service Siap Operasional**.
  - **15 Migrations DDL**, **5 Database Seeders**, **13 Eloquent Models**, **12 Dedicated Domain Services**, dan **43 RESTful API Endpoints** aktif mencakup:
    - *Autentikasi Produksi Sanctum* dengan proteksi rute berbasis peran (`kades`, `kasi_kesra`, `sekdes`, `kasun`, `admin`).
    - *Modul Panel Pengaturan Administrasi Desa & Audit Log* (`/api/admin/*`): manajemen pamong desa, 5 dusun, pengaturan profil, pembobotan scoring dinamis, dan inspeksi log kepatuhan (FR-020).
    - *Mesin Generator Dokumen PDF Sisi Server* (Barryvdh DomPDF v3.1: Bukti Tanda Terima QR, BAST Digital, dan Laporan SPJ A4).
    - *Dual-Storage Media & Kompresi Citra* (Intervention Image v4.3) terintegrasi dengan *Deep Learning Face Blurring Engine* (OpenCV YuNet 232 KB & TV Mosaic Pixelate).
    - *Mesin Ekspor Dokumen Spreadsheet* (CSV UTF-8 BOM & Excel XML SpreadsheetML) berkinerja tinggi dengan alokasi memori streaming $O(1)$ (< 2MB RAM).
  - **Rangkaian Pengujian Otomatis (*Automated Testing Suite*)**: PHPUnit 11 dengan isolasi database in-memory SQLite (`:memory:`) lulus 100% (*27 tests, 160 assertions*).
  - **Pipeline CI/CD**: Otomasi GitHub Actions dengan Docker multi-stage build, registri GHCR, dan auto-deployment zero-downtime ke VPS.
- **Titik Integrasi (Current Gap)**:
  - Frontend saat ini telah memiliki antarmuka lengkap namun sebagian aksi masih berjalan di atas state reaktif internal `localStorage`. Integrasi pemanggilan langsung jaringan HTTP (`fetch` / `axios`) ke seluruh endpoint backend telah siap dan dipetakan secara detail pada [Dokumen 04](./04-unimplemented-and-gap-analysis.md) dan [Dokumen 08](./08-development-roadmap.md).
