# 05. Referensi RESTful API (API Reference)

Dokumentasi ini merinci seluruh endpoint antarmuka pemrograman aplikasi (RESTful API) yang disediakan oleh backend Laravel SAPA-JARAK pada berkas [`routes/api.php`](file:///home/ascension/Projects/SAPA-JARAK/routes/api.php).

---

## 1. Informasi Umum & Header Permintaan

- **Base URL**: `http://localhost:8000/api` (Lingkungan Lokal) atau `https://sapa-jarak.desa.id/api` (Lingkungan Produksi)
- **Header Standar**:
  ```http
  Accept: application/json
  Content-Type: application/json
  ```
- **Format Respon Standar**:
  ```json
  {
    "success": true,
    "message": "Deskripsi pesan status operasi.",
    "data": {}
  }
  ```

---

## 2. Modul Publik & Warga (`/api/public/*`)

### 2.1 Mengambil Daftar Dusun Resmi
Mendapatkan daftar 5 dusun resmi Desa Jarak yang berstatus aktif.

- **Method**: `GET`
- **Endpoint**: `/api/public/hamlets`
- **Autentikasi**: Tidak diperlukan (Publik)
- **Contoh Permintaan cURL**:
  ```bash
  curl -X GET "http://localhost:8000/api/public/hamlets" -H "Accept: application/json"
  ```
- **Respon Sukses (200 OK)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "name": "Kalasan",
        "code": "KLS",
        "leader_name": "Bpk. Suwandi",
        "leader_phone": "0813-8822-1101",
        "rt_count": 6,
        "rw_count": 2,
        "status": "active"
      },
      {
        "id": 2,
        "name": "Sagi",
        "code": "SGI",
        "leader_name": "Bpk. Bambang Sutrisno",
        "leader_phone": "0812-7744-2202",
        "rt_count": 8,
        "rw_count": 2,
        "status": "active"
      }
    ]
  }
  ```

---

### 2.2 Meminta Kode OTP WhatsApp
Menghasilkan kode verifikasi 6 digit yang dikirimkan ke nomor WhatsApp pelapor sebelum mengirimkan formulir bantuan.

- **Method**: `POST`
- **Endpoint**: `/api/public/otp/request`
- **Autentikasi**: Tidak diperlukan
- **Body Permintaan (JSON)**:
  ```json
  {
    "phone": "081234567890",
    "name": "Suryanto"
  }
  ```
- **Respon Sukses (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Kode OTP telah dikirimkan ke nomor WhatsApp 081234567890.",
    "simulation_otp": "481923"
  }
  ```
- **Respon Validasi Gagal (422 Unprocessable Content)**:
  ```json
  {
    "message": "The phone field is required.",
    "errors": {
      "phone": ["The phone field must be at least 9 characters."]
    }
  }
  ```

---

### 2.3 Mengirimkan Formulir Pengajuan Bantuan Sosial
Mendaftarkan permohonan baru, memvalidasi kode OTP, membuat data penerima, menerbitkan nomor tiket unik, dan merekam audit log.

- **Method**: `POST`
- **Endpoint**: `/api/public/applications`
- **Autentikasi**: Tidak diperlukan
- **Body Permintaan (JSON)**:
  ```json
  {
    "beneficiary_name": "Suryanto",
    "nik": "3506121405780001",
    "kk_number": "3506120101150002",
    "beneficiary_phone": "081234567890",
    "hamlet_id": 1,
    "rt": "03",
    "rw": "01",
    "address": "RT 03 / RW 01, Dusun Kalasan, Desa Jarak",
    "is_unregistered": false,
    "assistance_type": "RTLH",
    "reporter_name": "Suryanto",
    "reporter_phone": "081234567890",
    "reporter_relationship": "Diri Sendiri",
    "description": "Dinding anyaman bambu rapuh, lantai tanah basah, dan atap bocor parah.",
    "needs_description": "Perbaikan dinding batako, plester semen lantai, dan genteng.",
    "otp": "481923"
  }
  ```
- **Respon Sukses (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Pengajuan bantuan sosial berhasil dibuat.",
    "data": {
      "ticket_number": "#JRK-KLS-2026-004",
      "status": "SUBMITTED",
      "submitted_at": "2026-09-25T13:10:00.000000Z"
    }
  }
  ```
- **Respon OTP Tidak Valid (422 Unprocessable Content)**:
  ```json
  {
    "success": false,
    "message": "Kode OTP tidak valid atau telah kedaluwarsa."
  }
  ```

---

### 2.4 Melacak Detail Tiket Pengajuan
Mengambil rincian tahapan proses, verifikasi survei, alokasi dana, progres pengerjaan, dan audit log berdasarkan nomor tiket.

- **Method**: `GET`
- **Endpoint**: `/api/public/applications/track/{ticket}`
- **Parameter URL**: `ticket` (contoh: `#JRK-KLS-2026-001` atau `JRK-KLS-2026-001`)
- **Autentikasi**: Tidak diperlukan
- **Respon Sukses (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "ticket_number": "#JRK-KLS-2026-001",
      "assistance_type": "RTLH",
      "status": "COMPLETED",
      "submitted_at": "2026-01-10T08:30:00.000000Z",
      "beneficiary": {
        "id": 1,
        "name": "Bpk. Suryanto",
        "masked_name": "Bpk. S*****",
        "rt": "03",
        "rw": "01",
        "address": "RT 03 / RW 01, Dusun Kalasan"
      },
      "hamlet": {
        "id": 1,
        "name": "Kalasan",
        "code": "KLS"
      },
      "latest_verification": {
        "calculated_score": 92,
        "recommendation": "LAYAK",
        "latitude": -7.904512,
        "longitude": 112.189421,
        "notes": "Struktur rumah sangat rawan roboh. Prioritas penanganan."
      },
      "funding": {
        "source": "APBDES_DANA_DESA",
        "allocated_budget": 15000000,
        "status": "ALLOCATED"
      },
      "procurement": {
        "progress_percentage": 100,
        "total_rab": 15000000
      },
      "handover": {
        "bast_number": "BAST/RTLH/KLS/2026/001",
        "handover_date": "2026-02-20"
      }
    }
  }
  ```
- **Respon Tiket Tidak Ditemukan (404 Not Found)**:
  ```json
  {
    "success": false,
    "message": "Pengajuan dengan nomor tiket #JRK-KLS-999-999 tidak ditemukan dalam sistem."
  }
  ```

---

### 2.5 Mengunduh Bukti Tanda Terima Pendaftaran (Format PDF)
Menghasilkan dan mengunduh berkas fisik PDF resmi (ukuran A4 potret) bukti tanda terima registrasi tiket warga, lengkap dengan kode QR verifikasi status, rincian data pemohon, serta klausul persetujuan pemrosesan data (UU No. 27/2022).

- **Method**: `GET`
- **Endpoint**: `/api/public/applications/{ticket}/pdf`
- **Parameter URL**: `ticket` (contoh: `#JRK-KLS-2026-001` atau `JRK-KLS-2026-001`)
- **Autentikasi**: Tidak diperlukan (Publik)
- **Header Respon Sukses (200 OK)**:
  ```http
  Content-Type: application/pdf
  Content-Disposition: attachment; filename=Tanda_Terima_JRK-KLS-2026-001.pdf
  ```
- **Respon Tiket Tidak Ditemukan (404 Not Found)**:
  ```json
  {
    "success": false,
    "message": "Pengajuan dengan nomor tiket JRK-KLS-999-999 tidak ditemukan."
  }
  ```
- **Contoh Permintaan cURL**:
  ```bash
  curl -X GET "http://localhost:8000/api/public/applications/JRK-KLS-2026-001/pdf" -o "Tanda_Terima.pdf"
  ```

---

### 2.6 Mengambil Metrik Agregat Transparansi Publik
Mendapatkan statistik ringkas untuk kartu KPI dashboard publik.

- **Method**: `GET`
- **Endpoint**: `/api/public/transparency/metrics`
- **Respon Sukses (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "total_applications": 14,
      "total_completed": 8,
      "total_rtlh": 9,
      "total_disability": 5,
      "total_allocated_budget": 142500000,
      "total_realized_budget": 128000000,
      "completion_rate": 57.1
    }
  }
  ```

---

### 2.7 Mengambil Buku Register Transparansi Terbuka (Open Ledger)
Mendapatkan daftar penerima manfaat yang telah disetujui atau selesai dengan identitas teranomisasi (*privacy masking*).

- **Method**: `GET`
- **Endpoint**: `/api/public/transparency/ledger`
- **Query Parameter (Opsional)**:
  - `hamlet_id`: ID Dusun (integer)
  - `assistance_type`: `RTLH` atau `DISABILITAS`
  - `search`: Kata kunci pencarian nomor tiket
  - `per_page`: Jumlah baris per halaman (default 15)
- **Respon Sukses (200 OK)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "ticket_number": "#JRK-KLS-2026-001",
        "masked_beneficiary": "Bpk. S*****",
        "hamlet_name": "Kalasan",
        "rt": "03",
        "assistance_type": "RTLH",
        "status": "COMPLETED",
        "funding_source": "APBDES_DANA_DESA",
        "allocated_budget": 15000000,
        "realized_budget": 15000000,
        "progress": 100,
        "completed_at": "20 Feb 2026"
      }
    ],
    "pagination": {
      "current_page": 1,
      "last_page": 1,
      "total": 1
    }
  }
  ```

---

### 2.8 Mengunduh Rekapitulasi Terbuka Transparansi Publik (Format CSV / Excel)
Menghasilkan dan mengunduh berkas rekapitulasi data transparansi publik bantuan sosial dalam format CSV atau Excel (.xls). Seluruh identitas warga disensor sesuai kepatuhan privasi UU No. 27/2022 (*masked name*).

- **Method**: `GET`
- **Endpoint**: `/api/public/transparency/export`
- **Query Parameter (Opsional)**:
  - `format`: `csv` (default) atau `excel` / `xls`
  - `delimiter`: `,` (default) atau `;` (untuk Excel locale Indonesia)
  - `hamlet_id`: Filter ID dusun
  - `assistance_type`: `RTLH` atau `DISABILITAS`
  - `search`: Kata kunci pencarian nomor tiket
- **Autentikasi**: Tidak diperlukan (Publik)
- **Header Respon Sukses (CSV)**:
  ```http
  Content-Type: text/csv; charset=UTF-8
  Content-Disposition: attachment; filename="Transparansi_Bansos_Desa_Jarak_YYYYMMDD_HHmmss.csv"
  ```
- **Header Respon Sukses (Excel)**:
  ```http
  Content-Type: application/vnd.ms-excel; charset=UTF-8
  Content-Disposition: attachment; filename="Transparansi_Bansos_Desa_Jarak_YYYYMMDD_HHmmss.xls"
  ```
- **Contoh Permintaan cURL**:
  ```bash
  # Unduh format CSV (RFC 4180 dengan UTF-8 BOM)
  curl -X GET "http://localhost:8000/api/public/transparency/export?format=csv" -o "Transparansi_Publik.csv"

  # Unduh format Excel (SpreadsheetML bergaya resmi)
  curl -X GET "http://localhost:8000/api/public/transparency/export?format=excel" -o "Transparansi_Publik.xls"
  ```

---

## 3. Modul Kepala Dusun (`/api/kasun/*`)

### 3.1 Mengambil Antrean Survei Wilayah Kasun
Mendapatkan daftar pengajuan yang perlu disurvei oleh Kepala Dusun setempat.

- **Method**: `GET`
- **Endpoint**: `/api/kasun/queue`
- **Query Parameter**:
  - `hamlet_id`: Filter ID dusun (otomatis terisi jika login sebagai kasun)
  - `status`: Filter status tiket (misal `WAITING_KASUN_VERIFICATION`)
- **Respon Sukses (200 OK)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 2,
        "ticket_number": "#JRK-SGI-2026-002",
        "assistance_type": "DISABILITAS",
        "status": "WAITING_KASUN_VERIFICATION",
        "beneficiary": {
          "name": "Ibu Rumini",
          "rt": "04",
          "rw": "02"
        },
        "hamlet": {
          "name": "Sagi"
        }
      }
    ],
    "counts": {
      "total": 5,
      "waiting_survey": 2,
      "forwarded": 2,
      "returned": 1
    }
  }
  ```

---

### 3.2 Mengirimkan Hasil Survei Lapangan & Scoring Kelayakan
Menyimpan penilaian faktual, koordinat GPS, menghitung skor otomatis, dan menetapkan rekomendasi.

- **Method**: `POST`
- **Endpoint**: `/api/kasun/applications/{id}/survey`
- **Parameter URL**: `id` (ID aplikasi integer)
- **Body Permintaan (JSON)**:
  ```json
  {
    "latitude": -7.908512,
    "longitude": 112.193245,
    "recommendation": "LAYAK",
    "notes": "Kondisi rumah sangat memprihatinkan, atap rawan ambruk saat hujan lebat.",
    "signature_svg": "<svg>...</svg>",
    "parameters": {
      "dinding_rusak": true,
      "lantai_tanah": true,
      "atap_bocor": true,
      "tidak_ada_mck": true
    }
  }
  ```
- **Respon Sukses (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Hasil verifikasi survei lapangan berhasil disimpan dan disinkronkan.",
    "data": {
      "verification_id": 5,
      "score": 100,
      "status": "FORWARDED_TO_VILLAGE"
    }
  }
  ```

---

### 3.3 Rekomendasi Kecerdasan Buatan (AI Decision Support)
Mengambil probabilitas dan rekomendasi kelayakan bantuan secara real-time dari microservice machine learning FastAPI berbasis Random Forest Classifier.

- **Method**: `POST`
- **Endpoint**: `/api/kasun/ai-recommendation`
- **Header Wajib**: `Authorization: Bearer <access_token>`
- **Hak Akses Peran**: `kasun`, `admin`
- **Body Permintaan (JSON)**:
  ```json
  {
    "tanggungan_keluarga": 3,
    "usia_kepala_keluarga": 54,
    "ada_disabilitas_lansia": 0,
    "desil_dtks": 1,
    "daya_listrik_va": 450,
    "pendapatan_bulanan": 650000,
    "kondisi_dinding": "gedek",
    "kondisi_lantai": "tanah",
    "kondisi_atap": "rapuh_bocor",
    "sanitasi_mck": "tidak_ada",
    "status_tanah": "milik_sendiri"
  }
  ```
- **Respon Sukses (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "recommendation": "LAYAK",
      "probability": 0.89,
      "confidence": "HIGH"
    }
  }
  ```

---

### 3.4 Mengunduh Rekapitulasi Antrean Survei Kasun (Format CSV / Excel)
Mengunduh berkas antrean dan hasil verifikasi survei lapangan warga binaan Kepala Dusun. Data otomatis terisolasi pada wilayah kerja dusun masing-masing demi menjaga integritas batas wilayah administratif.

- **Method**: `GET`
- **Endpoint**: `/api/kasun/reports/export`
- **Header Wajib**: `Authorization: Bearer <access_token>`
- **Hak Akses Peran**: `kasun`, `admin`
- **Query Parameter (Opsional)**:
  - `format`: `csv` (default) atau `excel` / `xls`
  - `delimiter`: `,` (default) atau `;`
  - `status`: Filter status pengajuan (misal `WAITING_KASUN_VERIFICATION`, `SUBMITTED`, dll.)
  - `hamlet_id`: Filter dusun (hanya berlaku jika login sebagai admin desa)
- **Header Respon Sukses (CSV)**:
  ```http
  Content-Type: text/csv; charset=UTF-8
  Content-Disposition: attachment; filename="Antrean_Survei_Kasun_Dusun_Kalasan_YYYYMMDD_HHmmss.csv"
  ```
- **Contoh Permintaan cURL**:
  ```bash
  curl -X GET "http://localhost:8000/api/kasun/reports/export?format=excel" \
    -H "Authorization: Bearer <access_token>" \
    -o "Antrean_Kasun_Kalasan.xls"
  ```

---

## 4. Modul Pemerintah Desa (`/api/desa/*`)

### 4.1 Mengambil Ringkasan Dashboard Tata Kelola Desa
Menampilkan rekapitulasi jumlah pengajuan di setiap tahapan pengerjaan.

- **Method**: `GET`
- **Endpoint**: `/api/desa/dashboard`
- **Respon Sukses (200 OK)**:
  ```json
  {
    "success": true,
    "data": [...],
    "counts": {
      "total": 14,
      "need_validation": 3,
      "in_procurement": 2,
      "ready_handover": 1,
      "completed": 8
    }
  }
  ```

---

### 4.2 Validasi Musdes & Penetapan Sumber Pendanaan
Mencatat hasil keputusan musyawarah desa, mengalokasikan pagu anggaran dan rekening pendanaan.

- **Method**: `POST`
- **Endpoint**: `/api/desa/applications/{id}/validate`
- **Parameter URL**: `id`
- **Body Permintaan (JSON)**:
  ```json
  {
    "decision": "APPROVED",
    "source": "APBDes / Dana Desa Jarak",
    "allocated_budget": 15000000,
    "account_code": "02.01.05 Sub-Bidang RTLH",
    "notes": "Disetujui dalam Musdes anggaran tahun 2026."
  }
  ```
- **Respon Sukses (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Keputusan validasi dan pendanaan berhasil dicatat.",
    "status": "APPROVED"
  }
  ```

---

### 4.3 Memperbarui Rencana Anggaran Biaya (RAB) & Progres Pengerjaan
Menyimpan rincian material belanja dan memutakhirkan persentase pengerjaan fisik di lapangan.

- **Method**: `POST`
- **Endpoint**: `/api/desa/applications/{id}/procurement`
- **Parameter URL**: `id`
- **Body Permintaan (JSON)**:
  ```json
  {
    "progress_percentage": 50,
    "contractor_or_vendor": "Swakelola Mandiri Dusun Kalasan",
    "field_notes": "Struktur bata dan cor kolom telah selesai 50%.",
    "rab_items": [
      { "item": "Semen Portland (50kg)", "qty": 25, "unit": "sak", "price": 68000, "total": 1700000 },
      { "item": "Pasir Pasang / Cor", "qty": 3, "unit": "m³", "price": 280000, "total": 840000 }
    ]
  }
  ```
- **Respon Sukses (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Data RAB dan progres pengadaan berhasil disimpan.",
    "data": {
      "progress_percentage": 50,
      "total_rab": 2540000
    },
    "status": "PROCUREMENT_IN_PROGRESS"
  }
  ```

---

### 4.4 Pengesahan Berita Acara Serah Terima (BAST) & Penyelesaian Tiket
Menerbitkan dokumen BAST, menyimpan tanda tangan digital, dan mempublikasikan data ke open ledger.

- **Method**: `POST`
- **Endpoint**: `/api/desa/applications/{id}/handover`
- **Parameter URL**: `id`
- **Body Permintaan (JSON)**:
  ```json
  {
    "bast_number": "BAST/RTLH/KLS/2026/005",
    "handover_date": "2026-09-25",
    "recipient_name": "Bpk. Suryanto",
    "signature_recipient_svg": "<svg>...</svg>",
    "signature_official_svg": "<svg>...</svg>",
    "notes": "Bantuan rehabilitasi rumah telah selesai 100% dan diserahterimakan dalam keadaan baik."
  }
  ```
- **Respon Sukses (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Berita Acara Serah Terima (BAST) berhasil diterbitkan dan status bantuan telah SELESAI.",
    "status": "COMPLETED"
  }
  ```

---

### 4.5 Mengambil Dataset Laporan Pertanggungjawaban SPJ
Menghasilkan rekapitulasi data bantuan yang telah tuntas untuk audit pertanggungjawaban APBDes.

- **Method**: `GET`
- **Endpoint**: `/api/desa/reports/spj`
- **Query Parameter (Opsional)**:
  - `hamlet_id`: Filter ID dusun
  - `year`: Filter tahun penyelesaian (contoh: `2026`)
- **Respon Sukses (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "summary": {
        "total_records": 8,
        "total_expenditure": 128000000
      },
      "records": [
        {
          "no": 1,
          "ticket_number": "#JRK-KLS-2026-001",
          "beneficiary_name": "Bpk. Suryanto",
          "nik": "3506121405780001",
          "hamlet": "Kalasan",
          "assistance_type": "RTLH",
          "funding_source": "APBDES_DANA_DESA",
          "realized_budget": 15000000,
          "bast_number": "BAST/RTLH/KLS/2026/001"
        }
      ]
    }
  }
  ```

---

### 4.6 Mengunduh Dokumen Berita Acara Serah Terima (BAST Format PDF)
Menghasilkan dan mengunduh berkas fisik PDF resmi (ukuran A4 potret) Berita Acara Serah Terima (BAST) untuk pengajuan yang telah diserahterimakan, lengkap dengan identitas penerima manfaat, rincian anggaran APBDes, serta kolom tanda tangan para pihak (Penerima Manfaat, Kasun, Kasi Kesra, dan Kepala Desa).

- **Method**: `GET`
- **Endpoint**: `/api/desa/applications/{id}/bast/pdf`
- **Parameter URL**: `id` (ID permohonan / application)
- **Header Wajib**: `Authorization: Bearer <access_token>`
- **Hak Akses Peran**: `kades`, `kasi_kesra`, `sekdes`, `admin`
- **Header Respon Sukses (200 OK)**:
  ```http
  Content-Type: application/pdf
  Content-Disposition: attachment; filename=BAST_JRK-KLS-2026-001.pdf
  ```
- **Respon Belum BAST (422 Unprocessable Content)**:
  ```json
  {
    "success": false,
    "message": "Dokumen BAST belum diterbitkan untuk pengajuan ini."
  }
  ```
- **Contoh Permintaan cURL**:
  ```bash
  curl -X GET "http://localhost:8000/api/desa/applications/1/bast/pdf" \
    -H "Authorization: Bearer <access_token>" \
    -o "BAST_Dokumen.pdf"
  ```

---

### 4.7 Mengunduh Laporan Realisasi Anggaran SPJ (Format PDF Lanskap)
Menghasilkan dokumen laporan resmi Laporan Pertanggungjawaban Realisasi Anggaran Bantuan Sosial APBDes (ukuran A4 lanskap) yang memuat tabel rekapitulasi realisasi belanja per dusun, sisa pagu, persentase serapan, dan kolom pengesahan Kepala Desa & Tim Pelaksana Kegiatan (TPK).

- **Method**: `GET`
- **Endpoint**: `/api/desa/reports/spj/pdf`
- **Query Parameter (Opsional)**:
  - `hamlet_id`: Filter ID dusun
  - `year`: Filter tahun realisasi anggaran (default tahun berjalan)
- **Header Wajib**: `Authorization: Bearer <access_token>`
- **Hak Akses Peran**: `kades`, `kasi_kesra`, `sekdes`, `admin`
- **Header Respon Sukses (200 OK)**:
  ```http
  Content-Type: application/pdf
  Content-Disposition: attachment; filename=Laporan_SPJ_Bansos_Desa_Jarak_2026.pdf
  ```
- **Contoh Permintaan cURL**:
  ```bash
  curl -X GET "http://localhost:8000/api/desa/reports/spj/pdf?year=2026" \
    -H "Authorization: Bearer <access_token>" \
    -o "Laporan_SPJ_2026.pdf"
  ```

---

### 4.8 Mengunduh Laporan SPJ Realisasi APBDes (Format CSV & Excel SpreadsheetML)
Menghasilkan berkas rekapitulasi realisasi belanja bantuan sosial APBDes berstatus tuntas (`COMPLETED`) dengan alokasi memori streaming O(1) yang aman untuk VPS 1-vCPU. Berkas menyertakan kode rekening, sumber pendanaan, nomor BAST, pagu anggaran, realisasi belanja, sisa pagu, serta baris total kalkulasi resmi.

- **Method**: `GET`
- **Endpoint**:
  - `/api/desa/reports/spj/export` (Bebas memilih parameter `?format=csv|excel`)
  - `/api/desa/reports/spj/excel` (Shortcut unduh langsung format Excel `.xls`)
  - `/api/desa/reports/spj/csv` (Shortcut unduh langsung format CSV `.csv`)
- **Header Wajib**: `Authorization: Bearer <access_token>`
- **Hak Akses Peran**: `kades`, `kasi_kesra`, `sekdes`, `admin`
- **Query Parameter (Opsional)**:
  - `format`: `csv` (default) atau `excel` / `xls`
  - `year`: Filter tahun realisasi (default tahun berjalan, contoh: `2026`)
  - `hamlet_id`: Filter ID dusun
  - `delimiter`: `,` (default) atau `;` (locale Windows Excel Indonesia)
- **Header Respon Sukses (CSV)**:
  ```http
  Content-Type: text/csv; charset=UTF-8
  Content-Disposition: attachment; filename="Laporan_SPJ_Bansos_Desa_Jarak_2026_YYYYMMDD_HHmmss.csv"
  ```
- **Header Respon Sukses (Excel)**:
  ```http
  Content-Type: application/vnd.ms-excel; charset=UTF-8
  Content-Disposition: attachment; filename="Laporan_SPJ_Bansos_Desa_Jarak_2026_YYYYMMDD_HHmmss.xls"
  ```
- **Contoh Permintaan cURL**:
  ```bash
  # Unduh format Excel SpreadsheetML dengan styling tabel resmi
  curl -X GET "http://localhost:8000/api/desa/reports/spj/excel?year=2026" \
    -H "Authorization: Bearer <access_token>" \
    -o "Laporan_SPJ_2026.xls"

  # Unduh format CSV (dengan delimiter titik-koma Excel Indonesia)
  curl -X GET "http://localhost:8000/api/desa/reports/spj/csv?year=2026&delimiter=;" \
    -H "Authorization: Bearer <access_token>" \
    -o "Laporan_SPJ_2026.csv"
  ```

---

### 4.9 Mengunduh Master Register Penerima Bantuan Sosial Desa (Format CSV & Excel)
Menghasilkan master data seluruh usulan dan penerima bantuan sosial untuk kebutuhan arsip internal aparatur desa. Data disajikan secara lengkap (Nama lengkap, NIK, No. KK, No. HP, status DTKS, skor kelayakan, status pengerjaan, dan alokasi dana).

- **Method**: `GET`
- **Endpoint**: `/api/desa/reports/beneficiaries/export`
- **Header Wajib**: `Authorization: Bearer <access_token>`
- **Hak Akses Peran**: `kades`, `kasi_kesra`, `sekdes`, `admin`
- **Query Parameter (Opsional)**:
  - `format`: `csv` (default) atau `excel` / `xls`
  - `delimiter`: `,` (default) atau `;`
  - `status`: Filter status pengajuan (`SUBMITTED`, `APPROVED`, `COMPLETED`, dll.)
  - `assistance_type`: `RTLH` atau `DISABILITAS`
  - `hamlet_id`: Filter ID dusun
  - `year`: Filter tahun pengajuan
- **Header Respon Sukses (CSV)**:
  ```http
  Content-Type: text/csv; charset=UTF-8
  Content-Disposition: attachment; filename="Rekapitulasi_Penerima_Bansos_Desa_Jarak_YYYYMMDD_HHmmss.csv"
  ```
- **Contoh Permintaan cURL**:
  ```bash
  curl -X GET "http://localhost:8000/api/desa/reports/beneficiaries/export?assistance_type=RTLH&format=excel" \
    -H "Authorization: Bearer <access_token>" \
    -o "Master_Penerima_RTLH.xls"
  ```

---

## 5. Modul Autentikasi & Manajemen Sesi (`/api/auth/*`)

### 5.1 Login Resmi Aparatur Desa (Sanctum Token Issuance)
Melakukan verifikasi kredensial email dan kata sandi aparatur desa, serta menerbitkan token akses pribadi (*Personal Access Token*).

- **Method**: `POST`
- **Endpoint**: `/api/auth/login`
- **Autentikasi**: Tidak diperlukan (Publik)
- **Body Permintaan**:
  ```json
  {
    "email": "kades@jarak-kediri.desa.id",
    "password": "password",
    "device_name": "chrome-desktop"
  }
  ```
- **Respon Sukses (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Autentikasi berhasil. Selamat datang, Bpk. Drs. H. Supriyadi (Kepala Desa Jarak).",
    "data": {
      "token_type": "Bearer",
      "access_token": "1|o0CRz3OTRcEdK6f8m6beZJuZUNN0RBNnA0kTUjM35c7f4c9d",
      "user": {
        "id": 4,
        "name": "Bpk. Drs. H. Supriyadi (Kepala Desa Jarak)",
        "email": "kades@jarak-kediri.desa.id",
        "role": "kades",
        "hamlet_id": null
      }
    }
  }
  ```
- **Respon Gagal (401 Unauthorized)**:
  ```json
  {
    "success": false,
    "message": "Kombinasi email dan kata sandi tidak cocok.",
    "errors": {
      "email": ["Kredensial yang Anda masukkan salah."]
    }
  }
  ```

### 5.2 Profil Pengguna Aktif
Mengambil data identitas, peran, dan wilayah tugas aparatur yang sedang login.

- **Method**: `GET`
- **Endpoint**: `/api/auth/me`
- **Header Wajib**: `Authorization: Bearer <access_token>`
- **Respon Sukses (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "id": 4,
      "name": "Bpk. Drs. H. Supriyadi (Kepala Desa Jarak)",
      "email": "kades@jarak-kediri.desa.id",
      "role": "kades",
      "hamlet_id": null,
      "status": "active"
    }
  }
  ```

### 5.3 Mengakhiri Sesi (Logout)
Mencabut (*revoke*) token akses aktif dari database `personal_access_tokens`.

- **Method**: `POST`
- **Endpoint**: `/api/auth/logout`
- **Header Wajib**: `Authorization: Bearer <access_token>`
- **Respon Sukses (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Sesi autentikasi berhasil diakhiri (logout berhasil)."
  }
  ```

### 5.4 Mengambil Daftar Pengguna Demo
- **Method**: `GET`
- **Endpoint**: `/api/auth/users`
- **Deskripsi**: Mengambil daftar seluruh akun aparatur (Kasun, Kades, Kasi Kesra) untuk demonstrasi.

### 5.5 Demo Role Switcher Interaktif
- **Method**: `POST`
- **Endpoint**: `/api/auth/switch-role`
- **Body Permintaan**: `{"role": "kasun"}`
- **Respon**: Mengembalikan profil akun beserta Bearer token yang sah untuk peran terpilih.

---


## 6. Modul Simulasi Kalkulasi Skor Kelayakan (`/api/scoring/*`)
*(Ditambahkan oleh tim di branch `backend-rz`)*

### 6.1 Simulasi Kalkulasi Skor (Dry-Run Preview)
Melakukan simulasi perhitungan skor kelayakan RTLH atau Disabilitas tanpa menyimpan ke database.

- **Method**: `POST`
- **Endpoint**: `/api/scoring/calculate`
- **Autentikasi**: Publik / Kasun
- **Body Permintaan (RTLH)**:
  ```json
  {
    "assistance_type": "RTLH",
    "parameters": {
      "dinding_rusak": true,
      "lantai_tanah": true,
      "atap_bocor": true,
      "tidak_ada_mck": false
    }
  }
  ```
- **Body Permintaan (DISABILITAS)**:
  ```json
  {
    "assistance_type": "DISABILITAS",
    "parameters": {
      "tingkat_disabilitas": 35,
      "kondisi_ekonomi": 25,
      "rekomendasi_nakes": true
    }
  }
  ```
- **Respon Sukses (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Simulasi perhitungan skor kelayakan berhasil dihitung.",
    "data": {
      "assistance_type": "RTLH",
      "total_score": 75,
      "urgency": "TINGGI",
      "is_eligible": true,
      "breakdown": {
        "dinding_bambu_gedek": 25,
        "lantai_tanah_rusak": 25,
        "atap_rapuh_bocor": 25,
        "sanitasi_mck": 0
      }
    }
  }
  ```
- **Respon Validasi Gagal (422 Unprocessable Content)**:
  ```json
  {
    "success": false,
    "message": "Validasi kriteria penilaian gagal.",
    "errors": {
      "parameters.lantai_tanah": [
        "Parameter kondisi lantai wajib disertakan untuk bantuan RTLH."
      ]
    }
  }
  ```

### 6.2 Simulasi Kalkulasi untuk Tiket Permohonan Eksisting
- **Method**: `POST`
- **Endpoint**: `/api/scoring/calculate/{id}`
- **Parameter URL**: `id` (ID permohonan / application)
- **Deskripsi**: Menghitung simulasi skor berdasarkan tipe bantuan permohonan yang ada di database.

---

## 7. Modul Pengelolaan Berkas & Media Storage (`/api/documents/*`)

### 7.1 Mengunggah Berkas Fisik & Foto Dokumentasi
Mengunggah berkas fisik multi-part (`image/jpeg`, `image/png`, `image/webp`, `application/pdf`) dengan kompresi gambar otomatis sisi server (*Intervention Image*) dan deteksi/penyamaran wajah otomatis (*FastAPI Haar Cascades*) untuk foto dokumentasi warga.

- **Method**: `POST`
- **Endpoint**: `/api/documents/upload`
- **Content-Type**: `multipart/form-data`
- **Autentikasi**: Publik (dapat menyertakan Bearer Token aparatur untuk mencatat `uploaded_by`)
- **Body Permintaan (Form-Data)**:
  - `file` *(Wajib)*: Berkas fisik (maksimal 10MB; format JPG, PNG, WEBP, PDF)
  - `document_type` *(Opsional)*: `FOTO_KONDISI_AWAL`, `FOTO_SURVEI_KASUN`, `FOTO_PROGRES_50`, `FOTO_SELESAI_100`, `KTP_KK`, `SURAT_KETERANGAN_DOKTER`, `BAST_SCAN`, `KUITANSI_SPJ` (default: `FOTO_KONDISI_AWAL`)
  - `application_id` *(Opsional)*: ID permohonan bantuan (jika dikaitkan langsung)
  - `ticket_number` *(Opsional)*: Nomor tiket permohonan (contoh: `#JRK-KLS-2026-001`)
  - `visibility` *(Opsional)*: `PUBLIC_MASKED` atau `INTERNAL_ONLY` (Catatan: tipe `KTP_KK` dan `SURAT_KETERANGAN_DOKTER` secara mutlak dipaksa menjadi `INTERNAL_ONLY`)
  - `description` *(Opsional)*: Keterangan deskriptif foto atau dokumen
- **Respon Sukses (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Berkas berhasil diunggah dan diproses ke penyimpanan media.",
    "data": {
      "id": 1,
      "application_id": 1,
      "document_type": "FOTO_KONDISI_AWAL",
      "original_filename": "rumah_retak.jpg",
      "file_size": 9792,
      "formatted_size": "9.6 KB",
      "mime_type": "image/jpeg",
      "visibility": "PUBLIC_MASKED",
      "is_image": true,
      "public_url": "http://localhost:8000/storage/documents/2026/public_edd8ed99.jpg",
      "has_blurred_public_copy": true,
      "created_at": "2026-09-28T13:32:54.000000Z"
    }
  }
  ```
- **Respon Validasi Gagal (422 Unprocessable Content)**:
  ```json
  {
    "message": "The file field must be a file of type: jpeg, jpg, png, webp, pdf.",
    "errors": {
      "file": ["The file field must be a file of type: jpeg, jpg, png, webp, pdf."]
    }
  }
  ```

---

### 7.2 Mengambil Daftar Riwayat Dokumen
Melihat daftar berkas dokumen yang tersimpan dalam sistem dengan paginasi dan filter. Pengguna publik tanpa login hanya menerima dokumen berstatus `PUBLIC_MASKED`.

- **Method**: `GET`
- **Endpoint**: `/api/documents`
- **Query Parameter (Opsional)**:
  - `application_id`: Filter berdasarkan ID permohonan
  - `document_type`: Filter tipe dokumen
  - `visibility`: Filter visibilitas (`PUBLIC_MASKED` / `INTERNAL_ONLY`, khusus aparatur login)
  - `per_page`: Jumlah baris per halaman (default 20)
- **Respon Sukses (200 OK)**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "application_id": 1,
        "document_type": "FOTO_KONDISI_AWAL",
        "original_filename": "rumah_retak.jpg",
        "file_size": 9792,
        "formatted_size": "9.6 KB",
        "mime_type": "image/jpeg",
        "visibility": "PUBLIC_MASKED",
        "public_url": "http://localhost:8000/storage/documents/2026/public_edd8ed99.jpg",
        "uploader": null
      }
    ],
    "pagination": {
      "current_page": 1,
      "per_page": 20,
      "total": 1,
      "last_page": 1
    }
  }
  ```

---

### 7.3 Mengambil Rincian Metadata Berkas
Mengambil informasi lengkap berkas, pengunggah, relasi tiket permohonan, dan status URL publik.

- **Method**: `GET`
- **Endpoint**: `/api/documents/{id}`
- **Parameter URL**: `id` (ID dokumen)
- **Respon Sukses (200 OK)**:
  ```json
  {
    "success": true,
    "data": {
      "id": 1,
      "application_id": 1,
      "document_type": "FOTO_KONDISI_AWAL",
      "original_filename": "rumah_retak.jpg",
      "visibility": "PUBLIC_MASKED",
      "file_size": 9792,
      "formatted_size": "9.6 KB",
      "mime_type": "image/jpeg",
      "public_url": "http://localhost:8000/storage/documents/2026/public_edd8ed99.jpg",
      "application": {
        "id": 1,
        "ticket_number": "#JRK-KLS-2026-001",
        "status": "COMPLETED"
      }
    }
  }
  ```
- **Respon Akses Ditolak untuk Dokumen Internal (401 / 403)**:
  ```json
  {
    "success": false,
    "message": "Dokumen bersifat rahasia/internal. Otentikasi aparatur diperlukan."
  }
  ```

---

### 7.4 Mengunduh atau Streaming Berkas Fisik
Mengambil berkas biner langsung dari penyimpanan server.

- **Method**: `GET`
- **Endpoint**: `/api/documents/{id}/file`
- **Parameter URL**: `id` (ID dokumen)
- **Query Parameter (Opsional)**:
  - `version`: `auto` (default), `public` (salinan tersanitasi), atau `original` (berkas asli internal)
- **Aturan Otorisasi**:
  - Salinan publik (`version=public` atau dokumen `PUBLIC_MASKED`) dapat diakses langsung oleh masyarakat.
  - Berkas asli (`version=original`) atau dokumen `INTERNAL_ONLY` (`KTP_KK`) **wajib menyertakan Bearer Token aparatur desa** (`kades`, `kasi_kesra`, `sekdes`, `admin`, `kasun`).
- **Respon Sukses (200 OK)**:
  Stream biner berkas dengan `Content-Type` yang sesuai (`image/jpeg`, `application/pdf`, dll).

---

### 7.5 Menghapus Dokumen & Berkas Fisik
Menghapus rekaman database dan secara permanen membersihkan berkas fisik dari storage internal dan storage publik.

- **Method**: `DELETE`
- **Endpoint**: `/api/documents/{id}`
- **Header Wajib**: `Authorization: Bearer <access_token>`
- **Hak Akses**: Pemilik unggahan dokumen atau aparatur pengelola desa (`kades`, `kasi_kesra`, `admin`).
- **Respon Sukses (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Dokumen #1 beserta berkas fisiknya berhasil dihapus."
  }
  ```


