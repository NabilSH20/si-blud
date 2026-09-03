<?php

namespace Database\Seeders;

use App\Models\Revenue;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class RevenueSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $entries = [
            [
                'source' => 'Instalasi Farmasi & Apotek',
                'amount' => 32500000,
                'days_ago' => 28,
                'description' => 'Penerimaan retribusi penjualan obat generik dan resep rawat jalan periode akhir bulan lalu.',
            ],
            [
                'source' => 'Instalasi Rawat Inap Jiwa',
                'amount' => 24000000,
                'days_ago' => 24,
                'description' => 'Pembayaran akomodasi dan asuhan keperawatan pasien umum ruang rawat inap.',
            ],
            [
                'source' => 'Poliklinik Jiwa Terpadu',
                'amount' => 14800000,
                'days_ago' => 20,
                'description' => 'Pendapatan jasa konsultasi psikiater, psikolog klinis, dan konseling adiksi narkoba.',
            ],
            [
                'source' => 'Instalasi Gawat Darurat (IGD)',
                'amount' => 18500000,
                'days_ago' => 16,
                'description' => 'Tarif penanganan kegawatdaruratan psikiatri dan tindakan stabilisasi medis intensif.',
            ],
            [
                'source' => 'Instalasi Laboratorium',
                'amount' => 9600000,
                'days_ago' => 12,
                'description' => 'Biaya pemeriksaan tes narkoba 6 parameter, hematologi rutin, dan kimia darah.',
            ],
            [
                'source' => 'Pelayanan Visum & Mediko-Legal',
                'amount' => 7500000,
                'days_ago' => 8,
                'description' => 'Penerimaan layanan visum et repertum psikiatrikum atas permohonan instansi penegak hukum.',
            ],
            [
                'source' => 'Instalasi Farmasi & Apotek',
                'amount' => 28700000,
                'days_ago' => 4,
                'description' => 'Penerimaan tebus obat paten dan cairan infus unit pelayanan intensif.',
            ],
            [
                'source' => 'Poliklinik Jiwa Terpadu',
                'amount' => 12200000,
                'days_ago' => 1,
                'description' => 'Penerimaan harian karcis registrasi poli spesialis dan terapi okupasi.',
            ],
        ];

        foreach ($entries as $index => $item) {
            $date = Carbon::now()->subDays($item['days_ago'])->toDateString();
            $revNumber = sprintf('REV-%s-%04d', Carbon::parse($date)->format('Ymd'), $index + 1);

            Revenue::updateOrCreate(
                ['revenue_number' => $revNumber],
                [
                    'source' => $item['source'],
                    'amount' => $item['amount'],
                    'date' => $date,
                    'description' => $item['description'],
                ]
            );
        }
    }
}

