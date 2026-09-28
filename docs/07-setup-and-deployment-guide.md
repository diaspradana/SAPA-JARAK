# 07. Panduan Instalasi & Penerapan Produksi (Setup & Deployment Guide)

Dokumen ini memandu pengembang (*developer*), perekayasa sistem (*system engineer*), dan administrator desa dalam melakukan instalasi, konfigurasi lingkungan, kompilasi aset antarmuka, serta penerapan (*deployment*) sistem SAPA-JARAK pada server produksi.

---

## 1. Prasyarat Sistem (*System Prerequisites*)

Sebelum memulai instalasi, pastikan server atau komputer pengembangan telah memenuhi spesifikasi minimum:

| Komponen Perangkat Lunak | Versi Minimum | Catatan / Ekstensi yang Wajib Aktif |
|:---|:---|:---|
| **Sistem Operasi** | Linux (Ubuntu 22.04 LTS / Debian 12) / macOS / Windows WSL2 | Disarankan Linux untuk kesesuaian izin berkas SQLite. |
| **PHP** | `8.2.0` ke atas | Ekstensi aktif: `pdo_sqlite`, `pdo_mysql`, `mbstring`, `curl`, `openssl`, `tokenizer`, `xml`, `ctype`, `json`, `bcmath`. |
| **Composer** | `2.x` | Manajer paket dependensi PHP. |
| **Node.js** | `18.x` atau `20.x` LTS | Runtime eksekusi JavaScript & Vite. |
| **NPM** | `9.x` ke atas | Manajer dependensi antarmuka React. |
| **Basis Data** | SQLite (Default) atau MySQL 8.0+ / MariaDB 10.11+ | SQLite bawaan sangat memadai untuk beban 1 desa. |

---

## 2. Panduan Instalasi Lingkungan Pengembangan Lokal (Step-by-Step)

### Langkah 1: Kloning Repositori & Penyiapan File Konfigurasi
```bash
# Pindah ke direktori proyek
cd /path/to/SAPA-JARAK

# Buat salinan file environment dari template
cp .env.example .env

# Generate Application Encryption Key Laravel
php artisan key:generate
```

### Langkah 2: Instalasi Dependensi Backend (PHP / Composer)
```bash
# Mengunduh dan menginstal vendor Laravel
composer install --optimize-autoloader
```

### Langkah 3: Penyiapan Basis Data & Eksekusi Migrasi + Seeders
```bash
# Pastikan file database SQLite telah ada
touch database/database.sqlite

# Jalankan seluruh 12 migrasi DDL dan isi data awal (5 dusun, aparatur, dan tiket sampel)
php artisan migrate:fresh --seed
```

### Langkah 4: Instalasi Dependensi Frontend (Node.js / NPM)
```bash
# Mengunduh dependensi React, Tailwind, Lucide, dan Radix UI
npm install
```

### Langkah 5: Menjalankan Server Pengembangan (2 Terminal Terpisah)

- **Terminal 1: Menjalankan Server Backend API Laravel**
  ```bash
  php artisan serve --port=8000
  ```
  *Server Laravel aktif dan siap melayani rute API di `http://localhost:8000`.*

- **Terminal 2: Menjalankan Server Frontend Vite (Hot Module Replacement)**
  ```bash
  npm run dev
  ```
  *Antarmuka React aktif di `http://localhost:5173` (atau port tertera pada terminal).*

---

## 3. Kompilasi Aset Produksi & Penayangan Satu Pintu (SPA Blade Integration)

Dalam konfigurasi mandiri (*monolithic single-port delivery*), Laravel dapat langsung menyajikan SPA React melalui template Blade ([`resources/views/spa.blade.php`](file:///home/ascension/Projects/SAPA-JARAK/resources/views/spa.blade.php)):

```bash
# 1. Kompilasi bundle produksi frontend ke direktori public/assets/
npm run build

# 2. Salin atau pastikan file build terhubung ke direktori publik
# Seluruh permintaan web non-API akan ditangani oleh fallback route di routes/web.php
```
Akses langsung seluruh sistem melalui satu alamat port Laravel: `http://localhost:8000`.

---

## 4. Akun Uji Coba Bawaan Sistem (*Demo Credentials*)

Seluruh kata sandi (*default password*) untuk akun hasil seeder adalah: **`password`**.

| Nama Aparatur | Jabatan / Peran | Alamat Email Login | Dusun Yurisdiksi |
|:---|:---|:---|:---|
| **Bpk. Kepala Desa Jarak** | Kepala Desa (`kades`) | `kades@jarak-kediri.desa.id` | Seluruh Desa Jarak |
| **Bpk. Sekretaris Desa** | Sekretaris Desa (`sekdes`) | `sekdes@jarak-kediri.desa.id` | Seluruh Desa Jarak |
| **Bpk. Kasi Kesra** | Kasi Kesejahteraan (`kasi_kesra`)| `kesra@jarak-kediri.desa.id` | Seluruh Desa Jarak |
| **Bpk. Suwandi** | Kepala Dusun Kalasan (`kasun`) | `kasun.kalasan@jarak-kediri.desa.id` | Dusun Kalasan (`KLS`) |
| **Bpk. Bambang Sutrisno**| Kepala Dusun Sagi (`kasun`) | `kasun.sagi@jarak-kediri.desa.id` | Dusun Sagi (`SGI`) |
| **Bpk. Agus Prasetyo** | Kepala Dusun Jarak Lor (`kasun`)| `kasun.jaraklor@jarak-kediri.desa.id` | Dusun Jarak Lor (`JRL`) |
| **Bpk. Joko Maryanto** | Kepala Dusun Jarak Kidul (`kasun`)| `kasun.jarakkidul@jarak-kediri.desa.id`| Dusun Jarak Kidul (`JRK`)|
| **Bpk. Eko Wahyudi** | Kepala Dusun Simbar (`kasun`) | `kasun.simbar@jarak-kediri.desa.id` | Dusun Simbar (`SMB`) |

---

## 5. Referensi Variabel Lingkungan (`.env`)

```ini
APP_NAME=SAPA-JARAK
APP_ENV=local
APP_KEY=base64:...
APP_DEBUG=true
APP_TIMEZONE=Asia/Jakarta
APP_URL=http://localhost:8000

APP_LOCALE=id
APP_FALLBACK_LOCALE=en
APP_FAKER_LOCALE=id_ID

LOG_CHANNEL=stack
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=debug

# Konfigurasi Basis Data (Ganti ke 'mysql' untuk server produksi besar)
DB_CONNECTION=sqlite
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=sapa_jarak_db
# DB_USERNAME=root
# DB_PASSWORD=secret

# Integrasi Layanan Gateway WhatsApp (Fonnte / Webhook)
WHATSAPP_GATEWAY_URL=https://api.fonnte.com/send
WHATSAPP_API_TOKEN=mock_token_sapa_jarak_2026
WHATSAPP_SIMULATION_MODE=true
```

---

## 6. Panduan Penerapan di Server Produksi (Production Deployment)

### 6.1 Optimasi Kinerja Laravel (Caching Engine)
Jalankan perintah berikut di server produksi untuk mempercepat pemuatan konfigurasi dan perutean:
```bash
# Cache konfigurasi, rute, dan template blade
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Optimasi autoloader komposer
composer install --no-dev --optimize-autoloader
```

### 6.2 Konfigurasi Izin Berkas (*File Permissions*)
Khusus pada Linux, web server (seperti `www-data` atau `nginx`) harus memiliki izin baca dan tulis ke direktori penyimpanan:
```bash
sudo chown -R www-data:www-data storage bootstrap/cache database
sudo chmod -R 775 storage bootstrap/cache database
sudo chmod 664 database/database.sqlite
```

### 6.3 Contoh Konfigurasi Virtual Host Nginx

```nginx
server {
    listen 80;
    server_name sapa-jarak.desa.id;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name sapa-jarak.desa.id;
    root /var/www/sapa-jarak/public;

    ssl_certificate /etc/letsencrypt/live/sapa-jarak.desa.id/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/sapa-jarak.desa.id/privkey.pem;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    add_header X-XSS-Protection "1; mode=block";

    index index.php index.html;
    charset utf-8;

    # Gzip Compression untuk Performa Koneksi Seluler Rendah
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml image/svg+xml;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```
