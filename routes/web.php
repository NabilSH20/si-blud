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
use App\Http\Controllers\Keuangan\RevenueController as KeuanganRevenueController;
use App\Http\Controllers\Perencanaan\DashboardController as PerencanaanDashboardController;
use App\Http\Controllers\Perencanaan\ItemController;
use App\Http\Controllers\Perencanaan\RbaController as PerencanaanRbaController;
use App\Http\Controllers\Perencanaan\RequisitionController as PerencanaanRequisitionController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RootController;
use App\Http\Controllers\SuperAdmin\AuditLogController;
use App\Http\Controllers\SuperAdmin\DashboardController;
use App\Http\Controllers\SuperAdmin\ImpersonateController;
use App\Http\Controllers\SuperAdmin\MonitoringController;
use App\Http\Controllers\SuperAdmin\SettingController;
use App\Http\Controllers\SuperAdmin\UserController;
use Illuminate\Support\Facades\Route;

Route::get('/', [RootController::class, 'index']);

Route::prefix('divisi')->middleware(['auth', 'role:divisi', 'fiscal_year_lock'])->group(function () {
    Route::get('/dashboard', [DivisiDashboardController::class, 'index'])
        ->name('divisi.dashboard');

    Route::resource('requisitions', DivisiRequisitionController::class)->except(['create', 'edit']);
});

Route::prefix('perencanaan')->middleware(['auth', 'role:perencanaan', 'fiscal_year_lock'])->group(function () {
    Route::get('/dashboard', [PerencanaanDashboardController::class, 'index'])
        ->name('perencanaan.dashboard');

    Route::resource('items', ItemController::class)->except(['show', 'create', 'edit']);
    Route::patch('/items/{item}/verify-standard', [ItemController::class, 'verifyStandard'])
        ->name('items.verify-standard');
    Route::resource('requisitions', PerencanaanRequisitionController::class)
        ->only(['index', 'show', 'update'])
        ->names('perencanaan.requisitions');

    Route::resource('rba', PerencanaanRbaController::class)
        ->only(['index'])
        ->names('perencanaan.rba');

    Route::patch('/rba/shifts/{id}/activate', [PerencanaanRbaController::class, 'activate'])
        ->name('perencanaan.rba.activate');
    Route::post('/rba/shifts', [PerencanaanRbaController::class, 'storeShift'])
        ->name('perencanaan.rba.shifts.store');
    Route::delete('/rba/shifts/{id}', [PerencanaanRbaController::class, 'destroyShift'])
        ->name('perencanaan.rba.shifts.destroy');
    Route::patch('/rba/items/{id}', [PerencanaanRbaController::class, 'updateItem'])
        ->name('perencanaan.rba.items.update');
    Route::patch('/rba/revenue-items/{id}', [PerencanaanRbaController::class, 'updateRevenueItem'])
        ->name('perencanaan.rba.revenue-items.update');
    Route::patch('/rba/shifts/{id}/pembiayaan', [PerencanaanRbaController::class, 'updatePembiayaan'])
        ->name('perencanaan.rba.pembiayaan.update');
    Route::patch('/rba/shifts/{id}/batch-revenue', [PerencanaanRbaController::class, 'batchUpdateRevenue'])
        ->name('perencanaan.rba.batch-revenue.update');
});

Route::prefix('perencanaan')->middleware(['auth', 'role:perencanaan,keuangan,admin'])->group(function () {
    Route::get('/requisitions/{id}/print', [PerencanaanRequisitionController::class, 'print'])
        ->name('perencanaan.requisitions.print');
    Route::get('/rba/print-ringkasan', [PerencanaanRbaController::class, 'printRingkasan'])
        ->name('perencanaan.rba.print-ringkasan');
    Route::get('/rba/print-belanja', [PerencanaanRbaController::class, 'printBelanja'])
        ->name('perencanaan.rba.print-belanja');
    Route::get('/rba/print-pendapatan', [PerencanaanRbaController::class, 'printPendapatan'])
        ->name('perencanaan.rba.print-pendapatan');
    Route::get('/rba/print-rincian-belanja', [PerencanaanRbaController::class, 'printRincianBelanja'])
        ->name('perencanaan.rba.print-rincian-belanja');
});

Route::prefix('keuangan')->middleware(['auth', 'role:keuangan', 'fiscal_year_lock'])->group(function () {
    Route::get('/dashboard', [KeuanganDashboardController::class, 'index'])
        ->name('keuangan.dashboard');

    Route::get('/budgets', [BudgetController::class, 'index'])->name('budgets.index');
    Route::post('/revenues/targets', [KeuanganRevenueController::class, 'storeTarget'])->name('revenues.targets.store');
    Route::resource('revenues', KeuanganRevenueController::class)->except(['create', 'edit', 'update', 'show']);

    Route::get('/reports', [KeuanganReportController::class, 'index'])->name('reports.index');
    Route::get('/reports/revenue-monthly-matrix', [KeuanganReportController::class, 'revenueMonthlyMatrix'])->name('reports.revenue-monthly-matrix');
    Route::get('/reports/surplus-deficit', [KeuanganReportController::class, 'surplusDeficit'])->name('reports.surplus-deficit');
});

Route::prefix('keuangan')->middleware(['auth', 'role:keuangan,perencanaan,admin'])->group(function () {
    Route::get('/reports/print', [KeuanganReportController::class, 'print'])->name('reports.print');
    Route::get('/reports/revenue-monthly-matrix/print', [KeuanganReportController::class, 'printRevenueMonthlyMatrix'])->name('reports.revenue-monthly-matrix.print');
    Route::get('/reports/surplus-deficit/print', [KeuanganReportController::class, 'printSurplusDeficit'])->name('reports.surplus-deficit.print');
});

Route::prefix('admin')->middleware(['auth', 'role:admin,super_admin'])->group(function () {
    Route::get('/dashboard', [AdminDashboardController::class, 'index'])
        ->name('admin.dashboard');

    Route::resource('divisions', DivisionController::class)->except(['show', 'create', 'edit']);
    Route::resource('units', AdminUnitController::class)->only(['store', 'update', 'destroy']);
    Route::patch('fiscal-years/{fiscal_year}/toggle-status', [FiscalYearController::class, 'toggleStatus'])
        ->name('fiscal-years.toggle-status');
    Route::patch('fiscal-years/{fiscal_year}/set-default', [FiscalYearController::class, 'setDefault'])
        ->name('fiscal-years.set-default');
    Route::patch('fiscal-years/{fiscal_year}/toggle-lock', [FiscalYearController::class, 'toggleLock'])
        ->name('fiscal-years.toggle-lock');
    Route::resource('fiscal-years', FiscalYearController::class)->except(['create', 'show', 'edit']);
    Route::patch('users/{user}/toggle-status', [AdminUserController::class, 'toggleStatus'])
        ->name('users.toggle-status');
    Route::resource('users', AdminUserController::class)->except(['show', 'create', 'edit']);
});

Route::prefix('super-admin')->middleware(['auth', 'role:super_admin'])->name('superadmin.')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Root User Management
    Route::get('/users', [UserController::class, 'index'])->name('users.index');
    Route::post('/users', [UserController::class, 'store'])->name('users.store');
    Route::put('/users/{user}', [UserController::class, 'update'])->name('users.update');
    Route::patch('/users/{user}/toggle-status', [UserController::class, 'toggleStatus'])->name('users.toggle-status');
    Route::post('/users/{user}/reset-password', [UserController::class, 'resetPassword'])->name('users.reset-password');
    Route::delete('/users/{user}', [UserController::class, 'destroy'])->name('users.destroy');

    // Impersonate
    Route::post('/impersonate/{user}', [ImpersonateController::class, 'start'])->name('impersonate.start');

    // Audit Logs
    Route::get('/audit-logs', [AuditLogController::class, 'index'])->name('audit-logs.index');

    // System Settings
    Route::get('/settings', [SettingController::class, 'index'])->name('settings.index');
    Route::post('/settings', [SettingController::class, 'update'])->name('settings.update');

    // Dedicated Fiscal Years & Tutup Buku
    Route::patch('/fiscal-years/{fiscal_year}/toggle-lock', [App\Http\Controllers\SuperAdmin\FiscalYearController::class, 'toggleLock'])->name('fiscal-years.toggle-lock');
    Route::patch('/fiscal-years/{fiscal_year}/toggle-status', [App\Http\Controllers\SuperAdmin\FiscalYearController::class, 'toggleStatus'])->name('fiscal-years.toggle-status');
    Route::patch('/fiscal-years/{fiscal_year}/set-default', [App\Http\Controllers\SuperAdmin\FiscalYearController::class, 'setDefault'])->name('fiscal-years.set-default');
    Route::resource('fiscal-years', App\Http\Controllers\SuperAdmin\FiscalYearController::class)->except(['create', 'show', 'edit']);

    // Global Monitoring
    Route::get('/monitoring/rba', [MonitoringController::class, 'rba'])->name('monitoring.rba');
    Route::get('/monitoring/requisitions', [MonitoringController::class, 'requisitions'])->name('monitoring.requisitions');
    Route::get('/monitoring/finance', [MonitoringController::class, 'finance'])->name('monitoring.finance');
});

Route::post('/impersonate-leave', [ImpersonateController::class, 'stop'])
    ->name('superadmin.impersonate.leave')
    ->middleware('auth');

Route::middleware('auth')->group(function () {
    Route::get('/requisitions/{id}/print', [DivisiRequisitionController::class, 'print'])->name('requisitions.print');
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::match(['patch', 'post'], '/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::post('/set-year', [RootController::class, 'setYear'])->name('set-year');
});

require __DIR__.'/auth.php';
