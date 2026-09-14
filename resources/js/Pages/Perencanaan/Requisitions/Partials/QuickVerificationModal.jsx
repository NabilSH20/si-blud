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

    const details = requisition?.requisition_details || requisition?.requisitionDetails || [];

    useEffect(() => {
        if (!show || !requisition) {
            setItemsState([]);
            setNotesPerencanaan('');
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

    // Handle Approve Submission
    const handleSubmitApprove = (e) => {
        e.preventDefault();
        if (!requisition) return;

        Swal.fire({
            title: 'Setujui & Teruskan ke Keuangan?',
            html: `
                <div class="text-left text-xs sm:text-sm space-y-2 mt-2">
                    <p><strong>Nomor Pengajuan:</strong> <span class="font-mono font-bold text-slate-900">${requisition.requisition_number}</span></p>
                    <p><strong>Unit Pemohon:</strong> ${requisition.unit?.name || requisition.division?.name || '-'}</p>
                    <p><strong>Total Kuantitas Disetujui:</strong> <span class="font-bold text-slate-800">${totalApprovedQty} Unit</span> (dari ${totalRequestedQty} Unit diminta)</p>
                    <p><strong>Estimasi Nilai Verifikasi:</strong> <span class="text-emerald-700 font-bold">${formatRupiah(totalEstimatedApproved)}</span></p>
                    <p class="text-slate-500 text-xs mt-2 border-t pt-2">Pengajuan akan diteruskan ke Bagian Keuangan untuk verifikasi pagu anggaran dan penerbitan SP2D.</p>
                </div>
            `,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#059669',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Ya, Setujui & Teruskan',
            cancelButtonText: 'Batal',
            reverseButtons: true,
        }).then((result) => {
            if (result.isConfirmed) {
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
                            onClose();
                        },
                        onError: () => {
                            setIsSubmitting(false);
                        },
                    }
                );
            }
        });
    };

    // Handle Reject Submission
    const handleReject = () => {
        if (!requisition) return;

        Swal.fire({
            title: 'Tolak Pengajuan Belanja?',
            text: `Apakah Anda yakin ingin menolak pengajuan ${requisition.requisition_number}? Status dokumen akan ditutup sebagai Ditolak.`,
            icon: 'warning',
            input: 'textarea',
            inputPlaceholder: 'Tuliskan catatan/alasan penolakan telaahan staf...',
            inputValue: notesPerencanaan,
            showCancelButton: true,
            confirmButtonColor: '#e11d48',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Ya, Tolak Pengajuan',
            cancelButtonText: 'Batal',
            reverseButtons: true,
        }).then((result) => {
            if (result.isConfirmed) {
                setIsSubmitting(true);
                router.put(
                    route('perencanaan.requisitions.update', requisition.id),
                    {
                        status: 'Ditolak',
                        notes_perencanaan: result.value || notesPerencanaan || 'Pengajuan tidak disetujui pada verifikasi Perencanaan.',
                        items: itemsState,
                    },
                    {
                        preserveScroll: true,
                        onSuccess: () => {
                            setIsSubmitting(false);
                            onClose();
                        },
                        onError: () => {
                            setIsSubmitting(false);
                        },
                    }
                );
            }
        });
    };

    if (!requisition) return null;

    return (
        <Modal show={show} onClose={onClose} maxWidth="4xl">
            <div className="flex flex-col max-h-[92vh]">
                {/* Header Modal */}
                <div className="relative border-b border-emerald-100 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 px-6 py-4 text-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur-xs border border-white/20 text-white shadow-xs">
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                                    Verifikasi Cepat Usulan Belanja
                                    <span className="rounded-full bg-amber-400 text-amber-950 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider">
                                        {requisition.requisition_number}
                                    </span>
                                </h3>
                                <p className="text-xs text-emerald-100 font-medium mt-0.5">
                                    {requisition.unit?.name ? `${requisition.unit.name} • ` : ''}
                                    {requisition.division?.name || '-'} • TA {requisition.fiscal_year || '2027'}
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl p-1.5 text-white/80 hover:bg-white/10 hover:text-white transition focus:outline-none cursor-pointer"
                            aria-label="Tutup Modal"
                        >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Body Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-5">
                    {/* Ringkasan Dokumen & Urgensi */}
                    <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                            <div>
                                <span className="text-slate-500 font-medium block">Pos Rekening Belanja RBA:</span>
                                <span className="font-bold text-slate-800">
                                    {requisition.rba_account
                                        ? `[${requisition.rba_account.account_code}] ${requisition.rba_account.account_name}`
                                        : '-'}
                                </span>
                            </div>
                            <div>
                                <span className="text-slate-500 font-medium block">Klasifikasi & Sumber:</span>
                                <span className="font-bold text-emerald-800">
                                    Belanja {requisition.jenis_belanja || 'Operasi'} • 100% BLUD
                                </span>
                            </div>
                            <div>
                                <span className="text-slate-500 font-medium block">Sub Kegiatan RS:</span>
                                <span className="font-bold text-slate-800 line-clamp-1">
                                    {requisition.sub_kegiatan || 'Pelayanan dan Penunjang Pelayanan BLUD'}
                                </span>
                            </div>
                        </div>

                        {requisition.urgency_reason && (
                            <div className="border-t border-slate-200 pt-2.5">
                                <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block mb-0.5">
                                    📌 Telaahan Staf / Justifikasi Urgensi Kebutuhan:
                                </span>
                                <p className="text-xs text-slate-700 italic leading-relaxed whitespace-pre-line bg-amber-50/60 p-2.5 rounded-lg border border-amber-200">
                                    "{requisition.urgency_reason}"
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Toolbar Tombol Aksi Cepat Tabel */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-emerald-50/70 border border-emerald-200 p-3 rounded-xl">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-emerald-950">
                                Rincian {details.length} Macam Barang:
                            </span>
                            <span className="text-xs font-semibold text-slate-600">
                                (Total Diminta: <strong className="text-slate-900">{totalRequestedQty}</strong> Unit)
                            </span>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                            <button
                                type="button"
                                onClick={handleApproveAll}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white px-3 py-1.5 text-xs font-bold shadow-2xs transition cursor-pointer"
                            >
                                <span>✨</span>
                                Setujui Semua (100% Usulan)
                            </button>
                            <button
                                type="button"
                                onClick={handleResetAll}
                                className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 active:scale-95 text-slate-700 px-2.5 py-1.5 text-xs font-bold shadow-2xs transition cursor-pointer"
                            >
                                Reset Kuantitas (0)
                            </button>
                        </div>
                    </div>

                    {/* Tabel Rincian Barang & Input Kuantitas */}
                    <div className="overflow-hidden rounded-xl border border-slate-200 shadow-2xs">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200 text-xs">
                                <thead className="bg-slate-100 text-slate-800 font-bold uppercase tracking-wider">
                                    <tr>
                                        <th className="w-10 px-3 py-2.5 text-center">No</th>
                                        <th className="px-4 py-2.5 text-left">Nama Barang & Spesifikasi</th>
                                        <th className="w-20 px-3 py-2.5 text-center">Satuan</th>
                                        <th className="w-32 px-3 py-2.5 text-right">Harga Satuan</th>
                                        <th className="w-24 px-3 py-2.5 text-center">Diminta</th>
                                        <th className="w-32 px-3 py-2.5 text-center bg-emerald-100 text-emerald-950 border-x border-emerald-300">
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
                                            <tr key={detail.id || idx} className="hover:bg-emerald-50/30">
                                                <td className="px-3 py-2.5 text-center text-slate-500 font-medium">
                                                    {idx + 1}
                                                </td>
                                                <td className="px-4 py-2.5">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="font-mono text-[10px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                                                            {itemCode}
                                                        </span>
                                                        <span className="font-bold text-slate-900">{itemName}</span>
                                                    </div>
                                                    {itemSpec && (
                                                        <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                                                            Spesifikasi: {itemSpec}
                                                        </p>
                                                    )}
                                                </td>
                                                <td className="px-3 py-2.5 text-center">
                                                    <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-700">
                                                        {itemUnit}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-2.5 text-right font-medium text-slate-700">
                                                    {formatRupiah(unitPrice)}
                                                </td>
                                                <td className="px-3 py-2.5 text-center font-bold text-slate-700">
                                                    {detail.quantity_requested}
                                                </td>
                                                <td className="px-3 py-2 text-center bg-emerald-50/50 border-x border-emerald-200">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={itemsState[idx]?.quantity_approved ?? ''}
                                                        onChange={(e) => updateQuantityApproved(idx, e.target.value)}
                                                        className="w-20 text-center font-black text-sm rounded-lg border-2 border-emerald-400 bg-white py-1 px-2 text-emerald-950 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/30 shadow-2xs"
                                                    />
                                                </td>
                                                <td className="px-4 py-2.5 text-right font-black text-emerald-700">
                                                    {formatRupiah(subtotalApproved)}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                                <tfoot className="bg-slate-100 border-t border-slate-300 font-bold">
                                    <tr>
                                        <td colSpan={5} className="px-4 py-3 text-right text-slate-700 uppercase tracking-wider text-[11px]">
                                            Total Disetujui ({totalApprovedQty} Unit):
                                        </td>
                                        <td className="px-3 py-3 text-center font-black text-emerald-900 bg-emerald-100/70 border-x border-emerald-300">
                                            {totalApprovedQty}
                                        </td>
                                        <td className="px-4 py-3 text-right font-black text-sm text-emerald-800">
                                            {formatRupiah(totalEstimatedApproved)}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>

                    {/* Catatan Verifikasi Perencanaan */}
                    <div>
                        <label
                            htmlFor="modal_notes_perencanaan"
                            className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1"
                        >
                            Catatan Verifikasi / Rekomendasi Perencanaan (Opsional):
                        </label>
                        <textarea
                            id="modal_notes_perencanaan"
                            rows={2}
                            value={notesPerencanaan}
                            onChange={(e) => setNotesPerencanaan(e.target.value)}
                            placeholder="Tuliskan catatan teknis untuk Bagian Keuangan atau unit pemohon..."
                            className="block w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-500"
                        />
                    </div>
                </div>

                {/* Footer Modal Actions */}
                <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-3.5">
                    <button
                        type="button"
                        onClick={handleReject}
                        disabled={isSubmitting}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-700 active:scale-95 px-4 py-2 text-xs font-bold transition disabled:opacity-50 cursor-pointer"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Tolak Pengajuan
                    </button>

                    <div className="flex items-center gap-2.5">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="rounded-xl border border-slate-300 bg-white hover:bg-slate-100 active:scale-95 text-slate-700 px-4 py-2 text-xs font-bold transition disabled:opacity-50 cursor-pointer"
                        >
                            Batal
                        </button>

                        <button
                            type="button"
                            onClick={handleSubmitApprove}
                            disabled={isSubmitting}
                            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white px-5 py-2 text-xs font-black shadow-md hover:shadow-lg transition disabled:opacity-50 cursor-pointer"
                        >
                            {isSubmitting ? (
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
        </Modal>
    );
}
