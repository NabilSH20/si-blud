import ImpersonateBanner from '@/Components/ImpersonateBanner';
import ProfileSettingsModal from '@/Components/ProfileSettingsModal';
import ToastListener from '@/Components/ToastListener';
import { Link, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import {
    Activity,
    Bell,
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
    User as UserIcon,
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
                href: route('superadmin.fiscal-years.index'),
                routeName: 'superadmin.fiscal-years.*',
                icon: Calendar,
            },
        ],
    },
];

export default function SuperAdminLayout({ children }) {
    const { auth, active_year, is_active_year_locked } = usePage().props;
    const { url } = usePage();
    const user = auth?.user || {};
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const [profileModalOpen, setProfileModalOpen] = useState(false);
    const [showNotification, setShowNotification] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            if (params.get('profile')) {
                setProfileModalOpen(true);
            }
        }
    }, [url]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-100/90 via-slate-50 to-emerald-50/50 bg-fixed font-sans text-slate-800 antialiased">
            {/* 0. Impersonate Warning Banner */}
            <ImpersonateBanner />
            <ToastListener />

            {/* Mobile backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs transition-opacity lg:hidden"
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

            {/* 1. Sidebar Super Admin (Seragam dengan Layout Role Lainnya) */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r-2 border-slate-300/80 bg-white shadow-lg transition-transform duration-300 lg:translate-x-0 ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                {/* Header Logo & Brand */}
                <div className="border-b-2 border-emerald-100/90 bg-emerald-50/70 p-4">
                    <div className="flex justify-end lg:hidden mb-2">
                        <button
                            type="button"
                            className="rounded-xl border-2 border-emerald-200 bg-white p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-300 active:scale-95 transition shadow-2xs cursor-pointer"
                            onClick={() => setSidebarOpen(false)}
                            title="Tutup Menu"
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
                        <div className="mt-3 flex flex-col items-center justify-center">
                            <div className="flex items-center gap-2">
                                <span className="text-base font-black tracking-tight text-slate-900">E-BLUD</span>
                                <span className="inline-flex items-center gap-1 rounded-md bg-slate-800 px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white shadow-2xs">
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
                            <div className="px-3 pb-2 text-[11px] font-black uppercase tracking-wider text-slate-400">
                                {group.title}
                            </div>
                            <nav className="space-y-1.5">
                                {group.items.map((item) => {
                                    const active = route().current(item.routeName);
                                    const IconComponent = item.icon;

                                    return (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            onClick={() => setSidebarOpen(false)}
                                            className={`group flex items-center gap-3 rounded-xl py-2.5 pr-3 text-sm transition-all duration-150 ${
                                                active
                                                    ? 'bg-emerald-50 text-emerald-900 font-bold border-l-4 border-emerald-600 pl-3 shadow-2xs'
                                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-semibold pl-4'
                                            }`}
                                        >
                                            <IconComponent
                                                className={`h-5 w-5 shrink-0 transition-colors ${
                                                    active
                                                        ? 'text-emerald-600'
                                                        : 'text-slate-400 group-hover:text-slate-600'
                                                }`}
                                            />
                                            <span className="truncate">{item.name}</span>
                                            {active && (
                                                <span className="ml-auto h-2 w-2 rounded-full bg-emerald-600" />
                                            )}
                                        </Link>
                                    );
                                })}
                            </nav>
                        </div>
                    ))}
                </div>

                {/* Footer Info */}
                <div className="border-t-2 border-slate-200/90 bg-slate-50 px-4 py-3 flex items-center justify-between text-[11px] text-slate-500 font-bold">
                    <span className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        Sistem E-BLUD RSJ Tampan
                    </span>
                    <span className="font-mono text-[10px] font-black text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded-md border border-emerald-300">
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
                            className="rounded-xl border-2 border-slate-200 p-2 text-slate-600 hover:bg-slate-50 hover:text-slate-900 active:scale-95 transition lg:hidden cursor-pointer"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <Menu className="h-5 w-5" />
                        </button>
                        <div className="min-w-0">
                            <h1 className="text-sm sm:text-base font-black text-slate-900 truncate">
                                Selamat datang, {user.name} <Hand size={18} className="inline ml-1 text-amber-500" />
                            </h1>
                            <p className="text-xs font-semibold text-slate-500 truncate">
                                Portal Super Admin & Root Management SIM-RS
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
                                <Bell className="h-5 w-5" />
                                <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white animate-pulse" />
                            </button>

                            {showNotification && (
                                <div className="absolute right-0 mt-2 w-72 rounded-2xl border-2 border-slate-300 bg-white p-4 shadow-xl z-50">
                                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                                        <span className="text-xs font-black uppercase tracking-wider text-slate-800">
                                            Status Sistem
                                        </span>
                                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-black text-emerald-800">
                                            Optimal
                                        </span>
                                    </div>
                                    <div className="mt-3 space-y-2">
                                        <div className="rounded-xl bg-slate-50 p-2.5 text-xs text-slate-700 border border-slate-200">
                                            <p className="font-bold text-slate-900 flex items-center gap-1.5">
                                                <Activity className="h-3.5 w-3.5 text-emerald-600" />
                                                Root Access Aktif
                                            </p>
                                            <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                                                Audit trail terhubung ke database. Seluruh aksi tercatat otomatis.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* User Profile Dropdown */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                                className="flex items-center gap-2.5 rounded-2xl border-2 border-slate-200 bg-white p-1.5 pr-3 hover:bg-slate-50 active:scale-95 transition-all duration-200 shadow-2xs cursor-pointer"
                            >
                                {user.avatar ? (
                                    <img
                                        src={user.avatar_url || `/storage/${user.avatar}`}
                                        alt={user.name}
                                        className="h-9 w-9 shrink-0 rounded-xl object-cover ring-1 ring-slate-200 shadow-xs"
                                    />
                                ) : (
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-600 font-black text-sm text-white shadow-xs">
                                        {user.name ? user.name.charAt(0).toUpperCase() : <Shield className="h-5 w-5" />}
                                    </div>
                                )}
                                <div className="hidden text-left sm:block">
                                    <span className="block text-xs font-black text-slate-900 leading-tight truncate max-w-[120px]">
                                        {user.name}
                                    </span>
                                    <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
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
                                <div className="absolute right-0 mt-2 w-64 rounded-2xl border-2 border-slate-300 bg-white p-2 shadow-xl z-50">
                                    <div className="flex items-center gap-3 border-b border-slate-100 px-3 py-2.5">
                                        {user.avatar ? (
                                            <img
                                                src={user.avatar_url || `/storage/${user.avatar}`}
                                                alt={user.name}
                                                className="h-10 w-10 shrink-0 rounded-xl object-cover ring-1 ring-slate-200"
                                            />
                                        ) : (
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 font-black text-base text-white shadow-xs">
                                                {user.name ? user.name.charAt(0).toUpperCase() : 'S'}
                                            </div>
                                        )}
                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs font-black text-slate-900 truncate">{user.name}</p>
                                            <p className="text-[11px] font-medium text-slate-500 truncate">{user.email}</p>
                                            <span className="mt-1 inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-black text-emerald-900 border border-emerald-300">
                                                Super Admin (Root)
                                            </span>
                                        </div>
                                    </div>
                                    <div className="py-1">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setProfileDropdownOpen(false);
                                                setProfileModalOpen(true);
                                            }}
                                            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition cursor-pointer text-left"
                                        >
                                            <UserIcon className="h-4 w-4 text-slate-400" />
                                            Pengaturan Profil
                                        </button>
                                    </div>
                                    <div className="border-t border-slate-100 pt-1">
                                        <Link
                                            href={route('logout')}
                                            method="post"
                                            as="button"
                                            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 transition text-left cursor-pointer"
                                        >
                                            <LogOut className="h-4 w-4 text-rose-500" />
                                            Keluar (Log Out)
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Main Content Body */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8">
                    <div className="animate-fade-in-up transition-all duration-300">
                        {children}
                    </div>
                </main>
            </div>

            {/* Profile Settings Modal */}
            <ProfileSettingsModal
                show={profileModalOpen}
                onClose={() => setProfileModalOpen(false)}
            />
        </div>
    );
}
