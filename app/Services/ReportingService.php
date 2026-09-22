<?php

namespace App\Services;

use App\Models\Application;
use App\Models\Funding;
use App\Models\Hamlet;

class ReportingService
{
    /**
     * Generate SPJ dataset for government audit & accountability.
     */
    public function generateSpjReport(array $filters = []): array
    {
        $query = Application::with(['beneficiary', 'hamlet', 'funding', 'procurement', 'handover', 'latestVerification'])
            ->where('status', 'COMPLETED');

        if (!empty($filters['hamlet_id'])) {
            $query->where('hamlet_id', $filters['hamlet_id']);
        }

        if (!empty($filters['year'])) {
            $year = $filters['year'];
            $query->whereYear('completed_at', $year);
        }

        $records = $query->latest('completed_at')->get();

        $rows = $records->map(function ($app, $idx) {
            return [
                'no' => $idx + 1,
                'ticket_number' => $app->ticket_number,
                'beneficiary_name' => $app->beneficiary->name,
                'nik' => $app->beneficiary->nik ?? 'Terlantar (Tanpa Berkas)',
                'hamlet' => $app->hamlet->name,
                'address' => "RT {$app->beneficiary->rt} / RW {$app->beneficiary->rw}, {$app->hamlet->name}",
                'assistance_type' => $app->assistance_type,
                'funding_source' => $app->funding->source ?? 'APBDES_DANA_DESA',
                'account_code' => $app->funding->account_code ?? '02.01.05',
                'realized_budget' => $app->funding->realized_budget ?? 0,
                'bast_number' => $app->handover->bast_number ?? '-',
                'completion_date' => $app->completed_at ? $app->completed_at->format('d/m/Y') : '-',
            ];
        });

        $totalRealization = $records->sum(function ($app) {
            return $app->funding->realized_budget ?? 0;
        });

        return [
            'village_name' => 'Desa Jarak',
            'subdistrict' => 'Kecamatan Plosoklaten',
            'district' => 'Kabupaten Kediri',
            'fiscal_year' => $filters['year'] ?? date('Y'),
            'total_recipients' => $records->count(),
            'total_realization' => $totalRealization,
            'records' => $rows,
        ];
    }
}
