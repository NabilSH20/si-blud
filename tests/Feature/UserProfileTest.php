<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Filesystem\FilesystemAdapter;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class UserProfileTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_view_profile_page(): void
    {
        $user = User::factory()->create(['role' => 'divisi']);

        $response = $this->actingAs($user)->get(route('profile.edit'));

        $response->assertRedirect(route('divisi.dashboard', ['profile' => 'true']));
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

        /** @var FilesystemAdapter $disk */
        $disk = Storage::disk('public');

        $this->assertNotNull($user->avatar);
        $disk->assertExists($user->avatar);
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
        $disk->assertExists($user->avatar);
        $disk->assertMissing($oldAvatar);
    }

    public function test_user_can_update_password_with_valid_current_password(): void
    {
        $user = User::factory()->create([
            'password' => Hash::make('old-password-123'),
        ]);

        $response = $this->actingAs($user)->put(route('password.update'), [
            'current_password' => 'old-password-123',
            'password' => 'RahasiaBaru2026',
            'password_confirmation' => 'RahasiaBaru2026',
        ]);

        $response->assertSessionHasNoErrors();
        $response->assertRedirect();

        $user->refresh();
        $this->assertTrue(Hash::check('RahasiaBaru2026', $user->password));
    }

    public function test_password_update_fails_with_invalid_current_password(): void
    {
        $user = User::factory()->create([
            'password' => Hash::make('correct-password'),
        ]);

        $response = $this->actingAs($user)->put(route('password.update'), [
            'current_password' => 'wrong-password',
            'password' => 'RahasiaGagal2026',
            'password_confirmation' => 'RahasiaGagal2026',
        ]);

        $response->assertSessionHasErrors('current_password');
    }
}
