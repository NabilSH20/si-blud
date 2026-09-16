import DivisiLayout from '@/Layouts/DivisiLayout';
import Pagination from '@/Components/Pagination';
import RequisitionFormModal from './Partials/RequisitionFormModal';
import RequisitionDetailModal from './Partials/RequisitionDetailModal';
import DeleteConfirmationModal from '@/Components/DeleteConfirmationModal';
import { Head, router } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';

const formatRupiah = (value) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(Number(value || 0));

const formatTanggal = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    }).format(date);
};

const getStatusBadge = (status) => {
    switch (status) {
        case 'Pending_Perencanaan':
            return {
                label: 'Menunggu Telaah',
                className: 'bg-amber-50 text-amber-800 border-amber-200',
                dot: 'bg-amber-500',
            };
        case 'Diproses_Keuangan':
            return {
                label: 'Proses Keuangan',
                className: 'bg-blue-50 text-blue-800 border-blue-200',
                dot: 'bg-blue-500',
            };
        case 'Disetujui_Selesai':
            return {
                label: 'Disetujui Selesai',
                className: 'bg-emerald-50 text-emerald-800 border-emerald-200',
                dot: 'bg-emerald-500',
            };
        case 'Ditolak':
            return {
                label: 'Perlu Perbaikan',
                className: 'bg-rose-50 text-rose-800 border-rose-200',
                dot: 'bg-rose-500',
            };
        default:
            return {
                label: status || 'Pending',
                className: 'bg-slate-50 text-slate-700 border-slate-200',
                dot: 'bg-slate-400',
            };
    }
};

export default function Index({
    requisitions = [],
    rbaAccounts = [],
    items = [],
    subKegiatanOptions = [],
    defaultFiscalYear = 2026,
    active_year,
    userDivision,
    userUnit,
    selectedJenis = 'ALL',
    success,
    error,
}) {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [jenisFilter, setJenisFilter] = useState(selectedJenis);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Baca parameter status dari URL jika ada
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const s = params.get('status');
            if (s) {
                setStatusFilter(s);
            }
        }
    }, []);

    // Pop-Up Modal States (Create & Edit)
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [selectedRequisition, setSelectedRequisition] = useState(null);
    const [modalInitialJenis, setModalInitialJenis] = useState('Operasi');

    // Detail Modal States
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [detailRequisition, setDetailRequisition] = useState(null);

    // Delete Confirmation State
    const [deletingRequisition, setDeletingRequisition] = useState(null);

    const handleOpenCreateModal = (jenis = 'Operasi') => {
        setSelectedRequisition(null);
        setModalMode('create');
        setModalInitialJenis(jenis);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (req) => {
        setSelectedRequisition(req);
        setModalMode('edit');
        setModalInitialJenis(req.jenis_belanja || 'Operasi');
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedRequisition(null);
    };

    const handleOpenDetailModal = (req) => {
        setDetailRequisition(req);
        setIsDetailModalOpen(true);
    };

    const handleCloseDetailModal = () => {
        setIsDetailModalOpen(false);
        setDetailRequisition(null);
    };

    const confirmDelete = (req) => {
        setDeletingRequisition(req);
    };

    const handleDelete = () => {
        if (!deletingRequisition) return;
        router.delete(route('requisitions.destroy', deletingRequisition.id), {
            preserveScroll: true,
            onSuccess: () => setDeletingRequisition(null),
        });
    };

    const filteredRequisitions = useMemo(() => {
        return requisitions.filter((req) => {
            const matchesStatus =
                statusFilter === 'ALL' || req.status === statusFilter;
            const matchesJenis =
                jenisFilter === 'ALL' || req.jenis_belanja === jenisFilter;

            if (!search.trim()) return matchesStatus && matchesJenis;

            const q = search.toLowerCase();
            const matchesSearch =
                req.requisition_number?.toLowerCase().includes(q) ||
                req.nomor_surat_unit?.toLowerCase().includes(q) ||
                req.sub_kegiatan?.toLowerCase().includes(q) ||
                req.rba_account?.account_name?.toLowerCase().includes(q) ||
                req.rba_account?.account_code?.toLowerCase().includes(q) ||
                req.user?.name?.toLowerCase().includes(q);

            return matchesStatus && matchesJenis && matchesSearch;
        });
    }, [requisitions, search, statusFilter, jenisFilter]);

    useEffect(() => {
        setCurrentPage(1);
    }, [search, statusFilter, jenisFilter]);

    const totalPages = Math.ceil(filteredRequisitions.length / itemsPerPage) || 1;
    const paginatedRequisitions = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredRequisitions.slice(start, start + itemsPerPage);
    }, [filteredRequisitions, currentPage, itemsPerPage]);

    const unitDisplayName = userUnit?.name || userDivision?.name || 'Unit Pemohon';

    return (
        <DivisiLayout>
            <Head title="Daftar Usulan Belanja - E-BLUD RSJ Tampan" />

            {/* 1. Header Minimalis (Sesuai Desain Standar Admin & Pengguna) */}
            <div className="mb-6">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Daftar Usulan Belanja E-BLUD
                </h1>
                <p className="mt-1 text-xs sm:text-sm text-slate-500 font-medium">
                    Kebutuhan belanja operasional & modal unit kerja <strong className="text-slate-700">{unitDisplayName}</strong> bersumber dari dana BLUD RSJ Tampan.
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
                                placeholder="Cari nomor, rekening, sub kegiatan..."
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

                        {/* Filter Jenis Belanja */}
                        <select
                            value={jenisFilter}
                            onChange={(e) => setJenisFilter(e.target.value)}
                            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition cursor-pointer"
                        >
                            <option value="ALL">Semua Jenis Belanja</option>
                            <option value="Operasi">Belanja Operasional</option>
                            <option value="Modal">Belanja Modal</option>
                            <option value="Campuran">Belanja Campuran (Operasi & Modal)</option>
                        </select>

                        {/* Badge Tahun Anggaran Aktif */}
                        <div className="inline-flex items-center gap-1.5 rounded-xl border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-bold text-teal-800">
                            <span className="h-2 w-2 rounded-full bg-teal-600" />
                            <span>TA {active_year || defaultFiscalYear}</span>
                        </div>

                        {/* Data Counter */}
                        <div className="text-xs text-slate-500 font-medium whitespace-nowrap">
                            <span className="font-bold text-slate-900">{filteredRequisitions.length}</span> dari {requisitions.length} usulan
                        </div>
                    </div>

                    {/* Dedicated Action Button on the Right (Persis Kelola Pengguna) */}
                    <div>
                        <button
                            type="button"
                            onClick={() => handleOpenCreateModal(jenisFilter === 'Modal' ? 'Modal' : 'Operasi')}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-95 px-4 py-2 text-xs font-bold text-white shadow-2xs transition cursor-pointer whitespace-nowrap"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            + Tambah Usulan
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
                                <th className="w-44 px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-slate-700">
                                    No. Dokumen & Tanggal
                                </th>
                                <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-slate-700">
                                    Sub Kegiatan & Nota Dinas
                                </th>
                                <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-slate-700">
                                    Rekening Belanja RBA
                                </th>
                                <th className="w-24 px-4 py-3.5 text-center text-xs font-bold uppercase tracking-wider text-slate-700">
                                    Item
                                </th>
                                <th className="w-36 px-4 py-3.5 text-right text-xs font-bold uppercase tracking-wider text-slate-700">
                                    Total Anggaran
                                </th>
                                <th className="w-36 px-4 py-3.5 text-center text-xs font-bold uppercase tracking-wider text-slate-700">
                                    Status
                                </th>
                                <th className="w-44 px-4 py-3.5 text-center text-xs font-bold uppercase tracking-wider text-slate-700">
                                    Aksi
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                            {filteredRequisitions.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="px-6 py-16 text-center bg-white">
                                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                                            📋
                                        </div>
                                        <p className="mt-3 text-sm font-bold text-slate-800">
                                            {search || statusFilter !== 'ALL' || jenisFilter !== 'ALL'
                                                ? 'Tidak ada usulan belanja yang sesuai dengan filter pencarian'
                                                : 'Belum ada usulan belanja dari unit Anda'}
                                        </p>
                                        <p className="mt-1 text-xs text-slate-500 font-medium">
                                            Gunakan tombol tambah di atas untuk membuat usulan kebutuhan belanja unit Anda.
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                paginatedRequisitions.map((req, idx) => {
                                    const badge = getStatusBadge(req.status);
                                    const totalCost = Number(req.total_approved || 0) > 0
                                        ? Number(req.total_approved)
                                        : Number(req.total_estimated || 0) > 0
                                        ? Number(req.total_estimated)
                                        : req.requisition_details?.reduce(
                                            (sum, d) => sum + (Number(d.quantity_requested || 0) * Number(d.unit_price || 0)),
                                            0
                                        ) || 0;
                                    const itemCount = req.requisition_details?.length || 0;

                                    return (
                                        <tr
                                            key={req.id}
                                            className="hover:bg-slate-50/80 transition-colors duration-150"
                                        >
                                            {/* No */}
                                            <td className="whitespace-nowrap px-4 py-4 text-center text-xs font-semibold text-slate-400">
                                                #{(currentPage - 1) * itemsPerPage + idx + 1}
                                            </td>

                                            {/* No. Dokumen & Tanggal (Badge Style Persis Kelola Pengguna) */}
                                            <td className="whitespace-nowrap px-5 py-4">
                                                <div className="flex flex-col gap-1">
                                                    <span className="inline-flex items-center w-fit rounded-full bg-blue-100 px-3 py-1 text-xs font-mono font-black text-blue-900 border border-blue-300">
                                                        {req.requisition_number}
                                                    </span>
                                                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium mt-0.5">
                                                        <span>{formatTanggal(req.submission_date || req.created_at)}</span>
                                                        <span>&bull;</span>
                                                        <span className="font-bold text-teal-800">TA {req.budget_year || req.fiscal_year || '2026'}</span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Sub Kegiatan & Nota Dinas */}
                                            <td className="px-5 py-4">
                                                <div className="font-bold text-sm text-slate-900 line-clamp-1" title={req.sub_kegiatan}>
                                                    {req.sub_kegiatan || 'Pelayanan dan Penunjang Pelayanan BLUD'}
                                                </div>
                                                {req.nomor_surat_unit ? (
                                                    <div className="text-xs text-slate-500 font-medium mt-0.5">
                                                        Nota: <strong className="text-slate-700">{req.nomor_surat_unit}</strong>
                                                    </div>
                                                ) : (
                                                    <div className="text-xs text-slate-400 font-medium mt-0.5">
                                                        Tanpa nomor nota dinas
                                                    </div>
                                                )}
                                            </td>

                                            {/* Rekening Belanja RBA */}
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-1.5 mb-1">
                                                    <span
                                                        className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold ${
                                                            req.jenis_belanja === 'Campuran'
                                                                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                                                : req.jenis_belanja === 'Modal'
                                                                ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                                                : 'bg-teal-50 text-teal-700 border border-teal-200'
                                                        }`}
                                                    >
                                                        {req.jenis_belanja === 'Campuran' ? 'Campuran' : (req.jenis_belanja || 'Operasi')}
                                                    </span>
                                                    <span className="text-slate-500 font-mono text-xs font-semibold">
                                                        {req.rba_account?.account_code || (req.jenis_belanja === 'Campuran' ? 'MULTI' : '-')}
                                                    </span>
                                                </div>
                                                <p className="text-xs font-bold text-slate-800 line-clamp-1" title={req.rba_account?.account_name || (req.jenis_belanja === 'Campuran' ? 'Multi-Rekening (Operasi & Modal)' : '-')}>
                                                    {req.rba_account?.account_name || (req.jenis_belanja === 'Campuran' ? 'Multi-Rekening (Operasi & Modal)' : '-')}
                                                </p>
                                            </td>

                                            {/* Item */}
                                            <td className="whitespace-nowrap px-4 py-4 text-center">
                                                <span className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                                                    {itemCount} item
                                                </span>
                                            </td>

                                            {/* Total Biaya */}
                                            <td className="whitespace-nowrap px-4 py-4 text-right font-mono font-bold text-teal-800 text-xs">
                                                {formatRupiah(totalCost)}
                                            </td>

                                            {/* Status Alur */}
                                            <td className="whitespace-nowrap px-4 py-4 text-center">
                                                <span
                                                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold border ${badge.className}`}
                                                >
                                                    <span className={`h-1.5 w-1.5 rounded-full ${badge.dot}`} />
                                                    {badge.label}
                                                </span>
                                            </td>

                                            {/* Aksi (Persis Desain Kelola Pengguna: Detail, Edit Amber, Cetak Toska, Hapus Rose) */}
                                            <td className="whitespace-nowrap px-4 py-4 text-center">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    {/* Detail Button */}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenDetailModal(req)}
                                                        className="inline-flex items-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:text-slate-900 active:scale-95 px-2.5 py-1.5 text-xs font-bold text-slate-700 shadow-2xs transition cursor-pointer"
                                                        title="Lihat Rincian Pengajuan"
                                                    >
                                                        Detail
                                                    </button>

                                                    {/* Edit Amber Button (Hanya jika Pending) */}
                                                    {req.status === 'Pending_Perencanaan' && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleOpenEditModal(req)}
                                                            className="inline-flex items-center gap-1 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 hover:text-amber-900 active:scale-95 px-2.5 py-1.5 text-xs font-bold text-amber-800 shadow-2xs transition cursor-pointer"
                                                            title="Ubah Usulan Belanja"
                                                        >
                                                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                                                            </svg>
                                                            Edit
                                                        </button>
                                                    )}

                                                    {/* Cetak Toska Button */}
                                                    <a
                                                        href={route('requisitions.print', req.id)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1 rounded-xl border border-teal-200 bg-teal-50 hover:bg-teal-100 hover:text-teal-900 active:scale-95 px-2 py-1.5 text-xs font-bold text-teal-800 shadow-2xs transition cursor-pointer"
                                                        title="Cetak Berkas Usulan Resmi"
                                                    >
                                                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24-1.077-.32-2.14-.32-3.193 0-5.18 4.02-9.386 8.974-9.386 4.954 0 8.973 4.207 8.973 9.386 0 1.053-.08 2.116-.32 3.193M12 18v-4.5m0 0l-2.25 2.25M12 13.5l2.25 2.25M3.75 19.5h16.5" />
                                                        </svg>
                                                        Cetak
                                                    </a>

                                                    {/* Hapus Button (Hanya jika Pending / Ditolak) */}
                                                    {['Pending_Perencanaan', 'Ditolak'].includes(req.status) && (
                                                        <button
                                                            type="button"
                                                            onClick={() => confirmDelete(req)}
                                                            className="inline-flex items-center gap-1 rounded-xl border border-transparent hover:border-rose-300 bg-white hover:bg-rose-50 hover:text-rose-700 active:scale-95 px-2 py-1.5 text-xs font-bold text-slate-400 transition cursor-pointer"
                                                            title="Hapus Usulan Belanja"
                                                        >
                                                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                                            </svg>
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* 4. Pagination */}
                <div className="p-4 border-t border-slate-100 bg-white">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={filteredRequisitions.length}
                        itemsPerPage={itemsPerPage}
                        onPageChange={(p) => setCurrentPage(p)}
                    />
                </div>
            </div>

            {/* Pop-Up Modal Formulir Usulan Belanja (Create & Edit) */}
            <RequisitionFormModal
                show={isModalOpen}
                onClose={handleCloseModal}
                requisition={selectedRequisition}
                initialJenis={modalInitialJenis}
                rbaAccounts={rbaAccounts}
                items={items}
                subKegiatanOptions={subKegiatanOptions}
                userDivision={userDivision}
                userUnit={userUnit}
                defaultFiscalYear={defaultFiscalYear}
            />

            {/* Pop-Up Modal Card Rincian Usulan Belanja (Detail) */}
            <RequisitionDetailModal
                show={isDetailModalOpen}
                onClose={handleCloseDetailModal}
                requisition={detailRequisition}
            />

            {/* Modal Konfirmasi Hapus Usulan (Seragam dengan Kelola Pengguna) */}
            <DeleteConfirmationModal
                show={Boolean(deletingRequisition)}
                onClose={() => setDeletingRequisition(null)}
                onConfirm={handleDelete}
                title="Hapus Usulan Belanja"
                message={`Apakah Anda yakin ingin menghapus usulan belanja ${deletingRequisition?.requisition_number}?`}
                itemName={deletingRequisition?.sub_kegiatan}
                itemCode={deletingRequisition?.requisition_number}
            />
        </DivisiLayout>
    );
}
