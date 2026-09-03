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
                <Link href="/" className="group flex flex-col items-center gap-2.5">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 text-white shadow-lg shadow-emerald-500/25 ring-4 ring-white transition group-hover:scale-105">
                        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
                            E-Req <span className="text-emerald-600">RSJ Tampan</span>
                        </h1>
                        <p className="text-xs font-medium text-slate-500">
                            Sistem Pengajuan & Verifikasi Requisition Terpadu
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
