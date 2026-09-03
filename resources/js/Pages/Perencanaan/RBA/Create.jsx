import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import PerencanaanLayout from '@/Layouts/PerencanaanLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Create({ default_year = 2026 }) {
    const { data, setData, post, processing, errors } = useForm({
        year: default_year,
        target_revenue: '',
        planned_expense: '',
        notes: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('perencanaan.rba.store'));
    };

    const targetRev = Number(data.target_revenue || 0);
    const planExp = Number(data.planned_expense || 0);
    const projectedSurplus = targetRev - planExp;

    const formatRupiah = (value) =>
        new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(Number(value || 0));

    return (
        <PerencanaanLayout>
            <Head title="Susun RBA Baru - E-BLUD RSJ Tampan" />

            <div className="mx-auto max-w-3xl space-y-6">
                {/* Header Back & Info */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <Link
                            href={route('perencanaan.rba.index')}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition mb-2"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                            </svg>
                            Kembali ke Daftar RBA
                        </Link>
                        <h2 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
                            Penyusunan Rencana Bisnis dan Anggaran (RBA)
                        </h2>
                        <p className="mt-1 text-xs text-slate-500 font-medium">
                            Tetapkan target pendapatan operasional dan batas plafon belanja tahun anggaran
                        </p>
                    </div>
                </div>

                {/* Form Card */}
                <div className="overflow-hidden rounded-2xl border-2 border-slate-300 bg-white shadow-md">
                    <div className="border-b-2 border-slate-200 bg-slate-100 px-6 py-4">
                        <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                            Parameter RBA Tahunan
                        </h3>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-5">
                        {/* Tahun Anggaran */}
                        <div>
                            <InputLabel htmlFor="year" value="Tahun Anggaran *" />
                            <TextInput
                                id="year"
                                type="number"
                                min="2020"
                                max="2099"
                                value={data.year}
                                onChange={(e) => setData('year', e.target.value)}
                                className="mt-1 block w-full border-2 border-slate-300 rounded-xl font-bold"
                                required
                            />
                            <InputError message={errors.year} className="mt-2" />
                        </div>

                        {/* Target Pendapatan & Rencana Belanja Grid */}
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                            {/* Target Pendapatan */}
                            <div>
                                <InputLabel htmlFor="target_revenue" value="Target Pendapatan (Rp) *" />
                                <div className="relative mt-1">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-xs font-bold text-slate-500">
                                        Rp
                                    </span>
                                    <TextInput
                                        id="target_revenue"
                                        type="number"
                                        min="0"
                                        step="any"
                                        placeholder="0"
                                        value={data.target_revenue}
                                        onChange={(e) => setData('target_revenue', e.target.value)}
                                        className="block w-full pl-10 border-2 border-slate-300 rounded-xl font-bold text-emerald-700"
                                        required
                                    />
                                </div>
                                <InputError message={errors.target_revenue} className="mt-2" />
                            </div>

                            {/* Rencana Belanja */}
                            <div>
                                <InputLabel htmlFor="planned_expense" value="Rencana Belanja (Rp) *" />
                                <div className="relative mt-1">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-xs font-bold text-slate-500">
                                        Rp
                                    </span>
                                    <TextInput
                                        id="planned_expense"
                                        type="number"
                                        min="0"
                                        step="any"
                                        placeholder="0"
                                        value={data.planned_expense}
                                        onChange={(e) => setData('planned_expense', e.target.value)}
                                        className="block w-full pl-10 border-2 border-slate-300 rounded-xl font-bold text-amber-700"
                                        required
                                    />
                                </div>
                                <InputError message={errors.planned_expense} className="mt-2" />
                            </div>
                        </div>

                        {/* Live Calculation Preview */}
                        {(targetRev > 0 || planExp > 0) && (
                            <div className={`p-4 rounded-xl border-2 ${
                                projectedSurplus >= 0 ? 'bg-emerald-50 border-emerald-300' : 'bg-rose-50 border-rose-300'
                            } flex items-center justify-between`}>
                                <div>
                                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-600 block">
                                        Proyeksi Saldo Bersih RBA
                                    </span>
                                    <span className="text-xs font-medium text-slate-600">
                                        {projectedSurplus >= 0 ? 'Surplus Operasional Terencana' : 'Defisit Anggaran Terencana'}
                                    </span>
                                </div>
                                <span className={`text-base sm:text-lg font-black ${
                                    projectedSurplus >= 0 ? 'text-emerald-800' : 'text-rose-800'
                                }`}>
                                    {formatRupiah(projectedSurplus)}
                                </span>
                            </div>
                        )}

                        {/* Catatan / Keterangan */}
                        <div>
                            <InputLabel htmlFor="notes" value="Catatan & Landasan Penyusunan" />
                            <textarea
                                id="notes"
                                rows={3}
                                placeholder="Contoh: RBA disusun berdasarkan hasil evaluasi SPM BLUD dan proyeksi kenaikan kunjungan pasien rawat jalan 15%."
                                value={data.notes}
                                onChange={(e) => setData('notes', e.target.value)}
                                className="mt-1 block w-full rounded-xl border-2 border-slate-300 bg-white p-3 text-sm text-slate-800 shadow-xs focus:border-emerald-600 focus:ring-emerald-600"
                            />
                            <InputError message={errors.notes} className="mt-2" />
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                            <Link
                                href={route('perencanaan.rba.index')}
                                className="rounded-xl border-2 border-slate-300 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
                            >
                                Batal
                            </Link>
                            <PrimaryButton
                                disabled={processing}
                                className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-xs font-black uppercase tracking-wider py-2.5 px-6 rounded-xl"
                            >
                                Simpan Draft RBA
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </div>
        </PerencanaanLayout>
    );
}

