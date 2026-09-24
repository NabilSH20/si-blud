<?php

namespace App\Http\Controllers\Perencanaan;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Keuangan\RevenueController;
use App\Models\FiscalYear;
use App\Models\RbaAccount;
use App\Models\RbaExpenseItem;
use App\Models\RbaRevenueItem;
use App\Models\RbaShift;
use App\Models\Requisition;
use App\Models\RequisitionDetail;
use App\Models\Revenue;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class RbaController extends Controller
{
    /**
     * Display the RBA Belanja and Pendapatan view with budget shifts.
     */
    public function index(Request $request): Response
    {
        // 1. Ambil tahun aktif dari master FiscalYear buatan Admin
        $activeFiscalYears = FiscalYear::where('is_active', true)->orderBy('year')->pluck('year')->toArray();
        if (empty($activeFiscalYears)) {
            $shiftYears = RbaShift::distinct()->pluck('year')->filter()->toArray();
            $reqYears = \App\Models\Requisition::distinct()->pluck('budget_year')->filter()->toArray();
            $activeFiscalYears = array_values(array_unique(array_merge([2026, 2027], $shiftYears, $reqYears)));
        }

        $defaultYear = class_exists(FiscalYear::class) ? FiscalYear::getDefaultYear() : (int) date('Y');
        $activeSessionYear = (int) session('active_year', $defaultYear);
        $selectedYear = (int) $request->query('year', $activeSessionYear);

        if (!in_array($selectedYear, $activeFiscalYears)) {
            $activeFiscalYears[] = $selectedYear;
        }
        $availableYears = array_values(array_unique($activeFiscalYears));
        sort($availableYears);

        session(['active_year' => $selectedYear]);

        // Retrieve shifts for the selected year (ordered chronologically)
        $shifts = RbaShift::where('year', $selectedYear)->orderBy('id', 'asc')->get();

        // If no shift exists, initialize default Murni shift
        if ($shifts->isEmpty()) {
            $templateShift = RbaShift::where('status', 'Aktif')->latest('id')->first()
                ?? RbaShift::latest('id')->first();

            $newShift = DB::transaction(function () use ($selectedYear, $templateShift) {
                    $shift = RbaShift::create([
                        'year' => $selectedYear,
                        'shift_name' => 'Murni',
                        'doc_title' => "RENCANA BISNIS DAN ANGGARAN MURNI T.A. {$selectedYear}",
                        'period_month' => "Januari {$selectedYear}",
                        'status' => 'Aktif',
                        'notes' => "RBA Definitif Murni Tahun Anggaran {$selectedYear} RS Jiwa Tampan.",
                    ]);

                    if ($templateShift) {
                        foreach ($templateShift->expenseItems as $item) {
                            RbaExpenseItem::create([
                                'rba_shift_id' => $shift->id,
                                'rba_account_id' => $item->rba_account_id,
                                'account_code' => $item->account_code,
                                'account_name' => $item->account_name,
                                'parent_code' => $item->parent_code,
                                'level' => $item->level,
                                'is_header' => $item->is_header,
                                'before_jasa_layanan' => $item->after_jasa_layanan,
                                'before_hasil_kerjasama' => $item->after_hasil_kerjasama,
                                'before_lain_lain_sah' => $item->after_lain_lain_sah,
                                'before_silpa' => $item->after_silpa,
                                'before_apbd' => $item->after_apbd,
                                'before_total' => $item->after_total,
                                'after_jasa_layanan' => $item->after_jasa_layanan,
                                'after_hasil_kerjasama' => $item->after_hasil_kerjasama,
                                'after_lain_lain_sah' => $item->after_lain_lain_sah,
                                'after_silpa' => $item->after_silpa,
                                'after_apbd' => $item->after_apbd,
                                'after_total' => $item->after_total,
                                'difference' => 0,
                                'keterangan' => null,
                                'order_index' => $item->order_index,
                            ]);
                        }

                        foreach ($templateShift->revenueItems as $rev) {
                            RbaRevenueItem::create([
                                'rba_shift_id' => $shift->id,
                                'item_code' => $rev->item_code,
                                'item_name' => $rev->item_name,
                                'parent_code' => $rev->parent_code,
                                'level' => $rev->level,
                                'is_header' => $rev->is_header,
                                'before_amount' => $rev->after_amount,
                                'after_amount' => $rev->after_amount,
                                'difference' => 0,
                                'order_index' => $rev->order_index,
                            ]);
                        }
                    }

                    return $shift;
                });

                $shifts = collect([$newShift]);
        }

        $selectedShiftId = $request->query('shift_id');
        $currentShift = $selectedShiftId
            ? $shifts->firstWhere('id', $selectedShiftId)
            : ($shifts->firstWhere('status', 'Aktif') ?? $shifts->first());

        if ($currentShift) {
            $this->ensureShiftItemsPopulated($currentShift);
        }

        // Attach computed totals to each shift for high-level version comparison
        $shifts->transform(function ($s) {
            $this->ensureShiftItemsPopulated($s);
            $rootExp = $s->expenseItems()->where('account_code', '1')->first();
            $rootRev = $s->revenueItems()->where('item_code', '0')->first();
            $s->total_expense = $rootExp ? (float) $rootExp->after_total : (float) $s->expenseItems()->where('is_header', false)->sum('after_total');
            $s->total_revenue = $rootRev ? (float) $rootRev->after_amount : (float) $s->revenueItems()->where('is_header', false)->sum('after_amount');
            return $s;
        });

        $isMurni = (! $currentShift || $currentShift->shift_name === 'Murni');

        // 1. Expense Items & Summary
        $expenseItems = $currentShift
            ? $currentShift->expenseItems()->get()
            : collect();

        $rootExpense = $expenseItems->firstWhere('account_code', '1');
        $leafExpenses = $expenseItems->where('is_header', false);

        $summary = [
            'total_before' => $rootExpense ? (float) $rootExpense->before_total : (float) $leafExpenses->sum('before_total'),
            'total_after' => $rootExpense ? (float) $rootExpense->after_total : (float) $leafExpenses->sum('after_total'),
            'total_difference' => $rootExpense ? (float) $rootExpense->difference : (float) ($leafExpenses->sum('after_total') - $leafExpenses->sum('before_total')),
            'blud_before' => (float) $leafExpenses->sum(fn ($i) => $i->before_jasa_layanan + $i->before_hasil_kerjasama + $i->before_lain_lain_sah + $i->before_silpa),
            'blud_after' => (float) $leafExpenses->sum(fn ($i) => $i->after_jasa_layanan + $i->after_hasil_kerjasama + $i->after_lain_lain_sah + $i->after_silpa),
            'apbd_before' => (float) $leafExpenses->sum('before_apbd'),
            'apbd_after' => (float) $leafExpenses->sum('after_apbd'),
        ];

        // 2. Revenue Items & Summary
        $revenueItems = $currentShift
            ? $currentShift->revenueItems()->get()
            : collect();

        $rootRevenue = $revenueItems->firstWhere('item_code', '0');
        $catJasaLayanan = $revenueItems->firstWhere('item_code', '1');
        $catKerjasama = $revenueItems->firstWhere('item_code', '3');
        $catApbd = $revenueItems->firstWhere('item_code', '4');
        $catLainSah = $revenueItems->firstWhere('item_code', '5');

        // Realized revenues from financial transactions mapped to official positions
        $revenuesOfYear = Revenue::whereYear('date', $currentShift ? $currentShift->year : $selectedYear)->get();
        $realizedByPos = [];
        foreach ($revenuesOfYear as $rev) {
            $normalized = match ($rev->source) {
                'Instalasi Gawat Darurat (IGD)' => 'Pendapatan Pelayanan Gawat Darurat',
                'Instalasi Farmasi & Apotek' => 'Pendapatan Pelayanan Farmasi',
                'Poliklinik Jiwa Terpadu' => 'Pendapatan Pelayanan Rawat Jalan',
                'Instalasi Laboratorium' => 'Pendapatan Pelayanan Laboratorium',
                'Instalasi Rawat Inap Jiwa' => 'Pendapatan Pelayanan Rawat Inap',
                'Instalasi Radiologi' => 'Pendapatan Pelayanan Radiologi',
                'Pelayanan Visum & Mediko-Legal' => 'Pendapatan Pelayanan Forensik Psikiatri',
                'Pendapatan Jasa Giro & Non-Operasional' => 'Jasa Giro',
                default => $rev->source,
            };
            $realizedByPos[$normalized] = ($realizedByPos[$normalized] ?? 0) + (float) $rev->amount;
        }

        // Attach realized amounts to leaf items
        $revenueItems = $revenueItems->map(function ($item) use ($realizedByPos) {
            $item->realized_amount = ! $item->is_header
                ? (float) ($realizedByPos[$item->item_name] ?? 0)
                : 0;
            return $item;
        });

        // Roll up leaf amounts to category headers (1, 2, 3, 4, 5)
        foreach (['1', '2', '3', '4', '5'] as $catCode) {
            $catHeader = $revenueItems->firstWhere('item_code', $catCode);
            if ($catHeader) {
                $catHeader->realized_amount = (float) $revenueItems->where('parent_code', $catCode)->sum('realized_amount');
            }
        }

        // Roll up categories to root header (0)
        if ($rootRevenue) {
            $rootRevenue->realized_amount = (float) $revenueItems->whereIn('item_code', ['1', '2', '3', '4', '5'])->sum('realized_amount');
        }

        // Calculate achievement rate for all items
        $revenueItems = $revenueItems->map(function ($item) {
            $target = (float) $item->after_amount;
            $realized = (float) ($item->realized_amount ?? 0);
            $item->achievement_rate = $target > 0 ? round(($realized / $target) * 100, 2) : 0;
            return $item;
        });

        $realizedJasaLayanan = $revenueItems->firstWhere('item_code', '1')?->realized_amount ?? 0;
        $realizedKerjasama = $revenueItems->firstWhere('item_code', '3')?->realized_amount ?? 0;
        $realizedApbd = $revenueItems->firstWhere('item_code', '4')?->realized_amount ?? 0;
        $realizedLainSah = $revenueItems->firstWhere('item_code', '5')?->realized_amount ?? 0;
        $realizedTotal = $revenueItems->firstWhere('item_code', '0')?->realized_amount ?? 0;

        $revenueSummary = [
            'total_target_before' => $rootRevenue ? (float) $rootRevenue->before_amount : 0,
            'total_target_after' => $rootRevenue ? (float) $rootRevenue->after_amount : 0,
            'total_target_diff' => $rootRevenue ? (float) $rootRevenue->difference : 0,
            'jasa_layanan' => $catJasaLayanan ? (float) $catJasaLayanan->after_amount : 0,
            'hasil_kerjasama' => $catKerjasama ? (float) $catKerjasama->after_amount : 0,
            'apbd' => $catApbd ? (float) $catApbd->after_amount : 0,
            'lain_lain_sah' => $catLainSah ? (float) $catLainSah->after_amount : 0,
            'realized_total' => (float) $realizedTotal,
            'realized_jasa_layanan' => (float) $realizedJasaLayanan,
            'realized_hasil_kerjasama' => (float) $realizedKerjasama,
            'realized_apbd' => (float) $realizedApbd,
            'realized_lain_lain_sah' => (float) $realizedLainSah,
            'achievement_rate' => $rootRevenue && (float) $rootRevenue->after_amount > 0
                ? round(((float) $realizedTotal / (float) $rootRevenue->after_amount) * 100, 2)
                : 0,
        ];

        // 3. Approved Requisitions by Unit & Ringkasan RBA
        $approvedReqs = Requisition::with(['requisitionDetails.item.rbaAccount', 'rbaAccount'])
            ->where(function ($q) use ($selectedYear) {
                $q->where('budget_year', $selectedYear)->orWhere('fiscal_year', $selectedYear);
            })
            ->where('status', 'Disetujui_Selesai')
            ->get();

        $approvedReqTotal = (float) $approvedReqs->sum(fn ($r) => $r->total_approved > 0 ? $r->total_approved : $r->total_estimated);
        $approvedReqCount = $approvedReqs->count();

        $ringkasanRba = $this->buildRingkasanData($currentShift, $selectedYear, $approvedReqs);

        // 4. Master RBA Accounts & Requisition Items Proposed by Units for the Selected Year (Approved by Keuangan)
        $catalogItems = \App\Models\Item::with('rbaAccount')
            ->orderBy('rba_account_id')
            ->orderBy('name')
            ->get();

        $accountsWithProposed = $this->getAccountsWithProposed($selectedYear);

        return Inertia::render('Perencanaan/RBA/Index', [
            'shifts' => $shifts,
            'current_shift' => $currentShift,
            'expense_items' => $expenseItems,
            'revenue_items' => $revenueItems,
            'catalog_items' => $catalogItems,
            'accounts_with_proposed' => $accountsWithProposed,
            'summary' => $summary,
            'revenue_summary' => $revenueSummary,
            'ringkasan_rba' => $ringkasanRba,
            'selected_year' => $selectedYear,
            'available_years' => $availableYears,
            'current_year' => (int) Carbon::now()->format('Y'),
            'active_tab' => $request->query('tab', 'RINGKASAN'),
            'is_murni' => $isMurni,
            'approved_requisitions_total' => $approvedReqTotal,
            'approved_requisitions_count' => $approvedReqCount,
        ]);
    }

    /**
     * Update Pembiayaan / SiLPA projection for an RBA Shift.
     */
    public function updatePembiayaan(Request $request, int $id): RedirectResponse
    {
        $shift = RbaShift::findOrFail($id);

        $validated = $request->validate([
            'penerimaan_silpa' => ['required', 'numeric', 'min:0'],
            'penerimaan_divestasi' => ['required', 'numeric', 'min:0'],
            'penerimaan_pinjaman' => ['required', 'numeric', 'min:0'],
            'pengeluaran_investasi' => ['required', 'numeric', 'min:0'],
            'pengeluaran_pokok_utang' => ['required', 'numeric', 'min:0'],
        ]);

        $shift->update($validated);

        return redirect()->back()
            ->with('success', 'Rincian Pembiayaan dan SiLPA Tahun Berkenaan berhasil diperbarui.');
    }

    /**
     * Batch update revenue targets for a shift.
     */
    public function batchUpdateRevenue(Request $request, int $shiftId): RedirectResponse
    {
        $shift = RbaShift::findOrFail($shiftId);

        $validated = $request->validate([
            'items' => ['required', 'array', 'min:1'],
            'items.*.id' => ['required', 'exists:rba_revenue_items,id'],
            'items.*.after_amount' => ['required', 'numeric', 'min:0'],
        ]);

        DB::transaction(function () use ($validated, $shift) {
            foreach ($validated['items'] as $row) {
                $item = RbaRevenueItem::where('id', $row['id'])
                    ->where('rba_shift_id', $shift->id)
                    ->first();

                if ($item && ! $item->is_header && $item->item_code !== '0') {
                    $newAfter = (float) $row['after_amount'];
                    $diff = $newAfter - (float) $item->before_amount;
                    $item->update([
                        'after_amount' => $newAfter,
                        'difference' => $diff,
                    ]);
                }
            }

            $this->recalculateRevenueHeaders($shift->id);
        });

        return redirect()->back()
            ->with('success', 'Seluruh target pendapatan BLUD berhasil diperbarui.');
    }

    /**
     * Print View for Ringkasan RBA (matching Document 3).
     */
    public function printRingkasan(Request $request): Response
    {
        $shiftId = $request->query('shift_id');
        $shift = $shiftId
            ? RbaShift::findOrFail($shiftId)
            : (RbaShift::where('status', 'Aktif')->first() ?? RbaShift::latest('id')->firstOrFail());

        if ($shift) {
            $this->ensureShiftItemsPopulated($shift);
        }

        $ringkasan = $this->buildRingkasanData($shift, (int) $shift->year);

        return Inertia::render('Perencanaan/RBA/PrintRingkasan', [
            'shift' => $shift,
            'ringkasan' => $ringkasan,
        ]);
    }



    /**
     * Activate a budget shift version and synchronize to active budgets.
     */
    public function activate(int $id): RedirectResponse
    {
        $shift = RbaShift::findOrFail($id);
        $shift->activate();

        return redirect()->route('perencanaan.rba.index', ['shift_id' => $shift->id])
            ->with('success', "{$shift->shift_name} Tahun Anggaran {$shift->year} berhasil diaktifkan sebagai acuan resmi belanja BLUD.");
    }

    /**
     * Create a new budget shift cloning the active baseline (both expenses & revenues).
     */
    public function storeShift(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'year' => ['required', 'integer', 'min:2020', 'max:2099'],
            'shift_name' => ['required', 'string', 'max:100'],
            'doc_title' => ['required', 'string', 'max:255'],
            'period_month' => ['required', 'string', 'max:100'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $newShift = DB::transaction(function () use ($validated) {
            $sourceShift = RbaShift::where('year', $validated['year'])
                ->where('status', 'Aktif')
                ->first() ?? RbaShift::where('year', $validated['year'])->latest('id')->first();

            $shift = RbaShift::create([
                'year' => $validated['year'],
                'shift_name' => $validated['shift_name'],
                'doc_title' => strtoupper($validated['doc_title']),
                'period_month' => $validated['period_month'],
                'status' => 'Draft',
                'notes' => $validated['notes'] ?? null,
            ]);

            if ($sourceShift) {
                // Clone expenses
                foreach ($sourceShift->expenseItems as $item) {
                    RbaExpenseItem::create([
                        'rba_shift_id' => $shift->id,
                        'rba_account_id' => $item->rba_account_id,
                        'account_code' => $item->account_code,
                        'account_name' => $item->account_name,
                        'parent_code' => $item->parent_code,
                        'level' => $item->level,
                        'is_header' => $item->is_header,
                        'before_jasa_layanan' => $item->after_jasa_layanan,
                        'before_hasil_kerjasama' => $item->after_hasil_kerjasama,
                        'before_lain_lain_sah' => $item->after_lain_lain_sah,
                        'before_silpa' => $item->after_silpa,
                        'before_apbd' => $item->after_apbd,
                        'before_total' => $item->after_total,
                        'after_jasa_layanan' => $item->after_jasa_layanan,
                        'after_hasil_kerjasama' => $item->after_hasil_kerjasama,
                        'after_lain_lain_sah' => $item->after_lain_lain_sah,
                        'after_silpa' => $item->after_silpa,
                        'after_apbd' => $item->after_apbd,
                        'after_total' => $item->after_total,
                        'difference' => 0,
                        'keterangan' => null,
                        'order_index' => $item->order_index,
                    ]);
                }

                // Clone revenues
                foreach ($sourceShift->revenueItems as $rev) {
                    RbaRevenueItem::create([
                        'rba_shift_id' => $shift->id,
                        'item_code' => $rev->item_code,
                        'item_name' => $rev->item_name,
                        'parent_code' => $rev->parent_code,
                        'level' => $rev->level,
                        'is_header' => $rev->is_header,
                        'before_amount' => $rev->after_amount,
                        'after_amount' => $rev->after_amount,
                        'difference' => 0,
                        'order_index' => $rev->order_index,
                    ]);
                }
            }

            return $shift;
        });

        return redirect()->route('perencanaan.rba.index', ['shift_id' => $newShift->id])
            ->with('success', "Dokumen {$newShift->shift_name} berhasil dibuat sebagai draft pergeseran.");
    }

    /**
     * Delete an RBA shift/version.
     */
    public function destroyShift(int $id): RedirectResponse
    {
        $shift = RbaShift::findOrFail($id);
        $year = $shift->year;

        // Count shifts in this year
        $shiftsInYear = RbaShift::where('year', $year)->count();
        if ($shiftsInYear <= 1) {
            return redirect()->back()
                ->with('error', "Dokumen {$shift->shift_name} adalah satu-satunya dokumen RBA untuk T.A. {$year} dan tidak dapat dihapus.");
        }

        $wasActive = ($shift->status === 'Aktif');

        DB::transaction(function () use ($shift, $year, $wasActive) {
            $shift->expenseItems()->delete();
            $shift->revenueItems()->delete();
            $shift->delete();

            // If the deleted shift was active, activate the latest remaining shift
            if ($wasActive) {
                $replacement = RbaShift::where('year', $year)->latest('id')->first();
                if ($replacement) {
                    $replacement->activate();
                }
            }
        });

        return redirect()->route('perencanaan.rba.index', ['year' => $year, 'tab' => 'SHIFTS'])
            ->with('success', "Dokumen versi {$shift->shift_name} T.A. {$year} berhasil dihapus.");
    }

    /**
     * Update an expense item in a budget shift.
     */
    public function updateItem(Request $request, int $id): RedirectResponse
    {
        $item = RbaExpenseItem::findOrFail($id);
        $shift = $item->shift;

        $validated = $request->validate([
            'after_jasa_layanan' => ['required', 'numeric', 'min:0'],
            'after_hasil_kerjasama' => ['required', 'numeric', 'min:0'],
            'after_lain_lain_sah' => ['required', 'numeric', 'min:0'],
            'after_silpa' => ['required', 'numeric', 'min:0'],
            'after_apbd' => ['required', 'numeric', 'min:0'],
            'keterangan' => ['nullable', 'string', 'max:1000'],
        ]);

        DB::transaction(function () use ($item, $shift, $validated) {
            $afterTotal = $validated['after_jasa_layanan']
                + $validated['after_hasil_kerjasama']
                + $validated['after_lain_lain_sah']
                + $validated['after_silpa']
                + $validated['after_apbd'];

            $isMurni = (! $shift || $shift->shift_name === 'Murni');

            if ($isMurni) {
                $item->update([
                    'before_jasa_layanan' => $validated['after_jasa_layanan'],
                    'before_hasil_kerjasama' => $validated['after_hasil_kerjasama'],
                    'before_lain_lain_sah' => $validated['after_lain_lain_sah'],
                    'before_silpa' => $validated['after_silpa'],
                    'before_apbd' => $validated['after_apbd'],
                    'before_total' => $afterTotal,
                    'after_jasa_layanan' => $validated['after_jasa_layanan'],
                    'after_hasil_kerjasama' => $validated['after_hasil_kerjasama'],
                    'after_lain_lain_sah' => $validated['after_lain_lain_sah'],
                    'after_silpa' => $validated['after_silpa'],
                    'after_apbd' => $validated['after_apbd'],
                    'after_total' => $afterTotal,
                    'difference' => 0,
                    'keterangan' => $validated['keterangan'] ?? null,
                ]);
            } else {
                $difference = $afterTotal - (float) $item->before_total;
                $item->update([
                    'after_jasa_layanan' => $validated['after_jasa_layanan'],
                    'after_hasil_kerjasama' => $validated['after_hasil_kerjasama'],
                    'after_lain_lain_sah' => $validated['after_lain_lain_sah'],
                    'after_silpa' => $validated['after_silpa'],
                    'after_apbd' => $validated['after_apbd'],
                    'after_total' => $afterTotal,
                    'difference' => $difference,
                    'keterangan' => $validated['keterangan'] ?? null,
                ]);
            }

            $this->recalculateHeaders($shift->id);

            if ($shift->status === 'Aktif' && ! $item->is_header) {
                $account = RbaAccount::where('account_code', $item->account_code)->first();
                if ($account) {
                    $account->update([
                        'total_budget' => $afterTotal,
                        'remaining_budget' => max(0, $afterTotal - $account->spent_budget),
                    ]);
                }
            }
        });

        return redirect()->back()
            ->with('success', "Rekening belanja {$item->account_code} ({$item->account_name}) berhasil diperbarui.");
    }

    /**
     * Update a revenue item in a budget shift.
     */
    public function updateRevenueItem(Request $request, int $id): RedirectResponse
    {
        $item = RbaRevenueItem::findOrFail($id);
        $shift = $item->shift;

        $validated = $request->validate([
            'after_amount' => ['required', 'numeric', 'min:0'],
        ]);

        DB::transaction(function () use ($item, $shift, $validated) {
            $newAmount = (float) $validated['after_amount'];
            $isMurni = (! $shift || $shift->shift_name === 'Murni');

            if ($isMurni) {
                $item->update([
                    'before_amount' => $newAmount,
                    'after_amount' => $newAmount,
                    'difference' => 0,
                ]);
            } else {
                $difference = $newAmount - (float) $item->before_amount;
                $item->update([
                    'after_amount' => $newAmount,
                    'difference' => $difference,
                ]);
            }

            // Recalculate parent category totals and root '0'
            $this->recalculateRevenueHeaders($shift->id);
        });

        return redirect()->back()
            ->with('success', "Target pendapatan {$item->item_name} berhasil diperbarui.");
    }

    /**
     * Print View for RBA Belanja (Landscape format matching Document 1).
     */
    public function printBelanja(Request $request): Response
    {
        $shiftId = $request->query('shift_id');
        $shift = $shiftId
            ? RbaShift::findOrFail($shiftId)
            : (RbaShift::where('status', 'Aktif')->first() ?? RbaShift::latest('id')->firstOrFail());

        $items = $shift->expenseItems()->orderBy('order_index')->get();

        return Inertia::render('Perencanaan/RBA/PrintBelanja', [
            'shift' => $shift,
            'items' => $items,
        ]);
    }

    /**
     * Print View for RBA Pendapatan (Format matching Document 2).
     */
    public function printPendapatan(Request $request): Response
    {
        $shiftId = $request->query('shift_id');
        $shift = $shiftId
            ? RbaShift::findOrFail($shiftId)
            : (RbaShift::where('status', 'Aktif')->first() ?? RbaShift::latest('id')->firstOrFail());

        $items = $shift->revenueItems()->orderBy('order_index')->get();

        return Inertia::render('Perencanaan/RBA/PrintPendapatan', [
            'shift' => $shift,
            'items' => $items,
        ]);
    }

    /**
     * Print View for RBA Rincian Belanja Berjenjang (Memuat Usulan Barang Unit Kerja).
     */
    public function printRincianBelanja(Request $request): Response
    {
        $selectedYear = (int) $request->query('year', 2026);
        $shiftId = $request->query('shift_id');

        $shifts = RbaShift::where('year', $selectedYear)->orderBy('id', 'desc')->get();
        $currentShift = $shiftId
            ? $shifts->firstWhere('id', $shiftId)
            : ($shifts->firstWhere('status', 'Aktif') ?? $shifts->first());

        $expenseItems = $currentShift ? $currentShift->expenseItems()->orderBy('order_index')->get() : collect();

        $accountsWithProposed = $this->getAccountsWithProposed($selectedYear);

        return Inertia::render('Perencanaan/RBA/PrintRincianBelanja', [
            'shift' => $currentShift,
            'expense_items' => $expenseItems,
            'accounts_with_proposed' => $accountsWithProposed,
            'selected_year' => $selectedYear,
        ]);
    }

    /**
     * Recalculate parent header totals for expenses.
     */
    protected function recalculateHeaders(int $shiftId): void
    {
        $items = RbaExpenseItem::where('rba_shift_id', $shiftId)->get();

        // 1.1.2.1 Belanja Barang dan jasa BLUD
        $leaf1121 = $items->where('parent_code', '1.1.2.1');
        $this->updateHeaderRow($items, '1.1.2.1', $leaf1121);

        // 1.2.1.2 Belanja Peralatan dan Mesin
        $leaf1212 = $items->where('parent_code', '1.2.1.2');
        $this->updateHeaderRow($items, '1.2.1.2', $leaf1212);

        // 1.2.1.3 Belanja Gedung dan Bangunan
        $leaf1213 = $items->where('parent_code', '1.2.1.3');
        $this->updateHeaderRow($items, '1.2.1.3', $leaf1213);

        // 1.2.1 Belanja Modal BLUD
        $child121 = $items->where('parent_code', '1.2.1');
        $this->updateHeaderRow($items, '1.2.1', $child121);

        // 1.2 BELANJA MODAL
        $child12 = $items->where('parent_code', '1.2');
        $this->updateHeaderRow($items, '1.2', $child12);

        // 1.1.2 Belanja Barang dan jasa
        $child112 = $items->where('parent_code', '1.1.2');
        $this->updateHeaderRow($items, '1.1.2', $child112);

        // 1.1 BELANJA OPERASI
        $child11 = $items->where('parent_code', '1.1');
        $this->updateHeaderRow($items, '1.1', $child11);

        // 1 BELANJA
        $child1 = $items->where('parent_code', '1');
        $this->updateHeaderRow($items, '1', $child1);
    }

    protected function updateHeaderRow($collection, string $code, $children): void
    {
        $header = $collection->firstWhere('account_code', $code);
        if (! $header || $children->isEmpty()) {
            return;
        }

        $bJl = $children->sum('before_jasa_layanan');
        $bKs = $children->sum('before_hasil_kerjasama');
        $bLl = $children->sum('before_lain_lain_sah');
        $bSilpa = $children->sum('before_silpa');
        $bApbd = $children->sum('before_apbd');
        $bTot = $bJl + $bKs + $bLl + $bSilpa + $bApbd;

        $aJl = $children->sum('after_jasa_layanan');
        $aKs = $children->sum('after_hasil_kerjasama');
        $aLl = $children->sum('after_lain_lain_sah');
        $aSilpa = $children->sum('after_silpa');
        $aApbd = $children->sum('after_apbd');
        $aTot = $aJl + $aKs + $aLl + $aSilpa + $aApbd;

        $diff = $aTot - $bTot;

        $header->update([
            'before_jasa_layanan' => $bJl,
            'before_hasil_kerjasama' => $bKs,
            'before_lain_lain_sah' => $bLl,
            'before_silpa' => $bSilpa,
            'before_apbd' => $bApbd,
            'before_total' => $bTot,
            'after_jasa_layanan' => $aJl,
            'after_hasil_kerjasama' => $aKs,
            'after_lain_lain_sah' => $aLl,
            'after_silpa' => $aSilpa,
            'after_apbd' => $aApbd,
            'after_total' => $aTot,
            'difference' => $diff,
        ]);
    }

    /**
     * Recalculate revenue headers (categories 1, 3, 4, 5 and root '0').
     */
    protected function recalculateRevenueHeaders(int $shiftId): void
    {
        $items = RbaRevenueItem::where('rba_shift_id', $shiftId)->get();

        foreach (['1', '3', '4', '5'] as $parentCode) {
            $children = $items->where('parent_code', $parentCode);
            $header = $items->firstWhere('item_code', $parentCode);

            if ($header && $children->isNotEmpty()) {
                $b = $children->sum('before_amount');
                $a = $children->sum('after_amount');
                $header->update([
                    'before_amount' => $b,
                    'after_amount' => $a,
                    'difference' => $a - $b,
                ]);
            }
        }

        // Root '0' PENDAPATAN
        $mainCats = $items->where('level', 1)->where('item_code', '!=', '0');
        $root = $items->firstWhere('item_code', '0');
        if ($root) {
            $b = $mainCats->sum('before_amount');
            $a = $mainCats->sum('after_amount');
            $root->update([
                'before_amount' => $b,
                'after_amount' => $a,
                'difference' => $a - $b,
            ]);
        }
    }

    /**
     * Ensure a budget shift has its expense and revenue item hierarchy populated.
     */
    protected function ensureShiftItemsPopulated(RbaShift $shift): void
    {
        $template = RbaShift::where('year', $shift->year)
            ->where('id', '!=', $shift->id)
            ->whereHas('expenseItems')
            ->orderByDesc('id')
            ->first();

        if (! $template) {
            return;
        }

        DB::transaction(function () use ($shift, $template) {
            if ($shift->expenseItems()->count() === 0) {
                foreach ($template->expenseItems as $item) {
                    RbaExpenseItem::create([
                        'rba_shift_id' => $shift->id,
                        'rba_account_id' => $item->rba_account_id,
                        'account_code' => $item->account_code,
                        'account_name' => $item->account_name,
                        'parent_code' => $item->parent_code,
                        'level' => $item->level,
                        'is_header' => $item->is_header,
                        'before_jasa_layanan' => 0,
                        'before_hasil_kerjasama' => 0,
                        'before_lain_lain_sah' => 0,
                        'before_silpa' => 0,
                        'before_apbd' => 0,
                        'before_total' => 0,
                        'after_jasa_layanan' => 0,
                        'after_hasil_kerjasama' => 0,
                        'after_lain_lain_sah' => 0,
                        'after_silpa' => 0,
                        'after_apbd' => 0,
                        'after_total' => 0,
                        'difference' => 0,
                        'keterangan' => null,
                        'order_index' => $item->order_index,
                    ]);
                }
            }

            if ($shift->revenueItems()->count() === 0) {
                foreach ($template->revenueItems as $rev) {
                    RbaRevenueItem::create([
                        'rba_shift_id' => $shift->id,
                        'item_code' => $rev->item_code,
                        'item_name' => $rev->item_name,
                        'parent_code' => $rev->parent_code,
                        'level' => $rev->level,
                        'is_header' => $rev->is_header,
                        'before_amount' => 0,
                        'after_amount' => 0,
                        'difference' => 0,
                        'order_index' => $rev->order_index,
                    ]);
                }
            }


        });
    }

    /**
     * Get RBA accounts with unit proposed items approved by Keuangan.
     */
    public function getAccountsWithProposed(int $selectedYear)
    {
        $rbaAccounts = RbaAccount::where(function ($q) use ($selectedYear) {
                $q->where('year', $selectedYear)
                  ->orWhere('period_year', $selectedYear)
                  ->orWhereNull('year');
            })
            ->orderBy('account_code')
            ->get();

        if ($rbaAccounts->isEmpty()) {
            $rbaAccounts = RbaAccount::orderBy('account_code')->get();
        }

        $proposedDetails = \App\Models\RequisitionDetail::whereHas('requisition', function ($q) use ($selectedYear) {
                $q->where(function ($yq) use ($selectedYear) {
                    $yq->where('budget_year', $selectedYear)
                       ->orWhere(function ($sq) use ($selectedYear) {
                           $sq->whereNull('budget_year')->where('fiscal_year', $selectedYear);
                       });
                })->whereNotIn('status', ['Ditolak', 'Dibatalkan']);
            })
            ->with([
                'requisition:id,requisition_number,rba_account_id,unit_id,fiscal_year,budget_year,status,user_id,nomor_surat_unit',
                'requisition.unit:id,name,unit_code',
                'requisition.user:id,name,nip',
                'item:id,item_code,name,specification,unit_type,standard_price,rba_account_id',
            ])
            ->get();

        $groupedDetails = $proposedDetails->groupBy(function ($d) {
            return $d->rba_account_id 
                ?? $d->item?->rba_account_id 
                ?? $d->requisition?->rba_account_id;
        });

        $accountsList = $rbaAccounts->map(function ($acc) use ($groupedDetails) {
            $items = $groupedDetails->get($acc->id, collect());

            $mappedItems = $items->map(function ($it) {
                $qty = (int) ($it->quantity_approved > 0 ? $it->quantity_approved : ($it->quantity_requested ?: 1));
                $price = (float) $it->unit_price;
                $subtotal = (float) ($it->quantity_approved > 0 ? ($qty * $price) : ($it->subtotal > 0 ? $it->subtotal : $qty * $price));

                $it->resolved_quantity = $qty;
                $it->resolved_subtotal = $subtotal;
                $it->status = $it->requisition?->status;
                return $it;
            });

            return [
                'id' => $acc->id,
                'account_code' => $acc->account_code,
                'account_name' => $acc->account_name,
                'parent_code' => $acc->parent_code,
                'kategori_belanja' => $acc->kategori_belanja,
                'sumber_dana' => $acc->sumber_dana,
                'remaining_budget' => (float) $acc->remaining_budget,
                'total_budget' => (float) $acc->total_budget,
                'level' => substr_count($acc->account_code, '.') + 1,
                'proposed_items' => $mappedItems->values(),
                'proposed_total' => (float) $mappedItems->sum('resolved_subtotal'),
                'proposed_count' => $mappedItems->count(),
                'approved_total' => (float) $mappedItems->where('status', 'Disetujui_Selesai')->sum('resolved_subtotal'),
                'approved_count' => $mappedItems->where('status', 'Disetujui_Selesai')->count(),
            ];
        })->keyBy('account_code');

        // Calculate recursive rollups across the account hierarchy
        $byCode = $accountsList->all();
        $getDescendantCodes = function ($code) use (&$byCode, &$getDescendantCodes) {
            $desc = [];
            foreach ($byCode as $c => $acc) {
                if ($acc['parent_code'] === $code) {
                    $desc[] = $c;
                    $desc = array_merge($desc, $getDescendantCodes($c));
                }
            }
            return $desc;
        };

        $result = $accountsList->map(function ($acc) use ($byCode, $getDescendantCodes) {
            $descCodes = $getDescendantCodes($acc['account_code']);
            $totNominal = $acc['proposed_total'];
            $totCount = $acc['proposed_count'];
            $apprNominal = $acc['approved_total'];
            $apprCount = $acc['approved_count'];

            foreach ($descCodes as $dc) {
                if (isset($byCode[$dc])) {
                    $totNominal += $byCode[$dc]['proposed_total'];
                    $totCount += $byCode[$dc]['proposed_count'];
                    $apprNominal += $byCode[$dc]['approved_total'];
                    $apprCount += $byCode[$dc]['approved_count'];
                }
            }

            $acc['rollup_total'] = (float) $totNominal;
            $acc['rollup_count'] = (int) $totCount;
            $acc['rollup_approved_total'] = (float) $apprNominal;
            $acc['rollup_approved_count'] = (int) $apprCount;
            return $acc;
        });

        return $result->values()->sortBy('account_code', SORT_NATURAL)->values();
    }

    /**
     * Build the Ringkasan & SiLPA official breakdown data structure.
     */
    public function buildRingkasanData(?RbaShift $shift, int $year, $approvedReqs = null): array
    {
        $isMurni = (! $shift || $shift->shift_name === 'Murni');

        if ($approvedReqs === null) {
            $approvedReqs = Requisition::with(['requisitionDetails.item.rbaAccount', 'rbaAccount'])
                ->where(function ($q) use ($year) {
                    $q->where('budget_year', $year)->orWhere('fiscal_year', $year);
                })
                ->where('status', 'Disetujui_Selesai')
                ->get();
        }

        $approvedReqTotal = (float) $approvedReqs->sum(fn ($r) => $r->total_approved > 0 ? $r->total_approved : $r->total_estimated);

        $reqBelanja = [
            'apbd' => 0,
            'operasi_blud' => 0,
            'pegawai' => 0,
            'barang_jasa' => 0,
            'bunga' => 0,
            'lain_lain' => 0,
            'modal_blud' => 0,
            'tanah' => 0,
            'peralatan_mesin' => 0,
            'gedung_bangunan' => 0,
            'jalan_irigasi' => 0,
            'aset_tetap_lainnya' => 0,
            'aset_lainnya' => 0,
        ];

        foreach ($approvedReqs as $req) {
            $amount = (float) ($req->total_approved > 0 ? $req->total_approved : $req->total_estimated);
            $sumberDana = strtoupper($req->sumber_dana ?? 'BLUD');
            $jenisBelanja = ucfirst(strtolower($req->jenis_belanja ?? 'Operasi'));

            if ($sumberDana === 'APBD') {
                $reqBelanja['apbd'] += $amount;
                continue;
            }

            if ($jenisBelanja === 'Operasi') {
                $reqBelanja['operasi_blud'] += $amount;
                $accCode = $req->rbaAccount?->account_code ?? '';
                $accName = strtolower($req->rbaAccount?->account_name ?? '');

                if (str_starts_with($accCode, '1.1.1') || str_contains($accName, 'pegawai')) {
                    $reqBelanja['pegawai'] += $amount;
                } elseif (str_contains($accName, 'bunga')) {
                    $reqBelanja['bunga'] += $amount;
                } elseif (str_contains($accName, 'lain')) {
                    $reqBelanja['lain_lain'] += $amount;
                } else {
                    $reqBelanja['barang_jasa'] += $amount;
                }
            } elseif ($jenisBelanja === 'Modal') {
                $reqBelanja['modal_blud'] += $amount;
                $accCode = $req->rbaAccount?->account_code ?? '';
                $accName = strtolower($req->rbaAccount?->account_name ?? '');

                if (str_starts_with($accCode, '1.2.1.1') || str_contains($accName, 'tanah')) {
                    $reqBelanja['tanah'] += $amount;
                } elseif (str_starts_with($accCode, '1.2.1.2') || str_contains($accName, 'alat') || str_contains($accName, 'mesin') || str_contains($accName, 'komputer')) {
                    $reqBelanja['peralatan_mesin'] += $amount;
                } elseif (str_starts_with($accCode, '1.2.1.3') || str_contains($accName, 'gedung') || str_contains($accName, 'bangunan')) {
                    $reqBelanja['gedung_bangunan'] += $amount;
                } elseif (str_starts_with($accCode, '1.2.1.4') || str_contains($accName, 'jalan') || str_contains($accName, 'irigasi') || str_contains($accName, 'jaringan')) {
                    $reqBelanja['jalan_irigasi'] += $amount;
                } elseif (str_starts_with($accCode, '1.2.1.5')) {
                    $reqBelanja['aset_tetap_lainnya'] += $amount;
                } else {
                    $reqBelanja['peralatan_mesin'] += $amount;
                }
            }
        }

        // Realized Keuangan Revenues
        $revenues = Revenue::whereYear('date', $year)->get();
        $revByCat = [
            'jasa_layanan' => 0,
            'hibah' => 0,
            'hasil_kerjasama' => 0,
            'apbd' => 0,
            'lain_lain_sah' => 0,
        ];
        foreach ($revenues as $rev) {
            $amount = (float) $rev->amount;
            $cat = RevenueController::resolveCategory($rev->source);
            if ($cat === 'Jasa Layanan') {
                $revByCat['jasa_layanan'] += $amount;
            } elseif ($cat === 'Hibah') {
                $revByCat['hibah'] += $amount;
            } elseif ($cat === 'Hasil Kerja Sama') {
                $revByCat['hasil_kerjasama'] += $amount;
            } elseif ($cat === 'APBD') {
                $revByCat['apbd'] += $amount;
            } elseif ($cat === 'Lain-lain BLUD Sah') {
                $revByCat['lain_lain_sah'] += $amount;
            } else {
                $revByCat['jasa_layanan'] += $amount;
            }
        }

        $expenseItems = $shift ? $shift->expenseItems()->get() : collect();
        $revenueItems = $shift ? $shift->revenueItems()->get() : collect();

        $rootRevenue = $revenueItems->firstWhere('item_code', '0');
        $catJasaLayanan = $revenueItems->firstWhere('item_code', '1');
        $catHibah = $revenueItems->firstWhere('item_code', '2');
        $catKerjasama = $revenueItems->firstWhere('item_code', '3');
        $catApbd = $revenueItems->firstWhere('item_code', '4');
        $catLainSah = $revenueItems->firstWhere('item_code', '5');

        $rootExpense = $expenseItems->firstWhere('account_code', '1');

        $jasaAfter = $catJasaLayanan && (float) $catJasaLayanan->after_amount > 0 ? (float) $catJasaLayanan->after_amount : $revByCat['jasa_layanan'];
        $hibahAfter = $catHibah && (float) $catHibah->after_amount > 0 ? (float) $catHibah->after_amount : $revByCat['hibah'];
        $kerjasamaAfter = $catKerjasama && (float) $catKerjasama->after_amount > 0 ? (float) $catKerjasama->after_amount : $revByCat['hasil_kerjasama'];
        $apbdRevAfter = $catApbd && (float) $catApbd->after_amount > 0 ? (float) $catApbd->after_amount : $revByCat['apbd'];
        $lainSahAfter = $catLainSah && (float) $catLainSah->after_amount > 0 ? (float) $catLainSah->after_amount : $revByCat['lain_lain_sah'];

        $totRevAfter = $rootRevenue && (float) $rootRevenue->after_amount > 0
            ? (float) $rootRevenue->after_amount
            : ($jasaAfter + $hibahAfter + $kerjasamaAfter + $apbdRevAfter + $lainSahAfter);

        $totRevBefore = $isMurni ? $totRevAfter : ($rootRevenue ? (float) $rootRevenue->before_amount : $totRevAfter);
        $totRevDiff = $totRevAfter - $totRevBefore;

        $missing_accounts = [];
        $data_incomplete = false;

        if (! $isMurni && $expenseItems->isNotEmpty()) {
            $expApbdRow = $expenseItems->firstWhere('account_code', '1.1.2') ?? $expenseItems->firstWhere('account_code', '1.1');
            $expOperasiRow = $expenseItems->firstWhere('account_code', '1.1');
            $expBarangJasaRow = $expenseItems->firstWhere('account_code', '1.1.2.1');
            $expPegawaiRow = $expenseItems->firstWhere('account_code', '1.1.1');
            $expModalRow = $expenseItems->firstWhere('account_code', '1.2');
            $expPeralatanRow = $expenseItems->firstWhere('account_code', '1.2.1.2');
            $expGedungRow = $expenseItems->firstWhere('account_code', '1.2.1.3');
            $expTanahRow = $expenseItems->firstWhere('account_code', '1.2.1.1');

            if (!$expOperasiRow) { $missing_accounts[] = '1.1'; $data_incomplete = true; }
            if (!$expBarangJasaRow) { $missing_accounts[] = '1.1.2.1'; $data_incomplete = true; }
            if (!$expPegawaiRow) { $missing_accounts[] = '1.1.1'; $data_incomplete = true; }
            if (!$expModalRow) { $missing_accounts[] = '1.2'; $data_incomplete = true; }
            if (!$expPeralatanRow) { $missing_accounts[] = '1.2.1.2'; $data_incomplete = true; }
            if (!$expGedungRow) { $missing_accounts[] = '1.2.1.3'; $data_incomplete = true; }
            if (!$expTanahRow) { $missing_accounts[] = '1.2.1.1'; $data_incomplete = true; }
            if (!$rootExpense) { $missing_accounts[] = '1'; $data_incomplete = true; }

            $bApbdBefore = 0;
            $bApbdAfter = 0;

            $bOperasiBefore = $expOperasiRow ? (float) ($expOperasiRow->before_jasa_layanan + $expOperasiRow->before_hasil_kerjasama + $expOperasiRow->before_lain_lain_sah + $expOperasiRow->before_silpa) : 0;
            $bOperasiAfter = $expOperasiRow ? (float) ($expOperasiRow->after_jasa_layanan + $expOperasiRow->after_hasil_kerjasama + $expOperasiRow->after_lain_lain_sah + $expOperasiRow->after_silpa) : 0;

            $bBarangJasaBefore = $expBarangJasaRow ? (float) $expBarangJasaRow->before_total : 0;
            $bBarangJasaAfter = $expBarangJasaRow ? (float) $expBarangJasaRow->after_total : 0;

            $bPegawaiBefore = $expPegawaiRow ? (float) $expPegawaiRow->before_total : 0;
            $bPegawaiAfter = $expPegawaiRow ? (float) $expPegawaiRow->after_total : 0;

            $bModalBefore = $expModalRow ? (float) ($expModalRow->before_jasa_layanan + $expModalRow->before_hasil_kerjasama + $expModalRow->before_lain_lain_sah + $expModalRow->before_silpa) : 0;
            $bModalAfter = $expModalRow ? (float) ($expModalRow->after_jasa_layanan + $expModalRow->after_hasil_kerjasama + $expModalRow->after_lain_lain_sah + $expModalRow->after_silpa) : 0;

            $bTanahBefore = $expTanahRow ? (float) $expTanahRow->before_total : 0;
            $bTanahAfter = $expTanahRow ? (float) $expTanahRow->after_total : 0;

            $bPeralatanBefore = $expPeralatanRow ? (float) $expPeralatanRow->before_total : 0;
            $bPeralatanAfter = $expPeralatanRow ? (float) $expPeralatanRow->after_total : 0;

            $bGedungBefore = $expGedungRow ? (float) $expGedungRow->before_total : 0;
            $bGedungAfter = $expGedungRow ? (float) $expGedungRow->after_total : 0;

            $totExpBefore = $rootExpense ? (float) $rootExpense->before_total : 0;
            $totExpAfter = $rootExpense ? (float) $rootExpense->after_total : 0;
        } else {
            // Murni: values directly reflect approved requisitions
            $bApbdAfter = $reqBelanja['apbd'];
            $bApbdBefore = $bApbdAfter;

            $bOperasiAfter = $reqBelanja['operasi_blud'];
            $bOperasiBefore = $bOperasiAfter;

            $bPegawaiAfter = $reqBelanja['pegawai'];
            $bPegawaiBefore = $bPegawaiAfter;

            $bBarangJasaAfter = $reqBelanja['barang_jasa'];
            $bBarangJasaBefore = $bBarangJasaAfter;

            $bModalAfter = $reqBelanja['modal_blud'];
            $bModalBefore = $bModalAfter;

            $bTanahAfter = $reqBelanja['tanah'];
            $bTanahBefore = $bTanahAfter;

            $bPeralatanAfter = $reqBelanja['peralatan_mesin'];
            $bPeralatanBefore = $bPeralatanAfter;

            $bGedungAfter = $reqBelanja['gedung_bangunan'];
            $bGedungBefore = $bGedungAfter;

            $totExpAfter = (float) ($rootExpense && (float) $rootExpense->after_total > 0 ? $rootExpense->after_total : $approvedReqTotal);
            $totExpBefore = $totExpAfter;
        }

        $totExpDiff = $totExpAfter - $totExpBefore;
        $surplusBefore = $totRevBefore - $totExpBefore;
        $surplusAfter = $totRevAfter - $totExpAfter;
        $surplusDiff = $surplusAfter - $surplusBefore;

        $penSilpa = (float) ($shift->penerimaan_silpa ?? 0);
        $penDivestasi = (float) ($shift->penerimaan_divestasi ?? 0);
        $penPinjaman = (float) ($shift->penerimaan_pinjaman ?? 0);
        $totPenerimaan = $penSilpa + $penDivestasi + $penPinjaman;

        $pengInvestasi = (float) ($shift->pengeluaran_investasi ?? 0);
        $pengPokokUtang = (float) ($shift->pengeluaran_pokok_utang ?? 0);
        $totPengeluaran = $pengInvestasi + $pengPokokUtang;

        $pembiayaanNetto = $totPenerimaan - $totPengeluaran;
        $silpaTahunBerkenaan = $surplusAfter + $pembiayaanNetto;

        return [
            'data_incomplete' => $data_incomplete ?? false,
            'missing_accounts' => $missing_accounts ?? [],
            'pendapatan' => [
                'jasa_layanan' => [
                    'before' => $isMurni ? $jasaAfter : ($catJasaLayanan ? (float) $catJasaLayanan->before_amount : $jasaAfter),
                    'after' => $jasaAfter,
                    'diff' => $isMurni ? 0 : ($jasaAfter - ($catJasaLayanan ? (float) $catJasaLayanan->before_amount : $jasaAfter)),
                ],
                'hibah' => [
                    'before' => $isMurni ? $hibahAfter : ($catHibah ? (float) $catHibah->before_amount : 0),
                    'after' => $hibahAfter,
                    'diff' => $isMurni ? 0 : ($hibahAfter - ($catHibah ? (float) $catHibah->before_amount : 0)),
                ],
                'hasil_kerjasama' => [
                    'before' => $isMurni ? $kerjasamaAfter : ($catKerjasama ? (float) $catKerjasama->before_amount : $kerjasamaAfter),
                    'after' => $kerjasamaAfter,
                    'diff' => $isMurni ? 0 : ($kerjasamaAfter - ($catKerjasama ? (float) $catKerjasama->before_amount : $kerjasamaAfter)),
                ],
                'apbd' => [
                    'before' => $isMurni ? $apbdRevAfter : ($catApbd ? (float) $catApbd->before_amount : $apbdRevAfter),
                    'after' => $apbdRevAfter,
                    'diff' => $isMurni ? 0 : ($apbdRevAfter - ($catApbd ? (float) $catApbd->before_amount : $apbdRevAfter)),
                ],
                'lain_lain_sah' => [
                    'before' => $isMurni ? $lainSahAfter : ($catLainSah ? (float) $catLainSah->before_amount : $lainSahAfter),
                    'after' => $lainSahAfter,
                    'diff' => $isMurni ? 0 : ($lainSahAfter - ($catLainSah ? (float) $catLainSah->before_amount : $lainSahAfter)),
                ],
                'total' => [
                    'before' => $totRevBefore,
                    'after' => $totRevAfter,
                    'diff' => $totRevDiff,
                ],
            ],
            'belanja' => [
                'apbd' => [
                    'before' => $bApbdBefore,
                    'after' => $bApbdAfter,
                    'diff' => $bApbdAfter - $bApbdBefore,
                ],
                'operasi_blud' => [
                    'before' => $bOperasiBefore,
                    'after' => $bOperasiAfter,
                    'diff' => $bOperasiAfter - $bOperasiBefore,
                ],
                'pegawai' => [
                    'before' => $bPegawaiBefore,
                    'after' => $bPegawaiAfter,
                    'diff' => $bPegawaiAfter - $bPegawaiBefore,
                ],
                'barang_jasa_blud' => [
                    'before' => $bBarangJasaBefore,
                    'after' => $bBarangJasaAfter,
                    'diff' => $bBarangJasaAfter - $bBarangJasaBefore,
                ],
                'bunga' => [
                    'before' => 0,
                    'after' => 0,
                    'diff' => 0,
                ],
                'lain_lain' => [
                    'before' => 0,
                    'after' => 0,
                    'diff' => 0,
                ],
                'modal_blud' => [
                    'before' => $bModalBefore,
                    'after' => $bModalAfter,
                    'diff' => $bModalAfter - $bModalBefore,
                ],
                'tanah' => [
                    'before' => $bTanahBefore,
                    'after' => $bTanahAfter,
                    'diff' => $bTanahAfter - $bTanahBefore,
                ],
                'peralatan_mesin' => [
                    'before' => $bPeralatanBefore,
                    'after' => $bPeralatanAfter,
                    'diff' => $bPeralatanAfter - $bPeralatanBefore,
                ],
                'gedung_bangunan' => [
                    'before' => $bGedungBefore,
                    'after' => $bGedungAfter,
                    'diff' => $bGedungAfter - $bGedungBefore,
                ],
                'jalan_irigasi' => [
                    'before' => 0,
                    'after' => 0,
                    'diff' => 0,
                ],
                'aset_tetap_lainnya' => [
                    'before' => 0,
                    'after' => 0,
                    'diff' => 0,
                ],
                'aset_lainnya' => [
                    'before' => 0,
                    'after' => 0,
                    'diff' => 0,
                ],
                'total' => [
                    'before' => $totExpBefore,
                    'after' => $totExpAfter,
                    'diff' => $totExpDiff,
                ],
            ],
            'surplus_defisit' => [
                'before' => $surplusBefore,
                'after' => $surplusAfter,
                'diff' => $surplusDiff,
            ],
            'pembiayaan' => [
                'silpa_sebelumnya' => $penSilpa,
                'divestasi' => $penDivestasi,
                'pinjaman' => $penPinjaman,
                'total_penerimaan' => $totPenerimaan,
                'investasi' => $pengInvestasi,
                'pokok_utang' => $pengPokokUtang,
                'total_pengeluaran' => $totPengeluaran,
                'netto' => $pembiayaanNetto,
                'silpa_tahun_berkenaan' => $silpaTahunBerkenaan,
            ],
        ];
    }
}
