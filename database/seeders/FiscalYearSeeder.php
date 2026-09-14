<?php

namespace Database\Seeders;

use App\Models\FiscalYear;
use Illuminate\Database\Seeder;

class FiscalYearSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $years = [
            [
                'year' => 2025,
                'name' => 'Tahun Anggaran 2025',
                'is_active' => true,
                'is_default' => false,
                'description' => 'Tahun Anggaran BLUD RSJ Tampan 2025',
            ],
            [
                'year' => 2026,
                'name' => 'Tahun Anggaran 2026',
                'is_active' => true,
                'is_default' => true,
                'description' => 'Tahun Anggaran BLUD RSJ Tampan 2026 (Aktif Berjalan)',
            ],
            [
                'year' => 2027,
                'name' => 'Tahun Anggaran 2027',
                'is_active' => true,
                'is_default' => false,
                'description' => 'Penyusunan RBA & Perencanaan Belanja TA 2027',
            ],
            [
                'year' => 2028,
                'name' => 'Tahun Anggaran 2028',
                'is_active' => true,
                'is_default' => false,
                'description' => 'Proyeksi Rencana Jangka Menengah TA 2028',
            ],
        ];

        foreach ($years as $item) {
            FiscalYear::updateOrCreate(
                ['year' => $item['year']],
                $item
            );
        }
    }
}
