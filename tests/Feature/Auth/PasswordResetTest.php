<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PasswordResetTest extends TestCase
{
    use RefreshDatabase;

    public function test_reset_password_link_screen_returns_404(): void
    {
        $response = $this->get('/forgot-password');

        $response->assertStatus(404);
    }

    public function test_reset_password_link_cannot_be_requested_and_returns_404(): void
    {
        $user = User::factory()->create();

        $response = $this->post('/forgot-password', ['email' => $user->email]);

        $response->assertStatus(404);
    }

    public function test_reset_password_screen_returns_404(): void
    {
        $response = $this->get('/reset-password/sample-token');

        $response->assertStatus(404);
    }

    public function test_password_cannot_be_reset_via_public_route_and_returns_404(): void
    {
        $user = User::factory()->create();

        $response = $this->post('/reset-password', [
            'token' => 'sample-token',
            'email' => $user->email,
            'password' => 'Rahasia2026Aman',
            'password_confirmation' => 'Rahasia2026Aman',
        ]);

        $response->assertStatus(404);
    }
}
