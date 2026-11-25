<?php

namespace App\Http\Controllers\Perencanaan;

use App\Http\Controllers\Controller;
use App\Models\FiscalYear;
use App\Models\Item;
use App\Models\RbaAccount;
use App\Models\Requisition;
use App\Models\RequisitionDetail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ItemController extends Controller
{
    /**
     * Helper to get RBA accounts scoped to active fiscal year.
     */
    private function getScopedRbaAccounts()
    {
        $activeYear = (int) session('active_year', function () {
            return class_exists(FiscalYear::class)
                ? FiscalYear::getDefaultYear()
                : (int) date('Y');
        });

        $accounts = RbaAccount::where('period_year', $activeYear)
            ->where('sumber_dana', 'BLUD')
            ->orderBy('account_code')
            ->get(['id', 'account_code', 'account_name', 'sumber_dana']);

        if ($accounts->isEmpty()) {
            $accounts = RbaAccount::where('sumber_dana', 'BLUD')
                ->orderBy('account_code')
                ->get(['id', 'account_code', 'account_name', 'sumber_dana'])
                ->unique('account_code')
                ->values();
        }

        return $accounts;
    }

    /**
     * Display a listing of the items.
     */
    public function index(Request $request): Response
    {
        return Inertia::render('Perencanaan/Items/Index', [
            'items' => Item::with([
                'rbaAccount:id,account_code,account_name',
                'originUnit:id,name,unit_code',
                'priceOriginUnit:id,name,unit_code',
            ])
                ->orderBy('item_code')
                ->get([
                    'id',
                    'rba_account_id',
                    'item_code',
                    'name',
                    'specification',
                    'unit_type',
                    'standard_price',
                    'pending_price',
                    'price_status',
                    'source',
                    'origin_unit_id',
                    'price_origin_unit_id',
                ]),
            'rbaAccounts' => $this->getScopedRbaAccounts(),
            'nextItemCode' => Item::generateNextItemCode(),
            'success' => session('success'),
            'error' => session('error'),
            'sourceFilter' => $request->query('source', 'STANDAR'),
        ]);
    }

    /**
     * Store a newly created item in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        if (! $request->filled('item_code')) {
            $request->merge(['item_code' => Item::generateNextItemCode()]);
        } else {
            $request->merge(['item_code' => strtoupper(trim($request->item_code))]);
        }

        $validated = $request->validate([
            'rba_account_id' => ['required', 'exists:rba_accounts,id'],
            'item_code' => ['required', 'string', 'max:255', Rule::unique('items', 'item_code')],
            'name' => ['required', 'string', 'max:255'],
            'specification' => ['nullable', 'string'],
            'unit_type' => ['required', 'string', 'max:255'],
            'standard_price' => ['required', 'numeric', 'min:0'],
        ]);

        $validated['source'] = 'STANDAR';
        $validated['origin_unit_id'] = null;

        Item::create($validated);

        return redirect()
            ->route('items.index')
            ->with('success', 'Barang "'.$validated['name'].'" ('.$validated['item_code'].') berhasil ditambahkan ke katalog.');
    }

    /**
     * Update the specified item in storage.
     */
    public function update(Request $request, Item $item): RedirectResponse
    {
        if ($request->filled('item_code')) {
            $request->merge(['item_code' => strtoupper(trim($request->item_code))]);
        }

        $validated = $request->validate([
            'rba_account_id' => ['required', 'exists:rba_accounts,id'],
            'item_code' => [
                'required',
                'string',
                'max:255',
                Rule::unique('items', 'item_code')->ignore($item->id),
            ],
            'name' => ['required', 'string', 'max:255'],
            'specification' => ['nullable', 'string'],
            'unit_type' => ['required', 'string', 'max:255'],
            'standard_price' => ['required', 'numeric', 'min:0'],
        ]);

        $item->update($validated);

        return redirect()
            ->route('items.index')
            ->with('success', 'Data barang "'.$item->name.'" berhasil diperbarui.');
    }

    /**
     * Remove the specified item from storage.
     */
    public function destroy(Item $item): RedirectResponse
    {
        if ($item->requisitionDetails()->exists()) {
            return redirect()
                ->route('items.index')
                ->with('error', 'Barang "'.$item->name.'" tidak dapat dihapus karena sudah tercatat dalam usulan belanja.');
        }

        $itemName = $item->name;
        $item->delete();

        return redirect()
            ->route('items.index')
            ->with('success', 'Barang "'.$itemName.'" berhasil dihapus dari katalog.');
    }

    /**
     * Verify / validate an item proposed by a unit to become an official hospital standard item.
     */
    public function verifyStandard(Item $item): RedirectResponse
    {
        DB::transaction(function () use ($item) {
            $item->update([
                'source' => 'STANDAR',
            ]);

            RequisitionDetail::where('item_id', $item->id)
                ->whereHas('requisition', fn ($q) => $q->where('status', 'Pending_Perencanaan'))
                ->update([
                    'item_validation_status' => 'SAH',
                ]);
        });

        return redirect()
            ->route('items.index')
            ->with('success', 'Barang "'.$item->name.'" ('.$item->item_code.') berhasil disahkan menjadi Standar Baku Rumah Sakit.');
    }

    /**
     * Reject a new unit-proposed item (mark Tidak Sah) without breaking requisition detail history.
     */
    public function rejectStandard(Item $item): RedirectResponse
    {
        DB::transaction(function () use ($item) {
            $item->update([
                'source' => 'DITOLAK',
            ]);

            $affectedRequisitionIds = [];
            $pendingDetails = RequisitionDetail::where('item_id', $item->id)
                ->whereHas('requisition', fn ($q) => $q->where('status', 'Pending_Perencanaan'))
                ->get();

            foreach ($pendingDetails as $detail) {
                $detail->update([
                    'item_validation_status' => 'TIDAK_SAH',
                    'quantity_approved' => 0,
                    'subtotal' => 0,
                ]);
                $affectedRequisitionIds[$detail->requisition_id] = true;
            }

            foreach (array_keys($affectedRequisitionIds) as $reqId) {
                $req = Requisition::find($reqId);
                if ($req) {
                    $this->recalculatePendingRequisitionTotals($req);
                }
            }
        });

        return redirect()
            ->route('items.index', ['source' => 'USULAN_UNIT'])
            ->with('success', 'Barang usulan baru "'.$item->name.'" ditandai Tidak Sah dan ditolak.');
    }

    /**
     * Validate and apply a pending unit price update to the official catalog standard_price.
     */
    public function verifyPrice(Item $item): RedirectResponse
    {
        if ($item->price_status !== 'PENDING' || $item->pending_price === null) {
            return redirect()
                ->route('items.index', ['source' => 'USULAN_UNIT'])
                ->with('error', 'Tidak ada pembaruan harga yang menunggu validasi untuk barang ini.');
        }

        $newPrice = (float) $item->pending_price;

        DB::transaction(function () use ($item, $newPrice) {
            $item->update([
                'standard_price' => $newPrice,
                'pending_price' => null,
                'price_status' => 'NONE',
                'price_origin_unit_id' => null,
            ]);

            $affectedRequisitionIds = [];
            $pendingDetails = RequisitionDetail::where('item_id', $item->id)
                ->where('price_validation_status', 'PENDING')
                ->whereHas('requisition', fn ($q) => $q->where('status', 'Pending_Perencanaan'))
                ->get();

            foreach ($pendingDetails as $detail) {
                $detail->update([
                    'unit_price' => $newPrice,
                    'subtotal' => (int) $detail->quantity_requested * $newPrice,
                    'price_validation_status' => 'SAH',
                ]);
                $affectedRequisitionIds[$detail->requisition_id] = true;
            }

            foreach (array_keys($affectedRequisitionIds) as $reqId) {
                $req = Requisition::find($reqId);
                if ($req) {
                    $this->recalculatePendingRequisitionTotals($req);
                }
            }
        });

        return redirect()
            ->route('items.index', ['source' => 'USULAN_UNIT'])
            ->with('success', 'Pembaruan harga barang "'.$item->name.'" berhasil disahkan dan diperbarui di katalog standar RS.');
    }

    /**
     * Reject a pending unit price update, preserving official standard_price and reverting pending requisition detail prices.
     */
    public function rejectPrice(Item $item): RedirectResponse
    {
        DB::transaction(function () use ($item) {
            $officialStandardPrice = (float) $item->standard_price;

            $item->update([
                'pending_price' => null,
                'price_status' => 'NONE',
                'price_origin_unit_id' => null,
            ]);

            $affectedRequisitionIds = [];
            $pendingDetails = RequisitionDetail::where('item_id', $item->id)
                ->where('price_validation_status', 'PENDING')
                ->whereHas('requisition', fn ($q) => $q->where('status', 'Pending_Perencanaan'))
                ->get();

            foreach ($pendingDetails as $detail) {
                $restoredPrice = (float) ($detail->original_unit_price ?? $officialStandardPrice);
                $detail->update([
                    'unit_price' => $restoredPrice,
                    'subtotal' => (int) $detail->quantity_requested * $restoredPrice,
                    'price_validation_status' => 'TIDAK_SAH',
                    'exceeds_ssh' => false,
                ]);
                $affectedRequisitionIds[$detail->requisition_id] = true;
            }

            foreach (array_keys($affectedRequisitionIds) as $reqId) {
                $req = Requisition::find($reqId);
                if ($req) {
                    $this->recalculatePendingRequisitionTotals($req);
                }
            }
        });

        return redirect()
            ->route('items.index', ['source' => 'USULAN_UNIT'])
            ->with('success', 'Pembaruan harga barang "'.$item->name.'" ditolak (Tidak Sah). Harga katalog tetap menggunakan standar awal.');
    }

    /**
     * Recalculate estimated totals on a pending requisition after item or price validation.
     */
    private function recalculatePendingRequisitionTotals(Requisition $requisition): void
    {
        $requisition->loadMissing(['requisitionDetails.item.rbaAccount', 'rbaAccount']);

        $totalOperasional = 0;
        $totalModal = 0;

        foreach ($requisition->requisitionDetails as $detail) {
            if ($detail->item_validation_status === 'TIDAK_SAH') {
                continue;
            }

            $kategori = $detail->item?->rbaAccount?->kategori_belanja ?? $requisition->rbaAccount?->kategori_belanja ?? $requisition->jenis_belanja;
            $sub = (float) $detail->subtotal;

            if ($kategori === 'Modal') {
                $totalModal += $sub;
            } else {
                $totalOperasional += $sub;
            }
        }

        $requisition->update([
            'total_operasional' => $totalOperasional,
            'total_modal' => $totalModal,
            'total_estimated' => $totalOperasional + $totalModal,
        ]);
    }
}
