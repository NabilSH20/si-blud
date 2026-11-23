<?php

namespace App\Http\Middleware;

use App\Models\FiscalYear;
use App\Services\AuditLogService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckFiscalYearLock
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Lewatkan method read-only
        if (in_array($request->method(), ['GET', 'HEAD', 'OPTIONS'])) {
            return $next($request);
        }

        $activeYear = (int) session('active_year', date('Y'));
        $fiscalYear = FiscalYear::where('year', $activeYear)->first();

        if ($fiscalYear && $fiscalYear->is_locked) {
            // Izinkan jika Super Admin dengan alasan darurat
            if ($request->user()?->isSuperAdmin() && $request->filled('emergency_reason')) {
                AuditLogService::log(
                    'FISCAL_YEAR',
                    'EMERGENCY_OVERRIDE',
                    "Super Admin melakukan tindakan darurat pada tahun anggaran terkunci ({$activeYear}): " . $request->input('emergency_reason'),
                    null,
                    $request->except(['password', 'password_confirmation', '_token'])
                );

                return $next($request);
            }

            if ($request->expectsJson() || $request->header('X-Inertia')) {
                return back()->with('error', "Tahun Anggaran {$activeYear} telah DITUTUP (Terkunci). Transaksi dan usulan baru tidak diizinkan.");
            }

            abort(403, "Tahun Anggaran {$activeYear} telah DITUTUP (Terkunci).");
        }

        return $next($request);
    }
}
