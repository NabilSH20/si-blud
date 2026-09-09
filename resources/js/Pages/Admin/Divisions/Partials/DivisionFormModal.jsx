import Modal from '@/Components/Modal';
import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import Swal from 'sweetalert2';

export default function DivisionFormModal({
    show = false,
    onClose = () => {},
    division = null,
}) {
    const isEdit = Boolean(division && division.id);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        division_code: '',
        name: '',
        group: 'Pelayanan_Keperawatan',
    });

    useEffect(() => {
        if (!show) {
            clearErrors();
            return;
        }

        if (division) {
            setData({
                division_code: division.division_code || '',
                name: division.name || '',
                group: division.group || 'Pelayanan_Keperawatan',
            });
        } else {
            setData({
                division_code: '',
                name: '',
                group: 'Pelayanan_Keperawatan',
            });
        }
        clearErrors();
    }, [show, division]);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!data.division_code.trim() || !data.name.trim()) {
            Swal.fire({
                icon: 'warning',
                title: 'Data Belum Lengkap',
                text: 'Harap isi Kode Divisi dan Nama Divisi / Bagian dengan lengkap.',
                confirmButtonColor: '#059669',
            });
            return;
        }

        const titleText = isEdit
            ? 'Simpan Perubahan Divisi?'
            : 'Tambah Divisi / Bagian Baru?';
        const confirmBtnText = isEdit ? 'Ya, Simpan Perubahan' : 'Ya, Tambahkan';

        Swal.fire({
            title: titleText,
            html: `
                <div class="text-left text-xs sm:text-sm space-y-2 mt-2">
                    <p><strong>Kode Divisi:</strong> <span class="font-mono font-bold text-emerald-700">${data.division_code.toUpperCase()}</span></p>
                    <p><strong>Nama Divisi:</strong> ${data.name}</p>
                    <p><strong>Kelompok:</strong> ${
                        data.group === 'Pelayanan_Keperawatan'
                            ? 'Pelayanan Medik & Keperawatan'
                            : 'Tata Usaha / Umum & Kepegawaian'
                    }</p>
                </div>
            `,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#059669',
            cancelButtonColor: '#64748b',
            confirmButtonText: confirmBtnText,
            cancelButtonText: 'Batal',
            reverseButtons: true,
        }).then((result) => {
            if (result.isConfirmed) {
                if (isEdit) {
                    put(route('divisions.update', division.id), {
                        onSuccess: () => {
                            onClose();
                        },
                    });
                } else {
                    post(route('divisions.store'), {
                        onSuccess: () => {
                            reset();
                            onClose();
                        },
                    });
                }
            }
        });
    };

    return (
        <Modal show={show} onClose={onClose} maxWidth="2xl">
            <div className="flex flex-col max-h-[92vh]">
                {/* Modal Header */}
                <div className="shrink-0 border-b border-emerald-100 bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 px-6 py-4 text-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-xl font-bold backdrop-blur-xs border border-white/20">
                                🏛️
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h2 className="text-base sm:text-lg font-black tracking-tight">
                                        {isEdit
                                            ? `Ubah Divisi: ${division?.name || ''}`
                                            : 'Formulir Tambah Divisi / Bagian Baru'}
                                    </h2>
                                </div>
                                <p className="text-xs text-emerald-100/90 font-medium">
                                    RSJ Tampan Prov. Riau &bull; Struktur Organisasi & Pengadaan E-BLUD
                                </p>
                            </div>
                        </div>

                        {/* Close button */}
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl bg-white/10 p-2 text-white/80 hover:bg-white/20 hover:text-white transition cursor-pointer"
                            aria-label="Tutup Dialog"
                        >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Modal Body */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 bg-slate-50/50">
                    <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-xs space-y-4">
                        {/* Kode Divisi */}
                        <div>
                            <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-slate-700">
                                Kode Divisi / Bidang <span className="text-rose-600">*</span>
                            </label>
                            <input
                                type="text"
                                value={data.division_code}
                                onChange={(e) => setData('division_code', e.target.value.toUpperCase())}
                                placeholder="Contoh: MEDIK / RAWAT / REN / KEU"
                                className="block w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-black text-emerald-800 uppercase focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                            />
                            <p className="mt-1 text-[11px] text-slate-400 font-medium">
                                Kode unik pengenal divisi/bidang (singkat, huruf kapital).
                            </p>
                            {errors.division_code && (
                                <p className="mt-1 text-xs font-bold text-rose-600">{errors.division_code}</p>
                            )}
                        </div>

                        {/* Nama Divisi */}
                        <div>
                            <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-slate-700">
                                Nama Divisi / Bagian / Bidang <span className="text-rose-600">*</span>
                            </label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="Contoh: Bidang Pelayanan Medik"
                                className="block w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-bold text-slate-900 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                            />
                            {errors.name && (
                                <p className="mt-1 text-xs font-bold text-rose-600">{errors.name}</p>
                            )}
                        </div>

                        {/* Kelompok Bidang */}
                        <div>
                            <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-slate-700">
                                Kelompok Struktur Organisasi
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                <button
                                    type="button"
                                    onClick={() => setData('group', 'Pelayanan_Keperawatan')}
                                    className={`flex items-start gap-2.5 p-3 rounded-xl border-2 text-left transition cursor-pointer ${
                                        data.group === 'Pelayanan_Keperawatan'
                                            ? 'border-emerald-500 bg-emerald-50/80 ring-1 ring-emerald-500 text-slate-900'
                                            : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                                    }`}
                                >
                                    <span className={`h-2.5 w-2.5 mt-1 rounded-full shrink-0 ${data.group === 'Pelayanan_Keperawatan' ? 'bg-emerald-600' : 'bg-slate-300'}`} />
                                    <div>
                                        <span className="text-xs font-black">Pelayanan & Keperawatan</span>
                                        <p className="mt-0.5 text-[10px] text-slate-500">
                                            Bidang pelayanan medik, keperawatan, dan penunjang medik/diklit (Unit Pengusul Belanja).
                                        </p>
                                    </div>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setData('group', 'Umum_Kepegawaian')}
                                    className={`flex items-start gap-2.5 p-3 rounded-xl border-2 text-left transition cursor-pointer ${
                                        data.group === 'Umum_Kepegawaian'
                                            ? 'border-blue-500 bg-blue-50/80 ring-1 ring-blue-500 text-slate-900'
                                            : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                                    }`}
                                >
                                    <span className={`h-2.5 w-2.5 mt-1 rounded-full shrink-0 ${data.group === 'Umum_Kepegawaian' ? 'bg-blue-600' : 'bg-slate-300'}`} />
                                    <div>
                                        <span className="text-xs font-black">Umum, Ren & Keuangan</span>
                                        <p className="mt-0.5 text-[10px] text-slate-500">
                                            Bagian perencanaan program, keuangan/akuntansi, dan tata usaha RSJ Tampan.
                                        </p>
                                    </div>
                                </button>
                            </div>
                            {errors.group && (
                                <p className="mt-1 text-xs font-bold text-rose-600">{errors.group}</p>
                            )}
                        </div>
                    </div>
                </form>

                {/* Modal Footer */}
                <div className="shrink-0 border-t-2 border-slate-200 bg-gradient-to-r from-slate-50 via-emerald-50/40 to-slate-50 px-6 py-4">
                    <div className="flex items-center justify-end gap-2.5">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={processing}
                            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-100 transition cursor-pointer"
                        >
                            Batal
                        </button>

                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={processing}
                            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 px-5 py-2 text-xs font-black text-white shadow-md transition disabled:opacity-50 cursor-pointer"
                        >
                            {processing ? (
                                <>
                                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Menyimpan...
                                </>
                            ) : (
                                <>
                                    <span>{isEdit ? 'Simpan Perubahan' : 'Simpan Divisi'}</span>
                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                    </svg>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </Modal>
    );
}

