import KeuanganLayout from '@/Layouts/KeuanganLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { Printer, Download, Filter, Target, ArrowUpDown, ChevronRight, TrendingUp, Wallet, CheckCircle2, FileSpreadsheet } from 'lucide-react';

const formatRupiah = (value) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(Number(value || 0));

const formatSisaAnggaran = (value) => {
    const num = Number(value || 0);
    if (num < 0) {
        return `(${formatRupiah(Math.abs(num))})`;
    }
    return formatRupiah(num);
};

export default function RevenueMonthlyMatrix({
    selected_year = 2027,
    active_year = 2027,
    available_years = [2027, 2026],
    matrix = {},
    category_totals = {},
    grand_total = {},
    printed_at = '',
}) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Semua');

    const monthsHeader = [
        { num: 1, label: 'Januari' },
        { num: 2, label: 'Februari' },
        { num: 3, label: 'Maret' },
        { num: 4, label: 'April' },
        { num: 5, label: 'Mei' },
        { num: 6, label: 'Juni' },
        { num: 7, label: 'Juli' },
        { num: 8, label: 'Agustus' },
        { num: 9, label: 'September' },
        { num: 10, label: 'Oktober' },
        { num: 11, label: 'November' },
        { num: 12, label: 'Desember' },
    ];

    const handleYearChange = (year) => {
        router.get(route('reports.revenue-monthly-matrix'), { year }, { preserveState: true });
    };

    const categories = useMemo(() => {
        return ['Semua', ...Object.keys(matrix || {})];
    }, [matrix]);

    // Export Table Data to CSV
    const exportToCSV = () => {
        let csvContent = 'data:text/csv;charset=utf-8,';
        csvContent += 'No,Kategori,Uraian Sumber Pendapatan,Target Anggaran,Jan,Feb,Mar,Apr,Mei,Jun,Jul,Agu,Sep,Okt,Nov,Des,Total Realisasi,Sisa Anggaran,% Capaian\r\n';

        let rowNo = 1;
        Object.entries(matrix || {}).forEach(([cat, items]) => {
            items.forEach((item) => {
                const row = [
                    rowNo++,
                    `"${cat}"`,
                    `"${item.source_name}"`,
                    item.target_yearly,
                    item.months?.[1] || 0,
                    item.months?.[2] || 0,
                    item.months?.[3] || 0,
                    item.months?.[4] || 0,
                    item.months?.[5] || 0,
                    item.months?.[6] || 0,
                    item.months?.[7] || 0,
                    item.months?.[8] || 0,
                    item.months?.[9] || 0,
                    item.months?.[10] || 0,
                    item.months?.[11] || 0,
                    item.months?.[12] || 0,
                    item.total_realisasi,
                    item.sisa_anggaran,
                    `${item.persentase}%`,
                ];
                csvContent += row.join(',') + '\r\n';
            });
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `Matriks_Pendapatan_BLUD_${selected_year}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <KeuanganLayout>
            <Head title={`Matriks Realisasi Pendapatan 12 Bulan TA ${selected_year} - RSJ Tampan`} />

            {/* Header Section */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                        Matriks Realisasi Pendapatan 12 Bulan
                    </h1>
                    <p className="mt-1 text-xs font-semibold text-slate-500 sm:text-sm">
                        Monitoring komparasi target vs realisasi kas bulanan (Januari s/d Desember) TA {selected_year}
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                    {/* Filter Year Selector */}
                    <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-1.5 shadow-2xs">
                        <span className="text-xs font-semibold text-slate-500">Tahun:</span>
                        <select
                            value={selected_year}
                            onChange={(e) => handleYearChange(e.target.value)}
                            className="border-none bg-transparent text-xs font-black text-slate-800 focus:ring-0 cursor-pointer p-0 pr-6"
                        >
                            {available_years.map((yr) => (
                                <option key={yr} value={yr}>
                                    TA {yr}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Export CSV */}
                    <button
                        type="button"
                        onClick={exportToCSV}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 active:scale-95 px-3.5 py-2 text-xs font-bold text-slate-700 shadow-2xs transition cursor-pointer"
                    >
                        <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                        <span>Ekspor CSV</span>
                    </button>

                    {/* Print Landscape */}
                    <a
                        href={route('reports.revenue-monthly-matrix.print', { year: selected_year })}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-95 px-4 py-2 text-xs font-bold text-white shadow-2xs transition cursor-pointer"
                    >
                        <Printer className="h-4 w-4" />
                        <span>Cetak Landscape</span>
                    </a>
                </div>
            </div>

            {/* KPI Cards Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex flex-col">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Target Anggaran</span>
                    <h3 className="text-xl font-black text-slate-900 mt-1 truncate">
                        {formatRupiah(grand_total.target_yearly)}
                    </h3>
                    <span className="text-[11px] text-teal-700 font-medium mt-1">Total Target E-BLUD TA {selected_year}</span>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-teal-200 bg-teal-50/20 shadow-2xs flex flex-col">
                    <span className="text-xs font-bold uppercase tracking-wider text-teal-700">Total Realisasi Kas</span>
                    <h3 className="text-xl font-black text-teal-900 mt-1 truncate">
                        {formatRupiah(grand_total.total_realisasi)}
                    </h3>
                    <span className="text-[11px] text-slate-500 font-medium mt-1">Akumulasi 12 Bulan (Jan - Des)</span>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex flex-col">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Sisa Anggaran Target</span>
                    <h3 className="text-xl font-black text-slate-800 mt-1 truncate">
                        {formatSisaAnggaran(grand_total.sisa_anggaran)}
                    </h3>
                    <span className="text-[11px] text-slate-400 font-medium mt-1">
                        {grand_total.sisa_anggaran < 0 ? 'Surplus / Melampaui Target' : 'Target Tersisa Belum Terealisasi'}
                    </span>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-emerald-200 bg-emerald-50/20 shadow-2xs flex flex-col">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">% Capaian Realisasi</span>
                    <div className="flex items-baseline gap-2 mt-1">
                        <h3 className="text-2xl font-black text-emerald-900">
                            {grand_total.persentase}%
                        </h3>
                        <span className="text-xs font-semibold text-emerald-700">
                            {grand_total.persentase >= 100 ? 'Target Terpenuhi' : 'On-Going'}
                        </span>
                    </div>
                    <div className="w-full bg-emerald-100 rounded-full h-1.5 mt-2">
                        <div
                            className="bg-emerald-600 h-1.5 rounded-full"
                            style={{ width: `${Math.min(100, grand_total.persentase)}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="mb-4 bg-white rounded-2xl border border-slate-200 p-3 shadow-2xs flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            type="button"
                            onClick={() => setSelectedCategory(cat)}
                            className={`rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                                selectedCategory === cat
                                    ? 'bg-teal-600 text-white shadow-2xs'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                <div className="w-full sm:w-72">
                    <input
                        type="text"
                        placeholder="Cari uraian pos layanan..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full rounded-xl border-slate-200 bg-slate-50 py-1.5 px-3 text-xs text-slate-800 placeholder-slate-400 focus:border-teal-500 focus:ring-teal-500 focus:bg-white"
                    />
                </div>
            </div>

            {/* Matrix Table Container */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-700 border-collapse">
                        <thead className="bg-slate-100 border-b border-slate-200 text-slate-900 font-bold sticky top-0 z-10">
                            <tr>
                                <th rowSpan={2} className="px-3 py-3 text-center w-12 border-r border-slate-200">No</th>
                                <th rowSpan={2} className="px-4 py-3 min-w-[220px] border-r border-slate-200">Uraian Rekening Pendapatan</th>
                                <th rowSpan={2} className="px-3 py-3 text-right min-w-[140px] border-r border-slate-200">Target Anggaran</th>
                                <th colSpan={12} className="px-2 py-2 text-center border-b border-slate-200 bg-slate-50">
                                    Realisasi Kas Bulanan (Tahun Anggaran {selected_year})
                                </th>
                                <th rowSpan={2} className="px-3 py-3 text-right min-w-[140px] border-l border-slate-200">Total Realisasi</th>
                                <th rowSpan={2} className="px-3 py-3 text-right min-w-[140px] border-l border-slate-200">Sisa Anggaran</th>
                                <th rowSpan={2} className="px-2.5 py-3 text-center min-w-[70px] border-l border-slate-200">%</th>
                            </tr>
                            <tr className="bg-slate-50 text-[11px] text-slate-600 font-semibold border-b border-slate-200">
                                {monthsHeader.map((m) => (
                                    <th key={m.num} className="px-2.5 py-1.5 text-right min-w-[100px] border-r border-slate-200">
                                        {m.label.substring(0, 3)}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                            {/* Grand Total Row at Top of Table */}
                            <tr className="bg-teal-50/60 font-black text-slate-900 border-b-2 border-teal-200">
                                <td className="px-3 py-3 text-center border-r border-teal-100 font-black">4</td>
                                <td className="px-4 py-3 border-r border-teal-100 font-black uppercase text-teal-950">
                                    PENDAPATAN BLUD (TOTAL KESELURUHAN)
                                </td>
                                <td className="px-3 py-3 text-right border-r border-teal-100 text-teal-950 font-black">
                                    {formatRupiah(grand_total.target_yearly)}
                                </td>
                                {monthsHeader.map((m) => (
                                    <td key={m.num} className="px-2.5 py-3 text-right border-r border-teal-100 text-[11px] font-bold text-teal-900">
                                        {formatRupiah(grand_total.months?.[m.num] || 0)}
                                    </td>
                                ))}
                                <td className="px-3 py-3 text-right border-l border-teal-100 text-teal-950 font-black">
                                    {formatRupiah(grand_total.total_realisasi)}
                                </td>
                                <td className="px-3 py-3 text-right border-l border-teal-100 text-slate-900 font-black">
                                    {formatSisaAnggaran(grand_total.sisa_anggaran)}
                                </td>
                                <td className="px-2.5 py-3 text-center border-l border-teal-100">
                                    <span className="inline-block rounded-md bg-teal-700 px-2 py-0.5 text-[11px] font-black text-white">
                                        {grand_total.persentase}%
                                    </span>
                                </td>
                            </tr>

                            {/* Group Categories */}
                            {Object.entries(matrix || {}).map(([category, items], catIdx) => {
                                if (selectedCategory !== 'Semua' && selectedCategory !== category) {
                                    return null;
                                }

                                const catTotal = category_totals[category] || {};
                                const catNumber = `4.${catIdx + 1}`;

                                const filteredItems = items.filter((item) => {
                                    if (!searchQuery) return true;
                                    return item.source_name.toLowerCase().includes(searchQuery.toLowerCase());
                                });

                                if (filteredItems.length === 0) return null;

                                return (
                                    <>
                                        {/* Category Subtotal Header Row */}
                                        <tr key={category} className="bg-slate-50/80 font-bold text-slate-800 border-t border-b border-slate-200">
                                            <td className="px-3 py-2.5 text-center border-r border-slate-200 font-bold">{catNumber}</td>
                                            <td className="px-4 py-2.5 border-r border-slate-200 uppercase text-slate-900 font-bold tracking-wide">
                                                {category}
                                            </td>
                                            <td className="px-3 py-2.5 text-right border-r border-slate-200 font-bold">
                                                {formatRupiah(catTotal.target_yearly)}
                                            </td>
                                            {monthsHeader.map((m) => (
                                                <td key={m.num} className="px-2.5 py-2.5 text-right border-r border-slate-200 text-[11px] font-semibold text-slate-700">
                                                    {formatRupiah(catTotal.months?.[m.num] || 0)}
                                                </td>
                                            ))}
                                            <td className="px-3 py-2.5 text-right border-l border-slate-200 font-bold text-teal-800">
                                                {formatRupiah(catTotal.total_realisasi)}
                                            </td>
                                            <td className="px-3 py-2.5 text-right border-l border-slate-200 font-semibold text-slate-800">
                                                {formatSisaAnggaran(catTotal.sisa_anggaran)}
                                            </td>
                                            <td className="px-2.5 py-2.5 text-center border-l border-slate-200 font-bold">
                                                <span className="text-[11px] font-black text-teal-700">
                                                    {catTotal.persentase}%
                                                </span>
                                            </td>
                                        </tr>

                                        {/* Individual Sources */}
                                        {filteredItems.map((item, itemIdx) => (
                                            <tr key={item.source_name} className="hover:bg-slate-50/70 transition">
                                                <td className="px-3 py-2 text-center text-slate-400 border-r border-slate-100 text-[11px]">
                                                    {catNumber}.{itemIdx + 1}
                                                </td>
                                                <td className="px-4 py-2 font-medium text-slate-800 border-r border-slate-100 pl-6">
                                                    {item.source_name}
                                                </td>
                                                <td className="px-3 py-2 text-right border-r border-slate-100 text-slate-900 font-semibold">
                                                    {formatRupiah(item.target_yearly)}
                                                </td>
                                                {monthsHeader.map((m) => {
                                                    const val = item.months?.[m.num] || 0;
                                                    return (
                                                        <td key={m.num} className="px-2.5 py-2 text-right border-r border-slate-100 text-[11px]">
                                                            {val > 0 ? (
                                                                <span className="text-slate-800 font-medium">{formatRupiah(val)}</span>
                                                            ) : (
                                                                <span className="text-slate-300">-</span>
                                                            )}
                                                        </td>
                                                    );
                                                })}
                                                <td className="px-3 py-2 text-right border-l border-slate-100 font-bold text-slate-900">
                                                    {formatRupiah(item.total_realisasi)}
                                                </td>
                                                <td className="px-3 py-2 text-right border-l border-slate-100 text-slate-700 font-medium">
                                                    {formatSisaAnggaran(item.sisa_anggaran)}
                                                </td>
                                                <td className="px-2.5 py-2 text-center border-l border-slate-100">
                                                    <span
                                                        className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-bold ${
                                                            item.persentase >= 100
                                                                ? 'bg-emerald-100 text-emerald-800'
                                                                : item.persentase >= 50
                                                                ? 'bg-teal-100 text-teal-800'
                                                                : item.persentase > 0
                                                                ? 'bg-amber-100 text-amber-800'
                                                                : 'bg-slate-100 text-slate-500'
                                                        }`}
                                                    >
                                                        {item.persentase}%
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Table Footer Helper */}
                <div className="border-t border-slate-200 bg-slate-50/60 px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
                    <div className="flex items-center gap-3">
                        <span className="inline-flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-emerald-500" /> &gt;= 100% Target Tercapai
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-teal-500" /> &gt;= 50%
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-amber-500" /> &lt; 50%
                        </span>
                    </div>
                    <span>
                        Sisa Anggaran bertanda kurung <strong className="text-slate-800 font-bold">(Rp xxx)</strong> menandakan capaian telah melampaui target yang ditetapkan.
                    </span>
                </div>
            </div>
        </KeuanganLayout>
    );
}
