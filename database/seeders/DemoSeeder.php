<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Exception;

class DemoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        if (app()->environment('production')) {
            throw new Exception("DemoSeeder cannot be run in production.");
        }

        $this->call([
            UserSeeder::class,
            RbaMurni2027Seeder::class,
            RevenueSeeder::class,
            RequisitionWorkflowSeeder::class,
        ]);
    }
}
