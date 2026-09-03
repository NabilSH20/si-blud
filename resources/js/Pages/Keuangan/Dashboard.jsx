import KeuanganLayout from '@/Layouts/KeuanganLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

const formatRupiah = (value) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(Number(value || 0));

export default function Dashboard({
    total_budgets = 0,
    total_budget_remaining = 0,
    total_processed = 0,
    total_revenue = 0,
    budget_chart_data = [],
    top_budgets = [],
    total_spent = 0,
}) {
    const user = usePage().props.auth.user;

    const COLORS = ['#f59e0b', '#059669'];

    return (
        <KeuanganLayout>
            <Head title="Dashboard Keuangan - E-BLUD RSJ Tampan" />

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
                            Pantau ketersediaan pagu rekening belanja, validasi pembebanan anggaran requisition, dan selesaikan persetujuan pengadaan rumah sakit.
                        </p>
                    </div>

                    <div className="flex shrink-0 flex-wrap gap-3">
                        <Link
                            href={route('keuangan.requisitions.index')}
                            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-emerald-800 shadow-md transition-all hover:bg-emerald-50 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-white/80"
                        >
                            Validasi Pengajuan
                        </Link>
                        <Link
                            href={route('reports.index')}
                            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600/80 px-4 py-2.5 text-xs font-bold text-white shadow-md transition-all hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-white/80"
                        >
                            Laporan Realisasi
                        </Link>
                    </div>
                </div>
            </div>

            {/* Standardized 4-Column Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
                {/* Metric Card 1: Total Pendapatan BLUD */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                    <div className="min-w-0 flex-1 mr-2">
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Total Pendapatan</p>
                        <h3 className="text-xl sm:text-2xl font-black text-emerald-700 mt-1 truncate">
                            {formatRupiah(total_revenue)}
                        </h3>
                        <p className="mt-1 text-[11px] font-bold text-emerald-600">Realisasi Penerimaan</p>
                    </div>
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-500/20">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                </div>

                {/* Metric Card 2: Total Sisa Anggaran */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                    <div className="min-w-0 flex-1 mr-2">
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Sisa Pagu Belanja</p>
                        <h3 className="text-xl sm:text-2xl font-black text-teal-700 mt-1 truncate">
                            {formatRupiah(total_budget_remaining)}
                        </h3>
                        <p className="mt-1 text-[11px] font-bold text-teal-600">Saldo Siap Alokasi</p>
                    </div>
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 ring-1 ring-teal-500/20">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                        </svg>
                    </div>
                </div>

                {/* Metric Card 3: Total Pengajuan Disetujui */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                    <div>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Pengajuan Tuntas</p>
                        <h3 className="text-2xl font-black text-slate-800 mt-1">{total_processed}</h3>
                        <p className="mt-1 text-[11px] font-bold text-emerald-700">Dibebankan ke DPA</p>
                    </div>
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-500/20">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                </div>

                {/* Metric Card 4: Total Rekening Pagu */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                    <div>
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Rekening Pagu</p>
                        <h3 className="text-2xl font-black text-slate-800 mt-1">{total_budgets}</h3>
                        <p className="mt-1 text-[11px] font-bold text-slate-500">Kode Rekening Aktif</p>
                    </div>
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-50 text-slate-600 ring-1 ring-slate-500/20">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 5.625c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Visualisasi Serapan Anggaran BLUD (Recharts) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
                {/* Donut Chart Serapan */}
                <div className="lg:col-span-5 bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="text-base font-bold text-slate-900">
                                Visualisasi Serapan Anggaran BLUD
                            </h4>
                            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                                Realtime DPA
                            </span>
                        </div>
                        <p className="text-xs text-slate-500">
                            Perbandingan alokasi dana terpakai vs sisa pagu tersedia
                        </p>
                    </div>

                    <div className="h-60 w-full my-2 flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={budget_chart_data}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={55}
                                    outerRadius={85}
                                    paddingAngle={4}
                                    dataKey="value"
                                >
                                    {budget_chart_data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value) => [formatRupiah(value), 'Nominal']}
                                    contentStyle={{ borderRadius: '0.75rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                                />
                                <Legend
                                    verticalAlign="bottom"
                                    height={36}
                                    iconType="circle"
                                    formatter={(value) => <span className="text-xs font-bold text-slate-700">{value}</span>}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs">
                        <span className="text-slate-500">Total Terpakai:</span>
                        <span className="font-bold text-amber-600">{formatRupiah(total_spent)}</span>
                    </div>
                </div>

                {/* Top 5 Pagu Anggaran Breakdown */}
                <div className="lg:col-span-7 bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="text-base font-bold text-slate-900">
                                Komparasi Rekening Anggaran Utama
                            </h4>
                            <Link
                                href={route('reports.index')}
                                className="text-xs font-bold text-emerald-600 hover:text-emerald-700"
                            >
                                Lihat Laporan Lengkap &rarr;
                            </Link>
                        </div>
                        <p className="text-xs text-slate-500">
                            Distribusi alokasi belanja terpakai dan sisa pagu per kode rekening
                        </p>
                    </div>

                    <div className="h-60 w-full my-2">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={top_budgets} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                                <YAxis
                                    tick={{ fontSize: 10, fill: '#64748b' }}
                                    tickFormatter={(val) => `${val / 1000000} Jt`}
                                />
                                <Tooltip
                                    formatter={(value) => [formatRupiah(value), '']}
                                    contentStyle={{ borderRadius: '0.75rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                                />
                                <Legend
                                    verticalAlign="bottom"
                                    height={36}
                                    iconType="circle"
                                    formatter={(value) => <span className="text-xs font-bold text-slate-700">{value === 'terpakai' ? 'Terpakai' : 'Sisa Pagu'}</span>}
                                />
                                <Bar dataKey="terpakai" name="terpakai" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="sisa" name="sisa" fill="#059669" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs text-slate-500">
                        <span>Grafik diperbarui otomatis dari DPA tahun berjalan.</span>
                        <Link href={route('budgets.index')} className="font-bold text-emerald-700 hover:underline">
                            Kelola Pagu
                        </Link>
                    </div>
                </div>
            </div>

            {/* Quick Links */}
            <div className="grid gap-6 md:grid-cols-2">
                <Link
                    href={route('keuangan.requisitions.index')}
                    className="group relative flex items-start gap-4 rounded-2xl border-2 border-slate-200/80 bg-white p-6 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-500/20">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div>
                        <h4 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition">
                            Validasi & Bebankan Anggaran
                        </h4>
                        <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                            Pilih rekening pagu belanja yang sesuai, potong sisa anggaran secara otomatis, dan setujui pengajuan barang.
                        </p>
                    </div>
                </Link>

                <Link
                    href={route('reports.index')}
                    className="group relative flex items-start gap-4 rounded-2xl border-2 border-slate-200/80 bg-white p-6 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 ring-1 ring-amber-500/20">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                        </svg>
                    </div>
                    <div>
                        <h4 className="text-base font-bold text-slate-900 group-hover:text-amber-700 transition">
                            Laporan Realisasi Anggaran
                        </h4>
                        <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                            Lihat rekapitulasi penyerapan dana belanja pengadaan rumah sakit dan cetak dokumen resmi pertanggungjawaban.
                        </p>
                    </div>
                </Link>
            </div>
        </KeuanganLayout>
    );
}
