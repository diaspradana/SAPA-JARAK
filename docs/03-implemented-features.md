# 03. Fitur yang Telah Diimplementasikan (Implemented Features)

Dokumen ini menyajikan audit menyeluruh terhadap seluruh komponen, modul fungsional, logika bisnis, dan antarmuka yang **telah selesai dibangun dan berfungsi** di dalam repositori SAPA-JARAK.

---

## 1. Modul Publik & Warga (Citizen Portal)

### 1.1 Halaman Beranda Interaktif ([`HomeView.jsx`](file:///home/ascension/Projects/SAPA-JARAK/src/views/public/HomeView.jsx))
- **Hero Section**: Judul kedinasan, penegasan cakupan 5 dusun, dan tombol aksi cepat (*Call to Action*): *Ajukan Bantuan*, *Lacak Pengajuan*, dan *Buku Transparansi*.
- **Service Cards**: Katalog bantuan interaktif yang merinci kriteria penerima, komponen bantuan, dan estimasi pagu untuk kluster RTLH dan Alat Bantu Disabilitas.
- **How It Works**: Visualisasi alur 3 tingkat dari pengajuan, verifikasi kasun, musdes desa, hingga serah terima.
- **Tracking Shortcut**: Kolom input pelacakan tiket langsung dari halaman depan.
- **Transparency Preview**: Cuplikan metrik realisasi anggaran dan rasio penyelesaian bantuan.
- **FAQ Section**: Pertanyaan umum seputar persyaratan warga tanpa berkas, tata cara pelaporan tetangga, dan sumber pembiayaan.
- **Village Contact**: Kontak telepon resmi kantor desa, WhatsApp center, dan jam pelayanan.

### 1.2 Wizard Pengajuan Bantuan 7 Langkah ([`SubmissionWizardView.jsx`](file:///home/ascension/Projects/SAPA-JARAK/src/views/public/SubmissionWizardView.jsx))
Formulir dirancang *mobile-first* dengan pembagian langkah terstruktur untuk mencegah kelelahan pengisian (*form fatigue*):
- **Langkah 1 (Jenis Bantuan)**: Pemilihan kartu interaktif antara *Rehabilitasi RTLH* atau *Alat Bantu Disabilitas*.
- **Langkah 2 (Lokasi Administrasi)**: Dropdown 5 dusun resmi Desa Jarak, isian nomor RT (2 digit), RW (2 digit), dan detail patokan alamat.
- **Langkah 3 (Data Penerima Manfaat)**:
  - Input Nama Lengkap, NIK (16 digit), Nomor KK (16 digit), dan Nomor Telepon.
  - **Fitur Khusus Warga Terlantar**: Opsi centang *"Warga Terlantar / Rentan Tanpa Berkas Kependudukan"*. Jika dicentang, validasi NIK/KK dilewati secara otomatis untuk menjamin prinsip inklusivitas tanpa diskriminasi birokrasi.
- **Langkah 4 (Kondisi & Kebutuhan)**: Deskripsi narasi kondisi rumah/disabilitas dan pengunggah berkas/foto awal multifile dengan *preview* thumbnail.
- **Langkah 5 (Identitas Pelapor / Kuasa Warga)**: Mendukung pelaporan untuk diri sendiri, keluarga, tetangga, atau pengurus RT setempat.
- **Langkah 6 (Verifikasi WhatsApp OTP)**:
  - Simulasi kode OTP 6 digit yang dikirimkan ke nomor WhatsApp pelapor.
  - Dialog interaktif dengan timer kedaluwarsa 10 menit, tombol kirim ulang, dan tombol *Auto-Fill OTP Demo* untuk kemudahan pengujian.
- **Langkah 7 (Penerbitan Tiket Unik)**:
  - Generator otomatis nomor tiket berformat `#JRK-{KODE_DUSUN}-{TAHUN}-{NOMOR_URUT}` (contoh: `#JRK-KLS-2026-009`).
  - Tautan langsung untuk melacak status dan tombol cetak bukti tanda terima A4.

### 1.3 Pelacakan Status Pengajuan Real-Time ([`TrackingDetailView.jsx`](file:///home/ascension/Projects/SAPA-JARAK/src/views/public/TrackingDetailView.jsx))
- **Pencarian Tiket**: Pengguna memasukkan nomor tiket atau langsung diarahkan via query parameter URL `?ticket=#JRK-KLS-2026-001`.
- **Visual Stepper Timeline**: Garis waktu dinamis dengan 9 tahapan status resmi:
  1. Pengajuan Diterima (`SUBMITTED`)
  2. Menunggu Verifikasi Kasun (`WAITING_KASUN`)
  3. Kasun Sedang Meninjau Lokasi (`KASUN_SURVEY`)
  4. Direkomendasikan ke Desa (`FORWARDED_TO_DESA`)
  5. Validasi & Musdes Desa (`VILLAGE_REVIEW`)
  6. Bantuan & Anggaran Disetujui (`FUNDING_APPROVED`)
  7. Pengadaan / Pengerjaan Fisik (`PROCUREMENT`)
  8. Menunggu Serah Terima BAST (`HANDOVER`)
  9. Selesai & Terealisasi (`COMPLETED`)
- **Penanganan Status Khusus**: Status *Dikembalikan dengan Catatan* (`RETURNED`) menampilkan catatan perbaikan dari Kasun; status *Tidak Memenuhi Syarat* (`REJECTED`) menampilkan alasan penolakan Musdes.
- **Kartu Ringkasan Terpadu**: Menampilkan rincian penerima, hasil survei kasun (skor kelayakan), persetujuan pendanaan desa, progres persentase fisik material (0% → 50% → 100%), dan pratinjau dokumen BAST.

### 1.4 Dashboard Transparansi & Buku Kas Terbuka ([`TransparencyView.jsx`](file:///home/ascension/Projects/SAPA-JARAK/src/views/public/TransparencyView.jsx))
- **Kartu KPI Agregat**: Menampilkan Total Pengajuan Masuk, Total Bantuan Terealisasi, Total Alokasi Anggaran, dan Tingkat Keberhasilan Penyaluran (%).
- **Filter Multi-Kriteria**: Penyaringan instan berdasarkan Dusun (Kalasan, Sagi, Jarak Lor, Jarak Kidul, Simbar), Jenis Bantuan (RTLH / Disabilitas), dan pencarian nomor tiket.
- **Tabel Open Ledger Terproteksi**:
  - Penyamaran otomatis identitas penerima (*Privacy Masking*, contoh: `Bpk. S*****`).
  - Menampilkan dusun, RT, jenis bantuan, sumber pendanaan (APBDes/BKK/Dinsos/BAZNAS), pagu biaya, progres pengerjaan, dan tanggal penyelesaian.

---

## 2. Modul Kepala Dusun (Kasun Surveyor Portal)

### 2.1 Dashboard Wilayah Kasun ([`KasunDashboardView.jsx`](file:///home/ascension/Projects/SAPA-JARAK/src/views/kasun/KasunDashboardView.jsx))
- **Isolasi Wilayah Dusun**: Menampilkan antrean permohonan yang hanya berada di bawah yurisdiksi dusun Kasun yang bersangkutan.
- **Kartu Statistik Tugas Lapangan**: Menghitung jumlah permohonan baru, permohonan menunggu survei, survei selesai, dan permohonan yang dikembalikan.
- **Tabel Antrean Verifikasi**: Tombol aksi cepat *Mulai Survei Lapangan* untuk membuka lembar kerja survei.

### 2.2 Lembar Kerja Survei Lapangan Faktual ([`KasunSurveyView.jsx`](file:///home/ascension/Projects/SAPA-JARAK/src/views/kasun/KasunSurveyView.jsx))
- **Geotagging Lokasi GPS ([`MapLocationPicker.jsx`](file:///home/ascension/Projects/SAPA-JARAK/src/components/common/MapLocationPicker.jsx))**:
  - Pengambilan koordinat lintang & bujur (`latitude`, `longitude`) langsung dari sensor GPS ponsel dengan indikator presisi akurasi (meter).
  - Fallback otomatis ke koordinat sentroid dusun jika izin geolokasi peramban dinonaktifkan.
- **Formulir Kriteria Dinamis & Bobot Penilaian**:
  - **Untuk Kluster RTLH**:
    1. Kondisi Dinding: Gedek bambu (25 poin), setengah bata rusak (18 poin), bata retak (10 poin), layak (0 poin).
    2. Kondisi Lantai: Tanah basah (25 poin), semen pecah (18 poin), ubin rusak (10 poin), keramik baik (0 poin).
    3. Kondisi Atap: Rapuh bocor parah (25 poin), reng patah (18 poin), bocor ringan (10 poin), kokoh (0 poin).
    4. Sanitasi MCK: Tidak ada MCK (25 poin), numpang tetangga (18 poin), tidak layak (12 poin), mandiri layak (0 poin).
  - **Untuk Kluster Alat Bantu Disabilitas**:
    1. Derajat Disabilitas: Berat total / lumpuh (40 poin), sedang (30 poin), ringan (18 poin), mandiri (5 poin).
    2. Kerentanan Ekonomi: Desil 1 miskin ekstrem (30 poin), Desil 2 miskin (22 poin), rentan (14 poin), mampu (0 poin).
    3. Rekomendasi Medis: Nakes prioritas (30 poin), bidan desa (22 poin), umum (12 poin), tanpa surat (0 poin).
- **Indikator Visual Skor Kelayakan ([`ScoreMeter.jsx`](file:///home/ascension/Projects/SAPA-JARAK/src/components/common/ScoreMeter.jsx))**:
  - Menghitung total skor (0 - 100) secara reaktif saat opsi dipilih.
  - Memberikan lencana rekomendasi otomatis: *Prioritas Utama Desa (≥70)*, *Memenuhi Kriteria (50-69)*, *Belum Mendesak (<50)*.
- **Unggah Dokumentasi Faktual ([`ImageUploader.jsx`](file:///home/ascension/Projects/SAPA-JARAK/src/components/common/ImageUploader.jsx))**:
  - Mengunggah foto hasil tinjauan kondisi fisik di lokasi pemohon.
- **Keputusan Kasun**:
  - *Rekomendasikan ke Pemerintah Desa*: Meneruskan berkas ke musyawarah desa dengan status `FORWARDED_TO_DESA`.
  - *Kembalikan ke Pelapor dengan Catatan*: Mengubah status menjadi `RETURNED` dan mengirim pesan instruksi perbaikan via WhatsApp ke pelapor.

---

## 3. Modul Tata Kelola Pemerintah Desa (Pemdes Governance Suite)

Dashboard utama Pemerintah Desa ([`DesaDashboardView.jsx`](file:///home/ascension/Projects/SAPA-JARAK/src/views/desa/DesaDashboardView.jsx)) terbagi ke dalam 5 sub-modul fungsional:

### 3.1 Tab Ringkasan & Metrik Pengawasan
- Menyajikan ringkasan eksekutif seluruh data dari 5 dusun.
- Indikator antrean: *Menunggu Validasi Musdes*, *Dalam Pengadaan/Fisik*, *Menunggu BAST*, dan *Bantuan Selesai*.

### 3.2 Tab Validasi Musdes & Penetapan Pendanaan ([`DesaValidationView.jsx`](file:///home/ascension/Projects/SAPA-JARAK/src/views/desa/DesaValidationView.jsx))
- **Telaah Rekomendasi Kasun**: Menampilkan ringkasan hasil skor kelayakan dan koordinat GPS dari Kasun.
- **Validasi Silang DTKS Kemensos**: Verifikasi status desil penerima manfaat (Desil 1 Miskin Ekstrem, Desil 2 Sangat Miskin, Desil 3 Rentan, Desil 4 Menengah Bawah).
- **Pemeriksaan Potensi Duplikasi Bantuan**: Sistem melakukan pengecekan nomor KK dan NIK untuk mencegah satu keluarga menerima bantuan ganda dalam tahun anggaran yang sama.
- **Alokasi Sumber Dana Multi-Pintu**:
  - Pilihan sumber dana resmi: `APBDes / Dana Desa Jarak`, `BKK Kabupaten Kediri`, `Dinas Sosial Kab. Kediri`, `BAZNAS Kab. Kediri`.
  - Input pagu anggaran yang disetujui (contoh: Rp 15.000.000 untuk RTLH).
  - Opsi penolakan dengan catatan pertimbangan Musdes.

### 3.3 Tab Pengadaan & Manajemen RAB Material ([`DesaProcurementView.jsx`](file:///home/ascension/Projects/SAPA-JARAK/src/views/desa/DesaProcurementView.jsx))
- **Kalkulator Rencana Anggaran Biaya (RAB) Dinamis**:
  - Baris item material bawaan (Semen Portland, Pasir Pasang, Bata Merah, Genteng/Asbes, Kalsiboard, Kloset & Pipa Sanitasi, Upah Tukang Swakelola).
  - Kemampuan menambah/menghapus baris material, menyesuaikan volume, satuan, dan harga satuan dengan rekapitulasi subtotal otomatis.
- **Penetapan Pelaksana Pengerjaan**: Pilihan antara *Swakelola Mandiri Warga Desa* atau *Pihak Ketiga / Rekanan Toko Bangunan Desa*.
- **Pemantauan Progres Fisik Bertahap**:
  - Penggeser persentase progres (`0%` → `50%` → `100%`).
  - Kolom pengunggahan dokumentasi progres fisik 50% dan progres fisik 100% (kondisi setelah renovasi rampung).

### 3.4 Tab Serah Terima & Tanda Tangan Digital BAST ([`DesaHandoverView.jsx`](file:///home/ascension/Projects/SAPA-JARAK/src/views/desa/DesaHandoverView.jsx))
- **Penerbitan Nomor Register BAST**: Format resmi kedinasan `BAST/{JENIS}/{KODE_DUSUN}/{TAHUN}` (contoh: `BAST/RTLH/KLS/2026`).
- **Kanvas Tanda Tangan Digital 2D ([`SignaturePad.jsx`](file:///home/ascension/Projects/SAPA-JARAK/src/components/common/SignaturePad.jsx))**:
  - Pembubuhan tanda tangan langsung di layar sentuh ponsel/mouse oleh Penerima Manfaat.
  - Pembubuhan tanda tangan verifikasi oleh Kepala Desa Jarak.
  - Tombol hapus (*clear*) dan simpan vektor tanda tangan.
- **Publikasi Otomatis ke Transparansi Terbuka**:
  - Setelah BAST disahkan, status bantuan berubah menjadi `COMPLETED` dan data agregat langsung tercermin di dashboard transparansi warga.

### 3.5 Tab Laporan Pertanggungjawaban SPJ ([`DesaReportsView.jsx`](file:///home/ascension/Projects/SAPA-JARAK/src/views/desa/DesaReportsView.jsx))
- **Filter Komprehensif**: Filter menurut Dusun, Jenis Bantuan, dan Sumber Pendanaan.
- **Rekapitulasi Anggaran**: Perhitungan otomatis total belanja terealisasi.
- **Ekspor Dokumen CSV/Excel**: Mengunduh seluruh rekapitulasi bantuan dalam format `.csv` dengan penamaan file bertanggal ISO (`Laporan_SPJ_DesaJarak_YYYY-MM-DD.csv`).
- **Tampilan Ramah Cetak A4**: Layout tabel kedinasan siap dicetak sebagai lampiran audit APBDes.

---

## 4. Format Dokumen Kedinasan Resmi ([`OfficialDocumentModal.jsx`](file:///home/ascension/Projects/SAPA-JARAK/src/components/common/OfficialDocumentModal.jsx))

Sistem menyediakan 5 format dokumen kedinasan lengkap dengan kop surat resmi Pemerintah Desa Jarak, nomor surat dinas, tabel rincian, tanda tangan elektronik, stempel digital, dan kode QR verifikasi siap cetak ukuran standar kertas A4:

1. **Tanda Terima Pendaftaran Bantuan (Warga)**: Bukti resmi registrasi tiket warga yang berisi nomor tiket, identitas, waktu submit, dan catatan privasi data.
2. **Surat Rekomendasi Hasil Survei Lapangan (Kasun)**: Memuat koordinat GPS, uraian penilaian kondisi faktual, rincian skor kelayakan, dan rekomendasi tanda tangan Kepala Dusun.
3. **Surat Keputusan (SK) Penetapan Bantuan Musdes (Kades)**: Format surat keputusan Kepala Desa tentang penetapan penerima dan alokasi anggaran APBDes/BKK.
4. **Berita Acara Serah Terima (BAST)**: Berita acara serah terima resmi barang/material/rehabilitasi fisik yang ditandatangani bersama oleh penerima dan Kepala Desa.
5. **Rekapitulasi Realisasi Penyaluran Anggaran (SPJ)**: Lampiran pertanggungjawaban keuangan realisasi program per dusun.

---

## 5. Fitur Aksesibilitas & Simulasi Interaktif

1. **Panduan Suara (*Voice Guidance*) ([`VoiceContext.jsx`](file:///home/ascension/Projects/SAPA-JARAK/src/context/VoiceContext.jsx))**:
   - Membantu warga berkebutuhan khusus dengan membaca petunjuk formulir menggunakan Web Speech API Bahasa Indonesia (`id-ID`).
2. **Pusat Notifikasi WhatsApp & Laci Pesan ([`NotificationDrawer.jsx`](file:///home/ascension/Projects/SAPA-JARAK/src/components/layout/NotificationDrawer.jsx) & [`WhatsAppPreviewModal.jsx`](file:///home/ascension/Projects/SAPA-JARAK/src/components/whatsapp/WhatsAppPreviewModal.jsx))**:
   - Menyimulasikan pengiriman notifikasi WhatsApp secara real-time pada setiap perubahan status tiket.
   - Pop-up simulasi pesan masuk dengan nada visual dan laci (*drawer*) riwayat seluruh notifikasi yang terkirim.
3. **Pengalih Peran Instan (*Interactive Role Switcher*) ([`RoleSwitcher.jsx`](file:///home/ascension/Projects/SAPA-JARAK/src/components/layout/RoleSwitcher.jsx))**:
   - Tombol cepat di bilah navigasi untuk berganti peran antara:
     - *Warga / Pelapor* (Akses publik tanpa login)
     - *Kepala Dusun Kalasan* (Akses survei wilayah Kalasan)
     - *Kepala Desa / Kasi Kesra* (Akses penuh administrasi desa)
4. **Mode Hemat Kuota (*Low-Bandwidth Mode*)**:
   - Tombol penghemat kuota yang mematikan aset grafis berat dan menerapkan styling kontras tinggi.

---

## 6. Implementasi Backend Laravel 11

### 6.1 Basis Data Relasional & Migrasi DDL (12 Tabel)
- `hamlets`: Master 5 dusun resmi (nama, kode, batas wilayah, status).
- `users`: Aparatur desa, kepala dusun, dan administrator sistem.
- `beneficiaries`: Profil penerima manfaat dengan accessor `masked_name`.
- `applications`: Transaksi tiket bansos, pelapor, status, tanggal pengajuan.
- `verifications`: Data survei faktual kasun, skor, geotagging GPS, foto.
- `assistances`: Katalog jenis bantuan dan spesifikasi kebutuhan.
- `fundings`: Alokasi sumber dana APBDes/BKK/Dinsos, pagu anggaran, kode rekening.
- `procurements`: Rincian JSON RAB material, kontraktor, persentase progres.
- `handovers`: Catatan BAST, tanggal serah terima, vektor tanda tangan.
- `documents`: Penyimpanan berkas foto fisik, KTP, dan surat pengantar.
- `notifications`: Rekam jejak pengiriman pesan WhatsApp dan kode OTP.
- `audit_logs`: Log jejak audit kepatuhan (aktor, aksi, alamat IP, perubahan nilai).

### 6.2 Seeders Basis Data Lengkap
- [`HamletSeeder.php`](file:///home/ascension/Projects/SAPA-JARAK/database/seeders/HamletSeeder.php): Mengisi 5 dusun resmi Desa Jarak beserta titik sentroid.
- [`UserSeeder.php`](file:///home/ascension/Projects/SAPA-JARAK/database/seeders/UserSeeder.php): Mengisi 9 akun aparatur (Kades, Sekdes, Kasi Kesra, dan 5 Kepala Dusun).
- [`ApplicationSeeder.php`](file:///home/ascension/Projects/SAPA-JARAK/database/seeders/ApplicationSeeder.php): Mengisi data sampel permohonan dalam berbagai status (`SUBMITTED`, `WAITING_KASUN_VERIFICATION`, `FORWARDED_TO_VILLAGE`, `APPROVED`, `COMPLETED`).

### 6.3 RESTful API Endpoints (16 Rute)
Seluruh 16 rute di `routes/api.php` telah terhubung ke Controller dan Service Layer terkait dengan validasi ketat dan format respon JSON standar.
