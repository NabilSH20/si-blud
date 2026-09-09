<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        $code = self::generateCaptchaCode();
        session(['login_captcha' => $code]);

        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
            'captchaSvg' => self::renderCaptchaSvg($code),
        ]);
    }

    /**
     * Refresh the captcha code and return SVG string in JSON.
     */
    public function refreshCaptcha(): JsonResponse
    {
        $code = self::generateCaptchaCode();
        session(['login_captcha' => $code]);

        return response()->json([
            'captchaSvg' => self::renderCaptchaSvg($code),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        return redirect($request->user()->dashboardPath());
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }

    /**
     * Generate a 5-character alphanumeric captcha code.
     */
    public static function generateCaptchaCode(): string
    {
        $chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
        $length = 5;
        $code = '';
        for ($i = 0; $i < $length; $i++) {
            $code .= $chars[random_int(0, strlen($chars) - 1)];
        }
        return $code;
    }

    /**
     * Render a lightweight SVG representation of the captcha code.
     */
    public static function renderCaptchaSvg(string $code): string
    {
        $width = 140;
        $height = 44;

        $lines = '';
        for ($i = 0; $i < 3; $i++) {
            $x1 = random_int(5, 30);
            $y1 = random_int(5, 39);
            $x2 = random_int(100, 135);
            $y2 = random_int(5, 39);
            $stroke = ['#059669', '#0d9488', '#10b981', '#64748b'][random_int(0, 3)];
            $lines .= "<line x1='{$x1}' y1='{$y1}' x2='{$x2}' y2='{$y2}' stroke='{$stroke}' stroke-width='1.5' stroke-dasharray='4,3' opacity='0.5'/>";
        }

        $letters = '';
        $colors = ['#065f46', '#047857', '#0f766e', '#1e293b', '#0f172a'];
        $charWidth = ($width - 24) / strlen($code);

        for ($i = 0; $i < strlen($code); $i++) {
            $char = $code[$i];
            $x = 14 + ($i * $charWidth) + random_int(-2, 2);
            $y = 30 + random_int(-2, 3);
            $rot = random_int(-15, 15);
            $color = $colors[$i % count($colors)];
            $letters .= "<text x='{$x}' y='{$y}' fill='{$color}' font-family='Arial, sans-serif' font-weight='900' font-size='22' transform='rotate({$rot}, {$x}, {$y})'>{$char}</text>";
        }

        return "<svg xmlns='http://www.w3.org/2000/svg' width='{$width}' height='{$height}' viewBox='0 0 {$width} {$height}' class='w-full h-full select-none'>
            <rect width='100%' height='100%' fill='#f8fafc' rx='8'/>
            <rect width='100%' height='100%' fill='none' stroke='#cbd5e1' stroke-width='1' rx='8'/>
            {$lines}
            {$letters}
        </svg>";
    }
}
