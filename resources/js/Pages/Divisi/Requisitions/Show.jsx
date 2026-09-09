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
                desc: 'Pengajuan usulan belanja Anda telah masuk ke Bagian Perencanaan. Tim Perencanaan sedang menelaah kewajaran volume dan kesesuaian pagu RBA BLUD.',
                bg: 'bg-amber-100 text-amber-900 border-amber-300',
                dot: 'bg-amber-500',
            };
        case 'Diproses_Keuangan':
            return {
                label: 'Sedang Diproses Keuangan',
                desc: 'Usulan telah diverifikasi oleh Tim Perencanaan. Saat ini dokumen diteruskan ke Bagian Keuangan untuk pengecekan ketersediaan kas BLUD dan kesiapan SP2D/SPJ.',
                bg: 'bg-blue-100 text-blue-900 border-blue-300',
                dot: 'bg-blue-500',
            };
        case 'Disetujui_Selesai':
            return {
                label: 'Disetujui / Selesai',
                desc: 'Usulan belanja telah disetujui penuh oleh Bagian Keuangan dan dialokasikan ke dalam RBA pergeseran/kas BLUD. Pengadaan siap direalisasikan.',
                bg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
                dot: 'bg-emerald-500',
            };
        case 'Ditolak':
            return {
                label: 'Pengajuan Ditolak',
                desc: 'Usulan belanja ini tidak dapat diproses lebih lanjut. Periksa catatan penolakan dari Tim Perencanaan atau Bagian Keuangan.',
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
    const details = requisition.requisition_details || requisition.requisitionDetails || [];

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
                        <div className="flex flex-wrap items-center gap-3">
                            <h2 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
                                {requisition.requisition_number}
                            </h2>
                            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border ${statusInfo.bg}`}>
                                <span className={`h-2 w-2 rounded-full ${statusInfo.dot}`} />
                                {statusInfo.label}
                            </span>
                            <span className="inline-flex items-center rounded-md bg-amber-50 px-2.5 py-1 text-xs font-black text-amber-800 border border-amber-200">
                                TA {requisition.fiscal_year || '2027'}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <a
                            href={route('requisitions.print', requisition.id)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-slate-300 bg-white hover:bg-slate-50 active:scale-95 px-4 py-2.5 text-xs font-bold text-slate-700 shadow-xs hover:shadow-md transition-all duration-200"
                        >
                            <svg className="h-4 w-4 text-slate-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24-1.077-.32-2.14-.32-3.193 0-5.18 4.02-9.386 8.974-9.386 4.954 0 8.973 4.207 8.973 9.386 0 1.053-.08 2.116-.32 3.193M12 18v-4.5m0 0l-2.25 2.25M12 13.5l2.25 2.25M3.75 19.5h16.5" />
                            </svg>
                            Cetak Nota Dinas
                        </a>
                        <Link
                            href={route('requisitions.create', { jenis: requisition.jenis_belanja || 'Operasi' })}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:shadow-lg transition-all duration-200"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            Buat Usulan Baru
                        </Link>
                    </div>
                </div>

                {/* Status Notice Card */}
                <div className={`rounded-2xl border-2 p-5 shadow-md shadow-emerald-950/5 ${statusInfo.bg}`}>
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

                {/* Requisition Header Info Card */}
                <div className="overflow-hidden rounded-2xl border border-emerald-100/90 bg-white shadow-md shadow-emerald-950/5 hover:shadow-lg hover:shadow-emerald-900/10 transition-all duration-200">
                    <div className="border-b border-emerald-100 bg-gradient-to-r from-emerald-50/90 via-teal-50/40 to-slate-50/50 px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-2xs">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                </svg>
                            </span>
                            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-950">
                                Identitas Dokumen Pengajuan E-BLUD
                            </h3>
                        </div>
                        <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-0.5 text-[11px] font-bold text-emerald-800 border border-emerald-200">
                            Dana BLUD RSJ Tampan
                        </span>
                    </div>

                    <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="space-y-1">
                            <span className="block text-xs font-medium text-slate-500">
                                Nomor Dokumen Pengajuan
                            </span>
                            <p className="text-sm font-bold text-slate-900">
                                {requisition.requisition_number}
                            </p>
                            {requisition.nomor_surat_unit && (
                                <p className="text-xs text-slate-600 font-medium">
                                    No. Pengantar Unit: <span className="font-semibold">{requisition.nomor_surat_unit}</span>
                                </p>
                            )}
                        </div>

                        <div className="space-y-1">
                            <span className="block text-xs font-medium text-slate-500">
                                Tanggal & Tahun Anggaran
                            </span>
                            <p className="text-sm font-bold text-slate-900">
                                {formatTanggal(requisition.submission_date)}
                            </p>
                            <p className="text-xs text-amber-700 font-bold">
                                Target Realisasi: TA {requisition.fiscal_year || '2027'}
                            </p>
                        </div>

                        <div className="space-y-1">
                            <span className="block text-xs font-medium text-slate-500">
                                Unit Kerja & Bidang Pengusul
                            </span>
                            <p className="text-sm font-bold text-slate-900">
                                {requisition.unit?.name || requisition.division?.name || '-'}
                            </p>
                            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-800 border border-emerald-200">
                                {requisition.division?.name}
                            </span>
                        </div>

                        <div className="space-y-1">
                            <span className="block text-xs font-medium text-slate-500">
                                Petugas Pengaju (PIC)
                            </span>
                            <p className="text-sm font-bold text-slate-900">
                                {requisition.user?.name || '-'}
                            </p>
                            <p className="text-xs text-slate-500">
                                NIP: {requisition.user?.nip || '-'} {requisition.user?.position ? `• ${requisition.user.position}` : ''}
                            </p>
                        </div>

                        <div className="space-y-1">
                            <span className="block text-xs font-medium text-slate-500">
                                Klasifikasi Belanja & Rekening RBA
                            </span>
                            <div className="flex items-center gap-1.5 flex-wrap">
                                <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold ${
                                    requisition.jenis_belanja === 'Modal'
                                        ? 'bg-purple-100 text-purple-800'
                                        : 'bg-emerald-100 text-emerald-800'
                                }`}>
                                    Belanja {requisition.jenis_belanja || 'Operasi'} BLUD
                                </span>
                            </div>
                            {requisition.rba_account ? (
                                <p className="text-xs font-medium text-slate-700 mt-1">
                                    <span className="font-mono font-bold">[{requisition.rba_account.account_code}]</span> {requisition.rba_account.account_name}
                                </p>
                            ) : (
                                <span className="text-xs text-slate-400">-</span>
                            )}
                        </div>

                        <div className="space-y-1">
                            <span className="block text-xs font-medium text-slate-500">
                                Sub Kegiatan Rumah Sakit
                            </span>
                            <p className="text-xs font-bold text-slate-800 leading-snug">
                                {requisition.sub_kegiatan || 'Pelayanan dan Penunjang Pelayanan BLUD RS Jiwa Tampan'}
                            </p>
                            <span className="text-[11px] text-emerald-700 font-semibold">
                                Sumber: Jasa Layanan BLUD
                            </span>
                        </div>
                    </div>

                    {/* Urgensi Kebutuhan / Telaahan Staf */}
                    {requisition.urgency_reason && (
                        <div className="border-t border-slate-100 bg-amber-50/50 p-6">
                            <div className="flex items-start gap-3">
                                <span className="mt-0.5 text-amber-600 text-base">📌</span>
                                <div>
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                                        Telaahan Staf / Justifikasi Urgensi Kebutuhan
                                    </h4>
                                    <p className="mt-1 text-xs sm:text-sm text-slate-800 font-medium whitespace-pre-line leading-relaxed">
                                        {requisition.urgency_reason}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Notes from Perencanaan / Keuangan if available */}
                    {(requisition.notes_perencanaan || requisition.notes_keuangan) && (
                        <div className="border-t border-slate-100 bg-slate-50/50 p-6 space-y-3">
                            {requisition.notes_perencanaan && (
                                <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3.5 text-xs">
                                    <span className="font-bold text-amber-900">Catatan Bagian Perencanaan:</span>
                                    <p className="mt-1 text-amber-800 font-medium">{requisition.notes_perencanaan}</p>
                                </div>
                            )}
                            {requisition.notes_keuangan && (
                                <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-3.5 text-xs">
                                    <span className="font-bold text-blue-900">Catatan Bagian Keuangan:</span>
                                    <p className="mt-1 text-blue-800 font-medium">{requisition.notes_keuangan}</p>
                                    {(requisition.sp2d_number || requisition.receipt_number) && (
                                        <div className="mt-2 flex items-center gap-4 text-[11px] font-semibold text-blue-950">
                                            {requisition.sp2d_number && <span>No. SP2D: {requisition.sp2d_number}</span>}
                                            {requisition.receipt_number && <span>No. Bukti / SPJ: {requisition.receipt_number}</span>}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Requested Items Table Card */}
                <div className="overflow-hidden rounded-2xl border border-emerald-100/90 bg-white shadow-md shadow-emerald-950/5 hover:shadow-lg hover:shadow-emerald-900/10 transition-all duration-200">
                    <div className="border-b border-emerald-100 bg-gradient-to-r from-emerald-50/90 via-teal-50/40 to-slate-50/50 px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-2xs">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 17.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                                </svg>
                            </span>
                            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-950">
                                Rincian Barang yang Diusulkan
                            </h3>
                        </div>
                        <span className="inline-flex items-center rounded-lg bg-emerald-100/70 px-2.5 py-0.5 text-xs font-bold text-emerald-800 border border-emerald-200">
                            {details.length} Macam Barang
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-emerald-100">
                            <thead className="bg-gradient-to-r from-emerald-50/90 via-teal-50/40 to-emerald-50/90 font-bold border-b border-emerald-100">
                                <tr>
                                    <th className="w-14 px-4 py-3.5 text-center text-xs font-bold uppercase tracking-wider text-emerald-950">
                                        No
                                    </th>
                                    <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-emerald-950">
                                        Barang & Spesifikasi
                                    </th>
                                    <th className="w-32 px-4 py-3.5 text-center text-xs font-bold uppercase tracking-wider text-emerald-950">
                                        Volume Usulan
                                    </th>
                                    <th className="w-32 px-4 py-3.5 text-center text-xs font-bold uppercase tracking-wider text-emerald-950">
                                        Volume Disetujui
                                    </th>
                                    <th className="w-40 px-5 py-3.5 text-right text-xs font-bold uppercase tracking-wider text-emerald-950">
                                        Harga Satuan
                                    </th>
                                    <th className="w-44 px-5 py-3.5 text-right text-xs font-bold uppercase tracking-wider text-emerald-950">
                                        Subtotal
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {details.map((detail, idx) => (
                                    <tr
                                        key={detail.id || idx}
                                        className="hover:bg-emerald-50/40 transition-colors"
                                    >
                                        <td className="whitespace-nowrap px-4 py-3.5 text-center text-xs font-semibold text-slate-500">
                                            #{idx + 1}
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-2">
                                                <span className="inline-flex rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
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
                                        <td className="whitespace-nowrap px-4 py-3.5 text-center text-sm font-semibold text-slate-700">
                                            {detail.quantity_requested}{' '}
                                            <span className="text-xs text-slate-500 font-normal">
                                                {detail.item?.unit_type || 'Unit'}
                                            </span>
                                        </td>
                                        <td className="whitespace-nowrap px-4 py-4 text-center text-sm font-bold">
                                            {detail.quantity_approved !== null && detail.quantity_approved !== undefined ? (
                                                <span className="text-emerald-700">
                                                    {detail.quantity_approved}{' '}
                                                    <span className="text-xs font-normal text-slate-500">
                                                        {detail.item?.unit_type || 'Unit'}
                                                    </span>
                                                </span>
                                            ) : (
                                                <span className="text-slate-400 text-xs italic">Menunggu Verifikasi</span>
                                            )}
                                        </td>
                                        <td className="whitespace-nowrap px-5 py-3.5 text-right text-xs font-semibold text-slate-700">
                                            {formatRupiah(detail.unit_price)}
                                        </td>
                                        <td className="whitespace-nowrap px-5 py-3.5 text-right text-sm font-bold text-emerald-700">
                                            {formatRupiah(detail.subtotal)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="border-t-2 border-emerald-200 bg-gradient-to-r from-emerald-50/90 via-teal-50/40 to-emerald-50/90">
                                <tr>
                                    <td colSpan="2" className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wider text-emerald-950">
                                        Total Akumulasi:
                                    </td>
                                    <td className="px-4 py-4 text-center text-xs font-bold text-slate-800">
                                        {totalQty} Diminta
                                    </td>
                                    <td className="px-4 py-4 text-center text-xs font-black text-emerald-900 bg-emerald-100/70 border-x border-emerald-200/60">
                                        {details.reduce((sum, d) => sum + Number(d.quantity_approved ?? d.quantity_requested ?? 0), 0)} Unit
                                    </td>
                                    <td className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wider text-emerald-950">
                                        Total Estimasi:
                                    </td>
                                    <td className="whitespace-nowrap px-5 py-4 text-right text-base font-black text-emerald-700">
                                        {formatRupiah(requisition.total_approved && requisition.total_approved > 0 ? requisition.total_approved : totalCost)}
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
                        className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 shadow-2xs transition hover:bg-slate-50"
                    >
                        &larr; Kembali ke Daftar Pengajuan
                    </Link>
                </div>
            </div>
        </DivisiLayout>
    );
}
