import PerencanaanLayout from '@/Layouts/PerencanaanLayout';
import Pagination from '@/Components/Pagination';
import QuickVerificationModal from './Partials/QuickVerificationModal';
import RequisitionDetailModal from '@/Pages/Shared/RequisitionDetailModal';
import { Head, Link, router, usePage } from '@inertiajs/react';
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
                bg: 'bg-amber-50 text-amber-800 border-amber-200',
                dot: 'bg-amber-500',
                isPending: true,
            };
        case 'Diproses_Keuangan':
            return {
                label: 'Proses Keuangan',
                bg: 'bg-blue-50 text-blue-800 border-blue-200',
                dot: 'bg-blue-500',
                isPending: false,
            };
        case 'Disetujui_Selesai':
            return {
                label: 'Disetujui',
                bg: 'bg-teal-50 text-teal-800 border-teal-200',
                dot: 'bg-teal-600',
                isPending: false,
            };
        case 'Ditolak':
            return {
                label: 'Ditolak',
                bg: 'bg-rose-50 text-rose-800 border-rose-200',
                dot: 'bg-rose-500',
                isPending: false,
            };
        default:
            return {
                label: status || 'Pending',
                bg: 'bg-slate-50 text-slate-700 border-slate-200',
                dot: 'bg-slate-400',
                isPending: false,
            };
    }
};

export default function Index({ requisitions = [], success, error, selectedYear = '2026' }) {
    const pageProps = usePage().props;
    const currentActiveYear = pageProps.active_year || selectedYear || '2026';

    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [jenisFilter, setJenisFilter] = useState('ALL');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [quickVerifyReq, setQuickVerifyReq] = useState(null);
    const [detailReq, setDetailReq] = useState(null);

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
                req.division?.name?.toLowerCase().includes(q) ||
                req.unit?.name?.toLowerCase().includes(q) ||
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

    const pendingCount = useMemo(() => {
        return requisitions.filter((r) => r.status === 'Pending_Perencanaan').length;
    }, [requisitions]);

    return (
        <PerencanaanLayout>
            <Head title="Verifikasi Pengajuan Usulan Belanja - E-BLUD RSJ Tampan" />

            {/* 1. Header Minimalis (Sesuai Standar Admin & Unit) */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                            Verifikasi Usulan Belanja
                        </h1>
                        {pendingCount > 0 ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800 border border-amber-200">
                                <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                                {pendingCount} Menunggu Telaah
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 border border-emerald-200">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                Semua Berkas Selesai Ditelaah
                            </span>
                        )}
                    </div>
                    <p className="mt-1 text-xs sm:text-sm text-slate-500 font-medium">
                        Periksa spesifikasi barang dan sesuaikan volume yang disetujui sebelum diteruskan ke Bagian Keuangan.
                    </p>
                </div>
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

            {/* 2. Main Card Container (Minimalis Putih Bersih Persis Modul Admin & Unit) */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
                {/* Single Row Toolbar (Ramping & Serasi) */}
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
                                placeholder="Cari nomor, unit, rekening, PIC..."
                                className="block w-full rounded-xl border border-slate-300 bg-white pl-9 pr-8 py-2 text-xs text-slate-800 placeholder-slate-400 font-medium transition focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                            />
                            {search && (
                                <button
                                    type="button"
                                    onClick={() => setSearch('')}
                                    className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                                    title="Bersihkan pencarian"
                                >
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>
                        {/* Filter Status dihapus dari UI karena dikelola via Sidebar dropdown */}

                        {/* Filter Jenis Belanja */}
                        <select
                            value={jenisFilter}
                            onChange={(e) => setJenisFilter(e.target.value)}
                            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition cursor-pointer"
                        >
                            <option value="ALL">Semua Jenis Belanja</option>
                            <option value="Operasi">Belanja Operasional</option>
                            <option value="Modal">Belanja Modal</option>
                            <option value="Campuran">Belanja Campuran</option>
                        </select>

                        {/* Badge Tahun Anggaran Aktif */}
                        <div className="inline-flex items-center gap-1.5 rounded-xl border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-bold text-teal-800">
                            <span className="h-2 w-2 rounded-full bg-teal-600" />
                            <span>TA {currentActiveYear}</span>
                        </div>

                        {/* Data Counter */}
                        <div className="text-xs text-slate-500 font-medium whitespace-nowrap">
                            <span className="font-bold text-slate-900">{filteredRequisitions.length}</span> dari {requisitions.length} pengajuan
                        </div>
                    </div>
                </div>

                {/* Clean Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-100 text-xs">
                        <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                            <tr>
                                <th className="w-12 px-4 py-3.5 text-center">No</th>
                                <th className="w-28 px-4 py-3.5 text-left">Tanggal</th>
                                <th className="px-5 py-3.5 text-left">Nomor & Rekening RBA</th>
                                <th className="px-5 py-3.5 text-left">Unit Pengusul</th>
                                <th className="w-28 px-4 py-3.5 text-center">Jenis Belanja</th>
                                <th className="w-36 px-5 py-3.5 text-right">Estimasi Biaya</th>
                                <th className="w-44 px-4 py-3.5 text-center">Status Alur</th>
                                <th className="w-36 px-4 py-3.5 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                            {paginatedRequisitions.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-14 text-center text-slate-400">
                                        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-2">
                                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                            </svg>
                                        </div>
                                        <p className="text-xs font-semibold text-slate-700">
                                            Tidak Ada Berkas Usulan Belanja Ditemukan
                                        </p>
                                        <p className="text-[11px] text-slate-400 mt-0.5">
                                            {search || statusFilter !== 'ALL' || jenisFilter !== 'ALL'
                                                ? 'Coba sesuaikan kata kunci pencarian atau filter yang dipilih.'
                                                : 'Belum ada usulan belanja dari unit pengusul pada tahun anggaran ini.'}
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                paginatedRequisitions.map((req, idx) => {
                                    const badge = getStatusBadge(req.status);
                                    const detailsList = req.requisition_details || req.requisitionDetails || [];
                                    const itemCount = detailsList.length;

                                    return (
                                        <tr key={req.id} className="hover:bg-slate-50/60 transition">
                                            {/* No */}
                                            <td className="px-4 py-3.5 text-center font-semibold text-slate-400">
                                                #{(currentPage - 1) * itemsPerPage + idx + 1}
                                            </td>

                                            {/* Tanggal */}
                                            <td className="px-4 py-3.5 text-xs whitespace-nowrap">
                                                <span className="font-semibold text-slate-800 block">
                                                    {formatTanggal(req.submission_date || req.created_at)}
                                                </span>
                                                {req.nomor_surat_unit && (
                                                    <span className="text-[10px] text-slate-400 block truncate max-w-[120px]" title={req.nomor_surat_unit}>
                                                        Nota: {req.nomor_surat_unit}
                                                    </span>
                                                )}
                                            </td>

                                            {/* Nomor Usulan & Rekening RBA */}
                                            <td className="px-5 py-3.5">
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="inline-block font-mono text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 w-fit">
                                                        {req.requisition_number}
                                                    </span>
                                                    <p className="text-xs font-bold text-slate-900 mt-1 line-clamp-1">
                                                        {req.sub_kegiatan || 'Pelayanan BLUD'}
                                                    </p>
                                                    {req.rba_account && (
                                                        <p className="text-[11px] text-slate-500 line-clamp-1">
                                                            <span className="font-mono text-slate-600">[{req.rba_account.account_code}]</span> {req.rba_account.account_name}
                                                        </p>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Unit Pengusul & PIC */}
                                            <td className="px-5 py-3.5">
                                                <span className="font-bold text-slate-900 block">
                                                    {req.unit?.name || req.division?.name || 'Unit Pengusul'}
                                                </span>
                                                {req.division?.name && req.unit?.name && (
                                                    <span className="text-[11px] text-slate-500 block">
                                                        {req.division.name}
                                                    </span>
                                                )}
                                                <span className="text-[10px] text-slate-400 block mt-0.5">
                                                    PIC: {req.user?.name || '-'}
                                                </span>
                                            </td>

                                            {/* Jenis Belanja */}
                                            <td className="px-4 py-3.5 text-center">
                                                <span
                                                    className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold ${
                                                        req.jenis_belanja === 'Modal'
                                                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                                            : req.jenis_belanja === 'Campuran'
                                                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                    }`}
                                                >
                                                    {req.jenis_belanja || 'Operasi'}
                                                </span>
                                                {itemCount > 0 && (
                                                    <span className="block text-[10px] text-slate-400 mt-0.5">
                                                        {itemCount} item
                                                    </span>
                                                )}
                                            </td>

                                            {/* Estimasi Biaya */}
                                            <td className="px-5 py-3.5 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                                                {formatRupiah(req.total_estimated)}
                                            </td>

                                            {/* Status Alur */}
                                            <td className="px-4 py-3.5 text-center whitespace-nowrap">
                                                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold border ${badge.bg}`}>
                                                    <span className={`h-1.5 w-1.5 rounded-full ${badge.dot}`} />
                                                    {badge.label}
                                                </span>
                                            </td>

                                            {/* Aksi */}
                                            <td className="px-4 py-3.5 text-center whitespace-nowrap">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    {badge.isPending ? (
                                                        <>
                                                            <button
                                                                type="button"
                                                                onClick={() => setQuickVerifyReq(req)}
                                                                className="inline-flex items-center gap-1 rounded-lg bg-teal-600 hover:bg-teal-700 active:scale-95 text-white px-2.5 py-1 text-xs font-bold shadow-2xs transition cursor-pointer"
                                                                title="Verifikasi kuantitas & teruskan berkas"
                                                            >
                                                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                </svg>
                                                                <span>Telaah</span>
                                                            </button>

                                                            <button
                                                                type="button"
                                                                onClick={() => setDetailReq(req)}
                                                                className="inline-flex items-center rounded-lg border border-slate-300 bg-white hover:bg-slate-50 active:scale-95 text-slate-700 px-2.5 py-1 text-xs font-bold shadow-2xs transition cursor-pointer"
                                                                title="Lihat rincian usulan"
                                                            >
                                                                Detail
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <button
                                                                type="button"
                                                                onClick={() => setDetailReq(req)}
                                                                className="inline-flex items-center rounded-lg border border-slate-300 bg-white hover:bg-slate-50 active:scale-95 text-slate-700 px-2.5 py-1 text-xs font-bold shadow-2xs transition cursor-pointer"
                                                                title="Lihat rincian usulan"
                                                            >
                                                                Detail
                                                            </button>

                                                            <a
                                                                href={route('requisitions.print', req.id)}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="inline-flex items-center gap-1 rounded-lg border border-teal-200 bg-teal-50 hover:bg-teal-100 text-teal-800 px-2.5 py-1 text-xs font-bold shadow-2xs transition cursor-pointer"
                                                                title="Cetak Dokumen Resmi RBA / Nota Dinas"
                                                            >
                                                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24-1.077-.32-2.14-.32-3.193 0-5.18 4.02-9.386 8.974-9.386 4.954 0 8.973 4.207 8.973 9.386 0 1.053-.08 2.116-.32 3.193M12 18v-4.5m0 0l-2.25 2.25M12 13.5l2.25 2.25M3.75 19.5h16.5" />
                                                                </svg>
                                                                <span>Cetak</span>
                                                            </a>
                                                        </>
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

                {/* Pagination */}
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={filteredRequisitions.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={(p) => setCurrentPage(p)}
                />
            </div>

            {/* Modal Card Verifikasi Cepat */}
            <QuickVerificationModal
                show={quickVerifyReq !== null}
                onClose={() => setQuickVerifyReq(null)}
                requisition={quickVerifyReq}
            />

            {/* Modal Card Rincian Usulan Belanja */}
            <RequisitionDetailModal
                show={Boolean(detailReq)}
                onClose={() => setDetailReq(null)}
                requisition={detailReq}
            />
        </PerencanaanLayout>
    );
}
