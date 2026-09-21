import KeuanganLayout from '@/Layouts/KeuanganLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';

const formatRupiah = (value) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(Number(value || 0));

export default function Dashboard({
    total_budgets = 0,
    total_budget_remaining = 0,
    total_processed = 0,
    total_revenue = 0,
    active_year = 2026,
}) {
    const { auth } = usePage().props;
    const user = auth?.user || {};
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
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

    return (
        <KeuanganLayout>
            <Head title="Dashboard Keuangan - E-BLUD RSJ Tampan" />

            {/* Main Clean Canvas */}
            <div className="min-h-screen bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
                {/* 1. Header Row */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-slate-100">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                            Dashboard Bagian Keuangan
                        </h1>
                        <p className="mt-1 text-xs sm:text-sm text-slate-500">
                            Validasi Pagu & Pencairan Dana &bull; RS Jiwa Tampan Prov. Riau &bull; Tahun Anggaran <span className="font-bold text-slate-700">{active_year}</span>
                        </p>
                    </div>

                    <div className="flex flex-col sm:items-end gap-2.5 shrink-0">
                        <div className="text-xs text-slate-500">
                            Update terakhir:{' '}
                            <strong className="font-semibold text-slate-800">
                                {formattedDate} pukul {formattedTime}
                            </strong>
                        </div>

                        <div className="flex gap-2">
                            <Link
                                href={route('keuangan.requisitions.index')}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-95 px-4 py-2 text-xs font-bold text-white shadow-2xs transition cursor-pointer"
                            >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>Validasi Pengajuan</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* 2. Notification Box */}
                {total_processed === 0 && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                            <span className="text-base">⏳</span>
                            <div>
                                <p className="text-xs font-bold text-amber-900">
                                    Antrean validasi pembebanan anggaran
                                </p>
                                <p className="text-[11px] text-amber-700">
                                    Segera selesaikan tugas verifikasi untuk mencairkan DPA.
                                </p>
                            </div>
                        </div>
                        <Link
                            href={route('keuangan.requisitions.index')}
                            className="shrink-0 rounded-lg bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 text-xs font-bold transition"
                        >
                            Buka Antrean &rarr;
                        </Link>
                    </div>
                )}

                {/* 3. Section: Quick Links Minimalis */}
                <div className="pt-2 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                            <h2 className="text-base sm:text-lg font-bold text-slate-900">
                                Menu Akses Cepat Keuangan
                            </h2>
                            <p className="text-xs text-slate-500">
                                Kelola pagu rekening belanja dan cetak laporan serapan
                            </p>
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <Link
                            href={route('keuangan.requisitions.index')}
                            className="group relative flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-2xs transition-all duration-200 hover:border-slate-300 hover:bg-slate-50"
                        >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition">
                                    Validasi & Bebankan Anggaran
                                </h4>
                                <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                                    Pilih rekening pagu belanja yang sesuai, potong sisa anggaran secara otomatis, dan setujui pengajuan barang.
                                </p>
                            </div>
                        </Link>

                        <Link
                            href={route('reports.index')}
                            className="group relative flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-2xs transition-all duration-200 hover:border-slate-300 hover:bg-slate-50"
                        >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition">
                                    Laporan Realisasi Anggaran
                                </h4>
                                <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                                    Lihat rekapitulasi penyerapan dana belanja pengadaan rumah sakit dan cetak dokumen resmi pertanggungjawaban.
                                </p>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </KeuanganLayout>
    );
}

