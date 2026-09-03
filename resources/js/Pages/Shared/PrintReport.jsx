import { Head } from '@inertiajs/react';

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

export default function PrintReport({ budgets = [], summary = {} }) {
    const currentDate = formatTanggal(new Date());

    return (
        <div className="bg-white text-black min-h-screen p-8 max-w-5xl mx-auto font-sans print:p-0 print:max-w-none">
            <Head title="Cetak Laporan Realisasi Anggaran E-BLUD" />

            {/* Print Action Bar (Hidden during Print) */}
            <div className="print:hidden flex items-center justify-between bg-slate-100 p-4 rounded-xl mb-6 border border-slate-200">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-700">Dokumen Rekapitulasi Realisasi Anggaran E-BLUD</span>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => window.history.back()}
                        className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-lg text-sm font-semibold transition"
                    >
                        Kembali
                    </button>
                    <button
                        type="button"
                        onClick={() => window.print()}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2 rounded-lg text-sm shadow-sm transition flex items-center gap-2"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24-1.077-.32-2.14-.32-3.193 0-5.18 4.02-9.386 8.974-9.386 4.954 0 8.973 4.207 8.973 9.386 0 1.053-.08 2.116-.32 3.193M12 18v-4.5m0 0l-2.25 2.25M12 13.5l2.25 2.25M3.75 19.5h16.5" />
                        </svg>
                        Cetak Laporan
                    </button>
                </div>
            </div>

            {/* Kop Surat (Header) */}
            <div className="flex items-center gap-6 border-b-4 border-black pb-4 mb-6">
                <div className="shrink-0">
                    <img
                        src="/image/logo-vertikal-rsj.png"
                        alt="Logo RSJ Tampan"
                        className="h-24 w-auto object-contain"
                    />
                </div>
                <div className="flex-1 text-center">
                    <h2 className="text-sm font-bold tracking-wider uppercase text-black">
                        PEMERINTAH PROVINSI RIAU
                    </h2>
                    <h1 className="text-xl sm:text-2xl font-black uppercase text-black tracking-tight leading-tight mt-0.5">
                        RUMAH SAKIT JIWA TAMPAN
                    </h1>
                    <p className="text-xs text-black font-medium mt-0.5">
                        Jl. H.R. Soebrantas Km. 12,5 Pekanbaru - Riau | Telp: (0761) 63240
                    </p>
                    <div className="mt-2 pt-1 border-t border-black">
                        <h3 className="text-base font-black tracking-wider uppercase">
                            LAPORAN REALISASI ANGGARAN E-BLUD
                        </h3>
                        <p className="text-xs font-bold tracking-wider">
                            TAHUN ANGGARAN {new Date().getFullYear()}
                        </p>
                    </div>
                </div>
            </div>

            {/* Metadata Ringkasan */}
            <div className="mb-4 flex items-center justify-between text-xs font-semibold">
                <div>
                    <span>Instansi: <strong>RSJ Tampan Provinsi Riau</strong></span>
                </div>
                <div>
                    <span>Tanggal Cetak: <strong>{currentDate}</strong></span>
                </div>
            </div>

            {/* Data Table with Crisp Black Borders for Printing */}
            <table className="w-full border-collapse border border-black text-sm">
                <thead>
                    <tr className="bg-gray-100 print:bg-transparent">
                        <th className="border border-black p-2 text-center w-10 font-bold">No</th>
                        <th className="border border-black p-2 text-left font-bold w-36">Kode Rekening</th>
                        <th className="border border-black p-2 text-left font-bold">Nama Rekening Belanja</th>
                        <th className="border border-black p-2 text-center w-16 font-bold">Tahun</th>
                        <th className="border border-black p-2 text-right w-36 font-bold">Total Pagu (Awal)</th>
                        <th className="border border-black p-2 text-right w-36 font-bold">Total Terpakai (Realisasi)</th>
                        <th className="border border-black p-2 text-right w-36 font-bold">Sisa Anggaran</th>
                        <th className="border border-black p-2 text-center w-20 font-bold">% Realisasi</th>
                    </tr>
                </thead>
                <tbody>
                    {budgets.length > 0 ? (
                        budgets.map((budget, index) => (
                            <tr key={budget.id}>
                                <td className="border border-black p-2 text-center">{index + 1}</td>
                                <td className="border border-black p-2 font-mono text-xs">{budget.account_code}</td>
                                <td className="border border-black p-2 font-medium">{budget.account_name}</td>
                                <td className="border border-black p-2 text-center">{budget.period_year}</td>
                                <td className="border border-black p-2 text-right">{formatRupiah(budget.total_budget)}</td>
                                <td className="border border-black p-2 text-right">{formatRupiah(budget.total_spent)}</td>
                                <td className="border border-black p-2 text-right">{formatRupiah(budget.remaining_budget)}</td>
                                <td className="border border-black p-2 text-center font-bold">{budget.percentage}%</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={8} className="border border-black p-4 text-center">
                                Belum ada data pagu anggaran.
                            </td>
                        </tr>
                    )}
                </tbody>
                <tfoot>
                    <tr className="bg-gray-100 print:bg-transparent font-bold">
                        <td colSpan={4} className="border border-black p-2 text-right font-black uppercase">
                            TOTAL REKAPITULASI:
                        </td>
                        <td className="border border-black p-2 text-right font-black">
                            {formatRupiah(summary.total_initial)}
                        </td>
                        <td className="border border-black p-2 text-right font-black">
                            {formatRupiah(summary.total_spent)}
                        </td>
                        <td className="border border-black p-2 text-right font-black">
                            {formatRupiah(summary.total_remaining)}
                        </td>
                        <td className="border border-black p-2 text-center font-black">
                            {summary.overall_percentage}%
                        </td>
                    </tr>
                </tfoot>
            </table>

            {/* Footer / Tanda Tangan PPK di sisi kanan */}
            <div className="mt-12 flex justify-end text-sm">
                <div className="w-80 text-center">
                    <p className="font-medium">Pekanbaru, {currentDate}</p>
                    <p className="font-bold mt-1">Direktur Keuangan /</p>
                    <p className="font-bold">Pejabat Penatausahaan Keuangan (PPK)</p>

                    {/* Wet signature spacing */}
                    <div className="h-28" />

                    <p className="font-bold underline uppercase">
                        ( ............................................................ )
                    </p>
                    <p className="text-xs text-slate-600 mt-0.5">NIP. ........................................................</p>
                </div>
            </div>

            {/* Print Styling Helper */}
            <style>{`
                @media print {
                    @page {
                        size: A4 landscape;
                        margin: 15mm;
                    }
                    body {
                        background-color: #ffffff !important;
                        color: #000000 !important;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                }
            `}</style>
        </div>
    );
}

