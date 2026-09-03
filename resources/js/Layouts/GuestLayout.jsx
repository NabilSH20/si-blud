import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center bg-slate-100/80 px-4 py-8 antialiased sm:px-6">
            {/* Ambient emerald background gradient effects */}
            <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
                <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[450px] w-[600px] rounded-full bg-emerald-100/60 blur-3xl" />
                <div className="absolute -bottom-40 right-10 h-[350px] w-[400px] rounded-full bg-teal-100/50 blur-3xl" />
            </div>

            {/* Brand Header */}
            <div className="mb-6 flex flex-col items-center text-center">
                <Link href="/" className="group flex flex-col items-center gap-3">
                    <img
                        src="/image/logo-vertikal-rsj.png"
                        alt="Logo RSJ Tampan"
                        className="h-20 sm:h-24 w-auto object-contain drop-shadow-md transition group-hover:scale-105"
                    />
                    <div>
                        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                            E-BLUD <span className="text-emerald-700">RSJ Tampan</span>
                        </h1>
                        <p className="text-xs font-semibold text-slate-500 mt-0.5">
                            Sistem Informasi Perencanaan & Keuangan E-BLUD
                        </p>
                    </div>
                </Link>
            </div>

            {/* Content Card */}
            <div className="w-full overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xl shadow-slate-200/50 sm:max-w-md sm:p-8">
                {children}
            </div>

            <p className="mt-8 text-center text-xs font-medium text-slate-400">
                &copy; {new Date().getFullYear()} RSJ Tampan Provinsi Riau. Hak Cipta Dilindungi.
            </p>
        </div>
    );
}
