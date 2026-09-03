import AuditTrailTimeline from '@/Components/AuditTrailTimeline';
import DivisiLayout from '@/Layouts/DivisiLayout';
import { Head, Link } from '@inertiajs/react';

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
                desc: 'Pengajuan Anda telah berhasil dikirim ke Bagian Perencanaan. Tim perencanaan sedang memeriksa spesifikasi dan kuantitas barang.',
                bg: 'bg-amber-100 text-amber-900 border-amber-300',
                dot: 'bg-amber-500',
            };
        case 'Diproses_Keuangan':
            return {
                label: 'Sedang Diproses Keuangan',
                desc: 'Spesifikasi barang telah diverifikasi oleh tim Perencanaan. Saat ini dokumen diteruskan ke Bagian Keuangan untuk pengecekan pagu anggaran belanja.',
                bg: 'bg-blue-100 text-blue-900 border-blue-300',
                dot: 'bg-blue-500',
            };
        case 'Disetujui_Selesai':
            return {
                label: 'Disetujui / Selesai',
                desc: 'Pengajuan telah disetujui penuh oleh Keuangan dan alokasi dana telah dipotong dari anggaran. Pengadaan siap direalisasikan.',
                bg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
                dot: 'bg-emerald-500',
            };
        case 'Ditolak':
            return {
                label: 'Pengajuan Ditolak',
                desc: 'Pengajuan ini tidak dapat diproses lebih lanjut. Silakan hubungi bagian Perencanaan atau Keuangan untuk informasi lebih lanjut.',
                bg: 'bg-rose-100 text-rose-900 border-rose-300',
                dot: 'bg-rose-500',
            };
        default:
            return {
                label: status || 'Pending',
                desc: 'Pengajuan sedang dalam proses penelaahan.',
                bg: 'bg-slate-100 text-slate-800 border-slate-300',
                dot: 'bg-slate-400',
            };
    }
};

export default function Show({ requisition }) {
    const statusInfo = getStatusBadge(requisition.status);
    const details = requisition.requisition_details || [];

    const totalCost = details.reduce(
        (sum, d) => sum + (Number(d.quantity_requested || 0) * Number(d.unit_price || 0)),
        0
    );

    const totalQty = details.reduce(
        (sum, d) => sum + Number(d.quantity_requested || 0),
        0
    );

    return (
        <DivisiLayout>
            <Head title={`Rincian ${requisition.requisition_number} - E-BLUD RSJ Tampan`} />

            <div className="mx-auto max-w-5xl space-y-6">
                {/* Header Back & Info */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <Link
                            href={route('requisitions.index')}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition mb-2"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                            </svg>
                            Kembali ke Daftar Pengajuan
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

                    <div className="flex items-center gap-3">
                        <a
                            href={route('requisitions.print', requisition.id)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-slate-300 bg-white hover:bg-slate-50 active:scale-95 px-4 py-2.5 text-sm font-bold text-slate-700 shadow-xs hover:shadow-md transition-all duration-200"
                        >
                            <svg className="h-4 w-4 text-slate-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24-1.077-.32-2.14-.32-3.193 0-5.18 4.02-9.386 8.974-9.386 4.954 0 8.973 4.207 8.973 9.386 0 1.053-.08 2.116-.32 3.193M12 18v-4.5m0 0l-2.25 2.25M12 13.5l2.25 2.25M3.75 19.5h16.5" />
                            </svg>
                            Cetak Nota
                        </a>
                        <Link
                            href={route('requisitions.create')}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 px-5 py-2.5 text-sm font-bold text-white shadow-md hover:shadow-lg transition-all duration-200"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            Buat Pengajuan Baru
                        </Link>
                    </div>
                </div>

                {/* Status Notice Card */}
                <div className={`rounded-2xl border-2 p-5 ${statusInfo.bg}`}>
                    <div className="flex items-start gap-3">
                        <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${statusInfo.dot} text-white text-xs font-black`}>
                            ✓
                        </div>
                        <div>
                            <h4 className="text-sm font-black">Status Dokumen: {statusInfo.label}</h4>
                            <p className="mt-0.5 text-xs font-semibold opacity-95 leading-relaxed">
                                {statusInfo.desc}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Requisition Header Info Card (Batas Kolom Tegas) */}
                <div className="overflow-hidden rounded-2xl border-2 border-slate-300 bg-white shadow-md">
                    <div className="border-b-2 border-slate-200 bg-slate-100 px-6 py-3.5">
                        <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                            Informasi Dokumen Pengajuan
                        </h3>
                    </div>

                    <div className="grid gap-0 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x-2 divide-slate-200">
                        <div className="p-5 bg-white">
                            <span className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1">
                                Nomor Dokumen
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

                {/* Requested Items Table Card (Tabel dengan Batas Kolom Tegas) */}
                <div className="overflow-hidden rounded-2xl border-2 border-slate-300 bg-white shadow-md">
                    <div className="border-b-2 border-slate-200 bg-slate-100 px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                                Rincian Barang yang Diajukan
                            </h3>
                            <span className="inline-flex items-center rounded-lg bg-slate-200 px-2.5 py-0.5 text-xs font-black text-slate-800 border border-slate-300">
                                {details.length} Macam Barang
                            </span>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y-2 divide-slate-200 border-collapse">
                            <thead className="bg-emerald-50/80 font-bold border-b-2 border-emerald-200">
                                <tr className="divide-x-2 divide-slate-200">
                                    <th className="w-16 px-4 py-4 text-center text-sm font-black uppercase tracking-wider text-slate-800">
                                        No
                                    </th>
                                    <th className="px-6 py-4 text-left text-sm font-black uppercase tracking-wider text-slate-800">
                                        Barang & Spesifikasi
                                    </th>
                                    <th className="w-36 px-6 py-4 text-center text-sm font-black uppercase tracking-wider text-slate-800">
                                        Kuantitas
                                    </th>
                                    <th className="w-48 px-6 py-4 text-right text-sm font-black uppercase tracking-wider text-slate-800">
                                        Harga Satuan Acuan
                                    </th>
                                    <th className="w-48 px-6 py-4 text-right text-sm font-black uppercase tracking-wider text-slate-800">
                                        Subtotal
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y-2 divide-slate-200 bg-white">
                                {details.map((detail, idx) => (
                                    <tr
                                        key={detail.id || idx}
                                        className="divide-x-2 divide-slate-200 hover:bg-emerald-50/60 transition-colors duration-200 cursor-default"
                                    >
                                        <td className="whitespace-nowrap px-4 py-4 text-center text-sm font-bold text-slate-600 bg-slate-50/50">
                                            #{idx + 1}
                                        </td>
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
                                        <td className="whitespace-nowrap px-6 py-4 text-center">
                                            <span className="text-sm font-black text-slate-900">
                                                {detail.quantity_requested}
                                            </span>{' '}
                                            <span className="text-xs font-bold text-slate-600">
                                                {detail.item?.unit_type || 'Unit'}
                                            </span>
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-semibold text-slate-800">
                                            {formatRupiah(detail.unit_price)}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-black text-emerald-700 bg-emerald-50/40">
                                            {formatRupiah(detail.subtotal)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="border-t-2 border-slate-300 bg-slate-100 divide-x-2 divide-slate-200">
                                <tr>
                                    <td colSpan="2" className="px-6 py-4 text-right text-sm font-black uppercase tracking-wider text-slate-700">
                                        Total Akumulasi:
                                    </td>
                                    <td className="px-6 py-4 text-center text-sm font-black text-slate-900 bg-slate-200/60">
                                        {totalQty} Unit
                                    </td>
                                    <td className="px-6 py-4 text-right text-xs font-black uppercase tracking-wider text-slate-500">
                                        Perkiraan Total:
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-right text-base font-black text-emerald-700 bg-emerald-100/60">
                                        {formatRupiah(totalCost)}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                {/* Jejak Audit Timeline */}
                <AuditTrailTimeline requisition={requisition} />

                {/* Bottom Back Button */}
                <div className="flex items-center justify-between">
                    <Link
                        href={route('requisitions.index')}
                        className="rounded-xl border-2 border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 shadow-2xs transition hover:bg-slate-100 active:scale-95"
                    >
                        &larr; Kembali ke Daftar Pengajuan
                    </Link>
                </div>
            </div>
        </DivisiLayout>
    );
}
