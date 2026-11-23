import ImpersonateBanner from '@/Components/ImpersonateBanner';
import ProfileSettingsModal from '@/Components/ProfileSettingsModal';
import ToastListener from '@/Components/ToastListener';
import { Link, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import {
    Activity,
    Building2,
    Calendar,
    ChevronDown,
    FileSpreadsheet,
    FileText,
    Hand,
    LayoutDashboard,
    Lock,
    LogOut,
    Menu,
    Settings,
    Shield,
    Users,
    Wallet,
    X,
} from 'lucide-react';

const menuGroups = [
    {
        title: 'Menu Utama',
        items: [
            {
                name: 'Dashboard Global',
                href: route('superadmin.dashboard'),
                routeName: 'superadmin.dashboard',
                icon: LayoutDashboard,
            },
            {
                name: 'Manajemen Akun (Root)',
                href: route('superadmin.users.index'),
                routeName: 'superadmin.users.*',
                icon: Users,
            },
        ],
    },
    {
        title: 'Pemantauan Lintas Modul',
        items: [
            {
                name: 'Monitoring RBA (Perencanaan)',
                href: route('superadmin.monitoring.rba'),
                routeName: 'superadmin.monitoring.rba',
                icon: FileSpreadsheet,
            },
            {
                name: 'Monitoring Usulan Belanja',
                href: route('superadmin.monitoring.requisitions'),
                routeName: 'superadmin.monitoring.requisitions',
                icon: FileText,
            },
            {
                name: 'Monitoring Kas & Realisasi',
                href: route('superadmin.monitoring.finance'),
                routeName: 'superadmin.monitoring.finance',
                icon: Wallet,
            },
            {
                name: 'Portal Administrator Biasa',
                href: route('admin.dashboard'),
                routeName: 'admin.*',
                icon: Building2,
            },
        ],
    },
    {
        title: 'Sistem & Keamanan',
        items: [
            {
                name: 'System Audit Logs',
                href: route('superadmin.audit-logs.index'),
                routeName: 'superadmin.audit-logs.*',
                icon: Activity,
            },
            {
                name: 'Pengaturan Dokumen Cetak',
                href: route('superadmin.settings.index'),
                routeName: 'superadmin.settings.*',
                icon: Settings,
            },
            {
                name: 'Tahun Anggaran & Tutup Buku',
                href: route('fiscal-years.index'),
                routeName: 'fiscal-years.*',
                icon: Calendar,
            },
        ],
    },
];

export default function SuperAdminLayout({ children }) {
    const { auth, active_year, is_active_year_locked } = usePage().props;
    const user = auth?.user || {};
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const [profileModalOpen, setProfileModalOpen] = useState(false);
    const [showNotification, setShowNotification] = useState(false);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-100/90 via-slate-50 to-indigo-50/50 bg-fixed font-sans text-slate-800 antialiased">
            {/* 0. Impersonate Warning Banner */}
            <ImpersonateBanner />
            <ToastListener />

            {/* Mobile backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs transition-opacity lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Backdrop for profile & notification popups */}
            {(profileDropdownOpen || showNotification) && (
                <div
                    className="fixed inset-0 z-35"
                    onClick={() => {
                        setProfileDropdownOpen(false);
                        setShowNotification(false);
                    }}
                />
            )}

            {/* 1. Sidebar Khusus Super Admin (Indigo / Deep Slate Accent) */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r-2 border-indigo-200/80 bg-white shadow-xl transition-transform duration-300 lg:translate-x-0 ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                {/* Header Logo & Brand */}
                <div className="border-b-2 border-indigo-100 bg-gradient-to-b from-indigo-50/90 to-slate-50 p-4">
                    <div className="flex justify-end lg:hidden mb-2">
                        <button
                            type="button"
                            className="rounded-xl border border-indigo-200 bg-white p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition"
                            onClick={() => setSidebarOpen(false)}
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="flex flex-col items-center justify-center text-center">
                        <img
                            src="/images/logo-vertikal-rsj.png"
                            alt="Logo RSJ Tampan"
                            className="max-h-14 sm:max-h-16 max-w-[190px] w-auto h-auto object-contain drop-shadow-2xs"
                        />
                        <div className="mt-2.5 flex flex-col items-center">
                            <div className="flex items-center gap-1.5">
                                <span className="text-base font-black tracking-tight text-slate-900">E-BLUD</span>
                                <span className="inline-flex items-center gap-1 rounded-md bg-indigo-700 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white shadow-2xs">
                                    <Shield className="h-3 w-3" />
                                    SUPER ADMIN
                                </span>
                            </div>
                            <p className="mt-0.5 text-[11px] font-bold text-slate-500">Root Management SIM-RS</p>
                        </div>
                    </div>
                </div>

                {/* Navigation Menu */}
                <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
                    {menuGroups.map((group, idx) => (
                        <div key={idx}>
                            <div className="px-3 pb-2 text-[10px] font-black uppercase tracking-wider text-indigo-400">
                                {group.title}
                            </div>
                            <nav className="space-y-1">
                                {group.items.map((item) => {
                                    const active = route().current(item.routeName);
                                    const IconComponent = item.icon;

                                    return (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            onClick={() => setSidebarOpen(false)}
                                            className={`group flex items-center gap-3 rounded-xl py-2.5 px-3 text-xs sm:text-sm transition-all duration-150 ${
                                                active
                                                    ? 'bg-indigo-50 font-black text-indigo-950 border-l-4 border-indigo-600 shadow-2xs'
                                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-semibold'
                                            }`}
                                        >
                                            <IconComponent
                                                className={`h-4.5 w-4.5 shrink-0 transition-colors ${
                                                    active
                                                        ? 'text-indigo-600'
                                                        : 'text-slate-400 group-hover:text-indigo-600'
                                                }`}
                                            />
                                            <span className="truncate">{item.name}</span>
                                            {active && (
                                                <span className="ml-auto h-2 w-2 rounded-full bg-indigo-600" />
                                            )}
                                        </Link>
                                    );
                                })}
                            </nav>
                        </div>
                    ))}
                </div>

                {/* Footer Info */}
                <div className="border-t border-slate-200 bg-slate-50 px-4 py-3 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                    <span className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        Root System Active
                    </span>
                    <span className="font-mono text-[10px] font-black text-indigo-700 bg-indigo-100 px-1.5 py-0.5 rounded">
                        TA {active_year}
                    </span>
                </div>
            </aside>

            {/* 2. Main Content Area & Topbar */}
            <div className="flex min-h-screen flex-col lg:pl-72">
                {/* Topbar */}
                <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b-2 border-slate-200/90 bg-white/95 px-4 backdrop-blur-md shadow-2xs sm:px-8">
                    {/* Left: Mobile Toggle & Greeting */}
                    <div className="flex items-center gap-3 min-w-0">
                        <button
                            type="button"
                            className="rounded-xl border-2 border-slate-200 p-2 text-slate-600 hover:bg-slate-50 hover:text-slate-900 active:scale-95 transition lg:hidden"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <Menu className="h-5 w-5" />
                        </button>
                        <div className="min-w-0">
                            <h1 className="text-sm sm:text-base font-black text-slate-900 truncate">
                                Selamat datang, {user.name} <Hand size={18} className="inline ml-1 text-amber-500" />
                            </h1>
                            <p className="text-xs font-semibold text-indigo-700 truncate">
                                Portal Eksekutif Super Admin & Root System SIM-RS
                            </p>
                        </div>
                    </div>

                    {/* Right: Quick Actions, Year Lock Badge & Profile */}
                    <div className="flex items-center gap-2.5 sm:gap-3.5">
                        {is_active_year_locked && (
                            <span className="hidden sm:inline-flex items-center gap-1 rounded-xl bg-rose-50 border border-rose-300 px-2.5 py-1 text-xs font-bold text-rose-800">
                                <Lock className="h-3.5 w-3.5 text-rose-600" />
                                TA {active_year} Terkunci
                            </span>
                        )}

                        {/* Notification Bell */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setShowNotification(!showNotification)}
                                className="relative rounded-xl border-2 border-slate-200 bg-white p-2.5 text-slate-600 hover:bg-slate-50 hover:text-slate-900 active:scale-95 shadow-2xs transition-all duration-200 cursor-pointer"
                                title="Notifikasi Sistem"
                            >
                                <Activity className="h-4.5 w-4.5" />
                                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white animate-pulse" />
                            </button>

                            {showNotification && (
                                <div className="absolute right-0 mt-2 w-72 rounded-2xl border-2 border-slate-300 bg-white p-4 shadow-xl z-50">
                                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                        <span className="text-xs font-black uppercase tracking-wider text-slate-800">
                                            Status Sistem
                                        </span>
                                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-black text-emerald-800">
                                            Optimal
                                        </span>
                                    </div>
                                    <div className="mt-3 space-y-2 text-xs text-slate-600">
                                        <p className="font-bold text-slate-900">Root Access Aktif</p>
                                        <p className="text-[11px] text-slate-500">
                                            Audit trail terhubung ke database. Seluruh aksi tercatat otomatis.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* User Profile Dropdown */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                                className="flex items-center gap-2.5 rounded-2xl border-2 border-indigo-200 bg-white p-1.5 pr-3 hover:bg-indigo-50/50 active:scale-95 transition-all duration-200 shadow-2xs cursor-pointer"
                            >
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-700 font-black text-sm text-white shadow-xs">
                                    <Shield className="h-5 w-5" />
                                </div>
                                <div className="hidden text-left sm:block">
                                    <span className="block text-xs font-black text-slate-900 leading-tight truncate max-w-[120px]">
                                        {user.name}
                                    </span>
                                    <span className="block text-[10px] font-bold text-indigo-700 uppercase tracking-wider">
                                        SUPER ADMIN
                                    </span>
                                </div>
                                <ChevronDown
                                    className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
                                        profileDropdownOpen ? 'rotate-180' : ''
                                    }`}
                                />
                            </button>

                            {profileDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-64 rounded-2xl border-2 border-indigo-100 bg-white p-2 shadow-xl z-50">
                                    <div className="border-b border-slate-100 px-3 py-2.5">
                                        <p className="text-xs font-bold text-slate-900">{user.name}</p>
                                        <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                                        <span className="mt-1 inline-block rounded bg-indigo-100 px-2 py-0.5 text-[10px] font-black text-indigo-800">
                                            Super Admin (Root)
                                        </span>
                                    </div>
                                    <div className="py-1">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setProfileDropdownOpen(false);
                                                setProfileModalOpen(true);
                                            }}
                                            className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 rounded-xl"
                                        >
                                            Pengaturan Profil
                                        </button>
                                        <Link
                                            href={route('logout')}
                                            method="post"
                                            as="button"
                                            className="w-full text-left px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl flex items-center gap-1.5"
                                        >
                                            <LogOut className="h-3.5 w-3.5" />
                                            Keluar Sistem
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Main Content Body */}
                <main className="flex-1 p-4 sm:p-8">{children}</main>
            </div>

            {/* Profile Settings Modal */}
            <ProfileSettingsModal
                isOpen={profileModalOpen}
                onClose={() => setProfileModalOpen(false)}
            />
        </div>
    );
}
