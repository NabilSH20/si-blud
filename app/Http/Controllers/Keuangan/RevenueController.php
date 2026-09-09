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
        '3. HASIL KERJA SAMA' => [
            'Hasil Kerjasama Diklat',
            'Pendapatan Hasil Kerja Sama Fasilitas ( Parkir )',
            'Hasil Kerjasama Penggunaan Fasilitas RSJ Tampan',
        ],
        '4. ANGGARAN PENDAPATAN BELANJA DAERAH' => [
            'APBD',
        ],
        '5. LAIN-LAIN PENDAPATAN BADAN LAYANAN UMUM DAERAH YANG SAH' => [
            'Jasa Giro',
            'Pendapatan Bunga',
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
     * Resolve category for a given revenue source.
     */
    public static function resolveCategory(string $source): string
    {
        $normalized = match ($source) {
            'Instalasi Gawat Darurat (IGD)' => 'Pendapatan Pelayanan Gawat Darurat',
            'Instalasi Farmasi & Apotek' => 'Pendapatan Pelayanan Farmasi',
            'Poliklinik Jiwa Terpadu' => 'Pendapatan Pelayanan Rawat Jalan',
            'Instalasi Laboratorium' => 'Pendapatan Pelayanan Laboratorium',
            'Instalasi Rawat Inap Jiwa' => 'Pendapatan Pelayanan Rawat Inap',
            'Instalasi Radiologi' => 'Pendapatan Pelayanan Radiologi',
            'Pelayanan Visum & Mediko-Legal' => 'Pendapatan Pelayanan Forensik Psikiatri',
            'Pendapatan Jasa Giro & Non-Operasional' => 'Jasa Giro',
            default => $source,
        };

        if (str_contains($normalized, 'Pelayanan') || str_contains($normalized, 'Instalasi')) {
            return 'Jasa Layanan';
        }
        if (str_contains($normalized, 'Kerjasama') || str_contains($normalized, 'Parkir') || str_contains($normalized, 'Fasilitas')) {
            return 'Hasil Kerja Sama';
        }
        if (str_contains($normalized, 'APBD')) {
            return 'APBD';
        }
        if (str_contains($normalized, 'Giro') || str_contains($normalized, 'Bunga') || str_contains($normalized, 'Lain')) {
            return 'Lain-lain BLUD Sah';
        }

        return 'Jasa Layanan';
    }

    /**
     * Display a listing of revenues.
     */
    public function index(): Response
    {
        $now = Carbon::now();
        $revenues = Revenue::orderBy('date', 'desc')->orderBy('id', 'desc')->get()->map(function ($rev) {
            $rev->category = self::resolveCategory($rev->source);
            return $rev;
        });

        $totalRevenue = (float) $revenues->sum('amount');
        $monthlyRevenue = (float) $revenues->whereBetween('date', [$now->copy()->startOfMonth(), $now->copy()->endOfMonth()])->sum('amount');
        $todayRevenue = (float) $revenues->where('date', $now->toDateString())->sum('amount');

        $jasaLayanan = (float) $revenues->where('category', 'Jasa Layanan')->sum('amount');
        $hasilKerjasama = (float) $revenues->where('category', 'Hasil Kerja Sama')->sum('amount');
        $apbd = (float) $revenues->where('category', 'APBD')->sum('amount');
        $lainLainSah = (float) $revenues->where('category', 'Lain-lain BLUD Sah')->sum('amount');

        return Inertia::render('Keuangan/Revenues/Index', [
            'revenues' => $revenues,
            'stats' => [
                'total_revenue' => $totalRevenue,
                'monthly_revenue' => $monthlyRevenue,
                'today_revenue' => $todayRevenue,
                'total_transactions' => $revenues->count(),
                'jasa_layanan' => $jasaLayanan,
                'hasil_kerjasama' => $hasilKerjasama,
                'apbd' => $apbd,
                'lain_lain_sah' => $lainLainSah,
            ],
            'categories' => ['Semua', 'Jasa Layanan', 'Hasil Kerja Sama', 'APBD', 'Lain-lain BLUD Sah'],
        ]);
    }

    /**
     * Show the form for creating a new revenue record.
     */
    public function create(): Response
    {
        $flat = $this->getFlatSources();

        return Inertia::render('Keuangan/Revenues/Create', [
            'grouped_sources' => $this->groupedSources,
            'sources' => $flat,
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
        DB::transaction(function () use ($revenue) {
            $revenue->delete();
        });

        return redirect()->route('revenues.index')
            ->with('success', 'Catatan pendapatan berhasil dihapus.');
    }
}

