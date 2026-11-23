<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\AuditLogService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;

class ImpersonateController extends Controller
{
    /**
     * Start impersonating a target user.
     */
    public function start(User $user): RedirectResponse
    {
        if ($user->isSuperAdmin()) {
            return back()->with('error', 'Tidak dapat meng-impersonate sesama Super Admin.');
        }

        if ($user->id === Auth::id()) {
            return back()->with('error', 'Anda sudah login sebagai akun ini.');
        }

        // Simpan ID asli super admin di session
        session(['impersonator_id' => Auth::id()]);

        AuditLogService::log(
            'AUTH',
            'IMPERSONATE_START',
            "Super Admin memulai mode troubleshooting atas nama staf: {$user->name} ({$user->role})",
            null,
            ['target_user_id' => $user->id, 'target_user_name' => $user->name, 'target_role' => $user->role],
            $user->id
        );

        Auth::login($user);

        return redirect($user->dashboardPath())
            ->with('success', "Mode Troubleshooting Aktif: Anda sedang melihat tampilan sebagai {$user->name}.");
    }

    /**
     * Stop impersonating and return to Super Admin.
     */
    public function stop(): RedirectResponse
    {
        $impersonatorId = session('impersonator_id');

        if (! $impersonatorId) {
            return redirect('/');
        }

        Auth::loginUsingId($impersonatorId);
        session()->forget('impersonator_id');

        AuditLogService::log(
            'AUTH',
            'IMPERSONATE_STOP',
            'Super Admin mengakhiri mode troubleshooting dan kembali ke sesi utama'
        );

        return redirect()->route('superadmin.users.index')
            ->with('success', 'Kembali ke sesi Super Admin.');
    }
}
