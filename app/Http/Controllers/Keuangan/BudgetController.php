<?php

namespace App\Http\Controllers\Keuangan;

use App\Http\Controllers\Controller;
use App\Models\Budget;
use App\Models\FiscalYear;
use Inertia\Inertia;
use Inertia\Response;

class BudgetController extends Controller
{
    /**
     * Display a listing of the budgets.
     */
    public function index(): Response
    {
        $activeYear = (int) session('active_year', function () {
            return class_exists(FiscalYear::class)
                ? FiscalYear::getDefaultYear()
                : (int) date('Y');
        });

        return Inertia::render('Keuangan/Budgets/Index', [
            'budgets' => Budget::where('period_year', $activeYear)
                ->orderBy('account_code')
                ->get([
                    'id', 'account_code', 'account_name', 'period_year', 'total_budget', 'remaining_budget', 'parent_code',
                ]),
            'active_year' => $activeYear,
            'success' => session('success'),
            'error' => session('error'),
        ]);
    }
}
