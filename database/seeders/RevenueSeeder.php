<?php

namespace Database\Seeders;

use App\Models\Revenue;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class RevenueSeeder extends Seeder
{
    /**
     * Run the database seeds for Realisasi Kas Pendapatan BLUD TA 2027.
     */
    public function run(): void
    {
        $year = 2027;

        $entries = [
            // Bulan Januari 2027
            [
                'source' => 'Instalasi Farmasi & Apotek',
                'amount' => 485000000,
                'date' => "{$year}-01-10",
                'description' => 'Penerimaan retribusi penjualan obat generik dan resep rawat jalan periode minggu ke-1 Januari 2027.',
            ],
            [
                'source' => 'Instalasi Rawat Inap Jiwa',
                'amount' => 1250000000,
                'date' => "{$year}-01-15",
                'description' => 'Penerimaan klaim asuhan keperawatan dan akomodasi pasien rawat inap psikiatri periode awal tahun 2027.',
            ],
            [
                'source' => 'Poliklinik Jiwa Terpadu',
                'amount' => 380000000,
                'date' => "{$year}-01-20",
                'description' => 'Pendapatan jasa konsultasi dokter spesialis kedokteran jiwa, psikologi klinis, dan konseling adiksi.',
            ],
            [
                'source' => 'Instalasi Gawat Darurat (IGD)',
                'amount' => 28500000,
                'date' => "{$year}-01-25",
                'description' => 'Tarif penanganan kegawatdaruratan psikiatri dan tindakan stabilisasi medis intensif IGD.',
            ],
            [
                'source' => 'Instalasi Laboratorium',
                'amount' => 145000000,
                'date' => "{$year}-01-28",
                'description' => 'Biaya pemeriksaan tes narkoba 6 parameter, hematologi rutin, dan kimia darah pasien.',
            ],
            [
                'source' => 'Hasil Kerja Sama Fasilitas & Parkir',
                'amount' => 45000000,
                'date' => "{$year}-01-31",
                'description' => 'Penerimaan bagi hasil sewa kantin, ATM center, dan parkir rumah sakit bulan Januari 2027.',
            ],

            // Bulan Februari 2027
            [
                'source' => 'Instalasi Farmasi & Apotek',
                'amount' => 520000000,
                'date' => "{$year}-02-08",
                'description' => 'Penerimaan resep obat generik dan obat paten ruang rawat inap dan rawat jalan.',
            ],
            [
                'source' => 'Instalasi Rawat Inap Jiwa',
                'amount' => 1420000000,
                'date' => "{$year}-02-14",
                'description' => 'Pembayaran klaim layanan rawat inap jiwa dan ruang pemulihan intensif.',
            ],
            [
                'source' => 'Poliklinik Jiwa Terpadu',
                'amount' => 410000000,
                'date' => "{$year}-02-20",
                'description' => 'Penerimaan karcis pendaftaran dan jasa medis poliklinik rawat jalan Februari 2027.',
            ],
            [
                'source' => 'Pelayanan Visum & Mediko-Legal',
                'amount' => 35000000,
                'date' => "{$year}-02-24",
                'description' => 'Penerimaan layanan pemeriksaan visum et repertum psikiatrikum dari kepolisian dan pengadilan.',
            ],
            [
                'source' => 'Instalasi Laboratorium',
                'amount' => 165000000,
                'date' => "{$year}-02-27",
                'description' => 'Pendapatan jasa pemeriksaan skrining laboratorium dan tes urin bebas narkoba.',
            ],

            // Bulan Maret 2027
            [
                'source' => 'Instalasi Farmasi & Apotek',
                'amount' => 590000000,
                'date' => "{$year}-03-05",
                'description' => 'Penerimaan penjualan obat-obatan psikofarmaka dan BHP medis Maret 2027.',
            ],
            [
                'source' => 'Instalasi Rawat Inap Jiwa',
                'amount' => 1650000000,
                'date' => "{$year}-03-12",
                'description' => 'Pendapatan jasa rawat inap bangsal psikiatri pria, wanita, dan instalasi napza.',
            ],
            [
                'source' => 'Poliklinik Jiwa Terpadu',
                'amount' => 470000000,
                'date' => "{$year}-03-18",
                'description' => 'Penerimaan harian karcis registrasi poli psikiatri anak & remaja serta fisioterapi.',
            ],
            [
                'source' => 'Hasil Kerja Sama Diklat',
                'amount' => 85000000,
                'date' => "{$year}-03-25",
                'description' => 'Penerimaan biaya praktik klinik keperawatan jiwa mahasiswa Poltekkes dan universitas mitra.',
            ],
            [
                'source' => 'Jasa Giro Operasional BLUD',
                'amount' => 62500000,
                'date' => "{$year}-03-31",
                'description' => 'Penerimaan bunga jasa giro rekening kas operasional BLUD RS Jiwa Tampan di Bank Riau Kepri Syariah.',
            ],
        ];

        foreach ($entries as $index => $item) {
            $revNumber = sprintf('REV-%s-%04d', Carbon::parse($item['date'])->format('Ymd'), $index + 1);

            Revenue::updateOrCreate(
                ['revenue_number' => $revNumber],
                [
                    'source' => $item['source'],
                    'amount' => $item['amount'],
                    'date' => $item['date'],
                    'description' => $item['description'],
                ]
            );
        }
    }
}
