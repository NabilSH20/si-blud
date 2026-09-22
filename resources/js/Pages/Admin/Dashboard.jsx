import AdminLayout from '@/Layouts/AdminLayout';
import Pagination from '@/Components/Pagination';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

// Soft, eye-friendly palette matching the Kemenkes/SATUSEHAT reference
const PIE_COLORS = ['#38bdf8', '#f43f5e', '#10b981', '#f59e0b', '#8b5cf6'];

export default function Dashboard({
    admin_profile = {},
    system_stats = {},
    requisition_stats = {},
    users_by_role = [],
    divisions = [],
    all_users = {},
    chart_users = [],
    users_by_division = [],
    requisitions_by_division = [],
    server_status = {},
    total_users = 0,
    total_divisions = 0,
}) {
    const { active_year } = usePage().props;
    const [currentTime, setCurrentTime] = useState(new Date());

    const getQueryParam = (key) => {
        if (typeof window !== 'undefined') {
            return new URLSearchParams(window.location.search).get(key) || '';
        }
        return '';
    };

    // Filter states
    const [selectedYear, setSelectedYear] = useState(active_year || new Date().getFullYear());
    const [selectedDivision, setSelectedDivision] = useState(getQueryParam('division'));
    const [selectedUnit, setSelectedUnit] = useState(getQueryParam('unit'));
    const [selectedRole, setSelectedRole] = useState(getQueryParam('role'));
    const [selectedStatus, setSelectedStatus] = useState(getQueryParam('status'));

    // Live clock timer
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Formatters
    const formattedDate = currentTime.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

    const formattedTime = currentTime.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    });

    // Units available based on selected division
    const availableUnits = useMemo(() => {
        if (!selectedDivision) {
            // Flatten all units from all divisions
            return divisions.flatMap((d) => d.units || []);
        }
        const found = divisions.find((d) => String(d.id) === String(selectedDivision));
        return found?.units || [];
    }, [divisions, selectedDivision]);

    const applyFilters = (filters) => {
        router.get(route('admin.dashboard'), filters, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const handleDivisionChange = (e) => {
        const divId = e.target.value;
        setSelectedDivision(divId);
        setSelectedUnit('');
        applyFilters({ division: divId, unit: '', role: selectedRole, status: selectedStatus });
    };

    const handleUnitChange = (e) => {
        setSelectedUnit(e.target.value);
        applyFilters({ division: selectedDivision, unit: e.target.value, role: selectedRole, status: selectedStatus });
    };

    const handleRoleChange = (e) => {
        setSelectedRole(e.target.value);
        applyFilters({ division: selectedDivision, unit: selectedUnit, role: e.target.value, status: selectedStatus });
    };

    const handleStatusChange = (e) => {
        setSelectedStatus(e.target.value);
        applyFilters({ division: selectedDivision, unit: selectedUnit, role: selectedRole, status: e.target.value });
    };

    const handleResetFilter = () => {
        setSelectedDivision('');
        setSelectedUnit('');
        setSelectedRole('');
        setSelectedStatus('');
        applyFilters({});
    };

    // Pie chart data: Role breakdown of filtered users
    const pieData = useMemo(() => {
        const counts = {};
        const roleLabels = {
            divisi: 'Unit / Divisi',
            perencanaan: 'Perencanaan',
            keuangan: 'Keuangan',
            admin: 'Admin Sistem',
        };

        chart_users.forEach((u) => {
            const label = roleLabels[u.role] || u.role || 'Lainnya';
            counts[label] = (counts[label] || 0) + 1;
        });

        const total = chart_users.length;
        if (total === 0) return [];

        return Object.entries(counts).map(([name, count]) => ({
            name,
            value: count,
            percentage: ((count / total) * 100).toFixed(1),
        }));
    }, [chart_users]);

    // Bar chart data: Users per division
    const barData = useMemo(() => {
        // Group filtered users by division name
        const divCounts = {};
        chart_users.forEach((u) => {
            const divName = u.division?.name || 'Belum Terdata';
            divCounts[divName] = (divCounts[divName] || 0) + 1;
        });

        const entries = Object.entries(divCounts).map(([name, count]) => ({
            name: name.length > 18 ? name.substring(0, 18) + '...' : name,
            fullName: name,
            staf: count,
        }));

        // Sort descending by staff count
        return entries.sort((a, b) => b.staf - a.staf).slice(0, 8);
    }, [chart_users]);

    const getRoleBadge = (role) => {
        switch (role) {
            case 'admin':
                return { label: 'Admin Sistem', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
            case 'perencanaan':
                return { label: 'Perencanaan', className: 'bg-purple-50 text-purple-700 border-purple-200' };
            case 'keuangan':
                return { label: 'Keuangan', className: 'bg-teal-50 text-teal-700 border-teal-200' };
            case 'divisi':
                return { label: 'Unit / Divisi', className: 'bg-sky-50 text-sky-700 border-sky-200' };
            default:
                return { label: role || 'Pengguna', className: 'bg-slate-50 text-slate-700 border-slate-200' };
        }
    };

    // Custom Pie Tooltip
    const CustomPieTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0];
            return (
                <div className="rounded-lg border border-slate-200 bg-white p-2.5 shadow-sm text-xs">
                    <p className="font-bold text-slate-800">{data.name}</p>
                    <p className="text-slate-600">
                        {data.value} Orang ({data.payload.percentage}%)
                    </p>
                </div>
            );
        }
        return null;
    };

    // Custom Bar Tooltip
    const CustomBarTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0];
            return (
                <div className="rounded-lg border border-slate-200 bg-white p-2.5 shadow-sm text-xs">
                    <p className="font-bold text-slate-800">{data.payload.fullName || data.payload.name}</p>
                    <p className="text-teal-700 font-semibold">{data.value} Staf Terdaftar</p>
                </div>
            );
        }
        return null;
    };

    return (
        <AdminLayout>
            <Head title="Dashboard Pemantauan Pengguna & Usulan - E-BLUD RSJ Tampan" />

            {/* Main Clean Canvas (Pure white, spacious, matching Kemenkes reference) */}
            <div className="min-h-screen bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
                {/* 1. Header Row */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between pb-6 border-b border-slate-100">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                            Dashboard Pemantauan Pengguna & Pengajuan E-BLUD
                        </h1>
                        <p className="mt-1 text-xs text-slate-500">
                            Pusat data master staf, struktur organisasi divisi, dan rekapitulasi usulan anggaran RS Jiwa Tampan
                        </p>
                    </div>

                    <div className="text-xs text-slate-500 shrink-0">
                        Update terakhir:{' '}
                        <strong className="font-semibold text-slate-800">
                            {formattedDate} pukul {formattedTime}
                        </strong>
                    </div>
                </div>

                {/* 2. Filter Bar (Clean Multi-Dropdown Bar matching reference) */}
                <div className="py-6 border-b border-slate-100">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4">
                        {/* Filter 1: Tahun Anggaran */}


                        {/* Filter 2: Divisi (Bagian / Instalasi) */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                Divisi / Bagian
                            </label>
                            <select
                                value={selectedDivision}
                                onChange={handleDivisionChange}
                                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 shadow-2xs focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition"
                            >
                                <option value="">Semua Divisi</option>
                                {divisions.map((div) => (
                                    <option key={div.id} value={div.id}>
                                        {div.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Filter 3: Unit Kerja (Cascades based on selected Division) */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                Unit Kerja
                            </label>
                            <select
                                value={selectedUnit}
                                onChange={handleUnitChange}
                                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 shadow-2xs focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition"
                            >
                                <option value="">Semua Unit Kerja</option>
                                {availableUnits.map((u) => (
                                    <option key={u.id} value={u.id}>
                                        {u.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Filter 4: Peran Akses */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                Peran Pengguna
                            </label>
                            <select
                                value={selectedRole}
                                onChange={handleRoleChange}
                                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 shadow-2xs focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition"
                            >
                                <option value="">Semua Peran</option>
                                <option value="divisi">Unit / Divisi</option>
                                <option value="perencanaan">Perencanaan</option>
                                <option value="keuangan">Keuangan</option>
                                <option value="admin">Admin Sistem</option>
                            </select>
                        </div>

                        {/* Filter 5: Status Akun */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                Status Akun
                            </label>
                            <select
                                value={selectedStatus}
                                onChange={handleStatusChange}
                                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 shadow-2xs focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition"
                            >
                                <option value="">Semua Status</option>
                                <option value="1">Aktif</option>
                                <option value="0">Nonaktif</option>
                            </select>
                        </div>
                    </div>

                    {/* Filter Action Row */}
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={handleResetFilter}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-teal-700 active:scale-98 transition focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                            >
                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                                </svg>
                                Reset Filter
                            </button>

                            {(selectedDivision || selectedUnit || selectedRole || selectedStatus !== '') && (
                                <span className="text-xs text-slate-500">
                                    Filter aktif: menampilkan <strong>{all_users.total}</strong> dari{' '}
                                    <strong>{system_stats.total_users}</strong> staf
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* 3. Section: Rangkuman Pengguna & Pengajuan E-BLUD */}
                <div className="py-8 border-b border-slate-100">
                    <div className="mb-6">
                        <h2 className="text-lg font-bold text-slate-900">
                            Rangkuman Pendaftaran & Aktivitas Staf
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Jumlah staf terdaftar, proporsi peran operasional, dan sebaran unit kerja di lingkungan rumah sakit
                        </p>
                    </div>

                    {/* 2-Column Chart Layout (Matching user reference image) */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                        {/* Left: Total Pendaftar & Pie Chart */}
                        <div className="lg:col-span-4 bg-slate-50/50 rounded-2xl border border-slate-200 p-6 shadow-sm">
                            <div className="mb-2">
                                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    Total Pendaftar
                                </p>
                                <div className="text-2xl font-bold tracking-tight text-slate-900 mt-0.5">
                                    {all_users.total} <span className="text-sm font-normal text-slate-500">Orang</span>
                                </div>
                            </div>

                            {/* Clean Pie Chart */}
                            <div className="h-64 w-full">
                                {pieData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Tooltip content={<CustomPieTooltip />} />
                                            <Pie
                                                data={pieData}
                                                dataKey="value"
                                                nameKey="name"
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={85}
                                                innerRadius={0}
                                                label={({ cx, cy, midAngle, innerRadius, outerRadius, percentage }) => {
                                                    const RADIAN = Math.PI / 180;
                                                    const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
                                                    const x = cx + radius * Math.cos(-midAngle * RADIAN);
                                                    const y = cy + radius * Math.sin(-midAngle * RADIAN);
                                                    if (Number(percentage) < 8) return null;
                                                    return (
                                                        <text
                                                            x={x}
                                                            y={y}
                                                            fill="#ffffff"
                                                            textAnchor="middle"
                                                            dominantBaseline="central"
                                                            className="text-[11px] font-bold"
                                                        >
                                                            {`${percentage}%`}
                                                        </text>
                                                    );
                                                }}
                                                labelLine={false}
                                            >
                                                {pieData.map((entry, index) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                                                    />
                                                ))}
                                            </Pie>
                                            <Legend
                                                verticalAlign="bottom"
                                                iconType="circle"
                                                iconSize={8}
                                                wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex h-full items-center justify-center text-xs text-slate-400">
                                        Tidak ada data yang cocok dengan filter
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right: Bar Chart Tren / Distribusi per Bagian */}
                        <div className="lg:col-span-8 bg-slate-50/50 rounded-2xl border border-slate-200 p-6 shadow-sm">
                            <div className="mb-2">
                                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    Sebaran Staf per Divisi / Bagian
                                </p>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    Jumlah akun yang terdaftar dari masing-masing divisi organisasi
                                </p>
                            </div>

                            <div className="h-64 w-full">
                                {barData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={barData}
                                            margin={{ top: 15, right: 10, left: -20, bottom: 25 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis
                                                dataKey="name"
                                                tick={{ fontSize: 11, fill: '#64748b' }}
                                                interval={0}
                                                angle={-15}
                                                textAnchor="end"
                                            />
                                            <YAxis
                                                allowDecimals={false}
                                                tick={{ fontSize: 11, fill: '#64748b' }}
                                            />
                                            <Tooltip content={<CustomBarTooltip />} />
                                            <Bar
                                                dataKey="staf"
                                                name="Jumlah Staf"
                                                fill="#0d9488"
                                                radius={[6, 6, 0, 0]}
                                                maxBarSize={45}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex h-full items-center justify-center text-xs text-slate-400">
                                        Tidak ada data sebaran divisi untuk ditampilkan
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. Section: Daftar Staf Berdasarkan Divisi & Unit Kerja */}
                <div className="pt-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">
                                Daftar Staf Berdasarkan Divisi & Unit Kerja
                            </h2>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Menampilkan data staf yang terdaftar dari masing-masing unit kerja dan bagian di RS Jiwa Tampan
                            </p>
                        </div>
                        <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full shrink-0">
                            Total: {all_users.total} Staf
                        </span>
                    </div>

                    {/* Clean Table Layout */}
                    <div className="overflow-hidden rounded-xl border border-slate-200 shadow-2xs">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs text-slate-700">
                                <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-600 border-b border-slate-200">
                                    <tr>
                                        <th scope="col" className="px-4 py-3 text-center w-12">
                                            No
                                        </th>
                                        <th scope="col" className="px-4 py-3">
                                            Nama Pegawai & NIP
                                        </th>
                                        <th scope="col" className="px-4 py-3">
                                            Divisi / Bagian
                                        </th>
                                        <th scope="col" className="px-4 py-3">
                                            Unit Kerja (Instalasi / Ruang)
                                        </th>
                                        <th scope="col" className="px-4 py-3">
                                            Jabatan
                                        </th>
                                        <th scope="col" className="px-4 py-3">
                                            Peran Sistem
                                        </th>
                                        <th scope="col" className="px-4 py-3 text-center">
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white">
                                    {all_users.data && all_users.data.length > 0 ? (
                                        all_users.data.map((u, index) => {
                                            const roleInfo = getRoleBadge(u.role);
                                            return (
                                                <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                                                    <td className="px-4 py-3 text-center font-mono text-slate-400">
                                                        {(all_users.current_page - 1) * all_users.per_page + index + 1}
                                                    </td>
                                                    <td className="px-4 py-3 font-medium">
                                                        <div className="font-bold text-slate-800">
                                                            {u.name}
                                                        </div>
                                                        <div className="text-[11px] text-slate-500 font-mono">
                                                            {u.nip ? `NIP. ${u.nip}` : u.email}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 font-medium text-slate-800">
                                                        {u.division?.name || '-'}
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-600">
                                                        {u.unit?.name ? (
                                                            <span className="inline-flex items-center rounded-md bg-teal-50 px-2 py-0.5 text-[11px] font-medium text-teal-800 border border-teal-200/60">
                                                                {u.unit.name}
                                                            </span>
                                                        ) : (
                                                            <span className="text-slate-400 italic">Belum ditentukan</span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-600">
                                                        {u.position || '-'}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold ${roleInfo.className}`}>
                                                            {roleInfo.label}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-center">
                                                        <span
                                                            className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                                                                u.is_active ? 'text-emerald-700' : 'text-slate-400'
                                                            }`}
                                                        >
                                                            <span
                                                                className={`h-1.5 w-1.5 rounded-full ${
                                                                    u.is_active ? 'bg-emerald-500' : 'bg-slate-300'
                                                                }`}
                                                            />
                                                            {u.is_active ? 'Aktif' : 'Nonaktif'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan={7} className="px-4 py-10 text-center text-slate-400">
                                                Tidak ada staf yang sesuai dengan kriteria filter yang dipilih.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Table Footer Navigation / Summary */}
                        <div className="border-t border-slate-100 bg-white px-4 py-3">
                            <Pagination 
                                currentPage={all_users.current_page} 
                                totalPages={all_users.last_page} 
                                totalItems={all_users.total} 
                                itemsPerPage={all_users.per_page} 
                                onPageChange={(p) => applyFilters({ division: selectedDivision, unit: selectedUnit, role: selectedRole, status: selectedStatus, page: p })} 
                            />
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
