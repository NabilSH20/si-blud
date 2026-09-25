<?php

namespace App\Http\Controllers\Perencanaan;

use App\Http\Controllers\Controller;
use App\Models\Item;
use App\Models\RbaAccount;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ItemController extends Controller
{
    /**
     * Display a listing of the items.
     */
    public function index(Request $request): Response
    {
        return Inertia::render('Perencanaan/Items/Index', [
            'items' => Item::with([
                    'rbaAccount:id,account_code,account_name',
                    'originUnit:id,name,unit_code',
                ])
                ->orderBy('item_code')
                ->get([
                    'id', 'rba_account_id', 'item_code', 'name', 'specification', 'unit_type', 'standard_price', 'source', 'origin_unit_id',
                ]),
            'rbaAccounts' => RbaAccount::where('sumber_dana', 'BLUD')
                ->orderBy('account_code')
                ->get(['id', 'account_code', 'account_name', 'sumber_dana']),
            'nextItemCode' => Item::generateNextItemCode(),
            'success' => session('success'),
            'error' => session('error'),
            'sourceFilter' => $request->query('source', 'STANDAR'),
        ]);
    }

    /**
     * Show the form for creating a new item.
     */
    public function create(): Response
    {
        return Inertia::render('Perencanaan/Items/Create', [
            'rbaAccounts' => RbaAccount::where('sumber_dana', 'BLUD')
                ->orderBy('account_code')
                ->get(['id', 'account_code', 'account_name']),
            'nextItemCode' => Item::generateNextItemCode(),
        ]);
    }

    /**
     * Store a newly created item in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        if (!$request->filled('item_code')) {
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
     * Show the form for editing the specified item.
     */
    public function edit(Item $item): Response
    {
        return Inertia::render('Perencanaan/Items/Edit', [
            'item' => $item->only([
                'id', 'rba_account_id', 'item_code', 'name', 'specification', 'unit_type', 'standard_price',
            ]),
            'rbaAccounts' => RbaAccount::where('sumber_dana', 'BLUD')
                ->orderBy('account_code')
                ->get(['id', 'account_code', 'account_name']),
        ]);
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
        $item->update([
            'source' => 'STANDAR',
        ]);

        return redirect()
            ->route('items.index')
            ->with('success', 'Barang "' . $item->name . '" (' . $item->item_code . ') berhasil disahkan menjadi Standar Baku Rumah Sakit.');
    }
}
