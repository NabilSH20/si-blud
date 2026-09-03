import AuditTrailTimeline from '@/Components/AuditTrailTimeline';
import PerencanaanLayout from '@/Layouts/PerencanaanLayout';
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
        case 'Pending_Perencanaan':
            return {
                label: 'Menunggu Verifikasi Perencanaan',
                desc: 'Pengajuan ini memerlukan pemeriksaan spesifikasi barang dan penyesuaian kuantitas yang disetujui sebelum diteruskan ke Bagian Keuangan.',
                bg: 'bg-amber-100 text-amber-900 border-amber-300',
                dot: 'bg-amber-500',
            };
        case 'Diproses_Keuangan':
            return {
                label: 'Diteruskan ke Keuangan',
                desc: 'Pengajuan telah diverifikasi oleh tim Perencanaan dan saat ini sedang ditelaah pagu anggarannya oleh Bagian Keuangan.',
                bg: 'bg-blue-100 text-blue-900 border-blue-300',
                dot: 'bg-blue-500',
            };
        case 'Disetujui_Selesai':
            return {
                label: 'Disetujui / Selesai',
                desc: 'Pengajuan telah disetujui penuh dan anggaran telah dialokasikan.',
                bg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
                dot: 'bg-emerald-500',
            };
        case 'Ditolak':
            return {
                label: 'Ditolak',
                desc: 'Pengajuan telah ditolak pada tahap verifikasi.',
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

export default function Show({ requisition }) {
    const statusInfo = getStatusBadge(requisition.status);
    const details = requisition.requisition_details || [];
    const isPending = requisition.status === 'Pending_Perencanaan';

    // State for rejection confirmation modal
    const [showRejectModal, setShowRejectModal] = useState(false);

    // Initialize form with items array
    const { data, setData, put, processing, errors } = useForm({
        status: 'Diproses_Keuangan',
        items: details.map((d) => ({
            id: d.id,
            quantity_approved: d.quantity_approved !== null && d.quantity_approved !== undefined
                ? d.quantity_approved
                : d.quantity_requested,
        })),
    });

    const updateApprovedQty = (index, value) => {
        const newItems = [...data.items];
        newItems[index] = {
            ...newItems[index],
            quantity_approved: value === '' ? 0 : parseInt(value, 10) || 0,
        };
        setData('items', newItems);
    };

    // Calculate live totals
    const { totalRequestedQty, totalApprovedQty, totalEstimatedApproved } = useMemo(() => {
        let reqQty = 0;
        let appQty = 0;
        let totalVal = 0;

        details.forEach((d, idx) => {
            const requested = Number(d.quantity_requested || 0);
            const approved = isPending
                ? Number(data.items[idx]?.quantity_approved || 0)
                : Number(d.quantity_approved ?? d.quantity_requested ?? 0);
            const unitPrice = Number(d.unit_price || 0);

            reqQty += requested;
            appQty += approved;
            totalVal += approved * unitPrice;
        });

        return {
            totalRequestedQty: reqQty,
            totalApprovedQty: appQty,
            totalEstimatedApproved: totalVal,
        };
    }, [details, data.items, isPending]);

    // Handle Approve Submit
    const handleApprove = (e) => {
        e.preventDefault();
        setData('status', 'Diproses_Keuangan');
        put(route('perencanaan.requisitions.update', requisition.id));
    };

    // Handle Reject Submit
    const handleReject = () => {
        setShowRejectModal(false);
        setData('status', 'Ditolak');
        put(route('perencanaan.requisitions.update', requisition.id));
    };

    return (
        <PerencanaanLayout>
            <Head title={`Verifikasi ${requisition.requisition_number} - E-BLUD RSJ Tampan`} />

            <div className="mx-auto max-w-5xl space-y-6">
                {/* Header Back & Info */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <Link
                            href={route('perencanaan.requisitions.index')}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition mb-2"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                            </svg>
                            Kembali ke Daftar Verifikasi
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
                            {isPending ? 'Tahap 1: Verifikasi Perencanaan' : 'Tahap Verifikasi Telah Selesai'}
                        </span>
                    </div>
                </div>

                {/* Status Notice Banner */}
                <div className={`rounded-2xl border-2 p-5 ${statusInfo.bg}`}>
                    <div className="flex items-start gap-3">
                        <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${statusInfo.dot} text-white text-xs font-black`}>
                            {isPending ? '!' : '✓'}
                        </div>
                        <div>
                            <h4 className="text-sm font-black">Status Dokumen: {statusInfo.label}</h4>
                            <p className="mt-0.5 text-xs font-semibold opacity-95 leading-relaxed">
                                {statusInfo.desc}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Top Section: Requisition Details Card (Batas Kolom Tegas) */}
                <div className="overflow-hidden rounded-2xl border-2 border-slate-300 bg-white shadow-md">
                    <div className="border-b-2 border-slate-200 bg-slate-100 px-6 py-3.5">
                        <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                            Informasi Pengajuan dari Unit Kerja
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

                {/* Middle Section: Items Verification Table */}
                <form onSubmit={handleApprove} className="space-y-6">
                    <div className="overflow-hidden rounded-2xl border-2 border-slate-300 bg-white shadow-md">
                        <div className="border-b-2 border-slate-200 bg-slate-100 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div>
                                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                                    Verifikasi Spesifikasi & Jumlah Barang
                                </h3>
                                <p className="text-xs text-slate-500 font-medium">
                                    {isPending
                                        ? 'Periksa kuantitas pada kolom "Jumlah Disetujui". Anda dapat mengubah kuantitas sesuai ketersediaan atau standardisasi.'
                                        : 'Daftar kuantitas yang telah diverifikasi untuk pengajuan ini.'}
                                </p>
                            </div>
                            <span className="inline-flex items-center rounded-lg bg-slate-200 px-2.5 py-1 text-xs font-black text-slate-800 border border-slate-300 self-start sm:self-auto">
                                {details.length} Macam Barang
                            </span>
                        </div>

                        {/* Tabel dengan Garis Batas Kolom Tegas */}
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y-2 divide-slate-300 border-collapse">
                                <thead className="bg-emerald-50/80 font-bold border-b-2 border-emerald-200">
                                    <tr className="divide-x-2 divide-slate-200">
                                        <th className="w-16 px-4 py-4 text-center text-sm font-black uppercase tracking-wider text-slate-800">
                                            No
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-black uppercase tracking-wider text-slate-800 min-w-[260px]">
                                            Barang & Spesifikasi
                                        </th>
                                        <th className="w-28 px-4 py-4 text-center text-sm font-black uppercase tracking-wider text-slate-800">
                                            Satuan
                                        </th>
                                        <th className="w-40 px-5 py-4 text-right text-sm font-black uppercase tracking-wider text-slate-800">
                                            Harga Acuan
                                        </th>
                                        <th className="w-36 px-4 py-4 text-center text-sm font-black uppercase tracking-wider text-slate-800 bg-slate-100">
                                            Diminta
                                        </th>
                                        <th className="w-44 px-4 py-4 text-center text-sm font-black uppercase tracking-wider text-emerald-800 bg-emerald-50">
                                            Jumlah Disetujui *
                                        </th>
                                        <th className="w-44 px-5 py-4 text-right text-sm font-black uppercase tracking-wider text-slate-800">
                                            Subtotal Disetujui
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y-2 divide-slate-200 bg-white">
                                    {details.map((detail, idx) => {
                                        const currentApproved = isPending
                                            ? data.items[idx]?.quantity_approved ?? detail.quantity_requested
                                            : detail.quantity_approved ?? detail.quantity_requested;
                                        const subtotal = Number(detail.unit_price || 0) * Number(currentApproved || 0);

                                        return (
                                            <tr key={detail.id || idx} className="divide-x-2 divide-slate-200 hover:bg-emerald-50/60 transition-colors duration-200 cursor-default">
                                                {/* No */}
                                                <td className="whitespace-nowrap px-4 py-4 text-center text-sm font-bold text-slate-600 bg-slate-50/70">
                                                    #{idx + 1}
                                                </td>

                                                {/* Barang */}
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <span className="inline-flex rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800 border border-emerald-300">
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

                                                {/* Harga Acuan */}
                                                <td className="whitespace-nowrap px-5 py-4 text-right text-sm font-semibold text-slate-800">
                                                    {formatRupiah(detail.unit_price)}
                                                </td>

                                                {/* Jumlah Diminta */}
                                                <td className="whitespace-nowrap px-4 py-4 text-center bg-slate-50/40">
                                                    <span className="text-sm font-black text-slate-800">
                                                        {detail.quantity_requested}
                                                    </span>
                                                </td>

                                                {/* Jumlah Disetujui (Editable Input / Read-only) */}
                                                <td className="p-3 text-center bg-emerald-50/30">
                                                    {isPending ? (
                                                        <div>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                value={data.items[idx]?.quantity_approved ?? ''}
                                                                onChange={(e) => updateApprovedQty(idx, e.target.value)}
                                                                className="block w-full rounded-xl border-2 border-emerald-500 bg-white px-2 py-2 text-center text-sm font-black text-slate-900 shadow-2xs transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-600/30"
                                                            />
                                                            {errors[`items.${idx}.quantity_approved`] && (
                                                                <p className="mt-1 text-[11px] font-bold text-rose-600">
                                                                    {errors[`items.${idx}.quantity_approved`]}
                                                                </p>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="inline-flex rounded-lg bg-emerald-100 px-3 py-1 text-sm font-black text-emerald-900 border border-emerald-300">
                                                            {detail.quantity_approved ?? detail.quantity_requested}
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Subtotal */}
                                                <td className="whitespace-nowrap px-5 py-4 text-right text-sm font-black text-emerald-700 bg-emerald-50/60">
                                                    {formatRupiah(subtotal)}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>

                                {/* Footer Akumulasi */}
                                <tfoot className="border-t-2 border-slate-300 bg-slate-100 divide-x-2 divide-slate-200">
                                    <tr>
                                        <td colSpan="4" className="px-6 py-4 text-right text-sm font-black uppercase tracking-wider text-slate-700">
                                            Total Diminta / Disetujui:
                                        </td>
                                        <td className="px-4 py-4 text-center text-sm font-black text-slate-800 bg-slate-200/60">
                                            {totalRequestedQty}
                                        </td>
                                        <td className="px-4 py-4 text-center text-sm font-black text-emerald-800 bg-emerald-100/60">
                                            {totalApprovedQty} Unit
                                        </td>
                                        <td className="whitespace-nowrap px-5 py-4 text-right text-base font-black text-emerald-700 bg-emerald-100/60">
                                            {formatRupiah(totalEstimatedApproved)}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>

                    {/* Bottom Section: Action Buttons */}
                    {isPending ? (
                        <div className="overflow-hidden rounded-2xl border-2 border-slate-300 bg-white p-6 shadow-md">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div>
                                    <h4 className="text-sm font-black text-slate-900">Konfirmasi Verifikasi Pengajuan</h4>
                                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                                        Pastikan kuantitas yang disetujui telah sesuai sebelum meneruskan ke Bagian Keuangan.
                                    </p>
                                </div>

                                <div className="flex flex-wrap items-center gap-3">
                                    <Link
                                        href={route('perencanaan.requisitions.index')}
                                        className="rounded-xl border-2 border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 shadow-2xs transition hover:bg-slate-100 active:scale-95"
                                    >
                                        Kembali
                                    </Link>

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
                                        disabled={processing}
                                        className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white px-6 py-2.5 text-sm font-black shadow-md hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50"
                                    >
                                        {processing ? (
                                            <>
                                                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                </svg>
                                                Memproses...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                                </svg>
                                                Setujui & Teruskan ke Keuangan
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-end">
                            <Link
                                href={route('perencanaan.requisitions.index')}
                                className="rounded-xl border-2 border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 shadow-2xs transition hover:bg-slate-100 active:scale-95"
                            >
                                &larr; Kembali ke Daftar Pengajuan
                            </Link>
                        </div>
                    )}
                </form>

                {/* Jejak Audit Timeline */}
                <AuditTrailTimeline requisition={requisition} />
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
                            Apakah Anda yakin ingin menolak pengajuan <span className="font-bold text-slate-800">{requisition.requisition_number}</span> dari <span className="font-bold text-slate-800">{requisition.division?.name}</span>? Status pengajuan akan diubah menjadi <span className="font-bold text-rose-700">Ditolak</span> dan alur tidak akan diteruskan ke Keuangan.
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
        </PerencanaanLayout>
    );
}
