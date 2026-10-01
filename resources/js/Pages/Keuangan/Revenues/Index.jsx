import KeuanganLayout from '@/Layouts/KeuanganLayout';
import Pagination from '@/Components/Pagination';
import RevenueFormModal from './Partials/RevenueFormModal';
import DeleteConfirmationModal from '@/Components/DeleteConfirmationModal';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useMemo, useState, useEffect } from 'react';
import { Plus, Wallet, TrendingUp, HandCoins, ReceiptText, Search, Trash2 } from 'lucide-react';

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

export default function Index({
    revenues = [],
    stats = {},
    categories = ['Semua', 'Jasa Layanan', 'Hasil Kerja Sama', 'APBD', 'Lain-lain BLUD Sah'],
    grouped_sources = null,
    sources = [],
    default_date = '',
}) {
    const { url } = usePage();
    const [selectedCategory, setSelectedCategory] = useState('Semua');

    // Sync selectedCategory from URL
    useEffect(() => {
        let currentCategory = 'Semua';
        if (url.includes('?category=')) {
            currentCategory = decodeURIComponent(url.split('?category=')[1].split('&')[0]);
        }
        setSelectedCategory(currentCategory);
    }, [url]);

    const [selectedRevenue, setSelectedRevenue] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const { delete: destroy, processing } = useForm();

    const filteredRevenues = useMemo(() => {
        return revenues.filter((item) => {
            const matchesCategory = selectedCategory === 'Semua' || (item.category === selectedCategory);
            const query = searchQuery.toLowerCase();
            const matchesSearch = !searchQuery ||
                item.revenue_number?.toLowerCase().includes(query) ||
                item.source?.toLowerCase().includes(query) ||
                item.description?.toLowerCase().includes(query);
            return matchesCategory && matchesSearch;
        });
    }, [revenues, selectedCategory, searchQuery]);

    const totalPages = Math.ceil(filteredRevenues.length / itemsPerPage) || 1;
    const paginatedRevenues = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredRevenues.slice(start, start + itemsPerPage);
    }, [filteredRevenues, currentPage, itemsPerPage]);

    const handleDeleteClick = (revenue) => {
        setSelectedRevenue(revenue);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        if (!selectedRevenue) return;
        destroy(route('revenues.destroy', selectedRevenue.id), {
            preserveScroll: true,
            onSuccess: () => {
                setShowDeleteModal(false);
                setSelectedRevenue(null);
            },
        });
    };

    return (
        <KeuanganLayout>
            <Head title="Pendapatan E-BLUD - RSJ Tampan" />

            {/* Page Header */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                        Penerimaan Pendapatan E-BLUD {selectedCategory !== 'Semua' ? `- ${selectedCategory}` : ''}
                    </h1>
                    <p className="mt-1 text-xs font-semibold text-slate-500 sm:text-sm">
                        Pencatatan arus kas masuk dari unit layanan, farmasi, poliklinik, dan penunjang medis
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => setIsCreateModalOpen(true)}
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-95 px-4 py-2 text-xs font-bold text-white shadow-2xs transition-all duration-200 cursor-pointer whitespace-nowrap"
                    >
                        <Plus className="h-4 w-4" strokeWidth={2.5} />
                        Catat Pendapatan Baru
                    </button>
                </div>
            </div>

            {/* KPI Cards Grid (High Contrast Style) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
                <div className="bg-white rounded-2xl p-5 border-2 border-emerald-300 shadow-md flex flex-col transition hover:-translate-y-0.5 hover:shadow-lg">
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-black uppercase tracking-wider text-emerald-600">Total Pendapatan</p>
                        <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
                            <Wallet className="h-5 w-5" strokeWidth={2} />
                        </div>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-2 truncate">
                        {formatRupiah(stats.total_revenue)}
                    </h3>
                </div>

                <div className="bg-white rounded-2xl p-5 border-2 border-teal-300 shadow-md flex flex-col transition hover:-translate-y-0.5 hover:shadow-lg">
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-black uppercase tracking-wider text-teal-600">Bulan Ini</p>
                        <div className="rounded-lg bg-teal-50 p-2 text-teal-600">
                            <TrendingUp className="h-5 w-5" strokeWidth={2} />
                        </div>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-2 truncate">
                        {formatRupiah(stats.monthly_revenue)}
                    </h3>
                </div>

                <div className="bg-white rounded-2xl p-5 border-2 border-blue-300 shadow-md flex flex-col transition hover:-translate-y-0.5 hover:shadow-lg">
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-black uppercase tracking-wider text-blue-600">Hari Ini</p>
                        <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                            <HandCoins className="h-5 w-5" strokeWidth={2} />
                        </div>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-2 truncate">
                        {formatRupiah(stats.today_revenue)}
                    </h3>
                </div>

                <div className="bg-white rounded-2xl p-5 border-2 border-purple-300 shadow-md flex flex-col transition hover:-translate-y-0.5 hover:shadow-lg">
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-black uppercase tracking-wider text-purple-600">Total Transaksi</p>
                        <div className="rounded-lg bg-purple-50 p-2 text-purple-600">
                            <ReceiptText className="h-5 w-5" strokeWidth={2} />
                        </div>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
                        {stats.total_transactions}
                    </h3>
                </div>
            </div>

            {/* Filter & Search Bar (Simplified) */}
            <div className="mb-4 bg-white rounded-2xl border border-slate-200 p-3 shadow-sm flex items-center">
                <div className="relative w-full sm:w-96">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <Search className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Cari nomor bukti, pos rekening, atau keterangan..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="w-full rounded-xl border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:border-teal-500 focus:ring-teal-500 focus:bg-white transition-colors"
                    />
                </div>
            </div>

            {/* Main Table Container */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-700 divide-y divide-slate-200 border-collapse">
                        <thead className="bg-slate-50 font-bold border-b border-slate-200 text-slate-800 text-xs">
                            <tr>
                                <th className="px-4 py-3.5 text-center w-14">No</th>
                                <th className="px-5 py-3.5">Nomor Bukti</th>
                                <th className="px-4 py-3.5 text-center">Tanggal</th>
                                <th className="px-5 py-3.5">Pos Rekening / Unit Layanan</th>
                                <th className="px-5 py-3.5">Uraian / Keterangan</th>
                                <th className="px-5 py-3.5 text-right">Nominal (IDR)</th>
                                <th className="px-4 py-3.5 text-center w-24">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                            {filteredRevenues.length > 0 ? (
                                paginatedRevenues.map((item, index) => (
                                    <tr key={item.id} className="transition-colors duration-150 hover:bg-slate-50/50">
                                        <td className="px-4 py-4 text-center text-xs font-semibold text-slate-500">
                                            {(currentPage - 1) * itemsPerPage + index + 1}
                                        </td>
                                        <td className="px-5 py-4 font-mono text-xs font-bold text-slate-900 whitespace-nowrap">
                                            {item.revenue_number}
                                        </td>
                                        <td className="px-4 py-4 text-center text-xs font-semibold text-slate-600 whitespace-nowrap">
                                            {formatTanggal(item.date)}
                                        </td>
                                        <td className="px-5 py-4 font-bold text-slate-800">
                                            <div className="flex flex-col gap-1 items-start">
                                                <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-black text-slate-600 border border-slate-200 uppercase tracking-wider">
                                                    {item.category || 'Jasa Layanan'}
                                                </span>
                                                <span className="text-xs font-bold text-slate-900">
                                                    {item.source}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-xs text-slate-600">
                                            {item.description || '-'}
                                        </td>
                                        <td className="px-5 py-4 text-right font-black text-emerald-700 whitespace-nowrap">
                                            {formatRupiah(item.amount)}
                                        </td>
                                        <td className="px-4 py-4 text-center whitespace-nowrap">
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteClick(item)}
                                                className="inline-flex items-center justify-center p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                                title="Hapus Catatan"
                                            >
                                                <Trash2 className="h-4 w-4" strokeWidth={2} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center">
                                        <p className="text-slate-500 text-sm font-medium">Tidak ada penerimaan pendapatan yang sesuai dengan pencarian Anda.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Component */}
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={revenues.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={(p) => setCurrentPage(p)}
                />
            </div>

            {/* Delete Confirmation Card Modal Pop-Up */}
            <DeleteConfirmationModal
                show={Boolean(showDeleteModal && selectedRevenue)}
                onClose={() => {
                    setShowDeleteModal(false);
                    setSelectedRevenue(null);
                }}
                onConfirm={confirmDelete}
                processing={processing}
                title="Hapus Bukti Penerimaan Kas?"
                message="Transaksi penerimaan kas ini akan dihapus secara permanen dari pembukuan E-BLUD RS Jiwa Tampan."
                itemName={selectedRevenue ? `${selectedRevenue.source} (${formatRupiah(selectedRevenue.amount)})` : ''}
                itemCode={selectedRevenue?.revenue_number}
                confirmText="Ya, Hapus Catatan"
            />

            {/* Modal Card Catat Pendapatan Baru */}
            <RevenueFormModal
                show={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                grouped_sources={grouped_sources}
                sources={sources}
                default_date={default_date}
            />
        </KeuanganLayout>
    );
}

