<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Route;
use Tests\TestCase;

class A9DuplicateRouteTest extends TestCase
{
    public function test_password_update_route_is_defined_only_once(): void
    {
        $routes = Route::getRoutes();
        $passwordUpdateRoutes = [];

        foreach ($routes as $route) {
            if ($route->getName() === 'password.update') {
                $passwordUpdateRoutes[] = $route;
            }
        }

        $this->assertCount(1, $passwordUpdateRoutes, 'Route password.update tidak boleh didefinisikan ganda.');
    }
}
