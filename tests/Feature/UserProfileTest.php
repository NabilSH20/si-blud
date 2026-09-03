<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class UserProfileTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_view_profile_page(): void
    {
        $user = User::factory()->create(['role' => 'divisi']);

        $response = $this->actingAs($user)->get(route('profile.edit'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Profile/Edit')
        );
    }

    public function test_user_can_update_profile_information(): void
    {
        $user = User::factory()->create([
            'name' => 'Staf Lama',
            'email' => 'staflama@rsj.com',
            'role' => 'admin',
        ]);

        $response = $this->actingAs($user)->patch(route('profile.update'), [
            'name' => 'Staf Baru RSJ',
            'email' => 'stafbaru@rsj.com',
        ]);

        $response->assertSessionHasNoErrors();
        $response->assertRedirect();

        $user->refresh();
        $this->assertSame('Staf Baru RSJ', $user->name);
        $this->assertSame('stafbaru@rsj.com', $user->email);
    }

    public function test_user_can_upload_and_replace_avatar(): void
    {
        Storage::fake('public');

        $user = User::factory()->create(['role' => 'keuangan']);

        // 1. Upload initial avatar
        $avatarFile = UploadedFile::fake()->image('initial_avatar.jpg', 200, 200);

        $response = $this->actingAs($user)->post(route('profile.update'), [
            '_method' => 'patch',
            'name' => $user->name,
            'email' => $user->email,
            'avatar' => $avatarFile,
        ]);

        $response->assertSessionHasNoErrors();
        $user->refresh();

        $this->assertNotNull($user->avatar);
        Storage::disk('public')->assertExists($user->avatar);
        $oldAvatar = $user->avatar;

        // 2. Upload replacement avatar -> old avatar must be deleted
        $newAvatarFile = UploadedFile::fake()->image('new_avatar.png', 250, 250);

        $response2 = $this->actingAs($user)->post(route('profile.update'), [
            '_method' => 'patch',
            'name' => $user->name,
            'email' => $user->email,
            'avatar' => $newAvatarFile,
        ]);

        $response2->assertSessionHasNoErrors();
        $user->refresh();

        $this->assertNotSame($oldAvatar, $user->avatar);
        Storage::disk('public')->assertExists($user->avatar);
        Storage::disk('public')->assertMissing($oldAvatar);
    }

    public function test_user_can_update_password_with_valid_current_password(): void
    {
        $user = User::factory()->create([
            'password' => Hash::make('old-password-123'),
        ]);

        $response = $this->actingAs($user)->put(route('password.update'), [
            'current_password' => 'old-password-123',
            'password' => 'new-secure-password-456',
            'password_confirmation' => 'new-secure-password-456',
        ]);

        $response->assertSessionHasNoErrors();
        $response->assertRedirect();

        $user->refresh();
        $this->assertTrue(Hash::check('new-secure-password-456', $user->password));
    }

    public function test_password_update_fails_with_invalid_current_password(): void
    {
        $user = User::factory()->create([
            'password' => Hash::make('correct-password'),
        ]);

        $response = $this->actingAs($user)->put(route('password.update'), [
            'current_password' => 'wrong-password',
            'password' => 'new-password-789',
            'password_confirmation' => 'new-password-789',
        ]);

        $response->assertSessionHasErrors('current_password');
    }
}

