import Modal from '@/Components/Modal';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useMemo, useState } from 'react';

export default function Index({ divisions = [], success, error }) {
    const [search, setSearch] = useState('');
    const [confirmingDelete, setConfirmingDelete] = useState(null);

    const deleteForm = useForm();

    const filteredDivisions = useMemo(() => {
        if (!search.trim()) return divisions;
        const q = search.toLowerCase();
        return divisions.filter(
            (d) =>
                d.name?.toLowerCase().includes(q) ||
                d.division_code?.toLowerCase().includes(q),
        );
    }, [divisions, search]);

    const submitDelete = (e) => {
        e.preventDefault();
        if (!confirmingDelete) return;

        deleteForm.delete(route('divisions.destroy', confirmingDelete.id), {
            preserveScroll: true,
            onSuccess: () => setConfirmingDelete(null),
        });
    };

    return (
        <AdminLayout>
            <Head title="Master Divisi - RSJ Tampan" />

            {/* Header Section */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="flex items-center gap-2.5">
                        <h2 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
                            Master Data Divisi
                        </h2>
                        <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-900 border border-emerald-300">
                            {divisions.length} Unit Kerja
                        </span>
                    </div>
                    <p className="mt-1 text-xs font-semibold text-slate-500 sm:text-sm">
                        Kelola data unit kerja, instalasi, dan bagian yang berhak mengajukan belanja di sistem E-BLUD RSJ Tampan.
                    </p>
                </div>

                <Link
                    href={route('divisions.create')}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 px-5 py-2.5 text-sm font-bold text-white shadow-md hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Tambah Divisi
                </Link>
            </div>

            {/* Notification Alerts */}
            {success && (
                <div className="mb-5 flex items-center gap-3 rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-4 text-sm font-bold text-emerald-900 shadow-xs">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-200 text-emerald-900">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                    </div>
                    <p className="flex-1">{success}</p>
                </div>
            )}
            {error && (
                <div className="mb-5 flex items-center gap-3 rounded-2xl border-2 border-rose-300 bg-rose-50 p-4 text-sm font-bold text-rose-900 shadow-xs">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-rose-200 text-rose-900">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                        </svg>
                    </div>
                    <p className="flex-1">{error}</p>
                </div>
            )}

            {/* Table Container Card (Batas Jelas & Kontras Tinggi) */}
            <div className="overflow-hidden rounded-2xl border-2 border-slate-300 bg-white shadow-md">
                {/* Search & Filter Toolbar */}
                <div className="flex flex-col gap-3 border-b-2 border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative flex-1 sm:max-w-xs">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari kode atau nama divisi..."
                            className="block w-full rounded-xl border-2 border-slate-300 bg-white pl-9 pr-8 text-sm text-slate-900 placeholder-slate-400 font-medium transition-all duration-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/30"
                        />
                        {search && (
                            <button
                                type="button"
                                onClick={() => setSearch('')}
                                className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400 hover:text-slate-600"
                            >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>

                    <div className="text-sm text-slate-600 font-medium">
                        Menampilkan <span className="font-bold text-slate-900">{filteredDivisions.length}</span> dari {divisions.length} data
                    </div>
                </div>

                {/* Table Hidup dengan Garis Batas Kolom & Hover Interaktif */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y-2 divide-slate-200 border-collapse">
                        <thead className="bg-emerald-50/80 font-bold border-b-2 border-emerald-200">
                            <tr className="divide-x-2 divide-slate-200">
                                <th className="w-16 px-4 py-4 text-center text-sm font-black uppercase tracking-wider text-slate-800">
                                    No
                                </th>
                                <th className="w-48 px-6 py-4 text-left text-sm font-black uppercase tracking-wider text-slate-800">
                                    Kode Divisi
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-black uppercase tracking-wider text-slate-800">
                                    Nama Divisi / Instalasi
                                </th>
                                <th className="w-40 px-6 py-4 text-center text-sm font-black uppercase tracking-wider text-slate-800">
                                    Aksi
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y-2 divide-slate-200 bg-white">
                            {filteredDivisions.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-16 text-center bg-white">
                                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 border border-slate-200">
                                            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
                                            </svg>
                                        </div>
                                        <p className="mt-3 text-sm font-bold text-slate-800">
                                            {search ? 'Tidak ada divisi yang sesuai pencarian' : 'Belum ada data divisi'}
                                        </p>
                                        <p className="mt-1 text-xs text-slate-500 font-medium">
                                            {search
                                                ? 'Coba kata kunci lain atau bersihkan kotak pencarian.'
                                                : 'Mulai dengan menambahkan data divisi baru ke sistem.'}
                                        </p>
                                        {!search && (
                                            <Link
                                                href={route('divisions.create')}
                                                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition"
                                            >
                                                + Tambah Divisi Pertama
                                            </Link>
                                        )}
                                    </td>
                                </tr>
                            ) : (
                                filteredDivisions.map((division, idx) => (
                                    <tr
                                        key={division.id}
                                        className="divide-x-2 divide-slate-200 hover:bg-emerald-50/60 transition-colors duration-200 cursor-default"
                                    >
                                        <td className="whitespace-nowrap px-4 py-4 text-center text-sm font-bold text-slate-600 bg-slate-50/50">
                                            #{idx + 1}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4">
                                            <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-900 border border-emerald-300">
                                                {division.division_code}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-bold text-slate-900">
                                            {division.name}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <Link
                                                    href={route('divisions.edit', division.id)}
                                                    className="inline-flex items-center gap-1.5 rounded-xl border-2 border-slate-300 bg-white hover:bg-emerald-50 hover:border-emerald-500 hover:text-emerald-700 active:scale-95 px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs transition-all duration-200"
                                                >
                                                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                                    </svg>
                                                    Edit
                                                </Link>
                                                <button
                                                    type="button"
                                                    onClick={() => setConfirmingDelete(division)}
                                                    className="inline-flex items-center gap-1.5 rounded-xl border-2 border-transparent hover:border-rose-300 bg-white hover:bg-rose-50 hover:text-rose-700 active:scale-95 px-3 py-1.5 text-xs font-bold text-slate-500 transition-all duration-200"
                                                >
                                                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                                    </svg>
                                                    Hapus
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Konfirmasi Hapus */}
            <Modal
                show={confirmingDelete !== null}
                onClose={() => setConfirmingDelete(null)}
                maxWidth="md"
            >
                <form onSubmit={submitDelete} className="p-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 border border-rose-200">
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-base font-black text-slate-900">
                                Hapus Data Divisi?
                            </h3>
                            <p className="text-xs text-slate-500 font-medium">Tindakan ini tidak dapat dibatalkan.</p>
                        </div>
                    </div>

                    <div className="mt-4 rounded-xl bg-slate-100 p-3.5 text-xs text-slate-700 font-medium border border-slate-200">
                        Divisi <span className="font-bold text-slate-900">{confirmingDelete?.name}</span> ({confirmingDelete?.division_code}) akan dihapus dari sistem.
                    </div>

                    <div className="mt-6 flex justify-end gap-2.5">
                        <button
                            type="button"
                            onClick={() => setConfirmingDelete(null)}
                            className="rounded-xl border-2 border-slate-300 bg-white px-5 py-2 text-xs font-bold text-slate-700 shadow-2xs transition hover:bg-slate-100"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={deleteForm.processing}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-5 py-2 text-xs font-black text-white shadow-sm transition hover:bg-rose-700 active:scale-95 disabled:opacity-50"
                        >
                            {deleteForm.processing ? 'Menghapus...' : 'Ya, Hapus Divisi'}
                        </button>
                    </div>
                </form>
            </Modal>
        </AdminLayout>
    );
}
