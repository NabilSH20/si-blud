import PerencanaanLayout from '@/Layouts/PerencanaanLayout';
import { Head, Link, usePage } from '@inertiajs/react';

export default function Dashboard({ total_to_verify = 0, total_items = 0 }) {
    const user = usePage().props.auth.user;

    return (
        <PerencanaanLayout>
            <Head title="Dashboard Perencanaan & Pengadaan - E-BLUD RSJ Tampan" />

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
                            Standarisasi katalog kebutuhan logistik, verifikasi spesifikasi requisition divisi, dan pastikan efisiensi belanja barang rumah sakit.
                        </p>
                    </div>

                    <div className="flex shrink-0 flex-wrap gap-3">
                        <Link
                            href={route('perencanaan.requisitions.index')}
                            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-emerald-800 shadow-md transition-all hover:bg-emerald-50 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-white/80"
                        >
                            Verifikasi Pengajuan
                        </Link>
                        <Link
                            href={route('items.index')}
                            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600/80 px-4 py-2.5 text-xs font-bold text-white shadow-md transition-all hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-white/80"
                        >
                            Katalog Barang
                        </Link>
                    </div>
                </div>
            </div>

            {/* Standardized 3-Column Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {/* Metric Card 1: Menunggu Verifikasi */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Perlu Diverifikasi</p>
                        <h3 className="text-3xl font-bold text-amber-600 mt-2">{total_to_verify}</h3>
                        <p className="mt-1 text-xs font-bold text-amber-700">Pengajuan Menunggu Telaah</p>
                    </div>
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 ring-1 ring-amber-500/20">
                        <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                </div>

                {/* Metric Card 2: Total Katalog Barang */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Total Barang Katalog</p>
                        <h3 className="text-3xl font-bold text-gray-800 mt-2">{total_items}</h3>
                        <p className="mt-1 text-xs font-bold text-emerald-600">Barang Terstandarisasi</p>
                    </div>
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-500/20">
                        <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                        </svg>
                    </div>
                </div>

                {/* Metric Card 3: Standarisasi Mutu */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Standar Acuan Harga</p>
                        <h3 className="text-3xl font-bold text-teal-600 mt-2">100%</h3>
                        <p className="mt-1 text-xs font-bold text-teal-700">Terstandarisasi RSJ Tampan</p>
                    </div>
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 ring-1 ring-teal-500/20">
                        <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Quick Links */}
            <div className="grid gap-6 md:grid-cols-2">
                <Link
                    href={route('perencanaan.requisitions.index')}
                    className="group relative flex items-start gap-4 rounded-2xl border-2 border-slate-200/80 bg-white p-6 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 ring-1 ring-amber-500/20">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div>
                        <h4 className="text-base font-bold text-slate-900 group-hover:text-amber-700 transition">
                            Verifikasi Pengajuan Masuk
                        </h4>
                        <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                            Telaah kuantitas barang yang diajukan divisi, sesuaikan kuantitas yang disetujui, dan teruskan ke Bagian Keuangan.
                        </p>
                    </div>
                </Link>

                <Link
                    href={route('items.index')}
                    className="group relative flex items-start gap-4 rounded-2xl border-2 border-slate-200/80 bg-white p-6 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-500/20">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                        </svg>
                    </div>
                    <div>
                        <h4 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition">
                            Kelola Katalog Barang Acuan
                        </h4>
                        <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                            Perbarui katalog standar barang, satuan ukuran (box, rim, pcs), dan estimasi harga satuan acuan rumah sakit.
                        </p>
                    </div>
                </Link>
            </div>
        </PerencanaanLayout>
    );
}
