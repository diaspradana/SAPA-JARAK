<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Tanda Terima Registrasi - {{ $application->ticket_number }}</title>
    <style>
        @page {
            size: A4 portrait;
            margin: 1.5cm 1.5cm 1.5cm 1.5cm;
        }
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            font-size: 11pt;
            color: #1e293b;
            line-height: 1.4;
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #047857;
            padding-bottom: 12px;
            margin-bottom: 20px;
        }
        .header h3 {
            margin: 0;
            font-size: 11pt;
            font-weight: normal;
            color: #475569;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .header h1 {
            margin: 4px 0 0 0;
            font-size: 15pt;
            color: #064e3b;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .header p {
            margin: 4px 0 0 0;
            font-size: 9pt;
            color: #64748b;
        }
        .badge-ticket {
            background-color: #ecfdf5;
            border: 1px solid #a7f3d0;
            color: #065f46;
            padding: 8px 16px;
            font-size: 14pt;
            font-weight: bold;
            text-align: center;
            margin: 15px 0 20px 0;
            border-radius: 4px;
        }
        .section-title {
            font-size: 11pt;
            font-weight: bold;
            color: #047857;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 4px;
            margin: 15px 0 10px 0;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        table.data-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
        }
        table.data-table td {
            padding: 5px 8px;
            vertical-align: top;
            font-size: 10pt;
        }
        table.data-table td.label {
            width: 32%;
            color: #475569;
            font-weight: 500;
        }
        table.data-table td.colon {
            width: 3%;
            text-align: center;
        }
        table.data-table td.value {
            width: 65%;
            color: #0f172a;
            font-weight: 600;
        }
        .privacy-box {
            background-color: #f8fafc;
            border-left: 4px solid #059669;
            padding: 10px 14px;
            margin-top: 20px;
            font-size: 8.5pt;
            color: #475569;
            line-height: 1.4;
        }
        .signatures {
            margin-top: 30px;
            width: 100%;
        }
        .signatures table {
            width: 100%;
        }
        .signatures td {
            width: 50%;
            text-align: center;
            font-size: 9.5pt;
        }
        .sig-space {
            height: 60px;
        }
        .footer {
            margin-top: 25px;
            text-align: center;
            font-size: 8pt;
            color: #94a3b8;
            border-top: 1px dashed #cbd5e1;
            padding-top: 8px;
        }
    </style>
</head>
<body>

    <div class="header">
        <h3>Pemerintah Kabupaten Kediri &bull; Kecamatan Plosoklaten</h3>
        <h1>Pemerintah Desa Jarak</h1>
        <p>Jl. Raya Jarak No. 12, Desa Jarak, Kec. Plosoklaten, Kab. Kediri, Jawa Timur 64175 &bull; Posko SAPA-JARAK</p>
    </div>

    <div style="text-align: center; font-size: 12pt; font-weight: bold; text-transform: uppercase; color: #1e293b;">
        Tanda Terima Pendaftaran Bantuan Sosial
    </div>

    <div class="badge-ticket">
        NO. TIKET: {{ $application->ticket_number }}
    </div>

    <div class="section-title">1. Data Calon Penerima Manfaat</div>
    <table class="data-table">
        <tr>
            <td class="label">Nama Lengkap</td>
            <td class="colon">:</td>
            <td class="value">{{ $application->beneficiary->name }}</td>
        </tr>
        <tr>
            <td class="label">Nomor Induk Kependudukan (NIK)</td>
            <td class="colon">:</td>
            <td class="value">{{ substr($application->beneficiary->nik, 0, 6) }}******{{ substr($application->beneficiary->nik, -4) }}</td>
        </tr>
        <tr>
            <td class="label">Nomor Kartu Keluarga (KK)</td>
            <td class="colon">:</td>
            <td class="value">{{ substr($application->beneficiary->kk_number, 0, 6) }}******{{ substr($application->beneficiary->kk_number, -4) }}</td>
        </tr>
        <tr>
            <td class="label">Wilayah Dusun</td>
            <td class="colon">:</td>
            <td class="value">{{ $application->hamlet->name }} (RT {{ $application->beneficiary->rt ?? '01' }} / RW {{ $application->beneficiary->rw ?? '01' }})</td>
        </tr>
        <tr>
            <td class="label">Alamat Lengkap</td>
            <td class="colon">:</td>
            <td class="value">{{ $application->beneficiary->address }}</td>
        </tr>
    </table>

    <div class="section-title">2. Rincian Permohonan Bantuan</div>
    <table class="data-table">
        <tr>
            <td class="label">Kategori Bantuan</td>
            <td class="colon">:</td>
            <td class="value" style="color: #047857;">
                {{ $application->assistance_type === 'RTLH' ? 'Rehabilitasi Rumah Tidak Layak Huni (RTLH)' : 'Alat Bantu Disabilitas' }}
            </td>
        </tr>
        <tr>
            <td class="label">Waktu Pendaftaran</td>
            <td class="colon">:</td>
            <td class="value">{{ $application->submitted_at ? $application->submitted_at->timezone('Asia/Jakarta')->format('d F Y, H:i') : now()->timezone('Asia/Jakarta')->format('d F Y, H:i') }} WIB</td>
        </tr>
        <tr>
            <td class="label">Nama Pelapor</td>
            <td class="colon">:</td>
            <td class="value">{{ $application->reporter_name }} ({{ $application->reporter_relationship ?? 'Diri Sendiri' }})</td>
        </tr>
        <tr>
            <td class="label">Kontak WhatsApp Pelapor</td>
            <td class="colon">:</td>
            <td class="value">{{ $application->reporter_phone }}</td>
        </tr>
        <tr>
            <td class="label">Deskripsi Kebutuhan / Faktual</td>
            <td class="colon">:</td>
            <td class="value" style="font-weight: normal; font-size: 9.5pt;">{{ $application->description ?? $application->needs_description ?? 'Sesuai berkas permohonan.' }}</td>
        </tr>
    </table>

    <div class="privacy-box">
        <strong>Pemberitahuan Perlindungan Data Pribadi (UU PDP):</strong><br>
        Tanda terima ini sah dan diterbitkan secara digital oleh Sistem Aspirasi & Bantuan Sosial Trans-Desa (SAPA-JARAK). Nomor tiket ini dapat digunakan untuk memantau kemajuan verifikasi lapangan Kasun dan validasi Musyawarah Desa secara transparan melalui portal: <em>https://sapa-jarak.desa.id/lacak?ticket={{ ltrim($application->ticket_number, '#') }}</em>.
    </div>

    <div class="signatures">
        <table>
            <tr>
                <td>
                    Pemohon / Pelapor,
                    <div class="sig-space"></div>
                    <strong>{{ $application->reporter_name }}</strong>
                </td>
                <td>
                    Desa Jarak, {{ now()->timezone('Asia/Jakarta')->translatedFormat('d F Y') }}<br>
                    Petugas Pelayanan Desa,
                    <div class="sig-space"></div>
                    <strong>Posko SAPA-JARAK</strong>
                </td>
            </tr>
        </table>
    </div>

    <div class="footer">
        Dicetak secara otomatis melalui Sistem SAPA-JARAK Pemerintah Desa Jarak &bull; Dokumen Resmi Tanpa Tanda Tangan Basah Tetap Sah Sesuai Ketentuan Desa.
    </div>

</body>
</html>
