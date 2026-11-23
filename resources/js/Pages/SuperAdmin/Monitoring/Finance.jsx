import SuperAdminLayout from '@/Layouts/SuperAdminLayout';
import { Head, Link } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowDownRight,
    ArrowUpRight,
    Building2,
    Calendar,
    CheckCircle2,
    DollarSign,
    FileSpreadsheet,
    FileText,
    PieChart,
    Shield,
    TrendingDown,
    TrendingUp,
    Wallet,
} from 'lucide-react';

export default function MonitoringFinance({
    active_year,
    revenues = { data: [], links: [] },
    total_revenue = 0,
    total_dpa = 0,
    disbursed_requisitions = [],
}) {
    const formatRp = (val) =>
        new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(val || 0);

    const totalDisbursed = disbursed_requisitions.reduce(
        (sum, r) => sum + (parseFloat(r.total_amount) || 0),
        0
    );

    const surplusDeficit = total_revenue - totalDisbursed;

    return (
        <SuperAdminLayout>
            <Head title={`Monitoring Keuangan & Realisasi TA ${active_year} - Super Admin`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600 mb-1">
                            <Shield className="w-3.5 h-3.5" />
                            <span>Global Financial Oversight</span>
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-display">
                            Monitoring Keuangan, Pendapatan & SP2D
                        </h1>
                        <p className="text-sm text-slate-500 mt-0.5">
                            Ikhtisar realisasi pendapatan fungsional BLUD dan pencairan belanja operasional Tahun {active_year}.
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

                {/* Segregation of duties alert banner */}
                <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-start gap-3">
                    <Shield className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                    <div className="text-xs text-indigo-950 leading-relaxed">
                        <strong className="font-semibold text-indigo-900">Segregation of Duties (Prinsip BLUD): </strong>
                        Super Admin tidak berwenang mengeksekusi SP2D, menginput pendapatan, atau mengubah saldo kas riil. Seluruh proses penatausahaan keuangan dan kas menjadi tanggung jawab penuh Bagian Keuangan & Bendahara Pengeluaran.
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                        <div className="flex items-center justify-between text-slate-500 mb-2">
                            <span className="text-xs font-medium">Realisasi Pendapatan BLUD</span>
                            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                <TrendingUp className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-lg font-bold text-emerald-700">{formatRp(total_revenue)}</p>
                        <p className="text-xs text-slate-400 mt-1">Total penerimaan kas RSJ TA {active_year}</p>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                        <div className="flex items-center justify-between text-slate-500 mb-2">
                            <span className="text-xs font-medium">Plafon Anggaran DPA Divisi</span>
                            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                                <FileSpreadsheet className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-lg font-bold text-slate-900">{formatRp(total_dpa)}</p>
                        <p className="text-xs text-slate-400 mt-1">Akumulasi DPA seluruh divisi</p>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                        <div className="flex items-center justify-between text-slate-500 mb-2">
                            <span className="text-xs font-medium">Realisasi Belanja (Disbursed)</span>
                            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                                <Wallet className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-lg font-bold text-rose-700">{formatRp(totalDisbursed)}</p>
                        <p className="text-xs text-slate-400 mt-1">{disbursed_requisitions.length} berkas selesai SP2D</p>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                        <div className="flex items-center justify-between text-slate-500 mb-2">
                            <span className="text-xs font-medium">Surplus / Defisit Kas</span>
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                <PieChart className="w-4 h-4" />
                            </div>
                        </div>
                        <p className={`text-lg font-bold ${surplusDeficit >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                            {surplusDeficit >= 0 ? `+${formatRp(surplusDeficit)}` : formatRp(surplusDeficit)}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">Selisih penerimaan vs pencairan</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left: Revenues Table (8 cols) */}
                    <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
                        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                            <div>
                                <h2 className="font-bold text-slate-900 text-sm">
                                    Catatan Penerimaan / Pendapatan BLUD
                                </h2>
                                <p className="text-xs text-slate-500">
                                    Penerimaan kas fungsional layanan RSJ Tampan
                                </p>
                            </div>
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Total: {revenues.total || revenues.data?.length || 0} Entri
                            </span>
                        </div>

                        <div className="overflow-x-auto flex-1">
                            <table className="w-full text-left text-sm text-slate-600">
                                <thead className="bg-slate-50/75 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
                                    <tr>
                                        <th className="px-6 py-3.5">Tanggal & Bukti</th>
                                        <th className="px-6 py-3.5">Sumber / Unit Layanan</th>
                                        <th className="px-6 py-3.5 text-right">Nominal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {revenues.data.length === 0 ? (
                                        <tr>
                                            <td colSpan="3" className="px-6 py-12 text-center text-slate-400 text-xs">
                                                Belum ada catatan penerimaan pendapatan pada tahun {active_year}.
                                            </td>
                                        </tr>
                                    ) : (
                                        revenues.data.map((rev) => (
                                            <tr key={rev.id} className="hover:bg-slate-50/60 transition-colors">
                                                <td className="px-6 py-3.5 whitespace-nowrap">
                                                    <span className="font-mono text-xs font-bold text-slate-900 block">
                                                        {rev.revenue_number}
                                                    </span>
                                                    <span className="text-[11px] text-slate-400">
                                                        {new Date(rev.date).toLocaleDateString('id-ID', {
                                                            day: 'numeric',
                                                            month: 'short',
                                                            year: 'numeric',
                                                        })}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-3.5">
                                                    <span className="font-medium text-slate-800 text-xs block">
                                                        {rev.source}
                                                    </span>
                                                    {rev.description && (
                                                        <span className="text-[11px] text-slate-400 line-clamp-1">
                                                            {rev.description}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-3.5 text-right font-mono text-xs font-bold text-emerald-700 whitespace-nowrap">
                                                    +{formatRp(rev.amount)}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {revenues.links && revenues.links.length > 3 && (
                            <div className="px-6 py-3 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
                                <div>Hal {revenues.current_page || 1} dari {revenues.last_page || 1}</div>
                                <div className="flex items-center gap-1">
                                    {revenues.links.map((link, idx) => (
                                        <Link
                                            key={idx}
                                            href={link.url || '#'}
                                            preserveState
                                            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
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

                    {/* Right: Recent Disbursed (5 cols) */}
                    <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col">
                        <div className="px-6 py-4 border-b border-slate-200">
                            <h2 className="font-bold text-slate-900 text-sm">
                                10 Pencairan SP2D Terkini
                            </h2>
                            <p className="text-xs text-slate-500">
                                Berkas belanja yang telah disahkan dan dicairkan bendahara
                            </p>
                        </div>

                        <div className="divide-y divide-slate-100 flex-1 overflow-y-auto">
                            {disbursed_requisitions.length === 0 ? (
                                <div className="px-6 py-12 text-center text-slate-400 text-xs">
                                    Belum ada berkas belanja yang dicairkan.
                                </div>
                            ) : (
                                disbursed_requisitions.map((req) => (
                                    <div key={req.id} className="p-4 hover:bg-slate-50/60 transition-colors">
                                        <div className="flex items-center justify-between gap-2 mb-1">
                                            <span className="font-mono text-xs font-bold text-slate-900">
                                                {req.requisition_number}
                                            </span>
                                            <span className="font-mono text-xs font-bold text-rose-700">
                                                {formatRp(req.total_amount)}
                                            </span>
                                        </div>
                                        <div className="text-[11px] text-slate-500 flex items-center justify-between">
                                            <span>{req.division?.name || 'Divisi'} • {req.unit?.name || 'Unit'}</span>
                                            <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                                                <CheckCircle2 className="w-3 h-3" />
                                                Lunas SP2D
                                            </span>
                                        </div>
                                        {req.purpose && (
                                            <p className="text-[11px] text-slate-600 line-clamp-1 mt-1">
                                                {req.purpose}
                                            </p>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </SuperAdminLayout>
    );
}
