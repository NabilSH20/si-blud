import Modal from '@/Components/Modal';
import { useForm, usePage } from '@inertiajs/react';
import { useState, useEffect, useMemo } from 'react';
import Swal from 'sweetalert2';

const LEVEL_LABELS = [
    '1. Kelompok Belanja BLUD',
    '2. Sub-Kelompok Belanja',
    '3. Objek Pos Rekening Belanja',
    '4. Rincian / Sub-Objek Belanja',
    '5. Detail Rekening Akhir',
];

const formatRupiah = (value) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(Number(value || 0));

const COMMON_UNITS = [
    'Pcs',
    'Box',
    'Botol',
    'Roll',
    'Tablet',
    'Ampul',
    'Unit',
    'Set',
    'Pak',
    'Rim',
    'Lembar',
    'Vial',
    'Galon',
    'Dus',
    'Lusin',
    'Pasang',
    'Meter',
    'Kg',
    'Liter',
];

const createEmptyItem = (isNew = false) => ({
    item_id: '',
    is_new: isNew,
    name: '',
    unit_type: 'Pcs',
    specification: '',
    unit_price: '',
    quantity: 1,
});

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
    defaultFiscalYear,
}) {
    const isEdit = Boolean(requisition && requisition.id);
    const { auth, active_year } = usePage().props;
    const authUser = auth?.user;
    const resolvedYear = defaultFiscalYear || active_year || 2026;
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
        budget_year: resolvedYear,
        fiscal_year: resolvedYear,
        sub_kegiatan: subKegiatanOptions[0] || 'Pelayanan dan Penunjang Pelayanan BLUD RS Jiwa Tampan',
        nomor_surat_unit: '',
        urgency_reason: '',
        items: [createEmptyItem(false)],
    });

    // Helper to find children of a given parentCode
    const getChildren = (parentCode) => {
        return rbaAccounts.filter((acc) => {
            if (acc.parent_code) {
                return acc.parent_code === parentCode;
            }
            if (acc.account_code && acc.account_code.startsWith(parentCode + '.')) {
                const rem = acc.account_code.slice(parentCode.length + 1);
                return !rem.includes('.');
            }
            return false;
        });
    };

    // Helper to find ancestor path from a leaf account_code
    const getAncestorPath = (leafCode) => {
        const path = [];
        let curr = rbaAccounts.find((a) => a.account_code === leafCode);
        while (curr) {
            path.unshift(curr.account_code);
            const parentCode =
                curr.parent_code ||
                (curr.account_code.includes('.')
                    ? curr.account_code.substring(0, curr.account_code.lastIndexOf('.'))
                    : null);
            if (!parentCode || parentCode === '1.1' || parentCode === '1.2' || parentCode === '1') {
                break;
            }
            curr = rbaAccounts.find((a) => a.account_code === parentCode);
        }
        return path;
    };

    // Helper to generate default initial path for a given jenis_belanja
    const getDefaultPathForJenis = (jenis) => {
        const rootCode = jenis === 'Modal' ? '1.2' : '1.1';
        const defaultPath = [];
        let currParent = rootCode;
        while (currParent) {
            const children = getChildren(currParent);
            if (children.length > 0) {
                let next = children[0];
                if (currParent === '1.1') {
                    const opt112 = children.find((c) => c.account_code === '1.1.2');
                    if (opt112) next = opt112;
                } else if (currParent === '1.2') {
                    const opt121 = children.find((c) => c.account_code === '1.2.1');
                    if (opt121) next = opt121;
                } else if (currParent === '1.2.1') {
                    const opt1212 = children.find((c) => c.account_code === '1.2.1.2');
                    if (opt1212) next = opt1212;
                }
                defaultPath.push(next.account_code);
                currParent = next.account_code;
            } else {
                break;
            }
        }
        return defaultPath;
    };

    // Cascading path of selected account codes: e.g. ['1.1.2', '1.1.2.1', '1.1.2.1.2', '1.1.2.1.2.1']
    const [selectedPath, setSelectedPath] = useState([]);

    // Populate or reset form whenever modal opens or active requisition changes
    useEffect(() => {
        if (!show) {
            clearErrors();
            return;
        }

        if (requisition) {
            const yr = requisition.budget_year || requisition.fiscal_year || resolvedYear;
            const targetAcc = rbaAccounts.find((a) => String(a.id) === String(requisition.rba_account_id));
            if (targetAcc) {
                setSelectedPath(getAncestorPath(targetAcc.account_code));
            } else {
                setSelectedPath([]);
            }

            setData({
                jenis_belanja: requisition.jenis_belanja || 'Operasi',
                rba_account_id: requisition.rba_account_id || '',
                budget_year: yr,
                fiscal_year: yr,
                sub_kegiatan: requisition.sub_kegiatan || subKegiatanOptions[0] || '',
                nomor_surat_unit: requisition.nomor_surat_unit || '',
                urgency_reason: requisition.urgency_reason || '',
                items: requisition.requisition_details?.length
                    ? requisition.requisition_details.map((d) => ({
                          item_id: d.item_id || '',
                          is_new: false,
                          name: d.item?.name || d.item_name || '',
                          unit_type: d.item?.unit_type || d.unit_type || 'Pcs',
                          specification: d.item?.specification || d.specification || '',
                          unit_price:
                              d.unit_price !== null && d.unit_price !== undefined
                                  ? Number(d.unit_price)
                                  : d.item?.standard_price
                                  ? Number(d.item.standard_price)
                                  : '',
                          quantity: d.quantity_requested || 1,
                      }))
                    : [createEmptyItem(false)],
            });
        } else {
            const currentJenis = initialJenis || 'Operasi';
            const defaultPath = getDefaultPathForJenis(currentJenis);
            const leafCode = defaultPath[defaultPath.length - 1];
            const leafAcc = leafCode ? rbaAccounts.find((a) => a.account_code === leafCode) : null;

            setSelectedPath(defaultPath);
            setData({
                jenis_belanja: currentJenis,
                rba_account_id: leafAcc ? leafAcc.id : '',
                budget_year: resolvedYear,
                fiscal_year: resolvedYear,
                sub_kegiatan: subKegiatanOptions[0] || 'Pelayanan dan Penunjang Pelayanan BLUD RS Jiwa Tampan',
                nomor_surat_unit: '',
                urgency_reason: '',
                items: [createEmptyItem(false)],
            });
        }
        clearErrors();
    }, [show, requisition, initialJenis, resolvedYear, rbaAccounts]);

    // Switch jenis_belanja (1.1 Belanja Operasi vs 1.2 Belanja Modal)
    const handleJenisChange = (newJenis) => {
        const defaultPath = getDefaultPathForJenis(newJenis);
        const leafCode = defaultPath[defaultPath.length - 1];
        const leafAcc = leafCode ? rbaAccounts.find((a) => a.account_code === leafCode) : null;

        setSelectedPath(defaultPath);
        setData((prev) => ({
            ...prev,
            jenis_belanja: newJenis,
            rba_account_id: leafAcc ? leafAcc.id : '',
            items: [createEmptyItem(false)],
        }));
    };

    // Handle cascading change at any depth
    const handleCascadeChange = (depth, newCode) => {
        const newPath = [...selectedPath.slice(0, depth)];
        if (newCode) {
            newPath.push(newCode);
            // Auto-advance through single-child levels
            let curr = newCode;
            while (curr) {
                const nextChildren = getChildren(curr);
                if (nextChildren.length === 1) {
                    curr = nextChildren[0].account_code;
                    newPath.push(curr);
                } else {
                    break;
                }
            }
        }
        setSelectedPath(newPath);

        const leafCode = newPath[newPath.length - 1];
        const isLeaf = leafCode && getChildren(leafCode).length === 0;
        if (isLeaf) {
            const acc = rbaAccounts.find((a) => a.account_code === leafCode);
            if (acc) {
                setData((prev) => ({
                    ...prev,
                    rba_account_id: acc.id,
                    items: [createEmptyItem(false)],
                }));
            }
        } else {
            setData((prev) => ({
                ...prev,
                rba_account_id: '',
                items: [createEmptyItem(false)],
            }));
        }
    };

    // Build dynamic cascading levels from selectedPath
    const cascadeLevels = useMemo(() => {
        const rootCode = data.jenis_belanja === 'Modal' ? '1.2' : '1.1';
        const levels = [];
        let currentParent = rootCode;
        let depth = 0;

        while (currentParent) {
            const children = getChildren(currentParent);
            if (children.length === 0) {
                break;
            }

            const currentVal = selectedPath[depth] || '';
            levels.push({
                depth,
                parentCode: currentParent,
                options: children,
                selectedValue: currentVal,
            });

            if (currentVal && children.some((c) => c.account_code === currentVal)) {
                currentParent = currentVal;
                depth++;
            } else {
                break;
            }
        }

        return levels;
    }, [data.jenis_belanja, selectedPath, rbaAccounts]);

    // Active selected RBA Account info
    const selectedAccount = useMemo(() => {
        return rbaAccounts.find((acc) => String(acc.id) === String(data.rba_account_id));
    }, [rbaAccounts, data.rba_account_id]);

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

    // Handle selection from dropdown
    const handleItemSelect = (index, selectedVal) => {
        if (selectedVal === '__NEW__') {
            const newItems = [...data.items];
            newItems[index] = {
                ...newItems[index],
                is_new: true,
                item_id: '',
                name: '',
                unit_type: 'Pcs',
                specification: '',
                unit_price: '',
            };
            setData('items', newItems);
            return;
        }

        const it = itemMap[selectedVal];
        const newItems = [...data.items];
        newItems[index] = {
            ...newItems[index],
            is_new: false,
            item_id: selectedVal,
            name: it?.name || '',
            unit_type: it?.unit_type || 'Pcs',
            specification: it?.specification || '',
            unit_price: it ? Number(it.standard_price || 0) : '',
        };
        setData('items', newItems);
    };

    // Toggle row between Catalog and Manual mode
    const toggleRowMode = (index, isNew) => {
        const newItems = [...data.items];
        if (isNew) {
            newItems[index] = {
                ...newItems[index],
                is_new: true,
                item_id: '',
                name: '',
                unit_type: newItems[index].unit_type || 'Pcs',
                specification: '',
                unit_price: '',
            };
        } else {
            newItems[index] = {
                ...newItems[index],
                is_new: false,
                item_id: '',
                name: '',
                unit_type: 'Pcs',
                specification: '',
                unit_price: '',
            };
        }
        setData('items', newItems);
    };

    // Update specific row field
    const updateItemRow = (index, field, value) => {
        const newItems = [...data.items];
        newItems[index] = {
            ...newItems[index],
            [field]: value,
        };
        setData('items', newItems);
    };

    // Add new row (catalog or new item)
    const addItemRow = (isNew = false) => {
        setData('items', [
            ...data.items,
            createEmptyItem(isNew),
        ]);
    };

    // Remove row
    const removeItemRow = (index) => {
        if (data.items.length <= 1) return;
        const newItems = data.items.filter((_, idx) => idx !== index);
        setData('items', newItems);
    };

    // Totals calculation
    const { grandTotal, totalQuantity, newItemsCount } = useMemo(() => {
        let sum = 0;
        let totalQty = 0;
        let newCount = 0;
        data.items.forEach((row) => {
            const qty = parseInt(row.quantity, 10) || 0;
            const price = parseFloat(row.unit_price) || 0;
            if (qty > 0 && price > 0) {
                sum += price * qty;
                totalQty += qty;
            }
            if (row.is_new) {
                newCount++;
            }
        });
        return { grandTotal: sum, totalQuantity: totalQty, newItemsCount: newCount };
    }, [data.items]);

    // Handle form submit
    const handleSubmit = (e) => {
        e.preventDefault();

        // Detailed validation for each row
        let invalidMsg = null;
        for (let i = 0; i < data.items.length; i++) {
            const row = data.items[i];
            const qty = parseInt(row.quantity, 10);
            const price = parseFloat(row.unit_price);

            if (row.is_new) {
                if (!row.name || !row.name.trim()) {
                    invalidMsg = `Baris #${i + 1}: Nama barang baru belum diisi.`;
                    break;
                }
                if (!row.unit_type || !row.unit_type.trim()) {
                    invalidMsg = `Baris #${i + 1}: Satuan barang baru belum diisi.`;
                    break;
                }
                if (isNaN(price) || price <= 0) {
                    invalidMsg = `Baris #${i + 1}: Harga satuan barang baru harus lebih dari 0.`;
                    break;
                }
            } else {
                if (!row.item_id) {
                    invalidMsg = `Baris #${i + 1}: Silakan pilih barang dari katalog atau gunakan opsi input barang baru.`;
                    break;
                }
                if (isNaN(price) || price < 0) {
                    invalidMsg = `Baris #${i + 1}: Harga satuan tidak boleh kosong.`;
                    break;
                }
            }

            if (isNaN(qty) || qty < 1) {
                invalidMsg = `Baris #${i + 1}: Volume barang minimal 1 unit.`;
                break;
            }
        }

        if (invalidMsg) {
            Swal.fire({
                icon: 'warning',
                title: 'Data Belum Lengkap',
                text: invalidMsg,
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
                    <p><strong>Jumlah Barang:</strong> ${data.items.length} macam (${totalQuantity} unit)${newItemsCount > 0 ? ` <span class="text-amber-700 font-bold">(${newItemsCount} barang baru akan didaftarkan ke katalog)</span>` : ''}</p>
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
                                        Tahun Anggaran <span className="text-rose-600">*</span>
                                    </label>
                                    <select
                                        value={data.budget_year || data.fiscal_year}
                                        onChange={(e) => {
                                            const y = parseInt(e.target.value, 10);
                                            setData((prev) => ({ ...prev, budget_year: y, fiscal_year: y }));
                                        }}
                                        className="block w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs sm:text-sm font-black text-emerald-800 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                                    >
                                        <option value="2026">TA 2026</option>
                                        <option value="2027">TA 2027</option>
                                        <option value="2028">TA 2028</option>
                                    </select>
                                    {(errors.budget_year || errors.fiscal_year) && (
                                        <p className="mt-1 text-[11px] font-bold text-rose-600">{errors.budget_year || errors.fiscal_year}</p>
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

                            {/* Cascading Selector Pos Kode Rekening Belanja RBA */}
                            <div className="space-y-3">
                                <div
                                    className={`grid grid-cols-1 ${
                                        cascadeLevels.length === 2
                                            ? 'md:grid-cols-2'
                                            : cascadeLevels.length === 3
                                            ? 'md:grid-cols-3'
                                            : 'sm:grid-cols-2 lg:grid-cols-4'
                                    } gap-3.5`}
                                >
                                    {cascadeLevels.map((lvl) => {
                                        const labelText = LEVEL_LABELS[lvl.depth] || `${lvl.depth + 1}. Sub-Rekening Belanja`;
                                        return (
                                            <div key={`cascade-lvl-${lvl.depth}-${lvl.parentCode}`}>
                                                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">
                                                    {labelText} <span className="text-rose-600">*</span>
                                                </label>
                                                <select
                                                    value={lvl.selectedValue}
                                                    onChange={(e) => handleCascadeChange(lvl.depth, e.target.value)}
                                                    className="block w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs sm:text-sm font-bold text-slate-900 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 shadow-2xs"
                                                >
                                                    <option value="">-- Pilih {labelText} --</option>
                                                    {lvl.options.map((opt) => {
                                                        const hasChildren = getChildren(opt.account_code).length > 0;
                                                        return (
                                                            <option key={opt.id} value={opt.account_code}>
                                                                [{opt.account_code}] {opt.account_name}{' '}
                                                                {hasChildren
                                                                    ? '➔ (Punya Sub-Akun)'
                                                                    : opt.remaining_budget !== undefined
                                                                    ? `• Sisa: ${formatRupiah(opt.remaining_budget)}`
                                                                    : ''}
                                                            </option>
                                                        );
                                                    })}
                                                </select>
                                                <p className="mt-1 text-[11px] text-slate-500">
                                                    {getChildren(lvl.selectedValue).length > 0
                                                        ? 'Memiliki rincian sub-rekening lanjutan di bawah'
                                                        : lvl.selectedValue
                                                        ? 'Pos rekening definitif akhir'
                                                        : 'Pilih opsi untuk menentukan alokasi beban belanja'}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Incomplete Cascade Hint (if user has selected intermediate category but not leaf) */}
                                {!data.rba_account_id && (
                                    <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3 flex items-start gap-2.5 text-xs text-amber-900">
                                        <span className="text-base leading-none mt-0.5">ℹ️</span>
                                        <div>
                                            <span className="font-bold">Lanjutkan pemilihan sub-rekening definitif:</span>
                                            <p className="text-[11px] text-amber-800 mt-0.5 font-medium">
                                                Pos rekening yang dipilih memiliki sub-rekening turunan. Silakan pilih opsi pada dropdown tingkat berikutnya hingga mencapai akun rincian akhir untuk membebankan anggaran dan menampilkan katalog barang.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Active Leaf Account Badge & Budget Summary */}
                                {selectedAccount && (
                                    <div className="rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50/60 p-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
                                        <div className="space-y-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="font-black text-emerald-950 text-sm">
                                                    [{selectedAccount.account_code}] {selectedAccount.account_name}
                                                </span>
                                                <span className="rounded-md bg-emerald-200/90 px-2 py-0.5 text-[10px] font-black text-emerald-900 uppercase">
                                                    {selectedAccount.kategori_belanja}
                                                </span>
                                                <span className="rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300/60 px-2 py-0.5 text-[10px] font-bold">
                                                    Akun Definitif Terpilih ✅
                                                </span>
                                            </div>
                                            <p className="text-[11px] text-emerald-700 font-medium">
                                                Katalog barang dan pagu anggaran di bawah otomatis tersinkronisasi khusus untuk rekening ini.
                                            </p>
                                        </div>
                                        <div className="text-right sm:border-l sm:border-emerald-200/80 sm:pl-4 shrink-0">
                                            <span className="text-[10px] uppercase font-bold text-emerald-700 block">Sisa Pagu Rekening</span>
                                            <span className="text-base font-black text-emerald-950">
                                                {formatRupiah(selectedAccount.remaining_budget)}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {errors.rba_account_id && (
                                    <p className="text-[11px] font-bold text-rose-600">{errors.rba_account_id}</p>
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
                                        Tersedia {availableItems.length} item terstandarisasi untuk pos rekening ini. Pengusul dapat memilih katalog atau input barang baru secara manual.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 self-start sm:self-center">
                                <button
                                    type="button"
                                    onClick={() => addItemRow(false)}
                                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 px-3 py-1.5 text-xs font-bold shadow-2xs transition active:scale-95 cursor-pointer"
                                >
                                    <svg className="h-3.5 w-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                    </svg>
                                    + Baris Katalog
                                </button>

                                <button
                                    type="button"
                                    onClick={() => addItemRow(true)}
                                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-3 py-1.5 text-xs font-bold shadow-2xs transition active:scale-95 cursor-pointer"
                                >
                                    <span>✨</span>
                                    + Input Barang Baru
                                </button>
                            </div>
                        </div>

                        <div className="p-5 space-y-3">
                            {errors.items && (
                                <p className="text-xs font-bold text-rose-600">{errors.items}</p>
                            )}

                            {data.items.map((row, index) => {
                                const currentItem = itemMap[row.item_id];
                                const rowQty = parseInt(row.quantity, 10) || 0;
                                const unitPrice = parseFloat(row.unit_price) || 0;
                                const rowSubtotal = unitPrice * rowQty;
                                const isPriceAdjusted =
                                    !row.is_new &&
                                    currentItem &&
                                    Math.abs(Number(row.unit_price) - Number(currentItem.standard_price)) > 0.01;

                                return (
                                    <div
                                        key={index}
                                        className={`rounded-xl border p-3.5 transition ${
                                            row.is_new
                                                ? 'border-amber-300 bg-amber-50/30'
                                                : 'border-slate-200 bg-slate-50/60 hover:border-emerald-300'
                                        }`}
                                    >
                                        {/* Header Baris */}
                                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 pb-2 mb-2.5">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span
                                                    className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black ${
                                                        row.is_new
                                                            ? 'bg-amber-200 text-amber-900'
                                                            : 'bg-slate-200 text-slate-700'
                                                    }`}
                                                >
                                                    {index + 1}
                                                </span>
                                                <span className="text-xs font-bold text-slate-700">
                                                    Item Usulan #{index + 1}
                                                </span>

                                                {row.is_new ? (
                                                    <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 text-amber-800 text-[10px] font-black px-2 py-0.5 border border-amber-200">
                                                        ✨ Barang Baru (Manual)
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center rounded-md bg-slate-200/80 text-slate-700 text-[10px] font-bold px-2 py-0.5">
                                                        Katalog BLUD
                                                    </span>
                                                )}

                                                <span className="text-slate-300">&bull;</span>

                                                {row.is_new ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleRowMode(index, false)}
                                                        className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 hover:underline cursor-pointer"
                                                    >
                                                        &larr; Pilih dari Katalog yang Ada
                                                    </button>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleRowMode(index, true)}
                                                        className="text-[11px] font-bold text-amber-700 hover:text-amber-900 hover:underline cursor-pointer"
                                                    >
                                                        ✨ Barang tidak ada di katalog? Input Manual
                                                    </button>
                                                )}
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

                                        {/* Konten Baris */}
                                        {row.is_new ? (
                                            /* FORM BARANG BARU (MANUAL) */
                                            <div className="space-y-3 pt-1">
                                                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                                                    <div className="sm:col-span-8">
                                                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                                            Nama Barang Baru <span className="text-rose-500">*</span>
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={row.name}
                                                            onChange={(e) => updateItemRow(index, 'name', e.target.value)}
                                                            placeholder="Contoh: Kassa Steril 16x16 Onemed"
                                                            className="block w-full rounded-lg border border-amber-300 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-900 focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                                                        />
                                                        {errors[`items.${index}.name`] && (
                                                            <p className="mt-0.5 text-[10px] font-bold text-rose-600">
                                                                {errors[`items.${index}.name`]}
                                                            </p>
                                                        )}
                                                    </div>

                                                    <div className="sm:col-span-4">
                                                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                                            Satuan <span className="text-rose-500">*</span>
                                                        </label>
                                                        <div className="flex gap-1.5">
                                                            <select
                                                                value={COMMON_UNITS.includes(row.unit_type) ? row.unit_type : 'Lainnya'}
                                                                onChange={(e) => {
                                                                    if (e.target.value === 'Lainnya') {
                                                                        updateItemRow(index, 'unit_type', '');
                                                                    } else {
                                                                        updateItemRow(index, 'unit_type', e.target.value);
                                                                    }
                                                                }}
                                                                className="block w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                                                            >
                                                                {COMMON_UNITS.map((u) => (
                                                                    <option key={u} value={u}>
                                                                        {u}
                                                                    </option>
                                                                ))}
                                                                <option value="Lainnya">Lainnya...</option>
                                                            </select>
                                                            {!COMMON_UNITS.includes(row.unit_type) && (
                                                                <input
                                                                    type="text"
                                                                    value={row.unit_type}
                                                                    onChange={(e) => updateItemRow(index, 'unit_type', e.target.value)}
                                                                    placeholder="Ketik Satuan"
                                                                    className="w-28 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs font-bold text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                                                                />
                                                            )}
                                                        </div>
                                                        {errors[`items.${index}.unit_type`] && (
                                                            <p className="mt-0.5 text-[10px] font-bold text-rose-600">
                                                                {errors[`items.${index}.unit_type`]}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                                        Spesifikasi / Merk / Ukuran / Kemasan (Opsional)
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={row.specification}
                                                        onChange={(e) => updateItemRow(index, 'specification', e.target.value)}
                                                        placeholder="Contoh: Kassa steril isi 10 pouch per box, terdaftar Kemenkes RI..."
                                                        className="block w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                                                    />
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end pt-1">
                                                    <div className="sm:col-span-5">
                                                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                                            Harga Satuan Estimasi (Rp) <span className="text-rose-500">*</span>
                                                        </label>
                                                        <div className="relative rounded-lg shadow-2xs">
                                                            <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 text-xs font-bold text-slate-400">
                                                                Rp
                                                            </span>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                step="any"
                                                                value={row.unit_price}
                                                                onChange={(e) => updateItemRow(index, 'unit_price', e.target.value)}
                                                                placeholder="0"
                                                                className="block w-full rounded-lg border border-slate-300 bg-white pl-8 pr-2 py-1.5 text-xs font-bold text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="sm:col-span-3">
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
                                                    </div>

                                                    <div className="sm:col-span-4">
                                                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                                            Subtotal (Rp)
                                                        </label>
                                                        <div className="flex h-8.5 items-center justify-end pr-2.5 rounded-lg border border-emerald-200 bg-emerald-50/70 text-xs font-black text-emerald-900">
                                                            {formatRupiah(rowSubtotal)}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-1.5 text-[11px] text-emerald-800 bg-emerald-50/80 px-2.5 py-1.5 rounded-lg border border-emerald-200/60">
                                                    <span>💡</span>
                                                    <span>
                                                        Barang baru ini otomatis didaftarkan ke Master Data Barang untuk Pos Rekening ini setelah usulan disimpan.
                                                    </span>
                                                </div>
                                            </div>
                                        ) : (
                                            /* FORM PILIH DARI KATALOG BLUD */
                                            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                                                {/* Pilih Barang */}
                                                <div className="sm:col-span-5">
                                                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                                        Pilih Barang dari Katalog BLUD <span className="text-rose-500">*</span>
                                                    </label>
                                                    <select
                                                        value={row.item_id}
                                                        onChange={(e) => handleItemSelect(index, e.target.value)}
                                                        className="block w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                                                    >
                                                        <option value="">-- Pilih Barang / Item --</option>
                                                        <option value="__NEW__">✨ + Input Barang Baru Secara Manual...</option>
                                                        {availableItems.map((it) => (
                                                            <option key={it.id} value={it.id}>
                                                                {it.name} &bull; ({it.unit_type}) &bull; {formatRupiah(it.standard_price)}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    {currentItem?.specification && (
                                                        <p className="mt-0.5 text-[10px] text-slate-500 truncate" title={currentItem.specification}>
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
                                                        {currentItem?.unit_type || row.unit_type || '-'}
                                                    </div>
                                                </div>

                                                {/* Harga Satuan (DAPAT DIEDIT!) */}
                                                <div className="sm:col-span-2">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <label className="text-[11px] font-bold text-slate-700">
                                                            Harga (Rp) <span className="text-rose-500">*</span>
                                                        </label>
                                                        {isPriceAdjusted && (
                                                            <button
                                                                type="button"
                                                                onClick={() => updateItemRow(index, 'unit_price', currentItem.standard_price)}
                                                                className="text-[9px] text-amber-700 hover:text-amber-900 font-bold underline cursor-pointer"
                                                                title="Reset ke harga standar katalog"
                                                            >
                                                                Reset
                                                            </button>
                                                        )}
                                                    </div>
                                                    <div className="relative rounded-lg shadow-2xs">
                                                        <span className="absolute inset-y-0 left-0 flex items-center pl-2 text-[11px] font-bold text-slate-400">
                                                            Rp
                                                        </span>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            step="any"
                                                            value={row.unit_price}
                                                            onChange={(e) => updateItemRow(index, 'unit_price', e.target.value)}
                                                            placeholder="0"
                                                            className={`block w-full rounded-lg border pl-7 pr-1.5 py-1.5 text-xs font-bold text-slate-900 focus:ring-1 ${
                                                                isPriceAdjusted
                                                                    ? 'border-amber-400 bg-amber-50/50 focus:border-amber-500 focus:ring-amber-500'
                                                                    : 'border-slate-300 bg-white focus:border-emerald-500 focus:ring-emerald-500'
                                                            }`}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Volume */}
                                                <div className="sm:col-span-1">
                                                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                                        Vol <span className="text-rose-500">*</span>
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={row.quantity}
                                                        onChange={(e) => updateItemRow(index, 'quantity', e.target.value)}
                                                        placeholder="Qty"
                                                        className="block w-full rounded-lg border border-slate-300 bg-white px-1.5 py-1.5 text-xs font-black text-center text-slate-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                                                    />
                                                </div>

                                                {/* Subtotal */}
                                                <div className="sm:col-span-2">
                                                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                                        Subtotal (Rp)
                                                    </label>
                                                    <div className="flex h-8.5 items-center justify-end pr-2 rounded-lg border border-emerald-200 bg-emerald-50/50 text-xs font-black text-emerald-900">
                                                        {formatRupiah(rowSubtotal)}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Notice jika harga diedit */}
                                        {isPriceAdjusted && (
                                            <div className="mt-2 flex items-center justify-between text-[10px] text-amber-800 bg-amber-100/70 px-2 py-1 rounded-md border border-amber-200">
                                                <span className="font-semibold">
                                                    ⚠️ Harga disesuaikan dari standar katalog: <span className="line-through">{formatRupiah(currentItem.standard_price)}</span> &rarr; <strong>{formatRupiah(row.unit_price)}</strong>
                                                </span>
                                                <span className="text-amber-700 font-medium">Harga master katalog akan diperbarui</span>
                                            </div>
                                        )}
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
