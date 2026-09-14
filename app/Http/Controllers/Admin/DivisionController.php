<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Division;
use App\Models\Unit;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class DivisionController extends Controller
{
    /**
     * Display a listing of the divisions and units.
     */
    public function index(Request $request): Response
    {
        $divisions = Division::with(['units' => function ($q) {
                $q->orderBy('name');
            }])
            ->withCount(['units', 'users', 'requisitions'])
            ->orderBy('division_code')
            ->get();

        $units = Unit::with('division')
            ->withCount(['users', 'requisitions'])
            ->orderBy('name')
            ->get();

        return Inertia::render('Admin/Divisions/Index', [
            'divisions' => $divisions,
            'units' => $units,
            'initial_tab' => $request->query('tab', 'divisions'),
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
            'group' => ['nullable', 'string', 'in:Pelayanan_Keperawatan,Umum_Kepegawaian'],
        ], [
            'division_code.required' => 'Kode Divisi wajib diisi.',
            'division_code.unique' => 'Kode Divisi sudah digunakan.',
            'name.required' => 'Nama Divisi / Bagian wajib diisi.',
        ]);

        $validated['division_code'] = strtoupper(trim($validated['division_code']));

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
            'division' => $division->only(['id', 'division_code', 'name', 'group']),
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
            'group' => ['nullable', 'string', 'in:Pelayanan_Keperawatan,Umum_Kepegawaian'],
        ], [
            'division_code.required' => 'Kode Divisi wajib diisi.',
            'division_code.unique' => 'Kode Divisi sudah digunakan.',
            'name.required' => 'Nama Divisi / Bagian wajib diisi.',
        ]);

        $validated['division_code'] = strtoupper(trim($validated['division_code']));

        $division->update($validated);

        return redirect()
            ->route('divisions.index')
            ->with('success', 'Divisi "'.$division->name.'" berhasil diperbarui.');
    }

    /**
     * Remove the specified division from storage.
     */
    public function destroy(Division $division): RedirectResponse
    {
        if ($division->units()->exists()) {
            return back()->with('error', 'Divisi "'.$division->name.'" tidak dapat dihapus karena masih memiliki data Unit Kerja terkait. Hapus atau pindahkan unit kerja terlebih dahulu.');
        }

        if ($division->users()->exists()) {
            return back()->with('error', 'Divisi "'.$division->name.'" tidak dapat dihapus karena masih memiliki pengguna/staf terdaftar.');
        }

        if ($division->requisitions()->exists()) {
            return back()->with('error', 'Divisi "'.$division->name.'" tidak dapat dihapus karena masih memiliki data requisition terkait.');
        }

        $name = $division->name;
        $division->delete();

        return redirect()
            ->route('divisions.index')
            ->with('success', 'Divisi "'.$name.'" berhasil dihapus.');
    }
}
