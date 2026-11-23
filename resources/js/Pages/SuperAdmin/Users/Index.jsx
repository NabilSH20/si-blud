import SuperAdminLayout from '@/Layouts/SuperAdminLayout';
import Pagination from '@/Components/Pagination';
import DeleteConfirmationModal from '@/Components/DeleteConfirmationModal';
import Modal from '@/Components/Modal';
import InputError from '@/Components/InputError';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import {
    Eye,
    KeyRound,
    Lock,
    Pencil,
    Plus,
    Search,
    Shield,
    Trash2,
    UserCheck,
    UserX,
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
            onSuccess: () => setDeletingUser(null),
        });
    };

    // Reset Password Submit
    const handleResetPassword = (e) => {
        e.preventDefault();
        if (!resettingUser) return;
        postPassword(route('superadmin.users.reset-password', resettingUser.id), {
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
                return { label: 'Super Admin (Root)', bg: 'bg-indigo-100 text-indigo-900 border-indigo-300' };
            case 'admin':
                return { label: 'Admin SIM-RS', bg: 'bg-purple-100 text-purple-900 border-purple-300' };
            case 'perencanaan':
                return { label: 'Perencanaan', bg: 'bg-amber-100 text-amber-900 border-amber-300' };
            case 'keuangan':
                return { label: 'Keuangan', bg: 'bg-emerald-100 text-emerald-900 border-emerald-300' };
            case 'divisi':
                return { label: 'Unit Pemohon', bg: 'bg-blue-100 text-blue-900 border-blue-300' };
            default:
                return { label: role, bg: 'bg-slate-100 text-slate-800 border-slate-300' };
        }
    };

    return (
        <SuperAdminLayout>
            <Head title="Manajemen Pengguna (Root) - Super Admin SIM-RS" />

            {/* Header */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                        Manajemen Akun Tingkat Tinggi (Root User Management)
                    </h1>
                    <p className="mt-1 text-xs sm:text-sm text-slate-500 font-medium">
                        Otoritas penuh membuat, mengedit role, mereset password darurat, dan impersonasi akun staf.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={openCreateModal}
                    className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white px-4 py-2 text-xs font-black shadow-xs transition cursor-pointer self-start sm:self-auto"
                >
                    <Plus className="h-4 w-4" />
                    <span>Tambah Pengguna Root</span>
                </button>
            </div>

            {/* Main Card */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
                {/* Toolbar Filter */}
                <div className="flex flex-col gap-3 p-4 border-b border-slate-100 bg-white sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap items-center gap-2.5">
                        <div className="relative w-full sm:w-64">
                            <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Cari nama, NIP, email..."
                                className="w-full rounded-xl border border-slate-300 pl-9 pr-3 py-1.5 text-xs font-medium text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                        </div>

                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 focus:border-indigo-500"
                        >
                            <option value="ALL">Semua Peran</option>
                            <option value="super_admin">Super Admin (Root)</option>
                            <option value="admin">Admin SIM-RS</option>
                            <option value="perencanaan">Perencanaan</option>
                            <option value="keuangan">Keuangan</option>
                            <option value="divisi">Unit Pemohon</option>
                        </select>

                        <select
                            value={divisionFilter}
                            onChange={(e) => setDivisionFilter(e.target.value)}
                            className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 focus:border-indigo-500 max-w-[200px] truncate"
                        >
                            <option value="ALL">Semua Bagian / Divisi</option>
                            {divisions.map((d) => (
                                <option key={d.id} value={d.id}>
                                    {d.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="text-xs text-slate-500 font-medium whitespace-nowrap">
                        <span className="font-bold text-slate-900">{filteredUsers.length}</span> dari {users.length} pengguna
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-100 text-left">
                        <thead className="bg-slate-50 text-[11px] font-black uppercase tracking-wider text-slate-600 border-b border-slate-200">
                            <tr>
                                <th className="px-4 py-3 text-center w-12">No</th>
                                <th className="px-5 py-3">Nama & Email</th>
                                <th className="px-4 py-3">NIP / NIK</th>
                                <th className="px-5 py-3">Unit Penugasan</th>
                                <th className="px-4 py-3 text-center">Peran</th>
                                <th className="px-4 py-3 text-center">Status</th>
                                <th className="px-5 py-3 text-center">Aksi Root</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white text-xs">
                            {paginatedUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="p-8 text-center text-slate-400 font-medium">
                                        Tidak ada akun pengguna yang sesuai filter.
                                    </td>
                                </tr>
                            ) : (
                                paginatedUsers.map((u, idx) => {
                                    const badge = getRoleBadge(u.role);
                                    const isSelf = u.id === currentUserId;
                                    const isSuper = u.role === 'super_admin';

                                    return (
                                        <tr key={u.id} className="hover:bg-slate-50/60 transition">
                                            <td className="px-4 py-3.5 text-center text-slate-400 font-mono">
                                                {(currentPage - 1) * itemsPerPage + idx + 1}
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                                    <span>{u.name}</span>
                                                    {isSelf && (
                                                        <span className="rounded bg-indigo-100 px-1.5 py-0.5 text-[9px] font-black text-indigo-800">
                                                            Anda
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-[11px] text-slate-400 font-medium mt-0.5">{u.email}</div>
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <div className="font-mono text-[11px] text-slate-700">
                                                    {u.nip ? `NIP. ${u.nip}` : u.nik ? `NIK. ${u.nik}` : '-'}
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <div className="font-bold text-slate-800">{u.division?.name || '-'}</div>
                                                <div className="text-[11px] text-slate-400">{u.unit?.name || u.position || '-'}</div>
                                            </td>
                                            <td className="px-4 py-3.5 text-center whitespace-nowrap">
                                                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${badge.bg}`}>
                                                    {badge.label}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => !isSelf && handleToggleStatus(u)}
                                                    disabled={isSelf}
                                                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold border transition ${
                                                        u.is_active
                                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                            : 'bg-slate-100 text-slate-600 border-slate-300'
                                                    } ${isSelf ? 'cursor-default' : 'hover:opacity-80 cursor-pointer'}`}
                                                >
                                                    <span className={`h-1.5 w-1.5 rounded-full ${u.is_active ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                                                    {u.is_active ? 'Aktif' : 'Nonaktif'}
                                                </button>
                                            </td>
                                            <td className="px-5 py-3.5 text-center whitespace-nowrap">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    {/* Impersonate Button */}
                                                    {!isSuper && !isSelf && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleImpersonate(u)}
                                                            className="inline-flex items-center gap-1 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 px-2.5 py-1 text-[11px] font-bold shadow-2xs transition cursor-pointer"
                                                            title="Investigasi akun staf (Mode Troubleshooting)"
                                                        >
                                                            <Eye className="h-3.5 w-3.5 text-amber-700" />
                                                            <span>Troubleshoot</span>
                                                        </button>
                                                    )}

                                                    {/* Edit */}
                                                    <button
                                                        type="button"
                                                        onClick={() => openEditModal(u)}
                                                        className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-2.5 py-1 text-[11px] font-bold shadow-2xs transition cursor-pointer"
                                                        title="Edit Data Pengguna"
                                                    >
                                                        <Pencil className="h-3.5 w-3.5 text-slate-500" />
                                                        <span>Edit</span>
                                                    </button>

                                                    {/* Reset Password */}
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setResettingUser(u);
                                                            setPasswordData('password', '');
                                                        }}
                                                        className="inline-flex items-center gap-1 rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-900 px-2 py-1 text-[11px] font-bold shadow-2xs transition cursor-pointer"
                                                        title="Reset Kata Sandi Darurat"
                                                    >
                                                        <KeyRound className="h-3.5 w-3.5 text-purple-700" />
                                                    </button>

                                                    {/* Delete */}
                                                    {!isSelf && !isSuper && (
                                                        <button
                                                            type="button"
                                                            onClick={() => setDeletingUser(u)}
                                                            className="inline-flex items-center rounded-xl border border-transparent hover:border-rose-200 hover:bg-rose-50 text-slate-400 hover:text-rose-600 p-1.5 transition cursor-pointer"
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

            {/* Create & Edit Modal */}
            <Modal show={isCreateOpen || Boolean(editingUser)} onClose={() => { setIsCreateOpen(false); setEditingUser(null); }}>
                <form onSubmit={handleFormSubmit} className="p-6">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                        <div className="flex items-center gap-2">
                            <div className="rounded-xl bg-indigo-100 p-2 text-indigo-700">
                                <Users className="h-4 w-4" />
                            </div>
                            <h2 className="text-sm font-black text-slate-900">
                                {editingUser ? `Edit Pengguna: ${editingUser.name}` : 'Tambah Pengguna Baru'}
                            </h2>
                        </div>
                        <button
                            type="button"
                            onClick={() => { setIsCreateOpen(false); setEditingUser(null); }}
                            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="space-y-3.5 text-xs">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="block font-bold text-slate-700 mb-1">Nama Lengkap & Gelar *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData('name', e.target.value)}
                                    className="w-full rounded-xl border border-slate-300 p-2 text-xs"
                                    required
                                />
                                <InputError message={formErrors.name} />
                            </div>
                            <div>
                                <label className="block font-bold text-slate-700 mb-1">Alamat Email *</label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData('email', e.target.value)}
                                    className="w-full rounded-xl border border-slate-300 p-2 text-xs"
                                    required
                                />
                                <InputError message={formErrors.email} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="block font-bold text-slate-700 mb-1">NIP (PNS)</label>
                                <input
                                    type="text"
                                    value={formData.nip}
                                    onChange={(e) => setFormData('nip', e.target.value)}
                                    className="w-full rounded-xl border border-slate-300 p-2 text-xs font-mono"
                                    placeholder="Contoh: 198501012010011000"
                                />
                                <InputError message={formErrors.nip} />
                            </div>
                            <div>
                                <label className="block font-bold text-slate-700 mb-1">NIK (KTP)</label>
                                <input
                                    type="text"
                                    value={formData.nik}
                                    onChange={(e) => setFormData('nik', e.target.value)}
                                    className="w-full rounded-xl border border-slate-300 p-2 text-xs font-mono"
                                    placeholder="Contoh: 1471010101850000"
                                />
                                <InputError message={formErrors.nik} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="block font-bold text-slate-700 mb-1">Peran (Role) *</label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData('role', e.target.value)}
                                    className="w-full rounded-xl border border-slate-300 p-2 text-xs font-bold"
                                    required
                                >
                                    <option value="divisi">Unit Pemohon (Ruangan)</option>
                                    <option value="perencanaan">Bagian Perencanaan</option>
                                    <option value="keuangan">Bagian Keuangan</option>
                                    <option value="admin">Admin SIM-RS</option>
                                    <option value="super_admin">Super Admin (Root Master)</option>
                                </select>
                                <InputError message={formErrors.role} />
                            </div>
                            <div>
                                <label className="block font-bold text-slate-700 mb-1">
                                    {editingUser ? 'Password Baru (Kosongkan jika tetap)' : 'Password Awal *'}
                                </label>
                                <input
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData('password', e.target.value)}
                                    className="w-full rounded-xl border border-slate-300 p-2 text-xs"
                                    required={!editingUser}
                                />
                                <InputError message={formErrors.password} />
                            </div>
                        </div>

                        {formData.role === 'divisi' && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">Bagian / Divisi *</label>
                                    <select
                                        value={formData.division_id}
                                        onChange={(e) => {
                                            setFormData({
                                                ...formData,
                                                division_id: e.target.value,
                                                unit_id: '',
                                            });
                                        }}
                                        className="w-full rounded-xl border border-slate-300 p-2 text-xs"
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
                                    <label className="block font-bold text-slate-700 mb-1">Unit Kerja / Ruangan *</label>
                                    <select
                                        value={formData.unit_id}
                                        onChange={(e) => setFormData('unit_id', e.target.value)}
                                        className="w-full rounded-xl border border-slate-300 p-2 text-xs"
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
                        )}
                    </div>

                    <div className="mt-6 flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
                        <button
                            type="button"
                            onClick={() => { setIsCreateOpen(false); setEditingUser(null); }}
                            className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={formProcessing}
                            className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-black text-white hover:bg-indigo-700 shadow-sm"
                        >
                            {formProcessing ? 'Menyimpan...' : editingUser ? 'Simpan Perubahan' : 'Buat Pengguna'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Reset Password Modal */}
            <Modal show={Boolean(resettingUser)} onClose={() => setResettingUser(null)}>
                <form onSubmit={handleResetPassword} className="p-6">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
                        <div className="rounded-xl bg-purple-100 p-2 text-purple-700">
                            <KeyRound className="h-4 w-4" />
                        </div>
                        <div>
                            <h2 className="text-sm font-black text-slate-900">Reset Kata Sandi Darurat</h2>
                            <p className="text-[11px] text-slate-500 font-medium">
                                Akun: {resettingUser?.name} ({resettingUser?.email})
                            </p>
                        </div>
                    </div>

                    <div className="space-y-3 text-xs">
                        <div>
                            <label className="block font-bold text-slate-700 mb-1">Kata Sandi Baru *</label>
                            <input
                                type="password"
                                value={passwordData.password}
                                onChange={(e) => setPasswordData('password', e.target.value)}
                                className="w-full rounded-xl border border-slate-300 p-2 text-xs"
                                placeholder="Masukkan password baru minimal 8 karakter"
                                required
                            />
                            <InputError message={passwordErrors.password} />
                        </div>
                    </div>

                    <div className="mt-6 flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
                        <button
                            type="button"
                            onClick={() => setResettingUser(null)}
                            className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={passwordProcessing}
                            className="rounded-xl bg-purple-600 px-5 py-2 text-xs font-black text-white hover:bg-purple-700 shadow-sm"
                        >
                            {passwordProcessing ? 'Menyimpan...' : 'Perbarui Kata Sandi'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
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
