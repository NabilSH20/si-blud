import Modal from '@/Components/Modal';
import PerencanaanLayout from '@/Layouts/PerencanaanLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useMemo, useState, useEffect, Fragment } from 'react';

const formatRupiah = (value, zeroAsDash = true) => {
    const val = Number(value || 0);
    if (val === 0) return zeroAsDash ? '-' : 'Rp 0';
    if (val < 0) {
        return `(${new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(Math.abs(val))})`;
    }
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(val);
};

export default function Index({
    shifts = [],
    current_shift = null,
    expense_items = [],
    revenue_items = [],
    catalog_items = [],
    accounts_with_proposed = [],
    summary = {},
    revenue_summary = {},
    ringkasan_rba = {},
    selected_year = 2026,
    available_years = [2026, 2027],
    current_year = 2026,
    active_tab = 'RINGKASAN',
    is_murni = false,
    approved_requisitions_total = 0,
    approved_requisitions_count = 0,
}) {
    const [activeTab, setActiveTab] = useState(active_tab || 'RINGKASAN');
    const [showOnlyWithItems, setShowOnlyWithItems] = useState(true);
    const [statusFilter, setStatusFilter] = useState('DISETUJUI'); // 'DISETUJUI' | 'SEMUA'
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState('ALL'); // ALL, OPERASI, MODAL
    const [revenueSearchQuery, setRevenueSearchQuery] = useState('');
    const [revenueCategoryFilter, setRevenueCategoryFilter] = useState('ALL'); // ALL, '1', '3', '4', '5'
    const [revenueViewMode, setRevenueViewMode] = useState('RINGKAS'); // 'RINGKAS' | 'PERGESERAN'
    const [expenseSearchQuery, setExpenseSearchQuery] = useState('');
    const [expenseCategoryFilter, setExpenseCategoryFilter] = useState('ALL'); // ALL, OPERASI, MODAL
    const [expenseMatrixMode, setExpenseMatrixMode] = useState('RINGKAS'); // 'RINGKAS' | 'LENGKAP'
    const [showShiftModal, setShowShiftModal] = useState(false);
    const [showPembiayaanModal, setShowPembiayaanModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [editingRevenueItem, setEditingRevenueItem] = useState(null);
    const [activatingShift, setActivatingShift] = useState(null);
    const [deletingShift, setDeletingShift] = useState(null);
    const [printDropdownOpen, setPrintDropdownOpen] = useState(false);

    useEffect(() => {
        if (active_tab) {
            setActiveTab(active_tab);
        }
    }, [active_tab]);

    // Form for creating new shift
    const shiftForm = useForm({
        year: current_year,
        shift_name: '',
        doc_title: '',
        period_month: '',
        notes: '',
    });

    // Form for editing expense item
    const itemForm = useForm({
        after_jasa_layanan: 0,
        after_hasil_kerjasama: 0,
        after_lain_lain_sah: 0,
        after_silpa: 0,
        after_apbd: 0,
        keterangan: '',
    });

    // Form for editing revenue item
    const revenueItemForm = useForm({
        after_amount: 0,
    });

    // Form for editing Pembiayaan
    const pembiayaanForm = useForm({
        penerimaan_silpa: current_shift?.penerimaan_silpa || 0,
        penerimaan_divestasi: current_shift?.penerimaan_divestasi || 0,
        penerimaan_pinjaman: current_shift?.penerimaan_pinjaman || 0,
        pengeluaran_investasi: current_shift?.pengeluaran_investasi || 0,
        pengeluaran_pokok_utang: current_shift?.pengeluaran_pokok_utang || 0,
    });

    const handleOpenEditModal = (item) => {
        if (item.is_header) return;
        setEditingItem(item);
        itemForm.setData({
            after_jasa_layanan: item.after_jasa_layanan || 0,
            after_hasil_kerjasama: item.after_hasil_kerjasama || 0,
            after_lain_lain_sah: item.after_lain_lain_sah || 0,
            after_silpa: item.after_silpa || 0,
            after_apbd: item.after_apbd || 0,
            keterangan: item.keterangan || '',
        });
    };

    const handleOpenEditRevenueModal = (item) => {
        if (item.is_header || item.item_code === '0') return;
        setEditingRevenueItem(item);
        revenueItemForm.setData({
            after_amount: item.after_amount || 0,
        });
    };

    const handleOpenPembiayaanModal = () => {
        pembiayaanForm.setData({
            penerimaan_silpa: current_shift?.penerimaan_silpa || 0,
            penerimaan_divestasi: current_shift?.penerimaan_divestasi || 0,
            penerimaan_pinjaman: current_shift?.penerimaan_pinjaman || 0,
            pengeluaran_investasi: current_shift?.pengeluaran_investasi || 0,
            pengeluaran_pokok_utang: current_shift?.pengeluaran_pokok_utang || 0,
        });
        setShowPembiayaanModal(true);
    };

    const submitItemEdit = (e) => {
        e.preventDefault();
        if (!editingItem) return;

        itemForm.patch(route('perencanaan.rba.items.update', editingItem.id), {
            preserveScroll: true,
            onSuccess: () => setEditingItem(null),
        });
    };

    const submitRevenueItemEdit = (e) => {
        e.preventDefault();
        if (!editingRevenueItem) return;

        revenueItemForm.patch(route('perencanaan.rba.revenue-items.update', editingRevenueItem.id), {
            preserveScroll: true,
            onSuccess: () => setEditingRevenueItem(null),
        });
    };

    const submitPembiayaanEdit = (e) => {
        e.preventDefault();
        if (!current_shift) return;

        pembiayaanForm.patch(route('perencanaan.rba.pembiayaan.update', current_shift.id), {
            preserveScroll: true,
            onSuccess: () => setShowPembiayaanModal(false),
        });
    };

    const handleOpenCreateShift = () => {
        // Detect existing shifts for selected year to suggest next sequence
        const existingNames = shifts.map((s) => (s.shift_name || '').toLowerCase());
        let nextName = 'Pergeseran I';
        let nextPeriod = `April ${selected_year}`;

        if (existingNames.some((n) => n.includes('pergeseran iv') || n.includes('pergeseran 4'))) {
            nextName = 'Pergeseran V';
            nextPeriod = `November ${selected_year}`;
        } else if (existingNames.some((n) => n.includes('pergeseran iii') || n.includes('pergeseran 3'))) {
            nextName = 'Pergeseran IV';
            nextPeriod = `Oktober ${selected_year}`;
        } else if (existingNames.some((n) => n.includes('pergeseran ii') || n.includes('pergeseran 2'))) {
            nextName = 'Pergeseran III';
            nextPeriod = `Juli ${selected_year}`;
        } else if (existingNames.some((n) => n.includes('pergeseran i') || n.includes('pergeseran 1'))) {
            nextName = 'Pergeseran II';
            nextPeriod = `Juni ${selected_year}`;
        } else if (existingNames.some((n) => n.includes('murni'))) {
            nextName = 'Pergeseran I';
            nextPeriod = `April ${selected_year}`;
        }

        shiftForm.setData({
            year: selected_year,
            shift_name: nextName,
            doc_title: `PERUBAHAN RENCANA BISNIS DAN ANGGARAN BLUD (${nextName.toUpperCase()}) T.A. ${selected_year}`,
            period_month: nextPeriod,
            notes: '',
        });
        setShowShiftModal(true);
    };

    const submitCreateShift = (e) => {
        e.preventDefault();
        shiftForm.post(route('perencanaan.rba.shifts.store'), {
            onSuccess: () => {
                setShowShiftModal(false);
                shiftForm.reset();
            },
        });
    };

    const confirmActivate = () => {
        if (!activatingShift) return;
        router.patch(route('perencanaan.rba.activate', activatingShift.id), {}, {
            preserveScroll: true,
            onSuccess: () => setActivatingShift(null),
        });
    };

    // Filter revenue items for Tab 2 (Target Pendapatan BLUD)
    const filteredRevenueItems = useMemo(() => {
        let list = revenue_items;
        const query = revenueSearchQuery.trim().toLowerCase();

        // 1. Filter by category
        if (revenueCategoryFilter !== 'ALL') {
            list = list.filter((item) =>
                item.item_code === '0' ||
                item.item_code === revenueCategoryFilter ||
                item.parent_code === revenueCategoryFilter
            );
        }

        // 2. Filter by search query
        if (query) {
            const matchingLeafCodes = new Set();
            const matchingParentCodes = new Set();

            list.forEach((item) => {
                const matches =
                    item.item_name?.toLowerCase().includes(query) ||
                    item.item_code?.toLowerCase().includes(query);

                if (matches) {
                    if (!item.is_header && item.item_code !== '0') {
                        matchingLeafCodes.add(item.id);
                        if (item.parent_code) matchingParentCodes.add(item.parent_code);
                    } else if (item.is_header) {
                        matchingParentCodes.add(item.item_code);
                    }
                }
            });

            list = list.filter((item) => {
                if (item.item_code === '0') return true;
                if (matchingParentCodes.has(item.item_code)) return true;
                if (matchingLeafCodes.has(item.id)) return true;
                if (matchingParentCodes.has(item.parent_code)) return true;
                return false;
            });
        }

        return list;
    }, [revenue_items, revenueCategoryFilter, revenueSearchQuery]);

    // Filter expense items for Tab 3 (Anggaran Belanja BLUD)
    const filteredExpenseItems = useMemo(() => {
        return expense_items.filter((item) => {
            const query = expenseSearchQuery.trim().toLowerCase();
            const matchesSearch =
                query === '' ||
                item.account_code?.toLowerCase().includes(query) ||
                item.account_name?.toLowerCase().includes(query) ||
                item.keterangan?.toLowerCase().includes(query);

            const matchesCategory =
                expenseCategoryFilter === 'ALL' ||
                (expenseCategoryFilter === 'OPERASI' && item.account_code.startsWith('1.1')) ||
                (expenseCategoryFilter === 'MODAL' && item.account_code.startsWith('1.2'));

            return matchesSearch && matchesCategory;
        });
    }, [expense_items, expenseSearchQuery, expenseCategoryFilter]);

    // Filter catalog items for Tab 4
    const filteredCatalogItems = useMemo(() => {
        if (!searchQuery.trim()) return catalog_items;
        const q = searchQuery.toLowerCase();
        return catalog_items.filter((it) =>
            it.name?.toLowerCase().includes(q) ||
            it.item_code?.toLowerCase().includes(q) ||
            it.specification?.toLowerCase().includes(q) ||
            it.rba_account?.account_name?.toLowerCase().includes(q) ||
            it.rba_account?.account_code?.toLowerCase().includes(q)
        );
    }, [catalog_items, searchQuery]);

    // Group accounts with proposed items for Tab 4 (Rincian Usulan Belanja Unit)
    const {
        listOperasi,
        listModal,
        totalUsulanCount,
        totalUsulanNominal,
        totalUsulanOperasi,
        totalUsulanModal,
        accountsWithItemsCount,
    } = useMemo(() => {
        const query = searchQuery.toLowerCase().trim();

        // 1. Attach active items filtered by statusFilter
        const withActive = accounts_with_proposed.map((acc) => {
            const rawItems = acc.proposed_items || [];
            const activeItems = rawItems.filter((it) => {
                if (statusFilter === 'DISETUJUI') {
                    return it.status === 'Disetujui_Selesai';
                }
                return true;
            });

            const directNominal = activeItems.reduce((s, it) => s + (it.resolved_subtotal || it.subtotal || 0), 0);
            const directCount = activeItems.length;

            return {
                ...acc,
                active_items: activeItems,
                active_total: directNominal,
                active_count: directCount,
            };
        });

        // 2. Map by account_code for fast hierarchy lookup
        const byCode = {};
        withActive.forEach((a) => {
            byCode[a.account_code] = a;
        });

        const getDescendants = (code) => {
            let desc = [];
            withActive.forEach((a) => {
                if (a.parent_code === code) {
                    desc.push(a.account_code);
                    desc = desc.concat(getDescendants(a.account_code));
                }
            });
            return desc;
        };

        // 3. Compute rollups based on active items
        const withRollups = withActive.map((acc) => {
            const descCodes = getDescendants(acc.account_code);
            let rTot = acc.active_total;
            let rCnt = acc.active_count;

            descCodes.forEach((dc) => {
                if (byCode[dc]) {
                    rTot += byCode[dc].active_total;
                    rCnt += byCode[dc].active_count;
                }
            });

            return {
                ...acc,
                calc_rollup_total: rTot,
                calc_rollup_count: rCnt,
                descendant_codes: descCodes,
            };
        });

        // 4. Filter according to showOnlyWithItems and searchQuery
        const filterList = (kategori) => {
            const categoryList = withRollups.filter((a) => a.kategori_belanja === kategori);

            return categoryList.filter((acc) => {
                if (showOnlyWithItems && !query && acc.calc_rollup_count === 0) {
                    return false;
                }

                if (!query) return true;

                if (acc.account_code.toLowerCase().includes(query) || acc.account_name.toLowerCase().includes(query)) {
                    return true;
                }

                if (acc.active_items?.some((i) =>
                    (i.item_name && i.item_name.toLowerCase().includes(query)) ||
                    (i.specification && i.specification.toLowerCase().includes(query)) ||
                    (i.requisition?.unit?.name && i.requisition.unit.name.toLowerCase().includes(query)) ||
                    (i.requisition?.requisition_number && i.requisition.requisition_number.toLowerCase().includes(query))
                )) {
                    return true;
                }

                const descCodes = acc.descendant_codes || [];
                const hasMatchingDescendant = descCodes.some((dc) => {
                    const dAcc = byCode[dc];
                    if (!dAcc) return false;
                    if (dAcc.account_code.toLowerCase().includes(query) || dAcc.account_name.toLowerCase().includes(query)) return true;
                    return dAcc.active_items?.some((i) =>
                        (i.item_name && i.item_name.toLowerCase().includes(query)) ||
                        (i.specification && i.specification.toLowerCase().includes(query)) ||
                        (i.requisition?.unit?.name && i.requisition.unit.name.toLowerCase().includes(query)) ||
                        (i.requisition?.requisition_number && i.requisition.requisition_number.toLowerCase().includes(query))
                    );
                });

                return hasMatchingDescendant;
            });
        };

        const lOperasi = filterList('Operasi');
        const lModal = filterList('Modal');

        // Overall direct stats across all accounts
        let totCount = 0;
        let totSum = 0;
        let totOperasi = 0;
        let totModal = 0;
        let accountsCount = 0;

        withActive.forEach((acc) => {
            totCount += acc.active_count;
            totSum += acc.active_total;
            if (acc.kategori_belanja === 'Operasi') totOperasi += acc.active_total;
            if (acc.kategori_belanja === 'Modal') totModal += acc.active_total;
            if (acc.active_count > 0) accountsCount++;
        });

        return {
            listOperasi: lOperasi,
            listModal: lModal,
            totalUsulanCount: totCount,
            totalUsulanNominal: totSum,
            totalUsulanOperasi: totOperasi,
            totalUsulanModal: totModal,
            accountsWithItemsCount: accountsCount,
        };
    }, [accounts_with_proposed, searchQuery, showOnlyWithItems, statusFilter]);

    const p = ringkasan_rba.pendapatan || {};
    const b = ringkasan_rba.belanja || {};
    const sd = ringkasan_rba.surplus_defisit || {};
    const c = ringkasan_rba.pembiayaan || {};

    return (
        <PerencanaanLayout>
            <Head title={`RBA - ${current_shift?.shift_name || 'Rencana Bisnis & Anggaran'} RS Jiwa Tampan`} />

            {/* Shift Header & Switcher Toolbar */}
            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <div className="flex flex-wrap items-center gap-3">
                        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                            {current_shift?.doc_title || 'RENCANA BISNIS DAN ANGGARAN (RBA)'}
                        </h1>
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border ${
                            current_shift?.status === 'Aktif'
                                ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                                : 'bg-amber-100 text-amber-900 border-amber-300'
                        }`}>
                            <span className={`h-2 w-2 rounded-full ${current_shift?.status === 'Aktif' ? 'bg-emerald-600' : 'bg-amber-500'}`} />
                            {current_shift?.status || 'Draft'}
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-black text-slate-700 shadow-2xs">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                            T.A. {current_shift?.year || selected_year}
                        </span>
                    </div>
                    <p className="mt-1 text-xs sm:text-sm text-slate-600 font-medium">
                        Kompilasi Anggaran Pendapatan, Belanja, dan Pembiayaan BLUD RS Jiwa Tampan T.A. {current_shift?.year || selected_year}.
                    </p>
                </div>

                {/* Clean Toolbar: Tahun & Versi Switcher, Unified Cetak, and Action Buttons */}
                <div className="flex flex-wrap items-center gap-2.5">
                    {/* Year Dropdown */}
                    <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-500 hidden sm:inline">Tahun:</span>
                        <select
                            value={selected_year}
                            onChange={(e) => router.get(route('perencanaan.rba.index'), { year: e.target.value, tab: activeTab })}
                            className="rounded-xl border border-slate-300 bg-white py-2 pl-3 pr-8 text-xs font-bold text-slate-800 shadow-2xs focus:border-emerald-600 focus:ring-emerald-500"
                        >
                            {available_years.map((y) => (
                                <option key={y} value={y}>
                                    T.A. {y}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Shift Dropdown */}
                    <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-500 hidden sm:inline">Versi:</span>
                        <select
                            value={current_shift?.id || ''}
                            onChange={(e) => router.get(route('perencanaan.rba.index'), { year: selected_year, shift_id: e.target.value, tab: activeTab })}
                            className="rounded-xl border border-slate-300 bg-white py-2 pl-3 pr-8 text-xs font-bold text-slate-800 shadow-2xs focus:border-emerald-600 focus:ring-emerald-500"
                        >
                            {shifts.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.shift_name} ({s.period_month}) - {s.status}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Unified Print Dropdown */}
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setPrintDropdownOpen(!printDropdownOpen)}
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700 shadow-2xs transition active:scale-95 cursor-pointer"
                            title="Pilih Format Cetak Dokumen RBA"
                        >
                            <svg className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24-1.077-.32-2.14-.32-3.193 0-5.18 4.02-9.386 8.974-9.386 4.954 0 8.973 4.207 8.973 9.386 0 1.053-.08 2.116-.32 3.193M12 18v-4.5m0 0l-2.25 2.25M12 13.5l2.25 2.25M3.75 19.5h16.5" />
                            </svg>
                            <span>Cetak RBA</span>
                            <svg className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${printDropdownOpen ? 'rotate-180 text-emerald-600' : ''}`} fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                            </svg>
                        </button>

                        {printDropdownOpen && (
                            <>
                                <div className="fixed inset-0 z-20" onClick={() => setPrintDropdownOpen(false)} />
                                <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl z-30">
                                    <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100">
                                        Pilih Format Cetak Dokumen
                                    </div>
                                    <div className="py-1 space-y-0.5">
                                        <a
                                            href={route('perencanaan.rba.print-ringkasan', { shift_id: current_shift?.id })}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={() => setPrintDropdownOpen(false)}
                                            className="flex items-start gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 transition"
                                        >
                                            <span className="text-base mt-0.5">📊</span>
                                            <div>
                                                <p className="font-bold text-slate-900">Ringkasan Eksekutif & SiLPA</p>
                                                <p className="text-[11px] text-slate-500 font-normal">Format resmi pendapatan vs belanja</p>
                                            </div>
                                        </a>
                                        <a
                                            href={route('perencanaan.rba.print-pendapatan', { shift_id: current_shift?.id })}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={() => setPrintDropdownOpen(false)}
                                            className="flex items-start gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 transition"
                                        >
                                            <span className="text-base mt-0.5">💰</span>
                                            <div>
                                                <p className="font-bold text-slate-900">RBA Target Pendapatan</p>
                                                <p className="text-[11px] text-slate-500 font-normal">23 Pos target layanan RS Jiwa Tampan</p>
                                            </div>
                                        </a>
                                        <a
                                            href={route('perencanaan.rba.print-belanja', { shift_id: current_shift?.id })}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={() => setPrintDropdownOpen(false)}
                                            className="flex items-start gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 transition"
                                        >
                                            <span className="text-base mt-0.5">⚡</span>
                                            <div>
                                                <p className="font-bold text-slate-900">RBA Anggaran Belanja</p>
                                                <p className="text-[11px] text-slate-500 font-normal">Matriks 16 kolom pergeseran lanskap</p>
                                            </div>
                                        </a>
                                        <a
                                            href={route('perencanaan.rba.print-rincian-belanja', { year: selected_year, shift_id: current_shift?.id })}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={() => setPrintDropdownOpen(false)}
                                            className="flex items-start gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 transition"
                                        >
                                            <span className="text-base mt-0.5">📋</span>
                                            <div>
                                                <p className="font-bold text-slate-900">Rincian Usulan Barang Unit</p>
                                                <p className="text-[11px] text-slate-500 font-normal">Rincian belanja per rekening unit kerja</p>
                                            </div>
                                        </a>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {current_shift?.status !== 'Aktif' && (
                        <button
                            type="button"
                            onClick={() => setActivatingShift(current_shift)}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 px-3.5 py-2 text-xs font-bold text-white shadow-2xs transition active:scale-95 cursor-pointer"
                        >
                            Aktifkan Versi
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={handleOpenCreateShift}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 px-3.5 py-2 text-xs font-bold text-white shadow-sm transition active:scale-95 cursor-pointer"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                         Pergeseran Baru
                    </button>
                </div>
            </div>

            {/* Minimalist Active Section Header */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl bg-white p-4 sm:p-5 border border-slate-200/80 shadow-2xs">
                <div className="flex items-center gap-3.5 min-w-0">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-2xl border border-emerald-200/80 shadow-2xs">
                        {activeTab === 'RINGKASAN' && '📊'}
                        {activeTab === 'RINCIAN_BARANG' && '🛒'}
                        {activeTab === 'BELANJA' && '⚡'}
                        {activeTab === 'PENDAPATAN' && '💰'}
                        {activeTab === 'SHIFTS' && '⚙️'}
                    </div>
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-base sm:text-lg font-black tracking-tight text-slate-900 truncate">
                                {activeTab === 'RINGKASAN' && 'Ringkasan & SiLPA'}
                                {activeTab === 'RINCIAN_BARANG' && `Rincian Usulan Belanja Unit (${totalUsulanCount})`}
                                {activeTab === 'BELANJA' && 'Anggaran Belanja BLUD'}
                                {activeTab === 'PENDAPATAN' && `Target Pendapatan BLUD (${revenue_items.filter(r => !r.is_header && r.item_code !== '0').length})`}
                                {activeTab === 'SHIFTS' && `Kelola Versi & Pergeseran (${shifts.length})`}
                            </h2>
                            <span className="rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 border border-emerald-200 shrink-0">
                                T.A. {current_shift?.year || selected_year}
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium mt-0.5 truncate">
                            {activeTab === 'RINGKASAN' && 'Neraca Lembar Kerja resmi (Pendapatan vs Belanja) dan Proyeksi Pembiayaan SiLPA.'}
                            {activeTab === 'RINCIAN_BARANG' && 'Daftar kebutuhan barang/jasa yang diusulkan unit kerja per rekening belanja.'}
                            {activeTab === 'BELANJA' && 'Matriks 16 kolom pergeseran anggaran belanja operasi, belanja modal, dan APBD.'}
                            {activeTab === 'PENDAPATAN' && 'Target 23 pos pendapatan layanan BLUD, kerja sama, dan realisasi kas tahun berjalan.'}
                            {activeTab === 'SHIFTS' && 'Daftar versi penetapan RBA, tahapan pergeseran anggaran, dan aktivasi versi resmi.'}
                        </p>
                    </div>
                </div>
            </div>

            {/* TAB 1: RINGKASAN RBA & SURPLUS/DEFISIT */}
            {activeTab === 'RINGKASAN' && (
                <div className="space-y-6">


                    {/* Official 5-Column Ringkasan Table matching PDF */}
                    <div className="overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-md">
                        <div className="border-b border-slate-200 bg-slate-100/80 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div>
                                <h3 className="text-sm font-black uppercase tracking-wider text-slate-900">
                                    Lembar Ringkasan Anggaran (Pendapatan, Belanja, dan Pembiayaan)
                                </h3>
                                <p className="text-xs text-slate-600 font-medium">
                                    Sesuai format resmi lembar kerja RBA RS Jiwa Tampan Provinsi Riau
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={handleOpenPembiayaanModal}
                                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-4 py-2 text-xs font-bold text-slate-800 shadow-2xs transition active:scale-95 cursor-pointer shrink-0"
                            >
                                <span>✏️</span>
                                Kelola Pembiayaan & SiLPA
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-300 text-xs">
                                <thead>
                                    <tr className="bg-slate-100 text-center font-bold text-slate-800">
                                        <th className="border border-slate-300 px-3 py-2 w-12">No</th>
                                        <th className="border border-slate-300 px-4 py-2 text-left min-w-[280px]">Uraian</th>
                                        <th className="border border-slate-300 px-4 py-2 w-44">Jumlah (Rp) Sebelum</th>
                                        <th className="border border-slate-300 px-4 py-2 w-44">Jumlah (Rp) Setelah</th>
                                        <th className="border border-slate-300 px-4 py-2 w-40">Bertambah / (Berkurang)</th>
                                    </tr>
                                    <tr className="bg-slate-50 text-center text-[10px] font-semibold text-slate-500">
                                        <th className="border border-slate-300 py-1">1</th>
                                        <th className="border border-slate-300 py-1">2</th>
                                        <th className="border border-slate-300 py-1">3</th>
                                        <th className="border border-slate-300 py-1">4</th>
                                        <th className="border border-slate-300 py-1">5 (4-3)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 bg-white">
                                    {/* A. PENDAPATAN */}
                                    <tr className="font-black bg-slate-100 text-slate-900">
                                        <td className="border border-slate-300 px-3 py-2 text-center">A</td>
                                        <td className="border border-slate-300 px-4 py-2 uppercase">PENDAPATAN</td>
                                        <td className="border border-slate-300 px-4 py-2 text-right font-mono"></td>
                                        <td className="border border-slate-300 px-4 py-2 text-right font-mono"></td>
                                        <td className="border border-slate-300 px-4 py-2 text-right font-mono"></td>
                                    </tr>
                                    <tr>
                                        <td className="border border-slate-300 px-3 py-1.5 text-center"></td>
                                        <td className="border border-slate-300 px-4 py-1.5 pl-6 font-medium text-slate-800">Jasa Layanan</td>
                                        <td className="border border-slate-300 px-4 py-1.5 text-right font-mono">{formatRupiah(p.jasa_layanan?.before)}</td>
                                        <td className="border border-slate-300 px-4 py-1.5 text-right font-mono font-bold">{formatRupiah(p.jasa_layanan?.after)}</td>
                                        <td className="border border-slate-300 px-4 py-1.5 text-right font-mono">{formatRupiah(p.jasa_layanan?.diff)}</td>
                                    </tr>
                                    <tr>
                                        <td className="border border-slate-300 px-3 py-1.5 text-center"></td>
                                        <td className="border border-slate-300 px-4 py-1.5 pl-6 font-medium text-slate-800">Hibah</td>
                                        <td className="border border-slate-300 px-4 py-1.5 text-right font-mono">-</td>
                                        <td className="border border-slate-300 px-4 py-1.5 text-right font-mono">-</td>
                                        <td className="border border-slate-300 px-4 py-1.5 text-right font-mono">-</td>
                                    </tr>
                                    <tr>
                                        <td className="border border-slate-300 px-3 py-1.5 text-center"></td>
                                        <td className="border border-slate-300 px-4 py-1.5 pl-6 font-medium text-slate-800">Hasil Kerja Sama</td>
                                        <td className="border border-slate-300 px-4 py-1.5 text-right font-mono">{formatRupiah(p.hasil_kerjasama?.before)}</td>
                                        <td className="border border-slate-300 px-4 py-1.5 text-right font-mono font-bold">{formatRupiah(p.hasil_kerjasama?.after)}</td>
                                        <td className="border border-slate-300 px-4 py-1.5 text-right font-mono">{formatRupiah(p.hasil_kerjasama?.diff)}</td>
                                    </tr>
                                    <tr>
                                        <td className="border border-slate-300 px-3 py-1.5 text-center"></td>
                                        <td className="border border-slate-300 px-4 py-1.5 pl-6 font-medium text-slate-800">APBD</td>
                                        <td className="border border-slate-300 px-4 py-1.5 text-right font-mono">{formatRupiah(p.apbd?.before)}</td>
                                        <td className="border border-slate-300 px-4 py-1.5 text-right font-mono font-bold">{formatRupiah(p.apbd?.after)}</td>
                                        <td className="border border-slate-300 px-4 py-1.5 text-right font-mono">{formatRupiah(p.apbd?.diff)}</td>
                                    </tr>
                                    <tr>
                                        <td className="border border-slate-300 px-3 py-1.5 text-center"></td>
                                        <td className="border border-slate-300 px-4 py-1.5 pl-6 font-medium text-slate-800">Lain-lain pendapatan BLUD yang sah</td>
                                        <td className="border border-slate-300 px-4 py-1.5 text-right font-mono">{formatRupiah(p.lain_lain_sah?.before)}</td>
                                        <td className="border border-slate-300 px-4 py-1.5 text-right font-mono font-bold">{formatRupiah(p.lain_lain_sah?.after)}</td>
                                        <td className="border border-slate-300 px-4 py-1.5 text-right font-mono">{formatRupiah(p.lain_lain_sah?.diff)}</td>
                                    </tr>
                                    <tr className="font-black bg-slate-50 text-slate-900">
                                        <td className="border border-slate-300 px-3 py-2 text-center"></td>
                                        <td className="border border-slate-300 px-4 py-2 pl-8 text-right uppercase">Jumlah Pendapatan</td>
                                        <td className="border border-slate-300 px-4 py-2 text-right font-mono">{formatRupiah(p.total?.before)}</td>
                                        <td className="border border-slate-300 px-4 py-2 text-right font-mono font-black text-emerald-800">{formatRupiah(p.total?.after)}</td>
                                        <td className="border border-slate-300 px-4 py-2 text-right font-mono font-bold">{formatRupiah(p.total?.diff)}</td>
                                    </tr>

                                    {/* B. BELANJA */}
                                    <tr className="font-black bg-slate-100 text-slate-900">
                                        <td className="border border-slate-300 px-3 py-2 text-center">B</td>
                                        <td className="border border-slate-300 px-4 py-2 uppercase">BELANJA</td>
                                        <td className="border border-slate-300 px-4 py-2 text-right font-mono"></td>
                                        <td className="border border-slate-300 px-4 py-2 text-right font-mono"></td>
                                        <td className="border border-slate-300 px-4 py-2 text-right font-mono"></td>
                                    </tr>
                                    <tr className="font-bold text-slate-800">
                                        <td className="border border-slate-300 px-3 py-1.5 text-center"></td>
                                        <td className="border border-slate-300 px-4 py-1.5 pl-4 uppercase">BELANJA APBD</td>
                                        <td className="border border-slate-300 px-4 py-1.5 text-right font-mono">{formatRupiah(b.apbd?.before)}</td>
                                        <td className="border border-slate-300 px-4 py-1.5 text-right font-mono font-bold">{formatRupiah(b.apbd?.after)}</td>
                                        <td className="border border-slate-300 px-4 py-1.5 text-right font-mono">{formatRupiah(b.apbd?.diff)}</td>
                                    </tr>
                                    <tr className="font-bold text-slate-800 bg-slate-50/50">
                                        <td className="border border-slate-300 px-3 py-1.5 text-center"></td>
                                        <td className="border border-slate-300 px-4 py-1.5 pl-4 uppercase">BELANJA OPERASI BLUD</td>
                                        <td className="border border-slate-300 px-4 py-1.5 text-right font-mono">{formatRupiah(b.operasi_blud?.before)}</td>
                                        <td className="border border-slate-300 px-4 py-1.5 text-right font-mono font-bold">{formatRupiah(b.operasi_blud?.after)}</td>
                                        <td className="border border-slate-300 px-4 py-1.5 text-right font-mono">{formatRupiah(b.operasi_blud?.diff)}</td>
                                    </tr>
                                    <tr>
                                        <td className="border border-slate-300 px-3 py-1.5 text-center"></td>
                                        <td className="border border-slate-300 px-4 py-1.5 pl-8 text-slate-700">Belanja Pegawai</td>
                                        <td className="border border-slate-300 px-4 py-1.5 text-right font-mono">{formatRupiah(b.pegawai?.before)}</td>
                                        <td className="border border-slate-300 px-4 py-1.5 text-right font-mono">{formatRupiah(b.pegawai?.after)}</td>
                                        <td className="border border-slate-300 px-4 py-1.5 text-right font-mono">{formatRupiah(b.pegawai?.diff)}</td>
                                    </tr>
                                    <tr>
                                        <td className="border border-slate-300 px-3 py-1.5 text-center"></td>
                                        <td className="border border-slate-300 px-4 py-1.5 pl-8 font-medium text-slate-800">Belanja Barang dan Jasa</td>
                                        <td className="border border-slate-300 px-4 py-1.5 text-right font-mono">{formatRupiah(b.barang_jasa_blud?.before)}</td>
                                        <td className="border border-slate-300 px-4 py-1.5 text-right font-mono font-bold">{formatRupiah(b.barang_jasa_blud?.after)}</td>
                                        <td className="border border-slate-300 px-4 py-1.5 text-right font-mono">{formatRupiah(b.barang_jasa_blud?.diff)}</td>
                                    </tr>
                                    <tr>
                                        <td className="border border-slate-300 px-3 py-1.5 text-center"></td>
                                        <td className="border border-slate-300 px-4 py-1.5 pl-8 text-slate-700">Belanja Bunga</td>
                                        <td className="border border-slate-300 px-4 py-1.5 text-right font-mono">{formatRupiah(b.bunga?.before)}</td>
                                        <td className="border border-slate-300 px-4 py-1.5 text-right font-mono">{formatRupiah(b.bunga?.after)}</td>
                                        <td className="border border-slate-300 px-4 py-1.5 text-right font-mono">{formatRupiah(b.bunga?.diff)}</td>
                                    </tr>
                                    <tr>
                                        <td className="border border-slate-300 px-3 py-1.5 text-center"></td>
                                        <td className="border border-slate-300 px-4 py-1.5 pl-8 text-slate-700">Belanja Lain-lain</td>
                                        <td className="border border-slate-300 px-4 py-1.5 text-right font-mono">{formatRupiah(b.lain_lain?.before)}</td>
                                        <td className="border border-slate-300 px-4 py-1.5 text-right font-mono">{formatRupiah(b.lain_lain?.after)}</td>
                                        <td className="border border-slate-300 px-4 py-1.5 text-right font-mono">{formatRupiah(b.lain_lain?.diff)}</td>
                                    </tr>
                                    <tr className="font-bold text-slate-800 bg-slate-50/50">
                                        <td className="border border-slate-300 px-3 py-1.5 text-center"></td>
                                        <td className="border border-slate-300 px-4 py-1.5 pl-4 uppercase">BELANJA MODAL BLUD</td>
                                        <td className="border border-slate-300 px-4 py-1.5 text-right font-mono">{formatRupiah(b.modal_blud?.before)}</td>
                                        <td className="border border-slate-300 px-4 py-1.5 text-right font-mono font-bold">{formatRupiah(b.modal_blud?.after)}</td>
                                        <td className="border border-slate-300 px-4 py-1.5 text-right font-mono">{formatRupiah(b.modal_blud?.diff)}</td>
                                    </tr>
                                    <tr>
                                        <td className="border border-slate-300 px-3 py-1.5 text-center"></td>
                                        <td className="border border-slate-300 px-4 py-1.5 pl-8 text-slate-700">Belanja Tanah</td>
                                        <td className="border border-slate-300 px-4 py-1.5 text-right font-mono">{formatRupiah(b.tanah?.before)}</td>
                                        <td className="border border-slate-300 px-4 py-1.5 text-right font-mono">{formatRupiah(b.tanah?.after)}</td>
                                        <td className="border border-slate-300 px-4 py-1.5 text-right font-mono">{formatRupiah(b.tanah?.diff)}</td>
                                    </tr>
                                    <tr>
                                        <td className="border border-slate-300 px-3 py-1.5 text-center"></td>
                                        <td className="border border-slate-300 px-4 py-1.5 pl-8 font-medium text-slate-800">Belanja Peralatan dan Mesin</td>
                                        <td className="border border-slate-300 px-4 py-1.5 text-right font-mono">{formatRupiah(b.peralatan_mesin?.before)}</td>
                                        <td className="border border-slate-300 px-4 py-1.5 text-right font-mono font-bold">{formatRupiah(b.peralatan_mesin?.after)}</td>
                                        <td className="border border-slate-300 px-4 py-1.5 text-right font-mono">{formatRupiah(b.peralatan_mesin?.diff)}</td>
                                    </tr>
                                    <tr>
                                        <td className="border border-slate-300 px-3 py-1.5 text-center"></td>
                                        <td className="border border-slate-300 px-4 py-1.5 pl-8 font-medium text-slate-800">Belanja Gedung dan Bangunan</td>
                                        <td className="border border-slate-300 px-4 py-1.5 text-right font-mono">{formatRupiah(b.gedung_bangunan?.before)}</td>
                                        <td className="border border-slate-300 px-4 py-1.5 text-right font-mono font-bold">{formatRupiah(b.gedung_bangunan?.after)}</td>
                                        <td className="border border-slate-300 px-4 py-1.5 text-right font-mono">{formatRupiah(b.gedung_bangunan?.diff)}</td>
                                    </tr>
                                    <tr>
                                        <td className="border border-slate-300 px-3 py-1.5 text-center"></td>
                                        <td className="border border-slate-300 px-4 py-1.5 pl-8 text-slate-700">Belanja Jalan, Irigasi dan Jaringan</td>
                                        <td className="border border-slate-300 px-4 py-1.5 text-right font-mono">{formatRupiah(b.jalan_irigasi?.before)}</td>
                                        <td className="border border-slate-300 px-4 py-1.5 text-right font-mono">{formatRupiah(b.jalan_irigasi?.after)}</td>
                                        <td className="border border-slate-300 px-4 py-1.5 text-right font-mono">{formatRupiah(b.jalan_irigasi?.diff)}</td>
                                    </tr>
                                    <tr>
                                        <td className="border border-slate-300 px-3 py-1.5 text-center"></td>
                                        <td className="border border-slate-300 px-4 py-1.5 pl-8 text-slate-700">Belanja Aset Tetap Lainnya</td>
                                        <td className="border border-slate-300 px-4 py-1.5 text-right font-mono">{formatRupiah(b.aset_tetap_lainnya?.before)}</td>
                                        <td className="border border-slate-300 px-4 py-1.5 text-right font-mono">{formatRupiah(b.aset_tetap_lainnya?.after)}</td>
                                        <td className="border border-slate-300 px-4 py-1.5 text-right font-mono">{formatRupiah(b.aset_tetap_lainnya?.diff)}</td>
                                    </tr>
                                    <tr>
                                        <td className="border border-slate-300 px-3 py-1.5 text-center"></td>
                                        <td className="border border-slate-300 px-4 py-1.5 pl-8 text-slate-700">Belanja Aset Lainnya</td>
                                        <td className="border border-slate-300 px-4 py-1.5 text-right font-mono">{formatRupiah(b.aset_lainnya?.before)}</td>
                                        <td className="border border-slate-300 px-4 py-1.5 text-right font-mono">{formatRupiah(b.aset_lainnya?.after)}</td>
                                        <td className="border border-slate-300 px-4 py-1.5 text-right font-mono">{formatRupiah(b.aset_lainnya?.diff)}</td>
                                    </tr>
                                    <tr className="font-black bg-slate-50 text-slate-900">
                                        <td className="border border-slate-300 px-3 py-2 text-center"></td>
                                        <td className="border border-slate-300 px-4 py-2 pl-8 text-right uppercase">Jumlah Belanja</td>
                                        <td className="border border-slate-300 px-4 py-2 text-right font-mono">{formatRupiah(b.total?.before)}</td>
                                        <td className="border border-slate-300 px-4 py-2 text-right font-mono font-black text-emerald-800">{formatRupiah(b.total?.after)}</td>
                                        <td className="border border-slate-300 px-4 py-2 text-right font-mono font-bold">{formatRupiah(b.total?.diff)}</td>
                                    </tr>

                                    {/* SURPLUS / DEFISIT */}
                                    {(() => {
                                        const sdVal = Number(sd.after || 0);
                                        const isSdSurplus = sdVal > 0;
                                        const isSdDefisit = sdVal < 0;
                                        const sdRowBg = isSdSurplus ? 'bg-emerald-100/90 text-emerald-950' : isSdDefisit ? 'bg-rose-100/90 text-rose-950' : 'bg-blue-100/90 text-blue-950';
                                        const sdTextCol = isSdSurplus ? 'text-emerald-950' : isSdDefisit ? 'text-rose-950' : 'text-blue-950';

                                        return (
                                            <tr className={`font-black text-sm ${sdRowBg}`}>
                                                <td className="border border-slate-300 px-3 py-3 text-center"></td>
                                                <td className="border border-slate-300 px-4 py-3 pl-4 uppercase font-black">
                                                    Surplus / (Defisit)
                                                </td>
                                                <td className="border border-slate-300 px-4 py-3 text-right font-mono font-bold">
                                                    {formatRupiah(sd.before)}
                                                </td>
                                                <td className={`border border-slate-300 px-4 py-3 text-right font-mono font-black ${sdTextCol}`}>
                                                    {formatRupiah(sd.after)}
                                                </td>
                                                <td className={`border border-slate-300 px-4 py-3 text-right font-mono font-black ${sdTextCol}`}>
                                                    {formatRupiah(sd.diff)}
                                                </td>
                                            </tr>
                                        );
                                    })()}

                                    {/* C. PEMBIAYAAN */}
                                    <tr className="font-black bg-slate-100 text-slate-900">
                                        <td className="border border-slate-300 px-3 py-2 text-center">C</td>
                                        <td className="border border-slate-300 px-4 py-2 uppercase">PEMBIAYAAN</td>
                                        <td className="border border-slate-300 px-4 py-2 text-right font-mono"></td>
                                        <td className="border border-slate-300 px-4 py-2 text-right font-mono"></td>
                                        <td className="border border-slate-300 px-4 py-2 text-right font-mono"></td>
                                    </tr>
                                    <tr className="font-bold text-slate-800">
                                        <td className="border border-slate-300 px-3 py-1.5 text-center"></td>
                                        <td className="border border-slate-300 px-4 py-1.5 pl-4 uppercase">PENERIMAAN DAERAH</td>
                                        <td className="border border-slate-300 px-4 py-1.5 text-right font-mono"></td>
                                        <td className="border border-slate-300 px-4 py-1.5 text-right font-mono"></td>
                                        <td className="border border-slate-300 px-4 py-1.5 text-right font-mono"></td>
                                    </tr>
                                    <tr>
                                        <td className="border border-slate-300 px-3 py-1.5 text-center"></td>
                                        <td className="border border-slate-300 px-4 py-1.5 pl-8 text-slate-700">
                                            Penggunaan Sisa Lebih Perhitungan Anggaran Tahun Sebelumnya (SiLPA)
                                        </td>
                                        <td className="border border-slate-300 px-4 py-1.5 text-right font-mono">-</td>
                                        <td className="border border-slate-300 px-4 py-1.5 text-right font-mono">{formatRupiah(c.silpa_sebelumnya)}</td>
                                        <td className="border border-slate-300 px-4 py-1.5 text-right font-mono">{formatRupiah(c.silpa_sebelumnya)}</td>
                                    </tr>
                                    <tr>
                                        <td className="border border-slate-300 px-3 py-1.5 text-center"></td>
                                        <td className="border border-slate-300 px-4 py-1.5 pl-8 text-slate-700">Divestasi</td>
                                        <td className="border border-slate-300 px-4 py-1.5 text-right font-mono">-</td>
                                        <td className="border border-slate-300 px-4 py-1.5 text-right font-mono">{formatRupiah(c.divestasi)}</td>
                                        <td className="border border-slate-300 px-4 py-1.5 text-right font-mono">{formatRupiah(c.divestasi)}</td>
                                    </tr>
                                    <tr>
                                        <td className="border border-slate-300 px-3 py-1.5 text-center"></td>
                                        <td className="border border-slate-300 px-4 py-1.5 pl-8 text-slate-700">Penerimaan Utang/Pinjaman</td>
                                        <td className="border border-slate-300 px-4 py-1.5 text-right font-mono">-</td>
                                        <td className="border border-slate-300 px-4 py-1.5 text-right font-mono">{formatRupiah(c.pinjaman)}</td>
                                        <td className="border border-slate-300 px-4 py-1.5 text-right font-mono">{formatRupiah(c.pinjaman)}</td>
                                    </tr>
                                    <tr className="font-bold bg-slate-50 text-slate-900">
                                        <td className="border border-slate-300 px-3 py-2 text-center"></td>
                                        <td className="border border-slate-300 px-4 py-2 pl-8 text-right uppercase">Jumlah Penerimaan Pembiayaan</td>
                                        <td className="border border-slate-300 px-4 py-2 text-right font-mono">-</td>
                                        <td className="border border-slate-300 px-4 py-2 text-right font-mono font-bold">{formatRupiah(c.total_penerimaan)}</td>
                                        <td className="border border-slate-300 px-4 py-2 text-right font-mono font-bold">{formatRupiah(c.total_penerimaan)}</td>
                                    </tr>

                                    {/* D. PENGELUARAN PEMBIAYAAN */}
                                    <tr className="font-black bg-slate-100 text-slate-900">
                                        <td className="border border-slate-300 px-3 py-2 text-center">D</td>
                                        <td className="border border-slate-300 px-4 py-2 uppercase">PENGELUARAN PEMBIAYAAN</td>
                                        <td className="border border-slate-300 px-4 py-2 text-right font-mono"></td>
                                        <td className="border border-slate-300 px-4 py-2 text-right font-mono"></td>
                                        <td className="border border-slate-300 px-4 py-2 text-right font-mono"></td>
                                    </tr>
                                    <tr>
                                        <td className="border border-slate-300 px-3 py-1.5 text-center"></td>
                                        <td className="border border-slate-300 px-4 py-1.5 pl-8 text-slate-700">Investasi</td>
                                        <td className="border border-slate-300 px-4 py-1.5 text-right font-mono">-</td>
                                        <td className="border border-slate-300 px-4 py-1.5 text-right font-mono">{formatRupiah(c.investasi)}</td>
                                        <td className="border border-slate-300 px-4 py-1.5 text-right font-mono">{formatRupiah(c.investasi)}</td>
                                    </tr>
                                    <tr>
                                        <td className="border border-slate-300 px-3 py-1.5 text-center"></td>
                                        <td className="border border-slate-300 px-4 py-1.5 pl-8 text-slate-700">Pembayaran Pokok Utang/Pinjaman</td>
                                        <td className="border border-slate-300 px-4 py-1.5 text-right font-mono">-</td>
                                        <td className="border border-slate-300 px-4 py-1.5 text-right font-mono">{formatRupiah(c.pokok_utang)}</td>
                                        <td className="border border-slate-300 px-4 py-1.5 text-right font-mono">{formatRupiah(c.pokok_utang)}</td>
                                    </tr>
                                    <tr className="font-bold bg-slate-50 text-slate-900">
                                        <td className="border border-slate-300 px-3 py-2 text-center"></td>
                                        <td className="border border-slate-300 px-4 py-2 pl-8 text-right uppercase">Jumlah Pengeluaran Pembiayaan</td>
                                        <td className="border border-slate-300 px-4 py-2 text-right font-mono">-</td>
                                        <td className="border border-slate-300 px-4 py-2 text-right font-mono font-bold">{formatRupiah(c.total_pengeluaran)}</td>
                                        <td className="border border-slate-300 px-4 py-2 text-right font-mono font-bold">{formatRupiah(c.total_pengeluaran)}</td>
                                    </tr>

                                    {/* PEMBIAYAAN NETTO & SILPA */}
                                    <tr className="font-bold text-slate-900">
                                        <td className="border border-slate-300 px-3 py-2 text-center"></td>
                                        <td className="border border-slate-300 px-4 py-2 pl-4 uppercase font-black">Pembiayaan Netto</td>
                                        <td className="border border-slate-300 px-4 py-2 text-right font-mono">-</td>
                                        <td className="border border-slate-300 px-4 py-2 text-right font-mono font-bold">{formatRupiah(c.netto)}</td>
                                        <td className="border border-slate-300 px-4 py-2 text-right font-mono font-bold">{formatRupiah(c.netto)}</td>
                                    </tr>
                                    <tr className="font-black bg-blue-100/70 text-blue-950 text-sm">
                                        <td className="border border-slate-300 px-3 py-3 text-center"></td>
                                        <td className="border border-slate-300 px-4 py-3 pl-4 uppercase font-black">
                                            Sisa Lebih Pembiayaan Anggaran Tahun Berkenaan (SiLPA)
                                        </td>
                                        <td className="border border-slate-300 px-4 py-3 text-right font-mono">-</td>
                                        <td className="border border-slate-300 px-4 py-3 text-right font-mono font-black text-blue-900">
                                            {formatRupiah(c.silpa_tahun_berkenaan)}
                                        </td>
                                        <td className="border border-slate-300 px-4 py-3 text-right font-mono font-black text-blue-900">
                                            {formatRupiah(c.silpa_tahun_berkenaan)}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 2: TARGET PENDAPATAN BLUD */}
            {activeTab === 'PENDAPATAN' && (
                <div className="space-y-6">
                    {/* Single-Row Toolbar & Category Filter */}
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
                        <div className="flex flex-1 flex-wrap items-center gap-2.5">
                            {/* Search Box */}
                            <div className="relative w-full sm:w-72">
                                <svg className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                                </svg>
                                <input
                                    type="text"
                                    value={revenueSearchQuery}
                                    onChange={(e) => setRevenueSearchQuery(e.target.value)}
                                    placeholder="Cari pos layanan (IGD, Farmasi, Lab, APBD)..."
                                    className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-8 py-1.5 text-xs text-slate-900 font-medium focus:border-emerald-600 focus:ring-emerald-500"
                                />
                                {revenueSearchQuery && (
                                    <button
                                        type="button"
                                        onClick={() => setRevenueSearchQuery('')}
                                        className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 text-xs"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>

                            {/* Category Filter Pills */}
                            <div className="inline-flex flex-wrap items-center gap-1 rounded-xl bg-slate-100 p-1 text-xs">
                                <button
                                    type="button"
                                    onClick={() => setRevenueCategoryFilter('ALL')}
                                    className={`px-3 py-1 font-bold rounded-lg transition cursor-pointer ${
                                        revenueCategoryFilter === 'ALL'
                                            ? 'bg-white text-slate-900 shadow-2xs'
                                            : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                >
                                    Semua Pos
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setRevenueCategoryFilter('1')}
                                    className={`px-3 py-1 font-bold rounded-lg transition cursor-pointer ${
                                        revenueCategoryFilter === '1'
                                            ? 'bg-white text-emerald-800 shadow-2xs'
                                            : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                >
                                    Jasa Layanan (15)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setRevenueCategoryFilter('3')}
                                    className={`px-3 py-1 font-bold rounded-lg transition cursor-pointer ${
                                        revenueCategoryFilter === '3'
                                            ? 'bg-white text-blue-800 shadow-2xs'
                                            : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                >
                                    Kerja Sama (3)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setRevenueCategoryFilter('4')}
                                    className={`px-3 py-1 font-bold rounded-lg transition cursor-pointer ${
                                        revenueCategoryFilter === '4'
                                            ? 'bg-white text-slate-900 shadow-2xs'
                                            : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                >
                                    APBD
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setRevenueCategoryFilter('5')}
                                    className={`px-3 py-1 font-bold rounded-lg transition cursor-pointer ${
                                        revenueCategoryFilter === '5'
                                            ? 'bg-white text-slate-900 shadow-2xs'
                                            : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                >
                                    Lain-lain Sah
                                </button>
                            </div>
                        </div>

                        {/* View Mode Switcher (Ringkas vs Format Pergeseran) */}
                        {!is_murni && (
                            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start lg:self-auto shrink-0 text-xs font-bold">
                                <button
                                    type="button"
                                    onClick={() => setRevenueViewMode('RINGKAS')}
                                    className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                                        revenueViewMode === 'RINGKAS'
                                            ? 'bg-white text-emerald-800 shadow-2xs font-black'
                                            : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                >
                                    ✨ Tampilan Ringkas
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setRevenueViewMode('PERGESERAN')}
                                    className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                                        revenueViewMode === 'PERGESERAN'
                                            ? 'bg-white text-slate-900 shadow-2xs font-black'
                                            : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                >
                                    📋 Format Pergeseran
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Revenue Minimalist Table */}
                    <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xs">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200 text-xs">
                                <thead>
                                    <tr className="bg-slate-50 text-slate-700 font-bold">
                                        <th className="px-3.5 py-3 text-center w-14 border-b border-slate-200">No</th>
                                        <th className="px-4 py-3 text-left border-b border-slate-200 min-w-[280px]">Pos Rekening Penerimaan</th>
                                        {(!is_murni && revenueViewMode === 'PERGESERAN') ? (
                                            <>
                                                <th className="px-4 py-3 text-right w-36 border-b border-slate-200">Target Semula (Rp)</th>
                                                <th className="px-4 py-3 text-right w-36 border-b border-slate-200">Target Menjadi (Rp)</th>
                                                <th className="px-4 py-3 text-right w-32 border-b border-slate-200">Perubahan (+/-)</th>
                                            </>
                                        ) : (
                                            <th className="px-4 py-3 text-right w-44 border-b border-slate-200">Target Pendapatan (Rp)</th>
                                        )}
                                        <th className="px-4 py-3 text-right w-40 border-b border-slate-200">Realisasi Kas (Rp)</th>
                                        <th className="px-3 py-3 text-center w-24 border-b border-slate-200">Capaian</th>
                                        <th className="px-3 py-3 text-center w-24 border-b border-slate-200">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 bg-white">
                                    {filteredRevenueItems.length === 0 ? (
                                        <tr>
                                            <td colSpan={(!is_murni && revenueViewMode === 'PERGESERAN') ? 8 : 6} className="py-12 text-center text-slate-400 font-medium">
                                                Tidak ditemukan pos pendapatan yang sesuai dengan filter.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredRevenueItems.map((item) => {
                                            const isRoot = item.item_code === '0';
                                            const isHeader = item.is_header;
                                            const diff = Number(item.difference || 0);
                                            const rate = Number(item.achievement_rate || 0);

                                            if (isRoot) {
                                                return (
                                                    <tr key={item.id} className="bg-slate-900 text-white font-black">
                                                        <td className="px-3.5 py-3 text-center font-mono text-xs opacity-70">
                                                            {item.item_code}
                                                        </td>
                                                        <td className="px-4 py-3 font-bold uppercase tracking-wider text-xs">
                                                            {item.item_name}
                                                        </td>
                                                        {(!is_murni && revenueViewMode === 'PERGESERAN') ? (
                                                            <>
                                                                <td className="px-4 py-3 text-right font-mono">{formatRupiah(item.before_amount)}</td>
                                                                <td className="px-4 py-3 text-right font-mono text-emerald-400 font-bold">{formatRupiah(item.after_amount)}</td>
                                                                <td className="px-4 py-3 text-right font-mono">{diff !== 0 ? formatRupiah(diff) : '-'}</td>
                                                            </>
                                                        ) : (
                                                            <td className="px-4 py-3 text-right font-mono text-emerald-400 font-bold text-sm">
                                                                {formatRupiah(item.after_amount)}
                                                            </td>
                                                        )}
                                                        <td className="px-4 py-3 text-right font-mono font-bold text-slate-200">
                                                            {formatRupiah(item.realized_amount)}
                                                        </td>
                                                        <td className="px-3 py-3 text-center">
                                                            <span className="inline-flex items-center rounded-full bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 text-xs font-bold">
                                                                {rate}%
                                                            </span>
                                                        </td>
                                                        <td className="px-3 py-3 text-center text-xs opacity-50 font-normal">
                                                            Total
                                                        </td>
                                                    </tr>
                                                );
                                            }

                                            if (isHeader) {
                                                return (
                                                    <tr key={item.id} className="bg-emerald-50/50 text-emerald-950 font-bold border-t border-emerald-100/70">
                                                        <td className="px-3.5 py-2.5 text-center font-mono text-xs text-emerald-800">
                                                            {item.item_code}
                                                        </td>
                                                        <td className="px-4 py-2.5">
                                                            <div className="flex items-center gap-2">
                                                                <span className="h-2 w-2 rounded-full bg-emerald-600" />
                                                                <span className="uppercase tracking-wide text-xs">
                                                                    {item.item_name}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        {(!is_murni && revenueViewMode === 'PERGESERAN') ? (
                                                            <>
                                                                <td className="px-4 py-2.5 text-right font-mono text-slate-600">{formatRupiah(item.before_amount)}</td>
                                                                <td className="px-4 py-2.5 text-right font-mono font-bold text-slate-900">{formatRupiah(item.after_amount)}</td>
                                                                <td className="px-4 py-2.5 text-right font-mono font-bold">
                                                                    {diff !== 0 ? (
                                                                        <span className={diff > 0 ? 'text-emerald-700' : 'text-rose-700'}>
                                                                            {formatRupiah(diff)}
                                                                        </span>
                                                                    ) : '-'}
                                                                </td>
                                                            </>
                                                        ) : (
                                                            <td className="px-4 py-2.5 text-right font-mono font-black text-slate-900">
                                                                {formatRupiah(item.after_amount)}
                                                            </td>
                                                        )}
                                                        <td className="px-4 py-2.5 text-right font-mono font-bold text-emerald-800">
                                                            {formatRupiah(item.realized_amount)}
                                                        </td>
                                                        <td className="px-3 py-2.5 text-center">
                                                            <span className="font-bold text-[11px] text-emerald-900">
                                                                {rate}%
                                                            </span>
                                                        </td>
                                                        <td className="px-3 py-2.5 text-center text-[10px] text-slate-400">
                                                            Grup
                                                        </td>
                                                    </tr>
                                                );
                                            }

                                            return (
                                                <tr key={item.id} className="hover:bg-slate-50/80 transition group">
                                                    <td className="px-3.5 py-2.5 text-center font-mono text-xs text-slate-400 group-hover:text-slate-600">
                                                        {item.item_code}
                                                    </td>
                                                    <td className="px-4 py-2.5 pl-9 text-slate-800 font-medium">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-slate-300 group-hover:text-emerald-500 transition">↳</span>
                                                            <span>{item.item_name}</span>
                                                        </div>
                                                    </td>
                                                    {(!is_murni && revenueViewMode === 'PERGESERAN') ? (
                                                        <>
                                                            <td className="px-4 py-2.5 text-right font-mono text-slate-500">
                                                                {formatRupiah(item.before_amount)}
                                                            </td>
                                                            <td className="px-4 py-2.5 text-right font-mono font-bold text-slate-900">
                                                                {formatRupiah(item.after_amount)}
                                                            </td>
                                                            <td className="px-4 py-2.5 text-right font-mono font-bold">
                                                                {diff !== 0 ? (
                                                                    <span className={diff > 0 ? 'text-emerald-700' : 'text-rose-700'}>
                                                                        {formatRupiah(diff)}
                                                                    </span>
                                                                ) : '-'}
                                                            </td>
                                                        </>
                                                    ) : (
                                                        <td className="px-4 py-2.5 text-right font-mono font-bold text-slate-900">
                                                            {formatRupiah(item.after_amount)}
                                                        </td>
                                                    )}
                                                    <td className="px-4 py-2.5 text-right font-mono font-semibold text-emerald-800">
                                                        {formatRupiah(item.realized_amount)}
                                                    </td>
                                                    <td className="px-3 py-2.5 text-center">
                                                        <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold ${
                                                            rate >= 80
                                                                ? 'bg-emerald-100 text-emerald-800'
                                                                : rate >= 50
                                                                ? 'bg-blue-100 text-blue-800'
                                                                : 'bg-slate-100 text-slate-600'
                                                        }`}>
                                                            {rate}%
                                                        </span>
                                                    </td>
                                                    <td className="px-3 py-2.5 text-center">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleOpenEditRevenueModal(item)}
                                                            className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-700 shadow-2xs hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-800 transition cursor-pointer"
                                                            title="Atur Target Pendapatan Pos Ini"
                                                        >
                                                            Atur Target
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 3: ANGGARAN BELANJA BLUD (MULTI-SUMBER DANA) */}
            {activeTab === 'BELANJA' && (
                <div className="space-y-6">
                    {/* Single-Row Toolbar: Search, Filter, and Mode Toggle */}
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
                        <div className="flex flex-1 flex-wrap items-center gap-2.5">
                            {/* Search Box */}
                            <div className="relative w-full sm:w-72">
                                <svg className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                                </svg>
                                <input
                                    type="text"
                                    value={expenseSearchQuery}
                                    onChange={(e) => setExpenseSearchQuery(e.target.value)}
                                    placeholder="Cari kode akun, nama belanja, catatan..."
                                    className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-8 py-1.5 text-xs text-slate-900 font-medium focus:border-emerald-600 focus:ring-emerald-500"
                                />
                                {expenseSearchQuery && (
                                    <button
                                        type="button"
                                        onClick={() => setExpenseSearchQuery('')}
                                        className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 text-xs"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>

                            {/* Category Filter Pills */}
                            <div className="inline-flex rounded-xl bg-slate-100 p-1 text-xs">
                                <button
                                    type="button"
                                    onClick={() => setExpenseCategoryFilter('ALL')}
                                    className={`px-3 py-1 font-bold rounded-lg transition cursor-pointer ${
                                        expenseCategoryFilter === 'ALL'
                                            ? 'bg-white text-slate-900 shadow-2xs'
                                            : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                >
                                    Semua Belanja
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setExpenseCategoryFilter('OPERASI')}
                                    className={`px-3 py-1 font-bold rounded-lg transition cursor-pointer ${
                                        expenseCategoryFilter === 'OPERASI'
                                            ? 'bg-white text-emerald-800 shadow-2xs'
                                            : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                >
                                    Belanja Operasi (1.1)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setExpenseCategoryFilter('MODAL')}
                                    className={`px-3 py-1 font-bold rounded-lg transition cursor-pointer ${
                                        expenseCategoryFilter === 'MODAL'
                                            ? 'bg-white text-purple-800 shadow-2xs'
                                            : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                >
                                    Belanja Modal (1.2)
                                </button>
                            </div>
                        </div>

                        {/* View Mode Toggle: Ringkas vs Matriks 16 Kolom */}
                        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start lg:self-auto shrink-0 text-xs font-bold">
                            <button
                                type="button"
                                onClick={() => setExpenseMatrixMode('RINGKAS')}
                                className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                                    expenseMatrixMode === 'RINGKAS'
                                        ? 'bg-white text-emerald-800 shadow-2xs font-black'
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                                title="Tampilan Ramping Bebas Scroll Horizontal"
                            >
                                ✨ Tampilan Ringkas
                            </button>
                            <button
                                type="button"
                                onClick={() => setExpenseMatrixMode('LENGKAP')}
                                className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                                    expenseMatrixMode === 'LENGKAP'
                                        ? 'bg-white text-slate-900 shadow-2xs font-black'
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                                title="Matriks Lengkap 16 Kolom Akuntansi"
                            >
                                📋 Matriks Lengkap (16 Kolom)
                            </button>
                        </div>
                    </div>

                    {/* MODE 1: TAMPILAN RINGKAS (Minimalis, Bebas Scroll Horizontal) */}
                    {expenseMatrixMode === 'RINGKAS' && (
                        <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xs">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-slate-200 text-xs">
                                    <thead>
                                        <tr className="bg-slate-50 text-slate-700 font-bold">
                                            <th className="px-3.5 py-3 text-center w-28 border-b border-slate-200 font-mono">Kode Rekening</th>
                                            <th className="px-4 py-3 text-left border-b border-slate-200 min-w-[260px]">Uraian Rekening Belanja</th>
                                            <th className="px-4 py-3 text-right w-44 border-b border-slate-200">Pagu Anggaran (Rp)</th>
                                            <th className="px-4 py-3 text-left border-b border-slate-200 min-w-[280px]">Alokasi Sumber Pembiayaan</th>
                                            <th className="px-4 py-3 text-left border-b border-slate-200 min-w-[180px]">Keterangan</th>
                                            <th className="px-3 py-3 text-center w-24 border-b border-slate-200">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 bg-white">
                                        {filteredExpenseItems.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                                                    Tidak ditemukan rekening belanja yang sesuai.
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredExpenseItems.map((item) => {
                                                const isHeader = item.is_header;
                                                const isRoot = item.level === 1;
                                                const jl = Number(item.after_jasa_layanan || 0);
                                                const ks = Number(item.after_hasil_kerjasama || 0);
                                                const ll = Number(item.after_lain_lain_sah || 0);
                                                const sp = Number(item.after_silpa || 0);
                                                const ap = Number(item.after_apbd || 0);

                                                if (isRoot) {
                                                    return (
                                                        <tr key={item.id} className="bg-slate-900 text-white font-black">
                                                            <td className="px-3.5 py-3 text-center font-mono text-xs opacity-70">
                                                                {item.account_code}
                                                            </td>
                                                            <td className="px-4 py-3 uppercase tracking-wider font-bold">
                                                                {item.account_name}
                                                            </td>
                                                            <td className="px-4 py-3 text-right font-mono text-emerald-400 font-bold text-sm">
                                                                {formatRupiah(item.after_total)}
                                                            </td>
                                                            <td className="px-4 py-3 text-xs text-slate-300 font-normal">
                                                                Total Gabungan BLUD & APBD
                                                            </td>
                                                            <td className="px-4 py-3 text-xs text-slate-400 font-normal">
                                                                {item.keterangan || '-'}
                                                            </td>
                                                            <td className="px-3 py-3 text-center text-xs opacity-50">
                                                                Induk
                                                            </td>
                                                        </tr>
                                                    );
                                                }

                                                if (isHeader) {
                                                    return (
                                                        <tr key={item.id} className={`font-bold border-t ${
                                                            item.level === 2
                                                                ? 'bg-emerald-50/60 text-emerald-950 border-emerald-200/80'
                                                                : 'bg-slate-50 text-slate-900 border-slate-200'
                                                        }`}>
                                                            <td className="px-3.5 py-2.5 text-center font-mono text-xs font-bold text-slate-700">
                                                                {item.account_code}
                                                            </td>
                                                            <td
                                                                className="px-4 py-2.5"
                                                                style={{ paddingLeft: `${(item.level - 1) * 14 + 16}px` }}
                                                            >
                                                                <span className="uppercase tracking-wide text-xs">
                                                                    {item.account_name}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-2.5 text-right font-mono font-black text-slate-900">
                                                                {formatRupiah(item.after_total)}
                                                            </td>
                                                            <td className="px-4 py-2.5 text-[11px] text-slate-500 font-medium">
                                                                Sub-akumulasi rekening
                                                            </td>
                                                            <td className="px-4 py-2.5 text-[11px] text-slate-400">
                                                                {item.keterangan || '-'}
                                                            </td>
                                                            <td className="px-3 py-2.5 text-center text-[10px] text-slate-400">
                                                                Grup
                                                            </td>
                                                        </tr>
                                                    );
                                                }

                                                return (
                                                    <tr key={item.id} className="hover:bg-slate-50/80 transition group">
                                                        <td className="px-3.5 py-2.5 text-center font-mono text-xs font-bold text-slate-600 group-hover:text-emerald-700">
                                                            {item.account_code}
                                                        </td>
                                                        <td
                                                            className="px-4 py-2.5 font-medium text-slate-800"
                                                            style={{ paddingLeft: `${(item.level - 1) * 14 + 16}px` }}
                                                        >
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="text-slate-300 group-hover:text-emerald-500 transition">↳</span>
                                                                <span>{item.account_name}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-2.5 text-right font-mono font-bold text-slate-900">
                                                            {formatRupiah(item.after_total)}
                                                        </td>
                                                        <td className="px-4 py-2.5">
                                                            <div className="flex flex-wrap items-center gap-1.5">
                                                                {jl > 0 && (
                                                                    <span className="inline-flex items-center rounded-md bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 border border-emerald-200">
                                                                        Jasa Layanan: {formatRupiah(jl)}
                                                                    </span>
                                                                )}
                                                                {ks > 0 && (
                                                                    <span className="inline-flex items-center rounded-md bg-blue-50 text-blue-800 text-[10px] font-bold px-2 py-0.5 border border-blue-200">
                                                                        Kerja Sama: {formatRupiah(ks)}
                                                                    </span>
                                                                )}
                                                                {ll > 0 && (
                                                                    <span className="inline-flex items-center rounded-md bg-teal-50 text-teal-800 text-[10px] font-bold px-2 py-0.5 border border-teal-200">
                                                                        Lain-lain: {formatRupiah(ll)}
                                                                    </span>
                                                                )}
                                                                {sp > 0 && (
                                                                    <span className="inline-flex items-center rounded-md bg-purple-50 text-purple-800 text-[10px] font-bold px-2 py-0.5 border border-purple-200">
                                                                        SiLPA: {formatRupiah(sp)}
                                                                    </span>
                                                                )}
                                                                {ap > 0 && (
                                                                    <span className="inline-flex items-center rounded-md bg-amber-50 text-amber-800 text-[10px] font-bold px-2 py-0.5 border border-amber-200">
                                                                        APBD: {formatRupiah(ap)}
                                                                    </span>
                                                                )}
                                                                {jl === 0 && ks === 0 && ll === 0 && sp === 0 && ap === 0 && (
                                                                    <span className="text-[11px] text-slate-400 font-normal">
                                                                        Belum dialokasikan
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-2.5 text-[11px] text-slate-500 max-w-xs truncate">
                                                            {item.keterangan || '-'}
                                                        </td>
                                                        <td className="px-3 py-2.5 text-center">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleOpenEditModal(item)}
                                                                className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-700 shadow-2xs hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-800 transition cursor-pointer"
                                                                title="Atur Pagu & Sumber Pembiayaan"
                                                            >
                                                                Atur Pagu
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* MODE 2: MATRIKS LENGKAP (16 Kolom Akuntansi Sesuai Dokumen 1 RSJ) */}
                    {expenseMatrixMode === 'LENGKAP' && (
                        <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xs">
                            <div className="border-b border-slate-200 bg-slate-50 px-4 py-2.5 flex items-center justify-between text-xs">
                                <span className="font-bold text-slate-700">
                                    Matriks 16 Kolom Dokumen 1 RBA RS Jiwa Tampan ({current_shift?.shift_name})
                                </span>
                                <span className="text-slate-500 text-[11px]">
                                    Gunakan horizontal scroll untuk meninjau rincian sumber dana
                                </span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full border-collapse border border-slate-300 text-[10px]">
                                    <thead>
                                        <tr className="bg-slate-100 text-center font-bold text-slate-800">
                                            <th rowSpan="3" className="border border-slate-300 p-1 w-12">No</th>
                                            <th rowSpan="3" className="border border-slate-300 p-1 min-w-[200px]">Uraian</th>
                                            <th colSpan="6" className="border border-slate-300 p-1 bg-slate-200/70">
                                                Sumber Dana Sebelum {current_shift?.shift_name}
                                            </th>
                                            <th colSpan="6" className="border border-slate-300 p-1 bg-emerald-100/70">
                                                Sumber Dana Setelah {current_shift?.shift_name}
                                            </th>
                                            <th rowSpan="3" className="border border-slate-300 p-1 w-24">Bertambah / Berkurang</th>
                                            <th rowSpan="3" className="border border-slate-300 p-1 min-w-[140px]">Keterangan</th>
                                            <th rowSpan="3" className="border border-slate-300 p-1 w-16">Aksi</th>
                                        </tr>
                                        <tr className="bg-slate-100 text-center font-bold text-[9.5px]">
                                            <th colSpan="4" className="border border-slate-300 p-0.5">Pendapatan BLUD</th>
                                            <th rowSpan="2" className="border border-slate-300 p-0.5 w-20">APBD</th>
                                            <th rowSpan="2" className="border border-slate-300 p-0.5 w-24">Jumlah (Rp)</th>
                                            <th colSpan="4" className="border border-slate-300 p-0.5">Pendapatan BLUD</th>
                                            <th rowSpan="2" className="border border-slate-300 p-0.5 w-20">APBD</th>
                                            <th rowSpan="2" className="border border-slate-300 p-0.5 w-24">Jumlah (Rp)</th>
                                        </tr>
                                        <tr className="bg-slate-100 text-center font-bold text-[8.5px]">
                                            <th className="border border-slate-300 p-0.5 w-20">Jasa Layanan</th>
                                            <th className="border border-slate-300 p-0.5 w-16">Kerjasama</th>
                                            <th className="border border-slate-300 p-0.5 w-16">Lain-lain</th>
                                            <th className="border border-slate-300 p-0.5 w-14">SiLPA</th>
                                            <th className="border border-slate-300 p-0.5 w-20">Jasa Layanan</th>
                                            <th className="border border-slate-300 p-0.5 w-16">Kerjasama</th>
                                            <th className="border border-slate-300 p-0.5 w-16">Lain-lain</th>
                                            <th className="border border-slate-300 p-0.5 w-14">SiLPA</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredExpenseItems.map((item) => {
                                            const isHeader = item.is_header;
                                            const isRoot = item.level === 1;
                                            const diff = Number(item.difference || 0);

                                            return (
                                                <tr
                                                    key={item.id}
                                                    className={
                                                        isRoot
                                                            ? 'font-black bg-slate-100 text-slate-900'
                                                            : isHeader
                                                            ? 'font-bold bg-slate-50 text-slate-900'
                                                            : 'hover:bg-emerald-50/40 transition'
                                                    }
                                                >
                                                    <td className="border border-slate-300 p-1 text-center font-mono font-bold">
                                                        {item.account_code}
                                                    </td>
                                                    <td
                                                        className="border border-slate-300 p-1"
                                                        style={{ paddingLeft: `${(item.level - 1) * 12 + 6}px` }}
                                                    >
                                                        <span className={isHeader ? 'font-bold uppercase' : 'font-medium'}>
                                                            {item.account_name}
                                                        </span>
                                                    </td>
                                                    {/* Sebelum */}
                                                    <td className="border border-slate-300 p-1 text-right font-mono">{formatRupiah(item.before_jasa_layanan)}</td>
                                                    <td className="border border-slate-300 p-1 text-right font-mono">{formatRupiah(item.before_hasil_kerjasama)}</td>
                                                    <td className="border border-slate-300 p-1 text-right font-mono">{formatRupiah(item.before_lain_lain_sah)}</td>
                                                    <td className="border border-slate-300 p-1 text-right font-mono">{formatRupiah(item.before_silpa)}</td>
                                                    <td className="border border-slate-300 p-1 text-right font-mono">{formatRupiah(item.before_apbd)}</td>
                                                    <td className="border border-slate-300 p-1 text-right font-mono font-bold">{formatRupiah(item.before_total)}</td>

                                                    {/* Setelah */}
                                                    <td className="border border-slate-300 p-1 text-right font-mono">{formatRupiah(item.after_jasa_layanan)}</td>
                                                    <td className="border border-slate-300 p-1 text-right font-mono">{formatRupiah(item.after_hasil_kerjasama)}</td>
                                                    <td className="border border-slate-300 p-1 text-right font-mono">{formatRupiah(item.after_lain_lain_sah)}</td>
                                                    <td className="border border-slate-300 p-1 text-right font-mono">{formatRupiah(item.after_silpa)}</td>
                                                    <td className="border border-slate-300 p-1 text-right font-mono">{formatRupiah(item.after_apbd)}</td>
                                                    <td className="border border-slate-300 p-1 text-right font-mono font-bold text-slate-900">{formatRupiah(item.after_total)}</td>

                                                    {/* Selisih & Keterangan */}
                                                    <td className="border border-slate-300 p-1 text-right font-mono font-bold">
                                                        {diff !== 0 ? (
                                                            <span className={diff > 0 ? 'text-blue-700' : 'text-rose-700'}>
                                                                {formatRupiah(diff)}
                                                            </span>
                                                        ) : '-'}
                                                    </td>
                                                    <td className="border border-slate-300 p-1 text-[9px] text-slate-600 leading-tight">
                                                        {item.keterangan || '-'}
                                                    </td>
                                                    <td className="border border-slate-300 p-1 text-center">
                                                        {!isHeader && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleOpenEditModal(item)}
                                                                className="rounded-md border border-slate-300 bg-white px-2 py-0.5 text-[10px] font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 transition cursor-pointer"
                                                            >
                                                                Ubah
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* TAB 4: RINCIAN USULAN BELANJA UNIT KERJA (DISETUJUI KEUANGAN) */}
            {activeTab === 'RINCIAN_BARANG' && (
                <div className="space-y-6">
                    {/* Minimalist Single-Row Toolbar (Persis Admin/Unit) */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
                        <div className="flex flex-1 flex-wrap items-center gap-3">
                            <div className="relative flex-1 min-w-[220px] max-w-sm">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Cari nama barang, spesifikasi, unit pengusul, kode akun..."
                                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs text-slate-900 font-medium focus:border-emerald-600 focus:ring-emerald-500"
                                />
                            </div>

                            {/* Filter Status Usulan Pills */}
                            <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-bold">
                                <button
                                    type="button"
                                    onClick={() => setStatusFilter('DISETUJUI')}
                                    className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                                        statusFilter === 'DISETUJUI'
                                            ? 'bg-white text-emerald-800 shadow-2xs font-black'
                                            : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                >
                                    Disetujui Keuangan
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setStatusFilter('SEMUA')}
                                    className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                                        statusFilter === 'SEMUA'
                                            ? 'bg-white text-slate-900 shadow-2xs font-black'
                                            : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                >
                                    Semua Usulan Masuk
                                </button>
                            </div>

                            {/* Saklar Toggle: Sembunyikan Rekening Kosong */}
                            <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer select-none bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-2 rounded-xl transition">
                                <input
                                    type="checkbox"
                                    checked={showOnlyWithItems}
                                    onChange={(e) => setShowOnlyWithItems(e.target.checked)}
                                    className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                                />
                                <span>Hanya Rekening Terisi ({accountsWithItemsCount})</span>
                            </label>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                            <a
                                href={route('perencanaan.rba.print-rincian-belanja', { year: selected_year, shift_id: current_shift?.id })}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700 shadow-2xs transition active:scale-95 cursor-pointer"
                            >
                                <span>🖨️</span>
                                Cetak Rincian Belanja
                            </a>
                        </div>
                    </div>

                    {/* Main Minimalist Table Matching RSJ Tampan Official Breakdown */}
                    <div className="overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-xs">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200 text-xs">
                                <thead>
                                    <tr className="bg-slate-100 text-center font-bold text-slate-800">
                                        <th className="border border-slate-300 px-3 py-2.5 w-28">Kode Rekening</th>
                                        <th className="border border-slate-300 px-4 py-2.5 text-left min-w-[280px]">Uraian Akun & Usulan Barang</th>
                                        <th className="border border-slate-300 px-3 py-2.5 w-24">Volume Disetujui</th>
                                        <th className="border border-slate-300 px-3 py-2.5 w-20">Satuan</th>
                                        <th className="border border-slate-300 px-4 py-2.5 text-right w-36">Harga Satuan (Rp)</th>
                                        <th className="border border-slate-300 px-4 py-2.5 text-right w-36">Jumlah (Rp)</th>
                                        <th className="border border-slate-300 px-4 py-2.5 text-left w-52">Unit Pengusul</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 bg-white">
                                    {/* BAB 1: BELANJA */}
                                    <tr className="bg-slate-100 font-black text-slate-900">
                                        <td className="border border-slate-300 px-3 py-2 text-center font-mono">1</td>
                                        <td className="border border-slate-300 px-4 py-2 uppercase tracking-wider" colSpan={4}>
                                            BELANJA BLUD RS JIWA TAMPAN
                                        </td>
                                        <td className="border border-slate-300 px-4 py-2 text-right font-mono font-black text-emerald-800">
                                            {formatRupiah(totalUsulanNominal)}
                                        </td>
                                        <td className="border border-slate-300 px-4 py-2 text-xs font-bold text-slate-600">
                                            Total {totalUsulanCount} Barang {statusFilter === 'DISETUJUI' ? 'Disetujui' : 'Usulan'}
                                        </td>
                                    </tr>

                                    {/* SEKSI 1.1: BELANJA OPERASI */}
                                    <tr className="bg-emerald-50/90 text-emerald-950 font-black border-y border-emerald-200">
                                        <td className="border border-slate-300 px-3 py-2 text-center font-mono text-emerald-900">1.1</td>
                                        <td className="border border-slate-300 px-4 py-2 uppercase tracking-wider pl-4" colSpan={4}>
                                            1.1 BELANJA OPERASI BLUD
                                        </td>
                                        <td className="border border-slate-300 px-4 py-2 text-right font-mono font-black text-emerald-900">
                                            {formatRupiah(totalUsulanOperasi)}
                                        </td>
                                        <td className="border border-slate-300 px-4 py-2 text-xs font-medium text-emerald-800">
                                            Operasional Pelayanan RS
                                        </td>
                                    </tr>

                                    {/* Belanja Operasi Accounts & Items */}
                                    {listOperasi.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="p-6 text-center text-slate-400 italic">
                                                {showOnlyWithItems
                                                    ? `Belum ada usulan Belanja Operasi ${statusFilter === 'DISETUJUI' ? 'yang disetujui Keuangan' : 'yang diajukan'} pada T.A. ${selected_year}`
                                                    : 'Tidak ada rekening Belanja Operasi yang cocok dengan pencarian'}
                                            </td>
                                        </tr>
                                    ) : (
                                        listOperasi.map((acc) => {
                                            const hasDirectItems = acc.active_items && acc.active_items.length > 0;
                                            const isMajorHeader = acc.level === 2; // 1.1.1, 1.1.2
                                            const isSubHeader = acc.level === 3;   // 1.1.2.1

                                            return (
                                                <Fragment key={`op-${acc.id}`}>
                                                    {/* Account Row */}
                                                    <tr
                                                        className={`border-b border-slate-200 transition ${
                                                            isMajorHeader
                                                                ? 'bg-slate-100/90 font-black text-slate-900'
                                                                : isSubHeader
                                                                ? 'bg-slate-50/80 font-bold text-slate-800'
                                                                : hasDirectItems
                                                                ? 'bg-emerald-50/30 hover:bg-emerald-50/50 font-bold text-slate-900'
                                                                : 'bg-white hover:bg-slate-50/70 font-semibold text-slate-700'
                                                        }`}
                                                    >
                                                        <td className="border border-slate-300 px-3 py-2 text-center font-mono text-xs text-slate-800">
                                                            {acc.account_code}
                                                        </td>
                                                        <td
                                                            className={`border border-slate-300 px-4 py-2 ${
                                                                acc.level === 2 ? 'pl-4' : acc.level === 3 ? 'pl-8' : acc.level === 4 ? 'pl-12' : 'pl-16'
                                                            }`}
                                                            colSpan={4}
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                {acc.level > 2 && <span className="text-slate-400 font-bold text-xs">└</span>}
                                                                <span className={isMajorHeader ? 'tracking-tight uppercase' : ''}>{acc.account_name}</span>
                                                                {acc.active_count > 0 && (
                                                                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-black border ${
                                                                        statusFilter === 'DISETUJUI'
                                                                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                                                            : 'bg-blue-100 text-blue-800 border-blue-300'
                                                                    }`}>
                                                                        {acc.active_count} Barang Usulan
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="border border-slate-300 px-4 py-2 text-right font-mono font-bold text-slate-900">
                                                            {acc.active_total > 0
                                                                ? formatRupiah(acc.active_total)
                                                                : acc.calc_rollup_total > 0
                                                                ? formatRupiah(acc.calc_rollup_total)
                                                                : '-'}
                                                        </td>
                                                        <td className="border border-slate-300 px-4 py-2 text-slate-500 text-xs">
                                                            Pagu: <span className="font-semibold text-slate-700">{formatRupiah(acc.remaining_budget)}</span>
                                                        </td>
                                                    </tr>

                                                    {/* Direct Items under this Account */}
                                                    {hasDirectItems && acc.active_items.map((item, idx) => (
                                                        <tr key={`item-${acc.id}-${item.id || idx}`} className="hover:bg-slate-50/80 transition bg-white">
                                                            <td className="border border-slate-300 px-3 py-2 text-center text-slate-400 font-mono text-[10px]">
                                                                #{idx + 1}
                                                            </td>
                                                            <td className="border border-slate-300 px-4 py-2 pl-16 sm:pl-20">
                                                                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                                                    <span className="text-emerald-600 font-black">&bull;</span>
                                                                    <span>{item.item_name}</span>
                                                                </div>
                                                                {item.specification && (
                                                                    <p className="text-[11px] text-slate-500 pl-3.5 mt-0.5">
                                                                        {item.specification}
                                                                    </p>
                                                                )}
                                                            </td>
                                                            <td className="border border-slate-300 px-3 py-2 text-center font-mono font-bold text-slate-800">
                                                                {item.resolved_quantity || item.quantity_approved || item.quantity_requested || 1}
                                                            </td>
                                                            <td className="border border-slate-300 px-3 py-2 text-center text-slate-600 font-medium">
                                                                {item.unit_type || 'Pcs'}
                                                            </td>
                                                            <td className="border border-slate-300 px-4 py-2 text-right font-mono text-slate-700">
                                                                {formatRupiah(item.unit_price)}
                                                            </td>
                                                            <td className="border border-slate-300 px-4 py-2 text-right font-mono font-black text-slate-900">
                                                                {formatRupiah(item.resolved_subtotal || item.subtotal)}
                                                            </td>
                                                            <td className="border border-slate-300 px-4 py-2 text-xs">
                                                                <div className="flex flex-col gap-0.5">
                                                                    <span className="inline-block rounded-md bg-slate-100 text-slate-800 font-bold px-2 py-0.5 border border-slate-200 w-fit">
                                                                        {item.requisition?.unit?.name || 'Unit Kerja'}
                                                                    </span>
                                                                    <span className="text-[10px] text-slate-400 font-mono">
                                                                        {item.requisition?.requisition_number}
                                                                    </span>
                                                                    <span className={`inline-flex items-center gap-1 text-[10px] font-black mt-0.5 ${
                                                                        item.status === 'Disetujui_Selesai'
                                                                            ? 'text-emerald-700'
                                                                            : item.status === 'Diproses_Keuangan'
                                                                            ? 'text-blue-700'
                                                                            : 'text-amber-700'
                                                                    }`}>
                                                                        <span className={`h-1.5 w-1.5 rounded-full ${
                                                                            item.status === 'Disetujui_Selesai'
                                                                                ? 'bg-emerald-500'
                                                                                : item.status === 'Diproses_Keuangan'
                                                                                ? 'bg-blue-500'
                                                                                : 'bg-amber-500'
                                                                        }`} />
                                                                        {item.status === 'Disetujui_Selesai'
                                                                            ? 'Disetujui Keuangan'
                                                                            : item.status === 'Diproses_Keuangan'
                                                                            ? 'Diproses Keuangan'
                                                                            : 'Menunggu Telaah'}
                                                                    </span>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </Fragment>
                                            );
                                        })
                                    )}

                                    {/* SEKSI 1.2: BELANJA MODAL */}
                                    <tr className="bg-purple-50/90 text-purple-950 font-black border-y border-purple-200">
                                        <td className="border border-slate-300 px-3 py-2 text-center font-mono text-purple-900">1.2</td>
                                        <td className="border border-slate-300 px-4 py-2 uppercase tracking-wider pl-4" colSpan={4}>
                                            1.2 BELANJA MODAL BLUD
                                        </td>
                                        <td className="border border-slate-300 px-4 py-2 text-right font-mono font-black text-purple-900">
                                            {formatRupiah(totalUsulanModal)}
                                        </td>
                                        <td className="border border-slate-300 px-4 py-2 text-xs font-medium text-purple-800">
                                            Investasi Fisik Rumah Sakit
                                        </td>
                                    </tr>

                                    {/* Belanja Modal Accounts & Items */}
                                    {listModal.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="p-6 text-center text-slate-400 italic">
                                                {showOnlyWithItems
                                                    ? `Belum ada usulan Belanja Modal ${statusFilter === 'DISETUJUI' ? 'yang disetujui Keuangan' : 'yang diajukan'} pada T.A. ${selected_year}`
                                                    : 'Tidak ada rekening Belanja Modal yang cocok dengan pencarian'}
                                            </td>
                                        </tr>
                                    ) : (
                                        listModal.map((acc) => {
                                            const hasDirectItems = acc.active_items && acc.active_items.length > 0;
                                            const isMajorHeader = acc.level === 2; // 1.2.1
                                            const isSubHeader = acc.level === 3;   // 1.2.1.2

                                            return (
                                                <Fragment key={`mod-${acc.id}`}>
                                                    {/* Account Row */}
                                                    <tr
                                                        className={`border-b border-slate-200 transition ${
                                                            isMajorHeader
                                                                ? 'bg-slate-100/90 font-black text-slate-900'
                                                                : isSubHeader
                                                                ? 'bg-slate-50/80 font-bold text-slate-800'
                                                                : hasDirectItems
                                                                ? 'bg-purple-50/30 hover:bg-purple-50/50 font-bold text-slate-900'
                                                                : 'bg-white hover:bg-slate-50/70 font-semibold text-slate-700'
                                                        }`}
                                                    >
                                                        <td className="border border-slate-300 px-3 py-2 text-center font-mono text-xs text-slate-800">
                                                            {acc.account_code}
                                                        </td>
                                                        <td
                                                            className={`border border-slate-300 px-4 py-2 ${
                                                                acc.level === 2 ? 'pl-4' : acc.level === 3 ? 'pl-8' : acc.level === 4 ? 'pl-12' : 'pl-16'
                                                            }`}
                                                            colSpan={4}
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                {acc.level > 2 && <span className="text-slate-400 font-bold text-xs">└</span>}
                                                                <span className={isMajorHeader ? 'tracking-tight uppercase' : ''}>{acc.account_name}</span>
                                                                {acc.active_count > 0 && (
                                                                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-black border ${
                                                                        statusFilter === 'DISETUJUI'
                                                                            ? 'bg-purple-100 text-purple-800 border-purple-300'
                                                                            : 'bg-blue-100 text-blue-800 border-blue-300'
                                                                    }`}>
                                                                        {acc.active_count} Barang Usulan
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="border border-slate-300 px-4 py-2 text-right font-mono font-bold text-slate-900">
                                                            {acc.active_total > 0
                                                                ? formatRupiah(acc.active_total)
                                                                : acc.calc_rollup_total > 0
                                                                ? formatRupiah(acc.calc_rollup_total)
                                                                : '-'}
                                                        </td>
                                                        <td className="border border-slate-300 px-4 py-2 text-slate-500 text-xs">
                                                            Pagu: <span className="font-semibold text-slate-700">{formatRupiah(acc.remaining_budget)}</span>
                                                        </td>
                                                    </tr>

                                                    {/* Direct items under modal account */}
                                                    {hasDirectItems && acc.active_items.map((item, idx) => (
                                                        <tr key={`mitem-${acc.id}-${item.id || idx}`} className="hover:bg-slate-50/80 transition bg-white">
                                                            <td className="border border-slate-300 px-3 py-2 text-center text-slate-400 font-mono text-[10px]">
                                                                #{idx + 1}
                                                            </td>
                                                            <td className="border border-slate-300 px-4 py-2 pl-16 sm:pl-20">
                                                                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                                                    <span className="text-purple-600 font-black">&bull;</span>
                                                                    <span>{item.item_name}</span>
                                                                </div>
                                                                {item.specification && (
                                                                    <p className="text-[11px] text-slate-500 pl-3.5 mt-0.5">
                                                                        {item.specification}
                                                                    </p>
                                                                )}
                                                            </td>
                                                            <td className="border border-slate-300 px-3 py-2 text-center font-mono font-bold text-slate-800">
                                                                {item.resolved_quantity || item.quantity_approved || item.quantity_requested || 1}
                                                            </td>
                                                            <td className="border border-slate-300 px-3 py-2 text-center text-slate-600 font-medium">
                                                                {item.unit_type || 'Unit'}
                                                            </td>
                                                            <td className="border border-slate-300 px-4 py-2 text-right font-mono text-slate-700">
                                                                {formatRupiah(item.unit_price)}
                                                            </td>
                                                            <td className="border border-slate-300 px-4 py-2 text-right font-mono font-black text-slate-900">
                                                                {formatRupiah(item.resolved_subtotal || item.subtotal)}
                                                            </td>
                                                            <td className="border border-slate-300 px-4 py-2 text-xs">
                                                                <div className="flex flex-col gap-0.5">
                                                                    <span className="inline-block rounded-md bg-slate-100 text-slate-800 font-bold px-2 py-0.5 border border-slate-200 w-fit">
                                                                        {item.requisition?.unit?.name || 'Unit Kerja'}
                                                                    </span>
                                                                    <span className="text-[10px] text-slate-400 font-mono">
                                                                        {item.requisition?.requisition_number}
                                                                    </span>
                                                                    <span className={`inline-flex items-center gap-1 text-[10px] font-black mt-0.5 ${
                                                                        item.status === 'Disetujui_Selesai'
                                                                            ? 'text-emerald-700'
                                                                            : item.status === 'Diproses_Keuangan'
                                                                            ? 'text-blue-700'
                                                                            : 'text-amber-700'
                                                                    }`}>
                                                                        <span className={`h-1.5 w-1.5 rounded-full ${
                                                                            item.status === 'Disetujui_Selesai'
                                                                                ? 'bg-emerald-500'
                                                                                : item.status === 'Diproses_Keuangan'
                                                                                ? 'bg-blue-500'
                                                                                : 'bg-amber-500'
                                                                        }`} />
                                                                        {item.status === 'Disetujui_Selesai'
                                                                            ? 'Disetujui Keuangan'
                                                                            : item.status === 'Diproses_Keuangan'
                                                                            ? 'Diproses Keuangan'
                                                                            : 'Menunggu Telaah'}
                                                                    </span>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </Fragment>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB 5: KELOLA VERSI & PERGESERAN RBA */}
            {activeTab === 'SHIFTS' && (
                <div className="space-y-6">
                    {/* LIST OF SHIFTS TABLE */}
                    <div className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden shadow-2xs">
                        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div>
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                                    <span>⚙️</span> Daftar Lengkap Versi RBA & SK Penetapan
                               </h3>
                                <p className="mt-0.5 text-xs text-slate-500 font-medium">
                                    Perbandingan total belanja, pendapatan, serta status acuan resmi rumah sakit.
                                </p>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-600 uppercase tracking-wider text-[11px] font-bold">
                                        <th className="py-3 px-4 w-12 text-center">No</th>
                                        <th className="py-3 px-4">Tahapan & Periode</th>
                                        <th className="py-3 px-4">Judul Dokumen Resmi (SK)</th>
                                        <th className="py-3 px-4 text-right">Pagu Belanja</th>
                                        <th className="py-3 px-4 text-right">Target Pendapatan</th>
                                        <th className="py-3 px-4 text-center">Status</th>
                                        <th className="py-3 px-4">Catatan Telaahan</th>
                                        <th className="py-3 px-4 text-center">Aksi Cepat</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {shifts.map((s, idx) => {
                                        const isCurrent = current_shift?.id === s.id;
                                        const isActive = s.status === 'Aktif';
                                        const isDraft = s.status === 'Draft';

                                        return (
                                            <tr
                                                key={s.id}
                                                className={`hover:bg-slate-50/80 transition ${
                                                    isCurrent ? 'bg-emerald-50/30' : ''
                                                }`}
                                            >
                                                <td className="py-3.5 px-4 font-bold text-slate-400 text-center">
                                                    {idx + 1}
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    <div className="flex items-center gap-1.5 flex-wrap">
                                                        <span className="font-black text-slate-900 text-sm">
                                                            {s.shift_name}
                                                        </span>
                                                        {isCurrent && (
                                                            <span className="rounded-md bg-emerald-100 px-1.5 py-0.5 text-[10px] font-black text-emerald-800 border border-emerald-200">
                                                                Sedang Dilihat
                                                            </span>
                                                        )}
                                                        {isActive && (
                                                            <span className="rounded-md bg-emerald-600 px-1.5 py-0.5 text-[10px] font-black text-white">
                                                                Acuan Resmi
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-[11px] font-medium text-slate-500 mt-0.5">
                                                        Periode: {s.period_month}
                                                    </p>
                                                </td>
                                                <td className="py-3.5 px-4 max-w-xs">
                                                    <p className="font-medium text-slate-800 line-clamp-2 leading-relaxed">
                                                        {s.doc_title}
                                                    </p>
                                                </td>
                                                <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                                                    {formatRupiah(s.total_expense || 0)}
                                                </td>
                                                <td className="py-3.5 px-4 text-right font-mono font-bold text-teal-800">
                                                    {formatRupiah(s.total_revenue || 0)}
                                                </td>
                                                <td className="py-3.5 px-4 text-center">
                                                    <span
                                                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold border ${
                                                            isActive
                                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                                                : isDraft
                                                                ? 'bg-amber-50 text-amber-700 border-amber-300'
                                                                : 'bg-slate-100 text-slate-600 border-slate-300'
                                                        }`}
                                                    >
                                                        <span
                                                            className={`h-1.5 w-1.5 rounded-full ${
                                                                isActive
                                                                    ? 'bg-emerald-500 animate-pulse'
                                                                    : isDraft
                                                                    ? 'bg-amber-500'
                                                                    : 'bg-slate-400'
                                                            }`}
                                                        />
                                                        {s.status}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate text-[11px]">
                                                    {s.notes || '-'}
                                                </td>
                                                <td className="py-3.5 px-4">
                                                    <div className="flex items-center justify-center gap-1.5">
                                                        {!isCurrent && (
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    router.get(route('perencanaan.rba.index'), {
                                                                        year: selected_year,
                                                                        shift_id: s.id,
                                                                        tab: 'RINGKASAN',
                                                                    })
                                                                }
                                                                className="rounded-lg border border-slate-300 bg-white hover:bg-slate-50 px-2.5 py-1.5 text-xs font-bold text-slate-700 shadow-2xs transition cursor-pointer"
                                                                title="Buka Dokumen Ini"
                                                            >
                                                                Buka
                                                            </button>
                                                        )}

                                                        {!isActive && (
                                                            <button
                                                                type="button"
                                                                onClick={() => setActivatingShift(s)}
                                                                className="rounded-lg bg-amber-600 hover:bg-amber-700 px-2.5 py-1.5 text-xs font-bold text-white shadow-2xs transition cursor-pointer"
                                                                title="Aktifkan sebagai Acuan Resmi Rumah Sakit"
                                                            >
                                                                Aktifkan
                                                            </button>
                                                        )}

                                                        {/* Delete Button */}
                                                        {shifts.length > 1 && (
                                                            <button
                                                                type="button"
                                                                onClick={() => setDeletingShift(s)}
                                                                className="rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 p-1.5 text-xs font-bold shadow-2xs transition cursor-pointer"
                                                                title="Hapus Dokumen Pergeseran Ini"
                                                            >
                                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                                                </svg>
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL 1: EDIT REVENUE ITEM (TARGET PENDAPATAN) */}
            {editingRevenueItem && (
                <Modal show={!!editingRevenueItem} onClose={() => setEditingRevenueItem(null)} maxWidth="md">
                    <form onSubmit={submitRevenueItemEdit} className="p-6">
                        <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 text-xl font-bold">
                                💰
                            </span>
                            <div>
                                <h3 className="text-base font-black text-slate-900">
                                    Penetapan Target Pendapatan
                                </h3>
                                <p className="text-xs text-slate-500 font-medium">
                                    Pos: <span className="font-bold text-slate-800">{editingRevenueItem.item_name}</span>
                                </p>
                            </div>
                        </div>

                        <div className="my-5 space-y-4">
                            {/* Visual Info Chips */}
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="rounded-xl bg-slate-50 p-3 border border-slate-200/80">
                                    <span className="text-slate-500 block text-[11px]">Target Saat Ini:</span>
                                    <span className="font-mono font-bold text-slate-900 text-sm block mt-0.5">
                                        {formatRupiah(editingRevenueItem.after_amount || editingRevenueItem.before_amount)}
                                    </span>
                                </div>
                                <div className="rounded-xl bg-emerald-50/60 p-3 border border-emerald-200/80">
                                    <span className="text-emerald-700 block text-[11px]">Realisasi Kas Masuk:</span>
                                    <span className="font-mono font-bold text-emerald-900 text-sm block mt-0.5">
                                        {formatRupiah(editingRevenueItem.realized_amount)}
                                    </span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Target Pendapatan Baru (Rp)
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400">Rp</span>
                                    <input
                                        type="number"
                                        min="0"
                                        step="1000"
                                        value={revenueItemForm.data.after_amount}
                                        onChange={(e) => revenueItemForm.setData('after_amount', e.target.value)}
                                        className="w-full rounded-xl border border-slate-300 font-mono font-bold text-slate-900 focus:border-emerald-600 focus:ring-emerald-500 text-sm py-2 pl-10 pr-3 shadow-2xs"
                                        required
                                    />
                                </div>
                                <div className="mt-2 flex items-center justify-between text-xs">
                                    <span className="text-slate-500">Format Nilai:</span>
                                    <span className="font-mono font-bold text-emerald-800">
                                        {formatRupiah(revenueItemForm.data.after_amount)}
                                    </span>
                                </div>
                            </div>

                            <div className="rounded-xl bg-emerald-50 p-3 text-[11px] text-emerald-800 border border-emerald-200/80 flex items-start gap-2">
                                <span className="text-sm shrink-0">💡</span>
                                <p className="font-medium leading-relaxed">
                                    Target yang Anda tetapkan akan otomatis mengakumulasi kelompok pos induk dan langsung memperbarui neraca <strong>Ringkasan & SiLPA</strong>.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-2.5 border-t border-slate-200 pt-4">
                            <button
                                type="button"
                                onClick={() => setEditingRevenueItem(null)}
                                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={revenueItemForm.processing}
                                className="rounded-xl bg-emerald-600 hover:bg-emerald-700 px-5 py-2 text-xs font-bold text-white shadow-md transition disabled:opacity-50 cursor-pointer"
                            >
                                {revenueItemForm.processing ? 'Menyimpan...' : 'Simpan Target Pendapatan'}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* MODAL 2: EDIT EXPENSE ITEM (MULTI-SUMBER DANA) */}
            {editingItem && (
                <Modal show={!!editingItem} onClose={() => setEditingItem(null)} maxWidth="lg">
                    {(() => {
                        const curTotal =
                            Number(itemForm.data.after_jasa_layanan || 0) +
                            Number(itemForm.data.after_hasil_kerjasama || 0) +
                            Number(itemForm.data.after_lain_lain_sah || 0) +
                            Number(itemForm.data.after_silpa || 0) +
                            Number(itemForm.data.after_apbd || 0);
                        const curDiff = curTotal - Number(editingItem.before_total || 0);

                        return (
                            <form onSubmit={submitItemEdit} className="p-6">
                                <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 text-xl font-bold">
                                        ⚡
                                    </span>
                                    <div>
                                        <h3 className="text-base font-black text-slate-900">
                                            Penyesuaian Pagu & Sumber Pembiayaan
                                        </h3>
                                        <p className="text-xs text-slate-500 font-medium">
                                            [{editingItem.account_code}] {editingItem.account_name}
                                        </p>
                                    </div>
                                </div>

                                {/* Live Preview Total Card */}
                                <div className="my-4 rounded-2xl bg-slate-50 p-4 border border-slate-200/90 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                    <div>
                                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                            Total Pagu Alokasi Baru
                                        </span>
                                        <p className="text-xl font-black text-slate-900 font-mono mt-0.5">
                                            {formatRupiah(curTotal)}
                                        </p>
                                    </div>
                                    {!is_murni && (
                                        <div className="text-right text-xs">
                                            <span className="text-slate-500">Pagu Semula: {formatRupiah(editingItem.before_total)}</span>
                                            <div className="mt-0.5 font-mono font-bold">
                                                {curDiff !== 0 ? (
                                                    <span className={curDiff > 0 ? 'text-blue-700' : 'text-rose-700'}>
                                                        {curDiff > 0 ? `+${formatRupiah(curDiff)}` : formatRupiah(curDiff)}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400">Tidak ada perubahan</span>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="mb-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                                    <div>
                                        <label className="block font-bold text-slate-700 mb-1">
                                            1. Jasa Layanan (Rp)
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={itemForm.data.after_jasa_layanan}
                                            onChange={(e) => itemForm.setData('after_jasa_layanan', e.target.value)}
                                            className="w-full rounded-xl border border-slate-300 font-mono py-2 px-3 text-xs shadow-2xs focus:border-emerald-600 focus:ring-emerald-500 font-bold text-slate-900"
                                        />
                                        <span className="mt-1 block text-[10px] text-slate-500">
                                            {formatRupiah(itemForm.data.after_jasa_layanan)}
                                        </span>
                                    </div>

                                    <div>
                                        <label className="block font-bold text-slate-700 mb-1">
                                            2. Hasil Kerja Sama (Rp)
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={itemForm.data.after_hasil_kerjasama}
                                            onChange={(e) => itemForm.setData('after_hasil_kerjasama', e.target.value)}
                                            className="w-full rounded-xl border border-slate-300 font-mono py-2 px-3 text-xs shadow-2xs focus:border-emerald-600 focus:ring-emerald-500 font-bold text-slate-900"
                                        />
                                        <span className="mt-1 block text-[10px] text-slate-500">
                                            {formatRupiah(itemForm.data.after_hasil_kerjasama)}
                                        </span>
                                    </div>

                                    <div>
                                        <label className="block font-bold text-slate-700 mb-1">
                                            3. Lain-lain BLUD Sah (Rp)
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={itemForm.data.after_lain_lain_sah}
                                            onChange={(e) => itemForm.setData('after_lain_lain_sah', e.target.value)}
                                            className="w-full rounded-xl border border-slate-300 font-mono py-2 px-3 text-xs shadow-2xs focus:border-emerald-600 focus:ring-emerald-500 font-bold text-slate-900"
                                        />
                                        <span className="mt-1 block text-[10px] text-slate-500">
                                            {formatRupiah(itemForm.data.after_lain_lain_sah)}
                                        </span>
                                    </div>

                                    <div>
                                        <label className="block font-bold text-slate-700 mb-1">
                                            4. Penggunaan SiLPA (Rp)
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={itemForm.data.after_silpa}
                                            onChange={(e) => itemForm.setData('after_silpa', e.target.value)}
                                            className="w-full rounded-xl border border-slate-300 font-mono py-2 px-3 text-xs shadow-2xs focus:border-emerald-600 focus:ring-emerald-500 font-bold text-slate-900"
                                        />
                                        <span className="mt-1 block text-[10px] text-slate-500">
                                            {formatRupiah(itemForm.data.after_silpa)}
                                        </span>
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label className="block font-bold text-slate-700 mb-1">
                                            5. Alokasi Belanja APBD (Rp)
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={itemForm.data.after_apbd}
                                            onChange={(e) => itemForm.setData('after_apbd', e.target.value)}
                                            className="w-full rounded-xl border border-slate-300 font-mono py-2 px-3 text-xs shadow-2xs focus:border-emerald-600 focus:ring-emerald-500 font-bold text-slate-900"
                                        />
                                        <span className="mt-1 block text-[10px] text-slate-500">
                                            {formatRupiah(itemForm.data.after_apbd)}
                                        </span>
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label className="block font-bold text-slate-700 mb-1">
                                            Catatan Telaahan Staf / Keterangan
                                        </label>
                                        <textarea
                                            rows="2"
                                            value={itemForm.data.keterangan}
                                            onChange={(e) => itemForm.setData('keterangan', e.target.value)}
                                            placeholder="Contoh: Berdasarkan Telaahan Staf PPTK Kegiatan mengenai penyesuaian pagu rekening..."
                                            className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs font-medium focus:border-emerald-600 focus:ring-emerald-500 shadow-2xs"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-end gap-2.5 border-t border-slate-200 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setEditingItem(null)}
                                        className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={itemForm.processing}
                                        className="rounded-xl bg-emerald-600 hover:bg-emerald-700 px-5 py-2 text-xs font-bold text-white shadow-md transition disabled:opacity-50 cursor-pointer"
                                    >
                                        {itemForm.processing ? 'Menyimpan...' : 'Simpan Alokasi Belanja'}
                                    </button>
                                </div>
                            </form>
                        );
                    })()}
                </Modal>
            )}

            {/* MODAL 3: EDIT PEMBIAYAAN & SILPA */}
            {showPembiayaanModal && (
                <Modal show={showPembiayaanModal} onClose={() => setShowPembiayaanModal(false)} maxWidth="md">
                    <form onSubmit={submitPembiayaanEdit} className="p-6">
                        <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
                            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-800 text-lg font-bold">
                                📊
                            </span>
                            <div>
                                <h3 className="text-base font-black text-slate-900">
                                    Atur Pembiayaan & Proyeksi SiLPA
                                </h3>
                                <p className="text-xs text-slate-500 font-medium">
                                    {current_shift?.shift_name} T.A. {current_shift?.year}
                                </p>
                            </div>
                        </div>

                        <div className="my-5 space-y-3 text-xs">
                            <h4 className="font-bold uppercase text-slate-700 border-b border-slate-200 pb-1">
                                C. Penerimaan Daerah
                            </h4>
                            <div>
                                <label className="block font-semibold text-slate-600 mb-0.5">
                                    Penggunaan SiLPA Tahun Sebelumnya (Rp)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={pembiayaanForm.data.penerimaan_silpa}
                                    onChange={(e) => pembiayaanForm.setData('penerimaan_silpa', e.target.value)}
                                    className="w-full rounded-xl border border-slate-300 font-mono py-1.5 px-3 text-xs"
                                />
                            </div>
                            <div>
                                <label className="block font-semibold text-slate-600 mb-0.5">
                                    Divestasi (Rp)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={pembiayaanForm.data.penerimaan_divestasi}
                                    onChange={(e) => pembiayaanForm.setData('penerimaan_divestasi', e.target.value)}
                                    className="w-full rounded-xl border border-slate-300 font-mono py-1.5 px-3 text-xs"
                                />
                            </div>
                            <div>
                                <label className="block font-semibold text-slate-600 mb-0.5">
                                    Penerimaan Utang / Pinjaman (Rp)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={pembiayaanForm.data.penerimaan_pinjaman}
                                    onChange={(e) => pembiayaanForm.setData('penerimaan_pinjaman', e.target.value)}
                                    className="w-full rounded-xl border border-slate-300 font-mono py-1.5 px-3 text-xs"
                                />
                            </div>

                            <h4 className="font-bold uppercase text-slate-700 border-b border-slate-200 pb-1 pt-2">
                                D. Pengeluaran Pembiayaan
                            </h4>
                            <div>
                                <label className="block font-semibold text-slate-600 mb-0.5">
                                    Investasi Daerah (Rp)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={pembiayaanForm.data.pengeluaran_investasi}
                                    onChange={(e) => pembiayaanForm.setData('pengeluaran_investasi', e.target.value)}
                                    className="w-full rounded-xl border border-slate-300 font-mono py-1.5 px-3 text-xs"
                                />
                            </div>
                            <div>
                                <label className="block font-semibold text-slate-600 mb-0.5">
                                    Pembayaran Pokok Utang (Rp)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={pembiayaanForm.data.pengeluaran_pokok_utang}
                                    onChange={(e) => pembiayaanForm.setData('pengeluaran_pokok_utang', e.target.value)}
                                    className="w-full rounded-xl border border-slate-300 font-mono py-1.5 px-3 text-xs"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-2.5 border-t border-slate-200 pt-4">
                            <button
                                type="button"
                                onClick={() => setShowPembiayaanModal(false)}
                                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={pembiayaanForm.processing}
                                className="rounded-xl bg-blue-600 hover:bg-blue-700 px-5 py-2 text-xs font-bold text-white shadow-md transition disabled:opacity-50"
                            >
                                {pembiayaanForm.processing ? 'Menyimpan...' : 'Simpan Pembiayaan'}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* MODAL 4: CREATE NEW SHIFT */}
            {showShiftModal && (
                <Modal show={showShiftModal} onClose={() => setShowShiftModal(false)} maxWidth="lg">
                    <form onSubmit={submitCreateShift} className="p-6">
                        <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 text-lg font-bold shadow-2xs">
                                ➕
                            </span>
                            <div>
                                <h3 className="text-base font-black text-slate-900">
                                    Buat Dokumen Pergeseran RBA Baru
                                </h3>
                                <p className="text-xs text-slate-500 font-medium">
                                    Tahun Anggaran {shiftForm.data.year || selected_year} · RS Jiwa Tampan
                                </p>
                            </div>
                        </div>

                        {/* Informative Guidance Banner */}
                        <div className="my-4 rounded-xl bg-emerald-50/70 p-3.5 border border-emerald-200 text-xs text-emerald-900 leading-relaxed flex items-start gap-2.5">
                            <span className="text-base leading-none shrink-0">💡</span>
                            <div>
                                <span className="font-bold">Kloning Data Otomatis:</span> Sistem akan menduplikasi seluruh rekening belanja dan target pendapatan dari versi aktif saat ini (<strong>{current_shift?.shift_name || 'RBA Murni'}</strong>). Anda dapat langsung menyesuaikan angka pergeseran tanpa perlu menginput ulang dari awal.
                            </div>
                        </div>

                        <div className="space-y-3.5 text-xs">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">
                                        Tahun Anggaran
                                    </label>
                                    <input
                                        type="number"
                                        value={shiftForm.data.year}
                                        onChange={(e) => shiftForm.setData('year', e.target.value)}
                                        className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs bg-slate-50 font-bold text-slate-700"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">
                                        Nama Pergeseran
                                    </label>
                                    <input
                                        type="text"
                                        value={shiftForm.data.shift_name}
                                        onChange={(e) => shiftForm.setData('shift_name', e.target.value)}
                                        placeholder="Contoh: Pergeseran IV"
                                        className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs font-bold text-slate-900 focus:border-emerald-600 focus:ring-emerald-500"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 mb-1">
                                    Bulan / Periode Penetapan
                                </label>
                                <input
                                    type="text"
                                    value={shiftForm.data.period_month}
                                    onChange={(e) => shiftForm.setData('period_month', e.target.value)}
                                    placeholder="Contoh: Oktober 2026 atau Triwulan IV"
                                    className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs font-medium focus:border-emerald-600 focus:ring-emerald-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 mb-1">
                                    Judul Dokumen Resmi (SK / DPA)
                                </label>
                                <input
                                    type="text"
                                    value={shiftForm.data.doc_title}
                                    onChange={(e) => shiftForm.setData('doc_title', e.target.value)}
                                    placeholder="PERUBAHAN RENCANA BISNIS DAN ANGGARAN..."
                                    className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs font-medium focus:border-emerald-600 focus:ring-emerald-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 mb-1">
                                    Catatan / Dasar Pertimbangan Pergeseran
                                </label>
                                <textarea
                                    rows="2"
                                    value={shiftForm.data.notes}
                                    onChange={(e) => shiftForm.setData('notes', e.target.value)}
                                    placeholder="Contoh: Penyesuaian SILPA dan optimalisasi belanja barang jasa..."
                                    className="w-full rounded-xl border border-slate-300 py-2 px-3 text-xs font-medium focus:border-emerald-600 focus:ring-emerald-500 shadow-2xs"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-2.5 border-t border-slate-200 pt-4 mt-5">
                            <button
                                type="button"
                                onClick={() => setShowShiftModal(false)}
                                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={shiftForm.processing}
                                className="rounded-xl bg-emerald-700 hover:bg-emerald-800 px-5 py-2 text-xs font-bold text-white shadow-md transition disabled:opacity-50 cursor-pointer"
                            >
                                {shiftForm.processing ? 'Memproses Kloning...' : 'Buat Draft Pergeseran'}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* MODAL 5: CONFIRM ACTIVATE SHIFT */}
            {activatingShift && (
                <Modal show={!!activatingShift} onClose={() => setActivatingShift(null)} maxWidth="md">
                    <div className="p-6">
                        <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-800 text-2xl font-bold shadow-2xs">
                                ⚠️
                            </div>
                            <div className="flex-1 min-w-0 text-left">
                                <h3 className="text-base font-black text-slate-900">
                                    Aktifkan {activatingShift.shift_name} sebagai Acuan Resmi?
                                </h3>
                                <p className="mt-2 text-xs text-slate-600 leading-relaxed font-medium">
                                    Mengaktifkan versi ini akan menyelaraskan seluruh pagu belanja dan target pendapatan resmi BLUD RS Jiwa Tampan ke sistem keuangan dan operasional.
                                </p>
                                <div className="mt-3 rounded-xl bg-amber-50 p-3 text-xs font-semibold text-amber-900 border border-amber-200">
                                    📌 Seluruh pagu rekening operasional unit (Daftar Akun RBA) akan otomatis diperbarui mengikuti angka pada dokumen <strong>{activatingShift.shift_name}</strong>, dan versi sebelumnya akan diarsipkan.
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-2.5 border-t border-slate-100 pt-4">
                            <button
                                type="button"
                                onClick={() => setActivatingShift(null)}
                                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={confirmActivate}
                                className="rounded-xl bg-amber-600 hover:bg-amber-700 px-5 py-2 text-xs font-bold text-white shadow-md transition cursor-pointer"
                            >
                                Ya, Jadikan Acuan Resmi
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* MODAL 6: CONFIRM DELETE SHIFT */}
            {deletingShift && (
                <Modal show={!!deletingShift} onClose={() => setDeletingShift(null)} maxWidth="md">
                    <div className="p-6">
                        <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 text-2xl font-bold shadow-2xs">
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                </svg>
                            </div>
                            <div className="flex-1 min-w-0 text-left">
                                <h3 className="text-base font-black text-slate-900">
                                    Hapus Dokumen {deletingShift.shift_name}?
                                </h3>
                                <p className="mt-2 text-xs text-slate-600 leading-relaxed font-medium">
                                    Apakah Anda yakin ingin menghapus dokumen versi <strong className="text-slate-900">{deletingShift.shift_name}</strong> Tahun Anggaran {deletingShift.year}? Seluruh alokasi rekening belanja dan target pendapatan pada dokumen ini akan dihapus permanen.
                                </p>
                                {deletingShift.status === 'Aktif' && (
                                    <div className="mt-3 rounded-xl bg-amber-50 p-3 text-xs font-semibold text-amber-800 border border-amber-200">
                                        ⚠️ <strong>Peringatan:</strong> Dokumen ini saat ini berstatus <strong>Aktif</strong>. Menghapusnya akan otomatis mengaktifkan dokumen versi lain yang tersisa.
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-2.5 border-t border-slate-100 pt-4">
                            <button
                                type="button"
                                onClick={() => setDeletingShift(null)}
                                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    router.delete(route('perencanaan.rba.shifts.destroy', deletingShift.id), {
                                        preserveScroll: true,
                                        onSuccess: () => setDeletingShift(null),
                                    });
                                }}
                                className="rounded-xl bg-rose-600 hover:bg-rose-700 px-5 py-2 text-xs font-bold text-white shadow-md transition cursor-pointer"
                            >
                                Ya, Hapus Permanen
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </PerencanaanLayout>
    );
}
