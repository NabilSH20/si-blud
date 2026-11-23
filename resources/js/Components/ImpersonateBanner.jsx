import { router, usePage } from '@inertiajs/react';
import { AlertTriangle, LogOut, ShieldAlert } from 'lucide-react';

export default function ImpersonateBanner() {
    const { auth } = usePage().props;
    const impersonator = auth?.impersonator;
    const currentUser = auth?.user;

    if (!impersonator) {
        return null;
    }

    const handleLeave = () => {
        router.post(route('superadmin.impersonate.leave'));
    };

    return (
        <div className="sticky top-0 z-50 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white shadow-md border-b-2 border-amber-400/80 px-4 py-2">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-semibold">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-black/25 text-amber-100 ring-1 ring-white/30 animate-pulse">
                        <AlertTriangle className="h-4 w-4" />
                    </div>
                    <div>
                        <span className="font-black uppercase tracking-wider text-amber-100">
                            Mode Troubleshooting Aktif:
                        </span>{' '}
                        <span>
                            Anda sedang login atas nama{' '}
                            <strong className="underline decoration-amber-300 font-black text-white">
                                {currentUser?.name}
                            </strong>{' '}
                            ({currentUser?.role}) oleh Super Admin ({impersonator?.name}).
                        </span>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={handleLeave}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-white text-slate-900 hover:bg-amber-50 active:scale-95 px-3.5 py-1 text-xs font-black shadow-sm transition-all duration-150 cursor-pointer whitespace-nowrap shrink-0"
                >
                    <LogOut className="h-3.5 w-3.5 text-amber-700" />
                    <span>Kembali ke Super Admin</span>
                </button>
            </div>
        </div>
    );
}
