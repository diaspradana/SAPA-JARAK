# Layanan Pengaburan Wajah Otomatis (Privacy AI Face Blurring Service)

Dokumen ini menjelaskan implementasi fitur **Penyamaran Wajah Otomatis (*Face Detection & Automatic Blurring*)** pada microservice FastAPI (`ml_service`) Proyek SAPA-JARAK, dirancang secara khusus agar hemat sumber daya dan dapat berjalan mulus pada **VPS 1 vCPU / 1–2 GB RAM**.

---

## 1. Latar Belakang & Kepatuhan Regulasi

Sesuai dengan amanat **[PRD SAPA-JARAK Seksi 18 (Image Privacy)](../PRD_SAPA-JARAK_Laravel.md)** dan **Undang-Undang Perlindungan Data Pribadi (UU PDP)**:
- Foto dokumentasi warga rentan (kondisi fisik penerima manfaat bansos, warga miskin ekstrem, lansia, dan disabilitas) yang dipublikasikan pada portal transparansi desa **wajib disamarkan wajahnya**.
- Foto asli beresolusi penuh tetap tersimpan di penyimpanan internal (*private storage*) desa dan hanya dapat diakses oleh Kepala Desa dan Kasi Kesra melalui *signed URL*.

```text
Original Photo (Kasun Upload)
          │
          ▼
   Face Detection (Haar Cascades)
          │
          ▼
   Automatic Blur (Elliptical Gaussian Blend)
          │
          ▼
Public Version (Transparency Portal)
```

---

## 2. Mengapa Menggunakan FastAPI Internal vs Layanan Cloud Eksternal?

| Parameter | FastAPI Internal (`ml_service`) | Layanan Eksternal (AWS Rekognition / GCP Vision) |
| :--- | :--- | :--- |
| **Kedaulatan Data & UU PDP** | 🟢 **100% Privat**: Berkas foto warga diproses di jaringan Docker lokal desa, tidak pernah dikirim ke pihak ketiga. | 🔴 **Risiko Kepatuhan**: Mengirim foto warga rentan ke server cloud publik berpotensi melanggar UU PDP. |
| **Biaya Operasional** | 🟢 **Gratis**: Open-source, tanpa biaya langganan bulanan atau kuota API. | 🔴 **Berbayar**: Biaya *pay-per-request* yang membebani APBDes. |
| **Ketergantungan Jaringan** | 🟢 **Offline-Ready**: Tetap berfungsi di server lokal desa tanpa koneksi internet stabil. | 🔴 **Ketergantungan Cloud**: Gagal beroperasi saat internet desa terganggu. |
| **Beban Infrastruktur** | 🟢 **Ultra-ringan**: Berbagi container Python yang sama dengan Decision Support System. | 🟡 Butuh manajemen kunci API, kuota, dan *network latency*. |

---

## 3. Desain Rekayasa untuk VPS 1 vCPU

Lingkungan VPS 1 vCPU memiliki keterbatasan CPU burst dan kapasitas memori (RAM 1–2 GB). Model Deep Learning berbasis PyTorch/TensorFlow (seperti YOLOv8-face atau MTCNN) membutuhkan memori >1 GB dan memakan waktu inferensi 1–3 detik per gambar pada 1 vCPU.

Oleh karena itu, modul [`ml_service/face_blur.py`](../ml_service/face_blur.py) menerapkan prinsip efisiensi ekstrem:

1. **OpenCV Headless Haar Cascades**:
   - Bobot model bawaan hanya ~900 KB (tanpa perlu unduhan eksternal).
   - Penggunaan memori modul Computer Vision **< 40 MB RAM**.
   - Detektor primer: `haarcascade_frontalface_default.xml`.
   - Detektor sekunder: `haarcascade_profileface.xml` (untuk wajah tampak samping).

2. **Downscaled Multi-Scale Inference**:
   - Kamera smartphone modern menghasilkan foto 12MP–48MP (contoh: 4000×3000 piksel).
   - Sistem secara otomatis menurunkan skala gambar ke dimensi maksimal `1024px` **hanya selama proses deteksi wajah** (mereduksi siklus komputasi hingga 90%).
   - Koordinat bounding box wajah dipetakan kembali (*scaled back*) ke resolusi asli.
   - Waktu inferensi deteksi: **15–35 milidetik pada 1 vCPU**.

3. **Soft Elliptical Gaussian Feathering**:
   - Area wajah diperluas secara otomatis (*padding* default 15%) agar mencakup dahi, telinga, garis dagu, dan kontur rambut.
   - Menerapkan masker elips dengan *alpha feathering* halus sehingga transisi antara area blur dan latar belakang foto tetap terlihat estetis dan profesional.

4. **Perlindungan Memori (In-Memory Streaming)**:
   - Pemrosesan dilakukan langsung di RAM melalui buffer NumPy (`cv2.imdecode` & `cv2.imencode`) tanpa *disk I/O thrashing*.
   - Batas maksimal ukuran unggahan: **15 MB** untuk mencegah *Out-of-Memory (OOM)*.

---

## 4. Spesifikasi API

### A. Endpoint: `POST /blur-face`
Menerima berkas gambar dan mengembalikan gambar hasil sensor wajah.

- **URL**: `http://localhost:8001/blur-face` (atau `http://ai_assistant:8001/blur-face` via Docker)
- **Method**: `POST`
- **Content-Type**: `multipart/form-data`
- **Parameter Query (Opsional)**:
  - `blur_strength` *(integer, default: 51)*: Ukuran kernel Gaussian blur (angka ganjil antara 11–151).
  - `padding` *(float, default: 0.15)*: Margin tambahan di sekeliling kotak wajah (0.0–0.5).
  - `return_format` *(string, default: "image")*:
    - `"image"`: Mengembalikan stream biner berkas JPEG langsung.
    - `"json"`: Mengembalikan payload JSON dengan Base64 data URL dan daftar koordinat kotak wajah.

#### Header Respons (Format Biner `image`):
- `Content-Type`: `image/jpeg`
- `X-Faces-Detected`: Jumlah wajah yang terdeteksi dan disamarkan.
- `X-Processing-Time-Ms`: Waktu pemrosesan server dalam milidetik.

#### Contoh Request (cURL Biner):
```bash
curl -X POST "http://localhost:8001/blur-face" \
  -F "file=@/path/to/dokumentasi_warga.jpg" \
  --output dokumentasi_terkaburkan.jpg
```

#### Contoh Request (cURL JSON Payload):
```bash
curl -X POST "http://localhost:8001/blur-face?return_format=json" \
  -F "file=@/path/to/dokumentasi_warga.jpg"
```

Contoh Respons JSON:
```json
{
  "status": "success",
  "faces_detected": 1,
  "processing_time_ms": 32.45,
  "boxes": [
    {"x": 145, "y": 80, "w": 220, "h": 245}
  ],
  "mime_type": "image/jpeg",
  "blurred_image_base64": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
}
```

---

### B. Endpoint: `POST /detect-faces`
Mendeteksi koordinat bounding box wajah tanpa memodifikasi gambar.

- **URL**: `http://localhost:8001/detect-faces`
- **Method**: `POST`
- **Content-Type**: `multipart/form-data`

Contoh Respons:
```json
{
  "status": "success",
  "faces_detected": 1,
  "processing_time_ms": 28.12,
  "image_dimensions": {
    "width": 1920,
    "height": 1080
  },
  "boxes": [
    {"x": 640, "y": 280, "w": 210, "h": 235}
  ]
}
```

---

## 5. Integrasi Backend Laravel (`ImagePrivacyService`)

Di backend Laravel, layanan [`App\Services\ImagePrivacyService`](../app/Services/ImagePrivacyService.php) menyediakan alur penyimpanan ganda:

```php
use App\Services\ImagePrivacyService;

class DocumentController extends Controller
{
    protected ImagePrivacyService $privacyService;

    public function __construct(ImagePrivacyService $privacyService)
    {
        $this->privacyService = $privacyService;
    }

    public function uploadPhoto(Request $request)
    {
        $request->validate([
            'photo' => 'required|image|max:10240', // Max 10MB
        ]);

        // Otomatis simpan foto asli ke storage internal,
        // dan buat versi publik dengan wajah yang sudah dikaburkan
        $result = $this->privacyService->processAndStoreCitizenPhoto(
            $request->file('photo'),
            'rtlh_surveys'
        );

        return response()->json([
            'success' => true,
            'original_path' => $result['original_path'],
            'public_url' => $result['public_url'],
            'faces_anonymized' => $result['faces_detected'],
            'latency_ms' => $result['processing_time_ms'],
        ]);
    }
}
```

---

## 6. Profil Kinerja & Pengujian pada 1 vCPU

Hasil pengujian langsung pada container Docker:
- **Penggunaan Memori Kontainer Penuh**: ~230 MB (termasuk Uvicorn, FastAPI, Scikit-Learn, Pandas, dan OpenCV).
- **Foto Resolusi HD (1920×1080)**: Latensi rata-rata **25–45 milidetik**.
- **Foto Smartphone Resolusi Tinggi (12 MP / 4000×3000)**: Latensi rata-rata **~145 milidetik**.
- **Penggunaan CPU saat Idle**: **0.2% CPU**.
