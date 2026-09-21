import AdminLayout from '@/Layouts/AdminLayout';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import DivisiLayout from '@/Layouts/DivisiLayout';
import KeuanganLayout from '@/Layouts/KeuanganLayout';
import PerencanaanLayout from '@/Layouts/PerencanaanLayout';
import InputError from '@/Components/InputError';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useRef, useState } from 'react';

const ROLE_LABELS = {
    admin: 'Administrator SIM-RS',
    divisi: 'Unit Pemohon',
    perencanaan: 'Bagian Perencanaan',
    keuangan: 'Bagian Keuangan',
};

function getDashboardRoute(role) {
    switch (role) {
        case 'admin':
            return route('admin.dashboard');
        case 'perencanaan':
            return route('perencanaan.dashboard');
        case 'keuangan':
            return route('keuangan.dashboard');
        default:
            return route('divisi.dashboard');
    }
}

function getLayoutComponent(role) {
    switch (role) {
        case 'admin':
            return AdminLayout;
        case 'divisi':
            return DivisiLayout;
        case 'perencanaan':
            return PerencanaanLayout;
        case 'keuangan':
            return KeuanganLayout;
        default:
            return AuthenticatedLayout;
    }
}

export default function Edit() {
    const user = usePage().props.auth.user;
    const LayoutComponent = getLayoutComponent(user?.role);

    // Profile form
    const {
        data: profileData,
        setData: setProfileData,
        post: submitProfile,
        processing: profileProcessing,
        errors: profileErrors,
        recentlySuccessful: profileSuccess,
    } = useForm({
        _method: 'patch',
        name: user.name || '',
        email: user.email || '',
        avatar: null,
    });

    const [avatarPreview, setAvatarPreview] = useState(
        user.avatar_url || (user.avatar ? `/storage/${user.avatar}` : null)
    );
    const fileInputRef = useRef(null);

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
        setAvatarPreview(user.avatar_url || (user.avatar ? `/storage/${user.avatar}` : null));
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleProfileSubmit = (e) => {
        e.preventDefault();
        submitProfile(route('profile.update'), {
            preserveScroll: true,
            forceFormData: true,
        });
    };

    // Password form
    const {
        data: passwordData,
        setData: setPasswordData,
        put: submitPassword,
        processing: passwordProcessing,
        errors: passwordErrors,
        reset: resetPassword,
        recentlySuccessful: passwordSuccess,
    } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    // Password eye toggles
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        submitPassword(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => resetPassword(),
        });
    };

    const roleName = ROLE_LABELS[user?.role] || user?.role;
    const unitOrDivisionName = user?.unit?.name || user?.division?.name;

    const passwordsMatch =
        passwordData.password &&
        passwordData.password_confirmation &&
        passwordData.password === passwordData.password_confirmation;
    const passwordsMismatch =
        passwordData.password &&
        passwordData.password_confirmation &&
        passwordData.password !== passwordData.password_confirmation;

    return (
        <LayoutComponent>
            <Head title="Pengaturan Profil - E-BLUD RSJ Tampan" />

            <div className="mx-auto max-w-4xl space-y-6">
                {/* Header Halaman Minimalis */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                            Pengaturan Akun & Profil
                        </h2>
                        <p className="mt-0.5 text-xs sm:text-sm text-slate-500">
                            Kelola data diri, foto profil, dan kata sandi keamanan Anda di sistem E-BLUD RSJ Tampan.
                        </p>
                    </div>
                    <Link
                        href={getDashboardRoute(user?.role)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700 shadow-2xs transition self-start sm:self-center"
                    >
                        <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                        </svg>
                        <span>Kembali ke Dashboard</span>
                    </Link>
                </div>

                {/* Kartu 1: Informasi Profil & Foto */}
                <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-5">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 border-b-2 border-teal-600 pb-0.5 inline-block">
                                Informasi Profil & Foto
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Data identitas pegawai dan foto profil akun Anda.
                            </p>
                        </div>
                        <span className="inline-flex items-center rounded-md bg-teal-50 px-2.5 py-1 text-xs font-bold text-teal-800 border border-teal-200">
                            {roleName}
                        </span>
                    </div>

                    <form onSubmit={handleProfileSubmit} className="space-y-4">
                        {/* Foto Profil Area */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-2">
                                Foto Profil Akun
                            </label>
                            <div className="flex items-center gap-4">
                                <div className="relative shrink-0">
                                    {avatarPreview ? (
                                        <img
                                            src={avatarPreview}
                                            alt={user.name}
                                            className="h-16 w-16 rounded-full object-cover ring-2 ring-teal-500/30 shadow-2xs"
                                        />
                                    ) : (
                                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-600 font-bold text-xl text-white shadow-2xs">
                                            {user.name?.charAt(0).toUpperCase() || 'U'}
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-1">
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        accept="image/png, image/jpeg, image/jpg, image/webp"
                                        onChange={handleAvatarChange}
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
                                        Format berkas: JPG, PNG, atau WEBP (Maksimal 2 MB).
                                    </p>
                                    <InputError message={profileErrors.avatar} className="mt-1" />
                                </div>
                            </div>
                        </div>

                        {/* Nama Lengkap & Email */}
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Nama Lengkap & Gelar <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={profileData.name}
                                    onChange={(e) => setProfileData('name', e.target.value)}
                                    required
                                    placeholder="Nama Lengkap Pegawai"
                                    className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition shadow-2xs"
                                />
                                <InputError message={profileErrors.name} className="mt-1" />
                            </div>

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
                                    className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition shadow-2xs"
                                />
                                <InputError message={profileErrors.email} className="mt-1" />
                            </div>
                        </div>

                        {/* Penugasan Resmi */}
                        <div className="rounded-lg bg-slate-50 p-3 border border-slate-200 grid gap-3 sm:grid-cols-2 text-xs">
                            <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                    Nomor Induk Pegawai (NIP)
                                </span>
                                <span className="font-mono font-bold text-slate-800 text-xs">
                                    {user.nip || 'Belum diisi'}
                                </span>
                            </div>
                            <div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                                    Unit Penugasan
                                </span>
                                <span className="font-semibold text-slate-800 text-xs">
                                    {unitOrDivisionName || '-'}
                                </span>
                            </div>
                        </div>

                        {/* Tombol Simpan */}
                        <div className="flex items-center justify-end gap-3 pt-2">
                            {profileSuccess && (
                                <span className="text-xs font-bold text-emerald-700 animate-fade-in">
                                    ✓ Profil berhasil disimpan
                                </span>
                            )}
                            <button
                                type="submit"
                                disabled={profileProcessing}
                                className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-teal-700 active:scale-95 transition disabled:opacity-50 cursor-pointer"
                            >
                                {profileProcessing ? (
                                    <>
                                        <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" strokeWidth="4" stroke="currentColor" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        <span>Menyimpan...</span>
                                    </>
                                ) : (
                                    <span>Simpan Profil</span>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Kartu 2: Keamanan Kata Sandi */}
                <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-2xs space-y-5">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div>
                            <h3 className="text-sm font-bold text-slate-900 border-b-2 border-teal-600 pb-0.5 inline-block">
                                Keamanan Kata Sandi
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Perbarui kata sandi untuk menjaga keamanan akun Anda.
                            </p>
                        </div>
                    </div>

                    {/* Tips Box */}
                    <div className="rounded-lg bg-teal-50 border border-teal-200 p-3 text-xs text-teal-900 flex items-start gap-2.5">
                        <span className="text-base leading-none">💡</span>
                        <div className="space-y-0.5">
                            <p className="font-bold">Tips Kata Sandi:</p>
                            <p className="text-teal-800 text-[11px]">
                                Gunakan minimal 8 karakter. Anda dapat menekan ikon mata (<span className="font-bold">👁️</span>) untuk melihat kata sandi agar tidak salah ketik.
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                        {/* Kata Sandi Saat Ini */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Kata Sandi Saat Ini <span className="text-rose-500">*</span>
                            </label>
                            <div className="relative max-w-md">
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
                            <div className="relative max-w-md">
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
                            <div className="flex items-center justify-between mb-1 max-w-md">
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
                            <div className="relative max-w-md">
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

                        {/* Submit Button */}
                        <div className="flex items-center justify-end gap-3 pt-2">
                            {passwordSuccess && (
                                <span className="text-xs font-bold text-emerald-700 animate-fade-in">
                                    ✓ Kata sandi berhasil diubah
                                </span>
                            )}
                            <button
                                type="submit"
                                disabled={passwordProcessing}
                                className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2 text-xs font-bold text-white shadow-xs hover:bg-teal-700 active:scale-95 transition disabled:opacity-50 cursor-pointer"
                            >
                                {passwordProcessing ? (
                                    <>
                                        <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" strokeWidth="4" stroke="currentColor" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        <span>Menyimpan...</span>
                                    </>
                                ) : (
                                    <span>Perbarui Kata Sandi</span>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </LayoutComponent>
    );
}
