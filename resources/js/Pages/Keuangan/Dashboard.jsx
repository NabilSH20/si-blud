import KeuanganLayout from '@/Layouts/KeuanganLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area
} from 'recharts';

const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(number || 0);
};

const formatRupiahShort = (number) => {
    if (number >= 1e9) {
        return `Rp ${(number / 1e9).toFixed(1)} M`;
    }
    if (number >= 1e6) {
        return `Rp ${(number / 1e6).toFixed(1)} Jt`;
    }
    return formatRupiah(number);
};

export default function Dashboard({
    total_budgets = 0,
    total_budget_remaining = 0,
    total_processed = 0,
    total_revenue = 0,
    total_spent = 0,
    budget_chart_data = [],
    top_budgets = [],
    revenue_trend = [],
    active_year = 2026,
}) {
    const { auth } = usePage().props;
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const formattedDate = currentTime.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

    const formattedTime = currentTime.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
    });

    const surplusDeficit = total_revenue - total_spent;
    const isSurplus = surplusDeficit >= 0;

    const PIE_COLORS = ['#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'];

    // Custom Tooltip for BarChart
    const CustomBarTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white/95 backdrop-blur-sm border border-slate-200/60 p-4 rounded-2xl shadow-xl">
                    <p className="font-black text-slate-800 mb-3 text-sm">{label}</p>
                    {payload.map((entry, index) => (
                        <div key={index} className="flex justify-between items-center gap-6 text-xs mb-1.5 last:mb-0">
                            <span style={{ color: entry.color?.includes('url') ? (index === 0 ? '#f59e0b' : '#10b981') : entry.color }} className="font-bold tracking-wide">{entry.name}</span>
                            <span className="font-mono font-black text-slate-900">{formatRupiah(entry.value)}</span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <KeuanganLayout>
            <Head title="Dashboard Keuangan - E-BLUD RSJ Tampan" />

            <div className="min-h-screen space-y-6">
                
                {/* 1. Header Row (Glassy/Clean) */}
                <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                            Dashboard Bagian Keuangan
                        </h1>
                        <p className="mt-1 text-xs sm:text-sm text-slate-500">
                            Pemantauan Arus Kas & Realisasi Anggaran BLUD &bull; RS Jiwa Tampan Prov. Riau &bull; Tahun Anggaran <span className="font-bold text-slate-700">{active_year}</span>
                        </p>
                    </div>

                    <div className="flex flex-col sm:items-end gap-2.5 shrink-0">
                        <div className="text-xs text-slate-500">
                            Update terakhir:{' '}
                            <strong className="font-semibold text-slate-800">
                                {formattedDate} pukul {formattedTime}
                            </strong>
                        </div>

                        <Link
                            href={route('keuangan.requisitions.index')}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-95 px-4 py-2 text-xs font-bold text-white shadow-2xs transition cursor-pointer whitespace-nowrap"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Validasi Pengajuan Anggaran</span>
                        </Link>
                    </div>
                </div>

                {/* Notification */}
                {total_processed > 0 && (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50/40 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h3 className="text-sm font-bold text-amber-900">
                                Antrean Validasi: {total_processed} Berkas
                            </h3>
                            <p className="text-xs text-amber-700 font-medium mt-1">
                                Segera verifikasi pencairan dana Requisition yang diajukan oleh unit/divisi.
                            </p>
                        </div>
                    </div>
                )}

                {/* 2. KPI Summary Cards Grid (Simplified Style) */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-2">
                    {/* Card 1: Total Pendapatan */}
                    <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Pendapatan</p>
                        <div className="mt-2 flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-slate-900">{formatRupiahShort(total_revenue)}</span>
                        </div>
                    </div>

                    {/* Card 2: Realisasi Belanja */}
                    <div className="rounded-2xl border border-rose-200 bg-rose-50/40 p-5 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-wider text-rose-700">Realisasi Belanja</p>
                        <div className="mt-2 flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-rose-800">{formatRupiahShort(total_spent)}</span>
                        </div>
                    </div>

                    {/* Card 3: Saldo Operasional */}
                    <div className={`rounded-2xl border p-5 shadow-sm ${isSurplus ? 'border-emerald-200 bg-emerald-50/40' : 'border-amber-200 bg-amber-50/40'}`}>
                        <p className={`text-xs font-semibold uppercase tracking-wider ${isSurplus ? 'text-emerald-700' : 'text-amber-700'}`}>
                            Saldo Operasional
                        </p>
                        <div className="mt-2 flex items-baseline gap-2">
                            <span className={`text-2xl font-bold ${isSurplus ? 'text-emerald-800' : 'text-amber-800'}`}>{formatRupiahShort(surplusDeficit)}</span>
                            <span className={`text-xs font-medium ${isSurplus ? 'text-emerald-700' : 'text-amber-700'}`}>{isSurplus ? '(Surplus)' : '(Defisit)'}</span>
                        </div>
                    </div>

                    {/* Card 4: Sisa Pagu DPA */}
                    <div className="rounded-2xl border border-blue-200 bg-blue-50/40 p-5 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">Total Sisa Pagu DPA</p>
                        <div className="mt-2 flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-blue-800">{formatRupiahShort(total_budget_remaining)}</span>
                        </div>
                    </div>
                </div>

                {/* 3. Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    
                    {/* Left: Pie Chart Komposisi */}
                    <div className="lg:col-span-4 bg-slate-50/50 rounded-2xl border border-slate-200 p-6 shadow-sm">
                        <div className="mb-2">
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                Komposisi Kas Belanja
                            </p>
                            <div className="text-lg font-bold tracking-tight text-slate-900 mt-0.5">
                                Terpakai vs Sisa Pagu
                            </div>
                        </div>

                        {/* Clean Pie Chart */}
                        <div className="h-64 w-full">
                            {budget_chart_data.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <RechartsTooltip 
                                            formatter={(value) => formatRupiah(value)}
                                            contentStyle={{ borderRadius: '16px', border: '1px solid rgba(226, 232, 240, 0.8)', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                            itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                                        />
                                        <Pie
                                            data={budget_chart_data}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={90}
                                            innerRadius={55}
                                            paddingAngle={4}
                                            stroke="none"
                                            label={({ cx, cy, midAngle, innerRadius, outerRadius, percentage }) => {
                                                const RADIAN = Math.PI / 180;
                                                const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
                                                const x = cx + radius * Math.cos(-midAngle * RADIAN);
                                                const y = cy + radius * Math.sin(-midAngle * RADIAN);
                                                if (Number(percentage) < 0.05) return null;
                                                return (
                                                    <text
                                                        x={x}
                                                        y={y}
                                                        fill="#ffffff"
                                                        textAnchor="middle"
                                                        dominantBaseline="central"
                                                        className="text-[11px] font-bold"
                                                    >
                                                        {`${(percentage * 100).toFixed(0)}%`}
                                                    </text>
                                                );
                                            }}
                                            labelLine={false}
                                        >
                                            {budget_chart_data.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.fill || PIE_COLORS[index % PIE_COLORS.length]} />
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
                                    Tidak ada data pagu
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Bar Chart Top 5 Pagu */}
                    <div className="lg:col-span-8 bg-slate-50/50 rounded-2xl border border-slate-200 p-6 shadow-sm">
                        <div className="mb-2">
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                Top 5 Serapan Pagu DPA
                            </p>
                            <p className="text-xs text-slate-400 mt-0.5">
                                Rekening belanja dengan nilai pengeluaran terbesar (akumulatif)
                            </p>
                        </div>

                        <div className="h-64 w-full">
                            {top_budgets.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={top_budgets}
                                        margin={{ top: 15, right: 10, left: -20, bottom: 25 }}
                                    >
                                        <defs>
                                            <linearGradient id="colorTerpakai" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#f59e0b" stopOpacity={1}/>
                                                <stop offset="95%" stopColor="#d97706" stopOpacity={0.8}/>
                                            </linearGradient>
                                            <linearGradient id="colorSisa" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#34d399" stopOpacity={1}/>
                                                <stop offset="95%" stopColor="#059669" stopOpacity={0.8}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis
                                            dataKey="name"
                                            tick={{ fontSize: 11, fill: '#64748b' }}
                                            axisLine={false}
                                            tickLine={false}
                                            dy={10}
                                        />
                                        <YAxis
                                            tickFormatter={formatRupiahShort}
                                            tick={{ fontSize: 11, fill: '#64748b' }}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <RechartsTooltip content={<CustomBarTooltip />} cursor={{ fill: '#f8fafc' }} />
                                        <Legend
                                            verticalAlign="bottom"
                                            iconType="circle"
                                            iconSize={8}
                                            wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                                        />
                                        <Bar dataKey="terpakai" name="Realisasi (Terpakai)" fill="url(#colorTerpakai)" radius={[4, 4, 0, 0]} maxBarSize={45} />
                                        <Bar dataKey="sisa" name="Sisa Pagu" fill="url(#colorSisa)" radius={[4, 4, 0, 0]} maxBarSize={45} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex h-full items-center justify-center text-xs text-slate-400">
                                    Tidak ada data realisasi
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 4. Area Chart Trend Pendapatan */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                    <div className="mb-4">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Tren Pendapatan Bulanan BLUD
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                            Akumulasi penerimaan kas rumah sakit sepanjang tahun {active_year}
                        </p>
                    </div>
                    
                    <div className="h-72 w-full">
                        {revenue_trend?.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={revenue_trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorPendapatan" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4} />
                                            <stop offset="95%" stopColor="#0284c7" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis
                                        dataKey="name"
                                        tick={{ fontSize: 11, fill: '#64748b' }}
                                        axisLine={false}
                                        tickLine={false}
                                        dy={10}
                                    />
                                    <YAxis
                                        tickFormatter={formatRupiahShort}
                                        tick={{ fontSize: 11, fill: '#64748b' }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <RechartsTooltip 
                                        formatter={(value) => [formatRupiah(value), '']}
                                        labelStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey="pendapatan" 
                                        name="Pendapatan"
                                        stroke="#0284c7" 
                                        strokeWidth={3}
                                        fillOpacity={1} 
                                        fill="url(#colorPendapatan)" 
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex h-full items-center justify-center text-xs text-slate-400">
                                Tidak ada data tren pendapatan
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </KeuanganLayout>
    );
}

