<?php

namespace Tests\Feature;

use App\Models\User;
use Carbon\Carbon;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class A3LocalizationTest extends TestCase
{
    use RefreshDatabase;

    public function test_application_timezone_is_asia_jakarta()
    {
        $this->assertEquals('Asia/Jakarta', now()->getTimezone()->getName());
        $this->assertEquals('id', config('app.locale'));
    }

    public function test_printed_at_in_surplus_deficit_report_uses_indonesian_month()
    {
        // Seed the basic reference data needed for user creation and login
        $this->artisan('db:seed', ['--class' => DatabaseSeeder::class]);

        // Create a test user with role 'keuangan' (since reports usually need access)
        $user = User::factory()->create(['role' => 'keuangan']);

        // Mock a specific date so we know exactly what month name to look for (October -> Oktober)
        Carbon::setTestNow(Carbon::create(2026, 10, 9, 10, 0, 0));

        $response = $this->actingAs($user)->get(route('reports.surplus-deficit.print'));

        // Since it's a print view, the response should be HTML or PDF? Let's assume it's HTML view
        $response->assertStatus(200);

        // October in Indonesian is 'Oktober'
        $response->assertSee('09 Oktober 2026');
    }
}
