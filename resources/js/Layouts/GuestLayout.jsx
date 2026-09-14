import { Link } from '@inertiajs/react';

export default function GuestLayout({ children, wide = false }) {
    return (
        <div className="relative flex min-h-screen flex-col items-center justify-between overflow-hidden bg-gradient-to-br from-[#e8f7f4] via-[#f1faf8] to-[#e4f5f1] antialiased selection:bg-emerald-500 selection:text-white">
            {/* Background Medical Cross Pattern & Grid (Sehat IndonesiaKu Style) */}
            <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
                {/* Subtle Grid Lines */}
                <div
                    className="absolute inset-0 opacity-[0.45]"
                    style={{
                        backgroundImage: `
                            linear-gradient(to right, rgba(13, 148, 136, 0.07) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(13, 148, 136, 0.07) 1px, transparent 1px)
                        `,
                        backgroundSize: '48px 48px',
                    }}
                />

                {/* Soft Glowing Ambient Orbs */}
                <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-teal-200/35 blur-3xl" />
                <div className="absolute top-1/3 -right-20 h-96 w-96 rounded-full bg-emerald-200/30 blur-3xl" />
                <div className="absolute -bottom-20 left-1/4 h-80 w-80 rounded-full bg-teal-100/40 blur-2xl" />

                {/* Medical Cross Shapes (+) Translucent Watermarks */}
                {/* Large Cross Left */}
                <svg
                    className="absolute -left-12 top-1/4 h-72 w-72 text-white/70 drop-shadow-xs"
                    viewBox="0 0 100 100"
                    fill="currentColor"
                >
                    <path d="M38 12 h24 v26 h26 v24 h-26 v26 h-24 v-26 h-26 v-24 h26 z" />
                </svg>

                {/* Medium Cross Top Center */}
                <svg
                    className="absolute left-1/2 -translate-x-1/2 -top-10 h-48 w-48 text-white/50"
                    viewBox="0 0 100 100"
                    fill="currentColor"
                >
                    <path d="M38 12 h24 v26 h26 v24 h-26 v26 h-24 v-26 h-26 v-24 h26 z" />
                </svg>

                {/* Large Cross Right Bottom */}
                <svg
                    className="absolute -right-14 bottom-16 h-80 w-80 text-white/75 drop-shadow-xs"
                    viewBox="0 0 100 100"
                    fill="currentColor"
                >
                    <path d="M38 12 h24 v26 h26 v24 h-26 v26 h-24 v-26 h-26 v-24 h26 z" />
                </svg>

                {/* Small Accent Crosses */}
                <svg
                    className="absolute left-1/4 bottom-12 h-24 w-24 text-teal-600/10"
                    viewBox="0 0 100 100"
                    fill="currentColor"
                >
                    <path d="M38 12 h24 v26 h26 v24 h-26 v26 h-24 v-26 h-26 v-24 h26 z" />
                </svg>

                <svg
                    className="absolute right-1/4 top-16 h-28 w-28 text-emerald-600/10"
                    viewBox="0 0 100 100"
                    fill="currentColor"
                >
                    <path d="M38 12 h24 v26 h26 v24 h-26 v26 h-24 v-26 h-26 v-24 h26 z" />
                </svg>

                {/* Glowing Dot Motifs */}
                <div className="absolute top-1/2 right-1/3 h-8 w-8 rounded-full bg-white/70 shadow-inner" />
                <div className="absolute top-1/4 left-1/5 h-6 w-6 rounded-full bg-white/60 shadow-inner" />
            </div>

            {/* Top-Left Header Branding (Sehat IndonesiaKu Style) */}
            <header className="w-full px-6 pt-6 sm:px-10 sm:pt-8 relative z-20 flex items-center justify-between">
                <Link href="/" className="inline-flex items-center gap-3 group">
                    <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-white/90 p-1.5 shadow-xs border border-emerald-100/80 backdrop-blur-xs transition-transform group-hover:scale-105">
                        <img
                            src="/images/logo-vertikal-rsj.png"
                            alt="Logo RS Jiwa Tampan"
                            className="h-full w-auto object-contain"
                        />
                    </div>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <span className="text-base sm:text-lg font-black tracking-tight text-emerald-800 leading-none">
                                E-BLUD
                            </span>
                            {/* National Flag Bar Accent */}
                            <span
                                className="inline-flex h-2 w-7 overflow-hidden rounded-full border border-slate-300 shadow-2xs"
                                title="Republik Indonesia"
                            >
                                <span className="h-full w-1/2 bg-red-600" />
                                <span className="h-full w-1/2 bg-white" />
                            </span>
                        </div>
                        <span className="text-[10px] sm:text-xs font-black tracking-widest text-teal-700 uppercase mt-0.5 leading-none">
                            RS JIWA TAMPAN
                        </span>
                    </div>
                </Link>

                {/* Pemerintah Provinsi Riau Sub-Badge (Desktop) */}
                <div className="hidden sm:inline-flex items-center gap-2 rounded-full bg-white/80 backdrop-blur-xs px-3 py-1 text-xs font-semibold text-emerald-800 border border-emerald-100/80 shadow-2xs">
                    <span className="h-2 w-2 rounded-full bg-emerald-600" />
                    <span>Pemerintah Provinsi Riau</span>
                </div>
            </header>

            {/* Main Content Area (Centered Card) */}
            <main className="flex-1 w-full flex items-center justify-center px-4 py-8 relative z-10">
                <div className={`w-full transition-all duration-200 ${wide ? 'max-w-4xl' : 'max-w-[450px]'}`}>
                    {children}
                </div>
            </main>

            {/* Clean Institutional Footer */}
            <footer className="w-full pb-5 px-4 text-center text-xs text-slate-500 font-medium relative z-20">
                <p>
                    Copyright &copy; {new Date().getFullYear()} Pemerintah Provinsi Riau &bull; Rumah Sakit Jiwa Tampan &bull; Sistem E-BLUD
                </p>
            </footer>
        </div>
    );
}
