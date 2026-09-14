import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import Modal from '@/Components/Modal';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function Login({ status, canResetPassword, captchaSvg, fiscalYears = [], defaultYear = 2026 }) {
    const [showPassword, setShowPassword] = useState(false);
    const [currentCaptchaSvg, setCurrentCaptchaSvg] = useState(captchaSvg);
    const [isRefreshingCaptcha, setIsRefreshingCaptcha] = useState(false);
    const [showHelpModal, setShowHelpModal] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        fiscal_year: defaultYear || 2026,
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
        <GuestLayout wide={false}>
            <Head title="Masuk - E-BLUD RS Jiwa Tampan" />

            {/* Single Centered Login Card (Sehat IndonesiaKu Style) */}
            <div className="w-full overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xl shadow-teal-950/5">
                {/* Card Title */}
                <div className="mb-6 text-center">
                    <h2 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight">
                        Selamat datang di E-BLUD RS Jiwa Tampan
                    </h2>
                </div>

                {/* Status Message */}
                {status && (
                    <div className="mb-5 flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-medium text-emerald-800">
                        <svg
                            className="h-4 w-4 shrink-0 text-emerald-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2.5}
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                        <span>{status}</span>
                    </div>
                )}

                {/* Login Form */}
                <form onSubmit={submit} className="space-y-4">
                    {/* Pilihan Akses Tahun Anggaran */}
                    <div>
                        <label htmlFor="fiscal_year" className="mb-1.5 block text-xs font-semibold text-slate-700">
                            Tahun Anggaran Akses
                        </label>
                        <div className="relative">
                            <select
                                id="fiscal_year"
                                name="fiscal_year"
                                value={data.fiscal_year}
                                onChange={(e) => setData('fiscal_year', e.target.value)}
                                className="block w-full appearance-none rounded-xl border border-slate-200 bg-[#edf4fc] px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition cursor-pointer"
                            >
                                {fiscalYears && fiscalYears.length > 0 ? (
                                    fiscalYears.map((fy) => (
                                        <option key={fy.year} value={fy.year}>
                                            Tahun Anggaran {fy.year} {fy.is_default ? '★ (Default)' : ''}
                                        </option>
                                    ))
                                ) : (
                                    <>
                                        <option value="2025">Tahun Anggaran 2025</option>
                                        <option value="2026">Tahun Anggaran 2026 ★ (Default)</option>
                                        <option value="2027">Tahun Anggaran 2027</option>
                                        <option value="2028">Tahun Anggaran 2028</option>
                                    </>
                                )}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                </svg>
                            </div>
                        </div>
                        <InputError message={errors.fiscal_year} className="mt-1.5" />
                    </div>

                    {/* Input Email / NIP */}
                    <div>
                        <label htmlFor="email" className="mb-1.5 block text-xs font-semibold text-slate-700">
                            Email
                        </label>
                        <input
                            id="email"
                            type="text"
                            name="email"
                            value={data.email}
                            autoComplete="username"
                            autoFocus
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="masukkan email atau NIP"
                            className="block w-full rounded-xl border border-slate-200 bg-[#edf4fc] px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition"
                        />
                        <InputError message={errors.email} className="mt-1.5" />
                    </div>

                    {/* Input Kata Sandi */}
                    <div>
                        <label htmlFor="password" className="mb-1.5 block text-xs font-semibold text-slate-700">
                            Kata sandi
                        </label>
                        <div className="relative">
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={data.password}
                                autoComplete="current-password"
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder="••••••••••••"
                                className="block w-full rounded-xl border border-slate-200 bg-[#edf4fc] pl-3.5 pr-10 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                tabIndex={-1}
                                aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
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

                    {/* Input Captcha (Exact 1-Line ASIK Layout: Input + Image + Refresh Icon) */}
                    <div>
                        <label htmlFor="captcha" className="mb-1.5 block text-xs font-semibold text-slate-700">
                            Captcha
                        </label>
                        <div className="flex items-center gap-2">
                            <input
                                id="captcha"
                                type="text"
                                name="captcha"
                                value={data.captcha}
                                maxLength={6}
                                onChange={(e) => setData('captcha', e.target.value.toUpperCase())}
                                placeholder="Masukkan captcha"
                                className="block flex-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 font-mono font-bold uppercase tracking-wider placeholder:text-slate-400 placeholder:normal-case placeholder:font-normal placeholder:tracking-normal focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition"
                            />

                            {/* Visual Captcha Display */}
                            <div
                                className="h-10 w-28 shrink-0 rounded-xl overflow-hidden border border-slate-200 bg-[#f8fafc] flex items-center justify-center select-none shadow-2xs"
                                dangerouslySetInnerHTML={{ __html: currentCaptchaSvg || '' }}
                            />

                            {/* Circular Refresh Icon Button */}
                            <button
                                type="button"
                                onClick={handleRefreshCaptcha}
                                disabled={isRefreshingCaptcha}
                                title="Ganti kode captcha"
                                className="flex h-10 w-8 shrink-0 items-center justify-center text-slate-500 hover:text-emerald-700 transition active:scale-90 cursor-pointer disabled:opacity-50"
                            >
                                <svg
                                    className={`h-5 w-5 ${isRefreshingCaptcha ? 'animate-spin text-emerald-600' : ''}`}
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
                        </div>
                        <InputError message={errors.captcha} className="mt-1.5" />
                    </div>

                    {/* Ingat Saya & Lupa Kata Sandi */}
                    <div className="flex items-center justify-between text-xs pt-0.5">
                        <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600 hover:text-slate-800">
                            <Checkbox
                                name="remember"
                                checked={data.remember}
                                onChange={(e) => setData('remember', e.target.checked)}
                                className="rounded-md text-emerald-600 border-slate-300 focus:ring-emerald-500 h-4 w-4"
                            />
                            <span>Ingat saya</span>
                        </label>

                        {canResetPassword && (
                            <Link
                                href={route('password.request')}
                                className="font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
                            >
                                Lupa sandi?
                            </Link>
                        )}
                    </div>

                    {/* Submit Button (Masuk) */}
                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 py-2.5 text-sm font-bold text-white shadow-xs transition cursor-pointer disabled:opacity-60"
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

                    {/* Butuh bantuan ? Kirim aduan (Sehat IndonesiaKu Reference Style) */}
                    <div className="pt-3 text-center text-xs text-slate-600">
                        <span>Butuh bantuan ? </span>
                        <button
                            type="button"
                            onClick={() => setShowHelpModal(true)}
                            className="font-semibold text-teal-600 hover:text-teal-700 hover:underline cursor-pointer"
                        >
                            Kirim aduan
                        </button>
                    </div>
                </form>
            </div>

            {/* Modal Kirim Aduan / Bantuan Layanan IT RSJ Tampan */}
            <Modal show={showHelpModal} onClose={() => setShowHelpModal(false)} maxWidth="md">
                <div className="p-6">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-slate-800">Layanan Bantuan & Aduan</h3>
                                <p className="text-[11px] text-slate-500">Sistem Informasi E-BLUD RS Jiwa Tampan</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowHelpModal(false)}
                            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
                        >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="space-y-3.5 text-xs text-slate-600">
                        <p>
                            Jika Anda mengalami kendala saat masuk akun, lupa kata sandi, atau memerlukan akses unit baru, silakan hubungi tim Helpdesk IT RSJ Tampan melalui saluran resmi berikut:
                        </p>

                        <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-3.5 space-y-2.5">
                            <div className="flex items-center gap-2.5">
                                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white font-bold text-xs">
                                    💬
                                </span>
                                <div>
                                    <span className="font-bold text-slate-800 block">WhatsApp Helpdesk IT</span>
                                    <span className="text-[11px] text-slate-500 font-mono">+62 812-7500-0909 (Jam Kerja)</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2.5 border-t border-emerald-100/80 pt-2">
                                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-600 text-white font-bold text-xs">
                                    ✉️
                                </span>
                                <div>
                                    <span className="font-bold text-slate-800 block">Email Layanan Kedinasan</span>
                                    <span className="text-[11px] text-slate-500 font-mono">it.rsjtampan@riau.go.id</span>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-xl bg-slate-50 p-3 text-[11px] text-slate-500 border border-slate-200/60">
                            <strong>Jam Operasional:</strong> Senin - Jumat, pukul 08.00 - 16.00 WIB. Sub Bagian Perencanaan & IT, Lantai 2 Gedung Administrasi RSJ Tampan.
                        </div>
                    </div>

                    <div className="mt-5 flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
                        <button
                            type="button"
                            onClick={() => setShowHelpModal(false)}
                            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                        >
                            Tutup
                        </button>
                        <a
                            href="https://wa.me/6281275000909?text=Halo%20Tim%20IT%20RSJ%20Tampan,%20saya%20membutuhkan%20bantuan%20terkait%20akun%20E-BLUD"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-xs font-bold text-white transition shadow-xs"
                        >
                            <span>Hubungi via WhatsApp</span>
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                            </svg>
                        </a>
                    </div>
                </div>
            </Modal>
        </GuestLayout>
    );
}
