import KeuanganLayout from '@/Layouts/KeuanganLayout';
import Pagination from '@/Components/Pagination';
import FinanceDisbursementModal from './Partials/FinanceDisbursementModal';
import RequisitionDetailModal from '@/Pages/Shared/RequisitionDetailModal';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import { Search, Inbox, CheckCircle2, AlertCircle, Zap, FileText, Printer } from 'lucide-react';

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
        case 'Diproses_Keuangan':
            return {
                label: 'Perlu Alokasi & Validasi',
                bg: 'bg-blue-100 text-blue-900 border-blue-300',
                dot: 'bg-blue-500',
                isActionable: true,
            };
        case 'Disetujui_Selesai':
            return {
                label: 'Disetujui & Selesai',
                bg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
                dot: 'bg-emerald-500',
                isActionable: false,
            };
        case 'Pending_Perencanaan':
            return {
                label: 'Menunggu Perencanaan',
                bg: 'bg-amber-100 text-amber-900 border-amber-300',
                dot: 'bg-amber-500',
                isActionable: false,
            };
        case 'Ditolak':
            return {
                label: 'Ditolak',
                bg: 'bg-rose-100 text-rose-900 border-rose-300',
                dot: 'bg-rose-500',
                isActionable: false,
            };
        default:
            return {
                label: status || 'Pending',
                bg: 'bg-slate-100 text-slate-800 border-slate-300',
                dot: 'bg-slate-400',
                isActionable: false,
            };
    }
};

export default function Index({ requisitions = [], budgets = [], success, error, selectedYear = 'ALL' }) {
    const { url } = usePage();
    let initialStatus = 'ALL';
    if (url.includes('?status=')) {
        initialStatus = decodeURIComponent(url.split('?status=')[1].split('&')[0]);
    }

    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState(initialStatus);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Modal Card States
    const [disbursingReq, setDisbursingReq] = useState(null);
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
        let newStatus = 'ALL';
        if (url.includes('?status=')) {
            newStatus = decodeURIComponent(url.split('?status=')[1].split('&')[0]);
        }
        setStatusFilter(newStatus);
    }, [url]);

    useEffect(() => {
        setCurrentPage(1);
    }, [search, statusFilter]);

    const totalPages = Math.ceil(filteredRequisitions.length / itemsPerPage) || 1;
    const paginatedRequisitions = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredRequisitions.slice(start, start + itemsPerPage);
    }, [filteredRequisitions, currentPage, itemsPerPage]);

    const pendingFinanceCount = useMemo(() => {
        return requisitions.filter((r) => r.status === 'Diproses_Keuangan').length;
    }, [requisitions]);

    return (
        <KeuanganLayout>
            <Head title="Validasi Anggaran Requisition - RSJ Tampan" />

            {/* Header Section */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="flex items-center gap-2.5">
                        <h2 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
                            Validasi Anggaran Requisition
                        </h2>
                        {pendingFinanceCount > 0 ? (
                            <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-black text-blue-900 border border-blue-300">
                                {pendingFinanceCount} Siap Dialokasikan
                            </span>
                        ) : (
                            <span className="inline-flex items-center rounded-full bg-slate-200 px-3 py-1 text-xs font-black text-slate-700 border border-slate-300">
                                {requisitions.length} Pengajuan
                            </span>
                        )}
                    </div>
                    <p className="mt-1 text-xs sm:text-sm text-slate-600 font-medium">
                        Telaah beban anggaran pengajuan yang telah lolos verifikasi Perencanaan, alokasikan rekening belanja, dan potong sisa pagu anggaran.
                    </p>
                </div>
            </div>

            {/* Alerts */}
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

            {/* Table Container Card (Clean & Modern) */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                {/* Search & Filter Toolbar */}
                <div className="flex flex-col gap-3 border-b border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
                        <div className="relative w-full sm:w-96">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <Search className="h-4 w-4 text-slate-400" />
                            </div>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari nomor, divisi, atau PIC..."
                                className="w-full rounded-xl border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:border-teal-500 focus:ring-teal-500 focus:bg-white transition-colors"
                            />
                        </div>
                    </div>

                    <div className="text-xs sm:text-sm text-slate-500 font-medium">
                        Menampilkan <span className="font-bold text-slate-900">{filteredRequisitions.length}</span> dari {requisitions.length} pengajuan
                    </div>
                </div>

                {/* Modern Soft Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-700 divide-y divide-slate-200 border-collapse">
                        <thead className="bg-slate-50 font-bold border-b border-slate-200 text-slate-800 text-xs">
                            <tr>
                                <th className="px-4 py-3.5 text-center w-14">No</th>
                                <th className="px-4 py-3.5 text-left w-32">Tanggal</th>
                                <th className="px-5 py-3.5 text-left">Nomor & Rekening RBA</th>
                                <th className="px-5 py-3.5 text-left">Divisi / Pemohon</th>
                                <th className="px-4 py-3.5 text-center w-28">Item</th>
                                <th className="px-5 py-3.5 text-right w-44">Total Beban Anggaran</th>
                                <th className="px-4 py-3.5 text-center w-48">Status</th>
                                <th className="px-4 py-3.5 text-center w-36">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                            {filteredRequisitions.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="px-6 py-16 text-center bg-white">
                                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 text-slate-400 mb-3 border border-slate-100">
                                            <Inbox className="h-6 w-6" strokeWidth={1.5} />
                                        </div>
                                        <p className="mt-3 text-sm font-bold text-slate-800">
                                            {search || statusFilter !== 'ALL'
                                                ? 'Tidak ada pengajuan yang sesuai dengan filter'
                                                : 'Belum ada pengajuan untuk divalidasi'}
                                        </p>
                                        <p className="mt-1 text-xs text-slate-500 font-medium">
                                            {search || statusFilter !== 'ALL'
                                                ? 'Coba ubah kata kunci atau ganti filter status.'
                                                : 'Pengajuan yang telah lolos verifikasi dari Bagian Perencanaan akan muncul di sini.'}
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                paginatedRequisitions.map((req, idx) => {
                                    const badge = getStatusBadge(req.status);
                                    const totalCost = Number(req.total_approved || 0) > 0
                                        ? Number(req.total_approved)
                                        : req.requisition_details?.reduce((sum, d) => {
                                            const qty = d.quantity_approved !== null ? Number(d.quantity_approved) : Number(d.quantity_requested || 0);
                                            const price = Number(d.unit_price || d.item?.standard_price || 0);
                                            return sum + (qty * price);
                                        }, 0) || 0;
                                    const itemCount = req.requisition_details?.length || 0;

                                    return (
                                        <tr
                                            key={req.id}
                                            className="hover:bg-slate-50/50 transition-colors duration-150"
                                        >
                                            {/* No */}
                                            <td className="whitespace-nowrap px-4 py-4 text-center text-xs font-semibold text-slate-500">
                                                #{(currentPage - 1) * itemsPerPage + idx + 1}
                                            </td>

                                            {/* Tanggal */}
                                            <td className="whitespace-nowrap px-4 py-4 text-xs font-semibold text-slate-700">
                                                {formatTanggal(req.submission_date)}
                                            </td>

                                            {/* Nomor & RBA */}
                                            <td className="px-5 py-4">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-sm text-slate-900">
                                                            {req.requisition_number}
                                                        </span>
                                                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold ${
                                                            req.jenis_belanja === 'Modal'
                                                                ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                                                : 'bg-blue-100 text-blue-800 border border-blue-200'
                                                        }`}>
                                                            {req.jenis_belanja || 'Operasi'}
                                                        </span>
                                                    </div>
                                                    {req.rba_account && (
                                                        <p className="text-xs text-slate-500 line-clamp-1">
                                                            <span className="font-mono text-[11px] font-semibold text-slate-600">[{req.rba_account.account_code}]</span> {req.rba_account.account_name}
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

                                            {/* Total Beban Anggaran */}
                                            <td className="whitespace-nowrap px-5 py-4 text-right text-sm font-bold text-emerald-700">
                                                {formatRupiah(totalCost)}
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
                                                    {badge.isActionable ? (
                                                        <>
                                                            <button
                                                                type="button"
                                                                onClick={() => setDisbursingReq(req)}
                                                                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-3 py-1.5 text-xs font-bold shadow-sm transition cursor-pointer"
                                                            >
                                                                <Zap className="h-3.5 w-3.5" strokeWidth={2.5} />
                                                                Validasi & Cairkan
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => setDetailReq(req)}
                                                                className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 active:scale-95 text-slate-700 px-2.5 py-1.5 text-xs font-bold shadow-sm transition cursor-pointer"
                                                            >
                                                                <FileText className="h-3.5 w-3.5" strokeWidth={2} />
                                                                Detail
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <button
                                                                type="button"
                                                                onClick={() => setDetailReq(req)}
                                                                className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 active:scale-95 text-slate-700 px-3 py-1.5 text-xs font-bold shadow-sm transition cursor-pointer"
                                                            >
                                                                <FileText className="h-3.5 w-3.5" strokeWidth={2} />
                                                                Rincian
                                                            </button>
                                                            <a
                                                                href={route('requisitions.print', req.id)}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 active:scale-95 text-slate-600 px-2.5 py-1.5 text-xs font-bold shadow-sm transition"
                                                                title="Cetak Dokumen Resmi"
                                                            >
                                                                <Printer className="h-3.5 w-3.5" strokeWidth={2} />
                                                                Cetak
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

            {/* Modal Card Validasi & Pencairan SP2D */}
            <FinanceDisbursementModal
                show={Boolean(disbursingReq)}
                onClose={() => setDisbursingReq(null)}
                requisition={disbursingReq}
                budgets={budgets}
            />

            {/* Modal Card Rincian Usulan Belanja */}
            <RequisitionDetailModal
                show={Boolean(detailReq)}
                onClose={() => setDetailReq(null)}
                requisition={detailReq}
            />
        </KeuanganLayout>
    );
}
