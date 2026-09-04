<?php

namespace Database\Seeders;

use App\Models\Division;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $yan = Division::where('division_code', 'YAN')->first();
        $rawat = Division::where('division_code', 'RAWAT')->first();
        $penunjang = Division::where('division_code', 'PENUNJANG')->first();
        $ren = Division::where('division_code', 'REN')->first();
        $keu = Division::where('division_code', 'KEU')->first();
        $tu = Division::where('division_code', 'TU')->first();

        $users = [
            // The Requesters (Peminta)
            [
                'name' => 'Admin Bidang Pelayanan',
                'email' => 'pelayanan@rsj.com',
                'password' => Hash::make('password'),
                'role' => 'divisi',
                'division_id' => $yan?->id,
            ],
            [
                'name' => 'Admin Bidang Keperawatan',
                'email' => 'keperawatan@rsj.com',
                'password' => Hash::make('password'),
                'role' => 'divisi',
                'division_id' => $rawat?->id,
            ],
            [
                'name' => 'Admin Bidang Penunjang',
                'email' => 'penunjang@rsj.com',
                'password' => Hash::make('password'),
                'role' => 'divisi',
                'division_id' => $penunjang?->id,
            ],

            // The Managers (Perencanaan, Keuangan, Admin)
            [
                'name' => 'Staf Bagian Perencanaan',
                'email' => 'perencanaan@rsj.com',
                'password' => Hash::make('password'),
                'role' => 'perencanaan',
                'division_id' => $ren?->id,
            ],
            [
                'name' => 'Bendahara & Pejabat Keuangan',
                'email' => 'keuangan@rsj.com',
                'password' => Hash::make('password'),
                'role' => 'keuangan',
                'division_id' => $keu?->id,
            ],
            [
                'name' => 'Administrator E-BLUD',
                'email' => 'admin@rsj.com',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'division_id' => $tu?->id,
            ],

            // Secondary / Legacy accounts for testing compatibility
            [
                'name' => 'Admin RSJ Tampan',
                'email' => 'admin@rsjtampan.riau.go.id',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'division_id' => $tu?->id,
            ],
            [
                'name' => 'Tim Perencanaan RSJ',
                'email' => 'perencanaan@rsjtampan.riau.go.id',
                'password' => Hash::make('password'),
                'role' => 'perencanaan',
                'division_id' => $ren?->id,
            ],
            [
                'name' => 'Bendahara Keuangan RSJ',
                'email' => 'keuangan@rsjtampan.riau.go.id',
                'password' => Hash::make('password'),
                'role' => 'keuangan',
                'division_id' => $keu?->id,
            ],
        ];

        foreach ($users as $userData) {
            User::updateOrCreate(
                ['email' => $userData['email']],
                $userData
            );
        }
    }
}
