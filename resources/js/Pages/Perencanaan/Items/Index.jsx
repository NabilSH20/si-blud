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
            onSuccess: () => setConfirmingDelete(null),
        });
    };

    const handleVerifyStandard = (item) => {
        Swal.fire({
            title: 'Sahkan Menjadi Standar Baku RS?',
            html: `
                <div class="text-left text-xs sm:text-sm space-y-2.5 mt-2">
                    <p class="text-slate-700">Barang <strong>${item.name}</strong> (<span class="font-mono font-bold text-emerald-700">${item.item_code}</span>) yang sebelumnya diusulkan oleh <strong>${item.origin_unit?.name || 'Unit Kerja'}</strong> akan disahkan menjadi <strong>Standar Baku Resmi Rumah Sakit</strong>.</p>
                    <div class="rounded-xl border border-emerald-200 bg-emerald-50/90 p-3 text-xs text-emerald-900 font-medium">
                        ✨ <strong>Dampak Pengesahan:</strong> Barang ini selanjutnya menjadi rujukan pengadaan resmi RS Jiwa Tampan dan dapat dipilih secara baku oleh seluruh unit kerja.
                    </div>
                </div>
            `,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#059669',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Ya, Sahkan Jadi Standar',
            cancelButtonText: 'Batal',
            reverseButtons: true,
        }).then((result) => {
            if (result.isConfirmed) {
                router.patch(route('items.verify-standard', item.id), {}, {
                    preserveScroll: true,
                });
            }
        });
    };

    return (
        <PerencanaanLayout>
            <Head title="Katalog Barang & Spesifikasi - RSJ Tampan" />

            {/* Header Section */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                        <h2 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
                            Katalog Barang & Spesifikasi
                        </h2>
                        <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-900 border border-emerald-300">
                            {sourceCounts.standar} Standar Baku RS
                        </span>
                        {sourceCounts.usulan > 0 && (
                            <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-black text-blue-900 border border-blue-300">
                                {sourceCounts.usulan} Usulan Unit
                            </span>
                        )}
                    </div>
                    <p className="mt-1 text-xs sm:text-sm text-slate-600 font-medium">
                        Daftar barang acuan standar pengadaan beserta pos rekening belanja RBA BLUD, spesifikasi teknis, dan verifikasi asal-usul barang.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={openCreateModal}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 px-5 py-2.5 text-sm font-bold text-white shadow-md hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 cursor-pointer"
                >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Tambah Barang
                </button>
            </div>

            {/* Notification Alerts */}
            {success && (
                <div className="mb-5 flex items-center gap-3 rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-4 text-sm font-bold text-emerald-900 shadow-xs">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-200 text-emerald-900">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                    </div>
                    <p className="flex-1">{success}</p>
                </div>
            )}
            {error && (
                <div className="mb-5 flex items-center gap-3 rounded-2xl border-2 border-rose-300 bg-rose-50 p-4 text-sm font-bold text-rose-900 shadow-xs">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-rose-200 text-rose-900">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                        </svg>
                    </div>
                    <p className="flex-1">{error}</p>
                </div>
            )}

            {/* Table Container Card (Clean & Modern) */}
            <div className="overflow-hidden rounded-2xl border border-emerald-100/90 bg-white shadow-md shadow-emerald-950/5 hover:shadow-lg hover:shadow-emerald-900/10 transition-shadow">
                {/* Search & Filter Toolbar */}
                <div className="flex flex-col gap-3.5 border-b border-emerald-100 bg-gradient-to-r from-emerald-50/70 via-teal-50/30 to-slate-50/50 p-4">
                    {/* Baris 1: Filter Tab Sumber Barang */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-emerald-100/60">
                        <div className="inline-flex items-center rounded-xl bg-slate-200/70 p-1 text-xs font-bold gap-1">
                            <button
                                type="button"
                                onClick={() => setSelectedSource('ALL')}
                                className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                                    selectedSource === 'ALL'
                                        ? 'bg-white text-emerald-800 shadow-xs'
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                <span>Semua Barang</span>
                                <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                                    selectedSource === 'ALL'
                                        ? 'bg-emerald-100 text-emerald-900'
                                        : 'bg-slate-300/60 text-slate-700'
                                }`}>
                                    {sourceCounts.all}
                                </span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setSelectedSource('STANDAR')}
                                className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                                    selectedSource === 'STANDAR'
                                        ? 'bg-white text-emerald-800 shadow-xs'
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                <span>🏛️ Standar Baku RS</span>
                                <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                                    selectedSource === 'STANDAR'
                                        ? 'bg-emerald-100 text-emerald-900'
                                        : 'bg-slate-300/60 text-slate-700'
                                }`}>
                                    {sourceCounts.standar}
                                </span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setSelectedSource('USULAN_UNIT')}
                                className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                                    selectedSource === 'USULAN_UNIT'
                                        ? 'bg-white text-blue-800 shadow-xs'
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                <span>📋 Usulan Unit Kerja</span>
                                <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                                    selectedSource === 'USULAN_UNIT'
                                        ? 'bg-blue-100 text-blue-900'
                                        : 'bg-slate-300/60 text-slate-700'
                                }`}>
                                    {sourceCounts.usulan}
                                </span>
                            </button>
                        </div>

                        <div className="text-xs sm:text-sm text-slate-500 font-medium whitespace-nowrap">
                            Menampilkan <span className="font-bold text-slate-900">{filteredItems.length}</span> dari {items.length} barang
                        </div>
                    </div>

                    {/* Baris 2: Search, Pos Rekening, dan Satuan */}
                    <div className="flex flex-1 flex-col gap-2.5 sm:flex-row sm:items-center flex-wrap">
                        {/* Search Input */}
                        <div className="relative flex-1 sm:max-w-xs min-w-[220px]">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari kode, nama, pos rekening, unit..."
                                className="block w-full rounded-xl border border-slate-300 bg-white pl-9 pr-8 py-2 text-xs sm:text-sm text-slate-900 placeholder-slate-400 font-medium transition focus:border-emerald-600 focus:ring-1 focus:ring-emerald-500"
                            />
                            {search && (
                                <button
                                    type="button"
                                    onClick={() => setSearch('')}
                                    className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400 hover:text-slate-600"
                                >
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>

                        {/* Filter Pos Rekening Belanja RBA */}
                        {rbaAccounts.length > 0 && (
                            <div className="relative sm:w-64">
                                <select
                                    value={selectedRba}
                                    onChange={(e) => setSelectedRba(e.target.value)}
                                    aria-label="Filter Pos Rekening RBA"
                                    className="block w-full rounded-xl border border-slate-300 bg-white py-2 pl-3 pr-8 text-xs sm:text-sm font-semibold text-slate-800 transition focus:border-emerald-600 focus:ring-1 focus:ring-emerald-500 cursor-pointer shadow-2xs truncate"
                                >
                                    <option value="ALL">Semua Rekening Belanja</option>
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
                            <div className="relative sm:w-44">
                                <select
                                    value={selectedUnit}
                                    onChange={(e) => setSelectedUnit(e.target.value)}
                                    aria-label="Filter Satuan Barang"
                                    className="block w-full rounded-xl border border-slate-300 bg-white py-2 pl-3 pr-8 text-xs sm:text-sm font-semibold text-slate-800 transition focus:border-emerald-600 focus:ring-1 focus:ring-emerald-500 cursor-pointer shadow-2xs"
                                >
                                    <option value="ALL">Semua Satuan ({items.length})</option>
                                    {unitTypes
                                        .filter((u) => u !== 'ALL')
                                        .map((unit) => {
                                            const count = items.filter((i) => i.unit_type === unit).length;
                                            return (
                                                <option key={unit} value={unit}>
                                                    {unit} ({count})
                                                </option>
                                            );
                                        })}
                                </select>
                            </div>
                        )}
                    </div>
                </div>

                {/* Soft Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-emerald-100">
                        <thead className="bg-gradient-to-r from-emerald-50/90 via-teal-50/40 to-emerald-50/90 font-bold border-b border-emerald-100 text-emerald-950 uppercase tracking-wider text-xs">
                            <tr>
                                <th className="w-14 px-4 py-3.5 text-center text-xs font-bold uppercase tracking-wider text-emerald-950">
                                    No
                                </th>
                                <th className="w-36 px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-emerald-950">
                                    Kode Barang
                                </th>
                                <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-emerald-950">
                                    Nama Barang & Spesifikasi
                                </th>
                                <th className="w-64 px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-emerald-950">
                                    Pos Rekening Belanja RBA
                                </th>
                                <th className="w-28 px-4 py-3.5 text-center text-xs font-bold uppercase tracking-wider text-emerald-950">
                                    Satuan
                                </th>
                                <th className="w-40 px-5 py-3.5 text-right text-xs font-bold uppercase tracking-wider text-emerald-950">
                                    Harga Standar (HPS)
                                </th>
                                <th className="w-32 px-4 py-3.5 text-center text-xs font-bold uppercase tracking-wider text-emerald-950">
                                    Aksi
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                            {filteredItems.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-16 text-center bg-white">
                                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                                            </svg>
                                        </div>
                                        <p className="mt-3 text-sm font-bold text-slate-800">
                                            {search || selectedUnit !== 'ALL' || selectedRba !== 'ALL'
                                                ? 'Tidak ada barang yang cocok dengan filter'
                                                : 'Belum ada barang di katalog'}
                                        </p>
                                        <p className="mt-1 text-xs text-slate-500 font-medium">
                                            {search || selectedUnit !== 'ALL' || selectedRba !== 'ALL'
                                                ? 'Coba ganti filter pos rekening, satuan, atau bersihkan kotak pencarian.'
                                                : 'Tambahkan barang baru untuk menjadi acuan standar pengusulan belanja unit.'}
                                        </p>
                                        {(!search && selectedUnit === 'ALL' && selectedRba === 'ALL') && (
                                            <button
                                                type="button"
                                                onClick={openCreateModal}
                                                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition cursor-pointer"
                                            >
                                                + Tambah Barang Pertama
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ) : (
                                paginatedItems.map((item, idx) => (
                                    <tr
                                        key={item.id}
                                        className="hover:bg-emerald-50/40 transition-colors duration-150"
                                    >
                                        <td className="whitespace-nowrap px-4 py-4 text-center text-xs font-semibold text-slate-500">
                                            #{(currentPage - 1) * itemsPerPage + idx + 1}
                                        </td>
                                        <td className="whitespace-nowrap px-4 py-4">
                                            <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold font-mono text-emerald-900 border border-emerald-300">
                                                {item.item_code}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <p className="text-sm font-bold text-slate-900">
                                                        {item.name}
                                                    </p>
                                                    {(item.source || 'STANDAR') === 'STANDAR' ? (
                                                        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200">
                                                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                                                            Standar Baku RS
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-800 border border-blue-200">
                                                            <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                                                            Usulan: {item.origin_unit?.name || 'Unit Kerja'}
                                                        </span>
                                                    )}
                                                </div>
                                                {item.specification && (
                                                    <p className="text-xs text-slate-500 font-medium leading-relaxed">
                                                        Spesifikasi: {item.specification}
                                                    </p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            {item.rba_account ? (
                                                <div className="flex flex-col">
                                                    <span className="inline-flex items-center gap-1 font-mono text-xs font-bold text-emerald-800">
                                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                                                        {item.rba_account.account_code}
                                                    </span>
                                                    <span className="text-xs text-slate-600 font-medium line-clamp-1">
                                                        {item.rba_account.account_name}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-700 border border-amber-200">
                                                    Belum Ditautkan
                                                </span>
                                            )}
                                        </td>
                                        <td className="whitespace-nowrap px-4 py-4 text-center">
                                            <span className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-800 border border-slate-200">
                                                {item.unit_type}
                                            </span>
                                        </td>
                                        <td className="whitespace-nowrap px-5 py-4 text-right text-sm font-black text-emerald-700">
                                            {formatRupiah(item.standard_price)}
                                        </td>
                                        <td className="whitespace-nowrap px-4 py-4 text-center">
                                            <div className="flex items-center justify-center gap-1.5">
                                                {item.source === 'USULAN_UNIT' && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleVerifyStandard(item)}
                                                        title="Sahkan Menjadi Standar Baku RS"
                                                        className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white px-2.5 py-1.5 text-xs font-bold transition shadow-xs cursor-pointer"
                                                    >
                                                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        <span>Sahkan</span>
                                                    </button>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => openEditModal(item)}
                                                    title="Ubah Data Barang"
                                                    className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 active:scale-95 px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs transition cursor-pointer"
                                                >
                                                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                                    </svg>
                                                    Edit
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setConfirmingDelete(item)}
                                                    title="Hapus Barang"
                                                    className="inline-flex items-center gap-1 rounded-xl border border-transparent hover:border-rose-300 bg-white hover:bg-rose-50 hover:text-rose-700 active:scale-95 px-2.5 py-1.5 text-xs font-bold text-slate-400 transition cursor-pointer"
                                                >
                                                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor">
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

            {/* Modal Card Tambah / Edit Barang */}
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

            {/* Delete Confirmation Card Modal Pop-Up */}
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
                        <div className="flex items-center gap-2">
                            <span className="text-slate-500 font-semibold w-24 shrink-0">Rekening RBA:</span>
                            <span className="text-slate-700 font-medium">
                                {confirmingDelete.rba_account.account_code} - {confirmingDelete.rba_account.account_name}
                            </span>
                        </div>
                    ) : null
                }
                confirmText="Ya, Hapus Barang"
            />
        </PerencanaanLayout>
    );
}
