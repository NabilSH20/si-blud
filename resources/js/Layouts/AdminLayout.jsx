import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

const menuGroups = [
    {
        title: 'Menu Utama',
        items: [
            {
                name: 'Dashboard',
                href: route('admin.dashboard'),
                routeName: 'admin.dashboard',
                icon: (
                    <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                    </svg>
                ),
            },
        ],
    },
    {
        title: 'Master Data & Akses',
        items: [
            {
                name: 'Master Divisi',
                href: route('divisions.index'),
                routeName: 'divisions.*',
                icon: (
                    <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
                    </svg>
                ),
            },
            {
                name: 'Kelola Pengguna',
                href: route('users.index'),
                routeName: 'users.*',
                icon: (
                    <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                    </svg>
                ),
            },
        ],
    },
];

export default function AdminLayout({ children }) {
    const user = usePage().props.auth.user;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const [showNotification, setShowNotification] = useState(false);

    return (
        <div className="min-h-screen bg-slate-100 font-sans text-slate-800 antialiased">
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
                                <span className="text-base font-black tracking-tight text-slate-900">E-Requisition</span>
                                <span className="inline-flex items-center rounded-md bg-emerald-600 px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white shadow-2xs">
                                    ADMIN
                                </span>
                            </div>
                            <p className="mt-0.5 text-[11px] font-bold text-slate-500">RSJ Tampan Prov. Riau</p>
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
                                    return (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            onClick={() => setSidebarOpen(false)}
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
                                            {active && (
                                                <span className="ml-auto h-2 w-2 rounded-full bg-emerald-600 shadow-xs shadow-emerald-500/50" />
                                            )}
                                        </Link>
                                    );
                                })}
                            </nav>
                        </div>
                    ))}
                </div>

                {/* 3. Sidebar Footer */}
                <div className="border-t-2 border-slate-200/90 bg-slate-50 px-4 py-3 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-500">E-BLUD RSJ Tampan</span>
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
                            <p className="text-xs font-semibold text-slate-500 truncate">
                                Portal Administrator Sistem
                            </p>
                        </div>
                    </div>

                    {/* Center Column: Dummy Search Bar */}
                    <div className="hidden md:flex items-center w-full max-w-xs lg:max-w-md mx-4">
                        <div className="relative w-full">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                disabled
                                placeholder="Cari data master, pengguna, atau divisi..."
                                className="block w-full rounded-xl border-2 border-slate-200 bg-slate-100/70 pl-10 pr-12 py-2 text-xs font-medium text-slate-600 placeholder:text-slate-400 cursor-pointer hover:bg-slate-100 transition focus:outline-none"
                            />
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                <kbd className="inline-flex items-center rounded-md border border-slate-300 bg-white px-1.5 py-0.5 font-mono text-[10px] font-bold text-slate-400 shadow-2xs">
                                    ⌘K
                                </kbd>
                            </div>
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
                                            <p className="font-bold text-slate-900">Sistem E-Req Berjalan Optimal</p>
                                            <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                                                Database dan modul terhubung dengan lancar.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="h-7 w-px bg-slate-200 hidden sm:block" />

                        {/* User Avatar & Dropdown */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                                className="flex items-center gap-2.5 rounded-2xl border-2 border-slate-200 bg-white p-1.5 pr-3 hover:bg-slate-50 active:scale-95 transition-all duration-200 shadow-2xs"
                            >
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-600 font-black text-sm text-white shadow-xs">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="hidden text-left sm:block">
                                    <span className="block text-xs font-black text-slate-900 leading-tight truncate max-w-[120px]">
                                        {user.name}
                                    </span>
                                    <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                        {user.role}
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
                                    <div className="border-b border-slate-100 px-3 py-2.5">
                                        <p className="text-xs font-black text-slate-900 truncate">{user.name}</p>
                                        <p className="text-[11px] font-medium text-slate-500 truncate">{user.email}</p>
                                        <span className="mt-1.5 inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-[10px] font-black text-purple-900 border border-purple-300 capitalize">
                                            Peran: {user.role}
                                        </span>
                                    </div>

                                    {/* Action Links */}
                                    <div className="py-1">
                                        <Link
                                            href={route('profile.edit')}
                                            onClick={() => setProfileDropdownOpen(false)}
                                            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition"
                                        >
                                            <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                                            </svg>
                                            Pengaturan Profil
                                        </Link>
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

                <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
            </div>
        </div>
    );
}
