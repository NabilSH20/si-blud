<?php

namespace Database\Seeders;

use App\Models\Division;
use App\Models\Unit;
use Illuminate\Database\Seeder;

class UnitSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $medik = Division::whereIn('division_code', ['MEDIK', 'YAN'])->first();
        $rawat = Division::where('division_code', 'RAWAT')->first();
        $penunjang = Division::whereIn('division_code', ['PENUNJANG_DIKLIT', 'PENUNJANG'])->first();
        $tu = Division::where('division_code', 'TU')->first();
        $ren = Division::where('division_code', 'REN')->first();
        $keu = Division::where('division_code', 'KEU')->first();

        $units = [];

        // 1. Units under Bidang Pelayanan Medik (MEDIK)
        if ($medik) {
            $units = array_merge($units, [
                ['division_id' => $medik->id, 'unit_code' => 'IGD', 'name' => 'Instalasi Gawat Darurat (IGD)', 'description' => 'Pelayanan triase gawat darurat psikiatri dan medis umum 24 jam.'],
                ['division_id' => $medik->id, 'unit_code' => 'POLI_JIWA', 'name' => 'Instalasi Rawat Jalan (Poliklinik)', 'description' => 'Pelayanan poliklinik spesialis jiwa, anak, dan sub-spesialis.'],
                ['division_id' => $medik->id, 'unit_code' => 'RAWAT_INAP_JIWA', 'name' => 'Instalasi Rawat Inap Jiwa', 'description' => 'Pelayanan rawat inap psikiatri akut dan pemulihan.'],
                ['division_id' => $medik->id, 'unit_code' => 'NAPZA', 'name' => 'Instalasi Rawat Inap Napza', 'description' => 'Pelayanan detoksifikasi dan rehabilitasi ketergantungan zat.'],
                ['division_id' => $medik->id, 'unit_code' => 'REHAB_MENTAL', 'name' => 'Instalasi Rehabilitasi Mental & Psikososial', 'description' => 'Pelayanan terapi okupasi dan vokasional kemandirian pasien.'],
                ['division_id' => $medik->id, 'unit_code' => 'PSIKOLOGI', 'name' => 'Pelayanan Psikologi & Psikometri', 'description' => 'Pelayanan asesmen psikologi, tes IQ, dan konseling psikologis.'],
                ['division_id' => $medik->id, 'unit_code' => 'FORENSIK', 'name' => 'Pelayanan Forensik Psikiatri / Visum', 'description' => 'Pelayanan visum et repertum psikiatrikum mediko-legal.'],
            ]);
        }

        // 2. Units under Bidang Keperawatan (RAWAT)
        if ($rawat) {
            $units = array_merge($units, [
                ['division_id' => $rawat->id, 'unit_code' => 'INAP_PRIA', 'name' => 'Unit Rawat Inap Pria', 'description' => 'Ruang perawatan keperawatan pasien jiwa pria.'],
                ['division_id' => $rawat->id, 'unit_code' => 'INAP_WANITA', 'name' => 'Unit Rawat Inap Wanita', 'description' => 'Ruang perawatan keperawatan pasien jiwa wanita.'],
                ['division_id' => $rawat->id, 'unit_code' => 'INAP_ANAK', 'name' => 'Unit Rawat Inap Anak & Remaja', 'description' => 'Ruang perawatan keperawatan pasien usia anak & remaja.'],
                ['division_id' => $rawat->id, 'unit_code' => 'UPIP', 'name' => 'Unit Perawatan Intensif Psikiatri (UPIP/ICU)', 'description' => 'Perawatan intensif psikiatri fase gaduh gelisah.'],
                ['division_id' => $rawat->id, 'unit_code' => 'KONSELING_JIWA', 'name' => 'Pelayanan Konseling Keperawatan Jiwa', 'description' => 'Pelayanan edukasi dan konseling keluarga keperawatan jiwa.'],
            ]);
        }

        // 3. Units under Bidang Penunjang Medik & Diklit (PENUNJANG_DIKLIT)
        if ($penunjang) {
            $units = array_merge($units, [
                ['division_id' => $penunjang->id, 'unit_code' => 'FARMASI', 'name' => 'Instalasi Farmasi', 'description' => 'Penyediaan dan dispensing perbekalan farmasi & obat-obatan.'],
                ['division_id' => $penunjang->id, 'unit_code' => 'LAB', 'name' => 'Instalasi Laboratorium', 'description' => 'Pelayanan patologi klinik, toksikologi napza, dan hematologi.'],
                ['division_id' => $penunjang->id, 'unit_code' => 'RADIOLOGI', 'name' => 'Instalasi Radiologi', 'description' => 'Pelayanan radiodiagnostik penunjang medis.'],
                ['division_id' => $penunjang->id, 'unit_code' => 'GIZI', 'name' => 'Instalasi Gizi & Tata Boga', 'description' => 'Penyelenggaraan makanan dan terapi nutrisi dietetik pasien.'],
                ['division_id' => $penunjang->id, 'unit_code' => 'REKAM_MEDIK', 'name' => 'Instalasi Rekam Medis', 'description' => 'Pengelolaan berkas dan rekam medis elektronik pasien.'],
                ['division_id' => $penunjang->id, 'unit_code' => 'IPSRS', 'name' => 'Instalasi Pemeliharaan Sarana RS (IPSRS)', 'description' => 'Pemeliharaan sarana prasarana dan elektromedis RS.'],
                ['division_id' => $penunjang->id, 'unit_code' => 'CSSD', 'name' => 'Instalasi Sterilisasi & CSSD', 'description' => 'Pusat dekontaminasi dan sterilisasi alat medis rumah sakit.'],
                ['division_id' => $penunjang->id, 'unit_code' => 'KESLING', 'name' => 'Unit Sanitasi & Kesehatan Lingkungan (Kesling)', 'description' => 'Pengelolaan limbah B3 medis, IPAL, dan sanitasi rumah sakit.'],
                ['division_id' => $penunjang->id, 'unit_code' => 'AMBULANCE', 'name' => 'Unit Ambulance & Mobil Jenazah', 'description' => 'Pelayanan rujukan darurat dan mobilisasi pasien.'],
                ['division_id' => $penunjang->id, 'unit_code' => 'DIKLIT', 'name' => 'Unit Pendidikan, Pelatihan & Penelitian (Diklit)', 'description' => 'Penyelenggaraan diklat staf/perawat, in-house training, dan litbang.'],
            ]);
        }

        // 4. Units under Bagian Umum / Manajemen (TU, REN, KEU)
        if ($tu) {
            $units[] = ['division_id' => $tu->id, 'unit_code' => 'SUBAG_TU', 'name' => 'Subbag Tata Usaha & Kepegawaian', 'description' => 'Pelayanan administrasi umum dan kepegawaian.'];
        }
        if ($ren) {
            $units[] = ['division_id' => $ren->id, 'unit_code' => 'BAG_REN', 'name' => 'Bagian Perencanaan Program & Anggaran', 'description' => 'Penyusunan RBA, DPA, dan evaluasi program RS.'];
        }
        if ($keu) {
            $units[] = ['division_id' => $keu->id, 'unit_code' => 'BAG_KEU', 'name' => 'Bagian Keuangan & Perbendaharaan', 'description' => 'Verifikasi belanja, penatausahaan kas, dan akuntansi BLUD.'];
        }

        foreach ($units as $u) {
            Unit::updateOrCreate(
                ['unit_code' => $u['unit_code']],
                $u
            );
        }
    }
}