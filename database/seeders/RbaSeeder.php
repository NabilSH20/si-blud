<?php

namespace Database\Seeders;

use App\Models\RbaDraft;
use Illuminate\Database\Seeder;

class RbaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $rbas = [
            [
                'year' => 2026,
                'target_revenue' => 350000000,
                'planned_expense' => 250000000,
                'status' => 'Disahkan',
                'notes' => 'RBA Tahun Anggaran 2026 telah disahkan oleh Dewan Pengawas dan Tim Anggaran Pemerintah Daerah (TAPD).',
            ],
            [
                'year' => 2027,
                'target_revenue' => 420000000,
                'planned_expense' => 310000000,
                'status' => 'Draft',
                'notes' => 'Proyeksi awal rencana bisnis tahun depan dengan estimasi penambahan kapasitas ruang rawat inap dan poli spesialis.',
            ],
        ];

        foreach ($rbas as $rba) {
            RbaDraft::updateOrCreate(
                ['year' => $rba['year']],
                [
                    'target_revenue' => $rba['target_revenue'],
                    'planned_expense' => $rba['planned_expense'],
                    'status' => $rba['status'],
                    'notes' => $rba['notes'],
                ]
            );
        }
    }
}

