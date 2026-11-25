/**
 * Compact Sah / Tidak Sah segmented toggle for unit item and price validation.
 */
export default function ValidationSegmentedToggle({
    value,
    onChange,
    sahLabel = 'Sah',
    tidakSahLabel = 'Tidak Sah',
}) {
    const isSahSelected = value !== 'TIDAK_SAH';

    return (
        <div className="inline-flex items-center rounded-xl border border-slate-200 bg-slate-100/80 p-0.5 gap-0.5">
            <button
                type="button"
                onClick={() => onChange('SAH')}
                className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold transition cursor-pointer whitespace-nowrap ${
                    isSahSelected
                        ? 'bg-teal-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:bg-white/80 hover:text-slate-900'
                }`}
            >
                <svg className="h-3 w-3 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                <span>{sahLabel}</span>
            </button>
            <button
                type="button"
                onClick={() => onChange('TIDAK_SAH')}
                className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold transition cursor-pointer whitespace-nowrap ${
                    !isSahSelected
                        ? 'bg-rose-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:bg-white/80 hover:text-slate-900'
                }`}
            >
                <svg className="h-3 w-3 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>{tidakSahLabel}</span>
            </button>
        </div>
    );
}
