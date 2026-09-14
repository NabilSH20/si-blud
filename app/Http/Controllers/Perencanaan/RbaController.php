<?php

namespace App\Http\Controllers\Perencanaan;

use App\Http\Controllers\Controller;
use App\Models\RbaAccount;
use App\Models\RbaExpenseItem;
use App\Models\RbaRevenueItem;
use App\Models\RbaShift;
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
        $activeSessionYear = (int) session('active_year', date('Y'));
        $selectedYear = (int) $request->query('year', $activeSessionYear);
        if ($request->has('year')) {
            session(['active_year' => $selectedYear]);
        }

        // Get all distinct years from shifts and requisitions
        $shiftYears = RbaShift::distinct()->pluck('year')->filter()->toArray();
        $reqYears = \App\Models\Requisition::distinct()->pluck('budget_year')->filter()->toArray();
        $availableYears = array_values(array_unique(array_merge([2026, 2027, 2028], $shiftYears, $reqYears)));
        sort($availableYears);

        // Retrieve shifts for the selected year
        $shifts = RbaShift::where('year', $selectedYear)->orderBy('id', 'desc')->get();

        // If no shift exists, trigger seeder for 2026 or initialize default shift for other years
        if ($shifts->isEmpty()) {
            if ($selectedYear === 2026) {
                \Artisan::call('db:seed', ['--class' => 'Database\\Seeders\\RbaPergeseran3Seeder']);
                $shifts = RbaShift::where('year', $selectedYear)->orderBy('id', 'desc')->get();
            } else {
                $newShift = RbaShift::create([
                    'year' => $selectedYear,
                    'shift_name' => 'Murni',
                    'doc_title' => "RENCANA BISNIS DAN ANGGARAN MURNI T.A. {$selectedYear}",
                    'period_month' => "Januari {$selectedYear}",
                    'status' => 'Aktif',
                    'notes' => "RBA Definitif Murni Tahun Anggaran {$selectedYear} RS Jiwa Tampan.",
                ]);
                $shifts = collect([$newShift]);
            }
        }

        $selectedShiftId = $request->query('shift_id');
        $currentShift = $selectedShiftId
            ? $shifts->firstWhere('id', $selectedShiftId)
            : ($shifts->firstWhere('status', 'Aktif') ?? $shifts->first());

        if (! $currentShift) {
            $currentShift = $shifts->first();
        }

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

        // If shift has no revenue items yet, seed them
        if ($currentShift && $revenueItems->isEmpty()) {
            \Artisan::call('db:seed', ['--class' => 'Database\\Seeders\\RbaPergeseran3Seeder']);
            $revenueItems = $currentShift->revenueItems()->get();
        }

        $rootRevenue = $revenueItems->firstWhere('item_code', '0');
        $catJasaLayanan = $revenueItems->firstWhere('item_code', '1');
        $catKerjasama = $revenueItems->firstWhere('item_code', '3');
        $catApbd = $revenueItems->firstWhere('item_code', '4');
        $catLainSah = $revenueItems->firstWhere('item_code', '5');

        // Realized revenues from financial transactions mapped to 23 official positions
        $revenuesOfYear = Revenue::whereYear('date', $currentShift ? $currentShift->year : Carbon::now()->year)->get();
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
            'total_target_before' => $rootRevenue ? (float) $rootRevenue->before_amount : 44281028836,
            'total_target_after' => $rootRevenue ? (float) $rootRevenue->after_amount : 44281028836,
            'total_target_diff' => $rootRevenue ? (float) $rootRevenue->difference : 0,
            'jasa_layanan' => $catJasaLayanan ? (float) $catJasaLayanan->after_amount : 25047246628,
            'hasil_kerjasama' => $catKerjasama ? (float) $catKerjasama->after_amount : 445167500,
            'apbd' => $catApbd ? (float) $catApbd->after_amount : 18473614708,
            'lain_lain_sah' => $catLainSah ? (float) $catLainSah->after_amount : 315000000,
            'realized_total' => (float) $realizedTotal,
            'realized_jasa_layanan' => (float) $realizedJasaLayanan,
            'realized_hasil_kerjasama' => (float) $realizedKerjasama,
            'realized_apbd' => (float) $realizedApbd,
            'realized_lain_lain_sah' => (float) $realizedLainSah,
            'achievement_rate' => $rootRevenue && (float) $rootRevenue->after_amount > 0
                ? round(((float) $realizedTotal / (float) $rootRevenue->after_amount) * 100, 2)
                : 0,
        ];

        $rbas = \App\Models\RbaDraft::orderBy('year', 'desc')->orderBy('id', 'desc')->get();

        // 3. Ringkasan RBA (Pendapatan, Belanja, Pembiayaan, Surplus/Defisit) matching official sheet
        $totRevBefore = $rootRevenue ? (float) $rootRevenue->before_amount : 44281028836;
        $totRevAfter = $rootRevenue ? (float) $rootRevenue->after_amount : 44281028836;
        $totRevDiff = $totRevAfter - $totRevBefore;

        $totExpBefore = $rootExpense ? (float) $rootExpense->before_total : 44281028836;
        $totExpAfter = $rootExpense ? (float) $rootExpense->after_total : 44191804836;
        $totExpDiff = $totExpAfter - $totExpBefore;

        $surplusBefore = $totRevBefore - $totExpBefore;
        $surplusAfter = $totRevAfter - $totExpAfter;
        $surplusDiff = $surplusAfter - $surplusBefore;

        // Pembiayaan
        $penSilpa = (float) ($currentShift->penerimaan_silpa ?? 0);
        $penDivestasi = (float) ($currentShift->penerimaan_divestasi ?? 0);
        $penPinjaman = (float) ($currentShift->penerimaan_pinjaman ?? 0);
        $totPenerimaanPembiayaan = $penSilpa + $penDivestasi + $penPinjaman;

        $pengInvestasi = (float) ($currentShift->pengeluaran_investasi ?? 0);
        $pengPokokUtang = (float) ($currentShift->pengeluaran_pokok_utang ?? 0);
        $totPengeluaranPembiayaan = $pengInvestasi + $pengPokokUtang;

        $pembiayaanNetto = $totPenerimaanPembiayaan - $totPengeluaranPembiayaan;
        $silpaTahunBerkenaan = $surplusAfter + $pembiayaanNetto;

        // Belanja Breakdown for Ringkasan
        $expApbdRow = $expenseItems->firstWhere('account_code', '1.1.2') ?? $expenseItems->firstWhere('account_code', '1.1');
        $expOperasiRow = $expenseItems->firstWhere('account_code', '1.1');
        $expBarangJasaRow = $expenseItems->firstWhere('account_code', '1.1.2.1');
        $expModalRow = $expenseItems->firstWhere('account_code', '1.2');
        $expPeralatanRow = $expenseItems->firstWhere('account_code', '1.2.1.2');
        $expGedungRow = $expenseItems->firstWhere('account_code', '1.2.1.3');

        $ringkasanRba = [
            'pendapatan' => [
                'jasa_layanan' => [
                    'before' => $catJasaLayanan ? (float) $catJasaLayanan->before_amount : 25047246628,
                    'after' => $catJasaLayanan ? (float) $catJasaLayanan->after_amount : 25047246628,
                    'diff' => $catJasaLayanan ? (float) $catJasaLayanan->difference : 0,
                ],
                'hibah' => [
                    'before' => 0,
                    'after' => 0,
                    'diff' => 0,
                ],
                'hasil_kerjasama' => [
                    'before' => $catKerjasama ? (float) $catKerjasama->before_amount : 445167500,
                    'after' => $catKerjasama ? (float) $catKerjasama->after_amount : 445167500,
                    'diff' => $catKerjasama ? (float) $catKerjasama->difference : 0,
                ],
                'apbd' => [
                    'before' => $catApbd ? (float) $catApbd->before_amount : 18473614708,
                    'after' => $catApbd ? (float) $catApbd->after_amount : 18473614708,
                    'diff' => $catApbd ? (float) $catApbd->difference : 0,
                ],
                'lain_lain_sah' => [
                    'before' => $catLainSah ? (float) $catLainSah->before_amount : 315000000,
                    'after' => $catLainSah ? (float) $catLainSah->after_amount : 315000000,
                    'diff' => $catLainSah ? (float) $catLainSah->difference : 0,
                ],
                'total' => [
                    'before' => $totRevBefore,
                    'after' => $totRevAfter,
                    'diff' => $totRevDiff,
                ],
            ],
            'belanja' => [
                'apbd' => [
                    'before' => 18473614708,
                    'after' => 18473614708,
                    'diff' => 0,
                ],
                'operasi_blud' => [
                    'before' => $expOperasiRow ? (float) ($expOperasiRow->before_jasa_layanan + $expOperasiRow->before_hasil_kerjasama + $expOperasiRow->before_lain_lain_sah + $expOperasiRow->before_silpa) : 24807414128,
                    'after' => $expOperasiRow ? (float) ($expOperasiRow->after_jasa_layanan + $expOperasiRow->after_hasil_kerjasama + $expOperasiRow->after_lain_lain_sah + $expOperasiRow->after_silpa) : 24718190128,
                    'diff' => ($expOperasiRow ? (float) ($expOperasiRow->after_jasa_layanan + $expOperasiRow->after_hasil_kerjasama + $expOperasiRow->after_lain_lain_sah + $expOperasiRow->after_silpa) : 24718190128)
                        - ($expOperasiRow ? (float) ($expOperasiRow->before_jasa_layanan + $expOperasiRow->before_hasil_kerjasama + $expOperasiRow->before_lain_lain_sah + $expOperasiRow->before_silpa) : 24807414128),
                ],
                'barang_jasa_blud' => [
                    'before' => $expBarangJasaRow ? (float) $expBarangJasaRow->before_total : 24807414128,
                    'after' => $expBarangJasaRow ? (float) $expBarangJasaRow->after_total : 24718190128,
                    'diff' => $expBarangJasaRow ? (float) $expBarangJasaRow->difference : -89224000,
                ],
                'modal_blud' => [
                    'before' => $expModalRow ? (float) ($expModalRow->before_jasa_layanan + $expModalRow->before_hasil_kerjasama + $expModalRow->before_lain_lain_sah + $expModalRow->before_silpa) : 1000000000,
                    'after' => $expModalRow ? (float) ($expModalRow->after_jasa_layanan + $expModalRow->after_hasil_kerjasama + $expModalRow->after_lain_lain_sah + $expModalRow->after_silpa) : 1000000000,
                    'diff' => 0,
                ],
                'peralatan_mesin' => [
                    'before' => $expPeralatanRow ? (float) $expPeralatanRow->before_total : 500000000,
                    'after' => $expPeralatanRow ? (float) $expPeralatanRow->after_total : 500000000,
                    'diff' => $expPeralatanRow ? (float) $expPeralatanRow->difference : 0,
                ],
                'gedung_bangunan' => [
                    'before' => $expGedungRow ? (float) $expGedungRow->before_total : 500000000,
                    'after' => $expGedungRow ? (float) $expGedungRow->after_total : 500000000,
                    'diff' => $expGedungRow ? (float) $expGedungRow->difference : 0,
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
                'total_penerimaan' => $totPenerimaanPembiayaan,
                'investasi' => $pengInvestasi,
                'pokok_utang' => $pengPokokUtang,
                'total_pengeluaran' => $totPengeluaranPembiayaan,
                'netto' => $pembiayaanNetto,
                'silpa_tahun_berkenaan' => $silpaTahunBerkenaan,
            ],
        ];

        // 4. Master RBA Accounts & Requisition Items Proposed by Units for the Selected Year
        $catalogItems = \App\Models\Item::with('rbaAccount')
            ->orderBy('rba_account_id')
            ->orderBy('name')
            ->get();

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
                $q->where('budget_year', $selectedYear)
                  ->orWhere(function ($sq) use ($selectedYear) {
                      $sq->whereNull('budget_year')->where('fiscal_year', $selectedYear);
                  });
            })
            ->with([
                'requisition:id,requisition_number,rba_account_id,unit_id,fiscal_year,budget_year,status,user_id,nomor_surat_unit',
                'requisition.unit:id,name,unit_code',
                'requisition.user:id,name,nip',
                'item:id,item_code,name,specification,unit_type,standard_price',
            ])
            ->get()
            ->groupBy(fn ($d) => $d->requisition->rba_account_id);

        $accountsWithProposed = $rbaAccounts->map(function ($acc) use ($proposedDetails) {
            $items = $proposedDetails->get($acc->id, collect());
            return [
                'id' => $acc->id,
                'account_code' => $acc->account_code,
                'account_name' => $acc->account_name,
                'parent_code' => $acc->parent_code,
                'kategori_belanja' => $acc->kategori_belanja,
                'sumber_dana' => $acc->sumber_dana,
                'remaining_budget' => (float) $acc->remaining_budget,
                'total_budget' => (float) $acc->total_budget,
                'proposed_items' => $items->values(),
                'proposed_total' => (float) $items->sum('subtotal'),
                'proposed_count' => $items->count(),
            ];
        });

        return Inertia::render('Perencanaan/RBA/Index', [
            'rbas' => $rbas,
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

        $revenueItems = $shift->revenueItems()->get();
        $expenseItems = $shift->expenseItems()->get();

        $rootRevenue = $revenueItems->firstWhere('item_code', '0');
        $catJasaLayanan = $revenueItems->firstWhere('item_code', '1');
        $catKerjasama = $revenueItems->firstWhere('item_code', '3');
        $catApbd = $revenueItems->firstWhere('item_code', '4');
        $catLainSah = $revenueItems->firstWhere('item_code', '5');

        $rootExpense = $expenseItems->firstWhere('account_code', '1');
        $expOperasiRow = $expenseItems->firstWhere('account_code', '1.1');
        $expBarangJasaRow = $expenseItems->firstWhere('account_code', '1.1.2.1');
        $expModalRow = $expenseItems->firstWhere('account_code', '1.2');
        $expPeralatanRow = $expenseItems->firstWhere('account_code', '1.2.1.2');
        $expGedungRow = $expenseItems->firstWhere('account_code', '1.2.1.3');

        $totRevBefore = $rootRevenue ? (float) $rootRevenue->before_amount : 44281028836;
        $totRevAfter = $rootRevenue ? (float) $rootRevenue->after_amount : 44281028836;
        $totRevDiff = $totRevAfter - $totRevBefore;

        $totExpBefore = $rootExpense ? (float) $rootExpense->before_total : 44281028836;
        $totExpAfter = $rootExpense ? (float) $rootExpense->after_total : 44191804836;
        $totExpDiff = $totExpAfter - $totExpBefore;

        $surplusBefore = $totRevBefore - $totExpBefore;
        $surplusAfter = $totRevAfter - $totExpAfter;
        $surplusDiff = $surplusAfter - $surplusBefore;

        $penSilpa = (float) ($shift->penerimaan_silpa ?? 0);
        $penDivestasi = (float) ($shift->penerimaan_divestasi ?? 0);
        $penPinjaman = (float) ($shift->penerimaan_pinjaman ?? 0);
        $totPenerimaanPembiayaan = $penSilpa + $penDivestasi + $penPinjaman;

        $pengInvestasi = (float) ($shift->pengeluaran_investasi ?? 0);
        $pengPokokUtang = (float) ($shift->pengeluaran_pokok_utang ?? 0);
        $totPengeluaranPembiayaan = $pengInvestasi + $pengPokokUtang;

        $pembiayaanNetto = $totPenerimaanPembiayaan - $totPengeluaranPembiayaan;
        $silpaTahunBerkenaan = $surplusAfter + $pembiayaanNetto;

        $ringkasan = [
            'pendapatan' => [
                'jasa_layanan' => [
                    'before' => $catJasaLayanan ? (float) $catJasaLayanan->before_amount : 25047246628,
                    'after' => $catJasaLayanan ? (float) $catJasaLayanan->after_amount : 25047246628,
                    'diff' => $catJasaLayanan ? (float) $catJasaLayanan->difference : 0,
                ],
                'hibah' => ['before' => 0, 'after' => 0, 'diff' => 0],
                'hasil_kerjasama' => [
                    'before' => $catKerjasama ? (float) $catKerjasama->before_amount : 445167500,
                    'after' => $catKerjasama ? (float) $catKerjasama->after_amount : 445167500,
                    'diff' => $catKerjasama ? (float) $catKerjasama->difference : 0,
                ],
                'apbd' => [
                    'before' => $catApbd ? (float) $catApbd->before_amount : 18473614708,
                    'after' => $catApbd ? (float) $catApbd->after_amount : 18473614708,
                    'diff' => $catApbd ? (float) $catApbd->difference : 0,
                ],
                'lain_lain_sah' => [
                    'before' => $catLainSah ? (float) $catLainSah->before_amount : 315000000,
                    'after' => $catLainSah ? (float) $catLainSah->after_amount : 315000000,
                    'diff' => $catLainSah ? (float) $catLainSah->difference : 0,
                ],
                'total' => [
                    'before' => $totRevBefore,
                    'after' => $totRevAfter,
                    'diff' => $totRevDiff,
                ],
            ],
            'belanja' => [
                'apbd' => ['before' => 18473614708, 'after' => 18473614708, 'diff' => 0],
                'operasi_blud' => [
                    'before' => $expOperasiRow ? (float) ($expOperasiRow->before_jasa_layanan + $expOperasiRow->before_hasil_kerjasama + $expOperasiRow->before_lain_lain_sah + $expOperasiRow->before_silpa) : 24807414128,
                    'after' => $expOperasiRow ? (float) ($expOperasiRow->after_jasa_layanan + $expOperasiRow->after_hasil_kerjasama + $expOperasiRow->after_lain_lain_sah + $expOperasiRow->after_silpa) : 24718190128,
                    'diff' => ($expOperasiRow ? (float) ($expOperasiRow->after_jasa_layanan + $expOperasiRow->after_hasil_kerjasama + $expOperasiRow->after_lain_lain_sah + $expOperasiRow->after_silpa) : 24718190128)
                        - ($expOperasiRow ? (float) ($expOperasiRow->before_jasa_layanan + $expOperasiRow->before_hasil_kerjasama + $expOperasiRow->before_lain_lain_sah + $expOperasiRow->before_silpa) : 24807414128),
                ],
                'barang_jasa_blud' => [
                    'before' => $expBarangJasaRow ? (float) $expBarangJasaRow->before_total : 24807414128,
                    'after' => $expBarangJasaRow ? (float) $expBarangJasaRow->after_total : 24718190128,
                    'diff' => $expBarangJasaRow ? (float) $expBarangJasaRow->difference : -89224000,
                ],
                'modal_blud' => [
                    'before' => $expModalRow ? (float) ($expModalRow->before_jasa_layanan + $expModalRow->before_hasil_kerjasama + $expModalRow->before_lain_lain_sah + $expModalRow->before_silpa) : 1000000000,
                    'after' => $expModalRow ? (float) ($expModalRow->after_jasa_layanan + $expModalRow->after_hasil_kerjasama + $expModalRow->after_lain_lain_sah + $expModalRow->after_silpa) : 1000000000,
                    'diff' => 0,
                ],
                'peralatan_mesin' => [
                    'before' => $expPeralatanRow ? (float) $expPeralatanRow->before_total : 500000000,
                    'after' => $expPeralatanRow ? (float) $expPeralatanRow->after_total : 500000000,
                    'diff' => $expPeralatanRow ? (float) $expPeralatanRow->difference : 0,
                ],
                'gedung_bangunan' => [
                    'before' => $expGedungRow ? (float) $expGedungRow->before_total : 500000000,
                    'after' => $expGedungRow ? (float) $expGedungRow->after_total : 500000000,
                    'diff' => $expGedungRow ? (float) $expGedungRow->difference : 0,
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
                'total_penerimaan' => $totPenerimaanPembiayaan,
                'investasi' => $pengInvestasi,
                'pokok_utang' => $pengPokokUtang,
                'total_pengeluaran' => $totPengeluaranPembiayaan,
                'netto' => $pembiayaanNetto,
                'silpa_tahun_berkenaan' => $silpaTahunBerkenaan,
            ],
        ];

        return Inertia::render('Perencanaan/RBA/PrintRingkasan', [
            'shift' => $shift,
            'ringkasan' => $ringkasan,
        ]);
    }

    /**
     * Show form for creating new RBA draft (backward compatible).
     */
    public function create(): Response
    {
        return Inertia::render('Perencanaan/RBA/Create', [
            'default_year' => (int) Carbon::now()->format('Y'),
        ]);
    }

    /**
     * Store new RBA draft (backward compatible).
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'year' => ['required', 'integer', 'min:2020', 'max:2099'],
            'target_revenue' => ['required', 'numeric', 'min:0'],
            'planned_expense' => ['required', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        DB::transaction(function () use ($validated) {
            \App\Models\RbaDraft::create([
                'year' => $validated['year'],
                'target_revenue' => $validated['target_revenue'],
                'planned_expense' => $validated['planned_expense'],
                'status' => 'Draft',
                'notes' => $validated['notes'] ?? null,
            ]);
        });

        return redirect()->route('perencanaan.rba.index')
            ->with('success', 'Draft Rencana Bisnis dan Anggaran (RBA) berhasil disusun.');
    }

    /**
     * Sahkan RBA (backward compatible).
     */
    public function sahkan(int $id): RedirectResponse
    {
        $rba = \App\Models\RbaDraft::find($id);
        if ($rba) {
            $rba->update(['status' => 'Disahkan']);
        }

        $shift = RbaShift::find($id);
        if ($shift) {
            $shift->activate();
        }

        return redirect()->route('perencanaan.rba.index')
            ->with('success', 'RBA berhasil disahkan secara resmi.');
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
            $difference = $validated['after_amount'] - (float) $item->before_amount;

            $item->update([
                'after_amount' => $validated['after_amount'],
                'difference' => $difference,
            ]);

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

        $rbaAccounts = RbaAccount::where('sumber_dana', 'BLUD')
            ->orderBy('account_code')
            ->get();

        $proposedDetails = \App\Models\RequisitionDetail::whereHas('requisition', function ($q) use ($selectedYear) {
                $q->where('fiscal_year', $selectedYear);
            })
            ->with([
                'requisition:id,requisition_number,rba_account_id,unit_id,fiscal_year,status,user_id,nomor_surat_unit',
                'requisition.unit:id,name,unit_code',
                'requisition.user:id,name,nip',
                'item:id,item_code,name,specification,unit_type,standard_price',
            ])
            ->get()
            ->groupBy(fn ($d) => $d->requisition->rba_account_id);

        $accountsWithProposed = $rbaAccounts->map(function ($acc) use ($proposedDetails) {
            $items = $proposedDetails->get($acc->id, collect());
            return [
                'id' => $acc->id,
                'account_code' => $acc->account_code,
                'account_name' => $acc->account_name,
                'parent_code' => $acc->parent_code,
                'kategori_belanja' => $acc->kategori_belanja,
                'sumber_dana' => $acc->sumber_dana,
                'remaining_budget' => (float) $acc->remaining_budget,
                'total_budget' => (float) $acc->total_budget,
                'proposed_items' => $items->values(),
                'proposed_total' => (float) $items->sum('subtotal'),
                'proposed_count' => $items->count(),
            ];
        });

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
}
