<?php

namespace Database\Seeders;

use App\Models\Division;
use Illuminate\Database\Seeder;

class DivisionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $divisions = [
            [
                'name' => 'Instalasi Gawat Darurat (IGD)',
                'division_code' => 'IGD',
            ],
            [
                'name' => 'Poliklinik Jiwa Terpadu',
                'division_code' => 'POLI',
            ],
            [
                'name' => 'Instalasi Farmasi',
                'division_code' => 'FAR',
            ],
            [
                'name' => 'Instalasi Gizi & Tata Boga',
                'division_code' => 'GIZI',
            ],
            [
                'name' => 'Subag Tata Usaha & Kepegawaian',
                'division_code' => 'TU',
            ],
            [
                'name' => 'Instalasi Rawat Inap Jiwa',
                'division_code' => 'RANAP',
            ],
        ];

        foreach ($divisions as $division) {
            Division::updateOrCreate(
                ['division_code' => $division['division_code']],
                ['name' => $division['name']]
            );
        }
    }
}

