import KeuanganLayout from '@/Layouts/KeuanganLayout';
import { Head, Link } from '@inertiajs/react';
import { useMemo, useState } from 'react';

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
                label: 'Menunggu Validasi Pagu',
                bg: 'bg-blue-100 text-blue-900 border-blue-300',
                dot: 'bg-blue-500',
                isActionable: true,
            };
        case 'Disetujui_Selesai':
            return {
                label: 'Selesai & Teralokasi',
                bg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
                dot: 'bg-emerald-500',
                isActionable: false,
            };
        case 'Pending_Perencanaan':
            return {
                label: 'Verifikasi Perencanaan',
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

export default function Index({ requisitions = [], success, error }) {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

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
                                placeholder="Cari nomor, divisi, atau PIC..."
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

                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
                            <button
                                type="button"
                                onClick={() => setStatusFilter('ALL')}
                                className={`rounded-lg px-3 py-1.5 font-bold transition border ${
                                    statusFilter === 'ALL'
                                        ? 'bg-emerald-600 text-white border-emerald-700 shadow-2xs'
                                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                                }`}
                            >
                                Semua ({requisitions.length})
                            </button>
                            <button
                                type="button"
                                onClick={() => setStatusFilter('Diproses_Keuangan')}
                                className={`rounded-lg px-3 py-1.5 font-bold transition border ${
                                    statusFilter === 'Diproses_Keuangan'
                                        ? 'bg-blue-600 text-white border-blue-700 shadow-2xs'
                                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                                }`}
                            >
                                Perlu Divalidasi ({pendingFinanceCount})
                            </button>
                            <button
                                type="button"
                                onClick={() => setStatusFilter('Disetujui_Selesai')}
                                className={`rounded-lg px-3 py-1.5 font-bold transition border ${
                                    statusFilter === 'Disetujui_Selesai'
                                        ? 'bg-emerald-600 text-white border-emerald-700 shadow-2xs'
                                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                                }`}
                            >
                                Selesai
                            </button>
                            <button
                                type="button"
                                onClick={() => setStatusFilter('Ditolak')}
                                className={`rounded-lg px-3 py-1.5 font-bold transition border ${
                                    statusFilter === 'Ditolak'
                                        ? 'bg-rose-600 text-white border-rose-700 shadow-2xs'
                                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                                }`}
                            >
                                Ditolak
                            </button>
                        </div>
                    </div>

                    <div className="text-sm text-slate-600 font-medium">
                        Menampilkan <span className="font-bold text-slate-900">{filteredRequisitions.length}</span> dari {requisitions.length} pengajuan
                    </div>
                </div>

                {/* Table Hidup dengan Garis Batas Kolom & Baris Tegas */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y-2 divide-slate-200 border-collapse">
                        <thead className="bg-emerald-50/80 font-bold border-b-2 border-emerald-200">
                            <tr className="divide-x-2 divide-slate-200">
                                <th className="w-16 px-4 py-4 text-center text-sm font-black uppercase tracking-wider text-slate-800">
                                    No
                                </th>
                                <th className="w-40 px-6 py-4 text-left text-sm font-black uppercase tracking-wider text-slate-800">
                                    Tanggal
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-black uppercase tracking-wider text-slate-800">
                                    Nomor Requisition
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-black uppercase tracking-wider text-slate-800">
                                    Divisi / Pemohon
                                </th>
                                <th className="w-40 px-6 py-4 text-center text-sm font-black uppercase tracking-wider text-slate-800">
                                    Macam Barang
                                </th>
                                <th className="w-48 px-6 py-4 text-right text-sm font-black uppercase tracking-wider text-slate-800">
                                    Total Beban Anggaran
                                </th>
                                <th className="w-52 px-6 py-4 text-center text-sm font-black uppercase tracking-wider text-slate-800">
                                    Status
                                </th>
                                <th className="w-40 px-6 py-4 text-center text-sm font-black uppercase tracking-wider text-slate-800">
                                    Aksi
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y-2 divide-slate-200 bg-white">
                            {filteredRequisitions.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="px-6 py-16 text-center bg-white">
                                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 border border-slate-200">
                                            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
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
                                filteredRequisitions.map((req, idx) => {
                                    const badge = getStatusBadge(req.status);
                                    const totalCost = req.requisition_details?.reduce((sum, d) => {
                                        const qty = d.quantity_approved !== null ? Number(d.quantity_approved) : Number(d.quantity_requested || 0);
                                        const price = Number(d.unit_price || d.item?.standard_price || 0);
                                        return sum + (qty * price);
                                    }, 0) || 0;
                                    const itemCount = req.requisition_details?.length || 0;

                                    return (
                                        <tr
                                            key={req.id}
                                            className="divide-x-2 divide-slate-200 hover:bg-emerald-50/60 transition-colors duration-200 cursor-default"
                                        >
                                            {/* No */}
                                            <td className="whitespace-nowrap px-4 py-4 text-center text-sm font-bold text-slate-600 bg-slate-50/50">
                                                #{idx + 1}
                                            </td>

                                            {/* Tanggal */}
                                            <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-slate-700">
                                                {formatTanggal(req.submission_date)}
                                            </td>

                                            {/* Nomor Requisition */}
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-900 border border-emerald-300">
                                                    {req.requisition_number}
                                                </span>
                                            </td>

                                            {/* Divisi & PIC */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-bold text-slate-900">
                                                        {req.division?.name || 'Divisi Tidak Diketahui'}
                                                    </span>
                                                    {req.division?.division_code && (
                                                        <span className="inline-flex rounded-md bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600 border border-slate-300">
                                                            {req.division.division_code}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-slate-500 font-medium mt-0.5">
                                                    PIC: {req.user?.name || '-'}
                                                </p>
                                            </td>

                                            {/* Macam Barang */}
                                            <td className="whitespace-nowrap px-6 py-4 text-center text-sm font-bold text-slate-800">
                                                {itemCount} macam
                                            </td>

                                            {/* Total Beban Anggaran */}
                                            <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-black text-emerald-700">
                                                {formatRupiah(totalCost)}
                                            </td>

                                            {/* Status Badge */}
                                            <td className="whitespace-nowrap px-6 py-4 text-center">
                                                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border ${badge.bg}`}>
                                                    <span className={`h-1.5 w-1.5 rounded-full ${badge.dot}`} />
                                                    {badge.label}
                                                </span>
                                            </td>

                                            {/* Aksi */}
                                            <td className="whitespace-nowrap px-6 py-4 text-center">
                                                {badge.isActionable ? (
                                                    <Link
                                                        href={route('keuangan.requisitions.show', req.id)}
                                                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white px-4 py-2 text-xs font-black shadow-xs hover:shadow-md transition-all duration-200"
                                                    >
                                                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        Proses Anggaran
                                                    </Link>
                                                ) : (
                                                    <Link
                                                        href={route('keuangan.requisitions.show', req.id)}
                                                        className="inline-flex items-center gap-1.5 rounded-xl border-2 border-slate-300 bg-white hover:bg-slate-100 active:scale-95 text-slate-700 px-3.5 py-1.5 text-xs font-bold shadow-2xs transition-all duration-200"
                                                    >
                                                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        </svg>
                                                        Lihat
                                                    </Link>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </KeuanganLayout>
    );
}
