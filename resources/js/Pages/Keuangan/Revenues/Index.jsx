import KeuanganLayout from '@/Layouts/KeuanganLayout';
import Pagination from '@/Components/Pagination';
import { Head, Link, useForm } from '@inertiajs/react';
import { useMemo, useState } from 'react';

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

export default function Index({ revenues = [], stats = {} }) {
    const [selectedRevenue, setSelectedRevenue] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const { delete: destroy, processing } = useForm();

    const totalPages = Math.ceil(revenues.length / itemsPerPage) || 1;
    const paginatedRevenues = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return revenues.slice(start, start + itemsPerPage);
    }, [revenues, currentPage, itemsPerPage]);

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
                        Penerimaan Pendapatan E-BLUD
                    </h1>
                    <p className="mt-1 text-xs font-semibold text-slate-500 sm:text-sm">
                        Pencatatan arus kas masuk dari unit layanan, farmasi, poliklinik, dan penunjang medis
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Link
                        href={route('revenues.create')}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 px-5 py-2.5 text-sm font-bold text-white shadow-md hover:shadow-lg transition-all duration-200"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        Catat Pendapatan Baru
                    </Link>
                </div>
            </div>

            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
                {/* Total Pendapatan Akumulasi */}
                <div className="bg-white rounded-2xl shadow-md shadow-emerald-950/5 border border-emerald-100/90 p-5 flex items-center justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-900/10">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Pendapatan</p>
                        <h3 className="text-xl sm:text-2xl font-black text-emerald-700 mt-1.5 truncate">
                            {formatRupiah(stats.total_revenue)}
                        </h3>
                        <p className="mt-1 text-[11px] font-bold text-emerald-600">Realisasi Penerimaan</p>
                    </div>
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-500/20">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                </div>

                {/* Pendapatan Bulan Ini */}
                <div className="bg-white rounded-2xl shadow-md shadow-emerald-950/5 border border-emerald-100/90 p-5 flex items-center justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-900/10">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Bulan Ini</p>
                        <h3 className="text-xl sm:text-2xl font-black text-teal-700 mt-1.5 truncate">
                            {formatRupiah(stats.monthly_revenue)}
                        </h3>
                        <p className="mt-1 text-[11px] font-bold text-teal-600">Penerimaan Berjalan</p>
                    </div>
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600 ring-1 ring-teal-500/20">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.253M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                        </svg>
                    </div>
                </div>

                {/* Pendapatan Hari Ini */}
                <div className="bg-white rounded-2xl shadow-md shadow-emerald-950/5 border border-emerald-100/90 p-5 flex items-center justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-900/10">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Hari Ini</p>
                        <h3 className="text-xl sm:text-2xl font-black text-blue-700 mt-1.5 truncate">
                            {formatRupiah(stats.today_revenue)}
                        </h3>
                        <p className="mt-1 text-[11px] font-bold text-blue-600">Penerimaan Harian</p>
                    </div>
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-500/20">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                </div>

                {/* Total Transaksi */}
                <div className="bg-white rounded-2xl shadow-md shadow-emerald-950/5 border border-emerald-100/90 p-5 flex items-center justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-900/10">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Transaksi</p>
                        <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1.5">
                            {stats.total_transactions}
                        </h3>
                        <p className="mt-1 text-[11px] font-bold text-slate-500">Slip Bukti Penerimaan</p>
                    </div>
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600 ring-1 ring-purple-500/20">
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Main Table Container */}
            <div className="overflow-hidden rounded-2xl border border-emerald-100/90 bg-white shadow-md shadow-emerald-950/5 hover:shadow-lg hover:shadow-emerald-900/10 transition-shadow">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-700 divide-y divide-emerald-100 border-collapse">
                        <thead className="bg-gradient-to-r from-emerald-50/90 via-teal-50/40 to-emerald-50/90 font-bold border-b border-emerald-100 text-emerald-950 uppercase tracking-wider text-xs">
                            <tr>
                                <th className="px-4 py-3.5 text-center w-14 text-emerald-950">No</th>
                                <th className="px-5 py-3.5 text-emerald-950">Nomor Bukti</th>
                                <th className="px-4 py-3.5 text-center text-emerald-950">Tanggal</th>
                                <th className="px-5 py-3.5 text-emerald-950">Sumber Layanan</th>
                                <th className="px-5 py-3.5 text-emerald-950">Uraian / Keterangan</th>
                                <th className="px-5 py-3.5 text-right text-emerald-950">Nominal (IDR)</th>
                                <th className="px-4 py-3.5 text-center w-24 text-emerald-950">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                            {revenues.length > 0 ? (
                                paginatedRevenues.map((item, index) => (
                                    <tr key={item.id} className="transition-colors duration-150 hover:bg-emerald-50/40">
                                        <td className="px-4 py-3.5 text-center text-xs font-semibold text-slate-500">
                                            {(currentPage - 1) * itemsPerPage + index + 1}
                                        </td>
                                        <td className="px-5 py-3.5 font-mono text-xs font-bold text-slate-900 whitespace-nowrap">
                                            {item.revenue_number}
                                        </td>
                                        <td className="px-4 py-3.5 text-center text-xs font-semibold text-slate-600 whitespace-nowrap">
                                            {formatTanggal(item.date)}
                                        </td>
                                        <td className="px-5 py-3.5 font-bold text-slate-800">
                                            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-800 border border-emerald-200">
                                                {item.source}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5 text-xs text-slate-600">
                                            {item.description || '-'}
                                        </td>
                                        <td className="px-5 py-3.5 text-right font-black text-emerald-700 whitespace-nowrap">
                                            {formatRupiah(item.amount)}
                                        </td>
                                        <td className="px-4 py-3.5 text-center whitespace-nowrap">
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteClick(item)}
                                                className="inline-flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-bold text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition"
                                                title="Hapus Catatan"
                                            >
                                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                                </svg>
                                                Hapus
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="px-6 py-10 text-center text-slate-400 font-medium">
                                        Belum ada penerimaan pendapatan yang dicatat.
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

            {/* Delete Confirmation Modal */}
            {showDeleteModal && selectedRevenue && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                    <div className="w-full max-w-md rounded-2xl border-2 border-slate-300 bg-white p-6 shadow-2xl space-y-4">
                        <div className="flex items-center gap-3 text-rose-600">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-100">
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                </svg>
                            </div>
                            <h3 className="text-base font-black text-slate-900">Konfirmasi Hapus Pendapatan</h3>
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed font-medium">
                            Apakah Anda yakin ingin menghapus transaksi penerimaan <strong>{selectedRevenue.revenue_number}</strong> sebesar <strong>{formatRupiah(selectedRevenue.amount)}</strong> dari sumber <strong>{selectedRevenue.source}</strong>?
                        </p>

                        <div className="flex items-center justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setShowDeleteModal(false)}
                                className="rounded-xl border-2 border-slate-300 bg-white px-5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
                            >
                                Batalkan
                            </button>
                            <button
                                type="button"
                                onClick={confirmDelete}
                                disabled={processing}
                                className="rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white px-5 py-2 text-xs font-black shadow-md transition disabled:opacity-50"
                            >
                                Ya, Hapus Catatan
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </KeuanganLayout>
    );
}

