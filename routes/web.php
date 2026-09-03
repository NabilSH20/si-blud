<?php

use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\DivisionController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\Divisi\DashboardController as DivisiDashboardController;
use App\Http\Controllers\Divisi\RequisitionController as DivisiRequisitionController;
use App\Http\Controllers\Keuangan\BudgetController;
use App\Http\Controllers\Keuangan\DashboardController as KeuanganDashboardController;
use App\Http\Controllers\Keuangan\RequisitionController as KeuanganRequisitionController;
use App\Http\Controllers\Perencanaan\DashboardController as PerencanaanDashboardController;
use App\Http\Controllers\Perencanaan\ItemController;
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
});

Route::prefix('keuangan')->middleware('auth')->group(function () {
    Route::get('/dashboard', [KeuanganDashboardController::class, 'index'])
        ->name('keuangan.dashboard');

    Route::resource('budgets', BudgetController::class)->except(['show']);
    Route::resource('requisitions', KeuanganRequisitionController::class)
        ->only(['index', 'show', 'update'])
        ->names('keuangan.requisitions');
});

Route::prefix('admin')->middleware('auth')->group(function () {
    Route::get('/dashboard', [AdminDashboardController::class, 'index'])
        ->name('admin.dashboard');

    Route::resource('divisions', DivisionController::class)->except(['show']);
    Route::resource('users', AdminUserController::class)->except(['show']);
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
