import AuditTrailTimeline from '@/Components/AuditTrailTimeline';
import PerencanaanLayout from '@/Layouts/PerencanaanLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useMemo } from 'react';
import Swal from 'sweetalert2';

const formatRupiah = (value) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(Number(value || 0));

const formatTanggal = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(date);
};

const getStatusBadge = (status) => {
    switch (status) {
        case 'Pending_Perencanaan':
            return {
                label: 'Menunggu Verifikasi Perencanaan',
                desc: 'Pengajuan ini memerlukan pemeriksaan spesifikasi barang dan penyesuaian kuantitas yang disetujui sebelum diteruskan ke Bagian Keuangan.',
                bg: 'bg-amber-50 text-amber-900 border-amber-200',
                dot: 'bg-amber-500',
            };
        case 'Diproses_Keuangan':
            return {
                label: 'Diteruskan ke Keuangan',
                desc: 'Pengajuan telah diverifikasi oleh tim Perencanaan dan saat ini sedang ditelaah pagu anggarannya oleh Bagian Keuangan.',
                bg: 'bg-blue-50 text-blue-900 border-blue-200',
                dot: 'bg-blue-500',
            };
        case 'Disetujui_Selesai':
            return {
                label: 'Disetujui / Selesai',
                desc: 'Pengajuan telah disetujui penuh dan anggaran telah dialokasikan.',
                bg: 'bg-emerald-50 text-emerald-900 border-emerald-200',
                dot: 'bg-emerald-500',
            };
        case 'Ditolak':
            return {
                label: 'Ditolak',
                desc: 'Pengajuan telah ditolak pada tahap verifikasi.',
                bg: 'bg-rose-50 text-rose-900 border-rose-200',
                dot: 'bg-rose-500',
            };
        default:
            return {
                label: status || 'Pending',
                desc: 'Status dalam proses.',
                bg: 'bg-slate-50 text-slate-800 border-slate-200',
                dot: 'bg-slate-500',
            };
    }
};

export default function Show({ requisition }) {
    const statusInfo = getStatusBadge(requisition.status);
    const details = requisition.requisition_details || [];
    const isPending = requisition.status === 'Pending_Perencanaan';

    // Initialize form with items array and notes
    const { data, setData, put, processing, errors } = useForm({
        status: 'Diproses_Keuangan',
        notes_perencanaan: requisition.notes_perencanaan || '',
        items: details.map((d) => ({
            id: d.id,
            quantity_approved:
                d.quantity_approved !== null && d.quantity_approved !== undefined
                    ? d.quantity_approved
                    : d.quantity_requested,
        })),
    });

    const updateApprovedQty = (index, value) => {
        const newItems = [...data.items];
        newItems[index] = {
            ...newItems[index],
            quantity_approved: value === '' ? 0 : Math.max(0, parseInt(value, 10) || 0),
        };
        setData('items', newItems);
    };

    // Calculate live totals
    const { totalRequestedQty, totalApprovedQty, totalEstimatedApproved } = useMemo(() => {
        let reqQty = 0;
        let appQty = 0;
        let totalVal = 0;

        details.forEach((d, idx) => {
            const requested = Number(d.quantity_requested || 0);
            const approved = isPending
                ? Number(data.items[idx]?.quantity_approved || 0)
                : Number(d.quantity_approved ?? d.quantity_requested ?? 0);
            const unitPrice = Number(d.unit_price || 0);

            reqQty += requested;
            appQty += approved;
            totalVal += approved * unitPrice;
        });

        return {
            totalRequestedQty: reqQty,
            totalApprovedQty: appQty,
            totalEstimatedApproved: totalVal,
        };
    }, [details, data.items, isPending]);

    // Handle Approve with SweetAlert2 confirmation
    const handleApprove = (e) => {
        e.preventDefault();

        Swal.fire({
            title: 'Setujui & Teruskan ke Keuangan?',
            html: `
                <div class="text-left text-xs sm:text-sm space-y-2 mt-2">
                    <p><strong>Nomor Pengajuan:</strong> ${requisition.requisition_number}</p>
                    <p><strong>Divisi Pemohon:</strong> ${requisition.division?.name || '-'}</p>
                    <p><strong>Total Unit Disetujui:</strong> <span class="font-bold text-slate-800">${totalApprovedQty} Unit</span></p>
                    <p><strong>Estimasi Nilai Verifikasi:</strong> <span class="text-emerald-700 font-bold">${formatRupiah(totalEstimatedApproved)}</span></p>
                    <p class="text-slate-500 text-xs mt-2">Dokumen pengajuan akan diteruskan ke Bagian Keuangan untuk proses verifikasi pagu anggaran dan pencairan dana.</p>
                </div>
            `,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#059669',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Ya, Setujui & Teruskan',
            cancelButtonText: 'Batal',
            reverseButtons: true,
        }).then((result) => {
            if (result.isConfirmed) {
                setData('status', 'Diproses_Keuangan');
                put(route('perencanaan.requisitions.update', requisition.id));
            }
        });
    };

    // Handle Reject with SweetAlert2 confirmation
    const handleReject = () => {
        Swal.fire({
            title: 'Tolak Pengajuan Barang?',
            text: `Apakah Anda yakin ingin menolak pengajuan ${requisition.requisition_number}? Status dokumen akan ditutup sebagai Ditolak.`,
            icon: 'warning',
            input: 'textarea',
            inputPlaceholder: 'Tuliskan alasan penolakan (opsional)...',
            inputValue: data.notes_perencanaan,
            showCancelButton: true,
            confirmButtonColor: '#e11d48',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Ya, Tolak Pengajuan',
            cancelButtonText: 'Batal',
            reverseButtons: true,
        }).then((result) => {
            if (result.isConfirmed) {
                setData({
                    ...data,
                    status: 'Ditolak',
                    notes_perencanaan: result.value || data.notes_perencanaan,
                });
                put(route('perencanaan.requisitions.update', requisition.id));
            }
        });
    };

    return (
        <PerencanaanLayout>
            <Head title={`Verifikasi ${requisition.requisition_number} - E-BLUD RSJ Tampan`} />

            <div className="mx-auto max-w-5xl space-y-6">
                {/* Header Back & Info */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <Link
                            href={route('perencanaan.requisitions.index')}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition mb-2"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                            </svg>
                            Kembali ke Daftar Verifikasi
                        </Link>
                        <div className="flex items-center gap-3">
                            <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                                {requisition.requisition_number}
                            </h2>
                            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border ${statusInfo.bg}`}>
                                <span className={`h-2 w-2 rounded-full ${statusInfo.dot}`} />
                                {statusInfo.label}
                            </span>
                        </div>
                    </div>

                    <div className="text-right">
                        <span className="block text-xs font-medium text-slate-500">
                            Status Alur
                        </span>
                        <span className="text-sm font-bold text-slate-800">
                            {isPending ? 'Tahap 1: Verifikasi Perencanaan' : 'Tahap Verifikasi Selesai'}
                        </span>
                    </div>
                </div>

                {/* Status Notice Banner */}
                <div className={`rounded-2xl border p-4 shadow-md shadow-emerald-950/5 ${statusInfo.bg}`}>
                    <div className="flex items-start gap-3">
                        <div className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg ${statusInfo.dot} text-white text-xs font-bold`}>
                            {isPending ? '!' : '✓'}
                        </div>
                        <div>
                            <h4 className="text-sm font-bold">Status Dokumen: {statusInfo.label}</h4>
                            <p className="mt-0.5 text-xs text-slate-600 leading-relaxed">
                                {statusInfo.desc}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Top Section: Requisition Details Card */}
                <div className="overflow-hidden rounded-2xl border border-emerald-100/90 bg-white shadow-md shadow-emerald-950/5 hover:shadow-lg hover:shadow-emerald-900/10 transition-all duration-200">
                    <div className="border-b border-emerald-100 bg-gradient-to-r from-emerald-50/90 via-teal-50/40 to-slate-50/50 px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-2xs">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                </svg>
                            </span>
                            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-950">
                                Informasi Pengajuan dari Unit Kerja
                            </h3>
                        </div>
                        <span className="inline-flex items-center rounded-full bg-emerald-100/70 px-3 py-0.5 text-[11px] font-bold text-emerald-800 border border-emerald-200">
                            E-BLUD Dokumen
                        </span>
                    </div>

                    <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="space-y-1">
                            <span className="block text-xs font-medium text-slate-500">
                                Nomor Requisition
                            </span>
                            <p className="text-sm font-bold text-slate-900">
                                {requisition.requisition_number}
                            </p>
                        </div>

                        <div className="space-y-1">
                            <span className="block text-xs font-medium text-slate-500">
                                Tanggal Diajukan
                            </span>
                            <p className="text-sm font-bold text-slate-900">
                                {formatTanggal(requisition.submission_date)}
                            </p>
                        </div>

                        <div className="space-y-1">
                            <span className="block text-xs font-medium text-slate-500">
                                Unit Kerja / Divisi
                            </span>
                            <p className="text-sm font-bold text-slate-900">
                                {requisition.division?.name || '-'}
                            </p>
                            <span className="text-xs text-slate-500">
                                Kode: {requisition.division?.division_code}
                            </span>
                        </div>

                        <div className="space-y-1">
                            <span className="block text-xs font-medium text-slate-500">
                                Petugas Pengaju (PIC)
                            </span>
                            <p className="text-sm font-bold text-slate-900">
                                {requisition.user?.name || '-'}
                            </p>
                            <span className="text-xs text-slate-500">
                                {requisition.user?.email}
                            </span>
                        </div>

                        <div className="space-y-1">
                            <span className="block text-xs font-medium text-slate-500">
                                Klasifikasi & Rekening RBA
                            </span>
                            <div className="flex items-center gap-1.5 flex-wrap">
                                <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold ${
                                    requisition.jenis_belanja === 'Modal'
                                        ? 'bg-purple-100 text-purple-800'
                                        : 'bg-blue-100 text-blue-800'
                                }`}>
                                    Belanja {requisition.jenis_belanja || 'Operasi'}
                                </span>
                            </div>
                            {requisition.rba_account ? (
                                <p className="text-xs font-medium text-slate-700 mt-1">
                                    <span className="font-mono font-semibold">[{requisition.rba_account.account_code}]</span> {requisition.rba_account.account_name}
                                </p>
                            ) : (
                                <span className="text-xs text-slate-400">-</span>
                            )}
                        </div>

                        <div className="space-y-1">
                            <span className="block text-xs font-medium text-slate-500">
                                Sumber Dana
                            </span>
                            <p className="text-sm font-bold text-slate-900">
                                {requisition.sumber_dana || requisition.rba_account?.sumber_dana || 'BLUD RSJ Tampan'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Middle Section: Items Verification Table */}
                <form onSubmit={handleApprove} className="space-y-6">
                    <div className="overflow-hidden rounded-2xl border border-emerald-100/90 bg-white shadow-md shadow-emerald-950/5 hover:shadow-lg hover:shadow-emerald-900/10 transition-all duration-200">
                        <div className="border-b border-emerald-100 bg-gradient-to-r from-emerald-50/90 via-teal-50/40 to-slate-50/50 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div className="flex items-center gap-2.5">
                                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-2xs">
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </span>
                                <div>
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-950">
                                        Verifikasi Spesifikasi & Jumlah Barang
                                    </h3>
                                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                                        {isPending
                                            ? 'Sesuaikan kuantitas pada kolom "Jumlah Disetujui" sesuai standar kebutuhan RSJ.'
                                            : 'Daftar kuantitas yang telah diverifikasi untuk pengajuan ini.'}
                                    </p>
                                </div>
                            </div>
                            <span className="inline-flex items-center rounded-lg bg-emerald-100/70 px-2.5 py-1 text-xs font-bold text-emerald-800 border border-emerald-200 self-start sm:self-auto">
                                {details.length} Macam Barang
                            </span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-emerald-100">
                                <thead className="bg-gradient-to-r from-emerald-50/90 via-teal-50/40 to-emerald-50/90 font-bold border-b border-emerald-100">
                                    <tr>
                                        <th className="w-14 px-4 py-3.5 text-center text-xs font-bold uppercase tracking-wider text-emerald-950">
                                            No
                                        </th>
                                        <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-emerald-950 min-w-[240px]">
                                            Barang & Spesifikasi
                                        </th>
                                        <th className="w-24 px-4 py-3.5 text-center text-xs font-bold uppercase tracking-wider text-emerald-950">
                                            Satuan
                                        </th>
                                        <th className="w-36 px-5 py-3.5 text-right text-xs font-bold uppercase tracking-wider text-emerald-950">
                                            Harga Acuan
                                        </th>
                                        <th className="w-28 px-4 py-3.5 text-center text-xs font-bold uppercase tracking-wider text-emerald-950">
                                            Diminta
                                        </th>
                                        <th className="w-36 px-4 py-3.5 text-center text-xs font-bold uppercase tracking-wider text-emerald-900 bg-emerald-100/70 border-x border-emerald-200/60">
                                            Disetujui *
                                        </th>
                                        <th className="w-44 px-5 py-3.5 text-right text-xs font-bold uppercase tracking-wider text-emerald-950">
                                            Subtotal Disetujui
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white">
                                    {details.map((detail, idx) => {
                                        const currentApproved = isPending
                                            ? data.items[idx]?.quantity_approved ?? detail.quantity_requested
                                            : detail.quantity_approved ?? detail.quantity_requested;
                                        const subtotal = Number(detail.unit_price || 0) * Number(currentApproved || 0);

                                        return (
                                            <tr key={detail.id || idx} className="hover:bg-emerald-50/40 transition-colors">
                                                {/* No */}
                                                <td className="whitespace-nowrap px-4 py-3.5 text-center text-xs font-semibold text-slate-500">
                                                    #{idx + 1}
                                                </td>

                                                {/* Barang */}
                                                <td className="px-5 py-3.5">
                                                    <div className="flex items-center gap-2">
                                                        <span className="inline-flex rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                                                            {detail.item?.item_code || 'BRG'}
                                                        </span>
                                                        <span className="text-sm font-bold text-slate-900">
                                                            {detail.item?.name || detail.manual_item_name}
                                                        </span>
                                                    </div>
                                                    {(detail.item?.specification || detail.manual_specification) && (
                                                        <p className="mt-1 text-xs text-slate-500 font-medium">
                                                            Spesifikasi: {detail.item?.specification || detail.manual_specification}
                                                        </p>
                                                    )}
                                                </td>

                                                {/* Satuan */}
                                                <td className="whitespace-nowrap px-4 py-3.5 text-center">
                                                    <span className="text-xs text-slate-600 font-medium">
                                                        {detail.item?.unit_type || 'Unit'}
                                                    </span>
                                                </td>

                                                {/* Harga Acuan */}
                                                <td className="whitespace-nowrap px-5 py-3.5 text-right text-xs font-semibold text-slate-700">
                                                    {formatRupiah(detail.unit_price)}
                                                </td>

                                                {/* Diminta */}
                                                <td className="whitespace-nowrap px-4 py-3.5 text-center">
                                                    <span className="text-sm font-semibold text-slate-700">
                                                        {detail.quantity_requested}
                                                    </span>
                                                </td>

                                                {/* Disetujui */}
                                                <td className="p-2.5 text-center bg-emerald-50/40 border-x border-emerald-100/80">
                                                    {isPending ? (
                                                        <div>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                value={data.items[idx]?.quantity_approved ?? ''}
                                                                onChange={(e) => updateApprovedQty(idx, e.target.value)}
                                                                className="block w-full rounded-xl border border-emerald-500 bg-white px-2 py-1.5 text-center text-sm font-bold text-slate-900 shadow-2xs transition focus:border-emerald-600 focus:ring-1 focus:ring-emerald-500"
                                                            />
                                                            {errors[`items.${idx}.quantity_approved`] && (
                                                                <p className="mt-1 text-[11px] font-bold text-rose-600">
                                                                    {errors[`items.${idx}.quantity_approved`]}
                                                                </p>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="inline-flex rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800 border border-emerald-200">
                                                            {detail.quantity_approved ?? detail.quantity_requested}
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Subtotal */}
                                                <td className="whitespace-nowrap px-5 py-3.5 text-right text-sm font-bold text-emerald-700">
                                                    {formatRupiah(subtotal)}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>

                                {/* Footer Akumulasi */}
                                <tfoot className="border-t-2 border-emerald-200 bg-gradient-to-r from-emerald-50/90 via-teal-50/40 to-emerald-50/90">
                                    <tr>
                                        <td colSpan="4" className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wider text-emerald-950">
                                            Total Diminta / Disetujui:
                                        </td>
                                        <td className="px-4 py-4 text-center text-xs font-bold text-slate-800">
                                            {totalRequestedQty}
                                        </td>
                                        <td className="px-4 py-4 text-center text-xs font-black text-emerald-900 bg-emerald-100/70 border-x border-emerald-200/60">
                                            {totalApprovedQty} Unit
                                        </td>
                                        <td className="whitespace-nowrap px-5 py-4 text-right text-base font-black text-emerald-700">
                                            {formatRupiah(totalEstimatedApproved)}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        {/* Notes Section */}
                        <div className="border-t border-emerald-100 bg-gradient-to-b from-emerald-50/30 to-white p-6">
                            <label className="block text-xs font-bold uppercase tracking-wider text-emerald-950 mb-2">
                                Catatan / Rekomendasi Tim Perencanaan {isPending && <span className="text-slate-400 font-normal">(Opsional)</span>}
                            </label>
                            {isPending ? (
                                <textarea
                                    value={data.notes_perencanaan}
                                    onChange={(e) => setData('notes_perencanaan', e.target.value)}
                                    rows={2}
                                    placeholder="Tambahkan catatan hasil penelaahan atau alasan penyesuaian kuantitas..."
                                    className="block w-full rounded-xl border border-emerald-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 transition focus:border-emerald-600 focus:ring-1 focus:ring-emerald-500 shadow-2xs"
                                />
                            ) : (
                                <p className="text-xs font-medium text-slate-700 bg-emerald-50/40 p-3.5 rounded-xl border border-emerald-100">
                                    {requisition.notes_perencanaan || 'Tidak ada catatan khusus dari Perencanaan.'}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    {isPending ? (
                        <div className="overflow-hidden rounded-2xl border border-emerald-100/90 bg-white p-6 shadow-md shadow-emerald-950/5 hover:shadow-lg hover:shadow-emerald-900/10 transition-all duration-200">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div>
                                    <h4 className="text-sm font-bold text-emerald-950">Konfirmasi Verifikasi Pengajuan</h4>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Pastikan kuantitas yang disetujui telah sesuai sebelum meneruskan ke Bagian Keuangan.
                                    </p>
                                </div>

                                <div className="flex flex-wrap items-center gap-3">
                                    <Link
                                        href={route('perencanaan.requisitions.index')}
                                        className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-2xs transition hover:bg-slate-50"
                                    >
                                        Kembali
                                    </Link>

                                    <button
                                        type="button"
                                        onClick={handleReject}
                                        disabled={processing}
                                        className="rounded-xl border border-rose-300 bg-white hover:bg-rose-50 text-rose-700 px-4 py-2 text-xs font-bold shadow-2xs transition disabled:opacity-50"
                                    >
                                        Tolak Pengajuan
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white px-5 py-2.5 text-xs font-bold shadow-md shadow-emerald-700/20 hover:shadow-lg hover:shadow-emerald-700/30 transition duration-200 disabled:opacity-50"
                                    >
                                        {processing ? (
                                            'Memproses...'
                                        ) : (
                                            <>
                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                                </svg>
                                                Setujui & Teruskan ke Keuangan
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-end">
                            <Link
                                href={route('perencanaan.requisitions.index')}
                                className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 shadow-2xs transition hover:bg-slate-50"
                            >
                                &larr; Kembali ke Daftar Verifikasi
                            </Link>
                        </div>
                    )}
                </form>

                {/* Jejak Audit Timeline */}
                <AuditTrailTimeline requisition={requisition} />
            </div>
        </PerencanaanLayout>
    );
}
