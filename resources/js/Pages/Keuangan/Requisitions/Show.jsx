import AuditTrailTimeline from '@/Components/AuditTrailTimeline';
import KeuanganLayout from '@/Layouts/KeuanganLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
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
        case 'Diproses_Keuangan':
            return {
                label: 'Menunggu Validasi Pagu Anggaran',
                desc: 'Pengajuan telah lolos verifikasi Perencanaan. Silakan periksa ketersediaan saldo pagu rekening RBA dan setujui untuk mendebit anggaran belanja.',
                bg: 'bg-blue-50 text-blue-900 border-blue-200',
                dot: 'bg-blue-500',
            };
        case 'Disetujui_Selesai':
            return {
                label: 'Disetujui & Anggaran Teralokasi',
                desc: 'Pengajuan telah disetujui secara final. Anggaran belanja telah berhasil dipotong dari rekening pagu RBA terkait.',
                bg: 'bg-emerald-50 text-emerald-900 border-emerald-200',
                dot: 'bg-emerald-500',
            };
        case 'Pending_Perencanaan':
            return {
                label: 'Verifikasi Perencanaan',
                desc: 'Pengajuan ini masih dalam tahap penelaahan kuantitas di Bagian Perencanaan.',
                bg: 'bg-amber-50 text-amber-900 border-amber-200',
                dot: 'bg-amber-500',
            };
        case 'Ditolak':
            return {
                label: 'Pengajuan Ditolak',
                desc: 'Pengajuan telah ditolak.',
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

export default function Show({ requisition, budgets = [] }) {
    const statusInfo = getStatusBadge(requisition.status);
    const details = requisition.requisition_details || [];
    const isActionable = requisition.status === 'Diproses_Keuangan';

    // Calculate Grand Total from verified items
    const { grandTotal, totalApprovedItems } = useMemo(() => {
        let total = 0;
        let qtyTotal = 0;

        details.forEach((d) => {
            const qty = d.quantity_approved !== null && d.quantity_approved !== undefined
                ? Number(d.quantity_approved)
                : Number(d.quantity_requested || 0);
            const price = Number(d.unit_price || d.item?.standard_price || 0);

            qtyTotal += qty;
            total += qty * price;
        });

        return { grandTotal: total, totalApprovedItems: qtyTotal };
    }, [details]);

    // Initial account ID
    const initialAccountId = requisition.rba_account_id || (budgets[0]?.id ? String(budgets[0].id) : '');

    // Inertia form for approval & disbursement
    const { data, setData, put, processing, errors } = useForm({
        status: 'Disetujui_Selesai',
        rba_account_id: initialAccountId ? String(initialAccountId) : '',
        sp2d_number: requisition.sp2d_number || '',
        receipt_number: requisition.receipt_number || '',
        notes_keuangan: requisition.notes_keuangan || '',
    });

    // Selected Budget preview
    const selectedBudget = useMemo(() => {
        return budgets.find((b) => String(b.id) === String(data.rba_account_id));
    }, [budgets, data.rba_account_id]);

    const remainingAfterDeduction = useMemo(() => {
        if (!selectedBudget) return null;
        return Number(selectedBudget.remaining_budget || 0) - grandTotal;
    }, [selectedBudget, grandTotal]);

    const isBudgetInsufficient = remainingAfterDeduction !== null && remainingAfterDeduction < 0;

    // Handle Approve with SweetAlert2 confirmation
    const handleApprove = (e) => {
        e.preventDefault();

        if (!data.rba_account_id) {
            Swal.fire({
                icon: 'warning',
                title: 'Pilih Rekening Anggaran',
                text: 'Silakan tentukan rekening pagu anggaran RBA yang akan dibebankan.',
                confirmButtonColor: '#059669',
            });
            return;
        }

        if (isBudgetInsufficient) {
            Swal.fire({
                icon: 'error',
                title: 'Saldo Pagu Tidak Mencukupi',
                text: `Sisa pagu pada rekening ${selectedBudget?.account_name} (${formatRupiah(selectedBudget?.remaining_budget)}) tidak cukup untuk membiayai pengajuan ini (${formatRupiah(grandTotal)}).`,
                confirmButtonColor: '#e11d48',
            });
            return;
        }

        Swal.fire({
            title: 'Setujui & Potong Anggaran?',
            html: `
                <div class="text-left text-xs sm:text-sm space-y-2.5 mt-2">
                    <p><strong>Nomor Dokumen:</strong> ${requisition.requisition_number}</p>
                    <p><strong>Rekening Pagu:</strong> [${selectedBudget?.account_code}] ${selectedBudget?.account_name}</p>
                    <p><strong>Beban Anggaran:</strong> <span class="text-emerald-700 font-bold">${formatRupiah(grandTotal)}</span></p>
                    <p><strong>Sisa Saldo Pagu Baru:</strong> <span class="text-slate-800 font-bold">${formatRupiah(remainingAfterDeduction)}</span></p>
                    <p class="text-slate-500 text-xs mt-2 border-t pt-2">Tindakan ini akan mendebit saldo sisa pagu rekening secara permanen dan menyelesaikan proses pengadaan.</p>
                </div>
            `,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#059669',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Ya, Setujui & Cairkan',
            cancelButtonText: 'Batal',
            reverseButtons: true,
        }).then((result) => {
            if (result.isConfirmed) {
                router.put(
                    route('keuangan.requisitions.update', requisition.id),
                    {
                        status: 'Disetujui_Selesai',
                        rba_account_id: data.rba_account_id,
                        sp2d_number: data.sp2d_number,
                        receipt_number: data.receipt_number,
                        notes_keuangan: data.notes_keuangan,
                    },
                    { preserveScroll: true }
                );
            }
        });
    };

    // Handle Reject with SweetAlert2 confirmation
    const handleReject = () => {
        Swal.fire({
            title: 'Tolak Alokasi Anggaran?',
            text: `Apakah Anda yakin ingin menolak alokasi anggaran untuk pengajuan ${requisition.requisition_number}? Pagu anggaran tidak akan dipotong.`,
            icon: 'warning',
            input: 'textarea',
            inputPlaceholder: 'Tuliskan alasan penolakan (opsional)...',
            inputValue: data.notes_keuangan,
            showCancelButton: true,
            confirmButtonColor: '#e11d48',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Ya, Tolak Pengajuan',
            cancelButtonText: 'Batal',
            reverseButtons: true,
        }).then((result) => {
            if (result.isConfirmed) {
                router.put(
                    route('keuangan.requisitions.update', requisition.id),
                    {
                        status: 'Ditolak',
                        notes_keuangan: result.value || data.notes_keuangan || 'Alokasi anggaran ditolak oleh Bagian Keuangan.',
                    },
                    { preserveScroll: true }
                );
            }
        });
    };

    return (
        <KeuanganLayout>
            <Head title={`Validasi ${requisition.requisition_number} - E-BLUD RSJ Tampan`} />

            <div className="mx-auto max-w-5xl space-y-6">
                {/* Header Back & Info */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <Link
                            href={route('keuangan.requisitions.index')}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition mb-2"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                            </svg>
                            Kembali ke Daftar Validasi
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

                    <div className="flex items-center gap-3">
                        <a
                            href={route('requisitions.print', requisition.id)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 active:scale-95 px-4 py-2 text-xs font-bold text-slate-700 shadow-2xs transition"
                        >
                            <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24-1.077-.32-2.14-.32-3.193 0-5.18 4.02-9.386 8.974-9.386 4.954 0 8.973 4.207 8.973 9.386 0 1.053-.08 2.116-.32 3.193M12 18v-4.5m0 0l-2.25 2.25M12 13.5l2.25 2.25M3.75 19.5h16.5" />
                            </svg>
                            Cetak Nota
                        </a>
                        <div className="text-right hidden sm:block">
                            <span className="block text-xs font-medium text-slate-500">
                                Status Alur
                            </span>
                            <span className="text-sm font-bold text-slate-800">
                                {isActionable ? 'Tahap 2: Validasi & Pembebanan Anggaran' : 'Tahap Telah Selesai'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Status Notice Card */}
                <div className={`rounded-2xl border p-4 shadow-md shadow-emerald-950/5 ${statusInfo.bg}`}>
                    <div className="flex items-start gap-3">
                        <div className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg ${statusInfo.dot} text-white text-xs font-bold`}>
                            {isActionable ? 'Rp' : '✓'}
                        </div>
                        <div>
                            <h4 className="text-sm font-bold">Status Dokumen: {statusInfo.label}</h4>
                            <p className="mt-0.5 text-xs text-slate-600 leading-relaxed">
                                {statusInfo.desc}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Top Section: Requisition Header Details Card */}
                <div className="overflow-hidden rounded-2xl border border-emerald-100/90 bg-white shadow-md shadow-emerald-950/5 hover:shadow-lg hover:shadow-emerald-900/10 transition-all duration-200">
                    <div className="border-b border-emerald-100 bg-gradient-to-r from-emerald-50/90 via-teal-50/40 to-slate-50/50 px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-2xs">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                </svg>
                            </span>
                            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-950">
                                Informasi Dokumen Pengajuan
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
                                Bidang & Unit Pemohon
                            </span>
                            <p className="text-sm font-bold text-slate-900">
                                {requisition.division?.name || '-'}
                            </p>
                            {requisition.unit ? (
                                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-800 border border-emerald-200">
                                    Unit: {requisition.unit.name} ({requisition.unit.unit_code})
                                </span>
                            ) : (
                                <span className="text-xs text-slate-500">
                                    Kode: {requisition.division?.division_code}
                                </span>
                            )}
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
                                Klasifikasi & Rekening Usulan
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

                    {/* Note from Perencanaan if present */}
                    {requisition.notes_perencanaan && (
                        <div className="border-t border-slate-100 bg-amber-50/40 p-5">
                            <span className="text-xs font-bold text-amber-900">Catatan dari Bagian Perencanaan:</span>
                            <p className="mt-1 text-xs text-amber-800 font-medium">{requisition.notes_perencanaan}</p>
                        </div>
                    )}
                </div>

                {/* Middle Section: Items & Grand Total */}
                <div className="overflow-hidden rounded-2xl border border-emerald-100/90 bg-white shadow-md shadow-emerald-950/5 hover:shadow-lg hover:shadow-emerald-900/10 transition-all duration-200">
                    <div className="border-b border-emerald-100 bg-gradient-to-r from-emerald-50/90 via-teal-50/40 to-slate-50/50 px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-2xs">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </span>
                            <div>
                                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-950">
                                    Rincian Barang yang Disetujui (Hasil Verifikasi Perencanaan)
                                </h3>
                                <p className="text-xs text-slate-500 font-medium">
                                    Beban biaya dihitung berdasarkan kuantitas yang disetujui dikalikan harga satuan standar acuan
                                </p>
                            </div>
                        </div>
                        <span className="inline-flex items-center rounded-lg bg-emerald-100/70 px-2.5 py-1 text-xs font-bold text-emerald-800 border border-emerald-200">
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
                                    <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-emerald-950">
                                        Nama Barang & Spesifikasi
                                    </th>
                                    <th className="w-24 px-4 py-3.5 text-center text-xs font-bold uppercase tracking-wider text-emerald-950">
                                        Satuan
                                    </th>
                                    <th className="w-28 px-4 py-3.5 text-center text-xs font-bold uppercase tracking-wider text-emerald-950">
                                        Qty Disetujui
                                    </th>
                                    <th className="w-40 px-5 py-3.5 text-right text-xs font-bold uppercase tracking-wider text-emerald-950">
                                        Harga Standar
                                    </th>
                                    <th className="w-44 px-5 py-3.5 text-right text-xs font-bold uppercase tracking-wider text-emerald-950">
                                        Subtotal
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {details.map((detail, idx) => {
                                    const qty = detail.quantity_approved !== null && detail.quantity_approved !== undefined
                                        ? Number(detail.quantity_approved)
                                        : Number(detail.quantity_requested || 0);
                                    const price = Number(detail.unit_price || detail.item?.standard_price || 0);
                                    const subtotal = qty * price;

                                    return (
                                        <tr key={detail.id || idx} className="hover:bg-emerald-50/40 transition-colors">
                                            <td className="whitespace-nowrap px-4 py-3.5 text-center text-xs font-semibold text-slate-500">
                                                #{idx + 1}
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-2">
                                                    <span className="inline-flex rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                                                        {detail.item?.item_code || 'BRG'}
                                                    </span>
                                                    <span className="text-sm font-bold text-slate-900">
                                                        {detail.item?.name || detail.item_name || detail.manual_item_name}
                                                    </span>
                                                </div>
                                                {(detail.item?.specification || detail.specification || detail.manual_specification) && (
                                                    <p className="mt-1 text-xs text-slate-500 font-medium">
                                                        Spesifikasi: {detail.item?.specification || detail.specification || detail.manual_specification}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3.5 text-center text-xs text-slate-600 font-medium">
                                                {detail.item?.unit_type || detail.unit_type || 'Unit'}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3.5 text-center text-sm font-bold text-slate-900">
                                                {qty}
                                            </td>
                                            <td className="whitespace-nowrap px-5 py-3.5 text-right text-xs font-semibold text-slate-700">
                                                {formatRupiah(price)}
                                            </td>
                                            <td className="whitespace-nowrap px-5 py-3.5 text-right text-sm font-bold text-emerald-700">
                                                {formatRupiah(subtotal)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>

                            {/* Grand Total Footer */}
                            <tfoot className="border-t-2 border-emerald-200 bg-gradient-to-r from-emerald-50/90 via-teal-50/40 to-emerald-50/90">
                                <tr>
                                    <td colSpan="3" className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wider text-emerald-950">
                                        Total Barang Disetujui:
                                    </td>
                                    <td className="px-4 py-4 text-center text-xs font-bold text-slate-900">
                                        {totalApprovedItems} Unit
                                    </td>
                                    <td className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wider text-emerald-950">
                                        Grand Total Beban:
                                    </td>
                                    <td className="whitespace-nowrap px-5 py-4 text-right">
                                        <span className="text-lg sm:text-xl font-bold text-emerald-700 tracking-tight">
                                            {formatRupiah(grandTotal)}
                                        </span>
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                {/* Bottom Section: Budget Deduction Form OR Allocation Info */}
                {isActionable ? (
                    <form onSubmit={handleApprove} className="space-y-6">
                        <div className="overflow-hidden rounded-2xl border border-emerald-100/90 bg-white shadow-md shadow-emerald-950/5 hover:shadow-lg hover:shadow-emerald-900/10 transition-all duration-200">
                            <div className="border-b border-emerald-100 bg-gradient-to-r from-emerald-50/90 via-teal-50/40 to-slate-50/50 px-6 py-4 flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-2xs">
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6H2.25m0 0H3m-.75 0h.008v.008H2.25V6zm0 0v12m0 0h.008v.008H2.25V18zm0 0H3m16.5-12a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6v12a2.25 2.25 0 002.25 2.25h10.5a2.25 2.25 0 002.25-2.25V6z" />
                                        </svg>
                                    </span>
                                    <div>
                                        <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-950">
                                            Alokasi & Pembebanan Pagu Anggaran RBA
                                        </h3>
                                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                                            Tentukan rekening DPA/RBA yang akan mendanai pengajuan ini. Saldo sisa pagu akan otomatis terpotong saat disetujui.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 space-y-5">
                                {/* Budget Select Dropdown */}
                                <div>
                                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700">
                                        Rekening Pagu Anggaran RBA <span className="text-rose-600">*</span>
                                    </label>
                                    <select
                                        id="rba_account_id"
                                        value={data.rba_account_id}
                                        onChange={(e) => setData('rba_account_id', e.target.value)}
                                        className="block w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-semibold text-slate-900 transition focus:border-emerald-600 focus:ring-1 focus:ring-emerald-500"
                                    >
                                        <option value="">-- Pilih Rekening Pagu Anggaran --</option>
                                        {budgets.map((b) => (
                                            <option key={b.id} value={b.id}>
                                                [{b.account_code}] {b.account_name} ({b.kategori_belanja || 'BLUD'}) — Sisa: {formatRupiah(b.remaining_budget)}
                                            </option>
                                        ))}
                                    </select>

                                    {errors.rba_account_id && (
                                        <p className="mt-1.5 text-[11px] font-medium text-rose-600 animate-pulse">
                                            {errors.rba_account_id}
                                        </p>
                                    )}
                                </div>

                                {/* Interactive Budget Preview Calculation */}
                                {selectedBudget && (
                                    <div className={`rounded-2xl border p-4 ${
                                        isBudgetInsufficient
                                            ? 'bg-rose-50/80 border-rose-200 text-rose-950'
                                            : 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                                    }`}>
                                        <div className="flex items-center justify-between border-b border-black/10 pb-2.5 mb-3">
                                            <span className="text-xs font-bold uppercase tracking-wider">
                                                Simulasi Pemotongan Saldo Pagu
                                            </span>
                                            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-md bg-white/80 border border-black/10">
                                                {selectedBudget.account_code}
                                            </span>
                                        </div>

                                        <div className="grid gap-4 sm:grid-cols-3 text-xs font-semibold">
                                            <div>
                                                <span className="block text-xs font-normal opacity-75">Sisa Pagu Saat Ini:</span>
                                                <p className="text-sm font-bold mt-0.5">{formatRupiah(selectedBudget.remaining_budget)}</p>
                                            </div>
                                            <div>
                                                <span className="block text-xs font-normal opacity-75">Beban Biaya Requisition:</span>
                                                <p className="text-sm font-bold text-rose-700 mt-0.5">- {formatRupiah(grandTotal)}</p>
                                            </div>
                                            <div>
                                                <span className="block text-xs font-normal opacity-75">Estimasi Sisa Pagu Akhir:</span>
                                                <p className={`text-sm font-bold mt-0.5 ${isBudgetInsufficient ? 'text-rose-700' : 'text-emerald-700'}`}>
                                                    {formatRupiah(remainingAfterDeduction)}
                                                </p>
                                            </div>
                                        </div>

                                        {isBudgetInsufficient && (
                                            <div className="mt-3 flex items-center gap-2 text-xs font-bold text-rose-700 bg-rose-100/80 p-2.5 rounded-xl border border-rose-200">
                                                <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                                                </svg>
                                                Peringatan: Sisa pagu anggaran pada rekening ini tidak mencukupi untuk membiayai total pengajuan ini!
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* SP2D & Bukti Kuitansi Inputs */}
                                <div className="grid gap-4 sm:grid-cols-2 pt-2">
                                    <div>
                                        <label className="mb-1 block text-xs font-bold text-slate-700">
                                            Nomor SP2D / SPM <span className="text-slate-400 font-normal">(Opsional)</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={data.sp2d_number}
                                            onChange={(e) => setData('sp2d_number', e.target.value)}
                                            placeholder="Contoh: 900/SP2D/BLUD/2026"
                                            className="block w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 transition focus:border-emerald-600 focus:ring-1 focus:ring-emerald-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-1 block text-xs font-bold text-slate-700">
                                            Nomor Kuitansi / Bukti SPJ <span className="text-slate-400 font-normal">(Opsional)</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={data.receipt_number}
                                            onChange={(e) => setData('receipt_number', e.target.value)}
                                            placeholder="Contoh: KWT-2026-034"
                                            className="block w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 transition focus:border-emerald-600 focus:ring-1 focus:ring-emerald-500"
                                        />
                                    </div>
                                </div>

                                {/* Catatan Keuangan */}
                                <div>
                                    <label className="mb-1 block text-xs font-bold text-slate-700">
                                        Catatan Bagian Keuangan <span className="text-slate-400 font-normal">(Opsional)</span>
                                    </label>
                                    <textarea
                                        value={data.notes_keuangan}
                                        onChange={(e) => setData('notes_keuangan', e.target.value)}
                                        rows={2}
                                        placeholder="Catatan verifikasi pembukuan, realisasi transfer, dll..."
                                        className="block w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 transition focus:border-emerald-600 focus:ring-1 focus:ring-emerald-500"
                                    />
                                </div>
                            </div>

                            {/* Action Buttons Toolbar */}
                            <div className="border-t border-emerald-100 bg-gradient-to-r from-emerald-50/40 via-teal-50/20 to-slate-50/50 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <Link
                                    href={route('keuangan.requisitions.index')}
                                    className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-2xs transition hover:bg-slate-50 text-center"
                                >
                                    Batal & Kembali
                                </Link>

                                <div className="flex flex-wrap items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={handleReject}
                                        disabled={processing}
                                        className="rounded-xl border border-rose-300 bg-white hover:bg-rose-50 text-rose-700 px-4 py-2 text-xs font-bold shadow-2xs transition active:scale-95 disabled:opacity-50"
                                    >
                                        Tolak Pengajuan
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={processing || isBudgetInsufficient || !data.rba_account_id}
                                        className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white px-5 py-2.5 text-xs font-bold shadow-md shadow-emerald-700/20 hover:shadow-lg hover:shadow-emerald-700/30 transition duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        {processing ? (
                                            'Memproses Pemotongan...'
                                        ) : (
                                            <>
                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                                </svg>
                                                Setujui & Potong Pagu Anggaran
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                ) : (
                    /* Read-Only Info Card for Completed or Rejected Requisitions */
                    <div className="overflow-hidden rounded-2xl border border-emerald-100/90 bg-white shadow-md shadow-emerald-950/5 hover:shadow-lg hover:shadow-emerald-900/10 transition-all duration-200">
                        <div className="border-b border-emerald-100 bg-gradient-to-r from-emerald-50/90 via-teal-50/40 to-slate-50/50 px-6 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-2xs">
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </span>
                                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-950">
                                    Informasi Alokasi Anggaran
                                </h3>
                            </div>
                        </div>
                        <div className="p-6 space-y-4">
                            {requisition.budget || requisition.rba_account ? (
                                <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 space-y-1.5">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="font-mono text-xs font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-md">
                                            {(requisition.budget || requisition.rba_account).account_code}
                                        </span>
                                        <span className="text-sm font-bold text-emerald-950">
                                            {(requisition.budget || requisition.rba_account).account_name}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-600">
                                        Tahun Anggaran: <span className="font-bold text-slate-900">{(requisition.budget || requisition.rba_account).period_year}</span> &bull; Sisa Pagu: <span className="font-bold text-emerald-700">{formatRupiah((requisition.budget || requisition.rba_account).remaining_budget)}</span>
                                    </p>
                                    {(requisition.sp2d_number || requisition.receipt_number) && (
                                        <div className="pt-2 border-t border-emerald-200/60 flex items-center gap-4 text-xs font-semibold text-emerald-950">
                                            {requisition.sp2d_number && <span>No. SP2D: {requisition.sp2d_number}</span>}
                                            {requisition.receipt_number && <span>No. Kuitansi: {requisition.receipt_number}</span>}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="text-xs text-slate-500 font-medium">
                                    Tidak ada pagu anggaran belanja yang terhubung pada pengajuan ini.
                                </p>
                            )}

                            {requisition.notes_keuangan && (
                                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs">
                                    <span className="font-bold text-slate-800">Catatan Keuangan:</span>
                                    <p className="mt-1 text-slate-600">{requisition.notes_keuangan}</p>
                                </div>
                            )}

                            <div className="mt-4 flex justify-end">
                                <Link
                                    href={route('keuangan.requisitions.index')}
                                    className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-2xs transition hover:bg-slate-50"
                                >
                                    &larr; Kembali ke Daftar Validasi
                                </Link>
                            </div>
                        </div>
                    </div>
                )}

                {/* Jejak Audit Timeline */}
                <AuditTrailTimeline requisition={requisition} />
            </div>
        </KeuanganLayout>
    );
}

