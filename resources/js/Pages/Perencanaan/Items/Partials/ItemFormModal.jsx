import Modal from '@/Components/Modal';
import InputError from '@/Components/InputError';
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

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!data.rba_account_id) {
            Swal.fire({
                icon: 'warning',
                title: 'Pos Rekening Belum Dipilih',
                text: 'Harap pilih Pos Rekening Belanja RBA BLUD untuk barang ini.',
                confirmButtonColor: '#059669',
            });
            return;
        }

        if (!data.name.trim() || !data.unit_type.trim() || !data.standard_price) {
            Swal.fire({
                icon: 'warning',
                title: 'Data Belum Lengkap',
                text: 'Harap lengkapi nama barang, satuan ukur, dan harga acuan standar.',
                confirmButtonColor: '#059669',
            });
            return;
        }

        const selectedRba = rbaAccounts.find((r) => String(r.id) === String(data.rba_account_id));
        const titleText = isEdit ? 'Simpan Perubahan Barang?' : 'Tambahkan Barang ke Katalog?';
        const confirmBtnText = isEdit ? 'Ya, Simpan Perubahan' : 'Ya, Tambahkan Barang';

        Swal.fire({
            title: titleText,
            html: `
                <div class="text-left text-xs sm:text-sm space-y-2 mt-2">
                    <p><strong>Kode Barang:</strong> <span class="font-mono font-bold text-emerald-700">${data.item_code || nextItemCode}</span></p>
                    <p><strong>Nama Barang:</strong> ${data.name}</p>
                    <p><strong>Pos Rekening:</strong> ${selectedRba ? `[${selectedRba.account_code}] ${selectedRba.account_name}` : '-'}</p>
                    <p><strong>Satuan:</strong> ${data.unit_type}</p>
                    <p><strong>Harga Acuan:</strong> <span class="font-bold text-emerald-800">${formatRupiah(data.standard_price)}</span></p>
                </div>
            `,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#059669',
            cancelButtonColor: '#64748b',
            confirmButtonText: confirmBtnText,
            cancelButtonText: 'Batal',
            reverseButtons: true,
        }).then((result) => {
            if (result.isConfirmed) {
                if (isEdit) {
                    put(route('items.update', item.id), {
                        preserveScroll: true,
                        onSuccess: () => onClose(),
                    });
                } else {
                    post(route('items.store'), {
                        preserveScroll: true,
                        onSuccess: () => {
                            reset();
                            onClose();
                        },
                    });
                }
            }
        });
    };

    return (
        <Modal show={show} onClose={onClose} maxWidth="2xl">
            <div className="flex flex-col max-h-[90vh]">
                {/* Header Modal */}
                <div className="relative border-b border-emerald-100 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 px-6 py-4 text-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur-xs border border-white/20 text-white shadow-xs">
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                                    {isEdit ? 'Ubah Data Barang Katalog' : 'Tambah Barang Katalog Baru'}
                                    <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                                        {isEdit ? 'Mode Edit' : 'Mode Tambah'}
                                    </span>
                                </h3>
                                <p className="text-xs text-emerald-100 font-medium mt-0.5">
                                    {isEdit
                                        ? 'Perbarui rincian spesifikasi, harga acuan, atau pos rekening barang.'
                                        : 'Lengkapi spesifikasi teknis dan pos rekening belanja acuan pengadaan.'}
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl p-1.5 text-white/80 hover:bg-white/10 hover:text-white transition focus:outline-none cursor-pointer"
                            aria-label="Tutup Modal"
                        >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Form Content */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
                    {/* Banner Asal Usul Barang */}
                    {isEdit && item?.source === 'USULAN_UNIT' && (
                        <div className="rounded-xl border border-blue-200 bg-blue-50/90 p-3.5 text-xs text-blue-900 font-medium flex items-start gap-2.5 shadow-2xs">
                            <span className="text-base shrink-0">📋</span>
                            <div className="space-y-0.5">
                                <p className="font-bold text-blue-950">
                                    Barang ini berasal dari Usulan Unit Kerja
                                </p>
                                <p className="text-blue-800 text-[11px] leading-relaxed">
                                    Diusulkan pertama kali oleh: <strong className="font-bold text-slate-900">{item.origin_unit?.name || 'Unit Kerja'}</strong> {item.origin_unit?.unit_code ? `(${item.origin_unit.unit_code})` : ''}. Anda dapat memvalidasi data ini atau mengesahkannya menjadi Standar Baku RS melalui tombol "Sahkan" di tabel katalog.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Pos Rekening Belanja RBA BLUD */}
                    <div>
                        <label
                            htmlFor="rba_account_id"
                            className="mb-1.5 block text-xs font-black uppercase tracking-wider text-slate-700"
                        >
                            Pos Rekening Belanja RBA BLUD <span className="text-rose-600">*</span>
                        </label>
                        <select
                            id="rba_account_id"
                            value={data.rba_account_id}
                            onChange={(e) => setData('rba_account_id', e.target.value)}
                            className="block w-full rounded-xl border-2 border-slate-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 shadow-2xs transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
                        >
                            <option value="" disabled>-- Pilih Pos Rekening Belanja RBA --</option>
                            {rbaAccounts.map((account) => (
                                <option key={account.id} value={account.id}>
                                    [{account.account_code}] {account.account_name}
                                </option>
                            ))}
                        </select>
                        <p className="mt-1 text-[11px] text-slate-500 font-medium">
                            Barang akan otomatis terdaftar dan dapat dipilih oleh unit/divisi saat mengusulkan belanja pada pos rekening ini.
                        </p>
                        <InputError message={errors.rba_account_id} className="mt-1 font-bold text-rose-600 text-xs" />
                    </div>

                    {/* Kode Barang & Satuan Ukur */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label
                                    htmlFor="item_code"
                                    className="block text-xs font-black uppercase tracking-wider text-slate-700"
                                >
                                    Kode Barang <span className="text-rose-600">*</span>
                                </label>
                                {!isEdit && (
                                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                        Auto-Generated
                                    </span>
                                )}
                            </div>
                            <input
                                id="item_code"
                                type="text"
                                value={data.item_code}
                                onChange={(e) => setData('item_code', e.target.value.toUpperCase())}
                                placeholder="CONTOH: ITM-0001"
                                className="block w-full rounded-xl border-2 border-slate-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-mono font-bold text-slate-900 uppercase shadow-2xs transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
                            />
                            <InputError message={errors.item_code} className="mt-1 font-bold text-rose-600 text-xs" />
                        </div>

                        <div>
                            <label
                                htmlFor="unit_type_select"
                                className="mb-1.5 block text-xs font-black uppercase tracking-wider text-slate-700"
                            >
                                Satuan Ukur <span className="text-rose-600">*</span>
                            </label>
                            <select
                                id="unit_type_select"
                                value={isCustomUnit ? 'Lainnya' : data.unit_type}
                                onChange={(e) => handleUnitTypeChange(e.target.value)}
                                className="block w-full rounded-xl border-2 border-slate-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 shadow-2xs transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
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
                                    className="mt-2 block w-full rounded-xl border-2 border-emerald-300 bg-emerald-50/50 px-3.5 py-2 text-xs sm:text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-500"
                                />
                            )}
                            <InputError message={errors.unit_type} className="mt-1 font-bold text-rose-600 text-xs" />
                        </div>
                    </div>

                    {/* Nama Barang */}
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
                            placeholder="Contoh: Kertas HVS Folio / F4 75gr PaperOne"
                            className="block w-full rounded-xl border-2 border-slate-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-bold text-slate-900 placeholder:text-slate-400 shadow-2xs transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
                        />
                        <InputError message={errors.name} className="mt-1 font-bold text-rose-600 text-xs" />
                    </div>

                    {/* Harga Standar Acuan */}
                    <div>
                        <label
                            htmlFor="standard_price"
                            className="mb-1.5 block text-xs font-black uppercase tracking-wider text-slate-700"
                        >
                            Harga Standar Acuan (HPS) <span className="text-rose-600">*</span>
                        </label>
                        <div className="relative rounded-xl shadow-2xs">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-xs font-black text-slate-500">
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
                                className="block w-full rounded-xl border-2 border-slate-300 bg-white pl-11 pr-4 py-2.5 text-xs sm:text-sm font-black text-slate-900 placeholder:text-slate-400 transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
                            />
                        </div>
                        <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                            <span>Harga estimasi per satu {data.unit_type || 'unit'}.</span>
                            {Number(data.standard_price) > 0 && (
                                <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                    {formatRupiah(data.standard_price)}
                                </span>
                            )}
                        </div>
                        <InputError message={errors.standard_price} className="mt-1 font-bold text-rose-600 text-xs" />
                    </div>

                    {/* Spesifikasi Teknis / Keterangan */}
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
                            onChange={(e) => setData('specification', e.target.value)}
                            placeholder="Rincian merek, ukuran, ketebalan, tipe kemasan, atau catatan spesifikasi pengadaan lainnya (opsional)..."
                            className="block w-full rounded-xl border-2 border-slate-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 shadow-2xs transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
                        />
                        <InputError message={errors.specification} className="mt-1 font-bold text-rose-600 text-xs" />
                    </div>

                    {/* Modal Actions Footer */}
                    <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl border-2 border-slate-300 bg-white px-5 py-2.5 text-xs sm:text-sm font-bold text-slate-700 shadow-2xs transition hover:bg-slate-100 active:scale-95 cursor-pointer"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 px-6 py-2.5 text-xs sm:text-sm font-black text-white shadow-md hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 cursor-pointer"
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
                                <>
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                    </svg>
                                    {isEdit ? 'Simpan Perubahan' : 'Simpan Barang'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
