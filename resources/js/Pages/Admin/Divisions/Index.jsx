import DeleteConfirmationModal from '@/Components/DeleteConfirmationModal';
import Pagination from '@/Components/Pagination';
import AdminLayout from '@/Layouts/AdminLayout';
import DivisionFormModal from './Partials/DivisionFormModal';
import UnitFormModal from './Partials/UnitFormModal';
import { Head, useForm } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';

export default function Index({ divisions = [], units = [], initial_tab = 'divisions', success, error }) {
    const getInitialTab = () => {
        if (typeof window !== 'undefined') {
            const param = new URLSearchParams(window.location.search).get('tab');
            if (param === 'units' || param === 'divisions') return param;
        }
        return initial_tab || 'divisions';
    };

    const [activeTab, setActiveTab] = useState(getInitialTab); // 'divisions' | 'units'
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Synchronize tab state with URL and prop
    useEffect(() => {
        if (initial_tab && (initial_tab === 'units' || initial_tab === 'divisions')) {
            setActiveTab(initial_tab);
        }
    }, [initial_tab]);

    const switchTab = (tab) => {
        setActiveTab(tab);
        setSearch('');
        setDivisionFilter('ALL');
        if (typeof window !== 'undefined') {
            const url = new URL(window.location.href);
            url.searchParams.set('tab', tab);
            window.history.replaceState({}, '', url.toString());
        }
    };

    // Division Modal State
    const [isDivisionModalOpen, setIsDivisionModalOpen] = useState(false);
    const [editingDivision, setEditingDivision] = useState(null);

    // Unit Modal State
    const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);
    const [editingUnit, setEditingUnit] = useState(null);
    const [defaultDivisionIdForUnit, setDefaultDivisionIdForUnit] = useState('');

    // Delete Confirmation State
    const [confirmingDelete, setConfirmingDelete] = useState(null); // { type: 'division'|'unit', item: object }

    const deleteForm = useForm();

    // Reset pagination when search or tab changes
    const [divisionFilter, setDivisionFilter] = useState('ALL');

    // Reset pagination when search, tab, or division filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [search, activeTab, divisionFilter]);

    // Filtered Divisions
    const filteredDivisions = useMemo(() => {
        if (!search.trim()) return divisions;
        const q = search.toLowerCase();
        return divisions.filter(
            (d) =>
                d.name?.toLowerCase().includes(q) ||
                d.division_code?.toLowerCase().includes(q) ||
                d.group?.toLowerCase().includes(q),
        );
    }, [divisions, search]);

    // Filtered Units
    const filteredUnits = useMemo(() => {
        return units.filter((u) => {
            const matchesDivision =
                divisionFilter === 'ALL' || String(u.division_id) === String(divisionFilter);
            if (!matchesDivision) return false;

            if (!search.trim()) return true;
            const q = search.toLowerCase();
            return (
                u.name?.toLowerCase().includes(q) ||
                u.unit_code?.toLowerCase().includes(q) ||
                u.division?.name?.toLowerCase().includes(q) ||
                u.division?.division_code?.toLowerCase().includes(q) ||
                u.description?.toLowerCase().includes(q)
            );
        });
    }, [units, search, divisionFilter]);

    // Active Tab Data & Pagination
    const activeData = activeTab === 'divisions' ? filteredDivisions : filteredUnits;
    const totalPages = Math.ceil(activeData.length / itemsPerPage) || 1;
    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return activeData.slice(start, start + itemsPerPage);
    }, [activeData, currentPage, itemsPerPage]);

    // Handlers for Division Modal
    const handleOpenCreateDivision = () => {
        setEditingDivision(null);
        setIsDivisionModalOpen(true);
    };

    const handleOpenEditDivision = (division) => {
        setEditingDivision(division);
        setIsDivisionModalOpen(true);
    };

    // Handlers for Unit Modal
    const handleOpenCreateUnit = (divisionId = '') => {
        setEditingUnit(null);
        setDefaultDivisionIdForUnit(divisionId ? String(divisionId) : '');
        setIsUnitModalOpen(true);
    };

    const handleOpenEditUnit = (unit) => {
        setEditingUnit(unit);
        setDefaultDivisionIdForUnit(unit.division_id ? String(unit.division_id) : '');
        setIsUnitModalOpen(true);
    };

    // Submit Delete
    const submitDelete = (e) => {
        if (e?.preventDefault) e.preventDefault();
        if (!confirmingDelete) return;

        if (confirmingDelete.type === 'division') {
            deleteForm.delete(route('divisions.destroy', confirmingDelete.item.id), {
                preserveScroll: true,
                onSuccess: () => setConfirmingDelete(null),
            });
        } else if (confirmingDelete.type === 'unit') {
            deleteForm.delete(route('units.destroy', confirmingDelete.item.id), {
                preserveScroll: true,
                onSuccess: () => setConfirmingDelete(null),
            });
        }
    };

    return (
        <AdminLayout>
            <Head title="Master Divisi & Unit Kerja - RSJ Tampan" />

            {/* Minimalist Clean Header */}
            <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                        Master Divisi & Unit Kerja
                    </h1>
                    <p className="mt-0.5 text-xs text-slate-500">
                        Kelola struktur hierarki Bagian/Bidang dan Unit Kerja/Instalasi di lingkungan RS Jiwa Tampan.
                    </p>
                </div>

            </div>

            {/* Notification Alerts */}
            {success && (
                <div className="mb-4 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50/80 p-3.5 text-xs font-semibold text-emerald-900 shadow-2xs">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-200 text-emerald-900">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                    </div>
                    <p className="flex-1">{success}</p>
                </div>
            )}
            {error && (
                <div className="mb-4 flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50/80 p-3.5 text-xs font-semibold text-rose-900 shadow-2xs">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-rose-200 text-rose-900">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                        </svg>
                    </div>
                    <p className="flex-1">{error}</p>
                </div>
            )}


            {/* Table Container Card */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
                {/* Search & Action Toolbar specifically for active tab */}
                <div className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50/60 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-1 flex-wrap items-center gap-3">
                        {/* Search Input */}
                        <div className="relative w-full sm:w-72">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder={
                                    activeTab === 'divisions'
                                        ? 'Cari nama, kode divisi, kelompok...'
                                        : 'Cari nama unit, kode, instalasi...'
                                }
                                className="block w-full rounded-xl border border-slate-300 bg-white pl-9 pr-8 py-2 text-xs text-slate-800 placeholder-slate-400 font-medium transition focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                            />
                            {search && (
                                <button
                                    type="button"
                                    onClick={() => setSearch('')}
                                    className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                                >
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>

                        {/* Filter Bidang jika tab Unit Kerja aktif */}
                        {activeTab === 'units' && (
                            <select
                                value={divisionFilter}
                                onChange={(e) => setDivisionFilter(e.target.value)}
                                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition"
                            >
                                <option value="ALL">Semua Bagian / Bidang</option>
                                {divisions.map((d) => (
                                    <option key={d.id} value={d.id}>
                                        {d.name}
                                    </option>
                                ))}
                            </select>
                        )}

                        <div className="text-xs text-slate-500 font-medium">
                            <span className="font-bold text-slate-900">{activeData.length}</span> dari {activeTab === 'divisions' ? divisions.length : units.length} data
                        </div>
                    </div>

                    {/* Dedicated "+ Tambah" button on each respective tab */}
                    <div>
                        {activeTab === 'divisions' ? (
                            <button
                                type="button"
                                onClick={handleOpenCreateDivision}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-95 px-4 py-2 text-xs font-bold text-white shadow-2xs transition cursor-pointer"
                            >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                </svg>
                                 Tambah Bagian / Bidang
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={() => handleOpenCreateUnit()}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-95 px-4 py-2 text-xs font-bold text-white shadow-2xs transition cursor-pointer"
                            >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                </svg>
                                 Tambah Unit Kerja
                            </button>
                        )}
                    </div>
                </div>

                {/* TAB 1: DIVISIONS TABLE */}
                {activeTab === 'divisions' && (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-100">
                            <thead className="bg-slate-50 font-bold border-b border-slate-200 text-slate-700 uppercase tracking-wider text-xs">
                                <tr>
                                    <th className="w-16 px-4 py-3.5 text-center text-xs font-bold uppercase tracking-wider text-slate-700">
                                        No
                                    </th>
                                    <th className="w-44 px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-slate-700">
                                        Kode Divisi
                                    </th>
                                    <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-slate-700">
                                        Nama Bagian / Bidang
                                    </th>
                                    <th className="w-56 px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-slate-700">
                                        Kelompok Struktur
                                    </th>
                                    <th className="w-40 px-4 py-3.5 text-center text-xs font-bold uppercase tracking-wider text-slate-700">
                                        Unit Kerja Terkait
                                    </th>
                                    <th className="w-40 px-4 py-3.5 text-center text-xs font-bold uppercase tracking-wider text-slate-700">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {paginatedData.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-16 text-center bg-white">
                                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                                                🏛️
                                            </div>
                                            <p className="mt-3 text-sm font-bold text-slate-800">
                                                {search ? 'Tidak ada divisi yang cocok dengan pencarian' : 'Belum ada data divisi'}
                                            </p>
                                            <p className="mt-1 text-xs text-slate-500 font-medium">
                                                {search ? 'Coba ubah kata kunci pencarian.' : 'Mulai daftarkan divisi atau bidang baru.'}
                                            </p>
                                            {!search && (
                                                <button
                                                    type="button"
                                                    onClick={handleOpenCreateDivision}
                                                    className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition cursor-pointer"
                                                >
                                                    + Tambah Divisi Pertama
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedData.map((division, idx) => (
                                        <tr
                                            key={division.id}
                                            className="hover:bg-emerald-50/40 transition-colors duration-150"
                                        >
                                            <td className="whitespace-nowrap px-4 py-4 text-center text-xs font-semibold text-slate-500">
                                                #{(currentPage - 1) * itemsPerPage + idx + 1}
                                            </td>
                                            <td className="whitespace-nowrap px-5 py-4">
                                                <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-mono font-black text-emerald-900 border border-emerald-300">
                                                    {division.division_code}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="font-bold text-sm text-slate-900">{division.name}</div>
                                                {division.units && division.units.length > 0 && (
                                                    <div className="mt-1 flex flex-wrap gap-1">
                                                        {division.units.slice(0, 3).map((u) => (
                                                            <span key={u.id} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                                                                {u.name}
                                                            </span>
                                                        ))}
                                                        {division.units.length > 3 && (
                                                            <span className="text-[10px] text-slate-400 self-center">
                                                                +{division.units.length - 3} lainnya
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="whitespace-nowrap px-5 py-4 text-xs font-bold">
                                                {division.group === 'Pelayanan_Keperawatan' ? (
                                                    <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                                                        <span>🩺</span> Pelayanan & Keperawatan
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                                                        <span>🏢</span> Umum, Ren & Keuangan
                                                    </span>
                                                )}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-4 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => handleOpenCreateUnit(division.id)}
                                                    className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 border border-slate-300 hover:border-emerald-300 px-3 py-1 text-xs font-bold text-slate-700 transition cursor-pointer"
                                                    title="Tambah Unit di bawah divisi ini"
                                                >
                                                    <span>🏥</span>
                                                    <strong>{division.units_count ?? division.units?.length ?? 0}</strong> Unit
                                                    <span className="text-emerald-600 font-black">+</span>
                                                </button>
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-4 text-center">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenEditDivision(division)}
                                                        className="inline-flex items-center gap-1 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 hover:text-amber-900 active:scale-95 px-3 py-1.5 text-xs font-bold text-amber-800 shadow-2xs transition cursor-pointer"
                                                    >
                                                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                                                        </svg>
                                                        Edit
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setConfirmingDelete({ type: 'division', item: division })}
                                                        className="inline-flex items-center gap-1 rounded-xl border border-transparent hover:border-rose-300 bg-white hover:bg-rose-50 hover:text-rose-700 active:scale-95 px-2.5 py-1.5 text-xs font-bold text-slate-400 transition cursor-pointer"
                                                        title="Hapus Divisi"
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
                )}

                {/* TAB 2: UNITS TABLE */}
                {activeTab === 'units' && (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-100">
                            <thead className="bg-slate-50 font-bold border-b border-slate-200 text-slate-700 uppercase tracking-wider text-xs">
                                <tr>
                                    <th className="w-16 px-4 py-3.5 text-center text-xs font-bold uppercase tracking-wider text-slate-700">
                                        No
                                    </th>
                                    <th className="w-40 px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-slate-700">
                                        Kode Unit
                                    </th>
                                    <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-slate-700">
                                        Nama Unit Kerja / Instalasi
                                    </th>
                                    <th className="w-64 px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-slate-700">
                                        Bagian / Divisi Induk
                                    </th>
                                    <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-slate-700">
                                        Deskripsi / Tugas Pokok
                                    </th>
                                    <th className="w-36 px-4 py-3.5 text-center text-xs font-bold uppercase tracking-wider text-slate-700">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {paginatedData.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-16 text-center bg-white">
                                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                                                🏥
                                            </div>
                                            <p className="mt-3 text-sm font-bold text-slate-800">
                                                {search ? 'Tidak ada unit kerja yang cocok dengan pencarian' : 'Belum ada data unit kerja'}
                                            </p>
                                            <p className="mt-1 text-xs text-slate-500 font-medium">
                                                {search ? 'Coba ubah kata kunci pencarian.' : 'Mulai daftarkan instalasi atau unit kerja baru.'}
                                            </p>
                                            {!search && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleOpenCreateUnit()}
                                                    className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition cursor-pointer"
                                                >
                                                    + Tambah Unit Kerja Pertama
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedData.map((unit, idx) => (
                                        <tr
                                            key={unit.id}
                                            className="hover:bg-blue-50/40 transition-colors duration-150"
                                        >
                                            <td className="whitespace-nowrap px-4 py-4 text-center text-xs font-semibold text-slate-500">
                                                #{(currentPage - 1) * itemsPerPage + idx + 1}
                                            </td>
                                            <td className="whitespace-nowrap px-5 py-4">
                                                <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-mono font-black text-blue-900 border border-blue-300">
                                                    {unit.unit_code}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 font-bold text-sm text-slate-900">
                                                {unit.name}
                                            </td>
                                            <td className="px-5 py-4 text-xs font-bold">
                                                {unit.division ? (
                                                    <span className="inline-flex items-center gap-1 text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                                                        <span>🏛️</span> {unit.division.name} ({unit.division.division_code})
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400">-</span>
                                                )}
                                            </td>
                                            <td className="px-5 py-4 text-xs text-slate-600 font-medium line-clamp-2">
                                                {unit.description || '-'}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-4 text-center">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenEditUnit(unit)}
                                                        className="inline-flex items-center gap-1 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 hover:text-amber-900 active:scale-95 px-3 py-1.5 text-xs font-bold text-amber-800 shadow-2xs transition cursor-pointer"
                                                    >
                                                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                                                        </svg>
                                                        Edit
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setConfirmingDelete({ type: 'unit', item: unit })}
                                                        className="inline-flex items-center gap-1 rounded-xl border border-transparent hover:border-rose-300 bg-white hover:bg-rose-50 hover:text-rose-700 active:scale-95 px-2.5 py-1.5 text-xs font-bold text-slate-400 transition cursor-pointer"
                                                        title="Hapus Unit"
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
                )}

                {/* Pagination Component */}
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={activeData.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={(p) => setCurrentPage(p)}
                />
            </div>

            {/* Modal Form Tambah & Ubah Divisi */}
            <DivisionFormModal
                show={isDivisionModalOpen}
                onClose={() => {
                    setIsDivisionModalOpen(false);
                    setEditingDivision(null);
                }}
                division={editingDivision}
            />

            {/* Modal Form Tambah & Ubah Unit Kerja */}
            <UnitFormModal
                show={isUnitModalOpen}
                onClose={() => {
                    setIsUnitModalOpen(false);
                    setEditingUnit(null);
                }}
                unit={editingUnit}
                divisions={divisions}
                defaultDivisionId={defaultDivisionIdForUnit}
            />

            {/* Delete Confirmation Card Modal Pop-Up */}
            <DeleteConfirmationModal
                show={confirmingDelete !== null}
                onClose={() => setConfirmingDelete(null)}
                onConfirm={submitDelete}
                processing={deleteForm.processing}
                title={confirmingDelete?.type === 'division' ? 'Hapus Data Bagian / Bidang?' : 'Hapus Data Unit Kerja?'}
                message={
                    confirmingDelete?.type === 'division'
                        ? 'Data Bagian / Bidang ini akan dihapus secara permanen dari struktur organisasi RS Jiwa Tampan.'
                        : 'Data Unit Kerja ini akan dihapus secara permanen dari struktur organisasi RS Jiwa Tampan.'
                }
                itemName={confirmingDelete?.item?.name}
                itemCode={
                    confirmingDelete?.type === 'division'
                        ? confirmingDelete?.item?.division_code
                        : confirmingDelete?.item?.unit_code
                }
                details={
                    confirmingDelete?.type === 'unit' && confirmingDelete?.item?.division ? (
                        <div className="flex items-center gap-2">
                            <span className="text-slate-500 font-semibold w-24 shrink-0">Induk Divisi:</span>
                            <span className="text-slate-900 font-bold">
                                {confirmingDelete.item.division.name}
                            </span>
                        </div>
                    ) : null
                }
                confirmText={confirmingDelete?.type === 'division' ? 'Ya, Hapus Divisi' : 'Ya, Hapus Unit'}
            />
        </AdminLayout>
    );
}
