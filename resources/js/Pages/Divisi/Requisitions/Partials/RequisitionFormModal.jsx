import Modal from '@/Components/Modal';
import { useForm, usePage } from '@inertiajs/react';
import { useEffect, useMemo } from 'react';
import Swal from 'sweetalert2';

const formatRupiah = (value) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(Number(value || 0));

export default function RequisitionFormModal({
    show = false,
    onClose = () => {},
    requisition = null,
    initialJenis = 'Operasi',
    rbaAccounts = [],
    items = [],
    subKegiatanOptions = [],
    userDivision,
    userUnit,
    defaultFiscalYear = 2027,
}) {
    const isEdit = Boolean(requisition && requisition.id);
    const authUser = usePage().props.auth.user;
    const division = userDivision || authUser?.division;
    const unit = userUnit || authUser?.unit;

    // Accounts for default jenis
    const initialAccounts = useMemo(() => {
        const j = isEdit ? requisition?.jenis_belanja : initialJenis;
        return rbaAccounts.filter((acc) => acc.kategori_belanja === j);
    }, [rbaAccounts, initialJenis, isEdit, requisition]);

    const defaultAccountId =
        requisition?.rba_account_id ||
        initialAccounts[0]?.id ||
        rbaAccounts[0]?.id ||
        '';

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        jenis_belanja: initialJenis || 'Operasi',
        rba_account_id: defaultAccountId,
        fiscal_year: defaultFiscalYear || 2027,
        sub_kegiatan: subKegiatanOptions[0] || 'Pelayanan dan Penunjang Pelayanan BLUD RS Jiwa Tampan',
        nomor_surat_unit: '',
        urgency_reason: '',
        items: [
            {
                item_id: '',
                quantity: 1,
            },
        ],
    });

    // Populate or reset form whenever modal opens or active requisition changes
    useEffect(() => {
        if (!show) {
            clearErrors();
            return;
        }

        if (requisition) {
            setData({
                jenis_belanja: requisition.jenis_belanja || 'Operasi',
                rba_account_id: requisition.rba_account_id || '',
                fiscal_year: requisition.fiscal_year || defaultFiscalYear || 2027,
                sub_kegiatan: requisition.sub_kegiatan || subKegiatanOptions[0] || '',
                nomor_surat_unit: requisition.nomor_surat_unit || '',
                urgency_reason: requisition.urgency_reason || '',
                items: requisition.requisition_details?.length
                    ? requisition.requisition_details.map((d) => ({
                          item_id: d.item_id || '',
                          quantity: d.quantity_requested || 1,
                      }))
                    : [{ item_id: '', quantity: 1 }],
            });
        } else {
            const currentJenis = initialJenis || 'Operasi';
            const matched = rbaAccounts.filter((acc) => acc.kategori_belanja === currentJenis);
            const firstId = matched[0]?.id || rbaAccounts[0]?.id || '';

            setData({
                jenis_belanja: currentJenis,
                rba_account_id: firstId,
                fiscal_year: defaultFiscalYear || 2027,
                sub_kegiatan: subKegiatanOptions[0] || 'Pelayanan dan Penunjang Pelayanan BLUD RS Jiwa Tampan',
                nomor_surat_unit: '',
                urgency_reason: '',
                items: [{ item_id: '', quantity: 1 }],
            });
        }
        clearErrors();
    }, [show, requisition, initialJenis]);

    // Accounts filtered by selected jenis_belanja
    const accountsForJenis = useMemo(() => {
        return rbaAccounts.filter((acc) => acc.kategori_belanja === data.jenis_belanja);
    }, [rbaAccounts, data.jenis_belanja]);

    // Items filtered by selected rba_account_id
    const availableItems = useMemo(() => {
        if (!data.rba_account_id) return [];
        return items.filter((item) => String(item.rba_account_id) === String(data.rba_account_id));
    }, [items, data.rba_account_id]);

    // Fast lookup map for all items
    const itemMap = useMemo(() => {
        const map = {};
        items.forEach((item) => {
            map[item.id] = item;
        });
        return map;
    }, [items]);

    // Active selected RBA Account info
    const selectedAccount = useMemo(() => {
        return rbaAccounts.find((acc) => String(acc.id) === String(data.rba_account_id));
    }, [rbaAccounts, data.rba_account_id]);

    // Switch jenis_belanja
    const handleJenisChange = (newJenis) => {
        const matchingAccounts = rbaAccounts.filter((acc) => acc.kategori_belanja === newJenis);
        const newAccountId = matchingAccounts[0]?.id || '';

        setData((prev) => ({
            ...prev,
            jenis_belanja: newJenis,
            rba_account_id: newAccountId,
            items: [{ item_id: '', quantity: 1 }],
        }));
    };

    // Switch rba_account_id
    const handleAccountChange = (newAccountId) => {
        setData((prev) => ({
            ...prev,
            rba_account_id: newAccountId,
            items: [{ item_id: '', quantity: 1 }],
        }));
    };

    // Update specific row
    const updateItemRow = (index, field, value) => {
        const newItems = [...data.items];
        newItems[index] = {
            ...newItems[index],
            [field]: value,
        };
        setData('items', newItems);
    };

    // Add new row
    const addItemRow = () => {
        setData('items', [
            ...data.items,
            {
                item_id: '',
                quantity: 1,
            },
        ]);
    };

    // Remove row
    const removeItemRow = (index) => {
        if (data.items.length <= 1) return;
        const newItems = data.items.filter((_, idx) => idx !== index);
        setData('items', newItems);
    };

    // Totals
    const { grandTotal, totalQuantity } = useMemo(() => {
        let sum = 0;
        let totalQty = 0;
        data.items.forEach((row) => {
            const item = itemMap[row.item_id];
            const qty = parseInt(row.quantity, 10) || 0;
            if (item && qty > 0) {
                sum += Number(item.standard_price || 0) * qty;
                totalQty += qty;
            }
        });
        return { grandTotal: sum, totalQuantity: totalQty };
    }, [data.items, itemMap]);

    // Handle form submit
    const handleSubmit = (e) => {
        e.preventDefault();

        // Validation: verify no empty items
        const hasEmptyItem = data.items.some((row) => !row.item_id || !row.quantity);
        if (hasEmptyItem) {
            Swal.fire({
                icon: 'warning',
                title: 'Data Belum Lengkap',
                text: 'Pastikan seluruh baris barang telah dipilih dari katalog dan jumlah kuantitas terisi dengan benar.',
                confirmButtonColor: '#059669',
            });
            return;
        }

        const titleText = isEdit
            ? 'Simpan Perubahan Usulan Belanja?'
            : 'Kirim Usulan Belanja E-BLUD?';
        const confirmBtnText = isEdit
            ? 'Ya, Simpan Perubahan'
            : 'Ya, Kirim ke Perencanaan';

        Swal.fire({
            title: titleText,
            html: `
                <div class="text-left text-xs sm:text-sm space-y-2 mt-2">
                    <p><strong>Unit Pengusul:</strong> ${unit?.name || 'Unit Kerja RSJ'}</p>
                    <p><strong>Tahun Anggaran Kebutuhan:</strong> <span class="text-emerald-700 font-bold">${data.fiscal_year} (1 Tahun ke Depan)</span></p>
                    <p><strong>Sub Kegiatan:</strong> ${data.sub_kegiatan}</p>
                    <p><strong>Rekening RBA:</strong> [${selectedAccount?.account_code || '-'}] ${selectedAccount?.account_name || '-'}</p>
                    <p><strong>Jumlah Barang:</strong> ${data.items.length} macam (${totalQuantity} unit)</p>
                    <p><strong>Total Estimasi Belanja BLUD:</strong> <span class="text-emerald-700 font-bold">${formatRupiah(grandTotal)}</span></p>
                    <p class="text-slate-500 text-xs mt-2">Usulan akan langsung diteruskan ke Bagian Perencanaan untuk verifikasi dan penyusunan RBA BLUD.</p>
                </div>
            `,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#059669',
            cancelButtonColor: '#64748b',
            confirmButtonText: confirmBtnText,
            cancelButtonText: 'Batal',
            reverseButtons: true,
        }).then((result) => {
            if (result.isConfirmed) {
                if (isEdit) {
                    put(route('requisitions.update', requisition.id), {
                        onSuccess: () => {
                            onClose();
                        },
                    });
                } else {
                    post(route('requisitions.store'), {
                        onSuccess: () => {
                            reset();
                            onClose();
                        },
                    });
                }
            }
        });
    };

    return (
        <Modal show={show} onClose={onClose} maxWidth="5xl">
            <div className="flex flex-col max-h-[92vh]">
                {/* Modal Header */}
                <div className="shrink-0 border-b border-emerald-100 bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 px-6 py-4 text-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-xl font-bold backdrop-blur-xs border border-white/20">
                                {isEdit ? '📝' : data.jenis_belanja === 'Modal' ? '🏢' : '⚡'}
                            </div>
                            <div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <h2 className="text-base sm:text-lg font-black tracking-tight">
                                        {isEdit
                                            ? `Ubah Usulan Belanja (${requisition?.requisition_number || 'E-BLUD'})`
                                            : `Formulir Tambah Usulan Belanja E-BLUD`}
                                    </h2>
                                    <span className="inline-flex items-center rounded-full bg-emerald-900/60 px-2.5 py-0.5 text-[11px] font-black border border-emerald-400/40 text-emerald-100">
                                        TA {data.fiscal_year} (1 Thn ke Depan)
                                    </span>
                                </div>
                                <p className="text-xs text-emerald-100/90 font-medium">
                                    RSJ Tampan Riau &bull; {unit?.name || 'Unit Kerja'} ({division?.name || 'Bidang'}) &bull; Sumber Dana 100% BLUD
                                </p>
                            </div>
                        </div>

                        {/* Close button */}
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl bg-white/10 p-2 text-white/80 hover:bg-white/20 hover:text-white transition cursor-pointer"
                            aria-label="Tutup Dialog"
                        >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Modal Body (Scrollable) */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
                    {errors.division && (
                        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-bold text-rose-700">
                            {errors.division}
                        </div>
                    )}

                    {/* SECTION 1: Identitas Dokumen & Sub Kegiatan */}
                    <div className="rounded-2xl border border-emerald-100 bg-white shadow-xs overflow-hidden">
                        <div className="border-b border-emerald-100/80 bg-gradient-to-r from-emerald-50/80 to-teal-50/30 px-5 py-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-emerald-600 text-white font-black text-xs">
                                    1
                                </span>
                                <h3 className="text-xs font-black uppercase tracking-wider text-emerald-950">
                                    Identitas Dokumen Pengajuan & Sub Kegiatan RS
                                </h3>
                            </div>
                            <span className="text-[11px] font-bold text-slate-500">Standar Telaahan Staf RSJ</span>
                        </div>

                        <div className="p-5 space-y-4">
                            {/* Baris Pengusul Info */}
                            <div className="rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-2.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
                                <div className="space-y-0.5">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-slate-800">
                                            {unit ? `${unit.name} (${unit.unit_code})` : 'Unit RSJ'}
                                        </span>
                                        <span className="text-slate-400">&bull;</span>
                                        <span className="text-slate-600 font-medium">
                                            {division?.name || 'Bidang RSJ'}
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-slate-500">
                                        Pemohon: <strong className="text-slate-700">{authUser?.name}</strong> {authUser?.nip ? `(NIP: ${authUser.nip})` : ''} - {authUser?.position || 'Staf / Kepala Unit'}
                                    </p>
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md border border-emerald-200 inline-block self-start sm:self-center">
                                    Terverifikasi BLUD
                                </span>
                            </div>

                            {/* Grid: Tahun Anggaran & Sub Kegiatan */}
                            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
                                <div>
                                    <label className="mb-1 block text-xs font-black uppercase tracking-wider text-slate-700">
                                        Tahun Anggaran Kebutuhan <span className="text-rose-600">*</span>
                                    </label>
                                    <select
                                        value={data.fiscal_year}
                                        onChange={(e) => setData('fiscal_year', e.target.value)}
                                        className="block w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs sm:text-sm font-black text-emerald-800 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                                    >
                                        <option value="2027">TA 2027 (Kebutuhan 1 Tahun ke Depan)</option>
                                        <option value="2026">TA 2026 (Tahun Berjalan / Pergeseran)</option>
                                        <option value="2028">TA 2028 (Perencanaan Jangka Menengah)</option>
                                    </select>
                                    {errors.fiscal_year && (
                                        <p className="mt-1 text-[11px] font-bold text-rose-600">{errors.fiscal_year}</p>
                                    )}
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="mb-1 block text-xs font-black uppercase tracking-wider text-slate-700">
                                        Sub Kegiatan Rumah Sakit <span className="text-rose-600">*</span>
                                    </label>
                                    <select
                                        value={data.sub_kegiatan}
                                        onChange={(e) => setData('sub_kegiatan', e.target.value)}
                                        className="block w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs sm:text-sm font-bold text-slate-800 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                                    >
                                        {subKegiatanOptions.map((sub, sIdx) => (
                                            <option key={sIdx} value={sub}>
                                                {sub}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.sub_kegiatan && (
                                        <p className="mt-1 text-[11px] font-bold text-rose-600">{errors.sub_kegiatan}</p>
                                    )}
                                </div>
                            </div>

                            {/* Grid: Nomor Nota Dinas & Urgensi */}
                            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
                                <div>
                                    <label className="mb-1 block text-xs font-black uppercase tracking-wider text-slate-700">
                                        Nomor Nota Dinas Unit (Opsional)
                                    </label>
                                    <input
                                        type="text"
                                        value={data.nomor_surat_unit}
                                        onChange={(e) => setData('nomor_surat_unit', e.target.value)}
                                        placeholder="Contoh: 020/FARM/RSJ/2026"
                                        className="block w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs sm:text-sm font-semibold text-slate-900 placeholder-slate-400 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                                    />
                                    {errors.nomor_surat_unit && (
                                        <p className="mt-1 text-[11px] font-bold text-rose-600">{errors.nomor_surat_unit}</p>
                                    )}
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="mb-1 block text-xs font-black uppercase tracking-wider text-slate-700">
                                        Latar Belakang & Urgensi Kebutuhan (Telaahan Staf)
                                    </label>
                                    <textarea
                                        rows={2}
                                        value={data.urgency_reason}
                                        onChange={(e) => setData('urgency_reason', e.target.value)}
                                        placeholder="Jelaskan alasan dan urgensi pengadaan barang ini untuk 1 tahun ke depan..."
                                        className="block w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs sm:text-sm font-medium text-slate-900 placeholder-slate-400 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                                    />
                                    {errors.urgency_reason && (
                                        <p className="mt-1 text-[11px] font-bold text-rose-600">{errors.urgency_reason}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 2: Klasifikasi & Rekening RBA */}
                    <div className="rounded-2xl border border-emerald-100 bg-white shadow-xs overflow-hidden">
                        <div className="border-b border-emerald-100/80 bg-gradient-to-r from-emerald-50/80 to-teal-50/30 px-5 py-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-emerald-600 text-white font-black text-xs">
                                    2
                                </span>
                                <h3 className="text-xs font-black uppercase tracking-wider text-emerald-950">
                                    Klasifikasi & Pos Kode Rekening Belanja BLUD
                                </h3>
                            </div>
                            <span className="text-[11px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                                RBA BLUD
                            </span>
                        </div>

                        <div className="p-5 space-y-4">
                            {/* Pilihan Jenis Belanja (Tabs/Toggle Buttons) */}
                            <div>
                                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5">
                                    Pilih Jenis Belanja BLUD <span className="text-rose-600">*</span>
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                    <button
                                        type="button"
                                        onClick={() => handleJenisChange('Operasi')}
                                        className={`flex items-start justify-between p-3 rounded-xl border-2 text-left transition cursor-pointer ${
                                            data.jenis_belanja === 'Operasi'
                                                ? 'border-emerald-500 bg-emerald-50/80 ring-1 ring-emerald-500 text-slate-900'
                                                : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                                        }`}
                                    >
                                        <div>
                                            <div className="flex items-center gap-1.5">
                                                <span className={`h-2.5 w-2.5 rounded-full ${data.jenis_belanja === 'Operasi' ? 'bg-emerald-600' : 'bg-slate-300'}`} />
                                                <span className="text-xs sm:text-sm font-black">1.1 Belanja Operasi BLUD</span>
                                            </div>
                                            <p className="mt-0.5 text-[11px] text-slate-500 pl-4 font-medium">
                                                Obat-obatan, BHP Medis, Reagen Lab, Bahan Makanan, Pelatihan/Diklit, Pemeliharaan Gedung/Alkes.
                                            </p>
                                        </div>
                                        {data.jenis_belanja === 'Operasi' && (
                                            <span className="text-emerald-700 font-bold text-[10px] bg-emerald-100 px-1.5 py-0.5 rounded-md">
                                                Dipilih
                                            </span>
                                        )}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => handleJenisChange('Modal')}
                                        className={`flex items-start justify-between p-3 rounded-xl border-2 text-left transition cursor-pointer ${
                                            data.jenis_belanja === 'Modal'
                                                ? 'border-purple-500 bg-purple-50/80 ring-1 ring-purple-500 text-slate-900'
                                                : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                                        }`}
                                    >
                                        <div>
                                            <div className="flex items-center gap-1.5">
                                                <span className={`h-2.5 w-2.5 rounded-full ${data.jenis_belanja === 'Modal' ? 'bg-purple-600' : 'bg-slate-300'}`} />
                                                <span className="text-xs sm:text-sm font-black">1.2 Belanja Modal BLUD</span>
                                            </div>
                                            <p className="mt-0.5 text-[11px] text-slate-500 pl-4 font-medium">
                                                Alat Kesehatan, Peralatan & Mesin (Komputer, Server, CCTV), Gedung & Sarana Pelayanan.
                                            </p>
                                        </div>
                                        {data.jenis_belanja === 'Modal' && (
                                            <span className="text-purple-700 font-bold text-[10px] bg-purple-100 px-1.5 py-0.5 rounded-md">
                                                Dipilih
                                            </span>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Dropdown Pos Kode Rekening Belanja RBA */}
                            <div>
                                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">
                                    Pos Kode Rekening Belanja RBA (BLUD) <span className="text-rose-600">*</span>
                                </label>
                                <select
                                    value={data.rba_account_id}
                                    onChange={(e) => handleAccountChange(e.target.value)}
                                    className="block w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs sm:text-sm font-bold text-slate-900 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                                >
                                    {accountsForJenis.map((acc) => (
                                        <option key={acc.id} value={acc.id}>
                                            [{acc.account_code}] {acc.account_name} &bull; Sisa Pagu: {formatRupiah(acc.remaining_budget)}
                                        </option>
                                    ))}
                                </select>
                                <p className="mt-1 text-[11px] text-slate-500 font-medium">
                                    Katalog barang otomatis disaring berdasarkan Pos Rekening: <strong className="text-emerald-800">[{selectedAccount?.account_code}] {selectedAccount?.account_name}</strong>
                                </p>
                                {errors.rba_account_id && (
                                    <p className="mt-1 text-[11px] font-bold text-rose-600">{errors.rba_account_id}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* SECTION 3: Rincian Barang yang Diusulkan */}
                    <div className="rounded-2xl border border-emerald-100 bg-white shadow-xs overflow-hidden">
                        <div className="border-b border-emerald-100/80 bg-gradient-to-r from-emerald-50/80 to-teal-50/30 px-5 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div className="flex items-center gap-2">
                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-emerald-600 text-white font-black text-xs">
                                    3
                                </span>
                                <div>
                                    <h3 className="text-xs font-black uppercase tracking-wider text-emerald-950">
                                        Rincian Kebutuhan Barang / Jasa (1 Tahun ke Depan)
                                    </h3>
                                    <p className="text-[11px] text-slate-500 mt-0.5">
                                        Tersedia {availableItems.length} item terstandarisasi untuk pos rekening ini.
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={addItemRow}
                                className="inline-flex items-center justify-center gap-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 text-xs font-bold shadow-2xs transition active:scale-95 cursor-pointer self-start sm:self-center"
                            >
                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                </svg>
                                Tambah Baris
                            </button>
                        </div>

                        <div className="p-5 space-y-3">
                            {errors.items && (
                                <p className="text-xs font-bold text-rose-600">{errors.items}</p>
                            )}

                            {data.items.map((row, index) => {
                                const currentItem = itemMap[row.item_id];
                                const rowQty = parseInt(row.quantity, 10) || 0;
                                const unitPrice = Number(currentItem?.standard_price || 0);
                                const rowSubtotal = unitPrice * rowQty;

                                return (
                                    <div
                                        key={index}
                                        className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 transition hover:border-emerald-300"
                                    >
                                        <div className="flex items-center justify-between border-b border-slate-200/70 pb-2 mb-2.5">
                                            <div className="flex items-center gap-2">
                                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-[10px] font-black text-slate-700">
                                                    {index + 1}
                                                </span>
                                                <span className="text-xs font-bold text-slate-700">
                                                    Item Usulan #{index + 1}
                                                </span>
                                            </div>

                                            {data.items.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeItemRow(index)}
                                                    className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 hover:text-rose-800 transition cursor-pointer"
                                                >
                                                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                                    </svg>
                                                    Hapus
                                                </button>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                                            {/* Pilih Barang */}
                                            <div className="sm:col-span-6">
                                                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                                    Pilih Barang dari Katalog BLUD <span className="text-rose-500">*</span>
                                                </label>
                                                <select
                                                    value={row.item_id}
                                                    onChange={(e) => updateItemRow(index, 'item_id', e.target.value)}
                                                    className="block w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                                                >
                                                    <option value="">-- Pilih Barang / Item --</option>
                                                    {availableItems.map((it) => (
                                                        <option key={it.id} value={it.id}>
                                                            {it.name} &bull; ({it.unit_type}) &bull; {formatRupiah(it.standard_price)}
                                                        </option>
                                                    ))}
                                                </select>
                                                {currentItem?.specification && (
                                                    <p className="mt-0.5 text-[10px] text-slate-500 truncate">
                                                        Spek: {currentItem.specification}
                                                    </p>
                                                )}
                                                {errors[`items.${index}.item_id`] && (
                                                    <p className="mt-0.5 text-[10px] font-bold text-rose-600">
                                                        {errors[`items.${index}.item_id`]}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Satuan */}
                                            <div className="sm:col-span-2">
                                                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                                    Satuan
                                                </label>
                                                <div className="flex h-8.5 items-center justify-center rounded-lg border border-slate-200 bg-slate-100 text-xs font-bold text-slate-700">
                                                    {currentItem?.unit_type || '-'}
                                                </div>
                                            </div>

                                            {/* Volume / Kuantitas */}
                                            <div className="sm:col-span-2">
                                                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                                    Volume <span className="text-rose-500">*</span>
                                                </label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={row.quantity}
                                                    onChange={(e) => updateItemRow(index, 'quantity', e.target.value)}
                                                    placeholder="Qty"
                                                    className="block w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs font-black text-center text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                                                />
                                                {errors[`items.${index}.quantity`] && (
                                                    <p className="mt-0.5 text-[10px] font-bold text-rose-600">
                                                        {errors[`items.${index}.quantity`]}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Subtotal */}
                                            <div className="sm:col-span-2">
                                                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                                    Subtotal (Rp)
                                                </label>
                                                <div className="flex h-8.5 items-center justify-end pr-2.5 rounded-lg border border-emerald-200 bg-emerald-50/50 text-xs font-black text-emerald-900">
                                                    {formatRupiah(rowSubtotal)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </form>

                {/* Modal Footer */}
                <div className="shrink-0 border-t-2 border-slate-200 bg-gradient-to-r from-slate-50 via-emerald-50/40 to-slate-50 px-6 py-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                                <span>TA {data.fiscal_year}</span>
                                <span>&bull;</span>
                                <span>{data.items.length} macam barang</span>
                                <span>&bull;</span>
                                <span>Total Volume: {totalQuantity} unit</span>
                            </div>
                            <div className="flex items-baseline gap-2 mt-0.5">
                                <span className="text-xs font-bold text-slate-500">Estimasi Total:</span>
                                <span className="text-xl sm:text-2xl font-black text-emerald-800">
                                    {formatRupiah(grandTotal)}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2.5 self-end sm:self-center">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={processing}
                                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-100 transition cursor-pointer"
                            >
                                Batal
                            </button>

                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={processing || grandTotal <= 0}
                                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 px-5 py-2 text-xs font-black text-white shadow-md transition disabled:opacity-50 cursor-pointer"
                            >
                                {processing ? (
                                    <>
                                        <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Menyimpan...
                                    </>
                                ) : (
                                    <>
                                        <span>{isEdit ? 'Simpan Perubahan' : 'Kirim Usulan ke Perencanaan'}</span>
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                        </svg>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
