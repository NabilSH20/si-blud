import AdminLayout from '@/Layouts/AdminLayout';
import Pagination from '@/Components/Pagination';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';

const getRoleBadge = (role) => {
    switch (role) {
        case 'admin':
            return {
                label: 'Administrator',
                bg: 'bg-purple-100 text-purple-900 border-purple-300',
                dot: 'bg-purple-500',
            };
        case 'divisi':
            return {
                label: 'Divisi / Pemohon',
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

export default function Index({ users = [], success, error }) {
    const currentAuthUser = usePage().props.auth?.user;
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('ALL');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [deletingUser, setDeletingUser] = useState(null);

    const { delete: destroy, processing } = useForm();

    const filteredUsers = useMemo(() => {
        return users.filter((u) => {
            const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
            if (!search.trim()) return matchesRole;
            const q = search.toLowerCase();
            const matchesSearch =
                u.name?.toLowerCase().includes(q) ||
                u.email?.toLowerCase().includes(q) ||
                u.division?.name?.toLowerCase().includes(q) ||
                u.division?.division_code?.toLowerCase().includes(q);
            return matchesRole && matchesSearch;
        });
    }, [users, search, roleFilter]);

    useEffect(() => {
        setCurrentPage(1);
    }, [search, roleFilter]);

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

    return (
        <AdminLayout>
            <Head title="Manajemen Pengguna - RSJ Tampan" />

            {/* Header Section */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="flex items-center gap-2.5">
                        <h2 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
                            Manajemen Pengguna
                        </h2>
                        <span className="inline-flex items-center rounded-full bg-purple-100 px-3 py-1 text-xs font-black text-purple-900 border border-purple-300">
                            {users.length} Akun Terdaftar
                        </span>
                    </div>
                    <p className="mt-1 text-xs sm:text-sm text-slate-600 font-medium">
                        Kelola akun pengguna, peran akses (Admin, Divisi, Perencanaan, Keuangan), dan penugasan unit kerja staf.
                    </p>
                </div>

                <Link
                    href={route('users.create')}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 px-5 py-2.5 text-sm font-bold text-white shadow-md hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Tambah Pengguna
                </Link>
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
                <div className="flex flex-col gap-3 border-b border-emerald-100 bg-gradient-to-r from-emerald-50/70 via-teal-50/30 to-slate-50/50 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-1 flex-col gap-2.5 sm:flex-row sm:items-center">
                        <div className="relative flex-1 sm:max-w-xs">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari nama, email, atau divisi..."
                                className="block w-full rounded-xl border border-slate-300 bg-white pl-9 pr-8 py-2 text-sm text-slate-900 placeholder-slate-400 font-medium transition focus:border-emerald-600 focus:ring-1 focus:ring-emerald-500"
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

                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
                            <button
                                type="button"
                                onClick={() => setRoleFilter('ALL')}
                                className={`rounded-lg px-3 py-1.5 font-bold transition border ${
                                    roleFilter === 'ALL'
                                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                }`}
                            >
                                Semua ({users.length})
                            </button>
                            <button
                                type="button"
                                onClick={() => setRoleFilter('admin')}
                                className={`rounded-lg px-3 py-1.5 font-bold transition border ${
                                    roleFilter === 'admin'
                                        ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                }`}
                            >
                                Admin
                            </button>
                            <button
                                type="button"
                                onClick={() => setRoleFilter('divisi')}
                                className={`rounded-lg px-3 py-1.5 font-bold transition border ${
                                    roleFilter === 'divisi'
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                }`}
                            >
                                Divisi
                            </button>
                            <button
                                type="button"
                                onClick={() => setRoleFilter('perencanaan')}
                                className={`rounded-lg px-3 py-1.5 font-bold transition border ${
                                    roleFilter === 'perencanaan'
                                        ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                }`}
                            >
                                Perencanaan
                            </button>
                            <button
                                type="button"
                                onClick={() => setRoleFilter('keuangan')}
                                className={`rounded-lg px-3 py-1.5 font-bold transition border ${
                                    roleFilter === 'keuangan'
                                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                }`}
                            >
                                Keuangan
                            </button>
                        </div>
                    </div>

                    <div className="text-xs sm:text-sm text-slate-500 font-medium">
                        Menampilkan <span className="font-bold text-slate-900">{filteredUsers.length}</span> dari {users.length} pengguna
                    </div>
                </div>

                {/* Soft Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-emerald-100">
                        <thead className="bg-gradient-to-r from-emerald-50/90 via-teal-50/40 to-emerald-50/90 font-bold border-b border-emerald-100 text-emerald-950 uppercase tracking-wider text-xs">
                            <tr>
                                <th className="w-16 px-4 py-3.5 text-center text-xs font-bold uppercase tracking-wider text-emerald-950">
                                    No
                                </th>
                                <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-emerald-950">
                                    Nama Lengkap & Email
                                </th>
                                <th className="w-48 px-5 py-3.5 text-center text-xs font-bold uppercase tracking-wider text-emerald-950">
                                    Peran (Role)
                                </th>
                                <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-emerald-950">
                                    Unit Kerja / Divisi
                                </th>
                                <th className="w-36 px-4 py-3.5 text-center text-xs font-bold uppercase tracking-wider text-emerald-950">
                                    Aksi
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-16 text-center bg-white">
                                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                                            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                                            </svg>
                                        </div>
                                        <p className="mt-3 text-sm font-bold text-slate-800">
                                            {search || roleFilter !== 'ALL'
                                                ? 'Tidak ada pengguna yang sesuai dengan filter'
                                                : 'Belum ada pengguna terdaftar'}
                                        </p>
                                        <p className="mt-1 text-xs text-slate-500 font-medium">
                                            {search || roleFilter !== 'ALL'
                                                ? 'Coba ubah kata kunci atau ganti filter peran.'
                                                : 'Mulai daftarkan akun staf baru untuk sistem E-BLUD RSJ Tampan.'}
                                        </p>
                                        {!search && roleFilter === 'ALL' && (
                                            <Link
                                                href={route('users.create')}
                                                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition"
                                            >
                                                + Tambah Pengguna Pertama
                                            </Link>
                                        )}
                                    </td>
                                </tr>
                            ) : (
                                paginatedUsers.map((u, idx) => {
                                    const roleBadge = getRoleBadge(u.role);
                                    const isSelf = currentAuthUser?.id === u.id;

                                    return (
                                        <tr
                                            key={u.id}
                                            className="hover:bg-emerald-50/40 transition-colors duration-150"
                                        >
                                            {/* No */}
                                            <td className="whitespace-nowrap px-4 py-4 text-center text-xs font-semibold text-slate-500">
                                                #{(currentPage - 1) * itemsPerPage + idx + 1}
                                            </td>

                                            {/* Nama & Email */}
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 font-black text-xs text-slate-700 border border-slate-200">
                                                        {u.name?.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-bold text-slate-900 truncate">
                                                                {u.name}
                                                            </span>
                                                            {isSelf && (
                                                                <span className="inline-flex rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-black text-emerald-800 border border-emerald-300">
                                                                    Akun Anda
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-slate-500 font-medium truncate">
                                                            {u.email}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Role Badge (PRD: Admin=Purple, Divisi=Blue, Perencanaan=Amber, Keuangan=Emerald) */}
                                            <td className="whitespace-nowrap px-5 py-4 text-center">
                                                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border ${roleBadge.bg}`}>
                                                    <span className={`h-1.5 w-1.5 rounded-full ${roleBadge.dot}`} />
                                                    {roleBadge.label}
                                                </span>
                                            </td>

                                            {/* Divisi */}
                                            <td className="px-5 py-4">
                                                {u.division ? (
                                                    <div className="flex items-center gap-2">
                                                        <span className="inline-flex rounded-md bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-800 border border-slate-200">
                                                            {u.division.division_code}
                                                        </span>
                                                        <span className="text-sm font-semibold text-slate-800">
                                                            {u.division.name}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-slate-400 italic">
                                                        - (Tingkat RS / Non-Divisi)
                                                    </span>
                                                )}
                                            </td>

                                            {/* Aksi */}
                                            <td className="whitespace-nowrap px-4 py-4 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <Link
                                                        href={route('users.edit', u.id)}
                                                        className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 active:scale-95 px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs transition"
                                                        title="Edit Pengguna"
                                                    >
                                                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                                        </svg>
                                                        Edit
                                                    </Link>

                                                    {!isSelf && (
                                                        <button
                                                            type="button"
                                                            onClick={() => confirmDelete(u)}
                                                            className="inline-flex items-center gap-1 rounded-xl border border-transparent hover:border-rose-300 bg-white hover:bg-rose-50 hover:text-rose-700 active:scale-95 px-2.5 py-1.5 text-xs font-bold text-slate-400 transition"
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

            {/* Delete Confirmation Modal */}
            {deletingUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                    <div className="w-full max-w-md rounded-2xl border-2 border-slate-300 bg-white p-6 shadow-2xl space-y-4">
                        <div className="flex items-center gap-3 text-rose-600">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-100">
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                                </svg>
                            </div>
                            <h3 className="text-base font-black text-slate-900">Konfirmasi Hapus Pengguna</h3>
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed font-medium">
                            Apakah Anda yakin ingin menghapus akun pengguna <span className="font-bold text-slate-800">{deletingUser.name}</span> ({deletingUser.email})? Tindakan ini tidak dapat dibatalkan.
                        </p>

                        <div className="flex items-center justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setDeletingUser(null)}
                                className="rounded-xl border-2 border-slate-300 bg-white px-5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
                            >
                                Batalkan
                            </button>
                            <button
                                type="button"
                                onClick={handleDelete}
                                disabled={processing}
                                className="rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white px-5 py-2 text-xs font-black shadow-md transition disabled:opacity-50"
                            >
                                Ya, Hapus Akun
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
