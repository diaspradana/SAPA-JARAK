# DESIGN SYSTEM — SAPA-JARAK

## 1. Design Direction

SAPA-JARAK harus terasa seperti **platform layanan publik desa yang modern, terpercaya, manusiawi, dan inklusif** — bukan seperti dashboard pemerintahan yang kaku, dan bukan pula seperti startup fintech.

Arah visual utama:

> **Modern Civic Tech + Warm Local Government + Accessible by Default**

Karakter desain:
- Clean
- Professional
- Human-centered
- Trustworthy
- Calm
- Inclusive
- Lightweight
- Mobile-first
- Tidak berlebihan secara visual

### Prinsip utama

1. **Trust First** — pengguna harus merasa aman saat mengirim data bantuan.
2. **Clarity First** — setiap informasi dan status harus mudah dipahami.
3. **Human First** — bahasa dan visual tidak boleh terasa terlalu teknis.
4. **Transparency** — data bantuan ditampilkan terbuka tetapi tetap menjaga privasi.
5. **Low Bandwidth** — desain tetap nyaman pada koneksi lambat.
6. **Mobile First** — mayoritas proses masyarakat dirancang untuk smartphone.

---

# 2. Visual Personality

Gunakan kombinasi:

```text
Government Service
        +
Modern SaaS
        +
Community / Village
        +
Accessibility
```

Hindari:

- Glassmorphism berlebihan.
- Gradient neon.
- Dashboard dengan terlalu banyak kartu.
- Animasi berlebihan.
- Ilustrasi AI generik.
- Stock photo yang terlalu korporat.
- Efek 3D yang tidak memiliki fungsi.
- Warna terlalu banyak.
- Layout yang terasa seperti admin template.

SAPA-JARAK harus terlihat seperti produk digital yang benar-benar dapat digunakan pemerintah desa dan masyarakat, bukan sekadar prototype lomba.

---

# 3. Color System

## 3.1 Primary Color

Gunakan **Deep Green** sebagai warna identitas utama.

```text
Primary 900  #123B2A
Primary 800  #174C36
Primary 700  #1B6043
Primary 600  #247A53
Primary 500  #2F8F63
Primary 400  #56A97F
Primary 100  #DCEFE5
Primary 50   #F0F8F3
```

Alasan:
- Hijau dekat dengan konteks lingkungan dan masyarakat.
- Memberikan kesan stabil dan terpercaya.
- Tidak terlalu korporat seperti biru pemerintahan.
- Tetap cocok untuk layanan sosial.

## 3.2 Neutral

```text
Neutral 950  #111714
Neutral 900  #1A211D
Neutral 800  #29322D
Neutral 700  #3E4943
Neutral 600  #59645E
Neutral 500  #737D78
Neutral 400  #969F9A
Neutral 300  #CDD3CF
Neutral 200  #E3E7E4
Neutral 100  #F0F2F1
Neutral 50   #F7F8F7
White        #FFFFFF
```

Background utama:

```text
#F7F8F7
```

Card:

```text
#FFFFFF
```

## 3.3 Semantic Colors

### Success

```text
Success 700  #17663F
Success 500  #2F8F63
Success 100  #DDF2E6
```

### Warning

```text
Warning 700  #8A5A00
Warning 500  #C98A16
Warning 100  #FFF1C7
```

### Error

```text
Error 700  #A52A2A
Error 500  #D64545
Error 100  #FDE3E3
```

### Information

```text
Info 700  #205A86
Info 500  #347EAE
Info 100  #E1F0FA
```

---

# 4. Typography

Gunakan **Plus Jakarta Sans** sebagai font utama.

Fallback:

```css
font-family:
  "Plus Jakarta Sans",
  Inter,
  ui-sans-serif,
  system-ui,
  sans-serif;
```

## Type Scale

### Display

```text
48px / 56px
Weight: 700
```

### H1

```text
40px / 48px
Weight: 700
```

### H2

```text
32px / 40px
Weight: 700
```

### H3

```text
24px / 32px
Weight: 600
```

### H4

```text
20px / 28px
Weight: 600
```

### Body Large

```text
18px / 28px
Weight: 400
```

### Body

```text
16px / 24px
Weight: 400
```

### Small

```text
14px / 20px
Weight: 400
```

### Caption

```text
12px / 18px
Weight: 500
```

Jangan menggunakan terlalu banyak ukuran font.

---

# 5. Layout System

## Container

Desktop:

```text
max-width: 1200px
```

Tablet:

```text
padding: 32px
```

Mobile:

```text
padding: 20px
```

## Grid

Desktop:

```text
12-column grid
gap: 24px
```

Tablet:

```text
8-column grid
gap: 20px
```

Mobile:

```text
4-column grid
gap: 16px
```

---

# 6. Spacing Scale

Gunakan sistem 4-point / 8-point.

```text
4px
8px
12px
16px
20px
24px
32px
40px
48px
64px
80px
96px
```

Prioritaskan whitespace daripada menambahkan elemen dekoratif.

---

# 7. Border Radius

Gunakan radius yang cukup modern tetapi tidak terlalu playful.

```text
Small     8px
Medium   12px
Large    16px
XL       20px
Pill     999px
```

Default card:

```text
16px
```

Input:

```text
10px
```

Button:

```text
10px
```

---

# 8. Shadows

Gunakan shadow sangat ringan.

### Card

```css
box-shadow:
  0 1px 3px rgba(16, 24, 20, 0.06);
```

### Elevated

```css
box-shadow:
  0 8px 24px rgba(16, 24, 20, 0.08);
```

Hindari shadow hitam pekat.

---

# 9. Iconography

Gunakan **Lucide Icons**.

Karakter:
- Outline.
- Simple.
- Consistent stroke.
- Tidak menggunakan emoji sebagai icon UI.

Contoh:

```text
Home
FileText
ClipboardCheck
MapPin
HeartHandshake
Accessibility
Building2
WalletCards
Bell
Search
Download
ShieldCheck
```

Icon default:

```text
20px
```

Small:

```text
16px
```

Large:

```text
24–32px
```

---

# 10. Public Website

## 10.1 Header

Desktop:

```text
┌────────────────────────────────────────────────────────────┐
│ SAPA-JARAK       Beranda  Cara Kerja  Transparansi  FAQ    │
│                                            [Lacak] [Ajukan] │
└────────────────────────────────────────────────────────────┘
```

Logo:
- Wordmark SAPA-JARAK.
- Icon sederhana berbasis percakapan + bantuan/community.
- Hindari logo yang terlalu kompleks.

Header:
- White.
- Sticky.
- Border-bottom tipis.
- Tinggi sekitar 72px.

Mobile:
- Logo.
- Menu.
- CTA "Ajukan".

---

# 11. Homepage Hero

Hero tidak boleh terasa seperti landing page SaaS biasa.

### Headline

```text
Bantuan Desa,
Lebih Mudah Dilaporkan.
Lebih Jelas Dipantau.
```

Subheadline:

```text
SAPA-JARAK membantu warga mengajukan bantuan,
memantau proses verifikasi, dan melihat transparansi
realisasi bantuan Desa Jarak.
```

CTA:

```text
[ Ajukan Bantuan ]
[ Lacak Pengajuan ]
```

Tambahkan trust indicator:

```text
✓ Proses berjenjang
✓ Status dapat dipantau
✓ Data pribadi dilindungi
```

---

# 12. Hero Visual

Jangan menggunakan ilustrasi orang generik.

Gunakan visual berupa **realistic civic interface composition**:

```text
        Public Ticket
             ↓
       Kasun Verification
             ↓
       Village Decision
             ↓
        Aid Completed
```

Visual dapat menggunakan:
- Screenshot UI.
- Timeline bantuan.
- Map card.
- Transparency statistics.

Jika memakai image, gunakan foto lokal yang natural dan dokumenter, bukan stock photo dengan pose berlebihan.

---

# 13. Service Cards

Section:

```text
Bantuan yang Dapat Diajukan
```

Dua card utama.

### Alat Bantu Disabilitas

Icon:
`Accessibility`

Copy:

```text
Ajukan kebutuhan alat bantu
untuk warga dengan disabilitas.
```

CTA:

```text
Ajukan bantuan →
```

### Rehabilitasi RTLH

Icon:
`House`

Copy:

```text
Laporkan kebutuhan perbaikan
Rumah Tidak Layak Huni.
```

CTA:

```text
Ajukan bantuan →
```

Card harus sederhana.

---

# 14. How It Works

Section:

```text
Bagaimana SAPA-JARAK Bekerja?
```

Gunakan horizontal timeline desktop dan vertical timeline mobile.

```text
01
Ajukan
   ↓
02
Verifikasi Kasun
   ↓
03
Validasi Desa
   ↓
04
Bantuan Dilaksanakan
   ↓
05
Transparansi
```

Setiap step memiliki:
- Number.
- Icon.
- Judul.
- Deskripsi 1–2 baris.

---

# 15. Tracking Section

Buat section yang sangat prominent.

Background dapat menggunakan Primary 900.

Content:

```text
Lacak Pengajuan Anda

Masukkan nomor tiket untuk melihat
perkembangan pengajuan bantuan.

[ JRK-KLS-2026-009              ]
[ Lacak Pengajuan ]

Contoh: #JRK-KLS-2026-009
```

Jangan meminta user login untuk tracking.

---

# 16. Transparency Preview

Section:

```text
Transparansi Bantuan Desa
```

Tampilkan statistik:

```text
Rp 248 Juta
Total Realisasi

37
Penerima Manfaat

18
RTLH

19
Alat Bantu
```

Kemudian mini chart:

```text
Realisasi Bantuan per Dusun
```

CTA:

```text
Lihat Transparansi Lengkap →
```

---

# 17. Transparency Dashboard

Dashboard publik harus berbeda dengan admin dashboard.

Karakter:
- Lebih editorial.
- Lebih sederhana.
- Fokus pada angka dan informasi publik.
- Tidak terlalu banyak tabel.

Layout:

```text
┌──────────────────────────────────────────┐
│ Transparansi Bantuan Desa Jarak          │
│ Data agregat bantuan dan realisasi       │
└──────────────────────────────────────────┘

┌─────────┐ ┌─────────┐ ┌─────────┐
│ Rp xxx  │ │ 37      │ │ 18      │
│ Dana    │ │ Penerima│ │ RTLH    │
└─────────┘ └─────────┘ └─────────┘

[ Grafik ]              [ Grafik ]

Daftar Bantuan Terbaru
──────────────────────────────────────────
#JRK-KLS-009 | RTLH | Kalasan | Selesai
#JRK-SGI-004 | Alat  | Sagi    | Pengadaan
```

---

# 18. Public Assistance Table

Column:

```text
ID Bantuan
Jenis
Dusun
RT
Status
Realisasi
```

Contoh:

```text
JRK-KLS-009
RTLH
Kalasan
03
Selesai
Rp15.000.000
```

Tidak menampilkan NIK, alamat lengkap, nomor telepon, atau data sensitif.

---

# 19. Application Form UX

Form harus terasa seperti **guided process**, bukan formulir pemerintahan panjang.

Gunakan stepper:

```text
01 Bantuan
02 Lokasi
03 Penerima
04 Kondisi
05 Kontak
06 Verifikasi
```

Progress bar:

```text
━━━━━━━━━━━━━━░░░░
```

### Form Rules

- Satu section per step.
- Jangan menampilkan terlalu banyak field sekaligus.
- Required field harus jelas.
- Error muncul dekat field.
- Jangan reset data ketika terjadi error.
- Autosave draft jika memungkinkan.

---

# 20. Upload Component

Gunakan dropzone/card besar:

```text
┌─────────────────────────────────────┐
│                                     │
│          [ Camera Icon ]             │
│                                     │
│     Tambahkan foto kondisi           │
│     JPG/PNG hingga 5 MB              │
│                                     │
│       [ Pilih Foto ]                 │
│                                     │
└─────────────────────────────────────┘
```

Mobile:

```text
[ Ambil Foto ]
[ Pilih dari Galeri ]
```

Tampilkan preview sebelum submit.

---

# 21. Success Screen

Setelah submit:

```text
✓
Pengajuan Berhasil Dikirim

Nomor Tiket Anda

#JRK-KLS-2026-009

Simpan nomor tiket ini untuk memantau
perkembangan pengajuan.

[ Lacak Pengajuan ]
[ Kembali ke Beranda ]
```

Berikan opsi:
- Copy ticket.
- Share ticket.
- Kirim ulang melalui WhatsApp.

---

# 22. Tracking Timeline UI

Gunakan vertical timeline.

```text
● Selesai
│  18 Sep 2026
│  Bantuan telah diterima penerima.
│
● Serah Terima
│  17 Sep 2026
│  BAST telah dibuat.
│
● Bantuan Disetujui
│  12 Sep 2026
│  Pemerintah Desa menyetujui bantuan.
│
● Verifikasi Kasun
│  10 Sep 2026
│  Kondisi telah diverifikasi di lapangan.
│
○ Pengajuan Diterima
   09 Sep 2026
```

Status aktif menggunakan Primary.

Status pending menggunakan Neutral.

Status rejected menggunakan Error.

---

# 23. Kasun Dashboard

Dashboard internal berbeda secara visual dari public site.

Sidebar desktop:

```text
SAPA-JARAK

Dashboard
Pengajuan
Verifikasi
Survei Lapangan
Riwayat

────────────────

Profil
Keluar
```

Header:

```text
Selamat datang,
Kepala Dusun Kalasan

[Notifikasi] [Avatar]
```

---

# 24. Kasun Dashboard Layout

Top metrics:

```text
┌──────────────┐ ┌──────────────┐
│ 12           │ │ 5            │
│ Pengajuan    │ │ Perlu Survei │
└──────────────┘ └──────────────┘

┌──────────────┐ ┌──────────────┐
│ 4            │ │ 8            │
│ Diverifikasi │ │ Selesai      │
└──────────────┘ └──────────────┘
```

Main section:

```text
Pengajuan Perlu Ditindaklanjuti
```

Gunakan table desktop dan card list mobile.

---

# 25. Verification Workspace

Layout desktop:

```text
┌───────────────────┬─────────────────────────────┐
│ DATA PENGAJUAN    │ SURVEI LAPANGAN             │
│                   │                             │
│ Nama              │ [ Foto ] [ Foto ]           │
│ Jenis Bantuan     │                             │
│ Dusun             │ Lokasi GPS                  │
│                   │                             │
│ Deskripsi         │ [ Buka Peta ]               │
│                   │                             │
│ Foto Awal         │ Skoring                     │
│                   │                             │
└───────────────────┴─────────────────────────────┘

[ Kembalikan ]                  [ Teruskan ke Desa ]
```

Untuk mobile, ubah menjadi stacked layout.

---

# 26. Scoring UI

Jangan membuat scoring terlihat seperti AI black box.

Tampilkan alasan:

```text
SKOR KELAYAKAN

82 / 100

████████████████░░░░

Kondisi Dinding       25/25
Kondisi Lantai        20/25
Kondisi Atap          22/25
Sanitasi              15/25
```

Tambahkan:

```text
Rekomendasi Sistem
Berdasarkan parameter yang diisi.
```

Final decision tetap berada pada petugas yang berwenang.

---

# 27. Government Dashboard

Sidebar:

```text
Dashboard
Pengajuan
Validasi
Penerima Bantuan
Pendanaan
Pengadaan
Serah Terima
Transparansi
Laporan
Pengaturan
```

Dashboard fokus pada:
- workload,
- bottleneck,
- anggaran,
- status bantuan.

---

# 28. Government Dashboard Metrics

```text
Total Pengajuan
128

Menunggu Validasi
14

Disetujui
72

Dalam Pengerjaan
18

Selesai
24
```

Gunakan angka besar dan label singkat.

---

# 29. Funding UI

Gunakan card selection:

```text
Sumber Pendanaan

┌─────────────────────────┐
│ ○ APBDes / Dana Desa    │
│   Tersedia               │
└─────────────────────────┘

┌─────────────────────────┐
│ ○ BKK Kabupaten Kediri  │
└─────────────────────────┘

┌─────────────────────────┐
│ ○ Dinsos                │
└─────────────────────────┘

┌─────────────────────────┐
│ ○ BAZNAS                │
└─────────────────────────┘
```

---

# 30. Procurement UI

Untuk RTLH:

```text
RAB Rehabilitasi

Material        Qty       Harga
Semen           20 sak    Rp...
Pasir           2 m³      Rp...
Genteng         100 pcs   Rp...

Total                    Rp...
```

Progress:

```text
Pekerjaan

● 0%
│
● 50%
│
● 100%
```

---

# 31. BAST / Completion UI

Completion card:

```text
Bantuan Selesai

✓ Dokumentasi 0%
✓ Dokumentasi 50%
✓ Dokumentasi 100%
✓ Foto Serah Terima
✓ BAST
✓ Kuitansi

[ Publikasikan Transparansi ]
```

---

# 32. File & Document UI

Dokumen menggunakan list sederhana.

```text
BAST.pdf
Berita Acara Serah Terima
18 Sep 2026

[ Preview ] [ Download ]
```

Icon berdasarkan tipe file.

Jangan membuat file manager kompleks.

---

# 33. Notification Center

Dropdown:

```text
Notifikasi

● Pengajuan baru #JRK-KLS-009
  5 menit lalu

● Survei #JRK-KLS-004 perlu ditindaklanjuti
  1 jam lalu

● Bantuan #JRK-SGI-002 selesai
  Kemarin

Lihat semua →
```

---

# 34. Status Badge System

Gunakan semantic badge.

```text
Diterima
Neutral / Info

Menunggu
Warning

Diverifikasi
Info

Disetujui
Success

Dalam Pengerjaan
Info

Selesai
Success

Dikembalikan
Warning

Ditolak
Error
```

Jangan mengandalkan warna saja. Selalu sertakan teks.

---

# 35. Button System

## Primary

```text
Background: Primary 700
Text: White
Height: 44px
Radius: 10px
```

Hover:
Primary 800.

## Secondary

```text
Background: White
Border: Neutral 300
Text: Neutral 800
```

## Ghost

Untuk action sekunder.

## Destructive

Digunakan hanya untuk:
- Reject.
- Delete.
- Cancel destructive process.

Jangan menggunakan warna merah untuk action biasa.

---

# 36. Form Inputs

Default:

```text
Height: 46–48px
Radius: 10px
Border: Neutral 300
```

Focus:

```text
Border: Primary 500
Ring: Primary 100
```

Label:
```text
14px
Weight: 600
```

Helper:
```text
13–14px
Neutral 600
```

Error:
```text
13–14px
Error 700
```

---

# 37. Cards

Default card:

```text
Background: White
Border: Neutral 200
Radius: 16px
Padding: 24px
```

Tidak semua informasi harus dibungkus card. Gunakan section dan whitespace jika lebih jelas.

---

# 38. Maps

Untuk geotagging:

```text
┌──────────────────────────────────┐
│                                  │
│          MAP                     │
│             ●                    │
│                                  │
│                                  │
└──────────────────────────────────┘

Lokasi survei
-7.xxxxxx, 112.xxxxxx

[ Buka Maps ]
```

Public dashboard tidak menampilkan koordinat privat secara presisi.

---

# 39. Responsive Behavior

## Desktop ≥ 1024px
- Sidebar dashboard.
- Multi-column form.
- Table.
- Hero split layout.
- Dashboard cards horizontal.

## Tablet 768–1023px
- Sidebar dapat collapse.
- 2-column grid.
- Table tetap responsive.

## Mobile < 768px
- Bottom navigation atau compact menu untuk dashboard.
- Single-column.
- Cards full width.
- Table berubah menjadi list/card.
- Sticky primary CTA.
- Form step-by-step.

---

# 40. Mobile Navigation

Public:

```text
┌─────────────────────────────────────┐
│ Home     Bantuan    Lacak    Menu   │
└─────────────────────────────────────┘
```

Admin:

```text
Dashboard
Pengajuan
Verifikasi
Laporan
More
```

Gunakan hanya jika jumlah navigasi terlalu banyak untuk header.

---

# 41. Empty States

Contoh:

```text
Belum Ada Pengajuan

Saat ini belum ada pengajuan bantuan
yang perlu ditindaklanjuti.

[ Kembali ke Dashboard ]
```

Jangan menggunakan ilustrasi berlebihan.

---

# 42. Loading States

Gunakan skeleton daripada spinner besar.

Contoh:

```text
████████████████
██████████
████████████████████
```

Spinner hanya untuk action singkat.

---

# 43. Error States

Error harus human-readable.

Buruk:
```text
Error 500
```

Lebih baik:
```text
Terjadi kendala saat memuat data.

Silakan coba lagi beberapa saat kemudian.
```

CTA:

```text
[ Coba Lagi ]
```

---

# 44. Accessibility

Minimum requirements:

- WCAG-oriented contrast.
- Keyboard navigation.
- Focus state jelas.
- Semantic HTML.
- Label input eksplisit.
- ARIA hanya bila diperlukan.
- Touch target minimal sekitar 44px.
- Jangan menggunakan warna sebagai satu-satunya indikator.
- Form error dapat dibaca screen reader.
- Reduced motion support.

---

# 45. Motion

Motion harus subtle.

Durasi:

```text
Fast: 120ms
Normal: 200ms
Slow: 300ms
```

Gunakan:
- Fade.
- Slide kecil.
- Expand.
- Progress transition.

Hindari:
- Parallax berat.
- Floating objects.
- Infinite animation.
- Excessive page transitions.

---

# 46. Microcopy

Gunakan bahasa Indonesia yang:
- Sederhana.
- Ramah.
- Tidak terlalu birokratis.
- Tidak terlalu informal.

Contoh:

Buruk:
> Silakan melakukan penginputan data permohonan bantuan sosial.

Lebih baik:
> Isi data berikut untuk mengajukan bantuan.

Buruk:
> Data berhasil diproses.

Lebih baik:
> Pengajuan berhasil dikirim.

Buruk:
> Invalid credentials.

Lebih baik:
> Nomor atau kode OTP tidak sesuai.

---

# 47. Trust Elements

Tambahkan secara natural:

```text
✓ Proses verifikasi berjenjang
✓ Status dapat dipantau
✓ Data pribadi dilindungi
✓ Dokumentasi bantuan terbuka
```

Jangan menggunakan klaim seperti "100% aman" atau "pasti disetujui".

---

# 48. Visual Hierarchy

Urutan perhatian:

```text
1. Primary CTA
2. Status / kondisi penting
3. Main information
4. Supporting information
5. Secondary action
```

Jangan membuat semua button terlihat sama penting.

---

# 49. Dashboard Design Principle

Dashboard bukan tempat untuk memamerkan semua data.

Prioritas:

```text
Apa yang harus saya kerjakan?
        ↓
Apa yang sedang berjalan?
        ↓
Apa yang bermasalah?
        ↓
Apa yang sudah selesai?
```

Setiap role harus melihat dashboard sesuai pekerjaannya.

---

# 50. Public vs Internal Design

## Public

Visual:
- Lebih warm.
- Banyak whitespace.
- Copywriting human.
- Fokus layanan.

## Kasun

Visual:
- Operational.
- Mobile-first.
- Action-oriented.
- Fokus verifikasi lapangan.

## Pemerintah Desa

Visual:
- Data-driven.
- Dense tetapi tetap clean.
- Fokus workflow dan anggaran.

Jangan menggunakan satu layout dashboard untuk semua role.

---

# 51. Recommended Landing Page Structure

```text
Header
   ↓
Hero
   ↓
Trust Indicators
   ↓
Jenis Bantuan
   ↓
Cara Kerja
   ↓
Tracking Pengajuan
   ↓
Transparency Preview
   ↓
FAQ
   ↓
Contact / Government Identity
   ↓
Footer
```

---

# 52. Recommended Dashboard Structure

```text
Sidebar
   ↓
Topbar
   ↓
Page Header
   ↓
Key Metrics
   ↓
Primary Task / Pending Items
   ↓
Recent Activity
   ↓
Analytics
```

---

# 53. Design Tokens

Contoh token CSS:

```css
:root {
  --color-primary-900: #123B2A;
  --color-primary-700: #1B6043;
  --color-primary-500: #2F8F63;
  --color-primary-100: #DCEFE5;
  --color-primary-50: #F0F8F3;

  --color-neutral-950: #111714;
  --color-neutral-800: #29322D;
  --color-neutral-600: #59645E;
  --color-neutral-300: #CDD3CF;
  --color-neutral-200: #E3E7E4;
  --color-neutral-100: #F0F2F1;
  --color-neutral-50: #F7F8F7;

  --color-success: #2F8F63;
  --color-warning: #C98A16;
  --color-error: #D64545;
  --color-info: #347EAE;

  --radius-sm: 8px;
  --radius-md: 10px;
  --radius-lg: 16px;
  --radius-xl: 20px;
  --radius-pill: 999px;

  --container-width: 1200px;

  --shadow-card:
    0 1px 3px rgba(16, 24, 20, 0.06);

  --shadow-elevated:
    0 8px 24px rgba(16, 24, 20, 0.08);
}
```

---

# 54. Component Inventory

## Public
- Header.
- Hero.
- CTA.
- Service Card.
- Step Timeline.
- Tracking Form.
- Transparency Stat.
- Public Table.
- FAQ.
- Footer.

## Form
- Input.
- Select.
- Radio.
- Checkbox.
- OTP Input.
- File Upload.
- Image Preview.
- Stepper.
- Progress Bar.

## Dashboard
- Sidebar.
- Topbar.
- Metric Card.
- Data Table.
- Status Badge.
- Filter.
- Search.
- Notification.
- Activity Timeline.
- Map.
- Score Card.
- Document List.

## Feedback
- Toast.
- Alert.
- Modal.
- Confirmation Dialog.
- Empty State.
- Skeleton.
- Error State.

---

# 55. Recommended Component Behavior

### Toast
Untuk:
- Save success.
- Upload success.
- Status updated.

### Modal
Untuk:
- Confirmation.
- Preview.
- Important decision.

### Drawer
Untuk:
- Mobile detail.
- Filter.
- Quick action.

### Full page
Untuk:
- Form.
- Verification.
- Complex data review.

---

# 56. Design Quality Checklist

Sebelum halaman dianggap selesai:

- [ ] Mobile responsive.
- [ ] Loading state tersedia.
- [ ] Empty state tersedia.
- [ ] Error state tersedia.
- [ ] Success state tersedia.
- [ ] Keyboard accessible.
- [ ] Contrast cukup.
- [ ] Primary CTA jelas.
- [ ] Tidak ada informasi sensitif pada public UI.
- [ ] Form tidak terlalu panjang dalam satu screen.
- [ ] Status menggunakan teks + warna.
- [ ] Semua icon konsisten.
- [ ] Tidak menggunakan emoji sebagai icon.
- [ ] Tidak ada dekorasi yang tidak memiliki fungsi.
- [ ] Low-bandwidth tetap dipertimbangkan.

---

# 57. Overall Design Goal

SAPA-JARAK harus memberikan kesan ketika pertama kali dibuka:

> **"Ini layanan resmi desa, tetapi dibuat dengan standar produk digital modern."**

Bukan:

> "Ini website pemerintah yang penuh tabel."

Dan bukan:

> "Ini template SaaS yang diberi logo desa."

Visual akhir harus berada di tengah:

```text
             TRUST
               ▲
               │
               │
    HUMAN ─────┼───── MODERN
               │
               │
               ▼
          TRANSPARENT
```

**SAPA-JARAK = Modern Civic Service Platform.**
