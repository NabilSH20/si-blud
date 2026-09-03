import DivisiLayout from '@/Layouts/DivisiLayout';
import { Head, Link } from '@inertiajs/react';

export default function Dashboard() {
    return (
        <DivisiLayout>
            <Head title="Dashboard Pemohon Divisi - E-Req RSJ Tampan" />

            {/* Hero Welcome Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-800 via-emerald-600 to-teal-700 p-6 text-white shadow-xl shadow-emerald-700/15 sm:p-8">
                <div className="relative z-10 max-w-2xl">
                    <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-md">
                        Portal Pemohon Divisi
                    </span>
                    <h2 className="mt-4 text-2xl font-black tracking-tight sm:text-3xl">
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

            {/* Quick Action Cards */}
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs flex flex-col justify-between">
                    <div>
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 mb-3">
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                        </div>
                        <h3 className="text-base font-bold text-slate-900">E-Requisition Baru</h3>
                        <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                            Pilih barang dari katalog standar dan tentukan kuantitas yang dibutuhkan oleh unit kerja Anda.
                        </p>
                    </div>
                    <Link
                        href={route('requisitions.create')}
                        className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700"
                    >
                        Mulai Pengajuan &rarr;
                    </Link>
                </div>

                <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs flex flex-col justify-between">
                    <div>
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-600 mb-3">
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
                            </svg>
                        </div>
                        <h3 className="text-base font-bold text-slate-900">Daftar & Status Pengajuan</h3>
                        <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                            Pantau proses verifikasi pengajuan barang Anda mulai dari Perencanaan hingga persetujuan Keuangan.
                        </p>
                    </div>
                    <Link
                        href={route('requisitions.index')}
                        className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-teal-600 hover:text-teal-700"
                    >
                        Buka Daftar Pengajuan &rarr;
                    </Link>
                </div>
            </div>

            {/* Workflow Info Cards */}
            <div className="mt-6 grid gap-6 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 mb-3 font-bold text-sm">
                        1
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">Pengajuan Requisition</h4>
                    <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                        Pilih barang dari katalog standar terverifikasi RSJ Tampan sesuai keperluan kerja.
                    </p>
                </div>

                <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 mb-3 font-bold text-sm">
                        2
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">Verifikasi Pengadaan</h4>
                    <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                        Tim perencanaan & pengadaan menelaah spesifikasi serta kesesuaian harga satuan acuan.
                    </p>
                </div>

                <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600 mb-3 font-bold text-sm">
                        3
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">Validasi Keuangan</h4>
                    <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                        Bagian keuangan memeriksa ketersediaan pagu rekening belanja sebelum realisasi requisition.
                    </p>
                </div>
            </div>
        </DivisiLayout>
    );
}
