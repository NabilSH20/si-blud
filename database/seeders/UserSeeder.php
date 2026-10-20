<?php

namespace Database\Seeders;

use App\Models\Division;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

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

        $defaultPassword = app()->environment(['local', 'testing'])
            ? 'password'
            : env('SEED_DEFAULT_PASSWORD', Str::random(12));
        $passwordHash = Hash::make($defaultPassword);

        if (! app()->environment(['local', 'testing']) && ! env('SEED_DEFAULT_PASSWORD')) {
            $this->command->info('Demo user passwords set to: '.$defaultPassword);
        }

        $users = [
            // ==========================================
            // 1. PENGUSUL: BIDANG PELAYANAN MEDIK
            // ==========================================
            [
                'name' => 'dr. Demo IGD, Sp.KJ',
                'nip' => '199001012020011001',
                'email' => 'igd@rsj.com',
                'password' => $passwordHash,
                'role' => 'divisi',
                'position' => 'Kepala Instalasi Gawat Darurat (IGD)',
                'phone' => '081234567801',
                'is_active' => true,
                'division_id' => $medik?->id,
                'unit_id' => $unitIgd?->id,
            ],
            [
                'name' => 'Admin Demo IGD',
                'nip' => '199001012020011002',
                'email' => 'pelayanan@rsj.com',
                'password' => $passwordHash,
                'role' => 'divisi',
                'position' => 'Pengadministrasi Pelayanan Medik',
                'phone' => '081234567802',
                'is_active' => true,
                'division_id' => $medik?->id,
                'unit_id' => $unitIgd?->id,
            ],
            [
                'name' => 'dr. Demo Poli',
                'nip' => '199001012020011003',
                'email' => 'poliklinik@rsj.com',
                'password' => $passwordHash,
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
                'name' => 'Ns. Demo UPIP',
                'nip' => '199001012020011004',
                'email' => 'upip@rsj.com',
                'password' => $passwordHash,
                'role' => 'divisi',
                'position' => 'Kepala Ruangan UPIP / ICU Psikiatri',
                'phone' => '081234567804',
                'is_active' => true,
                'division_id' => $rawat?->id,
                'unit_id' => $unitUpip?->id,
            ],
            [
                'name' => 'Admin Demo UPIP',
                'nip' => '199001012020011005',
                'email' => 'keperawatan@rsj.com',
                'password' => $passwordHash,
                'role' => 'divisi',
                'position' => 'Pengadministrasi Keperawatan',
                'phone' => '081234567805',
                'is_active' => true,
                'division_id' => $rawat?->id,
                'unit_id' => $unitUpip?->id,
            ],
            [
                'name' => 'Ns. Demo Ranap',
                'nip' => '199001012020011006',
                'email' => 'ranappria@rsj.com',
                'password' => $passwordHash,
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
                'name' => 'apt. Demo Farmasi',
                'nip' => '199001012020011007',
                'email' => 'farmasi@rsj.com',
                'password' => $passwordHash,
                'role' => 'divisi',
                'position' => 'Kepala Instalasi Farmasi',
                'phone' => '081234567807',
                'is_active' => true,
                'division_id' => $penunjang?->id,
                'unit_id' => $unitFarmasi?->id,
            ],
            [
                'name' => 'Admin Demo Penunjang',
                'nip' => '199001012020011008',
                'email' => 'penunjang@rsj.com',
                'password' => $passwordHash,
                'role' => 'divisi',
                'position' => 'Pengadministrasi Penunjang Medik',
                'phone' => '081234567808',
                'is_active' => true,
                'division_id' => $penunjang?->id,
                'unit_id' => $unitFarmasi?->id,
            ],
            [
                'name' => 'dr. Demo Lab',
                'nip' => '199001012020011009',
                'email' => 'lab@rsj.com',
                'password' => $passwordHash,
                'role' => 'divisi',
                'position' => 'Kepala Instalasi Laboratorium',
                'phone' => '081234567809',
                'is_active' => true,
                'division_id' => $penunjang?->id,
                'unit_id' => $unitLab?->id,
            ],
            [
                'name' => 'Ir. Demo IPSRS',
                'nip' => '199001012020011010',
                'email' => 'ipsrs@rsj.com',
                'password' => $passwordHash,
                'role' => 'divisi',
                'position' => 'Kepala IPSRS',
                'phone' => '081234567810',
                'is_active' => true,
                'division_id' => $penunjang?->id,
                'unit_id' => $unitIpsrs?->id,
            ],
            [
                'name' => 'Drs. Demo Diklit',
                'nip' => '199001012020011011',
                'email' => 'diklit@rsj.com',
                'password' => $passwordHash,
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
                'name' => 'Pegawai Demo Perencanaan',
                'nip' => '199001012020011012',
                'email' => 'perencanaan@rsj.com',
                'password' => $passwordHash,
                'role' => 'perencanaan',
                'position' => 'Kepala Bagian Perencanaan',
                'phone' => '081234567820',
                'is_active' => true,
                'division_id' => $ren?->id,
                'unit_id' => $unitRen?->id,
            ],
            [
                'name' => 'Pegawai Demo Keuangan',
                'nip' => '199001012020011013',
                'email' => 'keuangan@rsj.com',
                'password' => $passwordHash,
                'role' => 'keuangan',
                'position' => 'Pejabat Keuangan / Wadir Keuangan',
                'phone' => '081234567821',
                'is_active' => true,
                'division_id' => $keu?->id,
                'unit_id' => $unitKeu?->id,
            ],
            [
                'name' => 'Admin Demo IT',
                'nip' => '199001012020011014',
                'email' => 'admin@rsj.com',
                'password' => $passwordHash,
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
                'nip' => '199001012020011015',
                'email' => 'admin@rsjtampan.riau.go.id',
                'password' => $passwordHash,
                'role' => 'admin',
                'position' => 'Administrator Sistem',
                'phone' => '081234567823',
                'is_active' => true,
                'division_id' => $tu?->id,
                'unit_id' => $unitTu?->id,
            ],
            [
                'name' => 'Tim Perencanaan RSJ',
                'nip' => '199001012020011016',
                'email' => 'perencanaan@rsjtampan.riau.go.id',
                'password' => $passwordHash,
                'role' => 'perencanaan',
                'position' => 'Tim Perencanaan Program',
                'phone' => '081234567824',
                'is_active' => true,
                'division_id' => $ren?->id,
                'unit_id' => $unitRen?->id,
            ],
            [
                'name' => 'Bendahara Keuangan RSJ',
                'nip' => '199001012020011017',
                'email' => 'keuangan@rsjtampan.riau.go.id',
                'password' => $passwordHash,
                'role' => 'keuangan',
                'position' => 'Bendahara Pengeluaran BLUD',
                'phone' => '081234567825',
                'is_active' => true,
                'division_id' => $keu?->id,
                'unit_id' => $unitKeu?->id,
            ],
        ];

        foreach ($users as $userData) {
            User::firstOrCreate(
                ['email' => $userData['email']],
                $userData
            );
        }
    }
}
