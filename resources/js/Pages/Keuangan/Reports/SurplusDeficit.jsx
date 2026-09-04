import KeuanganLayout from '@/Layouts/KeuanganLayout';
import { Head, Link } from '@inertiajs/react';
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

export default function SurplusDeficit({
    period_year = 2026,
    summary = {},
    revenue_sources = [],
    expense_categories = [],
}) {
    const isSurplus = summary.is_surplus;

    const comparisonData = [
        {
            name: 'Pendapatan BLUD',
            Target_RBA: summary.target_revenue || 0,
            Realisasi: summary.total_revenue || 0,
        },
        {
            name: 'Belanja Operasional',
            Target_RBA: summary.planned_expense || 0,
            Realisasi: summary.total_expense || 0,
        },
    ];

    const PIE_COLORS = ['#059669', '#0d9488', '#0284c7', '#6366f1', '#8b5cf6', '#d97706', '#e11d48'];

    const pieRevenueData = revenue_sources.map((item) => ({
        name: item.source,
        value: item.total_amount,
    }));

    return (
        <KeuanganLayout>
            <Head title={`Laporan Operasional Surplus/Defisit ${period_year} - E-BLUD RSJ Tampan`} />

            {/* Page Header */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                        Laporan Operasional (Surplus / Defisit)
                    </h1>
                    <p className="mt-1 text-xs font-semibold text-slate-500 sm:text-sm">
                        Evaluasi komprehensif kinerja keuangan E-BLUD Tahun Anggaran {period_year}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <a
                        href={route('reports.surplus-deficit.print')}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 px-5 py-2.5 text-sm font-bold text-white shadow-md hover:shadow-lg transition-all duration-200"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24-1.076-.64-2.115-1.182-3.088m12.924 0c-.542.973-.942 2.012-1.182 3.088m-10.56 0A9.004 9.004 0 0112 3a9.004 9.004 0 018.72 10.829m-17.44 0a8.96 8.96 0 003.58 5.761m10.28 0a8.96 8.96 0 003.58-5.761M12 18a6 6 0 100-12 6 6 0 000 12z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                        </svg>
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24-1.076-.64-2.115-1.182-3.088m12.924 0c-.542.973-.942 2.012-1.182 3.088" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h10.5a2.25 2.25 0 012.25 2.25v6a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 15v-6a2.25 2.25 0 012.25-2.25z" />
                        </svg>
                        Cetak Laporan Operasional
                    </a>
                </div>
            </div>

            {/* Top 3 Strategic Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {/* Total Realisasi Pendapatan */}
                <div className="bg-white rounded-2xl shadow-md shadow-emerald-950/5 border border-emerald-100/90 p-6 flex items-center justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-900/10">
                    <div className="min-w-0 flex-1 mr-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                            Realisasi Pendapatan
                        </span>
                        <h3 className="text-2xl sm:text-3xl font-black text-emerald-700 mt-2 truncate">
                            {formatRupiah(summary.total_revenue)}
                        </h3>
                        <p className="mt-1 text-xs font-bold text-slate-600">
                            Capaian RBA: <span className="text-emerald-700">{summary.revenue_achievement}%</span>
                        </p>
                    </div>
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-500/20">
                        <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                </div>

                {/* Total Realisasi Belanja */}
                <div className="bg-white rounded-2xl shadow-md shadow-emerald-950/5 border border-emerald-100/90 p-6 flex items-center justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-900/10">
                    <div className="min-w-0 flex-1 mr-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                            Realisasi Belanja Operasional
                        </span>
                        <h3 className="text-2xl sm:text-3xl font-black text-amber-700 mt-2 truncate">
                            {formatRupiah(summary.total_expense)}
                        </h3>
                        <p className="mt-1 text-xs font-bold text-slate-600">
                            Serapan Pagu: <span className="text-amber-700">{summary.expense_absorption}%</span>
                        </p>
                    </div>
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 ring-1 ring-amber-500/20">
                        <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                        </svg>
                    </div>
                </div>

                {/* Saldo Bersih: Surplus / Defisit */}
                <div className={`rounded-2xl shadow-md shadow-emerald-950/5 border p-6 flex items-center justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-900/10 ${
                    isSurplus ? 'bg-emerald-50/70 border-emerald-200' : 'bg-rose-50/70 border-rose-200'
                }`}>
                    <div className="min-w-0 flex-1 mr-2">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                                Saldo Bersih Operasional
                            </span>
                            <span className={`rounded-md px-2 py-0.5 text-[10px] font-black uppercase ${
                                isSurplus ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                            }`}>
                                {isSurplus ? 'SURPLUS' : 'DEFISIT'}
                            </span>
                        </div>
                        <h3 className={`text-2xl sm:text-3xl font-black mt-2 truncate ${
                            isSurplus ? 'text-emerald-900' : 'text-rose-900'
                        }`}>
                            {formatRupiah(summary.surplus_deficit)}
                        </h3>
                        <p className={`mt-1 text-xs font-bold ${isSurplus ? 'text-emerald-800' : 'text-rose-800'}`}>
                            {isSurplus ? 'Pendapatan melampaui beban belanja' : 'Beban belanja melebihi penerimaan kas'}
                        </p>
                    </div>
                    <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${
                        isSurplus ? 'bg-emerald-600 text-white ring-2 ring-emerald-400' : 'bg-rose-600 text-white ring-2 ring-rose-400'
                    }`}>
                        {isSurplus ? (
                            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                            </svg>
                        ) : (
                            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6L9 12.75l4.286-4.286a11.948 11.948 0 014.306 6.43l.776 2.898m0 0l3.182-5.511m-3.182 5.51l-5.511-3.181" />
                            </svg>
                        )}
                    </div>
                </div>
            </div>

            {/* Executive Visualizations (Recharts) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
                {/* BarChart: Target RBA vs Realisasi */}
                <div className="lg:col-span-7 bg-white rounded-2xl shadow-md shadow-emerald-950/5 border border-emerald-100/90 p-6 flex flex-col justify-between hover:shadow-lg hover:shadow-emerald-900/10 transition-all">
                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <h4 className="text-base font-bold text-slate-900">
                                Evaluasi Kinerja Anggaran (Target RBA vs Realisasi)
                            </h4>
                            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-700">
                                RBA: {summary.rba_status}
                            </span>
                        </div>
                        <p className="text-xs text-slate-500">
                            Perbandingan antara target perencanaan bisnis dengan realisasi transaksi aktual
                        </p>
                    </div>

                    <div className="h-64 w-full my-3">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={comparisonData} margin={{ top: 20, right: 20, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#475569' }} />
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
                                    formatter={(val) => <span className="text-xs font-bold text-slate-700">{val === 'Target_RBA' ? 'Target RBA' : 'Realisasi Aktual'}</span>}
                                />
                                <Bar dataKey="Target_RBA" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="Realisasi" fill="#059669" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs text-slate-500">
                        <span>Plafon belanja dan target penerimaan dari penetapan DPA.</span>
                        <Link href={route('reports.index')} className="font-bold text-emerald-700 hover:text-emerald-800 transition hover:underline">
                            Lihat DPA &rarr;
                        </Link>
                    </div>
                </div>

                {/* Donut Chart: Komposisi Sumber Pendapatan */}
                <div className="lg:col-span-5 bg-white rounded-2xl shadow-md shadow-emerald-950/5 border border-emerald-100/90 p-6 flex flex-col justify-between hover:shadow-lg hover:shadow-emerald-900/10 transition-all">
                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <h4 className="text-base font-bold text-slate-900">
                                Komposisi Pendapatan BLUD
                            </h4>
                            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                                Per Sumber
                            </span>
                        </div>
                        <p className="text-xs text-slate-500">
                            Distribusi aliran kas masuk berdasarkan unit penghasil
                        </p>
                    </div>

                    <div className="h-64 w-full my-3 flex items-center justify-center">
                        {pieRevenueData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieRevenueData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={50}
                                        outerRadius={80}
                                        paddingAngle={3}
                                        dataKey="value"
                                    >
                                        {pieRevenueData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value) => [formatRupiah(value), 'Penerimaan']}
                                        contentStyle={{ borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}
                                    />
                                    <Legend
                                        verticalAlign="bottom"
                                        height={42}
                                        iconType="circle"
                                        formatter={(val) => <span className="text-[11px] font-bold text-slate-700">{val}</span>}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="text-center text-xs text-slate-400 font-medium">Belum ada data penerimaan</div>
                        )}
                    </div>

                    <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs text-slate-500">
                        <span>Total sumber penerimaan: <strong>{revenue_sources.length} Unit</strong></span>
                        <Link href={route('revenues.index')} className="font-bold text-emerald-700 hover:text-emerald-800 transition hover:underline">
                            Kelola Pendapatan
                        </Link>
                    </div>
                </div>
            </div>

            {/* Detailed Tables Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Table: Penerimaan per Unit Layanan */}
                <div className="overflow-hidden rounded-2xl border border-emerald-100/90 bg-white shadow-md shadow-emerald-950/5 hover:shadow-lg hover:shadow-emerald-900/10 transition-shadow">
                    <div className="border-b border-emerald-100 bg-gradient-to-r from-emerald-50/90 via-teal-50/40 to-slate-50/50 px-6 py-3.5 flex items-center justify-between">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-950">
                            1. Rincian Penerimaan Kas per Sumber
                        </h4>
                        <Link href={route('revenues.create')} className="text-xs font-bold text-emerald-700 hover:text-emerald-800 transition hover:underline">
                            + Catat Kas
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-700 divide-y divide-emerald-100 border-collapse">
                            <thead className="bg-gradient-to-r from-emerald-50/90 via-teal-50/40 to-emerald-50/90 border-b border-emerald-100 text-emerald-950 font-bold uppercase tracking-wider">
                                <tr>
                                    <th className="px-4 py-3 text-emerald-950">Sumber Layanan</th>
                                    <th className="px-3 py-3 text-center w-20 text-emerald-950">Transaksi</th>
                                    <th className="px-4 py-3 text-right text-emerald-950">Realisasi (IDR)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {revenue_sources.length > 0 ? (
                                    revenue_sources.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-emerald-50/40 transition-colors duration-150">
                                            <td className="px-4 py-3 font-bold text-slate-800">
                                                {item.source}
                                            </td>
                                            <td className="px-3 py-3 text-center font-semibold text-slate-600">
                                                {item.count}
                                            </td>
                                            <td className="px-4 py-3 text-right font-black text-emerald-700">
                                                {formatRupiah(item.total_amount)}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={3} className="px-4 py-6 text-center text-slate-400 font-medium">
                                            Belum ada catatan pendapatan
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Table: Realisasi Belanja per Rekening Pagu */}
                <div className="overflow-hidden rounded-2xl border border-emerald-100/90 bg-white shadow-md shadow-emerald-950/5 hover:shadow-lg hover:shadow-emerald-900/10 transition-shadow">
                    <div className="border-b border-emerald-100 bg-gradient-to-r from-emerald-50/90 via-teal-50/40 to-slate-50/50 px-6 py-3.5 flex items-center justify-between">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-950">
                            2. Rincian Beban Belanja Pengadaan per Rekening
                        </h4>
                        <Link href={route('reports.index')} className="text-xs font-bold text-emerald-700 hover:text-emerald-800 transition hover:underline">
                            Laporan DPA
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-700 divide-y divide-emerald-100 border-collapse">
                            <thead className="bg-gradient-to-r from-emerald-50/90 via-teal-50/40 to-emerald-50/90 border-b border-emerald-100 text-emerald-950 font-bold uppercase tracking-wider">
                                <tr>
                                    <th className="px-4 py-3 text-emerald-950">Kode & Nama Rekening</th>
                                    <th className="px-4 py-3 text-right text-emerald-950">Beban Terpakai (IDR)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {expense_categories.length > 0 ? (
                                    expense_categories.map((cat, idx) => (
                                        <tr key={idx} className="hover:bg-emerald-50/40 transition-colors duration-150">
                                            <td className="px-4 py-3">
                                                <p className="font-bold text-slate-800">{cat.account_name}</p>
                                                <p className="font-mono text-[11px] text-slate-500 font-semibold">{cat.account_code}</p>
                                            </td>
                                            <td className="px-4 py-3 text-right font-black text-amber-700">
                                                {formatRupiah(cat.spent)}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={2} className="px-4 py-6 text-center text-slate-400 font-medium">
                                            Belum ada realisasi belanja
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </KeuanganLayout>
    );
}

