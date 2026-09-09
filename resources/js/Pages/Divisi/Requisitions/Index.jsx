import DivisiLayout from '@/Layouts/DivisiLayout';
import Pagination from '@/Components/Pagination';
import RequisitionFormModal from './Partials/RequisitionFormModal';
import { Head, Link, router } from '@inertiajs/react';
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
                label: 'Verifikasi Perencanaan',
                bg: 'bg-amber-100 text-amber-900 border-amber-300',
                dot: 'bg-amber-500',
            };
        case 'Diproses_Keuangan':
            return {
                label: 'Diproses Keuangan',
                bg: 'bg-blue-100 text-blue-900 border-blue-300',
                dot: 'bg-blue-500',
            };
        case 'Disetujui_Selesai':
            return {
                label: 'Disetujui / Selesai',
                bg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
                dot: 'bg-emerald-500',
            };
        case 'Ditolak':
            return {
                label: 'Ditolak',
                bg: 'bg-rose-100 text-rose-900 border-rose-300',
                dot: 'bg-rose-500',
            };
        default:
            return {
                label: status || 'Pending',
                bg: 'bg-slate-100 text-slate-800 border-slate-300',
                dot: 'bg-slate-400',
            };
    }
};

export default function Index({
    requisitions = [],
    rbaAccounts = [],
    items = [],
    subKegiatanOptions = [],
    defaultFiscalYear = 2027,
    userDivision,
    userUnit,
    selectedJenis = 'ALL',
    selectedYear = 'ALL',
    success,
    error,
}) {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [jenisFilter, setJenisFilter] = useState(selectedJenis);
    const [yearFilter, setYearFilter] = useState(selectedYear);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Pop-Up Modal States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [selectedRequisition, setSelectedRequisition] = useState(null);
    const [modalInitialJenis, setModalInitialJenis] = useState('Operasi');

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

    const filteredRequisitions = useMemo(() => {
        return requisitions.filter((req) => {
            const matchesStatus =
                statusFilter === 'ALL' || req.status === statusFilter;
            const matchesJenis =
                jenisFilter === 'ALL' || req.jenis_belanja === jenisFilter;
            const matchesYear =
                yearFilter === 'ALL' || String(req.fiscal_year) === String(yearFilter);

            if (!search.trim()) return matchesStatus && matchesJenis && matchesYear;

            const q = search.toLowerCase();
            const matchesSearch =
                req.requisition_number?.toLowerCase().includes(q) ||
                req.nomor_surat_unit?.toLowerCase().includes(q) ||
                req.sub_kegiatan?.toLowerCase().includes(q) ||
                req.rba_account?.account_name?.toLowerCase().includes(q) ||
                req.rba_account?.account_code?.toLowerCase().includes(q) ||
                req.user?.name?.toLowerCase().includes(q);

            return matchesStatus && matchesJenis && matchesYear && matchesSearch;
        });
    }, [requisitions, search, statusFilter, jenisFilter, yearFilter]);

    useEffect(() => {
        setCurrentPage(1);
    }, [search, statusFilter, jenisFilter, yearFilter]);

    const totalPages = Math.ceil(filteredRequisitions.length / itemsPerPage) || 1;
    const paginatedRequisitions = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredRequisitions.slice(start, start + itemsPerPage);
    }, [filteredRequisitions, currentPage, itemsPerPage]);

    // Available unique fiscal years
    const availableYears = useMemo(() => {
        const years = new Set(['2027', '2026']);
        requisitions.forEach((r) => {
            if (r.fiscal_year) years.add(String(r.fiscal_year));
        });
        return Array.from(years).sort().reverse();
    }, [requisitions]);

    return (
        <DivisiLayout>
            <Head title="Daftar Pengajuan Belanja - E-BLUD RSJ Tampan" />

            {/* Header Section */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="flex flex-wrap items-center gap-2.5">
                        <h2 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
                            Daftar Usulan Belanja E-BLUD
                        </h2>
                        {userUnit ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-900 border border-emerald-300">
                                <span className="h-2 w-2 rounded-full bg-emerald-600"></span>
                                {userUnit.name} ({userUnit.unit_code})
                            </span>
                        ) : userDivision ? (
                            <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-900 border border-emerald-300">
                                {userDivision.name}
                            </span>
                        ) : null}
                    </div>
                    <p className="mt-1 text-xs sm:text-sm text-slate-600 font-medium">
                        Daftar usulan perencanaan kebutuhan barang operasional & modal RSJ Tampan yang bersumber dari dana BLUD.
                    </p>
                </div>

                <div className="flex items-center gap-2.5">
                    <button
                        type="button"
                        onClick={() => handleOpenCreateModal('Operasi')}
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-emerald-200 bg-white hover:bg-emerald-50 px-4 py-2.5 text-xs font-bold text-emerald-800 shadow-xs hover:border-emerald-300 transition cursor-pointer active:scale-95"
                    >
                        <span>⚡</span>
                        + Usulan Operasi
                    </button>
                    <button
                        type="button"
                        onClick={() => handleOpenCreateModal('Modal')}
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-purple-700 hover:bg-purple-800 active:scale-95 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:shadow-lg transition cursor-pointer"
                    >
                        <span>🏢</span>
                        + Usulan Modal
                    </button>
                </div>
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

            {/* Quick Belanja Tabs Filter */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="inline-flex rounded-xl bg-slate-200/80 p-1">
                    <button
                        type="button"
                        onClick={() => setJenisFilter('ALL')}
                        className={`rounded-lg px-4 py-2 text-xs font-black transition ${
                            jenisFilter === 'ALL'
                                ? 'bg-white text-slate-900 shadow-xs'
                                : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        Semua Jenis Belanja ({requisitions.length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setJenisFilter('Operasi')}
                        className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-black transition ${
                            jenisFilter === 'Operasi'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-emerald-700'
                        }`}
                    >
                        <span>⚡</span>
                        Belanja Operasi BLUD
                    </button>
                    <button
                        type="button"
                        onClick={() => setJenisFilter('Modal')}
                        className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-black transition ${
                            jenisFilter === 'Modal'
                                ? 'bg-purple-700 text-white shadow-xs'
                                : 'text-slate-600 hover:text-purple-700'
                        }`}
                    >
                        <span>🏢</span>
                        Belanja Modal BLUD
                    </button>
                </div>

                {/* Fiscal Year Filter Pills */}
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500">Tahun Anggaran:</span>
                    <select
                        value={yearFilter}
                        onChange={(e) => setYearFilter(e.target.value)}
                        className="rounded-xl border border-slate-300 bg-white py-1.5 pl-3 pr-8 text-xs font-bold text-slate-700 focus:border-emerald-600 focus:ring-emerald-500"
                    >
                        <option value="ALL">Semua Tahun</option>
                        {availableYears.map((yr) => (
                            <option key={yr} value={yr}>
                                TA {yr} {yr === '2027' ? '(Perencanaan)' : ''}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Table Container Card */}
            <div className="overflow-hidden rounded-2xl border border-emerald-100/90 bg-white shadow-md shadow-emerald-950/5 hover:shadow-lg hover:shadow-emerald-900/10 transition-all duration-200">
                {/* Search & Status Filter Toolbar */}
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
                                placeholder="Cari nomor, sub kegiatan, rekening..."
                                className="block w-full rounded-xl border border-slate-300 bg-white pl-9 pr-8 py-2 text-xs sm:text-sm text-slate-900 placeholder-slate-400 font-medium transition focus:border-emerald-600 focus:ring-1 focus:ring-emerald-500"
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

                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
                            <button
                                type="button"
                                onClick={() => setStatusFilter('ALL')}
                                className={`rounded-lg px-3 py-1.5 font-bold transition border ${
                                    statusFilter === 'ALL'
                                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                }`}
                            >
                                Semua
                            </button>
                            <button
                                type="button"
                                onClick={() => setStatusFilter('Pending_Perencanaan')}
                                className={`rounded-lg px-3 py-1.5 font-bold transition border ${
                                    statusFilter === 'Pending_Perencanaan'
                                        ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                }`}
                            >
                                Perencanaan
                            </button>
                            <button
                                type="button"
                                onClick={() => setStatusFilter('Diproses_Keuangan')}
                                className={`rounded-lg px-3 py-1.5 font-bold transition border ${
                                    statusFilter === 'Diproses_Keuangan'
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                }`}
                            >
                                Keuangan
                            </button>
                            <button
                                type="button"
                                onClick={() => setStatusFilter('Disetujui_Selesai')}
                                className={`rounded-lg px-3 py-1.5 font-bold transition border ${
                                    statusFilter === 'Disetujui_Selesai'
                                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                }`}
                            >
                                Selesai
                            </button>
                        </div>
                    </div>

                    <div className="text-xs sm:text-sm text-slate-500 font-medium">
                        Menampilkan <span className="font-bold text-slate-900">{filteredRequisitions.length}</span> usulan
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-emerald-100">
                        <thead className="bg-gradient-to-r from-emerald-50/90 via-teal-50/40 to-emerald-50/90 font-bold border-b border-emerald-100 text-emerald-950 uppercase tracking-wider text-xs">
                            <tr>
                                <th className="w-12 px-4 py-3.5 text-center text-xs font-bold uppercase tracking-wider text-emerald-950">
                                    No
                                </th>
                                <th className="w-36 px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-emerald-950">
                                    Tanggal & TA
                                </th>
                                <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-emerald-950">
                                    Identitas Dokumen & Sub Kegiatan
                                </th>
                                <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-emerald-950">
                                    Kode Rekening RBA
                                </th>
                                <th className="w-28 px-4 py-3.5 text-center text-xs font-bold uppercase tracking-wider text-emerald-950">
                                    Item
                                </th>
                                <th className="w-40 px-5 py-3.5 text-right text-xs font-bold uppercase tracking-wider text-emerald-950">
                                    Estimasi Nilai
                                </th>
                                <th className="w-44 px-4 py-3.5 text-center text-xs font-bold uppercase tracking-wider text-emerald-950">
                                    Status
                                </th>
                                <th className="w-32 px-4 py-3.5 text-center text-xs font-bold uppercase tracking-wider text-emerald-950">
                                    Aksi
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                            {filteredRequisitions.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="px-6 py-16 text-center bg-white">
                                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                            </svg>
                                        </div>
                                        <p className="mt-3 text-sm font-bold text-slate-800">
                                            {search || statusFilter !== 'ALL' || jenisFilter !== 'ALL' || yearFilter !== 'ALL'
                                                ? 'Tidak ada usulan belanja yang sesuai dengan filter'
                                                : 'Belum ada usulan belanja yang diajukan oleh unit Anda'}
                                        </p>
                                        <p className="mt-1 text-xs text-slate-500 font-medium">
                                            Mulai input perencanaan kebutuhan belanja BLUD untuk tahun anggaran berikutnya.
                                        </p>
                                        <div className="mt-4 flex items-center justify-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => handleOpenCreateModal('Operasi')}
                                                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition cursor-pointer active:scale-95"
                                            >
                                                + Usulan Belanja Operasi
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleOpenCreateModal('Modal')}
                                                className="inline-flex items-center gap-1.5 rounded-xl bg-purple-700 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-purple-800 transition cursor-pointer active:scale-95"
                                            >
                                                + Usulan Belanja Modal
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                paginatedRequisitions.map((req, idx) => {
                                    const badge = getStatusBadge(req.status);
                                    const totalCost = Number(req.total_estimated || 0) > 0
                                        ? Number(req.total_estimated)
                                        : req.requisition_details?.reduce(
                                            (sum, d) => sum + (Number(d.quantity_requested || 0) * Number(d.unit_price || 0)),
                                            0
                                        ) || 0;
                                    const itemCount = req.requisition_details?.length || 0;

                                    return (
                                        <tr
                                            key={req.id}
                                            className="hover:bg-emerald-50/40 transition-colors duration-150"
                                        >
                                            <td className="whitespace-nowrap px-4 py-4 text-center text-xs font-semibold text-slate-500">
                                                #{(currentPage - 1) * itemsPerPage + idx + 1}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-4 text-xs">
                                                <div className="font-semibold text-slate-800">
                                                    {formatTanggal(req.submission_date)}
                                                </div>
                                                <div className="mt-0.5">
                                                    <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-black text-amber-800 border border-amber-200">
                                                        TA {req.fiscal_year || '2027'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex flex-col gap-0.5">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-sm text-slate-900">
                                                            {req.requisition_number}
                                                        </span>
                                                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-black ${
                                                            req.jenis_belanja === 'Modal'
                                                                ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                                                : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                                        }`}>
                                                            {req.jenis_belanja === 'Modal' ? 'Modal BLUD' : 'Operasi BLUD'}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-slate-600 font-medium line-clamp-1">
                                                        {req.sub_kegiatan || 'Pelayanan dan Penunjang Pelayanan BLUD'}
                                                    </p>
                                                    {req.nomor_surat_unit && (
                                                        <p className="text-[11px] text-slate-400">
                                                            No. Nota: {req.nomor_surat_unit}
                                                        </p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                {req.rba_account ? (
                                                    <div className="text-xs">
                                                        <span className="font-mono font-bold text-slate-700 block">
                                                            [{req.rba_account.account_code}]
                                                        </span>
                                                        <span className="text-slate-600 line-clamp-1">
                                                            {req.rba_account.account_name}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-slate-400">-</span>
                                                )}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-4 text-center text-xs font-semibold text-slate-700">
                                                <span className="rounded-md bg-slate-100 px-2 py-1 font-bold text-slate-700">
                                                    {itemCount} macam
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap px-5 py-4 text-right text-sm font-black text-emerald-800">
                                                {formatRupiah(totalCost)}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-4 text-center">
                                                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border ${badge.bg}`}>
                                                    <span className={`h-1.5 w-1.5 rounded-full ${badge.dot}`} />
                                                    {badge.label}
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-4 text-center">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <Link
                                                        href={route('requisitions.show', req.id)}
                                                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 px-2.5 py-1 text-xs font-bold text-slate-700 shadow-2xs transition"
                                                        title="Lihat Rincian"
                                                    >
                                                        Detail
                                                    </Link>
                                                    {req.status === 'Pending_Perencanaan' && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleOpenEditModal(req)}
                                                            className="inline-flex items-center gap-1 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 hover:border-amber-400 hover:text-amber-900 px-2.5 py-1 text-xs font-bold text-amber-800 shadow-2xs transition cursor-pointer active:scale-95"
                                                            title="Ubah Usulan Belanja"
                                                        >
                                                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                                                            </svg>
                                                            Edit
                                                        </button>
                                                    )}
                                                    <a
                                                        href={route('requisitions.print', req.id)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 px-2.5 py-1 text-xs font-bold text-slate-700 shadow-2xs transition"
                                                        title="Cetak Dokumen Nota"
                                                    >
                                                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24-1.077-.32-2.14-.32-3.193 0-5.18 4.02-9.386 8.974-9.386 4.954 0 8.973 4.207 8.973 9.386 0 1.053-.08 2.116-.32 3.193M12 18v-4.5m0 0l-2.25 2.25M12 13.5l2.25 2.25M3.75 19.5h16.5" />
                                                        </svg>
                                                    </a>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Component */}
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={filteredRequisitions.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={(p) => setCurrentPage(p)}
                />
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
        </DivisiLayout>
    );
}
