<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class RequisitionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @deprecated Digantikan oleh RequisitionWorkflowSeeder untuk mendukung skema TA 2027,
     * status approval berjenjang, kelengkapan unit & indikator, serta pemotongan pagu otomatis.
     */
    public function run(): void
    {
        $this->call(RequisitionWorkflowSeeder::class);
    }
}
