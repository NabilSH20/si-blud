<?php

namespace App\Http\Controllers\Keuangan;

use App\Http\Controllers\Controller;
use App\Models\Budget;
use App\Models\RbaShift;
use App\Models\RequisitionDetail;
use App\Models\Revenue;
use Carbon\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    /**
     * Display the Budget Realization Report index.
     */
    public function index(): Response
    {
        $reportData = $this->getReportData();

        return Inertia::render('Keuangan/Reports/Index', $reportData);
    }

    /**
     * Display the Printable Budget Realization Report.
     */
    public function print(): Response
    {
        $reportData = $this->getReportData();

        return Inertia::render('Shared/PrintReport', $reportData);
    }

    /**
     * Display the Executive Surplus/Deficit Report (Laporan Operasional E-BLUD).
     */
    public function surplusDeficit(): Response
    {
        $data = $this->getSurplusDeficitData();

        return Inertia::render('Keuangan/Reports/SurplusDeficit', $data);
    }

    /**
     * Display the Printable Surplus/Deficit Report.
     */
    public function printSurplusDeficit(): Response
    {
        $data = $this->getSurplusDeficitData();

        return Inertia::render('Shared/PrintSurplusDeficit', $data);
    }

    /**
     * Get computed surplus/deficit data.
     */
    protected function getSurplusDeficitData(): array
    {
        $activeYear = (int) session('active_year', function () {
            return class_exists(\App\Models\FiscalYear::class)
                ? \App\Models\FiscalYear::getDefaultYear()
                : (int) date('Y');
        });

        // Realisasi Pendapatan pada Tahun Anggaran Aktif
        $totalRevenue = (float) Revenue::whereYear('date', $activeYear)->sum('amount');
        $revenueSources = Revenue::whereYear('date', $activeYear)
            ->selectRaw('source, sum(amount) as total_amount, count(*) as count')
            ->groupBy('source')
            ->orderByDesc('total_amount')
            ->get()
            ->map(fn ($r) => [
                'source' => $r->source,
                'total_amount' => (float) $r->total_amount,
                'count' => (int) $r->count,
            ]);

        // Realisasi Belanja pada Tahun Anggaran Aktif
        $requisitionExpense = (float) RequisitionDetail::whereHas('requisition', function ($q) use ($activeYear) {
            $q->where('status', 'Disetujui_Selesai')
              ->where(function ($sq) use ($activeYear) {
                  $sq->where('budget_year', $activeYear)
                     ->orWhere(function ($ssq) use ($activeYear) {
                         $ssq->whereNull('budget_year')->where('fiscal_year', $activeYear);
                     });
              });
        })->sum('subtotal');

        $budgetExpenses = Budget::where('period_year', $activeYear)
            ->orderBy('account_code')
            ->get()
            ->map(function ($b) {
                $initial = (float) $b->total_budget;
                $remaining = (float) $b->remaining_budget;
                $spent = max(0, $initial - $remaining);

                return [
                    'account_code' => $b->account_code,
                    'account_name' => $b->account_name,
                    'spent' => $spent,
                ];
            });

        $totalBudgetSpent = (float) $budgetExpenses->sum('spent');
        $totalExpense = max($requisitionExpense, $totalBudgetSpent);

        // Surplus / Defisit
        $surplusDeficit = $totalRevenue - $totalExpense;
        $isSurplus = $surplusDeficit >= 0;

        // RBA Benchmark (Active RBA for active year)
        // RBA Benchmark (Active RBA for active year)
        $rba = RbaShift::where('year', $activeYear)
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

        $revenueAchievement = $targetRevenue > 0 ? round(($totalRevenue / $targetRevenue) * 100, 1) : 0;
        $expenseAbsorption = $plannedExpense > 0 ? round(($totalExpense / $plannedExpense) * 100, 1) : 0;

        return [
            'period_year' => $activeYear,
            'summary' => [
                'total_revenue' => $totalRevenue,
                'total_expense' => $totalExpense,
                'surplus_deficit' => $surplusDeficit,
                'is_surplus' => $isSurplus,
                'target_revenue' => $targetRevenue,
                'planned_expense' => $plannedExpense,
                'revenue_achievement' => $revenueAchievement,
                'expense_absorption' => $expenseAbsorption,
                'rba_status' => $rba ? $rba->status : 'Belum Disusun',
            ],
            'revenue_sources' => $revenueSources,
            'expense_categories' => $budgetExpenses,
            'printed_at' => Carbon::now()->translatedFormat('d F Y'),
            'active_year' => $activeYear,
        ];
    }

    /**
     * Get computed budget report data.
     */
    protected function getReportData(): array
    {
        $activeYear = (int) session('active_year', function () {
            return class_exists(\App\Models\FiscalYear::class)
                ? \App\Models\FiscalYear::getDefaultYear()
                : (int) date('Y');
        });

        $budgets = Budget::where('period_year', $activeYear)
            ->orderBy('account_code')
            ->get()
            ->map(function ($budget) {
            $totalBudget = (float) $budget->total_budget;
            $remainingBudget = (float) $budget->remaining_budget;
            $spent = max(0, $totalBudget - $remainingBudget);
            $percentage = $totalBudget > 0 ? round(($spent / $totalBudget) * 100, 2) : 0;

            return [
                'id' => $budget->id,
                'account_code' => $budget->account_code,
                'account_name' => $budget->account_name,
                'period_year' => $budget->period_year,
                'total_budget' => $totalBudget,
                'total_spent' => $spent,
                'remaining_budget' => $remainingBudget,
                'percentage' => $percentage,
            ];
        });

        $totalInitial = $budgets->sum('total_budget');
        $totalSpent = $budgets->sum('total_spent');
        $totalRemaining = $budgets->sum('remaining_budget');
        $overallPercentage = $totalInitial > 0 ? round(($totalSpent / $totalInitial) * 100, 2) : 0;

        return [
            'budgets' => $budgets,
            'summary' => [
                'total_initial' => $totalInitial,
                'total_spent' => $totalSpent,
                'total_remaining' => $totalRemaining,
                'overall_percentage' => $overallPercentage,
            ],
        ];
    }
}
