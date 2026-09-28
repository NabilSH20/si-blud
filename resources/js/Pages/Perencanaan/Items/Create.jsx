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

            
            <div className="mx-auto max-w-5xl space-y-8 pb-12">
                {/* Back Link & Header */}
                <div>
                    <Link
                        href={route('items.index')}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 hover:text-teal-800 transition mb-3"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                        </svg>
                        <span>Kembali ke Katalog Barang</span>
                    </Link>
                    <div className="flex items-center gap-2.5">
                        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                            Tambah Barang Katalog Baru
                        </h1>
                        
                    </div>
                    <p className="mt-1 text-xs sm:text-sm text-slate-500">
                        Lengkapi spesifikasi, satuan ukur, dan harga acuan standar pengadaan RSJ Tampan.
                    </p>
                </div>

                <form onSubmit={submit} className="space-y-8">
                    {/* Split Card 1: Pembebanan & Kategori */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                        <div className="md:col-span-1">
                            <h2 className="text-sm font-bold text-slate-900">Pembebanan & Kategori</h2>
                            <p className="mt-1 text-xs text-slate-500">
                                Pilih pos rekening belanja RBA sebagai sumber pembebanan anggaran, serta tentukan satuan ukur yang berlaku untuk barang ini.
                            </p>
                        </div>
                        <div className="md:col-span-2 rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs space-y-5">
                            {/* Pos Rekening */}
                            <div className="space-y-1.5">
                                <label htmlFor="rba_account_id" className="block text-xs font-bold text-slate-700">
                                    Pos Rekening Belanja RBA <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    id="rba_account_id"
                                    value={data.rba_account_id}
                                    onChange={(e) => setData('rba_account_id', e.target.value)}
                                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-800 shadow-sm transition focus:border-teal-500 focus:ring-1 focus:ring-teal-500 cursor-pointer"
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

                            {/* Satuan Ukur */}
                            <div className="space-y-1.5">
                                <label htmlFor="unit_type" className="block text-xs font-bold text-slate-700">
                                    Satuan Ukur <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    id="unit_type"
                                    value={data.unit_type}
                                    onChange={(e) => setData('unit_type', e.target.value)}
                                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-800 shadow-sm transition focus:border-teal-500 focus:ring-1 focus:ring-teal-500 cursor-pointer"
                                >
                                    {unitOptions.map((unit) => (
                                        <option key={unit} value={unit}>{unit}</option>
                                    ))}
                                </select>
                                <InputError message={errors.unit_type} className="mt-1" />
                            </div>
                        </div>
                    </div>

                    {/* Split Card 2: Rincian Barang */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                        <div className="md:col-span-1">
                            <h2 className="text-sm font-bold text-slate-900">Spesifikasi Barang</h2>
                            <p className="mt-1 text-xs text-slate-500">
                                Tentukan kode barang, nama, harga acuan standar (SSH), dan rincian teknis barang.
                            </p>
                        </div>
                        <div className="md:col-span-2 rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs space-y-5">
                            {/* Kode Barang */}
                            <div className="space-y-1.5">
                                <label htmlFor="item_code" className="block text-xs font-bold text-slate-700">
                                    Kode Barang <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    id="item_code"
                                    type="text"
                                    value={data.item_code}
                                    onChange={(e) => setData('item_code', e.target.value.toUpperCase())}
                                    placeholder="ITM-0001"
                                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-mono font-bold text-slate-800 uppercase shadow-sm transition focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                                />
                                <InputError message={errors.item_code} className="mt-1" />
                            </div>

                            {/* Nama Barang */}
                            <div className="space-y-1.5">
                                <label htmlFor="name" className="block text-xs font-bold text-slate-700">
                                    Nama Barang <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    id="name"
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Contoh: Kertas HVS Folio / F4 75gr PaperOne"
                                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-medium text-slate-800 placeholder:text-slate-400 shadow-sm transition focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                                />
                                <InputError message={errors.name} className="mt-1" />
                            </div>

                            {/* Harga Standar Acuan */}
                            <div className="space-y-1.5">
                                <label htmlFor="standard_price" className="block text-xs font-bold text-slate-700">
                                    Harga Acuan Standar (HPS) <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative rounded-xl shadow-sm">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-xs font-bold text-slate-400">
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
                                        className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 py-2 text-xs font-mono font-bold text-slate-800 placeholder:text-slate-400 transition focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                                    />
                                </div>
                                {Number(data.standard_price) > 0 && (
                                    <p className="mt-1.5 text-xs text-teal-800 font-bold">
                                        {formatRupiah(data.standard_price)}
                                    </p>
                                )}
                                <InputError message={errors.standard_price} className="mt-1" />
                            </div>

                            {/* Spesifikasi */}
                            <div className="space-y-1.5">
                                <label htmlFor="specification" className="block text-xs font-bold text-slate-700">
                                    Spesifikasi Teknis / Keterangan <span className="text-slate-400 font-normal">(Opsional)</span>
                                </label>
                                <textarea
                                    id="specification"
                                    rows={4}
                                    value={data.specification}
                                    onChange={(e) => setData('specification', e.target.value)}
                                    placeholder="Rincian merek, ukuran, tipe kemasan, atau catatan spesifikasi teknis..."
                                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-xs font-medium text-slate-800 placeholder:text-slate-400 shadow-sm transition focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                                />
                                <InputError message={errors.specification} className="mt-1" />
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-6">
                        <Link
                            href={route('items.index')}
                            className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                        >
                            Batal
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-95 px-6 py-2.5 text-xs font-bold text-white shadow-2xs transition cursor-pointer disabled:opacity-50 whitespace-nowrap"
                        >
                            {processing ? 'Menyimpan...' : (isEdit ? 'Simpan Perubahan' : 'Simpan Barang')}
                        </button>
                    </div>
                </form>
            </div>
        </PerencanaanLayout>
    );
}
