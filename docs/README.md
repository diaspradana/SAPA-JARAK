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
| **05** | **RESTful API Reference** | Dokumentasi lengkap 16 endpoint API Laravel (`/api/public/*`, `/api/kasun/*`, `/api/desa/*`, `/api/auth/*`), format payload JSON, parameter, dan respon. | [05-api-reference.md](./05-api-reference.md) |
| **06** | **Database Schema & Data Dictionary** | Diagram ERD Mermaid, struktur 12 tabel SQL, relasi foreign key, tipe data, indeks, dan diagram mesin status (*state machine*). | [06-database-schema.md](./06-database-schema.md) |
| **07** | **Setup & Deployment Guide** | Panduan instalasi dari nol, prasyarat sistem, migrasi & seeder, kompilasi aset Vite, konfigurasi `.env`, dan panduan produksi. | [07-setup-and-deployment-guide.md](./07-setup-and-deployment-guide.md) |
| **08** | **Development Roadmap** | Rencana aksi bertahap (*action plan*) untuk menghubungkan frontend ke API backend, migrasi auth Sanctum produksi, integrasi gateway WhatsApp resmi, dan pengujian otomatis. | [08-development-roadmap.md](./08-development-roadmap.md) |
| **09** | **ML Implementation Roadmap** | Rencana implementasi Machine Learning: DSS Prioritas Kelayakan Bantuan (RandomForest) dan arsitektur microservice FastAPI. | [09-machine-learning-implementation-roadmap.md](./09-machine-learning-implementation-roadmap.md) |
| **10** | **Privacy AI Face Blurring** | Spesifikasi teknis sensor wajah otomatis (*Face Blurring Engine*) berbasis Deep Learning OpenCV YuNet 232 KB & mode Pixelate TV. | [10-face-blur-privacy-service.md](./10-face-blur-privacy-service.md) |
| **11** | **Backend Testing & Scoring** | Dokumentasi pengerjaan tim backend-rz: kalkulator simulasi scoring preview dan implementasi test suite PHPUnit. | [11-team-backend-rz-scoring-and-testing.md](./11-team-backend-rz-scoring-and-testing.md) |
| **12** | **CI/CD Pipeline Architecture** | Arsitektur pipeline CI/CD GitHub Actions: kompilasi cloud runner, registri GHCR, dan deployment otomatis zero-downtime ke VPS 1 vCPU. | [12-ci-cd-pipeline-architecture.md](./12-ci-cd-pipeline-architecture.md) |

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
  - Status: **100% Struktur API & Domain Service Siap**.
  - 12 Migrations DDL, 4 Database Seeders, 12 Eloquent Models, 8 Dedicated Services, dan 16 RESTful API Endpoints telah selesai ditulis dan lolos validasi sintaks.
- **Titik Integrasi (Current Gap)**:
  - Frontend saat ini belum melakukan pemanggilan jaringan (`fetch` / `axios`) langsung ke endpoint backend Laravel; data berjalan melalui state reaktif frontend. Integrasi langsung API telah dipetakan secara detail pada [Dokumen 04](./04-unimplemented-and-gap-analysis.md) dan [Dokumen 08](./08-development-roadmap.md).
