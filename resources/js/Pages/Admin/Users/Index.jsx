import AdminLayout from '@/Layouts/AdminLayout';
import Pagination from '@/Components/Pagination';
import UserFormModal from './Partials/UserFormModal';
import DeleteConfirmationModal from '@/Components/DeleteConfirmationModal';
import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';

const getRoleBadge = (role) => {
    switch (role) {
        case 'admin':
            return {
                label: 'Admin SIM-RS',
                bg: 'bg-purple-100 text-purple-900 border-purple-300',
                dot: 'bg-purple-500',
            };
        case 'divisi':
            return {
                label: 'Unit Pemohon',
                bg: 'bg-blue-100 text-blue-900 border-blue-300',
                dot: 'bg-blue-500',
            };
        case 'perencanaan':
            return {
                label: 'Perencanaan',
                bg: 'bg-amber-100 text-amber-900 border-amber-300',
                dot: 'bg-amber-500',
            };
        case 'keuangan':
            return {
                label: 'Keuangan',
                bg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
                dot: 'bg-emerald-500',
            };
        default:
            return {
                label: role || 'Pengguna',
                bg: 'bg-slate-100 text-slate-800 border-slate-300',
                dot: 'bg-slate-400',
            };
    }
};

export default function Index({ users = [], divisions = [], success, error }) {
    const currentAuthUser = usePage().props.auth?.user;
    const { url } = usePage();

    // Helper to get params from url or window.location
    const getInitialParams = () => {
        if (typeof window === 'undefined') return { role: 'ALL', division: 'ALL' };
        const params = new URLSearchParams(window.location.search);
        return {
            role: params.get('role') || 'ALL',
            division: params.get('division') || params.get('division_id') || 'ALL',
        };
    };

    const initial = getInitialParams();
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState(initial.role);
    const [divisionFilter, setDivisionFilter] = useState(initial.division);
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [deletingUser, setDeletingUser] = useState(null);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    const { delete: destroy, processing } = useForm();

    // Update URL history without full page reload
    const updateUrl = (role, div) => {
        if (typeof window === 'undefined') return;
        const currentUrl = new URL(window.location.href);
        if (role && role !== 'ALL') {
            currentUrl.searchParams.set('role', role);
        } else {
            currentUrl.searchParams.delete('role');
        }
        if (div && div !== 'ALL') {
            currentUrl.searchParams.set('division', div);
        } else {
            currentUrl.searchParams.delete('division');
            currentUrl.searchParams.delete('division_id');
        }
        window.history.replaceState({}, '', currentUrl.toString());
    };

    // Sync state with URL query parameters when navigating (e.g. from sidebar links)
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const params = new URLSearchParams(window.location.search);
        const roleParam = params.get('role');
        const divParam = params.get('division') || params.get('division_id');

        if (roleParam) {
            setRoleFilter(roleParam);
        } else if (!divParam) {
            setRoleFilter('ALL');
        }

        if (divParam) {
            const matched = divisions.find(
                (d) => String(d.id) === String(divParam) || d.division_code === divParam
            );
            if (matched) {
                setDivisionFilter(String(matched.id));
            } else {
                setDivisionFilter(divParam);
            }
        } else {
            setDivisionFilter('ALL');
        }
    }, [url, divisions]);

    const filteredUsers = useMemo(() => {
        return users.filter((u) => {
            const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
            const matchesDivision =
                divisionFilter === 'ALL' ||
                String(u.division_id) === String(divisionFilter) ||
                u.division?.division_code === divisionFilter;
            const matchesStatus =
                statusFilter === 'ALL' ||
                (statusFilter === 'ACTIVE' && u.is_active) ||
                (statusFilter === 'INACTIVE' && !u.is_active);

            if (!matchesRole || !matchesDivision || !matchesStatus) return false;

            if (!search.trim()) return true;
            const q = search.toLowerCase();
            return (
                u.name?.toLowerCase().includes(q) ||
                u.nip?.toLowerCase().includes(q) ||
                u.email?.toLowerCase().includes(q) ||
                u.position?.toLowerCase().includes(q) ||
                u.phone?.toLowerCase().includes(q) ||
                u.division?.name?.toLowerCase().includes(q) ||
                u.division?.division_code?.toLowerCase().includes(q) ||
                u.unit?.name?.toLowerCase().includes(q) ||
                u.unit?.unit_code?.toLowerCase().includes(q)
            );
        });
    }, [users, search, roleFilter, divisionFilter, statusFilter]);

    useEffect(() => {
        setCurrentPage(1);
    }, [search, roleFilter, divisionFilter, statusFilter]);

    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage) || 1;
    const paginatedUsers = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredUsers.slice(start, start + itemsPerPage);
    }, [filteredUsers, currentPage, itemsPerPage]);

    const confirmDelete = (u) => {
        setDeletingUser(u);
    };

    const handleDelete = () => {
        if (!deletingUser) return;
        destroy(route('users.destroy', deletingUser.id), {
            onSuccess: () => setDeletingUser(null),
        });
    };

    const handleToggleStatus = (u) => {
        router.patch(route('users.toggle-status', u.id), {}, {
            preserveScroll: true,
        });
    };

    return (
        <AdminLayout>
            <Head title="Manajemen Pengguna - RSJ Tampan" />

            {/* 1. Header Minimalis (Sesuai Desain Master Divisi & Unit Kerja) */}
            <div className="mb-6">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Manajemen Pengguna & Pegawai RSJ
                </h1>
                <p className="mt-1 text-xs sm:text-sm text-slate-500 font-medium">
                    Kelola akun login, unit penugasan, dan hak akses staf di lingkungan RS Jiwa Tampan.
                </p>
            </div>

            {/* Alerts */}
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
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                        </svg>
                    </div>
                    <p className="flex-1">{error}</p>
                </div>
            )}

            {/* 2. Main Card Container (Minimalis Putih Bersih) */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
                {/* Single Row Toolbar (Persis Referensi Master Divisi & Unit Kerja) */}
                <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 bg-white">
                    <div className="flex flex-wrap items-center gap-2.5">
                        {/* Search Input */}
                        <div className="relative w-full sm:w-64">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari nama, NIP, email, unit..."
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

                        {/* Filter Bagian / Bidang */}
                        <select
                            value={divisionFilter}
                            onChange={(e) => {
                                setDivisionFilter(e.target.value);
                                updateUrl(roleFilter, e.target.value);
                            }}
                            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition cursor-pointer"
                        >
                            <option value="ALL">Semua Bagian / Bidang</option>
                            {divisions.map((d) => (
                                <option key={d.id} value={d.id}>
                                    {d.name}
                                </option>
                            ))}
                        </select>

                        {/* Filter Peran / Hak Akses */}
                        <select
                            value={roleFilter}
                            onChange={(e) => {
                                setRoleFilter(e.target.value);
                                updateUrl(e.target.value, divisionFilter);
                            }}
                            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition cursor-pointer"
                        >
                            <option value="ALL">Semua Peran</option>
                            <option value="divisi">Unit Pemohon</option>
                            <option value="perencanaan">Bagian Perencanaan</option>
                            <option value="keuangan">Bagian Keuangan</option>
                            <option value="admin">Administrator</option>
                        </select>

                        {/* Data Counter */}
                        <div className="text-xs text-slate-500 font-medium whitespace-nowrap">
                            <span className="font-bold text-slate-900">{filteredUsers.length}</span> dari {users.length} data
                        </div>
                    </div>

                    {/* Dedicated Action Button on the Right */}
                    <div>
                        <button
                            type="button"
                            onClick={() => setIsCreateOpen(true)}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-95 px-4 py-2 text-xs font-bold text-white shadow-2xs transition cursor-pointer whitespace-nowrap"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                             Tambah Pengguna
                        </button>
                    </div>
                </div>

                {/* 3. Table Minimalis (Persis Referensi Screenshot) */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-100">
                        <thead className="bg-slate-50 font-bold border-b border-slate-200 text-slate-700 uppercase tracking-wider text-xs">
                            <tr>
                                <th className="w-14 px-4 py-3.5 text-center text-xs font-bold uppercase tracking-wider text-slate-700">
                                    No
                                </th>
                                <th className="w-36 px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-slate-700">
                                    NIP / ID
                                </th>
                                <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-slate-700">
                                    Nama Pegawai / Akun
                                </th>
                                <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-slate-700">
                                    Bagian / Divisi Induk
                                </th>
                                <th className="w-48 px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-slate-700">
                                    Unit Kerja / Jabatan
                                </th>
                                <th className="w-36 px-4 py-3.5 text-center text-xs font-bold uppercase tracking-wider text-slate-700">
                                    Peran
                                </th>
                                <th className="w-28 px-4 py-3.5 text-center text-xs font-bold uppercase tracking-wider text-slate-700">
                                    Status
                                </th>
                                <th className="w-36 px-4 py-3.5 text-center text-xs font-bold uppercase tracking-wider text-slate-700">
                                    Aksi
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="px-6 py-16 text-center bg-white">
                                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                                            👥
                                        </div>
                                        <p className="mt-3 text-sm font-bold text-slate-800">
                                            Tidak ada data pengguna yang sesuai
                                        </p>
                                        <p className="mt-1 text-xs text-slate-500 font-medium">
                                            Coba ubah kata kunci atau ganti filter bagian/peran.
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                paginatedUsers.map((u, idx) => {
                                    const roleBadge = getRoleBadge(u.role);
                                    const isSelf = currentAuthUser?.id === u.id;

                                    return (
                                        <tr
                                            key={u.id}
                                            className={`hover:bg-slate-50/80 transition-colors duration-150 ${
                                                !u.is_active ? 'bg-slate-50/50 opacity-75' : ''
                                            }`}
                                        >
                                            {/* No */}
                                            <td className="whitespace-nowrap px-4 py-4 text-center text-xs font-semibold text-slate-400">
                                                #{(currentPage - 1) * itemsPerPage + idx + 1}
                                            </td>

                                            {/* NIP / Kode Unit Style */}
                                            <td className="whitespace-nowrap px-5 py-4">
                                                <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-mono font-black text-blue-900 border border-blue-300">
                                                    {u.nip || 'NON-PNS'}
                                                </span>
                                            </td>

                                            {/* Nama Pegawai & Email */}
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-1.5 font-bold text-sm text-slate-900">
                                                    <span>{u.name}</span>
                                                    {isSelf && (
                                                        <span className="rounded-md bg-emerald-100 px-1.5 py-0.5 text-[10px] font-black text-emerald-800">
                                                            Anda
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-xs text-slate-500 font-medium mt-0.5">
                                                    {u.email}
                                                </div>
                                            </td>

                                            {/* Bagian / Divisi Induk */}
                                            <td className="px-5 py-4 text-xs font-bold">
                                                {u.division ? (
                                                    <span className="inline-flex items-center gap-1 text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                                                        <span>🏛️</span> {u.division.name} ({u.division.division_code})
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400 font-normal">-</span>
                                                )}
                                            </td>

                                            {/* Unit Kerja / Jabatan */}
                                            <td className="px-5 py-4">
                                                <div className="text-xs font-bold text-slate-800">
                                                    {u.unit ? u.unit.name : '-'}
                                                </div>
                                                <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                                                    {u.position || 'Pegawai / Staf'}
                                                </div>
                                            </td>

                                            {/* Peran */}
                                            <td className="whitespace-nowrap px-4 py-4 text-center">
                                                <span
                                                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold border ${roleBadge.bg}`}
                                                >
                                                    <span className={`h-1.5 w-1.5 rounded-full ${roleBadge.dot}`} />
                                                    {roleBadge.label}
                                                </span>
                                            </td>

                                            {/* Status */}
                                            <td className="whitespace-nowrap px-4 py-4 text-center">
                                                {u.is_active ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => !isSelf && handleToggleStatus(u)}
                                                        disabled={isSelf}
                                                        className={`inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200 transition ${
                                                            isSelf ? 'cursor-default' : 'hover:bg-emerald-100 cursor-pointer'
                                                        }`}
                                                        title={isSelf ? 'Akun Anda' : 'Klik untuk Nonaktifkan'}
                                                    >
                                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                                        Aktif
                                                    </button>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => !isSelf && handleToggleStatus(u)}
                                                        disabled={isSelf}
                                                        className={`inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600 border border-slate-300 transition ${
                                                            isSelf ? 'cursor-default' : 'hover:bg-slate-200 cursor-pointer'
                                                        }`}
                                                        title={isSelf ? 'Akun Anda' : 'Klik untuk Aktifkan'}
                                                    >
                                                        <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                                                        Nonaktif
                                                    </button>
                                                )}
                                            </td>

                                            {/* Aksi (Persis Desain Master Divisi: Edit Amber + Trash Icon) */}
                                            <td className="whitespace-nowrap px-4 py-4 text-center">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => setEditingUser(u)}
                                                        className="inline-flex items-center gap-1 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 hover:text-amber-900 active:scale-95 px-3 py-1.5 text-xs font-bold text-amber-800 shadow-2xs transition cursor-pointer"
                                                    >
                                                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
                                                        </svg>
                                                        Edit
                                                    </button>

                                                    {!isSelf && (
                                                        <button
                                                            type="button"
                                                            onClick={() => confirmDelete(u)}
                                                            className="inline-flex items-center gap-1 rounded-xl border border-transparent hover:border-rose-300 bg-white hover:bg-rose-50 hover:text-rose-700 active:scale-95 px-2.5 py-1.5 text-xs font-bold text-slate-400 transition cursor-pointer"
                                                            title="Hapus Pengguna"
                                                        >
                                                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                                            </svg>
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Component */}
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={filteredUsers.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={(p) => setCurrentPage(p)}
                />
            </div>

            {/* Delete Confirmation Card Modal Pop-Up */}
            <DeleteConfirmationModal
                show={Boolean(deletingUser)}
                onClose={() => setDeletingUser(null)}
                onConfirm={handleDelete}
                processing={processing}
                title="Hapus Akun Pengguna?"
                message="Akun pengguna ini akan dihapus secara permanen dari sistem E-BLUD RS Jiwa Tampan."
                itemName={deletingUser?.name}
                itemCode={deletingUser?.nip || deletingUser?.email}
                confirmText="Ya, Hapus Akun"
            />

            {/* Create User Modal */}
            <UserFormModal
                show={isCreateOpen}
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                user={null}
                divisions={divisions}
            />

            {/* Edit User Modal */}
            <UserFormModal
                show={Boolean(editingUser)}
                isOpen={Boolean(editingUser)}
                onClose={() => setEditingUser(null)}
                user={editingUser}
                divisions={divisions}
            />
        </AdminLayout>
    );
}
