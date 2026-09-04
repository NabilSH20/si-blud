import Modal from '@/Components/Modal';
import Pagination from '@/Components/Pagination';
import KeuanganLayout from '@/Layouts/KeuanganLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';

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
    const [confirmingDelete, setConfirmingDelete] = useState(null);

    const deleteForm = useForm();

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

    const submitDelete = (e) => {
        e.preventDefault();
        if (!confirmingDelete) return;

        deleteForm.delete(route('budgets.destroy', confirmingDelete.id), {
            preserveScroll: true,
            onSuccess: () => setConfirmingDelete(null),
        });
    };

    return (
        <KeuanganLayout>
            <Head title="Pagu Anggaran - RSJ Tampan" />

            {/* Header Section */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="flex items-center gap-2.5">
                        <h2 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
                            Pagu Anggaran Rumah Sakit
                        </h2>
                        <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-900 border border-emerald-300">
                            {budgets.length} Rekening Belanja
                        </span>
                    </div>
                    <p className="mt-1 text-xs sm:text-sm text-slate-600 font-medium">
                        Monitoring alokasi pagu anggaran belanja tahunan serta kontrol sisa saldo realisasi pengadaan.
                    </p>
                </div>

                <Link
                    href={route('budgets.create')}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 px-5 py-2.5 text-sm font-bold text-white shadow-md hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Tambah Pagu Anggaran
                </Link>
            </div>

            {/* Notification Alerts */}
            {success && (
                <div className="mb-5 flex items-center gap-3 rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-4 text-sm font-bold text-emerald-900 shadow-xs">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-200 text-emerald-900">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                    </div>
                    <p className="flex-1">{success}</p>
                </div>
            )}
            {error && (
                <div className="mb-5 flex items-center gap-3 rounded-2xl border-2 border-rose-300 bg-rose-50 p-4 text-sm font-bold text-rose-900 shadow-xs">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-rose-200 text-rose-900">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                        </svg>
                    </div>
                    <p className="flex-1">{error}</p>
                </div>
            )}

            {/* Table Container Card (Clean & Modern) */}
            <div className="overflow-hidden rounded-2xl border border-emerald-100/90 bg-white shadow-md shadow-emerald-950/5 hover:shadow-lg hover:shadow-emerald-900/10 transition-shadow">
                {/* Search & Filter Toolbar */}
                <div className="flex flex-col gap-3 border-b border-emerald-100 bg-gradient-to-r from-emerald-50/70 via-teal-50/30 to-slate-50/50 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-1 flex-col gap-2.5 sm:flex-row sm:items-center">
                        <div className="relative flex-1 sm:max-w-xs">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari kode atau nama rekening..."
                                className="block w-full rounded-xl border border-slate-300 bg-white pl-9 pr-8 py-2 text-sm text-slate-900 placeholder-slate-400 font-medium transition focus:border-emerald-600 focus:ring-1 focus:ring-emerald-500"
                            />
                            {search && (
                                <button
                                    type="button"
                                    onClick={() => setSearch('')}
                                    className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400 hover:text-slate-600"
                                >
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>

                        {years.length > 2 && (
                            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
                                {years.map((y) => (
                                    <button
                                        key={y}
                                        type="button"
                                        onClick={() => setSelectedYear(y)}
                                        className={`rounded-lg px-3 py-1.5 font-bold transition border ${
                                            selectedYear === y
                                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                        }`}
                                    >
                                        {y === 'ALL' ? 'Semua Tahun' : `TA ${y}`}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="text-xs sm:text-sm text-slate-500 font-medium">
                        Menampilkan <span className="font-bold text-slate-900">{filteredBudgets.length}</span> dari {budgets.length} data
                    </div>
                </div>

                {/* Modern Soft Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-emerald-100">
                        <thead className="bg-gradient-to-r from-emerald-50/90 via-teal-50/40 to-emerald-50/90 font-bold border-b border-emerald-100 text-emerald-950 uppercase tracking-wider text-xs">
                            <tr>
                                <th className="w-16 px-4 py-3.5 text-center text-xs font-bold uppercase tracking-wider text-emerald-950">
                                    No
                                </th>
                                <th className="w-40 px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-emerald-950">
                                    Kode Rekening
                                </th>
                                <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-emerald-950">
                                    Nama Rekening Anggaran
                                </th>
                                <th className="w-28 px-4 py-3.5 text-center text-xs font-bold uppercase tracking-wider text-emerald-950">
                                    Tahun
                                </th>
                                <th className="w-44 px-5 py-3.5 text-right text-xs font-bold uppercase tracking-wider text-emerald-950">
                                    Total Pagu
                                </th>
                                <th className="w-44 px-5 py-3.5 text-right text-xs font-bold uppercase tracking-wider text-emerald-950 bg-emerald-100/40">
                                    Sisa Pagu
                                </th>
                                <th className="w-36 px-4 py-3.5 text-center text-xs font-bold uppercase tracking-wider text-emerald-950">
                                    Aksi
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                            {filteredBudgets.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-16 text-center bg-white">
                                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <p className="mt-3 text-sm font-bold text-slate-800">
                                            {search || selectedYear !== 'ALL'
                                                ? 'Tidak ada rekening yang cocok dengan filter'
                                                : 'Belum ada rekening anggaran'}
                                        </p>
                                        <p className="mt-1 text-xs text-slate-500 font-medium">
                                            {search || selectedYear !== 'ALL'
                                                ? 'Coba ganti filter tahun anggaran atau bersihkan pencarian.'
                                                : 'Tambahkan data pagu rekening anggaran baru untuk mengaktifkan alokasi belanja.'}
                                        </p>
                                        {!search && selectedYear === 'ALL' && (
                                            <Link
                                                href={route('budgets.create')}
                                                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition"
                                            >
                                                + Tambah Pagu Anggaran
                                            </Link>
                                        )}
                                    </td>
                                </tr>
                            ) : (
                                paginatedBudgets.map((budget, idx) => (
                                    <tr
                                        key={budget.id}
                                        className="hover:bg-emerald-50/40 transition-colors duration-150"
                                    >
                                        <td className="whitespace-nowrap px-4 py-4 text-center text-xs font-semibold text-slate-500">
                                            #{(currentPage - 1) * itemsPerPage + idx + 1}
                                        </td>
                                        <td className="whitespace-nowrap px-5 py-4">
                                            <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-900 border border-emerald-300">
                                                {budget.account_code}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-sm font-bold text-slate-900">
                                            {budget.account_name}
                                        </td>
                                        <td className="whitespace-nowrap px-4 py-4 text-center">
                                            <span className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-800 border border-slate-200">
                                                {budget.period_year}
                                            </span>
                                        </td>
                                        <td className="whitespace-nowrap px-5 py-4 text-right text-sm font-semibold text-slate-800">
                                            {formatRupiah(budget.total_budget)}
                                        </td>
                                        <td className="whitespace-nowrap px-5 py-4 text-right text-sm font-bold text-emerald-700 bg-emerald-50/40">
                                            {formatRupiah(budget.remaining_budget)}
                                        </td>
                                        <td className="whitespace-nowrap px-4 py-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <Link
                                                    href={route('budgets.edit', budget.id)}
                                                    className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 active:scale-95 px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs transition"
                                                >
                                                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                                    </svg>
                                                    Edit
                                                </Link>
                                                <button
                                                    type="button"
                                                    onClick={() => setConfirmingDelete(budget)}
                                                    className="inline-flex items-center gap-1 rounded-xl border border-transparent hover:border-rose-300 bg-white hover:bg-rose-50 hover:text-rose-700 active:scale-95 px-2.5 py-1.5 text-xs font-bold text-slate-400 transition"
                                                >
                                                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Component */}
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={filteredBudgets.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={(p) => setCurrentPage(p)}
                />
            </div>

            {/* Modal Konfirmasi Hapus */}
            <Modal
                show={confirmingDelete !== null}
                onClose={() => setConfirmingDelete(null)}
                maxWidth="md"
            >
                <form onSubmit={submitDelete} className="p-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 border border-rose-200">
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-base font-black text-slate-900">
                                Hapus Rekening Pagu Anggaran?
                            </h3>
                            <p className="text-xs text-slate-500 font-medium">Tindakan ini tidak dapat dibatalkan.</p>
                        </div>
                    </div>

                    <div className="mt-4 rounded-xl bg-slate-100 p-3.5 text-xs text-slate-700 font-medium border border-slate-200">
                        Rekening <span className="font-bold text-slate-900">{confirmingDelete?.account_name}</span> ({confirmingDelete?.account_code}) TA {confirmingDelete?.period_year} akan dihapus dari sistem.
                    </div>

                    <div className="mt-6 flex justify-end gap-2.5">
                        <button
                            type="button"
                            onClick={() => setConfirmingDelete(null)}
                            className="rounded-xl border-2 border-slate-300 bg-white px-5 py-2 text-xs font-bold text-slate-700 shadow-2xs transition hover:bg-slate-100"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={deleteForm.processing}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-5 py-2 text-xs font-black text-white shadow-sm transition hover:bg-rose-700 active:scale-95 disabled:opacity-50"
                        >
                            {deleteForm.processing ? 'Menghapus...' : 'Ya, Hapus Pagu'}
                        </button>
                    </div>
                </form>
            </Modal>
        </KeuanganLayout>
    );
}
