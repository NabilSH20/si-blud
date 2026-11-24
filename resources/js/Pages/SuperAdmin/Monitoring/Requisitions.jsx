import Modal from '@/Components/Modal';
import SuperAdminLayout from '@/Layouts/SuperAdminLayout';
import { Head, Link, router } from '@inertiajs/react';
import {
    AlertCircle,
    Calendar,
    CheckCircle2,
    Clock,
    Eye,
    FileText,
    Filter,
    RotateCcw,
    Search,
    Shield,
    X,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';

export default function MonitoringRequisitions({
    active_year,
    requisitions = { data: [], links: [] },
    divisions = [],
    filters = {},
}) {
    const [q, setQ] = useState(filters.q || '');
    const [status, setStatus] = useState(filters.status || 'ALL');
    const [divisionId, setDivisionId] = useState(filters.division_id || 'ALL');
    const [selectedReq, setSelectedReq] = useState(null);

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(
            route('superadmin.monitoring.requisitions'),
            { q, status, division_id: divisionId },
            { preserveState: true, replace: true }
        );
    };

    const handleReset = () => {
        setQ('');
        setStatus('ALL');
        setDivisionId('ALL');
        router.get(
            route('superadmin.monitoring.requisitions'),
            {},
            { preserveState: true, replace: true }
        );
    };

    const formatRp = (val) =>
        new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(Number(val || 0));

    const getStatusBadge = (statusName) => {
        switch (statusName) {
            case 'Pending_Perencanaan':
            case 'Diajukan':
                return {
                    label: 'Menunggu Telaah',
                    bg: 'bg-amber-50 text-amber-800 border-amber-200',
                    dot: 'bg-amber-500',
                };
            case 'Disetujui':
            case 'Disetujui_Selesai':
            case 'Disetujui_Perencanaan':
                return {
                    label: 'Disetujui (ACC Final)',
                    bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
                    dot: 'bg-emerald-500',
                };
            case 'Ditolak_Perencanaan':
            case 'Ditolak':
                return {
                    label: 'Ditolak Perencanaan',
                    bg: 'bg-rose-50 text-rose-700 border-rose-200',
                    dot: 'bg-rose-500',
                };
            default:
                return {
                    label: statusName || 'Draft',
                    bg: 'bg-slate-100 text-slate-700 border-slate-300',
                    dot: 'bg-slate-400',
                };
        }
    };

    return (
        <SuperAdminLayout>
            <Head title={`Monitoring Pengajuan Belanja TA ${active_year} - Super Admin`} />

            <div className="space-y-6">
                {/* 1. Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                                Monitoring Pengajuan Belanja
                            </h1>
                            <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 border border-indigo-200 px-2 py-0.5 text-xs font-bold text-indigo-700">
                                <Shield className="h-3 w-3" />
                                Pipeline Oversight
                            </span>
                        </div>
                        <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
                            Pantau pergerakan berkas usulan belanja seluruh unit kerja RSJ dan status otorisasi 3-tahap Tahun {active_year}.
                        </p>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold border bg-amber-50 text-amber-800 border-amber-200">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                            Mode Pengawas (Read-Only)
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs">
                            <Calendar className="h-3.5 w-3.5 text-indigo-600" />
                            TA: <span className="font-mono text-indigo-900 font-bold">{active_year}</span>
                        </span>
                    </div>
                </div>

                {/* 2. Main Card Container & Toolbar */}
                <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
                    {/* Filter Bar */}
                    <div className="border-b border-slate-200/80 p-4 sm:p-5 bg-slate-50/50">
                        <form
                            onSubmit={handleSearch}
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center"
                        >
                            <div className="lg:col-span-5 relative">
                                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Cari nomor berkas atau uraian usulan..."
                                    value={q}
                                    onChange={(e) => setQ(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 text-xs font-medium rounded-xl border border-slate-300 bg-white text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-2xs"
                                />
                            </div>

                            <div className="lg:col-span-3">
                                <select
                                    value={divisionId}
                                    onChange={(e) => setDivisionId(e.target.value)}
                                    className="w-full text-xs font-bold rounded-xl border border-slate-300 bg-white py-2 pl-3 pr-8 text-slate-700 focus:border-indigo-500 shadow-2xs cursor-pointer truncate"
                                >
                                    <option value="ALL">Semua Bagian / Divisi</option>
                                    {divisions.map((div) => (
                                        <option key={div.id} value={div.id}>
                                            {div.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="lg:col-span-2">
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="w-full text-xs font-bold rounded-xl border border-slate-300 bg-white py-2 pl-3 pr-8 text-slate-700 focus:border-indigo-500 shadow-2xs cursor-pointer"
                                >
                                    <option value="ALL">Semua Status</option>
                                    <option value="Pending_Perencanaan">Menunggu Telaah Perencanaan</option>
                                    <option value="Disetujui">Disetujui (ACC Final)</option>
                                    <option value="Ditolak">Ditolak</option>
                                </select>
                            </div>

                            <div className="lg:col-span-2 flex items-center gap-2">
                                <button
                                    type="submit"
                                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white rounded-xl text-xs font-bold shadow-2xs transition cursor-pointer"
                                >
                                    <Filter className="w-3.5 h-3.5" />
                                    Filter
                                </button>
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    className="inline-flex items-center justify-center gap-1 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold shadow-2xs transition cursor-pointer"
                                >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Table View */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-600">
                            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-700 uppercase tracking-wider text-[11px] font-bold">
                                <tr>
                                    <th className="px-5 py-3.5">Nomor & Tanggal</th>
                                    <th className="px-5 py-3.5">Divisi & Unit Pemohon</th>
                                    <th className="px-5 py-3.5">Keperluan Belanja</th>
                                    <th className="px-5 py-3.5 text-right">Total Anggaran</th>
                                    <th className="px-5 py-3.5">Jejak Otorisasi</th>
                                    <th className="px-5 py-3.5 text-center">Status</th>
                                    <th className="px-5 py-3.5 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {requisitions.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-5 py-12 text-center text-slate-400 font-medium">
                                            Tidak ada data pengajuan belanja yang sesuai dengan kriteria filter.
                                        </td>
                                    </tr>
                                ) : (
                                    requisitions.data.map((req) => {
                                        const badge = getStatusBadge(req.status);

                                        return (
                                            <tr key={req.id} className="hover:bg-slate-50/70 transition">
                                                <td className="px-5 py-4 whitespace-nowrap">
                                                    <span className="font-mono text-xs font-bold text-slate-900 block">
                                                        {req.requisition_number}
                                                    </span>
                                                    <span className="text-[11px] text-slate-400 mt-0.5 block">
                                                        {new Date(req.created_at).toLocaleDateString('id-ID', {
                                                            day: 'numeric',
                                                            month: 'short',
                                                            year: 'numeric',
                                                        })}
                                                    </span>
                                                </td>

                                                <td className="px-5 py-4">
                                                    <span className="font-bold text-slate-900 text-xs block">
                                                        {req.division?.name || '-'}
                                                    </span>
                                                    <span className="text-[11px] text-slate-400 mt-0.5 block">
                                                        {req.unit?.name || 'Unit Kerja'} • {req.user?.name || '-'}
                                                    </span>
                                                </td>

                                                <td className="px-5 py-4 max-w-xs">
                                                    <p className="text-xs text-slate-700 line-clamp-2 leading-relaxed">
                                                        {req.purpose || req.urgency_reason || '-'}
                                                    </p>
                                                </td>

                                                <td className="px-5 py-4 text-right whitespace-nowrap font-mono text-xs font-bold text-slate-900">
                                                    {formatRp(req.total_amount || req.total_estimated)}
                                                </td>

                                                <td className="px-5 py-4 whitespace-nowrap text-xs">
                                                    <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                                        <span>Verifikator: {req.verified_by_perencanaan?.name || '-'}</span>
                                                    </div>
                                                </td>

                                                <td className="px-5 py-4 text-center whitespace-nowrap">
                                                    <span
                                                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold border ${badge.bg}`}
                                                    >
                                                        <span className={`h-1.5 w-1.5 rounded-full ${badge.dot}`} />
                                                        {badge.label}
                                                    </span>
                                                </td>

                                                <td className="px-5 py-4 text-right whitespace-nowrap">
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedReq(req)}
                                                        className="inline-flex items-center gap-1 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 active:scale-95 px-2.5 py-1 text-xs font-bold shadow-2xs transition cursor-pointer"
                                                    >
                                                        <Eye className="w-3.5 h-3.5" />
                                                        Detail
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {requisitions.links && requisitions.links.length > 3 && (
                        <div className="px-5 py-4 border-t border-slate-200/80 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 font-medium">
                            <div>
                                Menampilkan <strong className="text-slate-900">{requisitions.from || 0}</strong> -{' '}
                                <strong className="text-slate-900">{requisitions.to || 0}</strong> dari total{' '}
                                <strong className="text-slate-900">{requisitions.total || 0}</strong> pengajuan
                            </div>
                            <div className="flex items-center gap-1 flex-wrap">
                                {requisitions.links.map((link, idx) => (
                                    <Link
                                        key={idx}
                                        href={link.url || '#'}
                                        preserveState
                                        className={`px-3 py-1.5 rounded-xl font-bold transition shadow-2xs ${
                                            link.active
                                                ? 'bg-indigo-600 text-white'
                                                : link.url
                                                ? 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                                                : 'bg-slate-100 text-slate-400 pointer-events-none'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Inspect Modal */}
            <Modal show={Boolean(selectedReq)} onClose={() => setSelectedReq(null)} maxWidth="lg">
                <div className="p-6">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-5">
                        <div className="flex items-center gap-2.5">
                            <div className="rounded-xl bg-indigo-50 p-2 text-indigo-700 border border-indigo-200">
                                <FileText className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-slate-900">
                                    Detail Pengajuan #{selectedReq?.requisition_number}
                                </h3>
                                <p className="text-xs text-slate-500">
                                    Informasi berkas pengajuan belanja unit kerja
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setSelectedReq(null)}
                            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="space-y-4 text-xs">
                        <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                            <div>
                                <span className="text-slate-400 block mb-0.5 text-[11px]">Divisi Pemohon</span>
                                <span className="font-bold text-slate-900">{selectedReq?.division?.name}</span>
                            </div>
                            <div>
                                <span className="text-slate-400 block mb-0.5 text-[11px]">Unit Kerja</span>
                                <span className="font-bold text-slate-900">{selectedReq?.unit?.name || '-'}</span>
                            </div>
                            <div>
                                <span className="text-slate-400 block mb-0.5 text-[11px]">Pegawai Pembuat</span>
                                <span className="font-bold text-slate-900">
                                    {selectedReq?.user?.name} {selectedReq?.user?.nip ? `(NIP: ${selectedReq.user.nip})` : ''}
                                </span>
                            </div>
                            <div>
                                <span className="text-slate-400 block mb-0.5 text-[11px]">Total Anggaran Diajukan</span>
                                <span className="font-bold text-indigo-700 font-mono text-sm">
                                    {formatRp(selectedReq?.total_amount || selectedReq?.total_estimated)}
                                </span>
                            </div>
                        </div>

                        <div>
                            <span className="text-slate-500 font-bold block mb-1.5">Keperluan Belanja</span>
                            <div className="p-3.5 bg-white border border-slate-200/80 rounded-xl text-slate-800 leading-relaxed shadow-2xs">
                                {selectedReq?.purpose || selectedReq?.urgency_reason || 'Tidak ada catatan keperluan.'}
                            </div>
                        </div>

                        <div>
                            <span className="text-slate-500 font-bold block mb-1.5">Otorisasi & Verifikasi BLUD</span>
                            <div className="space-y-2 border border-slate-200/80 rounded-xl p-3.5 bg-slate-50/70">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-slate-600 font-medium">Verifikator Bag. Perencanaan:</span>
                                    <span className="font-bold text-slate-900">
                                        {selectedReq?.verified_by_perencanaan?.name || 'Belum Diverifikasi'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-amber-800 text-[11px] flex items-start gap-2.5">
                            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                            <span className="leading-relaxed">
                                Sesuai regulasi BLUD, Super Admin bertindak sebagai auditor/pengawas berkas. Otorisasi pencairan tetap menjadi wewenang pejabat perencana dan bendahara pengeluaran.
                            </span>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end border-t border-slate-200 pt-4">
                        <button
                            type="button"
                            onClick={() => setSelectedReq(null)}
                            className="rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700 transition cursor-pointer shadow-2xs"
                        >
                            Tutup
                        </button>
                    </div>
                </div>
            </Modal>
        </SuperAdminLayout>
    );
}
