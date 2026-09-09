import Modal from '@/Components/Modal';
import { useForm } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';

export default function UserFormModal({
    show = false,
    isOpen = false,
    onClose = () => {},
    user = null,
    divisions = [],
}) {
    const isVisible = Boolean(show || isOpen);
    const isEdit = Boolean(user && user.id);
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
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

    useEffect(() => {
        if (!isVisible) {
            clearErrors();
            return;
        }

        if (user) {
            setData({
                name: user.name || '',
                nip: user.nip || '',
                email: user.email || '',
                position: user.position || '',
                phone: user.phone || '',
                password: '',
                role: user.role || 'divisi',
                division_id: user.division_id || '',
                unit_id: user.unit_id || '',
                is_active: user.is_active ?? true,
            });
        } else {
            setData({
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
        }
        setShowPassword(false);
        clearErrors();
    }, [isVisible, user]);

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

    // Otomatis arahkan division jika role manajerial dipilih
    const handleRoleChange = (newRole) => {
        let newDivisionId = data.division_id;
        let newUnitId = data.unit_id;

        if (newRole === 'perencanaan') {
            const renDiv = divisions.find((d) => d.division_code === 'REN');
            if (renDiv) {
                newDivisionId = renDiv.id;
                newUnitId = renDiv.units?.[0]?.id || '';
            }
        } else if (newRole === 'keuangan') {
            const keuDiv = divisions.find((d) => d.division_code === 'KEU');
            if (keuDiv) {
                newDivisionId = keuDiv.id;
                newUnitId = keuDiv.units?.[0]?.id || '';
            }
        } else if (newRole === 'admin') {
            const tuDiv = divisions.find((d) => d.division_code === 'TU');
            if (tuDiv) {
                newDivisionId = tuDiv.id;
                newUnitId = tuDiv.units?.[0]?.id || '';
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

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validasi input awal
        if (!data.name.trim() || !data.email.trim() || (!isEdit && !data.password)) {
            Swal.fire({
                icon: 'warning',
                title: 'Data Belum Lengkap',
                text: 'Harap isi Nama Lengkap, Email Kedinasan, dan Kata Sandi.',
                confirmButtonColor: '#059669',
            });
            return;
        }

        if (isDivisiRole && (!data.division_id || !data.unit_id)) {
            Swal.fire({
                icon: 'warning',
                title: 'Bidang & Unit Wajib Dipilih',
                text: 'Untuk peran Unit Pemohon, Bidang Pengusul dan Unit Kerja wajib dipilih.',
                confirmButtonColor: '#059669',
            });
            return;
        }

        const roleLabels = {
            divisi: 'Unit Pemohon Pengadaan',
            perencanaan: 'Bagian Perencanaan (RBA & Verifikasi)',
            keuangan: 'Bagian Keuangan & Kas BLUD',
            admin: 'Administrator SIM-RS',
        };

        const titleText = isEdit
            ? 'Simpan Perubahan Pengguna?'
            : 'Tambah Pengguna Baru?';
        const confirmBtnText = isEdit ? 'Ya, Simpan Perubahan' : 'Ya, Tambahkan Pengguna';

        Swal.fire({
            title: titleText,
            html: `
                <div class="text-left text-xs sm:text-sm space-y-2 mt-2">
                    <p><strong>Nama:</strong> ${data.name}</p>
                    ${data.nip ? `<p><strong>NIP:</strong> <span class="font-mono font-bold text-emerald-800">${data.nip}</span></p>` : ''}
                    <p><strong>Email:</strong> ${data.email}</p>
                    <p><strong>Peran (Role):</strong> <span class="font-bold text-emerald-700">${roleLabels[data.role] || data.role}</span></p>
                    ${selectedDivision ? `<p><strong>Bidang:</strong> ${selectedDivision.name}</p>` : ''}
                    ${data.unit_id ? `<p><strong>Unit Kerja:</strong> ${availableUnits.find((u) => String(u.id) === String(data.unit_id))?.name || '-'}</p>` : ''}
                    <p><strong>Status Akun:</strong> <span class="font-bold ${data.is_active ? 'text-emerald-700' : 'text-rose-600'}">${data.is_active ? 'Aktif' : 'Non-Aktif'}</span></p>
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
                    put(route('users.update', user.id), {
                        preserveScroll: true,
                        onSuccess: () => {
                            reset();
                            onClose();
                        },
                    });
                } else {
                    post(route('users.store'), {
                        preserveScroll: true,
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
        <Modal show={isVisible} onClose={onClose} maxWidth="2xl">
            <div className="flex flex-col max-h-[92vh]">
                {/* Modal Header */}
                <div className="shrink-0 border-b border-emerald-100 bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 px-6 py-4 text-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-xl font-bold backdrop-blur-xs border border-white/20">
                                👤
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h2 className="text-base sm:text-lg font-black tracking-tight">
                                        {isEdit ? `Ubah Pengguna: ${user?.name || ''}` : 'Formulir Tambah Pengguna / Pegawai'}
                                    </h2>
                                </div>
                                <p className="text-xs text-emerald-100/90 font-medium">
                                    RSJ Tampan Prov. Riau &bull; Hak Akses & Penugasan Unit E-BLUD
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

                {/* Modal Form Body */}
                <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-slate-50/50">
                        {/* Section 1: Data Identitas Pegawai & Kontak */}
                        <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-xs space-y-4">
                            <div className="border-b border-slate-100 pb-2">
                                <h4 className="text-xs font-black uppercase tracking-wider text-emerald-900 flex items-center gap-2">
                                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-[10px] text-emerald-800 font-bold">1</span>
                                    Identitas Pegawai & Kontak Kedinasan
                                </h4>
                            </div>

                            {/* Baris 1: Nama Lengkap & NIP */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-slate-700">
                                        Nama Lengkap & Gelar <span className="text-rose-600">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Contoh: dr. Hendra, Sp.KJ"
                                        className="block w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-900 placeholder-slate-400 shadow-2xs transition focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                                    />
                                    {errors.name && (
                                        <p className="mt-1.5 text-xs font-bold text-rose-600">
                                            {errors.name}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-slate-700">
                                        NIP Pegawai (Opsional)
                                    </label>
                                    <input
                                        type="text"
                                        value={data.nip}
                                        maxLength={30}
                                        onChange={(e) => setData('nip', e.target.value.replace(/\s+/g, ''))}
                                        placeholder="18 digit NIP (Contoh: 19850115...)"
                                        className="block w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-mono font-semibold text-slate-900 placeholder-slate-400 shadow-2xs transition focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                                    />
                                    {errors.nip && (
                                        <p className="mt-1.5 text-xs font-bold text-rose-600">
                                            {errors.nip}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Baris 2: Email & Jabatan */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="mb-1.5 block textN-xs font-black uppercase tracking-wider text-slate-700">
                                        Email Kedinasan <span className="text-rose-600">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="nama@rsjtampan.riau.go.id"
                                        className="block w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-900 placeholder-slate-400 shadow-2xs transition focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                                    />
                                    {errors.email && (
                                        <p className="mt-1.5 text-xs font-bold text-rose-600">
                                            {errors.email}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-slate-700">
                                        Jabatan / Penugasan
                                    </label>
                                    <input
                                        type="text"
                                        value={data.position}
                                        onChange={(e) => setData('position', e.target.value)}
                                        placeholder="Contoh: Kepala Instalasi Farmasi / Karu IGD"
                                        className="block w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-900 placeholder-slate-400 shadow-2xs transition focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                                    />
                                    {errors.position && (
                                        <p className="mt-1.5 text-xs font-bold text-rose-600">
                                            {errors.position}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Baris 3: No Telp/WhatsApp */}
                            <div>
                                <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-slate-700">
                                    No. WhatsApp / HP
                                </label>
                                <input
                                    type="text"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    placeholder="0812xxxxxxxx"
                                    className="block w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-900 placeholder-slate-400 shadow-2xs transition focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                                />
                                {errors.phone && (
                                    <p className="mt-1.5 text-xs font-bold text-rose-600">
                                        {errors.phone}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Section 2: Hak Akses & Penugasan Unit Kerja */}
                        <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-xs space-y-4">
                            <div className="border-b border-slate-100 pb-2">
                                <h4 className="text-xs font-black uppercase tracking-wider text-emerald-900 flex items-center gap-2">
                                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-[10px] text-emerald-800 font-bold">2</span>
                                    Peran Akses & Penugasan Struktur Organisasi
                                </h4>
                            </div>

                            {/* Role Pengguna */}
                            <div>
                                <label className="mb-1.5 block text-xs font-black uppercase tracking-wider text-slate-700">
                                    Peran Akses (Role) <span className="text-rose-600">*</span>
                                </label>
                                <select
                                    value={data.role}
                                    onChange={(e) => handleRoleChange(e.target.value)}
                                    className="block w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-bold text-slate-900 shadow-2xs transition focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                                >
                                    <option value="divisi">Unit / Ruangan Pemohon Pengadaan (Pelayanan Medik, Keperawatan, Penunjang & Diklit)</option>
                                    <option value="perencanaan">Bagian Perencanaan (Verifikator Usulan & Penyusun RBA)</option>
                                    <option value="keuangan">Bagian Keuangan (Pagu Kas BLUD & Realisasi)</option>
                                    <option value="admin">Administrator SIM-RS (Pengelola User & Master Data)</option>
                                </select>
                                {errors.role && (
                                    <p className="mt-1.5 text-xs font-bold text-rose-600">
                                        {errors.role}
                                    </p>
                                )}
                            </div>

                            {/* Dependent Dropdown: Bidang & Unit Kerja */}
                            <div className={`rounded-xl p-4 border transition space-y-4 ${
                                isDivisiRole
                                    ? 'border-blue-200 bg-blue-50/50'
                                    : 'border-slate-200 bg-slate-50/60'
                            }`}>
                                {/* Bidang */}
                                <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
                                            {isDivisiRole ? 'Bidang Pengusul Pengadaan' : 'Bidang / Bagian'} {isDivisiRole && <span className="text-rose-600">*</span>}
                                        </label>
                                        {isDivisiRole && (
                                            <span className="text-[11px] font-bold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-md">
                                                3 Bidang Pengusul Resmi
                                            </span>
                                        )}
                                    </div>

                                    <select
                                        value={data.division_id}
                                        disabled={!isDivisiRole}
                                        onChange={(e) => {
                                            const newDivId = e.target.value;
                                            setData((prev) => ({
                                                ...prev,
                                                division_id: newDivId,
                                                unit_id: '',
                                            }));
                                        }}
                                        className="block w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-bold text-slate-900 shadow-2xs transition focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 disabled:bg-slate-100 disabled:text-slate-600"
                                    >
                                        <option value="">-- Pilih Bidang Pengusul --</option>
                                        {selectableDivisions.map((d) => (
                                            <option key={d.id} value={d.id}>
                                                {d.name} [{d.division_code}]
                                            </option>
                                        ))}
                                    </select>

                                    {errors.division_id && (
                                        <p className="mt-1.5 text-xs font-bold text-rose-600">
                                            {errors.division_id}
                                        </p>
                                    )}
                                </div>

                                {/* Unit Kerja (Filtered) */}
                                <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
                                            Unit Kerja / Instalasi / Ruangan {isDivisiRole && <span className="text-rose-600">*</span>}
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
                                        className="block w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-bold text-slate-900 shadow-2xs transition focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 disabled:bg-slate-100 disabled:text-slate-400"
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
                                                {u.name} [{u.unit_code}]
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
                                        ? 'Khusus akun pemohon pengadaan, pilih salah satu dari 3 Bidang (Pelayanan Medik, Keperawatan, Penunjang Medik & Diklit), lalu tentukan Unit Kerja agar pengadaan barang/jasa otomatis teridentifikasi.'
                                        : 'Peran manajerial (Perencanaan, Keuangan, Admin) terhubung langsung ke bagian operasionalnya masing-masing.'}
                                </p>
                            </div>
                        </div>

                        {/* Section 3: Keamanan & Status Akun */}
                        <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-xs space-y-4">
                            <div className="border-b border-slate-100 pb-2">
                                <h4 className="text-xs font-black uppercase tracking-wider text-emerald-900 flex items-center gap-2">
                                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-[10px] text-emerald-800 font-bold">3</span>
                                    Autentikasi & Status Akun
                                </h4>
                            </div>

                            {/* Kata Sandi */}
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
                                        {isEdit ? 'Kata Sandi Baru (Opsional)' : <>Kata Sandi <span className="text-rose-600">*</span></>}
                                    </label>
                                    {isEdit && (
                                        <span className="text-[11px] font-medium text-slate-400">
                                            Kosongkan jika tidak diubah
                                        </span>
                                    )}
                                </div>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder={isEdit ? 'Tetap gunakan kata sandi lama' : 'Minimal 8 karakter'}
                                        className="block w-full rounded-xl border border-slate-300 bg-white pl-3.5 pr-10 py-2.5 text-sm font-semibold text-slate-900 placeholder-slate-400 shadow-2xs transition focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 transition cursor-pointer"
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
                                {errors.password && (
                                    <p className="mt-1.5 text-xs font-bold text-rose-600">
                                        {errors.password}
                                    </p>
                                )}
                            </div>

                            {/* Status Akun Aktif */}
                            <div className="flex items-center gap-3 pt-1">
                                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={data.is_active}
                                        onChange={(e) => setData('is_active', e.target.checked)}
                                        className="h-4 w-4 rounded-md border-slate-300 text-emerald-600 focus:ring-emerald-500"
                                    />
                                    <div>
                                        <span className="text-xs font-bold text-slate-800">
                                            Akun Aktif (Dapat Login ke Portal E-BLUD)
                                        </span>
                                        <p className="text-[11px] text-slate-500 font-medium">
                                            Jika dinonaktifkan, pegawai tidak dapat login ke sistem.
                                        </p>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Modal Footer */}
                    <div className="shrink-0 flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-100/80 px-6 py-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition cursor-pointer"
                        >
                            Batal
                        </button>

                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 px-6 py-2.5 text-xs font-black text-white shadow-md hover:shadow-lg transition disabled:opacity-50 cursor-pointer"
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
                                    {isEdit ? 'Simpan Perubahan' : 'Tambahkan Pengguna'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
