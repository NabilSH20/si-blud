import Modal from '@/Components/Modal';
import { router } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';

const formatRupiah = (value) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(Number(value || 0));

export default function QuickVerificationModal({
    show = false,
    onClose = () => {},
    requisition = null,
}) {
    const [itemsState, setItemsState] = useState([]);
    const [notesPerencanaan, setNotesPerencanaan] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showRejectConfirmation, setShowRejectConfirmation] = useState(false);

    const details = requisition?.requisition_details || requisition?.requisitionDetails || [];

    useEffect(() => {
        if (!show || !requisition) {
            setItemsState([]);
            setNotesPerencanaan('');
            setShowRejectConfirmation(false);
            return;
        }

        const initialItems = details.map((d) => ({
            id: d.id,
            quantity_approved:
                d.quantity_approved !== null && d.quantity_approved !== undefined
                    ? Number(d.quantity_approved)
                    : Number(d.quantity_requested || 0),
        }));

        setItemsState(initialItems);
        setNotesPerencanaan(requisition.notes_perencanaan || '');
        setShowRejectConfirmation(false);
    }, [show, requisition]);

    const updateQuantityApproved = (idx, val) => {
        const parsed = val === '' ? 0 : Math.max(0, parseInt(val, 10) || 0);
        setItemsState((prev) => {
            const next = [...prev];
            next[idx] = { ...next[idx], quantity_approved: parsed };
            return next;
        });
    };

    // 1-Click: Setujui Semua Sesuai Usulan (100%)
    const handleApproveAll = () => {
        setItemsState(
            details.map((d) => ({
                id: d.id,
                quantity_approved: Number(d.quantity_requested || 0),
            }))
        );
    };

    // 1-Click: Reset ke 0
    const handleResetAll = () => {
        setItemsState(
            details.map((d) => ({
                id: d.id,
                quantity_approved: 0,
            }))
        );
    };

    // Calculate live totals
    const { totalRequestedQty, totalApprovedQty, totalEstimatedApproved } = useMemo(() => {
        let reqQty = 0;
        let appQty = 0;
        let totalVal = 0;

        details.forEach((d, idx) => {
            const requested = Number(d.quantity_requested || 0);
            const approved = Number(itemsState[idx]?.quantity_approved || 0);
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
    }, [details, itemsState]);

    // Handle Approve Submission (Frictionless / Direct with Toast)
    const handleSubmitApprove = (e) => {
        e.preventDefault();
        if (!requisition) return;

        setIsSubmitting(true);
        router.put(
            route('perencanaan.requisitions.update', requisition.id),
            {
                status: 'Diproses_Keuangan',
                notes_perencanaan: notesPerencanaan,
                items: itemsState,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setIsSubmitting(false);
                    Swal.fire({
                        toast: true,
                        position: 'top-end',
                        icon: 'success',
                        title: 'Usulan berhasil disetujui & diteruskan ke Keuangan',
                        showConfirmButton: false,
                        timer: 2500,
                        timerProgressBar: true,
                    });
                    onClose();
                },
                onError: () => {
                    setIsSubmitting(false);
                },
            }
        );
    };

    // Handle Reject Submission
    const handleConfirmReject = () => {
        if (!requisition) return;

        setIsSubmitting(true);
        router.put(
            route('perencanaan.requisitions.update', requisition.id),
            {
                status: 'Ditolak',
                notes_perencanaan: notesPerencanaan || 'Pengajuan tidak disetujui pada verifikasi Perencanaan.',
                items: itemsState,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setIsSubmitting(false);
                    Swal.fire({
                        toast: true,
                        position: 'top-end',
                        icon: 'info',
                        title: 'Usulan belanja ditolak',
                        showConfirmButton: false,
                        timer: 2500,
                        timerProgressBar: true,
                    });
                    onClose();
                },
                onError: () => {
                    setIsSubmitting(false);
                },
            }
        );
    };

    if (!requisition) return null;

    const unitName = requisition.unit?.name || requisition.division?.name || 'Unit Pengusul';
    const fiscalYear = requisition.budget_year || requisition.fiscal_year || '2026';

    return (
        <Modal show={show} onClose={onClose} maxWidth="4xl">
            <div className="flex flex-col bg-white rounded-2xl overflow-hidden shadow-xl max-h-[92vh]">
                {/* 1. Header Minimalis Putih (Persis Standar Admin, Divisi & Profil) */}
                <div className="shrink-0 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4">
                    <div>
                        <div className="flex items-center gap-2.5 flex-wrap">
                            <h2 className="text-base sm:text-lg font-bold text-slate-900">
                                Verifikasi Usulan Belanja
                            </h2>
                            <span className="inline-block font-mono text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                                {requisition.requisition_number}
                            </span>
                            <span className="inline-block text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                TA {fiscalYear}
                            </span>
                        </div>
                        <p className="mt-0.5 text-xs text-slate-500">
                            {unitName} &bull; Sub Kegiatan: {requisition.sub_kegiatan || 'Pelayanan BLUD'}
                        </p>
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

                {/* 2. Body Content (Scrollable) */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/40">
                    {/* Ringkasan Pos Rekening & Klasifikasi Belanja */}
                    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                            <div>
                                <span className="text-slate-400 font-medium block mb-0.5">Pos Rekening Belanja:</span>
                                <span className="font-bold text-slate-900">
                                    {requisition.rba_account
                                        ? `[${requisition.rba_account.account_code}] ${requisition.rba_account.account_name}`
                                        : 'Belum Terhubung'}
                                </span>
                            </div>
                            <div>
                                <span className="text-slate-400 font-medium block mb-0.5">Klasifikasi Belanja:</span>
                                <span className="inline-flex items-center gap-1 font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                                    Belanja {requisition.jenis_belanja || 'Operasi'} &bull; 100% BLUD
                                </span>
                            </div>
                            <div>
                                <span className="text-slate-400 font-medium block mb-0.5">Unit Pengusul:</span>
                                <span className="font-semibold text-slate-800">
                                    {unitName}
                                </span>
                            </div>
                        </div>

                        {requisition.urgency_reason && (
                            <div className="border-t border-slate-100 pt-2.5 text-xs">
                                <span className="font-bold text-slate-600 block mb-1">
                                    Catatan / Alasan Kebutuhan Belanja Unit:
                                </span>
                                <p className="text-slate-700 italic bg-slate-50 p-2.5 rounded-lg border border-slate-200 leading-relaxed">
                                    "{requisition.urgency_reason}"
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Tabel Rincian Barang & Input Kuantitas Disetujui */}
                    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2 border-b border-slate-100">
                            <div>
                                <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                                    Rincian Kuantitas Barang ({details.length} Item)
                                </h3>
                                <p className="text-[11px] text-slate-500">
                                    Total Diminta: <strong className="text-slate-800">{totalRequestedQty} Unit</strong> &bull; Sesuaikan volume yang disetujui
                                </p>
                            </div>

                            <div className="flex items-center gap-2 flex-wrap">
                                <button
                                    type="button"
                                    onClick={handleApproveAll}
                                    className="rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 px-3 py-1.5 text-xs font-bold transition cursor-pointer"
                                    title="Setujui seluruh kuantitas sesuai permintaan unit"
                                >
                                    ✓ Setujui Semua (100%)
                                </button>
                                <button
                                    type="button"
                                    onClick={handleResetAll}
                                    className="rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 px-2.5 py-1.5 text-xs font-semibold transition cursor-pointer"
                                    title="Reset seluruh volume disetujui menjadi 0"
                                >
                                    Reset (0)
                                </button>
                            </div>
                        </div>

                        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
                            <table className="min-w-full divide-y divide-slate-100 text-xs">
                                <thead className="bg-slate-50 font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                                    <tr>
                                        <th className="w-10 px-3 py-2.5 text-center">No</th>
                                        <th className="px-4 py-2.5 text-left">Nama Barang & Spesifikasi</th>
                                        <th className="w-20 px-3 py-2.5 text-center">Satuan</th>
                                        <th className="w-32 px-3 py-2.5 text-right">Harga Satuan</th>
                                        <th className="w-20 px-3 py-2.5 text-center">Diminta</th>
                                        <th className="w-28 px-3 py-2 text-center bg-teal-50/70 text-teal-950 border-x border-teal-200">
                                            Disetujui *
                                        </th>
                                        <th className="w-36 px-4 py-2.5 text-right">Subtotal Disetujui</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white">
                                    {details.map((detail, idx) => {
                                        const itemCode = detail.item?.item_code || (detail.item_id ? `ITM-${String(detail.item_id).padStart(4, '0')}` : 'ITM-BARU');
                                        const itemName = detail.item?.name || detail.item_name || '-';
                                        const itemSpec = detail.item?.specification || detail.specification;
                                        const itemUnit = detail.unit_type || detail.item?.unit_type || 'Unit';
                                        const unitPrice = Number(detail.unit_price || 0);
                                        const currentApproved = itemsState[idx]?.quantity_approved ?? detail.quantity_requested;
                                        const subtotalApproved = unitPrice * Number(currentApproved || 0);

                                        return (
                                            <tr key={detail.id || idx} className="hover:bg-slate-50/60 transition">
                                                <td className="px-3 py-2.5 text-center text-slate-400 font-semibold">
                                                    {idx + 1}
                                                </td>
                                                <td className="px-4 py-2.5">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="font-mono text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                                                            {itemCode}
                                                        </span>
                                                        <span className="font-bold text-slate-900">{itemName}</span>
                                                    </div>
                                                    {itemSpec && (
                                                        <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                                                            {itemSpec}
                                                        </p>
                                                    )}
                                                </td>
                                                <td className="px-3 py-2.5 text-center text-slate-600">
                                                    {itemUnit}
                                                </td>
                                                <td className="px-3 py-2.5 text-right font-mono text-slate-700">
                                                    {formatRupiah(unitPrice)}
                                                </td>
                                                <td className="px-3 py-2.5 text-center font-bold text-slate-700">
                                                    {detail.quantity_requested}
                                                </td>
                                                <td className="px-3 py-2 text-center bg-teal-50/40 border-x border-teal-200">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={itemsState[idx]?.quantity_approved ?? ''}
                                                        onChange={(e) => updateQuantityApproved(idx, e.target.value)}
                                                        className="w-20 text-center font-bold text-xs rounded-lg border border-slate-300 bg-white py-1 px-2 text-slate-900 focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition shadow-2xs"
                                                    />
                                                </td>
                                                <td className="px-4 py-2.5 text-right font-mono font-bold text-slate-900">
                                                    {formatRupiah(subtotalApproved)}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Baris Ringkasan Bawah Tabel */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-2 border-t border-slate-100">
                            <span className="text-xs text-slate-500">
                                Total Volume Disetujui: <strong className="text-slate-800">{totalApprovedQty} Unit</strong>
                            </span>
                            <div className="flex items-center gap-2 self-end">
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                                    Total Nilai Disetujui:
                                </span>
                                <span className="text-sm sm:text-base font-bold text-teal-800 font-mono bg-teal-50 px-2.5 py-0.5 rounded-lg border border-teal-200">
                                    {formatRupiah(totalEstimatedApproved)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Catatan / Rekomendasi Perencanaan */}
                    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs space-y-1.5">
                        <label
                            htmlFor="modal_notes_perencanaan"
                            className="block text-xs font-semibold text-slate-700"
                        >
                            Catatan / Rekomendasi Telaah Perencanaan <span className="text-slate-400 font-normal">(Opsional)</span>
                        </label>
                        <textarea
                            id="modal_notes_perencanaan"
                            rows={2}
                            value={notesPerencanaan}
                            onChange={(e) => setNotesPerencanaan(e.target.value)}
                            placeholder="Tuliskan catatan arahan teknis untuk Bagian Keuangan atau unit kerja pengusul..."
                            className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition shadow-2xs"
                        />
                    </div>

                    {/* Konfirmasi Penolakan Inline jika tombol Tolak diklik */}
                    {showRejectConfirmation && (
                        <div className="rounded-xl border border-rose-200 bg-rose-50/80 p-4 space-y-2 animate-fade-in">
                            <div className="flex items-center gap-2 text-rose-900 font-bold text-xs">
                                <span>⚠️</span>
                                <span>Konfirmasi Penolakan Usulan Belanja</span>
                            </div>
                            <p className="text-xs text-rose-700">
                                Berkas usulan belanja ini akan ditutup dengan status <strong>Ditolak</strong>. Pastikan Anda telah menuliskan alasan penolakan pada kolom catatan di atas.
                            </p>
                            <div className="flex items-center gap-2 pt-1">
                                <button
                                    type="button"
                                    onClick={handleConfirmReject}
                                    disabled={isSubmitting}
                                    className="rounded-lg bg-rose-600 hover:bg-rose-700 text-white px-3.5 py-1.5 text-xs font-bold transition cursor-pointer"
                                >
                                    {isSubmitting ? 'Menolak...' : 'Ya, Tetap Tolak Usulan'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowRejectConfirmation(false)}
                                    className="rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 px-3 py-1.5 text-xs font-semibold transition cursor-pointer"
                                >
                                    Batal
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* 3. Footer Modal Actions */}
                <div className="shrink-0 border-t border-slate-100 bg-white px-6 py-4 flex items-center justify-between gap-3">
                    <button
                        type="button"
                        onClick={() => setShowRejectConfirmation(!showRejectConfirmation)}
                        disabled={isSubmitting}
                        className="rounded-xl border border-rose-200 bg-rose-50/70 hover:bg-rose-100 text-rose-700 active:scale-95 px-4 py-2 text-xs font-bold transition cursor-pointer disabled:opacity-50"
                    >
                        Tolak Pengajuan
                    </button>

                    <div className="flex items-center gap-2.5">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer disabled:opacity-50"
                        >
                            Batal
                        </button>

                        <button
                            type="button"
                            onClick={handleSubmitApprove}
                            disabled={isSubmitting}
                            className="inline-flex items-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-95 text-white px-5 py-2 text-xs font-bold shadow-xs transition cursor-pointer disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <>
                                    <svg className="h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" strokeWidth="4" stroke="currentColor" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    <span>Memproses...</span>
                                </>
                            ) : (
                                <>
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                    </svg>
                                    <span>Setujui & Teruskan ke Keuangan</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
