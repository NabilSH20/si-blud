import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import KeuanganLayout from '@/Layouts/KeuanganLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Create({ sources = [], grouped_sources = null, default_date = '' }) {
    const initialSource = sources[0] || (grouped_sources ? Object.values(grouped_sources)[0]?.[0] : '') || '';
    const { data, setData, post, processing, errors } = useForm({
        source: initialSource,
        amount: '',
        date: default_date || new Date().toISOString().split('T')[0],
        description: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('revenues.store'));
    };

    return (
        <KeuanganLayout>
            <Head title="Catat Pendapatan BLUD - RSJ Tampan" />

            <div className="mx-auto max-w-3xl space-y-6">
                {/* Header Back & Info */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <Link
                            href={route('revenues.index')}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition mb-2"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                            </svg>
                            Kembali ke Daftar Penerimaan
                        </Link>
                        <h2 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
                            Pencatatan Pendapatan BLUD Baru
                        </h2>
                        <p className="mt-1 text-xs text-slate-500 font-medium">
                            Penerimaan kas masuk dari 23 unit layanan resmi berstandar RBA RSJ Tampan
                        </p>
                    </div>
                </div>

                {/* Form Card */}
                <div className="overflow-hidden rounded-2xl border-2 border-slate-300 bg-white shadow-md">
                    <div className="border-b-2 border-slate-200 bg-slate-100 px-6 py-4">
                        <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                            Formulir Bukti Penerimaan Kas
                        </h3>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-5">
                        {/* Sumber Layanan */}
                        <div>
                            <InputLabel htmlFor="source" value="Pos Rekening / Sumber Pendapatan *" />
                            <select
                                id="source"
                                value={data.source}
                                onChange={(e) => setData('source', e.target.value)}
                                className="mt-1 block w-full rounded-xl border-2 border-slate-300 bg-white p-2.5 text-sm font-bold text-slate-900 shadow-xs focus:border-emerald-600 focus:ring-emerald-600"
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
                            <p className="mt-1.5 text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
                                <svg className="w-3.5 h-3.5 text-emerald-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                                Pilihan pos penerimaan mengacu pada 23 rekening resmi Dokumen 2 RBA Pendapatan RSJ Tampan.
                            </p>
                            <InputError message={errors.source} className="mt-2" />
                        </div>

                        {/* Tanggal & Nominal Grid */}
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                            {/* Tanggal Penerimaan */}
                            <div>
                                <InputLabel htmlFor="date" value="Tanggal Penerimaan *" />
                                <TextInput
                                    id="date"
                                    type="date"
                                    value={data.date}
                                    onChange={(e) => setData('date', e.target.value)}
                                    className="mt-1 block w-full border-2 border-slate-300 rounded-xl"
                                    required
                                />
                                <InputError message={errors.date} className="mt-2" />
                            </div>

                            {/* Nominal Rupiah */}
                            <div>
                                <InputLabel htmlFor="amount" value="Nominal Pendapatan (Rp) *" />
                                <div className="relative mt-1">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-xs font-bold text-slate-500">
                                        Rp
                                    </span>
                                    <TextInput
                                        id="amount"
                                        type="number"
                                        min="1"
                                        step="any"
                                        placeholder="0"
                                        value={data.amount}
                                        onChange={(e) => setData('amount', e.target.value)}
                                        className="block w-full pl-10 border-2 border-slate-300 rounded-xl font-bold"
                                        required
                                    />
                                </div>
                                <InputError message={errors.amount} className="mt-2" />
                            </div>
                        </div>

                        {/* Keterangan / Uraian */}
                        <div>
                            <InputLabel htmlFor="description" value="Uraian / Keterangan Tambahan" />
                            <textarea
                                id="description"
                                rows={3}
                                placeholder="Contoh: Penerimaan tarif retribusi rawat inap dan tindakan medis periode pekan pertama"
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                className="mt-1 block w-full rounded-xl border-2 border-slate-300 bg-white p-3 text-sm text-slate-800 shadow-xs focus:border-emerald-600 focus:ring-emerald-600"
                            />
                            <InputError message={errors.description} className="mt-2" />
                        </div>

                        {/* Submit Buttons */}
                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                            <Link
                                href={route('revenues.index')}
                                className="rounded-xl border-2 border-slate-300 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
                            >
                                Batal
                            </Link>
                            <PrimaryButton
                                disabled={processing}
                                className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-xs font-black uppercase tracking-wider py-2.5 px-6 rounded-xl"
                            >
                                Simpan Pendapatan
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </div>
        </KeuanganLayout>
    );
}

