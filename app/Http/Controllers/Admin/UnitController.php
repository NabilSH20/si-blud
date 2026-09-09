<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Unit;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class UnitController extends Controller
{
    /**
     * Store a newly created unit in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'division_id' => ['required', 'exists:divisions,id'],
            'unit_code' => ['required', 'string', 'max:255', Rule::unique('units', 'unit_code')],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
        ], [
            'division_id.required' => 'Pilih Bagian / Divisi Induk terlebih dahulu.',
            'division_id.exists' => 'Divisi yang dipilih tidak valid.',
            'unit_code.required' => 'Kode Unit wajib diisi.',
            'unit_code.unique' => 'Kode Unit sudah digunakan oleh unit lain.',
            'name.required' => 'Nama Unit Kerja / Instalasi wajib diisi.',
        ]);

        $validated['unit_code'] = strtoupper(trim($validated['unit_code']));

        Unit::create($validated);

        return redirect()
            ->route('divisions.index')
            ->with('success', 'Unit Kerja "'.$validated['name'].'" berhasil ditambahkan.');
    }

    /**
     * Update the specified unit in storage.
     */
    public function update(Request $request, Unit $unit): RedirectResponse
    {
        $validated = $request->validate([
            'division_id' => ['required', 'exists:divisions,id'],
            'unit_code' => [
                'required',
                'string',
                'max:255',
                Rule::unique('units', 'unit_code')->ignore($unit->id),
            ],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
        ], [
            'division_id.required' => 'Pilih Bagian / Divisi Induk terlebih dahulu.',
            'division_id.exists' => 'Divisi yang dipilih tidak valid.',
            'unit_code.required' => 'Kode Unit wajib diisi.',
            'unit_code.unique' => 'Kode Unit sudah digunakan oleh unit lain.',
            'name.required' => 'Nama Unit Kerja / Instalasi wajib diisi.',
        ]);

        $validated['unit_code'] = strtoupper(trim($validated['unit_code']));

        $unit->update($validated);

        return redirect()
            ->route('divisions.index')
            ->with('success', 'Unit Kerja "'.$unit->name.'" berhasil diperbarui.');
    }

    /**
     * Remove the specified unit from storage.
     */
    public function destroy(Unit $unit): RedirectResponse
    {
        if ($unit->users()->exists()) {
            return back()->with('error', 'Unit Kerja "'.$unit->name.'" tidak dapat dihapus karena masih memiliki pengguna/staf terdaftar.');
        }

        if ($unit->requisitions()->exists()) {
            return back()->with('error', 'Unit Kerja "'.$unit->name.'" tidak dapat dihapus karena memiliki riwayat usulan belanja.');
        }

        $name = $unit->name;
        $unit->delete();

        return redirect()
            ->route('divisions.index')
            ->with('success', 'Unit Kerja "'.$name.'" berhasil dihapus.');
    }
}

