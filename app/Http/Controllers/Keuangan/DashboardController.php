<?php

namespace App\Http\Controllers\Keuangan;

use App\Http\Controllers\Controller;
use App\Models\Budget;
use App\Models\Requisition;
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
        $activeYear = session('active_year', date('Y'));

        $totalInitial = (float) Budget::sum('total_budget');
        $totalRemaining = (float) Budget::sum('remaining_budget');
        $totalSpent = max(0, $totalInitial - $totalRemaining);
        $totalRevenue = (float) Revenue::sum('amount');

        $budgetChartData = [
            [
                'name' => 'Realisasi Belanja (Terpakai)',
                'value' => $totalSpent,
                'fill' => '#f59e0b',
            ],
            [
                'name' => 'Sisa Pagu Tersedia',
                'value' => $totalRemaining,
                'fill' => '#059669',
            ],
        ];

        // Top 5 Budgets breakdown
        $topBudgets = Budget::orderByDesc('total_budget')
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

        $totalProcessed = Requisition::where('status', 'Disetujui_Selesai')
            ->where(function ($q) use ($activeYear) {
                $q->where('budget_year', $activeYear)
                  ->orWhere(function ($sq) use ($activeYear) {
                      $sq->whereNull('budget_year')->where('fiscal_year', $activeYear);
                  });
            })
            ->count();

        return Inertia::render('Keuangan/Dashboard', [
            'total_budgets' => Budget::count(),
            'total_budget_remaining' => $totalRemaining,
            'total_processed' => $totalProcessed,
            'total_revenue' => $totalRevenue,
            'budget_chart_data' => $budgetChartData,
            'top_budgets' => $topBudgets,
            'total_spent' => $totalSpent,
            'active_year' => $activeYear,
        ]);
    }
}
