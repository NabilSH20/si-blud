import Modal from '@/Components/Modal';
import PerencanaanLayout from '@/Layouts/PerencanaanLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useMemo, useState, Fragment } from 'react';

const formatRupiah = (value) => {
    const val = Number(value || 0);
    if (val === 0) return '-';
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
    available_years = [2026, 2027, 2028],
    current_year = 2026,
}) {
    // 4 Tabs: 'RINGKASAN' | 'PENDAPATAN' | 'BELANJA' | 'RINCIAN_BARANG'
    const [activeTab, setActiveTab] = useState('RINGKASAN');
    const [tab4ViewMode, setTab4ViewMode] = useState('HIERARKI'); // 'HIERARKI' | 'KATALOG'
    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState('ALL'); // ALL, OPERASI, MODAL
    const [showShiftModal, setShowShiftModal] = useState(false);
    const [showPembiayaanModal, setShowPembiayaanModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [editingRevenueItem, setEditingRevenueItem] = useState(null);
    const [activatingShift, setActivatingShift] = useState(null);

    // Form for creating new shift
    const shiftForm = useForm({
        year: current_year,
        shift_name: 'Pergeseran IV',
        doc_title: 'RENCANA BISNIS DAN ANGGARAN PERGESERAN IV',
        period_month: 'Oktober 2026',
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

    // Filter expense items
    const filteredExpenseItems = useMemo(() => {
        return expense_items.filter((item) => {
            const matchesSearch =
                searchQuery === '' ||
                item.account_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.account_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.keterangan?.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesCategory =
                filterCategory === 'ALL' ||
                (filterCategory === 'OPERASI' && item.account_code.startsWith('1.1')) ||
                (filterCategory === 'MODAL' && item.account_code.startsWith('1.2'));

            return matchesSearch && matchesCategory;
        });
    }, [expense_items, searchQuery, filterCategory]);

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

    // Group accounts with proposed items for Tab 4
    const { groupedOperasi, groupedModal, totalUsulanCount, totalUsulanNominal } = useMemo(() => {
        const query = searchQuery.toLowerCase().trim();

        let count = 0;
        let sum = 0;

        accounts_with_proposed.forEach((acc) => {
            count += acc.proposed_count || 0;
            sum += acc.proposed_total || 0;
        });

        const filterAccs = (kategori) => {
            const list = accounts_with_proposed.filter((a) => a.kategori_belanja === kategori);
            const codes = new Set(list.map((a) => a.account_code));
            const parentGroups = list.filter((acc) => !acc.parent_code || !codes.has(acc.parent_code));

            return parentGroups.map((group) => {
                const subs = list.filter((a) => a.parent_code === group.account_code);
                return {
                    ...group,
                    children: subs,
                };
            }).filter((group) => {
                if (!query) return true;
                if (group.account_code.toLowerCase().includes(query) || group.account_name.toLowerCase().includes(query)) return true;
                if (group.proposed_items?.some((i) => i.item_name?.toLowerCase().includes(query) || i.specification?.toLowerCase().includes(query) || i.requisition?.unit?.name?.toLowerCase().includes(query))) return true;
                if (group.children?.some((c) => 
                    c.account_code.toLowerCase().includes(query) || 
                    c.account_name.toLowerCase().includes(query) ||
                    c.proposed_items?.some((ci) => ci.item_name?.toLowerCase().includes(query) || ci.specification?.toLowerCase().includes(query) || ci.requisition?.unit?.name?.toLowerCase().includes(query))
                )) return true;
                return false;
            });
        };

        return {
            groupedOperasi: filterAccs('Operasi'),
            groupedModal: filterAccs('Modal'),
            totalUsulanCount: count,
            totalUsulanNominal: sum,
        };
    }, [accounts_with_proposed, searchQuery]);

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
                    </div>
                    <p className="mt-1 text-xs sm:text-sm text-slate-600 font-medium">
                        Kompilasi Anggaran Pendapatan, Belanja, dan Pembiayaan BLUD RS Jiwa Tampan Provinsi Riau T.A. {current_shift?.year || current_year}.
                    </p>
                </div>

                {/* Year Switcher & Print Action Buttons */}
                <div className="flex flex-wrap items-center gap-2.5">
                    {/* Multi-Year Realtime Switcher */}
                    <div className="flex items-center rounded-xl bg-slate-100 p-1 border border-slate-300 shadow-2xs">
                        <span className="text-[10px] font-black uppercase text-slate-500 px-2">T.A:</span>
                        {available_years.map((y) => (
                            <button
                                key={y}
                                type="button"
                                onClick={() => router.get(route('perencanaan.rba.index'), { year: y })}
                                className={`rounded-lg px-2.5 py-1 text-xs font-black transition cursor-pointer ${
                                    Number(selected_year) === Number(y)
                                        ? 'bg-emerald-700 text-white shadow-xs'
                                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                                }`}
                            >
                                {y}
                            </button>
                        ))}
                    </div>

                    {/* Shift Dropdown */}
                    <div className="relative">
                        <select
                            value={current_shift?.id || ''}
                            onChange={(e) => router.get(route('perencanaan.rba.index'), { year: selected_year, shift_id: e.target.value })}
                            className="rounded-xl border border-slate-300 bg-white py-2 pl-3 pr-8 text-xs font-bold text-slate-700 shadow-xs focus:border-emerald-600 focus:ring-emerald-500"
                        >
                            {shifts.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.shift_name} ({s.period_month}) - {s.status}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Print Menu Buttons */}
                    <a
                        href={route('perencanaan.rba.print-ringkasan', { shift_id: current_shift?.id })}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 shadow-xs transition"
                        title="Cetak Ringkasan RBA & Surplus/Defisit"
                    >
                        <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24-1.077-.32-2.14-.32-3.193 0-5.18 4.02-9.386 8.974-9.386 4.954 0 8.973 4.207 8.973 9.386 0 1.053-.08 2.116-.32 3.193M12 18v-4.5m0 0l-2.25 2.25M12 13.5l2.25 2.25M3.75 19.5h16.5" />
                        </svg>
                        Ringkasan
                    </a>

                    <a
                        href={route('perencanaan.rba.print-pendapatan', { shift_id: current_shift?.id })}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 shadow-xs transition"
                        title="Cetak RBA Anggaran Pendapatan BLUD"
                    >
                        <span>💰</span>
                        Pendapatan
                    </a>

                    <a
                        href={route('perencanaan.rba.print-belanja', { shift_id: current_shift?.id })}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 shadow-xs transition"
                        title="Cetak RBA Anggaran Belanja 16 Kolom Lanskap"
                    >
                        <span>⚡</span>
                        Belanja
                    </a>

                    <a
                        href={route('perencanaan.rba.print-rincian-belanja', { year: selected_year, shift_id: current_shift?.id })}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 px-3.5 py-2 text-xs font-bold text-emerald-900 shadow-xs transition"
                        title="Cetak Rincian Belanja Lengkap beserta Usulan Barang Unit Kerja (Format PDF 22 Halaman)"
                    >
                        <span>📋</span>
                        Rincian Belanja
                    </a>

                    {current_shift?.status !== 'Aktif' && (
                        <button
                            type="button"
                            onClick={() => setActivatingShift(current_shift)}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 px-3.5 py-2 text-xs font-bold text-white shadow-xs transition"
                        >
                            Aktifkan Versi
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={() => setShowShiftModal(true)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 px-3.5 py-2 text-xs font-bold text-white shadow-md transition"
                    >
                        + Pergeseran Baru
                    </button>
                </div>
            </div>

            {/* Navigation Tabs (4 Sheets) */}
            <div className="mb-6 flex border-b border-slate-200 overflow-x-auto">
                <button
                    type="button"
                    onClick={() => { setActiveTab('RINGKASAN'); setSearchQuery(''); }}
                    className={`inline-flex items-center gap-2 border-b-2 px-5 py-3 text-xs sm:text-sm font-black transition ${
                        activeTab === 'RINGKASAN'
                            ? 'border-emerald-600 text-emerald-800 bg-emerald-50/50'
                            : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                    }`}
                >
                    <span>📊</span>
                    Ringkasan RBA & Surplus/Defisit
                </button>

                <button
                    type="button"
                    onClick={() => { setActiveTab('PENDAPATAN'); setSearchQuery(''); }}
                    className={`inline-flex items-center gap-2 border-b-2 px-5 py-3 text-xs sm:text-sm font-black transition ${
                        activeTab === 'PENDAPATAN'
                            ? 'border-emerald-600 text-emerald-800 bg-emerald-50/50'
                            : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                    }`}
                >
                    <span>💰</span>
                    Target Pendapatan BLUD ({revenue_items.filter(r => !r.is_header && r.item_code !== '0').length} Pos)
                </button>

                <button
                    type="button"
                    onClick={() => { setActiveTab('BELANJA'); setSearchQuery(''); }}
                    className={`inline-flex items-center gap-2 border-b-2 px-5 py-3 text-xs sm:text-sm font-black transition ${
                        activeTab === 'BELANJA'
                            ? 'border-emerald-600 text-emerald-800 bg-emerald-50/50'
                            : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                    }`}
                >
                    <span>⚡</span>
                    Anggaran Belanja BLUD (Multi-Sumber Dana)
                </button>

                <button
                    type="button"
                    onClick={() => { setActiveTab('RINCIAN_BARANG'); setSearchQuery(''); }}
                    className={`inline-flex items-center gap-2 border-b-2 px-5 py-3 text-xs sm:text-sm font-black transition cursor-pointer ${
                        activeTab === 'RINCIAN_BARANG'
                            ? 'border-emerald-600 text-emerald-800 bg-emerald-50/50'
                            : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                    }`}
                >
                    <span>📋</span>
                    Rincian Belanja & Usulan Unit T.A. {selected_year} ({totalUsulanCount} Barang)
                </button>
            </div>

            {/* TAB 1: RINGKASAN RBA & SURPLUS/DEFISIT */}
            {activeTab === 'RINGKASAN' && (
                <div className="space-y-6">
                    {/* Top KPI Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-xs">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Pendapatan</span>
                            <p className="mt-2 text-xl font-black text-slate-900">{formatRupiah(p.total?.after)}</p>
                            <p className="mt-1 text-xs text-slate-500 font-medium">Sebelum: {formatRupiah(p.total?.before)}</p>
                        </div>

                        <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-xs">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Belanja</span>
                            <p className="mt-2 text-xl font-black text-slate-900">{formatRupiah(b.total?.after)}</p>
                            <span className="mt-1 inline-flex items-center text-xs font-bold text-emerald-700">
                                Berkurang: {formatRupiah(b.total?.diff)}
                            </span>
                        </div>

                        <div className="rounded-2xl border-2 border-emerald-300 bg-emerald-50/80 p-5 shadow-xs">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold uppercase tracking-wider text-emerald-900">Posisi Anggaran</span>
                                <span className="rounded-full bg-emerald-200 px-2.5 py-0.5 text-[10px] font-black text-emerald-950">SURPLUS</span>
                            </div>
                            <p className="mt-2 text-2xl font-black text-emerald-900">{formatRupiah(sd.after)}</p>
                            <p className="mt-1 text-xs text-emerald-800 font-medium">Pergeseran III menghasilkan surplus efisiensi</p>
                        </div>

                        <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-5 shadow-xs">
                            <span className="text-xs font-bold uppercase tracking-wider text-blue-900">Sisa SiLPA Berkenaan</span>
                            <p className="mt-2 text-xl font-black text-blue-950">{formatRupiah(c.silpa_tahun_berkenaan)}</p>
                            <button
                                type="button"
                                onClick={handleOpenPembiayaanModal}
                                className="mt-1 inline-flex items-center text-xs font-bold text-blue-700 hover:underline"
                            >
                                Atur Pembiayaan & SiLPA &rarr;
                            </button>
                        </div>
                    </div>

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
                                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-3.5 py-1.5 text-xs font-bold text-slate-700 shadow-2xs transition"
                            >
                                <span>✏️</span>
                                Edit Pembiayaan & SiLPA
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
                                        <td className="border border-slate-300 px-4 py-1.5 text-right font-mono">{formatRupiah(b.apbd?.after)}</td>
                                        <td className="border border-slate-300 px-4 py-1.5 text-right font-mono">{formatRupiah(b.apbd?.diff)}</td>
                                    </tr>
                                    <tr className="font-bold text-slate-800">
                                        <td className="border border-slate-300 px-3 py-1.5 text-center"></td>
                                        <td className="border border-slate-300 px-4 py-1.5 pl-4 uppercase">BELANJA OPERASI BLUD</td>
                                        <td className="border border-slate-300 px-4 py-1.5 text-right font-mono">{formatRupiah(b.operasi_blud?.before)}</td>
                                        <td className="border border-slate-300 px-4 py-1.5 text-right font-mono">{formatRupiah(b.operasi_blud?.after)}</td>
                                        <td className="border border-slate-300 px-4 py-1.5 text-right font-mono text-emerald-800">{formatRupiah(b.operasi_blud?.diff)}</td>
                                    </tr>
                                    <tr>
                                        <td className="border border-slate-300 px-3 py-1.5 text-center"></td>
                                        <td className="border border-slate-300 px-4 py-1.5 pl-8 text-slate-600">Belanja Pegawai</td>
                                        <td className="border border-slate-300 px-4 py-1.5 text-right font-mono">-</td>
                                        <td className="border border-slate-300 px-4 py-1.5 text-right font-mono">-</td>
                                        <td className="border border-slate-300 px-4 py-1.5 text-right font-mono">-</td>
                                    </tr>
                                    <tr>
                                        <td className="border border-slate-300 px-3 py-1.5 text-center"></td>
                                        <td className="border border-slate-300 px-4 py-1.5 pl-8 font-medium text-slate-800">Belanja Barang dan Jasa</td>
                                        <td className="border border-slate-300 px-4 py-1.5 text-right font-mono">{formatRupiah(b.barang_jasa_blud?.before)}</td>
                                        <td className="border border-slate-300 px-4 py-1.5 text-right font-mono font-bold">{formatRupiah(b.barang_jasa_blud?.after)}</td>
                                        <td className="border border-slate-300 px-4 py-1.5 text-right font-mono text-emerald-800">{formatRupiah(b.barang_jasa_blud?.diff)}</td>
                                    </tr>
                                    <tr className="font-bold text-slate-800">
                                        <td className="border border-slate-300 px-3 py-1.5 text-center"></td>
                                        <td className="border border-slate-300 px-4 py-1.5 pl-4 uppercase">BELANJA MODAL BLUD</td>
                                        <td className="border border-slate-300 px-4 py-1.5 text-right font-mono">{formatRupiah(b.modal_blud?.before)}</td>
                                        <td className="border border-slate-300 px-4 py-1.5 text-right font-mono">{formatRupiah(b.modal_blud?.after)}</td>
                                        <td className="border border-slate-300 px-4 py-1.5 text-right font-mono">{formatRupiah(b.modal_blud?.diff)}</td>
                                    </tr>
                                    <tr>
                                        <td className="border border-slate-300 px-3 py-1.5 text-center"></td>
                                        <td className="border border-slate-300 px-4 py-1.5 pl-8 text-slate-600">Belanja Tanah</td>
                                        <td className="border border-slate-300 px-4 py-1.5 text-right font-mono">-</td>
                                        <td className="border border-slate-300 px-4 py-1.5 text-right font-mono">-</td>
                                        <td className="border border-slate-300 px-4 py-1.5 text-right font-mono">-</td>
                                    </tr>
                                    <tr>
                                        <td className="border border-slate-300 px-3 py-1.5 text-center"></td>
                                        <td className="border border-slate-300 px-4 py-1.5 pl-8 font-medium text-slate-800">Belanja Peralatan dan Mesin</td>
                                        <td className="border border-slate-300 px-4 py-1.5 text-right font-mono">{formatRupiah(b.peralatan_mesin?.before)}</td>
                                        <td className="border border-slate-300 px-4 py-1.5 text-right font-mono">{formatRupiah(b.peralatan_mesin?.after)}</td>
                                        <td className="border border-slate-300 px-4 py-1.5 text-right font-mono">{formatRupiah(b.peralatan_mesin?.diff)}</td>
                                    </tr>
                                    <tr>
                                        <td className="border border-slate-300 px-3 py-1.5 text-center"></td>
                                        <td className="border border-slate-300 px-4 py-1.5 pl-8 font-medium text-slate-800">Belanja Gedung dan Bangunan</td>
                                        <td className="border border-slate-300 px-4 py-1.5 text-right font-mono">{formatRupiah(b.gedung_bangunan?.before)}</td>
                                        <td className="border border-slate-300 px-4 py-1.5 text-right font-mono">{formatRupiah(b.gedung_bangunan?.after)}</td>
                                        <td className="border border-slate-300 px-4 py-1.5 text-right font-mono">{formatRupiah(b.gedung_bangunan?.diff)}</td>
                                    </tr>
                                    <tr className="font-black bg-slate-50 text-slate-900">
                                        <td className="border border-slate-300 px-3 py-2 text-center"></td>
                                        <td className="border border-slate-300 px-4 py-2 pl-8 text-right uppercase">Jumlah Belanja</td>
                                        <td className="border border-slate-300 px-4 py-2 text-right font-mono">{formatRupiah(b.total?.before)}</td>
                                        <td className="border border-slate-300 px-4 py-2 text-right font-mono font-black text-emerald-800">{formatRupiah(b.total?.after)}</td>
                                        <td className="border border-slate-300 px-4 py-2 text-right font-mono font-bold text-emerald-800">{formatRupiah(b.total?.diff)}</td>
                                    </tr>

                                    {/* SURPLUS / DEFISIT */}
                                    <tr className="font-black bg-emerald-100/80 text-emerald-950 text-sm">
                                        <td className="border border-slate-300 px-3 py-3 text-center"></td>
                                        <td className="border border-slate-300 px-4 py-3 pl-4 uppercase font-black">
                                            Surplus / (Defisit)
                                        </td>
                                        <td className="border border-slate-300 px-4 py-3 text-right font-mono font-bold">
                                            {formatRupiah(sd.before)}
                                        </td>
                                        <td className="border border-slate-300 px-4 py-3 text-right font-mono font-black text-emerald-900">
                                            {formatRupiah(sd.after)}
                                        </td>
                                        <td className="border border-slate-300 px-4 py-3 text-right font-mono font-black text-emerald-900">
                                            {formatRupiah(sd.diff)}
                                        </td>
                                    </tr>

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
                    {/* Revenue Summary Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-xs">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Target Jasa Layanan</span>
                            <p className="mt-2 text-xl font-black text-emerald-800">{formatRupiah(revenue_summary.jasa_layanan)}</p>
                            <p className="mt-1 text-xs text-slate-500 font-medium">Realisasi: {formatRupiah(revenue_summary.realized_jasa_layanan)}</p>
                        </div>
                        <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-xs">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Target Hasil Kerjasama</span>
                            <p className="mt-2 text-xl font-black text-slate-900">{formatRupiah(revenue_summary.hasil_kerjasama)}</p>
                            <p className="mt-1 text-xs text-slate-500 font-medium">Realisasi: {formatRupiah(revenue_summary.realized_hasil_kerjasama)}</p>
                        </div>
                        <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-xs">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Alokasi APBD</span>
                            <p className="mt-2 text-xl font-black text-slate-900">{formatRupiah(revenue_summary.apbd)}</p>
                            <p className="mt-1 text-xs text-slate-500 font-medium">Dana transfer pemerintah</p>
                        </div>
                        <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-xs">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Lain-lain BLUD Sah</span>
                            <p className="mt-2 text-xl font-black text-slate-900">{formatRupiah(revenue_summary.lain_lain_sah)}</p>
                            <p className="mt-1 text-xs text-slate-500 font-medium">Jasa Giro & Bunga</p>
                        </div>
                    </div>

                    {/* Revenue Table with Quick Edit */}
                    <div className="overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-md">
                        <div className="border-b border-slate-200 bg-slate-100/80 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div>
                                <h3 className="text-sm font-black uppercase tracking-wider text-slate-900">
                                    Anggaran Pendapatan BLUD ({current_shift?.shift_name || 'Pergeseran III'})
                                </h3>
                                <p className="text-xs text-slate-600 font-medium">
                                    Pilih pos rekening untuk mengubah target pendapatan sebelum atau setelah pergeseran
                                </p>
                            </div>
                            <span className="text-xs font-bold text-slate-600">
                                Klik tombol <span className="text-emerald-700 underline font-black">Edit Target</span> pada pos untuk mengubah
                            </span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-300 text-xs">
                                <thead>
                                    <tr className="bg-slate-100 text-center font-bold text-slate-800">
                                        <th className="border border-slate-300 px-3 py-2.5 w-12">No</th>
                                        <th className="border border-slate-300 px-4 py-2.5 text-left min-w-[280px]">Pos Rekening Pendapatan</th>
                                        <th className="border border-slate-300 px-4 py-2.5 w-40">Target Sebelum (Rp)</th>
                                        <th className="border border-slate-300 px-4 py-2.5 w-40">Target Setelah (Rp)</th>
                                        <th className="border border-slate-300 px-4 py-2.5 w-36">Selisih (Rp)</th>
                                        <th className="border border-slate-300 px-4 py-2.5 w-36">Realisasi Kas</th>
                                        <th className="border border-slate-300 px-3 py-2.5 w-24">Capaian</th>
                                        <th className="border border-slate-300 px-3 py-2.5 w-24">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 bg-white">
                                    {revenue_items.map((item) => {
                                        const isRoot = item.item_code === '0';
                                        const isHeader = item.is_header;
                                        const diff = Number(item.difference || 0);
                                        const rate = Number(item.achievement_rate || 0);

                                        return (
                                            <tr
                                                key={item.id}
                                                className={
                                                    isRoot
                                                        ? 'font-black bg-slate-100 text-slate-900'
                                                        : isHeader
                                                        ? 'font-bold bg-slate-50/80 text-slate-900'
                                                        : 'hover:bg-emerald-50/40 transition'
                                                }
                                            >
                                                <td className="border border-slate-300 px-3 py-2 text-center font-mono font-bold">
                                                    {item.item_code !== '0' ? item.item_code : ''}
                                                </td>
                                                <td
                                                    className="border border-slate-300 px-4 py-2"
                                                    style={{ paddingLeft: `${(item.level - 1) * 16 + 12}px` }}
                                                >
                                                    <span className={isHeader ? 'font-bold uppercase' : 'font-medium text-slate-800'}>
                                                        {item.item_name}
                                                    </span>
                                                </td>
                                                <td className="border border-slate-300 px-4 py-2 text-right font-mono">
                                                    {formatRupiah(item.before_amount)}
                                                </td>
                                                <td className="border border-slate-300 px-4 py-2 text-right font-mono font-bold text-slate-900">
                                                    {formatRupiah(item.after_amount)}
                                                </td>
                                                <td className="border border-slate-300 px-4 py-2 text-right font-mono font-bold">
                                                    {diff !== 0 ? (
                                                        <span className={diff > 0 ? 'text-emerald-700' : 'text-rose-700'}>
                                                            {formatRupiah(diff)}
                                                        </span>
                                                    ) : '-'}
                                                </td>
                                                <td className="border border-slate-300 px-4 py-2 text-right font-mono font-semibold text-emerald-800">
                                                    {formatRupiah(item.realized_amount)}
                                                </td>
                                                <td className="border border-slate-300 px-3 py-2 text-center">
                                                    {!isHeader ? (
                                                        <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-bold ${
                                                            rate >= 80 ? 'bg-emerald-100 text-emerald-800' : rate >= 50 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                                                        }`}>
                                                            {rate}%
                                                        </span>
                                                    ) : (
                                                        <span className="font-bold text-[11px] text-slate-700">{rate}%</span>
                                                    )}
                                                </td>
                                                <td className="border border-slate-300 px-3 py-2 text-center">
                                                    {!isHeader && item.item_code !== '0' && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleOpenEditRevenueModal(item)}
                                                            className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-700 shadow-2xs hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-800 transition"
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
                </div>
            )}

            {/* TAB 3: ANGGARAN BELANJA BLUD (MULTI-SUMBER DANA) */}
            {activeTab === 'BELANJA' && (
                <div className="space-y-4">
                    {/* Search & Category Filter Toolbar */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-300 shadow-xs">
                        <div className="flex flex-1 items-center gap-3">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Cari kode rekening, nama belanja, atau catatan..."
                                className="w-full sm:max-w-xs rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 font-medium focus:border-emerald-600 focus:ring-emerald-500"
                            />
                            <div className="inline-flex rounded-lg bg-slate-100 p-1 text-xs">
                                <button
                                    type="button"
                                    onClick={() => setFilterCategory('ALL')}
                                    className={`px-3 py-1 font-bold rounded-md transition ${filterCategory === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'}`}
                                >
                                    Semua Belanja
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFilterCategory('OPERASI')}
                                    className={`px-3 py-1 font-bold rounded-md transition ${filterCategory === 'OPERASI' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600'}`}
                                >
                                    Belanja Operasi
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFilterCategory('MODAL')}
                                    className={`px-3 py-1 font-bold rounded-md transition ${filterCategory === 'MODAL' ? 'bg-white text-purple-800 shadow-xs' : 'text-slate-600'}`}
                                >
                                    Belanja Modal
                                </button>
                            </div>
                        </div>

                        <span className="text-xs text-slate-500 font-medium">
                            Menampilkan <span className="font-bold text-slate-900">{filteredExpenseItems.length}</span> baris akun
                        </span>
                    </div>

                    {/* 16-Column Matrix Table matching Document 1 Sheet 1 */}
                    <div className="overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-md">
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
                                                            className="rounded-md border border-slate-300 bg-white px-2 py-0.5 text-[10px] font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 transition"
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
                </div>
            )}

            {/* TAB 4: RINCIAN KEBUTUHAN BARANG & USULAN BELANJA UNIT KERJA */}
            {activeTab === 'RINCIAN_BARANG' && (
                <div className="space-y-4">
                    {/* Header Controls: Sub-Tabs Toggle & Search */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-300 shadow-xs">
                        {/* View Mode Toggle */}
                        <div className="flex items-center gap-1.5 rounded-xl bg-slate-100 p-1 border border-slate-200">
                            <button
                                type="button"
                                onClick={() => setTab4ViewMode('HIERARKI')}
                                className={`rounded-lg px-3 py-1.5 text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                                    tab4ViewMode === 'HIERARKI'
                                        ? 'bg-emerald-700 text-white shadow-xs'
                                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                                }`}
                            >
                                <span>📋</span>
                                Rincian Usulan Unit T.A. {selected_year}
                            </button>
                            <button
                                type="button"
                                onClick={() => setTab4ViewMode('KATALOG')}
                                className={`rounded-lg px-3 py-1.5 text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                                    tab4ViewMode === 'KATALOG'
                                        ? 'bg-emerald-700 text-white shadow-xs'
                                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                                }`}
                            >
                                <span>📦</span>
                                Master Katalog ({catalog_items.length} Item)
                            </button>
                        </div>

                        {/* Search & Actions */}
                        <div className="flex flex-wrap items-center gap-2.5">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder={
                                        tab4ViewMode === 'HIERARKI'
                                            ? "Cari akun, obat, alkes, atau unit pengusul..."
                                            : "Cari nama barang, spesifikasi..."
                                    }
                                    className="w-full sm:w-72 rounded-xl border border-slate-300 bg-white px-3.5 py-1.5 text-xs text-slate-900 font-medium focus:border-emerald-600 focus:ring-emerald-500"
                                />
                            </div>

                            {tab4ViewMode === 'HIERARKI' ? (
                                <a
                                    href={route('perencanaan.rba.print-rincian-belanja', { year: selected_year, shift_id: current_shift?.id })}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white shadow-xs transition"
                                >
                                    <span>🖨️</span>
                                    Cetak Lembar Dokumen
                                </a>
                            ) : (
                                <Link
                                    href={route('items.index')}
                                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white shadow-xs transition"
                                >
                                    Kelola Master Barang &rarr;
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* VIEW MODE 1: HIERARCHICAL PROPOSED ITEMS TREE */}
                    {tab4ViewMode === 'HIERARKI' && (
                        <div className="space-y-4">
                            {/* Summary Badge */}
                            <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
                                <div className="flex items-center gap-2">
                                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white font-black text-xs">
                                        📊
                                    </span>
                                    <div>
                                        <p className="font-black text-emerald-950">
                                            Rekap Usulan Belanja Unit Kerja Rumah Sakit &bull; Tahun Anggaran {selected_year}
                                        </p>
                                        <p className="text-[11px] text-emerald-700">
                                            Menampilkan kompilasi barang usulan bersarang di bawah hierarki kode rekening resmi RBA RSJ Tampan
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right sm:border-l sm:border-emerald-200 sm:pl-4">
                                    <span className="text-[10px] uppercase font-bold text-emerald-700 block">Total Nominal Usulan Unit</span>
                                    <span className="text-sm font-black text-emerald-950 font-mono">
                                        {formatRupiah(totalUsulanNominal)} ({totalUsulanCount} Barang)
                                    </span>
                                </div>
                            </div>

                            {/* Main Table */}
                            <div className="overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-md">
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-slate-300 text-xs">
                                        <thead>
                                            <tr className="bg-slate-100 text-center font-bold text-slate-800">
                                                <th className="border border-slate-300 px-3 py-2.5 w-28">Kode Rekening</th>
                                                <th className="border border-slate-300 px-4 py-2.5 text-left min-w-[280px]">Uraian Akun & Usulan Barang</th>
                                                <th className="border border-slate-300 px-3 py-2.5 w-20">Volume</th>
                                                <th className="border border-slate-300 px-3 py-2.5 w-20">Satuan</th>
                                                <th className="border border-slate-300 px-4 py-2.5 text-right w-36">Harga Satuan (Rp)</th>
                                                <th className="border border-slate-300 px-4 py-2.5 text-right w-36">Jumlah (Rp)</th>
                                                <th className="border border-slate-300 px-4 py-2.5 text-left w-48">Unit Pengusul</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-200 bg-white">
                                            {/* CHAPTER 1: BELANJA */}
                                            <tr className="bg-slate-800 text-white font-black">
                                                <td className="border border-slate-700 px-3 py-2 text-center font-mono">1</td>
                                                <td className="border border-slate-700 px-4 py-2 uppercase tracking-wider" colSpan={4}>
                                                    BELANJA BLUD RS JIWA TAMPAN
                                                </td>
                                                <td className="border border-slate-700 px-4 py-2 text-right font-mono font-bold text-emerald-300">
                                                    {formatRupiah(totalUsulanNominal)}
                                                </td>
                                                <td className="border border-slate-700 px-4 py-2 text-xs font-normal text-slate-300">
                                                    Total {totalUsulanCount} Barang Diusulkan
                                                </td>
                                            </tr>

                                            {/* SECTION 1.1: BELANJA OPERASI */}
                                            <tr className="bg-emerald-900 text-emerald-100 font-black">
                                                <td className="border border-emerald-800 px-3 py-2 text-center font-mono">1.1</td>
                                                <td className="border border-emerald-800 px-4 py-2 uppercase tracking-wider pl-4" colSpan={4}>
                                                    1.1 BELANJA OPERASI BLUD
                                                </td>
                                                <td className="border border-emerald-800 px-4 py-2 text-right font-mono font-bold text-white">
                                                    {formatRupiah(groupedOperasi.reduce((s, g) => s + (g.children.reduce((cs, c) => cs + (c.proposed_total || 0), 0) + (g.proposed_total || 0)), 0))}
                                                </td>
                                                <td className="border border-emerald-800 px-4 py-2 text-xs font-normal text-emerald-200">
                                                    Operasional Pelayanan RS
                                                </td>
                                            </tr>

                                            {/* Belanja Operasi Tree */}
                                            {groupedOperasi.length === 0 ? (
                                                <tr>
                                                    <td colSpan={7} className="p-4 text-center text-slate-400">
                                                        Tidak ada data akun Belanja Operasi yang cocok dengan pencarian
                                                    </td>
                                                </tr>
                                            ) : (
                                                groupedOperasi.map((group) => {
                                                    const groupItemsTotal = (group.proposed_total || 0) + group.children.reduce((cs, c) => cs + (c.proposed_total || 0), 0);
                                                    const groupItemsCount = (group.proposed_count || 0) + group.children.reduce((cc, c) => cc + (c.proposed_count || 0), 0);

                                                    return (
                                                        <Fragment key={group.id}>
                                                            {/* Parent Account Group Row */}
                                                            <tr className="bg-emerald-50/50 hover:bg-emerald-50/80 font-bold transition">
                                                                <td className="border border-slate-300 px-3 py-2 text-center font-mono text-emerald-950">
                                                                    {group.account_code}
                                                                </td>
                                                                <td className="border border-slate-300 px-4 py-2 text-emerald-950 pl-6" colSpan={4}>
                                                                    <div className="flex items-center gap-2">
                                                                        <span>{group.account_name}</span>
                                                                        {group.children.length > 0 && (
                                                                            <span className="rounded-md bg-emerald-200/70 px-1.5 py-0.5 text-[10px] font-bold text-emerald-900">
                                                                                {group.children.length} Sub-Akun
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                                <td className="border border-slate-300 px-4 py-2 text-right font-mono font-bold text-emerald-900">
                                                                    {groupItemsTotal > 0 ? formatRupiah(groupItemsTotal) : '-'}
                                                                </td>
                                                                <td className="border border-slate-300 px-4 py-2 text-slate-600 text-xs">
                                                                    Pagu: <span className="font-bold">{formatRupiah(group.remaining_budget)}</span>
                                                                </td>
                                                            </tr>

                                                            {/* Direct Items under group (if any) */}
                                                            {group.proposed_items && group.proposed_items.length > 0 && group.proposed_items.map((item, idx) => (
                                                                <tr key={`gitem-${group.id}-${idx}`} className="hover:bg-slate-50 transition bg-white">
                                                                    <td className="border border-slate-300 px-3 py-1.5 text-center text-slate-400 font-mono text-[10px]">
                                                                        #{idx + 1}
                                                                    </td>
                                                                    <td className="border border-slate-300 px-4 py-1.5 pl-10">
                                                                        <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                                                                            <span className="text-emerald-600 font-bold">&bull;</span>
                                                                            <span>{item.item_name}</span>
                                                                        </div>
                                                                        {item.specification && (
                                                                            <p className="text-[11px] text-slate-500 pl-3.5">
                                                                                {item.specification}
                                                                            </p>
                                                                        )}
                                                                    </td>
                                                                    <td className="border border-slate-300 px-3 py-1.5 text-center font-mono font-semibold text-slate-800">
                                                                        {item.quantity_requested || item.quantity_approved || 1}
                                                                    </td>
                                                                    <td className="border border-slate-300 px-3 py-1.5 text-center text-slate-600">
                                                                        {item.unit_type || 'Pcs'}
                                                                    </td>
                                                                    <td className="border border-slate-300 px-4 py-1.5 text-right font-mono text-slate-700">
                                                                        {formatRupiah(item.unit_price)}
                                                                    </td>
                                                                    <td className="border border-slate-300 px-4 py-1.5 text-right font-mono font-bold text-slate-900">
                                                                        {formatRupiah(item.subtotal)}
                                                                    </td>
                                                                    <td className="border border-slate-300 px-4 py-1.5 text-xs text-slate-700">
                                                                        <span className="font-semibold">{item.requisition?.unit?.name || 'Unit Kerja'}</span>
                                                                        <span className="text-[10px] text-slate-400 block font-mono">
                                                                            {item.requisition?.requisition_number}
                                                                        </span>
                                                                    </td>
                                                                </tr>
                                                            ))}

                                                            {/* Sub-Accounts */}
                                                            {group.children.map((sub) => (
                                                                <Fragment key={sub.id}>
                                                                    <tr className="bg-slate-50/90 font-semibold hover:bg-slate-100 transition">
                                                                        <td className="border border-slate-300 px-3 py-1.5 text-center font-mono text-slate-800">
                                                                            {sub.account_code}
                                                                        </td>
                                                                        <td className="border border-slate-300 px-4 py-1.5 text-slate-900 pl-10" colSpan={4}>
                                                                            <div className="flex items-center gap-1.5">
                                                                                <span className="text-slate-400 font-bold">└</span>
                                                                                <span>{sub.account_name}</span>
                                                                                {sub.proposed_count > 0 && (
                                                                                    <span className="rounded-full bg-emerald-100 px-2 py-0.2 text-[10px] font-bold text-emerald-800">
                                                                                        {sub.proposed_count} usulan
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                        </td>
                                                                        <td className="border border-slate-300 px-4 py-1.5 text-right font-mono font-bold text-emerald-800">
                                                                            {sub.proposed_total > 0 ? formatRupiah(sub.proposed_total) : '-'}
                                                                        </td>
                                                                        <td className="border border-slate-300 px-4 py-1.5 text-slate-500 text-xs">
                                                                            Sisa: {formatRupiah(sub.remaining_budget)}
                                                                        </td>
                                                                    </tr>

                                                                    {/* Items under this sub-account */}
                                                                    {sub.proposed_items && sub.proposed_items.length > 0 ? (
                                                                        sub.proposed_items.map((cItem, cIdx) => (
                                                                            <tr key={`subitem-${sub.id}-${cIdx}`} className="hover:bg-slate-50 transition bg-white">
                                                                                <td className="border border-slate-300 px-3 py-1.5 text-center text-slate-400 font-mono text-[10px]">
                                                                                    #{cIdx + 1}
                                                                                </td>
                                                                                <td className="border border-slate-300 px-4 py-1.5 pl-14">
                                                                                    <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                                                                                        <span className="text-emerald-500 font-bold">&bull;</span>
                                                                                        <span>{cItem.item_name}</span>
                                                                                    </div>
                                                                                    {cItem.specification && (
                                                                                        <p className="text-[11px] text-slate-500 pl-3.5">
                                                                                            {cItem.specification}
                                                                                        </p>
                                                                                    )}
                                                                                </td>
                                                                                <td className="border border-slate-300 px-3 py-1.5 text-center font-mono font-semibold text-slate-800">
                                                                                    {cItem.quantity_requested || cItem.quantity_approved || 1}
                                                                                </td>
                                                                                <td className="border border-slate-300 px-3 py-1.5 text-center text-slate-600">
                                                                                    {cItem.unit_type || 'Pcs'}
                                                                                </td>
                                                                                <td className="border border-slate-300 px-4 py-1.5 text-right font-mono text-slate-700">
                                                                                    {formatRupiah(cItem.unit_price)}
                                                                                </td>
                                                                                <td className="border border-slate-300 px-4 py-1.5 text-right font-mono font-bold text-slate-900">
                                                                                    {formatRupiah(cItem.subtotal)}
                                                                                </td>
                                                                                <td className="border border-slate-300 px-4 py-1.5 text-xs text-slate-700">
                                                                                    <span className="font-semibold">{cItem.requisition?.unit?.name || 'Unit Kerja'}</span>
                                                                                    <span className="text-[10px] text-slate-400 block font-mono">
                                                                                        {cItem.requisition?.requisition_number}
                                                                                    </span>
                                                                                </td>
                                                                            </tr>
                                                                        ))
                                                                    ) : (
                                                                        <tr className="bg-slate-50/40 text-slate-400 italic text-[11px]">
                                                                            <td className="border border-slate-200 px-3 py-1 text-center font-mono">-</td>
                                                                            <td className="border border-slate-200 px-4 py-1 pl-14" colSpan={6}>
                                                                                Belum ada usulan barang dari unit kerja untuk pos ini pada T.A. {selected_year}
                                                                            </td>
                                                                        </tr>
                                                                    )}
                                                                </Fragment>
                                                            ))}
                                                        </Fragment>
                                                    );
                                                })
                                            )}

                                            {/* SECTION 1.2: BELANJA MODAL */}
                                            <tr className="bg-purple-900 text-purple-100 font-black">
                                                <td className="border border-purple-800 px-3 py-2 text-center font-mono">1.2</td>
                                                <td className="border border-purple-800 px-4 py-2 uppercase tracking-wider pl-4" colSpan={4}>
                                                    1.2 BELANJA MODAL BLUD
                                                </td>
                                                <td className="border border-purple-800 px-4 py-2 text-right font-mono font-bold text-white">
                                                    {formatRupiah(groupedModal.reduce((s, g) => s + (g.children.reduce((cs, c) => cs + (c.proposed_total || 0), 0) + (g.proposed_total || 0)), 0))}
                                                </td>
                                                <td className="border border-purple-800 px-4 py-2 text-xs font-normal text-purple-200">
                                                    Investasi Fisik Rumah Sakit
                                                </td>
                                            </tr>

                                            {/* Belanja Modal Tree */}
                                            {groupedModal.length === 0 ? (
                                                <tr>
                                                    <td colSpan={7} className="p-4 text-center text-slate-400">
                                                        Tidak ada data akun Belanja Modal yang cocok dengan pencarian
                                                    </td>
                                                </tr>
                                            ) : (
                                                groupedModal.map((group) => {
                                                    const groupItemsTotal = (group.proposed_total || 0) + group.children.reduce((cs, c) => cs + (c.proposed_total || 0), 0);

                                                    return (
                                                        <Fragment key={group.id}>
                                                            {/* Parent Account Group Row */}
                                                            <tr className="bg-purple-50/50 hover:bg-purple-50/80 font-bold transition">
                                                                <td className="border border-slate-300 px-3 py-2 text-center font-mono text-purple-950">
                                                                    {group.account_code}
                                                                </td>
                                                                <td className="border border-slate-300 px-4 py-2 text-purple-950 pl-6" colSpan={4}>
                                                                    <div className="flex items-center gap-2">
                                                                        <span>{group.account_name}</span>
                                                                        {group.children.length > 0 && (
                                                                            <span className="rounded-md bg-purple-200/70 px-1.5 py-0.5 text-[10px] font-bold text-purple-900">
                                                                                {group.children.length} Sub-Akun
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                                <td className="border border-slate-300 px-4 py-2 text-right font-mono font-bold text-purple-900">
                                                                    {groupItemsTotal > 0 ? formatRupiah(groupItemsTotal) : '-'}
                                                                </td>
                                                                <td className="border border-slate-300 px-4 py-2 text-slate-600 text-xs">
                                                                    Pagu: <span className="font-bold">{formatRupiah(group.remaining_budget)}</span>
                                                                </td>
                                                            </tr>

                                                            {/* Direct items under modal group (if any) */}
                                                            {group.proposed_items && group.proposed_items.length > 0 && group.proposed_items.map((item, idx) => (
                                                                <tr key={`gmitem-${group.id}-${idx}`} className="hover:bg-slate-50 transition bg-white">
                                                                    <td className="border border-slate-300 px-3 py-1.5 text-center text-slate-400 font-mono text-[10px]">
                                                                        #{idx + 1}
                                                                    </td>
                                                                    <td className="border border-slate-300 px-4 py-1.5 pl-10">
                                                                        <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                                                                            <span className="text-purple-600 font-bold">&bull;</span>
                                                                            <span>{item.item_name}</span>
                                                                        </div>
                                                                        {item.specification && (
                                                                            <p className="text-[11px] text-slate-500 pl-3.5">
                                                                                {item.specification}
                                                                            </p>
                                                                        )}
                                                                    </td>
                                                                    <td className="border border-slate-300 px-3 py-1.5 text-center font-mono font-semibold text-slate-800">
                                                                        {item.quantity_requested || item.quantity_approved || 1}
                                                                    </td>
                                                                    <td className="border border-slate-300 px-3 py-1.5 text-center text-slate-600">
                                                                        {item.unit_type || 'Unit'}
                                                                    </td>
                                                                    <td className="border border-slate-300 px-4 py-1.5 text-right font-mono text-slate-700">
                                                                        {formatRupiah(item.unit_price)}
                                                                    </td>
                                                                    <td className="border border-slate-300 px-4 py-1.5 text-right font-mono font-bold text-slate-900">
                                                                        {formatRupiah(item.subtotal)}
                                                                    </td>
                                                                    <td className="border border-slate-300 px-4 py-1.5 text-xs text-slate-700">
                                                                        <span className="font-semibold">{item.requisition?.unit?.name || 'Unit Kerja'}</span>
                                                                        <span className="text-[10px] text-slate-400 block font-mono">
                                                                            {item.requisition?.requisition_number}
                                                                        </span>
                                                                    </td>
                                                                </tr>
                                                            ))}

                                                            {/* Sub-Accounts of modal group */}
                                                            {group.children.map((sub) => (
                                                                <Fragment key={sub.id}>
                                                                    <tr className="bg-slate-50/90 font-semibold hover:bg-slate-100 transition">
                                                                        <td className="border border-slate-300 px-3 py-1.5 text-center font-mono text-slate-800">
                                                                            {sub.account_code}
                                                                        </td>
                                                                        <td className="border border-slate-300 px-4 py-1.5 text-slate-900 pl-10" colSpan={4}>
                                                                            <div className="flex items-center gap-1.5">
                                                                                <span className="text-slate-400 font-bold">└</span>
                                                                                <span>{sub.account_name}</span>
                                                                                {sub.proposed_count > 0 && (
                                                                                    <span className="rounded-full bg-purple-100 px-2 py-0.2 text-[10px] font-bold text-purple-800">
                                                                                        {sub.proposed_count} usulan
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                        </td>
                                                                        <td className="border border-slate-300 px-4 py-1.5 text-right font-mono font-bold text-purple-800">
                                                                            {sub.proposed_total > 0 ? formatRupiah(sub.proposed_total) : '-'}
                                                                        </td>
                                                                        <td className="border border-slate-300 px-4 py-1.5 text-slate-500 text-xs">
                                                                            Sisa: {formatRupiah(sub.remaining_budget)}
                                                                        </td>
                                                                    </tr>

                                                                    {/* Items under modal sub-account */}
                                                                    {sub.proposed_items && sub.proposed_items.length > 0 ? (
                                                                        sub.proposed_items.map((cItem, cIdx) => (
                                                                            <tr key={`submitem-${sub.id}-${cIdx}`} className="hover:bg-slate-50 transition bg-white">
                                                                                <td className="border border-slate-300 px-3 py-1.5 text-center text-slate-400 font-mono text-[10px]">
                                                                                    #{cIdx + 1}
                                                                                </td>
                                                                                <td className="border border-slate-300 px-4 py-1.5 pl-14">
                                                                                    <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                                                                                        <span className="text-purple-500 font-bold">&bull;</span>
                                                                                        <span>{cItem.item_name}</span>
                                                                                    </div>
                                                                                    {cItem.specification && (
                                                                                        <p className="text-[11px] text-slate-500 pl-3.5">
                                                                                            {cItem.specification}
                                                                                        </p>
                                                                                    )}
                                                                                </td>
                                                                                <td className="border border-slate-300 px-3 py-1.5 text-center font-mono font-semibold text-slate-800">
                                                                                    {cItem.quantity_requested || cItem.quantity_approved || 1}
                                                                                </td>
                                                                                <td className="border border-slate-300 px-3 py-1.5 text-center text-slate-600">
                                                                                    {cItem.unit_type || 'Unit'}
                                                                                </td>
                                                                                <td className="border border-slate-300 px-4 py-1.5 text-right font-mono text-slate-700">
                                                                                    {formatRupiah(cItem.unit_price)}
                                                                                </td>
                                                                                <td className="border border-slate-300 px-4 py-1.5 text-right font-mono font-bold text-slate-900">
                                                                                    {formatRupiah(cItem.subtotal)}
                                                                                </td>
                                                                                <td className="border border-slate-300 px-4 py-1.5 text-xs text-slate-700">
                                                                                    <span className="font-semibold">{cItem.requisition?.unit?.name || 'Unit Kerja'}</span>
                                                                                    <span className="text-[10px] text-slate-400 block font-mono">
                                                                                        {cItem.requisition?.requisition_number}
                                                                                    </span>
                                                                                </td>
                                                                            </tr>
                                                                        ))
                                                                    ) : (
                                                                        <tr className="bg-slate-50/40 text-slate-400 italic text-[11px]">
                                                                            <td className="border border-slate-200 px-3 py-1 text-center font-mono">-</td>
                                                                            <td className="border border-slate-200 px-4 py-1 pl-14" colSpan={6}>
                                                                                Belum ada usulan barang dari unit kerja untuk pos ini pada T.A. {selected_year}
                                                                            </td>
                                                                        </tr>
                                                                    )}
                                                                </Fragment>
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

                    {/* VIEW MODE 2: MASTER CATALOG VIEW */}
                    {tab4ViewMode === 'KATALOG' && (
                        <div className="overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-md">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-slate-300 text-xs">
                                    <thead>
                                        <tr className="bg-slate-100 text-center font-bold text-slate-800">
                                            <th className="border border-slate-300 px-3 py-3 w-12">No</th>
                                            <th className="border border-slate-300 px-4 py-3 text-left w-32">Kode Barang</th>
                                            <th className="border border-slate-300 px-4 py-3 text-left min-w-[240px]">Nama Barang</th>
                                            <th className="border border-slate-300 px-4 py-3 text-left min-w-[200px]">Spesifikasi Detail</th>
                                            <th className="border border-slate-300 px-3 py-3 w-24">Satuan</th>
                                            <th className="border border-slate-300 px-4 py-3 text-right w-36">Standar Harga (Rp)</th>
                                            <th className="border border-slate-300 px-4 py-3 text-left min-w-[200px]">Pos Rekening RBA</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 bg-white">
                                        {filteredCatalogItems.length === 0 ? (
                                            <tr>
                                                <td colSpan="7" className="p-8 text-center text-slate-500">
                                                    Tidak ada barang yang cocok dengan pencarian
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredCatalogItems.map((item, idx) => (
                                                <tr key={item.id} className="hover:bg-slate-50 transition">
                                                    <td className="border border-slate-300 px-3 py-2.5 text-center text-slate-500 font-semibold">
                                                        #{idx + 1}
                                                    </td>
                                                    <td className="border border-slate-300 px-4 py-2.5 font-mono font-bold text-slate-700">
                                                        {item.item_code}
                                                    </td>
                                                    <td className="border border-slate-300 px-4 py-2.5 font-bold text-slate-900">
                                                        {item.name}
                                                    </td>
                                                    <td className="border border-slate-300 px-4 py-2.5 text-xs text-slate-600">
                                                        {item.specification || '-'}
                                                    </td>
                                                    <td className="border border-slate-300 px-3 py-2.5 text-center">
                                                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                                                            {item.unit_type}
                                                        </span>
                                                    </td>
                                                    <td className="border border-slate-300 px-4 py-2.5 text-right font-mono font-bold text-emerald-800">
                                                        {formatRupiah(item.standard_price)}
                                                    </td>
                                                    <td className="border border-slate-300 px-4 py-2.5 text-xs">
                                                        {item.rba_account ? (
                                                            <div>
                                                                <span className="font-mono font-bold text-slate-700 block">
                                                                    [{item.rba_account.account_code}]
                                                                </span>
                                                                <span className="text-slate-600 line-clamp-1">
                                                                    {item.rba_account.account_name}
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-slate-400">-</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* MODAL 1: EDIT REVENUE ITEM (TARGET PENDAPATAN) */}
            {editingRevenueItem && (
                <Modal show={!!editingRevenueItem} onClose={() => setEditingRevenueItem(null)} maxWidth="md">
                    <form onSubmit={submitRevenueItemEdit} className="p-6">
                        <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
                            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 text-lg font-bold">
                                💰
                            </span>
                            <div>
                                <h3 className="text-base font-black text-slate-900">
                                    Penetapan Target Pendapatan
                                </h3>
                                <p className="text-xs text-slate-500 font-medium">
                                    {editingRevenueItem.item_name}
                                </p>
                            </div>
                        </div>

                        <div className="my-5 space-y-4">
                            <div className="rounded-xl bg-slate-50 p-3 text-xs flex justify-between">
                                <span className="text-slate-500">Target Sebelum:</span>
                                <span className="font-mono font-bold text-slate-800">
                                    {formatRupiah(editingRevenueItem.before_amount)}
                                </span>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                                    Target Setelah Pergeseran (Rp)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    step="1000"
                                    value={revenueItemForm.data.after_amount}
                                    onChange={(e) => revenueItemForm.setData('after_amount', e.target.value)}
                                    className="w-full rounded-xl border border-slate-300 font-mono font-bold text-slate-900 focus:border-emerald-600 focus:ring-emerald-500 text-sm py-2 px-3"
                                    required
                                />
                                <span className="mt-1 block text-xs text-slate-500">
                                    Format: {formatRupiah(revenueItemForm.data.after_amount)}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-2.5 border-t border-slate-200 pt-4">
                            <button
                                type="button"
                                onClick={() => setEditingRevenueItem(null)}
                                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={revenueItemForm.processing}
                                className="rounded-xl bg-emerald-600 hover:bg-emerald-700 px-5 py-2 text-xs font-bold text-white shadow-md transition disabled:opacity-50"
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
                    <form onSubmit={submitItemEdit} className="p-6">
                        <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
                            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 text-lg font-bold">
                                ⚡
                            </span>
                            <div>
                                <h3 className="text-base font-black text-slate-900">
                                    Penyesuaian Alokasi Belanja
                                </h3>
                                <p className="text-xs text-slate-500 font-medium">
                                    [{editingItem.account_code}] {editingItem.account_name}
                                </p>
                            </div>
                        </div>

                        <div className="my-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                            <div>
                                <label className="block font-bold text-slate-700 mb-1">Jasa Layanan (Rp)</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={itemForm.data.after_jasa_layanan}
                                    onChange={(e) => itemForm.setData('after_jasa_layanan', e.target.value)}
                                    className="w-full rounded-xl border border-slate-300 font-mono py-1.5 px-3 text-xs"
                                />
                            </div>
                            <div>
                                <label className="block font-bold text-slate-700 mb-1">Hasil Kerjasama (Rp)</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={itemForm.data.after_hasil_kerjasama}
                                    onChange={(e) => itemForm.setData('after_hasil_kerjasama', e.target.value)}
                                    className="w-full rounded-xl border border-slate-300 font-mono py-1.5 px-3 text-xs"
                                />
                            </div>
                            <div>
                                <label className="block font-bold text-slate-700 mb-1">Lain-lain BLUD Sah (Rp)</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={itemForm.data.after_lain_lain_sah}
                                    onChange={(e) => itemForm.setData('after_lain_lain_sah', e.target.value)}
                                    className="w-full rounded-xl border border-slate-300 font-mono py-1.5 px-3 text-xs"
                                />
                            </div>
                            <div>
                                <label className="block font-bold text-slate-700 mb-1">Penggunaan SiLPA (Rp)</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={itemForm.data.after_silpa}
                                    onChange={(e) => itemForm.setData('after_silpa', e.target.value)}
                                    className="w-full rounded-xl border border-slate-300 font-mono py-1.5 px-3 text-xs"
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block font-bold text-slate-700 mb-1">Alokasi APBD (Rp)</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={itemForm.data.after_apbd}
                                    onChange={(e) => itemForm.setData('after_apbd', e.target.value)}
                                    className="w-full rounded-xl border border-slate-300 font-mono py-1.5 px-3 text-xs"
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block font-bold text-slate-700 mb-1">Catatan Telaahan Staf / Keterangan</label>
                                <textarea
                                    rows="2"
                                    value={itemForm.data.keterangan}
                                    onChange={(e) => itemForm.setData('keterangan', e.target.value)}
                                    placeholder="Contoh: Berdasarkan Telaahan Staf dari PPTK Kegiatan perihal pergeseran anggaran..."
                                    className="w-full rounded-xl border border-slate-300 py-1.5 px-3 text-xs font-medium"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-2.5 border-t border-slate-200 pt-4">
                            <button
                                type="button"
                                onClick={() => setEditingItem(null)}
                                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={itemForm.processing}
                                className="rounded-xl bg-emerald-600 hover:bg-emerald-700 px-5 py-2 text-xs font-bold text-white shadow-md transition disabled:opacity-50"
                            >
                                {itemForm.processing ? 'Menyimpan...' : 'Simpan Alokasi Belanja'}
                            </button>
                        </div>
                    </form>
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
                <Modal show={showShiftModal} onClose={() => setShowShiftModal(false)} maxWidth="md">
                    <form onSubmit={submitCreateShift} className="p-6">
                        <h3 className="text-base font-black text-slate-900 border-b border-slate-200 pb-3">
                            Buat Versi Pergeseran RBA Baru
                        </h3>
                        <div className="my-4 space-y-3 text-xs">
                            <div>
                                <label className="block font-bold text-slate-700 mb-1">Tahun Anggaran</label>
                                <input
                                    type="number"
                                    value={shiftForm.data.year}
                                    onChange={(e) => shiftForm.setData('year', e.target.value)}
                                    className="w-full rounded-xl border border-slate-300 py-1.5 px-3 text-xs"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block font-bold text-slate-700 mb-1">Nama Pergeseran</label>
                                <input
                                    type="text"
                                    value={shiftForm.data.shift_name}
                                    onChange={(e) => shiftForm.setData('shift_name', e.target.value)}
                                    placeholder="Contoh: Pergeseran IV"
                                    className="w-full rounded-xl border border-slate-300 py-1.5 px-3 text-xs"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block font-bold text-slate-700 mb-1">Judul Resmi Dokumen</label>
                                <input
                                    type="text"
                                    value={shiftForm.data.doc_title}
                                    onChange={(e) => shiftForm.setData('doc_title', e.target.value)}
                                    className="w-full rounded-xl border border-slate-300 py-1.5 px-3 text-xs"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block font-bold text-slate-700 mb-1">Bulan Periode</label>
                                <input
                                    type="text"
                                    value={shiftForm.data.period_month}
                                    onChange={(e) => shiftForm.setData('period_month', e.target.value)}
                                    placeholder="Contoh: Oktober 2026"
                                    className="w-full rounded-xl border border-slate-300 py-1.5 px-3 text-xs"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 border-t border-slate-200 pt-3">
                            <button
                                type="button"
                                onClick={() => setShowShiftModal(false)}
                                className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={shiftForm.processing}
                                className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-emerald-700 disabled:opacity-50"
                            >
                                Buat Draft
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* MODAL 5: CONFIRM ACTIVATE SHIFT */}
            {activatingShift && (
                <Modal show={!!activatingShift} onClose={() => setActivatingShift(null)} maxWidth="sm">
                    <div className="p-6 text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-800 text-2xl font-bold mb-3">
                            ⚠️
                        </div>
                        <h3 className="text-base font-black text-slate-900">
                            Aktifkan {activatingShift.shift_name}?
                        </h3>
                        <p className="mt-2 text-xs text-slate-600 leading-relaxed font-medium">
                            Mengaktifkan versi ini akan menyelaraskan seluruh pagu belanja dan target pendapatan resmi BLUD RS Jiwa Tampan ke sistem keuangan dan operasional.
                        </p>
                        <div className="mt-6 flex justify-center gap-3">
                            <button
                                type="button"
                                onClick={() => setActivatingShift(null)}
                                className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={confirmActivate}
                                className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-emerald-700"
                            >
                                Ya, Aktifkan Sekarang
                            </button>
                        </div>
                    </div>
                </Modal>
            )}
        </PerencanaanLayout>
    );
}
