import { Head, usePage } from '@inertiajs/react';
import { useEffect } from 'react';

const formatRupiah = (value) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(Number(value || 0));

const formatSisaAnggaran = (value) => {
    const num = Number(value || 0);
    if (num < 0) {
        return `(${formatRupiah(Math.abs(num))})`;
    }
    return formatRupiah(num);
};

export default function PrintRevenueMonthlyMatrix({
    selected_year = 2027,
    matrix = {},
    category_totals = {},
    grand_total = {},
    printed_at = '',
}) {
    const { system_settings = {} } = usePage().props;

    useEffect(() => {
        const timer = setTimeout(() => {
            window.print();
        }, 600);
        return () => clearTimeout(timer);
    }, []);

    const monthsHeader = ['JAN', 'FEB', 'MAR', 'APR', 'MEI', 'JUN', 'JUL', 'AGU', 'SEP', 'OKT', 'NOV', 'DES'];

    return (
        <div className="min-h-screen bg-white text-slate-900 font-sans p-4 sm:p-6 print:p-0">
            <Head title={`Matriks_Pendapatan_BLUD_${selected_year}`} />

            <style>{`
                @media print {
                    @page {
                        size: landscape;
                        margin: 8mm;
                    }
                    body {
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                }
            `}</style>

            {/* Print Action Buttons (Hidden on Print) */}
            <div className="mb-4 flex items-center justify-between border-b pb-3 print:hidden">
                <div className="flex items-center gap-2">
                    <span className="inline-block h-3 w-3 rounded-full bg-teal-500 animate-pulse" />
                    <span className="text-xs font-bold text-slate-700">
                        Pratinjau Cetak: Rekapitulasi Realisasi Pendapatan E-BLUD 12 Bulan TA {selected_year}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => window.print()}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-teal-700 transition"
                    >
                        Cetak Dokumen
                    </button>
                    <button
                        type="button"
                        onClick={() => window.close()}
                        className="rounded-lg border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                    >
                        Tutup
                    </button>
                </div>
            </div>

            {/* Official Government Kop Surat */}
            <div className="border-b-4 border-double border-black pb-3 mb-4">
                <div className="flex items-center gap-5">
                    <img
                        src="/images/logo-vertikal-rsj.png"
                        alt="Logo RSJ Tampan"
                        className="h-20 w-auto object-contain shrink-0"
                    />
                    <div className="flex-1 text-center">
                        <h2 className="text-xs font-bold uppercase tracking-wider text-black">
                            Pemerintah Provinsi Riau
                        </h2>
                        <h1 className="text-base font-black uppercase tracking-tight text-black">
                            {system_settings.hospital_name || 'Rumah Sakit Jiwa Tampan'}
                        </h1>
                        <p className="text-[11px] text-black mt-0.5">
                            {system_settings.hospital_address || 'Jl. H.R. Soebrantas Km. 12,5 Pekanbaru - Riau'} &bull; Telp. {system_settings.hospital_phone || '(0761) 63240'}
                        </p>
                        <p className="text-[10px] text-black">
                            Pos-el: {system_settings.hospital_email || 'rsjtampan@riau.go.id'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Document Title */}
            <div className="text-center mb-4">
                <h3 className="text-sm font-black uppercase tracking-wider text-black underline">
                    REKAPITULASI TARGET DAN REALISASI PENDAPATAN BLUD PER BULAN
                </h3>
                <p className="text-xs font-bold text-black mt-0.5">
                    BADAN LAYANAN UMUM DAERAH (BLUD) RS JIWA TAMPAN PROVINSI RIAU
                </p>
                <p className="text-[11px] text-black">
                    Tahun Anggaran {selected_year} (Periode 1 Januari - 31 Desember {selected_year})
                </p>
            </div>

            {/* Matrix Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-[10px] border-collapse border border-black text-black">
                    <thead>
                        <tr className="bg-slate-200 text-center font-bold">
                            <th rowSpan={2} className="border border-black px-1.5 py-1 w-8">No</th>
                            <th rowSpan={2} className="border border-black px-2 py-1 text-left">Uraian Sumber Pendapatan</th>
                            <th rowSpan={2} className="border border-black px-2 py-1 text-right">Target Anggaran (Rp)</th>
                            <th colSpan={12} className="border border-black px-1 py-0.5">Realisasi Bulanan (Rp)</th>
                            <th rowSpan={2} className="border border-black px-2 py-1 text-right">Total Realisasi (Rp)</th>
                            <th rowSpan={2} className="border border-black px-2 py-1 text-right">Sisa Anggaran (Rp)</th>
                            <th rowSpan={2} className="border border-black px-1 py-1 w-12 text-center">%</th>
                        </tr>
                        <tr className="bg-slate-100 text-center font-semibold text-[9px]">
                            {monthsHeader.map((m) => (
                                <th key={m} className="border border-black px-1 py-0.5">{m}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {/* Grand Total Row on Top */}
                        <tr className="bg-slate-200 font-black">
                            <td className="border border-black text-center py-1">4</td>
                            <td className="border border-black px-2 py-1">PENDAPATAN BLUD (TOTAL KESELURUHAN)</td>
                            <td className="border border-black px-1 py-1 text-right">{formatRupiah(grand_total.target_yearly)}</td>
                            {monthsHeader.map((_, idx) => (
                                <td key={idx} className="border border-black px-1 py-1 text-right text-[9px]">
                                    {formatRupiah(grand_total.months?.[idx + 1] || 0)}
                                </td>
                            ))}
                            <td className="border border-black px-1 py-1 text-right">{formatRupiah(grand_total.total_realisasi)}</td>
                            <td className="border border-black px-1 py-1 text-right">{formatSisaAnggaran(grand_total.sisa_anggaran)}</td>
                            <td className="border border-black text-center py-1">{grand_total.persentase}%</td>
                        </tr>

                        {/* Iterate by Category */}
                        {Object.entries(matrix || {}).map(([category, items], catIdx) => {
                            const catTotal = category_totals[category] || {};
                            const catNumber = `4.${catIdx + 1}`;

                            return (
                                <>
                                    {/* Subtotal Category Header Row */}
                                    <tr key={category} className="bg-slate-100 font-bold">
                                        <td className="border border-black text-center py-1">{catNumber}</td>
                                        <td className="border border-black px-2 py-1 uppercase">{category}</td>
                                        <td className="border border-black px-1 py-1 text-right">{formatRupiah(catTotal.target_yearly)}</td>
                                        {monthsHeader.map((_, idx) => (
                                            <td key={idx} className="border border-black px-1 py-1 text-right text-[9px]">
                                                {formatRupiah(catTotal.months?.[idx + 1] || 0)}
                                            </td>
                                        ))}
                                        <td className="border border-black px-1 py-1 text-right">{formatRupiah(catTotal.total_realisasi)}</td>
                                        <td className="border border-black px-1 py-1 text-right">{formatSisaAnggaran(catTotal.sisa_anggaran)}</td>
                                        <td className="border border-black text-center py-1">{catTotal.persentase}%</td>
                                    </tr>

                                    {/* Individual Source Rows */}
                                    {items.map((item, itemIdx) => (
                                        <tr key={item.source_name} className="hover:bg-slate-50">
                                            <td className="border border-black text-center py-0.5">{catNumber}.{itemIdx + 1}</td>
                                            <td className="border border-black px-2 py-0.5 pl-4">{item.source_name}</td>
                                            <td className="border border-black px-1 py-0.5 text-right">{formatRupiah(item.target_yearly)}</td>
                                            {monthsHeader.map((_, idx) => (
                                                <td key={idx} className="border border-black px-1 py-0.5 text-right text-[9px]">
                                                    {item.months?.[idx + 1] ? formatRupiah(item.months[idx + 1]) : '-'}
                                                </td>
                                            ))}
                                            <td className="border border-black px-1 py-0.5 text-right font-semibold">{formatRupiah(item.total_realisasi)}</td>
                                            <td className="border border-black px-1 py-0.5 text-right font-medium">{formatSisaAnggaran(item.sisa_anggaran)}</td>
                                            <td className="border border-black text-center py-0.5">{item.persentase}%</td>
                                        </tr>
                                    ))}
                                </>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Signature Block */}
            <div className="mt-8 grid grid-cols-2 text-center text-xs text-black break-inside-avoid">
                <div>
                    <p className="text-slate-500 text-[10px]">Mengetahui,</p>
                    <p className="font-bold uppercase mt-0.5">Wakil Direktur Keuangan & Umum</p>
                    <div className="h-20" />
                    <p className="font-bold underline uppercase">
                        {system_settings.wadir_keuangan_name || '( .................................................... )'}
                    </p>
                    <p className="text-[10px]">
                        NIP. {system_settings.wadir_keuangan_nip || '........................................'}
                    </p>
                </div>
                <div>
                    <p className="text-slate-500 text-[10px]">Pekanbaru, {printed_at || new Date().toLocaleDateString('id-ID')}</p>
                    <p className="font-bold uppercase mt-0.5">Bendahara Penerimaan BLUD</p>
                    <div className="h-20" />
                    <p className="font-bold underline uppercase">
                        {system_settings.bendahara_penerimaan_name || '( .................................................... )'}
                    </p>
                    <p className="text-[10px]">
                        NIP. {system_settings.bendahara_penerimaan_nip || '........................................'}
                    </p>
                </div>
            </div>
        </div>
    );
}
