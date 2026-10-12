<?php
require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$routes = Route::getRoutes()->getRoutes();
foreach ($routes as $route) {
    if ($route->action['uses'] instanceof \Closure) {
        echo "Closure in route: " . $route->uri() . "\n";
    }
}
