<?php

namespace Database\Seeders;

use App\Models\Division;
use App\Models\Unit;
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
        $medik = Division::whereIn('division_code', ['MEDIK', 'YAN'])->first();
        $rawat = Division::where('division_code', 'RAWAT')->first();
        $penunjang = Division::whereIn('division_code', ['PENUNJANG_DIKLIT', 'PENUNJANG'])->first();
        $ren = Division::where('division_code', 'REN')->first();
        $keu = Division::where('division_code', 'KEU')->first();
        $tu = Division::where('division_code', 'TU')->first();

        $unitIgd = Unit::where('unit_code', 'IGD')->first();
        $unitPoli = Unit::where('unit_code', 'POLI_JIWA')->first();
        $unitUpip = Unit::where('unit_code', 'UPIP')->first();
        $unitRanapPria = Unit::where('unit_code', 'INAP_PRIA')->first();
        $unitFarmasi = Unit::where('unit_code', 'FARMASI')->first();
        $unitLab = Unit::where('unit_code', 'LAB')->first();
        $unitIpsrs = Unit::where('unit_code', 'IPSRS')->first();
        $unitDiklit = Unit::where('unit_code', 'DIKLIT')->first();
        $unitTu = Unit::where('unit_code', 'SUBAG_TU')->first();
        $unitRen = Unit::where('unit_code', 'BAG_REN')->first();
        $unitKeu = Unit::where('unit_code', 'BAG_KEU')->first();

        $users = [
            // ==========================================
            // 1. PENGUSUL: BIDANG PELAYANAN MEDIK
            // ==========================================
            [
                'name' => 'dr. Hendra Setiawan, Sp.KJ',
                'nip' => '198203202008011005',
                'email' => 'igd@rsj.com',
                'password' => Hash::make('password'),
                'role' => 'divisi',
                'position' => 'Kepala Instalasi Gawat Darurat (IGD)',
                'phone' => '081234567801',
                'is_active' => true,
                'division_id' => $medik?->id,
                'unit_id' => $unitIgd?->id,
            ],
            [
                'name' => 'Admin Bidang Pelayanan (IGD)',
                'nip' => '198905152014022003',
                'email' => 'pelayanan@rsj.com',
                'password' => Hash::make('password'),
                'role' => 'divisi',
                'position' => 'Pengadministrasi Pelayanan Medik',
                'phone' => '081234567802',
                'is_active' => true,
                'division_id' => $medik?->id,
                'unit_id' => $unitIgd?->id,
            ],
            [
                'name' => 'dr. Maya Anggraini, Sp.KJ',
                'nip' => '198709112012012004',
                'email' => 'poliklinik@rsj.com',
                'password' => Hash::make('password'),
                'role' => 'divisi',
                'position' => 'Kepala Instalasi Rawat Jalan',
                'phone' => '081234567803',
                'is_active' => true,
                'division_id' => $medik?->id,
                'unit_id' => $unitPoli?->id,
            ],

            // ==========================================
            // 2. PENGUSUL: BIDANG KEPERAWATAN
            // ==========================================
            [
                'name' => 'Ns. Rahmat Hidayat, S.Kep',
                'nip' => '198607142011012009',
                'email' => 'upip@rsj.com',
                'password' => Hash::make('password'),
                'role' => 'divisi',
                'position' => 'Kepala Ruangan UPIP / ICU Psikiatri',
                'phone' => '081234567804',
                'is_active' => true,
                'division_id' => $rawat?->id,
                'unit_id' => $unitUpip?->id,
            ],
            [
                'name' => 'Admin Bidang Keperawatan (UPIP)',
                'nip' => '199104082015031002',
                'email' => 'keperawatan@rsj.com',
                'password' => Hash::make('password'),
                'role' => 'divisi',
                'position' => 'Pengadministrasi Keperawatan',
                'phone' => '081234567805',
                'is_active' => true,
                'division_id' => $rawat?->id,
                'unit_id' => $unitUpip?->id,
            ],
            [
                'name' => 'Ns. Budi Santoso, S.Kep',
                'nip' => '198402182009021006',
                'email' => 'ranappria@rsj.com',
                'password' => Hash::make('password'),
                'role' => 'divisi',
                'position' => 'Kepala Ruangan Rawat Inap Pria',
                'phone' => '081234567806',
                'is_active' => true,
                'division_id' => $rawat?->id,
                'unit_id' => $unitRanapPria?->id,
            ],

            // ==========================================
            // 3. PENGUSUL: BIDANG PENUNJANG MEDIK & DIKLIT
            // ==========================================
            [
                'name' => 'apt. Siti Nurhaliza, S.Farm',
                'nip' => '198501152010012015',
                'email' => 'farmasi@rsj.com',
                'password' => Hash::make('password'),
                'role' => 'divisi',
                'position' => 'Kepala Instalasi Farmasi',
                'phone' => '081234567807',
                'is_active' => true,
                'division_id' => $penunjang?->id,
                'unit_id' => $unitFarmasi?->id,
            ],
            [
                'name' => 'Admin Bidang Penunjang (Farmasi)',
                'nip' => '199208252016012003',
                'email' => 'penunjang@rsj.com',
                'password' => Hash::make('password'),
                'role' => 'divisi',
                'position' => 'Pengadministrasi Penunjang Medik',
                'phone' => '081234567808',
                'is_active' => true,
                'division_id' => $penunjang?->id,
                'unit_id' => $unitFarmasi?->id,
            ],
            [
                'name' => 'dr. Ratna Dewi, Sp.PK',
                'nip' => '198311052009032007',
                'email' => 'lab@rsj.com',
                'password' => Hash::make('password'),
                'role' => 'divisi',
                'position' => 'Kepala Instalasi Laboratorium',
                'phone' => '081234567809',
                'is_active' => true,
                'division_id' => $penunjang?->id,
                'unit_id' => $unitLab?->id,
            ],
            [
                'name' => 'Ir. Doni Prasetya, ST',
                'nip' => '198006122006041011',
                'email' => 'ipsrs@rsj.com',
                'password' => Hash::make('password'),
                'role' => 'divisi',
                'position' => 'Kepala IPSRS',
                'phone' => '081234567810',
                'is_active' => true,
                'division_id' => $penunjang?->id,
                'unit_id' => $unitIpsrs?->id,
            ],
            [
                'name' => 'Drs. Zulfikar, M.Pd',
                'nip' => '197903172005021004',
                'email' => 'diklit@rsj.com',
                'password' => Hash::make('password'),
                'role' => 'divisi',
                'position' => 'Kepala Unit Diklit (Diklat & Litbang)',
                'phone' => '081234567811',
                'is_active' => true,
                'division_id' => $penunjang?->id,
                'unit_id' => $unitDiklit?->id,
            ],

            // ==========================================
            // 4. PENGELOLA / VERIFIKATOR (PERENCANAAN, KEUANGAN, ADMIN)
            // ==========================================
            [
                'name' => 'Hawari Dinal, S.Sos, M.Si',
                'nip' => '197002111997031005',
                'email' => 'perencanaan@rsj.com',
                'password' => Hash::make('password'),
                'role' => 'perencanaan',
                'position' => 'Kepala Bagian Perencanaan',
                'phone' => '081234567820',
                'is_active' => true,
                'division_id' => $ren?->id,
                'unit_id' => $unitRen?->id,
            ],
            [
                'name' => 'Ns. Widodo, S.Kep, SH',
                'nip' => '197410031993121001',
                'email' => 'keuangan@rsj.com',
                'password' => Hash::make('password'),
                'role' => 'keuangan',
                'position' => 'Pejabat Keuangan / Wadir Keuangan',
                'phone' => '081234567821',
                'is_active' => true,
                'division_id' => $keu?->id,
                'unit_id' => $unitKeu?->id,
            ],
            [
                'name' => 'Administrator SIM-RS & E-BLUD',
                'nip' => '199001012015011001',
                'email' => 'admin@rsj.com',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'position' => 'Pranata Komputer / IT SIM-RS',
                'phone' => '081234567822',
                'is_active' => true,
                'division_id' => $tu?->id,
                'unit_id' => $unitTu?->id,
            ],

            // Legacy support
            [
                'name' => 'Admin RSJ Tampan',
                'nip' => '199001012015011099',
                'email' => 'admin@rsjtampan.riau.go.id',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'position' => 'Administrator Sistem',
                'phone' => '081234567823',
                'is_active' => true,
                'division_id' => $tu?->id,
                'unit_id' => $unitTu?->id,
            ],
            [
                'name' => 'Tim Perencanaan RSJ',
                'nip' => '197002111997031099',
                'email' => 'perencanaan@rsjtampan.riau.go.id',
                'password' => Hash::make('password'),
                'role' => 'perencanaan',
                'position' => 'Tim Perencanaan Program',
                'phone' => '081234567824',
                'is_active' => true,
                'division_id' => $ren?->id,
                'unit_id' => $unitRen?->id,
            ],
            [
                'name' => 'Bendahara Keuangan RSJ',
                'nip' => '197410031993121099',
                'email' => 'keuangan@rsjtampan.riau.go.id',
                'password' => Hash::make('password'),
                'role' => 'keuangan',
                'position' => 'Bendahara Pengeluaran BLUD',
                'phone' => '081234567825',
                'is_active' => true,
                'division_id' => $keu?->id,
                'unit_id' => $unitKeu?->id,
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
