<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class A5PasswordPolicyTest extends TestCase
{
    use RefreshDatabase;

    public function test_password_policy_rejects_weak_passwords()
    {
        $user = User::factory()->create([
            'password' => Hash::make('Rahasia2026Aman'),
        ]);

        // Login first to change password
        $this->actingAs($user);

        // Test 1: Too short (9 chars)
        $response = $this->put(route('password.update'), [
            'current_password' => 'Rahasia2026Aman',
            'password' => 'Pendek123',
            'password_confirmation' => 'Pendek123',
        ]);
        $response->assertSessionHasErrors('password');

        // Test 2: No numbers
        $response = $this->put(route('password.update'), [
            'current_password' => 'Rahasia2026Aman',
            'password' => 'HanyaHurufSaja',
            'password_confirmation' => 'HanyaHurufSaja',
        ]);
        $response->assertSessionHasErrors('password');

        // Test 3: No uppercase letters
        $response = $this->put(route('password.update'), [
            'current_password' => 'Rahasia2026Aman',
            'password' => 'semuakecil1234',
            'password_confirmation' => 'semuakecil1234',
        ]);
        $response->assertSessionHasErrors('password');

        // Test 4: Valid password
        $response = $this->put(route('password.update'), [
            'current_password' => 'Rahasia2026Aman',
            'password' => 'ValidPass1234',
            'password_confirmation' => 'ValidPass1234',
        ]);
        $response->assertSessionHasNoErrors();
    }
}
