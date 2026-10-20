import KeuanganLayout from '@/Layouts/KeuanganLayout';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
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

    const [pageRev, setPageRev] = useState(1);
    const [pageExp, setPageExp] = useState(1);
    const itemsPerPage = 5;

    const totalRevPages = Math.max(1, Math.ceil(revenue_sources.length / itemsPerPage));
    const paginatedRevenues = revenue_sources.slice((pageRev - 1) * itemsPerPage, pageRev * itemsPerPage);

    const totalExpPages = Math.max(1, Math.ceil(expense_categories.length / itemsPerPage));
    const paginatedExpenses = expense_categories.slice((pageExp - 1) * itemsPerPage, pageExp * itemsPerPage);

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
                        className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-95 px-4 py-2 text-xs font-bold text-white shadow-sm transition cursor-pointer whitespace-nowrap"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24-1.076-.64-2.115-1.182-3.088m12.924 0c-.542.973-.942 2.012-1.182 3.088m-10.56 0A9.004 9.004 0 0112 3a9.004 9.004 0 018.72 10.829m-17.44 0a8.96 8.96 0 003.58 5.761m10.28 0a8.96 8.96 0 003.58-5.761M12 18a6 6 0 100-12 6 6 0 000 12z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                        </svg>
                        <span>Cetak Laporan</span>
                    </a>
                </div>
            </div>

            {/* Discrepancy Warning Notice */}
            {summary.has_discrepancy && (
                <div className="mb-6 rounded-2xl border-2 border-rose-300 bg-rose-50 p-5 shadow-xs">
                    <div className="flex items-start gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-200 text-rose-800">
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-rose-900">Perhatian: Ditemukan Selisih Data Realisasi Belanja!</h3>
                            <p className="mt-1 text-sm font-medium text-rose-800">
                                Sistem mendeteksi adanya selisih sebesar <strong>{formatRupiah(summary.discrepancy_amount)}</strong> antara total transaksi riil yang disetujui (Requisition) dengan selisih pagu awal dan sisa di buku Pagu Anggaran (Budget).
                            </p>
                            <p className="mt-1 text-xs text-rose-700">
                                Angka pengeluaran yang ditampilkan pada laporan ini menggunakan <strong>data transaksi riil (Requisition)</strong> untuk menjamin akurasi. Silakan lakukan audit terhadap tabel Pagu Anggaran.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Top 3 Strategic Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {/* Total Realisasi Pendapatan */}
                <div className="rounded-2xl border-2 border-emerald-300 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                    <p className="text-[11px] font-black uppercase tracking-wider text-emerald-600 block">
                        Realisasi Pendapatan
                    </p>
                    <div className="mt-1 flex flex-col gap-1.5">
                        <span className="text-xl font-black text-emerald-700 truncate">{formatRupiah(summary.total_revenue)}</span>
                        
                        <div className="mt-0.5">
                            <div className="flex justify-between text-[10px] font-bold text-emerald-700 mb-1">
                                <span>Capaian RBA</span>
                                <span>{summary.revenue_achievement}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-emerald-100 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(summary.revenue_achievement, 100)}%` }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Total Realisasi Belanja */}
                <div className="rounded-2xl border-2 border-amber-300 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                    <p className="text-[11px] font-black uppercase tracking-wider text-amber-600 block">
                        Realisasi Belanja Operasional
                    </p>
                    <div className="mt-1 flex flex-col gap-1.5">
                        <span className="text-xl font-black text-amber-700 truncate">{formatRupiah(summary.total_expense)}</span>
                        
                        <div className="mt-0.5">
                            <div className="flex justify-between text-[10px] font-bold text-amber-700 mb-1">
                                <span>Serapan Pagu</span>
                                <span>{summary.expense_absorption}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-amber-100 rounded-full overflow-hidden">
                                <div className="h-full bg-amber-500 rounded-full" style={{ width: `${Math.min(summary.expense_absorption, 100)}%` }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Saldo Bersih: Surplus / Defisit */}
                <div className={`rounded-2xl border-2 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md bg-white ${isSurplus ? 'border-teal-300' : 'border-rose-300'}`}>
                    <div className="flex items-center gap-2">
                        <p className={`text-[11px] font-black uppercase tracking-wider block ${isSurplus ? 'text-teal-600' : 'text-rose-600'}`}>
                            Saldo Bersih Operasional
                        </p>
                        <span className={`rounded-md px-1.5 py-0.5 text-[9px] font-black uppercase ${isSurplus ? 'bg-teal-600 text-white' : 'bg-rose-600 text-white'}`}>
                            {isSurplus ? 'SURPLUS' : 'DEFISIT'}
                        </span>
                    </div>
                    <div className="mt-1 flex flex-col gap-1.5">
                        <span className={`text-xl font-black truncate ${isSurplus ? 'text-teal-700' : 'text-rose-700'}`}>
                            {formatRupiah(summary.surplus_deficit)}
                        </span>
                        <p className={`text-[9px] mt-0.5 font-bold ${isSurplus ? 'text-teal-700' : 'text-rose-700'}`}>
                            {isSurplus ? 'Pendapatan melampaui beban belanja' : 'Beban belanja melebihi penerimaan'}
                        </p>
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
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
                    <div className="border-b border-slate-100 bg-white px-6 py-4 flex items-center justify-between">
                        <h4 className="text-[13px] font-bold text-slate-800">
                            Rincian Penerimaan Kas per Sumber
                        </h4>
                        <Link href={route('revenues.index', { create: true })} className="text-xs font-bold text-teal-600 hover:text-teal-700 transition hover:underline">
                            + Catat Kas
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-700 border-collapse">
                            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-800">
                                <tr>
                                    <th className="px-5 py-4">Sumber Layanan</th>
                                    <th className="px-5 py-4 text-center w-24">Transaksi</th>
                                    <th className="px-5 py-4 text-right">Realisasi (IDR)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {paginatedRevenues.length > 0 ? (
                                    paginatedRevenues.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors duration-150">
                                            <td className="px-5 py-3 font-bold text-slate-800 text-[11px]">
                                                {item.source}
                                            </td>
                                            <td className="px-5 py-3 text-center font-bold text-[11px] text-slate-600">
                                                {item.count}
                                            </td>
                                            <td className="px-5 py-3 text-right font-black text-xs text-emerald-600">
                                                {formatRupiah(item.total_amount)}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={3} className="px-5 py-6 text-center text-slate-400 font-medium">
                                            Belum ada catatan pendapatan
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination Controls */}
                    {totalRevPages > 1 && (
                        <div className="border-t border-slate-100 px-6 py-3 flex items-center justify-between bg-slate-50">
                            <span className="text-xs text-slate-500 font-medium">Halaman {pageRev} dari {totalRevPages}</span>
                            <div className="flex gap-2">
                                <button onClick={() => setPageRev(p => Math.max(1, p - 1))} disabled={pageRev === 1} className="px-3 py-1 text-xs font-bold bg-white border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-50 transition cursor-pointer">Prev</button>
                                <button onClick={() => setPageRev(p => Math.min(totalRevPages, p + 1))} disabled={pageRev === totalRevPages} className="px-3 py-1 text-xs font-bold bg-white border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-50 transition cursor-pointer">Next</button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Table: Realisasi Belanja per Rekening Pagu */}
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
                    <div className="border-b border-slate-100 bg-white px-6 py-4 flex items-center justify-between">
                        <h4 className="text-[13px] font-bold text-slate-800">
                            Rincian Beban Belanja Pengadaan per Rekening
                        </h4>
                        <Link href={route('reports.index')} className="text-xs font-bold text-teal-600 hover:text-teal-700 transition hover:underline">
                            Lihat Detail DPA &rarr;
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-700 border-collapse">
                            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-800">
                                <tr>
                                    <th className="px-5 py-4">Kode & Nama Rekening</th>
                                    <th className="px-5 py-4 text-right">Beban Terpakai (IDR)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {paginatedExpenses.length > 0 ? (
                                    paginatedExpenses.map((cat, idx) => {
                                        const levelCount = (cat.account_code.match(/\./g) || []).length;
                                        const isRoot = levelCount === 0;
                                        const indentClass = levelCount === 0 ? '' : levelCount === 1 ? 'ml-3' : levelCount === 2 ? 'ml-6' : levelCount === 3 ? 'ml-9' : 'ml-12';

                                        return (
                                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors duration-150">
                                            <td className="px-5 py-2.5">
                                                <div className={`flex items-center gap-3 ${indentClass}`}>
                                                    <span className="font-mono text-[10px] font-bold text-slate-400 w-12 shrink-0">{cat.account_code}</span>
                                                    <span className={`${isRoot || levelCount === 1 ? 'font-black text-[11px] text-slate-800 uppercase' : 'font-semibold text-[11px] text-slate-700'}`}>
                                                        {cat.account_name}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-2.5 text-right font-black text-xs text-[#c25e1a]">
                                                {formatRupiah(cat.spent)}
                                            </td>
                                        </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={2} className="px-5 py-6 text-center text-slate-400 font-medium">
                                            Belum ada realisasi belanja
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination Controls */}
                    {totalExpPages > 1 && (
                        <div className="border-t border-slate-100 px-6 py-3 flex items-center justify-between bg-slate-50">
                            <span className="text-xs text-slate-500 font-medium">Halaman {pageExp} dari {totalExpPages}</span>
                            <div className="flex gap-2">
                                <button onClick={() => setPageExp(p => Math.max(1, p - 1))} disabled={pageExp === 1} className="px-3 py-1 text-xs font-bold bg-white border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-50 transition cursor-pointer">Prev</button>
                                <button onClick={() => setPageExp(p => Math.min(totalExpPages, p + 1))} disabled={pageExp === totalExpPages} className="px-3 py-1 text-xs font-bold bg-white border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-50 transition cursor-pointer">Next</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </KeuanganLayout>
    );
}

