import Modal from '@/Components/Modal';
import KeuanganLayout from '@/Layouts/KeuanganLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useMemo, useState } from 'react';

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

            {/* Table Container Card (Batas Jelas & Kontras Tinggi) */}
            <div className="overflow-hidden rounded-2xl border-2 border-slate-300 bg-white shadow-md">
                {/* Search & Filter Toolbar */}
                <div className="flex flex-col gap-3 border-b-2 border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-1 flex-col gap-2.5 sm:flex-row sm:items-center">
                        <div className="relative flex-1 sm:max-w-xs">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari kode atau nama rekening..."
                                className="block w-full rounded-xl border-2 border-slate-300 bg-white pl-9 pr-8 text-sm text-slate-900 placeholder-slate-400 font-medium transition-all duration-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/30"
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
                                                ? 'bg-emerald-600 text-white border-emerald-700 shadow-2xs'
                                                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                                        }`}
                                    >
                                        {y === 'ALL' ? 'Semua Tahun' : `TA ${y}`}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="text-sm text-slate-600 font-medium">
                        Menampilkan <span className="font-bold text-slate-900">{filteredBudgets.length}</span> dari {budgets.length} data
                    </div>
                </div>

                {/* Table Hidup dengan Garis Batas Kolom & Hover Interaktif */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y-2 divide-slate-200 border-collapse">
                        <thead className="bg-emerald-50/80 font-bold border-b-2 border-emerald-200">
                            <tr className="divide-x-2 divide-slate-200">
                                <th className="w-16 px-4 py-4 text-center text-sm font-black uppercase tracking-wider text-slate-800">
                                    No
                                </th>
                                <th className="w-44 px-6 py-4 text-left text-sm font-black uppercase tracking-wider text-slate-800">
                                    Kode Rekening
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-black uppercase tracking-wider text-slate-800">
                                    Nama Rekening Anggaran
                                </th>
                                <th className="w-28 px-4 py-4 text-center text-sm font-black uppercase tracking-wider text-slate-800">
                                    Tahun
                                </th>
                                <th className="w-44 px-6 py-4 text-right text-sm font-black uppercase tracking-wider text-slate-800">
                                    Total Pagu
                                </th>
                                <th className="w-44 px-6 py-4 text-right text-sm font-black uppercase tracking-wider text-emerald-800 bg-emerald-100/60">
                                    Sisa Pagu
                                </th>
                                <th className="w-40 px-6 py-4 text-center text-sm font-black uppercase tracking-wider text-slate-800">
                                    Aksi
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y-2 divide-slate-200 bg-white">
                            {filteredBudgets.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-16 text-center bg-white">
                                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 border border-slate-200">
                                            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                                            </svg>
                                        </div>
                                        <p className="mt-3 text-sm font-bold text-slate-800">
                                            {search || selectedYear !== 'ALL'
                                                ? 'Tidak ada rekening pagu yang cocok dengan pencarian'
                                                : 'Belum ada data pagu anggaran'}
                                        </p>
                                        <p className="mt-1 text-xs text-slate-500 font-medium">
                                            {search || selectedYear !== 'ALL'
                                                ? 'Coba ubah filter tahun atau bersihkan kotak pencarian.'
                                                : 'Buat data pagu baru untuk memulai alokasi pengadaan.'}
                                        </p>
                                        {!search && selectedYear === 'ALL' && (
                                            <Link
                                                href={route('budgets.create')}
                                                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition"
                                            >
                                                + Tambah Pagu Pertama
                                            </Link>
                                        )}
                                    </td>
                                </tr>
                            ) : (
                                filteredBudgets.map((budget, idx) => (
                                    <tr
                                        key={budget.id}
                                        className="divide-x-2 divide-slate-200 hover:bg-emerald-50/60 transition-colors duration-200 cursor-default"
                                    >
                                        <td className="whitespace-nowrap px-4 py-4 text-center text-sm font-bold text-slate-600 bg-slate-50/50">
                                            #{idx + 1}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4">
                                            <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-900 border border-emerald-300">
                                                {budget.account_code}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-slate-900">
                                            {budget.account_name}
                                        </td>
                                        <td className="whitespace-nowrap px-4 py-4 text-center">
                                            <span className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-800 border border-slate-300">
                                                {budget.period_year}
                                            </span>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-bold text-slate-800">
                                            {formatRupiah(budget.total_budget)}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-black text-emerald-800 bg-emerald-50/60">
                                            {formatRupiah(budget.remaining_budget)}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <Link
                                                    href={route('budgets.edit', budget.id)}
                                                    className="inline-flex items-center gap-1.5 rounded-xl border-2 border-slate-300 bg-white hover:bg-emerald-50 hover:border-emerald-500 hover:text-emerald-700 active:scale-95 px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs transition-all duration-200"
                                                >
                                                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                                    </svg>
                                                    Edit
                                                </Link>
                                                <button
                                                    type="button"
                                                    onClick={() => setConfirmingDelete(budget)}
                                                    className="inline-flex items-center gap-1.5 rounded-xl border-2 border-transparent hover:border-rose-300 bg-white hover:bg-rose-50 hover:text-rose-700 active:scale-95 px-3 py-1.5 text-xs font-bold text-slate-500 transition-all duration-200"
                                                >
                                                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                                    </svg>
                                                    Hapus
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
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
