import PerencanaanLayout from '@/Layouts/PerencanaanLayout';
import Pagination from '@/Components/Pagination';
import QuickVerificationModal from './Partials/QuickVerificationModal';
import RequisitionDetailModal from '@/Pages/Shared/RequisitionDetailModal';
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
                label: 'Menunggu Verifikasi',
                bg: 'bg-amber-100 text-amber-900 border-amber-300',
                dot: 'bg-amber-500',
                isPending: true,
            };
        case 'Diproses_Keuangan':
            return {
                label: 'Diteruskan ke Keuangan',
                bg: 'bg-blue-100 text-blue-900 border-blue-300',
                dot: 'bg-blue-500',
                isPending: false,
            };
        case 'Disetujui_Selesai':
            return {
                label: 'Disetujui / Selesai',
                bg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
                dot: 'bg-emerald-500',
                isPending: false,
            };
        case 'Ditolak':
            return {
                label: 'Ditolak',
                bg: 'bg-rose-100 text-rose-900 border-rose-300',
                dot: 'bg-rose-500',
                isPending: false,
            };
        default:
            return {
                label: status || 'Pending',
                bg: 'bg-slate-100 text-slate-800 border-slate-300',
                dot: 'bg-slate-400',
                isPending: false,
            };
    }
};

export default function Index({ requisitions = [], success, error, selectedYear = 'ALL' }) {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [quickVerifyReq, setQuickVerifyReq] = useState(null);
    const [detailReq, setDetailReq] = useState(null);

    const filteredRequisitions = useMemo(() => {
        return requisitions.filter((req) => {
            const matchesStatus =
                statusFilter === 'ALL' || req.status === statusFilter;
            if (!search.trim()) return matchesStatus;
            const q = search.toLowerCase();
            const matchesSearch =
                req.requisition_number?.toLowerCase().includes(q) ||
                req.division?.name?.toLowerCase().includes(q) ||
                req.division?.division_code?.toLowerCase().includes(q) ||
                req.user?.name?.toLowerCase().includes(q);
            return matchesStatus && matchesSearch;
        });
    }, [requisitions, search, statusFilter]);

    useEffect(() => {
        setCurrentPage(1);
    }, [search, statusFilter]);

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
            <Head title="Verifikasi Pengajuan Requisition - RSJ Tampan" />

            {/* Header Section */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="flex items-center gap-2.5">
                        <h2 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
                            Verifikasi Pengajuan Barang
                        </h2>
                        {pendingCount > 0 ? (
                            <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-900 border border-amber-300">
                                {pendingCount} Perlu Ditinjau
                            </span>
                        ) : (
                            <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-900 border border-emerald-300">
                                Semua Tertangani
                            </span>
                        )}
                    </div>
                    <p className="mt-1 text-xs sm:text-sm text-slate-600 font-medium">
                        Periksa spesifikasi barang dan sesuaikan jumlah yang disetujui sebelum diteruskan ke Bagian Keuangan.
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
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                        </svg>
                    </div>
                    <p className="flex-1">{error}</p>
                </div>
            )}

            {/* Table Container Card (Clean & Modern) */}
            <div className="overflow-hidden rounded-2xl border border-emerald-100/90 bg-white shadow-md shadow-emerald-950/5 hover:shadow-lg hover:shadow-emerald-900/10 transition-all duration-200">
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
                                placeholder="Cari nomor, divisi, atau PIC..."
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

                        {/* Year Filter Switcher */}
                        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 text-xs">
                            <span className="text-[10px] font-black uppercase text-slate-400 px-1">TA:</span>
                            {['ALL', '2026', '2027', '2028'].map((y) => (
                                <button
                                    key={y}
                                    type="button"
                                    onClick={() => router.get(route('perencanaan.requisitions.index'), { fiscal_year: y })}
                                    className={`rounded-lg px-2.5 py-1 text-xs font-black transition cursor-pointer ${
                                        String(selectedYear) === String(y) || (selectedYear === 'ALL' && y === 'ALL')
                                            ? 'bg-emerald-700 text-white shadow-xs'
                                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                                    }`}
                                >
                                    {y === 'ALL' ? 'Semua' : y}
                                </button>
                            ))}
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
                                Semua ({requisitions.length})
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
                                Perlu Ditinjau ({pendingCount})
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
                            <button
                                type="button"
                                onClick={() => setStatusFilter('Ditolak')}
                                className={`rounded-lg px-3 py-1.5 font-bold transition border ${
                                    statusFilter === 'Ditolak'
                                        ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                  }`}
                            >
                                Ditolak
                            </button>
                        </div>
                    </div>

                    <div className="text-xs sm:text-sm text-slate-500 font-medium">
                        Menampilkan <span className="font-bold text-slate-900">{filteredRequisitions.length}</span> dari {requisitions.length} pengajuan
                    </div>
                </div>

                {/* Clean Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-emerald-100">
                        <thead className="bg-gradient-to-r from-emerald-50/90 via-teal-50/40 to-emerald-50/90 font-bold border-b border-emerald-100 text-emerald-950 uppercase tracking-wider text-xs">
                            <tr>
                                <th className="w-14 px-4 py-3.5 text-center text-xs font-bold uppercase tracking-wider text-emerald-950">
                                    No
                                </th>
                                <th className="w-32 px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-emerald-950">
                                    Tanggal
                                </th>
                                <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-emerald-950">
                                    Nomor & Rekening RBA
                                </th>
                                <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-emerald-950">
                                    Divisi / Pemohon
                                </th>
                                <th className="w-28 px-4 py-3.5 text-center text-xs font-bold uppercase tracking-wider text-emerald-950">
                                    Item
                                </th>
                                <th className="w-40 px-5 py-3.5 text-right text-xs font-bold uppercase tracking-wider text-emerald-950">
                                    Estimasi Nilai
                                </th>
                                <th className="w-48 px-4 py-3.5 text-center text-xs font-bold uppercase tracking-wider text-emerald-950">
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
                                            {search || statusFilter !== 'ALL'
                                                ? 'Tidak ada pengajuan yang sesuai dengan kriteria filter'
                                                : 'Belum ada data pengajuan masuk'}
                                        </p>
                                        <p className="mt-1 text-xs text-slate-500 font-medium">
                                            {search || statusFilter !== 'ALL'
                                                ? 'Coba bersihkan pencarian atau ubah filter status.'
                                                : 'Pengajuan kebutuhan barang yang dikirim oleh unit divisi akan otomatis muncul di sini.'}
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                paginatedRequisitions.map((req, idx) => {
                                    const badge = getStatusBadge(req.status);
                                    const totalEstimated = Number(req.total_estimated || 0) > 0
                                        ? Number(req.total_estimated)
                                        : req.requisition_details?.reduce(
                                            (sum, d) => sum + Number(d.subtotal || 0),
                                            0
                                        ) || 0;
                                    const itemCount = req.requisition_details?.length || 0;

                                    return (
                                        <tr
                                            key={req.id}
                                            className="hover:bg-emerald-50/40 transition-colors"
                                        >
                                            {/* No */}
                                            <td className="whitespace-nowrap px-4 py-4 text-center text-xs font-semibold text-slate-500">
                                                #{(currentPage - 1) * itemsPerPage + idx + 1}
                                            </td>

                                            {/* Tanggal & TA */}
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

                                            {/* Nomor & RBA */}
                                            <td className="px-5 py-4">
                                                <div className="flex flex-col gap-0.5">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-sm text-slate-900">
                                                            {req.requisition_number}
                                                        </span>
                                                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                                            req.jenis_belanja === 'Modal'
                                                                ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                                                : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                                        }`}>
                                                            {req.jenis_belanja || 'Operasi'} BLUD
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-slate-600 font-medium line-clamp-1">
                                                        {req.sub_kegiatan || 'Pelayanan dan Penunjang Pelayanan BLUD'}
                                                    </p>
                                                    {req.rba_account && (
                                                        <p className="text-[11px] text-slate-500 line-clamp-1">
                                                            <span className="font-mono font-semibold text-slate-600">[{req.rba_account.account_code}]</span> {req.rba_account.account_name}
                                                        </p>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Divisi & PIC */}
                                            <td className="px-5 py-4">
                                                <span className="text-sm font-semibold text-slate-900 block">
                                                    {req.division?.name || 'Divisi Tidak Diketahui'}
                                                </span>
                                                {req.unit && (
                                                    <span className="inline-block text-xs font-bold text-emerald-700">
                                                        Unit: {req.unit.name}
                                                    </span>
                                                )}
                                                <span className="text-xs text-slate-500 block">
                                                    PIC: {req.user?.name || '-'}
                                                </span>
                                            </td>

                                            {/* Macam Barang */}
                                            <td className="whitespace-nowrap px-4 py-4 text-center text-xs font-semibold text-slate-700">
                                                {itemCount} macam
                                            </td>

                                            {/* Estimasi Nilai */}
                                            <td className="whitespace-nowrap px-5 py-4 text-right text-sm font-bold text-emerald-700">
                                                {formatRupiah(totalEstimated)}
                                            </td>

                                            {/* Status Badge */}
                                            <td className="whitespace-nowrap px-4 py-4 text-center">
                                                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border ${badge.bg}`}>
                                                    <span className={`h-1.5 w-1.5 rounded-full ${badge.dot}`} />
                                                    {badge.label}
                                                </span>
                                            </td>

                                            {/* Aksi */}
                                            <td className="whitespace-nowrap px-4 py-4 text-center">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    {badge.isPending ? (
                                                        <>
                                                            <button
                                                                type="button"
                                                                onClick={() => setQuickVerifyReq(req)}
                                                                className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white px-3 py-1.5 text-xs font-bold shadow-2xs transition cursor-pointer"
                                                            >
                                                                <span>⚡</span>
                                                                Verifikasi
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => setDetailReq(req)}
                                                                className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 active:scale-95 text-slate-700 px-2.5 py-1.5 text-xs font-bold shadow-2xs transition cursor-pointer"
                                                            >
                                                                Detail
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <button
                                                                type="button"
                                                                onClick={() => setDetailReq(req)}
                                                                className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 active:scale-95 text-slate-700 px-3 py-1.5 text-xs font-bold shadow-2xs transition cursor-pointer"
                                                            >
                                                                Rincian
                                                            </button>
                                                            <a
                                                                href={route('requisitions.print', req.id)}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 active:scale-95 text-slate-600 px-2 py-1.5 text-xs font-bold shadow-2xs transition"
                                                                title="Cetak Nota Dinas"
                                                            >
                                                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24-1.077-.32-2.14-.32-3.193 0-5.18 4.02-9.386 8.974-9.386 4.954 0 8.973 4.207 8.973 9.386 0 1.053-.08 2.116-.32 3.193M12 18v-4.5m0 0l-2.25 2.25M12 13.5l2.25 2.25M3.75 19.5h16.5" />
                                                                </svg>
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

                {/* Pagination Component */}
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
