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

export default function PrintRequisition({ requisition }) {
    const details = requisition.requisition_details || requisition.requisitionDetails || [];

    const grandTotal = details.reduce((acc, item) => {
        const qty = Number(item.quantity_approved ?? item.quantity_requested ?? 0);
        const price = Number(item.unit_price || 0);
        return acc + (qty * price);
    }, 0);

    return (
        <div className="bg-white text-black min-h-screen p-8 max-w-4xl mx-auto font-sans print:p-0 print:max-w-none">
            <Head title={`Cetak - ${requisition.requisition_number}`} />

            {/* Print Action Bar (Hidden during Print) */}
            <div className="print:hidden flex items-center justify-between bg-slate-100 p-4 rounded-xl mb-6 border border-slate-200">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-700">
                        Dokumen Usulan Belanja E-BLUD (Perencanaan TA {requisition.fiscal_year || '2027'})
                    </span>
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
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2 rounded-lg text-sm shadow-sm transition flex items-center gap-2"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24-1.077-.32-2.14-.32-3.193 0-5.18 4.02-9.386 8.974-9.386 4.954 0 8.973 4.207 8.973 9.386 0 1.053-.08 2.116-.32 3.193M12 18v-4.5m0 0l-2.25 2.25M12 13.5l2.25 2.25M3.75 19.5h16.5" />
                        </svg>
                        Cetak Dokumen
                    </button>
                </div>
            </div>

            {/* Kop Surat (Header) */}
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
                            NOTA USULAN KEBUTUHAN BELANJA E-BLUD
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
                        <span className="font-semibold">: {requisition.unit?.name ? `${requisition.unit.name} (${requisition.unit.unit_code})` : (requisition.division?.name || '-')}</span>
                    </div>
                    <div className="flex">
                        <span className="font-bold w-40 shrink-0">Tahun Anggaran Kebutuhan</span>
                        <span className="font-bold text-black">: TA {requisition.fiscal_year || '2027'}</span>
                    </div>

                    <div className="flex">
                        <span className="font-bold w-40 shrink-0">Bidang Induk</span>
                        <span>: {requisition.division?.name || '-'}</span>
                    </div>
                    <div className="flex">
                        <span className="font-bold w-40 shrink-0">Tanggal Pengajuan</span>
                        <span>: {formatTanggal(requisition.submission_date)}</span>
                    </div>

                    <div className="flex">
                        <span className="font-bold w-40 shrink-0">Nomor Nota Dinas Unit</span>
                        <span>: {requisition.nomor_surat_unit || '-'}</span>
                    </div>
                    <div className="flex">
                        <span className="font-bold w-40 shrink-0">Sumber Dana</span>
                        <span className="font-bold">: BLUD RSJ Tampan</span>
                    </div>

                    <div className="flex">
                        <span className="font-bold w-40 shrink-0">Klasifikasi Belanja</span>
                        <span className="font-bold">: Belanja {requisition.jenis_belanja || 'Operasi'} BLUD</span>
                    </div>
                    <div className="flex">
                        <span className="font-bold w-40 shrink-0">Status Usulan</span>
                        <span className="font-bold uppercase">: {requisition.status?.replace('_', ' ')}</span>
                    </div>

                    <div className="flex col-span-2">
                        <span className="font-bold w-40 shrink-0">Sub Kegiatan Rumah Sakit</span>
                        <span className="font-medium">: {requisition.sub_kegiatan || 'Pelayanan dan Penunjang Pelayanan BLUD RS Jiwa Tampan'}</span>
                    </div>

                    <div className="flex col-span-2">
                        <span className="font-bold w-40 shrink-0">Pos Kode Rekening RBA</span>
                        <span className="font-medium">
                            : {requisition.rba_account ? `[${requisition.rba_account.account_code}] ${requisition.rba_account.account_name}` : '-'}
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
                        <tr className="bg-gray-100 print:bg-transparent">
                            <th className="border border-black p-1.5 text-center w-8 font-bold">No</th>
                            <th className="border border-black p-1.5 text-left font-bold">Kode & Nama Barang</th>
                            <th className="border border-black p-1.5 text-left font-bold">Spesifikasi Detail</th>
                            <th className="border border-black p-1.5 text-center w-16 font-bold">Satuan</th>
                            <th className="border border-black p-1.5 text-center w-16 font-bold">Volume Diusulkan</th>
                            <th className="border border-black p-1.5 text-center w-16 font-bold">Volume Disetujui</th>
                            <th className="border border-black p-1.5 text-right w-28 font-bold">Harga Satuan (Rp)</th>
                            <th className="border border-black p-1.5 text-right w-32 font-bold">Subtotal (Rp)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {details.map((detail, index) => {
                            const itemCode = detail.item?.item_code || 'BRG';
                            const itemName = detail.item?.name || detail.manual_item_name || '-';
                            const itemSpec = detail.item?.specification || detail.manual_specification || '-';
                            const itemUnit = detail.item?.unit_type || detail.item?.unit || 'Unit';
                            const qtyRequested = Number(detail.quantity_requested || 0);
                            const qtyApproved = detail.quantity_approved !== null && detail.quantity_approved !== undefined
                                ? Number(detail.quantity_approved)
                                : qtyRequested;
                            const price = Number(detail.unit_price || 0);
                            const lineSubtotal = Number(detail.subtotal || (qtyApproved * price));

                            return (
                                <tr key={detail.id || index}>
                                    <td className="border border-black p-1.5 text-center">{index + 1}</td>
                                    <td className="border border-black p-1.5">
                                        <span className="font-mono text-[10px] text-slate-600 block">[{itemCode}]</span>
                                        <span className="font-bold">{itemName}</span>
                                    </td>
                                    <td className="border border-black p-1.5 text-[11px] leading-tight">{itemSpec}</td>
                                    <td className="border border-black p-1.5 text-center">{itemUnit}</td>
                                    <td className="border border-black p-1.5 text-center font-semibold">{qtyRequested}</td>
                                    <td className="border border-black p-1.5 text-center font-bold">{qtyApproved}</td>
                                    <td className="border border-black p-1.5 text-right">{formatRupiah(price)}</td>
                                    <td className="border border-black p-1.5 text-right font-bold">{formatRupiah(lineSubtotal)}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                    <tfoot>
                        <tr className="bg-gray-100 print:bg-transparent font-bold">
                            <td colSpan={7} className="border border-black p-2 text-right font-black">
                                TOTAL ESTIMASI PAGU ANGGARAN BLUD:
                            </td>
                            <td className="border border-black p-2 text-right font-black">
                                {formatRupiah(requisition.total_approved && Number(requisition.total_approved) > 0 ? requisition.total_approved : grandTotal)}
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            {/* Footer / Tanda Tangan 3 Pihak */}
            <div className="mt-8 grid grid-cols-3 gap-4 text-center text-xs">
                {/* 1. Pemohon / Unit Pengusul */}
                <div className="flex flex-col justify-between h-44">
                    <div>
                        <p className="font-medium">Pekanbaru, {formatTanggal(requisition.submission_date)}</p>
                        <p className="font-bold mt-0.5">Pengusul / Kepala Unit Kerja,</p>
                    </div>
                    <div>
                        <p className="font-bold underline uppercase">
                            {requisition.user?.name || '....................................'}
                        </p>
                        <p className="text-[11px] text-slate-700">
                            NIP. {requisition.user?.nip || '....................................'}
                        </p>
                        {requisition.user?.position && (
                            <p className="text-[10px] text-slate-600 italic">
                                {requisition.user.position}
                            </p>
                        )}
                    </div>
                </div>

                {/* 2. Bagian Perencanaan */}
                <div className="flex flex-col justify-between h-44">
                    <div>
                        <p className="font-medium">Diverifikasi Oleh,</p>
                        <p className="font-bold mt-0.5">Bagian Perencanaan RSJ Tampan</p>
                    </div>
                    <div>
                        <p className="font-bold underline uppercase">
                            ( .................................... )
                        </p>
                        <p className="text-[11px] text-slate-700">NIP. ....................................</p>
                        <p className="text-[10px] text-slate-600 italic">Tim Penelaah RBA BLUD</p>
                    </div>
                </div>

                {/* 3. Bagian Keuangan */}
                <div className="flex flex-col justify-between h-44">
                    <div>
                        <p className="font-medium">Disetujui Pagu Kas Oleh,</p>
                        <p className="font-bold mt-0.5">Bagian Keuangan RSJ Tampan</p>
                    </div>
                    <div>
                        <p className="font-bold underline uppercase">
                            ( .................................... )
                        </p>
                        <p className="text-[11px] text-slate-700">NIP. ....................................</p>
                        <p className="text-[10px] text-slate-600 italic">Pejabat Keuangan BLUD</p>
                    </div>
                </div>
            </div>

            {/* Print Styling Helper */}
            <style>{`
                @media print {
                    @page {
                        size: A4 portrait;
                        margin: 12mm 15mm 15mm 15mm;
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
