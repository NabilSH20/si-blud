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

const formatTanggal = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(date);
};

export default function FinanceDisbursementModal({
    show = false,
    onClose = () => {},
    requisition = null,
    budgets = [],
}) {
    if (!requisition) return null;

    const details = requisition.requisition_details || requisition.requisitionDetails || [];

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

    // Initial budget ID: prioritize requisition.rba_account_id or budgets[0]?.id
    const initialBudgetId = requisition.rba_account_id || (budgets[0]?.id ? String(budgets[0].id) : '');

    const [selectedBudgetId, setSelectedBudgetId] = useState(initialBudgetId ? String(initialBudgetId) : '');
    const [sp2dNumber, setSp2dNumber] = useState(requisition.sp2d_number || '');
    const [receiptNumber, setReceiptNumber] = useState(requisition.receipt_number || '');
    const [notesKeuangan, setNotesKeuangan] = useState(requisition.notes_keuangan || '');
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        if (requisition) {
            setSelectedBudgetId(requisition.rba_account_id ? String(requisition.rba_account_id) : (budgets[0]?.id ? String(budgets[0].id) : ''));
            setSp2dNumber(requisition.sp2d_number || '');
            setReceiptNumber(requisition.receipt_number || '');
            setNotesKeuangan(requisition.notes_keuangan || '');
        }
    }, [requisition, budgets]);

    // Selected budget details
    const selectedBudget = useMemo(() => {
        return budgets.find((b) => String(b.id) === String(selectedBudgetId)) || requisition.rba_account;
    }, [budgets, selectedBudgetId, requisition]);

    const remainingBudget = Number(selectedBudget?.remaining_budget ?? 0);
    const hasSufficientBudget = remainingBudget >= grandTotal;

    const handleApprove = () => {
        if (!selectedBudgetId) {
            Swal.fire({
                icon: 'warning',
                title: 'Pilih Rekening Anggaran',
                text: 'Harap tentukan Pos Rekening Belanja RBA untuk pembebanan anggaran.',
                confirmButtonColor: '#059669',
            });
            return;
        }

        if (!sp2dNumber.trim()) {
            Swal.fire({
                icon: 'warning',
                title: 'Nomor SP2D Wajib Diisi',
                text: 'Silakan input Nomor Surat Perintah Pencairan Dana (SP2D) sebelum menyetujui.',
                confirmButtonColor: '#059669',
            });
            return;
        }

        if (!hasSufficientBudget) {
            Swal.fire({
                icon: 'error',
                title: 'Saldo Pagu Tidak Mencukupi!',
                html: `Sisa saldo pagu rekening <b>${formatRupiah(remainingBudget)}</b> tidak mencukupi untuk membiayai pengajuan sebesar <b>${formatRupiah(grandTotal)}</b>. Defisit: <span class="text-rose-600 font-bold">${formatRupiah(grandTotal - remainingBudget)}</span>.`,
                confirmButtonColor: '#e11d48',
            });
            return;
        }

        Swal.fire({
            title: 'Setujui Pencairan & Debet Pagu?',
            html: `
                <div class="text-left text-xs text-slate-600 space-y-2">
                    <p>Anda akan menyetujui pengajuan belanja nomor: <b>${requisition.requisition_number}</b></p>
                    <p>Total Anggaran Dicairkan: <b class="text-emerald-700 font-bold">${formatRupiah(grandTotal)}</b></p>
                    <p>Nomor SP2D: <b class="font-mono text-slate-800">${sp2dNumber}</b></p>
                    <p class="text-slate-500 italic mt-2">Saldo rekening RBA terkait akan otomatis dipotong secara permanen.</p>
                </div>
            `,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#059669',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Ya, Terbitkan SP2D & Cairkan',
            cancelButtonText: 'Batal',
        }).then((result) => {
            if (result.isConfirmed) {
                setProcessing(true);
                router.put(route('keuangan.requisitions.update', requisition.id), {
                    status: 'Disetujui_Selesai',
                    rba_account_id: selectedBudgetId,
                    sp2d_number: sp2dNumber,
                    receipt_number: receiptNumber,
                    notes_keuangan: notesKeuangan,
                }, {
                    preserveScroll: true,
                    onSuccess: () => {
                        setProcessing(false);
                        onClose();
                        Swal.fire({
                            icon: 'success',
                            title: 'Pencairan Berhasil!',
                            text: 'Pagu anggaran telah berhasil didebet dan Nomor SP2D telah tercatat.',
                            confirmButtonColor: '#059669',
                            timer: 2500,
                        });
                    },
                    onError: (err) => {
                        setProcessing(false);
                        const msg = err.rba_account_id || err.status || Object.values(err)[0] || 'Gagal memproses persetujuan.';
                        Swal.fire({
                            icon: 'error',
                            title: 'Gagal Memproses',
                            text: msg,
                            confirmButtonColor: '#e11d48',
                        });
                    },
                });
            }
        });
    };

    const handleReject = () => {
        Swal.fire({
            title: 'Tolak Pengajuan Belanja?',
            text: 'Berikan alasan/catatan penolakan pencairan anggaran:',
            input: 'textarea',
            inputValue: notesKeuangan,
            inputPlaceholder: 'Contoh: Berkas SPJ belum lengkap / Pagu anggaran tidak mencukupi...',
            inputAttributes: {
                'aria-label': 'Alasan penolakan',
            },
            showCancelButton: true,
            confirmButtonColor: '#e11d48',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Ya, Tolak Pengajuan',
            cancelButtonText: 'Batal',
            inputValidator: (value) => {
                if (!value || !value.trim()) {
                    return 'Alasan penolakan wajib diisi agar pengusul mengetahui penyebabnya.';
                }
            },
        }).then((result) => {
            if (result.isConfirmed) {
                setProcessing(true);
                router.put(route('keuangan.requisitions.update', requisition.id), {
                    status: 'Ditolak',
                    rba_account_id: selectedBudgetId,
                    notes_keuangan: result.value,
                    sp2d_number: '',
                    receipt_number: '',
                }, {
                    preserveScroll: true,
                    onSuccess: () => {
                        setProcessing(false);
                        onClose();
                        Swal.fire({
                            icon: 'success',
                            title: 'Pengajuan Ditolak',
                            text: 'Status pengajuan belanja telah diperbarui menjadi Ditolak.',
                            confirmButtonColor: '#059669',
                            timer: 2500,
                        });
                    },
                    onError: (err) => {
                        setProcessing(false);
                        const msg = Object.values(err)[0] || 'Gagal menolak pengajuan.';
                        Swal.fire({
                            icon: 'error',
                            title: 'Gagal Memproses',
                            text: msg,
                            confirmButtonColor: '#e11d48',
                        });
                    },
                });
            }
        });
    };

    return (
        <Modal show={show} onClose={onClose} maxWidth="4xl">
            <div className="flex flex-col max-h-[92vh]">
                {/* Header Modal */}
                <div className="shrink-0 border-b border-blue-200 bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 px-6 py-4 text-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-xl font-bold backdrop-blur-xs border border-white/20">
                                ⚡
                            </div>
                            <div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <h2 className="text-base sm:text-lg font-black tracking-tight">
                                        Validasi & Pencairan Anggaran (SP2D)
                                    </h2>
                                    <span className="inline-flex items-center rounded-full bg-blue-900/60 px-2.5 py-0.5 text-[11px] font-black border border-blue-400/40 text-blue-100 font-mono">
                                        {requisition.requisition_number}
                                    </span>
                                    <span className="inline-flex items-center rounded-full bg-amber-400 text-amber-950 px-2.5 py-0.5 text-[11px] font-black">
                                        TA {requisition.fiscal_year || '2027'}
                                    </span>
                                </div>
                                <p className="text-xs text-blue-100/90 font-medium mt-0.5">
                                    Unit: {requisition.unit?.name || '-'} &bull; Bidang: {requisition.division?.name || '-'} &bull; Belanja {requisition.jenis_belanja || 'Operasi'} BLUD
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
                <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-slate-50/50">
                    {/* Urgensi & Latar Belakang Notice */}
                    {requisition.urgency_reason && (
                        <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-3.5 text-xs text-slate-800">
                            <span className="font-bold text-amber-900 block mb-0.5">📌 Telaahan Staf / Urgensi Kebutuhan:</span>
                            <p className="whitespace-pre-line leading-relaxed font-medium">{requisition.urgency_reason}</p>
                        </div>
                    )}

                    {/* SECTION: Kontrol Pos Rekening Belanja & Ketersediaan Pagu */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-xs">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3">
                            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                                <span className="flex h-5 w-5 items-center justify-center rounded-md bg-blue-600 text-white text-[11px] font-bold">1</span>
                                Pos Rekening Belanja RBA & Ketersediaan Saldo
                            </h3>
                            <span className="text-xs font-bold text-slate-500">
                                Total Pengajuan: <span className="text-emerald-700 font-black">{formatRupiah(grandTotal)}</span>
                            </span>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                    Pilih Pos Rekening RBA Pembebanan <span className="text-rose-600">*</span>
                                </label>
                                <select
                                    value={selectedBudgetId}
                                    onChange={(e) => setSelectedBudgetId(e.target.value)}
                                    className="w-full rounded-xl border-2 border-slate-300 bg-white p-2.5 text-xs font-bold text-slate-900 shadow-2xs focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
                                >
                                    {budgets.length > 0 ? (
                                        budgets.map((b) => (
                                            <option key={b.id} value={b.id}>
                                                [{b.account_code}] {b.account_name} (Sisa: {formatRupiah(b.remaining_budget)})
                                            </option>
                                        ))
                                    ) : (
                                        requisition.rba_account && (
                                            <option value={requisition.rba_account.id}>
                                                [{requisition.rba_account.account_code}] {requisition.rba_account.account_name}
                                            </option>
                                        )
                                    )}
                                </select>
                            </div>

                            {/* Badge Status Pagu */}
                            <div className="flex flex-col justify-center">
                                <span className="block text-xs font-bold text-slate-700 mb-1.5">Status Saldo Pagu Anggaran</span>
                                {hasSufficientBudget ? (
                                    <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-2.5 text-xs text-emerald-900 font-bold flex items-center gap-2">
                                        <span className="text-emerald-600 text-base">✅</span>
                                        <div>
                                            <div>Saldo Tersedia: {formatRupiah(remainingBudget)}</div>
                                            <div className="text-[11px] font-normal text-emerald-700">
                                                Estimasi sisa setelah pencairan: <span className="font-semibold">{formatRupiah(remainingBudget - grandTotal)}</span>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="rounded-xl border border-rose-300 bg-rose-50 p-2.5 text-xs text-rose-900 font-bold flex items-center gap-2">
                                        <span className="text-rose-600 text-base">⚠️</span>
                                        <div>
                                            <div>Saldo Tidak Mencukupi! ({formatRupiah(remainingBudget)})</div>
                                            <div className="text-[11px] font-normal text-rose-700">
                                                Defisit pembiayaan: <span className="font-semibold">{formatRupiah(grandTotal - remainingBudget)}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* SECTION: Rincian Barang yang Disetujui Perencanaan */}
                    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
                        <div className="border-b border-slate-100 bg-slate-50/80 px-5 py-3 flex items-center justify-between">
                            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                                <span className="flex h-5 w-5 items-center justify-center rounded-md bg-blue-600 text-white text-[11px] font-bold">2</span>
                                Rincian Barang yang Disetujui Perencanaan
                            </h3>
                            <span className="text-xs font-bold text-slate-600">
                                {totalApprovedItems} Unit Disetujui ({details.length} Macam)
                            </span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-100 text-xs">
                                <thead className="bg-slate-50 text-slate-700 uppercase tracking-wider font-bold">
                                    <tr>
                                        <th className="w-10 px-3 py-2.5 text-center">No</th>
                                        <th className="px-3 py-2.5 text-left">Kode & Nama Barang</th>
                                        <th className="w-20 px-3 py-2.5 text-center">Satuan</th>
                                        <th className="w-24 px-3 py-2.5 text-center">Disetujui</th>
                                        <th className="w-28 px-3 py-2.5 text-right">Harga Satuan</th>
                                        <th className="w-32 px-3 py-2.5 text-right">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white">
                                    {details.map((detail, idx) => {
                                        const qty = detail.quantity_approved !== null && detail.quantity_approved !== undefined
                                            ? Number(detail.quantity_approved)
                                            : Number(detail.quantity_requested || 0);
                                        const price = Number(detail.unit_price || detail.item?.standard_price || 0);
                                        const subtotal = qty * price;

                                        return (
                                            <tr key={detail.id || idx} className="hover:bg-slate-50">
                                                <td className="px-3 py-2 text-center text-slate-500 font-semibold">{idx + 1}</td>
                                                <td className="px-3 py-2">
                                                    <span className="font-mono text-[10px] text-slate-500 block">
                                                        [{detail.item?.item_code || 'ITM-BARU'}]
                                                    </span>
                                                    <span className="font-bold text-slate-900">
                                                        {detail.item?.name || detail.item_name || detail.manual_item_name}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-2 text-center text-slate-600">
                                                    {detail.item?.unit_type || detail.unit_type || 'Unit'}
                                                </td>
                                                <td className="px-3 py-2 text-center font-bold text-emerald-700">
                                                    {qty}
                                                </td>
                                                <td className="px-3 py-2 text-right font-medium text-slate-700">
                                                    {formatRupiah(price)}
                                                </td>
                                                <td className="px-3 py-2 text-right font-bold text-slate-900">
                                                    {formatRupiah(subtotal)}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                                <tfoot className="border-t-2 border-slate-200 bg-slate-50/80 font-bold">
                                    <tr>
                                        <td colSpan="5" className="px-3 py-2.5 text-right uppercase tracking-wider text-slate-700">
                                            Total Beban Anggaran BLUD:
                                        </td>
                                        <td className="px-3 py-2.5 text-right text-sm font-black text-emerald-700">
                                            {formatRupiah(grandTotal)}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>

                    {/* SECTION: Formulir Validasi & Penerbitan SP2D Keuangan */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-xs">
                        <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-blue-600 text-white text-[11px] font-bold">3</span>
                            Pencatatan Dokumen Resmi SP2D & Bukti Kuitansi
                        </h3>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                    Nomor SP2D Resmi <span className="text-rose-600">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={sp2dNumber}
                                    onChange={(e) => setSp2dNumber(e.target.value)}
                                    placeholder="contoh: SP2D/BLUD/2026/0123"
                                    className="w-full rounded-xl border-2 border-slate-300 bg-white p-2.5 text-xs font-bold text-slate-900 font-mono shadow-2xs focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
                                />
                                <span className="text-[11px] text-slate-500 block mt-1">
                                    Nomor Surat Perintah Pencairan Dana dari Bendahara Pengeluaran BLUD.
                                </span>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                    Nomor Kuitansi / Bukti SPJ (Opsional)
                                </label>
                                <input
                                    type="text"
                                    value={receiptNumber}
                                    onChange={(e) => setReceiptNumber(e.target.value)}
                                    placeholder="contoh: KW/BLUD/2026/0088"
                                    className="w-full rounded-xl border-2 border-slate-300 bg-white p-2.5 text-xs font-bold text-slate-900 font-mono shadow-2xs focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
                                />
                                <span className="text-[11px] text-slate-500 block mt-1">
                                    Nomor kuitansi transaksi atau nomor berkas SPJ pengadaan.
                                </span>
                            </div>

                            <div className="sm:col-span-2">
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                    Catatan / Telaahan Keuangan (Opsional)
                                </label>
                                <textarea
                                    value={notesKeuangan}
                                    onChange={(e) => setNotesKeuangan(e.target.value)}
                                    rows={2}
                                    placeholder="Catatan verifikasi dokumen keuangan, mekanisme pembayaran (LS / UP / GU)..."
                                    className="w-full rounded-xl border-2 border-slate-300 bg-white p-2.5 text-xs font-medium text-slate-900 shadow-2xs focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Modal Actions */}
                <div className="shrink-0 border-t border-slate-200 bg-white px-6 py-4 flex flex-wrap items-center justify-between gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={processing}
                        className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                    >
                        Tutup
                    </button>

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={handleReject}
                            disabled={processing}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-700 px-4 py-2.5 text-xs font-bold shadow-2xs transition cursor-pointer active:scale-95"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Tolak Pengajuan
                        </button>

                        <button
                            type="button"
                            onClick={handleApprove}
                            disabled={processing || !hasSufficientBudget}
                            className={`inline-flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-xs font-bold text-white shadow-sm transition cursor-pointer active:scale-95 ${
                                hasSufficientBudget && !processing
                                    ? 'bg-emerald-600 hover:bg-emerald-700'
                                    : 'bg-slate-400 cursor-not-allowed opacity-60'
                            }`}
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                            {processing ? 'Memproses...' : 'Setujui Pencairan (Terbitkan SP2D)'}
                        </button>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
