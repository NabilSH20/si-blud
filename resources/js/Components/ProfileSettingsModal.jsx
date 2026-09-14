import InputError from '@/Components/InputError';
import Modal from '@/Components/Modal';
import { useForm, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import Swal from 'sweetalert2';

export default function ProfileSettingsModal({ show = false, onClose = () => {} }) {
    const authUser = usePage().props.auth?.user;
    const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'password'

    // Avatar preview state
    const [avatarPreview, setAvatarPreview] = useState(null);
    const fileInputRef = useRef(null);

    // Form Profile
    const {
        data: profileData,
        setData: setProfileData,
        post: submitProfile,
        processing: profileProcessing,
        errors: profileErrors,
        reset: resetProfile,
        clearErrors: clearProfileErrors,
    } = useForm({
        _method: 'patch',
        name: '',
        email: '',
        avatar: null,
    });

    // Form Password
    const {
        data: passwordData,
        setData: setPasswordData,
        put: submitPassword,
        processing: passwordProcessing,
        errors: passwordErrors,
        reset: resetPassword,
        clearErrors: clearPasswordErrors,
    } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    // Sync user data whenever modal is opened
    useEffect(() => {
        if (show && authUser) {
            setProfileData({
                _method: 'patch',
                name: authUser.name || '',
                email: authUser.email || '',
                avatar: null,
            });
            setAvatarPreview(
                authUser.avatar_url || (authUser.avatar ? `/storage/${authUser.avatar}` : null)
            );
            resetPassword();
            clearProfileErrors();
            clearPasswordErrors();
        }
    }, [show, authUser]);

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileData('avatar', file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleProfileSubmit = (e) => {
        e.preventDefault();
        submitProfile(route('profile.update'), {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                Swal.fire({
                    icon: 'success',
                    title: 'Profil Berhasil Diperbarui',
                    text: 'Data identitas dan foto akun Anda telah disimpan.',
                    timer: 2000,
                    showConfirmButton: false,
                });
                onClose();
            },
        });
    };

    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        submitPassword(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => {
                resetPassword();
                Swal.fire({
                    icon: 'success',
                    title: 'Kata Sandi Berhasil Diperbarui',
                    text: 'Kata sandi keamanan akun Anda telah diganti.',
                    timer: 2000,
                    showConfirmButton: false,
                });
                onClose();
            },
        });
    };

    if (!authUser) return null;

    return (
        <Modal show={show} onClose={onClose} maxWidth="2xl">
            <div className="flex flex-col max-h-[92vh]">
                {/* Header Modal */}
                <div className="shrink-0 border-b border-emerald-100 bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 px-6 py-4 text-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-xl font-bold backdrop-blur-xs border border-white/20">
                                ⚙️
                            </div>
                            <div>
                                <h2 className="text-base sm:text-lg font-black tracking-tight">
                                    Pengaturan Akun & Profil
                                </h2>
                                <p className="text-xs text-emerald-100/90 font-medium">
                                    Kelola profil, foto akun, dan kata sandi keamanan Anda
                                </p>
                            </div>
                        </div>

                        {/* Tombol Tutup / Batal */}
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl bg-white/10 p-2 text-white/80 hover:bg-white/20 hover:text-white transition cursor-pointer"
                            aria-label="Tutup Dialog"
                            title="Tutup / Batal"
                        >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Info Identitas Kedinasan Singkat */}
                <div className="border-b border-slate-200 bg-slate-50 px-6 py-3 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <span className="inline-flex items-center rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-black uppercase text-emerald-800 border border-emerald-300">
                            {authUser.role}
                        </span>
                        <span className="text-xs font-semibold text-slate-700">
                            {authUser.name}
                        </span>
                        {authUser.nip && (
                            <span className="text-xs text-slate-500 font-mono">
                                (NIP: {authUser.nip})
                            </span>
                        )}
                    </div>
                    {(authUser.unit || authUser.division) && (
                        <span className="text-xs font-medium text-slate-500">
                            {authUser.unit?.name || authUser.division?.name}
                        </span>
                    )}
                </div>

                {/* Tab Navigasi */}
                <div className="border-b border-slate-200 bg-white px-6 pt-3 flex gap-4">
                    <button
                        type="button"
                        onClick={() => setActiveTab('profile')}
                        className={`inline-flex items-center gap-2 pb-3 text-xs sm:text-sm font-bold border-b-2 transition cursor-pointer ${
                            activeTab === 'profile'
                                ? 'border-emerald-600 text-emerald-700'
                                : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                        </svg>
                        Informasi Profil & Foto
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('password')}
                        className={`inline-flex items-center gap-2 pb-3 text-xs sm:text-sm font-bold border-b-2 transition cursor-pointer ${
                            activeTab === 'password'
                                ? 'border-emerald-600 text-emerald-700'
                                : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                        </svg>
                        Keamanan Kata Sandi
                    </button>
                </div>

                {/* Body Form (Scrollable) */}
                <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
                    {activeTab === 'profile' ? (
                        <form id="profile-modal-form" onSubmit={handleProfileSubmit} className="space-y-5">
                            {/* Avatar Upload */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                                    Foto Profil Akun
                                </label>
                                <div className="flex items-center gap-4">
                                    <div className="relative shrink-0">
                                        {avatarPreview ? (
                                            <img
                                                src={avatarPreview}
                                                alt={authUser.name}
                                                className="h-16 w-16 rounded-2xl object-cover ring-2 ring-emerald-500/30 shadow-sm"
                                            />
                                        ) : (
                                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-600 font-bold text-xl text-white shadow-sm">
                                                {authUser.name?.charAt(0).toUpperCase() || 'U'}
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleAvatarChange}
                                            accept="image/jpeg,image/png,image/jpg,image/webp"
                                            className="hidden"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer shadow-2xs"
                                        >
                                            Pilih Foto Baru
                                        </button>
                                        <p className="text-[11px] text-slate-500">
                                            Format JPG, PNG, atau WEBP (Maks. 2MB).
                                        </p>
                                        <InputError message={profileErrors.avatar} className="mt-1" />
                                    </div>
                                </div>
                            </div>

                            {/* Nama Lengkap */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                    Nama Lengkap & Gelar <span className="text-rose-600">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={profileData.name}
                                    onChange={(e) => setProfileData('name', e.target.value)}
                                    required
                                    className="block w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-900 shadow-2xs transition focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                                    placeholder="Nama Lengkap Pegawai"
                                />
                                <InputError message={profileErrors.name} className="mt-1" />
                            </div>

                            {/* Email Kedinasan */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                    Email Kedinasan <span className="text-rose-600">*</span>
                                </label>
                                <input
                                    type="email"
                                    value={profileData.email}
                                    onChange={(e) => setProfileData('email', e.target.value)}
                                    required
                                    className="block w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-900 shadow-2xs transition focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                                    placeholder="nama@rsjtampan.riau.go.id"
                                />
                                <InputError message={profileErrors.email} className="mt-1" />
                            </div>
                        </form>
                    ) : (
                        <form id="password-modal-form" onSubmit={handlePasswordSubmit} className="space-y-4">
                            {/* Kata Sandi Saat Ini */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                    Kata Sandi Saat Ini <span className="text-rose-600">*</span>
                                </label>
                                <input
                                    type="password"
                                    value={passwordData.current_password}
                                    onChange={(e) => setPasswordData('current_password', e.target.value)}
                                    autoComplete="current-password"
                                    required
                                    className="block w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-900 shadow-2xs transition focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                                    placeholder="••••••••"
                                />
                                <InputError message={passwordErrors.current_password} className="mt-1" />
                            </div>

                            {/* Kata Sandi Baru */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                    Kata Sandi Baru <span className="text-rose-600">*</span>
                                </label>
                                <input
                                    type="password"
                                    value={passwordData.password}
                                    onChange={(e) => setPasswordData('password', e.target.value)}
                                    autoComplete="new-password"
                                    required
                                    className="block w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-900 shadow-2xs transition focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                                    placeholder="Minimal 8 karakter"
                                />
                                <InputError message={passwordErrors.password} className="mt-1" />
                            </div>

                            {/* Konfirmasi Kata Sandi Baru */}
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                                    Konfirmasi Kata Sandi Baru <span className="text-rose-600">*</span>
                                </label>
                                <input
                                    type="password"
                                    value={passwordData.password_confirmation}
                                    onChange={(e) => setPasswordData('password_confirmation', e.target.value)}
                                    autoComplete="new-password"
                                    required
                                    className="block w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-900 shadow-2xs transition focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                                    placeholder="Ketik ulang kata sandi baru"
                                />
                                <InputError message={passwordErrors.password_confirmation} className="mt-1" />
                            </div>
                        </form>
                    )}
                </div>

                {/* Footer Modal */}
                <div className="shrink-0 border-t border-slate-200 bg-white px-6 py-4 flex items-center justify-between gap-3">
                    {/* Tombol Batal */}
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                    >
                        Batal
                    </button>

                    {/* Tombol Simpan */}
                    {activeTab === 'profile' ? (
                        <button
                            type="submit"
                            form="profile-modal-form"
                            disabled={profileProcessing}
                            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 px-5 py-2 text-xs font-bold text-white shadow-sm transition cursor-pointer disabled:opacity-60"
                        >
                            {profileProcessing ? (
                                <>
                                    <svg className="h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    <span>Menyimpan...</span>
                                </>
                            ) : (
                                <span>Simpan Profil</span>
                            )}
                        </button>
                    ) : (
                        <button
                            type="submit"
                            form="password-modal-form"
                            disabled={passwordProcessing}
                            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-95 px-5 py-2 text-xs font-bold text-white shadow-sm transition cursor-pointer disabled:opacity-60"
                        >
                            {passwordProcessing ? (
                                <>
                                    <svg className="h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    <span>Mengubah Sandi...</span>
                                </>
                            ) : (
                                <span>Perbarui Kata Sandi</span>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </Modal>
    );
}
