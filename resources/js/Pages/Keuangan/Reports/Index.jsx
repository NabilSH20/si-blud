import { useState } from 'react';
import KeuanganLayout from '@/Layouts/KeuanganLayout';
import { Head, router } from '@inertiajs/react';

const formatRupiah = (value) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(Number(value || 0));

export default function Index({ budgets = [], summary = {}, filters = {}, availableYears = [] }) {
    const activeYear = filters.year || (budgets.length > 0 ? budgets[0].period_year : '');
    const [search, setSearch] = useState(filters.search || '');

    const handleFilter = (e, newSearch = search, newKategori = filters.kategori, newYear = filters.year) => {
        if (e) e.preventDefault();
        router.get(route('reports.index'), { search: newSearch, kategori: newKategori, year: newYear }, {
            preserveState: true,
            replace: true
        });
    };

    const printUrl = route('reports.print', { search: filters.search, kategori: filters.kategori, year: filters.year });

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
                        href={printUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-95 px-4 py-2 text-xs font-bold text-white shadow-sm transition cursor-pointer whitespace-nowrap"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24-1.076-.64-2.115-1.182-3.088m12.924 0c-.542.973-.942 2.012-1.182 3.088m-10.56 0A9.004 9.004 0 0112 3a9.004 9.004 0 018.72 10.829m-17.44 0a8.96 8.96 0 003.58 5.761m10.28 0a8.96 8.96 0 003.58-5.761M12 18a6 6 0 100-12 6 6 0 000 12z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                        </svg>
                        <span>Cetak Rekapitulasi</span>
                    </a>
                </div>
            </div>

            {/* Summary KPI Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {/* Total Pagu Awal */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col justify-center">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Total Pagu DPA</p>
                    <h3 className="text-xl font-black text-slate-900">
                        {formatRupiah(summary.total_initial)}
                    </h3>
                </div>

                {/* Total Terpakai */}
                <div className="bg-white rounded-xl border border-rose-300 p-4 flex flex-col justify-center">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-rose-600 mb-1">Realisasi Belanja</p>
                    <h3 className="text-xl font-black text-rose-700">
                        {formatRupiah(summary.total_spent)}
                    </h3>
                </div>

                {/* Sisa Anggaran */}
                <div className="bg-white rounded-xl border border-emerald-300 p-4 flex flex-col justify-center">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 mb-1">Total Sisa Pagu DPA</p>
                    <h3 className="text-xl font-black text-emerald-700">
                        {formatRupiah(summary.total_remaining)}
                    </h3>
                </div>

                {/* Persentase Realisasi */}
                <div className="bg-white rounded-xl border border-blue-300 p-4 flex flex-col justify-center">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600 mb-1">Serapan Fisik</p>
                    <h3 className="text-xl font-black text-blue-700">
                        {summary.overall_percentage}%
                    </h3>
                </div>
            </div>

            {/* Main Table Card */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

                {/* Filter Header inside the table card */}
                <div className="flex flex-col sm:flex-row items-center gap-3 p-4 border-b border-slate-100 bg-white">
                    {/* Search Input */}
                    <div className="relative w-full sm:w-64">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleFilter(null, e.target.value, filters.kategori, filters.year)}
                            placeholder="Cari kode atau nama rekening..."
                            className="block w-full rounded-xl border border-slate-200 pl-9 py-2 text-xs font-bold text-slate-700 placeholder-slate-400 focus:border-teal-500 focus:ring-teal-500 shadow-sm"
                        />
                    </div>

                    {/* Kategori Select */}
                    <select
                        value={filters.kategori || ''}
                        onChange={(e) => handleFilter(null, search, e.target.value, filters.year)}
                        className="block w-full sm:w-48 rounded-xl border border-slate-200 py-2 px-3 text-xs font-bold text-slate-700 focus:border-teal-500 focus:ring-teal-500 shadow-sm cursor-pointer"
                    >
                        <option value="">Semua Jenis Belanja</option>
                        <option value="Operasi">Belanja Operasi</option>
                        <option value="Modal">Belanja Modal</option>
                    </select>

                    {/* Tahun Select */}
                    <select
                        value={filters.year || ''}
                        onChange={(e) => handleFilter(null, search, filters.kategori, e.target.value)}
                        className="block w-full sm:w-28 rounded-xl border border-slate-200 py-2 px-3 text-xs font-bold text-slate-700 focus:border-teal-500 focus:ring-teal-500 shadow-sm cursor-pointer"
                    >
                        {availableYears.map(y => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>

                    {/* Data Count */}
                    <div className="text-xs font-bold text-slate-500 sm:ml-auto">
                        {budgets.length} dari {budgets.length} pengajuan
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-700 border-collapse">
                        <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-800">
                            <tr>
                                <th className="px-5 py-4 whitespace-nowrap">Kode Rekening</th>
                                <th className="px-5 py-4">Nama Rekening Anggaran</th>
                                <th className="px-5 py-4 text-right whitespace-nowrap">Total Pagu</th>
                                <th className="px-5 py-4 text-right whitespace-nowrap">Total Terpakai</th>
                                <th className="px-5 py-4 text-right whitespace-nowrap">Sisa Pagu</th>
                                <th className="px-5 py-4 text-center whitespace-nowrap">% Realisasi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                            {budgets.length > 0 ? (
                                budgets.map((budget, index) => {
                                    // Hitung kedalaman berdasarkan jumlah titik
                                    const levelCount = (budget.account_code.match(/\./g) || []).length;
                                    const isParent = levelCount <= 3; // Misal level 0, 1, 2, 3 dianggap punya anak/header

                                    // Indentasi kiri berdasarkan level
                                    const indentClass =
                                        levelCount === 0 ? '' :
                                            levelCount === 1 ? 'ml-4' :
                                                levelCount === 2 ? 'ml-8' :
                                                    levelCount === 3 ? 'ml-12' :
                                                        'ml-16';

                                    const isRoot = levelCount === 0;

                                    return (
                                        <tr key={budget.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-5 py-4 whitespace-nowrap">
                                                <span className="text-xs font-bold text-slate-800">
                                                    {budget.account_code}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className={`flex items-center gap-2 ${indentClass}`}>
                                                    {isParent && (
                                                        <span className="text-slate-400 text-[10px] leading-none">•</span>
                                                    )}
                                                    <span className={`text-xs ${isParent ? 'font-bold text-slate-800' : 'font-semibold text-slate-700'} ${isRoot || levelCount === 1 ? 'uppercase' : ''}`}>
                                                        {budget.account_name}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-right whitespace-nowrap">
                                                <span className="text-xs font-bold text-slate-900">
                                                    {formatRupiah(budget.total_budget)}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-right whitespace-nowrap">
                                                <span className="text-xs font-bold text-rose-700">
                                                    {formatRupiah(budget.total_spent)}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-right whitespace-nowrap">
                                                <span className="text-xs font-bold text-emerald-700">
                                                    {formatRupiah(budget.remaining_budget)}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-center whitespace-nowrap">
                                                <span
                                                    className={`inline-flex items-center justify-center rounded px-2 py-0.5 text-[11px] font-bold min-w-[3rem] ${budget.percentage > 80
                                                        ? 'bg-rose-100 text-rose-800'
                                                        : budget.percentage > 50
                                                            ? 'bg-amber-100 text-amber-800'
                                                            : budget.percentage > 0
                                                                ? 'bg-emerald-100 text-emerald-800'
                                                                : 'bg-slate-100 text-slate-600'
                                                        }`}
                                                >
                                                    {budget.percentage}%
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-medium">
                                        Belum ada data pagu anggaran yang terdaftar untuk filter ini.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                        {budgets.length > 0 && (
                            <tfoot className="border-t border-slate-200 bg-white">
                                <tr>
                                    <td colSpan={2} className="px-5 py-4 text-right uppercase tracking-wider text-[11px] font-black text-slate-500">
                                        TOTAL REKAPITULASI
                                    </td>
                                    <td className="px-5 py-4 text-right text-sm font-black text-slate-900 whitespace-nowrap">
                                        {formatRupiah(summary.total_initial)}
                                    </td>
                                    <td className="px-5 py-4 text-right text-sm font-black text-rose-700 whitespace-nowrap">
                                        {formatRupiah(summary.total_spent)}
                                    </td>
                                    <td className="px-5 py-4 text-right text-sm font-black text-emerald-700 whitespace-nowrap">
                                        {formatRupiah(summary.total_remaining)}
                                    </td>
                                    <td className="px-5 py-4 text-center text-sm font-black text-blue-700 whitespace-nowrap">
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


