import AdminLayout from '@/Layouts/AdminLayout';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import DivisiLayout from '@/Layouts/DivisiLayout';
import KeuanganLayout from '@/Layouts/KeuanganLayout';
import PerencanaanLayout from '@/Layouts/PerencanaanLayout';
import InputError from '@/Components/InputError';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useRef, useState } from 'react';

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

    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        submitPassword(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => resetPassword(),
        });
    };

    return (
        <LayoutComponent>
            <Head title="Pengaturan Profil - E-BLUD RSJ Tampan" />

            <div className="mx-auto max-w-4xl space-y-8">
                {/* Page Title & Intro */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                            Pengaturan Akun & Profil
                        </h2>
                        <p className="mt-1.5 text-xs sm:text-sm text-slate-500 font-medium">
                            Perbarui identitas pribadi, foto profil, dan kata sandi keamanan akun Anda di sistem E-BLUD RSJ Tampan.
                        </p>
                    </div>
                    <Link
                        href={getDashboardRoute(user?.role)}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-700 shadow-2xs transition self-start sm:self-center"
                    >
                        <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                        </svg>
                        <span>Batal / Kembali ke Dashboard</span>
                    </Link>
                </div>

                {/* Card 1: Informasi Profil & Foto */}
                <div className="rounded-3xl border-2 border-slate-200/90 bg-white p-6 shadow-sm sm:p-8">
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-base font-black text-slate-900">
                                Informasi Profil
                            </h3>
                            <p className="text-xs text-slate-500 font-medium">
                                Data nama lengkap, alamat pos-el resmi, dan foto avatar akun.
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleProfileSubmit} className="mt-6 space-y-6">
                        {/* Avatar Upload Area */}
                        <div>
                            <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-3">
                                Foto Profil Akun
                            </label>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                                <div className="relative shrink-0">
                                    {avatarPreview ? (
                                        <img
                                            src={avatarPreview}
                                            alt={user.name}
                                            className="h-24 w-24 rounded-2xl object-cover ring-4 ring-emerald-500/20 shadow-md"
                                        />
                                    ) : (
                                        <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 font-black text-3xl text-white shadow-md">
                                            {user.name?.charAt(0).toUpperCase() || 'U'}
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 space-y-2">
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        accept="image/png, image/jpeg, image/jpg, image/webp"
                                        onChange={handleAvatarChange}
                                        className="hidden"
                                    />
                                    <div className="flex flex-wrap items-center gap-3">
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2.5 text-xs font-bold text-emerald-800 hover:bg-emerald-100 border border-emerald-300 transition"
                                        >
                                            <svg className="h-4 w-4 text-emerald-700" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                                            </svg>
                                            Pilih Foto Baru
                                        </button>
                                        {profileData.avatar && (
                                            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                                                Foto terpilih: {profileData.avatar.name}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-[11px] text-slate-500 font-medium">
                                        Format berkas: JPG, PNG, atau WEBP. Ukuran maksimal 2 MB.
                                    </p>
                                    <InputError message={profileErrors.avatar} className="mt-1" />
                                </div>
                            </div>
                        </div>

                        {/* Nama Lengkap & Email */}
                        <div className="grid gap-5 sm:grid-cols-2">
                            <div>
                                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                                    Nama Lengkap <span className="text-rose-600">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={profileData.name}
                                    onChange={(e) => setProfileData('name', e.target.value)}
                                    required
                                    className="block w-full rounded-xl border-2 border-slate-300 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-900 shadow-2xs transition focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                                    placeholder="Nama Staf Pegawai"
                                />
                                <InputError message={profileErrors.name} className="mt-1.5" />
                            </div>

                            <div>
                                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                                    Alamat Pos-el (Email) <span className="text-rose-600">*</span>
                                </label>
                                <input
                                    type="email"
                                    value={profileData.email}
                                    onChange={(e) => setProfileData('email', e.target.value)}
                                    required
                                    className="block w-full rounded-xl border-2 border-slate-300 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-900 shadow-2xs transition focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                                    placeholder="nama@rsjtampan.riau.go.id"
                                />
                                <InputError message={profileErrors.email} className="mt-1.5" />
                            </div>
                        </div>

                        {/* Read-only Role and Division Info */}
                        <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200 grid gap-4 sm:grid-cols-2">
                            <div>
                                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                                    Hak Akses Sistem
                                </span>
                                <span className="mt-1 inline-flex items-center rounded-lg bg-emerald-100 text-emerald-800 px-2.5 py-1 text-xs font-black uppercase tracking-wider border border-emerald-300">
                                    Peran: {user.role}
                                </span>
                            </div>
                            {user.division && (
                                <div>
                                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                                        Unit Kerja Terdaftar
                                    </span>
                                    <span className="text-xs font-black text-slate-900 block mt-1">
                                        {user.division.name} ({user.division.division_code})
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Submit Button */}
                        <div className="flex items-center justify-end gap-3 pt-2">
                            {profileSuccess && (
                                <span className="text-xs font-bold text-emerald-700 animate-fade-in-up">
                                    ✓ Profil berhasil disimpan
                                </span>
                            )}
                            <Link
                                href={getDashboardRoute(user?.role)}
                                className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 transition"
                            >
                                Batal
                            </Link>
                            <button
                                type="submit"
                                disabled={profileProcessing}
                                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-emerald-700 active:scale-95 transition disabled:opacity-50 cursor-pointer"
                            >
                                {profileProcessing ? (
                                    <>
                                        <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Menyimpan...
                                    </>
                                ) : (
                                    'Simpan Profil'
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Card 2: Keamanan & Ganti Password */}
                <div className="rounded-3xl border-2 border-slate-200/90 bg-white p-6 shadow-sm sm:p-8">
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-base font-black text-slate-900">
                                Keamanan Kata Sandi
                            </h3>
                            <p className="text-xs text-slate-500 font-medium">
                                Pastikan akun Anda menggunakan kata sandi yang panjang dan aman.
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handlePasswordSubmit} className="mt-6 space-y-5">
                        <div>
                            <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                                Kata Sandi Saat Ini <span className="text-rose-600">*</span>
                            </label>
                            <input
                                type="password"
                                value={passwordData.current_password}
                                onChange={(e) => setPasswordData('current_password', e.target.value)}
                                autoComplete="current-password"
                                required
                                className="block w-full max-w-md rounded-xl border-2 border-slate-300 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-900 shadow-2xs transition focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
                                placeholder="••••••••"
                            />
                            <InputError message={passwordErrors.current_password} className="mt-1.5" />
                        </div>

                        <div>
                            <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                                Kata Sandi Baru <span className="text-rose-600">*</span>
                            </label>
                            <input
                                type="password"
                                value={passwordData.password}
                                onChange={(e) => setPasswordData('password', e.target.value)}
                                autoComplete="new-password"
                                required
                                className="block w-full max-w-md rounded-xl border-2 border-slate-300 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-900 shadow-2xs transition focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
                                placeholder="••••••••"
                            />
                            <InputError message={passwordErrors.password} className="mt-1.5" />
                        </div>

                        <div>
                            <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                                Konfirmasi Kata Sandi Baru <span className="text-rose-600">*</span>
                            </label>
                            <input
                                type="password"
                                value={passwordData.password_confirmation}
                                onChange={(e) => setPasswordData('password_confirmation', e.target.value)}
                                autoComplete="new-password"
                                required
                                className="block w-full max-w-md rounded-xl border-2 border-slate-300 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-900 shadow-2xs transition focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
                                placeholder="••••••••"
                            />
                            <InputError message={passwordErrors.password_confirmation} className="mt-1.5" />
                        </div>

                        {/* Submit Button */}
                        <div className="flex items-center justify-end gap-3 pt-2">
                            {passwordSuccess && (
                                <span className="text-xs font-bold text-emerald-700 animate-fade-in-up">
                                    ✓ Kata sandi berhasil diubah
                                </span>
                            )}
                            <Link
                                href={getDashboardRoute(user?.role)}
                                className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-50 transition"
                            >
                                Batal
                            </Link>
                            <button
                                type="submit"
                                disabled={passwordProcessing}
                                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-slate-800 active:scale-95 transition disabled:opacity-50 cursor-pointer"
                            >
                                {passwordProcessing ? (
                                    <>
                                        <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Mengubah Sandi...
                                    </>
                                ) : (
                                    'Update Password'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </LayoutComponent>
    );
}
