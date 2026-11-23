<?php

namespace Tests\Feature;

use App\Models\FiscalYear;
use App\Models\SystemSetting;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class SuperAdminSuiteTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        FiscalYear::create([
            'year' => 2026,
            'name' => '2026',
            'description' => 'Tahun Anggaran 2026',
            'is_active' => true,
            'is_locked' => false,
        ]);
    }

    public function test_super_admin_can_access_super_admin_dashboard_and_monitoring()
    {
        $superAdmin = User::factory()->superAdmin()->create();

        $this->actingAs($superAdmin)
            ->get('/super-admin/dashboard')
            ->assertStatus(200);

        $this->actingAs($superAdmin)
            ->get('/super-admin/users')
            ->assertStatus(200);

        $this->actingAs($superAdmin)
            ->get('/super-admin/audit-logs')
            ->assertStatus(200);

        $this->actingAs($superAdmin)
            ->get('/super-admin/settings')
            ->assertStatus(200);

        $this->actingAs($superAdmin)
            ->get('/super-admin/monitoring/rba')
            ->assertStatus(200);

        $this->actingAs($superAdmin)
            ->get('/super-admin/monitoring/requisitions')
            ->assertStatus(200);

        $this->actingAs($superAdmin)
            ->get('/super-admin/monitoring/finance')
            ->assertStatus(200);

        $this->actingAs($superAdmin)
            ->get('/super-admin/fiscal-years')
            ->assertStatus(200);
    }

    public function test_non_super_admin_cannot_access_super_admin_routes()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $perencanaan = User::factory()->create(['role' => 'perencanaan']);
        $keuangan = User::factory()->create(['role' => 'keuangan']);
        $divisi = User::factory()->create(['role' => 'divisi']);

        $this->actingAs($admin)->get('/super-admin/dashboard')->assertStatus(403);
        $this->actingAs($perencanaan)->get('/super-admin/dashboard')->assertStatus(403);
        $this->actingAs($keuangan)->get('/super-admin/dashboard')->assertStatus(403);
        $this->actingAs($divisi)->get('/super-admin/dashboard')->assertStatus(403);

        $this->actingAs($admin)->get('/super-admin/settings')->assertStatus(403);
        $this->actingAs($admin)->get('/super-admin/audit-logs')->assertStatus(403);
    }

    public function test_admin_cannot_update_or_delete_super_admin_user()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $superAdmin = User::factory()->superAdmin()->create();

        // Admin tries to update super admin user
        $response = $this->actingAs($admin)
            ->put("/admin/users/{$superAdmin->id}", [
                'name' => 'Hacked Root',
                'email' => 'hacked@rsjtampan.riau.go.id',
                'role' => 'divisi',
                'is_active' => true,
            ]);

        $response->assertStatus(403);

        // Admin tries to delete super admin user
        $responseDelete = $this->actingAs($admin)
            ->delete("/admin/users/{$superAdmin->id}");

        $responseDelete->assertStatus(403);
        $this->assertDatabaseHas('users', ['id' => $superAdmin->id]);
    }

    public function test_admin_cannot_escalate_role_to_super_admin()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $normalUser = User::factory()->create(['role' => 'divisi']);

        // Admin tries to promote normalUser to super_admin
        $response = $this->actingAs($admin)
            ->put("/admin/users/{$normalUser->id}", [
                'name' => $normalUser->name,
                'email' => $normalUser->email,
                'role' => 'super_admin',
                'is_active' => true,
            ]);

        $response->assertSessionHasErrors('role');
        $this->assertEquals('divisi', $normalUser->fresh()->role);
    }

    public function test_super_admin_can_emergency_reset_password_and_toggle_status()
    {
        $superAdmin = User::factory()->superAdmin()->create();
        $targetUser = User::factory()->create(['role' => 'perencanaan', 'is_active' => true]);

        // Emergency Reset Password
        $responseReset = $this->actingAs($superAdmin)
            ->post("/super-admin/users/{$targetUser->id}/reset-password", [
                'password' => 'Password123!',
            ]);

        $responseReset->assertSessionHasNoErrors();
        $this->assertTrue(Hash::check('Password123!', $targetUser->fresh()->password));

        // Toggle user status
        $responseToggle = $this->actingAs($superAdmin)
            ->patch("/super-admin/users/{$targetUser->id}/toggle-status");

        $responseToggle->assertSessionHasNoErrors();
        $this->assertFalse((bool) $targetUser->fresh()->is_active);
    }

    public function test_super_admin_troubleshooting_impersonate_and_stop_flow()
    {
        $superAdmin = User::factory()->superAdmin()->create();
        $targetUser = User::factory()->create(['role' => 'divisi', 'is_active' => true]);

        // Start impersonation
        $responseStart = $this->actingAs($superAdmin)
            ->post("/super-admin/impersonate/{$targetUser->id}");

        $responseStart->assertRedirect($targetUser->dashboardPath());
        $this->assertEquals($targetUser->id, auth()->id());
        $this->assertEquals($superAdmin->id, session('impersonator_id'));

        // Verify audit log has IMPERSONATE_START
        $this->assertDatabaseHas('activity_logs', [
            'action' => 'IMPERSONATE_START',
            'user_id' => $targetUser->id,
            'impersonator_id' => $superAdmin->id,
        ]);

        // Stop impersonation
        $responseStop = $this->post('/impersonate-leave');

        $responseStop->assertRedirect('/super-admin/users');
        $this->assertEquals($superAdmin->id, auth()->id());
        $this->assertNull(session('impersonator_id'));

        // Verify audit log has IMPERSONATE_STOP
        $this->assertDatabaseHas('activity_logs', [
            'action' => 'IMPERSONATE_STOP',
            'user_id' => $superAdmin->id,
        ]);
    }

    public function test_system_settings_update_persists_correctly()
    {
        $superAdmin = User::factory()->superAdmin()->create();

        $response = $this->actingAs($superAdmin)
            ->post('/super-admin/settings', [
                'hospital_name' => 'RS Jiwa Tampan E-BLUD',
                'director_name' => 'dr. Direktur Baru, M.Kes',
                'director_nip' => '198001012005011001',
            ]);

        $response->assertSessionHasNoErrors();

        $this->assertEquals('RS Jiwa Tampan E-BLUD', SystemSetting::get('hospital_name'));
        $this->assertEquals('dr. Direktur Baru, M.Kes', SystemSetting::get('director_name'));
        $this->assertEquals('198001012005011001', SystemSetting::get('director_nip'));

        // Verify audit log recorded SETTING_UPDATE
        $this->assertDatabaseHas('activity_logs', [
            'action' => 'SETTING_UPDATE',
            'module' => 'SETTINGS',
            'user_id' => $superAdmin->id,
        ]);
    }

    public function test_fiscal_year_lock_controls_and_blocks_mutations()
    {
        $superAdmin = User::factory()->superAdmin()->create();
        $admin = User::factory()->create(['role' => 'admin']);
        $divisi = User::factory()->create(['role' => 'divisi']);

        $fiscalYear = FiscalYear::where('year', 2026)->first();
        $this->assertFalse((bool) $fiscalYear->is_locked);

        // Super Admin toggles lock on
        $responseLock = $this->actingAs($superAdmin)
            ->patch("/admin/fiscal-years/{$fiscalYear->id}/toggle-lock");

        $responseLock->assertSessionHasNoErrors();
        $this->assertTrue((bool) $fiscalYear->fresh()->is_locked);

        // Division tries to submit or modify in locked year (testing middleware CheckFiscalYearLock)
        session(['active_year' => 2026]);

        // Trying a POST request to requisitions or division store
        $responsePost = $this->actingAs($divisi)
            ->post('/divisi/requisitions', [
                'purpose' => 'Test locked year budget',
            ]);

        // Must be blocked with 403 Forbidden because year is locked
        $responsePost->assertStatus(403);

        // Super Admin toggles lock off
        $responseUnlock = $this->actingAs($superAdmin)
            ->patch("/admin/fiscal-years/{$fiscalYear->id}/toggle-lock");

        $responseUnlock->assertSessionHasNoErrors();
        $this->assertFalse((bool) $fiscalYear->fresh()->is_locked);
    }

    public function test_super_admin_can_manage_dedicated_fiscal_years_full_lifecycle()
    {
        $superAdmin = User::factory()->superAdmin()->create();

        // 1. Index
        $this->actingAs($superAdmin)
            ->get('/super-admin/fiscal-years')
            ->assertStatus(200);

        // 2. Store
        $responseStore = $this->actingAs($superAdmin)
            ->post('/super-admin/fiscal-years', [
                'year' => 2029,
                'name' => 'Tahun Anggaran 2029',
                'description' => 'Target Perencanaan Jangka Menengah',
                'is_active' => true,
                'is_default' => false,
                'is_locked' => false,
            ]);

        $responseStore->assertRedirect(route('superadmin.fiscal-years.index'));
        $this->assertDatabaseHas('fiscal_years', ['year' => 2029]);

        $fy2029 = FiscalYear::where('year', 2029)->first();

        // Verify audit log CREATE_YEAR
        $this->assertDatabaseHas('activity_logs', [
            'action' => 'CREATE_YEAR',
            'module' => 'FISCAL_YEAR',
            'user_id' => $superAdmin->id,
        ]);

        // 3. Update
        $responseUpdate = $this->actingAs($superAdmin)
            ->put("/super-admin/fiscal-years/{$fy2029->id}", [
                'name' => 'Tahun Anggaran 2029 Definitif',
                'description' => 'Catatan revisi nama',
                'is_active' => true,
                'is_default' => false,
            ]);

        $responseUpdate->assertRedirect(route('superadmin.fiscal-years.index'));
        $this->assertEquals('Tahun Anggaran 2029 Definitif', $fy2029->fresh()->name);

        // 4. Toggle Status
        $this->actingAs($superAdmin)
            ->patch("/super-admin/fiscal-years/{$fy2029->id}/toggle-status")
            ->assertRedirect(route('superadmin.fiscal-years.index'));
        $this->assertFalse((bool) $fy2029->fresh()->is_active);

        // 5. Set Default
        $this->actingAs($superAdmin)
            ->patch("/super-admin/fiscal-years/{$fy2029->id}/set-default")
            ->assertRedirect(route('superadmin.fiscal-years.index'));
        $this->assertTrue((bool) $fy2029->fresh()->is_default);
        $this->assertTrue((bool) $fy2029->fresh()->is_active);

        // 6. Dedicated Toggle Lock
        $this->actingAs($superAdmin)
            ->patch("/super-admin/fiscal-years/{$fy2029->id}/toggle-lock")
            ->assertRedirect(route('superadmin.fiscal-years.index'));
        $this->assertTrue((bool) $fy2029->fresh()->is_locked);

        // 7. Unset default before delete
        $fy2026 = FiscalYear::where('year', 2026)->first();
        $this->actingAs($superAdmin)->patch("/super-admin/fiscal-years/{$fy2026->id}/set-default");

        // 8. Destroy
        $this->actingAs($superAdmin)
            ->delete("/super-admin/fiscal-years/{$fy2029->id}")
            ->assertRedirect(route('superadmin.fiscal-years.index'));
        $this->assertDatabaseMissing('fiscal_years', ['id' => $fy2029->id]);

        // Verify audit log DELETE_YEAR
        $this->assertDatabaseHas('activity_logs', [
            'action' => 'DELETE_YEAR',
            'module' => 'FISCAL_YEAR',
            'user_id' => $superAdmin->id,
        ]);
    }

    public function test_non_super_admin_cannot_access_dedicated_super_admin_fiscal_years()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $perencanaan = User::factory()->create(['role' => 'perencanaan']);
        $keuangan = User::factory()->create(['role' => 'keuangan']);
        $divisi = User::factory()->create(['role' => 'divisi']);

        $this->actingAs($admin)->get('/super-admin/fiscal-years')->assertStatus(403);
        $this->actingAs($perencanaan)->get('/super-admin/fiscal-years')->assertStatus(403);
        $this->actingAs($keuangan)->get('/super-admin/fiscal-years')->assertStatus(403);
        $this->actingAs($divisi)->get('/super-admin/fiscal-years')->assertStatus(403);
    }
}
