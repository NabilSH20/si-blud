import PerencanaanLayout from '@/Layouts/PerencanaanLayout';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Dashboard({ itemsCount }) {
    const user = usePage().props.auth.user;

    return (
        <PerencanaanLayout>
            <Head title="Dashboard Perencanaan & Pengadaan - E-Req RSJ Tampan" />

            {/* Hero Welcome Banner */}
            <div className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-700 p-6 text-white shadow-lg sm:p-8">
                <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />
                <div className="absolute -bottom-8 right-32 h-48 w-48 rounded-full bg-teal-400/20 blur-2xl pointer-events-none" />

                <div className="relative z-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
                    <div className="max-w-xl">
                        <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur-md text-emerald-100 ring-1 ring-white/20 mb-3">
                            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                            Portal Perencanaan & Pengadaan Barang
                        </div>
                        <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
                            Selamat Datang, {user.name}!
                        </h1>
                        <p className="mt-2 text-sm text-emerald-100 leading-relaxed">
                            Standarisasi katalog kebutuhan logistik, kelola spesifikasi acuan barang, dan dukung efisiensi pengadaan di lingkungan RSJ Tampan.
                        </p>
                    </div>

                    <div className="flex shrink-0 gap-3">
                        <Link
                            href={route('items.index')}
                            className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-emerald-800 shadow-md transition-all hover:bg-emerald-50 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-white/80"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            Katalog Barang
                        </Link>
                    </div>
                </div>
            </div>

            {/* Metrics & Shortcuts Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {/* Metric Card: Total Barang */}
                <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                Katalog Standar
                            </p>
                            <h3 className="mt-2 text-3xl font-extrabold text-slate-900">
                                {itemsCount}
                            </h3>
                            <p className="mt-1 text-xs text-emerald-600 font-medium">
                                Barang Terstandarisasi
                            </p>
                        </div>
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-500/20 transition-transform group-hover:scale-105">
                            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Quick Link Card: Kelola Katalog */}
                <Link
                    href={route('items.index')}
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
                                Kelola Katalog Barang
                            </h4>
                            <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                                Tambah data barang acuan, spesifikasi umum, dan harga standar satuan barang.
                            </p>
                        </div>
                    </div>

                    <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-emerald-600">
                        <span>Buka Katalog Barang</span>
                        <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                    </div>
                </Link>

                {/* Info Card: Standar Mutu Pengadaan */}
                <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600 ring-1 ring-teal-500/20">
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Standar Pengadaan</h4>
                            <p className="text-sm font-bold text-slate-800">Katalog Acuan RSJ Tampan</p>
                        </div>
                    </div>
                    <p className="mt-3 text-xs text-slate-500 leading-relaxed">
                        Data barang di katalog ini otomatis menjadi referensi bagi seluruh divisi rumah sakit ketika mengajukan requisition baru.
                    </p>
                </div>
            </div>
        </PerencanaanLayout>
    );
}
