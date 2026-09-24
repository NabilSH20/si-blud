import PerencanaanLayout from '@/Layouts/PerencanaanLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell 
} from 'recharts';

const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(number || 0);
};

const formatRupiahShort = (number) => {
    if (number >= 1e9) {
        return `Rp ${(number / 1e9).toFixed(1)} M`;
    }
    if (number >= 1e6) {
        return `Rp ${(number / 1e6).toFixed(1)} Jt`;
    }
    return formatRupiah(number);
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
    total_requests = 0,
    total_to_verify = 0,
    total_verified = 0,
    total_items = 0,
    pending_requisitions = [],
    active_year = 2026,
    status_data = {},
    chart_data = {},
}) {
    const { auth } = usePage().props;
    const user = auth?.user || {};
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formattedDate = currentTime.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

    const formattedTime = currentTime.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
    });

    // Chart Data Preparation
    const barData = [
        {
            name: 'Pendapatan',
            Target: chart_data.target_revenue || 0,
            Realisasi: chart_data.realisasi_revenue || 0,
        },
        {
            name: 'Belanja',
            Target: chart_data.planned_expense || 0,
            Realisasi: chart_data.serapan_expense || 0,
        }
    ];

    const pieData = [
        { name: 'Menunggu Telaah', value: status_data.pending_perencanaan || 0, color: '#f59e0b' },
        { name: 'Diproses Keuangan', value: status_data.diproses_keuangan || 0, color: '#3b82f6' },
        { name: 'Disetujui', value: status_data.disetujui || 0, color: '#10b981' },
        { name: 'Ditolak', value: status_data.ditolak || 0, color: '#ef4444' },
    ].filter(item => item.value > 0);

    // Custom Tooltip for BarChart
    const CustomBarTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-lg">
                    <p className="font-bold text-slate-800 mb-2">{label}</p>
                    {payload.map((entry, index) => (
                        <div key={index} className="flex justify-between items-center gap-4 text-xs">
                            <span style={{ color: entry.color }} className="font-semibold">{entry.name}</span>
                            <span className="font-mono text-slate-900">{formatRupiah(entry.value)}</span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <PerencanaanLayout>
            <Head title="Dashboard Perencanaan & Pengadaan - E-BLUD RSJ Tampan" />

            <div className="min-h-screen space-y-6">
                
                {/* 1. Header Row (Glassy/Clean) */}
                <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                            Dashboard Telaah Perencanaan
                        </h1>
                        <p className="mt-1 text-xs sm:text-sm text-slate-500">
                            Bagian Perencanaan & Pengadaan Logistik &bull; RS Jiwa Tampan Prov. Riau &bull; Tahun Anggaran <span className="font-bold text-slate-700">{active_year}</span>
                        </p>
                    </div>

                    <div className="flex flex-col sm:items-end gap-2.5 shrink-0">
                        <div className="text-xs text-slate-500">
                            Update terakhir:{' '}
                            <strong className="font-semibold text-slate-800">
                                {formattedDate} pukul {formattedTime}
                            </strong>
                        </div>

                        <Link
                            href={route('perencanaan.requisitions.index')}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-95 px-4 py-2 text-xs font-bold text-white shadow-2xs transition cursor-pointer"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Verifikasi Antrean Usulan</span>
                        </Link>
                    </div>
                </div>

                {/* 2. KPI Summary Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Card 1: Total Usulan Masuk */}
                    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4 group hover:border-slate-300 transition-all">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600 shadow-inner">
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Usulan Masuk</p>
                            <h3 className="text-2xl font-black text-slate-900 mt-0.5 group-hover:scale-105 transform origin-left transition-transform duration-300">{total_requests}</h3>
                        </div>
                    </div>

                    {/* Card 2: Perlu Ditelaah */}
                    <div className="bg-white rounded-2xl p-5 border border-amber-200/80 shadow-xs flex items-center gap-4 group hover:border-amber-300 hover:shadow-md transition-all">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-inner shadow-amber-300/50">
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-amber-700 uppercase tracking-wider">Menunggu Telaah</p>
                            <h3 className="text-2xl font-black text-amber-900 mt-0.5 group-hover:scale-105 transform origin-left transition-transform duration-300">{total_to_verify}</h3>
                        </div>
                    </div>

                    {/* Card 3: Selesai Ditelaah */}
                    <div className="bg-white rounded-2xl p-5 border border-emerald-200/80 shadow-xs flex items-center gap-4 group hover:border-emerald-300 transition-all">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-inner shadow-emerald-300/50">
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Selesai Ditelaah</p>
                            <h3 className="text-2xl font-black text-emerald-900 mt-0.5 group-hover:scale-105 transform origin-left transition-transform duration-300">{total_verified}</h3>
                        </div>
                    </div>

                    {/* Card 4: Katalog Barang */}
                    <div className="bg-white rounded-2xl p-5 border border-blue-200/80 shadow-xs flex items-center gap-4 group hover:border-blue-300 transition-all">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 shadow-inner">
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-blue-700 uppercase tracking-wider">Total Item Katalog</p>
                            <h3 className="text-2xl font-black text-blue-900 mt-0.5 group-hover:scale-105 transform origin-left transition-transform duration-300">{total_items}</h3>
                        </div>
                    </div>
                </div>

                {/* 3. Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Bar Chart: Proyeksi RBA vs Realisasi */}
                    <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col">
                        <div className="mb-6">
                            <h3 className="text-base font-bold text-slate-900">Proyeksi RBA: Target vs Realisasi</h3>
                            <p className="text-xs text-slate-500 mt-0.5">Membandingkan target pendapatan dan pagu belanja dengan realisasi saat ini.</p>
                        </div>
                        <div className="flex-1 min-h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600, fill: '#64748b' }} dy={10} />
                                    <YAxis 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fontSize: 11, fill: '#64748b' }} 
                                        tickFormatter={formatRupiahShort}
                                        dx={-10}
                                    />
                                    <RechartsTooltip content={<CustomBarTooltip />} cursor={{ fill: '#f1f5f9', opacity: 0.4 }} />
                                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                                    <Bar dataKey="Target" fill="#94a3b8" radius={[4, 4, 0, 0]} maxBarSize={60} />
                                    <Bar dataKey="Realisasi" fill="#0d9488" radius={[4, 4, 0, 0]} maxBarSize={60} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Donut Chart: Distribusi Status Usulan */}
                    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col">
                        <div className="mb-6">
                            <h3 className="text-base font-bold text-slate-900">Distribusi Status Usulan</h3>
                            <p className="text-xs text-slate-500 mt-0.5">Proporsi usulan belanja berdasarkan status terkini.</p>
                        </div>
                        <div className="flex-1 min-h-[300px] flex items-center justify-center relative">
                            {pieData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={70}
                                            outerRadius={95}
                                            paddingAngle={3}
                                            dataKey="value"
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip 
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            itemStyle={{ fontSize: '13px', fontWeight: 'bold' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="text-center text-slate-400 text-sm">Belum ada data usulan.</div>
                            )}
                            
                            {/* Inner Text for Donut */}
                            {pieData.length > 0 && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-2">
                                    <span className="text-3xl font-black text-slate-800">{total_requests}</span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total</span>
                                </div>
                            )}
                        </div>
                        {/* Custom Legend for Donut */}
                        {pieData.length > 0 && (
                            <div className="mt-4 grid grid-cols-2 gap-2">
                                {pieData.map((entry, idx) => (
                                    <div key={idx} className="flex items-center gap-2 text-xs">
                                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></span>
                                        <span className="text-slate-600 truncate">{entry.name}</span>
                                        <span className="font-bold text-slate-900 ml-auto">{entry.value}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* 4. Notification Box (Jika ada antrean) */}
                {total_to_verify > 0 && (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
                        <div className="flex items-center gap-4">
                            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-inner shadow-amber-300/50">
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </span>
                            <div>
                                <p className="text-sm font-bold text-amber-900">
                                    Ada {total_to_verify} berkas usulan belanja yang menunggu telaah
                                </p>
                                <p className="text-xs text-amber-700 mt-0.5">
                                    Periksa spesifikasi barang dan sesuaikan volume yang disetujui sebelum diteruskan ke Keuangan.
                                </p>
                            </div>
                        </div>
                        <Link
                            href={route('perencanaan.requisitions.index')}
                            className="shrink-0 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-95 text-white px-5 py-2.5 text-xs font-bold transition shadow-sm text-center"
                        >
                            Mulai Verifikasi &rarr;
                        </Link>
                    </div>
                )}

                {/* 5. Table: Antrean Usulan */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col">
                    <div className="p-5 sm:px-6 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
                        <div>
                            <h3 className="text-base font-bold text-slate-900">
                                5 Antrean Usulan Teratas
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Usulan belanja terbaru yang membutuhkan verifikasi Anda.
                            </p>
                        </div>
                        <Link
                            href={route('perencanaan.requisitions.index')}
                            className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 hover:text-teal-800 transition cursor-pointer bg-teal-50 px-3 py-1.5 rounded-lg"
                        >
                            <span>Lihat Semua</span>
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                            </svg>
                        </Link>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-100 text-xs">
                            <thead className="bg-slate-50/50 text-slate-500 uppercase tracking-wider text-[10px] font-black">
                                <tr>
                                    <th className="w-12 px-6 py-4 text-center">No</th>
                                    <th className="px-6 py-4 text-left">Nomor & Tanggal</th>
                                    <th className="px-6 py-4 text-left">Unit / Divisi Pemohon</th>
                                    <th className="px-6 py-4 text-left">Pos Rekening Belanja</th>
                                    <th className="px-6 py-4 text-right">Estimasi Biaya</th>
                                    <th className="w-28 px-6 py-4 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {pending_requisitions && pending_requisitions.length > 0 ? (
                                    pending_requisitions.map((req, idx) => (
                                        <tr key={req.id} className="hover:bg-slate-50/60 transition-colors group">
                                            <td className="px-6 py-4 text-center font-semibold text-slate-400">
                                                #{idx + 1}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-bold text-slate-900 block group-hover:text-teal-700 transition-colors">
                                                    {req.requisition_number}
                                                </span>
                                                <span className="text-[11px] text-slate-400 mt-0.5 block">
                                                    {formatDate(req.submission_date || req.created_at)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-bold text-slate-800 block">
                                                    {req.unit?.name || req.division?.name || '-'}
                                                </span>
                                                {req.division?.name && req.unit?.name && (
                                                    <span className="text-[11px] text-slate-500 block mt-0.5">
                                                        {req.division.name}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1.5 mb-1">
                                                    <span
                                                        className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                                                            req.jenis_belanja === 'Modal'
                                                                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                        }`}
                                                    >
                                                        {req.jenis_belanja || 'Operasi'}
                                                    </span>
                                                </div>
                                                <p
                                                    className="text-slate-700 font-medium truncate max-w-xs"
                                                    title={req.rba_account?.account_name}
                                                >
                                                    {req.rba_account?.account_name || 'Rekening Belanja RBA'}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4 text-right font-mono font-bold text-slate-900">
                                                {formatRupiah(req.total_estimated)}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <Link
                                                    href={route('perencanaan.requisitions.show', req.id)}
                                                    className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-slate-100 hover:bg-teal-600 hover:text-white active:scale-95 text-slate-700 px-3.5 py-2 text-xs font-bold transition-all cursor-pointer w-full"
                                                >
                                                    <span>Telaah</span>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-16 text-center">
                                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 text-slate-400 mb-3 border border-slate-100">
                                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <p className="text-sm font-bold text-slate-700">
                                                Tidak Ada Antrean Menunggu Telaah
                                            </p>
                                            <p className="text-xs text-slate-400 mt-1">
                                                Semua berkas usulan belanja unit kerja telah selesai diverifikasi.
                                            </p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 6. Quick Shortcuts */}
                <div>
                    <h3 className="text-sm font-bold text-slate-800 mb-3 ml-1">Pintasan Menu Utama</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Link
                            href={route('perencanaan.requisitions.index')}
                            className="group flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-5 hover:border-teal-300 hover:shadow-md transition-all"
                        >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                                    Verifikasi Pengajuan
                                </h4>
                                <p className="mt-1 text-xs text-slate-500 leading-relaxed line-clamp-2">
                                    Telaah kuantitas kebutuhan belanja dari unit, sesuaikan volume, dan teruskan ke Keuangan.
                                </p>
                            </div>
                        </Link>

                        <Link
                            href={route('perencanaan.rba.index')}
                            className="group flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-5 hover:border-indigo-300 hover:shadow-md transition-all"
                        >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">
                                    Penyusunan RBA BLUD
                                </h4>
                                <p className="mt-1 text-xs text-slate-500 leading-relaxed line-clamp-2">
                                    Kelola rencana bisnis, target pendapatan, pagu belanja, dan pergeseran pagu tahunan.
                                </p>
                            </div>
                        </Link>

                        <Link
                            href={route('items.index')}
                            className="group flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-5 hover:border-blue-300 hover:shadow-md transition-all"
                        >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                                    Katalog Barang Acuan
                                </h4>
                                <p className="mt-1 text-xs text-slate-500 leading-relaxed line-clamp-2">
                                    Kelola standar barang logistik rumah sakit, spesifikasi, dan standar harga belanja.
                                </p>
                            </div>
                        </Link>
                    </div>
                </div>

            </div>
        </PerencanaanLayout>
    );
}
