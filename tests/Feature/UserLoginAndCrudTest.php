<?php

namespace Tests\Feature;

use App\Models\Division;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class UserLoginAndCrudTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(\Database\Seeders\DivisionSeeder::class);
        $this->seed(\Database\Seeders\UnitSeeder::class);
    }

    public function test_user_can_login_with_email(): void
    {
        $user = User::factory()->create([
            'email' => 'farmasi.test@rsj.com',
            'nip' => '198501152010012099',
            'password' => Hash::make('password123'),
            'role' => 'divisi',
            'is_active' => true,
        ]);

        $response = $this->post('/login', [
            'email' => 'farmasi.test@rsj.com',
            'password' => 'password123',
        ]);

        $this->assertAuthenticatedAs($user);
        $response->assertRedirect('/divisi/dashboard');
    }

    public function test_user_can_login_with_nip(): void
    {
        $user = User::factory()->create([
            'email' => 'upip.test@rsj.com',
            'nip' => '198607142011012088',
            'password' => Hash::make('password123'),
            'role' => 'divisi',
            'is_active' => true,
        ]);

        $response = $this->post('/login', [
            'email' => '198607142011012088',
            'password' => 'password123',
        ]);

        $this->assertAuthenticatedAs($user);
        $response->assertRedirect('/divisi/dashboard');
    }

    public function test_inactive_user_cannot_login(): void
    {
        $user = User::factory()->create([
            'email' => 'inactive@rsj.com',
            'nip' => '199999999999999999',
            'password' => Hash::make('password123'),
            'is_active' => false,
        ]);

        $response = $this->post('/login', [
            'email' => 'inactive@rsj.com',
            'password' => 'password123',
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
            'password' => 'password123',
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
            'password' => 'password123',
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

        $this->assertFalse((bool)$target->fresh()->is_active);

        // Toggle back to active
        $response = $this->actingAs($admin)->patch("/admin/users/{$target->id}/toggle-status");
        $this->assertTrue((bool)$target->fresh()->is_active);
    }
}
