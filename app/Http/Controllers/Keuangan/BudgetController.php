<?php

namespace App\Http\Controllers\Keuangan;

use App\Http\Controllers\Controller;
use App\Models\Budget;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
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
            return class_exists(\App\Models\FiscalYear::class)
                ? \App\Models\FiscalYear::getDefaultYear()
                : (int) date('Y');
        });

        return Inertia::render('Keuangan/Budgets/Index', [
            'budgets' => Budget::where('period_year', $activeYear)
                ->orderBy('account_code')
                ->get([
                    'id', 'account_code', 'account_name', 'period_year', 'total_budget', 'remaining_budget',
                ]),
            'active_year' => $activeYear,
            'success' => session('success'),
            'error' => session('error'),
        ]);
    }

    /**
     * Show the form for creating a new budget.
     */
    public function create(): Response
    {
        $activeYear = (int) session('active_year', function () {
            return class_exists(\App\Models\FiscalYear::class)
                ? \App\Models\FiscalYear::getDefaultYear()
                : (int) date('Y');
        });

        return Inertia::render('Keuangan/Budgets/Create', [
            'default_year' => $activeYear,
        ]);
    }

    /**
     * Store a newly created budget in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'account_code' => ['required', 'string', 'max:255'],
            'account_name' => ['required', 'string', 'max:255'],
            'period_year' => ['required', 'integer', 'digits:4', 'min:2000', 'max:2100'],
            'total_budget' => ['required', 'numeric', 'min:0'],
        ]);

        // Sisa anggaran otomatis sama dengan total anggaran saat pagu dibuat.
        Budget::create($validated + ['remaining_budget' => $validated['total_budget']]);

        return redirect()
            ->route('budgets.index')
            ->with('success', 'Pagu anggaran "'.$validated['account_name'].'" berhasil ditambahkan.');
    }

    /**
     * Show the form for editing the specified budget.
     */
    public function edit(Budget $budget): Response
    {
        return Inertia::render('Keuangan/Budgets/Edit', [
            'budget' => $budget->only([
                'id', 'account_code', 'account_name', 'period_year', 'total_budget', 'remaining_budget',
            ]),
        ]);
    }

    /**
     * Update the specified budget in storage.
     */
    public function update(Request $request, Budget $budget): RedirectResponse
    {
        $validated = $request->validate([
            'account_code' => ['required', 'string', 'max:255'],
            'account_name' => ['required', 'string', 'max:255'],
            'period_year' => ['required', 'integer', 'digits:4', 'min:2000', 'max:2100'],
            'total_budget' => ['required', 'numeric', 'min:0'],
        ]);

        // remaining_budget tidak diubah di sini — dikelola saat realisasi anggaran.
        $budget->update($validated);

        return redirect()
            ->route('budgets.index')
            ->with('success', 'Pagu anggaran berhasil diperbarui.');
    }

    /**
     * Remove the specified budget from storage.
     */
    public function destroy(Budget $budget): RedirectResponse
    {
        $budget->delete();

        return redirect()
            ->route('budgets.index')
            ->with('success', 'Pagu anggaran "'.$budget->account_name.'" berhasil dihapus.');
    }
}
