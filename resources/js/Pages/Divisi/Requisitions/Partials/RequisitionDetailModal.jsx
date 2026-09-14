import AuditTrailTimeline from '@/Components/AuditTrailTimeline';
import Modal from '@/Components/Modal';

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
                badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
                dotClass: 'bg-amber-500',
            };
        case 'Diproses_Keuangan':
            return {
                label: 'Sedang Diproses Keuangan',
                desc: 'Usulan telah diverifikasi Tim Perencanaan dan saat ini sedang diteliti oleh Bagian Keuangan terkait ketersediaan kas BLUD.',
                badgeClass: 'bg-blue-50 text-blue-800 border-blue-200',
                dotClass: 'bg-blue-500',
            };
        case 'Disetujui_Selesai':
            return {
                label: 'Disetujui / Selesai',
                desc: 'Usulan belanja telah disetujui penuh oleh Bagian Keuangan dan siap direalisasikan belanja/pengadaannya.',
                badgeClass: 'bg-teal-50 text-teal-800 border-teal-200',
                dotClass: 'bg-teal-500',
            };
        case 'Ditolak':
            return {
                label: 'Perlu Perbaikan / Ditolak',
                desc: 'Pengajuan usulan ini memerlukan perbaikan atau tidak disetujui. Periksa catatan evaluasi dari verifikator.',
                badgeClass: 'bg-rose-50 text-rose-800 border-rose-200',
                dotClass: 'bg-rose-500',
            };
        default:
            return {
                label: status || 'Pending',
                desc: 'Pengajuan sedang dalam proses penelaahan.',
                badgeClass: 'bg-slate-50 text-slate-700 border-slate-200',
                dotClass: 'bg-slate-400',
            };
    }
};

export default function RequisitionDetailModal({
    show = false,
    onClose = () => {},
    requisition = null,
    onEdit = null,
}) {
    if (!requisition) return null;

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
        <Modal show={show} onClose={onClose} maxWidth="4xl">
            <div className="flex flex-col max-h-[90vh] bg-white rounded-2xl overflow-hidden shadow-xl">
                {/* 1. Modal Header Minimalis */}
                <div className="shrink-0 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700 font-bold border border-teal-100">
                            📋
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-base font-bold text-slate-900">
                                    Rincian Usulan Belanja
                                </h2>
                                <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                                    {requisition.requisition_number}
                                </span>
                                <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-700">
                                    TA {requisition.fiscal_year || '2026'}
                                </span>
                            </div>
                            <p className="text-xs text-slate-500">
                                {requisition.unit?.name || 'Unit Pemohon'} &bull; {requisition.division?.name || 'Bidang'} &bull; Dana 100% BLUD
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer"
                        title="Tutup dialog"
                    >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* 2. Modal Body (Scrollable) */}
                <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-slate-50/40">
                    {/* Status Banner */}
                    <div className={`rounded-xl border p-4 shadow-2xs ${statusInfo.badgeClass}`}>
                        <div className="flex items-start gap-3">
                            <span className={`mt-0.5 h-2.5 w-2.5 rounded-full shrink-0 ${statusInfo.dotClass}`} />
                            <div>
                                <h4 className="text-xs font-bold uppercase tracking-wider">{statusInfo.label}</h4>
                                <p className="mt-0.5 text-xs opacity-90 leading-relaxed font-medium">
                                    {statusInfo.desc}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 1: Identitas Usulan & Sub Kegiatan */}
                    <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-2xs">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                            <div className="flex items-center gap-2">
                                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-800 text-xs font-bold">
                                    1
                                </span>
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                                    Informasi Usulan Belanja
                                </h3>
                            </div>
                            <span className="text-[11px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                                Belanja {requisition.jenis_belanja || 'Operasi'} BLUD
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

                        {/* Urgensi / Catatan Pengusul */}
                        {requisition.urgency_reason && (
                            <div className="mt-4 pt-3 border-t border-slate-100 text-xs">
                                <span className="font-bold text-slate-700">Latar Belakang / Urgensi:</span>
                                <p className="mt-1 text-slate-600 whitespace-pre-line leading-relaxed">
                                    {requisition.urgency_reason}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* SECTION 2: Catatan Evaluasi Verifikator (Jika Ada) */}
                    {(requisition.notes_perencanaan || requisition.notes_keuangan) && (
                        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-2xs space-y-3">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                                Catatan Evaluasi Verifikator
                            </h4>
                            {requisition.notes_perencanaan && (
                                <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-3 text-xs">
                                    <span className="font-bold text-amber-900">Catatan Perencanaan:</span>
                                    <p className="mt-0.5 text-amber-800">{requisition.notes_perencanaan}</p>
                                </div>
                            )}
                            {requisition.notes_keuangan && (
                                <div className="rounded-lg border border-blue-200 bg-blue-50/60 p-3 text-xs">
                                    <span className="font-bold text-blue-900">Catatan Keuangan:</span>
                                    <p className="mt-0.5 text-blue-800">{requisition.notes_keuangan}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* SECTION 3: Daftar Barang yang Diusulkan */}
                    <div className="rounded-xl border border-slate-200/80 bg-white shadow-2xs overflow-hidden">
                        <div className="border-b border-slate-100 bg-slate-50/60 px-5 py-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-100 text-teal-800 text-xs font-bold">
                                    2
                                </span>
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                                    Rincian Barang yang Diusulkan
                                </h3>
                            </div>
                            <span className="text-xs font-semibold text-slate-600">
                                {details.length} macam barang &bull; {totalQty} unit
                            </span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-100">
                                <thead className="bg-slate-50/80 text-slate-600 uppercase tracking-wider text-[11px] font-bold">
                                    <tr>
                                        <th className="w-10 px-4 py-2.5 text-center">No</th>
                                        <th className="px-4 py-2.5 text-left">Nama Barang / Jasa</th>
                                        <th className="w-24 px-4 py-2.5 text-center">Volume</th>
                                        <th className="w-28 px-4 py-2.5 text-center">Disetujui</th>
                                        <th className="w-32 px-4 py-2.5 text-right">Harga Satuan</th>
                                        <th className="w-36 px-4 py-2.5 text-right">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white text-xs">
                                    {details.map((detail, idx) => (
                                        <tr key={detail.id || idx} className="hover:bg-slate-50/50 transition">
                                            <td className="whitespace-nowrap px-4 py-3 text-center text-slate-400 font-semibold">
                                                {idx + 1}
                                            </td>
                                            <td className="px-4 py-3">
                                                <p className="font-semibold text-slate-900">
                                                    {detail.item?.name || detail.item_name || detail.manual_item_name}
                                                </p>
                                                {(detail.item?.specification || detail.specification) && (
                                                    <p className="text-[11px] text-slate-400 mt-0.5">
                                                        {detail.item?.specification || detail.specification}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3 text-center text-slate-700 font-semibold">
                                                {detail.quantity_requested}{' '}
                                                <span className="text-slate-400 font-normal text-[11px]">
                                                    {detail.item?.unit_type || detail.unit_type || 'Unit'}
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3 text-center font-bold">
                                                {detail.quantity_approved !== null && detail.quantity_approved !== undefined ? (
                                                    <span className="text-teal-700">
                                                        {detail.quantity_approved}{' '}
                                                        <span className="text-slate-400 font-normal text-[11px]">
                                                            {detail.item?.unit_type || detail.unit_type || 'Unit'}
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
                                        <td colSpan="2" className="px-4 py-3 text-right uppercase tracking-wider text-slate-600">
                                            Total Estimasi Belanja:
                                        </td>
                                        <td className="px-4 py-3 text-center text-slate-800">
                                            {totalQty} unit
                                        </td>
                                        <td className="px-4 py-3 text-center text-teal-800">
                                            {details.reduce((sum, d) => sum + Number(d.quantity_approved ?? d.quantity_requested ?? 0), 0)} unit
                                        </td>
                                        <td></td>
                                        <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-bold text-teal-700">
                                            {formatRupiah(requisition.total_approved && requisition.total_approved > 0 ? requisition.total_approved : totalCost)}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>

                    {/* SECTION 4: Jejak Audit & Riwayat */}
                    <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-2xs">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-3">
                            Riwayat & Jejak Audit Pengajuan
                        </h4>
                        <AuditTrailTimeline requisition={requisition} />
                    </div>
                </div>

                {/* 3. Modal Footer */}
                <div className="shrink-0 border-t border-slate-100 bg-white px-6 py-4 flex items-center justify-between gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                    >
                        Tutup
                    </button>

                    <div className="flex items-center gap-2">
                        {requisition.status === 'Pending_Perencanaan' && onEdit && (
                            <button
                                type="button"
                                onClick={() => {
                                    onClose();
                                    onEdit(requisition);
                                }}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 px-4 py-2 text-xs font-bold text-amber-900 transition cursor-pointer"
                            >
                                <span>✎ Ubah Usulan</span>
                            </button>
                        )}

                        <a
                            href={route('requisitions.print', requisition.id)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 px-4 py-2 text-xs font-bold text-white shadow-2xs transition cursor-pointer"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24-1.077-.32-2.14-.32-3.193 0-5.18 4.02-9.386 8.974-9.386 4.954 0 8.973 4.207 8.973 9.386 0 1.053-.08 2.116-.32 3.193M12 18v-4.5m0 0l-2.25 2.25M12 13.5l2.25 2.25M3.75 19.5h16.5" />
                            </svg>
                            Cetak Dokumen
                        </a>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
