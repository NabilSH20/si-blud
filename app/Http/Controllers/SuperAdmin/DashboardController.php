<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Division;
use App\Models\FiscalYear;
use App\Models\Item;
use App\Models\RbaAccount;
use App\Models\Requisition;
use App\Models\Revenue;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the 3-in-1 Executive Super Admin Dashboard.
     */
    public function index(Request $request): Response
    {
        $activeYear = (int) session('active_year', date('Y'));
        $fiscalYear = FiscalYear::where('year', $activeYear)->first();

        // 1. KPI Perencanaan (RBA & Usulan)
        $reqQuery = Requisition::where(function ($q) use ($activeYear) {
            $q->where('budget_year', $activeYear)
                ->orWhere('fiscal_year', $activeYear);
        });

        $totalRequisitions = (clone $reqQuery)->count();
        $pendingPerencanaan = (clone $reqQuery)->where('status', 'Pending_Perencanaan')->count();
        $diprosesKeuangan = (clone $reqQuery)->where('status', 'Diproses_Keuangan')->count();
        $disetujuiSelesai = (clone $reqQuery)->where('status', 'Disetujui_Selesai')->count();
        $ditolak = (clone $reqQuery)->where('status', 'Ditolak')->count();
        $totalEstimatedUsulan = (float) (clone $reqQuery)->sum('total_estimated');

        $rbaQuery = RbaAccount::where(function ($q) use ($activeYear) {
            $q->where('period_year', $activeYear)->orWhere('year', $activeYear);
        });
        $totalPaguMurni = (float) (clone $rbaQuery)->sum('total_budget');
        $totalPaguPergeseran = (float) (clone $rbaQuery)->selectRaw('COALESCE(SUM(COALESCE(budget_after_revision, total_budget)), 0) as total')->value('total');

        // 2. KPI Keuangan (Pendapatan & Realisasi Kas SP2D)
        $totalRevenue = (float) Revenue::whereYear('date', $activeYear)->sum('amount');
        $totalRealisasiBelanja = (float) (clone $reqQuery)->where('status', 'Disetujui_Selesai')->sum('total_approved');

        // 3. KPI Pengguna & Sistem
        $totalUsers = User::count();
        $activeUsers = User::where('is_active', true)->count();
        $usersByRole = User::select('role', DB::raw('count(*) as count'))
            ->groupBy('role')
            ->pluck('count', 'role')
            ->toArray();

        // 4. Riwayat 10 Audit Log Terbaru
        $recentAuditLogs = ActivityLog::with(['user:id,name,role', 'impersonator:id,name'])
            ->latest('created_at')
            ->limit(10)
            ->get();

        // 5. Sebaran Usulan per Divisi Induk
        $requisitionsByDivision = Division::withCount(['requisitions' => function ($q) use ($activeYear) {
            $q->where('budget_year', $activeYear)->orWhere('fiscal_year', $activeYear);
        }])
            ->get(['id', 'name', 'division_code'])
            ->map(fn ($d) => [
                'name' => $d->name,
                'code' => $d->division_code,
                'count' => $d->requisitions_count,
            ]);

        return Inertia::render('SuperAdmin/Dashboard', [
            'active_year' => $activeYear,
            'is_locked' => (bool) ($fiscalYear?->is_locked ?? false),
            'kpi_perencanaan' => [
                'total_pagu_murni' => $totalPaguMurni,
                'total_pagu_pergeseran' => $totalPaguPergeseran,
                'total_usulan' => $totalRequisitions,
                'pending_perencanaan' => $pendingPerencanaan,
                'total_estimated' => $totalEstimatedUsulan,
            ],
            'kpi_keuangan' => [
                'diproses_keuangan' => $diprosesKeuangan,
                'disetujui_selesai' => $disetujuiSelesai,
                'ditolak' => $ditolak,
                'total_revenue' => $totalRevenue,
                'total_realisasi_belanja' => $totalRealisasiBelanja,
                'surplus_defisit' => $totalRevenue - $totalRealisasiBelanja,
            ],
            'kpi_users' => [
                'total' => $totalUsers,
                'active' => $activeUsers,
                'by_role' => $usersByRole,
                'divisions_count' => Division::count(),
                'units_count' => Unit::count(),
                'items_count' => Item::count(),
            ],
            'recent_audit_logs' => $recentAuditLogs,
            'requisitions_by_division' => $requisitionsByDivision,
            'server_info' => [
                'php_version' => PHP_VERSION,
                'laravel_version' => app()->version(),
                'environment' => config('app.env'),
                'server_time' => now()->translatedFormat('l, d F Y H:i:s'),
            ],
        ]);
    }
}
