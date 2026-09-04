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
            // The Requesters (Pelayanan, Perawatan, Penunjang)
            [
                'name' => 'Bidang Pelayanan',
                'division_code' => 'YAN',
                'group' => 'Pelayanan_Keperawatan',
            ],
            [
                'name' => 'Bidang Perawatan',
                'division_code' => 'RAWAT',
                'group' => 'Pelayanan_Keperawatan',
            ],
            [
                'name' => 'Bidang Penunjang',
                'division_code' => 'PENUNJANG',
                'group' => 'Pelayanan_Keperawatan',
            ],

            // The Managers (Perencanaan, Keuangan, Tata Usaha)
            [
                'name' => 'Bagian Perencanaan',
                'division_code' => 'REN',
                'group' => 'Umum_Kepegawaian',
            ],
            [
                'name' => 'Bagian Keuangan',
                'division_code' => 'KEU',
                'group' => 'Umum_Kepegawaian',
            ],
            [
                'name' => 'Subag Tata Usaha',
                'division_code' => 'TU',
                'group' => 'Umum_Kepegawaian',
            ],
        ];

        foreach ($divisions as $division) {
            Division::updateOrCreate(
                ['division_code' => $division['division_code']],
                [
                    'name' => $division['name'],
                    'group' => $division['group'],
                ]
            );
        }
    }
}
