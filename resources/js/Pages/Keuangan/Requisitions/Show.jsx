import KeuanganLayout from '@/Layouts/KeuanganLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useMemo, useState } from 'react';

const formatRupiah = (value) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(Number(value || 0));

const formatTanggal = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(date);
};

const getStatusBadge = (status) => {
    switch (status) {
        case 'Diproses_Keuangan':
            return {
                label: 'Menunggu Validasi Pagu Anggaran',
                desc: 'Pengajuan telah lolos verifikasi Perencanaan. Silakan alokasikan sumber rekening pagu belanja dan setujui untuk mendebit anggaran.',
                bg: 'bg-blue-100 text-blue-900 border-blue-300',
                dot: 'bg-blue-500',
            };
        case 'Disetujui_Selesai':
            return {
                label: 'Disetujui & Anggaran Teralokasi',
                desc: 'Pengajuan telah disetujui secara final. Anggaran belanja telah berhasil dipotong dari rekening pagu terkait.',
                bg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
                dot: 'bg-emerald-500',
            };
        case 'Pending_Perencanaan':
            return {
                label: 'Verifikasi Perencanaan',
                desc: 'Pengajuan ini masih dalam tahap penelaahan kuantitas di Bagian Perencanaan.',
                bg: 'bg-amber-100 text-amber-900 border-amber-300',
                dot: 'bg-amber-500',
            };
        case 'Ditolak':
            return {
                label: 'Pengajuan Ditolak',
                desc: 'Pengajuan telah ditolak.',
                bg: 'bg-rose-100 text-rose-900 border-rose-300',
                dot: 'bg-rose-500',
            };
        default:
            return {
                label: status || 'Pending',
                desc: 'Status dalam proses.',
                bg: 'bg-slate-100 text-slate-800 border-slate-300',
                dot: 'bg-slate-500',
            };
    }
};

export default function Show({ requisition, budgets = [] }) {
    const statusInfo = getStatusBadge(requisition.status);
    const details = requisition.requisition_details || [];
    const isActionable = requisition.status === 'Diproses_Keuangan';

    // State for Reject Modal
    const [showRejectModal, setShowRejectModal] = useState(false);

    // Calculate Grand Total from verified items
    const { grandTotal, totalApprovedItems } = useMemo(() => {
        let total = 0;
        let qtyTotal = 0;

        details.forEach((d) => {
            const qty = d.quantity_approved !== null && d.quantity_approved !== undefined
                ? Number(d.quantity_approved)
                : Number(d.quantity_requested || 0);
            const price = Number(d.unit_price || d.item?.standard_price || 0);

            qtyTotal += qty;
            total += qty * price;
        });

        return { grandTotal: total, totalApprovedItems: qtyTotal };
    }, [details]);

    // Inertia form for approval
    const { data, setData, put, processing, errors } = useForm({
        status: 'Disetujui_Selesai',
        budget_id: requisition.budget_id || '',
    });

    // Selected Budget preview
    const selectedBudget = useMemo(() => {
        return budgets.find((b) => String(b.id) === String(data.budget_id));
    }, [budgets, data.budget_id]);

    const remainingAfterDeduction = useMemo(() => {
        if (!selectedBudget) return null;
        return Number(selectedBudget.remaining_budget || 0) - grandTotal;
    }, [selectedBudget, grandTotal]);

    const isBudgetInsufficient = remainingAfterDeduction !== null && remainingAfterDeduction < 0;

    // Handle Approve Submit
    const handleApprove = (e) => {
        e.preventDefault();
        setData('status', 'Disetujui_Selesai');
        put(route('keuangan.requisitions.update', requisition.id));
    };

    // Handle Reject Submit
    const handleReject = () => {
        setShowRejectModal(false);
        setData('status', 'Ditolak');
        put(route('keuangan.requisitions.update', requisition.id));
    };

    return (
        <KeuanganLayout>
            <Head title={`Validasi ${requisition.requisition_number} - E-Req RSJ Tampan`} />

            <div className="mx-auto max-w-5xl space-y-6">
                {/* Header Back & Info */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <Link
                            href={route('keuangan.requisitions.index')}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition mb-2"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                            </svg>
                            Kembali ke Daftar Validasi
                        </Link>
                        <div className="flex items-center gap-3">
                            <h2 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
                                {requisition.requisition_number}
                            </h2>
                            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border ${statusInfo.bg}`}>
                                <span className={`h-2 w-2 rounded-full ${statusInfo.dot}`} />
                                {statusInfo.label}
                            </span>
                        </div>
                    </div>

                    <div className="text-right">
                        <span className="block text-[11px] font-black uppercase tracking-wider text-slate-500">
                            Status Alur
                        </span>
                        <span className="text-sm font-bold text-slate-800">
                            {isActionable ? 'Tahap 2: Validasi & Pembebanan Anggaran' : 'Tahap Telah Selesai'}
                        </span>
                    </div>
                </div>

                {/* Status Notice Card */}
                <div className={`rounded-2xl border-2 p-5 ${statusInfo.bg}`}>
                    <div className="flex items-start gap-3">
                        <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${statusInfo.dot} text-white text-xs font-black`}>
                            {isActionable ? 'Rp' : '✓'}
                        </div>
                        <div>
                            <h4 className="text-sm font-black">Status Dokumen: {statusInfo.label}</h4>
                            <p className="mt-0.5 text-xs font-semibold opacity-95 leading-relaxed">
                                {statusInfo.desc}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Top Section: Requisition Header Details Card (Batas Kolom Tegas) */}
                <div className="overflow-hidden rounded-2xl border-2 border-slate-300 bg-white shadow-md">
                    <div className="border-b-2 border-slate-200 bg-slate-100 px-6 py-3.5">
                        <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                            Informasi Dokumen Pengajuan
                        </h3>
                    </div>

                    <div className="grid gap-0 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x-2 divide-slate-200">
                        <div className="p-5 bg-white">
                            <span className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1">
                                Nomor Requisition
                            </span>
                            <p className="text-sm font-black text-slate-900">
                                {requisition.requisition_number}
                            </p>
                        </div>

                        <div className="p-5 bg-white">
                            <span className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1">
                                Tanggal Diajukan
                            </span>
                            <p className="text-sm font-black text-slate-900">
                                {formatTanggal(requisition.submission_date)}
                            </p>
                        </div>

                        <div className="p-5 bg-white">
                            <span className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1">
                                Unit Kerja / Divisi
                            </span>
                            <p className="text-sm font-black text-slate-900">
                                {requisition.division?.name || '-'}
                            </p>
                            <span className="text-xs font-bold text-slate-500">
                                Kode: {requisition.division?.division_code}
                            </span>
                        </div>

                        <div className="p-5 bg-white">
                            <span className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1">
                                Petugas Pengaju (PIC)
                            </span>
                            <p className="text-sm font-black text-slate-900">
                                {requisition.user?.name || '-'}
                            </p>
                            <span className="text-xs font-medium text-slate-500">
                                {requisition.user?.email}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Middle Section: Items & Prominent Grand Total */}
                <div className="overflow-hidden rounded-2xl border-2 border-slate-300 bg-white shadow-md">
                    <div className="border-b-2 border-slate-200 bg-slate-100 px-6 py-4 flex items-center justify-between">
                        <div>
                            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                                Rincian Barang yang Disetujui (Hasil Verifikasi Perencanaan)
                            </h3>
                            <p className="text-xs text-slate-500 font-medium">
                                Beban biaya dihitung berdasarkan jumlah kuantitas disetujui dikalikan harga satuan standar acuan
                            </p>
                        </div>
                        <span className="inline-flex items-center rounded-lg bg-slate-200 px-2.5 py-1 text-xs font-black text-slate-800 border border-slate-300">
                            {details.length} Macam Barang
                        </span>
                    </div>

                    {/* Table with Crisp Column Borders */}
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y-2 divide-slate-200 border-collapse">
                            <thead className="bg-emerald-50/80 font-bold border-b-2 border-emerald-200">
                                <tr className="divide-x-2 divide-slate-200">
                                    <th className="w-16 px-4 py-4 text-center text-sm font-black uppercase tracking-wider text-slate-800">
                                        No
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-black uppercase tracking-wider text-slate-800">
                                        Nama Barang & Spesifikasi
                                    </th>
                                    <th className="w-28 px-4 py-4 text-center text-sm font-black uppercase tracking-wider text-slate-800">
                                        Satuan
                                    </th>
                                    <th className="w-36 px-4 py-4 text-center text-sm font-black uppercase tracking-wider text-slate-800 bg-slate-100">
                                        Qty Disetujui
                                    </th>
                                    <th className="w-48 px-6 py-4 text-right text-sm font-black uppercase tracking-wider text-slate-800">
                                        Harga Standar
                                    </th>
                                    <th className="w-48 px-6 py-4 text-right text-sm font-black uppercase tracking-wider text-slate-800">
                                        Subtotal
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y-2 divide-slate-200 bg-white">
                                {details.map((detail, idx) => {
                                    const qty = detail.quantity_approved !== null && detail.quantity_approved !== undefined
                                        ? Number(detail.quantity_approved)
                                        : Number(detail.quantity_requested || 0);
                                    const price = Number(detail.unit_price || detail.item?.standard_price || 0);
                                    const subtotal = qty * price;

                                    return (
                                        <tr key={detail.id || idx} className="divide-x-2 divide-slate-200 hover:bg-emerald-50/60 transition-colors duration-200 cursor-default">
                                            {/* No */}
                                            <td className="whitespace-nowrap px-4 py-4 text-center text-sm font-bold text-slate-600 bg-slate-50/70">
                                                #{idx + 1}
                                            </td>

                                            {/* Item Name */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="inline-flex rounded-md bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800 border border-emerald-300">
                                                        {detail.item?.item_code || 'BRG'}
                                                    </span>
                                                    <span className="text-sm font-bold text-slate-900">
                                                        {detail.item?.name || detail.manual_item_name}
                                                    </span>
                                                </div>
                                                {(detail.item?.specification || detail.manual_specification) && (
                                                    <p className="mt-1 text-xs text-slate-500 font-medium">
                                                        Spesifikasi: {detail.item?.specification || detail.manual_specification}
                                                    </p>
                                                )}
                                            </td>

                                            {/* Satuan */}
                                            <td className="whitespace-nowrap px-4 py-4 text-center">
                                                <span className="inline-flex rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-800 border border-slate-300">
                                                    {detail.item?.unit_type || 'Unit'}
                                                </span>
                                            </td>

                                            {/* Qty Approved */}
                                            <td className="whitespace-nowrap px-4 py-4 text-center bg-emerald-50/40">
                                                <span className="text-sm font-black text-slate-900">
                                                    {qty}
                                                </span>
                                            </td>

                                            {/* Standard Price */}
                                            <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-semibold text-slate-800">
                                                {formatRupiah(price)}
                                            </td>

                                            {/* Subtotal */}
                                            <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-black text-emerald-700 bg-emerald-50/60">
                                                {formatRupiah(subtotal)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>

                            {/* Prominent Grand Total Footer */}
                            <tfoot className="border-t-2 border-slate-300 bg-slate-100 divide-x-2 divide-slate-200">
                                <tr>
                                    <td colSpan="3" className="px-6 py-4 text-right text-sm font-black uppercase tracking-wider text-slate-700">
                                        Total Barang Disetujui:
                                    </td>
                                    <td className="px-4 py-4 text-center text-sm font-black text-slate-900 bg-slate-200/60">
                                        {totalApprovedItems} Unit
                                    </td>
                                    <td className="px-6 py-4 text-right text-xs font-black uppercase tracking-wider text-slate-800">
                                        Grand Total Biaya:
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-right bg-emerald-100/70">
                                        <span className="text-xl sm:text-2xl font-black text-emerald-800 tracking-tight">
                                            {formatRupiah(grandTotal)}
                                        </span>
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                {/* Bottom Section: Budget Deduction Form OR Allocation Info */}
                {isActionable ? (
                    <form onSubmit={handleApprove} className="space-y-6">
                        <div className="overflow-hidden rounded-2xl border-2 border-slate-300 bg-white shadow-md">
                            <div className="border-b-2 border-slate-200 bg-slate-100 px-6 py-4">
                                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                                    Pilih Sumber Pagu Anggaran Belanja
                                </h3>
                                <p className="text-xs text-slate-500 font-medium">
                                    Tentukan rekening DPA/RKA yang akan mendanai pengajuan ini. Saldo sisa pagu akan otomatis terpotong saat disetujui.
                                </p>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Budget Select Dropdown */}
                                <div>
                                    <label className="mb-2 block text-xs font-black uppercase tracking-wider text-slate-700">
                                        Sumber Pagu Anggaran <span className="text-rose-600">*</span>
                                    </label>
                                    <select
                                        value={data.budget_id}
                                        onChange={(e) => setData('budget_id', e.target.value)}
                                        className="block w-full rounded-xl border-2 border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-900 shadow-2xs transition-all duration-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/30"
                                    >
                                        <option value="">-- Pilih Rekening Pagu Anggaran --</option>
                                        {budgets.map((b) => (
                                            <option key={b.id} value={b.id}>
                                                [{b.account_code}] {b.account_name} (TA {b.period_year}) — Sisa Pagu: {formatRupiah(b.remaining_budget)}
                                            </option>
                                        ))}
                                    </select>

                                    {errors.budget_id && (
                                        <p className="mt-2 text-xs font-bold text-rose-600">
                                            {errors.budget_id}
                                        </p>
                                    )}
                                </div>

                                {/* Interactive Budget Preview Calculation */}
                                {selectedBudget && (
                                    <div className={`rounded-2xl border-2 p-5 ${
                                        isBudgetInsufficient
                                            ? 'bg-rose-50/80 border-rose-300 text-rose-950'
                                            : 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                                    }`}>
                                        <div className="flex items-center justify-between border-b border-black/10 pb-3 mb-3">
                                            <span className="text-xs font-black uppercase tracking-wider">
                                                Simulasi Pemotongan Saldo Pagu
                                            </span>
                                            <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-white/80 border border-black/10">
                                                Rekening: {selectedBudget.account_code}
                                            </span>
                                        </div>

                                        <div className="grid gap-4 sm:grid-cols-3 text-sm font-bold">
                                            <div>
                                                <span className="block text-xs font-medium opacity-75">Sisa Pagu Saat Ini:</span>
                                                <p className="text-base font-black">{formatRupiah(selectedBudget.remaining_budget)}</p>
                                            </div>
                                            <div>
                                                <span className="block text-xs font-medium opacity-75">Beban Biaya Requisition:</span>
                                                <p className="text-base font-black text-rose-700">- {formatRupiah(grandTotal)}</p>
                                            </div>
                                            <div>
                                                <span className="block text-xs font-medium opacity-75">Estimasi Sisa Pagu Akhir:</span>
                                                <p className={`text-base font-black ${isBudgetInsufficient ? 'text-rose-700' : 'text-emerald-700'}`}>
                                                    {formatRupiah(remainingAfterDeduction)}
                                                </p>
                                            </div>
                                        </div>

                                        {isBudgetInsufficient && (
                                            <div className="mt-4 flex items-center gap-2 text-xs font-black text-rose-700 bg-rose-100/80 p-3 rounded-xl border border-rose-300">
                                                <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                                                </svg>
                                                Peringatan: Sisa pagu anggaran pada rekening ini tidak mencukupi untuk membiayai total pengajuan ini!
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons Toolbar */}
                            <div className="border-t-2 border-slate-200 bg-slate-50 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <Link
                                    href={route('keuangan.requisitions.index')}
                                    className="rounded-xl border-2 border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 shadow-2xs transition hover:bg-slate-100 active:scale-95 text-center"
                                >
                                    Batal & Kembali
                                </Link>

                                <div className="flex flex-wrap items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowRejectModal(true)}
                                        disabled={processing}
                                        className="rounded-xl border-2 border-rose-400 bg-white hover:bg-rose-50 text-rose-700 px-5 py-2.5 text-sm font-black shadow-xs transition active:scale-95 disabled:opacity-50"
                                    >
                                        Tolak Pengajuan
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={processing || isBudgetInsufficient || !data.budget_id}
                                        className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white px-6 py-2.5 text-sm font-black shadow-md hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        {processing ? (
                                            <>
                                                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                </svg>
                                                Memproses Pemotongan...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                                </svg>
                                                Setujui & Potong Pagu Anggaran
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                ) : (
                    /* Read-Only Info Card for Completed or Rejected Requisitions */
                    <div className="overflow-hidden rounded-2xl border-2 border-slate-300 bg-white shadow-md">
                        <div className="border-b-2 border-slate-200 bg-slate-100 px-6 py-4">
                            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                                Informasi Alokasi Anggaran
                            </h3>
                        </div>
                        <div className="p-6">
                            {requisition.budget ? (
                                <div className="rounded-xl border-2 border-emerald-200 bg-emerald-50/60 p-5 space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span className="inline-flex items-center rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-black text-white">
                                            {requisition.budget.account_code}
                                        </span>
                                        <span className="text-sm font-black text-emerald-950">
                                            {requisition.budget.account_name}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-600 font-medium">
                                        Tahun Anggaran: <span className="font-bold text-slate-900">{requisition.budget.period_year}</span> &bull; Sisa Pagu Saat Ini: <span className="font-bold text-emerald-700">{formatRupiah(requisition.budget.remaining_budget)}</span>
                                    </p>
                                </div>
                            ) : (
                                <p className="text-xs text-slate-500 font-medium">
                                    Tidak ada pagu anggaran belanja yang terhubung pada pengajuan ini.
                                </p>
                            )}

                            <div className="mt-6 flex justify-end">
                                <Link
                                    href={route('keuangan.requisitions.index')}
                                    className="rounded-xl border-2 border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 shadow-2xs transition hover:bg-slate-100 active:scale-95"
                                >
                                    &larr; Kembali ke Daftar Validasi
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Rejection Confirmation Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                    <div className="w-full max-w-md rounded-2xl border-2 border-slate-300 bg-white p-6 shadow-2xl space-y-4">
                        <div className="flex items-center gap-3 text-rose-600">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-100">
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                                </svg>
                            </div>
                            <h3 className="text-base font-black text-slate-900">Konfirmasi Tolak Pengajuan</h3>
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed font-medium">
                            Apakah Anda yakin ingin menolak alokasi anggaran untuk pengajuan <span className="font-bold text-slate-800">{requisition.requisition_number}</span> dari <span className="font-bold text-slate-800">{requisition.division?.name}</span>? Status dokumen akan menjadi <span className="font-bold text-rose-700">Ditolak</span> dan pagu anggaran tidak akan dipotong.
                        </p>

                        <div className="flex items-center justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setShowRejectModal(false)}
                                className="rounded-xl border-2 border-slate-300 bg-white px-5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
                            >
                                Batalkan
                            </button>
                            <button
                                type="button"
                                onClick={handleReject}
                                disabled={processing}
                                className="rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white px-5 py-2 text-xs font-black shadow-md transition disabled:opacity-50"
                            >
                                Ya, Tolak Pengajuan
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </KeuanganLayout>
    );
}
