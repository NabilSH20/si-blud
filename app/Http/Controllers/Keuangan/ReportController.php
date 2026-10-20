<?php

namespace App\Http\Controllers\Keuangan;

use App\Http\Controllers\Controller;
use App\Models\Budget;
use App\Models\FiscalYear;
use App\Models\RbaShift;
use App\Models\RequisitionDetail;
use App\Models\Revenue;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    /**
     * Display the Budget Realization Report index.
     */
    public function index(Request $request): Response
    {
        $year = $request->input('year');
        $search = $request->input('search');
        $kategori = $request->input('kategori');

        $reportData = $this->getReportData($year, $search, $kategori);

        $availableYears = Budget::select('period_year')
            ->distinct()
            ->orderByDesc('period_year')
            ->pluck('period_year')
            ->toArray();

        return Inertia::render('Keuangan/Reports/Index', [
            'budgets' => $reportData['budgets'],
            'summary' => $reportData['summary'],
            'filters' => [
                'year' => $year ?: $reportData['active_year'],
                'search' => $search,
                'kategori' => $kategori,
            ],
            'availableYears' => empty($availableYears) ? [$reportData['active_year']] : $availableYears,
        ]);
    }

    /**
     * Display the Printable Budget Realization Report.
     */
    public function print(Request $request): Response
    {
        $year = $request->input('year');
        $search = $request->input('search');
        $kategori = $request->input('kategori');

        $reportData = $this->getReportData($year, $search, $kategori);

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
            return class_exists(FiscalYear::class)
                ? FiscalYear::getDefaultYear()
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

        // Robust dynamic root node algorithm for filtered data to prevent double-counting.
        $budgetCodes = $budgetExpenses->pluck('account_code')->toArray();
        $totalBudgetSpent = (float) $budgetExpenses->filter(function ($b) use ($budgetCodes) {
            $parts = explode('.', $b['account_code']);
            $prefix = '';
            for ($i = 0; $i < count($parts) - 1; $i++) {
                $prefix .= ($i == 0 ? '' : '.').$parts[$i];
                if (in_array($prefix, $budgetCodes)) {
                    return false; // Found a parent in the current result set
                }
            }

            return true;
        })->sum('spent');

        // P0-2 FIX: Official expense must be exactly the sum of actual requisitions
        $totalExpense = $requisitionExpense;

        // Calculate discrepancy between ledger and actual transactions
        $discrepancyAmount = abs($requisitionExpense - $totalBudgetSpent);
        $hasDiscrepancy = $discrepancyAmount > 1000; // Tolerance for small rounding issues

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
            // P1-1 FIX: Dinamis menjumlahkan kategori level 1, jangan asumsikan item_code '0' selalu ada/akurat
            $targetRevenue = (float) $rba->revenueItems()
                ->whereIn('item_code', ['1', '2', '3', '4', '5'])
                ->sum('after_amount');

            $rootExpense = $rba->expenseItems()->where('account_code', '1')->first();
            $plannedExpense = $rootExpense ? (float) $rootExpense->after_total : 0;
        }

        $revenueAchievement = $targetRevenue > 0 ? round(($totalRevenue / $targetRevenue) * 100, 1) : 0;
        $expenseAbsorption = $plannedExpense > 0 ? round(($totalExpense / $plannedExpense) * 100, 1) : 0;

        return [
            'period_year' => $activeYear,
            'summary' => [
                'total_revenue' => $totalRevenue,
                'total_expense' => $totalExpense,
                'budget_ledger_expense' => $totalBudgetSpent,
                'has_discrepancy' => $hasDiscrepancy,
                'discrepancy_amount' => $discrepancyAmount,
                'surplus_deficit' => $surplusDeficit,
                'is_surplus' => $isSurplus,
                'target_revenue' => $targetRevenue,
                'planned_expense' => $plannedExpense,
                'revenue_achievement' => $revenueAchievement,
                'expense_absorption' => $expenseAbsorption,
                'rba_status' => $rba ? $rba->status : 'Belum Disusun',
                'current_input_year' => (int) date('Y'),
                'ongoing_year_realized' => (float) Revenue::whereYear('date', date('Y'))->sum('amount'),
                'is_future_planning' => (int) $activeYear > (int) date('Y'),
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
    protected function getReportData($year = null, $search = null, $kategori = null): array
    {
        $activeYear = $year ?: (int) session('active_year', function () {
            return class_exists(FiscalYear::class)
                ? FiscalYear::getDefaultYear()
                : (int) date('Y');
        });

        $query = Budget::where('period_year', $activeYear);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('account_code', 'like', "%{$search}%")
                    ->orWhere('account_name', 'like', "%{$search}%");
            });
        }

        if ($kategori) {
            $query->where('kategori_belanja', $kategori);
        }

        $budgets = $query->get()
            ->sortBy('account_code', SORT_NATURAL)
            ->values()
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

        // Robust dynamic root node algorithm for filtered data to prevent double-counting.
        // A node is a "root of the result set" if no prefix (parent) of it exists in the result set.
        $codes = $budgets->pluck('account_code')->toArray();
        $rootBudgets = $budgets->filter(function ($b) use ($codes) {
            $parts = explode('.', $b['account_code']);
            $prefix = '';
            for ($i = 0; $i < count($parts) - 1; $i++) {
                $prefix .= ($i == 0 ? '' : '.').$parts[$i];
                if (in_array($prefix, $codes)) {
                    return false; // Found a parent in the current result set
                }
            }

            return true;
        });

        $totalInitial = $rootBudgets->sum('total_budget');
        $totalSpent = $rootBudgets->sum('total_spent');
        $totalRemaining = $rootBudgets->sum('remaining_budget');
        $overallPercentage = $totalInitial > 0 ? round(($totalSpent / $totalInitial) * 100, 2) : 0;

        return [
            'budgets' => $budgets,
            'active_year' => $activeYear,
            'summary' => [
                'total_initial' => $totalInitial,
                'total_spent' => $totalSpent,
                'total_remaining' => $totalRemaining,
                'overall_percentage' => $overallPercentage,
            ],
        ];
    }
}
