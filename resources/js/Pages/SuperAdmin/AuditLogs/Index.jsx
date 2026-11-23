import SuperAdminLayout from '@/Layouts/SuperAdminLayout';
import Pagination from '@/Components/Pagination';
import Modal from '@/Components/Modal';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import {
    Activity,
    Calendar,
    Code,
    Filter,
    RotateCcw,
    Search,
    Shield,
    X,
} from 'lucide-react';

export default function Index({
    logs = {},
    filters = {},
    available_modules = [],
    available_actions = [],
    users = [],
}) {
    const [searchFilter, setSearchFilter] = useState(filters.q || '');
    const [moduleFilter, setModuleFilter] = useState(filters.module || 'ALL');
    const [actionFilter, setActionFilter] = useState(filters.action || 'ALL');
    const [userFilter, setUserFilter] = useState(filters.user_id || 'ALL');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');

    // Payload viewer modal
    const [inspectingLog, setInspectingLog] = useState(null);

    const applyFilters = () => {
        router.get(
            route('superadmin.audit-logs.index'),
            {
                q: searchFilter,
                module: moduleFilter,
                action: actionFilter,
                user_id: userFilter,
                date_from: dateFrom,
                date_to: dateTo,
            },
            { preserveState: true, preserveScroll: true }
        );
    };

    const resetFilters = () => {
        setSearchFilter('');
        setModuleFilter('ALL');
        setActionFilter('ALL');
        setUserFilter('ALL');
        setDateFrom('');
        setDateTo('');
        router.get(route('superadmin.audit-logs.index'), {}, { preserveState: true, preserveScroll: true });
    };

    const getActionBadge = (action) => {
        switch (action) {
            case 'LOGIN':
            case 'IMPERSONATE_STOP':
                return 'bg-emerald-50 text-emerald-800 border-emerald-300';
            case 'LOGOUT':
            case 'DELETE_USER':
                return 'bg-rose-50 text-rose-800 border-rose-300';
            case 'IMPERSONATE_START':
                return 'bg-amber-50 text-amber-900 border-amber-300';
            case 'LOCK_YEAR':
            case 'UNLOCK_YEAR':
                return 'bg-purple-50 text-purple-800 border-purple-300';
            case 'SETTING_UPDATE':
                return 'bg-blue-50 text-blue-800 border-blue-300';
            default:
                return 'bg-slate-100 text-slate-800 border-slate-300';
        }
    };

    return (
        <SuperAdminLayout>
            <Head title="System Audit Logs - Super Admin SIM-RS" />

            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center gap-2">
                    <div className="rounded-xl bg-indigo-600 p-2 text-white">
                        <Activity className="h-5 w-5" />
                    </div>
                    <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                        Log Aktivitas Sistem Terpadu (System Audit Trail)
                    </h1>
                </div>
                <p className="mt-1 text-xs sm:text-sm text-slate-500 font-medium">
                    Catatan forensik seluruh mutasi data, waktu login, perubahan status, otorisasi SP2D, dan investigasi troubleshooting.
                </p>
            </div>

            {/* Main Container */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
                {/* Filter Toolbar */}
                <div className="p-4 border-b border-slate-100 bg-slate-50/50 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2.5 text-xs">
                        {/* Search Query */}
                        <div className="lg:col-span-2">
                            <label className="block text-[11px] font-bold text-slate-600 mb-1">Pencarian Teks / IP</label>
                            <div className="relative">
                                <Search className="h-3.5 w-3.5 absolute left-3 top-2.5 text-slate-400" />
                                <input
                                    type="text"
                                    value={searchFilter}
                                    onChange={(e) => setSearchFilter(e.target.value)}
                                    placeholder="Cari deskripsi, aksi, IP..."
                                    className="w-full rounded-xl border border-slate-300 pl-8 pr-3 py-1.5 text-xs"
                                />
                            </div>
                        </div>

                        {/* Modul */}
                        <div>
                            <label className="block text-[11px] font-bold text-slate-600 mb-1">Modul Sistem</label>
                            <select
                                value={moduleFilter}
                                onChange={(e) => setModuleFilter(e.target.value)}
                                className="w-full rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-semibold"
                            >
                                <option value="ALL">Semua Modul</option>
                                {available_modules.map((m) => (
                                    <option key={m} value={m}>
                                        {m}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Aksi */}
                        <div>
                            <label className="block text-[11px] font-bold text-slate-600 mb-1">Jenis Aksi</label>
                            <select
                                value={actionFilter}
                                onChange={(e) => setActionFilter(e.target.value)}
                                className="w-full rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-semibold"
                            >
                                <option value="ALL">Semua Aksi</option>
                                {available_actions.map((a) => (
                                    <option key={a} value={a}>
                                        {a}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Tanggal Dari */}
                        <div>
                            <label className="block text-[11px] font-bold text-slate-600 mb-1">Dari Tanggal</label>
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                                className="w-full rounded-xl border border-slate-300 px-2 py-1.5 text-xs font-mono"
                            />
                        </div>

                        {/* Tanggal Sampai */}
                        <div>
                            <label className="block text-[11px] font-bold text-slate-600 mb-1">Sampai Tanggal</label>
                            <input
                                type="date"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                                className="w-full rounded-xl border border-slate-300 px-2 py-1.5 text-xs font-mono"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                            type="button"
                            onClick={resetFilters}
                            className="inline-flex items-center gap-1 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-600 px-3 py-1.5 text-xs font-bold transition cursor-pointer"
                        >
                            <RotateCcw className="h-3.5 w-3.5" />
                            <span>Reset</span>
                        </button>
                        <button
                            type="button"
                            onClick={applyFilters}
                            className="inline-flex items-center gap-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 text-xs font-black shadow-xs transition cursor-pointer"
                        >
                            <Filter className="h-3.5 w-3.5" />
                            <span>Terapkan Filter</span>
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-100 text-left text-xs">
                        <thead className="bg-slate-50 text-[11px] font-black uppercase tracking-wider text-slate-600 border-b border-slate-200">
                            <tr>
                                <th className="px-4 py-3 text-center w-12">No</th>
                                <th className="px-4 py-3 whitespace-nowrap">Waktu (WIB)</th>
                                <th className="px-4 py-3">Pengguna & Sesi</th>
                                <th className="px-3 py-3 text-center">Modul</th>
                                <th className="px-3 py-3 text-center">Aksi</th>
                                <th className="px-5 py-3">Deskripsi Aktivitas</th>
                                <th className="px-4 py-3 text-center">IP Address</th>
                                <th className="px-3 py-3 text-center">Payload</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                            {logs.data?.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="p-8 text-center text-slate-400 font-medium">
                                        Tidak ada riwayat aktivitas yang sesuai kriteria pencarian.
                                    </td>
                                </tr>
                            ) : (
                                logs.data?.map((log, idx) => (
                                    <tr key={log.id} className="hover:bg-slate-50/60 transition">
                                        <td className="px-4 py-3 text-center text-slate-400 font-mono">
                                            {(logs.current_page - 1) * logs.per_page + idx + 1}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap font-mono text-[11px] text-slate-600">
                                            {new Date(log.created_at).toLocaleString('id-ID', {
                                                day: '2-digit',
                                                month: 'short',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                                second: '2-digit',
                                            })}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="font-bold text-slate-900 leading-snug">
                                                {log.user?.name || 'Sistem / Anonim'}
                                            </div>
                                            <div className="text-[10px] text-slate-400 font-medium">
                                                {log.user?.role || '-'}
                                                {log.impersonator && (
                                                    <span className="ml-1 text-amber-700 font-bold">
                                                        (via {log.impersonator.name})
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-3 py-3 text-center whitespace-nowrap">
                                            <span className="font-mono text-[10px] font-black text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                                {log.module}
                                            </span>
                                        </td>
                                        <td className="px-3 py-3 text-center whitespace-nowrap">
                                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-black border ${getActionBadge(log.action)}`}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 text-slate-800 font-medium">
                                            {log.description}
                                        </td>
                                        <td className="px-4 py-3 text-center whitespace-nowrap font-mono text-[11px] text-slate-500">
                                            {log.ip_address || '-'}
                                        </td>
                                        <td className="px-3 py-3 text-center whitespace-nowrap">
                                            {(log.payload_before || log.payload_after) ? (
                                                <button
                                                    type="button"
                                                    onClick={() => setInspectingLog(log)}
                                                    className="inline-flex items-center gap-1 rounded-lg border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 px-2 py-1 text-[10px] font-black shadow-2xs transition cursor-pointer"
                                                >
                                                    <Code className="h-3 w-3" />
                                                    <span>JSON</span>
                                                </button>
                                            ) : (
                                                <span className="text-slate-300">-</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <Pagination
                    currentPage={logs.current_page || 1}
                    totalPages={logs.last_page || 1}
                    totalItems={logs.total || 0}
                    itemsPerPage={logs.per_page || 20}
                    onPageChange={(page) => {
                        router.get(
                            route('superadmin.audit-logs.index'),
                            { ...filters, page },
                            { preserveState: true, preserveScroll: true }
                        );
                    }}
                />
            </div>

            {/* Inspect Payload Modal */}
            <Modal show={Boolean(inspectingLog)} onClose={() => setInspectingLog(null)} maxWidth="2xl">
                <div className="p-6">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                        <div>
                            <h2 className="text-sm font-black text-slate-900">
                                Detail Payload Audit Trail #{inspectingLog?.id}
                            </h2>
                            <p className="text-[11px] text-slate-500 font-medium">
                                {inspectingLog?.action} • {inspectingLog?.module} • {inspectingLog?.description}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setInspectingLog(null)}
                            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        {/* Payload Before */}
                        <div>
                            <span className="block font-black text-rose-800 mb-1 uppercase tracking-wider text-[10px]">
                                Data Sebelum (Before)
                            </span>
                            <pre className="max-h-80 overflow-y-auto rounded-xl bg-slate-900 p-3 text-[11px] font-mono text-emerald-400">
                                {inspectingLog?.payload_before
                                    ? JSON.stringify(inspectingLog.payload_before, null, 2)
                                    : '// Tidak ada snapshot data sebelum'}
                            </pre>
                        </div>

                        {/* Payload After */}
                        <div>
                            <span className="block font-black text-emerald-800 mb-1 uppercase tracking-wider text-[10px]">
                                Data Sesudah (After)
                            </span>
                            <pre className="max-h-80 overflow-y-auto rounded-xl bg-slate-900 p-3 text-[11px] font-mono text-emerald-400">
                                {inspectingLog?.payload_after
                                    ? JSON.stringify(inspectingLog.payload_after, null, 2)
                                    : '// Tidak ada snapshot data sesudah'}
                            </pre>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end">
                        <button
                            type="button"
                            onClick={() => setInspectingLog(null)}
                            className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
                        >
                            Tutup
                        </button>
                    </div>
                </div>
            </Modal>
        </SuperAdminLayout>
    );
}
