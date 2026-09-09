import { Head } from '@inertiajs/react';

const formatRupiah = (value) => {
    const val = Number(value || 0);
    if (val === 0) return '-';
    return new Intl.NumberFormat('id-ID', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(val);
};

export default function PrintBelanja({ shift, items = [] }) {
    const handlePrint = () => {
        window.print();
    };

    return (
        <>
            <Head title={`Cetak - RBA Belanja ${shift?.shift_name || ''} T.A. ${shift?.year || 2026}`} />

            <div className="min-h-screen bg-white text-slate-900 font-sans p-6 print:p-0">
                {/* Print Controls (Hidden on paper print) */}
                <div className="print:hidden mb-6 flex items-center justify-between bg-slate-100 p-4 rounded-2xl border border-slate-200 max-w-7xl mx-auto shadow-xs">
                    <div className="flex items-center gap-3">
                        <a
                            href={route('perencanaan.rba.index', { shift_id: shift?.id })}
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                            </svg>
                            Kembali ke Sistem
                        </a>
                        <span className="text-xs font-semibold text-slate-500">
                            Pratinjau Dokumen Cetak Lanskap RBA Belanja RS Jiwa Tampan
                        </span>
                    </div>

                    <button
                        type="button"
                        onClick={handlePrint}
                        className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-5 py-2 text-xs font-bold text-white shadow-md transition active:scale-95"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24-1.077-.32-2.14-.32-3.193 0-5.18 4.02-9.386 8.974-9.386 4.954 0 8.973 4.207 8.973 9.386 0 1.053-.08 2.116-.32 3.193M12 18v-4.5m0 0l-2.25 2.25M12 13.5l2.25 2.25M3.75 19.5h16.5" />
                        </svg>
                        Cetak / Simpan PDF
                    </button>
                </div>

                {/* Printable Document Area */}
                <div className="w-full text-slate-900 leading-tight">
                    {/* Official Document Header */}
                    <div className="relative mb-4 text-center">
                        <div className="absolute right-0 top-0 hidden sm:block print:block">
                            <img
                                src="/images/logo-vertikal-rsj.png"
                                alt="Logo RSJ Tampan"
                                className="h-12 w-auto object-contain"
                            />
                        </div>

                        <h2 className="text-xs font-bold tracking-wider uppercase text-slate-800">
                            BADAN LAYANAN UMUM DAERAH RS JIWA TAMPAN PROVINSI RIAU
                        </h2>
                        <h1 className="text-sm font-black tracking-wide uppercase text-black mt-0.5">
                            {shift?.doc_title || `RENCANA BISNIS DAN ANGGARAN ${shift?.shift_name?.toUpperCase()}`}
                        </h1>
                        <h3 className="text-xs font-bold tracking-wider uppercase text-slate-800 mt-0.5">
                            ANGGARAN BELANJA BLUD TAHUN ANGGARAN {shift?.year || 2026}
                        </h3>
                    </div>

                    {/* 16-Column Formal Accounting Table */}
                    <table className="w-full border-collapse border border-black text-[9px]">
                        <thead>
                            <tr className="bg-slate-100 text-center font-bold">
                                <th rowSpan="3" className="border border-black p-1 w-8">No</th>
                                <th rowSpan="3" className="border border-black p-1 min-w-[160px]">Uraian</th>
                                <th colSpan="6" className="border border-black p-1">
                                    Sumber Dana Sebelum {shift?.shift_name}
                                </th>
                                <th colSpan="6" className="border border-black p-1">
                                    Sumber Dana Setelah {shift?.shift_name}
                                </th>
                                <th rowSpan="3" className="border border-black p-1 w-20">
                                    Bertambah / Berkurang
                                </th>
                                <th rowSpan="3" className="border border-black p-1 min-w-[120px]">
                                    Keterangan
                                </th>
                            </tr>
                            <tr className="bg-slate-100 text-center font-bold">
                                <th colSpan="4" className="border border-black p-0.5">Pendapatan BLUD</th>
                                <th rowSpan="2" className="border border-black p-0.5 w-16">APBD</th>
                                <th rowSpan="2" className="border border-black p-0.5 w-20">Jumlah (Rp)</th>
                                <th colSpan="4" className="border border-black p-0.5">Pendapatan BLUD</th>
                                <th rowSpan="2" className="border border-black p-0.5 w-16">APBD</th>
                                <th rowSpan="2" className="border border-black p-0.5 w-20">Jumlah (Rp)</th>
                            </tr>
                            <tr className="bg-slate-100 text-center font-bold text-[8px]">
                                <th className="border border-black p-0.5 w-16">Jasa Layanan</th>
                                <th className="border border-black p-0.5 w-14">Hasil kerjasama</th>
                                <th className="border border-black p-0.5 w-14">Lain-lain sah</th>
                                <th className="border border-black p-0.5 w-12">SiLPA</th>
                                <th className="border border-black p-0.5 w-16">Jasa Layanan</th>
                                <th className="border border-black p-0.5 w-14">Hasil kerjasama</th>
                                <th className="border border-black p-0.5 w-14">Lain-lain sah</th>
                                <th className="border border-black p-0.5 w-12">SiLPA</th>
                            </tr>
                            <tr className="bg-slate-50 text-center text-[7.5px] font-semibold">
                                <th className="border border-black p-0.5">1</th>
                                <th className="border border-black p-0.5">2</th>
                                <th className="border border-black p-0.5">3</th>
                                <th className="border border-black p-0.5">4</th>
                                <th className="border border-black p-0.5">5</th>
                                <th className="border border-black p-0.5">6</th>
                                <th className="border border-black p-0.5">7</th>
                                <th className="border border-black p-0.5">8=(3+4+5+6+7)</th>
                                <th className="border border-black p-0.5">9</th>
                                <th className="border border-black p-0.5">10</th>
                                <th className="border border-black p-0.5">11</th>
                                <th className="border border-black p-0.5">12</th>
                                <th className="border border-black p-0.5">13</th>
                                <th className="border border-black p-0.5">14=(9+10+11+12+13)</th>
                                <th className="border border-black p-0.5">15 (14-8)</th>
                                <th className="border border-black p-0.5">16</th>
                            </tr>
                        </thead>

                        <tbody>
                            {items.map((item) => {
                                const isHeader = item.is_header;
                                const isRoot = item.level === 1;
                                const diff = Number(item.difference || 0);

                                return (
                                    <tr
                                        key={item.id}
                                        className={
                                            isRoot
                                                ? 'font-black bg-slate-100'
                                                : isHeader
                                                ? 'font-bold bg-slate-50'
                                                : ''
                                        }
                                    >
                                        <td className="border border-black p-1 text-center font-mono">{item.account_code}</td>
                                        <td
                                            className="border border-black p-1"
                                            style={{ paddingLeft: `${(item.level - 1) * 8 + 4}px` }}
                                        >
                                            {item.account_name}
                                        </td>
                                        <td className="border border-black p-1 text-right font-mono">{formatRupiah(item.before_jasa_layanan)}</td>
                                        <td className="border border-black p-1 text-right font-mono">{formatRupiah(item.before_hasil_kerjasama)}</td>
                                        <td className="border border-black p-1 text-right font-mono">{formatRupiah(item.before_lain_lain_sah)}</td>
                                        <td className="border border-black p-1 text-right font-mono">{formatRupiah(item.before_silpa)}</td>
                                        <td className="border border-black p-1 text-right font-mono">{formatRupiah(item.before_apbd)}</td>
                                        <td className="border border-black p-1 text-right font-mono font-bold bg-slate-50/50">{formatRupiah(item.before_total)}</td>

                                        <td className="border border-black p-1 text-right font-mono">{formatRupiah(item.after_jasa_layanan)}</td>
                                        <td className="border border-black p-1 text-right font-mono">{formatRupiah(item.after_hasil_kerjasama)}</td>
                                        <td className="border border-black p-1 text-right font-mono">{formatRupiah(item.after_lain_lain_sah)}</td>
                                        <td className="border border-black p-1 text-right font-mono">{formatRupiah(item.after_silpa)}</td>
                                        <td className="border border-black p-1 text-right font-mono">{formatRupiah(item.after_apbd)}</td>
                                        <td className="border border-black p-1 text-right font-mono font-bold bg-slate-50/50">{formatRupiah(item.after_total)}</td>

                                        <td className="border border-black p-1 text-right font-mono font-bold">
                                            {diff !== 0 ? formatRupiah(diff) : '-'}
                                        </td>
                                        <td className="border border-black p-1 text-[8px] leading-tight">
                                            {item.keterangan || '-'}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    {/* Official Signatures Grid (4 Signers matching PDF) */}
                    <div className="mt-8 grid grid-cols-2 gap-8 text-center text-xs break-inside-avoid">
                        {/* Wadir Medik & Keperawatan */}
                        <div>
                            <p className="font-medium">Wakil Direktur Medik dan Keperawatan</p>
                            <div className="h-20" />
                            <p className="font-bold underline">dr. Elita Sari</p>
                            <p className="text-[11px] text-slate-600">NIP. 19721017 200801 2 010</p>
                        </div>

                        {/* Wadir Umum & Keuangan */}
                        <div>
                            <p className="text-[11px] text-slate-600">Pekanbaru, {shift?.period_month || 'Juli 2026'}</p>
                            <p className="font-medium">Mengetahui</p>
                            <p className="font-medium">Wakil Direktur Umum dan Keuangan</p>
                            <div className="h-16" />
                            <p className="font-bold underline">Ns. Widodo, S.Kep.SH</p>
                            <p className="text-[11px] text-slate-600">NIP. 19741003 199312 1 001</p>
                        </div>

                        {/* Direktur Selaku Pimpinan BLUD */}
                        <div>
                            <p className="font-medium">Disetujui</p>
                            <p className="font-medium">Direktur Selaku Pimpinan BLUD RS Jiwa Tampan</p>
                            <div className="h-20" />
                            <p className="font-bold underline">dr. Prima Wulandari, M.K.M</p>
                            <p className="text-[11px] text-slate-600">NIP. 19810606 201001 2 041</p>
                        </div>

                        {/* Kepala Bagian Perencanaan */}
                        <div>
                            <p className="font-medium">Diperiksa Oleh :</p>
                            <p className="font-medium">Kepala Bagian Perencanaan</p>
                            <div className="h-20" />
                            <p className="font-bold underline">Hawari Dinal, S.Sos.M.Si</p>
                            <p className="text-[11px] text-slate-600">NIP. 19700211 199703 1 005</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
