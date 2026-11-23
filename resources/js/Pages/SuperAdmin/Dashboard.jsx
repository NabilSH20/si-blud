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
    PlusCircle,
    Settings,
    Shield,
    TrendingDown,
    TrendingUp,
    Users,
    Wallet,
} from 'lucide-react';

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
    const formatRp = (val) =>
        new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(val || 0);

    const getActionBadge = (action) => {
        switch (action) {
            case 'LOGIN':
            case 'IMPERSONATE_STOP':
                return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'LOGOUT':
            case 'DELETE_USER':
                return 'bg-rose-50 text-rose-700 border-rose-200';
            case 'IMPERSONATE_START':
                return 'bg-amber-50 text-amber-800 border-amber-200';
            case 'LOCK_YEAR':
            case 'UNLOCK_YEAR':
                return 'bg-purple-50 text-purple-700 border-purple-200';
            default:
                return 'bg-indigo-50 text-indigo-700 border-indigo-200';
        }
    };

    return (
        <SuperAdminLayout>
            <Head title="Dashboard Global - Super Admin SIM-RS" />

            {/* Header Title & Status Banner */}
            <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="rounded-lg bg-indigo-600 p-1.5 text-white shadow-xs">
                            <Shield className="h-4 w-4" />
                        </span>
                        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                            Dashboard Eksekutif Global (3-in-1)
                        </h1>
                    </div>
                    <p className="mt-1 text-xs sm:text-sm text-slate-500 font-medium">
                        Pemantauan real-time lintas modul Perencanaan, Keuangan, Unit Kerja, dan Integritas Sistem E-BLUD RSJ Tampan.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs">
                        <Calendar className="h-4 w-4 text-indigo-600" />
                        Tahun Anggaran: <strong className="text-indigo-900 font-black">{active_year}</strong>
                    </span>
                    {is_locked ? (
                        <span className="inline-flex items-center gap-1 rounded-xl bg-rose-100 border border-rose-300 px-3 py-1.5 text-xs font-black text-rose-800">
                            <Lock className="h-3.5 w-3.5 text-rose-600" />
                            Tutup Buku
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1 rounded-xl bg-emerald-100 border border-emerald-300 px-3 py-1.5 text-xs font-black text-emerald-800">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                            Anggaran Terbuka
                        </span>
                    )}
                </div>
            </div>

            {/* 1. KPI Cards Grid (Perencanaan + Keuangan + Sistem) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {/* Card 1: Pagu Pergeseran RBA */}
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                            Pagu RBA Pergeseran
                        </span>
                        <div className="rounded-xl bg-amber-50 p-2 text-amber-700 border border-amber-200">
                            <FileSpreadsheet className="h-4 w-4" />
                        </div>
                    </div>
                    <div className="mt-2">
                        <span className="text-lg sm:text-xl font-black text-slate-900">
                            {formatRp(kpi_perencanaan.total_pagu_pergeseran)}
                        </span>
                        <p className="mt-0.5 text-[11px] text-slate-400 font-medium">
                            Murni: {formatRp(kpi_perencanaan.total_pagu_murni)}
                        </p>
                    </div>
                </div>

                {/* Card 2: Realisasi Belanja SP2D */}
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                            Realisasi Belanja (SP2D)
                        </span>
                        <div className="rounded-xl bg-emerald-50 p-2 text-emerald-700 border border-emerald-200">
                            <Wallet className="h-4 w-4" />
                        </div>
                    </div>
                    <div className="mt-2">
                        <span className="text-lg sm:text-xl font-black text-emerald-700">
                            {formatRp(kpi_keuangan.total_realisasi_belanja)}
                        </span>
                        <p className="mt-0.5 text-[11px] text-slate-400 font-medium">
                            {kpi_keuangan.disetujui_selesai} Usulan Dicairkan
                        </p>
                    </div>
                </div>

                {/* Card 3: Pendapatan BLUD */}
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                            Penerimaan Pendapatan
                        </span>
                        <div className="rounded-xl bg-blue-50 p-2 text-blue-700 border border-blue-200">
                            <TrendingUp className="h-4 w-4" />
                        </div>
                    </div>
                    <div className="mt-2">
                        <span className="text-lg sm:text-xl font-black text-blue-900">
                            {formatRp(kpi_keuangan.total_revenue)}
                        </span>
                        <p className="mt-0.5 text-[11px] text-slate-400 font-medium">
                            Surplus/Defisit: {formatRp(kpi_keuangan.surplus_defisit)}
                        </p>
                    </div>
                </div>

                {/* Card 4: Total Pengguna & Sistem */}
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                            Pengguna Terdaftar
                        </span>
                        <div className="rounded-xl bg-indigo-50 p-2 text-indigo-700 border border-indigo-200">
                            <Users className="h-4 w-4" />
                        </div>
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-lg sm:text-xl font-black text-slate-900">
                            {kpi_users.total}
                        </span>
                        <span className="text-xs font-bold text-emerald-600">
                            ({kpi_users.active} Aktif)
                        </span>
                    </div>
                    <p className="mt-0.5 text-[11px] text-slate-400 font-medium">
                        {kpi_users.divisions_count} Bagian / Bidang • {kpi_users.units_count} Unit
                    </p>
                </div>
            </div>

            {/* 2. Quick Navigation Shortcuts */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <Link
                    href={route('superadmin.users.index')}
                    className="flex items-center gap-3 p-3.5 rounded-2xl border border-slate-200 bg-white hover:border-indigo-400 hover:bg-indigo-50/40 transition group shadow-2xs"
                >
                    <div className="p-2.5 rounded-xl bg-indigo-100 text-indigo-800 group-hover:bg-indigo-600 group-hover:text-white transition">
                        <Users className="h-4 w-4" />
                    </div>
                    <div>
                        <span className="text-xs font-black text-slate-900 block">Manajemen Akun</span>
                        <span className="text-[10px] text-slate-400 font-medium">Kelola & Impersonasi</span>
                    </div>
                </Link>

                <Link
                    href={route('superadmin.monitoring.rba')}
                    className="flex items-center gap-3 p-3.5 rounded-2xl border border-slate-200 bg-white hover:border-amber-400 hover:bg-amber-50/40 transition group shadow-2xs"
                >
                    <div className="p-2.5 rounded-xl bg-amber-100 text-amber-800 group-hover:bg-amber-600 group-hover:text-white transition">
                        <FileSpreadsheet className="h-4 w-4" />
                    </div>
                    <div>
                        <span className="text-xs font-black text-slate-900 block">Monitoring RBA</span>
                        <span className="text-[10px] text-slate-400 font-medium">Matriks Anggaran</span>
                    </div>
                </Link>

                <Link
                    href={route('superadmin.audit-logs.index')}
                    className="flex items-center gap-3 p-3.5 rounded-2xl border border-slate-200 bg-white hover:border-emerald-400 hover:bg-emerald-50/40 transition group shadow-2xs"
                >
                    <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800 group-hover:bg-emerald-600 group-hover:text-white transition">
                        <Activity className="h-4 w-4" />
                    </div>
                    <div>
                        <span className="text-xs font-black text-slate-900 block">Audit Logs</span>
                        <span className="text-[10px] text-slate-400 font-medium">Riwayat Aktivitas</span>
                    </div>
                </Link>

                <Link
                    href={route('superadmin.settings.index')}
                    className="flex items-center gap-3 p-3.5 rounded-2xl border border-slate-200 bg-white hover:border-purple-400 hover:bg-purple-50/40 transition group shadow-2xs"
                >
                    <div className="p-2.5 rounded-xl bg-purple-100 text-purple-800 group-hover:bg-purple-600 group-hover:text-white transition">
                        <Settings className="h-4 w-4" />
                    </div>
                    <div>
                        <span className="text-xs font-black text-slate-900 block">Pengaturan Cetak</span>
                        <span className="text-[10px] text-slate-400 font-medium">Kop & Penandatangan</span>
                    </div>
                </Link>
            </div>

            {/* 3. Main Grid: Audit Logs Feed + Requisition Status */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left (2 Columns): Live Audit Log Feed */}
                <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Activity className="h-4 w-4 text-indigo-600" />
                            <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-800">
                                10 Aktivitas Sistem Terkini (Live Audit Feed)
                            </h2>
                        </div>
                        <Link
                            href={route('superadmin.audit-logs.index')}
                            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                        >
                            Lihat Semua &rarr;
                        </Link>
                    </div>

                    <div className="divide-y divide-slate-100 overflow-x-auto">
                        {recent_audit_logs.length === 0 ? (
                            <div className="p-8 text-center text-xs text-slate-400">
                                Belum ada aktivitas yang tercatat.
                            </div>
                        ) : (
                            recent_audit_logs.map((log) => (
                                <div key={log.id} className="p-3.5 flex items-start justify-between gap-3 hover:bg-slate-50/60 transition">
                                    <div className="flex items-start gap-2.5 min-w-0">
                                        <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-mono font-black border ${getActionBadge(log.action)}`}>
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
                                        {new Date(log.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Right (1 Column): Sebaran Usulan per Divisi & Status Server */}
                <div className="space-y-6">
                    {/* Status Usulan Belanja */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
                        <h2 className="text-xs font-black uppercase tracking-wider text-slate-800 mb-3 flex items-center gap-2">
                            <PieChart className="h-4 w-4 text-indigo-600" />
                            Status Usulan Belanja
                        </h2>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs">
                                <span className="font-bold text-amber-900">Menunggu Telaah Perencanaan</span>
                                <span className="font-black text-amber-800">{kpi_perencanaan.pending_perencanaan}</span>
                            </div>
                            <div className="flex items-center justify-between p-2.5 rounded-xl bg-blue-50/70 border border-blue-200 text-xs">
                                <span className="font-bold text-blue-900">Diproses Bagian Keuangan</span>
                                <span className="font-black text-blue-800">{kpi_keuangan.diproses_keuangan}</span>
                            </div>
                            <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs">
                                <span className="font-bold text-emerald-900">Disetujui Selesai (SP2D)</span>
                                <span className="font-black text-emerald-800">{kpi_keuangan.disetujui_selesai}</span>
                            </div>
                            <div className="flex items-center justify-between p-2.5 rounded-xl bg-rose-50/70 border border-rose-200 text-xs">
                                <span className="font-bold text-rose-900">Ditolak / Perlu Revisi</span>
                                <span className="font-black text-rose-800">{kpi_keuangan.ditolak}</span>
                            </div>
                        </div>
                    </div>

                    {/* Server & Environment Info */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs text-xs">
                        <h2 className="text-xs font-black uppercase tracking-wider text-slate-800 mb-3 flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-indigo-600" />
                            Informasi Server & Lingkungan
                        </h2>
                        <div className="space-y-2 text-slate-600 font-medium">
                            <div className="flex justify-between border-b border-slate-100 pb-1.5">
                                <span>Versi PHP</span>
                                <span className="font-mono font-bold text-slate-900">{server_info.php_version}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-100 pb-1.5">
                                <span>Versi Laravel</span>
                                <span className="font-mono font-bold text-slate-900">{server_info.laravel_version}</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-100 pb-1.5">
                                <span>Lingkungan (Env)</span>
                                <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md uppercase">
                                    {server_info.environment}
                                </span>
                            </div>
                            <div className="flex justify-between pt-0.5">
                                <span>Waktu Server</span>
                                <span className="text-[11px] font-bold text-slate-800">{server_info.server_time}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </SuperAdminLayout>
    );
}
