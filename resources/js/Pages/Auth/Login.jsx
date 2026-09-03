import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Masuk - E-Req RSJ Tampan" />

            <div className="mb-6">
                <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                    Masuk ke Akun
                </h2>
                <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                    Silakan masukkan email dan kata sandi untuk mengakses portal RSJ Tampan.
                </p>
            </div>

            {status && (
                <div className="mb-5 flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs font-medium text-emerald-800">
                    <svg className="h-4 w-4 shrink-0 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{status}</span>
                </div>
            )}

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <label htmlFor="email" className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">
                        Alamat Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        autoComplete="username"
                        autoFocus
                        onChange={(e) => setData('email', e.target.value)}
                        placeholder="nama@rsjtampan.riau.go.id"
                        className="block w-full rounded-xl border-slate-200 text-sm shadow-2xs transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-emerald-500"
                    />
                    <InputError message={errors.email} className="mt-1.5" />
                </div>

                <div>
                    <div className="mb-1.5 flex items-center justify-between">
                        <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                            Kata Sandi
                        </label>
                        {canResetPassword && (
                            <Link
                                href={route('password.request')}
                                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition"
                            >
                                Lupa sandi?
                            </Link>
                        )}
                    </div>
                    <input
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                        placeholder="••••••••"
                        className="block w-full rounded-xl border-slate-200 text-sm shadow-2xs transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-emerald-500"
                    />
                    <InputError message={errors.password} className="mt-1.5" />
                </div>

                <div className="pt-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) =>
                                setData('remember', e.target.checked)
                            }
                            className="rounded text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="text-xs font-medium text-slate-600">
                            Ingat saya di perangkat ini
                        </span>
                    </label>
                </div>

                <div className="pt-3">
                    <button
                        type="submit"
                        disabled={processing}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50"
                    >
                        {processing ? (
                            <>
                                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Memproses Masuk...
                            </>
                        ) : (
                            'Masuk ke Sistem'
                        )}
                    </button>
                </div>
            </form>
        </GuestLayout>
    );
}
