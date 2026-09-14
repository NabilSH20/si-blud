<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\FiscalYear;
use App\Models\Requisition;
use App\Models\Revenue;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class FiscalYearController extends Controller
{
    /**
     * Display a listing of fiscal years with stats.
     */
    public function index(): Response
    {
        $fiscalYears = FiscalYear::orderByDesc('year')->get()->map(function ($fy) {
            $reqCount = Requisition::where('budget_year', $fy->year)
                ->orWhere(function ($q) use ($fy) {
                    $q->whereNull('budget_year')->where('fiscal_year', $fy->year);
                })
                ->count();

            $revSum = (float) Revenue::whereYear('date', $fy->year)->sum('amount');

            return [
                'id' => $fy->id,
                'year' => $fy->year,
                'name' => $fy->name,
                'is_active' => (bool) $fy->is_active,
                'is_default' => (bool) $fy->is_default,
                'description' => $fy->description,
                'requisitions_count' => $reqCount,
                'revenues_sum' => $revSum,
                'created_at' => $fy->created_at?->format('d M Y'),
            ];
        });

        return Inertia::render('Admin/FiscalYears/Index', [
            'fiscalYears' => $fiscalYears,
            'success' => session('success'),
            'error' => session('error'),
        ]);
    }

    /**
     * Store a newly created fiscal year.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'year' => ['required', 'integer', 'digits:4', 'min:2020', 'max:2050', 'unique:fiscal_years,year'],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:500'],
            'is_active' => ['nullable', 'boolean'],
            'is_default' => ['nullable', 'boolean'],
        ], [
            'year.required' => 'Tahun anggaran wajib diisi.',
            'year.unique' => 'Tahun anggaran ini sudah terdaftar.',
            'year.digits' => 'Format tahun harus 4 digit angka (contoh: 2026).',
            'name.required' => 'Nama/Label tahun anggaran wajib diisi.',
        ]);

        $isDefault = (bool) ($validated['is_default'] ?? false);
        $isActive = isset($validated['is_active']) ? (bool) $validated['is_active'] : true;

        if ($isDefault) {
            FiscalYear::query()->update(['is_default' => false]);
            $isActive = true;
        }

        FiscalYear::create([
            'year' => $validated['year'],
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'is_active' => $isActive,
            'is_default' => $isDefault,
        ]);

        return redirect()->route('fiscal-years.index')
            ->with('success', "Tahun Anggaran {$validated['year']} berhasil ditambahkan.");
    }

    /**
     * Update the specified fiscal year.
     */
    public function update(Request $request, FiscalYear $fiscalYear): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:500'],
            'is_active' => ['nullable', 'boolean'],
            'is_default' => ['nullable', 'boolean'],
        ], [
            'name.required' => 'Nama/Label tahun anggaran wajib diisi.',
        ]);

        $isDefault = (bool) ($validated['is_default'] ?? false);
        $isActive = isset($validated['is_active']) ? (bool) $validated['is_active'] : $fiscalYear->is_active;

        if ($isDefault && !$fiscalYear->is_default) {
            FiscalYear::query()->update(['is_default' => false]);
            $isActive = true;
        }

        $fiscalYear->update([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'is_active' => $isActive,
            'is_default' => $isDefault,
        ]);

        return redirect()->route('fiscal-years.index')
            ->with('success', "Tahun Anggaran {$fiscalYear->year} berhasil diperbarui.");
    }

    /**
     * Toggle active status of the fiscal year.
     */
    public function toggleStatus(FiscalYear $fiscalYear): RedirectResponse
    {
        if ($fiscalYear->is_default && $fiscalYear->is_active) {
            return redirect()->route('fiscal-years.index')
                ->with('error', 'Tahun anggaran default tidak dapat dinonaktifkan. Tetapkan tahun default lain terlebih dahulu.');
        }

        $fiscalYear->is_active = !$fiscalYear->is_active;
        $fiscalYear->save();

        $statusLabel = $fiscalYear->is_active ? 'diaktifkan' : 'dinonaktifkan / ditutup';

        return redirect()->route('fiscal-years.index')
            ->with('success', "Tahun Anggaran {$fiscalYear->year} berhasil {$statusLabel}.");
    }

    /**
     * Set the fiscal year as default.
     */
    public function setDefault(FiscalYear $fiscalYear): RedirectResponse
    {
        FiscalYear::query()->update(['is_default' => false]);

        $fiscalYear->is_default = true;
        $fiscalYear->is_active = true;
        $fiscalYear->save();

        return redirect()->route('fiscal-years.index')
            ->with('success', "Tahun Anggaran {$fiscalYear->year} berhasil ditetapkan sebagai Tahun Default.");
    }

    /**
     * Remove the specified fiscal year if no transactions exist.
     */
    public function destroy(FiscalYear $fiscalYear): RedirectResponse
    {
        if ($fiscalYear->is_default) {
            return redirect()->route('fiscal-years.index')
                ->with('error', 'Tidak dapat menghapus Tahun Anggaran yang sedang menjadi default.');
        }

        $hasRequisitions = Requisition::where('budget_year', $fiscalYear->year)
            ->orWhere(function ($q) use ($fiscalYear) {
                $q->whereNull('budget_year')->where('fiscal_year', $fiscalYear->year);
            })
            ->exists();

        $hasRevenues = Revenue::whereYear('date', $fiscalYear->year)->exists();

        if ($hasRequisitions || $hasRevenues) {
            return redirect()->route('fiscal-years.index')
                ->with('error', "Tidak dapat menghapus TA {$fiscalYear->year} karena telah memiliki data usulan belanja atau pencatatan pendapatan BLUD.");
        }

        $yr = $fiscalYear->year;
        $fiscalYear->delete();

        return redirect()->route('fiscal-years.index')
            ->with('success', "Tahun Anggaran {$yr} berhasil dihapus.");
    }
}
