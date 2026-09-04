import KeuanganLayout from '@/Layouts/KeuanganLayout';
import { Head, Link } from '@inertiajs/react';

const formatRupiah = (value) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(Number(value || 0));

export default function Index({ budgets = [], summary = {} }) {
    return (
        <KeuanganLayout>
            <Head title="Laporan Realisasi Anggaran E-BLUD - RSJ Tampan" />

            {/* Page Header with Top Action */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                        Laporan Realisasi Anggaran E-BLUD
                    </h1>
                    <p className="mt-1 text-xs font-semibold text-slate-500 sm:text-sm">
                        Akuntabilitas & Rekapitulasi Penyerapan Anggaran Pengadaan RSJ Tampan Provinsi Riau
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <a
                        href={route('reports.print')}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 px-5 py-2.5 text-sm font-bold text-white shadow-md hover:shadow-lg transition-all duration-200"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24-1.077-.32-2.14-.32-3.193 0-5.18 4.02-9.386 8.974-9.386 4.954 0 8.973 4.207 8.973 9.386 0 1.053-.08 2.116-.32 3.193M12 18v-4.5m0 0l-2.25 2.25M12 13.5l2.25 2.25M3.75 19.5h16.5" />
                        </svg>
                        Cetak Rekapitulasi
                    </a>
                </div>
            </div>

            {/* Summary KPI Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
                {/* Total Pagu Awal */}
                <div className="bg-white rounded-2xl shadow-md shadow-emerald-950/5 border border-emerald-100/90 p-5 flex items-center justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-900/10">
                    <div className="min-w-0 flex-1 mr-2">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Pagu DPA</p>
                        <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1.5 truncate">
                            {formatRupiah(summary.total_initial)}
                        </h3>
                        <p className="mt-1 text-[11px] font-bold text-slate-500">Alokasi Awal Rekening</p>
                    </div>
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 ring-1 ring-blue-500/20">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                        </svg>
                    </div>
                </div>

                {/* Total Terpakai (Realisasi) */}
                <div className="bg-white rounded-2xl shadow-md shadow-emerald-950/5 border border-emerald-100/90 p-5 flex items-center justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-900/10">
                    <div className="min-w-0 flex-1 mr-2">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Terpakai</p>
                        <h3 className="text-xl sm:text-2xl font-black text-amber-600 mt-1.5 truncate">
                            {formatRupiah(summary.total_spent)}
                        </h3>
                        <p className="mt-1 text-[11px] font-bold text-amber-700">Realisasi Belanja Pengadaan</p>
                    </div>
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 ring-1 ring-amber-500/20">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                </div>

                {/* Sisa Anggaran */}
                <div className="bg-white rounded-2xl shadow-md shadow-emerald-950/5 border border-emerald-100/90 p-5 flex items-center justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-900/10">
                    <div className="min-w-0 flex-1 mr-2">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Sisa Anggaran</p>
                        <h3 className="text-xl sm:text-2xl font-black text-emerald-700 mt-1.5 truncate">
                            {formatRupiah(summary.total_remaining)}
                        </h3>
                        <p className="mt-1 text-[11px] font-bold text-emerald-600">Saldo Rekening Tersedia</p>
                    </div>
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-500/20">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                </div>

                {/* Persentase Realisasi */}
                <div className="bg-white rounded-2xl shadow-md shadow-emerald-950/5 border border-emerald-100/90 p-5 flex items-center justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-900/10">
                    <div className="min-w-0 flex-1 mr-2">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">% Realisasi Fisik</p>
                        <h3 className="text-xl sm:text-2xl font-black text-teal-700 mt-1.5">
                            {summary.overall_percentage}%
                        </h3>
                        <div className="mt-1.5 h-2 w-32 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                            <div
                                className="h-full bg-teal-600 rounded-full transition-all duration-500"
                                style={{ width: `${Math.min(100, summary.overall_percentage)}%` }}
                            />
                        </div>
                    </div>
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 ring-1 ring-teal-500/20 font-black text-sm">
                        %
                    </div>
                </div>
            </div>

            {/* Main Table: Standardized Unified Container */}
            <div className="overflow-hidden rounded-2xl border border-emerald-100/90 bg-white shadow-md shadow-emerald-950/5 hover:shadow-lg hover:shadow-emerald-900/10 transition-shadow">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-700 divide-y divide-emerald-100 border-collapse">
                        <thead className="bg-gradient-to-r from-emerald-50/90 via-teal-50/40 to-emerald-50/90 border-b border-emerald-100 text-xs font-bold uppercase tracking-wider text-emerald-950">
                            <tr>
                                <th className="px-4 py-3.5 text-center w-12 text-emerald-950">No</th>
                                <th className="px-5 py-3.5 text-emerald-950">Kode Rekening</th>
                                <th className="px-5 py-3.5 text-emerald-950">Nama Rekening Belanja</th>
                                <th className="px-4 py-3.5 text-center text-emerald-950">Tahun</th>
                                <th className="px-5 py-3.5 text-right text-emerald-950">Total Pagu (Initial)</th>
                                <th className="px-5 py-3.5 text-right text-emerald-950">Total Terpakai (Spent)</th>
                                <th className="px-5 py-3.5 text-right text-emerald-950">Sisa Anggaran</th>
                                <th className="px-4 py-3.5 text-center text-emerald-950">% Realisasi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                            {budgets.length > 0 ? (
                                budgets.map((budget, index) => (
                                    <tr
                                        key={budget.id}
                                        className="hover:bg-emerald-50/40 transition-colors duration-150"
                                    >
                                        <td className="px-4 py-3.5 text-center font-mono text-xs font-semibold text-slate-400">
                                            #{index + 1}
                                        </td>
                                        <td className="px-5 py-3.5 font-mono text-xs font-bold text-slate-900 whitespace-nowrap">
                                            {budget.account_code}
                                        </td>
                                        <td className="px-5 py-3.5 font-semibold text-slate-800">
                                            {budget.account_name}
                                        </td>
                                        <td className="px-4 py-3.5 text-center font-bold text-slate-700">
                                            {budget.period_year}
                                        </td>
                                        <td className="px-5 py-3.5 text-right font-bold text-slate-900 whitespace-nowrap">
                                            {formatRupiah(budget.total_budget)}
                                        </td>
                                        <td className="px-5 py-3.5 text-right font-bold text-amber-600 whitespace-nowrap">
                                            {formatRupiah(budget.total_spent)}
                                        </td>
                                        <td className="px-5 py-3.5 text-right font-bold text-emerald-700 whitespace-nowrap">
                                            {formatRupiah(budget.remaining_budget)}
                                        </td>
                                        <td className="px-4 py-3.5 text-center whitespace-nowrap">
                                            <span
                                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${
                                                    budget.percentage > 80
                                                        ? 'bg-rose-100 text-rose-800'
                                                        : budget.percentage > 50
                                                        ? 'bg-amber-100 text-amber-800'
                                                        : 'bg-emerald-100 text-emerald-800'
                                                }`}
                                            >
                                                {budget.percentage}%
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={8} className="px-6 py-10 text-center text-slate-400 font-medium">
                                        Belum ada data pagu anggaran yang terdaftar.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                        {budgets.length > 0 && (
                            <tfoot className="border-t-2 border-emerald-200 bg-gradient-to-r from-emerald-50/90 via-teal-50/40 to-emerald-50/90 font-bold text-slate-900">
                                <tr>
                                    <td colSpan={4} className="px-5 py-4 text-right uppercase tracking-wider text-xs text-emerald-950 font-bold">
                                        TOTAL REKAPITULASI ANGGARAN:
                                    </td>
                                    <td className="px-5 py-4 text-right text-slate-900 whitespace-nowrap font-black">
                                        {formatRupiah(summary.total_initial)}
                                    </td>
                                    <td className="px-5 py-4 text-right text-amber-700 whitespace-nowrap font-black">
                                        {formatRupiah(summary.total_spent)}
                                    </td>
                                    <td className="px-5 py-4 text-right text-emerald-800 whitespace-nowrap font-black">
                                        {formatRupiah(summary.total_remaining)}
                                    </td>
                                    <td className="px-4 py-4 text-center text-teal-800 whitespace-nowrap font-black">
                                        {summary.overall_percentage}%
                                    </td>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            </div>
        </KeuanganLayout>
    );
}

