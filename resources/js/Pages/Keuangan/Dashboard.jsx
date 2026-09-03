import KeuanganLayout from '@/Layouts/KeuanganLayout';
import { Head, Link, usePage } from '@inertiajs/react';

const formatRupiah = (value) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(Number(value || 0));

export default function Dashboard({ budgetsCount, remainingTotal }) {
    const user = usePage().props.auth.user;

    return (
        <KeuanganLayout>
            <Head title="Dashboard Keuangan - E-Req RSJ Tampan" />

            {/* Hero Welcome Banner */}
            <div className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-700 p-6 text-white shadow-lg sm:p-8">
                <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />
                <div className="absolute -bottom-8 right-32 h-48 w-48 rounded-full bg-teal-400/20 blur-2xl pointer-events-none" />

                <div className="relative z-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
                    <div className="max-w-xl">
                        <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur-md text-emerald-100 ring-1 ring-white/20 mb-3">
                            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                            Portal Bagian Keuangan & Anggaran
                        </div>
                        <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
                            Selamat Datang, {user.name}!
                        </h1>
                        <p className="mt-2 text-sm text-emerald-100 leading-relaxed">
                            Pantau ketersediaan pagu rekening, verifikasi pembebanan anggaran requisition, dan kelola alokasi belanja rumah sakit.
                        </p>
                    </div>

                    <div className="flex shrink-0 gap-3">
                        <Link
                            href={route('budgets.index')}
                            className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-emerald-800 shadow-md transition-all hover:bg-emerald-50 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-white/80"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            Pagu Anggaran
                        </Link>
                    </div>
                </div>
            </div>

            {/* Metrics & Shortcuts Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {/* Metric Card: Total Pagu Anggaran */}
                <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                Total Rekening Pagu
                            </p>
                            <h3 className="mt-2 text-3xl font-extrabold text-slate-900">
                                {budgetsCount}
                            </h3>
                            <p className="mt-1 text-xs text-emerald-600 font-medium">
                                Kode Rekening Terdaftar
                            </p>
                        </div>
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-500/20 transition-transform group-hover:scale-105">
                            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 5.625c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Metric Card: Sisa Anggaran */}
                <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                    <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                Total Sisa Anggaran
                            </p>
                            <h3 className="mt-2 text-2xl font-extrabold text-emerald-700 truncate">
                                {formatRupiah(remainingTotal)}
                            </h3>
                            <p className="mt-1 text-xs text-slate-500 font-medium">
                                Siap dialokasikan untuk pengadaan
                            </p>
                        </div>
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 ring-1 ring-teal-500/20 transition-transform group-hover:scale-105">
                            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Quick Link Card: Kelola Pagu */}
                <Link
                    href={route('budgets.index')}
                    className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                >
                    <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 ring-1 ring-amber-500/20">
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                            </svg>
                        </div>
                        <div className="min-w-0 flex-1">
                            <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition">
                                Kelola Pagu Anggaran
                            </h4>
                            <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                                Tambah pagu rekening tahun berjalan dan kelola batas maksimal pengadaan barang.
                            </p>
                        </div>
                    </div>

                    <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-emerald-600">
                        <span>Buka Daftar Pagu</span>
                        <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                    </div>
                </Link>
            </div>
        </KeuanganLayout>
    );
}
