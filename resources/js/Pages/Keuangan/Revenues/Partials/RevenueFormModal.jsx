import InputError from '@/Components/InputError';
import Modal from '@/Components/Modal';
import { useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { X, Wallet, Check } from 'lucide-react';

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
    const [selectedCategory, setSelectedCategory] = useState('');

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        source: '',
        amount: '',
        date: default_date || new Date().toISOString().split('T')[0],
        description: '',
    });

    useEffect(() => {
        if (show) {
            clearErrors();
            reset();
            setSelectedCategory('');
            setData({
                source: '',
                amount: '',
                date: default_date || new Date().toISOString().split('T')[0],
                description: '',
            });
        }
    }, [show, default_date]);

    // Update source when category changes
    useEffect(() => {
        if (selectedCategory && grouped_sources && grouped_sources[selectedCategory]) {
            setData('source', grouped_sources[selectedCategory][0] || '');
        } else {
            setData('source', '');
        }
    }, [selectedCategory]);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!selectedCategory) {
            Swal.fire({
                icon: 'warning',
                title: 'Pilih Kategori Pendapatan',
                text: 'Harap pilih kategori pendapatan terlebih dahulu.',
                confirmButtonColor: '#0d9488',
            });
            return;
        }

        if (!data.source) {
            Swal.fire({
                icon: 'warning',
                title: 'Pilih Sumber Pendapatan',
                text: 'Harap pilih Pos Rekening / Sumber Layanan penerimaan kas.',
                confirmButtonColor: '#0d9488',
            });
            return;
        }

        if (!data.amount || Number(data.amount) <= 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Nominal Tidak Valid',
                text: 'Nominal penerimaan harus lebih dari 0 rupiah.',
                confirmButtonColor: '#0d9488',
            });
            return;
        }

        Swal.fire({
            title: 'Catat Penerimaan Kas?',
            html: `
                <div class="text-left text-xs text-slate-600 space-y-1.5">
                    <p>Kategori: <b>${selectedCategory}</b></p>
                    <p>Pos Penerimaan: <b>${data.source}</b></p>
                    <p>Tanggal Transaksi: <b>${data.date}</b></p>
                    <p>Nominal Diterima: <b class="text-teal-700 font-bold">${formatRupiah(data.amount)}</b></p>
                    ${data.description ? `<p class="italic text-slate-500">Ket: ${data.description}</p>` : ''}
                </div>
            `,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#0d9488',
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

    const availableSources = selectedCategory && grouped_sources ? grouped_sources[selectedCategory] : [];

    return (
        <Modal show={show} onClose={onClose} maxWidth="2xl">
            <div className="flex flex-col">
                {/* Header Modal */}
                <div className="shrink-0 border-b border-slate-200 bg-white px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                                <Wallet className="h-5 w-5" strokeWidth={2} />
                            </div>
                            <div>
                                <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-800">
                                    Pencatatan Penerimaan Pendapatan E-BLUD
                                </h2>
                                <p className="text-xs text-slate-500 font-medium mt-0.5">
                                    Penerimaan kas masuk dari 23 unit layanan resmi berstandar RBA RSJ Tampan
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer"
                            aria-label="Tutup Dialog"
                        >
                            <X className="h-5 w-5" strokeWidth={2} />
                        </button>
                    </div>
                </div>

                {/* Body Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-slate-50/50">
                    <div className="grid gap-4 sm:grid-cols-2">
                        {/* Kategori Pendapatan */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                Kategori Pendapatan <span className="text-rose-600">*</span>
                            </label>
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="w-full rounded-xl border-slate-300 bg-white p-2.5 text-xs font-bold text-slate-900 shadow-sm focus:border-teal-500 focus:ring-teal-500 transition-colors"
                                required
                            >
                                <option value="" disabled>Pilih Kategori...</option>
                                {grouped_sources && Object.keys(grouped_sources).map((group) => (
                                    <option key={group} value={group}>
                                        {group}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Sumber Layanan / Pos Rekening */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                Pos Rekening / Unit Layanan <span className="text-rose-600">*</span>
                            </label>
                            <select
                                value={data.source}
                                onChange={(e) => setData('source', e.target.value)}
                                className="w-full rounded-xl border-slate-300 bg-white p-2.5 text-xs font-bold text-slate-900 shadow-sm focus:border-teal-500 focus:ring-teal-500 transition-colors disabled:bg-slate-100 disabled:text-slate-400"
                                required
                                disabled={!selectedCategory || availableSources.length === 0}
                            >
                                <option value="" disabled>Pilih Unit Layanan...</option>
                                {availableSources.map((src) => (
                                    <option key={src} value={src}>
                                        {src}
                                    </option>
                                ))}
                            </select>
                            <InputError message={errors.source} className="mt-1" />
                        </div>
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
                                className="w-full rounded-xl border-slate-300 bg-white p-2.5 text-xs font-bold text-slate-900 shadow-sm focus:border-teal-500 focus:ring-teal-500 transition-colors"
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
                                className="w-full rounded-xl border-slate-300 bg-white p-2.5 text-xs font-bold text-slate-900 shadow-sm focus:border-teal-500 focus:ring-teal-500 transition-colors"
                                required
                            />
                            <div className="mt-1 flex items-center justify-between text-[11px]">
                                <span className="text-slate-500">Format Rupiah:</span>
                                <span className="font-bold text-teal-700 font-mono">
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
                            className="w-full rounded-xl border-slate-300 bg-white p-2.5 text-xs font-medium text-slate-900 shadow-sm focus:border-teal-500 focus:ring-teal-500 transition-colors"
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
                            className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-95 px-4 py-2 text-xs font-bold text-white shadow-2xs transition cursor-pointer"
                        >
                            <Check className="h-4 w-4" strokeWidth={2.5} />
                            {processing ? 'Menyimpan...' : 'Catat Kas Masuk'}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
