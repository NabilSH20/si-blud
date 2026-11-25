import SuperAdminLayout from '@/Layouts/SuperAdminLayout';
import { Head, Link } from '@inertiajs/react';
import {
    Activity,
    ArrowUpRight,
    Building2,
    Calendar,
    CheckCircle2,
    Clock,
    FileSpreadsheet,
    FileText,
    Lock,
    PieChart,
    Server,
    Settings,
    Shield,
    TrendingUp,
    Unlock,
    Users,
    Wallet,
} from 'lucide-react';

const formatRp = (val) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(Number(val || 0));

export default function Dashboard({
    active_year,
    is_locked,
    kpi_perencanaan = {},
    kpi_keuangan = {},
    kpi_users = {},
    recent_audit_logs = [],
    requisitions_by_division = [],
    server_info = {},
}) {
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
            default:
                return {
                    bg: 'bg-indigo-50 text-indigo-800 border-indigo-200',
                    dot: 'bg-indigo-500',
                };
        }
    };

    return (
        <SuperAdminLayout>
            <Head title="Dashboard Global - Super Admin SIM-RS" />

            <div className="space-y-6">
                {/* 1. Header Title & Status Badges */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                                Dashboard Eksekutif Global
                            </h1>
                            <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 border border-indigo-200 px-2 py-0.5 text-xs font-bold text-indigo-700">
                                <Shield className="h-3 w-3" />
                                3-in-1 Master
                            </span>
                        </div>
                        <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
                            Pemantauan terpadu lintas modul Perencanaan, Keuangan, Unit Kerja, dan Integritas Sistem E-BLUD RSJ Tampan.
                        </p>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <Link
                            href={route('superadmin.fiscal-years.index')}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs transition"
                            title="Buka Manajemen Tahun Anggaran"
                        >
                            <Calendar className="h-3.5 w-3.5 text-indigo-600" />
                            TA: <span className="font-mono text-indigo-900 font-bold">{active_year}</span>
                        </Link>

                        {is_locked ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold border bg-rose-50 text-rose-700 border-rose-200">
                                <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                                <Lock className="h-3.5 w-3.5 text-rose-600" />
                                Tutup Buku (Locked)
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold border bg-emerald-50 text-emerald-800 border-emerald-200">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                                Anggaran Terbuka
                            </span>
                        )}
                    </div>
                </div>

                {/* 2. Kartu KPI Utama 4 Kolom */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Card 1: Pagu RBA */}
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-4.5 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-500">Pagu RBA Pergeseran</span>
                            <div className="rounded-xl bg-amber-50 p-2 text-amber-600 border border-amber-200">
                                <FileSpreadsheet className="h-4 w-4" />
                            </div>
                        </div>
                        <div className="mt-3">
                            <div className="text-xl sm:text-2xl font-bold font-mono text-slate-900 truncate">
                                {formatRp(kpi_perencanaan.total_pagu_pergeseran)}
                            </div>
                            <p className="mt-1 text-[11px] font-medium text-slate-400">
                                Pagu Murni: <span className="font-mono">{formatRp(kpi_perencanaan.total_pagu_murni)}</span>
                            </p>
                        </div>
                    </div>

                    {/* Card 2: Realisasi Belanja */}
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-4.5 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-500">Realisasi Belanja Disetujui</span>
                            <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600 border border-emerald-200">
                                <Wallet className="h-4 w-4" />
                            </div>
                        </div>
                        <div className="mt-3">
                            <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-700 truncate">
                                {formatRp(kpi_keuangan.total_realisasi_belanja)}
                            </div>
                            <p className="mt-1 text-[11px] font-medium text-slate-400">
                                {kpi_keuangan.disetujui ?? 0} Usulan Belanja Disetujui
                            </p>
                        </div>
                    </div>

                    {/* Card 3: Penerimaan Pendapatan */}
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-4.5 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-500">Penerimaan Pendapatan</span>
                            <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600 border border-indigo-200">
                                <TrendingUp className="h-4 w-4" />
                            </div>
                        </div>
                        <div className="mt-3">
                            <div className="text-xl sm:text-2xl font-bold font-mono text-indigo-900 truncate">
                                {formatRp(kpi_keuangan.total_revenue)}
                            </div>
                            <p className="mt-1 text-[11px] font-medium text-slate-400">
                                Surplus: <span className="font-mono">{formatRp(kpi_keuangan.surplus_defisit)}</span>
                            </p>
                        </div>
                    </div>

                    {/* Card 4: Pengguna & Struktur */}
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-4.5 shadow-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-500">Pengguna Terdaftar</span>
                            <div className="rounded-xl bg-slate-50 p-2 text-slate-700 border border-slate-200">
                                <Users className="h-4 w-4" />
                            </div>
                        </div>
                        <div className="mt-3 flex items-baseline gap-2">
                            <span className="text-2xl font-bold font-mono text-slate-900">
                                {kpi_users.total ?? 0}
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold border bg-emerald-50 text-emerald-800 border-emerald-200">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                {kpi_users.active ?? 0} Aktif
                            </span>
                        </div>
                        <p className="mt-1 text-[11px] font-medium text-slate-400">
                            {kpi_users.divisions_count ?? 0} Divisi • {kpi_users.units_count ?? 0} Unit
                        </p>
                    </div>
                </div>

                {/* 3. Pintasan Cepat (*Quick Shortcuts*) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                    <Link
                        href={route('superadmin.users.index')}
                        className="flex items-center gap-3 p-3.5 rounded-2xl border border-slate-200/80 bg-white hover:border-indigo-300 hover:bg-indigo-50/30 transition group shadow-2xs"
                    >
                        <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition border border-indigo-100">
                            <Users className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                            <span className="text-xs font-bold text-slate-900 block truncate">Manajemen Akun</span>
                            <span className="text-[10px] text-slate-400 font-medium">Root & Impersonasi</span>
                        </div>
                    </Link>

                    <Link
                        href={route('superadmin.monitoring.rba')}
                        className="flex items-center gap-3 p-3.5 rounded-2xl border border-slate-200/80 bg-white hover:border-amber-300 hover:bg-amber-50/30 transition group shadow-2xs"
                    >
                        <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition border border-amber-100">
                            <FileSpreadsheet className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                            <span className="text-xs font-bold text-slate-900 block truncate">Monitoring RBA</span>
                            <span className="text-[10px] text-slate-400 font-medium">Matriks Anggaran</span>
                        </div>
                    </Link>

                    <Link
                        href={route('superadmin.fiscal-years.index')}
                        className="flex items-center gap-3 p-3.5 rounded-2xl border border-slate-200/80 bg-white hover:border-emerald-300 hover:bg-emerald-50/30 transition group shadow-2xs"
                    >
                        <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition border border-emerald-100">
                            <Calendar className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                            <span className="text-xs font-bold text-slate-900 block truncate">Tahun Anggaran</span>
                            <span className="text-[10px] text-slate-400 font-medium">Tutup Buku & Fiskal</span>
                        </div>
                    </Link>

                    <Link
                        href={route('superadmin.settings.index')}
                        className="flex items-center gap-3 p-3.5 rounded-2xl border border-slate-200/80 bg-white hover:border-purple-300 hover:bg-purple-50/30 transition group shadow-2xs"
                    >
                        <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition border border-purple-100">
                            <Settings className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                            <span className="text-xs font-bold text-slate-900 block truncate">Pengaturan Dokumen</span>
                            <span className="text-[10px] text-slate-400 font-medium">Kop & Penandatangan</span>
                        </div>
                    </Link>
                </div>

                {/* 4. Grid Utama: Live Audit Feed + Status Usulan & Server */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left (2 Columns): Live Audit Log Feed */}
                    <div className="lg:col-span-2 rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
                        <div className="p-4 sm:p-5 border-b border-slate-200/80 bg-slate-50/50 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Activity className="h-4 w-4 text-indigo-600" />
                                <h2 className="text-xs sm:text-sm font-bold text-slate-900">
                                    10 Aktivitas Sistem Terkini (Live Audit Feed)
                                </h2>
                            </div>
                            <Link
                                href={route('superadmin.audit-logs.index')}
                                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition"
                            >
                                Lihat Semua
                                <ArrowUpRight className="h-3.5 w-3.5" />
                            </Link>
                        </div>

                        <div className="divide-y divide-slate-100">
                            {recent_audit_logs.length === 0 ? (
                                <div className="p-10 text-center">
                                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                                        <Activity className="h-5 w-5" />
                                    </div>
                                    <p className="mt-2 text-xs font-bold text-slate-600">
                                        Belum ada aktivitas yang tercatat
                                    </p>
                                </div>
                            ) : (
                                recent_audit_logs.map((log) => {
                                    const badge = getActionBadge(log.action);
                                    return (
                                        <div
                                            key={log.id}
                                            className="p-3.5 sm:p-4 flex items-start justify-between gap-3 hover:bg-slate-50/70 transition"
                                        >
                                            <div className="flex items-start gap-3 min-w-0">
                                                <span
                                                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold border shrink-0 ${badge.bg}`}
                                                >
                                                    <span className={`h-1.5 w-1.5 rounded-full ${badge.dot}`} />
                                                    {log.action}
                                                </span>
                                                <div className="min-w-0">
                                                    <p className="text-xs font-bold text-slate-900 leading-snug truncate">
                                                        {log.description}
                                                    </p>
                                                    <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                                                        Oleh: <strong className="text-slate-700">{log.user?.name || 'Sistem'}</strong>
                                                        {log.impersonator && (
                                                            <span className="ml-1 text-amber-600 font-bold">
                                                                (via Impersonasi: {log.impersonator.name})
                                                            </span>
                                                        )}
                                                        {log.ip_address && ` • IP: ${log.ip_address}`}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="text-[10px] text-slate-400 whitespace-nowrap font-medium shrink-0 flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {new Date(log.created_at).toLocaleTimeString('id-ID', {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </span>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Right (1 Column): Sebaran Usulan & Status Server */}
                    <div className="space-y-6">
                        {/* Status Usulan Belanja */}
                        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs">
                            <h2 className="text-xs sm:text-sm font-bold text-slate-900 mb-3.5 flex items-center gap-2">
                                <PieChart className="h-4 w-4 text-indigo-600" />
                                Status Usulan Belanja
                            </h2>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs">
                                    <span className="font-bold text-amber-900">Menunggu Telaah Perencanaan</span>
                                    <span className="font-mono font-bold text-amber-800">
                                        {kpi_perencanaan.pending_perencanaan ?? 0}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-xs">
                                    <span className="font-bold text-emerald-900">Disetujui (ACC Final)</span>
                                    <span className="font-mono font-bold text-emerald-800">
                                        {kpi_keuangan.disetujui ?? 0}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between p-2.5 rounded-xl bg-rose-50/70 border border-rose-200/80 text-xs">
                                    <span className="font-bold text-rose-900">Ditolak / Perlu Revisi</span>
                                    <span className="font-mono font-bold text-rose-800">
                                        {kpi_keuangan.ditolak ?? 0}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Server & Environment Info */}
                        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs text-xs">
                            <h2 className="text-xs sm:text-sm font-bold text-slate-900 mb-3.5 flex items-center gap-2">
                                <Server className="h-4 w-4 text-indigo-600" />
                                Parameter Lingkungan SIM-RS
                            </h2>
                            <div className="space-y-2.5 text-slate-600 font-medium">
                                <div className="flex justify-between border-b border-slate-100 pb-2">
                                    <span>Versi PHP</span>
                                    <span className="font-mono font-bold text-slate-900">{server_info.php_version}</span>
                                </div>
                                <div className="flex justify-between border-b border-slate-100 pb-2">
                                    <span>Versi Laravel</span>
                                    <span className="font-mono font-bold text-slate-900">{server_info.laravel_version}</span>
                                </div>
                                <div className="flex justify-between border-b border-slate-100 pb-2">
                                    <span>Lingkungan (Env)</span>
                                    <span className="font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md uppercase text-[10px]">
                                        {server_info.environment}
                                    </span>
                                </div>
                                <div className="flex justify-between pt-0.5">
                                    <span>Waktu Server</span>
                                    <span className="text-[11px] font-mono font-bold text-slate-800">{server_info.server_time}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </SuperAdminLayout>
    );
}
