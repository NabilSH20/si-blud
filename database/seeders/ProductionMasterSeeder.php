<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class ProductionMasterSeeder extends Seeder
{
    /**
     * Run the database seeds for clean production master data.
     * Seeds only authoritative master data (Years, Divisions, Units, RBA Accounts, SSH Items)
     * without inserting any dummy transactions or demo users.
     */
    public function run(): void
    {
        $this->call([
            FiscalYearSeeder::class,
            DivisionSeeder::class,
            UnitSeeder::class,
            RbaAccountSeeder::class,
            ItemSeeder::class,
        ]);
    }
}
