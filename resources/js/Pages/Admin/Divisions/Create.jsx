import InputError from '@/Components/InputError';
import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        division_code: '',
        name: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('divisions.store'));
    };

    return (
        <AdminLayout>
            <Head title="Tambah Divisi - E-Req RSJ Tampan" />

            <div className="mx-auto max-w-3xl space-y-6">
                {/* Back Link & Header */}
                <div>
                    <Link
                        href={route('divisions.index')}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition mb-2"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                        </svg>
                        Kembali ke Master Divisi
                    </Link>
                    <h2 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
                        Tambah Divisi Baru
                    </h2>
                    <p className="mt-1 text-xs sm:text-sm text-slate-600 font-medium">
                        Lengkapi informasi kode dan nama unit kerja untuk ditambahkan ke sistem.
                    </p>
                </div>

                {/* Form Card */}
                <div className="overflow-hidden rounded-2xl border-2 border-slate-300 bg-white shadow-md">
                    <div className="border-b-2 border-slate-200 bg-slate-100 px-6 py-4">
                        <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                            Formulir Data Divisi
                        </h3>
                    </div>

                    <form onSubmit={submit} className="p-6 sm:p-8 space-y-5">
                        <div>
                            <label
                                htmlFor="division_code"
                                className="mb-1.5 block text-xs font-black uppercase tracking-wider text-slate-700"
                            >
                                Kode Divisi <span className="text-rose-600">*</span>
                            </label>
                            <input
                                id="division_code"
                                type="text"
                                value={data.division_code}
                                onChange={(e) =>
                                    setData('division_code', e.target.value.toUpperCase())
                                }
                                placeholder="CONTOH: IT-01 / POLI-JIWA"
                                className="block w-full rounded-xl border-2 border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-900 placeholder:text-slate-400 uppercase shadow-2xs transition-all duration-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/30"
                            />
                            <p className="mt-1.5 text-xs text-slate-500 font-medium">Kode unik identifikasi divisi atau instalasi.</p>
                            <InputError message={errors.division_code} className="mt-1.5 font-bold text-rose-600" />
                        </div>

                        <div>
                            <label
                                htmlFor="name"
                                className="mb-1.5 block text-xs font-black uppercase tracking-wider text-slate-700"
                            >
                                Nama Divisi / Instalasi <span className="text-rose-600">*</span>
                            </label>
                            <input
                                id="name"
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="Contoh: Instalasi Teknologi Informasi & Komunikasi"
                                className="block w-full rounded-xl border-2 border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 placeholder:text-slate-400 shadow-2xs transition-all duration-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/30"
                            />
                            <InputError message={errors.name} className="mt-1.5 font-bold text-rose-600" />
                        </div>

                        <div className="flex items-center justify-end gap-3 border-t-2 border-slate-200 pt-6">
                            <Link
                                href={route('divisions.index')}
                                className="rounded-xl border-2 border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 shadow-2xs transition hover:bg-slate-100 active:scale-95"
                            >
                                Batal
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 px-6 py-2.5 text-sm font-black text-white shadow-md hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50"
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
                                    'Simpan Divisi'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}
