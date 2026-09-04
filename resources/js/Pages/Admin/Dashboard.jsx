import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

export default function Dashboard({
    total_users = 0,
    total_divisions = 0,
    users_by_role = [],
    requisitions_by_division = [],
}) {
    const user = usePage().props.auth.user;

    return (
        <AdminLayout>
            <Head title="Dashboard Administrator - E-BLUD RSJ Tampan" />

            {/* Hero Welcome Banner */}
            <div className="relative mb-8 overflow-hidden rounded-3xl bg-emerald-950 p-6 text-white shadow-xl shadow-emerald-950/20 sm:p-8">
                {/* Hospital Background Image with Blur Effect */}
                <img
                    src="/images/bg.jpeg"
                    alt="Gedung RSJ Tampan"
                    className="pointer-events-none absolute inset-0 h-full w-full scale-105 object-cover object-center filter blur-[2px] brightness-75 transition-transform duration-700"
                />

                {/* Emerald & Teal Gradient Overlay to Preserve Brand Colors & High Contrast */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-emerald-900/90 via-emerald-800/85 to-teal-900/80 mix-blend-multiply" />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-emerald-950/70 via-transparent to-black/20" />

                <div className="pointer-events-none absolute -right-10 -top-10 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-8 right-32 h-48 w-48 rounded-full bg-teal-400/20 blur-2xl" />

                <div className="relative z-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
                    <div className="max-w-xl">
                        <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur-md text-emerald-100 ring-1 ring-white/20 mb-3">
                            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                            Sistem Informasi Perencanaan & Keuangan E-BLUD
                        </div>
                        <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
                            Selamat Datang, {user.name}!
                        </h1>
                        <p className="mt-2 text-sm text-emerald-100 leading-relaxed">
                            Kelola data master divisi, akun staf pengguna, dan konfigurasi akses sistem terintegrasi RSJ Tampan Provinsi Riau.
                        </p>
                    </div>

                    <div className="flex shrink-0 flex-wrap gap-3">
                        <Link
                            href={route('divisions.index')}
                            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-emerald-800 shadow-md transition-all hover:bg-emerald-50 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-white/80"
                        >
                            Kelola Divisi
                        </Link>
                        <Link
                            href={route('users.index')}
                            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600/80 px-4 py-2.5 text-xs font-bold text-white shadow-md transition-all hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-white/80"
                        >
                            Kelola Pengguna
                        </Link>
                    </div>
                </div>
            </div>

            {/* Standardized 3-Column Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {/* Metric Card 1: Total Pengguna */}
                <div className="bg-white rounded-2xl shadow-md shadow-emerald-950/5 border border-emerald-100/90 p-6 flex items-center justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-900/10">
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Total Pengguna Terdaftar</p>
                        <h3 className="text-3xl font-bold text-gray-800 mt-2">{total_users}</h3>
                        <p className="mt-1 text-xs font-bold text-purple-600">Akun Petugas & Staf</p>
                    </div>
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 ring-1 ring-purple-500/20">
                        <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                        </svg>
                    </div>
                </div>

                {/* Metric Card 2: Total Divisi */}
                <div className="bg-white rounded-2xl shadow-md shadow-emerald-950/5 border border-emerald-100/90 p-6 flex items-center justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-900/10">
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Total Divisi & Unit Kerja</p>
                        <h3 className="text-3xl font-bold text-gray-800 mt-2">{total_divisions}</h3>
                        <p className="mt-1 text-xs font-bold text-emerald-600">Unit Organisasi Aktif</p>
                    </div>
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-500/20">
                        <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
                        </svg>
                    </div>
                </div>

                {/* Metric Card 3: Status Sistem E-BLUD */}
                <div className="bg-white rounded-2xl shadow-md shadow-emerald-950/5 border border-emerald-100/90 p-6 flex items-center justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-900/10">
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Status Integrasi E-BLUD</p>
                        <h3 className="text-3xl font-bold text-gray-800 mt-2">Aktif</h3>
                        <p className="mt-1 text-xs font-bold text-teal-600">Database & Modul Siap</p>
                    </div>
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-600 ring-1 ring-teal-500/20">
                        <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Executive Analytics Charts (Recharts) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Chart 1: Distribusi Staf per Peran */}
                <div className="bg-white rounded-2xl shadow-md shadow-emerald-950/5 border border-emerald-100/90 p-6 hover:shadow-lg hover:shadow-emerald-900/10 transition-all">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h4 className="text-base font-bold text-slate-900">Distribusi Akun per Peran</h4>
                            <p className="text-xs text-slate-500">Jumlah staf aktif berdasarkan hak akses sistem</p>
                        </div>
                        <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-bold text-purple-700">
                            Staf Pengguna
                        </span>
                    </div>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={users_by_role} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} />
                                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '0.75rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                                />
                                <Bar dataKey="total" name="Jumlah Akun" fill="#9333ea" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Chart 2: Pengajuan Requisition per Divisi */}
                <div className="bg-white rounded-2xl shadow-md shadow-emerald-950/5 border border-emerald-100/90 p-6 hover:shadow-lg hover:shadow-emerald-900/10 transition-all">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h4 className="text-base font-bold text-slate-900">Aktivitas Pengajuan Unit Kerja</h4>
                            <p className="text-xs text-slate-500">Jumlah pengajuan requisition per unit kerja</p>
                        </div>
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                            Pengajuan E-BLUD
                        </span>
                    </div>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={requisitions_by_division} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} />
                                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '0.75rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                                />
                                <Bar dataKey="total" name="Jumlah Pengajuan" fill="#059669" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Quick Actions & Navigation Shortcuts */}
            <div className="grid gap-6 md:grid-cols-2">
                <Link
                    href={route('divisions.index')}
                    className="group relative flex items-start gap-4 rounded-2xl border border-emerald-100/90 bg-white p-6 shadow-md shadow-emerald-950/5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-900/10"
                >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-500/20">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6h1.5m-1.5 3h1.5m-1.5 3h1.5M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
                        </svg>
                    </div>
                    <div>
                        <h4 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition">
                            Kelola Master Divisi
                        </h4>
                        <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                            Atur daftar unit kerja, instalasi, dan bagian yang berhak melakukan pengajuan barang di sistem E-BLUD.
                        </p>
                    </div>
                </Link>

                <Link
                    href={route('users.index')}
                    className="group relative flex items-start gap-4 rounded-2xl border border-emerald-100/90 bg-white p-6 shadow-md shadow-emerald-950/5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-900/10"
                >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600 ring-1 ring-purple-500/20">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                        </svg>
                    </div>
                    <div>
                        <h4 className="text-base font-bold text-slate-900 group-hover:text-purple-700 transition">
                            Kelola Akun Pengguna
                        </h4>
                        <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                            Kelola akun staf Divisi, staf Perencanaan & Pengadaan, serta staf Keuangan beserta hak akses masing-masing.
                        </p>
                    </div>
                </Link>
            </div>
        </AdminLayout>
    );
}
