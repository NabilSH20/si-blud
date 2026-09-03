import DivisiLayout from '@/Layouts/DivisiLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useMemo } from 'react';

const formatRupiah = (value) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(Number(value || 0));

export default function Create({ items = [] }) {
    const authUser = usePage().props.auth.user;
    const userDivision = authUser?.division;

    // Inertia useForm with dynamic items array
    const { data, setData, post, processing, errors } = useForm({
        items: [
            {
                item_id: '',
                quantity: 1,
            },
        ],
    });

    // Hash map for fast item lookups
    const itemMap = useMemo(() => {
        const map = {};
        items.forEach((item) => {
            map[item.id] = item;
        });
        return map;
    }, [items]);

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

    const submit = (e) => {
        e.preventDefault();
        post(route('requisitions.store'));
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
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition mb-2"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                            </svg>
                            Kembali ke Daftar Pengajuan
                        </Link>
                        <h2 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
                            Formulir Pengajuan Belanja (E-BLUD)
                        </h2>
                        <p className="mt-1 text-xs sm:text-sm text-slate-600 font-medium">
                            Ajukan kebutuhan barang unit kerja dengan memilih dari katalog acuan standar rumah sakit.
                        </p>
                    </div>

                    <div className="rounded-2xl border-2 border-emerald-300 bg-emerald-50 px-5 py-3 text-right shadow-xs">
                        <span className="block text-[11px] font-black uppercase tracking-wider text-emerald-800">
                            Unit Kerja Pemohon
                        </span>
                        <span className="text-sm font-black text-emerald-950">
                            {userDivision?.name || 'Unit Divisi RSJ'}
                        </span>
                    </div>
                </div>

                {/* Form Requisition */}
                <form onSubmit={submit} className="space-y-6">
                    {/* SECTION 1: INFORMASI UMUM (HEADER) */}
                    <div className="overflow-hidden rounded-2xl border-2 border-slate-300 bg-white shadow-md">
                        <div className="border-b-2 border-slate-200 bg-slate-100 px-6 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-xs font-black text-white shadow-xs">
                                    1
                                </span>
                                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                                    Informasi Header Pengajuan
                                </h3>
                            </div>
                            <span className="text-xs font-bold text-slate-500">
                                Nomor registrasi digenerate otomatis
                            </span>
                        </div>

                        <div className="grid gap-0 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x-2 divide-slate-200">
                            {/* Kolom 1: Unit Kerja */}
                            <div className="p-5 bg-white flex flex-col justify-center">
                                <span className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
                                    Unit Kerja / Divisi
                                </span>
                                <div className="flex items-center gap-2">
                                    <span className="inline-flex items-center rounded-lg bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800 border border-emerald-300">
                                        {userDivision?.division_code || 'DIV-NONE'}
                                    </span>
                                    <p className="text-sm font-bold text-slate-900 truncate">
                                        {userDivision?.name || 'Belum Terhubung'}
                                    </p>
                                </div>
                            </div>

                            {/* Kolom 2: Tanggal */}
                            <div className="p-5 bg-white flex flex-col justify-center">
                                <span className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
                                    Tanggal Pengajuan
                                </span>
                                <p className="text-sm font-bold text-slate-900">
                                    {currentDate}
                                </p>
                                <span className="text-[11px] font-medium text-slate-500">
                                    Tercatat otomatis hari ini
                                </span>
                            </div>

                            {/* Kolom 3: Pemohon */}
                            <div className="p-5 bg-white flex flex-col justify-center">
                                <span className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
                                    Nama Pemohon (PIC)
                                </span>
                                <p className="text-sm font-bold text-slate-900 truncate">
                                    {authUser?.name}
                                </p>
                                <span className="text-xs font-medium text-slate-600 truncate block">
                                    {authUser?.email}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 2: DAFTAR BARANG (Tabel dengan Batas Kolom Jelas) */}
                    <div className="overflow-hidden rounded-2xl border-2 border-slate-300 bg-white shadow-md">
                        <div className="border-b-2 border-slate-200 bg-slate-100 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div className="flex items-center gap-2.5">
                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-xs font-black text-white shadow-xs">
                                    2
                                </span>
                                <div>
                                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                                        Daftar Barang yang Diajukan
                                    </h3>
                                    <p className="text-xs text-slate-500 font-medium">
                                        Pilih barang dari katalog acuan standar dan tentukan jumlah kuantitas
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={addItemRow}
                                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white px-5 py-2.5 text-xs font-bold transition shadow-sm self-start sm:self-auto"
                            >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                </svg>
                                + Tambah Barang
                            </button>
                        </div>

                        {/* Tabel dengan Border Garis Vertikal & Horizontal Tegas */}
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y-2 divide-slate-200 border-collapse">
                                <thead className="bg-emerald-50/80 font-bold border-b-2 border-emerald-200">
                                    <tr className="divide-x-2 divide-slate-200">
                                        <th className="w-16 px-4 py-4 text-center text-sm font-black uppercase tracking-wider text-slate-800">
                                            No
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-black uppercase tracking-wider text-slate-800 min-w-[280px]">
                                            Pilih Barang dari Katalog <span className="text-rose-600">*</span>
                                        </th>
                                        <th className="w-28 px-4 py-4 text-center text-sm font-black uppercase tracking-wider text-slate-800">
                                            Satuan
                                        </th>
                                        <th className="w-40 px-5 py-4 text-right text-sm font-black uppercase tracking-wider text-slate-800">
                                            Harga Acuan
                                        </th>
                                        <th className="w-36 px-4 py-4 text-center text-sm font-black uppercase tracking-wider text-slate-800">
                                            Kuantitas <span className="text-rose-600">*</span>
                                        </th>
                                        <th className="w-44 px-5 py-4 text-right text-sm font-black uppercase tracking-wider text-slate-800">
                                            Subtotal
                                        </th>
                                        <th className="w-20 px-3 py-4 text-center text-sm font-black uppercase tracking-wider text-slate-800">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y-2 divide-slate-200 bg-white">
                                    {data.items.map((row, index) => {
                                        const selectedItem = itemMap[row.item_id];
                                        const quantity = parseInt(row.quantity, 10) || 0;
                                        const subtotal = selectedItem
                                            ? Number(selectedItem.standard_price || 0) * quantity
                                            : 0;

                                        return (
                                            <tr
                                                key={index}
                                                className="divide-x-2 divide-slate-200 hover:bg-emerald-50/60 transition-colors duration-200 cursor-default"
                                            >
                                                {/* Kolom No */}
                                                <td className="px-4 py-4 text-center text-sm font-bold text-slate-700 bg-slate-50/70">
                                                    #{index + 1}
                                                </td>

                                                {/* Kolom Barang */}
                                                <td className="p-4">
                                                    <select
                                                        value={row.item_id}
                                                        onChange={(e) =>
                                                            updateItemRow(index, 'item_id', e.target.value)
                                                        }
                                                        className="block w-full rounded-xl border-2 border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-2xs focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/30 transition-all duration-200"
                                                    >
                                                        <option value="">-- Pilih Barang Standar --</option>
                                                        {items.map((item) => (
                                                            <option key={item.id} value={item.id}>
                                                                {item.item_code} - {item.name}
                                                            </option>
                                                        ))}
                                                    </select>

                                                    {selectedItem?.specification && (
                                                        <p className="mt-1 text-xs text-slate-500 font-medium italic">
                                                            Spesifikasi: {selectedItem.specification}
                                                        </p>
                                                    )}

                                                    {errors[`items.${index}.item_id`] && (
                                                        <p className="mt-1 text-xs font-bold text-rose-600">
                                                            {errors[`items.${index}.item_id`]}
                                                        </p>
                                                    )}
                                                </td>

                                                {/* Kolom Satuan */}
                                                <td className="px-4 py-4 text-center">
                                                    <span className="inline-flex rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-800 border border-slate-300">
                                                        {selectedItem?.unit_type || '-'}
                                                    </span>
                                                </td>

                                                {/* Kolom Harga Acuan */}
                                                <td className="px-5 py-4 text-right text-sm font-bold text-slate-800">
                                                    {selectedItem ? formatRupiah(selectedItem.standard_price) : '-'}
                                                </td>

                                                {/* Kolom Kuantitas */}
                                                <td className="p-4 text-center">
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={row.quantity}
                                                        onChange={(e) =>
                                                            updateItemRow(index, 'quantity', e.target.value)
                                                        }
                                                        className="block w-full rounded-xl border-2 border-slate-300 bg-white px-2 py-2 text-center text-sm font-black text-slate-900 shadow-2xs focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/30 transition-all duration-200"
                                                    />
                                                    {errors[`items.${index}.quantity`] && (
                                                        <p className="mt-1 text-xs font-bold text-rose-600">
                                                            {errors[`items.${index}.quantity`]}
                                                        </p>
                                                    )}
                                                </td>

                                                {/* Kolom Subtotal */}
                                                <td className="px-5 py-4 text-right text-sm font-black text-emerald-700 bg-emerald-50/40">
                                                    {formatRupiah(subtotal)}
                                                </td>

                                                {/* Kolom Aksi Hapus */}
                                                <td className="p-3 text-center">
                                                    <button
                                                        type="button"
                                                        disabled={data.items.length <= 1}
                                                        onClick={() => removeItemRow(index)}
                                                        className="inline-flex items-center justify-center p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-300 transition active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                                                        title="Hapus baris barang ini"
                                                    >
                                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                                        </svg>
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>

                                {/* Footer Tabel Kalkulasi */}
                                <tfoot className="border-t-2 border-slate-300 bg-slate-100 divide-x-2 divide-slate-200">
                                    <tr>
                                        <td colSpan="4" className="px-6 py-4 text-right text-sm font-black uppercase tracking-wider text-slate-700">
                                            Total Kuantitas Diajukan:
                                        </td>
                                        <td className="px-4 py-4 text-center text-sm font-black text-slate-900 bg-slate-200/60">
                                            {totalQuantity} Unit
                                        </td>
                                        <td className="whitespace-nowrap px-5 py-4 text-right text-base font-black text-emerald-700 bg-emerald-100/60">
                                            {formatRupiah(grandTotal)}
                                        </td>
                                        <td className="bg-slate-100" />
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        {/* Error General Items */}
                        {errors.items && typeof errors.items === 'string' && (
                            <div className="border-t-2 border-rose-200 bg-rose-50 p-4 text-xs font-bold text-rose-700">
                                {errors.items}
                            </div>
                        )}
                    </div>

                    {/* SECTION 3: ESTIMASI TOTAL & TOMBOL SUBMIT */}
                    <div className="overflow-hidden rounded-2xl border-2 border-slate-300 bg-white p-6 shadow-md">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <span className="block text-xs font-black uppercase tracking-wider text-slate-500">
                                    Estimasi Nilai Pengadaan Total
                                </span>
                                <p className="text-2xl sm:text-3xl font-black text-emerald-700 tracking-tight">
                                    {formatRupiah(grandTotal)}
                                </p>
                                <span className="text-xs text-slate-500 font-medium">
                                    * Total {data.items.length} macam barang &bull; {totalQuantity} unit
                                </span>
                            </div>

                            <div className="flex items-center gap-3">
                                <Link
                                    href={route('requisitions.index')}
                                    className="rounded-xl border-2 border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 shadow-2xs transition hover:bg-slate-100 active:scale-95"
                                >
                                    Batal
                                </Link>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white px-6 py-2.5 text-sm font-black shadow-md hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50"
                                >
                                    {processing ? (
                                        <>
                                            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            Mengirim Pengajuan...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                                            </svg>
                                            Kirim Pengajuan Belanja (E-BLUD)
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </DivisiLayout>
    );
}
