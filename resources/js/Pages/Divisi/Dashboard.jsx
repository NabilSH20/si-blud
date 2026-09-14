import DivisiLayout from '@/Layouts/DivisiLayout';
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

const getStatusBadge = (status) => {
    switch (status) {
        case 'Pending_Perencanaan':
            return {
                label: 'Menunggu Telaah',
                className: 'bg-amber-50 text-amber-800 border-amber-200',
            };
        case 'Diproses_Keuangan':
            return {
                label: 'Proses Keuangan',
                className: 'bg-blue-50 text-blue-800 border-blue-200',
            };
        case 'Disetujui_Selesai':
            return {
                label: 'Disetujui',
                className: 'bg-teal-50 text-teal-800 border-teal-200',
            };
        case 'Ditolak':
            return {
                label: 'Perlu Perbaikan',
                className: 'bg-rose-50 text-rose-800 border-rose-200',
            };
        default:
            return {
                label: status || 'Pending',
                className: 'bg-slate-50 text-slate-700 border-slate-200',
            };
    }
};

export default function Dashboard({
    total_requests = 0,
    pending_requests = 0,
    in_finance_requests = 0,
    approved_requests = 0,
    rejected_requests = 0,
    total_estimated = 0,
    total_approved = 0,
    recent_requisitions = [],
    active_year = 2026,
    user_division = null,
    user_unit = null,
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

    const unitName = user_unit?.name || user?.unit?.name || 'Unit Pemohon';
    const divisionName = user_division?.name || user?.division?.name || 'RSJ Tampan Prov. Riau';

    return (
        <DivisiLayout>
            <Head title="Dashboard Pengajuan Belanja - E-BLUD RSJ Tampan" />

            {/* Main Clean Canvas (Pure white, spacious, matching Admin dashboard) */}
            <div className="min-h-screen bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
                {/* 1. Header Row */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-slate-100">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                            Dashboard Pengajuan Belanja
                        </h1>
                        <p className="mt-1 text-xs sm:text-sm text-slate-500">
                            {unitName} &bull; {divisionName} &bull; Tahun Anggaran <span className="font-bold text-slate-700">{active_year}</span>
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
                            href={route('requisitions.create')}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-95 px-4 py-2 text-xs font-bold text-white shadow-2xs transition cursor-pointer"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            <span> Buat Usulan Baru</span>
                        </Link>
                    </div>
                </div>

                {/* 2. Notification if any rejected / returned requests */}
                {rejected_requests > 0 && (
                    <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-4 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                            <span className="text-base">⚠️</span>
                            <div>
                                <p className="text-xs font-bold text-rose-900">
                                    Ada {rejected_requests} berkas usulan yang memerlukan perbaikan
                                </p>
                                <p className="text-[11px] text-rose-700">
                                    Silakan periksa catatan telaah dari Perencanaan atau Keuangan.
                                </p>
                            </div>
                        </div>
                        <Link
                            href={route('requisitions.index', { status: 'Ditolak' })}
                            className="shrink-0 rounded-lg bg-rose-600 hover:bg-rose-700 text-white px-3 py-1.5 text-xs font-bold transition"
                        >
                            Lihat Berkas &rarr;
                        </Link>
                    </div>
                )}

                {/* 3. Metrics Cards (4 Kotak Ringkas & Minimalis) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Card 1: Total Pengajuan */}
                    <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 hover:border-slate-300 transition">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                            Total Pengajuan
                        </p>
                        <div className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-1">
                            {total_requests} <span className="text-xs font-normal text-slate-500">Berkas</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">
                            Estimasi: {formatRupiah(total_estimated)}
                        </p>
                    </div>

                    {/* Card 2: Menunggu Telaah */}
                    <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 hover:border-amber-300 transition">
                        <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">
                            Menunggu Telaah
                        </p>
                        <div className="text-2xl sm:text-3xl font-bold tracking-tight text-amber-600 mt-1">
                            {pending_requests} <span className="text-xs font-normal text-slate-500">Berkas</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">
                            Tahap telaah Bag. Perencanaan
                        </p>
                    </div>

                    {/* Card 3: Proses Keuangan */}
                    <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 hover:border-blue-300 transition">
                        <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">
                            Proses Keuangan
                        </p>
                        <div className="text-2xl sm:text-3xl font-bold tracking-tight text-blue-600 mt-1">
                            {in_finance_requests} <span className="text-xs font-normal text-slate-500">Berkas</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">
                            Validasi pagu kas & SP2D
                        </p>
                    </div>

                    {/* Card 4: Disetujui */}
                    <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 hover:border-teal-300 transition">
                        <p className="text-xs font-semibold uppercase tracking-wider text-teal-700">
                            Disetujui Selesai
                        </p>
                        <div className="text-2xl sm:text-3xl font-bold tracking-tight text-teal-600 mt-1">
                            {approved_requests} <span className="text-xs font-normal text-slate-500">Berkas</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">
                            Disetujui: {formatRupiah(total_approved)}
                        </p>
                    </div>
                </div>

                {/* 4. Section: Daftar Usulan Belanja Terkini */}
                <div className="pt-4 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                            <h2 className="text-base sm:text-lg font-bold text-slate-900">
                                Daftar Usulan Belanja Terkini
                            </h2>
                            <p className="text-xs text-slate-500">
                                5 berkas pengajuan logistik dan kebutuhan belanja terakhir dari unit Anda
                            </p>
                        </div>

                        <Link
                            href={route('requisitions.index')}
                            className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 hover:text-teal-800 transition"
                        >
                            <span>Buka Semua Riwayat Pengajuan</span>
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                            </svg>
                        </Link>
                    </div>

                    {/* Table */}
                    <div className="overflow-hidden rounded-xl border border-slate-200 shadow-2xs">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs text-slate-700">
                                <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-600 border-b border-slate-200">
                                    <tr>
                                        <th scope="col" className="px-4 py-3 text-center w-12">
                                            No
                                        </th>
                                        <th scope="col" className="px-4 py-3">
                                            Nomor Usulan & Tanggal
                                        </th>
                                        <th scope="col" className="px-4 py-3">
                                            Rekening Belanja RBA
                                        </th>
                                        <th scope="col" className="px-4 py-3">
                                            Jenis
                                        </th>
                                        <th scope="col" className="px-4 py-3">
                                            Nilai Pengajuan
                                        </th>
                                        <th scope="col" className="px-4 py-3 text-center">
                                            Status
                                        </th>
                                        <th scope="col" className="px-4 py-3 text-right">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white">
                                    {recent_requisitions && recent_requisitions.length > 0 ? (
                                        recent_requisitions.map((req, index) => {
                                            const badge = getStatusBadge(req.status);
                                            const nominal = req.total_approved > 0 ? req.total_approved : req.total_estimated;
                                            return (
                                                <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                                                    <td className="px-4 py-3 text-center font-mono text-slate-400">
                                                        {index + 1}
                                                    </td>

                                                    <td className="px-4 py-3 font-medium">
                                                        <span className="font-mono font-bold text-slate-900 block">
                                                            {req.requisition_number}
                                                        </span>
                                                        <span className="text-[11px] text-slate-400">
                                                            {formatDate(req.submission_date || req.created_at)}
                                                        </span>
                                                    </td>

                                                    <td className="px-4 py-3">
                                                        <div className="font-semibold text-slate-800 truncate max-w-xs" title={req.rba_account?.account_name}>
                                                            {req.rba_account?.account_name || 'Rekening RBA'}
                                                        </div>
                                                        <div className="text-[11px] text-slate-400 font-mono">
                                                            {req.rba_account?.account_code || '-'}
                                                        </div>
                                                    </td>

                                                    <td className="px-4 py-3">
                                                        <span
                                                            className={`inline-flex items-center rounded px-2 py-0.5 text-[10px] font-bold ${
                                                                req.jenis_belanja === 'Modal'
                                                                    ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                                                    : 'bg-teal-50 text-teal-700 border border-teal-200'
                                                            }`}
                                                        >
                                                            {req.jenis_belanja || 'Operasi'}
                                                        </span>
                                                    </td>

                                                    <td className="px-4 py-3 font-semibold text-slate-900">
                                                        {formatRupiah(nominal)}
                                                    </td>

                                                    <td className="px-4 py-3 text-center">
                                                        <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold ${badge.className}`}>
                                                            {badge.label}
                                                        </span>
                                                    </td>

                                                    <td className="px-4 py-3 text-right">
                                                        <Link
                                                            href={route('requisitions.show', req.id)}
                                                            className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-300 transition cursor-pointer"
                                                        >
                                                            Detail
                                                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                                                            </svg>
                                                        </Link>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                                                <p className="text-xs font-semibold text-slate-700">Belum ada pengajuan belanja pada tahun anggaran ini.</p>
                                                <Link
                                                    href={route('requisitions.create')}
                                                    className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 hover:text-teal-800"
                                                >
                                                    + Klik di sini untuk membuat usulan baru
                                                </Link>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </DivisiLayout>
    );
}
