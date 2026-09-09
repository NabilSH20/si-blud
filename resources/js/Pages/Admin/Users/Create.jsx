import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useMemo } from 'react';

export default function Create({ divisions = [] }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        role: 'divisi',
        division_id: '',
        unit_id: '',
    });

    const isDivisiRole = data.role === 'divisi';

    const selectedDivision = useMemo(() => {
        return divisions.find((d) => String(d.id) === String(data.division_id));
    }, [divisions, data.division_id]);

    const availableUnits = useMemo(() => {
        return selectedDivision?.units || [];
    }, [selectedDivision]);

    const submit = (e) => {
        e.preventDefault();
        post(route('users.store'));
    };

    return (
        <AdminLayout>
            <Head title="Tambah Pengguna Baru - E-BLUD RSJ Tampan" />

            <div className="mx-auto max-w-3xl space-y-6">
                {/* Back Link & Header */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <Link
                            href={route('users.index')}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition mb-2"
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                            </svg>
                            Kembali ke Daftar Pengguna
                        </Link>
                        <h2 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
                            Tambah Akun Pengguna Baru
                        </h2>
                        <p className="mt-1 text-xs text-slate-500 font-medium">
                            Buat akun staf baru untuk mengakses sistem E-BLUD RSJ Tampan sesuai hak akses perannya.
                        </p>
                    </div>
                </div>

                {/* Form Card */}
                <div className="overflow-hidden rounded-2xl border-2 border-slate-300 bg-white shadow-xs">
                    <div className="border-b-2 border-slate-200 bg-slate-100 px-6 py-4">
                        <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                            Formulir Akun Pengguna
                        </h3>
                    </div>

                    <form onSubmit={submit} className="p-6 space-y-5">
                        {/* Nama Lengkap */}
                        <div>
                            <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-slate-700">
                                Nama Lengkap <span className="text-rose-600">*</span>
                            </label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="Contoh: drg. Ahmad Fauzi / Ns. Siti Rahma"
                                className="block w-full rounded-xl border-2 border-slate-300 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-900 placeholder-slate-400 shadow-2xs transition focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                            />
                            {errors.name && (
                                <p className="mt-1.5 text-xs font-bold text-rose-600">
                                    {errors.name}
                                </p>
                            )}
                        </div>

                        {/* Email */}
                        <div>
                            <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-slate-700">
                                Alamat Email <span className="text-rose-600">*</span>
                            </label>
                            <input
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder="nama@rsjtampan.riau.go.id"
                                className="block w-full rounded-xl border-2 border-slate-300 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-900 placeholder-slate-400 shadow-2xs transition focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                            />
                            {errors.email && (
                                <p className="mt-1.5 text-xs font-bold text-rose-600">
                                    {errors.email}
                                </p>
                            )}
                        </div>

                        {/* Password */}
                        <div>
                            <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-slate-700">
                                Kata Sandi (Password) <span className="text-rose-600">*</span>
                            </label>
                            <input
                                type="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder="Minimal 8 karakter"
                                className="block w-full rounded-xl border-2 border-slate-300 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-900 placeholder-slate-400 shadow-2xs transition focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                            />
                            <p className="mt-1 text-[11px] font-medium text-slate-500">
                                Kata sandi minimal terdiri dari 8 karakter acak atau kombinasi.
                            </p>
                            {errors.password && (
                                <p className="mt-1.5 text-xs font-bold text-rose-600">
                                    {errors.password}
                                </p>
                            )}
                        </div>

                        {/* Role Dropdown */}
                        <div>
                            <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-slate-700">
                                Peran Akses (Role) <span className="text-rose-600">*</span>
                            </label>
                            <select
                                value={data.role}
                                onChange={(e) => setData('role', e.target.value)}
                                className="block w-full rounded-xl border-2 border-slate-300 bg-white px-3.5 py-2.5 text-sm font-bold text-slate-900 shadow-2xs transition focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                            >
                                <option value="divisi">Divisi (Pemohon Belanja E-BLUD)</option>
                                <option value="perencanaan">Perencanaan (Verifikator Barang & Spesifikasi)</option>
                                <option value="keuangan">Keuangan (Validator Pagu & Pemotong Anggaran)</option>
                                <option value="admin">Administrator (Master Data & Pengguna)</option>
                            </select>
                            {errors.role && (
                                <p className="mt-1.5 text-xs font-bold text-rose-600">
                                    {errors.role}
                                </p>
                            )}
                        </div>

                        {/* Bidang & Unit Kerja Section */}
                        <div className={`rounded-xl p-4 border-2 transition space-y-4 ${
                            isDivisiRole
                                ? 'border-blue-300 bg-blue-50/60'
                                : 'border-slate-200 bg-slate-50/50'
                        }`}>
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
                                        Bidang / Bagian {isDivisiRole && <span className="text-rose-600">*</span>}
                                    </label>
                                    {isDivisiRole && (
                                        <span className="text-[11px] font-bold text-blue-700">
                                            Wajib untuk Peran Divisi
                                        </span>
                                    )}
                                </div>

                                <select
                                    value={data.division_id}
                                    onChange={(e) => {
                                        const newDivId = e.target.value;
                                        setData((prev) => ({
                                            ...prev,
                                            division_id: newDivId,
                                            unit_id: '',
                                        }));
                                    }}
                                    className="block w-full rounded-xl border-2 border-slate-300 bg-white px-3.5 py-2.5 text-sm font-bold text-slate-900 shadow-2xs transition focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                                >
                                    <option value="">-- Pilih Bidang / Bagian --</option>
                                    {divisions.map((d) => (
                                        <option key={d.id} value={d.id}>
                                            [{d.division_code}] {d.name}
                                        </option>
                                    ))}
                                </select>

                                {errors.division_id && (
                                    <p className="mt-1.5 text-xs font-bold text-rose-600">
                                        {errors.division_id}
                                    </p>
                                )}
                            </div>

                            {/* Dependent Dropdown: Unit Kerja */}
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
                                        Unit Kerja / Instalasi {isDivisiRole && <span className="text-rose-600">*</span>}
                                    </label>
                                    {isDivisiRole && data.division_id && (
                                        <span className="text-[11px] font-semibold text-emerald-700">
                                            {availableUnits.length} Unit Tersedia
                                        </span>
                                    )}
                                </div>

                                <select
                                    value={data.unit_id}
                                    onChange={(e) => setData('unit_id', e.target.value)}
                                    disabled={!data.division_id}
                                    className="block w-full rounded-xl border-2 border-slate-300 bg-white px-3.5 py-2.5 text-sm font-bold text-slate-900 shadow-2xs transition focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 disabled:bg-slate-100 disabled:text-slate-400"
                                >
                                    <option value="">
                                        {!data.division_id
                                            ? '-- Pilih Bidang Terlebih Dahulu --'
                                            : availableUnits.length === 0
                                            ? '-- Tidak ada unit kerja pada bidang ini --'
                                            : '-- Pilih Unit Kerja / Instalasi --'}
                                    </option>
                                    {availableUnits.map((u) => (
                                        <option key={u.id} value={u.id}>
                                            [{u.unit_code}] {u.name}
                                        </option>
                                    ))}
                                </select>

                                {errors.unit_id && (
                                    <p className="mt-1.5 text-xs font-bold text-rose-600">
                                        {errors.unit_id}
                                    </p>
                                )}
                            </div>

                            <p className="text-[11px] font-medium text-slate-500 leading-relaxed">
                                {isDivisiRole
                                    ? 'Pilih Bidang terlebih dahulu, kemudian tentukan Unit Kerja tempat staf bertugas agar pengajuan belanja otomatis teridentifikasi dengan tepat.'
                                    : 'Opsional. Peran Admin, Perencanaan, dan Keuangan beroperasi di tingkat rumah sakit.'}
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-end gap-3 pt-4 border-t-2 border-slate-200">
                            <Link
                                href={route('users.index')}
                                className="rounded-xl border-2 border-slate-300 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 shadow-2xs transition hover:bg-slate-100"
                            >
                                Batal
                            </Link>

                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 text-xs font-black shadow-md transition focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50"
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
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                        </svg>
                                        Simpan Pengguna
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}

