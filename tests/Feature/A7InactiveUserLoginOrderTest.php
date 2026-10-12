<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class A7InactiveUserLoginOrderTest extends TestCase
{
    use RefreshDatabase;

    public function test_inactive_user_with_correct_password_is_rejected_with_inactive_message(): void
    {
        $user = User::factory()->create([
            'email' => 'nonaktif@rsj.com',
            'password' => Hash::make('Rahasia2026Aman'),
            'is_active' => false,
        ]);

        $response = $this->post('/login', [
            'email' => 'nonaktif@rsj.com',
            'password' => 'Rahasia2026Aman',
        ]);

        $this->assertGuest();
        $response->assertSessionHasErrors(['email' => 'Akun Anda sedang dinonaktifkan. Silakan hubungi Administrator SIM-RS / Bagian Tata Usaha.']);
    }

    public function test_inactive_user_with_wrong_password_gets_standard_auth_failed_message(): void
    {
        $user = User::factory()->create([
            'email' => 'nonaktif@rsj.com',
            'password' => Hash::make('Rahasia2026Aman'),
            'is_active' => false,
        ]);

        $response = $this->post('/login', [
            'email' => 'nonaktif@rsj.com',
            'password' => 'SalahPassword123',
        ]);

        $this->assertGuest();
        // Tidak boleh membocorkan status akun nonaktif
        $response->assertSessionHasErrors(['email' => trans('auth.failed')]);
    }
}
