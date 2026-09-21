import ToastListener from '@/Components/ToastListener';
import ProfileSettingsModal from '@/Components/ProfileSettingsModal';
import { Link, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

const getUrlParams = (url) => {
    try {
        const fullUrl = url.startsWith('http') ? url : `http://dummy.test${url}`;
        return new URL(fullUrl).searchParams;
    } catch {
        return new URLSearchParams();
    }
};

export default function DivisiLayout({ children }) {
    const { auth, active_year, available_fiscal_years } = usePage().props;
    const { url } = usePage();
    const user = auth?.user || {};
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const [showNotification, setShowNotification] = useState(false);
    const [profileModalOpen, setProfileModalOpen] = useState(false);

    const isRequisitionsActive = route().current('requisitions.*');
    const currentParams = getUrlParams(url);
    const currentStatus = currentParams.get('status') || 'ALL';

    const [isRequisitionsOpen, setIsRequisitionsOpen] = useState(isRequisitionsActive);

    useEffect(() => {
        if (isRequisitionsActive) {
            setIsRequisitionsOpen(true);
        }
    }, [url, isRequisitionsActive]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-100/90 via-slate-50 to-emerald-50/50 bg-fixed font-sans text-slate-800 antialiased">
            <ToastListener />

            {/* Mobile backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs transition-opacity lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Click-away backdrop for dropdowns */}
            {(profileDropdownOpen || showNotification) && (
                <div
                    className="fixed inset-0 z-35"
                    onClick={() => {
                        setProfileDropdownOpen(false);
                        setShowNotification(false);
                    }}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r-2 border-slate-300/80 bg-white shadow-lg transition-transform duration-300 lg:translate-x-0 ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                {/* 1. Distinct Logo Area (Vertical Logo Layout) */}
                <div className="border-b-2 border-emerald-100/90 bg-emerald-50/70 p-4">
                    {/* Mobile Close Button Row */}
                    <div className="flex justify-end lg:hidden mb-2">
                        <button
                            type="button"
                            className="rounded-xl border-2 border-emerald-200 bg-white p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-300 active:scale-95 transition shadow-2xs"
                            onClick={() => setSidebarOpen(false)}
                            title="Tutup Menu"
                        >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Centered Logo & Brand Info */}
                    <div className="flex flex-col items-center justify-center text-center">
                        <img
                            src="/image/logo-vertikal-rsj.png"
                            alt="Logo RSJ Tampan"
                            className="max-h-14 sm:max-h-16 max-w-[190px] w-auto h-auto object-contain drop-shadow-2xs"
                        />

                        {/* App Name & Role Badge Below */}
                        <div className="mt-3 flex flex-col items-center justify-center">
                            <div className="flex items-center gap-2">
                                <span className="text-base font-black tracking-tight text-slate-900">E-BLUD</span>
                                <span className="inline-flex items-center rounded-md bg-teal-600 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white shadow-2xs">
                                    UNIT PEMOHON
                                </span>
                            </div>
                            <p className="mt-0.5 text-[11px] font-bold text-slate-500">RSJ Tampan Prov. Riau</p>
                        </div>
                    </div>
                </div>

                {/* 2. Menu Navigation */}
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
                    {/* Menu Utama */}
                    <div>
                        <div className="px-3 pb-2 text-[11px] font-black uppercase tracking-wider text-slate-400">
                            Menu Utama
                        </div>
                        <nav className="space-y-1">
                            <Link
                                href={route('divisi.dashboard')}
                                onClick={() => setSidebarOpen(false)}
                                className={`group flex items-center gap-3 rounded-xl py-2.5 pr-3 text-sm transition-all duration-150 ${
                                    route().current('divisi.dashboard')
                                        ? 'bg-teal-50 text-teal-900 font-bold border-l-4 border-teal-600 pl-3 shadow-2xs'
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-semibold pl-4'
                                }`}
                            >
                                <span className={route().current('divisi.dashboard') ? 'text-teal-600' : 'text-slate-400 group-hover:text-slate-600'}>
                                    <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                                    </svg>
                                </span>
                                <span className="truncate">Dashboard Unit</span>
                                {route().current('divisi.dashboard') && (
                                    <span className="ml-auto h-2 w-2 rounded-full bg-teal-600" />
                                )}
                            </Link>
                        </nav>
                    </div>

                    {/* Pengadaan Belanja E-BLUD */}
                    <div>
                        <div className="px-3 pb-2 text-[11px] font-black uppercase tracking-wider text-slate-400">
                            Pengadaan E-BLUD
                        </div>
                        <nav className="space-y-1">
                            {/* Collapsible Usulan Belanja Menu */}
                            <div className="space-y-1">
                                <button
                                    type="button"
                                    onClick={() => setIsRequisitionsOpen(!isRequisitionsOpen)}
                                    className={`group flex w-full items-center justify-between rounded-xl py-2.5 pr-3 text-sm transition-all duration-150 cursor-pointer ${
                                        isRequisitionsActive
                                            ? 'bg-teal-50/70 text-teal-900 font-bold border-l-4 border-teal-600 pl-3 shadow-2xs'
                                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-semibold pl-4'
                                    }`}
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <span className={isRequisitionsActive ? 'text-teal-600' : 'text-slate-400 group-hover:text-slate-600'}>
                                            <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                            </svg>
                                        </span>
                                        <span className="truncate">Usulan Belanja</span>
                                    </div>
                                    <svg
                                        className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
                                            isRequisitionsOpen ? 'rotate-180 text-teal-600' : ''
                                        }`}
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={2.2}
                                        stroke="currentColor"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                    </svg>
                                </button>

                                {/* Sub-menu Items */}
                                {isRequisitionsOpen && (
                                    <div className="ml-5 pl-3 border-l-2 border-slate-200 space-y-1 pt-1">
                                        <Link
                                            href={route('requisitions.index')}
                                            onClick={() => setSidebarOpen(false)}
                                            className={`flex items-center gap-2 rounded-lg py-1.5 px-2.5 text-xs transition-colors ${
                                                isRequisitionsActive && (currentStatus === 'ALL' || !currentParams.has('status'))
                                                    ? 'bg-teal-100/70 text-teal-900 font-bold'
                                                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-medium'
                                            }`}
                                        >
                                            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                                            <span className="truncate">Semua Pengajuan</span>
                                        </Link>

                                        <Link
                                            href={route('requisitions.index', { status: 'Pending_Perencanaan' })}
                                            onClick={() => setSidebarOpen(false)}
                                            className={`flex items-center gap-2 rounded-lg py-1.5 px-2.5 text-xs transition-colors ${
                                                isRequisitionsActive && currentStatus === 'Pending_Perencanaan'
                                                    ? 'bg-amber-100/80 text-amber-900 font-bold'
                                                    : 'text-slate-600 hover:bg-amber-50 hover:text-amber-800 font-medium'
                                            }`}
                                        >
                                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                                            <span className="truncate">Menunggu Telaah</span>
                                        </Link>

                                        <Link
                                            href={route('requisitions.index', { status: 'Diproses_Keuangan' })}
                                            onClick={() => setSidebarOpen(false)}
                                            className={`flex items-center gap-2 rounded-lg py-1.5 px-2.5 text-xs transition-colors ${
                                                isRequisitionsActive && currentStatus === 'Diproses_Keuangan'
                                                    ? 'bg-blue-100/80 text-blue-900 font-bold'
                                                    : 'text-slate-600 hover:bg-blue-50 hover:text-blue-800 font-medium'
                                            }`}
                                        >
                                            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                                            <span className="truncate">Diproses Keuangan</span>
                                        </Link>

                                        <Link
                                            href={route('requisitions.index', { status: 'Disetujui_Selesai' })}
                                            onClick={() => setSidebarOpen(false)}
                                            className={`flex items-center gap-2 rounded-lg py-1.5 px-2.5 text-xs transition-colors ${
                                                isRequisitionsActive && currentStatus === 'Disetujui_Selesai'
                                                    ? 'bg-emerald-100/80 text-emerald-900 font-bold'
                                                    : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-800 font-medium'
                                            }`}
                                        >
                                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                            <span className="truncate">Disetujui Selesai</span>
                                        </Link>

                                        <Link
                                            href={route('requisitions.index', { status: 'Ditolak' })}
                                            onClick={() => setSidebarOpen(false)}
                                            className={`flex items-center gap-2 rounded-lg py-1.5 px-2.5 text-xs transition-colors ${
                                                isRequisitionsActive && currentStatus === 'Ditolak'
                                                    ? 'bg-rose-100/80 text-rose-900 font-bold'
                                                    : 'text-slate-600 hover:bg-rose-50 hover:text-rose-800 font-medium'
                                            }`}
                                        >
                                            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                                            <span className="truncate">Perlu Perbaikan / Ditolak</span>
                                        </Link>
                                    </div>
                                )}
                            </div>

                            {/* Shortcut: Buat Pengajuan Baru */}
                            <div className="pt-2">
                                <Link
                                    href={route('requisitions.create')}
                                    onClick={() => setSidebarOpen(false)}
                                    className="flex items-center justify-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-95 text-white py-2.5 px-3 text-xs font-bold shadow-sm hover:shadow transition"
                                >
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                    </svg>
                                    <span>Buat Usulan Baru</span>
                                </Link>
                            </div>
                        </nav>
                    </div>
                </div>

                {/* 4. Sidebar Footer */}
                <div className="border-t-2 border-slate-200/90 bg-slate-50 px-4 py-3 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500">Sistem E-BLUD RSJ Tampan</span>
                    <span className="text-[10px] font-black rounded-md bg-teal-100 text-teal-800 px-1.5 py-0.5 border border-teal-300">
                        v1.0
                    </span>
                </div>
            </aside>

            {/* Content Area */}
            <div className="flex min-h-screen flex-col lg:pl-72">
                {/* 3-Column Topbar */}
                <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b-2 border-slate-200/90 bg-white/95 px-4 backdrop-blur-md shadow-2xs sm:px-8">
                    {/* Left Column: Context & Greeting */}
                    <div className="flex items-center gap-3 min-w-0">
                        <button
                            type="button"
                            className="rounded-xl border-2 border-slate-200 p-2 text-slate-600 hover:bg-slate-50 hover:text-slate-900 active:scale-95 transition lg:hidden"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                            </svg>
                        </button>
                        <div className="min-w-0">
                            <h1 className="text-sm sm:text-base font-black text-slate-900 truncate">
                                Selamat datang, {user?.name} 👋
                            </h1>
                            <p className="text-xs font-semibold text-teal-700 truncate">
                                {user?.unit?.name ? `${user.unit.name} • ${user.division?.name}` : user.division?.name || 'Unit Pemohon E-BLUD'}
                            </p>
                        </div>
                    </div>

                    {/* Right Column: Actions & Profile Dropdown */}
                    <div className="flex items-center gap-2.5 sm:gap-3.5">
                        {/* Global Year Selector */}
                        <div className="flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-2.5 py-1 text-xs shadow-2xs">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider hidden sm:inline">TA</span>
                            <select
                                value={active_year || 2026}
                                onChange={(e) => router.post(route('set-year'), { year: e.target.value })}
                                className="bg-transparent border-none text-xs font-bold text-teal-800 focus:ring-0 cursor-pointer p-0 pr-6"
                                aria-label="Tahun Anggaran"
                            >
                                {available_fiscal_years && available_fiscal_years.length > 0 ? (
                                    available_fiscal_years.map((y) => (
                                        <option key={y.year} value={y.year}>
                                            {y.year} {y.is_default ? '★' : ''}
                                        </option>
                                    ))
                                ) : (
                                    <>
                                        <option value="2025">2025</option>
                                        <option value="2026">2026</option>
                                        <option value="2027">2027</option>
                                        <option value="2028">2028</option>
                                    </>
                                )}
                            </select>
                        </div>

                        {/* Notification Bell */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setShowNotification(!showNotification)}
                                className="relative rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50 hover:text-slate-900 active:scale-95 shadow-2xs transition-all duration-200 cursor-pointer"
                                title="Notifikasi"
                            >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                                </svg>
                                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-teal-500 ring-2 ring-white" />
                            </button>

                            {/* Notification Popup */}
                            {showNotification && (
                                <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl z-50">
                                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                        <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                                            Pemberitahuan
                                        </span>
                                        <span className="rounded-full bg-teal-100 px-2 py-0.5 text-[10px] font-bold text-teal-800">
                                            Aktif
                                        </span>
                                    </div>
                                    <div className="mt-3 space-y-2">
                                        <div className="rounded-xl bg-slate-50 p-2.5 text-xs text-slate-700 border border-slate-100">
                                            <p className="font-bold text-slate-900">Portal Unit Kerja Siap</p>
                                            <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                                                Gunakan portal ini untuk mengajukan kebutuhan barang dan jasa unit Anda.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* User Avatar & Dropdown */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                                className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white p-1.5 pr-3 hover:bg-slate-50 active:scale-95 transition-all duration-200 shadow-2xs cursor-pointer"
                            >
                                {user?.avatar ? (
                                    <img
                                        src={user.avatar_url || `/storage/${user.avatar}`}
                                        alt={user.name}
                                        className="h-8 w-8 shrink-0 rounded-lg object-cover ring-1 ring-slate-200 shadow-xs"
                                    />
                                ) : (
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-600 font-bold text-xs text-white shadow-xs">
                                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                )}
                                <div className="hidden text-left sm:block">
                                    <span className="block text-xs font-bold text-slate-900 leading-tight truncate max-w-[120px]">
                                        {user?.name}
                                    </span>
                                    <span className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                                        {user?.unit?.unit_code || user?.division?.division_code || 'UNIT'}
                                    </span>
                                </div>
                                <svg
                                    className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
                                        profileDropdownOpen ? 'rotate-180' : ''
                                    }`}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={2}
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                </svg>
                            </button>

                            {/* Dropdown Card */}
                            {profileDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl z-50">
                                    {/* User header */}
                                    <div className="flex items-center gap-3 border-b border-slate-100 px-3 py-2.5">
                                        {user?.avatar ? (
                                            <img
                                                src={user.avatar_url || `/storage/${user.avatar}`}
                                                alt={user.name}
                                                className="h-9 w-9 shrink-0 rounded-xl object-cover ring-1 ring-slate-200"
                                            />
                                        ) : (
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-600 font-bold text-sm text-white shadow-xs">
                                                {user?.name?.charAt(0).toUpperCase() || 'U'}
                                            </div>
                                        )}
                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs font-bold text-slate-900 truncate">{user?.name}</p>
                                            <p className="text-[11px] font-medium text-slate-500 truncate">{user?.email}</p>
                                            <span className="mt-1 inline-flex items-center rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-bold text-teal-800 border border-teal-200">
                                                {user?.unit?.name || user?.division?.name || 'Unit Pemohon'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Action Links */}
                                    <div className="py-1">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setProfileDropdownOpen(false);
                                                setProfileModalOpen(true);
                                            }}
                                            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-teal-50 hover:text-teal-700 transition cursor-pointer text-left"
                                        >
                                            <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                                            </svg>
                                            Pengaturan Profil
                                        </button>
                                    </div>

                                    <div className="border-t border-slate-100 pt-1">
                                        <Link
                                            href={route('logout')}
                                            method="post"
                                            as="button"
                                            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition text-left cursor-pointer"
                                        >
                                            <svg className="h-4 w-4 text-rose-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                                            </svg>
                                            Keluar (Log Out)
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-4 sm:p-6 lg:p-8">
                    <div className="animate-fade-in-up transition-all duration-300">
                        {children}
                    </div>
                </main>
            </div>

            {/* Modal Pengaturan Profil */}
            <ProfileSettingsModal
                show={profileModalOpen}
                onClose={() => setProfileModalOpen(false)}
            />
        </div>
    );
}
