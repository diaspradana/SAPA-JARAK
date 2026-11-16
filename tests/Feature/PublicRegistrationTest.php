<?php

namespace Tests\Feature;

use App\Models\Application;
use App\Models\Beneficiary;
use App\Models\Hamlet;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PublicRegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_warga_can_register_without_an_account_type(): void
    {
        $hamlet = $this->createExistingLocation();
        $response = $this->postJson('/api/auth/register', [
            'name' => 'Warga Jarak',
            'phone' => '081234567890',
            'password' => 'secret123',
            'hamlet_id' => $hamlet->id,
            'nik' => '3506010101010001',
            'kk_number' => '3506010101010002',
            'rt' => '01',
            'rw' => '01',
            'address' => 'Dusun Jarak Lor',
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.user.role', 'public');

        $this->assertDatabaseHas('users', [
            'phone' => '081234567890',
            'role' => 'public',
            'hamlet_id' => $hamlet->id,
            'nik' => '3506010101010001',
            'kk_number' => '3506010101010002',
            'rt' => '01',
            'rw' => '01',
            'address' => 'Dusun Jarak Lor',
        ]);
    }

    public function test_warga_can_register_with_an_empty_auth_code(): void
    {
        $hamlet = $this->createExistingLocation();
        $response = $this->postJson('/api/auth/register', [
            'name' => 'Warga Jarak',
            'phone' => '081234567895',
            'password' => 'secret123',
            'account_type' => 'warga',
            'auth_code' => '',
            'hamlet_id' => $hamlet->id,
            'nik' => '3506010101010003',
            'kk_number' => '3506010101010004',
            'rt' => '01',
            'rw' => '01',
            'address' => 'Dusun Jarak Lor',
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.user.role', 'public');
    }

    public function test_warga_registration_requires_identity_and_address_fields(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'name' => 'Warga Tanpa Identitas',
            'phone' => '081234567899',
            'password' => 'secret123',
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['hamlet_id', 'nik', 'kk_number', 'rt', 'rw', 'address']);
        $this->assertDatabaseMissing('users', ['phone' => '081234567899']);
    }

    public function test_warga_registration_rejects_rt_rw_not_recorded_for_selected_hamlet(): void
    {
        $hamlet = $this->createExistingLocation();

        $response = $this->postJson('/api/auth/register', [
            'name' => 'Warga RT Tidak Terdaftar',
            'phone' => '081234567896',
            'password' => 'secret123',
            'account_type' => 'warga',
            'hamlet_id' => $hamlet->id,
            'nik' => '3506010101010005',
            'kk_number' => '3506010101010006',
            'rt' => '99',
            'rw' => '01',
            'address' => 'Jalan Desa',
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['rt']);
        $this->assertDatabaseMissing('users', ['phone' => '081234567896']);
    }

    public function test_application_submission_rejects_rt_rw_not_recorded_for_selected_hamlet(): void
    {
        $hamlet = $this->createExistingLocation();

        $this->postJson('/api/public/applications', [
            'beneficiary_name' => 'Penerima Bantuan',
            'hamlet_id' => $hamlet->id,
            'rt' => '99',
            'rw' => '01',
            'address' => 'Alamat rumah',
            'assistance_type' => 'RTLH',
            'reporter_phone' => '081234567898',
            'otp' => '123456',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['rt']);

        $this->assertDatabaseCount('applications', 0);
    }

    public function test_disability_application_requires_disability_specific_details_and_saves_them(): void
    {
        $hamlet = $this->createExistingLocation();
        $payload = [
            'beneficiary_name' => 'Penerima Disabilitas',
            'hamlet_id' => $hamlet->id,
            'rt' => '01',
            'rw' => '01',
            'address' => 'Alamat rumah',
            'assistance_type' => 'DISABILITAS',
            'reporter_phone' => '081234567898',
            'description' => 'Membutuhkan bantuan untuk aktivitas setiap hari.',
            'assistance_details' => [
                'disability_type' => 'fisik',
                'requested_device' => 'kursi_roda_standar',
                'functional_impact' => 'Penerima sulit berjalan dan berpindah tempat.',
            ],
            'otp' => '123456',
        ];

        $this->postJson('/api/public/applications', $payload)
            ->assertCreated();

        $this->assertDatabaseHas('applications', [
            'assistance_type' => 'DISABILITAS',
            'assistance_details->requested_device' => 'kursi_roda_standar',
        ]);
    }

    public function test_disability_application_requires_its_own_form_fields(): void
    {
        $hamlet = $this->createExistingLocation();

        $this->postJson('/api/public/applications', [
            'beneficiary_name' => 'Penerima Disabilitas',
            'hamlet_id' => $hamlet->id,
            'rt' => '01',
            'rw' => '01',
            'address' => 'Alamat rumah',
            'assistance_type' => 'DISABILITAS',
            'reporter_phone' => '081234567898',
            'description' => 'Kondisi penerima membutuhkan dukungan.',
            'assistance_details' => ['damaged_components' => ['atap']],
            'otp' => '123456',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors([
                'assistance_details.disability_type',
                'assistance_details.requested_device',
                'assistance_details.functional_impact',
            ]);

        $this->assertDatabaseCount('applications', 0);
    }

    public function test_rtlh_application_requires_and_saves_house_damage_details(): void
    {
        $hamlet = $this->createExistingLocation();

        $this->postJson('/api/public/applications', [
            'beneficiary_name' => 'Penerima RTLH',
            'hamlet_id' => $hamlet->id,
            'rt' => '01',
            'rw' => '01',
            'address' => 'Alamat rumah',
            'assistance_type' => 'RTLH',
            'reporter_phone' => '081234567898',
            'description' => 'Atap rumah bocor dan dinding sudah lapuk.',
            'assistance_details' => [
                'damaged_components' => ['atap', 'dinding'],
                'damage_location' => 'Atap dapur',
            ],
            'otp' => '123456',
        ])->assertCreated();

        $this->assertDatabaseHas('applications', [
            'assistance_type' => 'RTLH',
            'assistance_details->damaged_components' => json_encode(['atap', 'dinding']),
        ]);
    }

    public function test_application_submission_skips_ticket_numbers_used_by_soft_deleted_applications(): void
    {
        $hamlet = $this->createExistingLocation();

        foreach (range(1, 4) as $sequence) {
            $beneficiary = Beneficiary::create([
                'name' => "Warga {$sequence}",
                'hamlet_id' => $hamlet->id,
                'address' => 'Alamat rumah',
            ]);
            $application = Application::create([
                'ticket_number' => sprintf('#JRK-JL-%s-%03d', now()->format('Y'), $sequence),
                'beneficiary_id' => $beneficiary->id,
                'hamlet_id' => $hamlet->id,
                'assistance_type' => 'RTLH',
                'status' => 'SUBMITTED',
                'submitted_at' => now(),
            ]);

            if ($sequence === 4) {
                $application->delete();
            }
        }

        $this->postJson('/api/public/applications', [
            'beneficiary_name' => 'Penerima Bantuan',
            'hamlet_id' => $hamlet->id,
            'rt' => '01',
            'rw' => '01',
            'address' => 'Alamat rumah',
            'assistance_type' => 'RTLH',
            'reporter_phone' => '081234567898',
            'description' => 'Atap rumah bocor dan dinding sudah lapuk.',
            'assistance_details' => ['damaged_components' => ['atap']],
            'otp' => '123456',
        ])->assertCreated()
            ->assertJsonPath('data.ticket_number', '#JRK-JL-' . now()->format('Y') . '-005');
    }

    public function test_public_hamlet_options_use_rt_rw_values_recorded_in_database(): void
    {
        $hamlet = $this->createExistingLocation();
        Beneficiary::create([
            'name' => 'Warga Kedua',
            'hamlet_id' => $hamlet->id,
            'rt' => '02',
            'rw' => '03',
            'address' => 'Jalan Desa',
        ]);

        $this->getJson('/api/public/hamlets')
            ->assertOk()
            ->assertJsonPath('data.0.rt_values', ['01', '02'])
            ->assertJsonPath('data.0.rw_values', ['01', '03']);
    }

    public function test_warga_can_update_profile_with_database_backed_hamlet_and_rt_rw(): void
    {
        $hamlet = $this->createExistingLocation();
        Beneficiary::create([
            'name' => 'Warga RT Kedua',
            'hamlet_id' => $hamlet->id,
            'rt' => '02',
            'rw' => '01',
            'address' => 'Jalan Desa',
        ]);
        $user = User::create([
            'name' => 'Warga Profil',
            'phone' => '081234567897',
            'password' => 'secret123',
            'role' => 'public',
            'hamlet_id' => $hamlet->id,
            'rt' => '01',
            'rw' => '01',
            'address' => 'Alamat Lama',
        ]);
        Sanctum::actingAs($user);

        $this->putJson('/api/warga/profile', [
            'hamlet_id' => $hamlet->id,
            'rt' => '02',
            'rw' => '01',
            'address' => 'Alamat Baru',
        ])->assertOk()
            ->assertJsonPath('data.hamlet_id', $hamlet->id)
            ->assertJsonPath('data.rt', '02')
            ->assertJsonPath('data.rw', '01');

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'hamlet_id' => $hamlet->id,
            'rt' => '02',
            'rw' => '01',
            'address' => 'Alamat Baru',
        ]);
    }

    public function test_admin_desa_registration_requires_the_configured_invitation_code(): void
    {
        config(['services.admin_registration_code' => 'secure-invitation']);

        $response = $this->postJson('/api/auth/register', [
            'name' => 'Admin Desa',
            'phone' => '081234567891',
            'email' => 'admin.baru@jarak-kediri.desa.id',
            'password' => 'secret123',
            'account_type' => 'admin_desa',
            'auth_code' => 'wrong-code',
        ]);

        $response->assertForbidden();
        $this->assertDatabaseMissing('users', ['phone' => '081234567891']);
    }

    public function test_admin_desa_registration_is_disabled_without_a_configured_invitation_code(): void
    {
        config(['services.admin_registration_code' => null]);

        $response = $this->postJson('/api/auth/register', [
            'name' => 'Admin Desa',
            'phone' => '081234567894',
            'email' => 'admin.tanpa.kode@jarak-kediri.desa.id',
            'password' => 'secret123',
            'account_type' => 'admin_desa',
            'auth_code' => 'any-code',
        ]);

        $response->assertForbidden();
        $this->assertDatabaseMissing('users', ['phone' => '081234567894']);
    }

    public function test_admin_desa_registration_always_creates_an_admin_role(): void
    {
        config(['services.admin_registration_code' => 'secure-invitation']);

        $response = $this->postJson('/api/auth/register', [
            'name' => 'Admin Desa',
            'phone' => '081234567892',
            'email' => 'admin.baru@jarak-kediri.desa.id',
            'password' => 'secret123',
            'account_type' => 'admin_desa',
            'auth_code' => 'SECURE-INVITATION',
            'role' => 'kades',
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.user.role', 'admin');

        $this->assertDatabaseHas('users', [
            'phone' => '081234567892',
            'role' => 'admin',
        ]);
        $this->assertDatabaseMissing('users', [
            'phone' => '081234567892',
            'role' => 'kades',
        ]);
    }

    public function test_public_registration_rejects_other_officer_account_types(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'name' => 'Petugas',
            'phone' => '081234567893',
            'password' => 'secret123',
            'account_type' => 'petugas_desa',
        ]);

        $response->assertUnprocessable();
        $this->assertDatabaseMissing('users', ['phone' => '081234567893']);
    }

    private function createExistingLocation(): Hamlet
    {
        $hamlet = Hamlet::create([
            'name' => 'Dusun Jarak Lor',
            'code' => 'JL',
            'status' => 'active',
        ]);

        Beneficiary::create([
            'name' => 'Warga Lama',
            'hamlet_id' => $hamlet->id,
            'rt' => '01',
            'rw' => '01',
            'address' => 'Jalan Desa',
        ]);

        return $hamlet;
    }
}
