import Modal from '@/Components/Modal';
import InputError from '@/Components/InputError';
import { useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function DivisionFormModal({
    show = false,
    onClose = () => {},
    division = null,
}) {
    const isEdit = Boolean(division && division.id);
    const [isCodeCustom, setIsCodeCustom] = useState(false);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        division_code: '',
        name: '',
        group: 'Pelayanan_Keperawatan',
    });

    // Smart generator for acronym/code
    const generateCode = (nameStr) => {
        if (!nameStr) return '';
        const cleaned = nameStr
            .replace(/\b(bidang|bagian|divisi|sub|unit|rsj|tampan|dan)\b/gi, '')
            .trim();
        const words = cleaned.split(/\s+/).filter(Boolean);
        if (words.length === 0) {
            return nameStr.trim().substring(0, 8).toUpperCase();
        }
        if (words.length === 1) {
            return words[0].substring(0, 10).toUpperCase();
        }
        // If last word is distinct (e.g. "Pelayanan Medik" -> "MEDIK")
        const lastWord = words[words.length - 1];
        if (lastWord.length >= 3 && lastWord.length <= 8) {
            return lastWord.toUpperCase();
        }
        // Fallback to acronym of words
        return words.map((w) => w[0]).join('').toUpperCase().substring(0, 8);
    };

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
            setIsCodeCustom(true);
        } else {
            setData({
                division_code: '',
                name: '',
                group: 'Pelayanan_Keperawatan',
            });
            setIsCodeCustom(false);
        }
        clearErrors();
    }, [show, division]);

    const handleNameChange = (e) => {
        const val = e.target.value;
        setData((prev) => {
            const next = { ...prev, name: val };
            if (!isCodeCustom && !isEdit) {
                next.division_code = generateCode(val);
            }
            return next;
        });
    };

    const handleCodeChange = (e) => {
        setIsCodeCustom(true);
        setData('division_code', e.target.value.toUpperCase());
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (isEdit) {
            put(route('divisions.update', division.id), {
                preserveScroll: true,
                onSuccess: () => {
                    onClose();
                },
            });
        } else {
            post(route('divisions.store'), {
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
                {/* 1. Clean Minimalist Modal Header */}
                <div className="flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4">
                    <div>
                        <h2 className="text-base font-bold text-slate-900">
                            {isEdit ? 'Ubah Data Bagian / Bidang' : 'Tambah Bagian / Bidang Baru'}
                        </h2>
                        <p className="mt-0.5 text-xs text-slate-500">
                            Isi nama dan singkatan divisi untuk struktur organisasi RSJ Tampan
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

                {/* 2. Form Body (Clean & User-Friendly for Non-Tech Users) */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Field 1: Nama Bagian / Bidang */}
                    <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1.5">
                            Nama Bagian / Bidang <span className="text-rose-600">*</span>
                        </label>
                        <input
                            type="text"
                            value={data.name}
                            onChange={handleNameChange}
                            placeholder="Contoh: Bidang Pelayanan Medik"
                            className="block w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition"
                            autoFocus
                            required
                        />
                        <InputError message={errors.name} className="mt-1.5" />
                    </div>

                    {/* Field 2: Kode Singkatan Divisi */}
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="block text-xs font-medium text-slate-700">
                                Kode Singkatan <span className="text-rose-600">*</span>
                            </label>
                            <span className="text-[11px] text-slate-400">
                                Huruf kapital (maks. 10 karakter)
                            </span>
                        </div>
                        <div className="relative">
                            <input
                                type="text"
                                value={data.division_code}
                                onChange={handleCodeChange}
                                maxLength={15}
                                placeholder="Misal: MEDIK"
                                className="block w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-bold text-teal-800 uppercase placeholder-slate-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition"
                                required
                            />
                        </div>
                        <p className="mt-1 text-[11px] text-slate-500">
                            Singkatan untuk identitas berkas (otomatis terisi saat mengetik nama, tetap bisa diedit).
                        </p>
                        <InputError message={errors.division_code} className="mt-1.5" />
                    </div>

                    {/* Field 3: Kelompok Struktur Organisasi */}
                    <div>
                        <label className="block text-xs font-medium text-slate-700 mb-2">
                            Kelompok Bagian / Bidang
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {/* Pilihan 1: Pelayanan & Keperawatan */}
                            <button
                                type="button"
                                onClick={() => setData('group', 'Pelayanan_Keperawatan')}
                                className={`flex items-start gap-2.5 rounded-xl border p-3 text-left transition cursor-pointer ${
                                    data.group === 'Pelayanan_Keperawatan'
                                        ? 'border-teal-600 bg-teal-50/60 ring-1 ring-teal-600 text-teal-950'
                                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                                }`}
                            >
                                <span
                                    className={`mt-0.5 h-3 w-3 rounded-full shrink-0 ${
                                        data.group === 'Pelayanan_Keperawatan'
                                            ? 'bg-teal-600 ring-2 ring-teal-200'
                                            : 'bg-slate-300'
                                    }`}
                                />
                                <div>
                                    <span className="block text-xs font-bold text-slate-900">
                                        Pelayanan & Keperawatan
                                    </span>
                                    <span className="block mt-0.5 text-[11px] text-slate-500">
                                        Unit medis, ruang rawat, dan pelayanan pasien.
                                    </span>
                                </div>
                            </button>

                            {/* Pilihan 2: Umum, Ren & Keuangan */}
                            <button
                                type="button"
                                onClick={() => setData('group', 'Umum_Kepegawaian')}
                                className={`flex items-start gap-2.5 rounded-xl border p-3 text-left transition cursor-pointer ${
                                    data.group === 'Umum_Kepegawaian'
                                        ? 'border-teal-600 bg-teal-50/60 ring-1 ring-teal-600 text-teal-950'
                                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                                }`}
                            >
                                <span
                                    className={`mt-0.5 h-3 w-3 rounded-full shrink-0 ${
                                        data.group === 'Umum_Kepegawaian'
                                            ? 'bg-teal-600 ring-2 ring-teal-200'
                                            : 'bg-slate-300'
                                    }`}
                                />
                                <div>
                                    <span className="block text-xs font-bold text-slate-900">
                                        Umum & Keuangan
                                    </span>
                                    <span className="block mt-0.5 text-[11px] text-slate-500">
                                        Kantor tata usaha, perencanaan & keuangan.
                                    </span>
                                </div>
                            </button>
                        </div>
                        <InputError message={errors.group} className="mt-1.5" />
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
                                <span>{isEdit ? 'Simpan Perubahan' : 'Simpan Bagian'}</span>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
