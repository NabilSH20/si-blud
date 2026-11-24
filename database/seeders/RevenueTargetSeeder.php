<?php

namespace Database\Seeders;

use App\Http\Controllers\Keuangan\RevenueController;
use App\Models\RevenueTarget;
use Illuminate\Database\Seeder;

class RevenueTargetSeeder extends Seeder
{
    /**
     * Run the database seeds for RS Jiwa Tampan revenue targets.
     */
    public function run(): void
    {
        $targetYear = 2027;

        // Target nominal riil RS Jiwa Tampan TA 2027
        $targetsData = [
            // 1. JASA LAYANAN
            'Pendapatan Pelayanan Gawat Darurat' => 135195000,
            'Pendapatan Pelayanan Intensif/UPIP' => 257500000,
            'Pendapatan Pelayanan Rawat Jalan' => 7521895000,
            'Pendapatan Pelayanan Rawat Inap' => 18608697914,
            'Pendapatan Pelayanan Rawat Inap-Napza' => 750000000,
            'Pendapatan Pelayanan Rehabilitasi Psikososial' => 0,
            'Pendapatan Pelayanan Psikologi & Psikometri' => 625000000,
            'Pendapatan Pelayanan Konseling Keperawatan Jiwa' => 13000000,
            'Pendapatan Pelayanan Forensik Psikiatri' => 21000000,
            'Pendapatan Pelayanan Laboratorium' => 500000000,
            'Pendapatan Pelayanan Radiologi' => 28750000,
            'Pendapatan Pelayanan Gizi' => 8000000,
            'Pendapatan Pelayanan Farmasi' => 2565500000,
            'Pendapatan Pelayanan Rekam Medik' => 359000000,
            'Pendapatan Pelayanan Ambulance/Kereta Jenazah' => 0,

            // 3. HASIL KERJA SAMA
            'Hasil Kerjasama Diklat' => 150000000,
            'Hasil Kerjasama Penggunaan Fasilitas RSJ Tampan' => 226350000,
            'Pendapatan Hasil Kerja Sama Fasilitas ( Parkir )' => 0,

            // 5. LAIN-LAIN PENDAPATAN BLUD YANG SAH
            'Jasa Giro' => 400000000,
            'Pendapatan Bunga' => 0,
            'Pendapatan Lain-Lain BLUD' => 300000000,
        ];

        foreach ($targetsData as $source => $yearlyAmount) {
            $category = RevenueController::resolveCategory($source);

            // Hitung alokasi bulanan (distribusi rata)
            $monthly = round($yearlyAmount / 12, 2);
            $totalFirst11 = $monthly * 11;
            $month12 = round($yearlyAmount - $totalFirst11, 2);

            RevenueTarget::updateOrCreate(
                [
                    'fiscal_year' => $targetYear,
                    'source_name' => $source,
                ],
                [
                    'category' => $category,
                    'period_type' => 'monthly',
                    'target_yearly' => $yearlyAmount,
                    'target_jan' => $monthly,
                    'target_feb' => $monthly,
                    'target_mar' => $monthly,
                    'target_apr' => $monthly,
                    'target_may' => $monthly,
                    'target_jun' => $monthly,
                    'target_jul' => $monthly,
                    'target_aug' => $monthly,
                    'target_sep' => $monthly,
                    'target_oct' => $monthly,
                    'target_nov' => $monthly,
                    'target_dec' => $month12,
                ]
            );
        }
    }
}
