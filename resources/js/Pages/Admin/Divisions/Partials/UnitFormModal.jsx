import Modal from '@/Components/Modal';
import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import Swal from 'sweetalert2';

export default function UnitFormModal({
    show = false,
    onClose = () => {},
    unit = null,
    divisions = [],
    defaultDivisionId = '',
}) {
    const isEdit = Boolean(unit && unit.id);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        division_id: defaultDivisionId || '',
        unit_code: '',
        name: '',
        description: '',
    });

    useEffect(() => {
        if (!show) {
            clearErrors();
            return;
        }

        if (unit) {
            setData({
                division_id: unit.division_id || '',
                unit_code: unit.unit_code || '',
                name: unit.name || '',
                description: unit.description || '',
            });
        } else {
            setData({
                division_id: defaultDivisionId || (divisions[0]?.id ? String(divisions[0].id) : ''),
                unit_code: '',
                name: '',
                description: '',
            });
        }
        clearErrors();
    }, [show, unit, defaultDivisionId, divisions]);

    const selectedDivision = divisions.find((d) => String(d.id) === String(data.division_id));

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!data.division_id || !data.unit_code.trim() || !data.name.trim()) {
            Swal.fire({
                icon: 'warning',
                title: 'Data Belum Lengkap',
                text: 'Harap pilih Divisi Induk, serta isi Kode Unit dan Nama Unit Kerja.',
                confirmButtonColor: '#059669',
            });
            return;
        }

        const titleText = isEdit
            ? 'Simpan Perubahan Unit Kerja?'
            : 'Tambah Unit Kerja Baru?';
        const confirmBtnText = isEdit ? 'Ya, Simpan Perubahan' : 'Ya, Tambahkan Unit';

        Swal.fire({
            title: titleText,
            html: `
                <div class="text-left text-xs sm:text-sm space-y-2 mt-2">
                    <p><strong>Bidang / Divisi Induk:</strong> <span class="text-emerald-800 font-bold">${selectedDivision?.name || '-'}</span></p>
                    <p><strong>Kode Unit:</strong> <span class="font-mono font-bold text-emerald-700">${data.unit_code.toUpperCase()}</span></p>
                    <p><strong>Nama Unit / Instalasi:</strong> ${data.name}</p>
                    ${data.description ? `<p><strong>Deskripsi:</strong> ${data.description}</p>` : ''}
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
                    put(route('units.update', unit.id), {
                        onSuccess: () => {
                            onClose();
                        },
                    });
                } else {
                    post(route('units.store'), {
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
                                🏥
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h2 className="text-base sm:text-lg font-black tracking-tight">
                                        {isEdit
                                            ? `Ubah Unit: ${unit?.name || ''}`
                                            : 'Formulir Tambah Unit Kerja / Instalasi'}
                                    </h2>
                                </div>
                                <p className="text-xs text-emerald-100/90 font-medium">
                                    Unit Pemohon & Pelaksana Pelayanan RSJ Tampan Riau
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
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
                    <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-xs space-y-4">
                        {/* Pilih Divisi / Bidang Induk */}
                        <div>
                            <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-slate-700">
                                Bagian / Bidang Induk <span className="text-rose-600">*</span>
                            </label>
                            <select
                                value={data.division_id}
                                onChange={(e) => setData('division_id', e.target.value)}
                                className="block w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-bold text-slate-900 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                            >
                                <option value="">-- Pilih Bidang / Divisi Induk --</option>
                                {divisions.map((div) => (
                                    <option key={div.id} value={div.id}>
                                        [{div.division_code}] {div.name}
                                    </option>
                                ))}
                            </select>
                            {errors.division_id && (
                                <p className="mt-1 text-xs font-bold text-rose-600">{errors.division_id}</p>
                            )}
                        </div>

                        {/* Grid Kode Unit & Nama Unit */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                            <div>
                                <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-slate-700">
                                    Kode Unit <span className="text-rose-600">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.unit_code}
                                    onChange={(e) => setData('unit_code', e.target.value.toUpperCase())}
                                    placeholder="Contoh: FAR / IGD / RAD"
                                    className="block w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-black text-emerald-800 uppercase focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                                />
                                {errors.unit_code && (
                                    <p className="mt-1 text-xs font-bold text-rose-600">{errors.unit_code}</p>
                                )}
                            </div>

                            <div className="sm:col-span-2">
                                <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-slate-700">
                                    Nama Unit Kerja / Instalasi / Ruangan <span className="text-rose-600">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="Contoh: Instalasi Farmasi"
                                    className="block w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-bold text-slate-900 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                                />
                                {errors.name && (
                                    <p className="mt-1 text-xs font-bold text-rose-600">{errors.name}</p>
                                )}
                            </div>
                        </div>

                        {/* Deskripsi / Keterangan */}
                        <div>
                            <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-slate-700">
                                Deskripsi / Tugas Pokok Unit (Opsional)
                            </label>
                            <textarea
                                rows={3}
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                placeholder="Contoh: Pelayanan perbekalan obat dan bahan medis habis pakai untuk rawat inap dan jalan..."
                                className="block w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-900 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                            />
                            {errors.description && (
                                <p className="mt-1 text-xs font-bold text-rose-600">{errors.description}</p>
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
                                    <span>{isEdit ? 'Simpan Perubahan' : 'Simpan Unit Kerja'}</span>
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

