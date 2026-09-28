<?php

namespace App\Services;

use App\Models\Application;
use App\Models\User;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ExportService
{
    /**
     * Export SPJ APBDes Realization Report.
     */
    public function exportSpj(array $filters = [], string $format = 'csv'): StreamedResponse
    {
        $year = $filters['year'] ?? date('Y');
        $delimiter = $filters['delimiter'] ?? ',';
        $filenameBase = "Laporan_SPJ_Bansos_Desa_Jarak_{$year}_" . date('Ymd_His');

        $query = Application::with(['beneficiary', 'hamlet', 'funding', 'handover'])
            ->where('status', 'COMPLETED');

        if (!empty($filters['hamlet_id'])) {
            $query->where('hamlet_id', $filters['hamlet_id']);
        }

        if (!empty($filters['year'])) {
            $query->whereYear('completed_at', $filters['year']);
        }

        $headers = [
            ['title' => 'No', 'type' => 'Number', 'style' => 'DataCellCenter'],
            ['title' => 'No. Tiket', 'type' => 'String', 'style' => 'DataCellCenter'],
            ['title' => 'Nama Penerima', 'type' => 'String', 'style' => 'DataCell'],
            ['title' => 'NIK', 'type' => 'String', 'style' => 'DataCellCenter'],
            ['title' => 'Dusun', 'type' => 'String', 'style' => 'DataCell'],
            ['title' => 'Alamat (RT/RW)', 'type' => 'String', 'style' => 'DataCellCenter'],
            ['title' => 'Jenis Bantuan', 'type' => 'String', 'style' => 'DataCellCenter'],
            ['title' => 'Sumber Dana', 'type' => 'String', 'style' => 'DataCell'],
            ['title' => 'Kode Rekening', 'type' => 'String', 'style' => 'DataCellCenter'],
            ['title' => 'Pagu Anggaran (Rp)', 'type' => 'Number', 'style' => 'Currency'],
            ['title' => 'Realisasi (Rp)', 'type' => 'Number', 'style' => 'Currency'],
            ['title' => 'Sisa Pagu (Rp)', 'type' => 'Number', 'style' => 'Currency'],
            ['title' => 'Nomor BAST', 'type' => 'String', 'style' => 'DataCellCenter'],
            ['title' => 'Tanggal BAST/Selesai', 'type' => 'String', 'style' => 'DataCellCenter'],
            ['title' => 'Status', 'type' => 'String', 'style' => 'DataCellCenter'],
        ];

        $totalAllocated = 0;
        $totalRealized = 0;
        $totalRemaining = 0;

        $rowsGenerator = function () use ($query, &$totalAllocated, &$totalRealized, &$totalRemaining) {
            $idx = 1;
            foreach ($query->latest('completed_at')->cursor() as $app) {
                $allocated = (float) ($app->funding->allocated_budget ?? 0);
                $realized = (float) ($app->funding->realized_budget ?? 0);
                $remaining = max(0, $allocated - $realized);

                $totalAllocated += $allocated;
                $totalRealized += $realized;
                $totalRemaining += $remaining;

                $nik = $app->beneficiary->nik ?? '-';
                $rtRw = "RT " . ($app->beneficiary->rt ?? '00') . " / RW " . ($app->beneficiary->rw ?? '00');
                $bastNumber = $app->handover->bast_number ?? '-';
                $completionDate = $app->completed_at ? $app->completed_at->format('d/m/Y') : '-';

                yield [
                    ['value' => $idx, 'type' => 'Number', 'style' => 'DataCellCenter'],
                    ['value' => $app->ticket_number, 'type' => 'String', 'style' => 'DataCellCenter'],
                    ['value' => $app->beneficiary->name ?? 'Warga Jarak', 'type' => 'String', 'style' => 'DataCell'],
                    ['value' => $nik, 'type' => 'String', 'style' => 'DataCellCenter'],
                    ['value' => $app->hamlet->name ?? '-', 'type' => 'String', 'style' => 'DataCell'],
                    ['value' => $rtRw, 'type' => 'String', 'style' => 'DataCellCenter'],
                    ['value' => $app->assistance_type, 'type' => 'String', 'style' => 'DataCellCenter'],
                    ['value' => $app->funding->source ?? 'APBDES_DANA_DESA', 'type' => 'String', 'style' => 'DataCell'],
                    ['value' => $app->funding->account_code ?? '02.01.05', 'type' => 'String', 'style' => 'DataCellCenter'],
                    ['value' => $allocated, 'type' => 'Number', 'style' => 'Currency'],
                    ['value' => $realized, 'type' => 'Number', 'style' => 'Currency'],
                    ['value' => $remaining, 'type' => 'Number', 'style' => 'Currency'],
                    ['value' => $bastNumber, 'type' => 'String', 'style' => 'DataCellCenter'],
                    ['value' => $completionDate, 'type' => 'String', 'style' => 'DataCellCenter'],
                    ['value' => $app->status, 'type' => 'String', 'style' => 'DataCellCenter'],
                ];
                $idx++;
            }
        };

        $summaryCallback = function () use (&$totalAllocated, &$totalRealized, &$totalRemaining) {
            return [
                ['value' => 'TOTAL REALISASI APBDES', 'type' => 'String', 'style' => 'TotalLabel', 'colspan' => 9],
                ['value' => '', 'type' => 'String', 'style' => 'TotalLabel'],
                ['value' => '', 'type' => 'String', 'style' => 'TotalLabel'],
                ['value' => '', 'type' => 'String', 'style' => 'TotalLabel'],
                ['value' => '', 'type' => 'String', 'style' => 'TotalLabel'],
                ['value' => '', 'type' => 'String', 'style' => 'TotalLabel'],
                ['value' => '', 'type' => 'String', 'style' => 'TotalLabel'],
                ['value' => '', 'type' => 'String', 'style' => 'TotalLabel'],
                ['value' => '', 'type' => 'String', 'style' => 'TotalLabel'],
                ['value' => $totalAllocated, 'type' => 'Number', 'style' => 'Total'],
                ['value' => $totalRealized, 'type' => 'Number', 'style' => 'Total'],
                ['value' => $totalRemaining, 'type' => 'Number', 'style' => 'Total'],
                ['value' => '', 'type' => 'String', 'style' => 'TotalLabel'],
                ['value' => '', 'type' => 'String', 'style' => 'TotalLabel'],
                ['value' => '', 'type' => 'String', 'style' => 'TotalLabel'],
            ];
        };

        return $this->streamExport(
            $filenameBase,
            "SPJ APBDes {$year}",
            $headers,
            $rowsGenerator,
            $summaryCallback,
            $format,
            $delimiter
        );
    }

    /**
     * Export Beneficiary / Submissions Master Register for Village Officials.
     */
    public function exportBeneficiaries(array $filters = [], string $format = 'csv'): StreamedResponse
    {
        $delimiter = $filters['delimiter'] ?? ',';
        $filenameBase = "Rekapitulasi_Penerima_Bansos_Desa_Jarak_" . date('Ymd_His');

        $query = Application::with(['beneficiary', 'hamlet', 'funding', 'handover', 'latestVerification']);

        if (!empty($filters['hamlet_id'])) {
            $query->where('hamlet_id', $filters['hamlet_id']);
        }
        if (!empty($filters['assistance_type'])) {
            $query->where('assistance_type', $filters['assistance_type']);
        }
        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }
        if (!empty($filters['year'])) {
            $query->whereYear('submitted_at', $filters['year']);
        }

        $headers = [
            ['title' => 'No', 'type' => 'Number', 'style' => 'DataCellCenter'],
            ['title' => 'No. Tiket', 'type' => 'String', 'style' => 'DataCellCenter'],
            ['title' => 'Tanggal Masuk', 'type' => 'String', 'style' => 'DataCellCenter'],
            ['title' => 'Nama Penerima', 'type' => 'String', 'style' => 'DataCell'],
            ['title' => 'NIK', 'type' => 'String', 'style' => 'DataCellCenter'],
            ['title' => 'No. KK', 'type' => 'String', 'style' => 'DataCellCenter'],
            ['title' => 'No. Telepon / WA', 'type' => 'String', 'style' => 'DataCellCenter'],
            ['title' => 'Dusun', 'type' => 'String', 'style' => 'DataCell'],
            ['title' => 'RT', 'type' => 'String', 'style' => 'DataCellCenter'],
            ['title' => 'RW', 'type' => 'String', 'style' => 'DataCellCenter'],
            ['title' => 'Jenis Bantuan', 'type' => 'String', 'style' => 'DataCellCenter'],
            ['title' => 'Status DTKS', 'type' => 'String', 'style' => 'DataCellCenter'],
            ['title' => 'Skor Kelayakan', 'type' => 'Number', 'style' => 'DataCellCenter'],
            ['title' => 'Status Berkas', 'type' => 'String', 'style' => 'DataCellCenter'],
            ['title' => 'Sumber Dana', 'type' => 'String', 'style' => 'DataCell'],
            ['title' => 'Alokasi Pagu (Rp)', 'type' => 'Number', 'style' => 'Currency'],
            ['title' => 'Realisasi (Rp)', 'type' => 'Number', 'style' => 'Currency'],
            ['title' => 'Nomor BAST', 'type' => 'String', 'style' => 'DataCellCenter'],
        ];

        $totalAllocated = 0;
        $totalRealized = 0;

        $rowsGenerator = function () use ($query, &$totalAllocated, &$totalRealized) {
            $idx = 1;
            foreach ($query->latest('submitted_at')->cursor() as $app) {
                $allocated = (float) ($app->funding->allocated_budget ?? 0);
                $realized = (float) ($app->funding->realized_budget ?? 0);

                $totalAllocated += $allocated;
                $totalRealized += $realized;

                $submittedDate = $app->submitted_at ? $app->submitted_at->format('d/m/Y H:i') : '-';
                $nik = $app->beneficiary->nik ?? '-';
                $kk = $app->beneficiary->kk_number ?? '-';
                $phone = $app->beneficiary->phone ?? ($app->reporter_phone ?? '-');
                $bastNumber = $app->handover->bast_number ?? '-';
                $score = $app->priority_score ?? ($app->latestVerification->calculated_score ?? 0);

                yield [
                    ['value' => $idx, 'type' => 'Number', 'style' => 'DataCellCenter'],
                    ['value' => $app->ticket_number, 'type' => 'String', 'style' => 'DataCellCenter'],
                    ['value' => $submittedDate, 'type' => 'String', 'style' => 'DataCellCenter'],
                    ['value' => $app->beneficiary->name ?? 'Warga Jarak', 'type' => 'String', 'style' => 'DataCell'],
                    ['value' => $nik, 'type' => 'String', 'style' => 'DataCellCenter'],
                    ['value' => $kk, 'type' => 'String', 'style' => 'DataCellCenter'],
                    ['value' => $phone, 'type' => 'String', 'style' => 'DataCellCenter'],
                    ['value' => $app->hamlet->name ?? '-', 'type' => 'String', 'style' => 'DataCell'],
                    ['value' => $app->beneficiary->rt ?? '00', 'type' => 'String', 'style' => 'DataCellCenter'],
                    ['value' => $app->beneficiary->rw ?? '00', 'type' => 'String', 'style' => 'DataCellCenter'],
                    ['value' => $app->assistance_type, 'type' => 'String', 'style' => 'DataCellCenter'],
                    ['value' => $app->beneficiary->dtks_status ?? 'NON_DTKS', 'type' => 'String', 'style' => 'DataCellCenter'],
                    ['value' => $score, 'type' => 'Number', 'style' => 'DataCellCenter'],
                    ['value' => $app->status, 'type' => 'String', 'style' => 'DataCellCenter'],
                    ['value' => $app->funding->source ?? '-', 'type' => 'String', 'style' => 'DataCell'],
                    ['value' => $allocated, 'type' => 'Number', 'style' => 'Currency'],
                    ['value' => $realized, 'type' => 'Number', 'style' => 'Currency'],
                    ['value' => $bastNumber, 'type' => 'String', 'style' => 'DataCellCenter'],
                ];
                $idx++;
            }
        };

        $summaryCallback = function () use (&$totalAllocated, &$totalRealized) {
            return [
                ['value' => 'TOTAL REKAPITULASI BANSOS', 'type' => 'String', 'style' => 'TotalLabel'],
                ['value' => '', 'type' => 'String', 'style' => 'TotalLabel'],
                ['value' => '', 'type' => 'String', 'style' => 'TotalLabel'],
                ['value' => '', 'type' => 'String', 'style' => 'TotalLabel'],
                ['value' => '', 'type' => 'String', 'style' => 'TotalLabel'],
                ['value' => '', 'type' => 'String', 'style' => 'TotalLabel'],
                ['value' => '', 'type' => 'String', 'style' => 'TotalLabel'],
                ['value' => '', 'type' => 'String', 'style' => 'TotalLabel'],
                ['value' => '', 'type' => 'String', 'style' => 'TotalLabel'],
                ['value' => '', 'type' => 'String', 'style' => 'TotalLabel'],
                ['value' => '', 'type' => 'String', 'style' => 'TotalLabel'],
                ['value' => '', 'type' => 'String', 'style' => 'TotalLabel'],
                ['value' => '', 'type' => 'String', 'style' => 'TotalLabel'],
                ['value' => '', 'type' => 'String', 'style' => 'TotalLabel'],
                ['value' => '', 'type' => 'String', 'style' => 'TotalLabel'],
                ['value' => $totalAllocated, 'type' => 'Number', 'style' => 'Total'],
                ['value' => $totalRealized, 'type' => 'Number', 'style' => 'Total'],
                ['value' => '', 'type' => 'String', 'style' => 'TotalLabel'],
            ];
        };

        return $this->streamExport(
            $filenameBase,
            "Rekapitulasi Bansos",
            $headers,
            $rowsGenerator,
            $summaryCallback,
            $format,
            $delimiter
        );
    }

    /**
     * Export Public Transparency Ledger (Privacy-Masked Data).
     */
    public function exportPublicLedger(array $filters = [], string $format = 'csv'): StreamedResponse
    {
        $delimiter = $filters['delimiter'] ?? ',';
        $filenameBase = "Transparansi_Bansos_Desa_Jarak_" . date('Ymd_His');

        $query = Application::with(['beneficiary', 'hamlet', 'funding', 'procurement'])
            ->whereIn('status', [
                'APPROVED',
                'FUNDING_ALLOCATED',
                'PROCUREMENT_IN_PROGRESS',
                'READY_FOR_HANDOVER',
                'COMPLETED'
            ]);

        if (!empty($filters['hamlet_id'])) {
            $query->where('hamlet_id', $filters['hamlet_id']);
        }
        if (!empty($filters['assistance_type'])) {
            $query->where('assistance_type', $filters['assistance_type']);
        }
        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where('ticket_number', 'like', "%{$search}%");
        }

        $headers = [
            ['title' => 'No', 'type' => 'Number', 'style' => 'DataCellCenter'],
            ['title' => 'No. Tiket', 'type' => 'String', 'style' => 'DataCellCenter'],
            ['title' => 'Penerima Manfaat (Anonim)', 'type' => 'String', 'style' => 'DataCell'],
            ['title' => 'Dusun', 'type' => 'String', 'style' => 'DataCell'],
            ['title' => 'RT / RW', 'type' => 'String', 'style' => 'DataCellCenter'],
            ['title' => 'Jenis Bantuan', 'type' => 'String', 'style' => 'DataCellCenter'],
            ['title' => 'Status Bantuan', 'type' => 'String', 'style' => 'DataCellCenter'],
            ['title' => 'Sumber Dana', 'type' => 'String', 'style' => 'DataCell'],
            ['title' => 'Alokasi Pagu (Rp)', 'type' => 'Number', 'style' => 'Currency'],
            ['title' => 'Realisasi (Rp)', 'type' => 'Number', 'style' => 'Currency'],
            ['title' => 'Progres Fisik (%)', 'type' => 'Number', 'style' => 'DataCellCenter'],
            ['title' => 'Tanggal Tuntas', 'type' => 'String', 'style' => 'DataCellCenter'],
        ];

        $totalAllocated = 0;
        $totalRealized = 0;

        $rowsGenerator = function () use ($query, &$totalAllocated, &$totalRealized) {
            $idx = 1;
            foreach ($query->latest('updated_at')->cursor() as $app) {
                $allocated = (float) ($app->funding->allocated_budget ?? 0);
                $realized = (float) ($app->funding->realized_budget ?? 0);
                $totalAllocated += $allocated;
                $totalRealized += $realized;

                $maskedName = $app->beneficiary ? $app->beneficiary->masked_name : 'Warga Jarak';
                $rtRw = "RT " . ($app->beneficiary->rt ?? '00') . " / RW " . ($app->beneficiary->rw ?? '00');
                $progress = $app->procurement ? $app->procurement->progress_percentage : ($app->status === 'COMPLETED' ? 100 : 0);
                $completedAt = $app->completed_at ? $app->completed_at->format('d/m/Y') : '-';

                yield [
                    ['value' => $idx, 'type' => 'Number', 'style' => 'DataCellCenter'],
                    ['value' => $app->ticket_number, 'type' => 'String', 'style' => 'DataCellCenter'],
                    ['value' => $maskedName, 'type' => 'String', 'style' => 'DataCell'],
                    ['value' => $app->hamlet->name ?? '-', 'type' => 'String', 'style' => 'DataCell'],
                    ['value' => $rtRw, 'type' => 'String', 'style' => 'DataCellCenter'],
                    ['value' => $app->assistance_type, 'type' => 'String', 'style' => 'DataCellCenter'],
                    ['value' => $app->status, 'type' => 'String', 'style' => 'DataCellCenter'],
                    ['value' => $app->funding->source ?? 'APBDES_DANA_DESA', 'type' => 'String', 'style' => 'DataCell'],
                    ['value' => $allocated, 'type' => 'Number', 'style' => 'Currency'],
                    ['value' => $realized, 'type' => 'Number', 'style' => 'Currency'],
                    ['value' => $progress, 'type' => 'Number', 'style' => 'DataCellCenter'],
                    ['value' => $completedAt, 'type' => 'String', 'style' => 'DataCellCenter'],
                ];
                $idx++;
            }
        };

        $summaryCallback = function () use (&$totalAllocated, &$totalRealized) {
            return [
                ['value' => 'TOTAL TRANSPARANSI', 'type' => 'String', 'style' => 'TotalLabel'],
                ['value' => '', 'type' => 'String', 'style' => 'TotalLabel'],
                ['value' => '', 'type' => 'String', 'style' => 'TotalLabel'],
                ['value' => '', 'type' => 'String', 'style' => 'TotalLabel'],
                ['value' => '', 'type' => 'String', 'style' => 'TotalLabel'],
                ['value' => '', 'type' => 'String', 'style' => 'TotalLabel'],
                ['value' => '', 'type' => 'String', 'style' => 'TotalLabel'],
                ['value' => '', 'type' => 'String', 'style' => 'TotalLabel'],
                ['value' => $totalAllocated, 'type' => 'Number', 'style' => 'Total'],
                ['value' => $totalRealized, 'type' => 'Number', 'style' => 'Total'],
                ['value' => '', 'type' => 'String', 'style' => 'TotalLabel'],
                ['value' => '', 'type' => 'String', 'style' => 'TotalLabel'],
            ];
        };

        return $this->streamExport(
            $filenameBase,
            "Transparansi Publik",
            $headers,
            $rowsGenerator,
            $summaryCallback,
            $format,
            $delimiter
        );
    }

    /**
     * Export Kasun Survey Queue & Field Assessment Data.
     */
    public function exportKasunQueue(array $filters = [], ?User $user = null, string $format = 'csv'): StreamedResponse
    {
        $delimiter = $filters['delimiter'] ?? ',';
        $dusunName = 'Semua_Dusun';
        $query = Application::with(['beneficiary', 'hamlet', 'latestVerification']);

        if ($user && $user->hamlet_id) {
            $query->where('hamlet_id', $user->hamlet_id);
            $dusunName = $user->hamlet ? str_replace(' ', '_', $user->hamlet->name) : "Dusun_{$user->hamlet_id}";
        } elseif (!empty($filters['hamlet_id'])) {
            $query->where('hamlet_id', $filters['hamlet_id']);
            $dusunName = "Dusun_{$filters['hamlet_id']}";
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        $filenameBase = "Antrean_Survei_Kasun_{$dusunName}_" . date('Ymd_His');

        $headers = [
            ['title' => 'No', 'type' => 'Number', 'style' => 'DataCellCenter'],
            ['title' => 'No. Tiket', 'type' => 'String', 'style' => 'DataCellCenter'],
            ['title' => 'Tanggal Masuk', 'type' => 'String', 'style' => 'DataCellCenter'],
            ['title' => 'Nama Warga', 'type' => 'String', 'style' => 'DataCell'],
            ['title' => 'NIK', 'type' => 'String', 'style' => 'DataCellCenter'],
            ['title' => 'Dusun', 'type' => 'String', 'style' => 'DataCell'],
            ['title' => 'RT / RW', 'type' => 'String', 'style' => 'DataCellCenter'],
            ['title' => 'Jenis Bantuan', 'type' => 'String', 'style' => 'DataCellCenter'],
            ['title' => 'Status Pengajuan', 'type' => 'String', 'style' => 'DataCellCenter'],
            ['title' => 'Rekomendasi Kasun', 'type' => 'String', 'style' => 'DataCellCenter'],
            ['title' => 'Skor Kelayakan', 'type' => 'Number', 'style' => 'DataCellCenter'],
            ['title' => 'Catatan Survei Lapangan', 'type' => 'String', 'style' => 'DataCell'],
        ];

        $rowsGenerator = function () use ($query) {
            $idx = 1;
            foreach ($query->latest('submitted_at')->cursor() as $app) {
                $submittedDate = $app->submitted_at ? $app->submitted_at->format('d/m/Y H:i') : '-';
                $nik = $app->beneficiary->nik ?? '-';
                $rtRw = "RT " . ($app->beneficiary->rt ?? '00') . " / RW " . ($app->beneficiary->rw ?? '00');
                $recom = $app->latestVerification->recommendation ?? 'BELUM_DISURVEI';
                $score = $app->latestVerification->calculated_score ?? ($app->priority_score ?? 0);
                $notes = $app->latestVerification->notes ?? '-';

                yield [
                    ['value' => $idx, 'type' => 'Number', 'style' => 'DataCellCenter'],
                    ['value' => $app->ticket_number, 'type' => 'String', 'style' => 'DataCellCenter'],
                    ['value' => $submittedDate, 'type' => 'String', 'style' => 'DataCellCenter'],
                    ['value' => $app->beneficiary->name ?? 'Warga Jarak', 'type' => 'String', 'style' => 'DataCell'],
                    ['value' => $nik, 'type' => 'String', 'style' => 'DataCellCenter'],
                    ['value' => $app->hamlet->name ?? '-', 'type' => 'String', 'style' => 'DataCell'],
                    ['value' => $rtRw, 'type' => 'String', 'style' => 'DataCellCenter'],
                    ['value' => $app->assistance_type, 'type' => 'String', 'style' => 'DataCellCenter'],
                    ['value' => $app->status, 'type' => 'String', 'style' => 'DataCellCenter'],
                    ['value' => $recom, 'type' => 'String', 'style' => 'DataCellCenter'],
                    ['value' => $score, 'type' => 'Number', 'style' => 'DataCellCenter'],
                    ['value' => $notes, 'type' => 'String', 'style' => 'DataCell'],
                ];
                $idx++;
            }
        };

        return $this->streamExport(
            $filenameBase,
            "Antrean Survei Kasun",
            $headers,
            $rowsGenerator,
            null,
            $format,
            $delimiter
        );
    }

    /**
     * Unified streaming export dispatcher (CSV or Excel XML Spreadsheet).
     */
    protected function streamExport(
        string $filenameBase,
        string $sheetTitle,
        array $headers,
        callable $rowsGenerator,
        ?callable $summaryCallback = null,
        string $format = 'csv',
        string $delimiter = ','
    ): StreamedResponse {
        $isExcel = in_array(strtolower($format), ['excel', 'xls', 'xlsx'], true);

        if ($isExcel) {
            return $this->streamExcelXml($filenameBase . '.xls', $sheetTitle, $headers, $rowsGenerator, $summaryCallback);
        }

        return $this->streamCsv($filenameBase . '.csv', $headers, $rowsGenerator, $summaryCallback, $delimiter);
    }

    /**
     * High-performance, O(1) memory CSV Streamer with UTF-8 BOM for Microsoft Excel.
     */
    protected function streamCsv(
        string $filename,
        array $headers,
        callable $rowsGenerator,
        ?callable $summaryCallback = null,
        string $delimiter = ','
    ): StreamedResponse {
        $responseHeaders = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ];

        return response()->stream(function () use ($headers, $rowsGenerator, $summaryCallback, $delimiter) {
            $handle = fopen('php://output', 'w');

            // Write UTF-8 BOM so Microsoft Excel correctly renders accents and characters
            fwrite($handle, "\xEF\xBB\xBF");

            // Write column headers
            $headerTitles = array_map(fn($h) => $h['title'], $headers);
            fputcsv($handle, $headerTitles, $delimiter, '"', "\\");

            // Stream data rows
            $generator = $rowsGenerator();
            foreach ($generator as $row) {
                $rowValues = array_map(function ($cell) {
                    $val = $cell['value'] ?? $cell;
                    // Preserve 16-digit Indonesian NIK/KK so Excel doesn't mangle into scientific notation
                    if (is_string($val) && preg_match('/^\d{16}$/', $val)) {
                        return "=\"{$val}\"";
                    }
                    return $val;
                }, $row);

                fputcsv($handle, $rowValues, $delimiter, '"', "\\");
            }

            // Stream summary / total row if available
            if ($summaryCallback) {
                $summaryCells = $summaryCallback();
                if (!empty($summaryCells)) {
                    fputcsv($handle, [], $delimiter, '"', "\\"); // Blank separator row
                    $summaryValues = array_map(fn($cell) => $cell['value'] ?? $cell, $summaryCells);
                    fputcsv($handle, $summaryValues, $delimiter, '"', "\\");
                }
            }

            fclose($handle);
        }, 200, $responseHeaders);
    }

    /**
     * High-performance, O(1) memory Excel XML (SpreadsheetML) Streamer.
     * Opens natively in Microsoft Excel, LibreOffice Calc, and Google Sheets with formatted styles.
     */
    protected function streamExcelXml(
        string $filename,
        string $sheetTitle,
        array $headers,
        callable $rowsGenerator,
        ?callable $summaryCallback = null
    ): StreamedResponse {
        $responseHeaders = [
            'Content-Type' => 'application/vnd.ms-excel; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ];

        return response()->stream(function () use ($sheetTitle, $headers, $rowsGenerator, $summaryCallback) {
            $handle = fopen('php://output', 'w');

            // XML & SpreadsheetML Header
            fwrite($handle, "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
            fwrite($handle, "<?mso-application progid=\"Excel.Sheet\"?>\n");
            fwrite($handle, "<Workbook xmlns=\"urn:schemas-microsoft-com:office:spreadsheet\"\n");
            fwrite($handle, " xmlns:o=\"urn:schemas-microsoft-com:office:office\"\n");
            fwrite($handle, " xmlns:x=\"urn:schemas-microsoft-com:office:excel\"\n");
            fwrite($handle, " xmlns:ss=\"urn:schemas-microsoft-com:office:spreadsheet\"\n");
            fwrite($handle, " xmlns:html=\"http://www.w3.org/TR/REC-html40\">\n");
            fwrite($handle, " <DocumentProperties xmlns=\"urn:schemas-microsoft-com:office:office\">\n");
            fwrite($handle, "  <Author>SAPA-JARAK Pemerintah Desa Jarak</Author>\n");
            fwrite($handle, "  <Created>" . date('Y-m-d\TH:i:s\Z') . "</Created>\n");
            fwrite($handle, "  <Company>Pemerintah Desa Jarak, Kab. Kediri</Company>\n");
            fwrite($handle, " </DocumentProperties>\n");

            // Palette of Professional Office Styles
            fwrite($handle, " <Styles>\n");
            fwrite($handle, "  <Style ss:ID=\"Default\" ss:Name=\"Normal\"><Alignment ss:Vertical=\"Center\"/><Font ss:FontName=\"Calibri\" ss:Size=\"10\"/></Style>\n");
            fwrite($handle, "  <Style ss:ID=\"Header\"><Alignment ss:Horizontal=\"Center\" ss:Vertical=\"Center\" ss:WrapText=\"1\"/><Borders><Border ss:Position=\"Bottom\" ss:LineStyle=\"Continuous\" ss:Weight=\"1\" ss:Color=\"#000000\"/><Border ss:Position=\"Left\" ss:LineStyle=\"Continuous\" ss:Weight=\"1\" ss:Color=\"#000000\"/><Border ss:Position=\"Right\" ss:LineStyle=\"Continuous\" ss:Weight=\"1\" ss:Color=\"#000000\"/><Border ss:Position=\"Top\" ss:LineStyle=\"Continuous\" ss:Weight=\"1\" ss:Color=\"#000000\"/></Borders><Font ss:FontName=\"Calibri\" ss:Size=\"11\" ss:Color=\"#FFFFFF\" ss:Bold=\"1\"/><Interior ss:Color=\"#1E3A8A\" ss:Pattern=\"Solid\"/></Style>\n");
            fwrite($handle, "  <Style ss:ID=\"DataCell\"><Borders><Border ss:Position=\"Bottom\" ss:LineStyle=\"Continuous\" ss:Weight=\"1\" ss:Color=\"#E2E8F0\"/><Border ss:Position=\"Left\" ss:LineStyle=\"Continuous\" ss:Weight=\"1\" ss:Color=\"#E2E8F0\"/><Border ss:Position=\"Right\" ss:LineStyle=\"Continuous\" ss:Weight=\"1\" ss:Color=\"#E2E8F0\"/><Border ss:Position=\"Top\" ss:LineStyle=\"Continuous\" ss:Weight=\"1\" ss:Color=\"#E2E8F0\"/></Borders><Font ss:FontName=\"Calibri\" ss:Size=\"10\" ss:Color=\"#000000\"/></Style>\n");
            fwrite($handle, "  <Style ss:ID=\"DataCellCenter\"><Alignment ss:Horizontal=\"Center\"/><Borders><Border ss:Position=\"Bottom\" ss:LineStyle=\"Continuous\" ss:Weight=\"1\" ss:Color=\"#E2E8F0\"/><Border ss:Position=\"Left\" ss:LineStyle=\"Continuous\" ss:Weight=\"1\" ss:Color=\"#E2E8F0\"/><Border ss:Position=\"Right\" ss:LineStyle=\"Continuous\" ss:Weight=\"1\" ss:Color=\"#E2E8F0\"/><Border ss:Position=\"Top\" ss:LineStyle=\"Continuous\" ss:Weight=\"1\" ss:Color=\"#E2E8F0\"/></Borders><Font ss:FontName=\"Calibri\" ss:Size=\"10\" ss:Color=\"#000000\"/></Style>\n");
            fwrite($handle, "  <Style ss:ID=\"Currency\"><Alignment ss:Horizontal=\"Right\"/><Borders><Border ss:Position=\"Bottom\" ss:LineStyle=\"Continuous\" ss:Weight=\"1\" ss:Color=\"#E2E8F0\"/><Border ss:Position=\"Left\" ss:LineStyle=\"Continuous\" ss:Weight=\"1\" ss:Color=\"#E2E8F0\"/><Border ss:Position=\"Right\" ss:LineStyle=\"Continuous\" ss:Weight=\"1\" ss:Color=\"#E2E8F0\"/><Border ss:Position=\"Top\" ss:LineStyle=\"Continuous\" ss:Weight=\"1\" ss:Color=\"#E2E8F0\"/></Borders><Font ss:FontName=\"Calibri\" ss:Size=\"10\" ss:Color=\"#000000\"/><NumberFormat ss:Format=\"&quot;Rp&quot;\\ #,##0\"/></Style>\n");
            fwrite($handle, "  <Style ss:ID=\"Total\"><Alignment ss:Horizontal=\"Right\"/><Borders><Border ss:Position=\"Bottom\" ss:LineStyle=\"Double\" ss:Weight=\"3\" ss:Color=\"#000000\"/><Border ss:Position=\"Top\" ss:LineStyle=\"Continuous\" ss:Weight=\"1\" ss:Color=\"#000000\"/></Borders><Font ss:FontName=\"Calibri\" ss:Size=\"11\" ss:Bold=\"1\" ss:Color=\"#000000\"/><Interior ss:Color=\"#F1F5F9\" ss:Pattern=\"Solid\"/><NumberFormat ss:Format=\"&quot;Rp&quot;\\ #,##0\"/></Style>\n");
            fwrite($handle, "  <Style ss:ID=\"TotalLabel\"><Alignment ss:Horizontal=\"Left\"/><Borders><Border ss:Position=\"Bottom\" ss:LineStyle=\"Double\" ss:Weight=\"3\" ss:Color=\"#000000\"/><Border ss:Position=\"Top\" ss:LineStyle=\"Continuous\" ss:Weight=\"1\" ss:Color=\"#000000\"/></Borders><Font ss:FontName=\"Calibri\" ss:Size=\"11\" ss:Bold=\"1\" ss:Color=\"#000000\"/><Interior ss:Color=\"#F1F5F9\" ss:Pattern=\"Solid\"/></Style>\n");
            fwrite($handle, " </Styles>\n");

            // Worksheet & Table Start
            $safeSheetTitle = htmlspecialchars(substr($sheetTitle, 0, 31), ENT_XML1, 'UTF-8');
            fwrite($handle, " <Worksheet ss:Name=\"{$safeSheetTitle}\">\n");
            fwrite($handle, "  <Table>\n");

            // Write Column Header Row
            fwrite($handle, "   <Row ss:Height=\"24\">\n");
            foreach ($headers as $col) {
                $val = htmlspecialchars($col['title'], ENT_XML1, 'UTF-8');
                fwrite($handle, "    <Cell ss:StyleID=\"Header\"><Data ss:Type=\"String\">{$val}</Data></Cell>\n");
            }
            fwrite($handle, "   </Row>\n");

            // Stream Data Rows
            $generator = $rowsGenerator();
            foreach ($generator as $row) {
                fwrite($handle, "   <Row ss:Height=\"18\">\n");
                foreach ($row as $cell) {
                    $rawVal = $cell['value'] ?? $cell;
                    $type = $cell['type'] ?? 'String';
                    $style = $cell['style'] ?? 'DataCell';

                    if ($type === 'Number' && (is_numeric($rawVal) || $rawVal === 0)) {
                        $val = (float) $rawVal;
                        fwrite($handle, "    <Cell ss:StyleID=\"{$style}\"><Data ss:Type=\"Number\">{$val}</Data></Cell>\n");
                    } else {
                        $val = htmlspecialchars((string) $rawVal, ENT_XML1, 'UTF-8');
                        fwrite($handle, "    <Cell ss:StyleID=\"{$style}\"><Data ss:Type=\"String\">{$val}</Data></Cell>\n");
                    }
                }
                fwrite($handle, "   </Row>\n");
            }

            // Stream Summary / Total Row
            if ($summaryCallback) {
                $summaryCells = $summaryCallback();
                if (!empty($summaryCells)) {
                    fwrite($handle, "   <Row ss:Height=\"22\">\n");
                    foreach ($summaryCells as $cell) {
                        $rawVal = $cell['value'] ?? '';
                        $type = $cell['type'] ?? 'String';
                        $style = $cell['style'] ?? 'TotalLabel';

                        if ($type === 'Number' && (is_numeric($rawVal) || $rawVal === 0)) {
                            $val = (float) $rawVal;
                            fwrite($handle, "    <Cell ss:StyleID=\"{$style}\"><Data ss:Type=\"Number\">{$val}</Data></Cell>\n");
                        } else {
                            $val = htmlspecialchars((string) $rawVal, ENT_XML1, 'UTF-8');
                            fwrite($handle, "    <Cell ss:StyleID=\"{$style}\"><Data ss:Type=\"String\">{$val}</Data></Cell>\n");
                        }
                    }
                    fwrite($handle, "   </Row>\n");
                }
            }

            // Close Table, Worksheet, Workbook
            fwrite($handle, "  </Table>\n");
            fwrite($handle, " </Worksheet>\n");
            fwrite($handle, "</Workbook>\n");

            fclose($handle);
        }, 200, $responseHeaders);
    }
}
