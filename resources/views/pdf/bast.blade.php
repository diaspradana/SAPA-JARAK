<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Berita Acara Serah Terima - {{ $application->handover->bast_number ?? $application->ticket_number }}</title>
    <style>
        @page {
            size: A4 portrait;
            margin: 2cm 2cm 2cm 2cm;
        }
        body {
            font-family: 'Times New Roman', Times, serif;
            font-size: 12pt;
            color: #000;
            line-height: 1.5;
        }
        .header {
            text-align: center;
            border-bottom: 3px double #000;
            padding-bottom: 8px;
            margin-bottom: 18px;
        }
        .header h3 {
            margin: 0;
            font-size: 13pt;
            font-weight: bold;
            text-transform: uppercase;
        }
        .header h2 {
            margin: 2px 0 0 0;
            font-size: 15pt;
            font-weight: bold;
            text-transform: uppercase;
        }
        .header p {
            margin: 3px 0 0 0;
            font-size: 10pt;
            font-style: italic;
        }
        .doc-title {
            text-align: center;
            margin: 15px 0 20px 0;
        }
        .doc-title h4 {
            margin: 0;
            font-size: 13pt;
            text-decoration: underline;
            text-transform: uppercase;
            font-weight: bold;
        }
        .doc-title p {
            margin: 3px 0 0 0;
            font-size: 11pt;
        }
        .content {
            text-align: justify;
            margin-bottom: 15px;
        }
        table.party-table {
            width: 100%;
            border-collapse: collapse;
            margin: 10px 0 15px 0;
        }
        table.party-table td {
            padding: 3px 0;
            vertical-align: top;
            font-size: 11.5pt;
        }
        table.party-table td.num {
            width: 4%;
        }
        table.party-table td.field {
            width: 25%;
        }
        table.party-table td.colon {
            width: 3%;
        }
        table.party-table td.val {
            width: 68%;
            font-weight: bold;
        }
        .table-items {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
        }
        .table-items th, .table-items td {
            border: 1px solid #000;
            padding: 6px 8px;
            font-size: 10.5pt;
        }
        .table-items th {
            background-color: #f1f5f9;
            text-align: center;
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
            vertical-align: top;
            font-size: 11pt;
        }
        .sig-space {
            height: 70px;
        }
        .saksi {
            margin-top: 25px;
            text-align: center;
        }
    </style>
</head>
<body>

    <div class="header">
        <h3>Pemerintah Kabupaten Kediri</h3>
        <h3>Kecamatan Plosoklaten</h3>
        <h2>Pemerintah Desa Jarak</h2>
        <p>Jl. Raya Jarak No. 12, Desa Jarak, Kec. Plosoklaten, Kab. Kediri, Jawa Timur 64175</p>
    </div>

    <div class="doc-title">
        <h4>BERITA ACARA SERAH TERIMA HASIL BANTUAN SOSIAL</h4>
        <p>Nomor: {{ $application->handover->bast_number ?? '045.2/BAST-SAPA/' . date('m/Y') }}</p>
    </div>

    <div class="content">
        Pada hari ini, tanggal <strong>{{ $application->handover && $application->handover->handover_date ? \Carbon\Carbon::parse($application->handover->handover_date)->translatedFormat('d F Y') : now()->translatedFormat('d F Y') }}</strong>, bertempat di Kantor Pemerintah Desa Jarak, kami yang bertanda tangan di bawah ini:
    </div>

    <table class="party-table">
        <tr>
            <td class="num">1.</td>
            <td class="field">Nama</td>
            <td class="colon">:</td>
            <td class="val">{{ $application->handover && $application->handover->official ? $application->handover->official->name : 'Bpk. Drs. H. Supriyadi' }}</td>
        </tr>
        <tr>
            <td></td>
            <td class="field">Jabatan</td>
            <td class="colon">:</td>
            <td class="val">Kepala Desa Jarak</td>
        </tr>
        <tr>
            <td></td>
            <td class="field">Alamat</td>
            <td class="colon">:</td>
            <td class="val" style="font-weight: normal;">Kantor Desa Jarak, Kec. Plosoklaten, Kab. Kediri</td>
        </tr>
        <tr>
            <td></td>
            <td colspan="3" style="font-style: italic; padding-top: 4px;">
                Bertindak untuk dan atas nama Pemerintah Desa Jarak, selanjutnya disebut sebagai <strong>PIHAK PERTAMA</strong>.
            </td>
        </tr>
    </table>

    <table class="party-table">
        <tr>
            <td class="num">2.</td>
            <td class="field">Nama</td>
            <td class="colon">:</td>
            <td class="val">{{ $application->beneficiary->name }}</td>
        </tr>
        <tr>
            <td></td>
            <td class="field">NIK</td>
            <td class="colon">:</td>
            <td class="val">{{ $application->beneficiary->nik }}</td>
        </tr>
        <tr>
            <td></td>
            <td class="field">Alamat</td>
            <td class="colon">:</td>
            <td class="val" style="font-weight: normal;">RT {{ $application->beneficiary->rt ?? '01' }} / RW {{ $application->beneficiary->rw ?? '01' }}, {{ $application->hamlet->name }}, Desa Jarak</td>
        </tr>
        <tr>
            <td></td>
            <td colspan="3" style="font-style: italic; padding-top: 4px;">
                Selaku Penerima Manfaat Bantuan Sosial, selanjutnya disebut sebagai <strong>PIHAK KEDUA</strong>.
            </td>
        </tr>
    </table>

    <div class="content">
        Kedua belah pihak menyatakan bahwa <strong>PIHAK PERTAMA</strong> telah menyerahkan hasil realisasi pelaksanaan bantuan kepada <strong>PIHAK KEDUA</strong>, dan <strong>PIHAK KEDUA</strong> telah menerima hasil bantuan tersebut dalam kondisi baik, lengkap, dan selesai 100% dengan rincian sebagai berikut:
    </div>

    <table class="table-items">
        <thead>
            <tr>
                <th style="width: 8%;">No</th>
                <th style="width: 32%;">Program Bantuan</th>
                <th style="width: 35%;">Rincian Realisasi / Barang</th>
                <th style="width: 25%;">Alokasi Anggaran</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td style="text-align: center;">1</td>
                <td>
                    <strong>{{ $application->assistance_type === 'RTLH' ? 'Rehabilitasi RTLH' : 'Bantuan Disabilitas' }}</strong><br>
                    <span style="font-size: 9pt; color: #475569;">Tiket: {{ $application->ticket_number }}</span>
                </td>
                <td>
                    {{ $application->handover->notes ?? ($application->procurement->contractor_or_vendor ? 'Pengerjaan rampung oleh ' . $application->procurement->contractor_or_vendor : 'Penyaluran sarana bantuan fisik tuntas 100%.') }}
                </td>
                <td style="text-align: right; font-weight: bold;">
                    Rp {{ number_format($application->funding->realized_budget ?? $application->funding->allocated_budget ?? 15000000, 0, ',', '.') }}<br>
                    <span style="font-size: 8.5pt; font-weight: normal; color: #64748b;">Sumber: {{ $application->funding->source ?? 'APBDes' }}</span>
                </td>
            </tr>
        </tbody>
    </table>

    <div class="content">
        Demikian Berita Acara Serah Terima ini dibuat dengan sebenarnya dalam rangkap secukupnya untuk dipergunakan sebagaimana mestinya dan dicatatkan ke dalam Register Transparansi Publik Desa Jarak.
    </div>

    <div class="signatures">
        <table>
            <tr>
                <td>
                    Yang Menerima (Penerima Manfaat),<br>
                    <strong>PIHAK KEDUA</strong>
                    <div class="sig-space"></div>
                    <strong><u>{{ $application->beneficiary->name }}</u></strong>
                </td>
                <td>
                    Yang Menyerahkan,<br>
                    Kepala Desa Jarak<br>
                    <strong>PIHAK PERTAMA</strong>
                    <div class="sig-space"></div>
                    <strong><u>{{ $application->handover && $application->handover->official ? $application->handover->official->name : 'Bpk. Drs. H. Supriyadi' }}</u></strong>
                </td>
            </tr>
        </table>
        
        <div class="saksi">
            Mengetahui / Saksi Faktual,<br>
            Kepala Dusun {{ $application->hamlet->name }}
            <div class="sig-space" style="height: 55px;"></div>
            <strong><u>{{ $application->hamlet->head_name ?? 'Kepala Dusun' }}</u></strong>
        </div>
    </div>

</body>
</html>
