import { Link } from '@inertiajs/react';

export default function GuestLayout({ children, wide = false }) {
    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center overflow-x-hidden bg-slate-100 p-4 antialiased sm:p-6 lg:p-8">
            {/* Soft Hospital Background Watermark */}
            <div className="fixed inset-0 -z-20 overflow-hidden">
                <img
                    src="/images/bg.jpeg"
                    alt="Gedung RSJ Tampan"
                    className="h-full w-full object-cover object-center filter blur-[1px] opacity-10"
                />
            </div>

            {/* Light Clean Backdrop Overlay */}
            <div className="fixed inset-0 -z-10 bg-slate-100/90" />

            {/* Main Content Area */}
            <div className={`w-full transition-all duration-200 ${wide ? 'max-w-4xl' : 'max-w-md'}`}>
                {wide ? (
                    children
                ) : (
                    <>
                        {/* Brand Header for standard cards */}
                        <div className="mb-6 flex flex-col items-center text-center">
                            <Link href="/" className="group flex flex-col items-center gap-2">
                                <div className="rounded-2xl bg-white p-2.5 shadow-sm border border-slate-200 transition group-hover:border-emerald-300">
                                    <img
                                        src="/images/logo-vertikal-rsj.png"
                                        alt="Logo RSJ Tampan"
                                        className="h-14 w-auto object-contain"
                                    />
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold tracking-tight text-slate-800">
                                        E-BLUD <span className="text-emerald-700">RSJ Tampan</span>
                                    </h1>
                                    <p className="text-xs text-slate-500">
                                        Sistem Informasi Perencanaan & Penganggaran BLUD
                                    </p>
                                </div>
                            </Link>
                        </div>

                        {/* Standard Content Card */}
                        <div className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-md shadow-slate-900/5 sm:p-8">
                            {children}
                        </div>
                    </>
                )}
            </div>

            {/* Clean, Simple Footer */}
            <footer className="mt-8 text-center text-xs text-slate-500">
                <p>&copy; {new Date().getFullYear()} RSJ Tampan Provinsi Riau &bull; Sistem E-BLUD</p>
            </footer>
        </div>
    );
}
