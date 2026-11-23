import SuperAdminLayout from '@/Layouts/SuperAdminLayout';
import { Head, Link } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowRightLeft,
    CheckCircle2,
    Clock,
    FileSpreadsheet,
    FileText,
    History,
    Layers,
    Search,
    Shield,
    TrendingUp,
} from 'lucide-react';
import { useState } from 'react';

export default function MonitoringRba({
    active_year,
    accounts = [],
    shifts = [],
    total_original = 0,
    total_allocated = 0,
}) {
    const [activeTab, setActiveTab] = useState('accounts'); // 'accounts' | 'shifts'
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('ALL');

    const formatRp = (val) =>
        new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
        }).format(val || 0);

    const filteredAccounts = accounts.filter((acc) => {
        const matchSearch =
            !searchTerm ||
            acc.account_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            acc.account_name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchType = typeFilter === 'ALL' || acc.type === typeFilter;
        return matchSearch && matchType;
    });

    const shiftDiff = total_allocated - total_original;

    return (
        <SuperAdminLayout>
            <Head title={`Monitoring RBA & Pergeseran TA ${active_year} - Super Admin`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600 mb-1">
                            <Shield className="w-3.5 h-3.5" />
                            <span>Global Audit & Oversight</span>
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-display">
                            Monitoring RBA & Pergeseran Anggaran
                        </h1>
                        <p className="text-sm text-slate-500 mt-0.5">
                            Pengawasan komprehensif struktur rekening RBA dan jejak pergeseran anggaran Tahun {active_year}.
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
                        Super Admin mengawasi integritas angka anggaran dan memvalidasi riwayat perubahan tanpa memiliki wewenang mengedit saldo rekening langsung. Perubahan akun dan input pergeseran tetap menjadi ranah eksklusif Bagian Perencanaan.
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                        <div className="flex items-center justify-between text-slate-500 mb-2">
                            <span className="text-xs font-medium">Anggaran Semula (Murni)</span>
                            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                                <FileSpreadsheet className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-lg font-bold text-slate-900">{formatRp(total_original)}</p>
                        <p className="text-xs text-slate-400 mt-1">Pagu murni belanja RBA awal</p>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                        <div className="flex items-center justify-between text-slate-500 mb-2">
                            <span className="text-xs font-medium">Anggaran Setelah Pergeseran</span>
                            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                <TrendingUp className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-lg font-bold text-emerald-700">{formatRp(total_allocated)}</p>
                        <p className="text-xs text-slate-400 mt-1">Total pagu definitif aktif saat ini</p>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                        <div className="flex items-center justify-between text-slate-500 mb-2">
                            <span className="text-xs font-medium">Variasi / Net Pergeseran</span>
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                <ArrowRightLeft className="w-4 h-4" />
                            </div>
                        </div>
                        <p className={`text-lg font-bold ${shiftDiff === 0 ? 'text-slate-800' : shiftDiff > 0 ? 'text-blue-600' : 'text-rose-600'}`}>
                            {shiftDiff > 0 ? `+${formatRp(shiftDiff)}` : formatRp(shiftDiff)}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                            {shiftDiff === 0 ? 'Keseimbangan pagu netral (zero-sum)' : 'Terdapat penyesuaian total'}
                        </p>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
                        <div className="flex items-center justify-between text-slate-500 mb-2">
                            <span className="text-xs font-medium">Jejak Pergeseran Resmi</span>
                            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                                <History className="w-4 h-4" />
                            </div>
                        </div>
                        <p className="text-lg font-bold text-slate-900">{shifts.length} Pergeseran</p>
                        <p className="text-xs text-slate-400 mt-1">Total {accounts.length} rekening terdaftar</p>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                    {/* Navigation Tabs */}
                    <div className="border-b border-slate-200 px-6 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setActiveTab('accounts')}
                                className={`flex items-center gap-2 pb-3.5 px-3 text-sm font-semibold border-b-2 transition-colors ${
                                    activeTab === 'accounts'
                                        ? 'border-indigo-600 text-indigo-600'
                                        : 'border-transparent text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                <Layers className="w-4 h-4" />
                                Struktur Rekening RBA ({filteredAccounts.length})
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab('shifts')}
                                className={`flex items-center gap-2 pb-3.5 px-3 text-sm font-semibold border-b-2 transition-colors ${
                                    activeTab === 'shifts'
                                        ? 'border-indigo-600 text-indigo-600'
                                        : 'border-transparent text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                <History className="w-4 h-4" />
                                Riwayat Pergeseran Anggaran ({shifts.length})
                            </button>
                        </div>

                        {activeTab === 'accounts' && (
                            <div className="flex items-center gap-2 pb-3">
                                <div className="relative">
                                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Cari kode atau uraian..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-48 sm:w-64"
                                    />
                                </div>
                                <select
                                    value={typeFilter}
                                    onChange={(e) => setTypeFilter(e.target.value)}
                                    className="text-xs rounded-xl border border-slate-200 py-1.5 pl-3 pr-8 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-700"
                                >
                                    <option value="ALL">Semua Tipe</option>
                                    <option value="belanja">Belanja</option>
                                    <option value="pendapatan">Pendapatan</option>
                                    <option value="pembiayaan">Pembiayaan</option>
                                </select>
                            </div>
                        )}
                    </div>

                    {/* Tab 1: Rekening RBA */}
                    {activeTab === 'accounts' && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-slate-600">
                                <thead className="bg-slate-50/75 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
                                    <tr>
                                        <th className="px-6 py-3.5">Kode Rekening</th>
                                        <th className="px-6 py-3.5">Uraian Akun</th>
                                        <th className="px-6 py-3.5">Tipe</th>
                                        <th className="px-6 py-3.5 text-right">Pagu Semula</th>
                                        <th className="px-6 py-3.5 text-right">Penyesuaian</th>
                                        <th className="px-6 py-3.5 text-right">Pagu Definitif</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredAccounts.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-12 text-center text-slate-400 text-sm">
                                                Tidak ditemukan data rekening RBA untuk kriteria pencarian ini.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredAccounts.map((acc) => {
                                            const diff = (acc.allocated_amount || 0) - (acc.original_amount || 0);
                                            const isSubHeader = !acc.parent_id;

                                            return (
                                                <tr
                                                    key={acc.id}
                                                    className={`hover:bg-slate-50/60 transition-colors ${
                                                        isSubHeader ? 'bg-slate-50/40 font-semibold text-slate-900' : ''
                                                    }`}
                                                >
                                                    <td className="px-6 py-3.5 font-mono text-xs font-semibold text-slate-800">
                                                        {acc.account_code}
                                                    </td>
                                                    <td className="px-6 py-3.5">
                                                        <span className={isSubHeader ? 'text-slate-900' : 'text-slate-700'}>
                                                            {acc.account_name}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-3.5">
                                                        <span
                                                            className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                                                                acc.type === 'belanja'
                                                                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                                                    : acc.type === 'pendapatan'
                                                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                                    : 'bg-blue-50 text-blue-700 border border-blue-200'
                                                            }`}
                                                        >
                                                            {acc.type}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-3.5 text-right font-mono text-xs text-slate-600">
                                                        {formatRp(acc.original_amount)}
                                                    </td>
                                                    <td className="px-6 py-3.5 text-right font-mono text-xs">
                                                        {diff === 0 ? (
                                                            <span className="text-slate-400">-</span>
                                                        ) : diff > 0 ? (
                                                            <span className="text-emerald-600 font-semibold">
                                                                +{formatRp(diff)}
                                                            </span>
                                                        ) : (
                                                            <span className="text-rose-600 font-semibold">
                                                                {formatRp(diff)}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-3.5 text-right font-mono text-xs font-bold text-slate-900">
                                                        {formatRp(acc.allocated_amount)}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Tab 2: Riwayat Pergeseran */}
                    {activeTab === 'shifts' && (
                        <div className="divide-y divide-slate-100">
                            {shifts.length === 0 ? (
                                <div className="px-6 py-12 text-center text-slate-400 text-sm">
                                    Belum ada pergeseran anggaran yang disahkan pada Tahun {active_year}.
                                </div>
                            ) : (
                                shifts.map((shift) => (
                                    <div key={shift.id} className="p-6 hover:bg-slate-50/50 transition-colors">
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-sm">
                                                    #{shift.shift_number}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-slate-900 text-sm">
                                                        Pergeseran Anggaran RBA #{shift.shift_number}
                                                    </h3>
                                                    <p className="text-xs text-slate-500">
                                                        Tanggal: {shift.shift_date ? new Date(shift.shift_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'} • Diinput oleh: {shift.user?.name || 'Bagian Perencanaan'}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 self-start sm:self-auto">
                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                Disahkan Resmi
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3 bg-slate-50/60 p-4 rounded-xl border border-slate-100 text-xs text-slate-600">
                                            <div>
                                                <span className="text-slate-400 block mb-0.5">Dasar Hukum / Nomor SK:</span>
                                                <span className="font-semibold text-slate-800">
                                                    {shift.reference_document || 'SK Direktur RSJ Tampan'}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-slate-400 block mb-0.5">Keterangan / Alasan Pergeseran:</span>
                                                <span className="text-slate-800">
                                                    {shift.notes || 'Penyesuaian kebutuhan operasional belanja unit kerja'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
        </SuperAdminLayout>
    );
}
