import React from 'react';
import { Head } from '@inertiajs/react';

const formatRupiah = (value) => {
    const val = Number(value || 0);
    if (val === 0) return '-';
    return new Intl.NumberFormat('id-ID', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(val);
};

export default function PrintRincianBelanja({
    shift,
    expense_items = [],
    accounts_with_proposed = [],
    selected_year = 2026,
}) {
    const handlePrint = () => {
        window.print();
    };

    // 1. Process active approved items for print
    const withActive = accounts_with_proposed.map((acc) => {
        const rawItems = acc.proposed_items || [];
        const activeItems = rawItems.filter((it) => it.status === 'Disetujui_Selesai' || !it.status);
        const directNominal = activeItems.reduce((s, it) => s + (it.resolved_subtotal || it.subtotal || 0), 0);
        const directCount = activeItems.length;

        return {
            ...acc,
            active_items: activeItems,
            active_total: directNominal,
            active_count: directCount,
        };
    });

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
        };
    });

    // Only show accounts that have items or sub-accounts with items
    const printOperasi = withRollups.filter((a) => a.kategori_belanja === 'Operasi' && a.calc_rollup_count > 0);
    const printModal = withRollups.filter((a) => a.kategori_belanja === 'Modal' && a.calc_rollup_count > 0);

    const totalUsulanOperasi = withActive.filter((a) => a.kategori_belanja === 'Operasi').reduce((s, a) => s + a.active_total, 0);
    const totalUsulanModal = withActive.filter((a) => a.kategori_belanja === 'Modal').reduce((s, a) => s + a.active_total, 0);
    const totalUsulanSemua = totalUsulanOperasi + totalUsulanModal;

    return (
        <>
            <Head title={`Cetak - Rincian Belanja & Usulan Barang T.A. ${selected_year}`} />

            <div className="min-h-screen bg-white text-slate-900 font-sans p-6 print:p-0 text-xs">
                {/* Print Controls Toolbar */}
                <div className="print:hidden mb-6 flex items-center justify-between bg-slate-100 p-4 rounded-2xl border border-slate-200 max-w-7xl mx-auto shadow-xs">
                    <div className="flex items-center gap-3">
                        <a
                            href={route('perencanaan.rba.index', { year: selected_year, shift_id: shift?.id })}
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                            </svg>
                            Kembali ke RBA Perencanaan
                        </a>
                        <span className="text-xs font-semibold text-slate-500">
                            Pratinjau Dokumen Cetak Rincian Belanja & Usulan Kebutuhan Barang T.A. {selected_year}
                        </span>
                    </div>

                    <button
                        type="button"
                        onClick={handlePrint}
                        className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-5 py-2 text-xs font-bold text-white shadow-md transition active:scale-95 cursor-pointer"
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
                    <div className="relative mb-4 text-center border-b-2 border-slate-900 pb-3">
                        <div className="absolute right-0 top-0 hidden sm:block print:block">
                            <img
                                src="/images/logo-vertikal-rsj.png"
                                alt="Logo RSJ Tampan"
                                className="h-14 w-auto object-contain"
                            />
                        </div>

                        <h3 className="font-bold uppercase tracking-wider text-xs">
                            Pemerintah Provinsi Riau
                        </h3>
                        <h2 className="text-base font-black uppercase tracking-wide">
                            Rumah Sakit Jiwa Tampan
                        </h2>
                        <p className="text-[10px] text-slate-600">
                            Jl. H.R. Soebrantas Km. 12,5 Pekanbaru - Riau | Telp: (0761) 63240
                        </p>
                        <div className="mt-2 pt-1 border-t border-slate-300">
                            <h1 className="text-sm font-black uppercase tracking-tight text-slate-900">
                                Rincian Anggaran Belanja & Usulan Kebutuhan Barang / Jasa BLUD
                            </h1>
                            <p className="text-[11px] font-bold text-slate-700">
                                RENCANA BISNIS DAN ANGGARAN (RBA) TAHUN ANGGARAN {selected_year}
                            </p>
                            <p className="text-[10px] text-slate-500 font-medium">
                                Dokumen: {shift?.doc_title || `RBA T.A. ${selected_year}`} &bull; Status: {shift?.status || 'Aktif'} &bull; Periode: {shift?.period_month || 'Tahun Anggaran ' + selected_year}
                            </p>
                        </div>
                    </div>

                    {/* Metadata Box */}
                    <div className="mb-3 flex justify-between text-[11px] font-semibold text-slate-700">
                        <div>
                            <span>Unit Pengelola : <strong>RS Jiwa Tampan Provinsi Riau</strong></span>
                            <span className="mx-2">&bull;</span>
                            <span>Sumber Dana : <strong>100% BLUD</strong></span>
                        </div>
                        <div>
                            <span>Tahun Anggaran Kebutuhan : <strong className="text-emerald-800">T.A. {selected_year}</strong></span>
                        </div>
                    </div>

                    {/* Main Hierarchical Table */}
                    <table className="w-full border-collapse border border-slate-800 text-[10px] leading-tight">
                        <thead>
                            <tr className="bg-slate-200 text-center font-bold text-slate-900">
                                <th className="border border-slate-800 p-1.5 w-24">Kode Rekening</th>
                                <th className="border border-slate-800 p-1.5 text-left">Uraian Akun Belanja & Rincian Barang</th>
                                <th className="border border-slate-800 p-1.5 w-16">Volume</th>
                                <th className="border border-slate-800 p-1.5 w-16">Satuan</th>
                                <th className="border border-slate-800 p-1.5 text-right w-24">Harga Satuan (Rp)</th>
                                <th className="border border-slate-800 p-1.5 text-right w-28">Jumlah (Rp)</th>
                                <th className="border border-slate-800 p-1.5 text-left w-36">Unit Kerja Pengusul</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* ROOT CHAPTER: 1 BELANJA */}
                            <tr className="bg-slate-300 font-bold">
                                <td className="border border-slate-800 p-1.5 text-center font-mono">1</td>
                                <td className="border border-slate-800 p-1.5 uppercase tracking-wider" colSpan={4}>
                                    BELANJA
                                </td>
                                <td className="border border-slate-800 p-1.5 text-right font-mono">
                                    {formatRupiah(totalUsulanSemua)}
                                </td>
                                <td className="border border-slate-800 p-1.5 text-center text-[9px] text-slate-600">
                                    Total Usulan BLUD
                                </td>
                            </tr>

                            {/* SECTION 1.1 BELANJA OPERASI */}
                            <tr className="bg-slate-200/80 font-bold">
                                <td className="border border-slate-800 p-1.5 text-center font-mono">1.1</td>
                                <td className="border border-slate-800 p-1.5 uppercase pl-3" colSpan={4}>
                                    BELANJA OPERASI
                                </td>
                                <td className="border border-slate-800 p-1.5 text-right font-mono">
                                    {formatRupiah(totalUsulanOperasi)}
                                </td>
                                <td className="border border-slate-800 p-1.5 text-center text-[9px] text-slate-600">
                                    Operasional BLUD
                                </td>
                            </tr>

                            {/* Belanja Operasi Accounts & Items */}
                            {printOperasi.map((acc) => {
                                const hasDirectItems = acc.active_items && acc.active_items.length > 0;
                                const isMajorHeader = acc.level === 2; // 1.1.1, 1.1.2
                                const isSubHeader = acc.level === 3;   // 1.1.2.1

                                return (
                                    <React.Fragment key={`pop-${acc.id}`}>
                                        {/* Account Row */}
                                        <tr className={`border-b border-slate-800 ${isMajorHeader ? 'bg-slate-100 font-bold' : isSubHeader ? 'bg-slate-50 font-semibold' : 'bg-white font-medium'}`}>
                                            <td className="border border-slate-800 p-1 text-center font-mono text-[9px]">
                                                {acc.account_code}
                                            </td>
                                            <td
                                                className={`border border-slate-800 p-1 ${
                                                    acc.level === 2 ? 'pl-3' : acc.level === 3 ? 'pl-6' : acc.level === 4 ? 'pl-9' : 'pl-12'
                                                }`}
                                                colSpan={4}
                                            >
                                                <div className="flex items-center gap-1.5">
                                                    {acc.level > 2 && <span className="text-slate-400 font-bold text-[9px]">└</span>}
                                                    <span className={isMajorHeader ? 'uppercase tracking-tight' : ''}>{acc.account_name}</span>
                                                    {acc.active_count > 0 && (
                                                        <span className="text-[8px] font-bold text-slate-500 ml-1.5">
                                                            ({acc.active_count} barang)
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="border border-slate-800 p-1 text-right font-mono text-[9px] font-bold">
                                                {acc.active_total > 0
                                                    ? formatRupiah(acc.active_total)
                                                    : acc.calc_rollup_total > 0
                                                    ? formatRupiah(acc.calc_rollup_total)
                                                    : '-'}
                                            </td>
                                            <td className="border border-slate-800 p-1 text-slate-500 text-[8px]">
                                                Pagu: {formatRupiah(acc.remaining_budget)}
                                            </td>
                                        </tr>

                                        {/* Direct Items under this Account */}
                                        {hasDirectItems && acc.active_items.map((item, idx) => (
                                            <tr key={`pitem-${acc.id}-${item.id || idx}`} className="hover:bg-slate-50">
                                                <td className="border border-slate-800 p-1 text-center text-slate-400 font-mono text-[8px]">
                                                    &bull;
                                                </td>
                                                <td className="border border-slate-800 p-1 pl-12">
                                                    <span className="font-semibold text-slate-800">{item.item_name}</span>
                                                    {item.specification && (
                                                        <span className="text-slate-500 block text-[8px]">
                                                            Spesifikasi: {item.specification}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="border border-slate-800 p-1 text-center font-mono">
                                                    {item.resolved_quantity || item.quantity_approved || item.quantity_requested || 1}
                                                </td>
                                                <td className="border border-slate-800 p-1 text-center text-slate-600">
                                                    {item.unit_type || 'Pcs'}
                                                </td>
                                                <td className="border border-slate-800 p-1 text-right font-mono">
                                                    {formatRupiah(item.unit_price)}
                                                </td>
                                                <td className="border border-slate-800 p-1 text-right font-mono font-bold text-slate-900">
                                                    {formatRupiah(item.resolved_subtotal || item.subtotal)}
                                                </td>
                                                <td className="border border-slate-800 p-1 text-[8px] text-slate-700">
                                                    {item.requisition?.unit?.name || 'Unit RSJ'}
                                                </td>
                                            </tr>
                                        ))}
                                    </React.Fragment>
                                );
                            })}

                            {/* SECTION 1.2 BELANJA MODAL */}
                            <tr className="bg-slate-200/80 font-bold">
                                <td className="border border-slate-800 p-1.5 text-center font-mono">1.2</td>
                                <td className="border border-slate-800 p-1.5 uppercase pl-3" colSpan={4}>
                                    BELANJA MODAL
                                </td>
                                <td className="border border-slate-800 p-1.5 text-right font-mono">
                                    {formatRupiah(totalUsulanModal)}
                                </td>
                                <td className="border border-slate-800 p-1.5 text-center text-[9px] text-slate-600">
                                    Investasi Fisik BLUD
                                </td>
                            </tr>

                            {/* Belanja Modal Accounts & Items */}
                            {printModal.map((acc) => {
                                const hasDirectItems = acc.active_items && acc.active_items.length > 0;
                                const isMajorHeader = acc.level === 2; // 1.2.1
                                const isSubHeader = acc.level === 3;   // 1.2.1.2

                                return (
                                    <React.Fragment key={`pmod-${acc.id}`}>
                                        {/* Account Row */}
                                        <tr className={`border-b border-slate-800 ${isMajorHeader ? 'bg-slate-100 font-bold' : isSubHeader ? 'bg-slate-50 font-semibold' : 'bg-white font-medium'}`}>
                                            <td className="border border-slate-800 p-1 text-center font-mono text-[9px]">
                                                {acc.account_code}
                                            </td>
                                            <td
                                                className={`border border-slate-800 p-1 ${
                                                    acc.level === 2 ? 'pl-3' : acc.level === 3 ? 'pl-6' : acc.level === 4 ? 'pl-9' : 'pl-12'
                                                }`}
                                                colSpan={4}
                                            >
                                                <div className="flex items-center gap-1.5">
                                                    {acc.level > 2 && <span className="text-slate-400 font-bold text-[9px]">└</span>}
                                                    <span className={isMajorHeader ? 'uppercase tracking-tight' : ''}>{acc.account_name}</span>
                                                    {acc.active_count > 0 && (
                                                        <span className="text-[8px] font-bold text-slate-500 ml-1.5">
                                                            ({acc.active_count} barang)
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="border border-slate-800 p-1 text-right font-mono text-[9px] font-bold">
                                                {acc.active_total > 0
                                                    ? formatRupiah(acc.active_total)
                                                    : acc.calc_rollup_total > 0
                                                    ? formatRupiah(acc.calc_rollup_total)
                                                    : '-'}
                                            </td>
                                            <td className="border border-slate-800 p-1 text-slate-500 text-[8px]">
                                                Pagu: {formatRupiah(acc.remaining_budget)}
                                            </td>
                                        </tr>

                                        {/* Direct Items under modal account */}
                                        {hasDirectItems && acc.active_items.map((item, idx) => (
                                            <tr key={`pmitem-${acc.id}-${item.id || idx}`} className="hover:bg-slate-50">
                                                <td className="border border-slate-800 p-1 text-center text-slate-400 font-mono text-[8px]">
                                                    &bull;
                                                </td>
                                                <td className="border border-slate-800 p-1 pl-12">
                                                    <span className="font-semibold text-slate-800">{item.item_name}</span>
                                                    {item.specification && (
                                                        <span className="text-slate-500 block text-[8px]">
                                                            Spesifikasi: {item.specification}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="border border-slate-800 p-1 text-center font-mono">
                                                    {item.resolved_quantity || item.quantity_approved || item.quantity_requested || 1}
                                                </td>
                                                <td className="border border-slate-800 p-1 text-center text-slate-600">
                                                    {item.unit_type || 'Unit'}
                                                </td>
                                                <td className="border border-slate-800 p-1 text-right font-mono">
                                                    {formatRupiah(item.unit_price)}
                                                </td>
                                                <td className="border border-slate-800 p-1 text-right font-mono font-bold text-slate-900">
                                                    {formatRupiah(item.resolved_subtotal || item.subtotal)}
                                                </td>
                                                <td className="border border-slate-800 p-1 text-[8px] text-slate-700">
                                                    {item.requisition?.unit?.name || 'Unit RSJ'}
                                                </td>
                                            </tr>
                                        ))}
                                    </React.Fragment>
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
                            <p className="text-[11px] text-slate-600">Pekanbaru, {shift?.period_month || 'Tahun Anggaran ' + selected_year}</p>
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
