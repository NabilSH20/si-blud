<?php

namespace App\Http\Controllers\Keuangan;

use App\Http\Controllers\Controller;
use App\Models\FiscalYear;
use App\Models\RbaShift;
use App\Models\Revenue;
use App\Models\RevenueTarget;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class RevenueController extends Controller
{
    /**
     * Grouped official revenue categories matching Document 2 of RS Jiwa Tampan.
     */
    protected array $groupedSources = [
        '1. JASA LAYANAN' => [
            'Pendapatan Pelayanan Gawat Darurat',
            'Pendapatan Pelayanan Intensif/UPIP',
            'Pendapatan Pelayanan Rawat Jalan',
            'Pendapatan Pelayanan Rawat Inap',
            'Pendapatan Pelayanan Rawat Inap-Napza',
            'Pendapatan Pelayanan Rehabilitasi Psikososial',
            'Pendapatan Pelayanan Psikologi & Psikometri',
            'Pendapatan Pelayanan Konseling Keperawatan Jiwa',
            'Pendapatan Pelayanan Forensik Psikiatri',
            'Pendapatan Pelayanan Laboratorium',
            'Pendapatan Pelayanan Radiologi',
            'Pendapatan Pelayanan Gizi',
            'Pendapatan Pelayanan Farmasi',
            'Pendapatan Pelayanan Rekam Medik',
            'Pendapatan Pelayanan Ambulance/Kereta Jenazah',
        ],
        '2. HASIL KERJA SAMA' => [
            'Hasil Kerjasama Diklat',
            'Pendapatan Hasil Kerja Sama Fasilitas ( Parkir )',
            'Hasil Kerjasama Penggunaan Fasilitas RSJ Tampan',
        ],
        '3. LAIN-LAIN PENDAPATAN BADAN LAYANAN UMUM DAERAH YANG SAH' => [
            'Jasa Giro',
            'Pendapatan Bunga',
            'Pendapatan Lain-Lain BLUD',
        ],
    ];

    /**
     * Get flat list of all official sources.
     */
    public function getFlatSources(): array
    {
        $all = [];
        foreach ($this->groupedSources as $group => $items) {
            foreach ($items as $item) {
                $all[] = $item;
            }
        }

        return $all;
    }

    /**
     * Resolve category for a given revenue source using centralized Revenue model logic.
     */
    public static function resolveCategory(string $source): string
    {
        return Revenue::resolveCategory($source);
    }

    /**
     * Display a listing of revenues.
     */
    public function index(Request $request): Response
    {
        $activeYear = (int) session('active_year', function () {
            return class_exists(FiscalYear::class)
                ? FiscalYear::getDefaultYear()
                : (int) date('Y');
        });

        $selectedYear = $request->filled('year')
            ? (int) $request->year
            : ($request->filled('fiscal_year') ? (int) $request->fiscal_year : $activeYear);

        $now = Carbon::now();
        // Ciptakan 'simulasi hari ini' berdasarkan selectedYear agar sinkron dengan tahun yang dikerjakan user
        $simulatedToday = Carbon::create($selectedYear, $now->month, $now->day);

        $revenues = Revenue::whereYear('date', $selectedYear)
            ->orderBy('date', 'desc')
            ->orderBy('id', 'desc')
            ->get()
            ->map(function ($rev) {
                $rev->category = self::resolveCategory($rev->source);

                return $rev;
            });

        $totalRevenue = (float) $revenues->sum('amount');
        $monthlyRevenue = (float) $revenues->filter(function ($r) use ($simulatedToday) {
            return Carbon::parse($r->date)->month === $simulatedToday->month;
        })->sum('amount');

        $todayRevenue = (float) $revenues->filter(function ($r) use ($simulatedToday) {
            return Carbon::parse($r->date)->toDateString() === $simulatedToday->toDateString();
        })->sum('amount');

        $jasaLayanan = (float) $revenues->where('category', 'Jasa Layanan')->sum('amount');
        $hasilKerjasama = (float) $revenues->where('category', 'Hasil Kerja Sama')->sum('amount');
        $lainLainSah = (float) $revenues->where('category', 'Lain-lain BLUD Sah')->sum('amount');

        // Hubungkan dengan Target Pendapatan (RevenueTarget) untuk tahun fiskal aktif
        $dbTargets = RevenueTarget::where('fiscal_year', $selectedYear)->get()->keyBy('source_name');

        $targetTotal = (float) $dbTargets->sum('target_yearly');
        $targetJasaLayanan = (float) $dbTargets->where('category', 'Jasa Layanan')->sum('target_yearly');
        $targetHasilKerjasama = (float) $dbTargets->where('category', 'Hasil Kerja Sama')->sum('target_yearly');
        $targetLainLainSah = (float) $dbTargets->where('category', 'Lain-lain BLUD Sah')->sum('target_yearly');

        // Fallback ke RbaShift jika belum ada target di RevenueTarget
        if ($targetTotal == 0) {
            $activeShift = RbaShift::where('year', $selectedYear)
                ->where('status', 'Aktif')
                ->first();

            if ($activeShift) {
                $rootRev = $activeShift->revenueItems()->where('item_code', '0')->first();
                $cat1 = $activeShift->revenueItems()->where('item_code', '1')->first();
                $cat3 = $activeShift->revenueItems()->where('item_code', '3')->first();
                $cat5 = $activeShift->revenueItems()->where('item_code', '5')->first();

                $targetTotal = $rootRev ? (float) $rootRev->after_amount : (float) $activeShift->revenueItems()->where('is_header', false)->sum('after_amount');
                $targetJasaLayanan = $cat1 ? (float) $cat1->after_amount : 0;
                $targetHasilKerjasama = $cat3 ? (float) $cat3->after_amount : 0;
                $targetLainLainSah = $cat5 ? (float) $cat5->after_amount : 0;
            }
        }

        $achievementRate = $targetTotal > 0 ? round(($totalRevenue / $targetTotal) * 100, 2) : 0;

        // Baseline acuan realisasi kas tahun penginputan berjalan (misal tahun berjalan saat ini)
        $currentInputYear = (int) date('Y');
        $ongoingYearRealized = (float) Revenue::whereYear('date', $currentInputYear)->sum('amount');
        $isFuturePlanning = $selectedYear > $currentInputYear;

        $defaultDate = $simulatedToday->toDateString();

        return Inertia::render('Keuangan/Revenues/Index', [
            'revenues' => $revenues,
            'stats' => [
                'total_revenue' => $totalRevenue,
                'monthly_revenue' => $monthlyRevenue,
                'today_revenue' => $todayRevenue,
                'total_transactions' => $revenues->count(),
                'jasa_layanan' => $jasaLayanan,
                'hasil_kerjasama' => $hasilKerjasama,
                'lain_lain_sah' => $lainLainSah,
                'target_rba' => $targetTotal,
                'achievement_rate' => $achievementRate,
                'target_jasa_layanan' => $targetJasaLayanan,
                'target_hasil_kerjasama' => $targetHasilKerjasama,
                'target_lain_lain_sah' => $targetLainLainSah,
                'current_input_year' => $currentInputYear,
                'ongoing_year_realized' => $ongoingYearRealized,
                'is_future_planning' => $isFuturePlanning,
            ],
            'categories' => ['Semua', 'Jasa Layanan', 'Hasil Kerja Sama', 'Lain-lain BLUD Sah'],
            'grouped_sources' => $this->groupedSources,
            'sources' => $this->getFlatSources(),
            'targets' => $dbTargets->values(),
            'default_date' => $defaultDate,
            'active_year' => $activeYear,
            'selected_year' => $selectedYear,
        ]);
    }

    /**
     * Store or update revenue targets for a fiscal year.
     */
    public function storeTarget(Request $request): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();
        abort_unless($user && in_array($user->role, ['keuangan', 'perencanaan', 'super_admin']), 403, 'Akses ditolak.');

        $validated = $request->validate([
            'fiscal_year' => ['required', 'integer', 'min:2020', 'max:2099'],
            'targets' => ['required', 'array'],
            'targets.*.source_name' => ['required', 'string', 'max:255'],
            'targets.*.category' => ['nullable', 'string', 'max:100'],
            'targets.*.target_yearly' => ['nullable', 'numeric', 'min:0'],
            'targets.*.target_weekly' => ['nullable', 'numeric', 'min:0'],
            'targets.*.target_jan' => ['nullable', 'numeric', 'min:0'],
            'targets.*.target_feb' => ['nullable', 'numeric', 'min:0'],
            'targets.*.target_mar' => ['nullable', 'numeric', 'min:0'],
            'targets.*.target_apr' => ['nullable', 'numeric', 'min:0'],
            'targets.*.target_mei' => ['nullable', 'numeric', 'min:0'],
            'targets.*.target_jun' => ['nullable', 'numeric', 'min:0'],
            'targets.*.target_jul' => ['nullable', 'numeric', 'min:0'],
            'targets.*.target_agu' => ['nullable', 'numeric', 'min:0'],
            'targets.*.target_sep' => ['nullable', 'numeric', 'min:0'],
            'targets.*.target_okt' => ['nullable', 'numeric', 'min:0'],
            'targets.*.target_nov' => ['nullable', 'numeric', 'min:0'],
            'targets.*.target_des' => ['nullable', 'numeric', 'min:0'],
        ]);

        DB::transaction(function () use ($validated) {
            foreach ($validated['targets'] as $item) {
                $sourceName = $item['source_name'];
                $category = $item['category'] ?? self::resolveCategory($sourceName);
                $targetYearly = isset($item['target_yearly']) ? (float) $item['target_yearly'] : 0;
                $targetWeekly = isset($item['target_weekly']) ? (float) $item['target_weekly'] : ($targetYearly / 52);

                RevenueTarget::updateOrCreate(
                    [
                        'fiscal_year' => $validated['fiscal_year'],
                        'source_name' => $sourceName,
                    ],
                    [
                        'category' => $category,
                        'target_yearly' => $targetYearly,
                        'target_weekly' => $targetWeekly,
                        'target_jan' => (float) ($item['target_jan'] ?? ($targetYearly / 12)),
                        'target_feb' => (float) ($item['target_feb'] ?? ($targetYearly / 12)),
                        'target_mar' => (float) ($item['target_mar'] ?? ($targetYearly / 12)),
                        'target_apr' => (float) ($item['target_apr'] ?? ($targetYearly / 12)),
                        'target_mei' => (float) ($item['target_mei'] ?? ($targetYearly / 12)),
                        'target_jun' => (float) ($item['target_jun'] ?? ($targetYearly / 12)),
                        'target_jul' => (float) ($item['target_jul'] ?? ($targetYearly / 12)),
                        'target_agu' => (float) ($item['target_agu'] ?? ($targetYearly / 12)),
                        'target_sep' => (float) ($item['target_sep'] ?? ($targetYearly / 12)),
                        'target_okt' => (float) ($item['target_okt'] ?? ($targetYearly / 12)),
                        'target_nov' => (float) ($item['target_nov'] ?? ($targetYearly / 12)),
                        'target_des' => (float) ($item['target_des'] ?? ($targetYearly / 12)),
                    ]
                );
            }
        });

        return redirect()->back()->with('success', 'Target pendapatan BLUD berhasil diperbarui.');
    }

    /**
     * Store a newly created revenue record.
     */
    public function store(Request $request): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();
        abort_unless($user && $user->role === 'keuangan', 403, 'Akses ditolak.');

        $validated = $request->validate([
            'source' => ['required', 'string', 'max:255', Rule::in($this->getFlatSources())],
            'amount' => ['required', 'numeric', 'min:1'],
            'date' => ['required', 'date'],
            'description' => ['nullable', 'string', 'max:1000'],
        ]);

        DB::transaction(function () use ($validated) {
            $date = Carbon::parse($validated['date']);
            $datePrefix = 'REV-'.$date->format('Ymd');

            // Generate sequential revenue number safely
            $countToday = Revenue::whereDate('date', $validated['date'])->count();
            $suffix = $countToday + 1;
            while (Revenue::where('revenue_number', sprintf('%s-%04d', $datePrefix, $suffix))->exists()) {
                $suffix++;
            }
            $revenueNumber = sprintf('%s-%04d', $datePrefix, $suffix);

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
        /** @var User $user */
        $user = Auth::user();
        abort_unless($user && $user->role === 'keuangan', 403, 'Akses ditolak.');

        DB::transaction(function () use ($revenue) {
            $revenue->delete();
        });

        return redirect()->route('revenues.index')
            ->with('success', 'Catatan pendapatan berhasil dihapus.');
    }
}
