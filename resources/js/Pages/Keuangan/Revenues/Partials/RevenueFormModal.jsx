import InputError from '@/Components/InputError';
import Modal from '@/Components/Modal';
import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import Swal from 'sweetalert2';

const formatRupiah = (value) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(Number(value || 0));

export default function RevenueFormModal({
    show = false,
    onClose = () => {},
    grouped_sources = null,
    sources = [],
    default_date = '',
}) {
    const initialSource = sources[0] || (grouped_sources ? Object.values(grouped_sources)[0]?.[0] : '') || '';

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        source: initialSource,
        amount: '',
        date: default_date || new Date().toISOString().split('T')[0],
        description: '',
    });

    useEffect(() => {
        if (show) {
            clearErrors();
            reset();
            setData({
                source: initialSource,
                amount: '',
                date: default_date || new Date().toISOString().split('T')[0],
                description: '',
            });
        }
    }, [show, initialSource, default_date]);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!data.source) {
            Swal.fire({
                icon: 'warning',
                title: 'Pilih Sumber Pendapatan',
                text: 'Harap pilih Pos Rekening / Sumber Layanan penerimaan kas.',
                confirmButtonColor: '#059669',
            });
            return;
        }

        if (!data.amount || Number(data.amount) <= 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Nominal Tidak Valid',
                text: 'Nominal penerimaan harus lebih dari 0 rupiah.',
                confirmButtonColor: '#059669',
            });
            return;
        }

        Swal.fire({
            title: 'Catat Penerimaan Kas?',
            html: `
                <div class="text-left text-xs text-slate-600 space-y-1.5">
                    <p>Pos Penerimaan: <b>${data.source}</b></p>
                    <p>Tanggal Transaksi: <b>${data.date}</b></p>
                    <p>Nominal Diterima: <b class="text-emerald-700 font-bold">${formatRupiah(data.amount)}</b></p>
                    ${data.description ? `<p class="italic text-slate-500">Ket: ${data.description}</p>` : ''}
                </div>
            `,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#059669',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Ya, Catat Kas Masuk',
            cancelButtonText: 'Batal',
        }).then((result) => {
            if (result.isConfirmed) {
                post(route('revenues.store'), {
                    preserveScroll: true,
                    onSuccess: () => {
                        onClose();
                        Swal.fire({
                            icon: 'success',
                            title: 'Penerimaan Berhasil Dicatat!',
                            text: `Kas masuk sebesar ${formatRupiah(data.amount)} telah dibukukan.`,
                            timer: 2000,
                            showConfirmButton: false,
                        });
                    },
                });
            }
        });
    };

    return (
        <Modal show={show} onClose={onClose} maxWidth="2xl">
            <div className="flex flex-col">
                {/* Header Modal */}
                <div className="shrink-0 border-b border-emerald-100 bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 px-6 py-4 text-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-xl font-bold backdrop-blur-xs border border-white/20">
                                💵
                            </div>
                            <div>
                                <h2 className="text-base sm:text-lg font-black tracking-tight">
                                    Pencatatan Penerimaan Pendapatan E-BLUD
                                </h2>
                                <p className="text-xs text-emerald-100/90 font-medium mt-0.5">
                                    Penerimaan kas masuk dari 23 unit layanan resmi berstandar RBA RSJ Tampan
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

                {/* Body Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-slate-50/50">
                    {/* Sumber Layanan / Pos Rekening */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                            Pos Rekening / Unit Layanan Sumber Pendapatan <span className="text-rose-600">*</span>
                        </label>
                        <select
                            value={data.source}
                            onChange={(e) => setData('source', e.target.value)}
                            className="w-full rounded-xl border-2 border-slate-300 bg-white p-2.5 text-xs font-bold text-slate-900 shadow-2xs focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
                            required
                        >
                            {grouped_sources ? (
                                Object.entries(grouped_sources).map(([group, items]) => (
                                    <optgroup key={group} label={group} className="font-black text-emerald-950 bg-emerald-50/60">
                                        {items.map((src) => (
                                            <option key={src} value={src} className="font-medium text-slate-900 bg-white py-1">
                                                {src}
                                            </option>
                                        ))}
                                    </optgroup>
                                ))
                            ) : (
                                sources.map((src) => (
                                    <option key={src} value={src}>
                                        {src}
                                    </option>
                                ))
                            )}
                        </select>
                        <p className="mt-1 text-[11px] text-slate-500">
                            Mengacu pada rekening resmi Dokumen 2 RBA Pendapatan RS Jiwa Tampan.
                        </p>
                        <InputError message={errors.source} className="mt-1" />
                    </div>

                    {/* Tanggal & Nominal Grid */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        {/* Tanggal Penerimaan */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                Tanggal Penerimaan Kas <span className="text-rose-600">*</span>
                            </label>
                            <input
                                type="date"
                                value={data.date}
                                onChange={(e) => setData('date', e.target.value)}
                                className="w-full rounded-xl border-2 border-slate-300 bg-white p-2.5 text-xs font-bold text-slate-900 shadow-2xs focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
                                required
                            />
                            <InputError message={errors.date} className="mt-1" />
                        </div>

                        {/* Nominal (IDR) */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                Nominal Penerimaan (Rp) <span className="text-rose-600">*</span>
                            </label>
                            <input
                                type="number"
                                min="1"
                                step="1"
                                value={data.amount}
                                onChange={(e) => setData('amount', e.target.value)}
                                placeholder="contoh: 5000000"
                                className="w-full rounded-xl border-2 border-slate-300 bg-white p-2.5 text-xs font-bold text-slate-900 shadow-2xs focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
                                required
                            />
                            <div className="mt-1 flex items-center justify-between text-[11px]">
                                <span className="text-slate-500">Format Rupiah:</span>
                                <span className="font-bold text-emerald-700 font-mono">
                                    {formatRupiah(data.amount)}
                                </span>
                            </div>
                            <InputError message={errors.amount} className="mt-1" />
                        </div>
                    </div>

                    {/* Uraian / Keterangan */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                            Uraian / Keterangan Transaksi (Opsional)
                        </label>
                        <textarea
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            rows={2}
                            placeholder="Contoh: Penerimaan layanan rawat jalan poli jiwa shift pagi tanggal 10..."
                            className="w-full rounded-xl border-2 border-slate-300 bg-white p-2.5 text-xs font-medium text-slate-900 shadow-2xs focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
                        />
                        <InputError message={errors.description} className="mt-1" />
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={processing}
                            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 px-5 py-2 text-xs font-bold text-white shadow-xs transition cursor-pointer"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                            {processing ? 'Menyimpan...' : 'Catat Kas Masuk'}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
