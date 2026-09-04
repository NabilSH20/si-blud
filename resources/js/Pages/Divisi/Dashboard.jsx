import DivisiLayout from '@/Layouts/DivisiLayout';
import { Head, Link } from '@inertiajs/react';

const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(number || 0);
};

const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
};

const getStatusBadge = (status) => {
    switch (status) {
        case 'Pending_Perencanaan':
            return {
                label: 'Menunggu Perencanaan',
                bg: 'bg-amber-50 text-amber-800 border-amber-200',
                dot: 'bg-amber-500',
            };
        case 'Diproses_Keuangan':
            return {
                label: 'Diproses Keuangan',
                bg: 'bg-blue-50 text-blue-800 border-blue-200',
                dot: 'bg-blue-500',
            };
        case 'Disetujui_Selesai':
            return {
                label: 'Disetujui / Selesai',
                bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
                dot: 'bg-emerald-500',
            };
        case 'Ditolak':
            return {
                label: 'Ditolak',
                bg: 'bg-rose-50 text-rose-800 border-rose-200',
                dot: 'bg-rose-500',
            };
        default:
            return {
                label: status || 'Pending',
                bg: 'bg-slate-50 text-slate-800 border-slate-200',
                dot: 'bg-slate-400',
            };
    }
};

export default function Dashboard({
    total_requests = 0,
    pending_requests = 0,
    in_finance_requests = 0,
    approved_requests = 0,
    recent_requisitions = [],
}) {
    return (
        <DivisiLayout>
            <Head title="Dashboard Divisi - E-BLUD RSJ Tampan" />

            {/* Hero Welcome Banner */}
            <div className="relative mb-8 overflow-hidden rounded-3xl bg-emerald-950 p-6 text-white shadow-xl shadow-emerald-950/20 sm:p-8">
                {/* Hospital Background Image with Blur Effect */}
                <img
                    src="/images/bg.jpeg"
                    alt="Gedung RSJ Tampan"
                    className="pointer-events-none absolute inset-0 h-full w-full scale-105 object-cover object-center filter blur-[2px] brightness-75 transition-transform duration-700"
                />

                {/* Emerald & Teal Gradient Overlay to Preserve Brand Colors & High Contrast */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-emerald-900/90 via-emerald-800/85 to-teal-900/80 mix-blend-multiply" />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-emerald-950/70 via-transparent to-black/20" />

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

            {/* Standardized 4-Column Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                {/* Metric Card 1: Total Pengajuan */}
                <div className="bg-white rounded-2xl shadow-md shadow-emerald-950/5 border border-emerald-100/90 p-5 flex items-center justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-900/10">
                    <div>
                        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Total Pengajuan</p>
                        <h3 className="text-3xl font-black text-slate-800 mt-1">{total_requests}</h3>
                        <p className="mt-1 text-xs font-bold text-blue-600">Dokumen Diajukan</p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 ring-1 ring-blue-500/20">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                        </svg>
                    </div>
                </div>

                {/* Metric Card 2: Menunggu Verifikasi Perencanaan */}
                <div className="bg-white rounded-2xl shadow-md shadow-emerald-950/5 border border-emerald-100/90 p-5 flex items-center justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-900/10">
                    <div>
                        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Menunggu Telaah</p>
                        <h3 className="text-3xl font-black text-amber-600 mt-1">{pending_requests}</h3>
                        <p className="mt-1 text-xs font-bold text-amber-700">Verifikasi Perencanaan</p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 ring-1 ring-amber-500/20">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                </div>

                {/* Metric Card 3: Proses Validasi Keuangan */}
                <div className="bg-white rounded-2xl shadow-md shadow-emerald-950/5 border border-emerald-100/90 p-5 flex items-center justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-900/10">
                    <div>
                        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Validasi Pagu</p>
                        <h3 className="text-3xl font-black text-indigo-600 mt-1">{in_finance_requests}</h3>
                        <p className="mt-1 text-xs font-bold text-indigo-700">Proses SP2D Keuangan</p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-500/20">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6H2.25m0 0H3m-.75 0h.008v.008H2.25V6zm0 0v12m0 0h.008v.008H2.25V18zm0 0H3m16.5-12a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6v12a2.25 2.25 0 002.25 2.25h10.5a2.25 2.25 0 002.25-2.25V6z" />
                        </svg>
                    </div>
                </div>

                {/* Metric Card 4: Disetujui Selesai */}
                <div className="bg-white rounded-2xl shadow-md shadow-emerald-950/5 border border-emerald-100/90 p-5 flex items-center justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-900/10">
                    <div>
                        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Disetujui Selesai</p>
                        <h3 className="text-3xl font-black text-emerald-600 mt-1">{approved_requests}</h3>
                        <p className="mt-1 text-xs font-bold text-emerald-700">Siap Realisasi Belanja</p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-500/20">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Main Content Layout: 2 Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
                {/* Left Column: Recent Requisitions & Quick Action Shortcuts */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Table Card: 5 Recent Requisitions */}
                    <div className="bg-white rounded-2xl border border-emerald-100/90 shadow-md shadow-emerald-950/5 hover:shadow-lg hover:shadow-emerald-900/10 transition-all duration-200 overflow-hidden">
                        <div className="p-5 sm:px-6 border-b border-emerald-100 bg-gradient-to-r from-emerald-50/90 via-teal-50/40 to-slate-50/50 flex items-center justify-between flex-wrap gap-3">
                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-2xs">
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-emerald-950">Aktivitas Pengajuan Terbaru</h3>
                                    <p className="text-xs text-slate-500">5 berkas kebutuhan logistik terakhir dari unit Anda</p>
                                </div>
                            </div>
                            <Link
                                href={route('requisitions.index')}
                                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition"
                            >
                                Lihat Semua Pengajuan
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                </svg>
                            </Link>
                        </div>

                        {/* Requisitions List Table */}
                        <div className="overflow-x-auto">
                            {recent_requisitions && recent_requisitions.length > 0 ? (
                                <table className="w-full text-left border-collapse text-xs">
                                    <thead>
                                        <tr className="border-b border-emerald-100 bg-gradient-to-r from-emerald-50/90 via-teal-50/40 to-emerald-50/90 text-emerald-950 font-bold uppercase tracking-wider">
                                            <th className="py-3 px-5">Nomor & Tanggal</th>
                                            <th className="py-3 px-5">Rekening Belanja RBA</th>
                                            <th className="py-3 px-5">Estimasi Biaya</th>
                                            <th className="py-3 px-5">Status Berkas</th>
                                            <th className="py-3 px-5 text-right">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {recent_requisitions.map((req) => {
                                            const badge = getStatusBadge(req.status);
                                            return (
                                                <tr key={req.id} className="hover:bg-emerald-50/40 transition-colors">
                                                    <td className="py-3.5 px-5">
                                                        <span className="font-bold text-slate-900 block">{req.requisition_number}</span>
                                                        <span className="text-[11px] text-slate-400">{formatDate(req.submission_date || req.created_at)}</span>
                                                    </td>
                                                    <td className="py-3.5 px-5">
                                                        <div className="flex items-center gap-1.5 mb-0.5">
                                                            <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-bold ${req.jenis_belanja === 'Modal' ? 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200' : 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'}`}>
                                                                {req.jenis_belanja || 'Operasi'}
                                                            </span>
                                                            <span className="text-slate-400 text-[11px]">{req.rba_account?.account_code || '-'}</span>
                                                        </div>
                                                        <p className="text-slate-700 font-medium truncate max-w-xs" title={req.rba_account?.account_name}>
                                                            {req.rba_account?.account_name || 'Rekening RBA'}
                                                        </p>
                                                    </td>
                                                    <td className="py-3.5 px-5">
                                                        <span className="font-bold text-slate-900">
                                                            {formatRupiah(req.total_approved > 0 ? req.total_approved : req.total_estimated)}
                                                        </span>
                                                    </td>
                                                    <td className="py-3.5 px-5">
                                                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold border ${badge.bg}`}>
                                                            <span className={`h-1.5 w-1.5 rounded-full ${badge.dot}`} />
                                                            {badge.label}
                                                        </span>
                                                    </td>
                                                    <td className="py-3.5 px-5 text-right">
                                                        <Link
                                                            href={route('requisitions.show', req.id)}
                                                            className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-800 px-2.5 py-1 text-xs font-bold text-emerald-700 transition"
                                                        >
                                                            Lihat
                                                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                                                            </svg>
                                                        </Link>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="p-8 text-center">
                                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 mb-3">
                                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                        </svg>
                                    </div>
                                    <h4 className="text-sm font-bold text-slate-800">Belum Ada Pengajuan Belanja</h4>
                                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                                        Unit kerja Anda belum membuat pengajuan logistik E-BLUD. Klik tombol di bawah untuk membuat pengajuan baru.
                                    </p>
                                    <Link
                                        href={route('requisitions.create')}
                                        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition"
                                    >
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                        </svg>
                                        Buat Pengajuan Sekarang
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Action Shortcuts Grid */}
                    <div className="grid gap-5 sm:grid-cols-2">
                        <div className="rounded-2xl border border-emerald-100/90 bg-white p-6 shadow-md shadow-emerald-950/5 flex flex-col justify-between transition-all hover:shadow-lg hover:shadow-emerald-900/10 hover:border-emerald-300">
                            <div>
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 mb-3 ring-1 ring-emerald-500/20">
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                    </svg>
                                </div>
                                <h3 className="text-base font-bold text-slate-900">Pengajuan Belanja E-BLUD Baru</h3>
                                <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                                    Pilih barang dari katalog standar dan tentukan kuantitas yang dibutuhkan oleh unit kerja Anda secara sistematis.
                                </p>
                            </div>
                            <Link
                                href={route('requisitions.create')}
                                className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700"
                            >
                                Mulai Pengajuan Baru &rarr;
                            </Link>
                        </div>

                        <div className="rounded-2xl border border-emerald-100/90 bg-white p-6 shadow-md shadow-emerald-950/5 flex flex-col justify-between transition-all hover:shadow-lg hover:shadow-emerald-900/10 hover:border-teal-300">
                            <div>
                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-700 mb-3 ring-1 ring-teal-500/20">
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
                                    </svg>
                                </div>
                                <h3 className="text-base font-bold text-slate-900">Daftar & Status Pengajuan</h3>
                                <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                                    Pantau riwayat berkas belanja ruangan Anda dan cetak nota barang yang telah disetujui secara digital.
                                </p>
                            </div>
                            <Link
                                href={route('requisitions.index')}
                                className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 hover:text-teal-800"
                            >
                                Buka Riwayat Berkas &rarr;
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Right Column: Workflow Stepper & Notice Board */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Stepper Card: Alur Estafet E-BLUD RSJ Tampan */}
                    <div className="bg-white rounded-2xl border border-emerald-100/90 shadow-md shadow-emerald-950/5 p-6 hover:shadow-lg hover:shadow-emerald-900/10 transition-all duration-200">
                        <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-emerald-100">
                            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white font-bold text-xs shadow-2xs">
                                4
                            </span>
                            <div>
                                <h3 className="text-sm font-bold text-emerald-950">Alur Pengajuan E-BLUD</h3>
                                <p className="text-[11px] text-slate-500">Tahapan estafet pengadaan rumah sakit</p>
                            </div>
                        </div>

                        <div className="relative pl-6 space-y-5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-emerald-200">
                            {/* Step 1 */}
                            <div className="relative">
                                <span className="absolute -left-6 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white ring-4 ring-white">
                                    1
                                </span>
                                <h4 className="text-xs font-bold text-slate-900">Pengajuan Unit Kerja</h4>
                                <p className="text-[11px] text-slate-500 mt-0.5">
                                    Unit pemohon memilih kategori belanja (Operasi / Modal) dan barang dari katalog standar.
                                </p>
                            </div>

                            {/* Step 2 */}
                            <div className="relative">
                                <span className="absolute -left-6 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white ring-4 ring-white">
                                    2
                                </span>
                                <h4 className="text-xs font-bold text-slate-900">Telaah Perencanaan</h4>
                                <p className="text-[11px] text-slate-500 mt-0.5">
                                    Bagian Perencanaan memverifikasi kebutuhan teknis, kuantitas disetujui, dan spesifikasi.
                                </p>
                            </div>

                            {/* Step 3 */}
                            <div className="relative">
                                <span className="absolute -left-6 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-[10px] font-bold text-white ring-4 ring-white">
                                    3
                                </span>
                                <h4 className="text-xs font-bold text-slate-900">Validasi Pagu Keuangan</h4>
                                <p className="text-[11px] text-slate-500 mt-0.5">
                                    Bagian Keuangan memvalidasi ketersediaan saldo rekening RBA dan menerbitkan nomor SP2D.
                                </p>
                            </div>

                            {/* Step 4 */}
                            <div className="relative">
                                <span className="absolute -left-6 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-teal-600 text-[10px] font-bold text-white ring-4 ring-white">
                                    4
                                </span>
                                <h4 className="text-xs font-bold text-slate-900">Pencairan & Realisasi</h4>
                                <p className="text-[11px] text-slate-500 mt-0.5">
                                    Pengadaan barang direalisasikan dan nota penerimaan dicetak oleh unit kerja.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Notice & Contact Board */}
                    <div className="rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50/80 via-teal-50/40 to-slate-50/50 p-6 shadow-md shadow-emerald-950/5 hover:shadow-lg hover:shadow-emerald-900/10 transition-all duration-200">
                        <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs mb-3">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                            </svg>
                            Pusat Informasi & Bantuan
                        </div>
                        <h4 className="text-sm font-black text-slate-900">Ketentuan Pengajuan Logistik</h4>
                        <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                            Pengajuan berkala rutin bulanan ditutup tiap <strong>tanggal 25 pukul 15.00 WIB</strong> untuk sinkronisasi SP2D Keuangan.
                        </p>

                        <div className="mt-4 pt-4 border-t border-emerald-200/60 space-y-2.5 text-xs text-slate-700">
                            <div className="flex items-center justify-between">
                                <span className="text-slate-500">Bag. Perencanaan:</span>
                                <span className="font-bold text-emerald-800">Ext. 104</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-slate-500">Bag. Keuangan:</span>
                                <span className="font-bold text-emerald-800">Ext. 108</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-slate-500">SIMRS / IT Support:</span>
                                <span className="font-bold text-emerald-800">Ext. 112</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DivisiLayout>
    );
}
