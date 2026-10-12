import Modal from '@/Components/Modal';
import { useForm, usePage } from '@inertiajs/react';
import { useState, useEffect, useMemo, useRef } from 'react';

import { ClipboardList, AlertTriangle, X, Search, Plus, Trash2, ShoppingBag } from 'lucide-react';

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
    'Unit',
    'Roll',
    'Set',
    'Kit',
    'Kg',
    'Liter',
    'Lembar',
    'Rim',
    'Strip',
    'Vial',
    'Ampul',
    'Pack',
    'Tablet',
    'Kapsul',
    'Bungkus',
    'Kotak',
    'Helai',
    'Pasang',
    'Meter',
    'Jirigen',
    'Dug',
    'Bag',
];

export default function RequisitionFormModal({
    show = false,
    onClose = () => { },
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
    const resolvedYear = active_year || defaultFiscalYear || 2026;
    const division = userDivision || authUser?.division;
    const unit = userUnit || authUser?.unit;

    // Sub Kegiatan Cerdas (Smart-Default)
    const smartDefaultSub = useMemo(() => {
        const uName = unit?.name || division?.name || '';
        if (uName) {
            const cleanName = uName.replace(/instalasi|bagian|sub bagian|bidang|unit/gi, '').trim().toUpperCase();
            return `PELAYANAN ${cleanName} ${resolvedYear}`;
        }
        return `PELAYANAN KESEHATAN ${resolvedYear}`;
    }, [unit, division, resolvedYear]);

    // Smart-Default Tolok Ukur Kinerja RBA
    const unitDisplayName = unit?.name || division?.name || 'Unit Pelayanan';
    const smartDefaultOutput = useMemo(() => {
        return `1. Terpenuhinya kebutuhan barang/bahan penunjang pelayanan ${unitDisplayName}\n2. Kelancaran kegiatan administrasi dan pelayanan operasional`;
    }, [unitDisplayName]);

    const smartDefaultOutcome = useMemo(() => {
        return `1. Terlaksananya pelayanan pasien secara bermutu dan tepat waktu sesuai standar SPM\n2. Meningkatnya kepuasan pelanggan terhadap pelayanan RS Jiwa Tampan`;
    }, []);

    // Form State Inertia
    const { data, setData, post, put, processing, reset } = useForm({
        jenis_belanja: 'Operasi',
        rba_account_id: '',
        budget_year: resolvedYear,
        fiscal_year: resolvedYear,
        program: 'Program Peningkatan Pelayanan Kesehatan Pada BLUD',
        kegiatan: '1. Pelayanan Kesehatan',
        sub_kegiatan: smartDefaultSub,
        tolok_ukur_output: smartDefaultOutput,
        target_output: '100%',
        tolok_ukur_outcome: smartDefaultOutcome,
        target_outcome: '100%',
        nomor_surat_unit: '',
        urgency_reason: '',
        items: [],
    });

    // -------------------------------------------------------------
    // 3. KLASIFIKASI KODE REKENING (100% DINAMIS DARI DATABASE)
    // -------------------------------------------------------------
    const [selectedKategori, setSelectedKategori] = useState(
        initialJenis === 'Modal' ? 'Modal' : 'Operasi'
    );
    const [accountSearchQuery, setAccountSearchQuery] = useState('');
    const [selectedRincianObjekId, setSelectedRincianObjekId] = useState('');

    // Identifikasi akun yang memiliki child (header/induk) vs akun daun (leaf/transaksi)
    const parentCodeSet = useMemo(() => {
        return new Set(rbaAccounts.map((a) => a.parent_code).filter(Boolean));
    }, [rbaAccounts]);

    // Map account_code ke objek akun untuk lookup nama induk (parent) secara cepat
    const accountByCodeMap = useMemo(() => {
        const map = new Map();
        rbaAccounts.forEach((a) => {
            if (a.account_code) map.set(a.account_code, a);
        });
        return map;
    }, [rbaAccounts]);

    // Akun transaksi (Leaf): Akun yang tidak menjadi parent dari akun lain di database
    const leafAccounts = useMemo(() => {
        return rbaAccounts.filter((a) => !parentCodeSet.has(a.account_code));
    }, [rbaAccounts, parentCodeSet]);

    // Filter akun transaksi berdasarkan Kategori Belanja ('Operasi' vs 'Modal')
    const categoryLeafAccounts = useMemo(() => {
        return leafAccounts.filter((a) => {
            if (selectedKategori === 'Modal') {
                return a.kategori_belanja === 'Modal' || a.account_code?.startsWith('1.2');
            }
            return a.kategori_belanja !== 'Modal' && !a.account_code?.startsWith('1.2');
        });
    }, [leafAccounts, selectedKategori]);

    // Filter pencarian cepat (Quick Search) berdasarkan nama akun, kode rekening, atau nama induknya
    const filteredLeafAccounts = useMemo(() => {
        if (!accountSearchQuery.trim()) return categoryLeafAccounts;
        const q = accountSearchQuery.toLowerCase();
        return categoryLeafAccounts.filter((a) => {
            const parentAcc = a.parent_code ? accountByCodeMap.get(a.parent_code) : null;
            return (
                a.account_name?.toLowerCase().includes(q) ||
                a.account_code?.toLowerCase().includes(q) ||
                parentAcc?.account_name?.toLowerCase().includes(q)
            );
        });
    }, [categoryLeafAccounts, accountSearchQuery, accountByCodeMap]);

    // Pengelompokan akun per Objek / Induk agar tampilan dropdown rapi dan terstruktur
    const groupedAccounts = useMemo(() => {
        const groups = {};
        filteredLeafAccounts.forEach((acc) => {
            const parent = acc.parent_code ? accountByCodeMap.get(acc.parent_code) : null;
            const groupKey = parent
                ? `${parent.account_code} ${parent.account_name}`
                : (acc.kategori_belanja === 'Modal' ? '1.2 Belanja Modal BLUD' : '1.1 Belanja Operasi BLUD');
            if (!groups[groupKey]) {
                groups[groupKey] = [];
            }
            groups[groupKey].push(acc);
        });
        return groups;
    }, [filteredLeafAccounts, accountByCodeMap]);

    // Otomatis pilih akun pertama pada kategori aktif jika belum ada yang terpilih
    useEffect(() => {
        if (categoryLeafAccounts.length > 0) {
            const exists = categoryLeafAccounts.some((ro) => String(ro.id) === String(selectedRincianObjekId));
            if (!exists) {
                setSelectedRincianObjekId(String(categoryLeafAccounts[0].id));
            }
        }
    }, [categoryLeafAccounts, selectedRincianObjekId]);

    // Active Selected RBA Account dari database
    const activeAccount = useMemo(() => {
        return rbaAccounts.find((a) => String(a.id) === String(selectedRincianObjekId)) || categoryLeafAccounts[0] || null;
    }, [rbaAccounts, selectedRincianObjekId, categoryLeafAccounts]);

    // -------------------------------------------------------------
    // 4. INPUT RINCIAN BARANG STATE
    // -------------------------------------------------------------
    const [inputName, setInputName] = useState('');
    const [inputQty, setInputQty] = useState(1);
    const [inputUnit, setInputUnit] = useState('Pcs');
    const [inputPrice, setInputPrice] = useState('');
    const [inputSpec, setInputSpec] = useState('');
    const [selectedCatalogItem, setSelectedCatalogItem] = useState(null);
    const [isCatalogDropdownOpen, setIsCatalogDropdownOpen] = useState(false);

    const [quickAddError, setQuickAddError] = useState(null);
    const [submitError, setSubmitError] = useState(null);

    const qtyInputRef = useRef(null);
    const dropdownRef = useRef(null);

    // Catalog items matching the currently selected active account
    const activeCatalogItems = useMemo(() => {
        if (!activeAccount) return [];
        return items
            .filter((item) => String(item.rba_account_id) === String(activeAccount.id))
            .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    }, [items, activeAccount]);

    // Live search catalog items
    const filteredCatalogItems = useMemo(() => {
        if (!inputName.trim()) return activeCatalogItems.slice(0, 15);
        const q = inputName.toLowerCase();
        return activeCatalogItems
            .filter(
                (it) =>
                    it.name?.toLowerCase().includes(q) ||
                    it.item_code?.toLowerCase().includes(q) ||
                    it.specification?.toLowerCase().includes(q)
            )
            .slice(0, 15);
    }, [activeCatalogItems, inputName]);

    // Close catalog autocomplete when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsCatalogDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelectCatalogItem = (catItem) => {
        setInputName(catItem.name);
        setInputUnit(catItem.unit_type || 'Pcs');
        setInputPrice(catItem.standard_price || 0);
        setInputSpec(catItem.specification || '');
        setSelectedCatalogItem(catItem);
        setIsCatalogDropdownOpen(false);
        if (qtyInputRef.current) {
            qtyInputRef.current.focus();
        }
    };

    // Add item to table
    const handleAddItem = () => {
        setQuickAddError(null);

        if (!activeAccount) {
            setQuickAddError('Pilih kode rekening (Rincian Objek) terlebih dahulu.');
            return;
        }

        const trimmedName = inputName.trim();
        if (!trimmedName) {
            setQuickAddError('Nama barang / uraian tidak boleh kosong.');
            return;
        }

        const qtyNum = Number(inputQty);
        if (isNaN(qtyNum) || qtyNum <= 0) {
            setQuickAddError('Volume barang harus minimal 1.');
            return;
        }

        const priceNum = Number(inputPrice);
        if (isNaN(priceNum) || priceNum < 0) {
            setQuickAddError('Harga satuan barang tidak boleh negatif.');
            return;
        }

        const isModalAccount =
            selectedKategori === 'Modal' ||
            activeAccount.account_code?.startsWith('1.2') ||
            activeAccount.kategori_belanja === 'Modal';

        const newItem = {
            id: Date.now() + Math.random(),
            item_id: selectedCatalogItem?.id || null,
            rba_account_id: activeAccount.id,
            account_code: activeAccount.account_code,
            account_name: activeAccount.account_name,
            jenis_belanja: isModalAccount ? 'Modal' : 'Operasi',
            name: trimmedName,
            specification: inputSpec.trim() || selectedCatalogItem?.specification || null,
            unit_type: inputUnit || 'Pcs',
            quantity: qtyNum,
            unit_price: priceNum,
            subtotal: qtyNum * priceNum,
            is_new: !selectedCatalogItem,
        };

        setData('items', [...data.items, newItem]);

        // Reset input fields
        setInputName('');
        setSelectedCatalogItem(null);
        setInputQty(1);
        setInputPrice('');
        setInputSpec('');
        setIsCatalogDropdownOpen(false);
    };

    // Remove item from table
    const handleRemoveItem = (indexToRemove) => {
        setData('items', data.items.filter((_, idx) => idx !== indexToRemove));
    };

    // Grand total and subtotals calculation
    const grandTotal = useMemo(() => {
        return data.items.reduce((sum, it) => sum + (Number(it.quantity || 0) * Number(it.unit_price || 0)), 0);
    }, [data.items]);

    const totalOperasional = useMemo(() => {
        return data.items
            .filter((it) => it.jenis_belanja !== 'Modal')
            .reduce((sum, it) => sum + (Number(it.quantity || 0) * Number(it.unit_price || 0)), 0);
    }, [data.items]);

    const totalModal = useMemo(() => {
        return data.items
            .filter((it) => it.jenis_belanja === 'Modal')
            .reduce((sum, it) => sum + (Number(it.quantity || 0) * Number(it.unit_price || 0)), 0);
    }, [data.items]);

    // Handle initial edit loading
    useEffect(() => {
        if (isEdit && requisition) {
            const existingDetails = requisition.requisition_details || requisition.requisitionDetails || [];
            const loadedItems = existingDetails.map((d, index) => {
                const isItemModal =
                    d.jenis_belanja === 'Modal' ||
                    d.rba_account?.kategori_belanja === 'Modal' ||
                    requisition.jenis_belanja === 'Modal';
                const acc = d.rba_account || d.rbaAccount || requisition.rba_account || {};

                return {
                    id: d.id || `exist-${index}`,
                    item_id: d.item_id || null,
                    rba_account_id: d.rba_account_id || requisition.rba_account_id,
                    account_code: acc.account_code || (isItemModal ? '1.2.1.2.1' : '1.1.2.1.1'),
                    account_name: acc.account_name || 'Rekening RBA',
                    name: d.item?.name || d.item_name || d.manual_item_name || 'Barang Usulan',
                    unit_type: d.unit_type || d.item?.unit_type || 'Pcs',
                    quantity: Number(d.quantity_requested || 1),
                    unit_price: Number(d.unit_price || 0),
                    subtotal: Number(d.subtotal || (Number(d.quantity_requested || 1) * Number(d.unit_price || 0))),
                    jenis_belanja: isItemModal ? 'Modal' : 'Operasi',
                    specification: d.specification || d.item?.specification || '',
                    is_new: !d.item_id,
                };
            });

            setData({
                jenis_belanja: requisition.jenis_belanja || 'Campuran',
                rba_account_id: requisition.rba_account_id || '',
                budget_year: requisition.budget_year || requisition.fiscal_year || resolvedYear,
                fiscal_year: requisition.fiscal_year || requisition.budget_year || resolvedYear,
                program: requisition.program || 'Program Peningkatan Pelayanan Kesehatan Pada BLUD',
                kegiatan: requisition.kegiatan || '1. Pelayanan Kesehatan',
                sub_kegiatan: requisition.sub_kegiatan || smartDefaultSub,
                tolok_ukur_output: requisition.tolok_ukur_output || smartDefaultOutput,
                target_output: requisition.target_output || '100%',
                tolok_ukur_outcome: requisition.tolok_ukur_outcome || smartDefaultOutcome,
                target_outcome: requisition.target_outcome || '100%',
                nomor_surat_unit: requisition.nomor_surat_unit || '',
                urgency_reason: requisition.urgency_reason || '',
                items: loadedItems,
            });

            if (requisition.rba_account_id) {
                setSelectedRincianObjekId(String(requisition.rba_account_id));
                const targetAcc = rbaAccounts.find((a) => a.id === requisition.rba_account_id);
                if (targetAcc) {
                    const isModal = targetAcc.kategori_belanja === 'Modal' || targetAcc.account_code?.startsWith('1.2');
                    setSelectedKategori(isModal ? 'Modal' : 'Operasi');
                }
            } else if (requisition.jenis_belanja === 'Modal') {
                setSelectedKategori('Modal');
            }
        }
    }, [isEdit, requisition, rbaAccounts]);

    // Form Submission
    const handleSubmit = (e) => {
        e.preventDefault();
        setSubmitError(null);

        if (!data.program || !data.program.trim()) {
            setSubmitError('Program Rumah Sakit wajib diisi.');
            return;
        }

        if (!data.kegiatan || !data.kegiatan.trim()) {
            setSubmitError('Kegiatan Rumah Sakit wajib diisi.');
            return;
        }

        if (!data.sub_kegiatan || !data.sub_kegiatan.trim()) {
            setSubmitError('Sub Kegiatan Rumah Sakit wajib diisi.');
            return;
        }

        if (data.items.length === 0) {
            setSubmitError('Daftar usulan belanja masih kosong. Tambahkan minimal 1 item barang ke tabel usulan.');
            return;
        }

        let overallJenis = 'Operasi';
        if (totalOperasional > 0 && totalModal > 0) {
            overallJenis = 'Campuran';
        } else if (totalModal > 0) {
            overallJenis = 'Modal';
        }

        const primaryAccountId = data.items[0]?.rba_account_id || activeAccount?.id || null;

        const payload = {
            ...data,
            program: data.program.trim(),
            kegiatan: data.kegiatan.trim(),
            sub_kegiatan: data.sub_kegiatan.trim(),
            tolok_ukur_output: data.tolok_ukur_output ? data.tolok_ukur_output.trim() : null,
            target_output: data.target_output ? data.target_output.trim() : '100%',
            tolok_ukur_outcome: data.tolok_ukur_outcome ? data.tolok_ukur_outcome.trim() : null,
            target_outcome: data.target_outcome ? data.target_outcome.trim() : '100%',
            jenis_belanja: overallJenis,
            rba_account_id: primaryAccountId,
            total_operasional: totalOperasional,
            total_modal: totalModal,
            total_estimated: grandTotal,
            items: data.items.map((it) => ({
                item_id: it.item_id || null,
                rba_account_id: it.rba_account_id,
                jenis_belanja: it.jenis_belanja,
                name: it.name,
                specification: it.specification,
                unit_type: it.unit_type,
                quantity: it.quantity,
                unit_price: it.unit_price,
                subtotal: it.subtotal,
                is_new: it.is_new,
            })),
        };

        if (isEdit && requisition) {
            put(route('requisitions.update', requisition.id), {
                data: payload,
                onSuccess: () => {
                    reset();
                    onClose();
                },
                onError: (errs) => {
                    const firstMsg = Object.values(errs)[0];
                    setSubmitError(firstMsg || 'Gagal memperbarui usulan belanja. Periksa data kembali.');
                },
            });
        } else {
            post(route('requisitions.store'), {
                data: payload,
                onSuccess: () => {
                    reset();
                    onClose();
                },
                onError: (errs) => {
                    const firstMsg = Object.values(errs)[0];
                    setSubmitError(firstMsg || 'Gagal menyimpan usulan belanja. Periksa data kembali.');
                },
            });
        }
    };

    return (
        <Modal show={show} onClose={onClose} maxWidth="6xl">
            <div className="flex flex-col max-h-[92vh] bg-white rounded-2xl shadow-xl overflow-hidden">

                {/* 1. Header Dialog */}
                <div className="flex items-center justify-between border-b border-slate-200/80 bg-white px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-white shadow-xs font-bold text-lg">
                            <ClipboardList size={18} className="inline mr-1 text-slate-500" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-base font-bold text-slate-900">
                                    {isEdit ? 'Ubah Usulan Belanja E-BLUD' : 'Formulir Usulan Belanja E-BLUD RS Jiwa Tampan'}
                                </h2>
                                <span className="inline-flex items-center rounded-md bg-teal-50 px-2 py-0.5 text-[11px] font-bold text-teal-700 border border-teal-200">
                                    TA {resolvedYear}
                                </span>
                            </div>
                            <p className="text-xs text-slate-500">
                                Unit: <strong className="text-slate-700">{unit?.name || division?.name || 'Unit Kerja'}</strong> &bull; Sumber Dana: BLUD RSJ Tampan
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer"
                        title="Tutup formulir"
                    >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* 2. Body Dialog (Scrollable) */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 bg-white">

                    {/* Error Notice */}
                    {submitError && (
                        <div className="flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-800 animate-fade-in">
                            <div className="flex items-center gap-2">
                                <span><AlertTriangle size={18} className="inline mr-1 text-amber-500" /></span>
                                <p>{submitError}</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSubmitError(null)}
                                className="text-rose-500 hover:text-rose-700 cursor-pointer font-bold px-1"
                            >
                                <X size={16} className="inline mr-1" />
                            </button>
                        </div>
                    )}

                    {/* SECTION 1: Informasi Program & Kegiatan (Format Resmi RBA) */}
                    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs space-y-3">
                        <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-2 gap-2">
                            <h3 className="text-sm font-bold text-slate-900 border-b-2 border-emerald-500 pb-0.5 inline-block">
                                1. Informasi Program & Kegiatan (RBA)
                            </h3>
                            <div className="flex items-center gap-1.5 text-xs text-slate-600">
                                <span className="text-slate-400 font-medium">Unit Pengusul:</span>
                                <span className="font-bold text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200">
                                    {unit?.name || division?.name || 'Unit Kerja'}
                                </span>
                            </div>
                        </div>

                        {/* Baris 1: Program, Kegiatan & Sub Kegiatan */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                            <div className="md:col-span-4">
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Program Rumah Sakit <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.program}
                                    onChange={(e) => setData('program', e.target.value)}
                                    title={data.program}
                                    placeholder="Program Peningkatan Pelayanan Kesehatan Pada BLUD"
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-xs font-medium text-slate-800 focus:bg-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition shadow-2xs"
                                />
                            </div>

                            <div className="md:col-span-3">
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Kegiatan Rumah Sakit <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.kegiatan}
                                    onChange={(e) => setData('kegiatan', e.target.value)}
                                    title={data.kegiatan}
                                    placeholder="Contoh: 1. Pelayanan Kesehatan"
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-xs font-medium text-slate-800 focus:bg-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition shadow-2xs"
                                />
                            </div>

                            <div className="md:col-span-5">
                                <div className="flex items-center justify-between mb-1">
                                    <label className="block text-xs font-bold text-slate-700">
                                        Sub Kegiatan Rumah Sakit <span className="text-rose-500">*</span>
                                    </label>
                                    <span className="text-[10px] text-slate-400 font-normal">Pilih saran / ketik manual</span>
                                </div>
                                <input
                                    type="text"
                                    list="subKegiatanOptionsList"
                                    value={data.sub_kegiatan}
                                    onChange={(e) => setData('sub_kegiatan', e.target.value)}
                                    placeholder={`Contoh: PELAYANAN ${unitDisplayName.toUpperCase()} ${resolvedYear}`}
                                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-900 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition shadow-2xs"
                                />
                                <datalist id="subKegiatanOptionsList">
                                    {smartDefaultSub && <option value={smartDefaultSub} />}
                                    {subKegiatanOptions.map((opt, idx) => (
                                        <option key={idx} value={opt} />
                                    ))}
                                </datalist>
                            </div>
                        </div>

                        {/* Baris 2: No. Nota Dinas & Catatan / Alasan Urgensi */}
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-0.5">
                            <div className="sm:col-span-4">
                                <label className="block text-xs font-semibold text-slate-600 mb-1">
                                    No. Nota Dinas <span className="font-normal text-slate-400">(Opsional)</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.nomor_surat_unit}
                                    onChange={(e) => setData('nomor_surat_unit', e.target.value)}
                                    placeholder={`Contoh: 020/${(unit?.name || 'UNIT').split(' ')[0].toUpperCase()}/${resolvedYear}`}
                                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition shadow-2xs"
                                />
                            </div>

                            <div className="sm:col-span-8">
                                <label className="block text-xs font-semibold text-slate-600 mb-1">
                                    Catatan / Alasan Kebutuhan Belanja <span className="font-normal text-slate-400">(Opsional)</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.urgency_reason}
                                    onChange={(e) => setData('urgency_reason', e.target.value)}
                                    placeholder="Contoh: Kebutuhan operasional dan kelancaran pelayanan pasien..."
                                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition shadow-2xs"
                                />
                            </div>
                        </div>
                    </div>

                    {/* SECTION 2: Tolok Ukur Kinerja (Format Resmi RBA Langsung di Form) */}
                    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs space-y-3">
                        <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-2 gap-2">
                            <div>
                                <h3 className="text-sm font-bold text-slate-900 border-b-2 border-emerald-500 pb-0.5 inline-block">
                                    2. Indikator & Tolok Ukur Kinerja (RBA)
                                </h3>
                                <p className="text-[11px] text-slate-500 mt-0.5">
                                    Format resmi tolok ukur capaian kegiatan. Bawaan standar telah disediakan, Anda dapat mengubahnya langsung jika diperlukan.
                                </p>
                            </div>
                            <span className="text-[11px] font-semibold bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200">
                                Otomatis Tercetak di Dokumen RBA
                            </span>
                        </div>

                        <div className="overflow-hidden rounded-xl border border-slate-200">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 text-[11px] uppercase tracking-wider">
                                        <th className="py-2.5 px-4 w-32 text-center border-r border-slate-200">INDIKATOR</th>
                                        <th className="py-2.5 px-4 border-r border-slate-200">TOLOK UKUR KINERJA</th>
                                        <th className="py-2.5 px-4 w-36 text-center">TARGET KINERJA</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {/* 1. INPUT */}
                                    <tr className="bg-slate-50/40">
                                        <td className="py-3 px-4 font-bold text-slate-700 text-center border-r border-slate-200 bg-slate-50/70 align-middle">
                                            <span className="inline-block px-2.5 py-0.5 rounded-md bg-slate-200/80 text-slate-800 text-[11px] font-bold">
                                                INPUT
                                            </span>
                                            <span className="block text-[10px] font-medium text-slate-500 mt-0.5">(Masukan)</span>
                                        </td>
                                        <td className="py-3 px-4 text-slate-600 border-r border-slate-200">
                                            <span className="font-semibold text-slate-800">Anggaran Biaya Belanja</span>
                                            <p className="text-[11px] text-slate-400 mt-0.5">Total estimasi biaya dihitung otomatis dari rincian belanja di bawah.</p>
                                        </td>
                                        <td className="py-3 px-4 text-center align-middle">
                                            <span className="inline-block px-3 py-1 rounded-lg bg-teal-50 text-teal-800 font-mono font-bold text-xs border border-teal-200 shadow-2xs">
                                                {formatRupiah(grandTotal)}
                                            </span>
                                        </td>
                                    </tr>

                                    {/* 2. OUTPUT */}
                                    <tr>
                                        <td className="py-3 px-4 font-bold text-slate-700 text-center border-r border-slate-200 bg-slate-50/70 align-middle">
                                            <span className="inline-block px-2.5 py-0.5 rounded-md bg-teal-100/70 text-teal-800 text-[11px] font-bold">
                                                OUTPUT
                                            </span>
                                            <span className="block text-[10px] font-medium text-slate-500 mt-0.5">(Keluaran)</span>
                                        </td>
                                        <td className="py-3 px-4 border-r border-slate-200">
                                            <textarea
                                                rows={2}
                                                value={data.tolok_ukur_output}
                                                onChange={(e) => setData('tolok_ukur_output', e.target.value)}
                                                placeholder="Contoh: Tersedianya kebutuhan bahan dan sarana operasional pelayanan..."
                                                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition leading-relaxed resize-none shadow-2xs"
                                            />
                                        </td>
                                        <td className="py-3 px-4 align-middle text-center">
                                            <div className="flex flex-col items-center justify-center gap-1">
                                                <input
                                                    type="text"
                                                    value={data.target_output}
                                                    onChange={(e) => setData('target_output', e.target.value)}
                                                    placeholder="100%"
                                                    className="w-24 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-center font-bold text-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition shadow-2xs"
                                                />
                                                <span className="text-[10px] text-slate-400 font-medium">Target Capaian</span>
                                            </div>
                                        </td>
                                    </tr>

                                    {/* 3. OUTCOME */}
                                    <tr>
                                        <td className="py-3 px-4 font-bold text-slate-700 text-center border-r border-slate-200 bg-slate-50/70 align-middle">
                                            <span className="inline-block px-2.5 py-0.5 rounded-md bg-indigo-100/70 text-indigo-800 text-[11px] font-bold">
                                                OUTCOME
                                            </span>
                                            <span className="block text-[10px] font-medium text-slate-500 mt-0.5">(Hasil)</span>
                                        </td>
                                        <td className="py-3 px-4 border-r border-slate-200">
                                            <textarea
                                                rows={2}
                                                value={data.tolok_ukur_outcome}
                                                onChange={(e) => setData('tolok_ukur_outcome', e.target.value)}
                                                placeholder="Contoh: Meningkatnya mutu pelayanan dan kepuasan pasien sesuai standar SPM..."
                                                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition leading-relaxed resize-none shadow-2xs"
                                            />
                                        </td>
                                        <td className="py-3 px-4 align-middle text-center">
                                            <div className="flex flex-col items-center justify-center gap-1">
                                                <input
                                                    type="text"
                                                    value={data.target_outcome}
                                                    onChange={(e) => setData('target_outcome', e.target.value)}
                                                    placeholder="100%"
                                                    className="w-24 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-center font-bold text-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition shadow-2xs"
                                                />
                                                <span className="text-[10px] text-slate-400 font-medium">Target Capaian</span>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* SECTION 3: Klasifikasi Kode Rekening BLUD (100% Dinamis dari Database) */}
                    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs space-y-3.5">
                        <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-2.5 gap-2">
                            <div>
                                <h3 className="text-sm font-bold text-slate-900 border-b-2 border-emerald-500 pb-0.5 inline-block">
                                    3. Klasifikasi Kode Rekening (RBA BLUD)
                                </h3>
                                <p className="text-[11px] text-slate-500 mt-0.5">
                                    Pilih pos rekening belanja yang sesuai dari anggaran RBA BLUD Rumah Sakit.
                                </p>
                            </div>
                            <span className="text-[11px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                                {categoryLeafAccounts.length} Rekening Aktif
                            </span>
                        </div>

                        {/* Tab Kategori Belanja (Operasi vs Modal) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-1 bg-slate-100/80 rounded-xl border border-slate-200/80">
                            <button
                                type="button"
                                onClick={() => {
                                    setSelectedKategori('Operasi');
                                    setAccountSearchQuery('');
                                }}
                                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${selectedKategori === 'Operasi'
                                    ? 'bg-white text-emerald-700 shadow-xs border border-slate-200/60'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                                    }`}
                            >
                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                Belanja Operasi (Barang & Jasa BLUD)
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setSelectedKategori('Modal');
                                    setAccountSearchQuery('');
                                }}
                                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${selectedKategori === 'Modal'
                                    ? 'bg-white text-teal-700 shadow-xs border border-slate-200/60'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                                    }`}
                            >
                                <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                                Belanja Modal (Peralatan, Mesin & Gedung BLUD)
                            </button>
                        </div>

                        {/* Baris Pilihan Rekening & Pencarian Cepat */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                            {/* Dropdown Rekening Dinamis Berdasarkan Database */}
                            <div className="md:col-span-8">
                                <label className="block text-[11px] font-bold text-slate-700 mb-1 uppercase tracking-wide">
                                    Pos Rekening Belanja Terpilih <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                    <select
                                        value={selectedRincianObjekId}
                                        onChange={(e) => setSelectedRincianObjekId(e.target.value)}
                                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 cursor-pointer transition-colors shadow-2xs"
                                    >
                                        {filteredLeafAccounts.length === 0 ? (
                                            <option value="">Tidak ada rekening yang cocok dengan pencarian</option>
                                        ) : (
                                            Object.entries(groupedAccounts).map(([groupTitle, accList]) => (
                                                <optgroup key={groupTitle} label={groupTitle} className="font-bold text-slate-600 bg-slate-50">
                                                    {accList.map((acc) => (
                                                        <option key={acc.id} value={acc.id} className="font-normal text-slate-800 bg-white py-1">
                                                            {acc.account_code} - {acc.account_name}
                                                        </option>
                                                    ))}
                                                </optgroup>
                                            ))
                                        )}
                                    </select>
                                </div>
                            </div>

                            {/* Kolom Pencarian Cepat Rekening */}
                            <div className="md:col-span-4">
                                <label className="block text-[11px] font-bold text-slate-700 mb-1 uppercase tracking-wide">
                                    Cari Cepat Rekening
                                </label>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                                        <Search size={14} />
                                    </div>
                                    <input
                                        type="text"
                                        value={accountSearchQuery}
                                        onChange={(e) => setAccountSearchQuery(e.target.value)}
                                        placeholder="Ketik nama atau kode..."
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-8 pr-7 py-2 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition shadow-2xs"
                                    />
                                    {accountSearchQuery && (
                                        <button
                                            type="button"
                                            onClick={() => setAccountSearchQuery('')}
                                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Bar Info Rekening Aktif */}
                        {activeAccount && (
                            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-teal-50/60 border border-teal-100 p-2.5 text-xs text-teal-900">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-teal-700">Pos Rekening Terpilih:</span>
                                    <span className="font-mono font-bold text-teal-900 bg-white px-2 py-0.5 rounded border border-teal-200">
                                        [{activeAccount.account_code}]
                                    </span>
                                    <span className="font-semibold text-slate-800">
                                        {activeAccount.account_name}
                                    </span>
                                </div>
                                <div className="text-[11px] text-teal-700 font-medium">
                                    {activeCatalogItems.length > 0 ? (
                                        <span>{activeCatalogItems.length} item tersedia di katalog</span>
                                    ) : (
                                        <span className="text-amber-700">Belum ada item katalog (bisa input manual)</span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* SECTION 4: Input Rincian Barang */}
                    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs space-y-3">
                        <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-2 gap-2">
                            <h3 className="text-sm font-bold text-slate-900 border-b-2 border-emerald-500 pb-0.5 inline-block">
                                4. Input Rincian Barang
                            </h3>
                            <span className="text-[11px] text-slate-400">
                                Pilih dari katalog atau ketik manual, lalu klik <strong>Tambah ke Daftar Usulan</strong>
                            </span>
                        </div>

                        <div className="bg-slate-50/60 p-4 rounded-2xl border border-slate-200/70 space-y-3.5">
                            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                                {/* Nama Barang / Uraian */}
                                <div className="sm:col-span-4 relative">
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                        Nama Barang / Uraian <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={inputName}
                                        onChange={(e) => {
                                            setInputName(e.target.value);
                                            setIsCatalogDropdownOpen(true);
                                        }}
                                        onFocus={() => setIsCatalogDropdownOpen(true)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                qtyInputRef.current?.focus();
                                            }
                                        }}
                                        placeholder="Ketik nama barang / pilih katalog..."
                                        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition shadow-2xs"
                                    />

                                    {/* Floating Autocomplete Dropdown dari Master Katalog */}
                                    {isCatalogDropdownOpen && filteredCatalogItems.length > 0 && (
                                        <div
                                            ref={dropdownRef}
                                            className="absolute left-0 right-0 top-full mt-2 z-30 max-h-56 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl py-1 text-xs"
                                        >
                                            <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 border-b border-slate-100">
                                                Katalog Barang Rekening Ini ({filteredCatalogItems.length}):
                                            </div>
                                            {filteredCatalogItems.map((catItem) => (
                                                <button
                                                    key={catItem.id}
                                                    type="button"
                                                    onClick={() => handleSelectCatalogItem(catItem)}
                                                    className="w-full text-left px-3 py-2.5 hover:bg-teal-50 flex items-center justify-between border-b border-slate-50 last:border-0 transition cursor-pointer"
                                                >
                                                    <div>
                                                        <p className="font-bold text-slate-900">{catItem.name}</p>
                                                        <p className="text-[10px] text-slate-500">{catItem.specification || 'Standar RS'}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="font-mono font-bold text-teal-700 block">{formatRupiah(catItem.standard_price)}</span>
                                                        <span className="text-[10px] text-slate-400 uppercase">/{catItem.unit_type || 'Unit'}</span>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Volume */}
                                <div className="col-span-6 sm:col-span-2">
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                        Volume <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        ref={qtyInputRef}
                                        type="number"
                                        min="1"
                                        value={inputQty}
                                        onChange={(e) => setInputQty(Math.max(1, parseInt(e.target.value) || 1))}
                                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-center font-bold shadow-2xs"
                                    />
                                </div>

                                {/* Satuan */}
                                <div className="col-span-6 sm:col-span-2">
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                        Satuan <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        value={inputUnit}
                                        onChange={(e) => setInputUnit(e.target.value)}
                                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 cursor-pointer text-center font-medium shadow-2xs"
                                    >
                                        {COMMON_UNITS.map((u) => (
                                            <option key={u} value={u}>
                                                {u}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Harga Satuan (Rp) */}
                                <div className="col-span-6 sm:col-span-2">
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                        Harga Satuan (Rp) <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={inputPrice}
                                        onChange={(e) => setInputPrice(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                handleAddItem();
                                            }
                                        }}
                                        placeholder="0"
                                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 font-mono text-right font-medium focus:border-teal-500 focus:ring-1 focus:ring-teal-500 shadow-2xs"
                                    />
                                </div>

                                {/* Total Biaya (Rp) */}
                                <div className="col-span-6 sm:col-span-2">
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                        Total Biaya (Rp)
                                    </label>
                                    <div className="rounded-xl border border-teal-200 bg-teal-50/90 px-3 py-2 text-xs font-bold text-teal-900 font-mono text-right flex items-center justify-end h-[36px] shadow-2xs">
                                        <span>{formatRupiah(Number(inputQty || 0) * Number(inputPrice || 0))}</span>
                                    </div>
                                </div>
                            </div>

                            {quickAddError && (
                                <p className="text-xs font-semibold text-rose-600 animate-fade-in flex items-center gap-1">
                                    <AlertTriangle size={15} className="text-rose-500 shrink-0" /> {quickAddError}
                                </p>
                            )}

                            {/* Action Bar Terpadu: Tombol Tambah Barang Sesuai Gaya Aplikasi */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-2.5 border-t border-slate-200/70 gap-2.5">
                                <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                                    <span className="inline-block w-2 h-2 rounded-full bg-teal-500 shrink-0"></span>
                                    <span>Pilih dari katalog atau ketik manual, lalu klik tombol untuk memasukkan ke daftar.</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleAddItem}
                                    className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-95 px-4 py-2 text-xs font-bold text-white shadow-2xs transition cursor-pointer whitespace-nowrap self-end sm:self-auto"
                                >
                                    <Plus className="h-4 w-4" />
                                    <span>Tambah ke Daftar Usulan</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 5: Tabel Daftar Usulan Belanja */}
                    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs space-y-3">
                        <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-2 gap-2">
                            <h3 className="text-sm font-bold text-slate-900 border-b-2 border-emerald-500 pb-0.5 inline-block">
                                5. Daftar Barang yang Diusulkan
                            </h3>
                            <span className="text-xs font-semibold text-slate-600">
                                Total: <strong className="text-slate-900 font-bold bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">{data.items.length}</strong> item belanja
                            </span>
                        </div>

                        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                            <table className="min-w-full divide-y divide-slate-200 text-xs">
                                <thead className="bg-slate-50 font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                                    <tr>
                                        <th className="px-4 py-3 text-left w-36">KODE REKENING</th>
                                        <th className="px-4 py-3 text-left">URAIAN BARANG</th>
                                        <th className="px-3 py-3 text-center w-16">VOL</th>
                                        <th className="px-3 py-3 text-center w-20">SATUAN</th>
                                        <th className="px-4 py-3 text-right w-32">HARGA SATUAN</th>
                                        <th className="px-4 py-3 text-right w-36">TOTAL BIAYA</th>
                                        <th className="px-3 py-3 text-center w-20">AKSI</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white">
                                    {data.items.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-12 text-center">
                                                <div className="flex flex-col items-center justify-center max-w-sm mx-auto text-center">
                                                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3 border border-slate-200">
                                                        <ShoppingBag className="w-6 h-6 text-slate-400" />
                                                    </div>
                                                    <p className="text-xs font-bold text-slate-700">Belum Ada Barang di Daftar Usulan</p>
                                                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                                                        Pilih klasifikasi rekening di atas, lalu masukkan rincian barang untuk menambahkan ke daftar usulan belanja.
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        data.items.map((it, idx) => (
                                            <tr key={it.id || idx} className="hover:bg-slate-50/60 transition">
                                                <td className="px-4 py-3 font-mono font-semibold text-slate-700 whitespace-nowrap">
                                                    {it.account_code || '-'}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <p className="font-bold text-slate-900">{it.name}</p>
                                                    {it.specification && (
                                                        <p className="text-[11px] text-slate-500 mt-0.5">{it.specification}</p>
                                                    )}
                                                </td>
                                                <td className="px-3 py-3 text-center font-semibold text-slate-800">
                                                    {it.quantity}
                                                </td>
                                                <td className="px-3 py-3 text-center text-slate-600">
                                                    {it.unit_type}
                                                </td>
                                                <td className="px-4 py-3 text-right font-mono text-slate-700">
                                                    {formatRupiah(it.unit_price)}
                                                </td>
                                                <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">
                                                    {formatRupiah(it.subtotal)}
                                                </td>
                                                <td className="px-3 py-3 text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveItem(idx)}
                                                        title="Hapus barang ini"
                                                        className="inline-flex items-center justify-center p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition cursor-pointer"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                        <span className="sr-only">Hapus</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Summary Bar di Bawah Tabel */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-3 border-t border-slate-100">
                            <div className="flex flex-wrap items-center gap-2 text-xs">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold border border-slate-200 text-[11px]">
                                    Total Item: <strong className="text-slate-900">{data.items.length}</strong>
                                </span>
                                {totalOperasional > 0 && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-50 text-teal-800 font-medium border border-teal-200 text-[11px]">
                                        Operasi: <strong className="font-mono font-semibold">{formatRupiah(totalOperasional)}</strong>
                                    </span>
                                )}
                                {totalModal > 0 && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-50 text-purple-800 font-medium border border-purple-200 text-[11px]">
                                        Modal: <strong className="font-mono font-semibold">{formatRupiah(totalModal)}</strong>
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center gap-2.5 self-end sm:self-auto">
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                                    TOTAL ESTIMASI USULAN:
                                </span>
                                <span className="text-base sm:text-lg font-black text-teal-900 font-mono bg-teal-50 px-3.5 py-1 rounded-xl border border-teal-200 shadow-2xs">
                                    {formatRupiah(grandTotal)}
                                </span>
                            </div>
                        </div>
                    </div>
                </form>

                {/* 3. Modal Footer */}
                <div className="flex items-center justify-between border-t border-slate-200/80 bg-slate-50 px-6 py-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                    >
                        Batal
                    </button>

                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={processing || data.items.length === 0}
                        className={`rounded-xl px-5 py-2 text-xs font-bold text-white shadow-xs transition cursor-pointer active:scale-95 ${processing || data.items.length === 0
                            ? 'bg-slate-300 cursor-not-allowed'
                            : 'bg-teal-600 hover:bg-teal-700'
                            }`}
                    >
                        {processing ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Kirim Usulan Belanja'}
                    </button>
                </div>
            </div>
        </Modal>
    );
}

