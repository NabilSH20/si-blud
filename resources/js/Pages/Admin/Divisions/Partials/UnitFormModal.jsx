import Modal from '@/Components/Modal';
import InputError from '@/Components/InputError';
import { useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function UnitFormModal({
    show = false,
    onClose = () => {},
    unit = null,
    divisions = [],
    defaultDivisionId = '',
}) {
    const isEdit = Boolean(unit && unit.id);
    const [isCodeCustom, setIsCodeCustom] = useState(false);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        division_id: defaultDivisionId || '',
        unit_code: '',
        name: '',
        description: '',
    });

    // Generator cerdas singkatan kode unit
    const generateUnitCode = (nameStr) => {
        if (!nameStr) return '';
        const trimmed = nameStr.trim();
        const lower = trimmed.toLowerCase();

        // Singkatan umum rumah sakit / RSJ Tampan
        if (lower.includes('gawat darurat')) return 'IGD';
        if (lower.includes('rawat jalan')) return 'RAJAL';
        if (lower.includes('rawat inap')) return 'RANAP';
        if (lower.includes('laboratorium')) return 'LAB';
        if (lower.includes('radiologi')) return 'RADIOLOGI';
        if (lower.includes('farmasi')) return 'FARMASI';
        if (lower.includes('rekam med')) return 'REKAMMEDIS';
        if (lower.includes('intensif') || lower.includes('icu')) return 'ICU';
        if (lower.includes('gizi')) return 'GIZI';
        if (lower.includes('rehabilitasi')) return 'REHAB';
        if (lower.includes('fisioterapi')) return 'FISIO';
        if (lower.includes('keuangan')) return 'KEU';
        if (lower.includes('kepegawaian')) return 'KEPEGAWAIAN';
        if (lower.includes('perencanaan')) return 'REN';
        if (lower.includes('akuntansi')) return 'AKUNTANSI';
        if (lower.includes('logistik') || lower.includes('gudang')) return 'LOGISTIK';
        if (lower.includes('sanitasi') || lower.includes('kesling')) return 'KESLING';

        const cleaned = trimmed
            .replace(/\b(instalasi|ruang|ruangan|poli|poliklinik|unit|bagian|bidang|seksi|subbag|rsj|tampan|dan)\b/gi, '')
            .trim();
        const words = cleaned.split(/\s+/).filter(Boolean);

        if (words.length === 0) {
            return trimmed.replace(/\s+/g, '').substring(0, 10).toUpperCase();
        }
        if (words.length === 1) {
            return words[0].substring(0, 10).toUpperCase();
        }
        const firstWord = words[0];
        if (firstWord.length >= 3 && firstWord.length <= 6) {
            return firstWord.toUpperCase();
        }
        return words.map((w) => w[0]).join('').toUpperCase().substring(0, 8);
    };

    useEffect(() => {
        if (!show) {
            clearErrors();
            return;
        }

        if (unit) {
            setData({
                division_id: unit.division_id ? String(unit.division_id) : '',
                unit_code: unit.unit_code || '',
                name: unit.name || '',
                description: unit.description || '',
            });
            setIsCodeCustom(true);
        } else {
            setData({
                division_id: defaultDivisionId ? String(defaultDivisionId) : (divisions[0]?.id ? String(divisions[0].id) : ''),
                unit_code: '',
                name: '',
                description: '',
            });
            setIsCodeCustom(false);
        }
        clearErrors();
    }, [show, unit, defaultDivisionId, divisions]);

    const handleNameChange = (e) => {
        const val = e.target.value;
        setData((prev) => {
            const next = { ...prev, name: val };
            if (!isCodeCustom && !isEdit) {
                next.unit_code = generateUnitCode(val);
            }
            return next;
        });
    };

    const handleCodeChange = (e) => {
        setIsCodeCustom(true);
        setData('unit_code', e.target.value.toUpperCase());
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (isEdit) {
            put(route('units.update', unit.id), {
                preserveScroll: true,
                onSuccess: () => {
                    onClose();
                },
            });
        } else {
            post(route('units.store'), {
                preserveScroll: true,
                onSuccess: () => {
                    reset();
                    onClose();
                },
            });
        }
    };

    return (
        <Modal show={show} onClose={onClose} maxWidth="lg">
            <div className="flex flex-col bg-white rounded-2xl overflow-hidden shadow-xl">
                {/* 1. Minimalist White Header */}
                <div className="flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4">
                    <div>
                        <h2 className="text-base font-bold text-slate-900">
                            {isEdit ? 'Ubah Data Unit Kerja' : 'Tambah Unit Kerja Baru'}
                        </h2>
                        <p className="mt-0.5 text-xs text-slate-500">
                            Pilih bagian pengampu dan tentukan nama unit kerja atau ruangan
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer"
                        title="Tutup dialog"
                    >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* 2. Form Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Field 1: Bagian / Bidang Induk */}
                    <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1.5">
                            Bagian / Bidang Induk <span className="text-rose-600">*</span>
                        </label>
                        <select
                            value={data.division_id}
                            onChange={(e) => setData('division_id', e.target.value)}
                            className="block w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition"
                            required
                        >
                            <option value="">-- Pilih Bagian / Bidang Induk --</option>
                            {divisions.map((div) => (
                                <option key={div.id} value={div.id}>
                                    [{div.division_code}] {div.name}
                                </option>
                            ))}
                        </select>
                        <p className="mt-1 text-[11px] text-slate-500">
                            Bagian atau bidang yang membawahi unit kerja ini secara struktural.
                        </p>
                        <InputError message={errors.division_id} className="mt-1.5" />
                    </div>

                    {/* Field 2: Nama Unit Kerja / Ruangan */}
                    <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1.5">
                            Nama Unit Kerja / Ruangan <span className="text-rose-600">*</span>
                        </label>
                        <input
                            type="text"
                            value={data.name}
                            onChange={handleNameChange}
                            placeholder="Contoh: Instalasi Farmasi atau IGD"
                            className="block w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition"
                            autoFocus
                            required
                        />
                        <InputError message={errors.name} className="mt-1.5" />
                    </div>

                    {/* Field 3: Kode Singkatan Unit */}
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="block text-xs font-medium text-slate-700">
                                Kode Singkatan <span className="text-rose-600">*</span>
                            </label>
                            <span className="text-[11px] text-slate-400">
                                Huruf kapital (maks. 10 karakter)
                            </span>
                        </div>
                        <input
                            type="text"
                            value={data.unit_code}
                            onChange={handleCodeChange}
                            maxLength={15}
                            placeholder="Misal: FARMASI"
                            className="block w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-bold text-teal-800 uppercase placeholder-slate-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition"
                            required
                        />
                        <p className="mt-1 text-[11px] text-slate-500">
                            Singkatan untuk identitas berkas (otomatis terisi saat mengetik nama, tetap bisa diedit).
                        </p>
                        <InputError message={errors.unit_code} className="mt-1.5" />
                    </div>

                    {/* Field 4: Keterangan / Layanan (Opsional) */}
                    <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1.5">
                            Keterangan / Layanan <span className="text-slate-400 font-normal">(Opsional)</span>
                        </label>
                        <textarea
                            rows={2}
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            placeholder="Catatan tambahan mengenai unit ini (boleh dikosongkan jika tidak ada)..."
                            className="block w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition resize-none"
                        />
                        <p className="mt-1 text-[11px] text-slate-400">
                            Boleh dikosongkan jika tidak ada catatan khusus.
                        </p>
                        <InputError message={errors.description} className="mt-1.5" />
                    </div>

                    {/* 3. Modal Footer Actions */}
                    <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={processing}
                            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                        >
                            Batal
                        </button>

                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-95 px-5 py-2 text-xs font-bold text-white shadow-2xs transition disabled:opacity-50 cursor-pointer"
                        >
                            {processing ? (
                                <>
                                    <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    <span>Menyimpan...</span>
                                </>
                            ) : (
                                <span>{isEdit ? 'Simpan Perubahan' : 'Simpan Unit Kerja'}</span>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
