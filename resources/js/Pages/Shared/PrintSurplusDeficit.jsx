import { Head } from '@inertiajs/react';
import { useEffect } from 'react';

const formatRupiah = (value) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(Number(value || 0));

export default function PrintSurplusDeficit({
    period_year = 2026,
    summary = {},
    revenue_sources = [],
    expense_categories = [],
    printed_at = '',
}) {
    useEffect(() => {
        const timer = setTimeout(() => {
            window.print();
        }, 600);
        return () => clearTimeout(timer);
    }, []);

    const isSurplus = summary.is_surplus;

    return (
        <div className="min-h-screen bg-white text-slate-900 font-sans p-6 sm:p-10 print:p-0">
            <Head title={`Laporan_Operasional_BLUD_${period_year}`} />

            {/* Print Action Buttons (Hidden on Print) */}
            <div className="mb-6 flex items-center justify-between border-b pb-4 print:hidden">
                <div className="flex items-center gap-2">
                    <span className="inline-block h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold text-slate-600">
                        Pratinjau Dokumen Cetak Resmi Laporan Operasional E-BLUD
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => window.print()}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24-1.076-.64-2.115-1.182-3.088m12.924 0c-.542.973-.942 2.012-1.182 3.088m-10.56 0A9.004 9.004 0 0112 3a9.004 9.004 0 018.72 10.829m-17.44 0a8.96 8.96 0 003.58 5.761m10.28 0a8.96 8.96 0 003.58-5.761M12 18a6 6 0 100-12 6 6 0 000 12z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h10.5a2.25 2.25 0 012.25 2.25v6a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 15v-6a2.25 2.25 0 012.25-2.25z" />
                        </svg>
                        Cetak Laporan (Print)
                    </button>
                    <button
                        type="button"
                        onClick={() => window.close()}
                        className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                    >
                        Tutup Jendela
                    </button>
                </div>
            </div>

            {/* Formal Government Kop Surat */}
            <div className="border-b-4 border-double border-black pb-4 mb-6">
                <div className="flex items-center gap-6">
                    <img
                        src="/image/logo-vertikal-rsj.png"
                        alt="Logo RSJ Tampan"
                        className="h-24 w-auto object-contain shrink-0"
                    />
                    <div className="flex-1 text-center">
                        <h2 className="text-sm font-bold uppercase tracking-wider text-black">
                            Pemerintah Provinsi Riau
                        </h2>
                        <h1 className="text-lg font-black uppercase tracking-tight text-black">
                            Rumah Sakit Jiwa Tampan
                        </h1>
                        <p className="text-xs text-black mt-0.5">
                            Jl. H.R. Soebrantas Km. 12,5 Pekanbaru - Riau &bull; Telp. (0761) 63240
                        </p>
                        <p className="text-[11px] text-black">
                            Laman: rsjtampan.riau.go.id &bull; Pos-el: rsjtampan@riau.go.id
                        </p>
                    </div>
                </div>
            </div>

            {/* Report Title */}
            <div className="text-center mb-6">
                <h3 className="text-sm font-black uppercase tracking-wider text-black underline">
                    LAPORAN OPERASIONAL (SURPLUS / DEFISIT)
                </h3>
                <p className="text-xs font-bold text-black mt-1">
                    POLA PENGELOLAAN KEUANGAN BADAN LAYANAN UMUM DAERAH (PPK-BLUD)
                </p>
                <p className="text-xs text-black">
                    Untuk Periode Tahun Anggaran {period_year}
                </p>
            </div>

            {/* Financial Tables */}
            <div className="space-y-6">
                {/* 1. Pendapatan Operasional */}
                <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-black mb-2">
                        I. PENDAPATAN OPERASIONAL BLUD
                    </h4>
                    <table className="w-full text-left text-xs border border-black border-collapse">
                        <thead>
                            <tr className="bg-slate-100 border-b border-black">
                                <th className="border border-black px-3 py-2 text-center w-12 font-bold">No</th>
                                <th className="border border-black px-3 py-2 font-bold">Sumber Penerimaan Kas</th>
                                <th className="border border-black px-3 py-2 text-center w-24 font-bold">Transaksi</th>
                                <th className="border border-black px-3 py-2 text-right w-44 font-bold">Jumlah Realisasi (Rp)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {revenue_sources.map((item, idx) => (
                                <tr key={idx} className="border-b border-black">
                                    <td className="border border-black px-3 py-2 text-center">{idx + 1}</td>
                                    <td className="border border-black px-3 py-2 font-semibold">{item.source}</td>
                                    <td className="border border-black px-3 py-2 text-center">{item.count}</td>
                                    <td className="border border-black px-3 py-2 text-right font-bold">
                                        {formatRupiah(item.total_amount)}
                                    </td>
                                </tr>
                            ))}
                            <tr className="bg-slate-50 font-black">
                                <td colSpan={3} className="border border-black px-3 py-2 text-right uppercase">
                                    Total Pendapatan Operasional (A):
                                </td>
                                <td className="border border-black px-3 py-2 text-right text-sm">
                                    {formatRupiah(summary.total_revenue)}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* 2. Beban Belanja Operasional */}
                <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-black mb-2">
                        II. BEBAN BELANJA OPERASIONAL PENGADAAN (DPA-BLUD)
                    </h4>
                    <table className="w-full text-left text-xs border border-black border-collapse">
                        <thead>
                            <tr className="bg-slate-100 border-b border-black">
                                <th className="border border-black px-3 py-2 text-center w-12 font-bold">No</th>
                                <th className="border border-black px-3 py-2 font-bold">Kode Rekening</th>
                                <th className="border border-black px-3 py-2 font-bold">Uraian Rekening Belanja</th>
                                <th className="border border-black px-3 py-2 text-right w-44 font-bold">Realisasi Belanja (Rp)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {expense_categories.map((cat, idx) => (
                                <tr key={idx} className="border-b border-black">
                                    <td className="border border-black px-3 py-2 text-center">{idx + 1}</td>
                                    <td className="border border-black px-3 py-2 font-mono text-[11px]">{cat.account_code}</td>
                                    <td className="border border-black px-3 py-2 font-semibold">{cat.account_name}</td>
                                    <td className="border border-black px-3 py-2 text-right font-bold">
                                        {formatRupiah(cat.spent)}
                                    </td>
                                </tr>
                            ))}
                            <tr className="bg-slate-50 font-black">
                                <td colSpan={3} className="border border-black px-3 py-2 text-right uppercase">
                                    Total Beban Belanja Operasional (B):
                                </td>
                                <td className="border border-black px-3 py-2 text-right text-sm">
                                    {formatRupiah(summary.total_expense)}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* 3. Surplus / Defisit Bersih */}
                <div className="border-2 border-black p-4 bg-slate-50">
                    <div className="flex items-center justify-between">
                        <div>
                            <span className="text-xs font-black uppercase tracking-wider block">
                                III. SURPLUS / (DEFISIT) OPERASIONAL BLUD (A - B)
                            </span>
                            <span className="text-[11px] text-black">
                                {isSurplus ? 'Kinerja Positif (Penerimaan > Belanja)' : 'Kinerja Negatif (Belanja > Penerimaan)'}
                            </span>
                        </div>
                        <div className="text-right">
                            <span className="text-base sm:text-lg font-black block">
                                {formatRupiah(summary.surplus_deficit)}
                            </span>
                            <span className="text-[10px] font-bold uppercase tracking-wider border border-black px-2 py-0.5 inline-block mt-0.5">
                                STATUS: {isSurplus ? 'SURPLUS' : 'DEFISIT'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Official Signature Block */}
            <div className="mt-12 flex justify-between text-xs text-black break-inside-avoid">
                <div className="text-center w-64">
                    <p>Mengetahui,</p>
                    <p className="font-bold">Direktur RSJ Tampan</p>
                    <div className="h-20" />
                    <p className="font-black underline uppercase">dr. Zulkifli, Sp.KJ</p>
                    <p>NIP. 19740512 200212 1 004</p>
                </div>

                <div className="text-center w-64">
                    <p>Pekanbaru, {printed_at || new Date().toLocaleDateString('id-ID')}</p>
                    <p className="font-bold">Pejabat Penatausahaan Keuangan (PPK)</p>
                    <div className="h-20" />
                    <p className="font-black underline uppercase">H. Ahmad Fauzi, SE, M.Ak</p>
                    <p>NIP. 19800315 200604 1 009</p>
                </div>
            </div>
        </div>
    );
}

