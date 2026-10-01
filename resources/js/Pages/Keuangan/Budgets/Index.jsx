import Pagination from '@/Components/Pagination';
import KeuanganLayout from '@/Layouts/KeuanganLayout';
import { Head } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import { Info, Search, Inbox, CheckCircle2, AlertCircle } from 'lucide-react';

const formatRupiah = (value) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(Number(value || 0));

export default function Index({ budgets = [], success, error }) {
    const [search, setSearch] = useState('');
    const [selectedYear, setSelectedYear] = useState('ALL');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const years = useMemo(() => {
        const set = new Set(budgets.map((b) => b.period_year).filter(Boolean));
        return ['ALL', ...Array.from(set).sort((a, b) => b - a)];
    }, [budgets]);

    const filteredBudgets = useMemo(() => {
        return budgets.filter((budget) => {
            const matchesYear =
                selectedYear === 'ALL' ||
                String(budget.period_year) === String(selectedYear);
            if (!search.trim()) return matchesYear;
            const q = search.toLowerCase();
            const matchesSearch =
                budget.account_name?.toLowerCase().includes(q) ||
                budget.account_code?.toLowerCase().includes(q);
            return matchesYear && matchesSearch;
        });
    }, [budgets, search, selectedYear]);

    useEffect(() => {
        setCurrentPage(1);
    }, [search, selectedYear]);

    const totalPages = Math.ceil(filteredBudgets.length / itemsPerPage) || 1;
    const paginatedBudgets = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredBudgets.slice(start, start + itemsPerPage);
    }, [filteredBudgets, currentPage, itemsPerPage]);

    return (
        <KeuanganLayout>
            <Head title="Pagu Anggaran - RSJ Tampan" />

            {/* Header Section */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
                        Pagu Anggaran Rumah Sakit
                    </h2>
                    <p className="mt-1 text-xs sm:text-sm text-slate-600 font-medium">
                        Monitoring alokasi pagu anggaran belanja tahunan serta kontrol sisa saldo realisasi pengadaan.
                    </p>
                </div>
            </div>

            {/* Read-Only Notice */}
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm font-medium text-blue-900 shadow-sm">
                <Info className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
                <p>
                    <strong>Informasi:</strong> Nilai pagu anggaran dikendalikan secara terpusat melalui proses RBA. Untuk menyesuaikan atau mengubah pagu anggaran, silakan ajukan perubahan/pergeseran RBA melalui menu Perencanaan.
                </p>
            </div>

            {/* Notification Alerts */}
            {success && (
                <div className="mb-5 flex items-center gap-3 rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-900 shadow-sm">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                    <p className="flex-1">{success}</p>
                </div>
            )}
            {error && (
                <div className="mb-5 flex items-center gap-3 rounded-2xl border-2 border-rose-200 bg-rose-50 p-4 text-sm font-bold text-rose-900 shadow-sm">
                    <AlertCircle className="h-5 w-5 shrink-0 text-rose-600" />
                    <p className="flex-1">{error}</p>
                </div>
            )}

            {/* Filter & Search Bar */}
            <div className="mb-4 bg-white rounded-2xl border border-slate-200 p-3 shadow-sm flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative w-full sm:w-96">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <Search className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Cari kode atau nama rekening..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full rounded-xl border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:border-teal-500 focus:ring-teal-500 focus:bg-white transition-colors"
                    />
                </div>

                {years.length > 2 && (
                    <div className="flex items-center gap-2 overflow-x-auto text-sm font-semibold text-slate-600">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 whitespace-nowrap">Tahun:</span>
                        {years.map((y) => (
                            <button
                                key={y}
                                type="button"
                                onClick={() => setSelectedYear(y)}
                                className={`rounded-lg px-3 py-1.5 transition-colors whitespace-nowrap ${
                                    selectedYear === y
                                        ? 'bg-slate-800 text-white font-bold'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                                {y === 'ALL' ? 'Semua' : y}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Main Table Container */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-700 divide-y divide-slate-200 border-collapse">
                        <thead className="bg-slate-50 font-bold border-b border-slate-200 text-slate-800 text-xs">
                            <tr>
                                <th className="px-4 py-3.5 text-center w-14">No</th>
                                <th className="px-5 py-3.5 whitespace-nowrap">Kode Rekening</th>
                                <th className="px-5 py-3.5">Nama Rekening Anggaran</th>
                                <th className="px-4 py-3.5 text-center w-28">Tahun</th>
                                <th className="px-5 py-3.5 text-right w-44">Total Pagu</th>
                                <th className="px-5 py-3.5 text-right w-44">Sisa Pagu</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                            {filteredBudgets.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center">
                                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 text-slate-400 mb-3 border border-slate-100">
                                            <Inbox className="h-6 w-6" strokeWidth={1.5} />
                                        </div>
                                        <p className="text-slate-500 text-sm font-medium">
                                            {search || selectedYear !== 'ALL'
                                                ? 'Tidak ada rekening yang cocok dengan filter pencarian.'
                                                : 'Belum ada data pagu anggaran RBA.'}
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                paginatedBudgets.map((budget, idx) => (
                                    <tr
                                        key={budget.id}
                                        className="hover:bg-slate-50/50 transition-colors duration-150"
                                    >
                                        <td className="whitespace-nowrap px-4 py-4 text-center text-xs font-semibold text-slate-500">
                                            #{(currentPage - 1) * itemsPerPage + idx + 1}
                                        </td>
                                        <td className="whitespace-nowrap px-5 py-4 font-mono text-xs font-bold text-slate-900">
                                            {budget.account_code}
                                        </td>
                                        <td 
                                            className={`px-5 py-4 text-sm text-slate-800 ${budget.account_code.split('.').length <= 4 ? 'font-bold' : 'font-medium'}`}
                                            style={{ paddingLeft: `${Math.max(1, budget.account_code.split('.').length - 1) * 1.25}rem` }}
                                        >
                                            {budget.account_code.split('.').length <= 4 && (
                                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-400 mr-2 -translate-y-px"></span>
                                            )}
                                            {budget.account_name}
                                        </td>
                                        <td className="whitespace-nowrap px-4 py-4 text-center">
                                            <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-black text-slate-600 border border-slate-200">
                                                {budget.period_year}
                                            </span>
                                        </td>
                                        <td className="whitespace-nowrap px-5 py-4 text-right text-sm font-bold text-slate-800">
                                            {formatRupiah(budget.total_budget)}
                                        </td>
                                        <td className="whitespace-nowrap px-5 py-4 text-right text-sm font-black text-emerald-700">
                                            {formatRupiah(budget.remaining_budget)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Component */}
                <div className="border-t border-slate-200">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={filteredBudgets.length}
                        itemsPerPage={itemsPerPage}
                        onPageChange={(p) => setCurrentPage(p)}
                    />
                </div>
            </div>
        </KeuanganLayout>
    );
}
