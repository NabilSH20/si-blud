<?php

namespace Database\Seeders;

use App\Models\Budget;
use Illuminate\Database\Seeder;

class BudgetSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $budgets = [
            [
                'account_code' => '5.1.02.01.01.0024',
                'account_name' => 'Belanja Alat Tulis Kantor (ATK)',
                'period_year' => 2026,
                'total_budget' => 25000000,
                'remaining_budget' => 25000000,
            ],
            [
                'account_code' => '5.1.02.01.01.0012',
                'account_name' => 'Belanja Bahan Medis Habis Pakai (BMHP)',
                'period_year' => 2026,
                'total_budget' => 150000000,
                'remaining_budget' => 150000000,
            ],
            [
                'account_code' => '5.2.02.05.01.0005',
                'account_name' => 'Belanja Modal Peralatan Medis & Keperawatan',
                'period_year' => 2026,
                'total_budget' => 75000000,
                'remaining_budget' => 75000000,
            ],
        ];

        foreach ($budgets as $budget) {
            Budget::updateOrCreate(
                ['account_code' => $budget['account_code']],
                [
                    'account_name' => $budget['account_name'],
                    'period_year' => $budget['period_year'],
                    'total_budget' => $budget['total_budget'],
                    'remaining_budget' => $budget['remaining_budget'],
                ]
            );
        }
    }
}

