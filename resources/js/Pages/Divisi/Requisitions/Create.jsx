import DivisiLayout from '@/Layouts/DivisiLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useEffect, useMemo } from 'react';
import Swal from 'sweetalert2';

const formatRupiah = (value) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(Number(value || 0));

export default function Create({ rbaAccounts = [], items = [], userDivision }) {
    const authUser = usePage().props.auth.user;
    const division = userDivision || authUser?.division;

    // Filter accounts by default jenis_belanja ('Operasi')
    const initialOperasiAccounts = useMemo(
        () => rbaAccounts.filter((acc) => acc.kategori_belanja === 'Operasi'),
        [rbaAccounts]
    );

    const defaultAccountId = initialOperasiAccounts[0]?.id || rbaAccounts[0]?.id || '';

    const { data, setData, post, processing, errors } = useForm({
        jenis_belanja: 'Operasi',
        rba_account_id: defaultAccountId,
        items: [
            {
                item_id: '',
                quantity: 1,
            },
        ],
    });

    // Accounts filtered by selected jenis_belanja
    const accountsForJenis = useMemo(() => {
        return rbaAccounts.filter((acc) => acc.kategori_belanja === data.jenis_belanja);
    }, [rbaAccounts, data.jenis_belanja]);

    // Items filtered by selected rba_account_id
    const availableItems = useMemo(() => {
        if (!data.rba_account_id) return [];
        return items.filter((item) => String(item.rba_account_id) === String(data.rba_account_id));
    }, [items, data.rba_account_id]);

    // Fast lookup map for all items
    const itemMap = useMemo(() => {
        const map = {};
        items.forEach((item) => {
            map[item.id] = item;
        });
        return map;
    }, [items]);

    // Active selected RBA Account info
    const selectedAccount = useMemo(() => {
        return rbaAccounts.find((acc) => String(acc.id) === String(data.rba_account_id));
    }, [rbaAccounts, data.rba_account_id]);

    // When jenis_belanja changes, update rba_account_id to the first account in that category
    const handleJenisChange = (newJenis) => {
        const matchingAccounts = rbaAccounts.filter((acc) => acc.kategori_belanja === newJenis);
        const newAccountId = matchingAccounts[0]?.id || '';

        setData({
            ...data,
            jenis_belanja: newJenis,
            rba_account_id: newAccountId,
            items: [{ item_id: '', quantity: 1 }],
        });
    };

    // When rba_account_id changes, reset items row
    const handleAccountChange = (newAccountId) => {
        setData({
            ...data,
            rba_account_id: newAccountId,
            items: [{ item_id: '', quantity: 1 }],
        });
    };

    // Handle updating a specific item row
    const updateItemRow = (index, field, value) => {
        const newItems = [...data.items];
        newItems[index] = {
            ...newItems[index],
            [field]: value,
        };
        setData('items', newItems);
    };

    // Add a new blank item row
    const addItemRow = () => {
        setData('items', [
            ...data.items,
            {
                item_id: '',
                quantity: 1,
            },
        ]);
    };

    // Remove a row
    const removeItemRow = (index) => {
        if (data.items.length <= 1) return;
        const newItems = data.items.filter((_, idx) => idx !== index);
        setData('items', newItems);
    };

    // Calculate live Grand Total & Quantity Total
    const { grandTotal, totalQuantity } = useMemo(() => {
        let sum = 0;
        let totalQty = 0;
        data.items.forEach((row) => {
            const item = itemMap[row.item_id];
            const qty = parseInt(row.quantity, 10) || 0;
            if (item && qty > 0) {
                sum += Number(item.standard_price || 0) * qty;
                totalQty += qty;
            }
        });
        return { grandTotal: sum, totalQuantity: totalQty };
    }, [data.items, itemMap]);

    // Handle Form Submit with SweetAlert2 Confirmation
    const handleSubmit = (e) => {
        e.preventDefault();

        // Validation check for empty items
        const hasEmptyItem = data.items.some((row) => !row.item_id || !row.quantity);
        if (hasEmptyItem) {
            Swal.fire({
                icon: 'warning',
                title: 'Data Belum Lengkap',
                text: 'Pastikan seluruh baris barang telah dipilih dari katalog dan jumlah kuantitas terisi.',
                confirmButtonColor: '#059669',
            });
            return;
        }

        Swal.fire({
            title: 'Kirim Pengajuan Belanja?',
            html: `
                <div class="text-left text-xs sm:text-sm space-y-2 mt-2">
                    <p><strong>Rekening RBA:</strong> [${selectedAccount?.account_code}] ${selectedAccount?.account_name}</p>
                    <p><strong>Jumlah Barang:</strong> ${data.items.length} item (${totalQuantity} unit)</p>
                    <p><strong>Total Estimasi Biaya:</strong> <span class="text-emerald-700 font-bold">${formatRupiah(grandTotal)}</span></p>
                    <p class="text-slate-500 text-xs mt-2">Pengajuan akan langsung diteruskan ke Tim Perencanaan untuk telaah teknis dan persetujuan kuantitas.</p>
                </div>
            `,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#059669',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Ya, Kirim Pengajuan',
            cancelButtonText: 'Batal',
            reverseButtons: true,
        }).then((result) => {
            if (result.isConfirmed) {
                post(route('requisitions.store'));
            }
        });
    };

    const currentDate = new Intl.DateTimeFormat('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(new Date());

    return (
        <DivisiLayout>
            <Head title="Buat Pengajuan Belanja (E-BLUD) - RSJ Tampan" />

            <div className="mx-auto max-w-5xl space-y-6">
                {/* Header Back & Info */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <Link
                            href={route('requisitions.index')}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition mb-2"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                            </svg>
                            Kembali ke Daftar Pengajuan
                        </Link>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                            Formulir Usulan Belanja E-BLUD
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Pilih klasifikasi belanja, pos rekening RBA, serta rincian barang yang dibutuhkan unit Anda.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
                            {division ? division.name : 'Unit Kerja RSJ'}
                        </span>
                        <span className="text-xs text-slate-400">
                            {currentDate}
                        </span>
                    </div>
                </div>

                {errors.division && (
                    <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                        {errors.division}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Card 1: Klasifikasi & Rekening RBA (Cascading Level 1 & 2) */}
                    <div className="rounded-2xl border border-emerald-100/90 bg-white shadow-md shadow-emerald-950/5 hover:shadow-lg hover:shadow-emerald-900/10 transition-shadow overflow-hidden">
                        <div className="border-b border-emerald-100 bg-gradient-to-r from-emerald-50/90 via-teal-50/40 to-slate-50/50 px-6 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white font-bold text-xs shadow-2xs">
                                    1
                                </span>
                                <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-950">
                                    Langkah 1 & 2: Klasifikasi & Rekening RBA
                                </h2>
                            </div>
                            <span className="text-xs font-semibold text-emerald-700 bg-emerald-100/60 px-2.5 py-0.5 rounded-full border border-emerald-200">Sumber Dana: BLUD RSJ</span>
                        </div>

                        <div className="p-6 space-y-5">
                            {/* Step 1: Belanja Operasi vs Belanja Modal */}
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                                    Klasifikasi Belanja
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => handleJenisChange('Operasi')}
                                        className={`flex items-center justify-between p-4 rounded-xl border text-left transition ${
                                            data.jenis_belanja === 'Operasi'
                                                ? 'border-emerald-500 bg-emerald-50/60 ring-1 ring-emerald-500 text-slate-900'
                                                : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                                        }`}
                                    >
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className={`h-2.5 w-2.5 rounded-full ${data.jenis_belanja === 'Operasi' ? 'bg-emerald-600' : 'bg-slate-300'}`} />
                                                <span className="text-sm font-bold">1.1 Belanja Operasi</span>
                                            </div>
                                            <p className="mt-1 text-xs text-slate-500 pl-4.5">
                                                Obat-obatan, BHP Medis, BHP Laboratorium, SIMRS, Cetak, Pemeliharaan, dll.
                                            </p>
                                        </div>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => handleJenisChange('Modal')}
                                        className={`flex items-center justify-between p-4 rounded-xl border text-left transition ${
                                            data.jenis_belanja === 'Modal'
                                                ? 'border-emerald-500 bg-emerald-50/60 ring-1 ring-emerald-500 text-slate-900'
                                                : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                                        }`}
                                    >
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className={`h-2.5 w-2.5 rounded-full ${data.jenis_belanja === 'Modal' ? 'bg-emerald-600' : 'bg-slate-300'}`} />
                                                <span className="text-sm font-bold">1.2 Belanja Modal</span>
                                            </div>
                                            <p className="mt-1 text-xs text-slate-500 pl-4.5">
                                                Peralatan Medis & Keperawatan, Komputer & Jaringan, Sarana Mesin, dll.
                                            </p>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {/* Step 2: Rekening RBA Dropdown */}
                            <div>
                                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                                    Pos Rekening Belanja RBA <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    value={data.rba_account_id}
                                    onChange={(e) => handleAccountChange(e.target.value)}
                                    className="block w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                                >
                                    {accountsForJenis.map((acc) => (
                                        <option key={acc.id} value={acc.id}>
                                            [{acc.account_code}] {acc.account_name} &bull; (Sisa Pagu: {formatRupiah(acc.remaining_budget)})
                                        </option>
                                    ))}
                                </select>
                                <p className="mt-1.5 text-xs text-slate-400">
                                    Katalog barang pada langkah selanjutnya otomatis menampilkan item yang sesuai dengan pos rekening ini.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Rincian Barang (Cascading Level 3 - Filtered Item Picker) */}
                    <div className="rounded-2xl border border-emerald-100/90 bg-white shadow-md shadow-emerald-950/5 hover:shadow-lg hover:shadow-emerald-900/10 transition-shadow overflow-hidden">
                        <div className="border-b border-emerald-100 bg-gradient-to-r from-emerald-50/90 via-teal-50/40 to-slate-50/50 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white font-bold text-xs shadow-2xs">
                                    2
                                </span>
                                <div>
                                    <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-950">
                                        Langkah 3: Rincian Barang yang Diajukan
                                    </h2>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Katalog menampilkan {availableItems.length} jenis barang terstandarisasi untuk rekening ini.
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={addItemRow}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-white hover:bg-emerald-50 px-3.5 py-1.5 text-xs font-bold text-emerald-800 shadow-2xs transition"
                            >
                                <svg className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                </svg>
                                Tambah Baris Barang
                            </button>
                        </div>

                        <div className="p-6">
                            {availableItems.length === 0 ? (
                                <div className="rounded-xl bg-slate-50 border border-slate-200 p-8 text-center text-slate-500 text-xs sm:text-sm">
                                    Belum ada katalog barang yang terdaftar di pos rekening ini. Silakan hubungi Tim Perencanaan untuk mendaftarkan barang baru.
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-emerald-100 border-collapse">
                                        <thead className="bg-gradient-to-r from-emerald-50/90 via-teal-50/40 to-emerald-50/90 font-bold border-b border-emerald-100 text-emerald-950 uppercase tracking-wider text-xs">
                                            <tr>
                                                <th className="px-3 py-3 text-left">Pilih Barang dari Katalog</th>
                                                <th className="w-24 px-3 py-3 text-center">Satuan</th>
                                                <th className="w-32 px-3 py-3 text-right">Harga Standar</th>
                                                <th className="w-28 px-3 py-3 text-center">Jumlah (Qty)</th>
                                                <th className="w-36 px-3 py-3 text-right">Subtotal</th>
                                                <th className="w-12 px-2 py-3 text-center"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 bg-white">
                                            {data.items.map((row, idx) => {
                                                const selectedItem = itemMap[row.item_id];
                                                const unitPrice = Number(selectedItem?.standard_price || 0);
                                                const qty = parseInt(row.quantity, 10) || 0;
                                                const subtotal = unitPrice * qty;

                                                return (
                                                    <tr key={idx} className="hover:bg-emerald-50/40 transition-colors">
                                                        {/* Select Item */}
                                                        <td className="px-3 py-3">
                                                            <select
                                                                value={row.item_id}
                                                                onChange={(e) => updateItemRow(idx, 'item_id', e.target.value)}
                                                                className="block w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs sm:text-sm font-semibold text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                                                            >
                                                                <option value="">-- Pilih Barang --</option>
                                                                {availableItems.map((item) => (
                                                                    <option key={item.id} value={item.id}>
                                                                        {item.name}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                            {selectedItem?.specification && (
                                                                <p className="mt-1 text-[11px] text-slate-400 italic truncate max-w-md">
                                                                    Spek: {selectedItem.specification}
                                                                </p>
                                                            )}
                                                        </td>

                                                        {/* Satuan */}
                                                        <td className="px-3 py-3 text-center text-xs font-medium text-slate-500">
                                                            {selectedItem?.unit_type || '-'}
                                                        </td>

                                                        {/* Harga Satuan */}
                                                        <td className="px-3 py-3 text-right text-xs font-semibold text-slate-700">
                                                            {selectedItem ? formatRupiah(unitPrice) : '-'}
                                                        </td>

                                                        {/* Quantity Input */}
                                                        <td className="px-3 py-3">
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                value={row.quantity}
                                                                onChange={(e) => updateItemRow(idx, 'quantity', e.target.value)}
                                                                className="block w-full rounded-xl border border-slate-300 bg-white px-2 py-2 text-center text-xs sm:text-sm font-bold text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                                                            />
                                                        </td>

                                                        {/* Subtotal */}
                                                        <td className="px-3 py-3 text-right text-xs sm:text-sm font-bold text-emerald-700">
                                                            {formatRupiah(subtotal)}
                                                        </td>

                                                        {/* Delete Row */}
                                                        <td className="px-2 py-3 text-center">
                                                            {data.items.length > 1 && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeItemRow(idx)}
                                                                    className="rounded-lg p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                                                                    title="Hapus Baris"
                                                                >
                                                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                                    </svg>
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* Grand Total & Action Buttons */}
                        <div className="border-t border-emerald-100 bg-gradient-to-r from-emerald-50/60 via-teal-50/30 to-slate-50/50 p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <span className="text-xs text-slate-500 uppercase tracking-wider font-bold block">
                                    Total Estimasi Usulan Anggaran
                                </span>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-2xl sm:text-3xl font-black text-emerald-800">
                                        {formatRupiah(grandTotal)}
                                    </span>
                                    <span className="text-xs text-slate-600 font-semibold">
                                        ({totalQuantity} unit barang)
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2.5">
                                <Link
                                    href={route('requisitions.index')}
                                    className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                                >
                                    Batal
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing || availableItems.length === 0}
                                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-emerald-950/10 transition disabled:opacity-50"
                                >
                                    {processing ? 'Mengirimkan...' : 'Kirim Usulan Belanja'}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </DivisiLayout>
    );
}
