<?php

namespace Tests\Feature;

use App\Models\FiscalYear;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Route;
use Tests\TestCase;

class A4RouteClosureTest extends TestCase
{
    use RefreshDatabase;

    public function test_no_closures_in_app_routes()
    {
        $this->assertEquals(
            \App\Http\Controllers\RootController::class.'@index',
            Route::getRoutes()->match(request()->create('/', 'GET'))->getActionName()
        );

        $this->assertEquals(
            \App\Http\Controllers\RootController::class.'@setYear',
            Route::getRoutes()->getByName('set-year')->getActionName()
        );
    }

    public function test_guest_cannot_set_year()
    {
        $response = $this->post(route('set-year'), ['year' => 2026]);
        $response->assertRedirect('/login');
    }

    public function test_set_year_fails_if_year_is_inactive()
    {
        $user = \App\Models\User::factory()->create();
        $activeYear = FiscalYear::create(['year' => 2026, 'name' => '2026', 'is_active' => true]);
        $inactiveYear = FiscalYear::create(['year' => 2025, 'name' => '2025', 'is_active' => false]);

        $response = $this->actingAs($user)->post(route('set-year'), [
            'year' => 2025
        ]);

        $response->assertSessionHasErrors('year');
        $this->assertNull(session('active_year'));

        $response2 = $this->actingAs($user)->post(route('set-year'), [
            'year' => '2026'
        ]);

        $response2->assertSessionHasNoErrors();
        $this->assertSame(2026, session('active_year'));
    }
}
