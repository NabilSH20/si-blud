import Modal from '@/Components/Modal';
import { useForm, usePage } from '@inertiajs/react';
import { useState, useEffect, useMemo, useRef } from 'react';

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
    // 3. KLASIFIKASI KODE REKENING (5-LEVEL CASCADING DROPDOWNS)
    // -------------------------------------------------------------
    const [selectedAkunUtama, setSelectedAkunUtama] = useState('1');
    const [selectedKelompok, setSelectedKelompok] = useState(initialJenis === 'Modal' ? '1.2' : '1.1');
    const [selectedJenis, setSelectedJenis] = useState(initialJenis === 'Modal' ? '1.2.1' : '1.1.2');
    const [selectedObjek, setSelectedObjek] = useState(initialJenis === 'Modal' ? '1.2.1.2' : '1.1.2.1');
    const [selectedRincianObjekId, setSelectedRincianObjekId] = useState('');

    // Level 1: Akun Utama
    const akunUtamaList = useMemo(() => [
        { code: '1', name: '1. BELANJA' },
    ], []);

    // Level 2: Kelompok
    const kelompokList = useMemo(() => [
        { code: '1.1', name: '1.1. Belanja Operasi' },
        { code: '1.2', name: '1.2. Belanja Modal' },
    ], []);

    // Level 3: Jenis
    const jenisList = useMemo(() => {
        if (selectedKelompok === '1.2') {
            return [
                { code: '1.2.1', name: '1.2.1. Belanja Modal BLUD' },
            ];
        }
        return [
            { code: '1.1.2', name: '1.1.2. Belanja Barang dan Jasa' },
            { code: '1.1.1', name: '1.1.1. Belanja Pegawai' },
        ];
    }, [selectedKelompok]);

    // Level 4: Objek
    const objekList = useMemo(() => {
        if (selectedJenis === '1.1.2') {
            return [
                { code: '1.1.2.1', name: '1.1.2.1. Belanja Barang & Jasa BLUD' },
            ];
        }
        if (selectedJenis === '1.1.1') {
            return [
                { code: '1.1.1.1', name: '1.1.1.1. Belanja Pegawai BLUD' },
            ];
        }
        if (selectedJenis === '1.2.1') {
            return [
                { code: '1.2.1.2', name: '1.2.1.2. Belanja Peralatan dan Mesin' },
                { code: '1.2.1.3', name: '1.2.1.3. Belanja Gedung dan Bangunan' },
                { code: '1.2.1.1', name: '1.2.1.1. Belanja Tanah' },
                { code: '1.2.1.4', name: '1.2.1.4. Belanja Jalan/ Irigasi Dan jaringan' },
                { code: '1.2.1.5', name: '1.2.1.5. Belanja Aset tetap lainnya' },
                { code: '1.2.1.6', name: '1.2.1.6. Belanja Aset lainnya' },
            ];
        }
        return [];
    }, [selectedJenis]);

    // Level 5: Rincian Objek (Leaf Accounts)
    const rincianObjekList = useMemo(() => {
        if (!selectedObjek) return [];
        const list = rbaAccounts.filter((acc) => {
            const code = acc.account_code || '';
            if (code.startsWith(selectedObjek + '.')) return true;
            if (acc.parent_code === selectedObjek) return true;
            if (code === selectedObjek) return true;
            if (selectedObjek === '1.2.1.2' && code.startsWith('1.2.02')) return true;
            if (selectedObjek === '1.2.1.3' && code.startsWith('1.2.03')) return true;
            return false;
        });

        if (list.length === 0) {
            const exact = rbaAccounts.find((a) => a.account_code === selectedObjek);
            if (exact) return [exact];
        }

        return list;
    }, [selectedObjek, rbaAccounts]);

    // Handlers for Cascading Changes
    const handleKelompokChange = (val) => {
        setSelectedKelompok(val);
        if (val === '1.2') {
            setSelectedJenis('1.2.1');
            setSelectedObjek('1.2.1.2');
        } else {
            setSelectedJenis('1.1.2');
            setSelectedObjek('1.1.2.1');
        }
    };

    const handleJenisChange = (val) => {
        setSelectedJenis(val);
        if (val === '1.1.2') {
            setSelectedObjek('1.1.2.1');
        } else if (val === '1.1.1') {
            setSelectedObjek('1.1.1.1');
        } else if (val === '1.2.1') {
            setSelectedObjek('1.2.1.2');
        }
    };

    const handleObjekChange = (val) => {
        setSelectedObjek(val);
    };

    // Auto-select first Rincian Objek when list updates or if not in list
    useEffect(() => {
        if (rincianObjekList.length > 0) {
            const exists = rincianObjekList.some((ro) => String(ro.id) === String(selectedRincianObjekId));
            if (!exists) {
                setSelectedRincianObjekId(String(rincianObjekList[0].id));
            }
        }
    }, [rincianObjekList, selectedRincianObjekId]);

    // Active Selected RBA Account
    const activeAccount = useMemo(() => {
        return rbaAccounts.find((a) => String(a.id) === String(selectedRincianObjekId)) || rincianObjekList[0] || null;
    }, [rbaAccounts, selectedRincianObjekId, rincianObjekList]);

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
            selectedKelompok === '1.2' ||
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

            if (requisition.jenis_belanja === 'Modal') {
                handleKelompokChange('1.2');
            }
        }
    }, [isEdit, requisition]);

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
                            📋
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
                                <span>⚠️</span>
                                <p>{submitError}</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSubmitError(null)}
                                className="text-rose-500 hover:text-rose-700 cursor-pointer font-bold px-1"
                            >
                                ✕
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

                        {/* Baris 1: Program, Kegiatan & Sub Kegiatan (Sesuai RBA Fisik) */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Program Rumah Sakit <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.program}
                                    onChange={(e) => setData('program', e.target.value)}
                                    placeholder="Program Peningkatan Pelayanan Kesehatan Pada BLUD"
                                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition shadow-2xs"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Kegiatan Rumah Sakit <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.kegiatan}
                                    onChange={(e) => setData('kegiatan', e.target.value)}
                                    placeholder="Contoh: 1. Pelayanan Kesehatan"
                                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition shadow-2xs"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Sub Kegiatan Rumah Sakit <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.sub_kegiatan}
                                    onChange={(e) => setData('sub_kegiatan', e.target.value)}
                                    placeholder="Contoh: PELAYANAN LABORATORIUM 2026"
                                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition shadow-2xs"
                                />
                            </div>
                        </div>

                        {/* Baris 2: No. Nota Dinas & Catatan / Alasan Urgensi (Ringkas & Bersih) */}
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-0.5">
                            <div className="sm:col-span-4">
                                <label className="block text-xs font-semibold text-slate-600 mb-1">
                                    No. Nota Dinas <span className="font-normal text-slate-400">(Opsional)</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.nomor_surat_unit}
                                    onChange={(e) => setData('nomor_surat_unit', e.target.value)}
                                    placeholder="Contoh: 020/IGD/2026"
                                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
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
                                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
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
                            <span className="text-[11px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">
                                Otomatis Tercetak di Dokumen RBA
                            </span>
                        </div>

                        <div className="overflow-hidden rounded-lg border border-slate-200">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                    <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                                        <th className="py-2 px-3 w-28 text-center border-r border-slate-200">INDIKATOR</th>
                                        <th className="py-2 px-3 border-r border-slate-200">TOLOK UKUR KINERJA</th>
                                        <th className="py-2 px-3 w-32 text-center">TARGET KINERJA</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {/* 1. INPUT */}
                                    <tr className="bg-slate-50/60">
                                        <td className="py-2.5 px-3 font-bold text-slate-700 text-center border-r border-slate-200 bg-slate-100/70 align-middle">
                                            INPUT
                                            <span className="block text-[10px] font-normal text-slate-500">(Masukan)</span>
                                        </td>
                                        <td className="py-2.5 px-3 text-slate-600 border-r border-slate-200">
                                            <span className="font-semibold text-slate-800">Anggaran Biaya Belanja</span>
                                            <p className="text-[11px] text-slate-400">Total estimasi biaya dihitung otomatis dari rincian belanja di bawah.</p>
                                        </td>
                                        <td className="py-2.5 px-3 text-center align-middle">
                                            <span className="inline-block px-2.5 py-1 rounded bg-emerald-50 text-emerald-800 font-mono font-bold text-xs border border-emerald-200">
                                                {formatRupiah(grandTotal)}
                                            </span>
                                        </td>
                                    </tr>

                                    {/* 2. OUTPUT */}
                                    <tr>
                                        <td className="py-2.5 px-3 font-bold text-slate-700 text-center border-r border-slate-200 bg-slate-100/70 align-middle">
                                            OUTPUT
                                            <span className="block text-[10px] font-normal text-slate-500">(Keluaran)</span>
                                        </td>
                                        <td className="py-2.5 px-3 border-r border-slate-200">
                                            <textarea
                                                rows={2}
                                                value={data.tolok_ukur_output}
                                                onChange={(e) => setData('tolok_ukur_output', e.target.value)}
                                                placeholder="Contoh: Tersedianya kebutuhan bahan dan sarana operasional pelayanan..."
                                                className="w-full rounded-md border border-slate-300 bg-white p-2 text-xs text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition leading-relaxed resize-none shadow-2xs"
                                            />
                                        </td>
                                        <td className="py-2.5 px-3 align-middle text-center">
                                            <div className="flex flex-col items-center justify-center gap-1">
                                                <input
                                                    type="text"
                                                    value={data.target_output}
                                                    onChange={(e) => setData('target_output', e.target.value)}
                                                    placeholder="100%"
                                                    className="w-20 rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs text-center font-bold text-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition shadow-2xs"
                                                />
                                                <span className="text-[10px] text-slate-400 font-medium">Target Capaian</span>
                                            </div>
                                        </td>
                                    </tr>

                                    {/* 3. OUTCOME */}
                                    <tr>
                                        <td className="py-2.5 px-3 font-bold text-slate-700 text-center border-r border-slate-200 bg-slate-100/70 align-middle">
                                            OUTCOME
                                            <span className="block text-[10px] font-normal text-slate-500">(Hasil)</span>
                                        </td>
                                        <td className="py-2.5 px-3 border-r border-slate-200">
                                            <textarea
                                                rows={2}
                                                value={data.tolok_ukur_outcome}
                                                onChange={(e) => setData('tolok_ukur_outcome', e.target.value)}
                                                placeholder="Contoh: Meningkatnya mutu pelayanan dan kepuasan pasien sesuai standar SPM..."
                                                className="w-full rounded-md border border-slate-300 bg-white p-2 text-xs text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition leading-relaxed resize-none shadow-2xs"
                                            />
                                        </td>
                                        <td className="py-2.5 px-3 align-middle text-center">
                                            <div className="flex flex-col items-center justify-center gap-1">
                                                <input
                                                    type="text"
                                                    value={data.target_outcome}
                                                    onChange={(e) => setData('target_outcome', e.target.value)}
                                                    placeholder="100%"
                                                    className="w-20 rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs text-center font-bold text-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition shadow-2xs"
                                                />
                                                <span className="text-[10px] text-slate-400 font-medium">Target Capaian</span>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* SECTION 3: Klasifikasi Kode Rekening BLUD */}
                    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs space-y-3">
                        <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-2 gap-2">
                            <h3 className="text-sm font-bold text-slate-900 border-b-2 border-emerald-500 pb-0.5 inline-block">
                                3. Klasifikasi Kode Rekening (RBA BLUD)
                            </h3>
                        </div>

                        {/* Dropdown Bertingkat: 2 Baris agar Seluruh Nama Rekening Terbaca Jelas */}
                        <div className="space-y-4 pt-2">
                            {/* Baris 1: Akun Utama, Kelompok, dan Jenis */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                                        1. Akun Utama
                                    </label>
                                    <select
                                        value={selectedAkunUtama}
                                        onChange={(e) => setSelectedAkunUtama(e.target.value)}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-semibold text-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors shadow-sm"
                                    >
                                        {akunUtamaList.map((au) => (
                                            <option key={au.code} value={au.code}>
                                                {au.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                                        2. Kelompok Belanja
                                    </label>
                                    <select
                                        value={selectedKelompok}
                                        onChange={(e) => handleKelompokChange(e.target.value)}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-semibold text-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 cursor-pointer transition-colors shadow-sm"
                                    >
                                        {kelompokList.map((k) => (
                                            <option key={k.code} value={k.code}>
                                                {k.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                                        3. Jenis Belanja
                                    </label>
                                    <select
                                        value={selectedJenis}
                                        onChange={(e) => handleJenisChange(e.target.value)}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-semibold text-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 cursor-pointer transition-colors shadow-sm"
                                    >
                                        {jenisList.map((j) => (
                                            <option key={j.code} value={j.code}>
                                                {j.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Baris 2: Objek & Rincian Objek */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[11px] font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                                        4. Objek Belanja
                                    </label>
                                    <select
                                        value={selectedObjek}
                                        onChange={(e) => handleObjekChange(e.target.value)}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-semibold text-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 cursor-pointer transition-colors shadow-sm"
                                    >
                                        {objekList.map((o) => (
                                            <option key={o.code} value={o.code}>
                                                {o.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                                        5. Rincian Objek (Rekening Belanja Aktif)
                                    </label>
                                    <select
                                        value={selectedRincianObjekId}
                                        onChange={(e) => setSelectedRincianObjekId(e.target.value)}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-semibold text-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 cursor-pointer transition-colors shadow-sm"
                                    >
                                        {rincianObjekList.map((ro) => (
                                            <option key={ro.id} value={ro.id}>
                                                {ro.account_code} - {ro.account_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Bar Info Rekening Aktif */}
                        {activeAccount && (
                            <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 text-xs">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-slate-500">Pos Rekening Terpilih:</span>
                                    <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                                        [{activeAccount.account_code}]
                                    </span>
                                    <span className="font-medium text-slate-800">
                                        {activeAccount.account_name}
                                    </span>
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
                                Pilih dari katalog atau ketik manual, lalu klik <strong>+ Tambah ke Daftar Usulan</strong>
                            </span>
                        </div>

                        <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-end">
                                {/* Nama Barang / Uraian */}
                                <div className="lg:col-span-4 relative">
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
                                        placeholder="Ketik nama barang / pilih katalog..."
                                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-900 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition shadow-sm"
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
                                <div className="lg:col-span-2">
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                        Volume <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        ref={qtyInputRef}
                                        type="number"
                                        min="1"
                                        value={inputQty}
                                        onChange={(e) => setInputQty(Math.max(1, parseInt(e.target.value) || 1))}
                                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-900 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-center font-bold shadow-sm"
                                    />
                                </div>

                                {/* Satuan */}
                                <div className="lg:col-span-2">
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                        Satuan <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        value={inputUnit}
                                        onChange={(e) => setInputUnit(e.target.value)}
                                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-900 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 cursor-pointer text-center font-medium shadow-sm"
                                    >
                                        {COMMON_UNITS.map((u) => (
                                            <option key={u} value={u}>
                                                {u}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Harga Satuan (Rp) */}
                                <div className="lg:col-span-2">
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                        Harga Satuan (Rp) <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={inputPrice}
                                        onChange={(e) => setInputPrice(e.target.value)}
                                        placeholder="0"
                                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-900 font-mono text-right font-medium focus:border-teal-500 focus:ring-1 focus:ring-teal-500 shadow-sm"
                                    />
                                </div>

                                {/* Total Biaya (Rp) */}
                                <div className="lg:col-span-2">
                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                        Total Biaya (Rp)
                                    </label>
                                    <div className="rounded-xl border border-teal-200 bg-teal-50 px-3 py-2.5 text-xs font-bold text-teal-900 font-mono text-right flex items-center justify-end h-[38px] shadow-sm">
                                        <span>{formatRupiah(Number(inputQty || 0) * Number(inputPrice || 0))}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {quickAddError && (
                            <p className="mt-2 text-xs font-semibold text-rose-600 animate-fade-in">
                                ⚠️ {quickAddError}
                            </p>
                        )}

                        {/* Tombol + Tambah ke Daftar Usulan */}
                        <div className="flex justify-end mt-3">
                            <button
                                type="button"
                                onClick={handleAddItem}
                                className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs px-4 py-2 rounded-lg transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                            >
                                <span>+ Tambah ke Daftar Usulan</span>
                            </button>
                        </div>
                    </div>

                    {/* SECTION 5: Tabel Daftar Usulan Belanja */}
                    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs space-y-3">
                        <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-2 gap-2">
                            <h3 className="text-sm font-bold text-slate-900 border-b-2 border-emerald-500 pb-0.5 inline-block">
                                5. Daftar Barang yang Diusulkan
                            </h3>
                            <span className="text-xs font-semibold text-slate-600">
                                Total: <strong className="text-slate-900">{data.items.length}</strong> item belanja
                            </span>
                        </div>

                        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
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
                                            <td colSpan={7} className="px-6 py-10 text-center text-slate-400 italic">
                                                Belum ada barang di daftar usulan. Pilih klasifikasi rekening di atas dan masukkan rincian barang.
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
                                                        className="text-rose-600 hover:text-rose-800 font-bold text-xs transition cursor-pointer"
                                                    >
                                                        Hapus
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Summary Bar di Bawah Tabel */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pt-2 border-t border-slate-100">
                            <div className="text-xs text-slate-500 font-medium">
                                {data.items.length > 0 && (
                                    <span>
                                        Total <strong>{data.items.length}</strong> item usulan belanja
                                        {totalOperasional > 0 && totalModal > 0 && (
                                            <span className="ml-2 text-indigo-700 font-semibold">
                                                (Operasional: {formatRupiah(totalOperasional)} &bull; Modal: {formatRupiah(totalModal)})
                                            </span>
                                        )}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2.5 self-end">
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                                    TOTAL ESTIMASI USULAN:
                                </span>
                                <span className="text-base sm:text-lg font-black text-emerald-700 font-mono bg-emerald-50 px-3 py-0.5 rounded-lg border border-emerald-200">
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
                        className={`rounded-xl px-5 py-2 text-xs font-bold text-white shadow-xs transition cursor-pointer active:scale-95 ${
                            processing || data.items.length === 0
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
