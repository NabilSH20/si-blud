import AuditTrailTimeline from '@/Components/AuditTrailTimeline';
import PerencanaanLayout from '@/Layouts/PerencanaanLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
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
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(date);
};

const getStatusBadge = (status) => {
    switch (status) {
        case 'Pending_Perencanaan':
            return {
                label: 'Menunggu Telaah Perencanaan',
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
                label: 'Disetujui Selesai',
                desc: 'Pengajuan telah disetujui penuh dan anggaran telah dialokasikan.',
                bg: 'bg-teal-50 text-teal-900 border-teal-200',
                dot: 'bg-teal-600',
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

export default function Show({ requisition, rbaList = [] }) {
    const statusInfo = getStatusBadge(requisition.status);
    const details = requisition.requisition_details || requisition.requisitionDetails || [];
    const isPending = requisition.status === 'Pending_Perencanaan';
    const [showRejectConfirmation, setShowRejectConfirmation] = useState(false);

    // Filter leaf accounts (rekening definitif siap dibebani anggaran)
    const leafAccounts = useMemo(() => {
        return rbaList.filter((acc) => {
            const hasChildren = rbaList.some(
                (other) => other.account_code !== acc.account_code && other.account_code.startsWith(acc.account_code + '.')
            );
            return !hasChildren;
        });
    }, [rbaList]);

    // Initialize form state
    const { data, setData, put, processing, errors } = useForm({
        status: 'Diproses_Keuangan',
        rba_account_id: requisition.rba_account_id || '',
        notes_perencanaan: requisition.notes_perencanaan || '',
        items: details.map((d) => ({
            id: d.id,
            quantity_approved:
                d.quantity_approved !== null && d.quantity_approved !== undefined
                    ? Number(d.quantity_approved)
                    : Number(d.quantity_requested || 0),
        })),
    });

    // Sync if requisition updates
    useEffect(() => {
        if (requisition) {
            setData((prev) => ({
                ...prev,
                rba_account_id: requisition.rba_account_id || (leafAccounts[0]?.id ? String(leafAccounts[0].id) : ''),
                notes_perencanaan: requisition.notes_perencanaan || '',
                items: details.map((d) => ({
                    id: d.id,
                    quantity_approved:
                        d.quantity_approved !== null && d.quantity_approved !== undefined
                            ? Number(d.quantity_approved)
                            : Number(d.quantity_requested || 0),
                })),
            }));
        }
    }, [requisition]);

    const updateApprovedQty = (index, value) => {
        const parsed = value === '' ? 0 : Math.max(0, parseInt(value, 10) || 0);
        const newItems = [...data.items];
        newItems[index] = {
            ...newItems[index],
            quantity_approved: parsed,
        };
        setData('items', newItems);
    };

    // 1-Click: Setujui Semua Sesuai Usulan
    const handleApproveAll = () => {
        setData(
            'items',
            details.map((d) => ({
                id: d.id,
                quantity_approved: Number(d.quantity_requested || 0),
            }))
        );
    };

    // 1-Click: Reset ke 0
    const handleResetAll = () => {
        setData(
            'items',
            details.map((d) => ({
                id: d.id,
                quantity_approved: 0,
            }))
        );
    };

    // Live Totals calculation
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

    // Handle Approve (Frictionless Submission with Toast)
    const handleApprove = (e) => {
        e.preventDefault();

        put(
            route('perencanaan.requisitions.update', requisition.id),
            {
                status: 'Diproses_Keuangan',
                notes_perencanaan: data.notes_perencanaan,
                items: data.items,
                rba_account_id: data.rba_account_id || null,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    Swal.fire({
                        toast: true,
                        position: 'top-end',
                        icon: 'success',
                        title: 'Usulan belanja disetujui & diteruskan ke Keuangan',
                        showConfirmButton: false,
                        timer: 2500,
                        timerProgressBar: true,
                    });
                },
            }
        );
    };

    // Handle Reject
    const handleConfirmReject = () => {
        put(
            route('perencanaan.requisitions.update', requisition.id),
            {
                status: 'Ditolak',
                notes_perencanaan: data.notes_perencanaan || 'Pengajuan tidak disetujui pada verifikasi Perencanaan.',
                items: data.items,
                rba_account_id: data.rba_account_id || null,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setShowRejectConfirmation(false);
                    Swal.fire({
                        toast: true,
                        position: 'top-end',
                        icon: 'info',
                        title: 'Usulan belanja ditolak',
                        showConfirmButton: false,
                        timer: 2500,
                        timerProgressBar: true,
                    });
                },
            }
        );
    };

    const unitName = requisition.unit?.name || requisition.division?.name || 'Unit Pengusul';
    const fiscalYear = requisition.budget_year || requisition.fiscal_year || '2026';
    const activeRbaAccount = rbaList.find((a) => String(a.id) === String(data.rba_account_id)) || requisition.rba_account;

    return (
        <PerencanaanLayout>
            <Head title={`Telaah Pengajuan ${requisition.requisition_number} - E-BLUD RSJ Tampan`} />

            <div className="space-y-6">
                {/* 1. Top Bar / Breadcrumb & Header Title */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-100">
                    <div>
                        <Link
                            href={route('perencanaan.requisitions.index')}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-teal-800 transition mb-2"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                            </svg>
                            <span>Kembali ke Daftar Verifikasi</span>
                        </Link>
                        <div className="flex items-center gap-2.5 flex-wrap">
                            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                                Telaah Usulan Belanja
                            </h1>
                            <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200">
                                {requisition.requisition_number}
                            </span>
                            <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                                TA {fiscalYear}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border ${statusInfo.bg}`}>
                            <span className={`h-2 w-2 rounded-full ${statusInfo.dot}`} />
                            {statusInfo.label}
                        </span>

                        {!isPending && (
                            <a
                                href={route('requisitions.print', requisition.id)}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 rounded-xl border border-teal-200 bg-teal-50 hover:bg-teal-100 text-teal-800 px-3.5 py-1.5 text-xs font-bold shadow-2xs transition cursor-pointer"
                            >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24-1.077-.32-2.14-.32-3.193 0-5.18 4.02-9.386 8.974-9.386 4.954 0 8.973 4.207 8.973 9.386 0 1.053-.08 2.116-.32 3.193M12 18v-4.5m0 0l-2.25 2.25M12 13.5l2.25 2.25M3.75 19.5h16.5" />
                                </svg>
                                <span>Cetak Dokumen</span>
                            </a>
                        )}
                    </div>
                </div>

                {/* 2. Informasi Berkas Usulan (Clean White Card) */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <h2 className="text-xs sm:text-sm font-bold text-slate-900">
                            Identitas & Informasi Usulan Unit
                        </h2>
                        <span className="text-[11px] font-semibold text-slate-500">
                            Diajukan: {formatTanggal(requisition.submission_date || requisition.created_at)}
                        </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                        <div>
                            <span className="text-slate-400 font-medium block mb-0.5">Unit Kerja Pemohon:</span>
                            <span className="font-bold text-slate-900 text-sm block">
                                {unitName}
                            </span>
                            {requisition.division?.name && requisition.unit?.name && (
                                <span className="text-[11px] text-slate-500">
                                    Bidang: {requisition.division.name}
                                </span>
                            )}
                        </div>

                        <div>
                            <span className="text-slate-400 font-medium block mb-0.5">Petugas PIC Pengusul:</span>
                            <span className="font-bold text-slate-900 text-sm block">
                                {requisition.user?.name || '-'}
                            </span>
                            <span className="text-[11px] text-slate-500">
                                NIP: {requisition.user?.nip || '-'}
                            </span>
                        </div>

                        <div>
                            <span className="text-slate-400 font-medium block mb-0.5">Klasifikasi Belanja:</span>
                            <span className="inline-flex items-center gap-1 font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 text-xs">
                                Belanja {requisition.jenis_belanja || 'Operasi'} &bull; 100% BLUD
                            </span>
                            <span className="text-[11px] text-slate-500 block mt-0.5">
                                Sumber: Pendapatan BLUD
                            </span>
                        </div>

                        <div>
                            <span className="text-slate-400 font-medium block mb-0.5">Sub Kegiatan RS:</span>
                            <span className="font-semibold text-slate-800 block line-clamp-2">
                                {requisition.sub_kegiatan || 'Pelayanan dan Penunjang Pelayanan BLUD RS Jiwa Tampan'}
                            </span>
                        </div>
                    </div>

                    {/* Catatan Alasan Kebutuhan Belanja Unit */}
                    {requisition.urgency_reason && (
                        <div className="border-t border-slate-100 pt-3 text-xs">
                            <span className="font-semibold text-slate-600 block mb-1">
                                Catatan / Justifikasi Urgensi Kebutuhan Pemohon:
                            </span>
                            <p className="text-slate-800 italic bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed whitespace-pre-line">
                                "{requisition.urgency_reason}"
                            </p>
                        </div>
                    )}
                </div>

                {/* 3. Form Telaah Perencanaan */}
                <form onSubmit={handleApprove} className="space-y-6">
                    {/* Pemetaan Rekening Anggaran RBA (Sederhana & Tanpa Dropdown Bertingkat Rumit) */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-100">
                            <div>
                                <h2 className="text-xs sm:text-sm font-bold text-slate-900">
                                    Pemetaan Rekening Belanja RBA BLUD
                                </h2>
                                <p className="text-[11px] text-slate-500">
                                    {isPending
                                        ? 'Periksa atau sesuaikan rekening belanja definitif pembebanan anggaran ini.'
                                        : 'Kode rekening belanja RBA BLUD yang dibebankan pada usulan ini.'}
                                </p>
                            </div>

                            {activeRbaAccount && (
                                <span className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200 self-start sm:self-auto">
                                    <span className="h-1.5 w-1.5 rounded-full bg-teal-600" />
                                    [{activeRbaAccount.account_code}] {activeRbaAccount.account_name}
                                </span>
                            )}
                        </div>

                        {isPending ? (
                            <div className="space-y-2">
                                <label
                                    htmlFor="select_rba_account"
                                    className="block text-xs font-semibold text-slate-700"
                                >
                                    Pilih Rekening Belanja RBA (Rekening Definitif / Leaf) <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    id="select_rba_account"
                                    value={data.rba_account_id}
                                    onChange={(e) => setData('rba_account_id', e.target.value)}
                                    className="block w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs sm:text-sm font-semibold text-slate-900 shadow-2xs transition focus:border-teal-600 focus:ring-1 focus:ring-teal-600 cursor-pointer"
                                >
                                    <option value="" disabled>-- Pilih Pos Rekening Belanja RBA --</option>
                                    {leafAccounts.map((acc) => (
                                        <option key={acc.id} value={acc.id}>
                                            [{acc.account_code}] {acc.account_name} &bull; Belanja {acc.kategori_belanja || 'Operasi'}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-[11px] text-slate-400">
                                    Sistem secara otomatis menyaring hanya rekening definitif yang dapat dibebani alokasi anggaran RBA.
                                </p>
                                {errors.rba_account_id && (
                                    <p className="text-xs font-medium text-rose-600">{errors.rba_account_id}</p>
                                )}
                            </div>
                        ) : (
                            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-xs text-slate-700">
                                Rekening belanja telah dikunci pada tahap verifikasi: <strong>[{activeRbaAccount?.account_code}] {activeRbaAccount?.account_name}</strong>
                            </div>
                        )}
                    </div>

                    {/* Tabel Rincian Barang & Kuantitas Disetujui */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
                            <div>
                                <h2 className="text-xs sm:text-sm font-bold text-slate-900">
                                    Verifikasi Spesifikasi & Kuantitas Barang ({details.length} Item)
                                </h2>
                                <p className="text-[11px] text-slate-500">
                                    Total Diminta: <strong className="text-slate-800">{totalRequestedQty} Unit</strong> &bull; Sesuaikan volume yang disetujui
                                </p>
                            </div>

                            {isPending && (
                                <div className="flex items-center gap-2 flex-wrap">
                                    <button
                                        type="button"
                                        onClick={handleApproveAll}
                                        className="rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 px-3 py-1.5 text-xs font-bold transition cursor-pointer"
                                        title="Setujui seluruh kuantitas sesuai permintaan unit"
                                    >
                                        ✓ Setujui Semua (100%)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleResetAll}
                                        className="rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 px-2.5 py-1.5 text-xs font-semibold transition cursor-pointer"
                                        title="Reset seluruh volume disetujui menjadi 0"
                                    >
                                        Reset (0)
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                            <table className="min-w-full divide-y divide-slate-100 text-xs">
                                <thead className="bg-slate-50 font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                                    <tr>
                                        <th className="w-10 px-3 py-2.5 text-center">No</th>
                                        <th className="px-4 py-2.5 text-left">Nama Barang & Spesifikasi</th>
                                        <th className="w-20 px-3 py-2.5 text-center">Satuan</th>
                                        <th className="w-32 px-3 py-2.5 text-right">Harga Satuan</th>
                                        <th className="w-20 px-3 py-2.5 text-center">Diminta</th>
                                        <th className="w-28 px-3 py-2 text-center bg-teal-50/70 text-teal-950 border-x border-teal-200">
                                            Disetujui *
                                        </th>
                                        <th className="w-36 px-4 py-2.5 text-right">Subtotal Disetujui</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white">
                                    {details.map((detail, idx) => {
                                        const currentApproved = isPending
                                            ? data.items[idx]?.quantity_approved ?? detail.quantity_requested
                                            : detail.quantity_approved ?? detail.quantity_requested;
                                        const unitPrice = Number(detail.unit_price || 0);
                                        const subtotal = unitPrice * Number(currentApproved || 0);
                                        const itemCode = detail.item?.item_code || (detail.item_id ? `ITM-${String(detail.item_id).padStart(4, '0')}` : 'ITM-BARU');

                                        return (
                                            <tr key={detail.id || idx} className="hover:bg-slate-50/60 transition">
                                                <td className="px-3 py-2.5 text-center text-slate-400 font-semibold">
                                                    {idx + 1}
                                                </td>
                                                <td className="px-4 py-2.5">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="font-mono text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                                                            {itemCode}
                                                        </span>
                                                        <span className="font-bold text-slate-900">
                                                            {detail.item?.name || detail.item_name || '-'}
                                                        </span>
                                                    </div>
                                                    {(detail.item?.specification || detail.specification) && (
                                                        <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                                                            {detail.item?.specification || detail.specification}
                                                        </p>
                                                    )}
                                                </td>
                                                <td className="px-3 py-2.5 text-center text-slate-600">
                                                    {detail.unit_type || detail.item?.unit_type || 'Unit'}
                                                </td>
                                                <td className="px-3 py-2.5 text-right font-mono text-slate-700">
                                                    {formatRupiah(unitPrice)}
                                                </td>
                                                <td className="px-3 py-2.5 text-center font-bold text-slate-700">
                                                    {detail.quantity_requested}
                                                </td>
                                                <td className="px-3 py-2 text-center bg-teal-50/40 border-x border-teal-200">
                                                    {isPending ? (
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={data.items[idx]?.quantity_approved ?? ''}
                                                            onChange={(e) => updateApprovedQty(idx, e.target.value)}
                                                            className="w-20 text-center font-bold text-xs rounded-lg border border-slate-300 bg-white py-1 px-2 text-slate-900 focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition shadow-2xs"
                                                        />
                                                    ) : (
                                                        <span className="font-bold text-xs text-teal-800">
                                                            {detail.quantity_approved ?? detail.quantity_requested}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-2.5 text-right font-mono font-bold text-slate-900">
                                                    {formatRupiah(subtotal)}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Baris Ringkasan Akumulasi Total */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-2 border-t border-slate-100">
                            <span className="text-xs text-slate-500">
                                Total Volume Disetujui: <strong className="text-slate-800">{totalApprovedQty} Unit</strong>
                            </span>
                            <div className="flex items-center gap-2 self-end">
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                                    Total Nilai Disetujui:
                                </span>
                                <span className="text-sm sm:text-base font-bold text-teal-800 font-mono bg-teal-50 px-2.5 py-0.5 rounded-lg border border-teal-200">
                                    {formatRupiah(totalEstimatedApproved)}
                                </span>
                            </div>
                        </div>

                        {/* Catatan / Rekomendasi Tim Perencanaan */}
                        <div className="pt-3 border-t border-slate-100 space-y-1.5">
                            <label
                                htmlFor="notes_perencanaan"
                                className="block text-xs font-semibold text-slate-700"
                            >
                                Catatan / Rekomendasi Tim Perencanaan <span className="text-slate-400 font-normal">(Opsional)</span>
                            </label>
                            {isPending ? (
                                <textarea
                                    id="notes_perencanaan"
                                    rows={2}
                                    value={data.notes_perencanaan}
                                    onChange={(e) => setData('notes_perencanaan', e.target.value)}
                                    placeholder="Tuliskan catatan arahan teknis untuk Bagian Keuangan atau unit kerja pengusul..."
                                    className="block w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition shadow-2xs"
                                />
                            ) : (
                                <p className="text-xs font-medium text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed">
                                    {requisition.notes_perencanaan || 'Tidak ada catatan khusus dari Tim Perencanaan.'}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Konfirmasi Penolakan Inline jika tombol Tolak diklik */}
                    {showRejectConfirmation && (
                        <div className="rounded-xl border border-rose-200 bg-rose-50/80 p-4 space-y-2 animate-fade-in">
                            <div className="flex items-center gap-2 text-rose-900 font-bold text-xs">
                                <span>⚠️</span>
                                <span>Konfirmasi Penolakan Usulan Belanja</span>
                            </div>
                            <p className="text-xs text-rose-700">
                                Berkas usulan belanja ini akan ditutup dengan status <strong>Ditolak</strong>. Pastikan Anda telah menuliskan alasan penolakan pada kolom catatan di atas.
                            </p>
                            <div className="flex items-center gap-2 pt-1">
                                <button
                                    type="button"
                                    onClick={handleConfirmReject}
                                    disabled={processing}
                                    className="rounded-lg bg-rose-600 hover:bg-rose-700 text-white px-3.5 py-1.5 text-xs font-bold transition cursor-pointer disabled:opacity-50"
                                >
                                    {processing ? 'Menolak...' : 'Ya, Tetap Tolak Usulan'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowRejectConfirmation(false)}
                                    className="rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 px-3 py-1.5 text-xs font-semibold transition cursor-pointer"
                                >
                                    Batal
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons Bar */}
                    {isPending ? (
                        <div className="flex items-center justify-between gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setShowRejectConfirmation(!showRejectConfirmation)}
                                disabled={processing}
                                className="rounded-xl border border-rose-200 bg-rose-50/70 hover:bg-rose-100 text-rose-700 active:scale-95 px-4 py-2 text-xs font-bold transition cursor-pointer disabled:opacity-50"
                            >
                                Tolak Pengajuan
                            </button>

                            <div className="flex items-center gap-2.5">
                                <Link
                                    href={route('perencanaan.requisitions.index')}
                                    className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                                >
                                    Batal
                                </Link>

                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="inline-flex items-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-95 text-white px-5 py-2 text-xs font-bold shadow-xs transition cursor-pointer disabled:opacity-50"
                                >
                                    {processing ? (
                                        <>
                                            <svg className="h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" strokeWidth="4" stroke="currentColor" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            <span>Memproses...</span>
                                        </>
                                    ) : (
                                        <>
                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                            </svg>
                                            <span>Setujui & Teruskan ke Keuangan</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-end">
                            <Link
                                href={route('perencanaan.requisitions.index')}
                                className="rounded-xl border border-slate-300 bg-white px-5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                            >
                                &larr; Kembali ke Daftar Verifikasi
                            </Link>
                        </div>
                    )}
                </form>

                {/* 4. Jejak Audit Alur Berkas Timeline */}
                <AuditTrailTimeline requisition={requisition} />
            </div>
        </PerencanaanLayout>
    );
}
