import Modal from '@/Components/Modal';

export default function DeleteConfirmationModal({
    show = false,
    onClose = () => {},
    onConfirm = () => {},
    title = 'Konfirmasi Hapus Data',
    message = '',
    itemName = '',
    itemCode = '',
    details = null,
    confirmText = 'Ya, Hapus Data',
    processing = false,
}) {
    return (
        <Modal show={show} onClose={onClose} maxWidth="md">
            <div className="flex flex-col">
                {/* Header Modal Card */}
                <div className="shrink-0 border-b border-rose-200 bg-gradient-to-r from-rose-700 via-red-700 to-rose-800 px-6 py-4 text-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-xl font-bold backdrop-blur-xs border border-white/20">
                                🗑️
                            </div>
                            <div>
                                <h3 className="text-base font-black tracking-tight">
                                    {title}
                                </h3>
                                <p className="text-xs text-rose-100 font-medium mt-0.5">
                                    Tindakan ini permanen dan tidak dapat dibatalkan
                                </p>
                            </div>
                        </div>

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

                {/* Body Modal Card */}
                <div className="p-6 space-y-4 bg-slate-50/50">
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                        {message || 'Apakah Anda yakin ingin menghapus data ini dari sistem?'}
                    </p>

                    {/* Item Details Box */}
                    {(itemName || itemCode || details) && (
                        <div className="rounded-xl border border-rose-200 bg-rose-50/80 p-4 text-xs space-y-1.5">
                            {itemCode && (
                                <div className="flex items-center gap-2">
                                    <span className="text-slate-500 font-semibold w-24 shrink-0">Kode / Nomor:</span>
                                    <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-rose-200">
                                        {itemCode}
                                    </span>
                                </div>
                            )}
                            {itemName && (
                                <div className="flex items-start gap-2">
                                    <span className="text-slate-500 font-semibold w-24 shrink-0">Nama / Uraian:</span>
                                    <span className="font-bold text-slate-900">{itemName}</span>
                                </div>
                            )}
                            {details}
                        </div>
                    )}

                    <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-3 text-[11px] text-amber-900 font-medium flex items-start gap-2">
                        <span className="text-amber-600 text-sm shrink-0">⚠️</span>
                        <p>Data yang telah dihapus tidak dapat dipulihkan kembali. Pastikan data tidak memiliki relasi transaksi penting di sistem.</p>
                    </div>
                </div>

                {/* Footer Modal Card */}
                <div className="shrink-0 border-t border-slate-200 bg-white px-6 py-4 flex items-center justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={processing}
                        className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                    >
                        Batalkan
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={processing}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 px-5 py-2 text-xs font-bold text-white shadow-xs transition cursor-pointer disabled:opacity-50"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                        {processing ? 'Menghapus...' : confirmText}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
