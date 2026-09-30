<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Hamlet;
use App\Models\Setting;
use App\Models\AuditLog;
use App\Services\ScoringService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;

class AdminApiTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $kades;
    protected User $kasun;
    protected Hamlet $hamletKalasan;

    protected function setUp(): void
    {
        parent::setUp();

        $this->hamletKalasan = Hamlet::create([
            'name' => 'Dusun Kalasan',
            'code' => 'KLS',
            'head_name' => 'Bpk. Agus Santoso',
            'head_phone' => '081234567803',
            'status' => 'active',
        ]);

        $this->admin = User::create([
            'name' => 'Administrator SAPA-JARAK',
            'email' => 'admin@jarak-kediri.desa.id',
            'phone' => '081234567000',
            'password' => bcrypt('password'),
            'role' => 'admin',
            'status' => 'active',
        ]);

        $this->kades = User::create([
            'name' => 'Bpk. Drs. H. Supriyadi (Kepala Desa)',
            'email' => 'kades@jarak-kediri.desa.id',
            'phone' => '081234567003',
            'password' => bcrypt('password'),
            'role' => 'kades',
            'status' => 'active',
        ]);

        $this->kasun = User::create([
            'name' => 'Bpk. Agus Santoso (Kasun Kalasan)',
            'email' => 'kasun.kalasan@jarak-kediri.desa.id',
            'phone' => '081234567803',
            'password' => bcrypt('password'),
            'role' => 'kasun',
            'hamlet_id' => $this->hamletKalasan->id,
            'status' => 'active',
        ]);
    }

    public function test_unauthenticated_request_to_admin_endpoints_returns_401(): void
    {
        $response = $this->getJson('/api/admin/overview');
        $response->assertStatus(401);

        $responseUsers = $this->getJson('/api/admin/users');
        $responseUsers->assertStatus(401);

        $responseSettings = $this->getJson('/api/admin/settings');
        $responseSettings->assertStatus(401);

        $responseAudit = $this->getJson('/api/admin/audit-logs');
        $responseAudit->assertStatus(401);
    }

    public function test_forbidden_for_non_admin_or_kades_users(): void
    {
        Sanctum::actingAs($this->kasun, ['role:kasun', '*']);

        $response = $this->getJson('/api/admin/overview');
        $response->assertStatus(403);
        $response->assertJson([
            'success' => false,
        ]);
    }

    public function test_admin_can_access_overview(): void
    {
        Sanctum::actingAs($this->admin, ['role:admin', '*']);

        $response = $this->getJson('/api/admin/overview');
        $response->assertStatus(200);
        $response->assertJsonStructure([
            'success',
            'data' => [
                'users' => ['total', 'active', 'inactive', 'by_role'],
                'hamlets' => ['total', 'active'],
                'applications' => ['total', 'submitted', 'approved', 'completed', 'rejected'],
                'audit_logs' => ['total', 'today'],
                'storage' => ['total_files', 'total_bytes'],
                'village_profile',
                'scoring',
            ],
        ]);
    }

    public function test_admin_can_list_users_with_filters(): void
    {
        Sanctum::actingAs($this->admin, ['role:admin', '*']);

        $response = $this->getJson('/api/admin/users?role=kasun');
        $response->assertStatus(200);
        $response->assertJsonPath('pagination.total', 1);
        $response->assertJsonFragment([
            'email' => 'kasun.kalasan@jarak-kediri.desa.id',
            'role' => 'kasun',
        ]);
    }

    public function test_admin_can_create_new_apparatus_user(): void
    {
        Sanctum::actingAs($this->admin, ['role:admin', '*']);

        $payload = [
            'name' => 'Bpk. Hendro Siswanto (Sekdes)',
            'email' => 'sekdes.baru@jarak-kediri.desa.id',
            'phone' => '081234567999',
            'password' => 'secret123',
            'role' => 'sekdes',
            'status' => 'active',
        ];

        $response = $this->postJson('/api/admin/users', $payload);
        $response->assertStatus(201);
        $response->assertJson([
            'success' => true,
        ]);

        $this->assertDatabaseHas('users', [
            'email' => 'sekdes.baru@jarak-kediri.desa.id',
            'role' => 'sekdes',
        ]);

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'USER_CREATED',
            'entity_type' => User::class,
        ]);
    }

    public function test_admin_cannot_create_user_with_duplicate_email_or_phone(): void
    {
        Sanctum::actingAs($this->admin, ['role:admin', '*']);

        $payload = [
            'name' => 'Duplikat Admin',
            'email' => 'admin@jarak-kediri.desa.id', // Already exists
            'phone' => '081299999999',
            'password' => 'secret123',
            'role' => 'admin',
        ];

        $response = $this->postJson('/api/admin/users', $payload);
        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['email']);
    }

    public function test_admin_can_show_and_update_user(): void
    {
        Sanctum::actingAs($this->admin, ['role:admin', '*']);

        // Show user
        $responseShow = $this->getJson("/api/admin/users/{$this->kasun->id}");
        $responseShow->assertStatus(200);
        $responseShow->assertJsonPath('data.id', $this->kasun->id);

        // Update user
        $updatePayload = [
            'name' => 'Bpk. Agus Santoso S.Sos',
            'phone' => '081234567899',
            'status' => 'inactive',
        ];

        $responseUpdate = $this->putJson("/api/admin/users/{$this->kasun->id}", $updatePayload);
        $responseUpdate->assertStatus(200);

        $this->assertDatabaseHas('users', [
            'id' => $this->kasun->id,
            'name' => 'Bpk. Agus Santoso S.Sos',
            'status' => 'inactive',
        ]);

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'USER_UPDATED',
            'entity_id' => $this->kasun->id,
        ]);
    }

    public function test_admin_cannot_delete_self(): void
    {
        Sanctum::actingAs($this->admin, ['role:admin', '*']);

        $response = $this->deleteJson("/api/admin/users/{$this->admin->id}");
        $response->assertStatus(422);
        $this->assertDatabaseHas('users', ['id' => $this->admin->id]);
    }

    public function test_admin_can_delete_other_user(): void
    {
        Sanctum::actingAs($this->admin, ['role:admin', '*']);

        $userToDelete = User::create([
            'name' => 'Staf Magang',
            'email' => 'magang@jarak.desa.id',
            'phone' => '081298765432',
            'password' => bcrypt('password'),
            'role' => 'public',
        ]);

        $response = $this->deleteJson("/api/admin/users/{$userToDelete->id}");
        $response->assertStatus(200);

        $this->assertDatabaseMissing('users', ['id' => $userToDelete->id]);
        $this->assertDatabaseHas('audit_logs', [
            'action' => 'USER_DELETED',
            'entity_id' => $userToDelete->id,
        ]);
    }

    public function test_admin_can_manage_hamlets(): void
    {
        Sanctum::actingAs($this->admin, ['role:admin', '*']);

        // 1. List Hamlets
        $responseList = $this->getJson('/api/admin/hamlets');
        $responseList->assertStatus(200);
        $responseList->assertJsonStructure(['success', 'data']);

        // 2. Create Hamlet
        $responseCreate = $this->postJson('/api/admin/hamlets', [
            'name' => 'Dusun Baru Krajan',
            'code' => 'KRJ',
            'head_name' => 'Bpk. Marzuki',
            'head_phone' => '081233445566',
            'status' => 'active',
        ]);
        $responseCreate->assertStatus(201);
        $newHamletId = $responseCreate->json('data.id');

        $this->assertDatabaseHas('hamlets', ['code' => 'KRJ']);
        $this->assertDatabaseHas('audit_logs', ['action' => 'HAMLET_CREATED']);

        // 3. Show Hamlet
        $responseShow = $this->getJson("/api/admin/hamlets/{$newHamletId}");
        $responseShow->assertStatus(200);

        // 4. Update Hamlet
        $responseUpdate = $this->putJson("/api/admin/hamlets/{$newHamletId}", [
            'head_name' => 'Bpk. H. Marzuki S.Pd',
        ]);
        $responseUpdate->assertStatus(200);
        $this->assertDatabaseHas('hamlets', [
            'id' => $newHamletId,
            'head_name' => 'Bpk. H. Marzuki S.Pd',
        ]);

        // 5. Delete Hamlet
        $responseDelete = $this->deleteJson("/api/admin/hamlets/{$newHamletId}");
        $responseDelete->assertStatus(200);
        $this->assertDatabaseMissing('hamlets', ['id' => $newHamletId]);
        $this->assertDatabaseHas('audit_logs', ['action' => 'HAMLET_DELETED']);
    }

    public function test_admin_can_get_and_update_settings(): void
    {
        Sanctum::actingAs($this->admin, ['role:admin', '*']);

        // Update settings
        $settingsPayload = [
            'village.office_phone' => '(0354) 9999999',
            'scoring.rtlh_weights' => [
                'dinding' => 30,
                'lantai' => 30,
                'atap' => 20,
                'mck' => 20,
            ],
            'notification.whatsapp_enabled' => false,
        ];

        $response = $this->putJson('/api/admin/settings', [
            'settings' => $settingsPayload,
        ]);
        $response->assertStatus(200);

        $this->assertEquals('(0354) 9999999', Setting::get('village.office_phone'));
        $this->assertEquals(30, Setting::get('scoring.rtlh_weights')['dinding']);
        $this->assertFalse(Setting::get('notification.whatsapp_enabled'));

        $this->assertDatabaseHas('audit_logs', [
            'action' => 'SETTINGS_UPDATED',
        ]);

        // Get single setting
        $responseSingle = $this->getJson('/api/admin/settings/village.office_phone');
        $responseSingle->assertStatus(200);
        $responseSingle->assertJsonPath('value', '(0354) 9999999');
    }

    public function test_scoring_service_dynamically_adapts_to_updated_settings(): void
    {
        $scoringService = new ScoringService();

        // 1. Default weights (25 each)
        $defaultScore = $scoringService->calculateRtlhScore([
            'dinding_rusak' => true, // 25
            'lantai_tanah' => true,  // 25
            'atap_bocor' => false,   // 0
            'tidak_ada_mck' => false // 0
        ]);
        $this->assertEquals(50, $defaultScore['total_score']);
        $this->assertTrue($defaultScore['is_eligible']);

        // 2. Admin adjusts weights: dinding becomes 40, others 20
        Setting::set('scoring.rtlh_weights', [
            'dinding' => 40,
            'lantai' => 20,
            'atap' => 20,
            'mck' => 20,
        ], 'scoring', 'json');

        $updatedScore = $scoringService->calculateRtlhScore([
            'dinding_rusak' => true, // now 40
            'lantai_tanah' => true,  // now 20
            'atap_bocor' => false,   // 0
            'tidak_ada_mck' => false // 0
        ]);
        $this->assertEquals(60, $updatedScore['total_score']);
        $this->assertEquals('SEDANG', $updatedScore['urgency']);
    }

    public function test_admin_can_view_and_filter_audit_logs(): void
    {
        Sanctum::actingAs($this->admin, ['role:admin', '*']);

        // Create some audit entries
        AuditLog::create([
            'user_id' => $this->admin->id,
            'actor_name' => $this->admin->name,
            'action' => 'TEST_ADMIN_ACTION',
            'entity_type' => 'App\Models\Setting',
            'entity_id' => 1,
            'ip_address' => '127.0.0.1',
        ]);

        $response = $this->getJson('/api/admin/audit-logs');
        $response->assertStatus(200);
        $response->assertJsonStructure([
            'success',
            'stats' => ['total_logs', 'today_logs', 'top_actions'],
            'data',
            'pagination',
        ]);

        // Filter by action
        $responseFilter = $this->getJson('/api/admin/audit-logs?action=TEST_ADMIN_ACTION');
        $responseFilter->assertStatus(200);
        $responseFilter->assertJsonFragment([
            'action' => 'TEST_ADMIN_ACTION',
        ]);

        // Detail of single audit log
        $logId = $responseFilter->json('data.0.id');
        $responseShow = $this->getJson("/api/admin/audit-logs/{$logId}");
        $responseShow->assertStatus(200);
        $responseShow->assertJsonPath('data.action', 'TEST_ADMIN_ACTION');
    }
}
