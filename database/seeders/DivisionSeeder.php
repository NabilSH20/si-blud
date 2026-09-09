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
        // Update old legacy division codes if they exist
        Division::where('division_code', 'YAN')->update(['division_code' => 'MEDIK', 'name' => 'Bidang Pelayanan Medik']);
        Division::where('division_code', 'PENUNJANG')->update(['division_code' => 'PENUNJANG_DIKLIT', 'name' => 'Bidang Penunjang Medik & Diklit']);

        $divisions = [
            // The 3 Requester Divisions (Pelayanan Medik, Keperawatan, Penunjang Medik & Diklit)
            [
                'name' => 'Bidang Pelayanan Medik',
                'division_code' => 'MEDIK',
                'group' => 'Pelayanan_Keperawatan',
            ],
            [
                'name' => 'Bidang Keperawatan',
                'division_code' => 'RAWAT',
                'group' => 'Pelayanan_Keperawatan',
            ],
            [
                'name' => 'Bidang Penunjang Medik & Diklit',
                'division_code' => 'PENUNJANG_DIKLIT',
                'group' => 'Pelayanan_Keperawatan',
            ],

            // The Managers & Verifiers (Perencanaan, Keuangan, Tata Usaha)
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
                'name' => 'Bagian Tata Usaha',
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
