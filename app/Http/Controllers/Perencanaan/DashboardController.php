<?php

namespace App\Http\Controllers\Perencanaan;

use App\Http\Controllers\Controller;
use App\Models\Item;
use App\Models\Requisition;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the Perencanaan dashboard.
     */
    public function index(): Response
    {
        $activeYear = session('active_year', date('Y'));

        $baseQuery = Requisition::where(function ($q) use ($activeYear) {
            $q->where('budget_year', $activeYear)
              ->orWhere(function ($sq) use ($activeYear) {
                  $sq->whereNull('budget_year')->where('fiscal_year', $activeYear);
              });
        });

        $pendingRequisitions = (clone $baseQuery)
            ->with(['division', 'rbaAccount'])
            ->where('status', 'Pending_Perencanaan')
            ->latest('submission_date')
            ->latest('id')
            ->take(5)
            ->get();

        // Data for Status Donut Chart
        $statusCounts = (clone $baseQuery)
            ->selectRaw('status, count(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        $statusData = [
            'pending_perencanaan' => $statusCounts['Pending_Perencanaan'] ?? 0,
            'diproses_keuangan' => $statusCounts['Diproses_Keuangan'] ?? 0,
            'disetujui' => $statusCounts['Disetujui_Selesai'] ?? 0,
            'ditolak' => $statusCounts['Ditolak'] ?? 0,
        ];

        // Data for Target vs Realisasi Chart
        $rba = \App\Models\RbaShift::where('year', $activeYear)
            ->where('status', 'Aktif')
            ->first();

        $targetRevenue = 0;
        $plannedExpense = 0;

        if ($rba) {
            $rootRevenue = $rba->revenueItems()->where('item_code', '0')->first();
            $rootExpense = $rba->expenseItems()->where('account_code', '1')->first();

            $targetRevenue = $rootRevenue ? (float) $rootRevenue->after_amount : 0;
            $plannedExpense = $rootExpense ? (float) $rootExpense->after_total : 0;
        }

        // Realisasi Pendapatan (from Revenue model)
        $realisasiPendapatan = (float) \App\Models\Revenue::whereYear('date', $activeYear)->sum('amount');
        
        // Serapan Belanja (from Requisition model)
        // We consider Disetujui_Selesai as absorbed budget.
        $serapanBelanja = (float) (clone $baseQuery)
            ->where('status', 'Disetujui_Selesai')
            ->sum(\Illuminate\Support\Facades\DB::raw('COALESCE(NULLIF(total_approved, 0), total_estimated)'));

        $chartData = [
            'target_revenue' => $targetRevenue,
            'realisasi_revenue' => $realisasiPendapatan,
            'planned_expense' => $plannedExpense,
            'serapan_expense' => $serapanBelanja,
        ];

        return Inertia::render('Perencanaan/Dashboard', [
            'total_requests' => (clone $baseQuery)->count(),
            'total_to_verify' => $statusData['pending_perencanaan'],
            'total_verified' => $statusData['diproses_keuangan'] + $statusData['disetujui'],
            'total_items' => Item::count(),
            'pending_requisitions' => $pendingRequisitions,
            'status_data' => $statusData,
            'chart_data' => $chartData,
            'active_year' => $activeYear,
        ]);
    }
}
