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
        $igd = Division::where('division_code', 'IGD')->first();
        $far = Division::where('division_code', 'FAR')->first();
        $poli = Division::where('division_code', 'POLI')->first();
        $gizi = Division::where('division_code', 'GIZI')->first();

        $users = [
            [
                'name' => 'Administrator E-BLUD',
                'email' => 'admin@rsj.com',
                'role' => 'admin',
                'division_id' => null,
            ],
            [
                'name' => 'Tim Perencanaan & Pengadaan',
                'email' => 'perencanaan@rsj.com',
                'role' => 'perencanaan',
                'division_id' => null,
            ],
            [
                'name' => 'Bendahara & Pejabat Keuangan',
                'email' => 'keuangan@rsj.com',
                'role' => 'keuangan',
                'division_id' => null,
            ],
            [
                'name' => 'dr. Hendra Pratama (Kepala IGD)',
                'email' => 'igd@rsj.com',
                'role' => 'divisi',
                'division_id' => $igd?->id,
            ],
            [
                'name' => 'apt. Siti Rahmawati, S.Farm (Farmasi)',
                'email' => 'farmasi@rsj.com',
                'role' => 'divisi',
                'division_id' => $far?->id,
            ],
            [
                'name' => 'dr. Maya Sartika, Sp.KJ (Poliklinik Jiwa)',
                'email' => 'poli@rsj.com',
                'role' => 'divisi',
                'division_id' => $poli?->id,
            ],
            [
                'name' => 'Dewi Lestari, S.Gz (Instalasi Gizi)',
                'email' => 'gizi@rsj.com',
                'role' => 'divisi',
                'division_id' => $gizi?->id,
            ],
        ];

        foreach ($users as $userData) {
            User::updateOrCreate(
                ['email' => $userData['email']],
                [
                    'name' => $userData['name'],
                    'password' => Hash::make('password'),
                    'role' => $userData['role'],
                    'division_id' => $userData['division_id'],
                    'email_verified_at' => now(),
                ]
            );
        }
    }
}

