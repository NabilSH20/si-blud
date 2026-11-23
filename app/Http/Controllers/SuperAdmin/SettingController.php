<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\SystemSetting;
use App\Services\AuditLogService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class SettingController extends Controller
{
    /**
     * Display the system settings page.
     */
    public function index(): Response
    {
        $settings = SystemSetting::with('updatedByUser:id,name')
            ->orderBy('group_name')
            ->orderBy('id')
            ->get();

        $grouped = $settings->groupBy('group_name');

        return Inertia::render('SuperAdmin/Settings/Index', [
            'settings' => $settings,
            'grouped_settings' => $grouped,
            'success' => session('success'),
        ]);
    }

    /**
     * Update system settings.
     */
    public function update(Request $request): RedirectResponse
    {
        $settingsInput = $request->input('settings', $request->except(['_token', 'emergency_reason']));

        if (! is_array($settingsInput) || empty($settingsInput)) {
            return back()->with('error', 'Tidak ada data pengaturan yang dikirim.');
        }

        $before = SystemSetting::pluck('value', 'key_name')->toArray();

        foreach ($settingsInput as $key => $value) {
            SystemSetting::set($key, is_scalar($value) ? (string) $value : $value, Auth::id());
        }

        $after = SystemSetting::pluck('value', 'key_name')->toArray();

        AuditLogService::log(
            'SETTINGS',
            'SETTING_UPDATE',
            'Super Admin memperbarui konfigurasi dokumen cetak & pejabat penandatangan',
            $before,
            $after
        );

        return back()->with('success', 'Pengaturan sistem & dokumen cetak berhasil disimpan.');
    }
}
