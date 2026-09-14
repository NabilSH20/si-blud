<?php

use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\DivisionController;
use App\Http\Controllers\Admin\FiscalYearController;
use App\Http\Controllers\Admin\UnitController as AdminUnitController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\Divisi\DashboardController as DivisiDashboardController;
use App\Http\Controllers\Divisi\RequisitionController as DivisiRequisitionController;
use App\Http\Controllers\Keuangan\BudgetController;
use App\Http\Controllers\Keuangan\DashboardController as KeuanganDashboardController;
use App\Http\Controllers\Keuangan\ReportController as KeuanganReportController;
use App\Http\Controllers\Keuangan\RequisitionController as KeuanganRequisitionController;
use App\Http\Controllers\Keuangan\RevenueController as KeuanganRevenueController;
use App\Http\Controllers\Perencanaan\DashboardController as PerencanaanDashboardController;
use App\Http\Controllers\Perencanaan\ItemController;
use App\Http\Controllers\Perencanaan\RbaController as PerencanaanRbaController;
use App\Http\Controllers\Perencanaan\RequisitionController as PerencanaanRequisitionController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    $user = auth()->user();

    if ($user) {
        return redirect($user->dashboardPath());
    }

    return redirect('/login');
});

Route::post('/set-year', function (\Illuminate\Http\Request $request) {
    session(['active_year' => $request->year]);
    return back();
})->name('set-year');

Route::prefix('divisi')->middleware('auth')->group(function () {
    Route::get('/dashboard', [DivisiDashboardController::class, 'index'])
        ->name('divisi.dashboard');

    Route::resource('requisitions', DivisiRequisitionController::class);
});

Route::prefix('perencanaan')->middleware('auth')->group(function () {
    Route::get('/dashboard', [PerencanaanDashboardController::class, 'index'])
        ->name('perencanaan.dashboard');

    Route::resource('items', ItemController::class)->except(['show']);
    Route::patch('/items/{item}/verify-standard', [ItemController::class, 'verifyStandard'])
        ->name('items.verify-standard');
    Route::resource('requisitions', PerencanaanRequisitionController::class)
        ->only(['index', 'show', 'update'])
        ->names('perencanaan.requisitions');

    Route::resource('rba', PerencanaanRbaController::class)
        ->only(['index', 'create', 'store'])
        ->names('perencanaan.rba');
    Route::patch('/rba/{id}/sahkan', [PerencanaanRbaController::class, 'sahkan'])
        ->name('perencanaan.rba.sahkan');
    Route::patch('/rba/shifts/{id}/activate', [PerencanaanRbaController::class, 'activate'])
        ->name('perencanaan.rba.activate');
    Route::post('/rba/shifts', [PerencanaanRbaController::class, 'storeShift'])
        ->name('perencanaan.rba.shifts.store');
    Route::patch('/rba/items/{id}', [PerencanaanRbaController::class, 'updateItem'])
        ->name('perencanaan.rba.items.update');
    Route::patch('/rba/revenue-items/{id}', [PerencanaanRbaController::class, 'updateRevenueItem'])
        ->name('perencanaan.rba.revenue-items.update');
    Route::patch('/rba/shifts/{id}/pembiayaan', [PerencanaanRbaController::class, 'updatePembiayaan'])
        ->name('perencanaan.rba.pembiayaan.update');
    Route::patch('/rba/shifts/{id}/batch-revenue', [PerencanaanRbaController::class, 'batchUpdateRevenue'])
        ->name('perencanaan.rba.batch-revenue.update');
    Route::get('/rba/print-ringkasan', [PerencanaanRbaController::class, 'printRingkasan'])
        ->name('perencanaan.rba.print-ringkasan');
    Route::get('/rba/print-belanja', [PerencanaanRbaController::class, 'printBelanja'])
        ->name('perencanaan.rba.print-belanja');
    Route::get('/rba/print-pendapatan', [PerencanaanRbaController::class, 'printPendapatan'])
        ->name('perencanaan.rba.print-pendapatan');
    Route::get('/rba/print-rincian-belanja', [PerencanaanRbaController::class, 'printRincianBelanja'])
        ->name('perencanaan.rba.print-rincian-belanja');
});

Route::prefix('keuangan')->middleware('auth')->group(function () {
    Route::get('/dashboard', [KeuanganDashboardController::class, 'index'])
        ->name('keuangan.dashboard');

    Route::resource('budgets', BudgetController::class)->except(['show']);
    Route::resource('revenues', KeuanganRevenueController::class)->except(['edit', 'update', 'show']);
    Route::resource('requisitions', KeuanganRequisitionController::class)
        ->only(['index', 'show', 'update'])
        ->names('keuangan.requisitions');
    Route::get('/requisitions/{id}/print', [KeuanganRequisitionController::class, 'print'])
        ->name('keuangan.requisitions.print');

    Route::get('/reports', [KeuanganReportController::class, 'index'])->name('reports.index');
    Route::get('/reports/print', [KeuanganReportController::class, 'print'])->name('reports.print');
    Route::get('/reports/surplus-deficit', [KeuanganReportController::class, 'surplusDeficit'])->name('reports.surplus-deficit');
    Route::get('/reports/surplus-deficit/print', [KeuanganReportController::class, 'printSurplusDeficit'])->name('reports.surplus-deficit.print');
});

Route::prefix('admin')->middleware('auth')->group(function () {
    Route::get('/dashboard', [AdminDashboardController::class, 'index'])
        ->name('admin.dashboard');

    Route::resource('divisions', DivisionController::class)->except(['show']);
    Route::resource('units', AdminUnitController::class)->only(['store', 'update', 'destroy']);
    Route::patch('fiscal-years/{fiscal_year}/toggle-status', [FiscalYearController::class, 'toggleStatus'])
        ->name('fiscal-years.toggle-status');
    Route::patch('fiscal-years/{fiscal_year}/set-default', [FiscalYearController::class, 'setDefault'])
        ->name('fiscal-years.set-default');
    Route::resource('fiscal-years', FiscalYearController::class)->except(['create', 'show', 'edit']);
    Route::patch('users/{user}/toggle-status', [AdminUserController::class, 'toggleStatus'])
        ->name('users.toggle-status');
    Route::resource('users', AdminUserController::class)->except(['show']);
});

Route::middleware('auth')->group(function () {
    Route::get('/requisitions/{id}/print', [DivisiRequisitionController::class, 'print'])->name('requisitions.print');
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::match(['patch', 'post'], '/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::put('/password', [ProfileController::class, 'updatePassword'])->name('password.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
