<?php

namespace App\Http\Controllers\Admin;

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
     * Store a newly created user in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        /** @var User|null $currentUser */
        $currentUser = Auth::user();
        abort_unless($currentUser && in_array($currentUser->role, ['admin', 'super_admin']), 403, 'Akses ditolak.');

        $isSuperAdmin = $currentUser->role === 'super_admin';
        $allowedRoles = $isSuperAdmin
            ? ['super_admin', 'admin', 'divisi', 'perencanaan', 'keuangan']
            : ['admin', 'divisi', 'perencanaan', 'keuangan'];

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'nip' => ['nullable', 'string', 'max:30', 'unique:users,nip'],
            'nik' => ['nullable', 'string', 'max:20', 'unique:users,nik'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'position' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:30'],
            'is_active' => ['nullable', 'boolean'],
            'password' => ['required', Password::defaults()],
            'role' => ['required', 'string', Rule::in($allowedRoles)],
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
            'nik.unique' => 'NIK ini sudah terdaftar untuk pegawai lain.',
            'email.required' => 'Alamat email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'email.unique' => 'Email ini sudah terdaftar di sistem.',
            'password.required' => 'Kata sandi wajib diisi.',
            'role.required' => 'Peran (role) pengguna wajib dipilih.',
            'role.in' => 'Peran pengguna tidak valid.',
            'division_id.required' => 'Pengguna dengan peran Divisi / Pemohon wajib memilih Bidang Pengusul.',
            'division_id.exists' => 'Bidang yang dipilih tidak valid.',
            'unit_id.required' => 'Pengguna dengan peran Divisi / Pemohon wajib memilih Unit kerja.',
            'unit_id.exists' => 'Unit kerja yang dipilih tidak valid.',
        ]);

        if ($validated['role'] === 'divisi') {
            $allowedDivisions = Division::where('group', 'Pelayanan_Keperawatan')
                ->pluck('id')
                ->toArray();

            if (! in_array((int) $validated['division_id'], $allowedDivisions)) {
                return back()->withErrors(['division_id' => 'Bidang pengusul pengadaan harus berasal dari Pelayanan Medik, Keperawatan, atau Penunjang Medik & Diklit.'])->withInput();
            }

            if (! empty($validated['unit_id'])) {
                $unitBelongs = Unit::where('id', $validated['unit_id'])
                    ->where('division_id', $validated['division_id'])
                    ->exists();
                if (! $unitBelongs) {
                    return back()->withErrors(['unit_id' => 'Unit kerja yang dipilih tidak sesuai dengan bidang yang dipilih.'])->withInput();
                }
            }
        }

        $createdUser = User::create([
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
            "Menambahkan pengguna baru: {$createdUser->name} ({$createdUser->role})",
            null,
            $createdUser->only(['id', 'name', 'email', 'role', 'nip', 'nik'])
        );

        return redirect()->route('users.index')
            ->with('success', "Pengguna {$validated['name']} berhasil ditambahkan.");
    }

    /**
     * Update the specified user in storage.
     */
    public function update(Request $request, User $user): RedirectResponse
    {
        /** @var User|null $currentUser */
        $currentUser = Auth::user();
        abort_unless($currentUser && in_array($currentUser->role, ['admin', 'super_admin']), 403, 'Akses ditolak.');

        $isSuperAdmin = $currentUser->role === 'super_admin';

        if ($user->isSuperAdmin() && ! $isSuperAdmin) {
            abort(403, 'Akses ditolak: Anda tidak memiliki wewenang mengelola akun Super Admin.');
        }

        $allowedRoles = $isSuperAdmin
            ? ['super_admin', 'admin', 'divisi', 'perencanaan', 'keuangan']
            : ['admin', 'divisi', 'perencanaan', 'keuangan'];

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'nip' => ['nullable', 'string', 'max:30', Rule::unique('users')->ignore($user->id)],
            'nik' => ['nullable', 'string', 'max:20', Rule::unique('users')->ignore($user->id)],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'position' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:30'],
            'is_active' => ['nullable', 'boolean'],
            'password' => ['nullable', Password::defaults()],
            'role' => ['required', 'string', Rule::in($allowedRoles)],
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
            'nik.unique' => 'NIK ini sudah terdaftar untuk pegawai lain.',
            'email.required' => 'Alamat email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'email.unique' => 'Email ini sudah digunakan oleh akun lain.',
            'role.required' => 'Peran (role) pengguna wajib dipilih.',
            'role.in' => 'Peran pengguna tidak valid.',
            'division_id.required' => 'Pengguna dengan peran Divisi / Pemohon wajib memilih Bidang Pengusul.',
            'division_id.exists' => 'Bidang yang dipilih tidak valid.',
            'unit_id.required' => 'Pengguna dengan peran Divisi / Pemohon wajib memilih Unit kerja.',
            'unit_id.exists' => 'Unit kerja yang dipilih tidak valid.',
        ]);

        if ($user->id === Auth::id() && $validated['role'] !== $user->role) {
            return back()->with('error', 'Anda tidak dapat mengubah role akun Anda sendiri.')->withInput();
        }

        if ($validated['role'] === 'divisi') {
            $allowedDivisions = Division::where('group', 'Pelayanan_Keperawatan')
                ->pluck('id')
                ->toArray();

            if (! in_array((int) $validated['division_id'], $allowedDivisions)) {
                return back()->withErrors(['division_id' => 'Bidang pengusul pengadaan harus berasal dari Pelayanan Medik, Keperawatan, atau Penunjang Medik & Diklit.'])->withInput();
            }

            if (! empty($validated['unit_id'])) {
                $unitBelongs = Unit::where('id', $validated['unit_id'])
                    ->where('division_id', $validated['division_id'])
                    ->exists();
                if (! $unitBelongs) {
                    return back()->withErrors(['unit_id' => 'Unit kerja yang dipilih tidak sesuai dengan bidang yang dipilih.'])->withInput();
                }
            }
        }

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

        $before = $user->only(['name', 'email', 'role', 'nip', 'nik', 'is_active']);
        $user->update($userData);

        AuditLogService::log(
            'USERS',
            'UPDATE_USER',
            "Memperbarui profil akun pengguna: {$user->name}",
            $before,
            $user->only(['name', 'email', 'role', 'nip', 'nik', 'is_active'])
        );

        return redirect()->route('users.index')
            ->with('success', "Data pengguna {$user->name} berhasil diperbarui.");
    }

    /**
     * Toggle active status of a user.
     */
    public function toggleStatus(User $user): RedirectResponse
    {
        /** @var User|null $currentUser */
        $currentUser = Auth::user();
        abort_unless($currentUser && in_array($currentUser->role, ['admin', 'super_admin']), 403, 'Akses ditolak.');

        $isSuperAdmin = $currentUser->role === 'super_admin';

        if ($user->isSuperAdmin() && ! $isSuperAdmin) {
            abort(403, 'Akses ditolak: Anda tidak memiliki wewenang menonaktifkan akun Super Admin.');
        }

        if ($user->id === $currentUser->id) {
            return back()->with('error', 'Anda tidak dapat menonaktifkan akun Anda sendiri.');
        }

        $user->update([
            'is_active' => ! $user->is_active,
        ]);

        $statusLabel = $user->is_active ? 'diaktifkan' : 'dinonaktifkan';

        AuditLogService::log(
            'USERS',
            'TOGGLE_STATUS',
            "Mengubah status akun {$user->name} menjadi {$statusLabel}"
        );

        return back()->with('success', "Akun pengguna {$user->name} berhasil {$statusLabel}.");
    }

    /**
     * Remove the specified user from storage.
     */
    public function destroy(User $user): RedirectResponse
    {
        /** @var User|null $currentUser */
        $currentUser = Auth::user();
        abort_unless($currentUser && in_array($currentUser->role, ['admin', 'super_admin']), 403, 'Akses ditolak.');

        if ($user->isSuperAdmin()) {
            abort(403, 'Akses ditolak: Akun Super Admin dilindungi dan tidak dapat dihapus.');
        }

        if ($user->id === $currentUser->id) {
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
            "Menghapus akun pengguna: {$name}",
            $deletedData,
            null
        );

        return redirect()->route('users.index')
            ->with('success', "Akun pengguna {$name} telah berhasil dihapus.");
    }
}
