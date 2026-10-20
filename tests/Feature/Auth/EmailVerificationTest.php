<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EmailVerificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_email_verification_screen_returns_404(): void
    {
        $user = User::factory()->unverified()->create();

        $response = $this->actingAs($user)->get('/verify-email');

        $response->assertStatus(404);
    }

    public function test_email_cannot_be_verified_and_route_returns_404(): void
    {
        $user = User::factory()->unverified()->create();

        $response = $this->actingAs($user)->get('/verify-email/'.$user->id.'/'.sha1($user->email));

        $response->assertStatus(404);
    }

    public function test_email_verification_notification_cannot_be_requested_and_returns_404(): void
    {
        $user = User::factory()->unverified()->create();

        $response = $this->actingAs($user)->post('/email/verification-notification');

        $response->assertStatus(404);
    }
}
