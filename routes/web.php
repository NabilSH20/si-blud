<?php

use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Divisi\DashboardController as DivisiDashboardController;
use App\Http\Controllers\Keuangan\DashboardController as KeuanganDashboardController;
use App\Http\Controllers\Perencanaan\DashboardController as PerencanaanDashboardController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    $user = auth()->user();

    if ($user) {
        return redirect($user->dashboardPath());
    }

    return redirect('/login');
});

Route::middleware('auth')->group(function () {
    Route::get('/divisi/dashboard', [DivisiDashboardController::class, 'index'])
        ->name('divisi.dashboard');
});

Route::middleware('auth')->group(function () {
    Route::get('/perencanaan/dashboard', [PerencanaanDashboardController::class, 'index'])
        ->name('perencanaan.dashboard');
});

Route::middleware('auth')->group(function () {
    Route::get('/keuangan/dashboard', [KeuanganDashboardController::class, 'index'])
        ->name('keuangan.dashboard');
});

Route::middleware('auth')->group(function () {
    Route::get('/admin/dashboard', [AdminDashboardController::class, 'index'])
        ->name('admin.dashboard');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
