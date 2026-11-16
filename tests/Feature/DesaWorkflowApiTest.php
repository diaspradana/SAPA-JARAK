<?php

namespace Tests\Feature;

use App\Models\Application;
use App\Models\Beneficiary;
use App\Models\Hamlet;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class DesaWorkflowApiTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private Hamlet $hamlet;

    protected function setUp(): void
    {
        parent::setUp();

        $this->hamlet = Hamlet::create([
            'name' => 'Dusun Contoh',
            'code' => 'CNT',
            'status' => 'active',
        ]);
        $this->admin = User::create([
            'name' => 'Admin Desa',
            'email' => 'admin.desa@example.test',
            'phone' => '081234567890',
            'password' => bcrypt('password'),
            'role' => 'admin',
            'status' => 'active',
        ]);
        Sanctum::actingAs($this->admin, ['role:admin', '*']);
    }

    public function test_procurement_requires_an_approved_application(): void
    {
        $application = $this->createApplication('FORWARDED_TO_VILLAGE');

        $this->postJson("/api/desa/applications/{$application->id}/procurement", [
            'progress_percentage' => 0,
        ])
            ->assertUnprocessable()
            ->assertJsonPath('message', 'RAB dan progres hanya dapat dicatat setelah bantuan disetujui.');
    }

    public function test_rejected_application_cannot_enter_procurement_or_handover(): void
    {
        $application = $this->createApplication('REJECTED');

        $this->postJson("/api/desa/applications/{$application->id}/procurement", [
            'progress_percentage' => 0,
        ])
            ->assertUnprocessable();

        $this->postJson("/api/desa/applications/{$application->id}/handover", [
            'bast_number' => 'BAST/TEST/001',
            'handover_date' => now()->toDateString(),
            'recipient_name' => 'Warga Contoh',
        ])
            ->assertUnprocessable()
            ->assertJsonPath('message', 'BAST hanya dapat dibuat setelah progres pelaksanaan mencapai 100%.');
    }

    public function test_handover_requires_completed_procurement(): void
    {
        $application = $this->createApplication('APPROVED');

        $this->postJson("/api/desa/applications/{$application->id}/handover", [
            'bast_number' => 'BAST/TEST/002',
            'handover_date' => now()->toDateString(),
            'recipient_name' => 'Warga Contoh',
        ])
            ->assertUnprocessable()
            ->assertJsonPath('message', 'BAST hanya dapat dibuat setelah progres pelaksanaan mencapai 100%.');
    }

    private function createApplication(string $status): Application
    {
        $beneficiary = Beneficiary::create([
            'name' => 'Warga Contoh',
            'hamlet_id' => $this->hamlet->id,
            'address' => 'RT 01 / RW 01',
        ]);

        return Application::create([
            'ticket_number' => "TEST-{$status}-" . uniqid(),
            'beneficiary_id' => $beneficiary->id,
            'hamlet_id' => $this->hamlet->id,
            'assistance_type' => 'RTLH',
            'status' => $status,
            'submitted_at' => now(),
        ]);
    }
}
