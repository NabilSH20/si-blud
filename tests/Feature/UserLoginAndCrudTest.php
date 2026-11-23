<?php

namespace Tests\Feature;

use App\Models\Division;
use App\Models\Unit;
use App\Models\User;
use Database\Seeders\DivisionSeeder;
use Database\Seeders\UnitSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class UserLoginAndCrudTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(DivisionSeeder::class);
        $this->seed(UnitSeeder::class);
    }

    public function test_user_can_login_with_email(): void
    {
        $user = User::factory()->create([
            'email' => 'farmasi.test@rsj.com',
            'nip' => '198501152010012099',
            'password' => Hash::make('Rahasia2026Aman'),
            'role' => 'divisi',
            'is_active' => true,
        ]);

        $response = $this->post('/login', [
            'email' => 'farmasi.test@rsj.com',
            'password' => 'Rahasia2026Aman',
        ]);

        $this->assertAuthenticatedAs($user);
        $response->assertRedirect('/divisi/dashboard');
    }

    public function test_user_can_login_with_nip(): void
    {
        $user = User::factory()->create([
            'email' => 'upip.test@rsj.com',
            'nip' => '198607142011012088',
            'password' => Hash::make('Rahasia2026Aman'),
            'role' => 'divisi',
            'is_active' => true,
        ]);

        $response = $this->post('/login', [
            'email' => '198607142011012088',
            'password' => 'Rahasia2026Aman',
        ]);

        $this->assertAuthenticatedAs($user);
        $response->assertRedirect('/divisi/dashboard');
    }

    public function test_inactive_user_cannot_login(): void
    {
        $user = User::factory()->create([
            'email' => 'inactive@rsj.com',
            'nip' => '199999999999999999',
            'password' => Hash::make('Rahasia2026Aman'),
            'is_active' => false,
        ]);

        $response = $this->post('/login', [
            'email' => 'inactive@rsj.com',
            'password' => 'Rahasia2026Aman',
        ]);

        $this->assertGuest();
        $response->assertSessionHasErrors('email');
    }

    public function test_admin_can_create_requester_user_for_penunjang_diklit(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'is_active' => true,
        ]);

        $diklitDiv = Division::where('division_code', 'PENUNJANG_DIKLIT')->first();
        $diklitUnit = Unit::where('unit_code', 'DIKLIT')->first();

        $response = $this->actingAs($admin)->post('/admin/users', [
            'name' => 'Staf Diklit Baru',
            'nip' => '199501012020011001',
            'email' => 'staf.diklit@rsj.com',
            'position' => 'Staf Pelaksana Diklit',
            'phone' => '081234567899',
            'password' => 'Rahasia2026Aman',
            'role' => 'divisi',
            'division_id' => $diklitDiv->id,
            'unit_id' => $diklitUnit->id,
            'is_active' => true,
        ]);

        $response->assertRedirect('/admin/users');
        $this->assertDatabaseHas('users', [
            'email' => 'staf.diklit@rsj.com',
            'nip' => '199501012020011001',
            'position' => 'Staf Pelaksana Diklit',
            'division_id' => $diklitDiv->id,
            'unit_id' => $diklitUnit->id,
            'is_active' => 1,
        ]);
    }

    public function test_admin_cannot_assign_non_requester_division_to_role_divisi(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'is_active' => true,
        ]);

        $renDiv = Division::where('division_code', 'REN')->first();
        $renUnit = Unit::where('unit_code', 'BAG_REN')->first();

        $response = $this->actingAs($admin)->from('/admin/users')->post('/admin/users', [
            'name' => 'Salah Divisi',
            'email' => 'salah@rsj.com',
            'password' => 'Rahasia2026Aman',
            'role' => 'divisi',
            'division_id' => $renDiv->id,
            'unit_id' => $renUnit->id,
        ]);

        $response->assertSessionHasErrors('division_id');
    }

    public function test_admin_can_toggle_user_status(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'is_active' => true,
        ]);

        $target = User::factory()->create([
            'role' => 'divisi',
            'is_active' => true,
        ]);

        $response = $this->actingAs($admin)->patch("/admin/users/{$target->id}/toggle-status");
        $response->assertSessionHas('success');

        $this->assertFalse((bool) $target->fresh()->is_active);

        // Toggle back to active
        $response = $this->actingAs($admin)->patch("/admin/users/{$target->id}/toggle-status");
        $this->assertTrue((bool) $target->fresh()->is_active);
    }

    public function test_admin_can_create_requester_user_for_new_pelayanan_division(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'is_active' => true,
        ]);

        // Buat divisi baru dengan group Pelayanan_Keperawatan tapi kode belum pernah ada
        $newDiv = Division::create([
            'division_code' => 'KODE_BARU_123',
            'name' => 'Divisi Pelayanan Keperawatan Baru',
            'group' => 'Pelayanan_Keperawatan',
        ]);

        $newUnit = Unit::create([
            'division_id' => $newDiv->id,
            'unit_code' => 'UNIT_BARU_123',
            'name' => 'Unit Pelayanan Baru',
        ]);

        $response = $this->actingAs($admin)->post('/admin/users', [
            'name' => 'Staf Baru',
            'email' => 'staf.baru@rsj.com',
            'password' => 'Rahasia2026Aman',
            'role' => 'divisi',
            'division_id' => $newDiv->id,
            'unit_id' => $newUnit->id,
            'is_active' => true,
        ]);

        $response->assertRedirect('/admin/users');
        $this->assertDatabaseHas('users', [
            'email' => 'staf.baru@rsj.com',
            'division_id' => $newDiv->id,
            'unit_id' => $newUnit->id,
        ]);
    }

    public function test_admin_can_reset_password_for_other_user_and_user_can_login_with_new_password(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'is_active' => true,
        ]);

        $user = User::factory()->create([
            'email' => 'staff.reset@rsj.com',
            'password' => Hash::make('PasswordLama123'),
            'role' => 'perencanaan',
            'is_active' => true,
        ]);

        // Admin updates user password via UserController::update
        $response = $this->actingAs($admin)->put(route('users.update', $user), [
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'password' => 'PasswordBaru123',
        ]);

        $response->assertSessionHasNoErrors();
        $response->assertRedirect(route('users.index'));

        // Logout admin
        $this->post('/logout');

        // User fails login with old password
        $failLogin = $this->post('/login', [
            'email' => 'staff.reset@rsj.com',
            'password' => 'PasswordLama123',
        ]);
        $failLogin->assertSessionHasErrors('email');
        $this->assertGuest();

        // User successfully logs in with new password
        $captcha = session('login_captcha');
        $successLogin = $this->post('/login', [
            'email' => 'staff.reset@rsj.com',
            'password' => 'PasswordBaru123',
            'captcha' => $captcha,
        ]);
        $this->assertAuthenticatedAs($user);
        $successLogin->assertRedirect('/perencanaan/dashboard');
    }
}
