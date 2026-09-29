import ToastListener from '@/Components/ToastListener';
import ProfileSettingsModal from '@/Components/ProfileSettingsModal';
import { Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

import { LayoutDashboard, Wallet, PiggyBank, ClipboardCheck, FileText, TrendingDown } from 'lucide-react';

const menuGroups = [
    {
        title: 'Menu Utama',
        items: [
            {
                name: 'Dashboard',
                href: route('keuangan.dashboard'),
                routeName: 'keuangan.dashboard',
                icon: <LayoutDashboard className="h-5 w-5 shrink-0" strokeWidth={2} />,
            },
        ],
    },
    {
        title: 'Anggaran & Kas BLUD',
        items: [
            {
                name: 'Pendapatan BLUD',
                href: route('revenues.index'),
                routeName: 'revenues.*',
                icon: <Wallet className="h-5 w-5 shrink-0" strokeWidth={2} />,
                subItems: [
                    { name: 'Semua', href: route('revenues.index') },
                    { name: 'Jasa Layanan', href: route('revenues.index', { category: 'Jasa Layanan' }) },
                    { name: 'Hasil Kerja Sama', href: route('revenues.index', { category: 'Hasil Kerja Sama' }) },
                    { name: 'APBD', href: route('revenues.index', { category: 'APBD' }) },
                    { name: 'Lain-lain BLUD Sah', href: route('revenues.index', { category: 'Lain-lain BLUD Sah' }) },
                ]
            },
            {
                name: 'Pagu Anggaran DPA',
                href: route('budgets.index'),
                routeName: 'budgets.*',
                icon: <PiggyBank className="h-5 w-5 shrink-0" strokeWidth={2} />,
            },
        ],
    },
    {
        title: 'Verifikasi & Pembebanan',
        items: [
            {
                name: 'Validasi Requisition',
                href: route('keuangan.requisitions.index'),
                routeName: 'keuangan.requisitions.*',
                icon: <ClipboardCheck className="h-5 w-5 shrink-0" strokeWidth={2} />,
            },
        ],
    },
    {
        title: 'Laporan & Akuntabilitas',
        items: [
            {
                name: 'Laporan Realisasi',
                href: route('reports.index'),
                routeName: 'reports.index',
                icon: <FileText className="h-5 w-5 shrink-0" strokeWidth={2} />,
            },
            {
                name: 'Surplus / Defisit',
                href: route('reports.surplus-deficit'),
                routeName: 'reports.surplus-deficit*',
                icon: <TrendingDown className="h-5 w-5 shrink-0" strokeWidth={2} />,
            },
        ],
    },
];

export default function KeuanganLayout({ children }) {
    const { auth, active_year, available_fiscal_years } = usePage().props;
    const user = auth?.user || {};
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [openDropdowns, setOpenDropdowns] = useState({});
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const [showNotification, setShowNotification] = useState(false);
    const [profileModalOpen, setProfileModalOpen] = useState(false);

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
                                <span className="inline-flex items-center rounded-md bg-emerald-600 px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white shadow-2xs">
                                    KEUANGAN
                                </span>
                            </div>
                            <p className="mt-0.5 text-[11px] font-bold text-slate-500">Bagian Keuangan & Anggaran</p>
                        </div>
                    </div>
                </div>

                {/* 2. Menu Navigation with Categories */}
                <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
                    {menuGroups.map((group, gIdx) => (
                        <div key={gIdx}>
                            <div className="px-3 pb-2 text-[11px] font-black uppercase tracking-wider text-slate-400">
                                {group.title}
                            </div>
                            <nav className="space-y-1.5">
                                {group.items.map((item) => {
                                    const active = route().current(item.routeName);
                                    const isOpen = openDropdowns[item.name] ?? active;
                                    
                                    // Extract category from URL to highlight sub-items
                                    const url = usePage().url;
                                    let currentCategory = 'Semua';
                                    if (url.includes('?category=')) {
                                        currentCategory = decodeURIComponent(url.split('?category=')[1].split('&')[0]);
                                    }
                                    
                                    if (item.subItems) {
                                        return (
                                            <div key={item.name} className="space-y-1">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setOpenDropdowns((prev) => ({
                                                            ...prev,
                                                            [item.name]: !isOpen,
                                                        }));
                                                    }}
                                                    className={`w-full group flex items-center justify-between rounded-xl py-2.5 pr-3 text-sm transition-all duration-150 cursor-pointer ${
                                                        active
                                                            ? 'bg-emerald-50/70 text-emerald-900 font-bold border-l-4 border-emerald-600 pl-3'
                                                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-semibold pl-4'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <span
                                                            className={`transition-colors ${
                                                                active ? 'text-emerald-600' : 'text-slate-400 group-hover:text-slate-600'
                                                            }`}
                                                        >
                                                            {item.icon}
                                                        </span>
                                                        <span className="truncate">{item.name}</span>
                                                    </div>
                                                    <svg
                                                        className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
                                                            isOpen ? 'rotate-180 text-emerald-600' : ''
                                                        }`}
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        strokeWidth={2}
                                                        stroke="currentColor"
                                                    >
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                                    </svg>
                                                </button>

                                                {isOpen && (
                                                    <div className="ml-4 space-y-1 border-l-2 border-slate-200 pl-3 pt-1">
                                                        {item.subItems.map((sub) => {
                                                            const isSubActive = active && sub.name === currentCategory;
                                                            return (
                                                                <Link
                                                                    key={sub.name}
                                                                    href={sub.href}
                                                                    onClick={() => setSidebarOpen(false)}
                                                                    className={`group flex items-center gap-2.5 rounded-lg py-2 px-3 text-xs transition-colors ${
                                                                        isSubActive
                                                                            ? 'bg-emerald-100/70 text-emerald-900 font-black shadow-2xs'
                                                                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium'
                                                                    }`}
                                                                >
                                                                    <span className={`h-1.5 w-1.5 rounded-full ${isSubActive ? 'bg-emerald-600' : 'bg-slate-300 group-hover:bg-slate-400'}`} />
                                                                    <span className="truncate">{sub.name}</span>
                                                                </Link>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    }

                                    return (
                                        <div key={item.name} className="flex flex-col gap-1">
                                            <Link
                                                href={item.href}
                                                onClick={() => {
                                                    if (!item.subItems) setSidebarOpen(false);
                                                }}
                                                className={`group flex items-center gap-3 rounded-xl py-2.5 pr-3 text-sm transition-all duration-150 ${
                                                    active
                                                        ? 'bg-emerald-50/90 text-emerald-900 font-black border-l-4 border-emerald-600 pl-3 shadow-2xs'
                                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-semibold pl-4'
                                                }`}
                                            >
                                                <span
                                                    className={`transition-colors ${
                                                        active ? 'text-emerald-600' : 'text-slate-400 group-hover:text-slate-600'
                                                    }`}
                                                >
                                                    {item.icon}
                                                </span>
                                                <span className="truncate">{item.name}</span>
                                            </Link>
                                        </div>
                                    );
                                })}
                            </nav>
                        </div>
                    ))}
                </div>

                {/* 3. Sidebar Footer */}
                <div className="border-t-2 border-slate-200/90 bg-slate-50 px-4 py-3 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500">Sistem E-BLUD RSJ Tampan</span>
                    <span className="text-[10px] font-black rounded-md bg-emerald-100 text-emerald-800 px-1.5 py-0.5 border border-emerald-300">
                        v1.0
                    </span>
                </div>
            </aside>

            {/* Content Area with 3-Column Topbar */}
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
                                Selamat datang, {user.name} 👋
                            </h1>
                            <p className="text-xs font-semibold text-emerald-700 truncate">
                                Bagian Keuangan & Anggaran
                            </p>
                        </div>
                    </div>



                    {/* Right Column: Actions & Profile Dropdown */}
                    <div className="flex items-center gap-2.5 sm:gap-3.5">
                        {/* Notification Bell */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setShowNotification(!showNotification)}
                                className="relative rounded-xl border-2 border-slate-200 bg-white p-2.5 text-slate-600 hover:bg-slate-50 hover:text-slate-900 active:scale-95 shadow-2xs transition-all duration-200"
                                title="Notifikasi"
                            >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                                </svg>
                                <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white animate-pulse" />
                            </button>

                            {/* Notification Popup */}
                            {showNotification && (
                                <div className="absolute right-0 mt-2 w-72 rounded-2xl border-2 border-slate-300 bg-white p-4 shadow-xl z-50">
                                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                                        <span className="text-xs font-black uppercase tracking-wider text-slate-800">
                                            Pemberitahuan
                                        </span>
                                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-black text-emerald-800">
                                            Aktif
                                        </span>
                                    </div>
                                    <div className="mt-3 space-y-2">
                                        <div className="rounded-xl bg-slate-50 p-2.5 text-xs text-slate-700 border border-slate-200">
                                            <p className="font-bold text-slate-900">Validasi Anggaran Terhubung</p>
                                            <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                                                Saldo dan rekening DPA siap dialokasikan.
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
                                className="flex items-center gap-2.5 rounded-2xl border-2 border-slate-200 bg-white p-1.5 pr-3 hover:bg-slate-50 active:scale-95 transition-all duration-200 shadow-2xs"
                            >
                                {user.avatar ? (
                                    <img
                                        src={user.avatar_url || `/storage/${user.avatar}`}
                                        alt={user.name}
                                        className="h-9 w-9 shrink-0 rounded-xl object-cover ring-1 ring-slate-200 shadow-xs"
                                    />
                                ) : (
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-600 font-black text-sm text-white shadow-xs">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <div className="hidden text-left sm:block">
                                    <span className="block text-xs font-black text-slate-900 leading-tight truncate max-w-[120px]">
                                        {user.name}
                                    </span>
                                    <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                        Keuangan
                                    </span>
                                </div>
                                <svg
                                    className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
                                        profileDropdownOpen ? 'rotate-180' : ''
                                    }`}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={2.5}
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                </svg>
                            </button>

                            {/* Dropdown Card */}
                            {profileDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-64 rounded-2xl border-2 border-slate-300 bg-white p-2 shadow-xl z-50">
                                    {/* User header */}
                                    <div className="flex items-center gap-3 border-b border-slate-100 px-3 py-2.5">
                                        {user.avatar ? (
                                            <img
                                                src={user.avatar_url || `/storage/${user.avatar}`}
                                                alt={user.name}
                                                className="h-10 w-10 shrink-0 rounded-xl object-cover ring-1 ring-slate-200"
                                            />
                                        ) : (
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 font-black text-base text-white shadow-xs">
                                                {user.name.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs font-black text-slate-900 truncate">{user.name}</p>
                                            <p className="text-[11px] font-medium text-slate-500 truncate">{user.email}</p>
                                            <span className="mt-1 inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-black text-emerald-900 border border-emerald-300 capitalize">
                                                Peran: Keuangan
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
                                            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition cursor-pointer text-left"
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
                                            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 transition text-left"
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

            {/* Modal Card Pengaturan Akun & Profil */}
            <ProfileSettingsModal
                show={profileModalOpen}
                onClose={() => setProfileModalOpen(false)}
            />
        </div>
    );
}
