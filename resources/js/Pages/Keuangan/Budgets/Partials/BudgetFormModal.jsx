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

export default function BudgetFormModal({
    show = false,
    onClose = () => {},
    budget = null,
}) {
    const isEdit = Boolean(budget);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        account_code: '',
        account_name: '',
        period_year: new Date().getFullYear(),
        total_budget: '',
        remaining_budget: '',
    });

    useEffect(() => {
        if (show) {
            clearErrors();
            if (budget) {
                setData({
                    account_code: budget.account_code || '',
                    account_name: budget.account_name || '',
                    period_year: budget.period_year || new Date().getFullYear(),
                    total_budget: budget.total_budget || '',
                    remaining_budget: budget.remaining_budget !== undefined ? budget.remaining_budget : budget.total_budget || '',
                });
            } else {
                reset();
                setData({
                    account_code: '',
                    account_name: '',
                    period_year: new Date().getFullYear(),
                    total_budget: '',
                    remaining_budget: '',
                });
            }
        }
    }, [show, budget]);

    const handleSubmit = (e) => {
        e.preventDefault();

        Swal.fire({
            title: isEdit ? 'Simpan Perubahan Pagu?' : 'Alokasikan Pagu Baru?',
            html: `
                <div class="text-left text-xs text-slate-600 space-y-1.5">
                    <p>Kode Rekening: <b class="font-mono text-slate-800">${data.account_code || '-'}</b></p>
                    <p>Nama Rekening: <b>${data.account_name || '-'}</b></p>
                    <p>Tahun Anggaran: <b class="text-emerald-700 font-bold">${data.period_year}</b></p>
                    <p>Total Pagu: <b class="text-emerald-700 font-bold">${formatRupiah(data.total_budget)}</b></p>
                </div>
            `,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#059669',
            cancelButtonColor: '#64748b',
            confirmButtonText: isEdit ? 'Ya, Simpan Perubahan' : 'Ya, Tambahkan Pagu',
            cancelButtonText: 'Batal',
        }).then((result) => {
            if (result.isConfirmed) {
                if (isEdit) {
                    put(route('budgets.update', budget.id), {
                        preserveScroll: true,
                        onSuccess: () => {
                            onClose();
                            Swal.fire({
                                icon: 'success',
                                title: 'Berhasil Diperbarui',
                                text: `Pagu anggaran "${data.account_name}" berhasil diperbarui.`,
                                timer: 2000,
                                showConfirmButton: false,
                            });
                        },
                    });
                } else {
                    post(route('budgets.store'), {
                        preserveScroll: true,
                        onSuccess: () => {
                            onClose();
                            Swal.fire({
                                icon: 'success',
                                title: 'Berhasil Ditambahkan',
                                text: `Pagu anggaran "${data.account_name}" berhasil dialokasikan.`,
                                timer: 2000,
                                showConfirmButton: false,
                            });
                        },
                    });
                }
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
                                💰
                            </div>
                            <div>
                                <h2 className="text-base sm:text-lg font-black tracking-tight">
                                    {isEdit ? 'Ubah Data Pagu Anggaran' : 'Tambah Pagu Anggaran Belanja Baru'}
                                </h2>
                                <p className="text-xs text-emerald-100/90 font-medium mt-0.5">
                                    Pengelolaan DPA / RBA Rekening Belanja Rumah Sakit Jiwa Tampan
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
                    <div className="grid gap-4 sm:grid-cols-2">
                        {/* Kode Rekening */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                Kode Rekening Belanja <span className="text-rose-600">*</span>
                            </label>
                            <input
                                type="text"
                                value={data.account_code}
                                onChange={(e) => setData('account_code', e.target.value)}
                                placeholder="contoh: 5.2.02.01.0001"
                                className="w-full rounded-xl border-2 border-slate-300 bg-white p-2.5 text-xs font-bold text-slate-900 font-mono shadow-2xs focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
                                required
                            />
                            <InputError message={errors.account_code} className="mt-1" />
                        </div>

                        {/* Tahun Anggaran */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                Tahun Anggaran (TA) <span className="text-rose-600">*</span>
                            </label>
                            <input
                                type="number"
                                min="2000"
                                max="2100"
                                value={data.period_year}
                                onChange={(e) => setData('period_year', e.target.value)}
                                placeholder="2026"
                                className="w-full rounded-xl border-2 border-slate-300 bg-white p-2.5 text-xs font-bold text-slate-900 shadow-2xs focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
                                required
                            />
                            <InputError message={errors.period_year} className="mt-1" />
                        </div>
                    </div>

                    {/* Nama Rekening */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                            Nama Rekening Belanja / Pos Anggaran <span className="text-rose-600">*</span>
                        </label>
                        <input
                            type="text"
                            value={data.account_name}
                            onChange={(e) => setData('account_name', e.target.value)}
                            placeholder="contoh: Belanja Alat Tulis Kantor (ATK)"
                            className="w-full rounded-xl border-2 border-slate-300 bg-white p-2.5 text-xs font-bold text-slate-900 shadow-2xs focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
                            required
                        />
                        <InputError message={errors.account_name} className="mt-1" />
                    </div>

                    {/* Total Budget & Remaining Budget Grid */}
                    <div className={`grid gap-4 ${isEdit ? 'sm:grid-cols-2' : 'grid-cols-1'}`}>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                Total Pagu Anggaran (Rp) <span className="text-rose-600">*</span>
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="1"
                                value={data.total_budget}
                                onChange={(e) => setData('total_budget', e.target.value)}
                                placeholder="contoh: 25000000"
                                className="w-full rounded-xl border-2 border-slate-300 bg-white p-2.5 text-xs font-bold text-slate-900 shadow-2xs focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
                                required
                            />
                            <div className="mt-1 flex items-center justify-between text-[11px]">
                                <span className="text-slate-500">Format Rupiah:</span>
                                <span className="font-bold text-emerald-700 font-mono">
                                    {formatRupiah(data.total_budget)}
                                </span>
                            </div>
                            <InputError message={errors.total_budget} className="mt-1" />
                        </div>

                        {isEdit && (
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                    Sisa Pagu Anggaran (Rp) <span className="text-rose-600">*</span>
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={data.remaining_budget}
                                    onChange={(e) => setData('remaining_budget', e.target.value)}
                                    placeholder="contoh: 18000000"
                                    className="w-full rounded-xl border-2 border-slate-300 bg-white p-2.5 text-xs font-bold text-slate-900 shadow-2xs focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
                                    required
                                />
                                <div className="mt-1 flex items-center justify-between text-[11px]">
                                    <span className="text-slate-500">Format Rupiah:</span>
                                    <span className="font-bold text-emerald-700 font-mono">
                                        {formatRupiah(data.remaining_budget)}
                                    </span>
                                </div>
                                <InputError message={errors.remaining_budget} className="mt-1" />
                            </div>
                        )}
                    </div>

                    {!isEdit && (
                        <p className="text-[11px] text-slate-500 bg-emerald-50/70 p-2.5 rounded-lg border border-emerald-200/80">
                            💡 <b>Info:</b> Sisa saldo pagu anggaran akan otomatis bernilai sama dengan total pagu saat rekening baru pertama kali dialokasikan.
                        </p>
                    )}

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
                            {processing ? 'Menyimpan...' : (isEdit ? 'Simpan Perubahan' : 'Alokasikan Pagu')}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
