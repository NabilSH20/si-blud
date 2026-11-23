<?php

$baseDir = dirname(__DIR__);
require $baseDir . '/vendor/autoload.php';
$app = require_once $baseDir . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\Division;
use App\Models\Unit;
use App\Models\FiscalYear;
use App\Models\Requisition;
use App\Models\RequisitionDetail;
use App\Models\RbaShift;
use App\Models\Item;
use App\Models\Revenue;

echo "Preparing clean demo state for Year 2028...\n";

// 1. Delete test requisitions & details for 2028
$requisitions2028 = Requisition::where('budget_year', 2028)
    ->orWhere('fiscal_year', 2028)
    ->orWhere('requisition_number', 'like', '%/2028%')
    ->orWhere('requisition_number', 'like', '%/NOTA-MEDIK/%')
    ->get();

foreach ($requisitions2028 as $req) {
    $req->requisitionDetails()->delete();
    $req->delete();
}
RequisitionDetail::whereDoesntHave('requisition')->delete();

// 2. Delete test revenues for 2028
Revenue::whereYear('date', 2028)
    ->orWhere('description', 'like', '%2028%')
    ->delete();

// 3. Delete test RBA shifts for 2028
$shifts2028 = RbaShift::where('year', 2028)->get();
foreach ($shifts2028 as $s) {
    $s->expenseItems()->delete();
    $s->revenueItems()->delete();
    $s->delete();
}

// 4. Delete test users if exist so admin creates them fresh
User::whereIn('email', [
    'pengaju2028@rsj.com',
    'perencana2028@rsj.com',
    'bendahara2028@rsj.com',
    'radiologi@rsj.com'
])->orWhere('email', 'like', '%2028@rsj.com')
  ->orWhereIn('nip', ['198501012028011001', '198601012028012001', '199201012028011001'])
  ->orWhereIn('nik', ['1471010101850001', '1471010101860001', '1471010101920001'])
  ->delete();

// 5. Delete test units & divisions if exist (units first for FK integrity)
Unit::whereIn('unit_code', ['IRND28', 'IRND'])
    ->orWhere('name', 'like', '%2028%')
    ->orWhere('name', 'like', '%Instalasi Rawat Inap & Darurat 2028%')
    ->delete();

Division::whereIn('division_code', ['MEDIK28', '2028'])
    ->orWhere('name', 'like', '%2028%')
    ->orWhere('name', 'like', '%Pelayanan Medik 2028%')
    ->delete();

// 6. Delete test item in SSH if exists
Item::where('name', 'like', '%Plester Medis Non-Woven%')->delete();

// 7. Ensure Fiscal Year 2028 exists and is active for demo login
$fy2028 = FiscalYear::where('year', 2028)->first();
if (!$fy2028) {
    FiscalYear::create([
        'year' => 2028,
        'name' => 'Tahun Anggaran 2028',
        'is_active' => true,
        'is_default' => false,
    ]);
} else {
    $fy2028->update(['is_active' => true]);
}

echo "Clean demo state ready for Year 2028!\n";
