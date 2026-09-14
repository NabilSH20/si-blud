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
                label: 'Verifikasi Perencanaan',
                desc: 'Pengajuan usulan belanja Anda sedang ditelaah oleh Tim Perencanaan untuk kesesuaian pagu dan kewajaran volume RBA BLUD.',
                bg: 'bg-amber-100 text-amber-900 border-amber-300',
                dot: 'bg-amber-500',
            };
        case 'Diproses_Keuangan':
            return {
                label: 'Diproses Keuangan',
                desc: 'Usulan telah diverifikasi Tim Perencanaan dan saat ini sedang diteliti oleh Bagian Keuangan terkait kas BLUD.',
                bg: 'bg-blue-100 text-blue-900 border-blue-300',
                dot: 'bg-blue-500',
            };
        case 'Disetujui_Selesai':
            return {
                label: 'Disetujui / Selesai',
                desc: 'Usulan belanja telah disetujui penuh oleh Bagian Keuangan dan siap direalisasikan belanja/pengadaannya.',
                bg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
                dot: 'bg-emerald-500',
            };
        case 'Ditolak':
            return {
                label: 'Ditolak',
                desc: 'Pengajuan usulan ini tidak disetujui. Periksa catatan evaluasi dari verifikator terkait.',
                bg: 'bg-rose-100 text-rose-900 border-rose-300',
                dot: 'bg-rose-500',
            };
        default:
            return {
                label: status || 'Pending',
                desc: 'Pengajuan sedang dalam proses telaah.',
                bg: 'bg-slate-100 text-slate-800 border-slate-300',
                dot: 'bg-slate-400',
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
        <Modal show={show} onClose={onClose} maxWidth="5xl">
            <div className="flex flex-col max-h-[92vh]">
                {/* Header Modal */}
                <div className="shrink-0 border-b border-emerald-100 bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 px-6 py-4 text-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-xl font-bold backdrop-blur-xs border border-white/20">
                                📋
                            </div>
                            <div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <h2 className="text-base sm:text-lg font-black tracking-tight">
                                        Rincian Usulan Belanja ({requisition.requisition_number})
                                    </h2>
                                    <span className="inline-flex items-center rounded-full bg-emerald-900/60 px-2.5 py-0.5 text-[11px] font-black border border-emerald-400/40 text-emerald-100">
                                        TA {requisition.fiscal_year || '2027'}
                                    </span>
                                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold border ${statusInfo.bg}`}>
                                        <span className={`h-1.5 w-1.5 rounded-full ${statusInfo.dot}`} />
                                        {statusInfo.label}
                                    </span>
                                </div>
                                <p className="text-xs text-emerald-100/90 font-medium mt-0.5">
                                    {requisition.unit?.name || 'Unit Kerja'} ({requisition.division?.name || 'Bidang'}) &bull; Sumber Dana 100% BLUD
                                </p>
                            </div>
                        </div>

                        {/* Close button */}
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl bg-white/10 p-2 text-white/80 hover:bg-white/20 hover:text-white transition cursor-pointer"
                            aria-label="Tutup Dialog"
                        >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Body Modal (Scrollable) */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
                    {/* Status Notice Card */}
                    <div className={`rounded-xl border p-4 shadow-2xs ${statusInfo.bg}`}>
                        <div className="flex items-start gap-3">
                            <div className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${statusInfo.dot} text-white text-xs font-black`}>
                                ✓
                            </div>
                            <div>
                                <h4 className="text-xs font-bold uppercase tracking-wider">Status: {statusInfo.label}</h4>
                                <p className="mt-0.5 text-xs font-medium opacity-95 leading-relaxed">
                                    {statusInfo.desc}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 1: Identitas Dokumen Pengajuan */}
                    <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
                        <div className="border-b border-slate-100 bg-slate-50/80 px-5 py-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-emerald-600 text-white font-black text-xs">
                                    1
                                </span>
                                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                                    Identitas Dokumen Pengajuan & Sub Kegiatan RS
                                </h3>
                            </div>
                            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-md border border-emerald-200">
                                Belanja {requisition.jenis_belanja || 'Operasi'} BLUD
                            </span>
                        </div>

                        <div className="p-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <div className="space-y-1">
                                <span className="block text-xs font-semibold text-slate-500">
                                    Nomor Dokumen Pengajuan
                                </span>
                                <p className="text-sm font-bold text-slate-900 font-mono">
                                    {requisition.requisition_number}
                                </p>
                                {requisition.nomor_surat_unit && (
                                    <p className="text-xs text-slate-600">
                                        No. Nota Unit: <span className="font-semibold">{requisition.nomor_surat_unit}</span>
                                    </p>
                                )}
                            </div>

                            <div className="space-y-1">
                                <span className="block text-xs font-semibold text-slate-500">
                                    Tanggal & Tahun Anggaran
                                </span>
                                <p className="text-sm font-bold text-slate-900">
                                    {formatTanggal(requisition.submission_date)}
                                </p>
                                <p className="text-xs text-amber-700 font-bold">
                                    Target: TA {requisition.fiscal_year || '2027'}
                                </p>
                            </div>

                            <div className="space-y-1">
                                <span className="block text-xs font-semibold text-slate-500">
                                    Unit & Bidang Pengusul
                                </span>
                                <p className="text-sm font-bold text-slate-900">
                                    {requisition.unit?.name || requisition.division?.name || '-'}
                                </p>
                                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-800 border border-emerald-200">
                                    {requisition.division?.name}
                                </span>
                            </div>

                            <div className="space-y-1">
                                <span className="block text-xs font-semibold text-slate-500">
                                    Petugas Pengaju (PIC)
                                </span>
                                <p className="text-sm font-bold text-slate-900">
                                    {requisition.user?.name || '-'}
                                </p>
                                <p className="text-xs text-slate-500">
                                    {requisition.user?.nip ? `NIP: ${requisition.user.nip}` : ''} {requisition.user?.position ? `• ${requisition.user.position}` : ''}
                                </p>
                            </div>

                            <div className="space-y-1">
                                <span className="block text-xs font-semibold text-slate-500">
                                    Kode Rekening RBA
                                </span>
                                {requisition.rba_account ? (
                                    <p className="text-xs font-medium text-slate-800">
                                        <span className="font-mono font-bold block text-slate-900">[{requisition.rba_account.account_code}]</span>
                                        {requisition.rba_account.account_name}
                                    </p>
                                ) : (
                                    <span className="text-xs text-slate-400">-</span>
                                )}
                            </div>

                            <div className="space-y-1">
                                <span className="block text-xs font-semibold text-slate-500">
                                    Sub Kegiatan Rumah Sakit
                                </span>
                                <p className="text-xs font-bold text-slate-800 leading-snug">
                                    {requisition.sub_kegiatan || 'Pelayanan dan Penunjang Pelayanan BLUD RS Jiwa Tampan'}
                                </p>
                            </div>
                        </div>

                        {/* Telaahan Staf / Latar Belakang */}
                        {requisition.urgency_reason && (
                            <div className="border-t border-slate-100 bg-amber-50/40 p-5">
                                <div className="flex items-start gap-2.5">
                                    <span className="text-amber-600 text-sm mt-0.5">📌</span>
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
                    </div>

                    {/* SECTION 2: Catatan Evaluasi Verifikator (Jika ada) */}
                    {(requisition.notes_perencanaan || requisition.notes_keuangan) && (
                        <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3 shadow-xs">
                            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                                Catatan Evaluasi Verifikator
                            </h4>
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

                    {/* SECTION 3: Rincian Barang yang Diusulkan */}
                    <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
                        <div className="border-b border-slate-100 bg-slate-50/80 px-5 py-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-emerald-600 text-white font-black text-xs">
                                    2
                                </span>
                                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                                    Rincian Barang yang Diusulkan
                                </h3>
                            </div>
                            <span className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-700">
                                {details.length} Macam Barang
                            </span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-100">
                                <thead className="bg-slate-50 text-slate-700 uppercase tracking-wider text-xs font-bold">
                                    <tr>
                                        <th className="w-12 px-4 py-3 text-center">No</th>
                                        <th className="px-4 py-3 text-left">Barang & Spesifikasi</th>
                                        <th className="w-28 px-4 py-3 text-center">Volume Usulan</th>
                                        <th className="w-32 px-4 py-3 text-center">Volume Disetujui</th>
                                        <th className="w-36 px-4 py-3 text-right">Harga Satuan</th>
                                        <th className="w-40 px-4 py-3 text-right">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white text-xs">
                                    {details.map((detail, idx) => (
                                        <tr key={detail.id || idx} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="whitespace-nowrap px-4 py-3 text-center text-slate-500 font-semibold">
                                                #{idx + 1}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="inline-flex rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-700">
                                                        {detail.item?.item_code || 'BRG'}
                                                    </span>
                                                    <span className="font-bold text-slate-900">
                                                        {detail.item?.name || detail.item_name || detail.manual_item_name}
                                                    </span>
                                                </div>
                                                {(detail.item?.specification || detail.specification || detail.manual_specification) && (
                                                    <p className="mt-0.5 text-[11px] text-slate-500">
                                                        Spesifikasi: {detail.item?.specification || detail.specification || detail.manual_specification}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3 text-center font-semibold text-slate-800">
                                                {detail.quantity_requested}{' '}
                                                <span className="text-slate-500 font-normal">
                                                    {detail.item?.unit_type || detail.unit_type || 'Unit'}
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3 text-center font-bold">
                                                {detail.quantity_approved !== null && detail.quantity_approved !== undefined ? (
                                                    <span className="text-emerald-700">
                                                        {detail.quantity_approved}{' '}
                                                        <span className="text-xs font-normal text-slate-500">
                                                            {detail.item?.unit_type || detail.unit_type || 'Unit'}
                                                        </span>
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400 italic text-[11px]">Menunggu Verifikasi</span>
                                                )}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3 text-right font-medium text-slate-700">
                                                {formatRupiah(detail.unit_price)}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3 text-right font-bold text-emerald-800">
                                                {formatRupiah(detail.subtotal)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="border-t-2 border-slate-200 bg-slate-50/80 font-bold text-xs">
                                    <tr>
                                        <td colSpan="2" className="px-4 py-3 text-right uppercase tracking-wider text-slate-700">
                                            Total Akumulasi:
                                        </td>
                                        <td className="px-4 py-3 text-center text-slate-800">
                                            {totalQty} Diminta
                                        </td>
                                        <td className="px-4 py-3 text-center text-emerald-800">
                                            {details.reduce((sum, d) => sum + Number(d.quantity_approved ?? d.quantity_requested ?? 0), 0)} Unit
                                        </td>
                                        <td className="px-4 py-3 text-right uppercase tracking-wider text-slate-700">
                                            Total Estimasi:
                                        </td>
                                        <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-black text-emerald-700">
                                            {formatRupiah(requisition.total_approved && requisition.total_approved > 0 ? requisition.total_approved : totalCost)}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>

                    {/* SECTION 4: Jejak Audit & Riwayat Persetujuan */}
                    <AuditTrailTimeline requisition={requisition} />
                </div>

                {/* Footer Modal */}
                <div className="shrink-0 border-t border-slate-200 bg-white px-6 py-4 flex flex-wrap items-center justify-between gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                    >
                        Tutup
                    </button>

                    <div className="flex items-center gap-2.5">
                        {requisition.status === 'Pending_Perencanaan' && onEdit && (
                            <button
                                type="button"
                                onClick={() => {
                                    onClose();
                                    onEdit(requisition);
                                }}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 px-4 py-2 text-xs font-bold text-amber-900 shadow-2xs transition cursor-pointer active:scale-95"
                            >
                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                                </svg>
                                Ubah Usulan (Edit)
                            </button>
                        )}

                        <a
                            href={route('requisitions.print', requisition.id)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-2 text-xs font-bold text-white shadow-xs transition cursor-pointer active:scale-95"
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
