<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProfileTest extends TestCase
{
    use RefreshDatabase;

    public function test_profile_page_redirects_to_dashboard_with_profile_modal(): void
    {
        $user = User::factory()->create(['role' => 'admin']);

        $response = $this
            ->actingAs($user)
            ->get('/profile');

        $response->assertRedirect(route('admin.dashboard', ['profile' => 'true']));
    }

    public function test_profile_information_can_be_updated(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->patch('/profile', [
                'name' => 'Test User',
                'email' => 'test@example.com',
            ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect();

        $user->refresh();

        $this->assertSame('Test User', $user->name);
        $this->assertSame('test@example.com', $user->email);
        $this->assertNull($user->email_verified_at);
    }

    public function test_email_verification_status_is_unchanged_when_the_email_address_is_unchanged(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->patch('/profile', [
                'name' => 'Test User',
                'email' => $user->email,
            ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect();

        $this->assertNotNull($user->refresh()->email_verified_at);
    }

    public function test_user_cannot_delete_their_own_account_anymore(): void
    {
        $user = User::factory()->create();

        // Fitur hapus-akun-sendiri telah dicabut demi integritas audit & kebijakan akun dikelola Admin
        $response = $this
            ->actingAs($user)
            ->delete('/profile', [
                'password' => 'password',
            ]);

        // Route tidak ada lagi (404/405)
        $this->assertTrue(in_array($response->status(), [404, 405]));
        $this->assertNotNull($user->fresh());
    }
}
