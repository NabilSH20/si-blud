import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';

export default function ResetPassword({ token, email }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Reset Sandi - E-BLUD RSJ Tampan" />

            <div className="w-full overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xl shadow-teal-950/5">
                <div className="mb-6 text-center">
                    <h2 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight">
                        Atur Ulang Kata Sandi
                    </h2>
                    <p className="mt-1 text-xs text-slate-500">
                        Silakan buat kata sandi baru untuk akun Anda.
                    </p>
                </div>

                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <InputLabel htmlFor="email" value="Email" />

                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="mt-1 block w-full rounded-xl border-slate-200 bg-[#edf4fc] px-3.5 py-2.5 text-sm focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                            autoComplete="username"
                            onChange={(e) => setData('email', e.target.value)}
                        />

                        <InputError message={errors.email} className="mt-1.5" />
                    </div>

                    <div>
                        <InputLabel htmlFor="password" value="Kata Sandi Baru" />

                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            className="mt-1 block w-full rounded-xl border-slate-200 bg-[#edf4fc] px-3.5 py-2.5 text-sm focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                            autoComplete="new-password"
                            isFocused={true}
                            onChange={(e) => setData('password', e.target.value)}
                        />

                        <InputError message={errors.password} className="mt-1.5" />
                    </div>

                    <div>
                        <InputLabel
                            htmlFor="password_confirmation"
                            value="Konfirmasi Kata Sandi"
                        />

                        <TextInput
                            type="password"
                            id="password_confirmation"
                            name="password_confirmation"
                            value={data.password_confirmation}
                            className="mt-1 block w-full rounded-xl border-slate-200 bg-[#edf4fc] px-3.5 py-2.5 text-sm focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                            autoComplete="new-password"
                            onChange={(e) =>
                                setData('password_confirmation', e.target.value)
                            }
                        />

                        <InputError
                            message={errors.password_confirmation}
                            className="mt-1.5"
                        />
                    </div>

                    <div className="pt-2">
                        <PrimaryButton
                            className="w-full justify-center rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 py-2.5 text-sm font-bold text-white shadow-xs transition cursor-pointer"
                            disabled={processing}
                        >
                            Simpan Kata Sandi Baru
                        </PrimaryButton>
                    </div>
                </form>
            </div>
        </GuestLayout>
    );
}
