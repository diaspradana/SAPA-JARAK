<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Laporan SPJ Realisasi Bantuan Sosial - TA {{ $fiscal_year }}</title>
    <style>
        @page {
            size: A4 landscape;
            margin: 1.5cm 1.5cm 1.5cm 1.5cm;
        }
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            font-size: 9pt;
            color: #1e293b;
            line-height: 1.3;
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #0f172a;
            padding-bottom: 8px;
            margin-bottom: 15px;
        }
        .header h3 {
            margin: 0;
            font-size: 11pt;
            text-transform: uppercase;
            font-weight: 500;
        }
        .header h2 {
            margin: 2px 0 0 0;
            font-size: 14pt;
            text-transform: uppercase;
            color: #064e3b;
        }
        .header p {
            margin: 2px 0 0 0;
            font-size: 8.5pt;
            color: #64748b;
        }
        .title-block {
            text-align: center;
            margin: 10px 0 15px 0;
        }
        .title-block h4 {
            margin: 0;
            font-size: 12pt;
            text-transform: uppercase;
            color: #0f172a;
        }
        .title-block p {
            margin: 2px 0 0 0;
            font-size: 9.5pt;
            color: #475569;
        }
        .summary-box {
            margin-bottom: 12px;
            font-size: 9pt;
        }
        .summary-table {
            border-collapse: collapse;
            margin-bottom: 15px;
        }
        .summary-table td {
            padding: 3px 10px 3px 0;
            font-weight: bold;
        }
        table.report-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        table.report-table th, table.report-table td {
            border: 1px solid #94a3b8;
            padding: 5px 6px;
            font-size: 8.5pt;
        }
        table.report-table th {
            background-color: #f1f5f9;
            color: #0f172a;
            text-transform: uppercase;
            font-size: 8pt;
            text-align: center;
        }
        table.report-table tr:nth-child(even) {
            background-color: #f8fafc;
        }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .signatures {
            margin-top: 25px;
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
            height: 55px;
        }
        .footer {
            margin-top: 15px;
            text-align: right;
            font-size: 7.5pt;
            color: #94a3b8;
        }
    </style>
</head>
<body>

    <div class="header">
        <h3>Pemerintah Kabupaten Kediri &bull; Kecamatan Plosoklaten</h3>
        <h2>Pemerintah Desa Jarak</h2>
        <p>Jl. Raya Jarak No. 12, Desa Jarak, Kec. Plosoklaten, Kab. Kediri, Jawa Timur 64175</p>
    </div>

    <div class="title-block">
        <h4>Laporan Pertanggungjawaban (SPJ) Realisasi Bantuan Sosial Trans-Desa</h4>
        <p>Tahun Anggaran {{ $fiscal_year }} &bull; Sumber Data: Sistem SAPA-JARAK</p>
    </div>

    <table class="summary-table">
        <tr>
            <td>Total Penerima Manfaat:</td>
            <td style="color: #047857;">{{ $total_recipients }} Jiwa / KK</td>
            <td style="padding-left: 30px;">Total Realisasi Anggaran:</td>
            <td style="color: #047857;">Rp {{ number_format($total_realization, 0, ',', '.') }}</td>
        </tr>
    </table>

    <table class="report-table">
        <thead>
            <tr>
                <th style="width: 3%;">No</th>
                <th style="width: 13%;">Nomor Tiket</th>
                <th style="width: 15%;">Nama Penerima</th>
                <th style="width: 13%;">NIK</th>
                <th style="width: 14%;">Wilayah Dusun</th>
                <th style="width: 10%;">Jenis Bantuan</th>
                <th style="width: 10%;">Realisasi (Rp)</th>
                <th style="width: 12%;">Nomor BAST</th>
                <th style="width: 10%;">Tgl Selesai</th>
            </tr>
        </thead>
        <tbody>
            @forelse($records as $rec)
                <tr>
                    <td class="text-center">{{ $rec['no'] }}</td>
                    <td><strong>{{ $rec['ticket_number'] }}</strong></td>
                    <td>{{ $rec['beneficiary_name'] }}</td>
                    <td>{{ $rec['nik'] }}</td>
                    <td>{{ $rec['address'] }}</td>
                    <td class="text-center">{{ $rec['assistance_type'] }}</td>
                    <td class="text-right">Rp {{ number_format($rec['realized_budget'], 0, ',', '.') }}</td>
                    <td>{{ $rec['bast_number'] }}</td>
                    <td class="text-center">{{ $rec['completion_date'] }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="9" class="text-center" style="padding: 20px; color: #64748b;">
                        Belum ada data realisasi bantuan yang tuntas (COMPLETED) untuk periode anggaran ini.
                    </td>
                </tr>
            @endforelse
            @if(count($records) > 0)
                <tr style="font-weight: bold; background-color: #e2e8f0;">
                    <td colspan="6" class="text-right" style="padding-right: 12px;">TOTAL REALISASI APBDES:</td>
                    <td class="text-right">Rp {{ number_format($total_realization, 0, ',', '.') }}</td>
                    <td colspan="2"></td>
                </tr>
            @endif
        </tbody>
    </table>

    <div class="signatures">
        <table>
            <tr>
                <td>
                    Mengetahui / Memeriksa,<br>
                    Kasi Kesejahteraan Desa Jarak
                    <div class="sig-space"></div>
                    <strong><u>Bpk. Ahmad Fauzi</u></strong><br>
                    <span style="font-size: 8pt; color: #64748b;">NIP. 19820415 201001 1 012</span>
                </td>
                <td>
                    Mengesahkan,<br>
                    Kepala Desa Jarak
                    <div class="sig-space"></div>
                    <strong><u>Bpk. Drs. H. Supriyadi</u></strong><br>
                    <span style="font-size: 8pt; color: #64748b;">Kepala Desa Jarak</span>
                </td>
            </tr>
        </table>
    </div>

    <div class="footer">
        Dicetak pada: {{ now()->timezone('Asia/Jakarta')->translatedFormat('d F Y, H:i') }} WIB &bull; Sistem SAPA-JARAK Desa Jarak
    </div>

</body>
</html>
