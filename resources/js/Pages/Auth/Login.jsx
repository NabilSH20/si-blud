import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function Login({ status, canResetPassword, captchaSvg }) {
    const [showPassword, setShowPassword] = useState(false);
    const [currentCaptchaSvg, setCurrentCaptchaSvg] = useState(captchaSvg);
    const [isRefreshingCaptcha, setIsRefreshingCaptcha] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        captcha: '',
        remember: false,
    });

    const handleRefreshCaptcha = async () => {
        try {
            setIsRefreshingCaptcha(true);
            const response = await fetch(route('captcha.refresh'));
            const json = await response.json();
            if (json.captchaSvg) {
                setCurrentCaptchaSvg(json.captchaSvg);
                setData('captcha', '');
            }
        } catch (err) {
            console.error('Gagal memperbarui captcha:', err);
        } finally {
            setIsRefreshingCaptcha(false);
        }
    };

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
            onError: () => {
                handleRefreshCaptcha();
            },
        });
    };

    return (
        <GuestLayout wide={true}>
            <Head title="Masuk - E-BLUD RSJ Tampan" />

            <div className="mx-auto max-w-4xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-900/5 grid grid-cols-1 lg:grid-cols-12">
                {/* Left Side: Identitas RSJ Tampan (Sederhana, Bersih & Elegan) */}
                <div className="hidden lg:col-span-5 lg:flex lg:flex-col lg:justify-between bg-slate-50 p-8 sm:p-10 border-r border-slate-200">
                    <div className="space-y-6">
                        {/* Pemerintah Provinsi Riau Badge */}
                        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 border border-emerald-200">
                            <span className="h-2 w-2 rounded-full bg-emerald-600" />
                            Pemerintah Provinsi Riau
                        </div>

                        {/* Logo & Institusi */}
                        <div className="space-y-3">
                            <div className="inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-white p-2.5 shadow-xs border border-slate-200">
                                <img
                                    src="/images/logo-vertikal-rsj.png"
                                    alt="Logo RSJ Tampan"
                                    className="h-full w-auto object-contain"
                                />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                                    E-BLUD <span className="text-emerald-700">RSJ Tampan</span>
                                </h1>
                                <p className="text-xs font-semibold text-slate-600 mt-0.5">
                                    Rumah Sakit Jiwa Tampan
                                </p>
                            </div>
                        </div>

                        {/* Keterangan Singkat */}
                        <p className="text-xs text-slate-600 leading-relaxed">
                            Sistem Informasi Perencanaan Kebutuhan (RBA) dan Pengelolaan Anggaran Belanja BLUD.
                        </p>
                    </div>

                    {/* Bottom Info */}
                    <div className="pt-6 border-t border-slate-200 text-xs font-medium text-slate-500 flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        <span>Portal Resmi Pegawai & Staf RSJ</span>
                    </div>
                </div>

                {/* Right Side: Form Login Sederhana */}
                <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center bg-white">
                    {/* Header Mobile */}
                    <div className="mb-6 flex flex-col items-center text-center lg:hidden">
                        <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-xl bg-slate-50 p-2 border border-slate-200">
                            <img
                                src="/images/logo-vertikal-rsj.png"
                                alt="Logo RSJ Tampan"
                                className="h-full w-auto object-contain"
                            />
                        </div>
                        <h2 className="text-lg font-bold text-slate-900">
                            E-BLUD <span className="text-emerald-700">RSJ Tampan</span>
                        </h2>
                        <p className="text-xs text-slate-500">
                            Rumah Sakit Jiwa Tampan Provinsi Riau
                        </p>
                    </div>

                    {/* Form Title */}
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                            Masuk ke Akun
                        </h2>
                        <p className="mt-1 text-xs text-slate-500">
                            Silakan masukkan akun kedinasan Anda untuk melanjutkan.
                        </p>
                    </div>

                    {/* Status Message */}
                    {status && (
                        <div className="mb-5 flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-medium text-emerald-800">
                            <svg className="h-4 w-4 shrink-0 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                            <span>{status}</span>
                        </div>
                    )}

                    {/* Form Fields */}
                    <form onSubmit={submit} className="space-y-4">
                        {/* Email atau NIP */}
                        <div>
                            <label htmlFor="email" className="mb-1.5 block text-xs font-semibold text-slate-700">
                                Email atau NIP
                            </label>
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                                    </svg>
                                </div>
                                <input
                                    id="email"
                                    type="text"
                                    name="email"
                                    value={data.email}
                                    autoComplete="username"
                                    autoFocus
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="nama@rsjtampan.riau.go.id atau NIP"
                                    className="block w-full rounded-xl border border-slate-300 bg-white pl-10 pr-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                                />
                            </div>
                            <InputError message={errors.email} className="mt-1.5" />
                        </div>

                        {/* Kata Sandi */}
                        <div>
                            <label htmlFor="password" className="mb-1.5 block text-xs font-semibold text-slate-700">
                                Kata Sandi
                            </label>
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                                    </svg>
                                </div>
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={data.password}
                                    autoComplete="current-password"
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="••••••••"
                                    className="block w-full rounded-xl border border-slate-300 bg-white pl-10 pr-10 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    tabIndex={-1}
                                    aria-label={showPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                                >
                                    {showPassword ? (
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                        </svg>
                                    ) : (
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                            <InputError message={errors.password} className="mt-1.5" />
                        </div>

                        {/* Kode Captcha */}
                        <div>
                            <label htmlFor="captcha" className="mb-1.5 block text-xs font-semibold text-slate-700">
                                Kode Captcha
                            </label>
                            <div className="flex items-center gap-2">
                                {/* Visual Captcha Display */}
                                <div
                                    className="h-10 w-32 shrink-0 rounded-xl overflow-hidden border border-slate-300 bg-slate-50 flex items-center justify-center select-none"
                                    dangerouslySetInnerHTML={{ __html: currentCaptchaSvg || '' }}
                                />

                                {/* Refresh Button */}
                                <button
                                    type="button"
                                    onClick={handleRefreshCaptcha}
                                    disabled={isRefreshingCaptcha}
                                    title="Ganti kode captcha"
                                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-300 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 text-slate-600 hover:text-emerald-700 transition active:scale-95 cursor-pointer disabled:opacity-50"
                                >
                                    <svg
                                        className={`h-4 w-4 ${isRefreshingCaptcha ? 'animate-spin text-emerald-600' : ''}`}
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={2}
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                                        />
                                    </svg>
                                </button>

                                {/* Input Code */}
                                <input
                                    id="captcha"
                                    type="text"
                                    name="captcha"
                                    value={data.captcha}
                                    maxLength={5}
                                    onChange={(e) => setData('captcha', e.target.value.toUpperCase())}
                                    placeholder="Ketik kode"
                                    className="block w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-center font-mono text-sm font-bold uppercase tracking-widest text-slate-900 placeholder:text-slate-400 placeholder:normal-case placeholder:font-normal placeholder:tracking-normal transition focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                                />
                            </div>
                            <InputError message={errors.captcha} className="mt-1.5" />
                        </div>

                        {/* Ingat Saya & Lupa Kata Sandi (1 Baris Rapi) */}
                        <div className="flex items-center justify-between pt-1">
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                                <Checkbox
                                    name="remember"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="rounded-md text-emerald-600 border-slate-300 focus:ring-emerald-500 h-4 w-4"
                                />
                                <span className="text-xs text-slate-600">
                                    Ingat saya
                                </span>
                            </label>

                            {canResetPassword && (
                                <Link
                                    href={route('password.request')}
                                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition hover:underline"
                                >
                                    Lupa sandi?
                                </Link>
                            )}
                        </div>

                        {/* Submit Button */}
                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 py-2.5 text-sm font-bold text-white shadow-sm transition-colors disabled:opacity-60 cursor-pointer"
                            >
                                {processing ? (
                                    <>
                                        <svg className="h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        <span>Memproses...</span>
                                    </>
                                ) : (
                                    <span>Masuk</span>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </GuestLayout>
    );
}
