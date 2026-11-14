<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PublicRegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_warga_can_register_without_an_account_type(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'name' => 'Warga Jarak',
            'phone' => '081234567890',
            'password' => 'secret123',
            'nik' => '3506010101010001',
            'kk_number' => '3506010101010002',
            'rt' => '01',
            'rw' => '02',
            'address' => 'Dusun Jarak Lor',
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.user.role', 'public');

        $this->assertDatabaseHas('users', [
            'phone' => '081234567890',
            'role' => 'public',
            'nik' => '3506010101010001',
            'kk_number' => '3506010101010002',
            'rt' => '01',
            'rw' => '02',
            'address' => 'Dusun Jarak Lor',
        ]);
    }

    public function test_warga_registration_requires_identity_and_address_fields(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'name' => 'Warga Tanpa Identitas',
            'phone' => '081234567899',
            'password' => 'secret123',
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['nik', 'kk_number', 'rt', 'rw', 'address']);
        $this->assertDatabaseMissing('users', ['phone' => '081234567899']);
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
}
