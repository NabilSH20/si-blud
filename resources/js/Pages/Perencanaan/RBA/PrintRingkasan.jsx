import { Head } from '@inertiajs/react';

const formatRupiah = (value) => {
    const val = Number(value || 0);
    if (val === 0) return '-';
    if (val < 0) {
        return `(${new Intl.NumberFormat('id-ID', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(Math.abs(val))})`;
    }
    return new Intl.NumberFormat('id-ID', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(val);
};

export default function PrintRingkasan({ shift, ringkasan = {} }) {
    const handlePrint = () => {
        window.print();
    };

    const p = ringkasan.pendapatan || {};
    const b = ringkasan.belanja || {};
    const sd = ringkasan.surplus_defisit || {};
    const c = ringkasan.pembiayaan || {};

    return (
        <>
            <Head title={`Cetak - Ringkasan RBA ${shift?.shift_name || ''} T.A. ${shift?.year || 2026}`} />

            <div className="min-h-screen bg-white text-slate-900 font-sans p-6 print:p-0">
                {/* Print Controls (Hidden on paper) */}
                <div className="print:hidden mb-6 flex items-center justify-between bg-slate-100 p-4 rounded-2xl border border-slate-200 max-w-4xl mx-auto shadow-xs">
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
                            Pratinjau Dokumen Cetak Ringkasan RBA & Surplus/Defisit
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

                {ringkasan.data_incomplete && (
                    <div className="print:hidden max-w-4xl mx-auto mb-4 p-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 text-sm">
                        <strong className="font-bold">⚠️ Peringatan: Data Belum Lengkap!</strong><br />
                        Terdapat kode akun wajib yang belum di-mapping di versi RBA ini (Akun hilang: {ringkasan.missing_accounts?.join(', ')}). 
                        Angka yang ditampilkan mungkin tidak akurat (0). Harap lengkapi RBA sebelum mencetak dokumen resmi.
                    </div>
                )}

                {/* Printable Document Area */}
                <div className="max-w-4xl mx-auto text-slate-900 leading-tight relative">
                    {ringkasan.data_incomplete && (
                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-10 z-0">
                            <span className="text-[150px] font-black uppercase text-rose-600 rotate-[-45deg] whitespace-nowrap">
                                DATA TIDAK LENGKAP
                            </span>
                        </div>
                    )}
                    {/* Official Document Header with Logo */}
                    <div className="relative mb-5 text-center">
                        <div className="absolute left-0 top-0 hidden sm:block print:block">
                            <img
                                src="/images/logo-vertikal-rsj.png"
                                alt="Logo RSJ Tampan"
                                className="h-14 w-auto object-contain"
                            />
                        </div>

                        <h2 className="text-xs font-bold tracking-wider uppercase text-slate-800">
                            BADAN LAYANAN UMUM DAERAH RS JIWA TAMPAN PROVINSI RIAU
                        </h2>
                        <h1 className="text-sm font-black tracking-wide uppercase text-black mt-0.5">
                            RINGKASAN {shift?.doc_title || `RENCANA BISNIS DAN ANGGARAN ${shift?.shift_name?.toUpperCase()}`}
                        </h1>
                        <h3 className="text-xs font-bold tracking-wider uppercase text-slate-800 mt-0.5">
                            PENDAPATAN, BELANJA DAN PEMBIAYAAN TAHUN ANGGARAN {shift?.year || 2026}
                        </h3>
                    </div>

                    {/* 5-Column Formal Accounting Table */}
                    <table className="w-full border-collapse border border-black text-[10.5px]">
                        <thead>
                            <tr className="bg-slate-100 text-center font-bold">
                                <th className="border border-black p-1.5 w-10">No</th>
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
                            {/* SECTION A: PENDAPATAN */}
                            <tr className="font-black bg-slate-100">
                                <td className="border border-black p-1.5 text-center">A</td>
                                <td className="border border-black p-1.5 uppercase">PENDAPATAN</td>
                                <td className="border border-black p-1.5 text-right font-mono"></td>
                                <td className="border border-black p-1.5 text-right font-mono"></td>
                                <td className="border border-black p-1.5 text-right font-mono"></td>
                            </tr>
                            <tr>
                                <td className="border border-black p-1 text-center"></td>
                                <td className="border border-black p-1 pl-5">Jasa Layanan</td>
                                <td className="border border-black p-1 text-right font-mono">{formatRupiah(p.jasa_layanan?.before)}</td>
                                <td className="border border-black p-1 text-right font-mono">{formatRupiah(p.jasa_layanan?.after)}</td>
                                <td className="border border-black p-1 text-right font-mono">{formatRupiah(p.jasa_layanan?.diff)}</td>
                            </tr>
                            <tr>
                                <td className="border border-black p-1 text-center"></td>
                                <td className="border border-black p-1 pl-5">Hibah</td>
                                <td className="border border-black p-1 text-right font-mono">-</td>
                                <td className="border border-black p-1 text-right font-mono">-</td>
                                <td className="border border-black p-1 text-right font-mono">-</td>
                            </tr>
                            <tr>
                                <td className="border border-black p-1 text-center"></td>
                                <td className="border border-black p-1 pl-5">Hasil Kerja Sama</td>
                                <td className="border border-black p-1 text-right font-mono">{formatRupiah(p.hasil_kerjasama?.before)}</td>
                                <td className="border border-black p-1 text-right font-mono">{formatRupiah(p.hasil_kerjasama?.after)}</td>
                                <td className="border border-black p-1 text-right font-mono">{formatRupiah(p.hasil_kerjasama?.diff)}</td>
                            </tr>
                            <tr>
                                <td className="border border-black p-1 text-center"></td>
                                <td className="border border-black p-1 pl-5">APBD</td>
                                <td className="border border-black p-1 text-right font-mono">{formatRupiah(p.apbd?.before)}</td>
                                <td className="border border-black p-1 text-right font-mono">{formatRupiah(p.apbd?.after)}</td>
                                <td className="border border-black p-1 text-right font-mono">{formatRupiah(p.apbd?.diff)}</td>
                            </tr>
                            <tr>
                                <td className="border border-black p-1 text-center"></td>
                                <td className="border border-black p-1 pl-5">Lain-lain pendapatan BLUD yang sah</td>
                                <td className="border border-black p-1 text-right font-mono">{formatRupiah(p.lain_lain_sah?.before)}</td>
                                <td className="border border-black p-1 text-right font-mono">{formatRupiah(p.lain_lain_sah?.after)}</td>
                                <td className="border border-black p-1 text-right font-mono">{formatRupiah(p.lain_lain_sah?.diff)}</td>
                            </tr>
                            <tr className="font-bold bg-slate-50">
                                <td className="border border-black p-1.5 text-center"></td>
                                <td className="border border-black p-1.5 pl-8 text-right uppercase">Jumlah Pendapatan</td>
                                <td className="border border-black p-1.5 text-right font-mono">{formatRupiah(p.total?.before)}</td>
                                <td className="border border-black p-1.5 text-right font-mono">{formatRupiah(p.total?.after)}</td>
                                <td className="border border-black p-1.5 text-right font-mono">{formatRupiah(p.total?.diff)}</td>
                            </tr>

                            {/* SECTION B: BELANJA */}
                            <tr className="font-black bg-slate-100">
                                <td className="border border-black p-1.5 text-center">B</td>
                                <td className="border border-black p-1.5 uppercase">BELANJA</td>
                                <td className="border border-black p-1.5 text-right font-mono"></td>
                                <td className="border border-black p-1.5 text-right font-mono"></td>
                                <td className="border border-black p-1.5 text-right font-mono"></td>
                            </tr>
                            <tr className="font-bold">
                                <td className="border border-black p-1 text-center"></td>
                                <td className="border border-black p-1 pl-4 uppercase">BELANJA APBD</td>
                                <td className="border border-black p-1 text-right font-mono">{formatRupiah(b.apbd?.before)}</td>
                                <td className="border border-black p-1 text-right font-mono">{formatRupiah(b.apbd?.after)}</td>
                                <td className="border border-black p-1 text-right font-mono">{formatRupiah(b.apbd?.diff)}</td>
                            </tr>
                            <tr className="font-bold">
                                <td className="border border-black p-1 text-center"></td>
                                <td className="border border-black p-1 pl-4 uppercase">BELANJA OPERASI BLUD</td>
                                <td className="border border-black p-1 text-right font-mono">{formatRupiah(b.operasi_blud?.before)}</td>
                                <td className="border border-black p-1 text-right font-mono">{formatRupiah(b.operasi_blud?.after)}</td>
                                <td className="border border-black p-1 text-right font-mono">{formatRupiah(b.operasi_blud?.diff)}</td>
                            </tr>
                            <tr>
                                <td className="border border-black p-1 text-center"></td>
                                <td className="border border-black p-1 pl-8">Belanja Pegawai</td>
                                <td className="border border-black p-1 text-right font-mono">-</td>
                                <td className="border border-black p-1 text-right font-mono">-</td>
                                <td className="border border-black p-1 text-right font-mono">-</td>
                            </tr>
                            <tr>
                                <td className="border border-black p-1 text-center"></td>
                                <td className="border border-black p-1 pl-8">Belanja Barang dan Jasa</td>
                                <td className="border border-black p-1 text-right font-mono">{formatRupiah(b.barang_jasa_blud?.before)}</td>
                                <td className="border border-black p-1 text-right font-mono">{formatRupiah(b.barang_jasa_blud?.after)}</td>
                                <td className="border border-black p-1 text-right font-mono">{formatRupiah(b.barang_jasa_blud?.diff)}</td>
                            </tr>
                            <tr>
                                <td className="border border-black p-1 text-center"></td>
                                <td className="border border-black p-1 pl-8">Belanja Bunga</td>
                                <td className="border border-black p-1 text-right font-mono">-</td>
                                <td className="border border-black p-1 text-right font-mono">-</td>
                                <td className="border border-black p-1 text-right font-mono">-</td>
                            </tr>
                            <tr>
                                <td className="border border-black p-1 text-center"></td>
                                <td className="border border-black p-1 pl-8">Belanja Lain-lain</td>
                                <td className="border border-black p-1 text-right font-mono">-</td>
                                <td className="border border-black p-1 text-right font-mono">-</td>
                                <td className="border border-black p-1 text-right font-mono">-</td>
                            </tr>

                            <tr className="font-bold">
                                <td className="border border-black p-1 text-center"></td>
                                <td className="border border-black p-1 pl-4 uppercase">BELANJA MODAL BLUD</td>
                                <td className="border border-black p-1 text-right font-mono">{formatRupiah(b.modal_blud?.before)}</td>
                                <td className="border border-black p-1 text-right font-mono">{formatRupiah(b.modal_blud?.after)}</td>
                                <td className="border border-black p-1 text-right font-mono">{formatRupiah(b.modal_blud?.diff)}</td>
                            </tr>
                            <tr>
                                <td className="border border-black p-1 text-center"></td>
                                <td className="border border-black p-1 pl-8">Belanja Tanah</td>
                                <td className="border border-black p-1 text-right font-mono">-</td>
                                <td className="border border-black p-1 text-right font-mono">-</td>
                                <td className="border border-black p-1 text-right font-mono">-</td>
                            </tr>
                            <tr>
                                <td className="border border-black p-1 text-center"></td>
                                <td className="border border-black p-1 pl-8">Belanja Peralatan dan mesin</td>
                                <td className="border border-black p-1 text-right font-mono">{formatRupiah(b.peralatan_mesin?.before)}</td>
                                <td className="border border-black p-1 text-right font-mono">{formatRupiah(b.peralatan_mesin?.after)}</td>
                                <td className="border border-black p-1 text-right font-mono">{formatRupiah(b.peralatan_mesin?.diff)}</td>
                            </tr>
                            <tr>
                                <td className="border border-black p-1 text-center"></td>
                                <td className="border border-black p-1 pl-8">Belanja Gedung dan Bangunan</td>
                                <td className="border border-black p-1 text-right font-mono">{formatRupiah(b.gedung_bangunan?.before)}</td>
                                <td className="border border-black p-1 text-right font-mono">{formatRupiah(b.gedung_bangunan?.after)}</td>
                                <td className="border border-black p-1 text-right font-mono">{formatRupiah(b.gedung_bangunan?.diff)}</td>
                            </tr>
                            <tr>
                                <td className="border border-black p-1 text-center"></td>
                                <td className="border border-black p-1 pl-8">Belanja Jalan, Irigasi dan Jaringan</td>
                                <td className="border border-black p-1 text-right font-mono">-</td>
                                <td className="border border-black p-1 text-right font-mono">-</td>
                                <td className="border border-black p-1 text-right font-mono">-</td>
                            </tr>
                            <tr>
                                <td className="border border-black p-1 text-center"></td>
                                <td className="border border-black p-1 pl-8">Belanja Aset Tetap Lainnya</td>
                                <td className="border border-black p-1 text-right font-mono">-</td>
                                <td className="border border-black p-1 text-right font-mono">-</td>
                                <td className="border border-black p-1 text-right font-mono">-</td>
                            </tr>
                            <tr>
                                <td className="border border-black p-1 text-center"></td>
                                <td className="border border-black p-1 pl-8">Belanja Aset Lainnya</td>
                                <td className="border border-black p-1 text-right font-mono">-</td>
                                <td className="border border-black p-1 text-right font-mono">-</td>
                                <td className="border border-black p-1 text-right font-mono">-</td>
                            </tr>
                            <tr className="font-bold bg-slate-50">
                                <td className="border border-black p-1.5 text-center"></td>
                                <td className="border border-black p-1.5 pl-8 text-right uppercase">Jumlah Belanja</td>
                                <td className="border border-black p-1.5 text-right font-mono">{formatRupiah(b.total?.before)}</td>
                                <td className="border border-black p-1.5 text-right font-mono">{formatRupiah(b.total?.after)}</td>
                                <td className="border border-black p-1.5 text-right font-mono">{formatRupiah(b.total?.diff)}</td>
                            </tr>

                            {/* SURPLUS / DEFISIT */}
                            <tr className="font-black bg-emerald-50">
                                <td className="border border-black p-2 text-center"></td>
                                <td className="border border-black p-2 pl-4 uppercase font-black text-emerald-950">
                                    Surplus / (Defisit)
                                </td>
                                <td className="border border-black p-2 text-right font-mono font-black">
                                    {formatRupiah(sd.before)}
                                </td>
                                <td className="border border-black p-2 text-right font-mono font-black text-emerald-800">
                                    {formatRupiah(sd.after)}
                                </td>
                                <td className="border border-black p-2 text-right font-mono font-black text-emerald-800">
                                    {formatRupiah(sd.diff)}
                                </td>
                            </tr>

                            {/* SECTION C: PEMBIAYAAN */}
                            <tr className="font-black bg-slate-100">
                                <td className="border border-black p-1.5 text-center">C</td>
                                <td className="border border-black p-1.5 uppercase">PEMBIAYAAN</td>
                                <td className="border border-black p-1.5 text-right font-mono"></td>
                                <td className="border border-black p-1.5 text-right font-mono"></td>
                                <td className="border border-black p-1.5 text-right font-mono"></td>
                            </tr>
                            <tr className="font-bold">
                                <td className="border border-black p-1 text-center"></td>
                                <td className="border border-black p-1 pl-4 uppercase">PENERIMAAN DAERAH</td>
                                <td className="border border-black p-1 text-right font-mono"></td>
                                <td className="border border-black p-1 text-right font-mono"></td>
                                <td className="border border-black p-1 text-right font-mono"></td>
                            </tr>
                            <tr>
                                <td className="border border-black p-1 text-center"></td>
                                <td className="border border-black p-1 pl-8">
                                    Penggunaan Sisa Lebih Perhitungan Anggaran Tahun Sebelumnya (SiLPA)
                                </td>
                                <td className="border border-black p-1 text-right font-mono">-</td>
                                <td className="border border-black p-1 text-right font-mono">{formatRupiah(c.silpa_sebelumnya)}</td>
                                <td className="border border-black p-1 text-right font-mono">{formatRupiah(c.silpa_sebelumnya)}</td>
                            </tr>
                            <tr>
                                <td className="border border-black p-1 text-center"></td>
                                <td className="border border-black p-1 pl-8">Divestasi</td>
                                <td className="border border-black p-1 text-right font-mono">-</td>
                                <td className="border border-black p-1 text-right font-mono">{formatRupiah(c.divestasi)}</td>
                                <td className="border border-black p-1 text-right font-mono">{formatRupiah(c.divestasi)}</td>
                            </tr>
                            <tr>
                                <td className="border border-black p-1 text-center"></td>
                                <td className="border border-black p-1 pl-8">Penerimaan Utang/Pinjaman</td>
                                <td className="border border-black p-1 text-right font-mono">-</td>
                                <td className="border border-black p-1 text-right font-mono">{formatRupiah(c.pinjaman)}</td>
                                <td className="border border-black p-1 text-right font-mono">{formatRupiah(c.pinjaman)}</td>
                            </tr>
                            <tr className="font-bold bg-slate-50">
                                <td className="border border-black p-1 text-center"></td>
                                <td className="border border-black p-1 pl-8 text-right uppercase">Jumlah Penerimaan Pembiayaan</td>
                                <td className="border border-black p-1 text-right font-mono">-</td>
                                <td className="border border-black p-1 text-right font-mono">{formatRupiah(c.total_penerimaan)}</td>
                                <td className="border border-black p-1 text-right font-mono">{formatRupiah(c.total_penerimaan)}</td>
                            </tr>

                            {/* SECTION D: PENGELUARAN PEMBIAYAAN */}
                            <tr className="font-black bg-slate-100">
                                <td className="border border-black p-1.5 text-center">D</td>
                                <td className="border border-black p-1.5 uppercase">PENGELUARAN PEMBIAYAAN</td>
                                <td className="border border-black p-1.5 text-right font-mono"></td>
                                <td className="border border-black p-1.5 text-right font-mono"></td>
                                <td className="border border-black p-1.5 text-right font-mono"></td>
                            </tr>
                            <tr>
                                <td className="border border-black p-1 text-center"></td>
                                <td className="border border-black p-1 pl-8">Investasi</td>
                                <td className="border border-black p-1 text-right font-mono">-</td>
                                <td className="border border-black p-1 text-right font-mono">{formatRupiah(c.investasi)}</td>
                                <td className="border border-black p-1 text-right font-mono">{formatRupiah(c.investasi)}</td>
                            </tr>
                            <tr>
                                <td className="border border-black p-1 text-center"></td>
                                <td className="border border-black p-1 pl-8">Pembayaran Pokok Utang/Pinjaman</td>
                                <td className="border border-black p-1 text-right font-mono">-</td>
                                <td className="border border-black p-1 text-right font-mono">{formatRupiah(c.pokok_utang)}</td>
                                <td className="border border-black p-1 text-right font-mono">{formatRupiah(c.pokok_utang)}</td>
                            </tr>
                            <tr className="font-bold bg-slate-50">
                                <td className="border border-black p-1 text-center"></td>
                                <td className="border border-black p-1 pl-8 text-right uppercase">Jumlah Pengeluaran Pembiayaan</td>
                                <td className="border border-black p-1 text-right font-mono">-</td>
                                <td className="border border-black p-1 text-right font-mono">{formatRupiah(c.total_pengeluaran)}</td>
                                <td className="border border-black p-1 text-right font-mono">{formatRupiah(c.total_pengeluaran)}</td>
                            </tr>

                            {/* PEMBIAYAAN NETTO & SILPA */}
                            <tr className="font-bold">
                                <td className="border border-black p-1 text-center"></td>
                                <td className="border border-black p-1 pl-4 uppercase font-black">Pembiayaan Netto</td>
                                <td className="border border-black p-1 text-right font-mono">-</td>
                                <td className="border border-black p-1 text-right font-mono font-bold">{formatRupiah(c.netto)}</td>
                                <td className="border border-black p-1 text-right font-mono font-bold">{formatRupiah(c.netto)}</td>
                            </tr>
                            <tr className="font-black bg-emerald-50 text-[11px]">
                                <td className="border border-black p-2 text-center"></td>
                                <td className="border border-black p-2 pl-4 uppercase font-black text-emerald-950">
                                    Sisa Lebih Pembiayaan Anggaran Tahun Berkenaan (SiLPA)
                                </td>
                                <td className="border border-black p-2 text-right font-mono font-black">-</td>
                                <td className="border border-black p-2 text-right font-mono font-black text-emerald-800">
                                    {formatRupiah(c.silpa_tahun_berkenaan)}
                                </td>
                                <td className="border border-black p-2 text-right font-mono font-black text-emerald-800">
                                    {formatRupiah(c.silpa_tahun_berkenaan)}
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    {/* Official Signature (Direktur Selaku Pimpinan BLUD RS Jiwa Tampan) */}
                    <div className="mt-8 flex justify-end break-inside-avoid">
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
