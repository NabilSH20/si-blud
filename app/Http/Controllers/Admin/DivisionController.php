<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Division;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class DivisionController extends Controller
{
    /**
     * Display a listing of the divisions.
     */
    public function index(): Response
    {
        return Inertia::render('Admin/Divisions/Index', [
            'divisions' => Division::orderBy('division_code')->get(['id', 'division_code', 'name']),
            'success' => session('success'),
            'error' => session('error'),
        ]);
    }

    /**
     * Show the form for creating a new division.
     */
    public function create(): Response
    {
        return Inertia::render('Admin/Divisions/Create');
    }

    /**
     * Store a newly created division in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'division_code' => ['required', 'string', 'max:255', Rule::unique('divisions', 'division_code')],
            'name' => ['required', 'string', 'max:255'],
        ]);

        Division::create($validated);

        return redirect()
            ->route('divisions.index')
            ->with('success', 'Divisi "'.$validated['name'].'" berhasil ditambahkan.');
    }

    /**
     * Show the form for editing the specified division.
     */
    public function edit(Division $division): Response
    {
        return Inertia::render('Admin/Divisions/Edit', [
            'division' => $division->only(['id', 'division_code', 'name']),
        ]);
    }

    /**
     * Update the specified division in storage.
     */
    public function update(Request $request, Division $division): RedirectResponse
    {
        $validated = $request->validate([
            'division_code' => [
                'required',
                'string',
                'max:255',
                Rule::unique('divisions', 'division_code')->ignore($division->id),
            ],
            'name' => ['required', 'string', 'max:255'],
        ]);

        $division->update($validated);

        return redirect()
            ->route('divisions.index')
            ->with('success', 'Divisi berhasil diperbarui.');
    }

    /**
     * Remove the specified division from storage.
     */
    public function destroy(Division $division): RedirectResponse
    {
        if ($division->requisitions()->exists()) {
            return back()->with('error', 'Divisi "'.$division->name.'" tidak dapat dihapus karena masih memiliki data requisition terkait.');
        }

        $division->delete();

        return redirect()
            ->route('divisions.index')
            ->with('success', 'Divisi berhasil dihapus.');
    }
}
