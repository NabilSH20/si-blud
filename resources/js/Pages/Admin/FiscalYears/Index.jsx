import AdminLayout from '@/Layouts/AdminLayout';
import Modal from '@/Components/Modal';
import DeleteConfirmationModal from '@/Components/DeleteConfirmationModal';
import { Head, router, useForm } from '@inertiajs/react';
import { useMemo, useState } from 'react';

const formatRupiah = (value) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(Number(value || 0));

export default function Index({ fiscalYears = [], success, error }) {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
    const [selectedYear, setSelectedYear] = useState(null);
    const [deletingYear, setDeletingYear] = useState(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        year: '',
        name: '',
        description: '',
        is_active: true,
        is_default: false,
    });

    const handleOpenCreate = () => {
        reset();
        clearErrors();
        setModalMode('create');
        setSelectedYear(null);
        setData({
            year: new Date().getFullYear() + 1,
            name: `Tahun Anggaran ${new Date().getFullYear() + 1}`,
            description: '',
            is_active: true,
            is_default: false,
        });
        setIsModalOpen(true);
    };

    const handleOpenEdit = (fy) => {
        reset();
        clearErrors();
        setModalMode('edit');
        setSelectedYear(fy);
        setData({
            year: fy.year,
            name: fy.name,
            description: fy.description || '',
            is_active: Boolean(fy.is_active),
            is_default: Boolean(fy.is_default),
        });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedYear(null);
        reset();
        clearErrors();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (modalMode === 'create') {
            post(route('fiscal-years.store'), {
                onSuccess: () => handleCloseModal(),
            });
        } else {
            put(route('fiscal-years.update', selectedYear.id), {
                onSuccess: () => handleCloseModal(),
            });
        }
    };

    const handleToggleStatus = (fy) => {
        router.patch(
            route('fiscal-years.toggle-status', fy.id),
            {},
            {
                preserveScroll: true,
            }
        );
    };

    const handleSetDefault = (fy) => {
        router.patch(
            route('fiscal-years.set-default', fy.id),
            {},
            {
                preserveScroll: true,
            }
        );
    };

    const confirmDelete = (fy) => {
        setDeletingYear(fy);
    };

    const handleDelete = () => {
        if (!deletingYear) return;
        router.delete(route('fiscal-years.destroy', deletingYear.id), {
            preserveScroll: true,
            onSuccess: () => setDeletingYear(null),
        });
    };

    const filteredYears = useMemo(() => {
        return fiscalYears.filter((fy) => {
            const matchesStatus =
                statusFilter === 'ALL' ||
                (statusFilter === 'ACTIVE' && fy.is_active) ||
                (statusFilter === 'INACTIVE' && !fy.is_active);

            if (!matchesStatus) return false;

            if (!search.trim()) return true;
            const q = search.toLowerCase();
            return (
                String(fy.year).includes(q) ||
                fy.name?.toLowerCase().includes(q) ||
                fy.description?.toLowerCase().includes(q)
            );
        });
    }, [fiscalYears, search, statusFilter]);

    const defaultYear = fiscalYears.find((y) => y.is_default);
    const activeCount = fiscalYears.filter((y) => y.is_active).length;

    return (
        <AdminLayout>
            <Head title="Kelola Tahun Anggaran - RSJ Tampan" />

            {/* 1. Header Minimalis (Persis Sesuai Manajemen Pengguna) */}
            <div className="mb-6">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Kelola Tahun Anggaran E-BLUD
                </h1>
                <p className="mt-1 text-xs sm:text-sm text-slate-500 font-medium">
                    Pengaturan tahun anggaran akses login, status buka/tutup tahun, dan penetapan tahun anggaran default.
                </p>
            </div>

            {/* Alerts */}
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
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                        </svg>
                    </div>
                    <p className="flex-1">{error}</p>
                </div>
            )}

            {/* Summary Stat Cards */}
            <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                        Tahun Default (Login)
                    </span>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-2xl font-black text-teal-800 font-mono">
                            TA {defaultYear ? defaultYear.year : '-'}
                        </span>
                        <span className="inline-flex items-center rounded-md bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-teal-700 border border-teal-200">
                            Default
                        </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-400 font-medium">Terpilih otomatis saat pengguna membuka login</p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                        Tahun Aktif Buka
                    </span>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-2xl font-black text-slate-900 font-mono">
                            {activeCount}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">Tahun</span>
                    </div>
                    <p className="mt-1 text-xs text-emerald-600 font-medium">Dapat dipilih untuk akses transaksi data</p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                        Total Tahun Terdaftar
                    </span>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-2xl font-black text-slate-900 font-mono">
                            {fiscalYears.length}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">Tahun Anggaran</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-400 font-medium">Tersimpan dalam database E-BLUD</p>
                </div>
            </div>

            {/* 2. Main Card Container (Minimalis Putih Bersih Persis Kelola Pengguna) */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
                {/* Single Row Toolbar (Persis Referensi Kelola Pengguna) */}
                <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 bg-white">
                    <div className="flex flex-wrap items-center gap-2.5">
                        {/* Search Input */}
                        <div className="relative w-full sm:w-64">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari tahun atau keterangan..."
                                className="block w-full rounded-xl border border-slate-300 bg-white pl-9 pr-8 py-2 text-xs text-slate-800 placeholder-slate-400 font-medium transition focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                            />
                            {search && (
                                <button
                                    type="button"
                                    onClick={() => setSearch('')}
                                    className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                                >
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>

                        {/* Filter Status */}
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition cursor-pointer"
                        >
                            <option value="ALL">Semua Status</option>
                            <option value="ACTIVE">Aktif (Buka Akses)</option>
                            <option value="INACTIVE">Nonaktif (Tutup Buku)</option>
                        </select>

                        {/* Data Counter */}
                        <div className="text-xs text-slate-500 font-medium whitespace-nowrap">
                            <span className="font-bold text-slate-900">{filteredYears.length}</span> dari {fiscalYears.length} data
                        </div>
                    </div>

                    {/* Dedicated Action Button on the Right */}
                    <div>
                        <button
                            type="button"
                            onClick={handleOpenCreate}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-95 px-4 py-2 text-xs font-bold text-white shadow-2xs transition cursor-pointer whitespace-nowrap"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            Tambah Tahun Anggaran
                        </button>
                    </div>
                </div>

                {/* 3. Table Minimalis (Persis Referensi Kelola Pengguna) */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-100">
                        <thead className="bg-slate-50 font-bold border-b border-slate-200 text-slate-700 uppercase tracking-wider text-xs">
                            <tr>
                                <th className="w-14 px-4 py-3.5 text-center text-xs font-bold uppercase tracking-wider text-slate-700">
                                    No
                                </th>
                                <th className="w-40 px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-slate-700">
                                    Tahun Anggaran
                                </th>
                                <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-slate-700">
                                    Nama / Label & Keterangan
                                </th>
                                <th className="w-52 px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-slate-700">
                                    Data Terkait
                                </th>
                                <th className="w-36 px-4 py-3.5 text-center text-xs font-bold uppercase tracking-wider text-slate-700">
                                    Status Akses
                                </th>
                                <th className="w-56 px-4 py-3.5 text-center text-xs font-bold uppercase tracking-wider text-slate-700">
                                    Aksi
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                            {filteredYears.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-16 text-center bg-white">
                                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                                            📅
                                        </div>
                                        <p className="mt-3 text-sm font-bold text-slate-800">
                                            Tidak ada data tahun anggaran yang sesuai
                                        </p>
                                        <p className="mt-1 text-xs text-slate-500 font-medium">
                                            Coba ubah kata kunci pencarian atau ubah filter status.
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                filteredYears.map((fy, idx) => (
                                    <tr
                                        key={fy.id}
                                        className={`hover:bg-slate-50/80 transition-colors duration-150 ${
                                            !fy.is_active ? 'bg-slate-50/50 opacity-75' : ''
                                        }`}
                                    >
                                        {/* No */}
                                        <td className="whitespace-nowrap px-4 py-4 text-center text-xs font-semibold text-slate-400">
                                            #{idx + 1}
                                        </td>

                                        {/* Tahun Anggaran Badge Style (Persis NIP/Kode di Kelola Pengguna) */}
                                        <td className="whitespace-nowrap px-5 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-mono font-black text-blue-900 border border-blue-300">
                                                    TA {fy.year}
                                                </span>
                                                {fy.is_default && (
                                                    <span className="inline-flex items-center rounded-md bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-teal-800 border border-teal-200">
                                                        ★ Default
                                                    </span>
                                                )}
                                            </div>
                                        </td>

                                        {/* Nama / Label & Keterangan */}
                                        <td className="px-5 py-4">
                                            <div className="font-bold text-sm text-slate-900">
                                                {fy.name}
                                            </div>
                                            <div className="text-xs text-slate-500 font-medium mt-0.5">
                                                {fy.description || 'Tidak ada catatan tambahan'}
                                            </div>
                                        </td>

                                        {/* Data Terkait */}
                                        <td className="px-5 py-4">
                                            <div className="flex flex-col gap-1 text-xs">
                                                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                                                    <span className="text-slate-400">📋</span>
                                                    <span>{fy.requisitions_count || 0} Usulan Belanja</span>
                                                </div>
                                                <div className="text-[11px] text-teal-700 font-mono font-bold">
                                                    💰 {formatRupiah(fy.revenues_sum)}
                                                </div>
                                            </div>
                                        </td>

                                        {/* Status Akses (Persis Button Status di Kelola Pengguna) */}
                                        <td className="whitespace-nowrap px-4 py-4 text-center">
                                            {fy.is_active ? (
                                                <button
                                                    type="button"
                                                    onClick={() => handleToggleStatus(fy)}
                                                    className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition cursor-pointer"
                                                    title="Klik untuk Menutup / Menonaktifkan"
                                                >
                                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                                    Aktif
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => handleToggleStatus(fy)}
                                                    className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600 border border-slate-300 hover:bg-slate-200 transition cursor-pointer"
                                                    title="Klik untuk Mengaktifkan"
                                                >
                                                    <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                                                    Ditutup
                                                </button>
                                            )}
                                        </td>

                                        {/* Aksi (Persis Desain Kelola Pengguna) */}
                                        <td className="whitespace-nowrap px-4 py-4 text-center">
                                            <div className="flex items-center justify-center gap-1.5">
                                                {!fy.is_default && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleSetDefault(fy)}
                                                        className="inline-flex items-center gap-1 rounded-xl border border-teal-200 bg-teal-50 hover:bg-teal-100 hover:text-teal-900 active:scale-95 px-2.5 py-1.5 text-xs font-bold text-teal-800 shadow-2xs transition cursor-pointer"
                                                        title="Jadikan tahun ini sebagai default saat login"
                                                    >
                                                        ★ Set Default
                                                    </button>
                                                )}

                                                <button
                                                    type="button"
                                                    onClick={() => handleOpenEdit(fy)}
                                                    className="inline-flex items-center gap-1 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 hover:text-amber-900 active:scale-95 px-3 py-1.5 text-xs font-bold text-amber-800 shadow-2xs transition cursor-pointer"
                                                >
                                                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                                                    </svg>
                                                    Edit
                                                </button>

                                                {!fy.is_default && (
                                                    <button
                                                        type="button"
                                                        onClick={() => confirmDelete(fy)}
                                                        className="inline-flex items-center gap-1 rounded-xl border border-transparent hover:border-rose-300 bg-white hover:bg-rose-50 hover:text-rose-700 active:scale-95 px-2.5 py-1.5 text-xs font-bold text-slate-400 transition cursor-pointer"
                                                        title="Hapus Tahun Anggaran"
                                                    >
                                                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                                        </svg>
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Tambah / Ubah Tahun Anggaran */}
            <Modal show={isModalOpen} onClose={handleCloseModal} maxWidth="md">
                <div className="p-6 bg-white rounded-2xl">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3.5 mb-4">
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 text-teal-700 font-bold border border-teal-100">
                                📅
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-slate-900">
                                    {modalMode === 'create' ? 'Tambah Tahun Anggaran' : `Ubah TA ${selectedYear?.year}`}
                                </h3>
                                <p className="text-xs text-slate-500">
                                    Pengaturan tahun anggaran untuk akses dan transaksi E-BLUD
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={handleCloseModal}
                            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer"
                        >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                        {/* Input Tahun (Hanya di mode create) */}
                        {modalMode === 'create' ? (
                            <div>
                                <label className="mb-1 block font-bold text-slate-700">
                                    Tahun Anggaran (4 Digit) <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    min="2020"
                                    max="2050"
                                    value={data.year}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setData((prev) => ({
                                            ...prev,
                                            year: val,
                                            name: val ? `Tahun Anggaran ${val}` : prev.name,
                                        }));
                                    }}
                                    placeholder="Contoh: 2028"
                                    className="block w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                                />
                                {errors.year && <p className="mt-1 text-rose-600 font-semibold">{errors.year}</p>}
                            </div>
                        ) : (
                            <div>
                                <span className="text-slate-500 font-medium">Tahun Anggaran</span>
                                <p className="text-lg font-black font-mono text-slate-900">
                                    {selectedYear?.year}
                                </p>
                            </div>
                        )}

                        {/* Input Nama/Label */}
                        <div>
                            <label className="mb-1 block font-bold text-slate-700">
                                Nama / Label Tahun <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="Contoh: Tahun Anggaran 2028"
                                className="block w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                            />
                            {errors.name && <p className="mt-1 text-rose-600 font-semibold">{errors.name}</p>}
                        </div>

                        {/* Input Keterangan */}
                        <div>
                            <label className="mb-1 block font-bold text-slate-700">
                                Deskripsi / Catatan <span className="text-slate-400 font-normal">(Opsional)</span>
                            </label>
                            <textarea
                                rows={2}
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                placeholder="Keterangan singkat tentang tahun anggaran ini..."
                                className="block w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                            />
                        </div>

                        {/* Checkbox Status Aktif & Default */}
                        <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 space-y-2.5">
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={data.is_active}
                                    onChange={(e) => setData('is_active', e.target.checked)}
                                    className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 h-4 w-4"
                                />
                                <span className="font-semibold text-slate-800">
                                    Status Aktif (Tersedia untuk login & transaksi)
                                </span>
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={data.is_default}
                                    onChange={(e) => setData('is_default', e.target.checked)}
                                    className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 h-4 w-4"
                                />
                                <span className="font-semibold text-slate-800">
                                    Jadikan Tahun Default saat login
                                </span>
                            </label>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={handleCloseModal}
                                disabled={processing}
                                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={processing}
                                className="rounded-xl bg-teal-600 hover:bg-teal-700 px-5 py-2 text-xs font-bold text-white shadow-xs transition cursor-pointer"
                            >
                                {processing ? 'Menyimpan...' : 'Simpan'}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* Modal Konfirmasi Hapus Data (Identik dengan Kelola Pengguna) */}
            <DeleteConfirmationModal
                show={Boolean(deletingYear)}
                onClose={() => setDeletingYear(null)}
                onConfirm={handleDelete}
                title="Hapus Tahun Anggaran"
                message={`Apakah Anda yakin ingin menghapus Tahun Anggaran ${deletingYear?.year}?`}
                itemName={deletingYear?.name}
                itemCode={`TA ${deletingYear?.year}`}
            />
        </AdminLayout>
    );
}
