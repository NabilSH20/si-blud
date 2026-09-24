<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RoleAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    public function test_divisi_cannot_access_other_roles()
    {
        $user = User::factory()->create(['role' => 'divisi']);

        $this->actingAs($user)->get('/divisi/dashboard')->assertStatus(200);
        $this->actingAs($user)->get('/perencanaan/dashboard')->assertStatus(403);
        $this->actingAs($user)->get('/keuangan/dashboard')->assertStatus(403);
        $this->actingAs($user)->get('/admin/dashboard')->assertStatus(403);
    }

    public function test_perencanaan_cannot_access_other_roles()
    {
        $user = User::factory()->create(['role' => 'perencanaan']);

        $this->actingAs($user)->get('/perencanaan/dashboard')->assertStatus(200);
        $this->actingAs($user)->get('/divisi/dashboard')->assertStatus(403);
        $this->actingAs($user)->get('/keuangan/dashboard')->assertStatus(403);
        $this->actingAs($user)->get('/admin/dashboard')->assertStatus(403);
    }

    public function test_keuangan_cannot_access_other_roles()
    {
        $user = User::factory()->create(['role' => 'keuangan']);

        $this->actingAs($user)->get('/keuangan/dashboard')->assertStatus(200);
        $this->actingAs($user)->get('/divisi/dashboard')->assertStatus(403);
        $this->actingAs($user)->get('/perencanaan/dashboard')->assertStatus(403);
        $this->actingAs($user)->get('/admin/dashboard')->assertStatus(403);
    }

    public function test_admin_cannot_access_other_roles()
    {
        $user = User::factory()->create(['role' => 'admin']);

        $this->actingAs($user)->get('/admin/dashboard')->assertStatus(200);
        $this->actingAs($user)->get('/divisi/dashboard')->assertStatus(403);
        $this->actingAs($user)->get('/perencanaan/dashboard')->assertStatus(403);
        $this->actingAs($user)->get('/keuangan/dashboard')->assertStatus(403);
    }
}
