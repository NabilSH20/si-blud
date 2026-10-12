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
                'year' => 2027,
                'name' => 'Tahun Anggaran 2027',
                'is_active' => true,
                'is_default' => true,
                'description' => 'Tahun Anggaran BLUD RSJ Tampan 2027 (Aktif & Berjalan)',
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
