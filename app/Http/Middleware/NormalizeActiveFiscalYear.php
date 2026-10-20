<?php

namespace App\Http\Middleware;

use App\Models\FiscalYear;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class NormalizeActiveFiscalYear
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->hasSession()) {
            if (! FiscalYear::exists()) {
                return $next($request);
            }

            $currentYear = session('active_year');

            if ($currentYear !== null) {
                $isActive = FiscalYear::where('year', (int) $currentYear)
                    ->where('is_active', true)
                    ->exists();

                if (! $isActive) {
                    $defaultYear = FiscalYear::getDefaultYear();
                    if ($defaultYear) {
                        session(['active_year' => (int) $defaultYear]);
                    }
                } else {
                    // Pastikan selalu integer
                    if (! is_int($currentYear)) {
                        session(['active_year' => (int) $currentYear]);
                    }
                }
            }
        }

        return $next($request);
    }
}
