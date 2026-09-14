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
                label: 'Menunggu Telaah Perencanaan',
                desc: 'Pengajuan usulan belanja Anda sedang ditelaah oleh Tim Perencanaan untuk kesesuaian pagu dan kewajaran volume RBA BLUD.',
                bg: 'bg-amber-50 text-amber-800 border-amber-200',
                dot: 'bg-amber-500',
            };
        case 'Diproses_Keuangan':
            return {
                label: 'Sedang Diproses Keuangan',
                desc: 'Usulan telah diverifikasi oleh Tim Perencanaan dan diteruskan ke Bagian Keuangan terkait ketersediaan kas BLUD.',
                bg: 'bg-blue-50 text-blue-800 border-blue-200',
                dot: 'bg-blue-500',
            };
        case 'Disetujui_Selesai':
            return {
                label: 'Disetujui / Selesai',
                desc: 'Usulan belanja telah disetujui penuh oleh Bagian Keuangan dan siap direalisasikan belanja/pengadaannya.',
                bg: 'bg-teal-50 text-teal-800 border-teal-200',
                dot: 'bg-teal-500',
            };
        case 'Ditolak':
            return {
                label: 'Perlu Perbaikan / Ditolak',
                desc: 'Pengajuan usulan ini memerlukan perbaikan atau tidak disetujui. Periksa catatan evaluasi dari verifikator.',
                bg: 'bg-rose-50 text-rose-800 border-rose-200',
                dot: 'bg-rose-500',
            };
        default:
            return {
                label: status || 'Pending',
                desc: 'Pengajuan sedang dalam proses penelaahan.',
                bg: 'bg-slate-50 text-slate-700 border-slate-200',
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
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-teal-800 transition mb-2"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                            </svg>
                            Kembali ke Daftar Pengajuan
                        </Link>
                        <div className="flex flex-wrap items-center gap-3">
                            <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                                {requisition.requisition_number}
                            </h2>
                            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-xs font-bold border ${statusInfo.bg}`}>
                                <span className={`h-2 w-2 rounded-full ${statusInfo.dot}`} />
                                {statusInfo.label}
                            </span>
                            <span className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-700">
                                TA {requisition.fiscal_year || '2026'}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <a
                            href={route('requisitions.print', requisition.id)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700 shadow-2xs transition cursor-pointer"
                        >
                            <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24-1.077-.32-2.14-.32-3.193 0-5.18 4.02-9.386 8.974-9.386 4.954 0 8.973 4.207 8.973 9.386 0 1.053-.08 2.116-.32 3.193M12 18v-4.5m0 0l-2.25 2.25M12 13.5l2.25 2.25M3.75 19.5h16.5" />
                            </svg>
                            Cetak Nota Dinas
                        </a>
                        <Link
                            href={route('requisitions.create', { jenis: requisition.jenis_belanja || 'Operasi' })}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 px-4 py-2 text-xs font-bold text-white shadow-2xs transition cursor-pointer"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            Buat Usulan Baru
                        </Link>
                    </div>
                </div>

                {/* Status Notice Card */}
                <div className={`rounded-xl border p-4 shadow-2xs ${statusInfo.bg}`}>
                    <div className="flex items-start gap-3">
                        <span className={`mt-0.5 h-2.5 w-2.5 rounded-full shrink-0 ${statusInfo.dot}`} />
                        <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider">{statusInfo.label}</h4>
                            <p className="mt-0.5 text-xs font-medium opacity-90 leading-relaxed">
                                {statusInfo.desc}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Requisition Header Info Card */}
                <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs space-y-4">
                    <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                            Identitas Dokumen Usulan Belanja
                        </h3>
                        <span className="inline-flex items-center rounded-md bg-teal-50 px-2 py-0.5 text-[11px] font-bold text-teal-800 border border-teal-200">
                            Dana BLUD RSJ Tampan
                        </span>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 text-xs">
                        <div className="space-y-1">
                            <span className="text-slate-500 font-medium">Nomor Dokumen</span>
                            <p className="font-bold text-slate-900 font-mono text-sm">
                                {requisition.requisition_number}
                            </p>
                            {requisition.nomor_surat_unit && (
                                <p className="text-[11px] text-slate-500">
                                    No. Nota: <span className="font-semibold text-slate-700">{requisition.nomor_surat_unit}</span>
                                </p>
                            )}
                        </div>

                        <div className="space-y-1">
                            <span className="text-slate-500 font-medium">Tanggal Pengajuan</span>
                            <p className="font-bold text-slate-900">
                                {formatTanggal(requisition.submission_date || requisition.created_at)}
                            </p>
                            <p className="text-[11px] text-slate-500">
                                Tahun Anggaran: <span className="font-semibold text-teal-800">TA {requisition.fiscal_year || '2026'}</span>
                            </p>
                        </div>

                        <div className="space-y-1">
                            <span className="text-slate-500 font-medium">Unit Kerja & Pemohon</span>
                            <p className="font-bold text-slate-900">
                                {requisition.unit?.name || requisition.division?.name || '-'}
                            </p>
                            <p className="text-[11px] text-slate-500">
                                PIC: {requisition.user?.name || '-'}
                            </p>
                        </div>

                        <div className="space-y-1 sm:col-span-2">
                            <span className="text-slate-500 font-medium">Pos Rekening Belanja RBA</span>
                            {requisition.rba_account ? (
                                <p className="font-semibold text-slate-900">
                                    <span className="font-mono font-bold text-teal-800">[{requisition.rba_account.account_code}]</span>{' '}
                                    {requisition.rba_account.account_name}
                                </p>
                            ) : (
                                <span className="text-slate-400">-</span>
                            )}
                        </div>

                        <div className="space-y-1 sm:col-span-1">
                            <span className="text-slate-500 font-medium">Sub Kegiatan Rumah Sakit</span>
                            <p className="font-semibold text-slate-800 leading-snug">
                                {requisition.sub_kegiatan || 'Pelayanan dan Penunjang Pelayanan BLUD RS Jiwa Tampan'}
                            </p>
                        </div>
                    </div>

                    {/* Urgensi Kebutuhan / Telaahan Staf */}
                    {requisition.urgency_reason && (
                        <div className="mt-4 pt-3 border-t border-slate-100 text-xs">
                            <span className="font-bold text-slate-700">Latar Belakang / Urgensi:</span>
                            <p className="mt-1 text-slate-600 whitespace-pre-line leading-relaxed">
                                {requisition.urgency_reason}
                            </p>
                        </div>
                    )}

                    {/* Notes from Perencanaan / Keuangan if available */}
                    {(requisition.notes_perencanaan || requisition.notes_keuangan) && (
                        <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs">
                            {requisition.notes_perencanaan && (
                                <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-3">
                                    <span className="font-bold text-amber-900">Catatan Perencanaan:</span>
                                    <p className="mt-0.5 text-amber-800">{requisition.notes_perencanaan}</p>
                                </div>
                            )}
                            {requisition.notes_keuangan && (
                                <div className="rounded-lg border border-blue-200 bg-blue-50/60 p-3">
                                    <span className="font-bold text-blue-900">Catatan Keuangan:</span>
                                    <p className="mt-0.5 text-blue-800">{requisition.notes_keuangan}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Requested Items Table Card */}
                <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
                    <div className="border-b border-slate-100 bg-slate-50/60 px-6 py-4 flex items-center justify-between">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                            Rincian Barang yang Diusulkan
                        </h3>
                        <span className="text-xs font-semibold text-slate-600">
                            {details.length} macam barang &bull; {totalQty} unit
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-100">
                            <thead className="bg-slate-50/80 text-slate-600 uppercase tracking-wider text-[11px] font-bold">
                                <tr>
                                    <th className="w-12 px-4 py-3 text-center">No</th>
                                    <th className="px-5 py-3 text-left">Nama Barang / Jasa</th>
                                    <th className="w-28 px-4 py-3 text-center">Volume Usulan</th>
                                    <th className="w-28 px-4 py-3 text-center">Volume Disetujui</th>
                                    <th className="w-36 px-4 py-3 text-right">Harga Satuan</th>
                                    <th className="w-40 px-4 py-3 text-right">Subtotal</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white text-xs">
                                {details.map((detail, idx) => (
                                    <tr key={detail.id || idx} className="hover:bg-slate-50/50 transition">
                                        <td className="whitespace-nowrap px-4 py-3 text-center text-slate-400 font-semibold">
                                            #{idx + 1}
                                        </td>
                                        <td className="px-5 py-3">
                                            <p className="font-semibold text-slate-900">
                                                {detail.item?.name || detail.manual_item_name}
                                            </p>
                                            {(detail.item?.specification || detail.manual_specification) && (
                                                <p className="text-[11px] text-slate-400 mt-0.5">
                                                    {detail.item?.specification || detail.manual_specification}
                                                </p>
                                            )}
                                        </td>
                                        <td className="whitespace-nowrap px-4 py-3 text-center text-slate-700 font-semibold">
                                            {detail.quantity_requested}{' '}
                                            <span className="text-slate-400 font-normal text-[11px]">
                                                {detail.item?.unit_type || 'Unit'}
                                            </span>
                                        </td>
                                        <td className="whitespace-nowrap px-4 py-3 text-center font-bold">
                                            {detail.quantity_approved !== null && detail.quantity_approved !== undefined ? (
                                                <span className="text-teal-700">
                                                    {detail.quantity_approved}{' '}
                                                    <span className="text-slate-400 font-normal text-[11px]">
                                                        {detail.item?.unit_type || 'Unit'}
                                                    </span>
                                                </span>
                                            ) : (
                                                <span className="text-slate-400 italic text-[11px]">-</span>
                                            )}
                                        </td>
                                        <td className="whitespace-nowrap px-4 py-3 text-right text-slate-700">
                                            {formatRupiah(detail.unit_price)}
                                        </td>
                                        <td className="whitespace-nowrap px-4 py-3 text-right font-bold text-teal-800">
                                            {formatRupiah(detail.subtotal)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="border-t border-slate-200 bg-slate-50/70 font-bold text-xs">
                                <tr>
                                    <td colSpan="2" className="px-5 py-3.5 text-right uppercase tracking-wider text-slate-600">
                                        Total Estimasi Belanja:
                                    </td>
                                    <td className="px-4 py-3.5 text-center text-slate-800">
                                        {totalQty} unit
                                    </td>
                                    <td className="px-4 py-3.5 text-center text-teal-800">
                                        {details.reduce((sum, d) => sum + Number(d.quantity_approved ?? d.quantity_requested ?? 0), 0)} unit
                                    </td>
                                    <td></td>
                                    <td className="whitespace-nowrap px-4 py-3.5 text-right text-sm font-bold text-teal-700">
                                        {formatRupiah(requisition.total_approved && requisition.total_approved > 0 ? requisition.total_approved : totalCost)}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                {/* Jejak Audit Timeline */}
                <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-4">
                        Riwayat & Jejak Audit Pengajuan
                    </h3>
                    <AuditTrailTimeline requisition={requisition} />
                </div>

                {/* Bottom Back Button */}
                <div className="flex items-center justify-between pb-6">
                    <Link
                        href={route('requisitions.index')}
                        className="rounded-xl border border-slate-300 bg-white px-5 py-2 text-xs font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50"
                    >
                        &larr; Kembali ke Daftar Pengajuan
                    </Link>
                </div>
            </div>
        </DivisiLayout>
    );
}
