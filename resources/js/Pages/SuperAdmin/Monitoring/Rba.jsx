import SuperAdminLayout from '@/Layouts/SuperAdminLayout';
import { Head } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowRightLeft,
    Calendar,
    CheckCircle2,
    FileSpreadsheet,
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
        }).format(Number(val || 0));

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
                {/* 1. Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                            Monitoring RBA & Pergeseran Anggaran
                        </h1>
                        <p className="mt-1 text-xs sm:text-sm text-slate-500 font-medium">
                            Pengawasan komprehensif struktur rekening RBA dan jejak pergeseran anggaran Tahun {active_year}.
                        </p>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold border bg-amber-50 text-amber-800 border-amber-200">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                            Mode Pengawas (Read-Only)
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-xl border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-bold text-teal-800 shadow-2xs">
                            <Calendar className="h-3.5 w-3.5 text-teal-600" />
                            TA: <span className="font-mono text-teal-900 font-bold">{active_year}</span>
                        </span>
                    </div>
                </div>

                {/* 2. Segregation of Duties Alert Banner */}
                <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200/80 flex items-start gap-3 shadow-2xs">
                    <Shield className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                    <div className="text-xs text-teal-950 leading-relaxed">
                        <strong className="font-bold text-teal-900">Segregation of Duties (Prinsip BLUD): </strong>
                        Super Admin mengawasi integritas angka anggaran dan memvalidasi riwayat perubahan tanpa memiliki wewenang mengedit pagu rekening secara manual di luar transaksi sah. Perubahan akun dan input pergeseran tetap menjadi ranah eksklusif Bagian Perencanaan.
                    </div>
                </div>

                {/* 3. Kartu Metrik Ringkasan */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-4.5 shadow-xs">
                        <div className="flex items-center justify-between text-slate-500">
                            <span className="text-xs font-bold text-slate-500">Anggaran Semula (Murni)</span>
                            <div className="rounded-xl bg-blue-50 p-2 text-blue-600 border border-blue-200">
                                <FileSpreadsheet className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="mt-3">
                            <div className="text-xl sm:text-2xl font-bold font-mono text-slate-900 truncate">
                                {formatRp(total_original)}
                            </div>
                            <p className="mt-1 text-[11px] font-medium text-slate-400">Pagu murni belanja RBA awal</p>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-white p-4.5 shadow-xs">
                        <div className="flex items-center justify-between text-slate-500">
                            <span className="text-xs font-bold text-slate-500">Anggaran Setelah Pergeseran</span>
                            <div className="rounded-xl bg-emerald-50 p-2 text-emerald-600 border border-emerald-200">
                                <TrendingUp className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="mt-3">
                            <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-700 truncate">
                                {formatRp(total_allocated)}
                            </div>
                            <p className="mt-1 text-[11px] font-medium text-slate-400">Total pagu definitif aktif saat ini</p>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                        <div className="flex items-center justify-between text-slate-500">
                            <span className="text-xs font-bold text-slate-500">Variasi / Net Pergeseran</span>
                            <div className="rounded-xl bg-teal-50 p-2 text-teal-600 border border-teal-200">
                                <ArrowRightLeft className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="mt-3">
                            <div
                                className={`text-xl sm:text-2xl font-bold font-mono truncate ${
                                    shiftDiff === 0
                                        ? 'text-slate-800'
                                        : shiftDiff > 0
                                        ? 'text-blue-600'
                                        : 'text-rose-600'
                                }`}
                            >
                                {shiftDiff > 0 ? `+${formatRp(shiftDiff)}` : formatRp(shiftDiff)}
                            </div>
                            <p className="mt-1 text-[11px] font-medium text-slate-400">
                                {shiftDiff === 0 ? 'Keseimbangan pagu netral (zero-sum)' : 'Terdapat penyesuaian total pagu'}
                            </p>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200/80 bg-white p-4.5 shadow-xs">
                        <div className="flex items-center justify-between text-slate-500">
                            <span className="text-xs font-bold text-slate-500">Jejak Pergeseran Resmi</span>
                            <div className="rounded-xl bg-purple-50 p-2 text-purple-600 border border-purple-200">
                                <History className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="mt-3 flex items-baseline gap-2">
                            <span className="text-2xl font-bold font-mono text-slate-900">
                                {shifts.length}
                            </span>
                            <span className="text-xs font-semibold text-slate-400">Pergeseran</span>
                        </div>
                        <p className="mt-1 text-[11px] font-medium text-slate-400">
                            Total {accounts.length} rekening terdaftar
                        </p>
                    </div>
                </div>

                {/* 4. Kontainer Utama Tabel */}
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
                    {/* Navigation Tabs & Search */}
                    <div className="border-b border-slate-100 px-5 pt-3 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                onClick={() => setActiveTab('accounts')}
                                className={`flex items-center gap-2 pb-3 px-3 text-xs font-bold border-b-2 transition cursor-pointer ${
                                    activeTab === 'accounts'
                                        ? 'border-teal-600 text-teal-700'
                                        : 'border-transparent text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                <Layers className="w-4 h-4" />
                                Rekening RBA ({filteredAccounts.length})
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab('shifts')}
                                className={`flex items-center gap-2 pb-3 px-3 text-xs font-bold border-b-2 transition cursor-pointer ${
                                    activeTab === 'shifts'
                                        ? 'border-teal-600 text-teal-700'
                                        : 'border-transparent text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                <History className="w-4 h-4" />
                                Riwayat Pergeseran ({shifts.length})
                            </button>
                        </div>

                        {activeTab === 'accounts' && (
                            <div className="flex items-center gap-2 pb-2.5">
                                <div className="relative">
                                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Cari kode atau uraian..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 w-44 sm:w-60"
                                    />
                                </div>
                                <select
                                    value={typeFilter}
                                    onChange={(e) => setTypeFilter(e.target.value)}
                                    className="text-xs font-semibold rounded-xl border border-slate-300 bg-white py-2 pl-3 pr-8 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 text-slate-700 cursor-pointer"
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
                            <table className="min-w-full divide-y divide-slate-100">
                                <thead className="bg-slate-50 font-bold border-b border-slate-200 text-slate-700 uppercase tracking-wider text-xs">
                                    <tr>
                                        <th className="px-5 py-3.5">Kode Rekening</th>
                                        <th className="px-5 py-3.5">Uraian Akun</th>
                                        <th className="px-4 py-3.5 text-center">Tipe</th>
                                        <th className="px-5 py-3.5 text-right">Pagu Semula</th>
                                        <th className="px-5 py-3.5 text-right">Penyesuaian</th>
                                        <th className="px-5 py-3.5 text-right">Pagu Definitif</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredAccounts.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-5 py-12 text-center text-slate-400 font-medium">
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
                                                    className={`hover:bg-slate-50/70 transition ${
                                                        isSubHeader ? 'bg-slate-50/60 font-bold text-slate-900' : ''
                                                    }`}
                                                >
                                                    <td className="px-5 py-3.5 font-mono text-xs font-bold text-slate-800">
                                                        {acc.account_code}
                                                    </td>
                                                    <td className="px-5 py-3.5">
                                                        <span className={isSubHeader ? 'text-slate-900' : 'text-slate-700'}>
                                                            {acc.account_name}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3.5 text-center whitespace-nowrap">
                                                        <span
                                                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold border capitalize ${
                                                                acc.type === 'belanja'
                                                                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                                                                    : acc.type === 'pendapatan'
                                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                                    : 'bg-blue-50 text-blue-700 border-blue-200'
                                                            }`}
                                                        >
                                                            {acc.type || 'Akun'}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-3.5 text-right font-mono text-xs text-slate-600">
                                                        {formatRp(acc.original_amount)}
                                                    </td>
                                                    <td className="px-5 py-3.5 text-right font-mono text-xs">
                                                        {diff === 0 ? (
                                                            <span className="text-slate-400">-</span>
                                                        ) : diff > 0 ? (
                                                            <span className="text-emerald-600 font-bold">
                                                                +{formatRp(diff)}
                                                            </span>
                                                        ) : (
                                                            <span className="text-rose-600 font-bold">
                                                                {formatRp(diff)}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-5 py-3.5 text-right font-mono text-xs font-bold text-slate-900">
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
                                <div className="px-5 py-12 text-center text-slate-400 font-medium">
                                    Belum ada pergeseran anggaran yang disahkan pada Tahun {active_year}.
                                </div>
                            ) : (
                                shifts.map((shift) => (
                                    <div key={shift.id} className="p-5 hover:bg-slate-50/70 transition">
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-700 border border-purple-200 font-mono font-bold text-sm shadow-2xs">
                                                    #{shift.shift_number}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                                                        Pergeseran Anggaran RBA #{shift.shift_number}
                                                    </h3>
                                                    <p className="text-[11px] text-slate-400 mt-0.5">
                                                        Tanggal:{' '}
                                                        {shift.shift_date
                                                            ? new Date(shift.shift_date).toLocaleDateString('id-ID', {
                                                                  day: 'numeric',
                                                                  month: 'long',
                                                                  year: 'numeric',
                                                              })
                                                            : '-'}{' '}
                                                        • Diinput oleh: {shift.user?.name || 'Bagian Perencanaan'}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold border bg-emerald-50 text-emerald-800 border-emerald-200 self-start sm:self-auto">
                                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                                Disahkan Resmi
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/80 text-xs text-slate-600">
                                            <div>
                                                <span className="text-slate-400 block mb-0.5 text-[11px]">
                                                    Dasar Hukum / Nomor SK:
                                                </span>
                                                <span className="font-bold text-slate-800">
                                                    {shift.reference_document || 'SK Direktur RSJ Tampan'}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-slate-400 block mb-0.5 text-[11px]">
                                                    Keterangan / Alasan Pergeseran:
                                                </span>
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
