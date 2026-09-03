import PerencanaanLayout from '@/Layouts/PerencanaanLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

const formatRupiah = (value) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(Number(value || 0));

export default function Index({ rbas = [], current_year = 2026 }) {
    const [selectedRba, setSelectedRba] = useState(null);
    const [showSahkanModal, setShowSahkanModal] = useState(false);
    const { patch, processing } = useForm();

    const handleSahkanClick = (rba) => {
        setSelectedRba(rba);
        setShowSahkanModal(true);
    };

    const confirmSahkan = () => {
        if (!selectedRba) return;
        patch(route('perencanaan.rba.sahkan', selectedRba.id), {
            preserveScroll: true,
            onSuccess: () => {
                setShowSahkanModal(false);
                setSelectedRba(null);
            },
        });
    };

    return (
        <PerencanaanLayout>
            <Head title="RBA (Rencana Bisnis dan Anggaran) - E-BLUD RSJ Tampan" />

            {/* Page Header */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                        Rencana Bisnis dan Anggaran (RBA)
                    </h1>
                    <p className="mt-1 text-xs font-semibold text-slate-500 sm:text-sm">
                        Penyusunan target pendapatan dan plafon belanja tahunan rumah sakit pola pengelolaan keuangan BLUD
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Link
                        href={route('perencanaan.rba.create')}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 px-5 py-2.5 text-sm font-bold text-white shadow-md hover:shadow-lg transition-all duration-200"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        Susun RBA Baru
                    </Link>
                </div>
            </div>

            {/* Main Table */}
            <div className="overflow-hidden rounded-2xl border-2 border-slate-300 bg-white shadow-md">
                <div className="border-b-2 border-slate-200 bg-slate-100 px-6 py-4 flex items-center justify-between">
                    <div>
                        <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                            Daftar Dokumen RBA Tahunan
                        </h3>
                        <p className="text-xs text-slate-500 font-medium">
                            Dokumen yang berstatus "Disahkan" menjadi pedoman batas pagu belanja dan target penerimaan RSJ
                        </p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-700">
                        <thead className="border-b-2 border-slate-300 bg-emerald-50/80 text-xs font-bold uppercase tracking-wider text-slate-800">
                            <tr>
                                <th className="px-4 py-3.5 text-center w-14 border-r-2 border-slate-200">Tahun</th>
                                <th className="px-5 py-3.5 border-r-2 border-slate-200">Target Pendapatan (IDR)</th>
                                <th className="px-5 py-3.5 border-r-2 border-slate-200">Rencana Belanja (IDR)</th>
                                <th className="px-5 py-3.5 border-r-2 border-slate-200">Proyeksi Surplus / Defisit</th>
                                <th className="px-4 py-3.5 text-center border-r-2 border-slate-200">Status Dokumen</th>
                                <th className="px-5 py-3.5 border-r-2 border-slate-200">Catatan Perencanaan</th>
                                <th className="px-4 py-3.5 text-center w-28">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y-2 divide-slate-200">
                            {rbas.length > 0 ? (
                                rbas.map((rba) => {
                                    const projection = Number(rba.target_revenue) - Number(rba.planned_expense);
                                    const isSurplus = projection >= 0;
                                    const isDisahkan = rba.status === 'Disahkan';

                                    return (
                                        <tr key={rba.id} className="transition-colors duration-200 hover:bg-emerald-50/60">
                                            <td className="px-4 py-4 text-center font-black text-slate-900 border-r-2 border-slate-200 text-base">
                                                {rba.year}
                                            </td>
                                            <td className="px-5 py-4 font-black text-emerald-700 border-r-2 border-slate-200 whitespace-nowrap">
                                                {formatRupiah(rba.target_revenue)}
                                            </td>
                                            <td className="px-5 py-4 font-black text-amber-700 border-r-2 border-slate-200 whitespace-nowrap">
                                                {formatRupiah(rba.planned_expense)}
                                            </td>
                                            <td className="px-5 py-4 border-r-2 border-slate-200 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-sm font-black ${isSurplus ? 'text-emerald-700' : 'text-rose-700'}`}>
                                                        {formatRupiah(projection)}
                                                    </span>
                                                    <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-black uppercase ${
                                                        isSurplus ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                                                    }`}>
                                                        {isSurplus ? 'Surplus' : 'Defisit'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-center border-r-2 border-slate-200 whitespace-nowrap">
                                                {isDisahkan ? (
                                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 border border-emerald-300">
                                                        <svg className="h-3.5 w-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                                                        </svg>
                                                        Disahkan & Dikunci
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800 border border-amber-300">
                                                        <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                                                        Draft Pembahasan
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-5 py-4 text-xs text-slate-600 border-r-2 border-slate-200">
                                                {rba.notes || '-'}
                                            </td>
                                            <td className="px-4 py-4 text-center whitespace-nowrap">
                                                {!isDisahkan ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleSahkanClick(rba)}
                                                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 px-3 py-1.5 text-xs font-black text-white shadow-xs transition"
                                                    >
                                                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                                        </svg>
                                                        Sahkan RBA
                                                    </button>
                                                ) : (
                                                    <span className="text-xs font-bold text-slate-400">
                                                        Terkunci
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={7} className="px-6 py-10 text-center text-slate-400 font-medium">
                                        Belum ada dokumen RBA yang disusun. Silakan klik tombol "Susun RBA Baru".
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Sahkan Confirmation Modal */}
            {showSahkanModal && selectedRba && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
                    <div className="w-full max-w-md rounded-2xl border-2 border-slate-300 bg-white p-6 shadow-2xl space-y-4">
                        <div className="flex items-center gap-3 text-emerald-600">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100">
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-base font-black text-slate-900">Pengesahan RBA E-BLUD</h3>
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed font-medium">
                            Apakah Anda yakin ingin mengesahkan Rencana Bisnis dan Anggaran (RBA) untuk <strong>Tahun Anggaran {selectedRba.year}</strong>?
                        </p>
                        <div className="rounded-xl bg-slate-50 p-3 border border-slate-200 text-xs space-y-1">
                            <p className="text-slate-600">
                                Target Pendapatan: <span className="font-bold text-emerald-700">{formatRupiah(selectedRba.target_revenue)}</span>
                            </p>
                            <p className="text-slate-600">
                                Rencana Belanja: <span className="font-bold text-amber-700">{formatRupiah(selectedRba.planned_expense)}</span>
                            </p>
                        </div>
                        <p className="text-[11px] text-slate-500 italic">
                            *Setelah disahkan, dokumen RBA akan berstatus resmi dan dikunci dari perubahan lebih lanjut.
                        </p>

                        <div className="flex items-center justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setShowSahkanModal(false)}
                                className="rounded-xl border-2 border-slate-300 bg-white px-5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
                            >
                                Batalkan
                            </button>
                            <button
                                type="button"
                                onClick={confirmSahkan}
                                disabled={processing}
                                className="rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white px-5 py-2 text-xs font-black shadow-md transition disabled:opacity-50"
                            >
                                Ya, Sahkan RBA
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </PerencanaanLayout>
    );
}

