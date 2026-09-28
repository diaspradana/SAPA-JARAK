# 12. Arsitektur Pipeline CI/CD (Continuous Integration & Continuous Deployment)

Dokumen ini menguraikan spesifikasi teknis, strategi arsitektur, dan panduan konfigurasi alur kerja **CI/CD (*Continuous Integration & Continuous Deployment*)** otomatis untuk platform SAPA-JARAK.

Perancangan pipeline ini disesuaikan secara khusus dengan arsitektur *multi-service* (React Frontend + Laravel 11 Backend + FastAPI AI Microservice + MySQL 8.0) serta batasan infrastruktur server **VPS berspesifikasi 1 vCPU / 1–2 GB RAM**.

---

## 1. Filosofi & Prinsip Rekayasa untuk VPS 1 vCPU

> [!IMPORTANT]
> **Prinsip: "Heavy Lifting in Cloud, Zero Compilation on VPS"**  
> Proses kompilasi aset React (`npm run build`), eksekusi *automated tests* (PHPUnit & Pytest), dan pembangunan lapisan kontainer (*Docker build*) **tidak boleh dijalankan langsung di server VPS desa**. Kompilasi di server kecil akan memicu 100% CPU starvation dan *Out-of-Memory (OOM) Killer* yang dapat mematikan basis data MySQL dan web server.  
> 
> Seluruh proses intensif komputasi dialihkan ke **GitHub Actions Runner** (Cloud runner gratis dengan spesifikasi 2–4 vCPU dan 7GB RAM). Server VPS desa hanya menjalankan *Continuous Deployment* ringan: mengunduh (*pull*) image pre-built yang sudah jadi dan me-restart kontainer secara cepat (< 10 detik).

---

## 2. Diagram Alur Pipeline CI/CD

```mermaid
flowchart TD
    subgraph Dev ["1. Lingkungan Pengembang"]
        GitCommit["Git Commit & Push<br/>(Branch: staging / main)"]
    end

    subgraph CI ["2. GitHub Actions CI (Cloud Runner - High Spec)"]
        direction TB
        subgraph TestFront ["Job: Frontend CI"]
            NPMInstall["npm ci"] --> Lint["ESLint Check"]
            Lint --> ViteBuild["Vite Build Test (dist/)"]
        end

        subgraph TestBack ["Job: Backend CI"]
            CompInstall["composer install"] --> Pint["Laravel Pint / Lint"]
            Pint --> ArtisanTest["php artisan test<br/>(In-Memory SQLite)"]
        end

        subgraph TestAI ["Job: AI Service CI"]
            PyInstall["pip install -r req.txt"] --> TrainTest["python train.py"]
            TrainTest --> YuNetTest["YuNet Smoke Test"]
        end

        subgraph DockerBuild ["Job: Build & Push Images"]
            BuildApp["Build Docker sapa-jarak-app<br/>(Multi-stage Vite + PHP 8.4)"]
            BuildAI["Build Docker sapa-jarak-ai<br/>(FastAPI + OpenCV)"]
            GHCR["Push ke GitHub Container Registry<br/>(ghcr.io/...)"]
        end

        TestFront --> DockerBuild
        TestBack --> DockerBuild
        TestAI --> DockerBuild
    end

    subgraph CD ["3. Continuous Deployment (SSH ke VPS Desa)"]
        SSHConn["SSH via GitHub Secrets<br/>(appleboy/ssh-action)"]
        DockerPull["docker compose pull<br/>(Tarik image siap pakai)"]
        ComposeUp["docker compose up -d<br/>(Restart container)"]
        ArtisanMigrate["docker compose exec app<br/>php artisan migrate --force"]
        CacheWarm["docker compose exec app<br/>php artisan optimize"]
        HealthCheck["Curl Healthcheck<br/>/up & /health (8001)"]
    end

    GitCommit --> CI
    DockerBuild --> CD
    SSHConn --> DockerPull --> ComposeUp --> ArtisanMigrate --> CacheWarm --> HealthCheck
```

---

## 3. Rincian Setiap Tahapan Pipeline

### 3.1 Tahap 1: Pengujian Otomatis (*Continuous Integration - CI*)
Dijalankan secara paralel pada setiap *pull request* atau *push* ke branch pengembangan:

1. **Frontend CI ([`package.json`](../package.json))**:
   - Memasang dependensi Node 20 menggunakan `npm ci`.
   - Menjalankan linter untuk kepatuhan standar kode UI.
   - Menguji kompilasi bundel produksi (`npm run build`) untuk memastikan tidak ada kesalahan impor, dependensi hilang, atau *syntax error* JSX/Tailwind.

2. **Backend CI ([`composer.json`](../composer.json))**:
   - Memasang dependensi Composer PHP 8.4.
   - Menjalankan pengujian fitur (*feature tests*) dan pengujian unit (*unit tests*) menggunakan database SQLite *in-memory*:
     - Kalkulator scoring RTLH & Disabilitas ([`ScoringService.php`](../app/Services/ScoringService.php)).
     - Otorisasi rute Sanctum dan pemisahan hak akses peran Kasun vs Desa ([`CheckUserRole.php`](../app/Http/Middleware/CheckUserRole.php)).
     - Validasi unggah dokumen fisik & engine PDF DomPDF ([`PdfService.php`](../app/Services/PdfService.php) & [`MediaStorageService.php`](../app/Services/MediaStorageService.php)).

3. **AI Assistant CI ([`ml_service/`](../ml_service/))**:
   - Memasang dependensi Python 3.11 (`ml_service/requirements.txt`).
   - Menjalankan verifikasi pelatihan model keputusan ([`train.py`](../ml_service/train.py)).
   - Memverifikasi kesiapan model Deep Learning OpenCV YuNet 232 KB ([`face_blur.py`](../ml_service/face_blur.py)) untuk penyamaran wajah warga.

---

### 3.2 Tahap 2: Pengemasan Kontainer (*Docker Packaging & Registry*)
Hanya dieksekusi jika branch `main` diperbarui dan seluruh pengujian pada Tahap 1 berstatus **LULUS (PASS)**:
- Membangun *image* menggunakan cache GitHub Actions (`type=gha`):
  1. **Aplikasi Utama ([`Dockerfile`](../Dockerfile))**:
     Multi-stage build (Node.js 20 mengompilasi frontend React ➔ disalin ke runtime PHP 8.4-FPM Alpine + Nginx).
  2. **Microservice AI ([`ml_service/Dockerfile`](../ml_service/Dockerfile))**:
     Uvicorn + FastAPI + Scikit-Learn + OpenCV YuNet.
- Mengunggah (*push*) image terkompresi ke **GitHub Container Registry (GHCR)**:
  - `ghcr.io/<owner>/sapa-jarak-app:latest` dan tag SHA commit.
  - `ghcr.io/<owner>/sapa-jarak-ai:latest` dan tag SHA commit.

---

### 3.3 Tahap 3: Deployment Otomatis ke VPS (*Continuous Deployment - CD*)
GitHub Actions melakukan koneksi SSH terenkripsi ke VPS Desa Jarak menggunakan SSH Key dari GitHub Secrets:

1. **Unduh Image Siap Pakai**:
   ```bash
   cd /opt/sapa-jarak
   docker compose pull app ai_assistant
   ```
   *(Hanya mengunduh berkas biner terkompresi ~150–200MB; penggunaan CPU VPS tetap < 5%)*
2. **Restart Kontainer Bertahap**:
   ```bash
   docker compose up -d --remove-orphans app ai_assistant
   ```
3. **Migrasi Database & Pemanasan Cache (*Cache Warming*)**:
   ```bash
   docker compose exec -T app php artisan migrate --force
   docker compose exec -T app php artisan optimize:clear
   docker compose exec -T app php artisan config:cache
   docker compose exec -T app php artisan route:cache
   docker compose exec -T app php artisan view:cache
   ```
4. **Verifikasi Kesiapan Layanan (*Automated Smoke Test*)**:
   ```bash
   docker compose exec -T app curl -f http://localhost/up || exit 1
   docker compose exec -T ai_assistant curl -f http://localhost:8001/health || exit 1
   ```

---

## 4. Konfigurasi Berkas Workflow GitHub Actions

Berkas konfigurasi siap pakai: `.github/workflows/deploy.yml`

```yaml
name: CI/CD Pipeline - SAPA-JARAK

on:
  push:
    branches: [ "main" ]
  pull_request:
    branches: [ "main" ]

env:
  REGISTRY: ghcr.io

jobs:
  # =============================================================
  # 1. Pengujian Frontend React
  # =============================================================
  test-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install Dependencies
        run: npm ci

      - name: Build Verification (Vite)
        run: npm run build

  # =============================================================
  # 2. Pengujian Backend Laravel
  # =============================================================
  test-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: '8.4'
          extensions: mbstring, pdo_sqlite, gd, bcmath, fileinfo
          coverage: none

      - name: Install Composer Dependencies
        run: composer install --prefer-dist --no-interaction --no-progress

      - name: Run PHPUnit Tests
        env:
          DB_CONNECTION: sqlite
          DB_DATABASE: ':memory:'
        run: php artisan test

  # =============================================================
  # 3. Pengujian Microservice AI
  # =============================================================
  test-ai-service:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'
          cache: 'pip'

      - name: Install Python Dependencies
        run: pip install -r ml_service/requirements.txt

      - name: Test Decision Model Training
        run: python ml_service/train.py

      - name: Test YuNet Face Detector Load
        run: |
          python -c "
          import cv2, os
          model = 'ml_service/models/face_detection_yunet_2023mar.onnx'
          assert os.path.exists(model), 'Model YuNet tidak ditemukan'
          detector = cv2.FaceDetectorYN.create(model, '', (320, 320))
          assert detector is not None, 'Gagal memuat YuNet'
          print('YuNet Smoke Test: PASS')
          "

  # =============================================================
  # 4. Pembangunan & Unggah Kontainer ke GHCR
  # =============================================================
  build-and-push:
    needs: [test-frontend, test-backend, test-ai-service]
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Konversi Nama Image ke Huruf Kecil (Lowercase)
        run: |
          REPO_LOWER=$(echo "${{ github.repository }}" | tr '[:upper:]' '[:lower:]')
          echo "APP_IMAGE=ghcr.io/${REPO_LOWER}/app" >> $GITHUB_ENV
          echo "AI_IMAGE=ghcr.io/${REPO_LOWER}/ai" >> $GITHUB_ENV

      - name: Login to GitHub Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Build & Push SAPA-JARAK App Image
        uses: docker/build-push-action@v5
        with:
          context: .
          file: ./Dockerfile
          push: true
          tags: ${{ env.APP_IMAGE }}:latest,${{ env.APP_IMAGE }}:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

      - name: Build & Push SAPA-JARAK AI Image
        uses: docker/build-push-action@v5
        with:
          context: ./ml_service
          file: ./ml_service/Dockerfile
          push: true
          tags: ${{ env.AI_IMAGE }}:latest,${{ env.AI_IMAGE }}:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  # =============================================================
  # 5. Deployment Ringan ke VPS Desa Jarak
  # =============================================================
  deploy:
    needs: [build-and-push]
    runs-on: ubuntu-latest
    steps:
      - name: Konversi Nama Image ke Huruf Kecil (Lowercase)
        run: |
          REPO_LOWER=$(echo "${{ github.repository }}" | tr '[:upper:]' '[:lower:]')
          echo "APP_IMAGE=ghcr.io/${REPO_LOWER}/app:latest" >> $GITHUB_ENV
          echo "AI_IMAGE=ghcr.io/${REPO_LOWER}/ai:latest" >> $GITHUB_ENV

      - name: Execute Deployment Commands on VPS
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          port: ${{ secrets.VPS_SSH_PORT || 22 }}
          envs: APP_IMAGE,AI_IMAGE
          script: |
            set -e
            cd /opt/sapa-jarak
            
            echo "1. Mengautentikasi Docker ke GHCR..."
            echo "${{ secrets.GITHUB_TOKEN }}" | docker login ghcr.io -u ${{ github.actor }} --password-stdin
            
            echo "2. Mengunduh image kontainer terbaru..."
            APP_IMAGE="$APP_IMAGE" AI_IMAGE="$AI_IMAGE" docker compose pull app ai_assistant
            
            echo "3. Me-restart kontainer layanan..."
            APP_IMAGE="$APP_IMAGE" AI_IMAGE="$AI_IMAGE" docker compose up -d app ai_assistant
            
            echo "4. Menjalankan migrasi basis data..."
            docker compose exec -T app php artisan migrate --force
            
            echo "5. Memperbarui cache produksi Laravel..."
            docker compose exec -T app php artisan optimize:clear
            docker compose exec -T app php artisan config:cache
            docker compose exec -T app php artisan route:cache
            docker compose exec -T app php artisan view:cache
            
            echo "6. Menjalankan uji kesehatan layanan (Smoke Test)..."
            docker compose exec -T app curl -f http://localhost/up
            docker compose exec -T ai_assistant curl -f http://localhost:8001/health
            
            echo "Deployment SAPA-JARAK Sukses!"
```

---

## 5. Prasyarat & Pengaturan GitHub Secrets

Untuk mengaktifkan pipeline ini, daftarkan variabel berikut pada menu repository GitHub:  
**Settings ➔ Secrets and variables ➔ Actions ➔ New repository secret**:

| Secret Key | Contoh Nilai | Keterangan |
| :--- | :--- | :--- |
| `VPS_HOST` | `103.123.45.67` | Alamat IP publik VPS Desa Jarak. |
| `VPS_USER` | `root` / `ubuntu` | Pengguna SSH dengan izin akses Docker. |
| `VPS_SSH_KEY` | `-----BEGIN OPENSSH PRIVATE KEY-----...` | Kunci privat SSH tanpa passphrase. |
| `VPS_SSH_PORT` | `22` | Port SSH server (opsional, default 22). |

> [!NOTE]
> File konfigurasi rahasia produksi seperti `.env` (berisi password MySQL, API Key Fonnte WhatsApp, dan `APP_KEY`) **tidak dikelola di GitHub Actions**, melainkan tetap tersimpan secara privat di direktori `/opt/sapa-jarak/.env` pada server VPS demi kepatuhan keamanan data.
