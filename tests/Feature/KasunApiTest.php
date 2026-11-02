<?php

namespace Tests\Feature;

use App\Models\Application;
use App\Models\Beneficiary;
use App\Models\Hamlet;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class KasunApiTest extends TestCase
{
    use RefreshDatabase;

    private Hamlet $assignedHamlet;
    private Hamlet $otherHamlet;
    private User $kasun;

    protected function setUp(): void
    {
        parent::setUp();

        $this->assignedHamlet = Hamlet::create([
            'name' => 'Dusun Utara',
            'code' => 'UTR',
            'status' => 'active',
        ]);
        $this->otherHamlet = Hamlet::create([
            'name' => 'Dusun Selatan',
            'code' => 'STL',
            'status' => 'active',
        ]);
        $this->kasun = User::create([
            'name' => 'Kasun Utara',
            'email' => 'kasun.utara@example.test',
            'phone' => '081234567890',
            'password' => bcrypt('password'),
            'role' => 'kasun',
            'hamlet_id' => $this->assignedHamlet->id,
            'status' => 'active',
        ]);
    }

    public function test_kasun_queue_is_limited_to_assigned_hamlet_even_with_foreign_filter(): void
    {
        $assignedApplication = $this->createApplication($this->assignedHamlet);
        $this->createApplication($this->otherHamlet);
        Sanctum::actingAs($this->kasun, ['role:kasun', '*']);

        $response = $this->getJson('/api/kasun/queue?hamlet_id=' . $this->otherHamlet->id);

        $response->assertOk()
            ->assertJsonPath('counts.total', 1)
            ->assertJsonPath('data.0.id', $assignedApplication->id);
    }

    public function test_kasun_cannot_submit_survey_for_application_in_another_hamlet(): void
    {
        $foreignApplication = $this->createApplication($this->otherHamlet);
        Sanctum::actingAs($this->kasun, ['role:kasun', '*']);

        $this->postJson("/api/kasun/applications/{$foreignApplication->id}/survey", [])
            ->assertNotFound();
    }

    public function test_kasun_without_assigned_hamlet_cannot_list_all_applications(): void
    {
        $unassignedKasun = User::create([
            'name' => 'Kasun Belum Ditugaskan',
            'email' => 'kasun.belum@example.test',
            'phone' => '081234567891',
            'password' => bcrypt('password'),
            'role' => 'kasun',
            'status' => 'active',
        ]);
        Sanctum::actingAs($unassignedKasun, ['role:kasun', '*']);

        $this->getJson('/api/kasun/queue')->assertForbidden();
    }

    private function createApplication(Hamlet $hamlet): Application
    {
        $beneficiary = Beneficiary::create([
            'name' => 'Warga Contoh',
            'hamlet_id' => $hamlet->id,
            'address' => 'RT 01 / RW 01',
        ]);

        return Application::create([
            'ticket_number' => 'TEST-' . $hamlet->code . '-' . uniqid(),
            'beneficiary_id' => $beneficiary->id,
            'hamlet_id' => $hamlet->id,
            'assistance_type' => 'RTLH',
            'status' => 'SUBMITTED',
            'submitted_at' => now(),
        ]);
    }
}
