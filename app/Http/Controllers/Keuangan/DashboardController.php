<?php

namespace App\Http\Controllers\Keuangan;

use App\Http\Controllers\Controller;
use App\Models\Budget;
use App\Models\Requisition;
use App\Models\RequisitionDetail;
use App\Models\Revenue;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the Keuangan dashboard.
     */
    public function index(): Response
    {
        $activeYear = (int) session('active_year', function () {
            return class_exists(\App\Models\FiscalYear::class)
                ? \App\Models\FiscalYear::getDefaultYear()
                : (int) date('Y');
        });

        $totalInitial = (float) Budget::where('period_year', $activeYear)->sum('total_budget');
        $totalRemaining = (float) Budget::where('period_year', $activeYear)->sum('remaining_budget');
        
        // P0-2 FIX: Official expense is the sum of approved requisitions, not the ledger difference
        $totalSpent = (float) RequisitionDetail::whereHas('requisition', function ($q) use ($activeYear) {
            $q->where('status', 'Disetujui_Selesai')
              ->where(function ($sq) use ($activeYear) {
                  $sq->where('budget_year', $activeYear)
                     ->orWhere(function ($ssq) use ($activeYear) {
                         $ssq->whereNull('budget_year')->where('fiscal_year', $activeYear);
                     });
              });
        })->sum('subtotal');
        
        $totalRevenue = (float) Revenue::whereYear('date', $activeYear)->sum('amount');

        $totalLedgerSpent = max(0, $totalInitial - $totalRemaining);

        $budgetChartData = [
            [
                'name' => 'Realisasi Belanja (Terpakai)',
                'value' => $totalLedgerSpent,
                'fill' => '#f59e0b',
            ],
            [
                'name' => 'Sisa Pagu Tersedia',
                'value' => $totalRemaining,
                'fill' => '#059669',
            ],
        ];

        // Top 5 Budgets breakdown
        $topBudgets = Budget::where('period_year', $activeYear)
            ->orderByDesc('total_budget')
            ->limit(5)
            ->get()
            ->map(function ($b) {
                $initial = (float) $b->total_budget;
                $remaining = (float) $b->remaining_budget;
                $spent = max(0, $initial - $remaining);

                return [
                    'name' => strlen($b->account_name) > 20 ? substr($b->account_name, 0, 18) . '...' : $b->account_name,
                    'full_name' => $b->account_name,
                    'terpakai' => $spent,
                    'sisa' => $remaining,
                ];
            });

        // Monthly Revenue Trend
        $months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];
        $monthlyData = array_fill_keys($months, 0);
        $revenues = Revenue::whereYear('date', $activeYear)->get();
        foreach ($revenues as $rev) {
            // $rev->date is cast to Carbon
            $monthIndex = (int) $rev->date->format('n') - 1;
            $monthlyData[$months[$monthIndex]] += (float) $rev->amount;
        }
        
        $revenueTrend = [];
        foreach ($monthlyData as $m => $val) {
            $revenueTrend[] = [
                'name' => $m,
                'pendapatan' => $val,
            ];
        }

        $totalProcessed = Requisition::where('status', 'Disetujui_Selesai')
            ->where(function ($q) use ($activeYear) {
                $q->where('budget_year', $activeYear)
                  ->orWhere(function ($sq) use ($activeYear) {
                      $sq->whereNull('budget_year')->where('fiscal_year', $activeYear);
                  });
            })
            ->count();

        return Inertia::render('Keuangan/Dashboard', [
            'total_budgets' => Budget::where('period_year', $activeYear)->count(),
            'total_budget_remaining' => $totalRemaining,
            'total_processed' => $totalProcessed,
            'total_revenue' => $totalRevenue,
            'budget_chart_data' => $budgetChartData,
            'top_budgets' => $topBudgets,
            'revenue_trend' => $revenueTrend,
            'total_spent' => $totalSpent,
            'active_year' => $activeYear,
        ]);
    }
}
