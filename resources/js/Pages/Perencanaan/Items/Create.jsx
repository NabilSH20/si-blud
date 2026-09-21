import InputError from '@/Components/InputError';
import PerencanaanLayout from '@/Layouts/PerencanaanLayout';
import { Head, Link, useForm } from '@inertiajs/react';

const unitOptions = ['Unit', 'Rim', 'Box', 'Pcs', 'Pak', 'Set', 'Botol', 'Roll', 'Lembar', 'Meter', 'Kg', 'Liter'];

const formatRupiah = (value) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(Number(value || 0));

export default function Create({ rbaAccounts = [], nextItemCode = '' }) {
    const { data, setData, post, processing, errors } = useForm({
        rba_account_id: rbaAccounts[0]?.id ? String(rbaAccounts[0].id) : '',
        item_code: nextItemCode || '',
        name: '',
        specification: '',
        unit_type: 'Unit',
        standard_price: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('items.store'));
    };

    return (
        <PerencanaanLayout>
            <Head title="Tambah Barang Katalog - E-BLUD RSJ Tampan" />

            <div className="mx-auto max-w-3xl space-y-6">
                {/* Back Link & Header */}
                <div>
                    <Link
                        href={route('items.index')}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 hover:text-teal-800 transition mb-2"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                        </svg>
                        <span>Kembali ke Katalog Barang</span>
                    </Link>
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                        Tambah Barang Katalog Baru
                    </h1>
                    <p className="mt-1 text-xs sm:text-sm text-slate-500">
                        Lengkapi spesifikasi, satuan ukur, dan harga acuan standar pengadaan RSJ Tampan
                    </p>
                </div>

                {/* Form Card */}
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
                    <div className="border-b border-slate-100 bg-white px-6 py-4">
                        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                            Formulir Barang Master Standar
                        </h2>
                    </div>

                    <form onSubmit={submit} className="p-6 sm:p-8 space-y-4">
                        {/* Pos Rekening Belanja RBA BLUD */}
                        <div className="space-y-1">
                            <label
                                htmlFor="rba_account_id"
                                className="block text-xs font-semibold text-slate-700"
                            >
                                Pos Rekening Belanja RBA <span className="text-rose-500">*</span>
                            </label>
                            <select
                                id="rba_account_id"
                                value={data.rba_account_id}
                                onChange={(e) => setData('rba_account_id', e.target.value)}
                                className="block w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs sm:text-sm font-medium text-slate-900 shadow-2xs transition focus:border-teal-600 focus:ring-1 focus:ring-teal-600 cursor-pointer"
                            >
                                <option value="" disabled>-- Pilih Pos Rekening Belanja RBA --</option>
                                {rbaAccounts.map((account) => (
                                    <option key={account.id} value={account.id}>
                                        [{account.account_code}] {account.account_name}
                                    </option>
                                ))}
                            </select>
                            <InputError message={errors.rba_account_id} className="mt-1" />
                        </div>

                        {/* Grid Kode Barang & Satuan Ukur */}
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-1">
                                <label
                                    htmlFor="item_code"
                                    className="block text-xs font-semibold text-slate-700"
                                >
                                    Kode Barang <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    id="item_code"
                                    type="text"
                                    value={data.item_code}
                                    onChange={(e) =>
                                        setData('item_code', e.target.value.toUpperCase())
                                    }
                                    placeholder="ITM-0001"
                                    className="block w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs sm:text-sm font-mono font-bold text-slate-900 uppercase shadow-2xs transition focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                                />
                                <InputError message={errors.item_code} className="mt-1" />
                            </div>

                            <div className="space-y-1">
                                <label
                                    htmlFor="unit_type"
                                    className="block text-xs font-semibold text-slate-700"
                                >
                                    Satuan Ukur <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    id="unit_type"
                                    value={data.unit_type}
                                    onChange={(e) =>
                                        setData('unit_type', e.target.value)
                                    }
                                    className="block w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs sm:text-sm font-medium text-slate-900 shadow-2xs transition focus:border-teal-600 focus:ring-1 focus:ring-teal-600 cursor-pointer"
                                >
                                    {unitOptions.map((unit) => (
                                        <option key={unit} value={unit}>
                                            {unit}
                                        </option>
                                    ))}
                                </select>
                                <InputError message={errors.unit_type} className="mt-1" />
                            </div>
                        </div>

                        {/* Nama Barang */}
                        <div className="space-y-1">
                            <label
                                htmlFor="name"
                                className="block text-xs font-semibold text-slate-700"
                            >
                                Nama Barang <span className="text-rose-500">*</span>
                            </label>
                            <input
                                id="name"
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="Contoh: Kertas HVS Folio / F4 75gr PaperOne"
                                className="block w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 shadow-2xs transition focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                            />
                            <InputError message={errors.name} className="mt-1" />
                        </div>

                        {/* Harga Standar Acuan */}
                        <div className="space-y-1">
                            <label
                                htmlFor="standard_price"
                                className="block text-xs font-semibold text-slate-700"
                            >
                                Harga Acuan Standar (HPS) <span className="text-rose-500">*</span>
                            </label>
                            <div className="relative rounded-xl shadow-2xs">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-xs font-bold text-slate-400">
                                    Rp
                                </div>
                                <input
                                    id="standard_price"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={data.standard_price}
                                    onChange={(e) => setData('standard_price', e.target.value)}
                                    placeholder="45000"
                                    className="block w-full rounded-xl border border-slate-300 bg-white pl-10 pr-3 py-2 text-xs sm:text-sm font-mono font-bold text-slate-900 placeholder:text-slate-400 transition focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                                />
                            </div>
                            {Number(data.standard_price) > 0 && (
                                <p className="mt-1 text-xs text-teal-800 font-bold">
                                    {formatRupiah(data.standard_price)}
                                </p>
                            )}
                            <InputError message={errors.standard_price} className="mt-1" />
                        </div>

                        {/* Spesifikasi */}
                        <div className="space-y-1">
                            <label
                                htmlFor="specification"
                                className="block text-xs font-semibold text-slate-700"
                            >
                                Spesifikasi Teknis / Keterangan <span className="text-slate-400 font-normal">(Opsional)</span>
                            </label>
                            <textarea
                                id="specification"
                                rows={3}
                                value={data.specification}
                                onChange={(e) => setData('specification', e.target.value)}
                                placeholder="Rincian merek, ukuran, tipe kemasan, atau catatan spesifikasi teknis..."
                                className="block w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 shadow-2xs transition focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                            />
                            <InputError message={errors.specification} className="mt-1" />
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                            <Link
                                href={route('items.index')}
                                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                            >
                                Batal
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-95 text-white px-5 py-2 text-xs font-bold shadow-xs transition disabled:opacity-50 cursor-pointer"
                            >
                                {processing ? 'Menyimpan...' : 'Simpan Barang'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </PerencanaanLayout>
    );
}
