<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_screen_can_be_rendered(): void
    {
        $response = $this->get('/login');

        $response->assertStatus(200);
    }

    public function test_users_can_authenticate_using_the_login_screen(): void
    {
        $user = User::factory()->create();

        $response = $this->post('/login', [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect('/divisi/dashboard');
    }

    public function test_users_are_redirected_to_their_role_dashboard(): void
    {
        $dashboards = [
            'divisi' => '/divisi/dashboard',
            'perencanaan' => '/perencanaan/dashboard',
            'keuangan' => '/keuangan/dashboard',
            'admin' => '/admin/dashboard',
        ];

        foreach ($dashboards as $role => $expectedPath) {
            $user = User::factory()->create(['role' => $role]);

            $response = $this->post('/login', [
                'email' => $user->email,
                'password' => 'password',
            ]);

            $this->assertAuthenticated();
            $response->assertRedirect($expectedPath);
            $this->get($expectedPath)->assertOk();
            $this->get('/')->assertRedirect($expectedPath);

            $this->post('/logout');
            $this->assertGuest();
        }
    }

    public function test_users_can_not_authenticate_with_invalid_password(): void
    {
        $user = User::factory()->create();

        $this->post('/login', [
            'email' => $user->email,
            'password' => 'wrong-password',
        ]);

        $this->assertGuest();
    }

    public function test_users_can_logout(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post('/logout');

        $this->assertGuest();
        $response->assertRedirect('/');
    }

    public function test_login_screen_sets_captcha_in_session(): void
    {
        $response = $this->get('/login');

        $response->assertStatus(200);
        $this->assertTrue(session()->has('login_captcha'));
        $this->assertSame(5, strlen(session('login_captcha')));
    }

    public function test_captcha_can_be_refreshed(): void
    {
        $response = $this->getJson(route('captcha.refresh'));

        $response->assertOk();
        $response->assertJsonStructure(['captchaSvg']);
        $this->assertTrue(session()->has('login_captcha'));
    }

    public function test_users_can_not_authenticate_with_invalid_captcha(): void
    {
        $user = User::factory()->create();

        $response = $this->withSession(['login_captcha' => 'ABC12'])->post('/login', [
            'email' => $user->email,
            'password' => 'password',
            'captcha' => 'WRONG',
        ]);

        $this->assertGuest();
        $response->assertSessionHasErrors('captcha');
    }

    public function test_users_can_authenticate_with_valid_captcha(): void
    {
        $user = User::factory()->create();

        $response = $this->withSession(['login_captcha' => 'ABC12'])->post('/login', [
            'email' => $user->email,
            'password' => 'password',
            'captcha' => 'abc12',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect('/divisi/dashboard');
    }
}

