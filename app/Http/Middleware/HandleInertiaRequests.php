<?php

namespace App\Http\Middleware;

use App\Models\FiscalYear;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $activeYear = (int) session('active_year', function () {
            return class_exists(FiscalYear::class)
                ? FiscalYear::getDefaultYear()
                : (int) date('Y');
        });

        $activeFiscalYear = class_exists(FiscalYear::class)
            ? FiscalYear::where('year', $activeYear)->first()
            : null;

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
                'impersonator' => session()->has('impersonator_id')
                    ? \App\Models\User::select('id', 'name', 'email', 'role')->find(session('impersonator_id'))
                    : null,
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
            'active_year' => $activeYear,
            'is_active_year_locked' => $activeFiscalYear?->is_locked ?? false,
            'available_fiscal_years' => fn () => class_exists(FiscalYear::class)
                ? FiscalYear::getActiveYears()
                : [],
            'system_settings' => fn () => class_exists(\App\Models\SystemSetting::class)
                ? \App\Models\SystemSetting::getAllKeyValues()
                : [],
        ];
    }
}
