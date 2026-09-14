const formatTanggalWaktu = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
};

export default function AuditTrailTimeline({ requisition }) {
    if (!requisition) return null;

    const verifikatorPerencanaan = requisition.verified_by_perencanaan || requisition.verifiedByPerencanaan;
    const verifikatorKeuangan = requisition.approved_by_keuangan || requisition.approvedByKeuangan;

    const isPerencanaanPassed =
        requisition.status === 'Diproses_Keuangan' || requisition.status === 'Disetujui_Selesai';
    const isKeuanganDone = requisition.status === 'Disetujui_Selesai';
    const isRejected = requisition.status === 'Ditolak';

    return (
        <div className="overflow-hidden rounded-2xl border border-emerald-100/90 bg-white shadow-md shadow-emerald-950/5 hover:shadow-lg hover:shadow-emerald-900/10 transition-all duration-200">
            {/* Card Header */}
            <div className="border-b border-emerald-100 bg-gradient-to-r from-emerald-50/90 via-teal-50/40 to-slate-50/50 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex items-center gap-2.5">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-2xs">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </span>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-950">
                        Jejak Audit & Riwayat Persetujuan (Audit Trail)
                    </h3>
                </div>
                <span className="inline-flex items-center rounded-full bg-emerald-100/70 px-3 py-0.5 text-[11px] font-bold text-emerald-800 border border-emerald-200">
                    Transparansi E-BLUD RSJ
                </span>
            </div>

            {/* Timeline Body */}
            <div className="p-6">
                <div className="relative pl-6 border-l-2 border-emerald-200/80 space-y-8 ml-3">
                    {/* Stage 1: Pengajuan oleh Divisi */}
                    <div className="relative">
                        {/* Dot */}
                        <div className="absolute -left-[31px] top-0 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-white shadow-sm ring-4 ring-white">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                        </div>
                        <div>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                                <h4 className="text-sm font-black text-slate-900">
                                    Tahap 1: Diajukan oleh {requisition.unit?.name || requisition.division?.name || 'Unit Kerja'}
                                </h4>
                                <span className="text-xs font-semibold text-slate-500">
                                    {formatTanggalWaktu(requisition.created_at || requisition.submission_date)}
                                </span>
                            </div>
                            <p className="mt-1 text-xs text-slate-600">
                                Diajukan oleh pemohon <strong>{requisition.user?.name || '-'}</strong>
                                {requisition.user?.nip && <span className="text-slate-500"> (NIP: {requisition.user.nip})</span>}
                                {requisition.user?.position && <span className="text-slate-500"> - {requisition.user.position}</span>} dengan nomor registrasi <strong>{requisition.requisition_number}</strong>.
                            </p>
                        </div>
                    </div>

                    {/* Stage 2: Verifikasi Perencanaan */}
                    <div className="relative">
                        {/* Dot */}
                        {isPerencanaanPassed ? (
                            <div className="absolute -left-[31px] top-0 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-white shadow-sm ring-4 ring-white">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                            </div>
                        ) : isRejected ? (
                            <div className="absolute -left-[31px] top-0 flex h-7 w-7 items-center justify-center rounded-full bg-rose-600 text-white shadow-sm ring-4 ring-white">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                        ) : (
                            <div className="absolute -left-[31px] top-0 flex h-7 w-7 items-center justify-center rounded-full bg-amber-500 text-white shadow-sm ring-4 ring-white animate-pulse">
                                <span className="h-2 w-2 rounded-full bg-white" />
                            </div>
                        )}

                        <div>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                                <h4 className="text-sm font-black text-slate-900">
                                    Tahap 2: Verifikasi oleh Bagian Perencanaan & Pengadaan
                                </h4>
                                {(requisition.verified_perencanaan_at || (isPerencanaanPassed && requisition.updated_at)) && (
                                    <span className="text-xs font-semibold text-slate-500">
                                        {formatTanggalWaktu(requisition.verified_perencanaan_at || requisition.updated_at)}
                                    </span>
                                )}
                            </div>
                            <p className="mt-1 text-xs text-slate-600">
                                {isPerencanaanPassed
                                    ? 'Kuantitas disetujui telah diverifikasi dan spesifikasi barang sesuai standar katalog acuan rumah sakit. Dokumen diteruskan ke Bagian Keuangan.'
                                    : isRejected
                                    ? 'Pengajuan ditolak oleh Tim Penelaah karena ketidaksesuaian spesifikasi atau anggaran.'
                                    : 'Sedang dalam penelaahan kuantitas barang dan spesifikasi kebutuhan instalasi.'}
                            </p>
                            {verifikatorPerencanaan && (
                                <div className="mt-2.5 rounded-lg bg-emerald-50 border border-emerald-200/80 p-2.5 text-xs text-emerald-900 flex items-center gap-2">
                                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white text-[10px] font-bold">✓</span>
                                    <div>
                                        <p className="font-semibold">
                                            Diverifikasi oleh: <strong>{verifikatorPerencanaan.name}</strong>
                                            {verifikatorPerencanaan.nip && <span className="text-slate-600 font-normal"> (NIP: {verifikatorPerencanaan.nip})</span>}
                                        </p>
                                        {verifikatorPerencanaan.position && (
                                            <p className="text-[11px] text-slate-600 italic mt-0.5">
                                                {verifikatorPerencanaan.position}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Stage 3: Validasi & Pembebanan Anggaran Keuangan */}
                    <div className="relative">
                        {/* Dot */}
                        {isKeuanganDone ? (
                            <div className="absolute -left-[31px] top-0 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-white shadow-sm ring-4 ring-white">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                            </div>
                        ) : isRejected ? (
                            <div className="absolute -left-[31px] top-0 flex h-7 w-7 items-center justify-center rounded-full bg-slate-300 text-slate-600 ring-4 ring-white">
                                <span className="text-xs font-bold">-</span>
                            </div>
                        ) : requisition.status === 'Diproses_Keuangan' ? (
                            <div className="absolute -left-[31px] top-0 flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white shadow-sm ring-4 ring-white animate-pulse">
                                <span className="h-2 w-2 rounded-full bg-white" />
                            </div>
                        ) : (
                            <div className="absolute -left-[31px] top-0 flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-slate-400 ring-4 ring-white">
                                <span className="text-xs font-bold">3</span>
                            </div>
                        )}

                        <div>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                                <h4 className="text-sm font-black text-slate-900">
                                    Tahap 3: Pembebanan Anggaran oleh Bagian Keuangan
                                </h4>
                                {(requisition.approved_keuangan_at || (isKeuanganDone && requisition.updated_at)) && (
                                    <span className="text-xs font-semibold text-slate-500">
                                        {formatTanggalWaktu(requisition.approved_keuangan_at || requisition.updated_at)}
                                    </span>
                                )}
                            </div>
                            <p className="mt-1 text-xs text-slate-600">
                                {isKeuanganDone
                                    ? `Anggaran telah resmi disetujui dan saldo rekening pagu anggaran DPA telah dipotong. ${
                                          requisition.budget
                                              ? `(Kode Rekening: ${requisition.budget.account_code} - ${requisition.budget.account_name})`
                                              : ''
                                      }`
                                    : requisition.status === 'Diproses_Keuangan'
                                    ? 'Sedang menunggu pemilihan kode rekening belanja dan otorisasi pembebanan anggaran oleh staf Keuangan.'
                                    : isRejected
                                    ? 'Tahap pembebanan anggaran dibatalkan karena pengajuan berstatus ditolak.'
                                    : 'Menunggu penyelesaian verifikasi dari Bagian Perencanaan terlebih dahulu.'}
                            </p>
                            {verifikatorKeuangan && isKeuanganDone && (
                                <div className="mt-2.5 rounded-lg bg-emerald-50 border border-emerald-200/80 p-2.5 text-xs text-emerald-900 flex items-center gap-2">
                                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white text-[10px] font-bold">✓</span>
                                    <div>
                                        <p className="font-semibold">
                                            Disetujui & SP2D diterbitkan oleh: <strong>{verifikatorKeuangan.name}</strong>
                                            {verifikatorKeuangan.nip && <span className="text-slate-600 font-normal"> (NIP: {verifikatorKeuangan.nip})</span>}
                                        </p>
                                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-600 mt-0.5">
                                            {verifikatorKeuangan.position && <span className="italic">{verifikatorKeuangan.position}</span>}
                                            {requisition.sp2d_number && (
                                                <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-emerald-200 font-bold text-emerald-800">
                                                    SP2D: {requisition.sp2d_number}
                                                </span>
                                            )}
                                            {requisition.receipt_number && (
                                                <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-emerald-200 font-bold text-slate-700">
                                                    Kuitansi: {requisition.receipt_number}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

