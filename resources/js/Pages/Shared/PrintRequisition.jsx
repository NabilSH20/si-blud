import { Head } from '@inertiajs/react';
import React, { useState } from 'react';

const formatNumber = (value) =>
    new Intl.NumberFormat('id-ID', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(Number(value || 0));

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

export default function PrintRequisition({ requisition }) {
    const [activeFormat, setActiveFormat] = useState('resmi'); // 'resmi' (PDF Lab RS) | 'notadinas'
    const [showSignerConfig, setShowSignerConfig] = useState(false);

    const details = requisition.requisition_details || requisition.requisitionDetails || [];
    const verifikatorPerencanaan = requisition.verified_by_perencanaan || requisition.verifiedByPerencanaan;
    const verifikatorKeuangan = requisition.approved_by_keuangan || requisition.approvedByKeuangan;

    const unitName = requisition.unit?.name || 'Instalasi Laboratorium';
    const divisionName = requisition.division?.name || 'Bidang Penunjang Medik & Diklit';
    const isLab = unitName.toLowerCase().includes('lab') || divisionName.toLowerCase().includes('lab');

    // Smart default signatories from official document
    const [signerUnitName, setSignerUnitName] = useState(
        requisition.user?.name || (isLab ? 'dr. RICCA FITRIA, SpPK' : 'Kepala Unit Kerja')
    );
    const [signerUnitNip, setSignerUnitNip] = useState(
        requisition.user?.nip || (isLab ? '19830712 200903 2007' : '....................................')
    );
    const [signerUnitTitle, setSignerUnitTitle] = useState(
        requisition.unit?.name ? `Ka. ${requisition.unit.name}` : 'Ka. Instalasi Laboratorium'
    );

    const [signerBidangName, setSignerBidangName] = useState(
        divisionName.includes('Penunjang') || isLab ? 'ARIEF RAKHMAN, SE.MM.Ak' : 'Kepala Bidang'
    );
    const [signerBidangNip, setSignerBidangNip] = useState(
        divisionName.includes('Penunjang') || isLab ? '19780821 200903 1 002' : '....................................'
    );
    const [signerBidangTitle, setSignerBidangTitle] = useState(
        requisition.division?.name ? `Ka. ${requisition.division.name}` : 'Ka. Bidang Penunjang Medik dan Diklit'
    );

    const [signerWadirName, setSignerWadirName] = useState('dr. ELITA SARI');
    const [signerWadirRank, setSignerWadirRank] = useState('Pembina TK I');
    const [signerWadirNip, setSignerWadirNip] = useState('19721017 200801 2 010');
    const [signerWadirTitle, setSignerWadirTitle] = useState('Wakil Direktur Medik dan Keperawatan');

    const grandTotal = details.reduce((acc, item) => {
        const qty = Number(item.quantity_approved ?? item.quantity_requested ?? 0);
        const price = Number(item.unit_price || 0);
        return acc + qty * price;
    }, 0);

    const opDetails = details.filter((d) => (d.jenis_belanja || requisition.jenis_belanja || 'Operasi') !== 'Modal');
    const modDetails = details.filter((d) => d.jenis_belanja === 'Modal' || (!d.jenis_belanja && requisition.jenis_belanja === 'Modal'));

    const opTotal = opDetails.reduce((acc, item) => {
        const qty = Number(item.quantity_approved ?? item.quantity_requested ?? 0);
        const price = Number(item.unit_price || 0);
        return acc + qty * price;
    }, 0);

    const modTotal = modDetails.reduce((acc, item) => {
        const qty = Number(item.quantity_approved ?? item.quantity_requested ?? 0);
        const price = Number(item.unit_price || 0);
        return acc + qty * price;
    }, 0);

    const activeYear = requisition.budget_year || requisition.fiscal_year || 2026;
    const programText = requisition.program || 'Program Peningkatan Pelayanan Kesehatan Pada BLUD';
    const kegiatanText = requisition.kegiatan || '1. Pelayanan Kesehatan';
    const subKegiatanText = requisition.sub_kegiatan || `PELAYANAN ${unitName.toUpperCase()} ${activeYear}`;
    const tolokUkurOutputText = requisition.tolok_ukur_output;
    const targetOutputText = requisition.target_output || '100%';
    const tolokUkurOutcomeText = requisition.tolok_ukur_outcome;
    const targetOutcomeText = requisition.target_outcome || '100%';

    const groupDetailsByAccount = (itemList, defaultAcc, fallbackLabel) => {
        const groups = new Map();
        itemList.forEach((item) => {
            const acc = item.rba_account || item.rbaAccount || defaultAcc;
            const key = acc?.id || acc?.account_code || 'default';
            if (!groups.has(key)) {
                groups.set(key, {
                    account: acc,
                    items: [],
                    total: 0,
                });
            }
            const g = groups.get(key);
            const qty = Number(item.quantity_approved ?? item.quantity_requested ?? 1);
            const price = Number(item.unit_price || 0);
            g.items.push(item);
            g.total += qty * price;
        });
        return Array.from(groups.values());
    };

    return (
        <div className="bg-white text-black min-h-screen p-6 sm:p-8 max-w-5xl mx-auto font-sans print:p-0 print:max-w-none">
            <Head title={`Cetak - ${requisition.requisition_number}`} />

            {/* Print Action Bar (Hidden during Print) */}
            <div className="print:hidden bg-slate-100 p-4 rounded-2xl mb-6 border border-slate-200 shadow-xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-800">
                            Pratinjau Dokumen Usulan Belanja E-BLUD (TA {activeYear})
                        </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setShowSignerConfig(!showSignerConfig)}
                            className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer"
                        >
                            ⚙️ Sesuaikan Penandatangan
                        </button>
                        <button
                            type="button"
                            onClick={() => window.history.back()}
                            className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer"
                        >
                            Kembali
                        </button>
                        <button
                            type="button"
                            onClick={() => window.print()}
                            className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-4 py-1.5 rounded-xl text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24-1.077-.32-2.14-.32-3.193 0-5.18 4.02-9.386 8.974-9.386 4.954 0 8.973 4.207 8.973 9.386 0 1.053-.08 2.116-.32 3.193M12 18v-4.5m0 0l-2.25 2.25M12 13.5l2.25 2.25M3.75 19.5h16.5" />
                            </svg>
                            <span>Cetak Dokumen / Simpan PDF</span>
                        </button>
                    </div>
                </div>

                {/* Switcher Format Cetak */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                    <span className="text-xs font-bold text-slate-600 mr-1">Pilihan Format Dokumen:</span>
                    <button
                        type="button"
                        onClick={() => setActiveFormat('resmi')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                            activeFormat === 'resmi'
                                ? 'bg-teal-600 text-white shadow-2xs'
                                : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
                        }`}
                    >
                        📄 Format 1: Rincian Anggaran Kebutuhan Unit (Sesuai Dokumen Resmi RS)
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveFormat('notadinas')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                            activeFormat === 'notadinas'
                                ? 'bg-teal-600 text-white shadow-2xs'
                                : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
                        }`}
                    >
                        📋 Format 2: Nota Dinas & Lembar Verifikasi E-BLUD
                    </button>
                </div>

                {/* Signer Config Accordion */}
                {showSignerConfig && (
                    <div className="p-4 bg-white rounded-xl border border-slate-200 mt-2 space-y-3 text-xs">
                        <p className="font-bold text-slate-800">Ubah Data Pejabat Penandatangan Dokumen:</p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="space-y-1.5 p-2.5 rounded-lg border border-slate-200 bg-slate-50/50">
                                <span className="font-bold text-slate-700 block">1. Kepala Instalasi / Ruangan</span>
                                <input
                                    type="text"
                                    value={signerUnitTitle}
                                    onChange={(e) => setSignerUnitTitle(e.target.value)}
                                    placeholder="Jabatan"
                                    className="w-full text-xs py-1 px-2 border rounded"
                                />
                                <input
                                    type="text"
                                    value={signerUnitName}
                                    onChange={(e) => setSignerUnitName(e.target.value)}
                                    placeholder="Nama Lengkap"
                                    className="w-full text-xs py-1 px-2 border rounded font-semibold"
                                />
                                <input
                                    type="text"
                                    value={signerUnitNip}
                                    onChange={(e) => setSignerUnitNip(e.target.value)}
                                    placeholder="NIP"
                                    className="w-full text-xs py-1 px-2 border rounded"
                                />
                            </div>

                            <div className="space-y-1.5 p-2.5 rounded-lg border border-slate-200 bg-slate-50/50">
                                <span className="font-bold text-slate-700 block">2. Kepala Bidang Induk</span>
                                <input
                                    type="text"
                                    value={signerBidangTitle}
                                    onChange={(e) => setSignerBidangTitle(e.target.value)}
                                    placeholder="Jabatan Bidang"
                                    className="w-full text-xs py-1 px-2 border rounded"
                                />
                                <input
                                    type="text"
                                    value={signerBidangName}
                                    onChange={(e) => setSignerBidangName(e.target.value)}
                                    placeholder="Nama Lengkap"
                                    className="w-full text-xs py-1 px-2 border rounded font-semibold"
                                />
                                <input
                                    type="text"
                                    value={signerBidangNip}
                                    onChange={(e) => setSignerBidangNip(e.target.value)}
                                    placeholder="NIP"
                                    className="w-full text-xs py-1 px-2 border rounded"
                                />
                            </div>

                            <div className="space-y-1.5 p-2.5 rounded-lg border border-slate-200 bg-slate-50/50">
                                <span className="font-bold text-slate-700 block">3. Wakil Direktur</span>
                                <input
                                    type="text"
                                    value={signerWadirTitle}
                                    onChange={(e) => setSignerWadirTitle(e.target.value)}
                                    placeholder="Jabatan Wadir"
                                    className="w-full text-xs py-1 px-2 border rounded"
                                />
                                <input
                                    type="text"
                                    value={signerWadirName}
                                    onChange={(e) => setSignerWadirName(e.target.value)}
                                    placeholder="Nama Lengkap"
                                    className="w-full text-xs py-1 px-2 border rounded font-semibold"
                                />
                                <div className="grid grid-cols-2 gap-1">
                                    <input
                                        type="text"
                                        value={signerWadirRank}
                                        onChange={(e) => setSignerWadirRank(e.target.value)}
                                        placeholder="Pangkat/Gol"
                                        className="w-full text-xs py-1 px-2 border rounded"
                                    />
                                    <input
                                        type="text"
                                        value={signerWadirNip}
                                        onChange={(e) => setSignerWadirNip(e.target.value)}
                                        placeholder="NIP"
                                        className="w-full text-xs py-1 px-2 border rounded"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ========================================================================= */}
            {/* FORMAT 1: RINCIAN ANGGARAN KEBUTUHAN UNIT (PERSIS PDF RESMI LABORATORIUM) */}
            {/* ========================================================================= */}
            {activeFormat === 'resmi' && (
                <div className="document-container text-black text-[12px] leading-tight">
                    {/* Header Program / Kegiatan / Sub Kegiatan Table */}
                    <table className="w-full border-collapse border border-black text-[11px] mb-0">
                        <tbody>
                            <tr>
                                <td className="border border-black p-1.5 font-bold w-36 bg-gray-50 print:bg-transparent">
                                    PROGRAM
                                </td>
                                <td className="border border-black p-1.5" colSpan={2}>
                                    : {programText}
                                </td>
                            </tr>
                            <tr>
                                <td className="border border-black p-1.5 font-bold bg-gray-50 print:bg-transparent">
                                    KEGIATAN
                                </td>
                                <td className="border border-black p-1.5" colSpan={2}>
                                    : {kegiatanText}
                                </td>
                            </tr>
                            <tr>
                                <td className="border border-black p-1.5 font-bold bg-gray-50 print:bg-transparent">
                                    Sub Kegiatan
                                </td>
                                <td className="border border-black p-1.5 font-bold uppercase text-slate-900" colSpan={2}>
                                    : {subKegiatanText}
                                </td>
                            </tr>
                            <tr className="bg-yellow-200 print:bg-yellow-200 font-bold text-center">
                                <td className="border border-black p-1 uppercase w-36">INDIKATOR</td>
                                <td className="border border-black p-1 uppercase">TOLOK UKUR KINERJA</td>
                                <td className="border border-black p-1 uppercase w-36">TARGET KINERJA</td>
                            </tr>
                            <tr>
                                <td className="border border-black p-1.5 font-bold align-top">INPUT</td>
                                <td className="border border-black p-1.5">Anggaran Biaya</td>
                                <td className="border border-black p-1.5 text-right font-mono font-bold">
                                    {formatRupiah(grandTotal)}
                                </td>
                            </tr>
                            <tr>
                                <td className="border border-black p-1.5 font-bold align-top">OUTPUT</td>
                                <td className="border border-black p-1.5 space-y-0.5">
                                    {tolokUkurOutputText ? (
                                        <div className="whitespace-pre-line leading-relaxed font-normal">{tolokUkurOutputText}</div>
                                    ) : (
                                        <>
                                            <p className="font-semibold">1. Pelayanan {unitName}</p>
                                            <p className="pl-3">1.1. Meningkatnya kualitas Pelayanan {unitName} terhadap pasien dan keluarga pasien</p>
                                            <p className="pl-3">1.2. Persentase Kompetensi SDM dalam pelayanan {unitName}</p>
                                            <p className="font-semibold mt-1">2. Keuangan</p>
                                            <p className="pl-3">Tercapainya target pendapatan RS sesuai pelayanan {unitName}</p>
                                        </>
                                    )}
                                </td>
                                <td className="border border-black p-1.5 text-right align-top space-y-0.5 font-semibold">
                                    {tolokUkurOutputText ? (
                                        <p>{targetOutputText}</p>
                                    ) : (
                                        <>
                                            <p>&nbsp;</p>
                                            <p>100%</p>
                                            <p>90%</p>
                                            <p>&nbsp;</p>
                                            <p>100%</p>
                                        </>
                                    )}
                                </td>
                            </tr>
                            <tr>
                                <td className="border border-black p-1.5 font-bold align-top">OUTCOME</td>
                                <td className="border border-black p-1.5 space-y-0.5">
                                    {tolokUkurOutcomeText ? (
                                        <div className="whitespace-pre-line leading-relaxed font-normal">{tolokUkurOutcomeText}</div>
                                    ) : (
                                        <>
                                            <p>1. Waktu Tunggu hasil pelayanan sesuai standar SPM</p>
                                            <p className="pl-3">- Pelayanan rutin & emergensi tepat waktu</p>
                                            <p>2. Pelaksana ekspertisi hasil pemeriksaan oleh Dokter Penanggung Jawab / Spesialis</p>
                                            <p>3. Angka ketepatan waktu pelaporan nilai kritis &lt; 30 menit</p>
                                            <p>4. Angka kesalahan memasukkan dan mencetak hasil pemeriksaan</p>
                                            <p>5. Kepuasan Pelanggan</p>
                                            <p>6. Kepatuhan cuci tangan & pencegahan infeksi (PPI)</p>
                                            <p>7. Kepatuhan identifikasi pasien sesuai SOP keselamatan pasien</p>
                                        </>
                                    )}
                                </td>
                                <td className="border border-black p-1.5 text-right align-top space-y-0.5 font-semibold">
                                    {tolokUkurOutcomeText ? (
                                        <p>{targetOutcomeText}</p>
                                    ) : (
                                        <>
                                            <p>100%</p>
                                            <p>100%</p>
                                            <p>100%</p>
                                            <p>100%</p>
                                            <p>0%</p>
                                            <p>&gt; 80%</p>
                                            <p>100%</p>
                                            <p>100%</p>
                                        </>
                                    )}
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    {/* Section Title ANGGARAN BIAYA (Kuning Persis PDF) */}
                    <div className="bg-yellow-200 print:bg-yellow-200 border-x border-b border-black text-center py-1 font-black text-xs uppercase tracking-wider">
                        ANGGARAN BIAYA
                    </div>

                    {/* Tabel Rincian Biaya */}
                    <table className="w-full border-collapse border border-black text-[11px] mb-6">
                        <thead>
                            <tr className="text-center font-bold">
                                <th rowSpan={2} className="border border-black p-1.5 w-8">
                                    No
                                </th>
                                <th rowSpan={2} className="border border-black p-1.5 text-left">
                                    Komponen Biaya
                                </th>
                                <th colSpan={3} className="border border-black p-1">
                                    Rincian Biaya
                                </th>
                                <th rowSpan={2} className="border border-black p-1.5 w-36 text-right">
                                    Jumlah Anggaran (Rp)
                                </th>
                            </tr>
                            <tr className="text-center font-bold">
                                <th className="border border-black p-1 w-14">Jumlah</th>
                                <th className="border border-black p-1 w-16">Satuan</th>
                                <th className="border border-black p-1 w-28 text-right">Harga Satuan</th>
                            </tr>
                            <tr className="bg-yellow-200 print:bg-yellow-200 font-bold text-center text-[10px]">
                                <th className="border border-black p-0.5">1</th>
                                <th className="border border-black p-0.5">2</th>
                                <th className="border border-black p-0.5">3</th>
                                <th className="border border-black p-0.5">4</th>
                                <th className="border border-black p-0.5">5</th>
                                <th className="border border-black p-0.5">6 = (3 x 5)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* SEKSI I: BIAYA OPERASIONAL */}
                            {opDetails.length > 0 && (
                                <React.Fragment key="section-operasional">
                                    <tr className="font-bold bg-gray-50 print:bg-transparent">
                                        <td className="border border-black p-1 text-center font-black">
                                            I
                                        </td>
                                        <td className="border border-black p-1 uppercase" colSpan={4}>
                                            BIAYA OPERASIONAL
                                        </td>
                                        <td className="border border-black p-1 text-right font-mono font-black">
                                            {formatNumber(opTotal)}
                                        </td>
                                    </tr>

                                    <tr className="font-bold">
                                        <td className="border border-black p-1 text-center">A</td>
                                        <td className="border border-black p-1" colSpan={4}>
                                            BIAYA PELAYANAN
                                        </td>
                                        <td className="border border-black p-1 text-right font-mono font-bold">
                                            {formatNumber(opTotal)}
                                        </td>
                                    </tr>

                                    {groupDetailsByAccount(opDetails, requisition.rba_account, 'Belanja Bahan Habis Pakai').map((grp, grpIdx) => (
                                        <React.Fragment key={`op-grp-${grpIdx}`}>
                                            <tr className="font-bold">
                                                <td className="border border-black p-1 text-center">{grpIdx + 1}</td>
                                                <td className="border border-black p-1 uppercase" colSpan={4}>
                                                    {grp.account ? grp.account.account_name : 'Belanja Barang dan Jasa'}
                                                </td>
                                                <td className="border border-black p-1 text-right font-mono font-black bg-yellow-100 print:bg-yellow-100">
                                                    {formatNumber(grp.total)}
                                                </td>
                                            </tr>

                                            {grp.items.map((detail, idx) => {
                                                const qty = Number(detail.quantity_approved ?? detail.quantity_requested ?? 1);
                                                const price = Number(detail.unit_price || 0);
                                                const subtotal = qty * price;
                                                const itemName = detail.item?.name || detail.item_name || detail.manual_item_name || '-';
                                                const itemUnit = (detail.unit_type || detail.item?.unit_type || 'BOX').toUpperCase();

                                                return (
                                                    <tr key={detail.id || `op-itm-${idx}`}>
                                                        <td className="border border-black p-1 text-center text-slate-600">
                                                            {idx + 1}
                                                        </td>
                                                        <td className="border border-black p-1">
                                                            <span className="font-bold uppercase">{itemName}</span>
                                                            {detail.specification && (
                                                                <span className="text-[10px] text-slate-600 block leading-none mt-0.5">
                                                                    {detail.specification}
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="border border-black p-1 text-center font-semibold">
                                                            {qty}
                                                        </td>
                                                        <td className="border border-black p-1 text-center font-semibold uppercase">
                                                            {itemUnit}
                                                        </td>
                                                        <td className="border border-black p-1 text-right font-mono">
                                                            {formatNumber(price)}
                                                        </td>
                                                        <td className="border border-black p-1 text-right font-mono font-bold">
                                                            {formatNumber(subtotal)}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </React.Fragment>
                                    ))}
                                </React.Fragment>
                            )}

                            {/* SEKSI II: BELANJA MODAL */}
                            {modDetails.length > 0 && (
                                <React.Fragment key="section-modal">
                                    <tr className="font-bold bg-gray-50 print:bg-transparent">
                                        <td className="border border-black p-1 text-center font-black">
                                            {opDetails.length > 0 ? 'II' : 'I'}
                                        </td>
                                        <td className="border border-black p-1 uppercase" colSpan={4}>
                                            BELANJA MODAL
                                        </td>
                                        <td className="border border-black p-1 text-right font-mono font-black">
                                            {formatNumber(modTotal)}
                                        </td>
                                    </tr>

                                    <tr className="font-bold">
                                        <td className="border border-black p-1 text-center">A</td>
                                        <td className="border border-black p-1" colSpan={4}>
                                            PENGADAAN PERALATAN DAN MESIN
                                        </td>
                                        <td className="border border-black p-1 text-right font-mono font-bold">
                                            {formatNumber(modTotal)}
                                        </td>
                                    </tr>

                                    {groupDetailsByAccount(modDetails, requisition.rba_account, 'Belanja Modal Peralatan').map((grp, grpIdx) => (
                                        <React.Fragment key={`mod-grp-${grpIdx}`}>
                                            <tr className="font-bold">
                                                <td className="border border-black p-1 text-center">{grpIdx + 1}</td>
                                                <td className="border border-black p-1 uppercase" colSpan={4}>
                                                    {grp.account ? grp.account.account_name : 'Belanja Modal Peralatan'}
                                                </td>
                                                <td className="border border-black p-1 text-right font-mono font-black bg-yellow-100 print:bg-yellow-100">
                                                    {formatNumber(grp.total)}
                                                </td>
                                            </tr>

                                            {grp.items.map((detail, idx) => {
                                                const qty = Number(detail.quantity_approved ?? detail.quantity_requested ?? 1);
                                                const price = Number(detail.unit_price || 0);
                                                const subtotal = qty * price;
                                                const itemName = detail.item?.name || detail.item_name || detail.manual_item_name || '-';
                                                const itemUnit = (detail.unit_type || detail.item?.unit_type || 'UNIT').toUpperCase();

                                                return (
                                                    <tr key={detail.id || `mod-itm-${idx}`}>
                                                        <td className="border border-black p-1 text-center text-slate-600">
                                                            {idx + 1}
                                                        </td>
                                                        <td className="border border-black p-1">
                                                            <span className="font-bold uppercase">{itemName}</span>
                                                            {detail.specification && (
                                                                <span className="text-[10px] text-slate-600 block leading-none mt-0.5">
                                                                    {detail.specification}
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="border border-black p-1 text-center font-semibold">
                                                            {qty}
                                                        </td>
                                                        <td className="border border-black p-1 text-center font-semibold uppercase">
                                                            {itemUnit}
                                                        </td>
                                                        <td className="border border-black p-1 text-right font-mono">
                                                            {formatNumber(price)}
                                                        </td>
                                                        <td className="border border-black p-1 text-right font-mono font-bold">
                                                            {formatNumber(subtotal)}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </React.Fragment>
                                    ))}
                                </React.Fragment>
                            )}
                        </tbody>
                        <tfoot>
                            <tr className="bg-yellow-200 print:bg-yellow-200 font-bold">
                                <td colSpan={5} className="border border-black p-1.5 text-right font-black uppercase">
                                    TOTAL ANGGARAN BIAYA :
                                </td>
                                <td className="border border-black p-1.5 text-right font-mono font-black text-xs">
                                    {formatNumber(grandTotal)}
                                </td>
                            </tr>
                        </tfoot>
                    </table>

                    {/* Lembar Tanda Tangan Resmi (Persis Halaman 4 Dokumen Laboratorium) */}
                    <div className="mt-8 page-break-inside-avoid">
                        <div className="grid grid-cols-2 gap-8 text-[11px] leading-snug">
                            {/* Kiri: Mengetahui Ka. Bidang */}
                            <div className="flex flex-col justify-between h-40">
                                <div>
                                    <p className="font-medium">Mengetahui,</p>
                                    <p className="font-bold">{signerBidangTitle}</p>
                                    <p className="font-medium">RS Jiwa Tampan Prov. Riau</p>
                                </div>
                                <div>
                                    <p className="font-bold underline uppercase tracking-wide">
                                        {signerBidangName}
                                    </p>
                                    <p className="font-medium">NIP. {signerBidangNip}</p>
                                </div>
                            </div>

                            {/* Kanan: Kepala Instalasi / Pengusul */}
                            <div className="flex flex-col justify-between h-40 text-right sm:text-left">
                                <div>
                                    <p className="font-medium">Pekanbaru, {formatTanggal(requisition.submission_date || new Date())}</p>
                                    <p className="font-bold">{signerUnitTitle}</p>
                                    <p className="font-medium">RS Jiwa Tampan Prov. Riau</p>
                                </div>
                                <div>
                                    <p className="font-bold underline uppercase tracking-wide">
                                        {signerUnitName}
                                    </p>
                                    <p className="font-medium">NIP. {signerUnitNip}</p>
                                </div>
                            </div>
                        </div>

                        {/* Tengah Bawah: Mengetahui Wakil Direktur Medik dan Keperawatan */}
                        <div className="mt-6 flex flex-col items-center justify-between text-center h-36 text-[11px] leading-snug">
                            <div>
                                <p className="font-medium">Mengetahui,</p>
                                <p className="font-bold">{signerWadirTitle}</p>
                            </div>
                            <div>
                                <p className="font-bold underline uppercase tracking-wide">
                                    {signerWadirName}
                                </p>
                                <p className="font-medium">{signerWadirRank}</p>
                                <p className="font-medium">NIP. {signerWadirNip}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* FORMAT 2: LEMBAR NOTA DINAS & VERIFIKASI ALUR E-BLUD                     */}
            {/* ========================================================================= */}
            {activeFormat === 'notadinas' && (
                <div className="document-container text-black text-xs">
                    {/* Kop Surat Resmi */}
                    <div className="flex items-center gap-6 border-b-4 border-black pb-4 mb-5">
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
                                    NOTA DINAS USULAN BELANJA E-BLUD
                                </h3>
                                <p className="text-xs font-bold tracking-wider">
                                    NOMOR PENGAJUAN: {requisition.requisition_number}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Body Information Grid */}
                    <div className="border border-black p-3.5 mb-4 text-xs">
                        <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
                            <div className="flex">
                                <span className="font-bold w-40 shrink-0">Unit Pengusul</span>
                                <span className="font-semibold">: {unitName} ({requisition.unit?.unit_code || 'UNIT'})</span>
                            </div>
                            <div className="flex">
                                <span className="font-bold w-40 shrink-0">Tahun Anggaran</span>
                                <span className="font-bold text-black">: TA {activeYear}</span>
                            </div>

                            <div className="flex">
                                <span className="font-bold w-40 shrink-0">Bidang Induk</span>
                                <span>: {divisionName}</span>
                            </div>
                            <div className="flex">
                                <span className="font-bold w-40 shrink-0">Tanggal Pengajuan</span>
                                <span>: {formatTanggal(requisition.submission_date)}</span>
                            </div>

                            <div className="flex">
                                <span className="font-bold w-40 shrink-0">No. Nota Dinas Unit</span>
                                <span>: {requisition.nomor_surat_unit || '-'}</span>
                            </div>
                            <div className="flex">
                                <span className="font-bold w-40 shrink-0">Sumber Dana</span>
                                <span className="font-bold">: BLUD RSJ Tampan</span>
                            </div>

                            <div className="flex">
                                <span className="font-bold w-40 shrink-0">Klasifikasi Belanja</span>
                                <span className="font-bold">
                                    : {requisition.jenis_belanja === 'Campuran'
                                        ? 'Belanja Operasi & Belanja Modal (Campuran)'
                                        : `Belanja ${requisition.jenis_belanja || 'Operasi'} BLUD`}
                                </span>
                            </div>
                            <div className="flex">
                                <span className="font-bold w-40 shrink-0">Status Berkas</span>
                                <span className="font-bold uppercase">: {requisition.status?.replace('_', ' ')}</span>
                            </div>

                            <div className="flex col-span-2">
                                <span className="font-bold w-40 shrink-0">Sub Kegiatan RS</span>
                                <span className="font-medium">: {subKegiatanText}</span>
                            </div>

                            <div className="flex col-span-2">
                                <span className="font-bold w-40 shrink-0">Pos Rekening RBA</span>
                                <span className="font-medium">
                                    : {requisition.rba_account
                                        ? `[${requisition.rba_account.account_code}] ${requisition.rba_account.account_name}`
                                        : requisition.jenis_belanja === 'Campuran'
                                        ? 'Multi-Rekening (Operasional & Modal)'
                                        : '-'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Telaahan Staf / Urgensi Kebutuhan (If available) */}
                    {requisition.urgency_reason && (
                        <div className="border border-black p-3 mb-4 text-xs">
                            <p className="font-bold uppercase tracking-wider mb-1">Telaahan Staf / Urgensi Kebutuhan:</p>
                            <p className="font-medium whitespace-pre-line leading-relaxed text-justify">
                                {requisition.urgency_reason}
                            </p>
                        </div>
                    )}

                    {/* Rincian Barang Table */}
                    <div className="mb-6">
                        <table className="w-full border-collapse border border-black text-xs">
                            <thead>
                                <tr className="bg-gray-100 print:bg-transparent font-bold">
                                    <th className="border border-black p-1.5 text-center w-8">No</th>
                                    <th className="border border-black p-1.5 text-left">Nama Komponen / Barang</th>
                                    <th className="border border-black p-1.5 text-left">Spesifikasi</th>
                                    <th className="border border-black p-1.5 text-center w-16">Satuan</th>
                                    <th className="border border-black p-1.5 text-center w-16">Vol</th>
                                    <th className="border border-black p-1.5 text-right w-28">Harga Satuan (Rp)</th>
                                    <th className="border border-black p-1.5 text-right w-32">Subtotal (Rp)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {opDetails.length > 0 && modDetails.length > 0 ? (
                                    <>
                                        <tr className="bg-slate-100 print:bg-slate-100 font-bold">
                                            <td colSpan={7} className="border border-black p-1.5 uppercase">
                                                I. BIAYA OPERASIONAL (Subtotal: {formatRupiah(opTotal)})
                                            </td>
                                        </tr>
                                        {opDetails.map((detail, index) => {
                                            const itemName = detail.item?.name || detail.item_name || detail.manual_item_name || '-';
                                            const itemSpec = detail.item?.specification || detail.specification || '-';
                                            const itemUnit = (detail.unit_type || detail.item?.unit_type || 'BOX').toUpperCase();
                                            const qty = Number(detail.quantity_approved ?? detail.quantity_requested ?? 1);
                                            const price = Number(detail.unit_price || 0);
                                            const lineSubtotal = qty * price;

                                            return (
                                                <tr key={detail.id || `op-nd-${index}`}>
                                                    <td className="border border-black p-1.5 text-center">{index + 1}</td>
                                                    <td className="border border-black p-1.5 font-bold">{itemName}</td>
                                                    <td className="border border-black p-1.5 text-[11px] leading-tight">{itemSpec}</td>
                                                    <td className="border border-black p-1.5 text-center">{itemUnit}</td>
                                                    <td className="border border-black p-1.5 text-center font-bold">{qty}</td>
                                                    <td className="border border-black p-1.5 text-right">{formatRupiah(price)}</td>
                                                    <td className="border border-black p-1.5 text-right font-bold">{formatRupiah(lineSubtotal)}</td>
                                                </tr>
                                            );
                                        })}

                                        <tr className="bg-slate-100 print:bg-slate-100 font-bold">
                                            <td colSpan={7} className="border border-black p-1.5 uppercase">
                                                II. BELANJA MODAL (Subtotal: {formatRupiah(modTotal)})
                                            </td>
                                        </tr>
                                        {modDetails.map((detail, index) => {
                                            const itemName = detail.item?.name || detail.item_name || detail.manual_item_name || '-';
                                            const itemSpec = detail.item?.specification || detail.specification || '-';
                                            const itemUnit = (detail.unit_type || detail.item?.unit_type || 'UNIT').toUpperCase();
                                            const qty = Number(detail.quantity_approved ?? detail.quantity_requested ?? 1);
                                            const price = Number(detail.unit_price || 0);
                                            const lineSubtotal = qty * price;

                                            return (
                                                <tr key={detail.id || `mod-nd-${index}`}>
                                                    <td className="border border-black p-1.5 text-center">{index + 1}</td>
                                                    <td className="border border-black p-1.5 font-bold">{itemName}</td>
                                                    <td className="border border-black p-1.5 text-[11px] leading-tight">{itemSpec}</td>
                                                    <td className="border border-black p-1.5 text-center">{itemUnit}</td>
                                                    <td className="border border-black p-1.5 text-center font-bold">{qty}</td>
                                                    <td className="border border-black p-1.5 text-right">{formatRupiah(price)}</td>
                                                    <td className="border border-black p-1.5 text-right font-bold">{formatRupiah(lineSubtotal)}</td>
                                                </tr>
                                            );
                                        })}
                                    </>
                                ) : (
                                    details.map((detail, index) => {
                                        const itemName = detail.item?.name || detail.item_name || detail.manual_item_name || '-';
                                        const itemSpec = detail.item?.specification || detail.specification || '-';
                                        const itemUnit = (detail.unit_type || detail.item?.unit_type || 'BOX').toUpperCase();
                                        const qty = Number(detail.quantity_approved ?? detail.quantity_requested ?? 1);
                                        const price = Number(detail.unit_price || 0);
                                        const lineSubtotal = qty * price;

                                        return (
                                            <tr key={detail.id || index}>
                                                <td className="border border-black p-1.5 text-center">{index + 1}</td>
                                                <td className="border border-black p-1.5 font-bold">{itemName}</td>
                                                <td className="border border-black p-1.5 text-[11px] leading-tight">{itemSpec}</td>
                                                <td className="border border-black p-1.5 text-center">{itemUnit}</td>
                                                <td className="border border-black p-1.5 text-center font-bold">{qty}</td>
                                                <td className="border border-black p-1.5 text-right">{formatRupiah(price)}</td>
                                                <td className="border border-black p-1.5 text-right font-bold">{formatRupiah(lineSubtotal)}</td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                            <tfoot>
                                <tr className="bg-gray-100 print:bg-transparent font-bold">
                                    <td colSpan={6} className="border border-black p-2 text-right font-black">
                                        TOTAL ANGGARAN USULAN BELANJA:
                                    </td>
                                    <td className="border border-black p-2 text-right font-black">
                                        {formatRupiah(grandTotal)}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    {/* Tanda Tangan Alur 3 Pihak (Unit, Perencanaan, Keuangan) */}
                    <div className="mt-8 grid grid-cols-3 gap-4 text-center text-xs page-break-inside-avoid">
                        {/* 1. Pemohon Unit Kerja */}
                        <div className="flex flex-col justify-between h-40">
                            <div>
                                <p className="font-medium">Pekanbaru, {formatTanggal(requisition.submission_date || new Date())}</p>
                                <p className="font-bold mt-0.5">{signerUnitTitle}</p>
                            </div>
                            <div>
                                <p className="font-bold underline uppercase">{signerUnitName}</p>
                                <p className="text-[11px] text-slate-700">NIP. {signerUnitNip}</p>
                            </div>
                        </div>

                        {/* 2. Bagian Perencanaan */}
                        <div className="flex flex-col justify-between h-40">
                            <div>
                                <p className="font-medium">
                                    {requisition.verified_perencanaan_at
                                        ? `Pekanbaru, ${formatTanggal(requisition.verified_perencanaan_at)}`
                                        : 'Diverifikasi Oleh,'}
                                </p>
                                <p className="font-bold mt-0.5">Bagian Perencanaan RSJ Tampan</p>
                            </div>
                            <div>
                                <p className="font-bold underline uppercase">
                                    {verifikatorPerencanaan?.name || signerBidangName}
                                </p>
                                <p className="text-[11px] text-slate-700">
                                    NIP. {verifikatorPerencanaan?.nip || signerBidangNip}
                                </p>
                            </div>
                        </div>

                        {/* 3. Bagian Keuangan */}
                        <div className="flex flex-col justify-between h-40">
                            <div>
                                <p className="font-medium">
                                    {requisition.approved_keuangan_at
                                        ? `Pekanbaru, ${formatTanggal(requisition.approved_keuangan_at)}`
                                        : 'Disetujui Pagu Kas Oleh,'}
                                </p>
                                <p className="font-bold mt-0.5">Bagian Keuangan RSJ Tampan</p>
                            </div>
                            <div>
                                <p className="font-bold underline uppercase">
                                    {verifikatorKeuangan?.name || '( .................................... )'}
                                </p>
                                <p className="text-[11px] text-slate-700">
                                    NIP. {verifikatorKeuangan?.nip || '....................................'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Print Styling Helper */}
            <style>{`
                @media print {
                    @page {
                        size: A4 portrait;
                        margin: 10mm 12mm 12mm 12mm;
                    }
                    body {
                        background-color: #ffffff !important;
                        color: #000000 !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    .document-container {
                        font-family: Arial, Helvetica, sans-serif !important;
                    }
                    .page-break-inside-avoid {
                        page-break-inside: avoid;
                    }
                }
            `}</style>
        </div>
    );
}
