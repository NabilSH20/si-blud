import React from 'react';

export default function Pagination({
    currentPage = 1,
    totalPages = 1,
    totalItems = 0,
    itemsPerPage = 10,
    onPageChange,
    className = '',
}) {
    if (totalItems === 0) return null;

    const from = Math.min((currentPage - 1) * itemsPerPage + 1, totalItems);
    const to = Math.min(currentPage * itemsPerPage, totalItems);

    const getPageNumbers = () => {
        if (totalPages <= 7) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        if (currentPage <= 4) {
            return [1, 2, 3, 4, 5, '...', totalPages];
        }

        if (currentPage >= totalPages - 3) {
            return [
                1,
                '...',
                totalPages - 4,
                totalPages - 3,
                totalPages - 2,
                totalPages - 1,
                totalPages,
            ];
        }

        return [
            1,
            '...',
            currentPage - 1,
            currentPage,
            currentPage + 1,
            '...',
            totalPages,
        ];
    };

    const pages = getPageNumbers();

    return (
        <div
            className={`flex flex-col gap-3 border-t border-slate-200 bg-slate-50/70 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-6 ${className}`}
        >
            {/* Info Text */}
            <div className="text-xs sm:text-sm text-slate-600 font-medium">
                Menampilkan <span className="font-bold text-slate-900">{from}</span>{' '}
                sampai <span className="font-bold text-slate-900">{to}</span> dari{' '}
                <span className="font-bold text-slate-900">{totalItems}</span> data
            </div>

            {/* Navigation Controls */}
            {totalPages > 1 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                    {/* Previous Button */}
                    <button
                        type="button"
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage <= 1}
                        className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white disabled:active:scale-100 transition"
                    >
                        <svg
                            className="h-3.5 w-3.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2.5}
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15.75 19.5L8.25 12l7.5-7.5"
                            />
                        </svg>
                        Sebelumnya
                    </button>

                    {/* Page Numbers */}
                    <div className="flex items-center gap-1">
                        {pages.map((page, idx) => {
                            if (page === '...') {
                                return (
                                    <span
                                        key={`dots-${idx}`}
                                        className="px-2 py-1 text-xs font-bold text-slate-400"
                                    >
                                        ...
                                    </span>
                                );
                            }

                            const isActive = page === currentPage;
                            return (
                                <button
                                    key={`page-${page}`}
                                    type="button"
                                    onClick={() => onPageChange(page)}
                                    className={`min-w-[32px] h-8 rounded-xl text-xs font-bold transition active:scale-95 ${
                                        isActive
                                            ? 'bg-emerald-600 text-white shadow-xs'
                                            : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                                    }`}
                                >
                                    {page}
                                </button>
                            );
                        })}
                    </div>

                    {/* Next Button */}
                    <button
                        type="button"
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage >= totalPages}
                        className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white disabled:active:scale-100 transition"
                    >
                        Selanjutnya
                        <svg
                            className="h-3.5 w-3.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2.5}
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M8.25 4.5l7.5 7.5-7.5 7.5"
                            />
                        </svg>
                    </button>
                </div>
            )}
        </div>
    );
}
