import SuperAdminLayout from '@/Layouts/SuperAdminLayout';
import { Head, useForm } from '@inertiajs/react';
import {
    Building2,
    CheckCircle2,
    FileText,
    Save,
    Settings,
    Shield,
    UserCheck,
} from 'lucide-react';

export default function Index({ settings = [], grouped_settings = {}, success }) {
    // Flatten settings array to key-value object for form initial state
    const initialValues = {};
    settings.forEach((s) => {
        initialValues[s.key_name] = s.value || '';
    });

    const { data, setData, post, processing } = useForm({
        settings: initialValues,
    });

    const handleFieldChange = (key, val) => {
        setData('settings', {
            ...data.settings,
            [key]: val,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('superadmin.settings.update'));
    };

    return (
        <SuperAdminLayout>
            <Head title="Pengaturan Dokumen Cetak - Super Admin SIM-RS" />

            <div className="space-y-6">
                {/* 1. Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                                Konfigurasi Global & Dokumen Cetak
                            </h1>
                            <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 border border-indigo-200 px-2 py-0.5 text-xs font-bold text-indigo-700">
                                <Shield className="h-3 w-3" />
                                Dynamic Master
                            </span>
                        </div>
                        <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
                            Atur nama Direktur, NIP pejabat penandatangan RBA/LRA/Surplus-Defisit, dan kop surat resmi rumah sakit secara dinamis.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={processing}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 px-5 py-2.5 text-xs font-bold text-white shadow-2xs transition cursor-pointer self-start sm:self-auto disabled:opacity-50"
                    >
                        <Save className="h-4 w-4" />
                        <span>{processing ? 'Menyimpan...' : 'Simpan Semua Pengaturan'}</span>
                    </button>
                </div>

                {/* Alerts */}
                {success && (
                    <div className="flex items-center gap-3 rounded-2xl border border-emerald-300 bg-emerald-50 p-4 text-xs font-bold text-emerald-900 shadow-xs">
                        <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                        <span>{success}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Section 1: Kop Surat & Identitas RS */}
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs">
                        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-200/80 mb-5">
                            <div className="rounded-xl bg-indigo-50 p-2 text-indigo-700 border border-indigo-200">
                                <Building2 className="h-4 w-4" />
                            </div>
                            <div>
                                <h2 className="text-sm sm:text-base font-bold text-slate-900">
                                    1. Identitas Rumah Sakit & Kop Surat Cetak
                                </h2>
                                <p className="text-xs text-slate-500">
                                    Data ini dicetak pada bagian kepala (header kop surat) seluruh laporan RBA, LRA, kuitansi, dan nota dinas.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                    Nama Instansi / Rumah Sakit
                                </label>
                                <input
                                    type="text"
                                    value={data.settings.hospital_name || ''}
                                    onChange={(e) => handleFieldChange('hospital_name', e.target.value)}
                                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-900 focus:border-indigo-500 shadow-2xs"
                                    placeholder="Contoh: Rumah Sakit Jiwa Tampan Provinsi Riau"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                    Alamat Lengkap Instansi
                                </label>
                                <textarea
                                    rows={2}
                                    value={data.settings.hospital_address || ''}
                                    onChange={(e) => handleFieldChange('hospital_address', e.target.value)}
                                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-medium text-slate-800 focus:border-indigo-500 shadow-2xs"
                                    placeholder="Contoh: Jl. H.R. Soebrantas Km. 12.5, Panam, Pekanbaru, Riau"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                    Nomor Telepon / Fax
                                </label>
                                <input
                                    type="text"
                                    value={data.settings.hospital_phone || ''}
                                    onChange={(e) => handleFieldChange('hospital_phone', e.target.value)}
                                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-medium text-slate-800 focus:border-indigo-500 shadow-2xs"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                    Email Resmi
                                </label>
                                <input
                                    type="email"
                                    value={data.settings.hospital_email || ''}
                                    onChange={(e) => handleFieldChange('hospital_email', e.target.value)}
                                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-medium text-slate-800 focus:border-indigo-500 shadow-2xs"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                    Website Resmi
                                </label>
                                <input
                                    type="text"
                                    value={data.settings.hospital_website || ''}
                                    onChange={(e) => handleFieldChange('hospital_website', e.target.value)}
                                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-medium text-slate-800 focus:border-indigo-500 shadow-2xs"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                    Kota Penetapan Dokumen Cetak
                                </label>
                                <input
                                    type="text"
                                    value={data.settings.city_name || ''}
                                    onChange={(e) => handleFieldChange('city_name', e.target.value)}
                                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-medium text-slate-800 focus:border-indigo-500 shadow-2xs"
                                    placeholder="Contoh: Pekanbaru"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Pejabat Penandatangan Resmi */}
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-xs">
                        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-200/80 mb-5">
                            <div className="rounded-xl bg-emerald-50 p-2 text-emerald-700 border border-emerald-200">
                                <UserCheck className="h-4 w-4" />
                            </div>
                            <div>
                                <h2 className="text-sm sm:text-base font-bold text-slate-900">
                                    2. Pejabat Penandatangan Resmi (Official Signers)
                                </h2>
                                <p className="text-xs text-slate-500">
                                    Nama dan NIP yang otomatis tercetak pada kolom tanda tangan dokumen RBA, LRA, Surplus-Defisit, dan SP2D.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4 text-xs">
                            {/* 1. Direktur */}
                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                                <span className="font-bold text-indigo-900 uppercase tracking-wider text-[11px] block mb-3 flex items-center gap-1.5">
                                    <span className="h-2 w-2 rounded-full bg-indigo-600" />
                                    A. Direktur Rumah Sakit Jiwa Tampan
                                </span>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                            Nama Lengkap & Gelar
                                        </label>
                                        <input
                                            type="text"
                                            value={data.settings.director_name || ''}
                                            onChange={(e) => handleFieldChange('director_name', e.target.value)}
                                            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-900 focus:border-indigo-500 shadow-2xs"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                            NIP Direktur
                                        </label>
                                        <input
                                            type="text"
                                            value={data.settings.director_nip || ''}
                                            onChange={(e) => handleFieldChange('director_nip', e.target.value)}
                                            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-mono text-slate-900 focus:border-indigo-500 shadow-2xs"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                            Jabatan Resmi
                                        </label>
                                        <input
                                            type="text"
                                            value={data.settings.director_title || ''}
                                            onChange={(e) => handleFieldChange('director_title', e.target.value)}
                                            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-700 focus:border-indigo-500 shadow-2xs"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* 2. Kabag Perencanaan */}
                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                                <span className="font-bold text-indigo-900 uppercase tracking-wider text-[11px] block mb-3 flex items-center gap-1.5">
                                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                                    B. Pejabat Verifikator Perencanaan (Kabag Ren)
                                </span>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                            Nama Lengkap & Gelar
                                        </label>
                                        <input
                                            type="text"
                                            value={data.settings.planning_head_name || ''}
                                            onChange={(e) => handleFieldChange('planning_head_name', e.target.value)}
                                            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-900 focus:border-indigo-500 shadow-2xs"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                            NIP Pejabat
                                        </label>
                                        <input
                                            type="text"
                                            value={data.settings.planning_head_nip || ''}
                                            onChange={(e) => handleFieldChange('planning_head_nip', e.target.value)}
                                            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-mono text-slate-900 focus:border-indigo-500 shadow-2xs"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                            Jabatan Resmi
                                        </label>
                                        <input
                                            type="text"
                                            value={data.settings.planning_head_title || ''}
                                            onChange={(e) => handleFieldChange('planning_head_title', e.target.value)}
                                            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-700 focus:border-indigo-500 shadow-2xs"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* 3. Bendahara Pengeluaran */}
                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                                <span className="font-bold text-indigo-900 uppercase tracking-wider text-[11px] block mb-3 flex items-center gap-1.5">
                                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                    C. Bendahara Pengeluaran BLUD
                                </span>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                            Nama Lengkap & Gelar
                                        </label>
                                        <input
                                            type="text"
                                            value={data.settings.treasurer_name || ''}
                                            onChange={(e) => handleFieldChange('treasurer_name', e.target.value)}
                                            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-900 focus:border-indigo-500 shadow-2xs"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                            NIP Bendahara
                                        </label>
                                        <input
                                            type="text"
                                            value={data.settings.treasurer_nip || ''}
                                            onChange={(e) => handleFieldChange('treasurer_nip', e.target.value)}
                                            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-mono text-slate-900 focus:border-indigo-500 shadow-2xs"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                                            Jabatan Resmi
                                        </label>
                                        <input
                                            type="text"
                                            value={data.settings.treasurer_title || ''}
                                            onChange={(e) => handleFieldChange('treasurer_title', e.target.value)}
                                            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-700 focus:border-indigo-500 shadow-2xs"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-end">
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white px-6 py-2.5 text-xs font-bold shadow-2xs transition cursor-pointer disabled:opacity-50"
                        >
                            <Save className="h-4 w-4" />
                            <span>{processing ? 'Menyimpan...' : 'Simpan Perubahan Pengaturan'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </SuperAdminLayout>
    );
}
