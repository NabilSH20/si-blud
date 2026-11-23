import SuperAdminLayout from '@/Layouts/SuperAdminLayout';
import { Head, Link, router } from '@inertiajs/react';
import {
    AlertCircle,
    Building2,
    Calendar,
    CheckCircle2,
    Clock,
    Eye,
    FileText,
    Filter,
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
            '/super-admin/monitoring/requisitions',
            { q, status, division_id: divisionId },
            { preserveState: true, replace: true }
        );
    };

    const handleReset = () => {
        setQ('');
        setStatus('ALL');
        setDivisionId('ALL');
        router.get('/super-admin/monitoring/requisitions', {}, { preserveState: true, replace: true });
    };

    const formatRp = (val) =>
        new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(val || 0);

    const getStatusBadge = (statusName) => {
        switch (statusName) {
            case 'Diajukan':
                return {
                    label: 'Diajukan (Menunggu Perencanaan)',
                    classes: 'bg-amber-50 text-amber-700 border-amber-200',
                    icon: Clock,
                };
            case 'Disetujui_Perencanaan':
                return {
                    label: 'Diverifikasi Perencanaan',
                    classes: 'bg-blue-50 text-blue-700 border-blue-200',
                    icon: CheckCircle2,
                };
            case 'Ditolak_Perencanaan':
                return {
                    label: 'Ditolak Perencanaan',
                    classes: 'bg-rose-50 text-rose-700 border-rose-200',
                    icon: XCircle,
                };
            case 'Disetujui_Selesai':
                return {
                    label: 'Cair / SP2D Selesai',
                    classes: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                    icon: CheckCircle2,
                };
            case 'Ditolak_Keuangan':
                return {
                    label: 'Ditolak Keuangan',
                    classes: 'bg-rose-50 text-rose-700 border-rose-200',
                    icon: XCircle,
                };
            default:
                return {
                    label: statusName || 'Draft',
                    classes: 'bg-slate-50 text-slate-700 border-slate-200',
                    icon: Clock,
                };
        }
    };

    return (
        <SuperAdminLayout>
            <Head title={`Monitoring Pengajuan Belanja TA ${active_year} - Super Admin`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600 mb-1">
                            <Shield className="w-3.5 h-3.5" />
                            <span>Global Pipeline Monitoring</span>
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-display">
                            Monitoring Pengajuan Belanja Seluruh RSJ
                        </h1>
                        <p className="text-sm text-slate-500 mt-0.5">
                            Pantau pergerakan berkas pengajuan unit dan status otorisasi 3-tahap Tahun {active_year}.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                            Mode Pengawas (Read-Only)
                        </span>
                        <div className="px-3 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-semibold shadow-sm">
                            TA {active_year}
                        </div>
                    </div>
                </div>

                {/* Filter Bar */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                    <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
                        <div className="lg:col-span-4 relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Cari nomor berkas atau keperluan..."
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-800 placeholder-slate-400"
                            />
                        </div>

                        <div className="lg:col-span-3">
                            <select
                                value={divisionId}
                                onChange={(e) => setDivisionId(e.target.value)}
                                className="w-full text-xs rounded-xl border border-slate-200 py-2 pl-3 pr-8 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-700"
                            >
                                <option value="ALL">Semua Bagian / Bidang</option>
                                {divisions.map((div) => (
                                    <option key={div.id} value={div.id}>
                                        {div.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="lg:col-span-3">
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full text-xs rounded-xl border border-slate-200 py-2 pl-3 pr-8 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-700"
                            >
                                <option value="ALL">Semua Status Otorisasi</option>
                                <option value="Diajukan">Diajukan Unit (Menunggu)</option>
                                <option value="Disetujui_Perencanaan">Diverifikasi Perencanaan</option>
                                <option value="Ditolak_Perencanaan">Ditolak Perencanaan</option>
                                <option value="Disetujui_Selesai">Disetujui & Cair (Keuangan)</option>
                                <option value="Ditolak_Keuangan">Ditolak Keuangan</option>
                            </select>
                        </div>

                        <div className="lg:col-span-2 flex items-center gap-2">
                            <button
                                type="submit"
                                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
                            >
                                <Filter className="w-3.5 h-3.5" />
                                Filter
                            </button>
                            <button
                                type="button"
                                onClick={handleReset}
                                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-semibold transition-colors"
                            >
                                Reset
                            </button>
                        </div>
                    </form>
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50/75 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-3.5">Nomor & Tanggal</th>
                                    <th className="px-6 py-3.5">Divisi & Unit</th>
                                    <th className="px-6 py-3.5">Keperluan Belanja</th>
                                    <th className="px-6 py-3.5 text-right">Total Anggaran</th>
                                    <th className="px-6 py-3.5">Jejak Otorisasi</th>
                                    <th className="px-6 py-3.5 text-center">Status</th>
                                    <th className="px-6 py-3.5 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {requisitions.data.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-12 text-center text-slate-400 text-sm">
                                            Tidak ada data pengajuan belanja yang sesuai dengan kriteria filter.
                                        </td>
                                    </tr>
                                ) : (
                                    requisitions.data.map((req) => {
                                        const badge = getStatusBadge(req.status);
                                        const Icon = badge.icon;

                                        return (
                                            <tr key={req.id} className="hover:bg-slate-50/60 transition-colors">
                                                <td className="px-6 py-3.5 whitespace-nowrap">
                                                    <span className="font-mono text-xs font-bold text-slate-900 block">
                                                        {req.requisition_number}
                                                    </span>
                                                    <span className="text-[11px] text-slate-400">
                                                        {new Date(req.created_at).toLocaleDateString('id-ID', {
                                                            day: 'numeric',
                                                            month: 'short',
                                                            year: 'numeric',
                                                        })}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-3.5">
                                                    <span className="font-medium text-slate-800 text-xs block">
                                                        {req.division?.name || '-'}
                                                    </span>
                                                    <span className="text-[11px] text-slate-400 block">
                                                        {req.unit?.name || 'Unit Kerja'} • {req.user?.name || '-'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-3.5 max-w-xs">
                                                    <p className="text-xs text-slate-700 line-clamp-2">
                                                        {req.purpose || '-'}
                                                    </p>
                                                </td>
                                                <td className="px-6 py-3.5 text-right whitespace-nowrap font-mono text-xs font-bold text-slate-900">
                                                    {formatRp(req.total_amount)}
                                                </td>
                                                <td className="px-6 py-3.5 text-xs text-slate-500 whitespace-nowrap">
                                                    <div className="space-y-0.5">
                                                        <div className="flex items-center gap-1.5 text-[11px]">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                                            <span>Verif: {req.verified_by_perencanaan?.name || '-'}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-[11px]">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                            <span>SP2D: {req.approved_by_keuangan?.name || '-'}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-3.5 text-center whitespace-nowrap">
                                                    <span
                                                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${badge.classes}`}
                                                    >
                                                        <Icon className="w-3 h-3" />
                                                        {badge.label}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-3.5 text-center whitespace-nowrap">
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedReq(req)}
                                                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors"
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
                        <div className="px-6 py-4 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
                            <div>
                                Menampilkan {requisitions.from || 0} - {requisitions.to || 0} dari total{' '}
                                {requisitions.total || 0} pengajuan
                            </div>
                            <div className="flex items-center gap-1">
                                {requisitions.links.map((link, idx) => (
                                    <Link
                                        key={idx}
                                        href={link.url || '#'}
                                        preserveState
                                        className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                                            link.active
                                                ? 'bg-indigo-600 text-white'
                                                : link.url
                                                ? 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                                                : 'text-slate-300 pointer-events-none'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Inspect Modal */}
                {selectedReq && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-indigo-600" />
                                    <h3 className="font-bold text-slate-900 text-sm">
                                        Detail Pengajuan {selectedReq.requisition_number}
                                    </h3>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSelectedReq(null)}
                                    className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="p-6 space-y-4 text-xs">
                                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                                    <div>
                                        <span className="text-slate-400 block mb-0.5">Divisi Pemohon</span>
                                        <span className="font-semibold text-slate-800">{selectedReq.division?.name}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 block mb-0.5">Unit Kerja</span>
                                        <span className="font-semibold text-slate-800">{selectedReq.unit?.name || '-'}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 block mb-0.5">Pegawai Pembuat</span>
                                        <span className="font-semibold text-slate-800">
                                            {selectedReq.user?.name} (NIP: {selectedReq.user?.nip || '-'})
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 block mb-0.5">Total Anggaran Diajukan</span>
                                        <span className="font-bold text-indigo-700 font-mono text-sm">
                                            {formatRp(selectedReq.total_amount)}
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <span className="text-slate-400 block mb-1">Keperluan Belanja</span>
                                    <div className="p-3 bg-white border border-slate-200 rounded-xl text-slate-800 leading-relaxed">
                                        {selectedReq.purpose}
                                    </div>
                                </div>

                                <div>
                                    <span className="text-slate-400 block mb-1">Otorisasi & Verifikasi BLUD</span>
                                    <div className="space-y-2 border border-slate-200 rounded-xl p-3 bg-slate-50/50">
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-600">Verifikator Bag. Perencanaan:</span>
                                            <span className="font-semibold text-slate-900">
                                                {selectedReq.verified_by_perencanaan?.name || 'Belum Diverifikasi'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-600">Pencairan Bag. Keuangan:</span>
                                            <span className="font-semibold text-slate-900">
                                                {selectedReq.approved_by_keuangan?.name || 'Belum Dicairkan'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200 text-amber-800 text-[11px] flex items-start gap-2">
                                    <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                                    <span>
                                        Sesuai regulasi BLUD, Super Admin hanya dapat menginspeksi alur pengajuan. Otorisasi persetujuan tetap menjadi tanggung jawab pejabat penandatangan resmi.
                                    </span>
                                </div>
                            </div>

                            <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => setSelectedReq(null)}
                                    className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
                                >
                                    Tutup
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </SuperAdminLayout>
    );
}
