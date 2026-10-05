<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$shift = \App\Models\RbaShift::where('status', 'Aktif')->first();
if ($shift) {
    echo "Found active shift: {$shift->id}\n";
    
    // Clear out rba_accounts for 2027 to start fresh and remove ghosts like 1.1.2.1.17.1
    \App\Models\RbaAccount::where('period_year', 2027)->delete();
    echo "Cleared old 2027 budgets.\n";
    
    $shift->activate();
    echo "Re-activated shift and synced to budgets.\n";
} else {
    echo "No active shift found.\n";
}
