import InputError from '@/Components/InputError';
import Modal from '@/Components/Modal';
import { useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

const commonUnits = [
    'Unit',
    'Rim',
    'Box',
    'Pcs',
    'Pak',
    'Set',
    'Botol',
    'Roll',
    'Lembar',
    'Meter',
    'Kg',
    'Liter',
    'Lainnya',
];

const formatRupiah = (value) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(Number(value || 0));

export default function ItemFormModal({
    show = false,
    onClose = () => {},
    item = null,
    rbaAccounts = [],
    nextItemCode = '',
}) {
    const isEdit = Boolean(item && item.id);
    const [isCustomUnit, setIsCustomUnit] = useState(false);
    const [customUnitValue, setCustomUnitValue] = useState('');

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        rba_account_id: '',
        item_code: '',
        name: '',
        unit_type: 'Unit',
        standard_price: '',
        specification: '',
    });

    useEffect(() => {
        if (!show) {
            clearErrors();
            return;
        }

        if (item) {
            const hasPredefinedUnit = commonUnits
                .filter((u) => u !== 'Lainnya')
                .includes(item.unit_type);

            if (hasPredefinedUnit) {
                setIsCustomUnit(false);
                setCustomUnitValue('');
            } else {
                setIsCustomUnit(true);
                setCustomUnitValue(item.unit_type || '');
            }

            setData({
                rba_account_id: item.rba_account_id || '',
                item_code: item.item_code || '',
                name: item.name || '',
                unit_type: hasPredefinedUnit ? item.unit_type : 'Lainnya',
                standard_price: item.standard_price || '',
                specification: item.specification || '',
            });
        } else {
            setIsCustomUnit(false);
            setCustomUnitValue('');
            setData({
                rba_account_id: rbaAccounts[0]?.id ? String(rbaAccounts[0].id) : '',
                item_code: nextItemCode || '',
                name: '',
                unit_type: 'Unit',
                standard_price: '',
                specification: '',
            });
        }
        clearErrors();
    }, [show, item, nextItemCode, rbaAccounts]);

    const handleUnitTypeChange = (value) => {
        if (value === 'Lainnya') {
            setIsCustomUnit(true);
            setData('unit_type', customUnitValue || '');
        } else {
            setIsCustomUnit(false);
            setData('unit_type', value);
        }
    };

    const handleCustomUnitChange = (value) => {
        setCustomUnitValue(value);
        setData('unit_type', value);
    };

    // Frictionless submission with top-end toast notification
    const handleSubmit = (e) => {
        e.preventDefault();

        if (isEdit) {
            put(route('items.update', item.id), {
                preserveScroll: true,
                onSuccess: () => {
                    Swal.fire({
                        toast: true,
                        position: 'top-end',
                        icon: 'success',
                        title: 'Data barang berhasil diperbarui',
                        showConfirmButton: false,
                        timer: 2500,
                        timerProgressBar: true,
                    });
                    onClose();
                },
            });
        } else {
            post(route('items.store'), {
                preserveScroll: true,
                onSuccess: () => {
                    Swal.fire({
                        toast: true,
                        position: 'top-end',
                        icon: 'success',
                        title: 'Barang baru berhasil ditambahkan ke katalog',
                        showConfirmButton: false,
                        timer: 2500,
                        timerProgressBar: true,
                    });
                    reset();
                    onClose();
                },
            });
        }
    };

    return (
        <Modal show={show} onClose={onClose} maxWidth="xl">
            <div className="flex flex-col bg-white rounded-2xl overflow-hidden shadow-xl max-h-[90vh]">
                {/* 1. Header Minimalis Putih (Standar Sistem) */}
                <div className="shrink-0 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4">
                    <div>
                        <div className="flex items-center gap-2.5">
                            <h2 className="text-base sm:text-lg font-bold text-slate-900">
                                {isEdit ? 'Ubah Data Barang' : 'Tambah Barang Katalog'}
                            </h2>
                            <span className="inline-block text-[11px] font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                                {isEdit ? 'Mode Edit' : 'Master Standar'}
                            </span>
                        </div>
                        <p className="mt-0.5 text-xs text-slate-500">
                            Lengkapi spesifikasi, satuan ukur, dan harga acuan standar pengadaan RSJ Tampan
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer"
                        title="Tutup dialog"
                    >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* 2. Form Body (Scrollable) */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
                    {/* Banner Asal Usul Barang jika dari usulan unit */}
                    {isEdit && item?.source === 'USULAN_UNIT' && (
                        <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-3.5 text-xs text-blue-900 flex items-start gap-2.5">
                            <span className="text-base shrink-0">📋</span>
                            <div className="space-y-0.5">
                                <p className="font-bold text-blue-950">
                                    Barang ini berasal dari Usulan Unit Kerja
                                </p>
                                <p className="text-blue-800 text-[11px] leading-relaxed">
                                    Diusulkan pertama kali oleh: <strong className="font-bold text-slate-900">{item.origin_unit?.name || 'Unit Kerja'}</strong>. Anda dapat mengesahkannya menjadi Standar Baku RS melalui tombol "Sahkan" di tabel katalog.
                                </p>
                            </div>
                        </div>
                    )}

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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <div className="flex items-center justify-between">
                                <label
                                    htmlFor="item_code"
                                    className="block text-xs font-semibold text-slate-700"
                                >
                                    Kode Barang <span className="text-rose-500">*</span>
                                </label>
                                {!isEdit && (
                                    <span className="text-[10px] font-semibold text-teal-700 bg-teal-50 px-1.5 py-0.2 rounded border border-teal-200">
                                        Auto
                                    </span>
                                )}
                            </div>
                            <input
                                id="item_code"
                                type="text"
                                value={data.item_code}
                                onChange={(e) => setData('item_code', e.target.value.toUpperCase())}
                                placeholder="ITM-0001"
                                className="block w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs sm:text-sm font-mono font-bold text-slate-900 uppercase shadow-2xs transition focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                            />
                            <InputError message={errors.item_code} className="mt-1" />
                        </div>

                        <div className="space-y-1">
                            <label
                                htmlFor="unit_type_select"
                                className="block text-xs font-semibold text-slate-700"
                            >
                                Satuan Ukur <span className="text-rose-500">*</span>
                            </label>
                            <select
                                id="unit_type_select"
                                value={isCustomUnit ? 'Lainnya' : data.unit_type}
                                onChange={(e) => handleUnitTypeChange(e.target.value)}
                                className="block w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs sm:text-sm font-medium text-slate-900 shadow-2xs transition focus:border-teal-600 focus:ring-1 focus:ring-teal-600 cursor-pointer"
                            >
                                {commonUnits.map((u) => (
                                    <option key={u} value={u}>
                                        {u}
                                    </option>
                                ))}
                            </select>

                            {isCustomUnit && (
                                <input
                                    type="text"
                                    value={customUnitValue}
                                    onChange={(e) => handleCustomUnitChange(e.target.value)}
                                    placeholder="Ketik satuan baru (cth: Dus, Galon, Pasang)..."
                                    className="mt-1.5 block w-full rounded-xl border border-teal-300 bg-teal-50/40 px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                                />
                            )}
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

                    {/* Harga Standar Acuan (HPS) */}
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
                        <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                            <span>Harga standar per {data.unit_type || 'unit'}</span>
                            {Number(data.standard_price) > 0 && (
                                <span className="font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                                    {formatRupiah(data.standard_price)}
                                </span>
                            )}
                        </div>
                        <InputError message={errors.standard_price} className="mt-1" />
                    </div>

                    {/* Spesifikasi Teknis / Keterangan */}
                    <div className="space-y-1">
                        <label
                            htmlFor="specification"
                            className="block text-xs font-semibold text-slate-700"
                        >
                            Spesifikasi Teknis / Catatan <span className="text-slate-400 font-normal">(Opsional)</span>
                        </label>
                        <textarea
                            id="specification"
                            rows={2}
                            value={data.specification}
                            onChange={(e) => setData('specification', e.target.value)}
                            placeholder="Rincian merek, ukuran, tipe kemasan, atau catatan spesifikasi teknis pengadaan..."
                            className="block w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 shadow-2xs transition focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                        />
                        <InputError message={errors.specification} className="mt-1" />
                    </div>

                    {/* Modal Footer Actions */}
                    <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={processing}
                            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer disabled:opacity-50"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-95 text-white px-5 py-2 text-xs font-bold shadow-xs transition cursor-pointer disabled:opacity-50"
                        >
                            {processing ? (
                                <>
                                    <svg className="h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" strokeWidth="4" stroke="currentColor" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    <span>Menyimpan...</span>
                                </>
                            ) : (
                                <>
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                    </svg>
                                    <span>{isEdit ? 'Simpan Perubahan' : 'Simpan Barang'}</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
