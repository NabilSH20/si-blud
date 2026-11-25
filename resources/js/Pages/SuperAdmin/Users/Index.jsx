import DeleteConfirmationModal from '@/Components/DeleteConfirmationModal';
import InputError from '@/Components/InputError';
import Modal from '@/Components/Modal';
import Pagination from '@/Components/Pagination';
import SuperAdminLayout from '@/Layouts/SuperAdminLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import {
    Eye,
    KeyRound,
    Pencil,
    Plus,
    Search,
    Trash2,
    Users,
    X,
} from 'lucide-react';

export default function Index({ users = [], divisions = [], success, error }) {
    const { auth } = usePage().props;
    const currentUserId = auth?.user?.id;

    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('ALL');
    const [divisionFilter, setDivisionFilter] = useState('ALL');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Modals
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [deletingUser, setDeletingUser] = useState(null);
    const [resettingUser, setResettingUser] = useState(null);

    // Form for Create / Edit
    const {
        data: formData,
        setData: setFormData,
        post: postUser,
        put: putUser,
        processing: formProcessing,
        errors: formErrors,
        reset: resetForm,
    } = useForm({
        name: '',
        nip: '',
        nik: '',
        email: '',
        position: '',
        phone: '',
        role: 'divisi',
        division_id: '',
        unit_id: '',
        password: '',
        is_active: true,
    });

    // Form for Reset Password
    const {
        data: passwordData,
        setData: setPasswordData,
        post: postPassword,
        processing: passwordProcessing,
        errors: passwordErrors,
        reset: resetPasswordForm,
    } = useForm({
        password: '',
    });

    const filteredUsers = useMemo(() => {
        return users.filter((u) => {
            const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
            const matchesDivision =
                divisionFilter === 'ALL' || String(u.division_id) === String(divisionFilter);
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
                u.nik?.toLowerCase().includes(q) ||
                u.email?.toLowerCase().includes(q) ||
                u.position?.toLowerCase().includes(q) ||
                u.division?.name?.toLowerCase().includes(q) ||
                u.unit?.name?.toLowerCase().includes(q)
            );
        });
    }, [users, search, roleFilter, divisionFilter, statusFilter]);

    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage) || 1;
    const paginatedUsers = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredUsers.slice(start, start + itemsPerPage);
    }, [filteredUsers, currentPage, itemsPerPage]);

    // Handle Open Create Modal
    const openCreateModal = () => {
        resetForm();
        setFormData({
            name: '',
            nip: '',
            nik: '',
            email: '',
            position: '',
            phone: '',
            role: 'divisi',
            division_id: '',
            unit_id: '',
            password: '',
            is_active: true,
        });
        setIsCreateOpen(true);
    };

    // Handle Open Edit Modal
    const openEditModal = (u) => {
        resetForm();
        setFormData({
            name: u.name || '',
            nip: u.nip || '',
            nik: u.nik || '',
            email: u.email || '',
            position: u.position || '',
            phone: u.phone || '',
            role: u.role || 'divisi',
            division_id: u.division_id ? String(u.division_id) : '',
            unit_id: u.unit_id ? String(u.unit_id) : '',
            password: '',
            is_active: Boolean(u.is_active),
        });
        setEditingUser(u);
    };

    // Submit Create or Edit
    const handleFormSubmit = (e) => {
        e.preventDefault();
        if (editingUser) {
            putUser(route('superadmin.users.update', editingUser.id), {
                onSuccess: () => setEditingUser(null),
            });
        } else {
            postUser(route('superadmin.users.store'), {
                onSuccess: () => setIsCreateOpen(false),
            });
        }
    };

    // Impersonate
    const handleImpersonate = (u) => {
        if (confirm(`Mulai mode troubleshooting dan login atas nama ${u.name}?`)) {
            router.post(route('superadmin.impersonate.start', u.id));
        }
    };

    // Toggle Status
    const handleToggleStatus = (u) => {
        router.patch(route('superadmin.users.toggle-status', u.id), {}, { preserveScroll: true });
    };

    // Delete
    const handleDelete = () => {
        if (!deletingUser) return;
        router.delete(route('superadmin.users.destroy', deletingUser.id), {
            preserveScroll: true,
            onSuccess: () => setDeletingUser(null),
        });
    };

    // Reset Password Submit
    const handleResetPassword = (e) => {
        e.preventDefault();
        if (!resettingUser) return;
        postPassword(route('superadmin.users.reset-password', resettingUser.id), {
            preserveScroll: true,
            onSuccess: () => {
                setResettingUser(null);
                resetPasswordForm();
            },
        });
    };

    // Units for division dropdown in modal
    const availableUnits = useMemo(() => {
        if (!formData.division_id) return [];
        const div = divisions.find((d) => String(d.id) === String(formData.division_id));
        return div?.units || [];
    }, [divisions, formData.division_id]);

    const getRoleBadge = (role) => {
        switch (role) {
            case 'super_admin':
                return {
                    label: 'Super Admin',
                    bg: 'bg-slate-100 text-slate-800 border-slate-300',
                    dot: 'bg-slate-600',
                };
            case 'admin':
                return {
                    label: 'Admin SIM-RS',
                    bg: 'bg-purple-50 text-purple-800 border-purple-200',
                    dot: 'bg-purple-600',
                };
            case 'perencanaan':
                return {
                    label: 'Perencanaan',
                    bg: 'bg-amber-50 text-amber-800 border-amber-200',
                    dot: 'bg-amber-600',
                };
            case 'keuangan':
                return {
                    label: 'Keuangan',
                    bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
                    dot: 'bg-emerald-600',
                };
            case 'divisi':
                return {
                    label: 'Unit Pemohon',
                    bg: 'bg-blue-50 text-blue-800 border-blue-200',
                    dot: 'bg-blue-600',
                };
            default:
                return {
                    label: role,
                    bg: 'bg-slate-100 text-slate-700 border-slate-300',
                    dot: 'bg-slate-500',
                };
        }
    };

    return (
        <SuperAdminLayout>
            <Head title="Manajemen Pengguna - Super Admin SIM-RS" />

            {/* 1. Header Minimalis (Persis Desain Admin Manajemen Pengguna) */}
            <div className="mb-6">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Manajemen Akun Pengguna
                </h1>
                <p className="mt-1 text-xs sm:text-sm text-slate-500 font-medium">
                    Otoritas penuh mengelola akun seluruh pegawai, role sistem, reset password darurat, dan impersonasi troubleshooting.
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
                {/* Single Row Toolbar (Persis Referensi Admin Manajemen Pengguna) */}
                <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 bg-white">
                    <div className="flex flex-wrap items-center gap-2.5">
                        {/* Search Input */}
                        <div className="relative w-full sm:w-64">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                                <Search className="h-4 w-4" />
                            </div>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setCurrentPage(1);
                                }}
                                placeholder="Cari nama, NIP, email..."
                                className="block w-full rounded-xl border border-slate-300 bg-white pl-9 pr-8 py-2 text-xs text-slate-800 placeholder-slate-400 font-medium transition focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                            />
                            {search && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearch('');
                                        setCurrentPage(1);
                                    }}
                                    className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>

                        {/* Filter Peran */}
                        <select
                            value={roleFilter}
                            onChange={(e) => {
                                setRoleFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="rounded-xl border border-slate-300 bg-white pl-3 pr-8 py-2 text-xs font-semibold text-slate-700 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition cursor-pointer"
                        >
                            <option value="ALL">Semua Peran</option>
                            <option value="super_admin">Super Admin</option>
                            <option value="admin">Admin SIM-RS</option>
                            <option value="perencanaan">Perencanaan</option>
                            <option value="keuangan">Keuangan</option>
                            <option value="divisi">Unit Pemohon</option>
                        </select>

                        {/* Filter Bagian / Divisi */}
                        <select
                            value={divisionFilter}
                            onChange={(e) => {
                                setDivisionFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="rounded-xl border border-slate-300 bg-white pl-3 pr-8 py-2 text-xs font-semibold text-slate-700 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition cursor-pointer max-w-[210px] truncate"
                        >
                            <option value="ALL">Semua Bagian / Divisi</option>
                            {divisions.map((d) => (
                                <option key={d.id} value={d.id}>
                                    {d.name}
                                </option>
                            ))}
                        </select>

                        {/* Filter Status */}
                        <select
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="rounded-xl border border-slate-300 bg-white pl-3 pr-8 py-2 text-xs font-semibold text-slate-700 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition cursor-pointer"
                        >
                            <option value="ALL">Semua Status</option>
                            <option value="ACTIVE">Hanya Aktif</option>
                            <option value="INACTIVE">Hanya Nonaktif</option>
                        </select>

                        {(search || roleFilter !== 'ALL' || divisionFilter !== 'ALL' || statusFilter !== 'ALL') && (
                            <button
                                type="button"
                                onClick={() => {
                                    setSearch('');
                                    setRoleFilter('ALL');
                                    setDivisionFilter('ALL');
                                    setStatusFilter('ALL');
                                    setCurrentPage(1);
                                }}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 active:scale-95 px-4 py-2 text-xs font-bold text-slate-700 shadow-2xs transition cursor-pointer"
                            >
                                Reset
                            </button>
                        )}

                        {/* Data Counter */}
                        <div className="text-xs text-slate-500 font-medium whitespace-nowrap">
                            <span className="font-bold text-slate-900">{filteredUsers.length}</span> dari {users.length} data
                        </div>
                    </div>

                    {/* Dedicated Action Button on the Right */}
                    <div>
                        <button
                            type="button"
                            onClick={openCreateModal}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-95 px-4 py-2 text-xs font-bold text-white shadow-2xs transition cursor-pointer whitespace-nowrap"
                        >
                            <Plus className="h-4 w-4" />
                            Tambah Pengguna
                        </button>
                    </div>
                </div>

                {/* Table View */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-100">
                        <thead className="bg-slate-50 font-bold border-b border-slate-200 text-slate-700 uppercase tracking-wider text-xs">
                            <tr>
                                <th className="w-14 px-4 py-3.5 text-center">No</th>
                                <th className="px-5 py-3.5 text-left">Nama & Identitas</th>
                                <th className="px-5 py-3.5 text-left">Penugasan / Unit</th>
                                <th className="px-4 py-3.5 text-center">Peran Sistem</th>
                                <th className="px-4 py-3.5 text-center">Status Akun</th>
                                <th className="px-4 py-3.5 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                            {paginatedUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-16 text-center bg-white">
                                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                                            <Users className="h-6 w-6" />
                                        </div>
                                        <p className="mt-3 text-sm font-bold text-slate-800">
                                            Tidak ada akun pengguna yang sesuai kriteria pencarian
                                        </p>
                                        <p className="mt-1 text-xs text-slate-500 font-medium">
                                            Silakan atur kembali kata kunci atau opsi filter yang dipilih.
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                paginatedUsers.map((u, idx) => {
                                    const badge = getRoleBadge(u.role);
                                    const isSelf = u.id === currentUserId;
                                    const isSuper = u.role === 'super_admin';

                                    return (
                                        <tr
                                            key={u.id}
                                            className={`hover:bg-slate-50/80 transition-colors duration-150 ${
                                                !u.is_active ? 'bg-slate-50/50 opacity-75' : ''
                                            }`}
                                        >
                                            <td className="whitespace-nowrap px-4 py-4 text-center text-xs font-semibold text-slate-400">
                                                #{(currentPage - 1) * itemsPerPage + idx + 1}
                                            </td>

                                            {/* Nama & Identitas */}
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
                                                    {u.nip && (
                                                        <span className="ml-2 font-mono text-slate-600">
                                                            • NIP. {u.nip}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Penugasan / Unit */}
                                            <td className="px-5 py-4">
                                                <div className="text-xs font-bold text-slate-800">
                                                    {u.division?.name || '-'}
                                                </div>
                                                <div className="text-[11px] text-slate-400 font-medium mt-0.5">
                                                    {u.unit?.name || u.position || 'Staf Operasional'}
                                                </div>
                                            </td>

                                            {/* Peran Sistem */}
                                            <td className="px-4 py-4 text-center whitespace-nowrap">
                                                <span
                                                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold border ${badge.bg}`}
                                                >
                                                    <span className={`h-1.5 w-1.5 rounded-full ${badge.dot}`} />
                                                    {badge.label}
                                                </span>
                                            </td>

                                            {/* Status Akun */}
                                            <td className="px-4 py-4 text-center whitespace-nowrap">
                                                <button
                                                    type="button"
                                                    onClick={() => !isSelf && handleToggleStatus(u)}
                                                    disabled={isSelf}
                                                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold border transition ${
                                                        u.is_active
                                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                                            : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                                                    } ${isSelf ? 'cursor-default' : 'cursor-pointer'}`}
                                                    title={isSelf ? 'Anda tidak dapat menonaktifkan akun sendiri' : 'Klik untuk mengubah status aktif'}
                                                >
                                                    <span
                                                        className={`h-1.5 w-1.5 rounded-full ${
                                                            u.is_active ? 'bg-emerald-500' : 'bg-slate-400'
                                                        }`}
                                                    />
                                                    {u.is_active ? 'Aktif' : 'Nonaktif'}
                                                </button>
                                            </td>

                                            {/* Aksi Root (Diselaraskan dengan Desain Admin & Unit) */}
                                            <td className="px-4 py-4 text-center whitespace-nowrap">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    {/* Troubleshoot / Impersonate */}
                                                    {!isSuper && !isSelf && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleImpersonate(u)}
                                                            className="inline-flex items-center gap-1 rounded-xl border border-teal-200 bg-teal-50 hover:bg-teal-100 hover:text-teal-900 active:scale-95 px-2.5 py-1.5 text-xs font-bold text-teal-800 shadow-2xs transition cursor-pointer"
                                                            title="Investigasi akun staf (Mode Troubleshooting)"
                                                        >
                                                            <Eye className="h-3.5 w-3.5" />
                                                            Troubleshoot
                                                        </button>
                                                    )}

                                                    {/* Edit (Standar Amber Role Lain) */}
                                                    <button
                                                        type="button"
                                                        onClick={() => openEditModal(u)}
                                                        className="inline-flex items-center gap-1 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 hover:text-amber-900 active:scale-95 px-3 py-1.5 text-xs font-bold text-amber-800 shadow-2xs transition cursor-pointer"
                                                        title="Edit Data Pengguna"
                                                    >
                                                        <Pencil className="h-3.5 w-3.5" />
                                                        Edit
                                                    </button>

                                                    {/* Reset Password */}
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setResettingUser(u);
                                                            setPasswordData('password', '');
                                                        }}
                                                        className="inline-flex items-center gap-1 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 hover:text-amber-900 active:scale-95 px-2.5 py-1.5 text-xs font-bold text-amber-800 shadow-2xs transition cursor-pointer"
                                                        title="Reset Kata Sandi Darurat"
                                                    >
                                                        <KeyRound className="h-3.5 w-3.5" />
                                                    </button>

                                                    {/* Delete */}
                                                    {!isSelf && !isSuper && (
                                                        <button
                                                            type="button"
                                                            onClick={() => setDeletingUser(u)}
                                                            className="inline-flex items-center gap-1 rounded-xl border border-transparent hover:border-rose-300 bg-white hover:bg-rose-50 hover:text-rose-700 active:scale-95 px-2.5 py-1.5 text-xs font-bold text-slate-400 transition cursor-pointer"
                                                            title="Hapus Akun Pengguna"
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
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

                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={filteredUsers.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={(p) => setCurrentPage(p)}
                />
            </div>

            {/* Modal Tambah / Edit Pengguna */}
            <Modal
                show={isCreateOpen || Boolean(editingUser)}
                onClose={() => {
                    setIsCreateOpen(false);
                    setEditingUser(null);
                }}
                maxWidth="lg"
            >
                <form onSubmit={handleFormSubmit} className="p-6">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                        <div className="flex items-center gap-2.5">
                            <div className="rounded-xl bg-teal-50 p-2 text-teal-700 border border-teal-200">
                                <Users className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-slate-900">
                                    {editingUser ? `Edit Pengguna: ${editingUser.name}` : 'Tambah Pengguna Baru'}
                                </h3>
                                <p className="text-xs text-slate-500">
                                    Konfigurasi kredensial, peran hak akses, dan unit penugasan pegawai
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-5 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                    Nama Lengkap & Gelar <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData('name', e.target.value)}
                                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-medium text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 shadow-2xs"
                                    required
                                    placeholder="Contoh: drg. Ahmad Fauzi, Sp.BM"
                                />
                                <InputError message={formErrors.name} />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                    Alamat Email <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData('email', e.target.value)}
                                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-medium text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 shadow-2xs"
                                    required
                                    placeholder="nama@rsjtampan.riau.go.id"
                                />
                                <InputError message={formErrors.email} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                    NIP (PNS / PPPK)
                                </label>
                                <input
                                    type="text"
                                    value={formData.nip}
                                    onChange={(e) => setFormData('nip', e.target.value)}
                                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-mono text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 shadow-2xs"
                                    placeholder="198501012010011000"
                                />
                                <InputError message={formErrors.nip} />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                    NIK (KTP)
                                </label>
                                <input
                                    type="text"
                                    value={formData.nik}
                                    onChange={(e) => setFormData('nik', e.target.value)}
                                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-mono text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 shadow-2xs"
                                    placeholder="1471010101850000"
                                />
                                <InputError message={formErrors.nik} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                    Peran Sistem (Role) <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData('role', e.target.value)}
                                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-bold text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 shadow-2xs"
                                    required
                                >
                                    <option value="divisi">Unit Pemohon (Ruangan / Instalasi)</option>
                                    <option value="perencanaan">Bagian Perencanaan</option>
                                    <option value="keuangan">Bagian Keuangan</option>
                                    <option value="admin">Admin SIM-RS (Operasional)</option>
                                    <option value="super_admin">Super Admin (Root Master)</option>
                                </select>
                                <InputError message={formErrors.role} />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                    {editingUser ? 'Password Baru (Opsional)' : 'Password Awal *'}
                                </label>
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData('password', e.target.value)}
                                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-medium text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 shadow-2xs"
                                    placeholder={editingUser ? 'Kosongkan jika tidak diubah' : 'Minimal 8 karakter'}
                                    required={!editingUser}
                                />
                                <InputError message={formErrors.password} />
                            </div>
                        </div>

                        {formData.role === 'divisi' && (
                            <div className="rounded-xl bg-slate-50 p-4 border border-slate-200/80 space-y-4">
                                <span className="text-xs font-bold text-slate-800 block">
                                    Penugasan Unit Kerja Pemohon
                                </span>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                            Bagian / Divisi Induk <span className="text-rose-500">*</span>
                                        </label>
                                        <select
                                            value={formData.division_id}
                                            onChange={(e) => {
                                                setFormData({
                                                    ...formData,
                                                    division_id: e.target.value,
                                                    unit_id: '',
                                                });
                                            }}
                                            className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-medium text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 shadow-2xs"
                                            required
                                        >
                                            <option value="">-- Pilih Divisi --</option>
                                            {divisions.map((d) => (
                                                <option key={d.id} value={d.id}>
                                                    [{d.division_code}] {d.name}
                                                </option>
                                            ))}
                                        </select>
                                        <InputError message={formErrors.division_id} />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                            Unit Kerja / Ruangan <span className="text-rose-500">*</span>
                                        </label>
                                        <select
                                            value={formData.unit_id}
                                            onChange={(e) => setFormData('unit_id', e.target.value)}
                                            className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-medium text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 shadow-2xs disabled:bg-slate-100"
                                            disabled={!formData.division_id}
                                            required
                                        >
                                            <option value="">-- Pilih Unit Kerja --</option>
                                            {availableUnits.map((u) => (
                                                <option key={u.id} value={u.id}>
                                                    [{u.unit_code}] {u.name}
                                                </option>
                                            ))}
                                        </select>
                                        <InputError message={formErrors.unit_id} />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mt-6 flex items-center justify-end gap-2.5 border-t border-slate-200 pt-4">
                        <button
                            type="button"
                            onClick={() => {
                                setIsCreateOpen(false);
                                setEditingUser(null);
                            }}
                            className="rounded-xl border border-slate-300 bg-white hover:bg-slate-50 active:scale-95 px-4 py-2 text-xs font-bold text-slate-700 transition cursor-pointer shadow-2xs"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={formProcessing}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-95 px-4 py-2 text-xs font-bold text-white transition cursor-pointer shadow-2xs disabled:opacity-50"
                        >
                            {formProcessing
                                ? 'Menyimpan...'
                                : editingUser
                                ? 'Simpan Perubahan'
                                : 'Buat Pengguna'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Modal Reset Password Darurat */}
            <Modal show={Boolean(resettingUser)} onClose={() => setResettingUser(null)} maxWidth="sm">
                <form onSubmit={handleResetPassword} className="p-6">
                    <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
                        <div className="rounded-xl bg-amber-50 p-2.5 text-amber-700 border border-amber-200">
                            <KeyRound className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-slate-900">Reset Kata Sandi Darurat</h3>
                            <p className="text-xs text-slate-500">
                                Akun: <strong className="text-slate-800">{resettingUser?.name}</strong>
                            </p>
                        </div>
                    </div>

                    <div className="mt-4 space-y-3">
                        <div className="rounded-xl bg-amber-50/70 p-3 border border-amber-200/80 text-xs text-amber-800 leading-relaxed">
                            Password pengguna akan langsung diubah oleh Super Admin. Pastikan mengomunikasikan password baru ini kepada pemilik akun secara aman.
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                Kata Sandi Baru <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="password"
                                value={passwordData.password}
                                onChange={(e) => setPasswordData('password', e.target.value)}
                                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-medium text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 shadow-2xs"
                                placeholder="Minimal 8 karakter"
                                required
                            />
                            <InputError message={passwordErrors.password} />
                        </div>
                    </div>

                    <div className="mt-6 flex items-center justify-end gap-2.5 border-t border-slate-200 pt-4">
                        <button
                            type="button"
                            onClick={() => setResettingUser(null)}
                            className="rounded-xl border border-slate-300 bg-white hover:bg-slate-50 active:scale-95 px-4 py-2 text-xs font-bold text-slate-700 transition cursor-pointer shadow-2xs"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={passwordProcessing}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-95 px-4 py-2 text-xs font-bold text-white transition cursor-pointer shadow-2xs disabled:opacity-50"
                        >
                            {passwordProcessing ? 'Menyimpan...' : 'Perbarui Kata Sandi'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Modal Konfirmasi Hapus */}
            <DeleteConfirmationModal
                show={Boolean(deletingUser)}
                onClose={() => setDeletingUser(null)}
                onConfirm={handleDelete}
                title="Hapus Akun Pengguna?"
                message="Akun pengguna ini akan dihapus secara permanen dari sistem E-BLUD RS Jiwa Tampan."
                itemName={deletingUser?.name}
                itemCode={deletingUser?.nip || deletingUser?.email}
            />
        </SuperAdminLayout>
    );
}
