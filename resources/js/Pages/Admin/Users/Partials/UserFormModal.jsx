import Modal from '@/Components/Modal';
import InputError from '@/Components/InputError';
import { useForm } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';

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
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [clientErrors, setClientErrors] = useState({});

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
            setClientErrors({});
            setPasswordConfirmation('');
            setShowPassword(false);
            setShowConfirmPassword(false);
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
                division_id: user.division_id ? String(user.division_id) : '',
                unit_id: user.unit_id ? String(user.unit_id) : '',
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
        setPasswordConfirmation('');
        setClientErrors({});
        setShowPassword(false);
        setShowConfirmPassword(false);
        clearErrors();
    }, [isVisible, user]);

    const isDivisiRole = data.role === 'divisi';

    // Bidang Pengusul Pengadaan Resmi RSJ Tampan (Pelayanan & Keperawatan)
    const requesterDivisionCodes = ['MEDIK', 'RAWAT', 'PENUNJANG_DIKLIT', 'YAN', 'PENUNJANG'];

    const selectableDivisions = useMemo(() => {
        if (isDivisiRole) {
            return divisions.filter((d) =>
                d.group === 'Pelayanan_Keperawatan' || requesterDivisionCodes.includes(d.division_code)
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

    // Role options with subtext and icons
    const roleOptions = [
        {
            id: 'divisi',
            name: 'Unit Pemohon',
            subtext: 'Instalasi / Ruangan',
            icon: (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
            ),
        },
        {
            id: 'perencanaan',
            name: 'Perencanaan',
            subtext: 'RBA & Verifikasi',
            icon: (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
                </svg>
            ),
        },
        {
            id: 'keuangan',
            name: 'Keuangan',
            subtext: 'Pencairan & Kas',
            icon: (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6H2.25m0 0v1.5a.75.75 0 00.75.75H3m0 0a60.08 60.08 0 0118 0m0 0a.75.75 0 00.75-.75V6m0 0H21a.75.75 0 00-.75-.75V4.5m-3 14.25v-2.625c0-.621-.504-1.125-1.125-1.125H7.875c-.621 0-1.125.504-1.125 1.125v2.625m12 0a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 18.75m12 0h-9" />
                </svg>
            ),
        },
        {
            id: 'admin',
            name: 'Administrator',
            subtext: 'Master Sistem',
            icon: (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
            ),
        },
    ];

    // Otomatis sesuaikan division_id saat role berubah
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
            if (!selectedDivision || (!requesterDivisionCodes.includes(selectedDivision.division_code) && selectedDivision.group !== 'Pelayanan_Keperawatan')) {
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

    const handlePasswordChange = (val) => {
        setData('password', val);
        if (passwordConfirmation && val !== passwordConfirmation) {
            setClientErrors((prev) => ({
                ...prev,
                password_confirmation: 'Konfirmasi kata sandi tidak cocok.',
            }));
        } else {
            setClientErrors((prev) => {
                const updated = { ...prev };
                delete updated.password_confirmation;
                return updated;
            });
        }
    };

    const handleConfirmPasswordChange = (val) => {
        setPasswordConfirmation(val);
        if (data.password && val !== data.password) {
            setClientErrors((prev) => ({
                ...prev,
                password_confirmation: 'Konfirmasi kata sandi tidak cocok.',
            }));
        } else {
            setClientErrors((prev) => {
                const updated = { ...prev };
                delete updated.password_confirmation;
                return updated;
            });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setClientErrors({});

        // Validasi client-side konfirmasi password
        if (data.password) {
            if (data.password.length < 8) {
                setClientErrors({ password: 'Kata sandi minimal 8 karakter.' });
                return;
            }
            if (data.password !== passwordConfirmation) {
                setClientErrors({ password_confirmation: 'Konfirmasi kata sandi tidak cocok.' });
                return;
            }
        } else if (!isEdit) {
            setClientErrors({ password: 'Kata sandi wajib diisi.' });
            return;
        }

        if (isEdit) {
            put(route('users.update', user.id), {
                preserveScroll: true,
                onSuccess: () => {
                    reset();
                    setPasswordConfirmation('');
                    onClose();
                },
            });
        } else {
            post(route('users.store'), {
                preserveScroll: true,
                onSuccess: () => {
                    reset();
                    setPasswordConfirmation('');
                    onClose();
                },
            });
        }
    };

    return (
        <Modal show={isVisible} onClose={onClose} maxWidth="3xl">
            <div className="flex flex-col bg-white rounded-2xl overflow-hidden shadow-2xl">
                {/* 1. Header Minimalis Putih */}
                <div className="shrink-0 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-3.5">
                    <div>
                        <h2 className="text-base sm:text-lg font-bold text-slate-900">
                            {isEdit ? 'Ubah Data Pengguna' : 'Tambah Pengguna Baru'}
                        </h2>
                        <p className="mt-0.5 text-xs text-slate-500">
                            {isEdit
                                ? 'Perbarui identitas profil pegawai, hak akses peran, atau kredensial akun'
                                : 'Lengkapi peran akses, profil pegawai, dan kredensial login SIM-RS'}
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

                {/* 2. Form Body (Compact & Clean 2-Column Desktop Grid) */}
                <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                    <div className="p-6 space-y-5 overflow-y-auto max-h-[82vh]">
                        {/* BAGIAN ATAS: Pilihan Peran dengan Interactive Role Cards */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                                    Pilih Peran Pengguna (Hak Akses) <span className="text-rose-600">*</span>
                                </label>
                                <span className="text-[11px] text-slate-400">Klik salah satu peran</span>
                            </div>

                            {/* 4-Column Grid Radio Cards */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                                {roleOptions.map((r) => {
                                    const isSelected = data.role === r.id;
                                    return (
                                        <button
                                            key={r.id}
                                            type="button"
                                            onClick={() => handleRoleChange(r.id)}
                                            className={`relative flex flex-col items-start p-3 rounded-xl border text-left transition cursor-pointer ${
                                                isSelected
                                                    ? 'border-teal-600 bg-teal-50/70 ring-2 ring-teal-600 text-teal-950 shadow-xs'
                                                    : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-700'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between w-full mb-1.5">
                                                <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                                    {r.icon}
                                                </div>
                                                {isSelected && (
                                                    <span className="flex h-2 w-2 rounded-full bg-teal-600 animate-pulse" />
                                                )}
                                            </div>
                                            <span className="text-xs font-bold block text-slate-900 leading-tight">
                                                {r.name}
                                            </span>
                                            <span className="text-[10px] text-slate-500 block mt-0.5 font-medium">
                                                {r.subtext}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                            <InputError message={errors.role} className="mt-1" />

                            {/* Kotak Bidang & Unit jika role === 'divisi' */}
                            {isDivisiRole ? (
                                <div className="rounded-xl border border-teal-200 bg-teal-50/50 p-3.5 space-y-2.5">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-teal-950 flex items-center gap-1.5">
                                            <svg className="h-3.5 w-3.5 text-teal-700" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                            </svg>
                                            Penugasan Bidang & Unit Pemohon Belanja
                                        </span>
                                        <span className="text-[10px] font-semibold text-teal-800 bg-teal-100/80 px-2 py-0.5 rounded-md">
                                            Wajib Diisi
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                        {/* Dropdown Bidang Pengusul */}
                                        <div>
                                            <label className="block text-xs font-medium text-slate-700 mb-1">
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
                                                className="block w-full h-10 rounded-xl border border-slate-300 bg-white pl-3.5 pr-9 py-2 text-xs sm:text-sm text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition truncate"
                                                required={isDivisiRole}
                                            >
                                                <option value="">-- Pilih Bidang Pengusul --</option>
                                                {selectableDivisions.map((d) => (
                                                    <option key={d.id} value={d.id}>
                                                        [{d.division_code}] {d.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <InputError message={errors.division_id} className="mt-1" />
                                        </div>

                                        {/* Dropdown Unit Kerja */}
                                        <div>
                                            <label className="block text-xs font-medium text-slate-700 mb-1">
                                                Unit Kerja / Ruangan <span className="text-rose-600">*</span>
                                            </label>
                                            <select
                                                value={data.unit_id}
                                                onChange={(e) => setData('unit_id', e.target.value)}
                                                disabled={!data.division_id}
                                                className="block w-full h-10 rounded-xl border border-slate-300 bg-white pl-3.5 pr-9 py-2 text-xs sm:text-sm text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition disabled:bg-slate-100 disabled:text-slate-400 truncate"
                                                required={isDivisiRole}
                                            >
                                                <option value="">
                                                    {!data.division_id
                                                        ? '-- Pilih Bidang Terlebih Dahulu --'
                                                        : availableUnits.length === 0
                                                        ? '-- Tidak Ada Unit di Bidang Ini --'
                                                        : '-- Pilih Unit Kerja / Ruangan --'}
                                                </option>
                                                {availableUnits.map((u) => (
                                                    <option key={u.id} value={u.id}>
                                                        [{u.unit_code}] {u.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <InputError message={errors.unit_id} className="mt-1" />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2 text-xs text-slate-600 flex items-center justify-between">
                                    <span className="flex items-center gap-1.5 font-medium">
                                        <svg className="h-4 w-4 text-teal-600 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span>
                                            {data.role === 'perencanaan' && 'Penugasan: Bagian Perencanaan (REN) — Verifikasi Usulan & RBA'}
                                            {data.role === 'keuangan' && 'Penugasan: Bagian Keuangan (KEU) — Verifikator Pagu & Kas BLUD'}
                                            {data.role === 'admin' && 'Penugasan: Bagian Tata Usaha (TU) — Administrator Sistem'}
                                        </span>
                                    </span>
                                    <span className="text-[11px] font-semibold text-slate-400">Bidang & Unit Otomatis</span>
                                </div>
                            )}
                        </div>

                        {/* BAGIAN BAWAH: Grid 2 Kolom Sejajar (Kiri & Kanan) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
                            {/* PANEL KIRI: Profil & Identitas Pegawai */}
                            <div className="space-y-3.5">
                                <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
                                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                                        <svg className="h-3.5 w-3.5 text-teal-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                                        </svg>
                                        1. Profil & Identitas Pegawai
                                    </span>
                                </div>

                                {/* Nama Lengkap & Gelar */}
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">
                                        Nama Lengkap & Gelar <span className="text-rose-600">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Contoh: dr. Hendra, Sp.KJ / Ns. Budi, S.Kep"
                                        autoFocus
                                        className="block w-full h-10 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition"
                                        required
                                    />
                                    <InputError message={errors.name} className="mt-1" />
                                </div>

                                {/* Jabatan / Penugasan */}
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <label className="block text-xs font-medium text-slate-700">
                                            Jabatan / Penugasan
                                        </label>
                                        <span className="text-[10px] text-slate-400">Opsional</span>
                                    </div>
                                    <input
                                        type="text"
                                        value={data.position}
                                        onChange={(e) => setData('position', e.target.value)}
                                        placeholder="Contoh: Kepala Instalasi / Karu IGD / Staf"
                                        className="block w-full h-10 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition"
                                    />
                                    <InputError message={errors.position} className="mt-1" />
                                </div>

                                {/* Grid 2 Kolom NIP & No HP */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <div className="flex items-center justify-between mb-1">
                                            <label className="block text-xs font-medium text-slate-700">
                                                NIP Pegawai
                                            </label>
                                            <span className="text-[10px] text-slate-400">Opsional</span>
                                        </div>
                                        <input
                                            type="text"
                                            value={data.nip}
                                            maxLength={30}
                                            onChange={(e) => setData('nip', e.target.value.replace(/\s+/g, ''))}
                                            placeholder="18 digit ASN"
                                            className="block w-full h-10 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-mono text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition"
                                        />
                                        <InputError message={errors.nip} className="mt-1" />
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between mb-1">
                                            <label className="block text-xs font-medium text-slate-700">
                                                No. WhatsApp / HP
                                            </label>
                                            <span className="text-[10px] text-slate-400">Opsional</span>
                                        </div>
                                        <input
                                            type="text"
                                            value={data.phone}
                                            onChange={(e) => setData('phone', e.target.value)}
                                            placeholder="0812xxxxxxxx"
                                            className="block w-full h-10 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition"
                                        />
                                        <InputError message={errors.phone} className="mt-1" />
                                    </div>
                                </div>
                            </div>

                            {/* PANEL KANAN: Kredensial Login & Status Akun */}
                            <div className="space-y-3.5">
                                <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
                                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                                        <svg className="h-3.5 w-3.5 text-teal-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                                        </svg>
                                        2. Kredensial Login & Status
                                    </span>
                                </div>

                                {/* Alamat Email */}
                                <div>
                                    <label className="block text-xs font-medium text-slate-700 mb-1">
                                        Alamat Email (ID Login) <span className="text-rose-600">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="nama@rsjtampan.riau.go.id"
                                        className="block w-full h-10 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition"
                                        required
                                    />
                                    <InputError message={errors.email} className="mt-1" />
                                </div>

                                {/* Grid Password & Konfirmasi Password */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {/* Kata Sandi */}
                                    <div>
                                        <div className="flex items-center justify-between mb-1">
                                            <label className="block text-xs font-medium text-slate-700">
                                                {isEdit ? 'Sandi Baru' : <>Kata Sandi <span className="text-rose-600">*</span></>}
                                            </label>
                                            {isEdit && <span className="text-[10px] text-slate-400">Boleh Kosong</span>}
                                        </div>
                                        <div className="relative">
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                value={data.password}
                                                onChange={(e) => handlePasswordChange(e.target.value)}
                                                placeholder={isEdit ? 'Kosongkan jika tetap' : 'Min. 8 karakter'}
                                                className="block w-full h-10 rounded-xl border border-slate-300 bg-white pl-3 pr-9 py-2 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition"
                                                required={!isEdit}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400 hover:text-slate-600 transition cursor-pointer"
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
                                        <InputError message={errors.password || clientErrors.password} className="mt-1" />
                                    </div>

                                    {/* Konfirmasi Kata Sandi */}
                                    <div>
                                        <div className="flex items-center justify-between mb-1">
                                            <label className="block text-xs font-medium text-slate-700">
                                                {isEdit ? 'Ulangi Sandi' : <>Ulangi Sandi <span className="text-rose-600">*</span></>}
                                            </label>
                                            {isEdit && <span className="text-[10px] text-slate-400">Jika diubah</span>}
                                        </div>
                                        <div className="relative">
                                            <input
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                value={passwordConfirmation}
                                                onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                                                placeholder={isEdit ? 'Ulangi jika diubah' : 'Ulangi sandi'}
                                                className={`block w-full h-10 rounded-xl border bg-white pl-3 pr-9 py-2 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none transition ${
                                                    clientErrors.password_confirmation
                                                        ? 'border-rose-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                                                        : 'border-slate-300 focus:border-teal-500 focus:ring-1 focus:ring-teal-500'
                                                }`}
                                                required={!isEdit && Boolean(data.password)}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                                                title={showConfirmPassword ? 'Sembunyikan sandi' : 'Lihat sandi'}
                                            >
                                                {showConfirmPassword ? (
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
                                        {clientErrors.password_confirmation && (
                                            <p className="mt-1 text-[11px] text-rose-600 font-medium">
                                                {clientErrors.password_confirmation}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Status Akun Toggle Card */}
                                <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-100/60 transition cursor-pointer select-none">
                                    <div>
                                        <span className="text-xs font-bold text-slate-800 block">
                                            Akun Aktif (Dapat Login)
                                        </span>
                                        <p className="text-[11px] text-slate-500 mt-0.5">
                                            Beri centang agar akun dapat mengakses SIM-RS.
                                        </p>
                                    </div>
                                    <div className="relative inline-flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={data.is_active}
                                            onChange={(e) => setData('is_active', e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-10 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* 3. Modal Footer Actions */}
                    <div className="shrink-0 flex items-center justify-end gap-2.5 border-t border-slate-100 bg-slate-50/60 px-6 py-3.5">
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
                                <span>{isEdit ? 'Simpan Perubahan' : 'Simpan Pengguna'}</span>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
