<?php

namespace App\Http\Controllers\Perencanaan;

use App\Http\Controllers\Controller;
use App\Models\Item;
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
    public function index(): Response
    {
        return Inertia::render('Perencanaan/Items/Index', [
            'items' => Item::orderBy('item_code')->get([
                'id', 'item_code', 'name', 'specification', 'unit_type', 'standard_price',
            ]),
            'success' => session('success'),
            'error' => session('error'),
        ]);
    }

    /**
     * Show the form for creating a new item.
     */
    public function create(): Response
    {
        return Inertia::render('Perencanaan/Items/Create');
    }

    /**
     * Store a newly created item in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'item_code' => ['required', 'string', 'max:255', Rule::unique('items', 'item_code')],
            'name' => ['required', 'string', 'max:255'],
            'specification' => ['nullable', 'string'],
            'unit_type' => ['required', 'string', 'max:255'],
            'standard_price' => ['required', 'numeric', 'min:0'],
        ]);

        Item::create($validated);

        return redirect()
            ->route('items.index')
            ->with('success', 'Barang "'.$validated['name'].'" berhasil ditambahkan.');
    }

    /**
     * Show the form for editing the specified item.
     */
    public function edit(Item $item): Response
    {
        return Inertia::render('Perencanaan/Items/Edit', [
            'item' => $item->only([
                'id', 'item_code', 'name', 'specification', 'unit_type', 'standard_price',
            ]),
        ]);
    }

    /**
     * Update the specified item in storage.
     */
    public function update(Request $request, Item $item): RedirectResponse
    {
        $validated = $request->validate([
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
            ->with('success', 'Barang berhasil diperbarui.');
    }

    /**
     * Remove the specified item from storage.
     */
    public function destroy(Item $item): RedirectResponse
    {
        $item->delete();

        return redirect()
            ->route('items.index')
            ->with('success', 'Barang "'.$item->name.'" berhasil dihapus.');
    }
}
