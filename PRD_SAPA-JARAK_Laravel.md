# PRODUCT REQUIREMENTS DOCUMENT (PRD)

# SAPA-JARAK
### Sistem Aspirasi & Bantuan Sosial Trans-Desa

**Platform Transparansi Bantuan Alat Bantu Disabilitas dan Rehabilitasi RTLH Berjenjang 3 Tingkat**

> Pemerintah Desa Jarak, Kecamatan Plosoklaten, Kabupaten Kediri

---

## 1. Product Overview

### 1.1 Nama Produk
**SAPA-JARAK** — Sistem Aspirasi & Bantuan Sosial Trans-Desa

### 1.2 Product Type
Web-based public service platform untuk:
- Pengajuan bantuan sosial masyarakat.
- Pelaporan warga rentan.
- Verifikasi kondisi penerima manfaat.
- Pengelolaan bantuan alat bantu disabilitas.
- Pengelolaan bantuan rehabilitasi Rumah Tidak Layak Huni (RTLH).
- Monitoring status pengajuan.
- Transparansi penggunaan anggaran.
- Dokumentasi pelaksanaan bantuan.
- Pelaporan dan pertanggungjawaban pemerintah desa.

### 1.3 Target Wilayah
Desa Jarak, Kecamatan Plosoklaten, Kabupaten Kediri.

Cakupan dusun:
1. Jarak Lor
2. Jarak Kidul
3. Kalasan
4. Sagi
5. Simbar/Kalasan Barat sesuai nomenklatur administratif resmi.

### 1.4 Masalah yang Diselesaikan
1. Keterbatasan akses warga rentan untuk menyampaikan pengajuan bantuan.
2. Kesenjangan antara laporan masyarakat dan kondisi faktual lapangan.
3. Minimnya transparansi mengenai proses, alokasi, dan realisasi bantuan.

Alur inti:
**Warga/Publik → Kasun → Pemerintah Desa**

---

## 2. Product Vision

Membangun platform pelayanan bantuan sosial desa yang:
- Inklusif.
- Transparan.
- Akuntabel.
- Mudah digunakan.
- Ramah terhadap koneksi internet terbatas.
- Memiliki proses verifikasi berbasis kondisi lapangan.
- Melindungi data pribadi penerima manfaat.

### Product Principles

**Extreme Inclusivity**
- Low-bandwidth UI.
- Mobile-first.
- Kompresi gambar.
- Draft offline/sementara.
- Panduan suara.
- Pengajuan untuk orang lain.

**Three-Level Verification**
```text
WARGA / PUBLIK
       ↓
     KASUN
       ↓
PEMERINTAH DESA
```

**Open Ledger**
Publik dapat melihat perkembangan dan agregat realisasi bantuan tanpa membuka data pribadi penerima.

**Privacy by Design**
Data publik dipisahkan dari data internal yang mengandung data pribadi sensitif.

---

# 3. User Roles

## 3.1 Public / Pelapor
- Mengajukan bantuan untuk dirinya sendiri.
- Mendaftarkan tetangga atau warga lain.
- Melaporkan warga terlantar.
- Mengunggah foto kondisi.
- Memantau status menggunakan nomor tiket.
- Melihat dashboard transparansi publik.

Pengajuan awal tidak memerlukan login kompleks. Verifikasi pengusul menggunakan nomor WhatsApp dan OTP.

## 3.2 Kepala Dusun / Kasun
- Dashboard pengajuan berdasarkan wilayah.
- Notifikasi pengajuan baru.
- Detail pengajuan.
- Form survei lapangan.
- Upload foto hasil survei.
- Geotagging lokasi.
- Penilaian kelayakan.
- Rekomendasi pengajuan.
- Pengembalian pengajuan dengan catatan.
- Forward pengajuan ke pemerintah desa.

## 3.3 Pemerintah Desa
Role internal:
- Kasi Kesejahteraan / Kasi Kesra.
- Sekretaris Desa.
- Kepala Desa.

Fungsi:
- Review hasil verifikasi Kasun.
- Validasi data.
- Pencocokan data kemiskinan.
- Pemeriksaan potensi duplikasi bantuan.
- Menentukan sumber pendanaan.
- Persetujuan bantuan.
- Penetapan penerima.
- Pengelolaan pengadaan.
- Upload BAST.
- Upload dokumentasi pekerjaan.
- Publikasi realisasi bantuan.
- Export laporan SPJ.

---

# 4. Main User Journey

```text
Landing Page
     ↓
Ajukan Bantuan
     ↓
Pilih Jenis Bantuan
     ↓
Pilih Dusun
     ↓
Isi Data Pemohon / Penerima
     ↓
Upload Foto
     ↓
Verifikasi WhatsApp OTP
     ↓
Submit
     ↓
Generate Ticket
     ↓
Tracking Status
```

Contoh tiket:
`#JRK-KLS-2026-009`

---

# 5. Types of Assistance

## 5.1 Bantuan Alat Bantu Disabilitas
Contoh:
- Kursi roda standar.
- Kursi roda cerebral palsy.
- Kruk ketiak.
- Walker.
- Hearing aid.
- Alat bantu adaptif lainnya.

## 5.2 Rehabilitasi RTLH
Contoh material:
- Semen.
- Pasir.
- Asbes/genteng.
- Kalsiboard.
- Material rehabilitasi lain sesuai RAB.

Progress:
`0% → 50% → 100%`

---

# 6. Public Landing Page

Route:
`/`

Components:
- Hero section.
- Penjelasan SAPA-JARAK.
- Tombol "Ajukan Bantuan".
- Tombol "Lacak Pengajuan".
- Tombol "Transparansi Bantuan".
- Statistik bantuan.
- Jenis bantuan.
- Alur pengajuan.
- FAQ.
- Kontak pemerintah desa.

CTA utama:
`Ajukan Bantuan`

CTA sekunder:
`Lacak Pengajuan`

---

# 7. Module: Pengajuan Bantuan

Route:
`/ajukan`

### Step 1 — Jenis Bantuan
- Alat Bantu Disabilitas
- Rehabilitasi RTLH

### Step 2 — Lokasi
- Dusun.
- RT.
- RW.
- Alamat.

### Step 3 — Data Penerima
- Nama penerima.
- NIK.
- No. KK.
- No. WhatsApp.
- Alamat.
- Opsi "Warga Terlantar Tanpa Berkas".

### Step 4 — Kondisi
- Deskripsi kondisi.
- Deskripsi kebutuhan.
- Foto kondisi.
- Informasi tambahan.

### Step 5 — Kontak Pelapor
- Nama pelapor.
- Nomor WhatsApp.
- Hubungan dengan penerima.

### Step 6 — OTP
```text
Masukkan kode OTP
[ _ _ _ _ _ _ ]

Kirim ulang OTP
```

### Step 7 — Submit
Sistem membuat nomor tiket unik.

---

# 8. Module: Tracking Pengajuan

Route:
`/lacak`

Input:
`Nomor Tiket`

Status:
```text
Pengajuan Diterima
        ↓
Menunggu Verifikasi Kasun
        ↓
Kasun Sedang Meninjau Lokasi
        ↓
Direkomendasikan ke Desa
        ↓
Sedang Diverifikasi Desa
        ↓
Menunggu Penetapan Anggaran
        ↓
Bantuan Disetujui
        ↓
Pengadaan / Pengerjaan
        ↓
Menunggu Serah Terima
        ↓
Selesai
```

Status alternatif:
- Dikembalikan dengan Catatan.
- Tidak Memenuhi Kriteria.

Setiap perubahan status dikirim melalui WhatsApp.

---

# 9. Module: Dashboard Kasun

Route:
`/kasun/dashboard`

### Dashboard Overview
- Pengajuan Baru.
- Menunggu Survei.
- Survei Selesai.
- Perlu Ditindaklanjuti.

### Daftar Pengajuan
| Field | Description |
|---|---|
| Ticket | Nomor tiket |
| Pemohon | Nama |
| Jenis Bantuan | RTLH / Disabilitas |
| RT/RW | Lokasi |
| Status | Status proses |
| Tanggal | Tanggal pengajuan |
| Action | Detail |

### Detail
- Data penerima.
- Data pelapor.
- Foto awal.
- Deskripsi kondisi.
- Lokasi.
- Riwayat pengajuan.

Action:
`Mulai Verifikasi`

---

# 10. Module: Survei Lapangan

Kasun menggunakan perangkat mobile.

## RTLH
Parameter:
- Kondisi struktur dinding.
- Kondisi lantai.
- Kondisi atap.
- Kondisi sanitasi.
- Kepemilikan tanah.
- Dokumentasi kondisi.

## Disabilitas
Parameter:
- Tingkat disabilitas.
- Tingkat ketergantungan.
- Kondisi ekonomi.
- Rekomendasi tenaga kesehatan.
- Kebutuhan alat bantu.

### Geotagging
Data:
```text
latitude
longitude
timestamp
foto
user_id
ticket_id
```

Rekomendasi:
- Layak Diteruskan ke Desa.
- Dikembalikan dengan Catatan.

---

# 11. Automatic Eligibility Scoring

## RTLH Score

| Parameter | Bobot |
|---|---:|
| Struktur dinding gedek/bambu | 25% |
| Lantai tanah/semen pecah | 25% |
| Atap rapuh/bocor | 25% |
| Tidak memiliki sanitasi MCK mandiri | 25% |

## Disabilitas Score

| Parameter | Bobot |
|---|---:|
| Tingkat disabilitas / ketergantungan | 40% |
| Kondisi ekonomi keluarga | 30% |
| Rekomendasi tenaga kesehatan Puskesmas | 30% |

> Nilai ambang kelayakan belum ditentukan dalam rancangan awal dan harus ditetapkan bersama Pemerintah Desa sebelum implementasi final.

---

# 12. Government Verification

Route:
`/desa/dashboard`

Metrics:
- Total Pengajuan.
- Menunggu Validasi.
- Layak.
- Tidak Layak.
- Disetujui.
- Dalam Pengadaan.
- Selesai.

### Cross Validation
1. Review rekomendasi Kasun.
2. Validasi identitas.
3. Pencocokan data kemiskinan.
4. Pemeriksaan duplikasi bantuan.
5. Penentuan sumber pendanaan.

Sumber:
- DTKS Kemensos.
- Data Mandiri Kemiskinan Desa Jarak.

---

# 13. Funding Decision

Pilihan:
- APBDes / Dana Desa.
- BKK Kabupaten Kediri.
- Dinsos Kabupaten Kediri.
- BAZNAS Kabupaten Kediri.

Logic:
```text
Jika kuota APBDes tersedia
        ↓
Tetapkan penerima

Jika kuota tidak tersedia
        ↓
Evaluasi kondisi
        ↓
Jika mendesak
        ↓
Eskalasi ke instansi terkait
```

---

# 14. Module: Pengadaan / Pengerjaan

## RTLH
Data:
- RAB.
- Daftar material.
- Volume.
- Harga.
- Total biaya.
- Jadwal pengerjaan.
- Pelaksana.
- Dokumentasi progres.

Progress:
`0% / 50% / 100%`

## Alat Bantu
Data:
- Jenis alat.
- Spesifikasi.
- Ukuran.
- Jumlah.
- Vendor.
- Harga.
- Status pengadaan.

---

# 15. BAST & Completion

Setelah bantuan selesai, admin mengunggah:
- BAST.
- Foto serah terima.
- Kuitansi.
- Nota material.
- Dokumentasi before-after.
- Dokumentasi progres 0%, 50%, 100%.

Kemudian:
`Status = SELESAI`

Data agregat masuk ke dashboard transparansi publik.

---

# 16. Public Transparency Dashboard

Route:
`/transparansi`

### Metrics
- Total Bantuan.
- Penerima Manfaat.
- RTLH.
- Alat Bantu.
- Bantuan Selesai.
- Total realisasi anggaran.

### Public Data
- Nomor bantuan anonim.
- Jenis bantuan.
- Dusun.
- RT.
- Status.
- Total dana.
- Sumber pendanaan.
- Progress.
- Dokumentasi yang dianonimkan.

### Hidden Data
Tidak menampilkan:
- NIK lengkap.
- Nomor KK.
- Nomor WhatsApp.
- Alamat lengkap.
- Wajah penerima.
- Data pribadi sensitif.

Contoh identitas:
`Bpk. S***** — RT 03 — Dusun Kalasan`

---

# 17. Privacy & Security

## Public Data Layer
```text
Ticket
Dusun
RT
Jenis bantuan
Status
Dana agregat
Progress
Dokumentasi teranonim
```

## Internal Data Layer
```text
Nama lengkap
NIK
No. KK
No. WhatsApp
Alamat
GPS
Dokumen administrasi
Dokumen BAST
Invoice
```

### Security Requirements
- Authentication untuk akun internal.
- Role-based access control.
- Authorization berdasarkan role.
- Audit log.
- Validasi file upload.
- Pembatasan ukuran file.
- Sanitasi input.
- Enkripsi data sensitif bila diperlukan.
- Signed/private URL untuk dokumen internal.
- Backup database.
- Rate limiting OTP.
- Session security.

---

# 18. Image Privacy

```text
Original Photo
      ↓
Face Detection
      ↓
Automatic Blur
      ↓
Public Version
```

Foto asli tetap berada pada storage internal.

---

# 19. WhatsApp Notification System

Events:
- Pengajuan diterima.
- Kasun menerima pengajuan.
- Kasun melakukan verifikasi.
- Pengajuan diteruskan ke desa.
- Pengajuan dikembalikan.
- Bantuan disetujui.
- Pengadaan dimulai.
- Bantuan siap disalurkan.
- Bantuan selesai.

---

# 20. SPJ & Reporting Module

Route:
`/desa/laporan`

### Filter
- Periode.
- Dusun.
- Jenis bantuan.
- Sumber dana.
- Status.

### Output
- PDF.
- Excel.

Isi:
- Rekap penerima.
- Total anggaran.
- Sumber dana.
- Rincian bantuan.
- Status.
- Dokumentasi.
- Lampiran 0%, 50%, 100%.
- BAST.

---

# 21. Admin / System Management

Functions:
- User management.
- Role management.
- Dusun management.
- RT/RW management.
- Jenis bantuan.
- Parameter scoring.
- Status workflow.
- Notification settings.
- Public transparency settings.
- Audit log.

---

# 22. Laravel Application Architecture

```text
Frontend
Blade / Livewire / Alpine.js
        │
        ▼
Laravel Application
        │
        ├── Authentication
        ├── Authorization
        ├── Workflow Engine
        ├── Scoring Engine
        ├── Notification Service
        ├── Reporting Service
        └── Public Transparency
        │
        ▼
PostgreSQL
        │
        ├── Application Data
        ├── User Data
        ├── Verification Data
        └── Audit Logs
        │
        ▼
Object Storage
Cloudflare R2 / S3 Compatible
```

---

# 23. Suggested Laravel Structure

```text
app/
├── Models/
│   ├── User.php
│   ├── Village.php
│   ├── Hamlet.php
│   ├── Application.php
│   ├── Beneficiary.php
│   ├── Verification.php
│   ├── Assistance.php
│   ├── Funding.php
│   ├── Procurement.php
│   ├── Handover.php
│   ├── Document.php
│   ├── Notification.php
│   └── AuditLog.php
│
├── Services/
│   ├── ApplicationService.php
│   ├── VerificationService.php
│   ├── ScoringService.php
│   ├── FundingService.php
│   ├── ProcurementService.php
│   ├── TransparencyService.php
│   └── ReportingService.php
│
├── Notifications/
│   └── WhatsAppNotification.php
│
└── Policies/
    ├── ApplicationPolicy.php
    ├── VerificationPolicy.php
    └── DocumentPolicy.php
```

---

# 24. Core Database Entities

## users
```text
id
name
phone
email
password
role
hamlet_id
status
created_at
updated_at
```

## hamlets
```text
id
name
code
status
created_at
updated_at
```

## applications
```text
id
ticket_number
reporter_id
beneficiary_id
assistance_type
hamlet_id
status
description
submitted_at
created_at
updated_at
```

## beneficiaries
```text
id
name
nik
kk_number
phone
address
is_unregistered
created_at
updated_at
```

## verifications
```text
id
application_id
verifier_id
verification_type
latitude
longitude
notes
recommendation
score
verified_at
created_at
updated_at
```

## assistance
```text
id
application_id
type
specification
quantity
estimated_cost
actual_cost
status
created_at
updated_at
```

## funding
```text
id
application_id
source
budget
approved_at
approved_by
status
created_at
updated_at
```

## documents
```text
id
application_id
type
file_path
visibility
uploaded_by
created_at
updated_at
```

## handovers
```text
id
application_id
handover_date
recipient_name
document_path
notes
created_at
updated_at
```

## audit_logs
```text
id
user_id
action
entity_type
entity_id
old_values
new_values
ip_address
created_at
```

---

# 25. Application Status State Machine

```text
DRAFT
  ↓
SUBMITTED
  ↓
WAITING_KASUN_VERIFICATION
  ↓
KASUN_VERIFICATION
  ↓
 ┌─────────────────────┐
 │                     │
 ▼                     ▼
RETURNED            FORWARDED
WITH_NOTES             ↓
                  VILLAGE_REVIEW
                        ↓
                ┌───────┴────────┐
                │                │
                ▼                ▼
             REJECTED         APPROVED
                                  ↓
                              FUNDING
                                  ↓
                             PROCUREMENT
                                  ↓
                              HANDOVER
                                  ↓
                              COMPLETED
```

---

# 26. Functional Requirements

| ID | Requirement | Priority |
|---|---|---|
| FR-001 | Public dapat mengajukan bantuan | Must |
| FR-002 | Public dapat mendaftarkan warga lain | Must |
| FR-003 | OTP WhatsApp | Must |
| FR-004 | Generate nomor tiket otomatis | Must |
| FR-005 | Tracking berdasarkan tiket | Must |
| FR-006 | Kasun menerima pengajuan sesuai dusun | Must |
| FR-007 | Kasun melakukan survei lapangan | Must |
| FR-008 | Upload foto geotagging | Must |
| FR-009 | Automatic eligibility scoring | Must |
| FR-010 | Pemerintah desa melakukan validasi | Must |
| FR-011 | Pemeriksaan duplikasi bantuan | Must |
| FR-012 | Pengelolaan sumber pendanaan | Must |
| FR-013 | Pengelolaan pengadaan | Should |
| FR-014 | Upload BAST | Must |
| FR-015 | Dokumentasi 0/50/100% | Must |
| FR-016 | Public transparency dashboard | Must |
| FR-017 | WhatsApp notification | Must |
| FR-018 | Export PDF | Must |
| FR-019 | Export Excel | Must |
| FR-020 | Audit log | Should |
| FR-021 | Privacy masking | Must |
| FR-022 | Mobile-first UI | Must |
| FR-023 | Draft submission | Should |
| FR-024 | Voice guidance | Should |

---

# 27. Non-Functional Requirements

### Performance
- Mobile-first.
- Lightweight page.
- Optimized image delivery.
- Low-bandwidth friendly.
- Lazy loading dokumentasi.
- Kompresi gambar sebelum upload.

### Security
- HTTPS.
- CSRF protection.
- XSS protection.
- SQL injection protection.
- Rate limiting.
- Role-based authorization.
- Secure file upload.
- Audit logging.

### Availability
Sistem dapat digunakan melalui smartphone maupun desktop oleh masyarakat, Kasun, dan operator desa.

---

# 28. Main Pages

## Public
```text
/
├── /ajukan
├── /lacak
├── /transparansi
├── /tentang
├── /faq
└── /kontak
```

## Kasun
```text
/kasun
├── /dashboard
├── /pengajuan
├── /pengajuan/{ticket}
├── /verifikasi/{ticket}
├── /survei
└── /profil
```

## Government
```text
/desa
├── /dashboard
├── /pengajuan
├── /validasi
├── /penerima
├── /pendanaan
├── /pengadaan
├── /serah-terima
├── /transparansi
├── /laporan
└── /pengaturan
```

---

# 29. UX Requirements

### Mobile First
Target utama pengajuan adalah smartphone.

### Low Bandwidth
- Meminimalkan JavaScript yang tidak diperlukan.
- Mengoptimalkan gambar.
- Pagination.
- Tidak menggunakan video autoplay.
- Loading state ringan.
- Penyimpanan draft.

### Accessibility
- Kontras warna baik.
- Tombol cukup besar.
- Label form jelas.
- Error message mudah dipahami.
- Tidak hanya menggunakan warna sebagai indikator.
- Dukungan screen reader dasar.
- Panduan suara.

---

# 30. Notification Matrix

| Event | Public | Kasun | Desa |
|---|:---:|:---:|:---:|
| Pengajuan baru | ✓ | ✓ | - |
| Survei dimulai | ✓ | ✓ | - |
| Survei selesai | ✓ | - | ✓ |
| Diteruskan ke desa | ✓ | ✓ | ✓ |
| Dikembalikan | ✓ | ✓ | ✓ |
| Disetujui | ✓ | - | ✓ |
| Pengadaan dimulai | ✓ | - | ✓ |
| Bantuan selesai | ✓ | ✓ | ✓ |

---

# 31. Public Transparency Data Model

Contoh:

```json
{
  "ticket": "JRK-KLS-2026-009",
  "beneficiary": "Bpk. S*****",
  "hamlet": "Dusun Kalasan",
  "rt": "03",
  "assistance_type": "RTLH",
  "status": "COMPLETED",
  "funding_source": "APBDes",
  "total_budget": 15000000,
  "progress": 100
}
```

Data berikut tidak boleh dipublikasikan:
- NIK.
- No. KK.
- Phone.
- Exact Address.
- Private GPS.
- Original Documents.

---

# 32. Dashboard Analytics

## Public
- Bantuan berdasarkan jenis.
- Bantuan berdasarkan dusun.
- Bantuan berdasarkan status.
- Realisasi anggaran.
- Jumlah penerima manfaat.
- Progress bantuan.

## Internal
- Pengajuan per Kasun.
- Durasi verifikasi.
- Pengajuan pending.
- Penggunaan anggaran.
- Bantuan berdasarkan sumber dana.
- Pengajuan berpotensi duplikasi.

---

# 33. Acceptance Criteria

### Pengajuan
Given warga membuka halaman pengajuan, when data valid dan OTP berhasil, then sistem membuat nomor tiket unik.

### Tracking
Given pengguna memiliki nomor tiket, when nomor tiket dimasukkan, then sistem menampilkan status dan timeline.

### Kasun Verification
Given ada pengajuan baru di wilayah Kasun, when Kasun membuka dashboard, then pengajuan muncul pada wilayah tersebut.

### Geotagging
Given Kasun melakukan survei, when dokumentasi diunggah, then sistem menyimpan foto beserta metadata lokasi sesuai izin perangkat.

### Scoring
Given parameter penilaian diisi, when hasil verifikasi dikirim, then sistem menghitung skor berdasarkan bobot terkonfigurasi.

### Public Transparency
Given bantuan selesai dan dokumentasi diverifikasi, then data agregat dapat ditampilkan publik tanpa membuka data pribadi sensitif.

---

# 34. Development Roadmap

## Phase 1 — Requirement Assessment
**Week 1–2**
- Requirement final.
- Mapping user.
- Mapping proses bisnis.
- Finalisasi form survei.

## Phase 2 — UI/UX & Prototyping
**Week 3–5**
- User flow.
- Wireframe.
- UI design.
- Database architecture.
- Prototype workflow 3 tingkat.

## Phase 3 — System Development
**Week 6–10**
- Laravel application.
- Database.
- Authentication.
- Public submission.
- Kasun dashboard.
- Government dashboard.
- Scoring.
- WhatsApp Gateway.
- Transparency dashboard.

## Phase 4 — Pilot Testing
**Week 11–13**
Pilot di 1 dusun:
- Public submission.
- OTP.
- Kasun verification.
- Geotagging.
- Scoring.
- Government validation.
- Transparency.

## Phase 5 — Socialization & Launch
**Week 14–16**
- Training operator desa.
- Training 5 Kasun.
- Public socialization.
- Bug fixing.
- Final deployment.
- Official launch.

---

# 35. MVP Scope

## Public
- Landing page.
- Pengajuan bantuan.
- OTP WhatsApp.
- Upload foto.
- Generate ticket.
- Tracking ticket.
- Transparency dashboard.

## Kasun
- Dashboard.
- Daftar pengajuan.
- Detail pengajuan.
- Survei.
- Geotagging.
- Scoring.
- Recommendation.

## Desa
- Dashboard.
- Validasi.
- Funding decision.
- Approval.
- Procurement.
- BAST.
- Public publishing.
- PDF/Excel report.

## System
- Authentication.
- RBAC.
- PostgreSQL.
- File storage.
- WhatsApp notification.
- Audit log.

---

# 36. Future Development

Opsi pengembangan:
- Integrasi API data pemerintah.
- Integrasi sistem Dinsos.
- Integrasi BAZNAS.
- Peta sebaran bantuan.
- Advanced PWA.
- OCR dokumen.
- AI-assisted document verification.
- Duplicate beneficiary detection.
- Predictive budget planning.
- Citizen feedback.
- Public API data agregat.

Fitur di atas bukan requirement inti rancangan awal.

---

# 37. Success Metrics

### Accessibility
Persentase pengajuan yang berhasil diselesaikan.

### Processing Time
- Pengajuan → Verifikasi Kasun.
- Verifikasi Kasun → Keputusan Desa.
- Keputusan → Penyelesaian.

### Transparency
Persentase bantuan selesai yang memiliki dokumentasi publik.

### Accountability
Persentase bantuan dengan BAST lengkap.

### Digital Adoption
Jumlah pengajuan melalui SAPA-JARAK.

### Notification
Persentase perubahan status yang berhasil dikirim melalui WhatsApp.

---

# 38. Definition of Done

- [ ] Public dapat membuat pengajuan.
- [ ] OTP berhasil bekerja.
- [ ] Nomor tiket otomatis dibuat.
- [ ] Public dapat tracking tiket.
- [ ] Kasun dapat melihat pengajuan wilayahnya.
- [ ] Kasun dapat melakukan survei.
- [ ] Foto geotagging tersimpan.
- [ ] Scoring berhasil dihitung.
- [ ] Desa dapat melakukan validasi.
- [ ] Desa dapat menentukan pendanaan.
- [ ] Desa dapat mengubah status bantuan.
- [ ] Dokumentasi dapat diunggah.
- [ ] BAST dapat disimpan.
- [ ] Data selesai muncul di transparency dashboard.
- [ ] Data sensitif tidak muncul di halaman publik.
- [ ] WhatsApp notification berjalan.
- [ ] PDF/Excel report dapat dibuat.
- [ ] Role & permission berjalan.
- [ ] Audit log tersedia.
- [ ] Sistem dapat digunakan melalui smartphone.
- [ ] Pilot test satu dusun berhasil.

---

# 39. Final Product Flow

```text
                    ┌─────────────────┐
                    │   PUBLIC USER   │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ AJUKAN BANTUAN  │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │   OTP WHATSAPP  │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ GENERATE TICKET │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │      KASUN      │
                    │   VERIFIKASI    │
                    └────────┬────────┘
                             │
                     ┌───────┴────────┐
                     │                │
                     ▼                ▼
                 DIKEMBALIKAN     DITERUSKAN
                                      │
                                      ▼
                              ┌─────────────────┐
                              │  PEMERINTAH     │
                              │      DESA       │
                              └────────┬────────┘
                                       │
                                       ▼
                              ┌─────────────────┐
                              │ VALIDASI DATA   │
                              └────────┬────────┘
                                       │
                                       ▼
                              ┌─────────────────┐
                              │ SUMBER DANA     │
                              └────────┬────────┘
                                       │
                                       ▼
                              ┌─────────────────┐
                              │ PENGADAAN /     │
                              │ PENGERJAAN      │
                              └────────┬────────┘
                                       │
                                       ▼
                              ┌─────────────────┐
                              │ BAST + FOTO     │
                              └────────┬────────┘
                                       │
                                       ▼
                              ┌─────────────────┐
                              │    SELESAI      │
                              └────────┬────────┘
                                       │
                                       ▼
                              ┌─────────────────┐
                              │ OPEN LEDGER /   │
                              │ TRANSPARANSI    │
                              └─────────────────┘

                     └──────► WHATSAPP UPDATE
```

---

# 40. Product Summary

SAPA-JARAK merupakan platform digital pelayanan bantuan sosial Desa Jarak dengan mekanisme verifikasi 3 tingkat:

**Publik → Kasun → Pemerintah Desa**

Sistem menggabungkan:

```text
Public Submission
        +
Ticket Tracking
        +
Field Verification
        +
Geotagging
        +
Eligibility Scoring
        +
Funding Management
        +
Procurement
        +
BAST Documentation
        +
WhatsApp Notification
        +
Public Transparency
        +
SPJ Reporting
```

Tujuan akhirnya adalah menciptakan proses bantuan sosial desa yang lebih mudah diakses masyarakat, terdokumentasi pada setiap tahap, dapat diverifikasi secara faktual, dan transparan tanpa membuka data pribadi penerima manfaat.
