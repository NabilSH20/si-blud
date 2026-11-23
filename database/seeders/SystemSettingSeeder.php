<?php

namespace Database\Seeders;

use App\Models\SystemSetting;
use Illuminate\Database\Seeder;

class SystemSettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $settings = [
            // Identitas Rumah Sakit & Kop Surat
            [
                'key_name' => 'hospital_name',
                'value' => 'Rumah Sakit Jiwa Tampan Provinsi Riau',
                'label' => 'Nama Instansi / Rumah Sakit',
                'group_name' => 'print_document',
                'type' => 'text',
            ],
            [
                'key_name' => 'hospital_address',
                'value' => 'Jl. H.R. Soebrantas Km. 12.5, Panam, Pekanbaru, Riau',
                'label' => 'Alamat Instansi',
                'group_name' => 'print_document',
                'type' => 'textarea',
            ],
            [
                'key_name' => 'hospital_phone',
                'value' => '(0761) 63240',
                'label' => 'Nomor Telepon / Fax',
                'group_name' => 'print_document',
                'type' => 'text',
            ],
            [
                'key_name' => 'hospital_email',
                'value' => 'rsjtampan@riau.go.id',
                'label' => 'Email Resmi',
                'group_name' => 'print_document',
                'type' => 'text',
            ],
            [
                'key_name' => 'hospital_website',
                'value' => 'rsjtampan.riau.go.id',
                'label' => 'Website Resmi',
                'group_name' => 'print_document',
                'type' => 'text',
            ],
            [
                'key_name' => 'city_name',
                'value' => 'Pekanbaru',
                'label' => 'Kota Penetapan Dokumen',
                'group_name' => 'print_document',
                'type' => 'text',
            ],

            // Pejabat Penandatangan Resmi (Official Signers)
            [
                'key_name' => 'director_name',
                'value' => 'dr. Zainal Arifin, MPH',
                'label' => 'Nama Direktur RSJ Tampan',
                'group_name' => 'official_signers',
                'type' => 'text',
            ],
            [
                'key_name' => 'director_nip',
                'value' => '197203152000031002',
                'label' => 'NIP Direktur',
                'group_name' => 'official_signers',
                'type' => 'text',
            ],
            [
                'key_name' => 'director_title',
                'value' => 'Direktur RSJ Tampan Provinsi Riau',
                'label' => 'Jabatan Resmi Direktur',
                'group_name' => 'official_signers',
                'type' => 'text',
            ],
            [
                'key_name' => 'planning_head_name',
                'value' => 'Ns. H. Eko Purwanto, S.Kep, M.Kes',
                'label' => 'Nama Pejabat Perencanaan (Kabag Ren)',
                'group_name' => 'official_signers',
                'type' => 'text',
            ],
            [
                'key_name' => 'planning_head_nip',
                'value' => '197805122002121004',
                'label' => 'NIP Pejabat Perencanaan',
                'group_name' => 'official_signers',
                'type' => 'text',
            ],
            [
                'key_name' => 'planning_head_title',
                'value' => 'Kepala Bagian Perencanaan Program',
                'label' => 'Jabatan Pejabat Perencanaan',
                'group_name' => 'official_signers',
                'type' => 'text',
            ],
            [
                'key_name' => 'treasurer_name',
                'value' => 'Siti Rahmah, SE, M.Ak',
                'label' => 'Nama Bendahara Pengeluaran BLUD',
                'group_name' => 'official_signers',
                'type' => 'text',
            ],
            [
                'key_name' => 'treasurer_nip',
                'value' => '198309202008012005',
                'label' => 'NIP Bendahara Pengeluaran',
                'group_name' => 'official_signers',
                'type' => 'text',
            ],
            [
                'key_name' => 'treasurer_title',
                'value' => 'Bendahara Pengeluaran BLUD',
                'label' => 'Jabatan Bendahara Pengeluaran',
                'group_name' => 'official_signers',
                'type' => 'text',
            ],
        ];

        foreach ($settings as $setting) {
            SystemSetting::updateOrCreate(
                ['key_name' => $setting['key_name']],
                $setting
            );
        }
    }
}
