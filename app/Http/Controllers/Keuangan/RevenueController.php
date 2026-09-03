<?php

namespace App\Http\Controllers\Keuangan;

use App\Http\Controllers\Controller;
use App\Models\Revenue;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class RevenueController extends Controller
{
    /**
     * Standard source options for RSJ Tampan revenues.
     */
    protected array $sources = [
        'Instalasi Gawat Darurat (IGD)',
        'Instalasi Farmasi & Apotek',
        'Poliklinik Jiwa Terpadu',
        'Instalasi Laboratorium',
        'Instalasi Rawat Inap Jiwa',
        'Instalasi Radiologi',
        'Pelayanan Visum & Mediko-Legal',
        'Pendapatan Jasa Giro & Non-Operasional',
    ];

    /**
     * Display a listing of revenues.
     */
    public function index(): Response
    {
        $now = Carbon::now();
        $revenues = Revenue::orderBy('date', 'desc')->orderBy('id', 'desc')->get();

        $totalRevenue = (float) $revenues->sum('amount');
        $monthlyRevenue = (float) $revenues->whereBetween('date', [$now->copy()->startOfMonth(), $now->copy()->endOfMonth()])->sum('amount');
        $todayRevenue = (float) $revenues->where('date', $now->toDateString())->sum('amount');

        return Inertia::render('Keuangan/Revenues/Index', [
            'revenues' => $revenues,
            'stats' => [
                'total_revenue' => $totalRevenue,
                'monthly_revenue' => $monthlyRevenue,
                'today_revenue' => $todayRevenue,
                'total_transactions' => $revenues->count(),
            ],
        ]);
    }

    /**
     * Show the form for creating a new revenue record.
     */
    public function create(): Response
    {
        return Inertia::render('Keuangan/Revenues/Create', [
            'sources' => $this->sources,
            'default_date' => Carbon::now()->toDateString(),
        ]);
    }

    /**
     * Store a newly created revenue record.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'source' => ['required', 'string', 'max:255'],
            'amount' => ['required', 'numeric', 'min:1'],
            'date' => ['required', 'date'],
            'description' => ['nullable', 'string', 'max:1000'],
        ]);

        DB::transaction(function () use ($validated) {
            $date = Carbon::parse($validated['date']);
            $datePrefix = 'REV-' . $date->format('Ymd');

            // Generate sequential revenue number
            $countToday = Revenue::where('date', $validated['date'])->count();
            $revenueNumber = sprintf('%s-%04d', $datePrefix, $countToday + 1);

            Revenue::create([
                'revenue_number' => $revenueNumber,
                'source' => $validated['source'],
                'amount' => $validated['amount'],
                'date' => $validated['date'],
                'description' => $validated['description'],
            ]);
        });

        return redirect()->route('revenues.index')
            ->with('success', 'Penerimaan pendapatan BLUD berhasil dicatat.');
    }

    /**
     * Remove the specified revenue record.
     */
    public function destroy(Revenue $revenue): RedirectResponse
    {
        DB::transaction(function () use ($revenue) {
            $revenue->delete();
        });

        return redirect()->route('revenues.index')
            ->with('success', 'Catatan pendapatan berhasil dihapus.');
    }
}

