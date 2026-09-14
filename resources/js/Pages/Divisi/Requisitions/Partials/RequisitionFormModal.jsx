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
    'BOX',
    'KIT',
    'PCS',
    'ROLL',
    'UNIT',
    'SET',
    'BOTOL',
    'BAG',
    'DUG',
    'BKS',
    'KTK',
    'JIRIGEN',
    'HELAI',
    'BH',
    'PAK',
    'RIM',
    'LEMBAR',
    'STEL',
    'BLOK',
    'KALI',
    'PAKET',
    'TABLET',
    'AMPUL',
    'VIAL',
    'METER',
    'KG',
    'LITER',
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

    // Filter pos rekening definitif (hanya leaf accounts yang valid dibebani belanja)
    const parentCodes = useMemo(() => {
        return new Set(rbaAccounts.map((a) => a.parent_code).filter(Boolean));
    }, [rbaAccounts]);

    const leafAccounts = useMemo(() => {
        return rbaAccounts.filter((acc) => !parentCodes.has(acc.account_code));
    }, [rbaAccounts, parentCodes]);

    // Opsi Sub Kegiatan Lengkap
    const resolvedSubKegiatanList = useMemo(() => {
        const baseOptions = [
            'Pelayanan dan Penunjang Pelayanan BLUD RS Jiwa Tampan',
            'PELAYANAN LABORATORIUM 2025',
            'PELAYANAN LABORATORIUM 2026',
            'Pelayanan Farmasi dan Pengelolaan Obat BLUD',
            'Penyelenggaraan Tata Kelola dan Administrasi BLUD',
            'Pemeliharaan Sarana, Prasarana, dan Alat Kesehatan Rumah Sakit',
            'Peningkatan Kompetensi SDM, Pendidikan, Pelatihan & Akreditasi Rumah Sakit',
            'Pengadaan Sarana dan Prasarana Medis/Non-Medis (Belanja Modal)',
        ];
        const merged = Array.from(new Set([...(subKegiatanOptions || []), ...baseOptions]));
        if (requisition?.sub_kegiatan && !merged.includes(requisition.sub_kegiatan)) {
            merged.unshift(requisition.sub_kegiatan);
        }
        return merged;
    }, [subKegiatanOptions, requisition]);

    // Form state Inertia
    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        jenis_belanja: initialJenis || 'Operasi',
        rba_account_id: '',
        budget_year: resolvedYear,
        fiscal_year: resolvedYear,
        sub_kegiatan: resolvedSubKegiatanList[0] || 'Pelayanan dan Penunjang Pelayanan BLUD RS Jiwa Tampan',
        nomor_surat_unit: '',
        urgency_reason: '',
        items: [],
    });

    // Quick Add Bar state (Input Cepat di Bagian Atas Tabel)
    const [newItemMode, setNewItemMode] = useState('catalog'); // 'catalog' | 'manual'
    const [selectedCatalogId, setSelectedCatalogId] = useState('');
    const [catalogSearchQuery, setCatalogSearchQuery] = useState('');
    const [isCatalogDropdownOpen, setIsCatalogDropdownOpen] = useState(false);
    const [manualName, setManualName] = useState('');
    const [manualUnit, setManualUnit] = useState('BOX');
    const [manualSpec, setManualSpec] = useState('');
    const [inputPrice, setInputPrice] = useState('');
    const [inputQty, setInputQty] = useState(1);
    const [quickAddError, setQuickAddError] = useState(null);
    const [submitError, setSubmitError] = useState(null);

    const qtyInputRef = useRef(null);
    const catalogSearchRef = useRef(null);
    const dropdownRef = useRef(null);

    // Rekening yang tersedia sesuai jenis belanja saat ini (Operasi vs Modal)
    const availableAccounts = useMemo(() => {
        return leafAccounts.filter((acc) => acc.kategori_belanja === data.jenis_belanja);
    }, [leafAccounts, data.jenis_belanja]);

    // Item katalog yang terdaftar untuk rekening terpilih
    const availableCatalogItems = useMemo(() => {
        if (!data.rba_account_id) return [];
        return items
            .filter((item) => String(item.rba_account_id) === String(data.rba_account_id))
            .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    }, [items, data.rba_account_id]);

    // Filter live search untuk katalog barang
    const filteredCatalogItems = useMemo(() => {
        if (!catalogSearchQuery.trim()) return availableCatalogItems.slice(0, 30);
        const q = catalogSearchQuery.toLowerCase();
        return availableCatalogItems
            .filter(
                (it) =>
                    it.name?.toLowerCase().includes(q) ||
                    it.item_code?.toLowerCase().includes(q) ||
                    it.specification?.toLowerCase().includes(q)
            )
            .slice(0, 30);
    }, [availableCatalogItems, catalogSearchQuery]);

    // Map item untuk lookup cepat
    const itemMap = useMemo(() => {
        const map = {};
        items.forEach((item) => {
            map[item.id] = item;
        });
        return map;
    }, [items]);

    // Tutup dropdown saat klik di luar
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target) &&
                catalogSearchRef.current &&
                !catalogSearchRef.current.contains(event.target)
            ) {
                setIsCatalogDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Sinkronisasi data saat modal dibuka
    useEffect(() => {
        if (!show) {
            clearErrors();
            setSelectedCatalogId('');
            setCatalogSearchQuery('');
            setIsCatalogDropdownOpen(false);
            setManualName('');
            setInputPrice('');
            setInputQty(1);
            setManualSpec('');
            setQuickAddError(null);
            setSubmitError(null);
            return;
        }

        if (requisition) {
            const yr = requisition.budget_year || requisition.fiscal_year || resolvedYear;
            const currentJenis = requisition.jenis_belanja || 'Operasi';

            setData({
                jenis_belanja: currentJenis,
                rba_account_id: requisition.rba_account_id || '',
                budget_year: yr,
                fiscal_year: yr,
                sub_kegiatan: requisition.sub_kegiatan || resolvedSubKegiatanList[0] || '',
                nomor_surat_unit: requisition.nomor_surat_unit || '',
                urgency_reason: requisition.urgency_reason || '',
                items: requisition.requisition_details?.length
                    ? requisition.requisition_details.map((d) => ({
                          item_id: d.item_id || '',
                          is_new: !d.item_id,
                          name: d.item?.name || d.item_name || '',
                          unit_type: (d.item?.unit_type || d.unit_type || 'BOX').toUpperCase(),
                          specification: d.item?.specification || d.specification || '',
                          unit_price:
                              d.unit_price !== null && d.unit_price !== undefined
                                  ? Number(d.unit_price)
                                  : d.item?.standard_price
                                  ? Number(d.item.standard_price)
                                  : '',
                          quantity: d.quantity_requested || 1,
                      }))
                    : [],
            });
        } else {
            const currentJenis = initialJenis || 'Operasi';
            const isLabUnit = unit?.name?.toLowerCase().includes('lab') || division?.name?.toLowerCase().includes('lab');
            let defaultAcc = null;

            if (isLabUnit) {
                defaultAcc = leafAccounts.find((acc) => acc.account_code === '1.1.2.1.3') || leafAccounts[0];
            } else {
                defaultAcc = leafAccounts.find((acc) => acc.kategori_belanja === currentJenis);
            }

            const defaultSub = isLabUnit
                ? resolvedSubKegiatanList.find((s) => s.toLowerCase().includes('laboratorium')) || resolvedSubKegiatanList[0]
                : resolvedSubKegiatanList[0];

            setData({
                jenis_belanja: currentJenis,
                rba_account_id: defaultAcc ? defaultAcc.id : '',
                budget_year: resolvedYear,
                fiscal_year: resolvedYear,
                sub_kegiatan: defaultSub || 'Pelayanan dan Penunjang Pelayanan BLUD RS Jiwa Tampan',
                nomor_surat_unit: '',
                urgency_reason: '',
                items: [],
            });
        }

        setSelectedCatalogId('');
        setCatalogSearchQuery('');
        setIsCatalogDropdownOpen(false);
        setManualName('');
        setInputPrice('');
        setInputQty(1);
        setManualSpec('');
        setQuickAddError(null);
        setSubmitError(null);
        clearErrors();
    }, [show, requisition, initialJenis, resolvedYear, leafAccounts, resolvedSubKegiatanList]);

    // Ganti jenis belanja secara manual (Operasi vs Modal)
    const handleJenisChange = (newJenis) => {
        const matchingAccs = leafAccounts.filter((acc) => acc.kategori_belanja === newJenis);
        setData((prev) => ({
            ...prev,
            jenis_belanja: newJenis,
            rba_account_id: matchingAccs[0]?.id || '',
            items: [],
        }));
        setSelectedCatalogId('');
        setCatalogSearchQuery('');
        setIsCatalogDropdownOpen(false);
        setInputPrice('');
    };

    // Ganti Pos Rekening dari Dropdown
    const handleAccountChange = (newAccountId) => {
        setData((prev) => ({
            ...prev,
            rba_account_id: newAccountId,
            items: [],
        }));
        setSelectedCatalogId('');
        setCatalogSearchQuery('');
        setIsCatalogDropdownOpen(false);
        setInputPrice('');
    };

    // Pilih barang dari live search katalog
    const handleSelectCatalogItem = (it) => {
        setSelectedCatalogId(it.id);
        setCatalogSearchQuery(it.name);
        setIsCatalogDropdownOpen(false);
        setInputPrice(it.standard_price !== null && it.standard_price !== undefined ? it.standard_price : '');
        setManualUnit((it.unit_type || 'BOX').toUpperCase());
        setManualSpec(it.specification || '');
        setQuickAddError(null);

        // Langsung fokus ke field volume
        setTimeout(() => {
            if (qtyInputRef.current) {
                qtyInputRef.current.focus();
                qtyInputRef.current.select();
            }
        }, 50);
    };

    const handleClearCatalogSelection = () => {
        setSelectedCatalogId('');
        setCatalogSearchQuery('');
        setInputPrice('');
        setManualUnit('BOX');
        setManualSpec('');
        setIsCatalogDropdownOpen(true);
        if (catalogSearchRef.current) {
            catalogSearchRef.current.focus();
        }
    };

    // Tambah barang dari Quick Add Bar ke tabel (Langsung di atas, bebas scroll)
    const handleAddFromQuickBar = () => {
        const qty = parseInt(inputQty, 10);
        const price = parseFloat(inputPrice);

        if (newItemMode === 'catalog') {
            if (!selectedCatalogId) {
                setQuickAddError('Silakan pilih barang dari katalog terlebih dahulu.');
                return;
            }
            if (isNaN(qty) || qty < 1) {
                setQuickAddError('Jumlah/volume barang minimal 1 unit.');
                return;
            }

            const it = itemMap[selectedCatalogId];
            const newItem = {
                item_id: selectedCatalogId,
                is_new: false,
                name: it?.name || catalogSearchQuery || '',
                unit_type: (it?.unit_type || manualUnit || 'BOX').toUpperCase(),
                specification: it?.specification || manualSpec || '',
                unit_price: !isNaN(price) && price >= 0 ? price : Number(it?.standard_price || 0),
                quantity: qty,
            };

            setData('items', [...data.items, newItem]);
            setSelectedCatalogId('');
            setCatalogSearchQuery('');
            setInputPrice('');
            setInputQty(1);
            setManualSpec('');
            setQuickAddError(null);

            // Fokuskan kembali ke pencarian barang
            if (catalogSearchRef.current) {
                catalogSearchRef.current.focus();
            }
        } else {
            // Mode Barang Baru (Manual)
            if (!manualName || !manualName.trim()) {
                setQuickAddError('Silakan ketik nama barang atau komponen biaya baru.');
                return;
            }
            if (isNaN(qty) || qty < 1) {
                setQuickAddError('Jumlah/volume barang minimal 1 unit.');
                return;
            }
            if (isNaN(price) || price <= 0) {
                setQuickAddError('Estimasi harga satuan barang baru harus lebih dari Rp 0.');
                return;
            }

            const newItem = {
                item_id: '',
                is_new: true,
                name: manualName.trim(),
                unit_type: (manualUnit || 'BOX').toUpperCase(),
                specification: manualSpec.trim(),
                unit_price: price,
                quantity: qty,
            };

            setData('items', [...data.items, newItem]);
            setManualName('');
            setInputPrice('');
            setInputQty(1);
            setManualSpec('');
            setQuickAddError(null);
        }
    };

    // Update field baris barang langsung di dalam tabel
    const updateItemRow = (index, field, value) => {
        const newItems = [...data.items];
        newItems[index] = {
            ...newItems[index],
            [field]: value,
        };
        setData('items', newItems);
    };

    // Hapus baris barang dari tabel
    const removeItemRow = (index) => {
        setData('items', data.items.filter((_, idx) => idx !== index));
    };

    // Hitung akumulasi kuantitas & total estimasi biaya
    const { grandTotal, totalQuantity } = useMemo(() => {
        let sum = 0;
        let qtyTotal = 0;
        data.items.forEach((row) => {
            const qty = parseInt(row.quantity, 10) || 0;
            const price = parseFloat(row.unit_price) || 0;
            if (qty > 0 && price >= 0) {
                sum += price * qty;
                qtyTotal += qty;
            }
        });
        return { grandTotal: sum, totalQuantity: qtyTotal };
    }, [data.items]);

    // Validasi & Simpan Pengajuan (Frictionless / Tanpa Modal Konfirmasi Ganda)
    const handleSubmit = (e) => {
        e?.preventDefault();
        setSubmitError(null);

        // 1. Validasi rekening
        if (!data.rba_account_id) {
            setSubmitError('Silakan pilih pos kode rekening belanja RBA BLUD yang sesuai.');
            return;
        }

        // 2. Validasi barang
        if (data.items.length === 0) {
            setSubmitError('Daftar barang masih kosong. Silakan masukkan minimal 1 barang ke dalam usulan menggunakan formulir input di atas.');
            return;
        }

        // 3. Validasi baris barang
        for (let i = 0; i < data.items.length; i++) {
            const row = data.items[i];
            const qty = parseInt(row.quantity, 10);
            const price = parseFloat(row.unit_price);

            if (row.is_new && (!row.name || !row.name.trim())) {
                setSubmitError(`Baris #${i + 1}: Nama komponen/barang belum diisi.`);
                return;
            }
            if (isNaN(qty) || qty < 1) {
                setSubmitError(`Baris #${i + 1}: Jumlah/volume barang minimal 1.`);
                return;
            }
            if (isNaN(price) || price <= 0) {
                setSubmitError(`Baris #${i + 1}: Harga satuan barang harus lebih dari Rp 0.`);
                return;
            }
        }

        // Kirim langsung (Frictionless) dengan status loading pada tombol
        if (isEdit) {
            put(route('requisitions.update', requisition.id), {
                preserveScroll: true,
                onSuccess: () => onClose(),
                onError: (err) => {
                    setSubmitError(Object.values(err)[0] || 'Terjadi kesalahan saat menyimpan perubahan.');
                },
            });
        } else {
            post(route('requisitions.store'), {
                preserveScroll: true,
                onSuccess: () => {
                    reset();
                    onClose();
                },
                onError: (err) => {
                    setSubmitError(Object.values(err)[0] || 'Terjadi kesalahan saat mengirim usulan.');
                },
            });
        }
    };

    return (
        <Modal show={show} onClose={onClose} maxWidth="5xl">
            <div className="flex flex-col max-h-[92vh] bg-white rounded-2xl overflow-hidden shadow-xl">
                {/* 1. Modal Header Bersih & Terang */}
                <div className="shrink-0 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-3.5">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700 font-bold border border-teal-100 text-base">
                            {isEdit ? '📝' : '📄'}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-base font-bold text-slate-900">
                                    {isEdit ? 'Ubah Usulan Belanja' : 'Formulir Usulan Belanja E-BLUD'}
                                </h2>
                                <span className="inline-flex items-center rounded-md bg-teal-50 px-2 py-0.5 text-[11px] font-bold text-teal-800 border border-teal-200">
                                    TA {data.fiscal_year}
                                </span>
                            </div>
                            <p className="text-xs text-slate-500">
                                Unit: <strong className="text-slate-700">{unit?.name || 'Unit Pemohon'}</strong> ({division?.name || 'Bidang'})
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer"
                        title="Tutup dialog"
                    >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* 2. Modal Body (Scrollable Form) */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/40">
                    {/* Inline Error Alert */}
                    {submitError && (
                        <div className="flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-800">
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

                    {errors.division && (
                        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700">
                            {errors.division}
                        </div>
                    )}

                    {/* SECTION 1: Pengaturan Dokumen & Pos Rekening */}
                    <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs space-y-3">
                        {/* Baris 1: Jenis Belanja & Pos Rekening */}
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                            {/* Toggle Jenis Belanja */}
                            <div className="sm:col-span-4">
                                <label className="mb-1 block text-xs font-bold text-slate-700">
                                    Jenis Belanja <span className="text-rose-500">*</span>
                                </label>
                                <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-xl">
                                    <button
                                        type="button"
                                        onClick={() => handleJenisChange('Operasi')}
                                        className={`py-1.5 px-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                                            data.jenis_belanja === 'Operasi'
                                                ? 'bg-white text-teal-800 shadow-2xs'
                                                : 'text-slate-600 hover:text-slate-900'
                                        }`}
                                    >
                                        ⚡ Operasional
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleJenisChange('Modal')}
                                        className={`py-1.5 px-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                                            data.jenis_belanja === 'Modal'
                                                ? 'bg-white text-teal-800 shadow-2xs'
                                                : 'text-slate-600 hover:text-slate-900'
                                        }`}
                                    >
                                        🏢 Modal
                                    </button>
                                </div>
                            </div>

                            {/* Dropdown Pos Rekening Belanja */}
                            <div className="sm:col-span-8">
                                <label className="mb-1 block text-xs font-bold text-slate-700">
                                    Pos Rekening Belanja BLUD <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    value={data.rba_account_id}
                                    onChange={(e) => handleAccountChange(e.target.value)}
                                    className="block w-full rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-900 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition cursor-pointer"
                                >
                                    <option value="" disabled>-- Pilih Pos Rekening Belanja --</option>
                                    {availableAccounts.map((acc) => (
                                        <option key={acc.id} value={acc.id}>
                                            [{acc.account_code}] {acc.account_name}
                                        </option>
                                    ))}
                                </select>
                                {errors.rba_account_id && (
                                    <p className="mt-0.5 text-xs text-rose-600 font-medium">{errors.rba_account_id}</p>
                                )}
                            </div>
                        </div>

                        {/* Baris 2: Sub Kegiatan, Tahun Anggaran, & No. Nota Dinas */}
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2 border-t border-slate-100">
                            <div className="sm:col-span-6">
                                <label className="mb-1 block text-xs font-bold text-slate-700">
                                    Sub Kegiatan Rumah Sakit <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    value={data.sub_kegiatan}
                                    onChange={(e) => setData('sub_kegiatan', e.target.value)}
                                    className="block w-full rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition"
                                >
                                    {resolvedSubKegiatanList.map((sub, sIdx) => (
                                        <option key={sIdx} value={sub}>
                                            {sub}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="sm:col-span-3">
                                <label className="mb-1 block text-xs font-bold text-slate-700">
                                    Tahun Anggaran
                                </label>
                                <div className="flex items-center gap-2 rounded-xl border border-teal-200 bg-teal-50/60 px-3 py-1.5 text-xs font-bold text-teal-900">
                                    <span className="h-2 w-2 rounded-full bg-teal-600" />
                                    <span>TA {data.budget_year || data.fiscal_year || resolvedYear}</span>
                                </div>
                            </div>

                            <div className="sm:col-span-3">
                                <label className="mb-1 block text-xs font-bold text-slate-700">
                                    No. Nota Dinas <span className="text-slate-400 font-normal">(Opsional)</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.nomor_surat_unit}
                                    onChange={(e) => setData('nomor_surat_unit', e.target.value)}
                                    placeholder="Contoh: 020/LAB/2026"
                                    className="block w-full rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition"
                                />
                            </div>
                        </div>

                        {/* Baris 3: Urgensi Kebutuhan (Opsional) */}
                        <div className="pt-2 border-t border-slate-100">
                            <label className="mb-1 block text-xs font-bold text-slate-700">
                                Alasan / Urgensi Kebutuhan Belanja <span className="text-slate-400 font-normal">(Opsional - Dicetak pada Nota Dinas)</span>
                            </label>
                            <textarea
                                rows={2}
                                value={data.urgency_reason}
                                onChange={(e) => setData('urgency_reason', e.target.value)}
                                placeholder="Contoh: Kebutuhan reagen dan bahan habis pakai untuk pelayanan pasien rawat inap dan IGD bulan berjalan..."
                                className="block w-full rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition"
                            />
                        </div>
                    </div>

                    {/* SECTION 2: Input Cepat Tambah Barang & Tabel Rincian Biaya */}
                    <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-2">
                            <div>
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                                    Daftar Komponen Biaya / Barang
                                </h3>
                                <p className="text-[11px] text-slate-500">
                                    Cari atau ketik nama barang di formulir input di bawah ini, lalu klik <strong className="text-teal-700">+ Masukkan</strong>.
                                </p>
                            </div>

                            {/* Mode Penginputan: Dari Katalog vs Barang Baru */}
                            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs self-start sm:self-center">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setNewItemMode('catalog');
                                        setQuickAddError(null);
                                    }}
                                    className={`px-3 py-1 rounded-md transition cursor-pointer ${
                                        newItemMode === 'catalog'
                                            ? 'bg-white text-teal-800 shadow-2xs font-bold'
                                            : 'text-slate-600 hover:text-slate-900 font-semibold'
                                    }`}
                                >
                                    Dari Katalog BLUD ({availableCatalogItems.length})
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setNewItemMode('manual');
                                        setQuickAddError(null);
                                    }}
                                    className={`px-3 py-1 rounded-md transition cursor-pointer ${
                                        newItemMode === 'manual'
                                            ? 'bg-white text-teal-800 shadow-2xs font-bold'
                                            : 'text-slate-600 hover:text-slate-900 font-semibold'
                                    }`}
                                >
                                    ✨ + Barang Baru (Manual)
                                </button>
                            </div>
                        </div>

                        {/* FORM INPUT CEPAT (QUICK ADD BAR) DENGAN LIVE SEARCH */}
                        <div className="p-3 bg-teal-50/50 border border-teal-100 rounded-xl space-y-2">
                            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end">
                                {newItemMode === 'catalog' ? (
                                    <div className="sm:col-span-5 relative">
                                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                            Cari Barang dari Katalog BLUD
                                        </label>
                                        <div className="relative">
                                            <input
                                                ref={catalogSearchRef}
                                                type="text"
                                                value={catalogSearchQuery}
                                                onChange={(e) => {
                                                    setCatalogSearchQuery(e.target.value);
                                                    setIsCatalogDropdownOpen(true);
                                                    if (selectedCatalogId) {
                                                        setSelectedCatalogId('');
                                                    }
                                                }}
                                                onFocus={() => setIsCatalogDropdownOpen(true)}
                                                placeholder="Ketik nama barang... (contoh: device, kit, spuit)"
                                                className="block w-full rounded-lg border border-slate-300 bg-white pl-3 pr-8 py-1.5 text-xs text-slate-900 font-semibold focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                                            />
                                            {catalogSearchQuery && (
                                                <button
                                                    type="button"
                                                    onClick={handleClearCatalogSelection}
                                                    className="absolute inset-y-0 right-0 flex items-center pr-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                                                    title="Hapus pilihan"
                                                >
                                                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            )}
                                        </div>

                                        {/* Floating Live Search Dropdown */}
                                        {isCatalogDropdownOpen && (
                                            <div
                                                ref={dropdownRef}
                                                className="absolute left-0 right-0 z-50 mt-1 max-h-56 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg text-xs"
                                            >
                                                {filteredCatalogItems.length === 0 ? (
                                                    <div className="p-3 text-center text-slate-500">
                                                        <p className="font-semibold text-xs text-slate-700">Tidak ada barang yang cocok</p>
                                                        <p className="text-[11px] text-slate-400 mt-0.5">Barang belum terdaftar di katalog pos rekening ini.</p>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setNewItemMode('manual');
                                                                setManualName(catalogSearchQuery);
                                                                setIsCatalogDropdownOpen(false);
                                                            }}
                                                            className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-teal-700 bg-teal-50 border border-teal-200 rounded-lg px-2.5 py-1 hover:bg-teal-100 transition cursor-pointer"
                                                        >
                                                            ✨ + Input Sebagai Barang Baru
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <ul className="divide-y divide-slate-100">
                                                        {filteredCatalogItems.map((it) => (
                                                            <li
                                                                key={it.id}
                                                                onMouseDown={() => handleSelectCatalogItem(it)}
                                                                className="px-3 py-2 hover:bg-teal-50 cursor-pointer transition flex items-center justify-between gap-2"
                                                            >
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="font-bold text-slate-900 truncate">
                                                                        {it.name}
                                                                    </div>
                                                                    {it.specification && (
                                                                        <div className="text-[10px] text-slate-400 truncate">
                                                                            {it.specification}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="flex items-center gap-1.5 shrink-0 text-right">
                                                                    <span className="inline-flex rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">
                                                                        {it.unit_type || 'BOX'}
                                                                    </span>
                                                                    <span className="font-mono font-bold text-teal-800 text-[11px]">
                                                                        {formatRupiah(it.standard_price)}
                                                                    </span>
                                                                </div>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="sm:col-span-5">
                                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                            Nama Barang / Bahan Baru
                                        </label>
                                        <input
                                            type="text"
                                            value={manualName}
                                            onChange={(e) => setManualName(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFromQuickBar())}
                                            placeholder="Contoh: MULTI 6 DRUG TEST DEVICE"
                                            className="block w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 font-semibold focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                                        />
                                    </div>
                                )}

                                <div className="sm:col-span-2">
                                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                        Satuan
                                    </label>
                                    {newItemMode === 'catalog' ? (
                                        <input
                                            type="text"
                                            readOnly
                                            value={manualUnit}
                                            className="block w-full rounded-lg border border-slate-200 bg-slate-100 px-2 py-1.5 text-xs font-bold text-center text-slate-700"
                                        />
                                    ) : (
                                        <select
                                            value={manualUnit}
                                            onChange={(e) => setManualUnit(e.target.value)}
                                            className="block w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs font-bold text-center text-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                                        >
                                            {COMMON_UNITS.map((u) => (
                                                <option key={u} value={u}>
                                                    {u}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                        Harga Satuan (Rp)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="any"
                                        value={inputPrice}
                                        onChange={(e) => setInputPrice(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFromQuickBar())}
                                        placeholder="0"
                                        className="block w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs text-right font-semibold text-slate-900 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                                    />
                                </div>

                                <div className="sm:col-span-1">
                                    <label className="block text-[11px] font-bold text-slate-700 mb-1 text-center">
                                        Vol
                                    </label>
                                    <input
                                        ref={qtyInputRef}
                                        type="number"
                                        min="1"
                                        value={inputQty}
                                        onChange={(e) => setInputQty(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFromQuickBar())}
                                        className="block w-full rounded-lg border border-slate-300 bg-white px-1 py-1.5 text-xs text-center font-bold text-slate-900 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <button
                                        type="button"
                                        onClick={handleAddFromQuickBar}
                                        className="w-full inline-flex items-center justify-center gap-1 rounded-lg bg-teal-600 hover:bg-teal-700 active:scale-95 px-3 py-1.5 text-xs font-bold text-white shadow-2xs transition cursor-pointer"
                                    >
                                        <span>+ Masukkan</span>
                                    </button>
                                </div>
                            </div>

                            {/* Quick Add Error message */}
                            {quickAddError && (
                                <p className="text-[11px] font-bold text-rose-600 pt-0.5 flex items-center gap-1">
                                    <span>⚠️</span> {quickAddError}
                                </p>
                            )}
                        </div>

                        {/* TABEL RINCIAN BIAYA (BERSIH & LAPANG PERSIS DOKUMEN RS) */}
                        <div className="overflow-x-auto rounded-xl border border-slate-200">
                            <table className="min-w-full divide-y divide-slate-200 bg-white text-xs">
                                <thead className="bg-slate-50 text-slate-700 uppercase tracking-wider text-[11px] font-bold">
                                    <tr>
                                        <th className="w-10 px-3 py-2.5 text-center">No</th>
                                        <th className="px-4 py-2.5 text-left min-w-[280px]">
                                            Komponen Biaya / Nama Barang
                                        </th>
                                        <th className="w-24 px-3 py-2.5 text-center">Satuan</th>
                                        <th className="w-32 px-3 py-2.5 text-right">Harga Satuan (Rp)</th>
                                        <th className="w-24 px-3 py-2.5 text-center">Jumlah (Vol)</th>
                                        <th className="w-36 px-3 py-2.5 text-right">Jumlah Anggaran (Rp)</th>
                                        <th className="w-12 px-2 py-2.5 text-center">Hapus</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {data.items.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="px-4 py-8 text-center text-slate-400">
                                                <p className="text-xs font-medium">
                                                    Belum ada barang di dalam tabel.
                                                </p>
                                                <p className="text-[11px] text-slate-400 mt-0.5">
                                                    Gunakan formulir input hijau toska di atas untuk menambahkan barang ke daftar usulan.
                                                </p>
                                            </td>
                                        </tr>
                                    ) : (
                                        data.items.map((row, index) => {
                                            const rowQty = parseInt(row.quantity, 10) || 0;
                                            const unitPrice = parseFloat(row.unit_price) || 0;
                                            const rowSubtotal = unitPrice * rowQty;

                                            return (
                                                <tr key={index} className="hover:bg-slate-50/70 transition">
                                                    {/* No */}
                                                    <td className="whitespace-nowrap px-3 py-2 text-center text-slate-500 font-semibold align-middle">
                                                        {index + 1}
                                                    </td>

                                                    {/* Nama Barang */}
                                                    <td className="px-4 py-2 align-middle">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-bold text-slate-900">
                                                                {row.name}
                                                            </span>
                                                            {row.is_new && (
                                                                <span className="inline-flex rounded bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 border border-amber-200">
                                                                    Manual
                                                                </span>
                                                            )}
                                                        </div>
                                                        {row.specification && (
                                                            <p className="text-[11px] text-slate-400 mt-0.5">
                                                                {row.specification}
                                                            </p>
                                                        )}
                                                    </td>

                                                    {/* Satuan */}
                                                    <td className="whitespace-nowrap px-3 py-2 text-center align-middle">
                                                        <span className="inline-flex rounded-md bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-700">
                                                            {row.unit_type || 'BOX'}
                                                        </span>
                                                    </td>

                                                    {/* Harga Satuan (Bisa disesuaikan langsung di tabel) */}
                                                    <td className="whitespace-nowrap px-3 py-2 text-right align-middle">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            step="any"
                                                            value={row.unit_price}
                                                            onChange={(e) => updateItemRow(index, 'unit_price', e.target.value)}
                                                            className="w-28 text-right text-xs font-semibold rounded-lg border border-slate-300 py-1 px-2 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                                                        />
                                                    </td>

                                                    {/* Jumlah Volume (Bisa disesuaikan langsung di tabel) */}
                                                    <td className="whitespace-nowrap px-3 py-2 text-center align-middle">
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            value={row.quantity}
                                                            onChange={(e) => updateItemRow(index, 'quantity', e.target.value)}
                                                            className="w-16 text-center text-xs font-bold rounded-lg border border-slate-300 py-1 px-1.5 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                                                        />
                                                    </td>

                                                    {/* Jumlah Anggaran Subtotal */}
                                                    <td className="whitespace-nowrap px-3 py-2 text-right align-middle font-bold text-teal-800">
                                                        {formatRupiah(rowSubtotal)}
                                                    </td>

                                                    {/* Tombol Hapus */}
                                                    <td className="whitespace-nowrap px-2 py-2 text-center align-middle">
                                                        <button
                                                            type="button"
                                                            onClick={() => removeItemRow(index)}
                                                            className="rounded-lg p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer"
                                                            title="Hapus baris ini"
                                                        >
                                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                                            </svg>
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                                {data.items.length > 0 && (
                                    <tfoot className="border-t-2 border-slate-300 bg-slate-50 font-bold">
                                        <tr>
                                            <td colSpan={4} className="px-4 py-2.5 text-right uppercase text-[11px] text-slate-700">
                                                Total Akumulasi Anggaran Usulan Belanja:
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-2.5 text-center text-xs font-black text-slate-900">
                                                {totalQuantity}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-2.5 text-right text-sm font-bold text-teal-800">
                                                {formatRupiah(grandTotal)}
                                            </td>
                                            <td></td>
                                        </tr>
                                    </tfoot>
                                )}
                            </table>
                        </div>
                    </div>
                </form>

                {/* 3. Modal Footer Bersih & Sederhana */}
                <div className="shrink-0 border-t border-slate-100 bg-white px-6 py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-500">
                            Total Usulan: <strong className="text-slate-800">{data.items.length} macam</strong> ({totalQuantity} unit)
                        </span>
                        <span className="text-slate-300">&bull;</span>
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-xs text-slate-500 font-medium">Jumlah Anggaran:</span>
                            <span className="text-lg font-bold text-teal-800">
                                {formatRupiah(grandTotal)}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={processing}
                            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                        >
                            Batal
                        </button>

                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={processing || grandTotal <= 0}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-95 px-5 py-2 text-xs font-bold text-white shadow-xs transition disabled:opacity-50 cursor-pointer"
                        >
                            {processing ? (
                                <>
                                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                                    </svg>
                                    <span>Menyimpan...</span>
                                </>
                            ) : (
                                <span>{isEdit ? 'Simpan Perubahan' : 'Kirim Usulan Belanja'}</span>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
