import InputError from '@/Components/InputError';
import Modal from '@/Components/Modal';
import { useForm, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import Swal from 'sweetalert2';

const ROLE_LABELS = {
    admin: 'Administrator SIM-RS',
    divisi: 'Unit Pemohon',
    perencanaan: 'Bagian Perencanaan',
    keuangan: 'Bagian Keuangan',
};

export default function ProfileSettingsModal({ show = false, onClose = () => {} }) {
    const authUser = usePage().props.auth?.user;
    const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'password'

    // Avatar preview state
    const [avatarPreview, setAvatarPreview] = useState(null);
    const fileInputRef = useRef(null);

    // Password visibility toggles (gaptek-friendly: cegah salah ketik)
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
            setShowCurrentPassword(false);
            setShowNewPassword(false);
            setShowConfirmPassword(false);
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

    const handleResetAvatar = () => {
        setProfileData('avatar', null);
        setAvatarPreview(
            authUser.avatar_url || (authUser.avatar ? `/storage/${authUser.avatar}` : null)
        );
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleProfileSubmit = (e) => {
        e.preventDefault();
        submitProfile(route('profile.update'), {
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: 'Profil berhasil disimpan',
                    showConfirmButton: false,
                    timer: 2500,
                    timerProgressBar: true,
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
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: 'Kata sandi berhasil diperbarui',
                    showConfirmButton: false,
                    timer: 2500,
                    timerProgressBar: true,
                });
                onClose();
            },
        });
    };

    if (!authUser) return null;

    const roleName = ROLE_LABELS[authUser.role] || authUser.role;
    const unitOrDivisionName = authUser.unit?.name || authUser.division?.name;

    // Realtime confirmation check for gaptek-friendly feedback
    const passwordsMatch =
        passwordData.password &&
        passwordData.password_confirmation &&
        passwordData.password === passwordData.password_confirmation;
    const passwordsMismatch =
        passwordData.password &&
        passwordData.password_confirmation &&
        passwordData.password !== passwordData.password_confirmation;

    return (
        <Modal show={show} onClose={onClose} maxWidth="xl">
            <div className="flex flex-col bg-white rounded-2xl overflow-hidden shadow-xl max-h-[92vh]">
                {/* 1. Header Minimalis Putih (Seragam dengan Form Lainnya) */}
                <div className="shrink-0 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4">
                    <div>
                        <h2 className="text-base sm:text-lg font-bold text-slate-900">
                            Pengaturan Akun & Profil
                        </h2>
                        <p className="mt-0.5 text-xs text-slate-500">
                            Kelola data diri, foto profil, dan keamanan kata sandi Anda
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer"
                        title="Tutup dialog"
                    >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* 2. Tab Navigasi Sederhana & Jelas */}
                <div className="border-b border-slate-200 bg-white px-6 flex gap-6">
                    <button
                        type="button"
                        onClick={() => setActiveTab('profile')}
                        className={`flex items-center gap-2 py-3 text-xs sm:text-sm font-bold border-b-2 transition cursor-pointer ${
                            activeTab === 'profile'
                                ? 'border-teal-600 text-teal-700'
                                : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                        </svg>
                        <span>Informasi Profil & Foto</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('password')}
                        className={`flex items-center gap-2 py-3 text-xs sm:text-sm font-bold border-b-2 transition cursor-pointer ${
                            activeTab === 'password'
                                ? 'border-teal-600 text-teal-700'
                                : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                        </svg>
                        <span>Keamanan Kata Sandi</span>
                    </button>
                </div>

                {/* 4. Body Form (Scrollable) */}
                <div className="flex-1 overflow-y-auto p-6 bg-slate-50/40">
                    {activeTab === 'profile' ? (
                        <form id="profile-modal-form" onSubmit={handleProfileSubmit} className="space-y-4">
                            {/* Avatar Upload */}
                            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
                                <label className="block text-xs font-semibold text-slate-700 mb-2.5">
                                    Foto Profil Akun
                                </label>
                                <div className="flex items-center gap-4">
                                    <div className="relative shrink-0">
                                        {avatarPreview ? (
                                            <img
                                                src={avatarPreview}
                                                alt={authUser.name}
                                                className="h-16 w-16 rounded-full object-cover ring-2 ring-teal-500/30 shadow-2xs"
                                            />
                                        ) : (
                                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-600 font-bold text-xl text-white shadow-2xs">
                                                {authUser.name?.charAt(0).toUpperCase() || 'U'}
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-1.5">
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleAvatarChange}
                                            accept="image/jpeg,image/png,image/jpg,image/webp"
                                            className="hidden"
                                        />
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer shadow-2xs"
                                            >
                                                Pilih Foto Baru
                                            </button>
                                            {profileData.avatar && (
                                                <button
                                                    type="button"
                                                    onClick={handleResetAvatar}
                                                    className="text-xs font-semibold text-rose-600 hover:underline cursor-pointer"
                                                >
                                                    Batal
                                                </button>
                                            )}
                                        </div>
                                        <p className="text-[11px] text-slate-400">
                                            Format JPG, PNG, atau WEBP (Maks. 2 MB)
                                        </p>
                                        <InputError message={profileErrors.avatar} className="mt-1" />
                                    </div>
                                </div>
                            </div>

                            {/* Data Isian Pegawai */}
                            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs space-y-3.5">
                                {/* Nama Lengkap & Gelar */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Nama Lengkap & Gelar <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={profileData.name}
                                        onChange={(e) => setProfileData('name', e.target.value)}
                                        required
                                        placeholder="Contoh: dr. Hendra, Sp.KJ"
                                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition shadow-2xs"
                                    />
                                    <InputError message={profileErrors.name} className="mt-1" />
                                </div>

                                {/* Email Kedinasan */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Alamat Email Kedinasan <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        value={profileData.email}
                                        onChange={(e) => setProfileData('email', e.target.value)}
                                        required
                                        placeholder="nama@rsjtampan.riau.go.id"
                                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition shadow-2xs"
                                    />
                                    <InputError message={profileErrors.email} className="mt-1" />
                                </div>

                                {/* Penugasan Resmi (Read-only Informatif) */}
                                <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                    <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-200/80">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                            Nomor Induk Pegawai (NIP)
                                        </span>
                                        <span className="font-mono font-bold text-slate-800 text-xs">
                                            {authUser.nip || 'Belum diisi'}
                                        </span>
                                    </div>
                                    <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-200/80">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                            Jabatan / Unit Penugasan
                                        </span>
                                        <span className="font-semibold text-slate-800 text-xs truncate block">
                                            {authUser.position || unitOrDivisionName || '-'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </form>
                    ) : (
                        <form id="password-modal-form" onSubmit={handlePasswordSubmit} className="space-y-4">
                            {/* Tips Ramah untuk Pengguna Non-Teknis */}
                            <div className="rounded-xl bg-teal-50 border border-teal-200 p-3.5 text-xs text-teal-900 flex items-start gap-2.5 shadow-2xs">
                                <span className="text-base leading-none">💡</span>
                                <div className="space-y-0.5">
                                    <p className="font-bold">Tips Mengganti Kata Sandi:</p>
                                    <p className="text-teal-800 text-[11px]">
                                        Gunakan minimal 8 karakter. Anda dapat menekan ikon mata (<span className="font-bold">👁️</span>) di sebelah kanan kolom untuk melihat kata sandi agar tidak salah ketik.
                                    </p>
                                </div>
                            </div>

                            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs space-y-3.5">
                                {/* Kata Sandi Saat Ini */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Kata Sandi Saat Ini <span className="text-rose-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showCurrentPassword ? 'text' : 'password'}
                                            value={passwordData.current_password}
                                            onChange={(e) => setPasswordData('current_password', e.target.value)}
                                            autoComplete="current-password"
                                            required
                                            placeholder="Masukkan kata sandi lama Anda"
                                            className="w-full rounded-lg border border-slate-300 bg-white pl-3 pr-10 py-2 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition shadow-2xs"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer transition"
                                            tabIndex={-1}
                                            title={showCurrentPassword ? 'Sembunyikan sandi' : 'Lihat sandi'}
                                        >
                                            {showCurrentPassword ? (
                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                                </svg>
                                            ) : (
                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                    <InputError message={passwordErrors.current_password} className="mt-1" />
                                </div>

                                {/* Kata Sandi Baru */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Kata Sandi Baru <span className="text-rose-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showNewPassword ? 'text' : 'password'}
                                            value={passwordData.password}
                                            onChange={(e) => setPasswordData('password', e.target.value)}
                                            autoComplete="new-password"
                                            required
                                            placeholder="Minimal 8 karakter baru"
                                            className="w-full rounded-lg border border-slate-300 bg-white pl-3 pr-10 py-2 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition shadow-2xs"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer transition"
                                            tabIndex={-1}
                                            title={showNewPassword ? 'Sembunyikan sandi' : 'Lihat sandi'}
                                        >
                                            {showNewPassword ? (
                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                                </svg>
                                            ) : (
                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                    <InputError message={passwordErrors.password} className="mt-1" />
                                </div>

                                {/* Konfirmasi Kata Sandi Baru */}
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="block text-xs font-semibold text-slate-700">
                                            Ulangi Kata Sandi Baru <span className="text-rose-500">*</span>
                                        </label>
                                        {passwordsMatch && (
                                            <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                                                ✓ Kata sandi cocok
                                            </span>
                                        )}
                                        {passwordsMismatch && (
                                            <span className="text-[11px] font-semibold text-amber-600">
                                                Belum sama
                                            </span>
                                        )}
                                    </div>
                                    <div className="relative">
                                        <input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            value={passwordData.password_confirmation}
                                            onChange={(e) => setPasswordData('password_confirmation', e.target.value)}
                                            autoComplete="new-password"
                                            required
                                            placeholder="Ketik ulang kata sandi baru Anda"
                                            className={`w-full rounded-lg border bg-white pl-3 pr-10 py-2 text-xs sm:text-sm text-slate-900 placeholder-slate-400 transition shadow-2xs ${
                                                passwordsMismatch
                                                    ? 'border-amber-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-500'
                                                    : 'border-slate-300 focus:border-teal-600 focus:ring-1 focus:ring-teal-600'
                                            }`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer transition"
                                            tabIndex={-1}
                                            title={showConfirmPassword ? 'Sembunyikan sandi' : 'Lihat sandi'}
                                        >
                                            {showConfirmPassword ? (
                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                                </svg>
                                            ) : (
                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                    <InputError message={passwordErrors.password_confirmation} className="mt-1" />
                                </div>
                            </div>
                        </form>
                    )}
                </div>

                {/* 5. Footer Modal (Tombol Serasi dan Konsisten di Kedua Tab) */}
                <div className="shrink-0 border-t border-slate-100 bg-white px-6 py-4 flex items-center justify-between gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                    >
                        Batal
                    </button>

                    {activeTab === 'profile' ? (
                        <button
                            type="submit"
                            form="profile-modal-form"
                            disabled={profileProcessing}
                            className="inline-flex items-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-95 px-5 py-2 text-xs font-bold text-white shadow-xs transition cursor-pointer disabled:opacity-60"
                        >
                            {profileProcessing ? (
                                <>
                                    <svg className="h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" strokeWidth="4" stroke="currentColor" />
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
                            className="inline-flex items-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-95 px-5 py-2 text-xs font-bold text-white shadow-xs transition cursor-pointer disabled:opacity-60"
                        >
                            {passwordProcessing ? (
                                <>
                                    <svg className="h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" strokeWidth="4" stroke="currentColor" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    <span>Menyimpan...</span>
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
