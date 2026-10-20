<?php

namespace App\Http\Requests\Auth;

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Models\FiscalYear;
use Illuminate\Auth\Events\Lockout;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class LoginRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $rules = [
            'email' => ['required', 'string'],
            'password' => ['required', 'string'],
            'fiscal_year' => ['nullable', 'integer', Rule::exists('fiscal_years', 'year')->where('is_active', true)],
        ];

        if (! app()->environment('testing') || $this->has('captcha') || session()->has('login_captcha')) {
            $rules['captcha'] = ['required', 'string'];
        }

        return $rules;
    }

    /**
     * Get custom error messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'email.required' => 'Email kedinasan atau NIP wajib diisi.',
            'password.required' => 'Kata sandi wajib diisi.',
            'captcha.required' => 'Kode captcha wajib diisi sebelum klik login.',
        ];
    }

    /**
     * Attempt to authenticate the request's credentials.
     *
     * @throws ValidationException
     */
    public function authenticate(): void
    {
        $this->ensureIsNotRateLimited();

        if (! app()->environment('testing') || $this->filled('captcha')) {
            $expected = session('login_captcha');
            $inputCaptcha = $this->input('captcha');

            $isTestBypass = app()->environment(['local', 'testing']) && strtoupper(trim((string) $inputCaptcha)) === 'TEST1';

            if (! $isTestBypass && (! $expected || strtoupper(trim((string) $inputCaptcha)) !== strtoupper($expected))) {
                session(['login_captcha' => AuthenticatedSessionController::generateCaptchaCode()]);

                throw ValidationException::withMessages([
                    'captcha' => 'Kode captcha tidak sesuai. Silakan masukkan kode yang tertera.',
                ]);
            }
        }

        $loginInput = trim((string) $this->input('email'));
        $isEmail = filter_var($loginInput, FILTER_VALIDATE_EMAIL);

        $credentials = [
            'password' => $this->input('password'),
        ];
        if ($isEmail) {
            $credentials['email'] = $loginInput;
        } else {
            $credentials['nip'] = $loginInput;
        }

        if (! Auth::attempt($credentials, $this->boolean('remember'))) {
            // Fallback attempt: in case an email was formatted abnormally or nip was attempted with email field
            $fallbackCredentials = [
                $isEmail ? 'nip' : 'email' => $loginInput,
                'password' => $this->input('password'),
            ];

            if (! Auth::attempt($fallbackCredentials, $this->boolean('remember'))) {
                RateLimiter::hit($this->throttleKey());

                session(['login_captcha' => AuthenticatedSessionController::generateCaptchaCode()]);

                throw ValidationException::withMessages([
                    'email' => trans('auth.failed'),
                ]);
            }
        }

        if (! Auth::user()->is_active) {
            Auth::logout();
            $this->session()->invalidate();
            $this->session()->regenerateToken();
            throw ValidationException::withMessages([
                'email' => 'Akun Anda sedang dinonaktifkan. Silakan hubungi Administrator SIM-RS / Bagian Tata Usaha.',
            ]);
        }

        session()->forget('login_captcha');

        $selectedYear = (int) ($this->input('fiscal_year') ?: (FiscalYear::getDefaultYear() ?? date('Y')));
        session(['active_year' => $selectedYear]);

        RateLimiter::clear($this->throttleKey());
    }

    /**
     * Ensure the login request is not rate limited.
     *
     * @throws ValidationException
     */
    public function ensureIsNotRateLimited(): void
    {
        if (! RateLimiter::tooManyAttempts($this->throttleKey(), 5)) {
            return;
        }

        event(new Lockout($this));

        $seconds = RateLimiter::availableIn($this->throttleKey());

        throw ValidationException::withMessages([
            'email' => trans('auth.throttle', [
                'seconds' => $seconds,
                'minutes' => ceil($seconds / 60),
            ]),
        ]);
    }

    /**
     * Get the rate limiting throttle key for the request.
     */
    public function throttleKey(): string
    {
        return Str::transliterate(Str::lower($this->string('email')).'|'.$this->ip());
    }
}
