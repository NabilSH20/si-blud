import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useMemo, useState } from 'react';

export default function Create({ divisions = [] }) {
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        name: '',
        nip: '',
        email: '',
        position: '',
        phone: '',
        password: '',
        role: 'divisi',
        division_id: '',
        unit_id: '',
        is_active: true,
    });

    const isDivisiRole = data.role === 'divisi';

    // 3 Bidang Pengusul Pengadaan Resmi RSJ Tampan
    const requesterDivisionCodes = ['MEDIK', 'RAWAT', 'PENUNJANG_DIKLIT', 'YAN', 'PENUNJANG'];

    const selectableDivisions = useMemo(() => {
        if (isDivisiRole) {
            return divisions.filter((d) =>
                requesterDivisionCodes.includes(d.division_code)
            );
        }
        return divisions;
    }, [divisions, isDivisiRole]);

    const selectedDivision = useMemo(() => {
        return divisions.find((d) => String(d.id) === String(data.division_id));
    }, [divisions, data.division_id]);

    const availableUnits = useMemo(() => {
        return selectedDivision?.units || [];
    }, [selectedDivision]);

    const handleRoleChange = (newRole) => {
        let newDivisionId = data.division_id;
        let newUnitId = data.unit_id;

        if (newRole === 'perencanaan') {
            const renDiv = divisions.find((d) => d.division_code === 'REN');
            if (renDiv) {
                newDivisionId = String(renDiv.id);
                newUnitId = renDiv.units?.[0]?.id ? String(renDiv.units[0].id) : '';
            }
        } else if (newRole === 'keuangan') {
            const keuDiv = divisions.find((d) => d.division_code === 'KEU');
            if (keuDiv) {
                newDivisionId = String(keuDiv.id);
                newUnitId = keuDiv.units?.[0]?.id ? String(keuDiv.units[0].id) : '';
            }
        } else if (newRole === 'admin') {
            const tuDiv = divisions.find((d) => d.division_code === 'TU');
            if (tuDiv) {
                newDivisionId = String(tuDiv.id);
                newUnitId = tuDiv.units?.[0]?.id ? String(tuDiv.units[0].id) : '';
            }
        } else if (newRole === 'divisi') {
            if (!selectedDivision || !requesterDivisionCodes.includes(selectedDivision.division_code)) {
                newDivisionId = '';
                newUnitId = '';
            }
        }

        setData((prev) => ({
            ...prev,
            role: newRole,
            division_id: newDivisionId,
            unit_id: newUnitId,
        }));
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('users.store'));
    };

    return (
        <AdminLayout>
            <Head title="Tambah Pengguna Baru - E-BLUD RSJ Tampan" />

            <div className="mx-auto max-w-2xl space-y-6">
                {/* Back Link & Header */}
                <div>
                    <Link
                        href={route('users.index')}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-teal-800 transition mb-3"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                        </svg>
                        Kembali ke Daftar Pengguna
                    </Link>
                    <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                        Tambah Pengguna Baru
                    </h2>
                    <p className="mt-1 text-xs sm:text-sm text-slate-500">
                        Lengkapi formulir untuk membuat akun staf atau penugasan baru di sistem E-BLUD RSJ Tampan.
                    </p>
                </div>

                {/* Form Card */}
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
                    <form onSubmit={submit} className="p-6 space-y-6">
                        {/* Section 1: Identitas Pegawai */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-teal-800">
                                    1. Identitas Pegawai
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                        Nama Lengkap & Gelar <span className="text-rose-600">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Contoh: dr. Hendra, Sp.KJ"
                                        autoFocus
                                        className="block w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition"
                                        required
                                    />
                                    {errors.name && (
                                        <p className="mt-1 text-xs text-rose-600 font-medium">{errors.name}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                        NIP Pegawai <span className="text-slate-400 font-normal">(Opsional)</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.nip}
                                        maxLength={30}
                                        onChange={(e) => setData('nip', e.target.value.replace(/\s+/g, ''))}
                                        placeholder="18 digit NIP jika ASN"
                                        className="block w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-mono text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition"
                                    />
                                    {errors.nip && (
                                        <p className="mt-1 text-xs text-rose-600 font-medium">{errors.nip}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                        Alamat Email <span className="text-rose-600">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="nama@rsjtampan.riau.go.id"
                                        className="block w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition"
                                        required
                                    />
                                    {errors.email && (
                                        <p className="mt-1 text-xs text-rose-600 font-medium">{errors.email}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                        No. WhatsApp / HP <span className="text-slate-400 font-normal">(Opsional)</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        placeholder="0812xxxxxxxx"
                                        className="block w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition"
                                    />
                                    {errors.phone && (
                                        <p className="mt-1 text-xs text-rose-600 font-medium">{errors.phone}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                    Jabatan / Penugasan <span className="text-slate-400 font-normal">(Opsional)</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.position}
                                    onChange={(e) => setData('position', e.target.value)}
                                    placeholder="Contoh: Kepala Instalasi Farmasi / Karu IGD / Staf Pelayanan"
                                    className="block w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition"
                                />
                                {errors.position && (
                                    <p className="mt-1 text-xs text-rose-600 font-medium">{errors.position}</p>
                                )}
                            </div>
                        </div>

                        {/* Section 2: Hak Akses & Penugasan */}
                        <div className="space-y-4 pt-2">
                            <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-teal-800">
                                    2. Hak Akses & Penugasan
                                </h3>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                    Peran Pengguna (Hak Akses) <span className="text-rose-600">*</span>
                                </label>
                                <select
                                    value={data.role}
                                    onChange={(e) => handleRoleChange(e.target.value)}
                                    className="block w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition"
                                    required
                                >
                                    <option value="divisi">Unit Pemohon (Instalasi / Ruangan)</option>
                                    <option value="perencanaan">Bagian Perencanaan</option>
                                    <option value="keuangan">Bagian Keuangan</option>
                                    <option value="admin">Administrator SIM-RS</option>
                                </select>
                                {errors.role && (
                                    <p className="mt-1 text-xs text-rose-600 font-medium">{errors.role}</p>
                                )}
                            </div>

                            {isDivisiRole ? (
                                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                                Bidang Pengusul <span className="text-rose-600">*</span>
                                            </label>
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
                                                className="block w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs sm:text-sm text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition"
                                                required={isDivisiRole}
                                            >
                                                <option value="">-- Pilih Bidang Pengusul --</option>
                                                {selectableDivisions.map((d) => (
                                                    <option key={d.id} value={d.id}>
                                                        {d.name}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.division_id && (
                                                <p className="mt-1 text-xs text-rose-600 font-medium">
                                                    {errors.division_id}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                                Unit Kerja / Ruangan <span className="text-rose-600">*</span>
                                            </label>
                                            <select
                                                value={data.unit_id}
                                                onChange={(e) => setData('unit_id', e.target.value)}
                                                disabled={!data.division_id}
                                                className="block w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs sm:text-sm text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition disabled:bg-slate-100 disabled:text-slate-400"
                                                required={isDivisiRole}
                                            >
                                                <option value="">
                                                    {!data.division_id
                                                        ? '-- Pilih Bidang Terlebih Dahulu --'
                                                        : availableUnits.length === 0
                                                        ? '-- Tidak ada unit pada bidang ini --'
                                                        : '-- Pilih Unit Kerja / Ruangan --'}
                                                </option>
                                                {availableUnits.map((u) => (
                                                    <option key={u.id} value={u.id}>
                                                        {u.name}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.unit_id && (
                                                <p className="mt-1 text-xs text-rose-600 font-medium">
                                                    {errors.unit_id}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="rounded-xl border border-teal-100 bg-teal-50/50 px-3.5 py-2.5 text-xs text-teal-800 flex items-center gap-2">
                                    <svg className="h-4 w-4 shrink-0 text-teal-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>
                                        {data.role === 'perencanaan' && 'Akun ini bertugas memverifikasi usulan belanja dan menyusun RBA.'}
                                        {data.role === 'keuangan' && 'Akun ini bertugas mengelola pagu kas BLUD dan pencairan dana.'}
                                        {data.role === 'admin' && 'Akun ini memiliki hak akses administrator sistem penuh.'}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Section 3: Kata Sandi & Status */}
                        <div className="space-y-4 pt-2">
                            <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-teal-800">
                                    3. Kata Sandi & Status
                                </h3>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                    Kata Sandi <span className="text-rose-600">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="Minimal 8 karakter"
                                        className="block w-full rounded-xl border border-slate-300 bg-white pl-3.5 pr-10 py-2.5 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                                        title={showPassword ? 'Sembunyikan sandi' : 'Lihat sandi'}
                                    >
                                        {showPassword ? (
                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                            </svg>
                                        ) : (
                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                                <p className="mt-1 text-[11px] text-slate-500">
                                    Gunakan minimal 8 karakter untuk keamanan akun.
                                </p>
                                {errors.password && (
                                    <p className="mt-1 text-xs text-rose-600 font-medium">{errors.password}</p>
                                )}
                            </div>

                            <div className="pt-1">
                                <label className="inline-flex items-center gap-2.5 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={data.is_active}
                                        onChange={(e) => setData('is_active', e.target.checked)}
                                        className="h-4 w-4 rounded-md border-slate-300 text-teal-600 focus:ring-teal-500"
                                    />
                                    <div>
                                        <span className="text-xs font-semibold text-slate-800">
                                            Akun Aktif (Dapat Login ke Sistem)
                                        </span>
                                        <p className="text-[11px] text-slate-500">
                                            Hilangkan centang jika pegawai sedang cuti panjang atau non-aktif.
                                        </p>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                            <Link
                                href={route('users.index')}
                                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                            >
                                Batal
                            </Link>

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
                                    <span>Simpan Pengguna</span>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}
