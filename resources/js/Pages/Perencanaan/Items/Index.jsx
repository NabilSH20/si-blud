import DeleteConfirmationModal from '@/Components/DeleteConfirmationModal';
import Pagination from '@/Components/Pagination';
import PerencanaanLayout from '@/Layouts/PerencanaanLayout';
import ItemFormModal from './Partials/ItemFormModal';
import { Head, router, useForm } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';

const formatRupiah = (value) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(Number(value || 0));

export default function Index({
    items = [],
    rbaAccounts = [],
    nextItemCode = '',
    success,
    error,
}) {
    const [search, setSearch] = useState('');
    const [selectedSource, setSelectedSource] = useState('ALL'); // 'ALL' | 'STANDAR' | 'USULAN_UNIT'
    const [selectedUnit, setSelectedUnit] = useState('ALL');
    const [selectedRba, setSelectedRba] = useState('ALL');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;

    // Modal state for Add/Edit
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    // Modal state for Delete confirmation
    const [confirmingDelete, setConfirmingDelete] = useState(null);
    const deleteForm = useForm();

    const sourceCounts = useMemo(() => {
        const standar = items.filter((i) => (i.source || 'STANDAR') === 'STANDAR').length;
        const usulan = items.filter((i) => i.source === 'USULAN_UNIT').length;
        return { all: items.length, standar, usulan };
    }, [items]);

    const unitTypes = useMemo(() => {
        const set = new Set(items.map((i) => i.unit_type).filter(Boolean));
        return ['ALL', ...Array.from(set).sort((a, b) => a.localeCompare(b))];
    }, [items]);

    const filteredItems = useMemo(() => {
        return items.filter((item) => {
            const itemSource = item.source || 'STANDAR';
            const matchesSource =
                selectedSource === 'ALL' || itemSource === selectedSource;

            const matchesUnit =
                selectedUnit === 'ALL' || item.unit_type === selectedUnit;
            const matchesRba =
                selectedRba === 'ALL' ||
                String(item.rba_account_id) === String(selectedRba);

            if (!matchesSource || !matchesUnit || !matchesRba) return false;

            if (!search.trim()) return true;

            const q = search.toLowerCase();
            return (
                item.name?.toLowerCase().includes(q) ||
                item.item_code?.toLowerCase().includes(q) ||
                item.specification?.toLowerCase().includes(q) ||
                item.rba_account?.account_code?.toLowerCase().includes(q) ||
                item.rba_account?.account_name?.toLowerCase().includes(q) ||
                item.origin_unit?.name?.toLowerCase().includes(q) ||
                item.origin_unit?.unit_code?.toLowerCase().includes(q)
            );
        });
    }, [items, search, selectedUnit, selectedRba, selectedSource]);

    useEffect(() => {
        setCurrentPage(1);
    }, [search, selectedUnit, selectedRba, selectedSource]);

    const totalPages = Math.ceil(filteredItems.length / itemsPerPage) || 1;
    const paginatedItems = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredItems.slice(start, start + itemsPerPage);
    }, [filteredItems, currentPage, itemsPerPage]);

    const openCreateModal = () => {
        setEditingItem(null);
        setIsFormModalOpen(true);
    };

    const openEditModal = (item) => {
        setEditingItem(item);
        setIsFormModalOpen(true);
    };

    const submitDelete = (e) => {
        if (e?.preventDefault) e.preventDefault();
        if (!confirmingDelete) return;

        deleteForm.delete(route('items.destroy', confirmingDelete.id), {
            preserveScroll: true,
            onSuccess: () => {
                setConfirmingDelete(null);
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: 'Barang berhasil dihapus',
                    showConfirmButton: false,
                    timer: 2500,
                    timerProgressBar: true,
                });
            },
        });
    };

    const handleVerifyStandard = (item) => {
        Swal.fire({
            title: 'Sahkan Jadi Standar Baku?',
            text: `Barang "${item.name}" (${item.item_code}) akan disahkan menjadi standar pengadaan resmi RS Jiwa Tampan.`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#0d9488',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Ya, Sahkan',
            cancelButtonText: 'Batal',
        }).then((result) => {
            if (result.isConfirmed) {
                router.patch(route('items.verify-standard', item.id), {}, {
                    preserveScroll: true,
                    onSuccess: () => {
                        Swal.fire({
                            toast: true,
                            position: 'top-end',
                            icon: 'success',
                            title: `Barang "${item.name}" disahkan jadi Standar Baku RS`,
                            showConfirmButton: false,
                            timer: 2500,
                            timerProgressBar: true,
                        });
                    },
                });
            }
        });
    };

    return (
        <PerencanaanLayout>
            <Head title="Katalog Barang Acuan Standar - E-BLUD RSJ Tampan" />

            {/* 1. Header Minimalis (Sesuai Standar Admin, Divisi & Verifikasi) */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                        <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                            Katalog Barang Acuan RS
                        </h1>
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-3 py-0.5 text-xs font-bold text-teal-800 border border-teal-200">
                            <span className="h-1.5 w-1.5 rounded-full bg-teal-600" />
                            {sourceCounts.standar} Standar Baku RS
                        </span>
                        {sourceCounts.usulan > 0 && (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-0.5 text-xs font-bold text-blue-800 border border-blue-200">
                                <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                                {sourceCounts.usulan} Usulan Unit
                            </span>
                        )}
                    </div>
                    <p className="mt-1 text-xs sm:text-sm text-slate-500">
                        Daftar barang acuan standar pengadaan beserta pos rekening belanja RBA BLUD dan harga perkiraan standar.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={openCreateModal}
                    className="inline-flex items-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-95 px-4 py-2 text-xs sm:text-sm font-bold text-white shadow-2xs transition cursor-pointer"
                >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    <span>Tambah Barang</span>
                </button>
            </div>

            {/* 2. Single-Row Clean Toolbar & Container Card */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
                {/* Bilah Pencarian & Filter 1 Baris */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 p-4 bg-white">
                    <div className="flex flex-1 flex-col sm:flex-row sm:items-center gap-2.5 flex-wrap">
                        {/* Search Bar */}
                        <div className="relative flex-1 sm:max-w-xs min-w-[200px]">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari nama, kode, rekening..."
                                className="block w-full rounded-lg border border-slate-300 bg-white pl-9 pr-8 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition shadow-2xs"
                            />
                            {search && (
                                <button
                                    type="button"
                                    onClick={() => setSearch('')}
                                    className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                                >
                                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>

                        {/* Filter Sumber Barang */}
                        <div className="relative">
                            <select
                                value={selectedSource}
                                onChange={(e) => setSelectedSource(e.target.value)}
                                aria-label="Filter Sumber Barang"
                                className="block rounded-lg border border-slate-300 bg-white py-1.5 pl-3 pr-8 text-xs font-semibold text-slate-700 focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition shadow-2xs cursor-pointer"
                            >
                                <option value="ALL">Semua Sumber ({items.length})</option>
                                <option value="STANDAR">🏛️ Standar RS ({sourceCounts.standar})</option>
                                <option value="USULAN_UNIT">📋 Usulan Unit ({sourceCounts.usulan})</option>
                            </select>
                        </div>

                        {/* Filter Pos Rekening Belanja RBA */}
                        {rbaAccounts.length > 0 && (
                            <div className="relative sm:max-w-xs">
                                <select
                                    value={selectedRba}
                                    onChange={(e) => setSelectedRba(e.target.value)}
                                    aria-label="Filter Pos Rekening RBA"
                                    className="block w-full rounded-lg border border-slate-300 bg-white py-1.5 pl-3 pr-8 text-xs font-semibold text-slate-700 focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition shadow-2xs cursor-pointer truncate"
                                >
                                    <option value="ALL">Semua Rekening RBA</option>
                                    {rbaAccounts.map((acc) => (
                                        <option key={acc.id} value={acc.id}>
                                            [{acc.account_code}] {acc.account_name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Filter Satuan Barang */}
                        {unitTypes.length > 2 && (
                            <div className="relative">
                                <select
                                    value={selectedUnit}
                                    onChange={(e) => setSelectedUnit(e.target.value)}
                                    aria-label="Filter Satuan Barang"
                                    className="block rounded-lg border border-slate-300 bg-white py-1.5 pl-3 pr-8 text-xs font-semibold text-slate-700 focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition shadow-2xs cursor-pointer"
                                >
                                    <option value="ALL">Semua Satuan</option>
                                    {unitTypes
                                        .filter((u) => u !== 'ALL')
                                        .map((unit) => (
                                            <option key={unit} value={unit}>
                                                {unit}
                                            </option>
                                        ))}
                                </select>
                            </div>
                        )}
                    </div>

                    <div className="text-xs text-slate-500 shrink-0">
                        Menampilkan <strong className="text-slate-800">{filteredItems.length}</strong> dari {items.length} barang
                    </div>
                </div>

                {/* 3. Tabel Data Minimalis Bersih */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-100 text-xs">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                            <tr>
                                <th className="w-12 px-3 py-3 text-center">No</th>
                                <th className="w-32 px-4 py-3 text-left">Kode Barang</th>
                                <th className="px-4 py-3 text-left min-w-[200px]">Nama Barang & Spesifikasi</th>
                                <th className="w-60 px-4 py-3 text-left">Pos Rekening Belanja RBA</th>
                                <th className="w-24 px-3 py-3 text-center">Satuan</th>
                                <th className="w-36 px-4 py-3 text-right">Harga Standar (HPS)</th>
                                <th className="w-32 px-3 py-3 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                            {filteredItems.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-16 text-center bg-white">
                                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 border border-slate-200 text-slate-400">
                                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                                            </svg>
                                        </div>
                                        <p className="mt-3 text-sm font-bold text-slate-800">
                                            {search || selectedUnit !== 'ALL' || selectedRba !== 'ALL' || selectedSource !== 'ALL'
                                                ? 'Tidak ada barang yang sesuai filter'
                                                : 'Belum ada data barang katalog'}
                                        </p>
                                        <p className="mt-1 text-xs text-slate-500">
                                            {search || selectedUnit !== 'ALL' || selectedRba !== 'ALL' || selectedSource !== 'ALL'
                                                ? 'Coba ganti kata kunci atau setel ulang filter pencarian.'
                                                : 'Klik tombol "+ Tambah Barang" untuk memasukkan acuan standar pengadaan baru.'}
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                paginatedItems.map((item, idx) => (
                                    <tr
                                        key={item.id}
                                        className="hover:bg-slate-50/60 transition"
                                    >
                                        <td className="px-3 py-3 text-center text-slate-400 font-semibold">
                                            #{(currentPage - 1) * itemsPerPage + idx + 1}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="inline-block font-mono text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                                                {item.item_code}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                <span className="font-bold text-slate-900">
                                                    {item.name}
                                                </span>
                                                {(item.source || 'STANDAR') === 'STANDAR' ? (
                                                    <span className="inline-flex items-center gap-1 rounded bg-teal-50 px-1.5 py-0.2 text-[10px] font-bold text-teal-800 border border-teal-200">
                                                        <span className="h-1.5 w-1.5 rounded-full bg-teal-600" />
                                                        Standar RS
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 rounded bg-blue-50 px-1.5 py-0.2 text-[10px] font-bold text-blue-800 border border-blue-200">
                                                        <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                                                        Usulan: {item.origin_unit?.name || 'Unit Kerja'}
                                                    </span>
                                                )}
                                            </div>
                                            {item.specification && (
                                                <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                                                    Spesifikasi: {item.specification}
                                                </p>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            {item.rba_account ? (
                                                <div className="text-slate-700">
                                                    <span className="font-mono text-[11px] font-bold text-teal-800 block">
                                                        {item.rba_account.account_code}
                                                    </span>
                                                    <span className="text-[11px] text-slate-600 line-clamp-1">
                                                        {item.rba_account.account_name}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-slate-400 text-[11px] italic">
                                                    Belum Ditautkan
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-3 py-3 text-center">
                                            <span className="inline-block rounded bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700 border border-slate-200">
                                                {item.unit_type}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">
                                            {formatRupiah(item.standard_price)}
                                        </td>
                                        <td className="px-3 py-3 text-center">
                                            <div className="flex items-center justify-center gap-1.5">
                                                {item.source === 'USULAN_UNIT' && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleVerifyStandard(item)}
                                                        title="Sahkan Menjadi Standar Baku RS"
                                                        className="inline-flex items-center gap-1 rounded-lg bg-teal-600 hover:bg-teal-700 active:scale-95 text-white px-2 py-1 text-xs font-bold transition shadow-2xs cursor-pointer"
                                                    >
                                                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                                        </svg>
                                                        <span>Sahkan</span>
                                                    </button>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => openEditModal(item)}
                                                    title="Ubah Data Barang"
                                                    className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 px-2 py-1 text-xs font-semibold shadow-2xs transition cursor-pointer"
                                                >
                                                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                                                    </svg>
                                                    <span>Edit</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setConfirmingDelete(item)}
                                                    title="Hapus Barang"
                                                    className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                                                >
                                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Component */}
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={filteredItems.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={(p) => setCurrentPage(p)}
                />
            </div>

            {/* Modal Tambah / Edit Barang */}
            <ItemFormModal
                show={isFormModalOpen}
                onClose={() => {
                    setIsFormModalOpen(false);
                    setEditingItem(null);
                }}
                item={editingItem}
                rbaAccounts={rbaAccounts}
                nextItemCode={nextItemCode}
            />

            {/* Modal Konfirmasi Hapus Barang */}
            <DeleteConfirmationModal
                show={confirmingDelete !== null}
                onClose={() => setConfirmingDelete(null)}
                onConfirm={submitDelete}
                processing={deleteForm.processing}
                title="Hapus Barang dari Katalog?"
                message="Barang ini akan dihapus secara permanen dari katalog master acuan standar RS Jiwa Tampan."
                itemName={confirmingDelete?.name}
                itemCode={confirmingDelete?.item_code}
                details={
                    confirmingDelete?.rba_account ? (
                        <div className="flex items-center gap-2 text-xs">
                            <span className="text-slate-500 font-semibold w-24 shrink-0">Rekening RBA:</span>
                            <span className="text-slate-700 font-medium">
                                [{confirmingDelete.rba_account.account_code}] {confirmingDelete.rba_account.account_name}
                            </span>
                        </div>
                    ) : null
                }
                confirmText="Ya, Hapus Barang"
            />
        </PerencanaanLayout>
    );
}
