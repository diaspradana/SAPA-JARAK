<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\VillageApplicationFilterRequest;
use App\Models\Application;
use App\Models\ApplicationScore;
use Illuminate\Http\JsonResponse;

class VillageController extends Controller
{
    /**
     * Status pengajuan yang berada pada tahap peninjauan Pemerintah Desa
     * (setelah hasil survei Kasun diteruskan / dikembalikan ke desa).
     */
    private const VILLAGE_REVIEW_STATUSES = ['FORWARDED_TO_VILLAGE', 'VILLAGE_REVIEW'];

    /**
     * Jumlah data per halaman (default) dan batas maksimal permintaan klien.
     */
    private const DEFAULT_PER_PAGE = 10;
    private const MAX_PER_PAGE = 100;

    /**
     * Daftar pengajuan tahap peninjauan desa beserta ranking SPK.
     *
     * Default diurutkan berdasarkan skor tertinggi (total_score hasil survei,
     * fallback ke priority_score) sehingga desa langsung melihat prioritas utama.
     */
    public function applications(VillageApplicationFilterRequest $request): JsonResponse
    {
        $filters = $request->validated();

        $perPage = min((int) ($filters['per_page'] ?? self::DEFAULT_PER_PAGE), self::MAX_PER_PAGE);
        $sortBy = $filters['sort_by'] ?? 'score';
        $sortDir = $filters['sort_dir'] ?? 'desc';
        $search = isset($filters['search']) ? trim((string) $filters['search']) : null;

        $query = Application::query()
            ->with(['beneficiary', 'hamlet', 'score' => fn ($score) => $score->orderByDesc('total_score')])
            ->whereIn('status', self::VILLAGE_REVIEW_STATUSES);

        // Filter jenis bantuan (RTLH / DISABILITAS).
        if (!empty($filters['assistance_type'])) {
            $query->where('assistance_type', strtoupper($filters['assistance_type']));
        }

        // Filter wilayah dusun.
        if (!empty($filters['hamlet_id'])) {
            $query->where('hamlet_id', (int) $filters['hamlet_id']);
        }

        // Filter tingkat urgensi hasil kalkulasi skor.
        if (!empty($filters['urgency_level'])) {
            $query->where('urgency_level', strtoupper($filters['urgency_level']));
        }

        // Pencarian nama atau NIK penerima bantuan.
        if ($search !== null && $search !== '') {
            $like = '%' . $search . '%';

            $query->whereHas('beneficiary', function ($beneficiary) use ($like) {
                $beneficiary->where('name', 'like', $like)
                    ->orWhere('nik', 'like', $like);
            });
        }

        $this->applySorting($query, $sortBy, $sortDir);

        $applications = $query->paginate($perPage)->withQueryString();

        return response()->json([
            'success' => true,
            'message' => 'Daftar pengajuan tahap peninjauan desa berhasil diambil.',
            'data'    => collect($applications->items())
                ->map(fn (Application $application) => $this->formatApplication($application))
                ->values()
                ->all(),
            'meta'    => [
                'current_page' => $applications->currentPage(),
                'per_page'     => $applications->perPage(),
                'total'        => $applications->total(),
                'last_page'    => $applications->lastPage(),
                'from'         => $applications->firstItem(),
                'to'           => $applications->lastItem(),
            ],
            'filters' => [
                'assistance_type' => $filters['assistance_type'] ?? null,
                'hamlet_id'       => isset($filters['hamlet_id']) ? (int) $filters['hamlet_id'] : null,
                'urgency_level'   => $filters['urgency_level'] ?? null,
                'search'          => $search,
                'sort_by'         => $sortBy,
                'sort_dir'        => $sortDir,
            ],
        ]);
    }

    /**
     * Terapkan pengurutan: default skor tertinggi (ranking SPK) di atas,
     * dengan priority_score sebagai cadangan bila skor survei belum ada.
     */
    private function applySorting($query, string $sortBy, string $sortDir): void
    {
        if ($sortBy === 'submitted_at') {
            $query->orderBy('applications.submitted_at', $sortDir);
        } else {
            // Subquery skalar: skor agregat survei (nilai tertinggi) per pengajuan,
            // tanpa join sehingga hasil paginasi tidak terduplikasi.
            $scoreSubQuery = ApplicationScore::query()
                ->select('total_score')
                ->whereColumn('application_id', 'applications.id')
                ->orderByDesc('total_score')
                ->limit(1);

            $query->orderByRaw(
                'COALESCE((' . $scoreSubQuery->toSql() . '), applications.priority_score) ' . $sortDir,
                $scoreSubQuery->getBindings()
            );
        }

        // Penentu urutan akhir agar hasil paginasi selalu deterministik.
        $query->orderBy('applications.id', 'asc');
    }

    /**
     * Bentuk payload satu pengajuan untuk kebutuhan layar peninjauan desa.
     */
    private function formatApplication(Application $application): array
    {
        $score = $application->score;
        $totalScore = $score?->total_score !== null ? (float) $score->total_score : null;
        $beneficiary = $application->beneficiary;
        $hamlet = $application->hamlet;

        return [
            'id'                => $application->id,
            'ticket_number'     => $application->ticket_number,
            'status'            => $application->status,
            'assistance_type'   => $application->assistance_type,
            'description'       => $application->description,
            'needs_description' => $application->needs_description,
            'priority_score'    => $application->priority_score,
            'urgency_level'     => $application->urgency_level,
            'total_score'       => $totalScore,
            'effective_score'   => $totalScore ?? (float) $application->priority_score,
            'is_eligible'       => $score?->is_eligible,
            'breakdown'         => $score?->breakdown,
            'reporter_name'     => $application->reporter_name,
            'reporter_phone'    => $application->reporter_phone,
            'submitted_at'      => $application->submitted_at?->toIso8601String(),
            'verified_at'       => $application->verified_at?->toIso8601String(),
            'beneficiary'       => $beneficiary ? [
                'id'              => $beneficiary->id,
                'name'            => $beneficiary->name,
                'nik'             => $beneficiary->nik,
                'kk_number'       => $beneficiary->kk_number,
                'phone'           => $beneficiary->phone,
                'address'         => $beneficiary->address,
                'rt'              => $beneficiary->rt,
                'rw'              => $beneficiary->rw,
                'dtks_status'     => $beneficiary->dtks_status,
                'is_unregistered' => $beneficiary->is_unregistered,
                'masked_name'     => $beneficiary->masked_name,
            ] : null,
            'hamlet'            => $hamlet ? [
                'id'   => $hamlet->id,
                'name' => $hamlet->name,
                'code' => $hamlet->code,
            ] : null,
        ];
    }
}
