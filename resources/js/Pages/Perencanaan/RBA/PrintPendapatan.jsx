import { Head } from '@inertiajs/react';

const formatRupiah = (value) => {
    const val = Number(value || 0);
    if (val === 0) return '-';
    return new Intl.NumberFormat('id-ID', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(val);
};

export default function PrintPendapatan({ shift, items = [] }) {
    const handlePrint = () => {
        window.print();
    };

    return (
        <>
            <Head title={`Cetak - RBA Pendapatan ${shift?.shift_name || ''} T.A. ${shift?.year || 2026}`} />

            <div className="min-h-screen bg-white text-slate-900 font-sans p-6 print:p-0">
                {/* Print Controls (Hidden on physical print) */}
                <div className="print:hidden mb-6 flex items-center justify-between bg-slate-100 p-4 rounded-2xl border border-slate-200 max-w-5xl mx-auto shadow-xs">
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
                            Pratinjau Dokumen Cetak RBA Anggaran Pendapatan BLUD RS Jiwa Tampan
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
                <div className="max-w-4xl mx-auto text-slate-900 leading-tight">
                    {/* Official Document Header */}
                    <div className="relative mb-5 text-center">
                        <div className="absolute left-0 top-0 hidden sm:block print:block">
                            <img
                                src="/images/logo-vertikal-rsj.png"
                                alt="Logo RSJ Tampan"
                                className="h-12 w-auto object-contain"
                            />
                        </div>

                        <h2 className="text-xs font-bold tracking-wider uppercase text-slate-800">
                            PEMERINTAH PROVINSI RIAU
                        </h2>
                        <h2 className="text-xs font-bold tracking-wider uppercase text-slate-800">
                            BADAN LAYANAN UMUM DAERAH RS JIWA TAMPAN
                        </h2>
                        <h1 className="text-sm font-black tracking-wide uppercase text-black mt-0.5">
                            {shift?.doc_title || `RENCANA BISNIS DAN ANGGARAN ${shift?.shift_name?.toUpperCase()}`}
                        </h1>
                        <h3 className="text-xs font-bold tracking-wider uppercase text-slate-800 mt-0.5">
                            ANGGARAN PENDAPATAN BLUD TAHUN {shift?.year || 2026}
                        </h3>
                    </div>

                    {/* 5-Column Formal Accounting Table */}
                    <table className="w-full border-collapse border border-black text-[10px]">
                        <thead>
                            <tr className="bg-slate-100 text-center font-bold">
                                <th className="border border-black p-1.5 w-12">No</th>
                                <th className="border border-black p-1.5 text-left min-w-[280px]">Uraian</th>
                                <th className="border border-black p-1.5 w-36">
                                    Jumlah (Rp) Sebelum<br />{shift?.shift_name}
                                </th>
                                <th className="border border-black p-1.5 w-36">
                                    Jumlah (Rp) Setelah<br />{shift?.shift_name}
                                </th>
                                <th className="border border-black p-1.5 w-32">
                                    Bertambah /<br />Berkurang
                                </th>
                            </tr>
                            <tr className="bg-slate-50 text-center text-[8.5px] font-semibold">
                                <th className="border border-black p-0.5">1</th>
                                <th className="border border-black p-0.5">2</th>
                                <th className="border border-black p-0.5">3</th>
                                <th className="border border-black p-0.5">4</th>
                                <th className="border border-black p-0.5">5 (4-3)</th>
                            </tr>
                        </thead>

                        <tbody>
                            {items.map((item) => {
                                const isRoot = item.item_code === '0';
                                const isHeader = item.is_header;
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
                                        <td className="border border-black p-1.5 text-center font-mono">
                                            {item.item_code !== '0' ? item.item_code : ''}
                                        </td>
                                        <td
                                            className="border border-black p-1.5"
                                            style={{ paddingLeft: `${(item.level - 1) * 16 + 8}px` }}
                                        >
                                            <span className={isHeader ? 'font-black uppercase' : 'font-medium'}>
                                                {item.item_name}
                                            </span>
                                        </td>
                                        <td className="border border-black p-1.5 text-right font-mono">
                                            {formatRupiah(item.before_amount)}
                                        </td>
                                        <td className="border border-black p-1.5 text-right font-mono">
                                            {formatRupiah(item.after_amount)}
                                        </td>
                                        <td className="border border-black p-1.5 text-right font-mono font-bold">
                                            {diff !== 0 ? formatRupiah(diff) : '-'}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    {/* Official Signature (Direktur Selaku Pimpinan BLUD RS Jiwa Tampan) */}
                    <div className="mt-10 flex justify-end break-inside-avoid">
                        <div className="text-center text-xs w-72">
                            <p className="text-slate-700">Pekanbaru, {shift?.period_month || 'Juli 2026'}</p>
                            <p className="font-bold text-slate-900 mt-1">
                                Direktur Selaku Pimpinan BLUD RS Jiwa Tampan
                            </p>
                            <div className="h-24" />
                            <p className="font-bold underline text-black">
                                dr. Prima Wulandari, M.K.M
                            </p>
                            <p className="text-[11px] text-slate-600">
                                NIP. 19810606 201001 2 041
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
