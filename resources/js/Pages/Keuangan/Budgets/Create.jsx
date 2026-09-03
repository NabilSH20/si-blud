import InputError from '@/Components/InputError';
import KeuanganLayout from '@/Layouts/KeuanganLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        account_code: '',
        account_name: '',
        period_year: new Date().getFullYear(),
        total_budget: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('budgets.store'));
    };

    return (
        <KeuanganLayout>
            <Head title="Tambah Pagu Anggaran - E-Req RSJ Tampan" />

            <div className="mx-auto max-w-3xl space-y-6">
                {/* Back Link & Header */}
                <div>
                    <Link
                        href={route('budgets.index')}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition mb-2"
                    >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                        </svg>
                        Kembali ke Pagu Anggaran
                    </Link>
                    <h2 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
                        Alokasi Pagu Anggaran Baru
                    </h2>
                    <p className="mt-1 text-xs sm:text-sm text-slate-600 font-medium">
                        Sisa pagu anggaran akan otomatis bernilai sama dengan total pagu saat rekening baru dibuat.
                    </p>
                </div>

                {/* Form Card */}
                <div className="overflow-hidden rounded-2xl border-2 border-slate-300 bg-white shadow-md">
                    <div className="border-b-2 border-slate-200 bg-slate-100 px-6 py-4">
                        <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                            Formulir Pagu Rekening Belanja
                        </h3>
                    </div>

                    <form onSubmit={submit} className="p-6 sm:p-8 space-y-5">
                        <div className="grid gap-5 sm:grid-cols-2">
                            <div>
                                <label
                                    htmlFor="account_code"
                                    className="mb-1.5 block text-xs font-black uppercase tracking-wider text-slate-700"
                                >
                                    Kode Rekening Belanja <span className="text-rose-600">*</span>
                                </label>
                                <input
                                    id="account_code"
                                    type="text"
                                    value={data.account_code}
                                    onChange={(e) =>
                                        setData('account_code', e.target.value)
                                    }
                                    placeholder="contoh: 5.2.02.01.0001"
                                    className="block w-full rounded-xl border-2 border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-900 shadow-2xs transition-all duration-200 placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/30"
                                />
                                <InputError message={errors.account_code} className="mt-1.5 font-bold text-rose-600" />
                            </div>

                            <div>
                                <label
                                    htmlFor="period_year"
                                    className="mb-1.5 block text-xs font-black uppercase tracking-wider text-slate-700"
                                >
                                    Tahun Anggaran (TA) <span className="text-rose-600">*</span>
                                </label>
                                <input
                                    id="period_year"
                                    type="number"
                                    min="2000"
                                    max="2100"
                                    value={data.period_year}
                                    onChange={(e) =>
                                        setData('period_year', e.target.value)
                                    }
                                    placeholder="2026"
                                    className="block w-full rounded-xl border-2 border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-900 shadow-2xs transition-all duration-200 placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/30"
                                />
                                <InputError message={errors.period_year} className="mt-1.5 font-bold text-rose-600" />
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="account_name"
                                className="mb-1.5 block text-xs font-black uppercase tracking-wider text-slate-700"
                            >
                                Nama Rekening Anggaran <span className="text-rose-600">*</span>
                            </label>
                            <input
                                id="account_name"
                                type="text"
                                value={data.account_name}
                                onChange={(e) =>
                                    setData('account_name', e.target.value)
                                }
                                placeholder="contoh: Belanja Alat Tulis Kantor (ATK) & Logistik"
                                className="block w-full rounded-xl border-2 border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-2xs transition-all duration-200 placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/30"
                            />
                            <InputError message={errors.account_name} className="mt-1.5 font-bold text-rose-600" />
                        </div>

                        <div>
                            <label
                                htmlFor="total_budget"
                                className="mb-1.5 block text-xs font-black uppercase tracking-wider text-slate-700"
                            >
                                Total Pagu Anggaran Disetujui <span className="text-rose-600">*</span>
                            </label>
                            <div className="relative rounded-xl shadow-2xs">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-xs font-black text-slate-500">
                                    Rp
                                </div>
                                <input
                                    id="total_budget"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={data.total_budget}
                                    onChange={(e) =>
                                        setData('total_budget', e.target.value)
                                    }
                                    placeholder="250000000"
                                    className="block w-full rounded-xl border-2 border-slate-300 bg-white pl-12 pr-4 py-2.5 text-sm font-black text-slate-900 transition-all duration-200 placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/30"
                                />
                            </div>
                            <InputError message={errors.total_budget} className="mt-1.5 font-bold text-rose-600" />
                        </div>

                        <div className="flex items-center justify-end gap-3 border-t-2 border-slate-200 pt-6">
                            <Link
                                href={route('budgets.index')}
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
                                    'Simpan Pagu Anggaran'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </KeuanganLayout>
    );
}
