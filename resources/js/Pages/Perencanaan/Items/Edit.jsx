import InputError from '@/Components/InputError';
import PerencanaanLayout from '@/Layouts/PerencanaanLayout';
import { Head, Link, useForm } from '@inertiajs/react';

const unitOptions = ['Unit', 'Rim', 'Box', 'Pcs', 'Pak', 'Set', 'Botol', 'Roll'];

export default function Edit({ item }) {
    const { data, setData, put, processing, errors } = useForm({
        item_code: item.item_code || '',
        name: item.name || '',
        specification: item.specification || '',
        unit_type: item.unit_type || 'Unit',
        standard_price: item.standard_price || '',
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('items.update', item.id));
    };

    return (
        <PerencanaanLayout>
            <Head title={`Edit Barang ${item.name} - E-Req RSJ Tampan`} />

            <div className="mx-auto max-w-3xl space-y-6">
                {/* Back Link & Header */}
                <div>
                    <Link
                        href={route('items.index')}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition mb-2"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                        </svg>
                        Kembali ke Katalog Barang
                    </Link>
                    <h2 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
                        Edit Barang: {item.name}
                    </h2>
                    <p className="mt-1 text-xs sm:text-sm text-slate-600 font-medium">
                        Perbarui informasi kode, spesifikasi, satuan, atau harga acuan standar barang ini.
                    </p>
                </div>

                {/* Form Card */}
                <div className="overflow-hidden rounded-2xl border-2 border-slate-300 bg-white shadow-md">
                    <div className="border-b-2 border-slate-200 bg-slate-100 px-6 py-4">
                        <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                            Perubahan Data Barang
                        </h3>
                    </div>

                    <form onSubmit={submit} className="p-6 sm:p-8 space-y-5">
                        <div className="grid gap-5 sm:grid-cols-2">
                            <div>
                                <label
                                    htmlFor="item_code"
                                    className="mb-1.5 block text-xs font-black uppercase tracking-wider text-slate-700"
                                >
                                    Kode Barang <span className="text-rose-600">*</span>
                                </label>
                                <input
                                    id="item_code"
                                    type="text"
                                    value={data.item_code}
                                    onChange={(e) =>
                                        setData('item_code', e.target.value.toUpperCase())
                                    }
                                    className="block w-full rounded-xl border-2 border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-900 uppercase shadow-2xs transition-all duration-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/30"
                                />
                                <InputError message={errors.item_code} className="mt-1.5 font-bold text-rose-600" />
                            </div>

                            <div>
                                <label
                                    htmlFor="unit_type"
                                    className="mb-1.5 block text-xs font-black uppercase tracking-wider text-slate-700"
                                >
                                    Satuan Ukur <span className="text-rose-600">*</span>
                                </label>
                                <select
                                    id="unit_type"
                                    value={data.unit_type}
                                    onChange={(e) =>
                                        setData('unit_type', e.target.value)
                                    }
                                    className="block w-full rounded-xl border-2 border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-900 shadow-2xs transition-all duration-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/30"
                                >
                                    {unitOptions.map((unit) => (
                                        <option key={unit} value={unit}>
                                            {unit}
                                        </option>
                                    ))}
                                </select>
                                <InputError message={errors.unit_type} className="mt-1.5 font-bold text-rose-600" />
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="name"
                                className="mb-1.5 block text-xs font-black uppercase tracking-wider text-slate-700"
                            >
                                Nama Barang <span className="text-rose-600">*</span>
                            </label>
                            <input
                                id="name"
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="block w-full rounded-xl border-2 border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-2xs transition-all duration-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/30"
                            />
                            <InputError message={errors.name} className="mt-1.5 font-bold text-rose-600" />
                        </div>

                        <div>
                            <label
                                htmlFor="specification"
                                className="mb-1.5 block text-xs font-black uppercase tracking-wider text-slate-700"
                            >
                                Spesifikasi Teknis / Keterangan
                            </label>
                            <textarea
                                id="specification"
                                rows={3}
                                value={data.specification}
                                onChange={(e) =>
                                    setData('specification', e.target.value)
                                }
                                className="block w-full rounded-xl border-2 border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 shadow-2xs transition-all duration-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/30"
                            />
                            <InputError message={errors.specification} className="mt-1.5 font-bold text-rose-600" />
                        </div>

                        <div>
                            <label
                                htmlFor="standard_price"
                                className="mb-1.5 block text-xs font-black uppercase tracking-wider text-slate-700"
                            >
                                Harga Standar Acuan <span className="text-rose-600">*</span>
                            </label>
                            <div className="relative rounded-xl shadow-2xs">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-xs font-black text-slate-500">
                                    Rp
                                </div>
                                <input
                                    id="standard_price"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={data.standard_price}
                                    onChange={(e) =>
                                        setData('standard_price', e.target.value)
                                    }
                                    className="block w-full rounded-xl border-2 border-slate-300 bg-white pl-12 pr-4 py-2.5 text-sm font-bold text-slate-900 transition-all duration-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/30"
                                />
                            </div>
                            <p className="mt-1.5 text-xs text-slate-500 font-medium">Harga standar perkiraan sendiri per satu satuan unit.</p>
                            <InputError message={errors.standard_price} className="mt-1.5 font-bold text-rose-600" />
                        </div>

                        <div className="flex items-center justify-end gap-3 border-t-2 border-slate-200 pt-6">
                            <Link
                                href={route('items.index')}
                                className="rounded-xl border-2 border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 shadow-2xs transition hover:bg-slate-100 active:scale-95"
                            >
                                Batal
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 px-6 py-2.5 text-sm font-black text-white shadow-md hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50"
                            >
                                {processing ? (
                                    <>
                                        <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Menyimpan...
                                    </>
                                ) : (
                                    'Simpan Perubahan'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </PerencanaanLayout>
    );
}
