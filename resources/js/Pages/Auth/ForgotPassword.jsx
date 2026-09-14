import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('password.email'));
    };

    return (
        <GuestLayout>
            <Head title="Lupa Sandi - E-BLUD RSJ Tampan" />

            <div className="w-full overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xl shadow-teal-950/5">
                <div className="mb-6 text-center">
                    <h2 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight">
                        Pemulihan Kata Sandi
                    </h2>
                    <p className="mt-1.5 text-xs text-slate-500">
                        Masukkan email akun kedinasan Anda. Tautan untuk menyetel ulang kata sandi akan dikirimkan ke email tersebut.
                    </p>
                </div>

                {status && (
                    <div className="mb-4 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-medium text-emerald-800">
                        {status}
                    </div>
                )}

                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="mb-1.5 block text-xs font-semibold text-slate-700">
                            Email
                        </label>
                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="block w-full rounded-xl border border-slate-200 bg-[#edf4fc] px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition"
                            isFocused={true}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="nama@rsjtampan.riau.go.id"
                        />
                        <InputError message={errors.email} className="mt-1.5" />
                    </div>

                    <div className="pt-2">
                        <PrimaryButton
                            className="w-full justify-center rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 py-2.5 text-sm font-bold text-white shadow-xs transition cursor-pointer"
                            disabled={processing}
                        >
                            Kirim Tautan Reset Sandi
                        </PrimaryButton>
                    </div>

                    <div className="pt-2 text-center">
                        <Link
                            href={route('login')}
                            className="text-xs font-semibold text-teal-700 hover:text-teal-800 hover:underline"
                        >
                            &larr; Kembali ke Halaman Masuk
                        </Link>
                    </div>
                </form>
            </div>
        </GuestLayout>
    );
}
