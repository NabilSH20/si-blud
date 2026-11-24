import SuperAdminLayout from '@/Layouts/SuperAdminLayout';
import { Head, Link } from '@inertiajs/react';
import {
    AlertCircle,
    Calendar,
    CheckCircle2,
    DollarSign,
    FileSpreadsheet,
    PieChart,
    Shield,
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
        }).format(Number(val || 0));

    const totalDisbursed = disbursed_requisitions.reduce(
        (sum, r) => sum + (parseFloat(r.total_amount) || 0),
        0
    );

    const surplusDeficit = total_revenue - totalDisbursed;

    return (
        <SuperAdminLayout>
            <Head title={`Monitoring Keuangan & Realisasi TA ${active_year} - Super Admin`} />

            <div className="space-y-6">
                {/* 1. Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                                Monitoring Keuangan & Realisasi Belanja BLUD
                            </h1>
                            <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 border border-indigo-200 px-2 py-0.5 text-xs font-bold text-indigo-700">
                                <Shield className="h-3 w-3" />
                                Financial Oversight
                            </span>
                        </div>
                        <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
                            Ikhtisar realisasi pendapatan fungsional BLUD dan realisasi belanja operasional Tahun {active_year}.
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

                {/* 2. Segregation of Duties Banner */}
                <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 flex items-start gap-3 shadow-2xs">
                    <Shield className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                    <div className="text-xs text-indigo-950 leading-relaxed">
                        <strong className="font-bold text-indigo-900">Segregation of Duties (Prinsip BLUD): </strong>
                        Super Admin berwenang memantau ikhtisar realisasi. Seluruh proses penatausahaan kas masuk menjadi tanggung jawab Bagian Keuangan, sedangkan pengesahan belanja operasional unit divalidasi final oleh Bagian Perencanaan.
                    </div>
                </div>

                {/* 3. Kartu Metrik Keuangan */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-4.5 shadow-xs">
                        <div className="flex items-center justify-between text-slate-500">
                            <span className="text-xs font-bold text-slate-500">Realisasi Pendapatan BLUD</span>
                            <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600 border border-emerald-200">
                                <TrendingUp className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="mt-3">
                            <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-700 truncate">
                                {formatRp(total_revenue)}
                            </div>
                            <p className="mt-1 text-[11px] font-medium text-slate-400">Total penerimaan kas RSJ TA {active_year}</p>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-white p-4.5 shadow-xs">
                        <div className="flex items-center justify-between text-slate-500">
                            <span className="text-xs font-bold text-slate-500">Plafon Anggaran DPA Divisi</span>
                            <div className="rounded-xl bg-blue-50 p-2 text-blue-600 border border-blue-200">
                                <FileSpreadsheet className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="mt-3">
                            <div className="text-xl sm:text-2xl font-bold font-mono text-slate-900 truncate">
                                {formatRp(total_dpa)}
                            </div>
                            <p className="mt-1 text-[11px] font-medium text-slate-400">Akumulasi DPA seluruh divisi</p>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-white p-4.5 shadow-xs">
                        <div className="flex items-center justify-between text-slate-500">
                            <span className="text-xs font-bold text-slate-500">Realisasi Belanja Disetujui</span>
                            <div className="rounded-xl bg-rose-50 p-2 text-rose-600 border border-rose-200">
                                <Wallet className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="mt-3">
                            <div className="text-xl sm:text-2xl font-bold font-mono text-rose-700 truncate">
                                {formatRp(totalDisbursed)}
                            </div>
                            <p className="mt-1 text-[11px] font-medium text-slate-400">{disbursed_requisitions.length} berkas disahkan (ACC Final)</p>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-white p-4.5 shadow-xs">
                        <div className="flex items-center justify-between text-slate-500">
                            <span className="text-xs font-bold text-slate-500">Surplus / Defisit Kas</span>
                            <div className="rounded-xl bg-indigo-50 p-2 text-indigo-600 border border-indigo-200">
                                <PieChart className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="mt-3">
                            <div
                                className={`text-xl sm:text-2xl font-bold font-mono truncate ${
                                    surplusDeficit >= 0 ? 'text-emerald-700' : 'text-rose-700'
                                }`}
                            >
                                {surplusDeficit >= 0 ? `+${formatRp(surplusDeficit)}` : formatRp(surplusDeficit)}
                            </div>
                            <p className="mt-1 text-[11px] font-medium text-slate-400">Selisih penerimaan vs pencairan</p>
                        </div>
                    </div>
                </div>

                {/* 4. Grid Tabel Pendapatan & 10 SP2D Terbaru */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left: Revenues Table (7 cols) */}
                    <div className="lg:col-span-7 rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden flex flex-col">
                        <div className="p-4 sm:p-5 border-b border-slate-200/80 bg-slate-50/50 flex items-center justify-between">
                            <div>
                                <h2 className="font-bold text-slate-900 text-xs sm:text-sm">
                                    Catatan Penerimaan / Pendapatan BLUD
                                </h2>
                                <p className="text-[11px] text-slate-400 mt-0.5">
                                    Penerimaan kas fungsional layanan RSJ Tampan
                                </p>
                            </div>
                            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                                Total: {revenues.total || revenues.data?.length || 0} Entri
                            </span>
                        </div>

                        <div className="overflow-x-auto flex-1">
                            <table className="w-full text-left text-xs text-slate-600">
                                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-700 uppercase tracking-wider text-[11px] font-bold">
                                    <tr>
                                        <th className="px-5 py-3.5">Tanggal & Bukti</th>
                                        <th className="px-5 py-3.5">Sumber / Unit Layanan</th>
                                        <th className="px-5 py-3.5 text-right">Nominal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {revenues.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={3} className="px-5 py-12 text-center text-slate-400 font-medium">
                                                Belum ada catatan penerimaan pendapatan pada tahun {active_year}.
                                            </td>
                                        </tr>
                                    ) : (
                                        revenues.data.map((rev) => (
                                            <tr key={rev.id} className="hover:bg-slate-50/70 transition">
                                                <td className="px-5 py-4 whitespace-nowrap">
                                                    <span className="font-mono text-xs font-bold text-slate-900 block">
                                                        {rev.revenue_number}
                                                    </span>
                                                    <span className="text-[11px] text-slate-400 mt-0.5 block">
                                                        {new Date(rev.date).toLocaleDateString('id-ID', {
                                                            day: 'numeric',
                                                            month: 'short',
                                                            year: 'numeric',
                                                        })}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <span className="font-bold text-slate-800 text-xs block">
                                                        {rev.source}
                                                    </span>
                                                    {rev.description && (
                                                        <span className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                                                            {rev.description}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-5 py-4 text-right font-mono text-xs font-bold text-emerald-700 whitespace-nowrap">
                                                    +{formatRp(rev.amount)}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {revenues.links && revenues.links.length > 3 && (
                            <div className="px-5 py-3.5 border-t border-slate-200/80 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500 font-medium">
                                <div>Hal {revenues.current_page || 1} dari {revenues.last_page || 1}</div>
                                <div className="flex items-center gap-1">
                                    {revenues.links.map((link, idx) => (
                                        <Link
                                            key={idx}
                                            href={link.url || '#'}
                                            preserveState
                                            className={`px-2.5 py-1 rounded-xl text-xs font-bold transition shadow-2xs ${
                                                link.active
                                                    ? 'bg-indigo-600 text-white'
                                                    : link.url
                                                    ? 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
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
                    <div className="lg:col-span-5 rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden flex flex-col">
                        <div className="p-4 sm:p-5 border-b border-slate-200/80 bg-slate-50/50">
                            <h2 className="font-bold text-slate-900 text-xs sm:text-sm">
                                10 Usulan Belanja Disetujui Terkini
                            </h2>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                                Berkas belanja yang telah disahkan final oleh Bagian Perencanaan
                            </p>
                        </div>

                        <div className="divide-y divide-slate-100 flex-1 overflow-y-auto">
                            {disbursed_requisitions.length === 0 ? (
                                <div className="px-5 py-12 text-center text-slate-400 font-medium">
                                    Belum ada berkas belanja yang disetujui.
                                </div>
                            ) : (
                                disbursed_requisitions.map((req) => (
                                    <div key={req.id} className="p-4 hover:bg-slate-50/70 transition">
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
                                            <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                Disetujui Perencanaan
                                            </span>
                                        </div>
                                        {req.purpose && (
                                            <p className="text-[11px] text-slate-600 line-clamp-1 mt-1 leading-relaxed">
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
