<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Division;
use App\Models\Requisition;
use App\Models\Unit;
use App\Models\User;
use App\Services\AuditLogService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    /**
     * Display a listing of all users across the hospital.
     */
    public function index(Request $request): Response
    {
        $users = User::with(['division:id,name,division_code', 'unit:id,name,unit_code'])
            ->orderBy('name')
            ->get();

        $divisions = Division::with(['units' => fn ($q) => $q->orderBy('name')])
            ->orderBy('name')
            ->get();

        return Inertia::render('SuperAdmin/Users/Index', [
            'users' => $users,
            'divisions' => $divisions,
            'success' => session('success'),
            'error' => session('error'),
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
            'nik' => ['nullable', 'string', 'max:20', 'unique:users,nik'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'position' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:30'],
            'is_active' => ['nullable', 'boolean'],
            'password' => ['required', Password::defaults()],
            'role' => ['required', 'string', 'in:super_admin,admin,divisi,perencanaan,keuangan'],
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
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'nip' => $validated['nip'] ?? null,
            'nik' => $validated['nik'] ?? null,
            'email' => $validated['email'],
            'position' => $validated['position'] ?? null,
            'phone' => $validated['phone'] ?? null,
            'is_active' => $request->has('is_active') ? (bool) $request->is_active : true,
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
            'division_id' => $validated['role'] === 'divisi' ? $validated['division_id'] : ($validated['division_id'] ?? null),
            'unit_id' => $validated['role'] === 'divisi' ? $validated['unit_id'] : ($validated['unit_id'] ?? null),
        ]);

        AuditLogService::log(
            'USERS',
            'CREATE_USER',
            "Super Admin menambahkan akun pengguna: {$user->name} ({$user->role})",
            null,
            $user->only(['id', 'name', 'email', 'role', 'nip', 'nik'])
        );

        return redirect()->route('superadmin.users.index')
            ->with('success', "Akun pengguna {$user->name} berhasil dibuat.");
    }

    /**
     * Update the specified user in storage.
     */
    public function update(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'nip' => ['nullable', 'string', 'max:30', Rule::unique('users')->ignore($user->id)],
            'nik' => ['nullable', 'string', 'max:20', Rule::unique('users')->ignore($user->id)],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'position' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:30'],
            'is_active' => ['nullable', 'boolean'],
            'password' => ['nullable', Password::defaults()],
            'role' => ['required', 'string', 'in:super_admin,admin,divisi,perencanaan,keuangan'],
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
        ]);

        $before = $user->only(['name', 'email', 'role', 'nip', 'nik', 'is_active', 'position']);

        $userData = [
            'name' => $validated['name'],
            'nip' => $request->has('nip') ? ($validated['nip'] ?? null) : $user->nip,
            'nik' => $request->has('nik') ? ($validated['nik'] ?? null) : $user->nik,
            'email' => $validated['email'],
            'position' => $request->has('position') ? ($validated['position'] ?? null) : $user->position,
            'phone' => $request->has('phone') ? ($validated['phone'] ?? null) : $user->phone,
            'is_active' => $request->has('is_active') ? (bool) $request->is_active : $user->is_active,
            'role' => $validated['role'],
            'division_id' => $validated['role'] === 'divisi' ? $validated['division_id'] : ($validated['division_id'] ?? null),
            'unit_id' => $validated['role'] === 'divisi' ? $validated['unit_id'] : ($validated['unit_id'] ?? null),
        ];

        if (! empty($validated['password'])) {
            $userData['password'] = Hash::make($validated['password']);
        }

        $user->update($userData);

        AuditLogService::log(
            'USERS',
            'UPDATE_USER',
            "Super Admin memperbarui data pengguna: {$user->name}",
            $before,
            $user->only(['name', 'email', 'role', 'nip', 'nik', 'is_active', 'position'])
        );

        return redirect()->route('superadmin.users.index')
            ->with('success', "Data pengguna {$user->name} berhasil diperbarui.");
    }

    /**
     * Emergency reset password for a user.
     */
    public function resetPassword(Request $request, User $user): RedirectResponse
    {
        $request->validate([
            'password' => ['required', Password::defaults()],
        ]);

        $user->update([
            'password' => Hash::make($request->password),
        ]);

        AuditLogService::log(
            'AUTH',
            'RESET_PASSWORD',
            "Super Admin melakukan reset kata sandi darurat untuk akun: {$user->name} ({$user->email})"
        );

        return back()->with('success', "Kata sandi akun {$user->name} berhasil direset.");
    }

    /**
     * Toggle active status of a user.
     */
    public function toggleStatus(User $user): RedirectResponse
    {
        if ($user->id === Auth::id()) {
            return back()->with('error', 'Anda tidak dapat menonaktifkan akun Anda sendiri.');
        }

        $user->update([
            'is_active' => ! $user->is_active,
        ]);

        $statusLabel = $user->is_active ? 'diaktifkan' : 'dinonaktifkan';

        AuditLogService::log(
            'USERS',
            'TOGGLE_STATUS',
            "Super Admin mengubah status akun {$user->name} menjadi {$statusLabel}"
        );

        return back()->with('success', "Akun pengguna {$user->name} berhasil {$statusLabel}.");
    }

    /**
     * Remove the specified user from storage.
     */
    public function destroy(User $user): RedirectResponse
    {
        if ($user->id === Auth::id()) {
            return back()->with('error', 'Anda tidak dapat menghapus akun Anda sendiri saat sedang aktif login.');
        }

        $hasRequisitions = Requisition::where('user_id', $user->id)
            ->orWhere('verified_by_perencanaan_id', $user->id)
            ->orWhere('approved_by_keuangan_id', $user->id)
            ->exists();

        if ($hasRequisitions) {
            return back()->with('error', 'Tidak dapat menghapus akun pengguna karena memiliki riwayat usulan belanja atau jejak verifikasi audit. Silakan nonaktifkan akun sebagai gantinya.');
        }

        $name = $user->name;
        $deletedData = $user->only(['id', 'name', 'email', 'role', 'nip', 'nik']);
        $user->delete();

        AuditLogService::log(
            'USERS',
            'DELETE_USER',
            "Super Admin menghapus akun pengguna: {$name}",
            $deletedData,
            null
        );

        return redirect()->route('superadmin.users.index')
            ->with('success', "Akun pengguna {$name} telah berhasil dihapus.");
    }
}
