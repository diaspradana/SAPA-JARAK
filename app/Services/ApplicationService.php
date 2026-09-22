<?php

namespace App\Services;

use App\Models\Application;
use App\Models\Beneficiary;
use App\Models\Hamlet;
use App\Models\Notification;
use App\Models\AuditLog;
use Illuminate\Support\Str;
use Carbon\Carbon;

class ApplicationService
{
    /**
     * Generate standard ticket number: #JRK-{DUSUN_CODE}-{YEAR}-{SEQ}
     * e.g. #JRK-KLS-2026-009
     */
    public function generateTicketNumber(Hamlet $hamlet): string
    {
        $year = date('Y');
        $code = strtoupper($hamlet->code ?? 'DS');
        $count = Application::where('hamlet_id', $hamlet->id)
            ->whereYear('created_at', $year)
            ->count() + 1;

        $sequence = str_pad($count, 3, '0', STR_PAD_LEFT);
        return "#JRK-{$code}-{$year}-{$sequence}";
    }

    /**
     * Create application with beneficiary.
     */
    public function createApplication(array $data): Application
    {
        $hamlet = Hamlet::findOrFail($data['hamlet_id']);

        // 1. Create / find beneficiary
        $beneficiary = Beneficiary::create([
            'name' => $data['beneficiary_name'],
            'nik' => $data['nik'] ?? null,
            'kk_number' => $data['kk_number'] ?? null,
            'phone' => $data['beneficiary_phone'] ?? null,
            'hamlet_id' => $hamlet->id,
            'rt' => $data['rt'] ?? '01',
            'rw' => $data['rw'] ?? '01',
            'address' => $data['address'] ?? 'Desa Jarak',
            'is_unregistered' => !empty($data['is_unregistered']),
            'dtks_status' => $data['dtks_status'] ?? 'Belum Terdaftar',
        ]);

        // 2. Generate ticket
        $ticket = $this->generateTicketNumber($hamlet);

        // 3. Create Application
        $application = Application::create([
            'ticket_number' => $ticket,
            'beneficiary_id' => $beneficiary->id,
            'hamlet_id' => $hamlet->id,
            'reporter_name' => $data['reporter_name'] ?? $beneficiary->name,
            'reporter_phone' => $data['reporter_phone'] ?? $beneficiary->phone,
            'reporter_relationship' => $data['reporter_relationship'] ?? 'Diri Sendiri',
            'assistance_type' => $data['assistance_type'],
            'status' => 'SUBMITTED',
            'description' => $data['description'] ?? null,
            'needs_description' => $data['needs_description'] ?? null,
            'submitted_at' => now(),
        ]);

        // 4. Log audit
        AuditLog::create([
            'application_id' => $application->id,
            'actor_name' => $application->reporter_name,
            'action' => 'APPLICATION_SUBMITTED',
            'entity_type' => Application::class,
            'entity_id' => $application->id,
            'new_values' => [
                'ticket' => $ticket,
                'type' => $application->assistance_type,
                'beneficiary' => $beneficiary->name,
            ],
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);

        return $application;
    }

    /**
     * Transition application status safely.
     */
    public function updateStatus(Application $application, string $newStatus, ?string $actor = null, ?array $meta = []): Application
    {
        $oldStatus = $application->status;
        $application->status = $newStatus;

        if ($newStatus === 'KASUN_VERIFICATION' || $newStatus === 'FORWARDED_TO_VILLAGE') {
            $application->verified_at = now();
        } elseif ($newStatus === 'APPROVED') {
            $application->approved_at = now();
        } elseif ($newStatus === 'COMPLETED') {
            $application->completed_at = now();
        }

        $application->save();

        AuditLog::create([
            'application_id' => $application->id,
            'actor_name' => $actor ?? 'System',
            'action' => 'STATUS_CHANGED',
            'entity_type' => Application::class,
            'entity_id' => $application->id,
            'old_values' => ['status' => $oldStatus],
            'new_values' => ['status' => $newStatus, 'meta' => $meta],
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);

        return $application;
    }
}
