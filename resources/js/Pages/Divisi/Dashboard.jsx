import DivisiLayout from '@/Layouts/DivisiLayout';
import { Head, Link } from '@inertiajs/react';

export default function Dashboard({
    total_requests = 0,
    pending_requests = 0,
    approved_requests = 0,
}) {
    return (
        <DivisiLayout>
            <Head title="Dashboard Divisi - E-BLUD RSJ Tampan" />

            {/* Hero Welcome Banner */}
            <div className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-800 via-emerald-600 to-teal-700 p-6 text-white shadow-xl shadow-emerald-700/15 sm:p-8">
                <div className="relative z-10 max-w-2xl">
                    <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-md">
                        Portal Pemohon Unit Kerja
                    </span>
                    <h2 className="mt-3 text-2xl font-black tracking-tight sm:text-3xl">
                        Selamat Datang di Portal Pemohon
                    </h2>
                    <p className="mt-2 text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
                        Sistem Elektronik Requisition RSJ Tampan mempermudah instalasi dan unit kerja mengajukan kebutuhan logistik barang dan pemeliharaan secara transparan dan terintegrasi dengan bagian Pengadaan serta Keuangan.
                    </p>

                    <div className="mt-6 flex flex-wrap items-center gap-3">
                        <Link
                            href={route('requisitions.create')}
                            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-emerald-800 shadow-sm transition hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-white"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            Buat Pengajuan Baru
                        </Link>
                        <Link
                            href={route('requisitions.index')}
                            className="inline-flex items-center gap-2 rounded-xl bg-emerald-700/60 px-4 py-2.5 text-xs font-bold text-white backdrop-blur-md transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                        >
                            Lihat Riwayat Pengajuan
                        </Link>
                    </div>
                </div>

                <div className="pointer-events-none absolute -right-10 -bottom-10 h-64 w-64 rounded-full bg-teal-400/20 blur-3xl" />
            </div>

            {/* Standardized 3-Column Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {/* Metric Card 1: Total Pengajuan */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Total Pengajuan Saya</p>
                        <h3 className="text-3xl font-bold text-gray-800 mt-2">{total_requests}</h3>
                        <p className="mt-1 text-xs font-bold text-blue-600">Dokumen Pengajuan E-BLUD</p>
                    </div>
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 ring-1 ring-blue-500/20">
                        <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                        </svg>
                    </div>
                </div>

                {/* Metric Card 2: Menunggu Verifikasi */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Menunggu Verifikasi</p>
                        <h3 className="text-3xl font-bold text-amber-600 mt-2">{pending_requests}</h3>
                        <p className="mt-1 text-xs font-bold text-amber-700">Tahap Telaah Perencanaan</p>
                    </div>
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 ring-1 ring-amber-500/20">
                        <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                </div>

                {/* Metric Card 3: Disetujui Selesai */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Pengajuan Disetujui</p>
                        <h3 className="text-3xl font-bold text-emerald-600 mt-2">{approved_requests}</h3>
                        <p className="mt-1 text-xs font-bold text-emerald-700">Selesai Divalidasi</p>
                    </div>
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-500/20">
                        <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Action Shortcuts */}
            <div className="grid gap-6 sm:grid-cols-2">
                <div className="rounded-2xl border-2 border-slate-200/80 bg-white p-6 shadow-xs flex flex-col justify-between">
                    <div>
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 mb-3 ring-1 ring-emerald-500/20">
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                        </div>
                        <h3 className="text-base font-bold text-slate-900">Pengajuan Belanja E-BLUD Baru</h3>
                        <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                            Pilih barang dari katalog standar dan tentukan kuantitas yang dibutuhkan oleh unit kerja Anda.
                        </p>
                    </div>
                    <Link
                        href={route('requisitions.create')}
                        className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700"
                    >
                        Mulai Pengajuan Baru &rarr;
                    </Link>
                </div>

                <div className="rounded-2xl border-2 border-slate-200/80 bg-white p-6 shadow-xs flex flex-col justify-between">
                    <div>
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 mb-3 ring-1 ring-blue-500/20">
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
                            </svg>
                        </div>
                        <h3 className="text-base font-bold text-slate-900">Daftar & Status Pengajuan</h3>
                        <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                            Pantau riwayat pengajuan barang unit kerja Anda dan cetak nota barang yang telah disetujui.
                        </p>
                    </div>
                    <Link
                        href={route('requisitions.index')}
                        className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700"
                    >
                        Buka Daftar Pengajuan &rarr;
                    </Link>
                </div>
            </div>
        </DivisiLayout>
    );
}
