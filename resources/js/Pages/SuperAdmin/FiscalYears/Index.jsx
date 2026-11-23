import DeleteConfirmationModal from '@/Components/DeleteConfirmationModal';
import Modal from '@/Components/Modal';
import SuperAdminLayout from '@/Layouts/SuperAdminLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import {
    AlertCircle,
    Calendar,
    CheckCircle2,
    Edit3,
    FileText,
    Filter,
    Lock,
    Plus,
    Search,
    Shield,
    Star,
    Trash2,
    Unlock,
    Wallet,
} from 'lucide-react';

const formatRp = (val) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(Number(val || 0));

export default function Index({ fiscalYears = [], stats = {}, success, error }) {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'INACTIVE' | 'LOCKED' | 'UNLOCKED'

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
    const [selectedYear, setSelectedYear] = useState(null);
    const [deletingYear, setDeletingYear] = useState(null);
    const [lockingYear, setLockingYear] = useState(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        year: '',
        name: '',
        description: '',
        is_active: true,
        is_default: false,
        is_locked: false,
    });

    const handleOpenCreate = () => {
        reset();
        clearErrors();
        setModalMode('create');
        setSelectedYear(null);
        const nextYear = new Date().getFullYear() + 1;
        setData({
            year: nextYear,
            name: `Tahun Anggaran ${nextYear}`,
            description: '',
            is_active: true,
            is_default: false,
            is_locked: false,
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
            is_locked: Boolean(fy.is_locked),
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
            post(route('superadmin.fiscal-years.store'), {
                onSuccess: () => handleCloseModal(),
            });
        } else {
            put(route('superadmin.fiscal-years.update', selectedYear.id), {
                onSuccess: () => handleCloseModal(),
            });
        }
    };

    const handleToggleStatus = (fy) => {
        router.patch(
            route('superadmin.fiscal-years.toggle-status', fy.id),
            {},
            { preserveScroll: true }
        );
    };

    const handleSetDefault = (fy) => {
        router.patch(
            route('superadmin.fiscal-years.set-default', fy.id),
            {},
            { preserveScroll: true }
        );
    };

    const handleToggleLock = () => {
        if (!lockingYear) return;
        router.patch(
            route('superadmin.fiscal-years.toggle-lock', lockingYear.id),
            {},
            {
                preserveScroll: true,
                onSuccess: () => setLockingYear(null),
            }
        );
    };

    const handleDelete = () => {
        if (!deletingYear) return;
        router.delete(route('superadmin.fiscal-years.destroy', deletingYear.id), {
            preserveScroll: true,
            onSuccess: () => setDeletingYear(null),
        });
    };

    const filteredYears = useMemo(() => {
        return fiscalYears.filter((fy) => {
            if (statusFilter === 'ACTIVE' && !fy.is_active) return false;
            if (statusFilter === 'INACTIVE' && fy.is_active) return false;
            if (statusFilter === 'LOCKED' && !fy.is_locked) return false;
            if (statusFilter === 'UNLOCKED' && fy.is_locked) return false;

            if (!search.trim()) return true;
            const q = search.toLowerCase();
            return (
                String(fy.year).includes(q) ||
                fy.name?.toLowerCase().includes(q) ||
                fy.description?.toLowerCase().includes(q)
            );
        });
    }, [fiscalYears, search, statusFilter]);

    return (
        <SuperAdminLayout>
            <Head title="Tahun Anggaran & Tutup Buku - Super Admin" />

            <div className="space-y-6">
                {/* 1. Header Halaman Standar */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                                Tahun Anggaran & Tutup Buku
                            </h1>
                            <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 border border-indigo-200 px-2 py-0.5 text-xs font-bold text-indigo-700">
                                <Shield className="h-3 w-3" />
                                Master Root
                            </span>
                        </div>
                        <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
                            Kelola periode tahun fiskal, status aktif, penetapan default, dan kontrol tutup buku (*lock/unlock*) anggaran SIM-RS.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleOpenCreate}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 px-4 py-2.5 text-xs font-bold text-white shadow-2xs transition cursor-pointer"
                    >
                        <Plus className="h-4 w-4" />
                        Tambah Tahun Anggaran
                    </button>
                </div>

                {/* 2. Kartu Metrik Ringkasan Eksekutif */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-4.5 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-500">Tahun Default Sistem</span>
                            <div className="rounded-xl bg-amber-50 p-2 text-amber-600 border border-amber-200">
                                <Star className="h-4 w-4 fill-amber-500" />
                            </div>
                        </div>
                        <div className="mt-3 flex items-baseline gap-2">
                            <span className="text-2xl font-bold font-mono text-slate-900">
                                {stats.default_year || '-'}
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold border bg-amber-50 text-amber-800 border-amber-200">
                                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                Primary
                            </span>
                        </div>
                        <p className="mt-1 text-[11px] font-medium text-slate-400">
                            Digunakan saat sesi login pertama
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-white p-4.5 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-500">Tahun Anggaran Aktif</span>
                            <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600 border border-emerald-200">
                                <Calendar className="h-4 w-4" />
                            </div>
                        </div>
                        <div className="mt-3 flex items-baseline gap-2">
                            <span className="text-2xl font-bold font-mono text-slate-900">
                                {stats.active_years_count ?? 0}
                            </span>
                            <span className="text-xs font-semibold text-slate-400">
                                dari {stats.total_years ?? 0} tahun
                            </span>
                        </div>
                        <p className="mt-1 text-[11px] font-medium text-emerald-600 flex items-center gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            Dapat dipilih pada switcher login
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-white p-4.5 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-500">Tutup Buku (Terkunci)</span>
                            <div className="rounded-xl bg-rose-50 p-2 text-rose-600 border border-rose-200">
                                <Lock className="h-4 w-4" />
                            </div>
                        </div>
                        <div className="mt-3 flex items-baseline gap-2">
                            <span className="text-2xl font-bold font-mono text-slate-900">
                                {stats.locked_years_count ?? 0}
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold border bg-rose-50 text-rose-700 border-rose-200">
                                <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                                Locked
                            </span>
                        </div>
                        <p className="mt-1 text-[11px] font-medium text-slate-400">
                            Mutasi data baru ditolak sistem
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-white p-4.5 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-500">Total Periode Terdata</span>
                            <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600 border border-indigo-200">
                                <Shield className="h-4 w-4" />
                            </div>
                        </div>
                        <div className="mt-3 flex items-baseline gap-2">
                            <span className="text-2xl font-bold font-mono text-slate-900">
                                {stats.total_years ?? 0}
                            </span>
                            <span className="text-xs font-semibold text-slate-400">Periode</span>
                        </div>
                        <p className="mt-1 text-[11px] font-medium text-slate-400">
                            Database historis terintegrasi
                        </p>
                    </div>
                </div>

                {/* 3. Kontainer Utama Tabel & Toolbar */}
                <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
                    {/* Toolbar Pencarian & Filter */}
                    <div className="border-b border-slate-200/80 p-4 sm:p-5 bg-slate-50/50">
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Cari tahun atau keterangan..."
                                    className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition shadow-2xs"
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-1.5 shadow-2xs">
                                    <Filter className="h-3.5 w-3.5 text-slate-400" />
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="border-0 bg-transparent py-0 pl-1 pr-6 text-xs font-bold text-slate-700 focus:ring-0 cursor-pointer"
                                    >
                                        <option value="ALL">Semua Status</option>
                                        <option value="ACTIVE">Hanya Aktif</option>
                                        <option value="INACTIVE">Hanya Nonaktif</option>
                                        <option value="LOCKED">Hanya Terkunci (Tutup Buku)</option>
                                        <option value="UNLOCKED">Hanya Terbuka</option>
                                    </select>
                                </div>

                                {(search || statusFilter !== 'ALL') && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSearch('');
                                            setStatusFilter('ALL');
                                        }}
                                        className="rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600 transition cursor-pointer"
                                    >
                                        Reset
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Table View */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-600">
                            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-700 uppercase tracking-wider text-[11px] font-bold">
                                <tr>
                                    <th className="px-5 py-3.5">Tahun & Keterangan</th>
                                    <th className="px-5 py-3.5">Status Akses</th>
                                    <th className="px-5 py-3.5">Kontrol Tutup Buku</th>
                                    <th className="px-5 py-3.5">Transaksi Terdata</th>
                                    <th className="px-5 py-3.5 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredYears.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-5 py-12 text-center">
                                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                                                <Calendar className="h-6 w-6" />
                                            </div>
                                            <p className="mt-3 text-sm font-bold text-slate-800">
                                                Tidak ada data tahun anggaran ditemukan
                                            </p>
                                            <p className="mt-1 text-xs text-slate-400">
                                                Coba sesuaikan kata kunci pencarian atau filter status Anda.
                                            </p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredYears.map((fy) => (
                                        <tr key={fy.id} className="hover:bg-slate-50/70 transition">
                                            {/* 1. Tahun & Keterangan */}
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 font-mono font-black text-sm shadow-2xs">
                                                        {fy.year}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-bold text-slate-900 text-xs sm:text-sm">
                                                                {fy.name}
                                                            </span>
                                                            {fy.is_default && (
                                                                <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold border bg-amber-50 text-amber-800 border-amber-200">
                                                                    <Star className="h-3 w-3 fill-amber-500" />
                                                                    Default
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-[11px] text-slate-400 mt-0.5">
                                                            {fy.description || 'Tidak ada deskripsi tambahan.'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* 2. Status Akses */}
                                            <td className="px-5 py-4">
                                                <button
                                                    type="button"
                                                    onClick={() => handleToggleStatus(fy)}
                                                    className="group inline-flex items-center gap-1.5 cursor-pointer text-left"
                                                    title={fy.is_default ? 'Tahun default tidak dapat dinonaktifkan' : 'Klik untuk mengubah status aktif'}
                                                    disabled={fy.is_default && fy.is_active}
                                                >
                                                    <span
                                                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold border transition ${
                                                            fy.is_active
                                                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 group-hover:bg-emerald-100'
                                                                : 'bg-slate-100 text-slate-600 border-slate-200 group-hover:bg-slate-200'
                                                        }`}
                                                    >
                                                        <span
                                                            className={`h-1.5 w-1.5 rounded-full ${
                                                                fy.is_active ? 'bg-emerald-500' : 'bg-slate-400'
                                                            }`}
                                                        />
                                                        {fy.is_active ? 'Aktif Terbuka' : 'Nonaktif'}
                                                    </span>
                                                </button>
                                            </td>

                                            {/* 3. Kontrol Tutup Buku */}
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span
                                                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold border ${
                                                            fy.is_locked
                                                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                                                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                                        }`}
                                                    >
                                                        {fy.is_locked ? (
                                                            <>
                                                                <Lock className="h-3.5 w-3.5 text-rose-600" />
                                                                Tutup Buku (Terkunci)
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Unlock className="h-3.5 w-3.5 text-emerald-600" />
                                                                Buka Mutasi
                                                            </>
                                                        )}
                                                    </span>

                                                    <button
                                                        type="button"
                                                        onClick={() => setLockingYear(fy)}
                                                        className={`inline-flex items-center gap-1 rounded-xl px-2.5 py-1 text-[11px] font-bold border transition cursor-pointer active:scale-95 shadow-2xs ${
                                                            fy.is_locked
                                                                ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                                                                : 'bg-rose-50 text-rose-800 border-rose-300 hover:bg-rose-100'
                                                        }`}
                                                    >
                                                        {fy.is_locked ? (
                                                            <>
                                                                <Unlock className="h-3 w-3" />
                                                                Buka Kunci
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Lock className="h-3 w-3" />
                                                                Tutup Buku
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            </td>

                                            {/* 4. Transaksi Terdata */}
                                            <td className="px-5 py-4">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-1.5 text-[11px] text-slate-700 font-semibold">
                                                        <FileText className="h-3.5 w-3.5 text-slate-400" />
                                                        <span>{fy.requisitions_count || 0} Usulan Belanja</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-[11px] text-slate-900 font-mono font-bold">
                                                        <Wallet className="h-3.5 w-3.5 text-indigo-500" />
                                                        <span>{formatRp(fy.revenues_sum || 0)}</span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* 5. Aksi */}
                                            <td className="px-5 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    {!fy.is_default && fy.is_active && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleSetDefault(fy)}
                                                            className="inline-flex items-center gap-1 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-800 active:scale-95 px-2.5 py-1 text-xs font-bold transition cursor-pointer shadow-2xs"
                                                            title="Jadikan sebagai tahun default sistem"
                                                        >
                                                            <Star className="h-3 w-3" />
                                                            Default
                                                        </button>
                                                    )}

                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenEdit(fy)}
                                                        className="inline-flex items-center gap-1 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 active:scale-95 px-2.5 py-1 text-xs font-bold transition cursor-pointer shadow-2xs"
                                                        title="Edit Tahun Anggaran"
                                                    >
                                                        <Edit3 className="h-3 w-3" />
                                                        Edit
                                                    </button>

                                                    {!fy.is_default && (
                                                        <button
                                                            type="button"
                                                            onClick={() => setDeletingYear(fy)}
                                                            className="inline-flex items-center gap-1 rounded-xl border border-transparent hover:border-rose-300 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-700 active:scale-95 px-2 py-1 text-xs font-bold transition cursor-pointer"
                                                            title="Hapus Periode Tahun"
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
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
            </div>

            {/* Modal Tambah / Edit Tahun Anggaran */}
            <Modal show={isModalOpen} onClose={handleCloseModal} maxWidth="md">
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                        <div className="flex items-center gap-2.5">
                            <div className="rounded-xl bg-indigo-50 p-2 text-indigo-700 border border-indigo-200">
                                <Calendar className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-slate-900">
                                    {modalMode === 'create' ? 'Tambah Tahun Anggaran Baru' : 'Edit Tahun Anggaran'}
                                </h3>
                                <p className="text-xs text-slate-500">
                                    Konfigurasi parameter periode tahun fiskal E-BLUD RSJ Tampan
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-5 space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                Tahun Anggaran (4 Digit) <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="number"
                                value={data.year}
                                onChange={(e) => setData('year', e.target.value)}
                                disabled={modalMode === 'edit'}
                                placeholder="Contoh: 2027"
                                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-bold text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:bg-slate-100 disabled:text-slate-500 shadow-2xs"
                            />
                            {errors.year && <p className="mt-1 text-xs text-rose-600 font-semibold">{errors.year}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                Nama / Label Tahun <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="Contoh: Tahun Anggaran 2027"
                                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-medium text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-2xs"
                            />
                            {errors.name && <p className="mt-1 text-xs text-rose-600 font-semibold">{errors.name}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                Deskripsi / Catatan Tambahan
                            </label>
                            <textarea
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                rows={2}
                                placeholder="Keterangan peruntukan atau catatan fiskal..."
                                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-medium text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-2xs"
                            />
                            {errors.description && (
                                <p className="mt-1 text-xs text-rose-600 font-semibold">{errors.description}</p>
                            )}
                        </div>

                        <div className="space-y-3 pt-2 border-t border-slate-100">
                            <label className="flex items-center gap-2.5 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={data.is_active}
                                    onChange={(e) => setData('is_active', e.target.checked)}
                                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <span className="text-xs font-bold text-slate-700">
                                    Status Aktif (Tersedia untuk sesi pengguna)
                                </span>
                            </label>

                            <label className="flex items-center gap-2.5 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={data.is_default}
                                    onChange={(e) => setData('is_default', e.target.checked)}
                                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <span className="text-xs font-bold text-slate-700">
                                    Jadikan Tahun Default Sistem Utama
                                </span>
                            </label>

                            <label className="flex items-center gap-2.5 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={data.is_locked}
                                    onChange={(e) => setData('is_locked', e.target.checked)}
                                    className="h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                                />
                                <span className="text-xs font-bold text-rose-700 flex items-center gap-1.5">
                                    <Lock className="h-3.5 w-3.5 text-rose-600" />
                                    Tutup Buku (Terkunci dari mutasi baru)
                                </span>
                            </label>
                        </div>
                    </div>

                    <div className="mt-6 flex items-center justify-end gap-2.5 border-t border-slate-200 pt-4">
                        <button
                            type="button"
                            onClick={handleCloseModal}
                            className="rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700 transition cursor-pointer shadow-2xs"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 px-4.5 py-2 text-xs font-bold text-white transition cursor-pointer shadow-2xs disabled:opacity-50"
                        >
                            {processing ? 'Menyimpan...' : 'Simpan Tahun Anggaran'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Modal Konfirmasi Tutup Buku / Buka Kunci */}
            <Modal show={Boolean(lockingYear)} onClose={() => setLockingYear(null)} maxWidth="sm">
                <div className="p-6">
                    <div className="flex items-center gap-3">
                        <div
                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${
                                lockingYear?.is_locked
                                    ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                                    : 'bg-rose-50 text-rose-600 border-rose-200'
                            }`}
                        >
                            {lockingYear?.is_locked ? <Unlock className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
                        </div>
                        <div>
                            <h3 className="text-sm sm:text-base font-bold text-slate-900">
                                {lockingYear?.is_locked ? 'Buka Kunci Tahun Anggaran?' : 'Konfirmasi Tutup Buku?'}
                            </h3>
                            <p className="text-xs text-slate-500">Tahun Anggaran {lockingYear?.year}</p>
                        </div>
                    </div>

                    <p className="mt-4 text-xs text-slate-600 leading-relaxed">
                        {lockingYear?.is_locked ? (
                            <>
                                Membuka kunci tahun anggaran akan mengizinkan kembali staf divisi, verifikator perencanaan, dan keuangan untuk menginput, mengubah, serta memproses usulan atau pendapatan pada tahun ini.
                            </>
                        ) : (
                            <>
                                Menutup buku tahun anggaran akan <strong>mengunci seluruh transaksi</strong> pada tahun {lockingYear?.year}. Staf ruangan dan verifikator tidak dapat lagi membuat usulan belanja, memproses SP2D, atau mengubah data RBA. Aksi ini akan dicatat ke <strong>Audit Logs</strong>.
                            </>
                        )}
                    </p>

                    <div className="mt-6 flex items-center justify-end gap-2.5">
                        <button
                            type="button"
                            onClick={() => setLockingYear(null)}
                            className="rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700 transition cursor-pointer shadow-2xs"
                        >
                            Batal
                        </button>
                        <button
                            type="button"
                            onClick={handleToggleLock}
                            className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-white transition cursor-pointer shadow-2xs active:scale-95 ${
                                lockingYear?.is_locked
                                    ? 'bg-emerald-600 hover:bg-emerald-700'
                                    : 'bg-rose-600 hover:bg-rose-700'
                            }`}
                        >
                            {lockingYear?.is_locked ? 'Ya, Buka Kunci' : 'Ya, Tutup Buku Sekarang'}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                show={Boolean(deletingYear)}
                onClose={() => setDeletingYear(null)}
                onConfirm={handleDelete}
                title="Hapus Tahun Anggaran"
                message={`Apakah Anda yakin ingin menghapus Tahun Anggaran ${deletingYear?.year}? Data yang dihapus tidak dapat dipulihkan.`}
            />
        </SuperAdminLayout>
    );
}
