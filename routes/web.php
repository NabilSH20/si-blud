<?php

use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\DivisionController;
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

Route::prefix('divisi')->middleware('auth')->group(function () {
    Route::get('/dashboard', [DivisiDashboardController::class, 'index'])
        ->name('divisi.dashboard');

    Route::resource('requisitions', DivisiRequisitionController::class);
});

Route::prefix('perencanaan')->middleware('auth')->group(function () {
    Route::get('/dashboard', [PerencanaanDashboardController::class, 'index'])
        ->name('perencanaan.dashboard');

    Route::resource('items', ItemController::class)->except(['show']);
    Route::resource('requisitions', PerencanaanRequisitionController::class)
        ->only(['index', 'show', 'update'])
        ->names('perencanaan.requisitions');

    Route::resource('rba', PerencanaanRbaController::class)
        ->only(['index', 'create', 'store'])
        ->names('perencanaan.rba');
    Route::patch('/rba/{id}/sahkan', [PerencanaanRbaController::class, 'sahkan'])
        ->name('perencanaan.rba.sahkan');
});

Route::prefix('keuangan')->middleware('auth')->group(function () {
    Route::get('/dashboard', [KeuanganDashboardController::class, 'index'])
        ->name('keuangan.dashboard');

    Route::resource('budgets', BudgetController::class)->except(['show']);
    Route::resource('revenues', KeuanganRevenueController::class)->except(['edit', 'update', 'show']);
    Route::resource('requisitions', KeuanganRequisitionController::class)
        ->only(['index', 'show', 'update'])
        ->names('keuangan.requisitions');

    Route::get('/reports', [KeuanganReportController::class, 'index'])->name('reports.index');
    Route::get('/reports/print', [KeuanganReportController::class, 'print'])->name('reports.print');
    Route::get('/reports/surplus-deficit', [KeuanganReportController::class, 'surplusDeficit'])->name('reports.surplus-deficit');
    Route::get('/reports/surplus-deficit/print', [KeuanganReportController::class, 'printSurplusDeficit'])->name('reports.surplus-deficit.print');
});

Route::prefix('admin')->middleware('auth')->group(function () {
    Route::get('/dashboard', [AdminDashboardController::class, 'index'])
        ->name('admin.dashboard');

    Route::resource('divisions', DivisionController::class)->except(['show']);
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
