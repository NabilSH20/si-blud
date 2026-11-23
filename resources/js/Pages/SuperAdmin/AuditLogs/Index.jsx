import Modal from '@/Components/Modal';
import Pagination from '@/Components/Pagination';
import SuperAdminLayout from '@/Layouts/SuperAdminLayout';
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
        router.get(
            route('superadmin.audit-logs.index'),
            {},
            { preserveState: true, preserveScroll: true }
        );
    };

    const getActionBadge = (action) => {
        switch (action) {
            case 'LOGIN':
            case 'IMPERSONATE_STOP':
                return {
                    bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
                    dot: 'bg-emerald-500',
                };
            case 'LOGOUT':
            case 'DELETE_USER':
            case 'DELETE_YEAR':
                return {
                    bg: 'bg-rose-50 text-rose-700 border-rose-200',
                    dot: 'bg-rose-500',
                };
            case 'IMPERSONATE_START':
                return {
                    bg: 'bg-amber-50 text-amber-800 border-amber-200',
                    dot: 'bg-amber-500',
                };
            case 'LOCK_YEAR':
                return {
                    bg: 'bg-rose-50 text-rose-800 border-rose-300',
                    dot: 'bg-rose-600',
                };
            case 'UNLOCK_YEAR':
                return {
                    bg: 'bg-purple-50 text-purple-700 border-purple-200',
                    dot: 'bg-purple-500',
                };
            case 'SETTING_UPDATE':
                return {
                    bg: 'bg-blue-50 text-blue-800 border-blue-200',
                    dot: 'bg-blue-500',
                };
            default:
                return {
                    bg: 'bg-indigo-50 text-indigo-800 border-indigo-200',
                    dot: 'bg-indigo-500',
                };
        }
    };

    return (
        <SuperAdminLayout>
            <Head title="System Audit Logs - Super Admin SIM-RS" />

            <div className="space-y-6">
                {/* 1. Header Halaman */}
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                            Log Aktivitas Sistem Terpadu
                        </h1>
                        <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 border border-indigo-200 px-2 py-0.5 text-xs font-bold text-indigo-700">
                            <Shield className="h-3 w-3" />
                            Forensic Trail
                        </span>
                    </div>
                    <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
                        Rekam jejak komprehensif mutasi data, waktu login, perubahan status, otorisasi SP2D, dan investigasi troubleshooting SIM-RS.
                    </p>
                </div>

                {/* 2. Kontainer Utama & Filter */}
                <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
                    {/* Toolbar Filter */}
                    <div className="border-b border-slate-200/80 p-4 sm:p-5 bg-slate-50/50 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 text-xs">
                            {/* Search Query */}
                            <div className="lg:col-span-2">
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                    Pencarian Teks / IP
                                </label>
                                <div className="relative">
                                    <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        value={searchFilter}
                                        onChange={(e) => setSearchFilter(e.target.value)}
                                        placeholder="Cari deskripsi, aksi, IP..."
                                        className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-2xs"
                                    />
                                </div>
                            </div>

                            {/* Modul */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                    Modul Sistem
                                </label>
                                <select
                                    value={moduleFilter}
                                    onChange={(e) => setModuleFilter(e.target.value)}
                                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 focus:border-indigo-500 shadow-2xs cursor-pointer"
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
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                    Jenis Aksi
                                </label>
                                <select
                                    value={actionFilter}
                                    onChange={(e) => setActionFilter(e.target.value)}
                                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 focus:border-indigo-500 shadow-2xs cursor-pointer"
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
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                    Dari Tanggal
                                </label>
                                <input
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-mono font-medium text-slate-800 focus:border-indigo-500 shadow-2xs"
                                />
                            </div>

                            {/* Tanggal Sampai */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                    Sampai Tanggal
                                </label>
                                <input
                                    type="date"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-mono font-medium text-slate-800 focus:border-indigo-500 shadow-2xs"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                            <span className="text-xs text-slate-500 font-medium">
                                Total log tercatat: <strong className="text-slate-900">{logs.total || 0} entri</strong>
                            </span>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={resetFilters}
                                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 active:scale-95 px-3.5 py-2 text-xs font-bold text-slate-700 shadow-2xs transition cursor-pointer"
                                >
                                    <RotateCcw className="h-3.5 w-3.5" />
                                    <span>Reset</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={applyFilters}
                                    className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 px-4 py-2 text-xs font-bold text-white shadow-2xs transition cursor-pointer"
                                >
                                    <Filter className="h-3.5 w-3.5" />
                                    <span>Terapkan Filter</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Table View */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-600">
                            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-700 uppercase tracking-wider text-[11px] font-bold">
                                <tr>
                                    <th className="px-5 py-3.5 w-12 text-center">No</th>
                                    <th className="px-5 py-3.5 whitespace-nowrap">Waktu (WIB)</th>
                                    <th className="px-5 py-3.5">Pengguna & Sesi</th>
                                    <th className="px-4 py-3.5 text-center">Modul</th>
                                    <th className="px-4 py-3.5 text-center">Aksi</th>
                                    <th className="px-5 py-3.5">Deskripsi Aktivitas</th>
                                    <th className="px-4 py-3.5 text-center">IP Address</th>
                                    <th className="px-4 py-3.5 text-center">Payload</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {logs.data?.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="px-5 py-12 text-center">
                                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                                                <Activity className="h-6 w-6" />
                                            </div>
                                            <p className="mt-3 text-sm font-bold text-slate-800">
                                                Tidak ada riwayat aktivitas yang sesuai filter
                                            </p>
                                            <p className="mt-1 text-xs text-slate-400">
                                                Cobalah mereset filter atau memilih rentang tanggal yang berbeda.
                                            </p>
                                        </td>
                                    </tr>
                                ) : (
                                    logs.data?.map((log, idx) => {
                                        const badge = getActionBadge(log.action);
                                        return (
                                            <tr key={log.id} className="hover:bg-slate-50/70 transition">
                                                <td className="px-5 py-4 text-center text-slate-400 font-mono text-[11px]">
                                                    {(logs.current_page - 1) * logs.per_page + idx + 1}
                                                </td>
                                                <td className="px-5 py-4 whitespace-nowrap font-mono text-[11px] text-slate-600">
                                                    {new Date(log.created_at).toLocaleString('id-ID', {
                                                        day: '2-digit',
                                                        month: 'short',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                        second: '2-digit',
                                                    })}
                                                </td>
                                                <td className="px-5 py-4">
                                                    <div className="font-bold text-slate-900 leading-snug">
                                                        {log.user?.name || 'Sistem / Anonim'}
                                                    </div>
                                                    <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                                                        {log.user?.role || '-'}
                                                        {log.impersonator && (
                                                            <span className="ml-1 text-amber-700 font-bold">
                                                                (via {log.impersonator.name})
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 text-center whitespace-nowrap">
                                                    <span className="font-mono text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                                                        {log.module}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 text-center whitespace-nowrap">
                                                    <span
                                                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold border ${badge.bg}`}
                                                    >
                                                        <span className={`h-1.5 w-1.5 rounded-full ${badge.dot}`} />
                                                        {log.action}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4 text-slate-800 font-medium leading-relaxed">
                                                    {log.description}
                                                </td>
                                                <td className="px-4 py-4 text-center whitespace-nowrap font-mono text-[11px] text-slate-500">
                                                    {log.ip_address || '-'}
                                                </td>
                                                <td className="px-4 py-4 text-center whitespace-nowrap">
                                                    {log.payload_before || log.payload_after ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => setInspectingLog(log)}
                                                            className="inline-flex items-center gap-1 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-2.5 py-1 text-xs font-bold shadow-2xs transition cursor-pointer active:scale-95"
                                                        >
                                                            <Code className="h-3.5 w-3.5" />
                                                            JSON
                                                        </button>
                                                    ) : (
                                                        <span className="text-slate-300">-</span>
                                                    )}
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
            </div>

            {/* Inspect Payload Modal */}
            <Modal show={Boolean(inspectingLog)} onClose={() => setInspectingLog(null)} maxWidth="2xl">
                <div className="p-6">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-5">
                        <div className="flex items-center gap-2.5">
                            <div className="rounded-xl bg-indigo-50 p-2 text-indigo-700 border border-indigo-200">
                                <Code className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-slate-900">
                                    Detail Payload Audit Trail #{inspectingLog?.id}
                                </h3>
                                <p className="text-xs text-slate-500">
                                    {inspectingLog?.action} • {inspectingLog?.module}
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setInspectingLog(null)}
                            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        {/* Payload Before */}
                        <div>
                            <span className="block font-bold text-rose-700 mb-1.5 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full bg-rose-500" />
                                Data Sebelum (Before)
                            </span>
                            <pre className="max-h-80 overflow-y-auto rounded-xl bg-slate-900 p-3.5 text-[11px] font-mono text-emerald-400 border border-slate-800 shadow-inner">
                                {inspectingLog?.payload_before
                                    ? JSON.stringify(inspectingLog.payload_before, null, 2)
                                    : '// Tidak ada snapshot data sebelum'}
                            </pre>
                        </div>

                        {/* Payload After */}
                        <div>
                            <span className="block font-bold text-emerald-700 mb-1.5 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                Data Sesudah (After)
                            </span>
                            <pre className="max-h-80 overflow-y-auto rounded-xl bg-slate-900 p-3.5 text-[11px] font-mono text-emerald-400 border border-slate-800 shadow-inner">
                                {inspectingLog?.payload_after
                                    ? JSON.stringify(inspectingLog.payload_after, null, 2)
                                    : '// Tidak ada snapshot data sesudah'}
                            </pre>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end border-t border-slate-200 pt-4">
                        <button
                            type="button"
                            onClick={() => setInspectingLog(null)}
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
