<?php

namespace Tests\Feature;

use App\Models\Application;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class ServerDemoDataTest extends TestCase
{
    use RefreshDatabase;

    public function test_demo_accounts_are_read_from_database_without_exposing_passwords(): void
    {
        $this->seed(DatabaseSeeder::class);

        $this->getJson('/api/auth/demo-accounts')
            ->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonFragment([
                'email' => 'warga@jarak-kediri.desa.id',
                'role' => 'public',
            ])
            ->assertJsonMissingPath('data.0.password');

        $this->getJson('/api/public/transparency/metrics')
            ->assertOk()
            ->assertJsonPath('data.total_applications', 3)
            ->assertJsonPath('data.total_completed', 1)
            ->assertJsonPath('data.total_in_progress', 2);
    }

    public function test_demo_application_seeder_can_run_repeatedly_without_duplicates(): void
    {
        $this->seed(DatabaseSeeder::class);
        $this->seed(DatabaseSeeder::class);

        $this->assertSame(3, Application::whereIn('ticket_number', [
            '#JRK-KLS-2026-009',
            '#JRK-JL-2026-004',
            '#JRK-SG-2026-012',
        ])->count());
    }

    public function test_kasun_survey_schedule_is_persisted_and_scoped_to_the_assigned_hamlet(): void
    {
        $this->seed(DatabaseSeeder::class);
        $kasun = User::where('phone', '081234567801')->firstOrFail();
        $application = Application::where('hamlet_id', $kasun->hamlet_id)->firstOrFail();
        $otherHamletApplication = Application::where('hamlet_id', '!=', $kasun->hamlet_id)->firstOrFail();

        $this->actingAs($kasun, 'sanctum')
            ->putJson("/api/kasun/applications/{$application->id}/schedule", [
                'scheduled_at' => '2026-10-12 09:00:00',
            ])
            ->assertOk()
            ->assertJsonPath('success', true);

        $this->assertDatabaseHas('applications', [
            'id' => $application->id,
            'survey_scheduled_at' => '2026-10-12 09:00:00',
        ]);
        $this->assertDatabaseHas('audit_logs', [
            'application_id' => $application->id,
            'user_id' => $kasun->id,
            'action' => 'SURVEY_SCHEDULE_UPDATED',
        ]);

        $this->putJson("/api/kasun/applications/{$otherHamletApplication->id}/schedule", [
            'scheduled_at' => '2026-10-13 09:00:00',
        ])->assertNotFound();
    }

    public function test_warga_profile_and_password_changes_are_saved_to_the_server(): void
    {
        $this->seed(DatabaseSeeder::class);
        $warga = User::where('phone', '081399881234')->firstOrFail();

        $this->actingAs($warga, 'sanctum')
            ->putJson('/api/warga/profile', [
                'name' => 'Danang Prasetyo',
                'email' => 'danang.updated@example.test',
                'phone' => $warga->phone,
                'nik' => '3506000000000001',
                'kk_number' => '3506000000000002',
                'rt' => '02',
                'rw' => '04',
                'address' => 'Dusun Kalasan, RT 02/RW 04',
            ])
            ->assertOk()
            ->assertJsonPath('data.nik', '3506000000000001')
            ->assertJsonPath('data.kk_number', '3506000000000002');

        $this->assertDatabaseHas('users', [
            'id' => $warga->id,
            'email' => 'danang.updated@example.test',
            'nik' => '3506000000000001',
            'address' => 'Dusun Kalasan, RT 02/RW 04',
        ]);

        $this->putJson('/api/auth/password', [
            'current_password' => 'password',
            'new_password' => 'password-updated',
            'new_password_confirmation' => 'password-updated',
        ])->assertOk();

        $this->assertTrue(Hash::check('password-updated', $warga->fresh()->password));
    }

    public function test_public_role_switching_and_user_listing_endpoints_are_not_available(): void
    {
        $this->get('/api/auth/users')
            ->assertOk()
            ->assertHeader('content-type', 'text/html; charset=utf-8');
        $this->postJson('/api/auth/switch-role', ['role' => 'admin'])->assertStatus(405);
    }
}
