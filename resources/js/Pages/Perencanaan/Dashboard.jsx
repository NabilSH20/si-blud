import PerencanaanLayout from '@/Layouts/PerencanaanLayout';
import { Head, Link, usePage } from '@inertiajs/react';

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

export default function Dashboard({
    total_to_verify = 0,
    total_verified = 0,
    total_items = 0,
    pending_requisitions = [],
}) {
    const user = usePage().props.auth.user;

    return (
        <PerencanaanLayout>
            <Head title="Dashboard Perencanaan & Pengadaan - E-BLUD RSJ Tampan" />

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

                <div className="pointer-events-none absolute -right-10 -top-10 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-8 right-32 h-48 w-48 rounded-full bg-teal-400/20 blur-2xl" />

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

            {/* Standardized 4-Column Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                {/* Metric Card 1: Menunggu Verifikasi */}
                <div className="bg-white rounded-2xl shadow-md shadow-emerald-950/5 border border-emerald-100/90 p-5 flex items-center justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-900/10">
                    <div>
                        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Antrean Telaah</p>
                        <h3 className="text-3xl font-black text-amber-600 mt-1">{total_to_verify}</h3>
                        <p className="mt-1 text-xs font-bold text-amber-700">Perlu Segera Diverifikasi</p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 ring-1 ring-amber-500/20">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                </div>

                {/* Metric Card 2: Pengajuan Diteruskan */}
                <div className="bg-white rounded-2xl shadow-md shadow-emerald-950/5 border border-emerald-100/90 p-5 flex items-center justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-900/10">
                    <div>
                        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Selesai Ditelaah</p>
                        <h3 className="text-3xl font-black text-emerald-600 mt-1">{total_verified}</h3>
                        <p className="mt-1 text-xs font-bold text-emerald-700">Diteruskan ke Keuangan</p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-500/20">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                </div>

                {/* Metric Card 3: Total Katalog Barang */}
                <div className="bg-white rounded-2xl shadow-md shadow-emerald-950/5 border border-emerald-100/90 p-5 flex items-center justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-900/10">
                    <div>
                        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Katalog Barang</p>
                        <h3 className="text-3xl font-black text-slate-800 mt-1">{total_items}</h3>
                        <p className="mt-1 text-xs font-bold text-blue-600">Standarisasi RSJ Tampan</p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 ring-1 ring-blue-500/20">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                        </svg>
                    </div>
                </div>

                {/* Metric Card 4: Standarisasi Acuan */}
                <div className="bg-white rounded-2xl shadow-md shadow-emerald-950/5 border border-emerald-100/90 p-5 flex items-center justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-900/10">
                    <div>
                        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Acuan Harga Satuan</p>
                        <h3 className="text-3xl font-black text-teal-600 mt-1">100%</h3>
                        <p className="mt-1 text-xs font-bold text-teal-700">Tervalidasi Sistem E-BLUD</p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 ring-1 ring-teal-500/20">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Main Content: 2 Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
                {/* Left Column: Pending Queue Table & Quick Action Cards */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Table Card: Pending Verification Queue */}
                    <div className="bg-white rounded-2xl border border-emerald-100/90 shadow-md shadow-emerald-950/5 hover:shadow-lg hover:shadow-emerald-900/10 transition-all duration-200 overflow-hidden">
                        <div className="p-5 sm:px-6 border-b border-emerald-100 bg-gradient-to-r from-emerald-50/90 via-teal-50/40 to-slate-50/50 flex items-center justify-between flex-wrap gap-3">
                            <div className="flex items-center gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-white shadow-2xs">
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-emerald-950">Antrean Berkas Perlu Diverifikasi</h3>
                                    <p className="text-xs text-slate-500">Pengajuan kebutuhan logistik dari unit kerja yang menunggu telaah teknis</p>
                                </div>
                            </div>
                            <Link
                                href={route('perencanaan.requisitions.index')}
                                className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 hover:text-amber-800 transition"
                            >
                                Buka Semua Antrean
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                </svg>
                            </Link>
                        </div>

                        {/* Queue Table */}
                        <div className="overflow-x-auto">
                            {pending_requisitions && pending_requisitions.length > 0 ? (
                                <table className="w-full text-left border-collapse text-xs">
                                    <thead>
                                        <tr className="border-b border-emerald-100 bg-gradient-to-r from-emerald-50/90 via-teal-50/40 to-emerald-50/90 text-emerald-950 font-bold uppercase tracking-wider">
                                            <th className="py-3 px-5">Nomor & Tanggal</th>
                                            <th className="py-3 px-5">Unit Pemohon</th>
                                            <th className="py-3 px-5">Rekening Belanja RBA</th>
                                            <th className="py-3 px-5">Estimasi Biaya</th>
                                            <th className="py-3 px-5 text-right">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {pending_requisitions.map((req) => (
                                            <tr key={req.id} className="hover:bg-emerald-50/40 transition-colors">
                                                <td className="py-3.5 px-5">
                                                    <span className="font-bold text-slate-900 block">{req.requisition_number}</span>
                                                    <span className="text-[11px] text-slate-400">{formatDate(req.submission_date || req.created_at)}</span>
                                                </td>
                                                <td className="py-3.5 px-5">
                                                    <span className="font-bold text-slate-800 block">{req.division?.name || '-'}</span>
                                                    <span className="text-[11px] text-slate-400 font-mono">{req.division?.code || ''}</span>
                                                </td>
                                                <td className="py-3.5 px-5">
                                                    <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-bold mb-0.5 ${req.jenis_belanja === 'Modal' ? 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200' : 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'}`}>
                                                        {req.jenis_belanja || 'Operasi'}
                                                    </span>
                                                    <p className="text-slate-700 font-medium truncate max-w-xs" title={req.rba_account?.account_name}>
                                                        {req.rba_account?.account_name || 'Rekening Belanja'}
                                                    </p>
                                                </td>
                                                <td className="py-3.5 px-5 font-bold text-slate-900">
                                                    {formatRupiah(req.total_estimated)}
                                                </td>
                                                <td className="py-3.5 px-5 text-right">
                                                    <Link
                                                        href={route('perencanaan.requisitions.show', req.id)}
                                                        className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 text-xs font-bold shadow-xs transition"
                                                    >
                                                        Verifikasi
                                                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                                                        </svg>
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="p-8 text-center">
                                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 mb-3">
                                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <h4 className="text-sm font-bold text-slate-800">Tidak Ada Antrean Menunggu</h4>
                                    <p className="text-xs text-slate-500 mt-1">
                                        Semua berkas pengajuan belanja telah selesai diverifikasi oleh tim perencanaan.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Shortcuts */}
                    <div className="grid gap-5 sm:grid-cols-2">
                        <Link
                            href={route('perencanaan.requisitions.index')}
                            className="group flex items-start gap-4 rounded-2xl border border-emerald-100/90 bg-white p-6 shadow-md shadow-emerald-950/5 transition-all hover:shadow-lg hover:shadow-emerald-900/10 hover:border-amber-300"
                        >
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 ring-1 ring-amber-500/20">
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-slate-900 group-hover:text-amber-700 transition">
                                    Verifikasi Pengajuan Masuk
                                </h4>
                                <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                                    Telaah kuantitas kebutuhan, sesuaikan volume yang disetujui, dan teruskan ke Bagian Keuangan.
                                </p>
                            </div>
                        </Link>

                        <Link
                            href={route('items.index')}
                            className="group flex items-start gap-4 rounded-2xl border border-emerald-100/90 bg-white p-6 shadow-md shadow-emerald-950/5 transition-all hover:shadow-lg hover:shadow-emerald-900/10 hover:border-emerald-300"
                        >
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-500/20">
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition">
                                    Kelola Katalog Barang Acuan
                                </h4>
                                <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                                    Perbarui katalog standar kebutuhan logistik, satuan (box, rim, botol), dan acuan harga pasar.
                                </p>
                            </div>
                        </Link>
                    </div>
                </div>

                {/* Right Column: Planner Guidelines & Quick Info */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Guidance Card */}
                    <div className="bg-white rounded-2xl border border-emerald-100/90 shadow-md shadow-emerald-950/5 p-6 hover:shadow-lg hover:shadow-emerald-900/10 transition-all duration-200">
                        <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-emerald-100">
                            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white font-bold text-xs shadow-2xs">
                                📋
                            </span>
                            <div>
                                <h3 className="text-sm font-bold text-emerald-950">Pedoman Telaah Pengadaan</h3>
                                <p className="text-[11px] text-slate-500">Standar verifikasi logistik RSJ Tampan</p>
                            </div>
                        </div>

                        <div className="space-y-4 text-xs text-slate-600">
                            <div className="flex gap-3 items-start">
                                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] mt-0.5">
                                    1
                                </span>
                                <div>
                                    <h5 className="font-bold text-slate-900">Cek Kesesuaian Spesifikasi</h5>
                                    <p className="mt-0.5 text-[11px] leading-relaxed">
                                        Pastikan barang yang diajukan sudah sesuai katalog resmi BLUD dan satuan ukurannya tepat.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3 items-start">
                                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-800 font-bold text-[10px] mt-0.5">
                                    2
                                </span>
                                <div>
                                    <h5 className="font-bold text-slate-900">Penetapan Kuantitas Disetujui</h5>
                                    <p className="mt-0.5 text-[11px] leading-relaxed">
                                        Sesuaikan volume barang bila kuantitas melebihi rata-rata pemakaian bulanan unit.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3 items-start">
                                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-800 font-bold text-[10px] mt-0.5">
                                    3
                                </span>
                                <div>
                                    <h5 className="font-bold text-slate-900">Penerusan ke Bagian Keuangan</h5>
                                    <p className="mt-0.5 text-[11px] leading-relaxed">
                                        Setelah disahkan, berkas langsung berpindah ke antrean validasi pagu anggaran Keuangan.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Notice Board */}
                    <div className="rounded-2xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50/80 via-teal-50/40 to-slate-50/50 p-6 shadow-md shadow-emerald-950/5 hover:shadow-lg hover:shadow-emerald-900/10 transition-all duration-200">
                        <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs mb-3">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                            </svg>
                            SLA Verifikasi
                        </div>
                        <h4 className="text-sm font-black text-slate-900">Target Waktu Telaah Dokumen</h4>
                        <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                            Standar waktu penelaahan berkas reguler adalah <strong>maksimal 2x24 jam kerja</strong> sejak diajukan oleh unit pemohon.
                        </p>
                        <div className="mt-4 pt-4 border-t border-emerald-200/60 flex items-center justify-between text-xs">
                            <span className="text-slate-500">Status Sistem:</span>
                            <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                Aktif Berjalan
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </PerencanaanLayout>
    );
}
