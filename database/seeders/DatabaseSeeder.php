<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Jalankan Master Data Resmi (Tahun Anggaran, Bidang, Unit, RBA, SSH)
        $this->call(ProductionMasterSeeder::class);

        // 2. Proteksi Lingkungan Produksi: Jangan jalankan data dummy/transaksi palsu
        if (app()->isProduction()) {
            return;
        }

        // Catatan: Jika ingin menyuntikkan data akun & transaksi simulasi untuk demo di lokal,
        // jalankan: php artisan db:seed --class=DemoSeeder
    }
}
