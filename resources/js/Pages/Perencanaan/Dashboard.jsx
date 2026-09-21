import PerencanaanLayout from '@/Layouts/PerencanaanLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
    }).format(number || 0);
};

const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
};

export default function Dashboard({
    total_requests = 0,
    total_to_verify = 0,
    total_verified = 0,
    total_items = 0,
    pending_requisitions = [],
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
        <PerencanaanLayout>
            <Head title="Dashboard Perencanaan & Pengadaan - E-BLUD RSJ Tampan" />

            {/* Main Clean Canvas (Pure white, spacious, matching Admin & Unit dashboard) */}
            <div className="min-h-screen bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
                {/* 1. Header Row */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-slate-100">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                            Dashboard Telaah Perencanaan
                        </h1>
                        <p className="mt-1 text-xs sm:text-sm text-slate-500">
                            Bagian Perencanaan & Pengadaan Logistik &bull; RS Jiwa Tampan Prov. Riau &bull; Tahun Anggaran <span className="font-bold text-slate-700">{active_year}</span>
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
                            href={route('perencanaan.requisitions.index')}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-95 px-4 py-2 text-xs font-bold text-white shadow-2xs transition cursor-pointer"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Verifikasi Antrean Usulan</span>
                        </Link>
                    </div>
                </div>

                {/* 2. Notification Box jika ada antrean perlu diverifikasi */}
                {total_to_verify > 0 && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                        <div className="flex items-center gap-3">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white text-base shadow-2xs">
                                ⏳
                            </span>
                            <div>
                                <p className="text-xs font-bold text-amber-900">
                                    Ada {total_to_verify} berkas usulan belanja yang menunggu telaah perencanaan
                                </p>
                                <p className="text-[11px] text-amber-700">
                                    Periksa spesifikasi barang dan sesuaikan volume yang disetujui sebelum diteruskan ke Bagian Keuangan.
                                </p>
                            </div>
                        </div>
                        <Link
                            href={route('perencanaan.requisitions.index')}
                            className="shrink-0 rounded-lg bg-amber-600 hover:bg-amber-700 active:scale-95 text-white px-3.5 py-1.5 text-xs font-bold transition shadow-2xs text-center"
                        >
                            Buka Antrean Verifikasi &rarr;
                        </Link>
                    </div>
                )}

                {/* 3. Full-Width Clean Table: Antrean Usulan Perlu Ditelaah */}
                <div className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-2xs">
                    <div className="p-4 sm:px-6 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between flex-wrap gap-3">
                        <div>
                            <h3 className="text-sm sm:text-base font-bold text-slate-900">
                                Antrean Berkas Usulan Belanja Menunggu Telaah
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Berkas kebutuhan logistik dari unit kerja yang memerlukan verifikasi spesifikasi dan kuantitas
                            </p>
                        </div>
                        <Link
                            href={route('perencanaan.requisitions.index')}
                            className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 hover:text-teal-800 transition cursor-pointer"
                        >
                            <span>Buka Semua Antrean ({total_to_verify})</span>
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                            </svg>
                        </Link>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-100 text-xs">
                            <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                                <tr>
                                    <th className="w-12 px-4 py-3 text-center">No</th>
                                    <th className="px-4 py-3 text-left">Nomor & Tanggal</th>
                                    <th className="px-4 py-3 text-left">Unit / Divisi Pemohon</th>
                                    <th className="px-4 py-3 text-left">Pos Rekening Belanja</th>
                                    <th className="px-4 py-3 text-right">Estimasi Biaya</th>
                                    <th className="w-28 px-4 py-3 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {pending_requisitions && pending_requisitions.length > 0 ? (
                                    pending_requisitions.map((req, idx) => (
                                        <tr key={req.id} className="hover:bg-slate-50/60 transition">
                                            <td className="px-4 py-3.5 text-center font-semibold text-slate-400">
                                                #{idx + 1}
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <span className="font-bold text-slate-900 block">
                                                    {req.requisition_number}
                                                </span>
                                                <span className="text-[11px] text-slate-400">
                                                    {formatDate(req.submission_date || req.created_at)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <span className="font-bold text-slate-800 block">
                                                    {req.unit?.name || req.division?.name || '-'}
                                                </span>
                                                {req.division?.name && req.unit?.name && (
                                                    <span className="text-[11px] text-slate-500 block">
                                                        {req.division.name}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <div className="flex items-center gap-1.5 mb-0.5">
                                                    <span
                                                        className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                                                            req.jenis_belanja === 'Modal'
                                                                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                        }`}
                                                    >
                                                        {req.jenis_belanja || 'Operasi'}
                                                    </span>
                                                </div>
                                                <p
                                                    className="text-slate-700 font-medium truncate max-w-xs"
                                                    title={req.rba_account?.account_name}
                                                >
                                                    {req.rba_account?.account_name || 'Rekening Belanja RBA'}
                                                </p>
                                            </td>
                                            <td className="px-4 py-3.5 text-right font-mono font-bold text-slate-900">
                                                {formatRupiah(req.total_estimated)}
                                            </td>
                                            <td className="px-4 py-3.5 text-center">
                                                <Link
                                                    href={route('perencanaan.requisitions.show', req.id)}
                                                    className="inline-flex items-center gap-1 rounded-lg bg-teal-600 hover:bg-teal-700 active:scale-95 text-white px-3 py-1.5 text-xs font-bold shadow-2xs transition cursor-pointer"
                                                >
                                                    <span>Telaah</span>
                                                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                                                    </svg>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                                            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-2">
                                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <p className="text-xs font-semibold text-slate-700">
                                                Tidak Ada Antrean Menunggu Telaah
                                            </p>
                                            <p className="text-[11px] text-slate-400 mt-0.5">
                                                Semua berkas usulan belanja unit kerja telah selesai diverifikasi.
                                            </p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 5. Quick Shortcuts (2 Kartu Navigasi Rapi) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <Link
                        href={route('perencanaan.requisitions.index')}
                        className="group flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-5 hover:border-teal-300 hover:bg-teal-50/20 transition shadow-2xs"
                    >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700 border border-teal-200 group-hover:bg-teal-600 group-hover:text-white transition">
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-slate-900 group-hover:text-teal-800 transition">
                                Verifikasi Pengajuan Masuk
                            </h4>
                            <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                                Telaah kuantitas kebutuhan belanja, sesuaikan volume yang disetujui, dan teruskan ke Bagian Keuangan.
                            </p>
                        </div>
                    </Link>

                    <Link
                        href={route('items.index')}
                        className="group flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-5 hover:border-blue-300 hover:bg-blue-50/20 transition shadow-2xs"
                    >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700 border border-blue-200 group-hover:bg-blue-600 group-hover:text-white transition">
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                            </svg>
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-800 transition">
                                Kelola Katalog Barang Acuan RS
                            </h4>
                            <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                                Kelola katalog standar kebutuhan logistik rumah sakit, satuan barang, dan harga acuan BLUD.
                            </p>
                        </div>
                    </Link>
                </div>
            </div>
        </PerencanaanLayout>
    );
}
