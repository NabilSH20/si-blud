import Modal from '@/Components/Modal';
import { useForm } from '@inertiajs/react';
import { useEffect, useState, useMemo } from 'react';
import Swal from 'sweetalert2';
import { X, Target, Save, Calculator, Calendar, ChevronDown, ChevronUp, Layers } from 'lucide-react';

const formatRupiah = (value) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(Number(value || 0));

const MONTHS = [
    { key: 'target_jan', label: 'Jan' },
    { key: 'target_feb', label: 'Feb' },
    { key: 'target_mar', label: 'Mar' },
    { key: 'target_apr', label: 'Apr' },
    { key: 'target_mei', label: 'Mei' },
    { key: 'target_jun', label: 'Jun' },
    { key: 'target_jul', label: 'Jul' },
    { key: 'target_agu', label: 'Agu' },
    { key: 'target_sep', label: 'Sep' },
    { key: 'target_okt', label: 'Okt' },
    { key: 'target_nov', label: 'Nov' },
    { key: 'target_des', label: 'Des' },
];

export default function RevenueTargetModal({
    show = false,
    onClose = () => {},
    fiscal_year = 2027,
    grouped_sources = {},
    existing_targets = [],
}) {
    const [activeTab, setActiveTab] = useState('Semua');
    const [expandedSources, setExpandedSources] = useState({});

    // Build initial form state
    const categories = Object.keys(grouped_sources || {});

    const buildInitialTargets = () => {
        const targetMap = {};
        (existing_targets || []).forEach((t) => {
            targetMap[t.source_name] = t;
        });

        const list = [];
        Object.entries(grouped_sources || {}).forEach(([cat, sources]) => {
            sources.forEach((sourceName) => {
                const ex = targetMap[sourceName];
                const yearly = ex ? Number(ex.target_yearly || 0) : 0;
                const weekly = ex ? Number(ex.target_weekly || 0) : Math.round(yearly / 52);
                
                const item = {
                    source_name: sourceName,
                    category: cat,
                    target_yearly: yearly,
                    target_weekly: weekly,
                };

                MONTHS.forEach((m) => {
                    item[m.key] = ex ? Number(ex[m.key] || 0) : Math.round(yearly / 12);
                });

                list.push(item);
            });
        });
        return list;
    };

    const { data, setData, post, processing, reset } = useForm({
        fiscal_year: fiscal_year,
        targets: [],
    });

    useEffect(() => {
        if (show) {
            setData({
                fiscal_year: fiscal_year,
                targets: buildInitialTargets(),
            });
            setActiveTab(categories[0] || 'Semua');
            setExpandedSources({});
        }
    }, [show, fiscal_year, existing_targets]);

    const handleYearlyChange = (index, value) => {
        const numVal = Math.max(0, Number(value) || 0);
        const updated = [...data.targets];
        updated[index].target_yearly = numVal;
        updated[index].target_weekly = Math.round(numVal / 52);
        
        // Auto-distribute equally across 12 months
        const perMonth = Math.round(numVal / 12);
        MONTHS.forEach((m) => {
            updated[index][m.key] = perMonth;
        });

        setData('targets', updated);
    };

    const handleWeeklyChange = (index, value) => {
        const numVal = Math.max(0, Number(value) || 0);
        const updated = [...data.targets];
        updated[index].target_weekly = numVal;
        setData('targets', updated);
    };

    const handleMonthlyChange = (index, monthKey, value) => {
        const numVal = Math.max(0, Number(value) || 0);
        const updated = [...data.targets];
        updated[index][monthKey] = numVal;

        // Recompute yearly and weekly
        const sumMonths = MONTHS.reduce((acc, m) => acc + (Number(updated[index][m.key]) || 0), 0);
        updated[index].target_yearly = sumMonths;
        updated[index].target_weekly = Math.round(sumMonths / 52);

        setData('targets', updated);
    };

    const distributeEqually = (index) => {
        const updated = [...data.targets];
        const yearly = Number(updated[index].target_yearly || 0);
        const perMonth = Math.round(yearly / 12);
        MONTHS.forEach((m) => {
            updated[index][m.key] = perMonth;
        });
        setData('targets', updated);
    };

    const toggleExpand = (sourceName) => {
        setExpandedSources((prev) => ({
            ...prev,
            [sourceName]: !prev[sourceName],
        }));
    };

    const totalTargetYearly = useMemo(() => {
        return (data.targets || []).reduce((acc, curr) => acc + (Number(curr.target_yearly) || 0), 0);
    }, [data.targets]);

    const totalTargetWeekly = useMemo(() => {
        return (data.targets || []).reduce((acc, curr) => acc + (Number(curr.target_weekly) || 0), 0);
    }, [data.targets]);

    const filteredTargets = useMemo(() => {
        if (!activeTab || activeTab === 'Semua') return data.targets || [];
        return (data.targets || []).filter((t) => t.category === activeTab);
    }, [data.targets, activeTab]);

    const handleSubmit = (e) => {
        e.preventDefault();

        Swal.fire({
            title: 'Simpan Target Pendapatan?',
            html: `
                <div class="text-left text-xs text-slate-600 space-y-2">
                    <p>Tahun Anggaran: <b class="text-teal-900">${data.fiscal_year}</b></p>
                    <p>Total Target Tahunan: <b class="text-teal-700 font-bold">${formatRupiah(totalTargetYearly)}</b></p>
                    <p>Rata-rata Target Mingguan: <b>${formatRupiah(totalTargetWeekly)}</b></p>
                    <p class="text-[11px] text-slate-500 italic mt-2">Target ini akan digunakan sebagai dasar komparasi realisasi matriks 12 bulan dan dashboard keuangan.</p>
                </div>
            `,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Ya, Simpan Target',
            cancelButtonText: 'Batal',
            confirmButtonColor: '#0d9488',
            cancelButtonColor: '#94a3b8',
        }).then((res) => {
            if (res.isConfirmed) {
                post(route('revenues.targets.store'), {
                    preserveScroll: true,
                    onSuccess: () => {
                        onClose();
                        Swal.fire({
                            icon: 'success',
                            title: 'Target Tersimpan',
                            text: 'Target pendapatan BLUD berhasil disimpan.',
                            timer: 2000,
                            showConfirmButton: false,
                        });
                    },
                    onError: (err) => {
                        Swal.fire({
                            icon: 'error',
                            title: 'Gagal Menyimpan',
                            text: 'Periksa kembali data input target.',
                            confirmButtonColor: '#0d9488',
                        });
                    },
                });
            }
        });
    };

    return (
        <Modal show={show} onClose={onClose} maxWidth="4xl">
            <div className="flex flex-col max-h-[90vh]">
                {/* Header Modal */}
                <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/80 px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-white shadow-xs">
                            <Target className="h-5 w-5" strokeWidth={2.2} />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-slate-900">
                                Pengaturan Target Pendapatan BLUD TA {data.fiscal_year}
                            </h3>
                            <p className="text-xs text-slate-500">
                                Tentukan target penerimaan tahunan, bulanan (Jan-Des), dan mingguan per unit layanan
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition cursor-pointer"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Banner Summary Target */}
                <div className="bg-teal-50/70 border-b border-teal-100 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-6 text-xs">
                        <div>
                            <span className="text-slate-500 font-medium">Total Target Tahunan:</span>
                            <span className="ml-2 font-black text-teal-800 text-sm">
                                {formatRupiah(totalTargetYearly)}
                            </span>
                        </div>
                        <div className="hidden sm:block text-slate-300">•</div>
                        <div>
                            <span className="text-slate-500 font-medium">Estimasi per Minggu:</span>
                            <span className="ml-2 font-bold text-slate-800 text-xs">
                                {formatRupiah(totalTargetWeekly)}
                            </span>
                        </div>
                    </div>
                    <div className="text-[11px] font-semibold text-teal-700 bg-teal-100/70 px-2.5 py-1 rounded-lg">
                        Mendukung Input Tahunan, Mingguan, & 12 Bulan
                    </div>
                </div>

                {/* Category Navigation Tabs */}
                <div className="border-b border-slate-200 bg-white px-6 pt-2 flex gap-2 overflow-x-auto">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            type="button"
                            onClick={() => setActiveTab(cat)}
                            className={`pb-2.5 px-3 text-xs font-bold transition border-b-2 whitespace-nowrap cursor-pointer ${
                                activeTab === cat
                                    ? 'border-teal-600 text-teal-700'
                                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Body Form */}
                <form id="target-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                    {filteredTargets.map((item) => {
                        const originalIndex = (data.targets || []).findIndex(
                            (t) => t.source_name === item.source_name
                        );
                        const isExpanded = !!expandedSources[item.source_name];

                        return (
                            <div
                                key={item.source_name}
                                className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs hover:border-teal-200 transition"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-slate-800">
                                                {item.source_name}
                                            </span>
                                            <span className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                                                {item.category}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2.5">
                                        {/* Target Tahunan */}
                                        <div className="w-44">
                                            <label className="block text-[10px] font-semibold text-slate-500 uppercase">
                                                Target Tahunan (Rp)
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={item.target_yearly}
                                                onChange={(e) => handleYearlyChange(originalIndex, e.target.value)}
                                                className="w-full rounded-lg border-slate-300 text-xs font-bold text-slate-900 focus:border-teal-500 focus:ring-teal-500 py-1.5 px-2.5"
                                            />
                                        </div>

                                        {/* Target Mingguan */}
                                        <div className="w-36">
                                            <label className="block text-[10px] font-semibold text-slate-500 uppercase">
                                                Target Mingguan (Rp)
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={item.target_weekly}
                                                onChange={(e) => handleWeeklyChange(originalIndex, e.target.value)}
                                                className="w-full rounded-lg border-slate-300 text-xs font-medium text-slate-800 focus:border-teal-500 focus:ring-teal-500 py-1.5 px-2.5"
                                            />
                                        </div>

                                        {/* Toggle Breakdown 12 Bulan */}
                                        <div className="pt-3.5">
                                            <button
                                                type="button"
                                                onClick={() => toggleExpand(item.source_name)}
                                                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition cursor-pointer"
                                                title="Rincian 12 Bulan"
                                            >
                                                <Calendar className="h-3.5 w-3.5 text-teal-600" />
                                                <span>12 Bulan</span>
                                                {isExpanded ? (
                                                    <ChevronUp className="h-3.5 w-3.5 text-slate-400" />
                                                ) : (
                                                    <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded Monthly Breakdown */}
                                {isExpanded && (
                                    <div className="mt-3.5 border-t border-slate-100 pt-3.5 bg-slate-50/50 rounded-lg p-3">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-[11px] font-bold text-slate-700">
                                                Rincian Target Bulanan (Januari - Desember)
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => distributeEqually(originalIndex)}
                                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-700 hover:text-teal-800 transition cursor-pointer"
                                            >
                                                <Calculator className="h-3 w-3" />
                                                <span>Bagi Rata 12 Bulan</span>
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
                                            {MONTHS.map((m) => (
                                                <div key={m.key}>
                                                    <label className="block text-[10px] font-medium text-slate-500">
                                                        {m.label}
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={item[m.key]}
                                                        onChange={(e) =>
                                                            handleMonthlyChange(originalIndex, m.key, e.target.value)
                                                        }
                                                        className="w-full rounded-md border-slate-200 text-xs text-slate-800 py-1 px-2 focus:border-teal-500 focus:ring-teal-500"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </form>

                {/* Footer Modal */}
                <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50/80 px-6 py-3.5">
                    <span className="text-xs text-slate-500">
                        {data.targets.length} Pos Layanan E-BLUD
                    </span>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                        >
                            Tutup
                        </button>
                        <button
                            type="submit"
                            form="target-form"
                            disabled={processing}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 px-4 py-2 text-xs font-bold text-white shadow-2xs transition active:scale-95 disabled:opacity-50 cursor-pointer"
                        >
                            <Save className="h-4 w-4" />
                            <span>{processing ? 'Menyimpan...' : 'Simpan Semua Target'}</span>
                        </button>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
