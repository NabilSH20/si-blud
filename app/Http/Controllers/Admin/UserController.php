<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Division;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    /**
     * Display a listing of the users.
     */
    public function index(): Response
    {
        $users = User::with(['division', 'unit'])
            ->orderBy('name')
            ->get();

        $divisions = Division::with('units')->orderBy('name')->get();

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'divisions' => $divisions,
            'success' => session('success'),
            'error' => session('error'),
        ]);
    }

    /**
     * Show the form for creating a new user.
     */
    public function create(): Response
    {
        $divisions = Division::with('units')->orderBy('name')->get();

        return Inertia::render('Admin/Users/Create', [
            'divisions' => $divisions,
        ]);
    }

    /**
     * Store a newly created user in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'nip' => ['nullable', 'string', 'max:30', 'unique:users,nip'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'position' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:30'],
            'is_active' => ['nullable', 'boolean'],
            'password' => ['required', 'string', 'min:8'],
            'role' => ['required', 'string', 'in:admin,divisi,perencanaan,keuangan'],
            'division_id' => [
                'nullable',
                'exists:divisions,id',
                Rule::requiredIf($request->role === 'divisi'),
            ],
            'unit_id' => [
                'nullable',
                'exists:units,id',
                Rule::requiredIf($request->role === 'divisi'),
            ],
        ], [
            'name.required' => 'Nama pengguna wajib diisi.',
            'nip.unique' => 'NIP ini sudah terdaftar untuk pegawai lain.',
            'email.required' => 'Alamat email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'email.unique' => 'Email ini sudah terdaftar di sistem.',
            'password.required' => 'Kata sandi wajib diisi.',
            'password.min' => 'Kata sandi minimal 8 karakter.',
            'role.required' => 'Peran (role) pengguna wajib dipilih.',
            'role.in' => 'Peran pengguna tidak valid.',
            'division_id.required' => 'Pengguna dengan peran Divisi / Pemohon wajib memilih Bidang Pengusul.',
            'division_id.exists' => 'Bidang yang dipilih tidak valid.',
            'unit_id.required' => 'Pengguna dengan peran Divisi / Pemohon wajib memilih Unit kerja.',
            'unit_id.exists' => 'Unit kerja yang dipilih tidak valid.',
        ]);

        if ($validated['role'] === 'divisi') {
            $allowedDivisions = Division::whereIn('division_code', ['MEDIK', 'RAWAT', 'PENUNJANG_DIKLIT', 'YAN', 'PENUNJANG'])
                ->pluck('id')
                ->toArray();

            if (!in_array((int)$validated['division_id'], $allowedDivisions)) {
                return back()->withErrors(['division_id' => 'Bidang pengusul pengadaan harus berasal dari Pelayanan Medik, Keperawatan, atau Penunjang Medik & Diklit.'])->withInput();
            }

            if (!empty($validated['unit_id'])) {
                $unitBelongs = \App\Models\Unit::where('id', $validated['unit_id'])
                    ->where('division_id', $validated['division_id'])
                    ->exists();
                if (!$unitBelongs) {
                    return back()->withErrors(['unit_id' => 'Unit kerja yang dipilih tidak sesuai dengan bidang yang dipilih.'])->withInput();
                }
            }
        }

        User::create([
            'name' => $validated['name'],
            'nip' => $validated['nip'] ?? null,
            'email' => $validated['email'],
            'position' => $validated['position'] ?? null,
            'phone' => $validated['phone'] ?? null,
            'is_active' => $request->has('is_active') ? (bool)$request->is_active : true,
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
            'division_id' => $validated['role'] === 'divisi' ? $validated['division_id'] : ($validated['division_id'] ?? null),
            'unit_id' => $validated['role'] === 'divisi' ? $validated['unit_id'] : ($validated['unit_id'] ?? null),
        ]);

        return redirect()->route('users.index')
            ->with('success', "Pengguna {$validated['name']} berhasil ditambahkan.");
    }

    /**
     * Show the form for editing the specified user.
     */
    public function edit(User $user): Response
    {
        $divisions = Division::with('units')->orderBy('name')->get();

        return Inertia::render('Admin/Users/Edit', [
            'user' => $user->load(['division', 'unit']),
            'divisions' => $divisions,
        ]);
    }

    /**
     * Update the specified user in storage.
     */
    public function update(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'nip' => ['nullable', 'string', 'max:30', Rule::unique('users')->ignore($user->id)],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'position' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:30'],
            'is_active' => ['nullable', 'boolean'],
            'password' => ['nullable', 'string', 'min:8'],
            'role' => ['required', 'string', 'in:admin,divisi,perencanaan,keuangan'],
            'division_id' => [
                'nullable',
                'exists:divisions,id',
                Rule::requiredIf($request->role === 'divisi'),
            ],
            'unit_id' => [
                'nullable',
                'exists:units,id',
                Rule::requiredIf($request->role === 'divisi'),
            ],
        ], [
            'name.required' => 'Nama pengguna wajib diisi.',
            'nip.unique' => 'NIP ini sudah terdaftar untuk pegawai lain.',
            'email.required' => 'Alamat email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'email.unique' => 'Email ini sudah digunakan oleh akun lain.',
            'password.min' => 'Kata sandi baru minimal 8 karakter.',
            'role.required' => 'Peran (role) pengguna wajib dipilih.',
            'role.in' => 'Peran pengguna tidak valid.',
            'division_id.required' => 'Pengguna dengan peran Divisi / Pemohon wajib memilih Bidang Pengusul.',
            'division_id.exists' => 'Bidang yang dipilih tidak valid.',
            'unit_id.required' => 'Pengguna dengan peran Divisi / Pemohon wajib memilih Unit kerja.',
            'unit_id.exists' => 'Unit kerja yang dipilih tidak valid.',
        ]);

        if ($validated['role'] === 'divisi') {
            $allowedDivisions = Division::whereIn('division_code', ['MEDIK', 'RAWAT', 'PENUNJANG_DIKLIT', 'YAN', 'PENUNJANG'])
                ->pluck('id')
                ->toArray();

            if (!in_array((int)$validated['division_id'], $allowedDivisions)) {
                return back()->withErrors(['division_id' => 'Bidang pengusul pengadaan harus berasal dari Pelayanan Medik, Keperawatan, atau Penunjang Medik & Diklit.'])->withInput();
            }

            if (!empty($validated['unit_id'])) {
                $unitBelongs = \App\Models\Unit::where('id', $validated['unit_id'])
                    ->where('division_id', $validated['division_id'])
                    ->exists();
                if (!$unitBelongs) {
                    return back()->withErrors(['unit_id' => 'Unit kerja yang dipilih tidak sesuai dengan bidang yang dipilih.'])->withInput();
                }
            }
        }

        $userData = [
            'name' => $validated['name'],
            'nip' => $validated['nip'] ?? null,
            'email' => $validated['email'],
            'position' => $validated['position'] ?? null,
            'phone' => $validated['phone'] ?? null,
            'is_active' => $request->has('is_active') ? (bool)$request->is_active : $user->is_active,
            'role' => $validated['role'],
            'division_id' => $validated['role'] === 'divisi' ? $validated['division_id'] : ($validated['division_id'] ?? null),
            'unit_id' => $validated['role'] === 'divisi' ? $validated['unit_id'] : ($validated['unit_id'] ?? null),
        ];

        if (!empty($validated['password'])) {
            $userData['password'] = Hash::make($validated['password']);
        }

        $user->update($userData);

        return redirect()->route('users.index')
            ->with('success', "Data pengguna {$user->name} berhasil diperbarui.");
    }

    /**
     * Toggle active status of a user.
     */
    public function toggleStatus(User $user): RedirectResponse
    {
        if ($user->id === auth()->id()) {
            return back()->with('error', 'Anda tidak dapat menonaktifkan akun Anda sendiri.');
        }

        $user->update([
            'is_active' => !$user->is_active,
        ]);

        $statusLabel = $user->is_active ? 'diaktifkan' : 'dinonaktifkan';

        return back()->with('success', "Akun pengguna {$user->name} berhasil {$statusLabel}.");
    }

    /**
     * Remove the specified user from storage.
     */
    public function destroy(User $user): RedirectResponse
    {
        if ($user->id === auth()->id()) {
            return back()->with('error', 'Anda tidak dapat menghapus akun Anda sendiri saat sedang aktif login.');
        }

        $name = $user->name;
        $user->delete();

        return redirect()->route('users.index')
            ->with('success', "Akun pengguna {$name} telah berhasil dihapus.");
    }
}

