<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$r = \App\Models\Revenue::first();
echo "Type: " . gettype($r->date) . "\n";
echo "Value: " . $r->date . "\n";
