<?php

namespace Database\Seeders;

use App\Models\Item;
use App\Models\RbaAccount;
use App\Models\Requisition;
use Illuminate\Database\Seeder;

class RbaAccountSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * Bagan Akun Standar (BAS) RBA BLUD RS Jiwa Tampan TA 2027
     */
    public function run(): void
    {
        $accounts = [
            // =========================================================================
            // LEVEL 1: AKUN UTAMA
            // =========================================================================
            [
                'account_code' => '1',
                'parent_code' => null,
                'account_name' => 'BELANJA',
                'kategori_belanja' => 'Operasi',
            ],

            // =========================================================================
            // LEVEL 2: KELOMPOK
            // =========================================================================
            [
                'account_code' => '1.1',
                'parent_code' => '1',
                'account_name' => 'BELANJA OPERASI',
                'kategori_belanja' => 'Operasi',
            ],
            [
                'account_code' => '1.2',
                'parent_code' => '1',
                'account_name' => 'BELANJA MODAL',
                'kategori_belanja' => 'Modal',
            ],

            // =========================================================================
            // LEVEL 3: JENIS
            // =========================================================================
            [
                'account_code' => '1.1.1',
                'parent_code' => '1.1',
                'account_name' => 'Belanja Pegawai',
                'kategori_belanja' => 'Operasi',
            ],
            [
                'account_code' => '1.1.2',
                'parent_code' => '1.1',
                'account_name' => 'Belanja Barang dan Jasa',
                'kategori_belanja' => 'Operasi',
            ],
            [
                'account_code' => '1.2.1',
                'parent_code' => '1.2',
                'account_name' => 'Belanja Modal BLUD',
                'kategori_belanja' => 'Modal',
            ],

            // =========================================================================
            // LEVEL 4: OBJEK
            // =========================================================================
            // 1.1.1 Belanja Pegawai
            [
                'account_code' => '1.1.1.1',
                'parent_code' => '1.1.1',
                'account_name' => 'Belanja Pegawai BLUD',
                'kategori_belanja' => 'Operasi',
            ],

            // 1.1.2 Belanja Barang dan Jasa
            [
                'account_code' => '1.1.2.1',
                'parent_code' => '1.1.2',
                'account_name' => 'Belanja Barang dan jasa BLUD',
                'kategori_belanja' => 'Operasi',
            ],

            // 1.2.1 Belanja Modal BLUD
            [
                'account_code' => '1.2.1.1',
                'parent_code' => '1.2.1',
                'account_name' => 'Belanja Tanah',
                'kategori_belanja' => 'Modal',
            ],
            [
                'account_code' => '1.2.1.2',
                'parent_code' => '1.2.1',
                'account_name' => 'Belanja Peralatan dan Mesin',
                'kategori_belanja' => 'Modal',
            ],
            [
                'account_code' => '1.2.1.3',
                'parent_code' => '1.2.1',
                'account_name' => 'Belanja Gedung dan Bangunan',
                'kategori_belanja' => 'Modal',
            ],
            [
                'account_code' => '1.2.1.4',
                'parent_code' => '1.2.1',
                'account_name' => 'Belanja Jalan/ Irigasi Dan jaringan',
                'kategori_belanja' => 'Modal',
            ],
            [
                'account_code' => '1.2.1.5',
                'parent_code' => '1.2.1',
                'account_name' => 'Belanja Aset tetap lainnya',
                'kategori_belanja' => 'Modal',
            ],
            [
                'account_code' => '1.2.1.6',
                'parent_code' => '1.2.1',
                'account_name' => 'Belanja Aset lainnya',
                'kategori_belanja' => 'Modal',
            ],

            // =========================================================================
            // LEVEL 5: RINCIAN OBJEK (REKENING BELANJA BLUD)
            // =========================================================================
            // --- Under 1.1.2.1 Belanja Barang dan jasa BLUD ---
            [
                'account_code' => '1.1.2.1.1',
                'parent_code' => '1.1.2.1',
                'account_name' => 'Belanja bahan habis pakai material kesehatan',
                'kategori_belanja' => 'Operasi',
            ],
            [
                'account_code' => '1.1.2.1.2',
                'parent_code' => '1.1.2.1',
                'account_name' => 'Belanja obat-obatan',
                'kategori_belanja' => 'Operasi',
            ],
            [
                'account_code' => '1.1.2.1.2.1',
                'parent_code' => '1.1.2.1.2',
                'account_name' => 'Belanja obat generik',
                'kategori_belanja' => 'Operasi',
            ],
            [
                'account_code' => '1.1.2.1.2.2',
                'parent_code' => '1.1.2.1.2',
                'account_name' => 'Belanja obat non generik',
                'kategori_belanja' => 'Operasi',
            ],
            [
                'account_code' => '1.1.2.1.3',
                'parent_code' => '1.1.2.1',
                'account_name' => 'Belanja bahan habis pakai material laboratorium',
                'kategori_belanja' => 'Operasi',
            ],
            [
                'account_code' => '1.1.2.1.4',
                'parent_code' => '1.1.2.1',
                'account_name' => 'Belanja radiologi',
                'kategori_belanja' => 'Operasi',
            ],
            [
                'account_code' => '1.1.2.1.5',
                'parent_code' => '1.1.2.1',
                'account_name' => 'Belanja bahan habis pakai material laundry',
                'kategori_belanja' => 'Operasi',
            ],
            [
                'account_code' => '1.1.2.1.6',
                'parent_code' => '1.1.2.1',
                'account_name' => 'Belanja bahan habis pakai material Sterilisasi',
                'kategori_belanja' => 'Operasi',
            ],
            [
                'account_code' => '1.1.2.1.7',
                'parent_code' => '1.1.2.1',
                'account_name' => 'Belanja bahan habis pakai psikologi/psikometri',
                'kategori_belanja' => 'Operasi',
            ],
            [
                'account_code' => '1.1.2.1.8',
                'parent_code' => '1.1.2.1',
                'account_name' => 'Belanja Bahan Bakar Minyak/Gas',
                'kategori_belanja' => 'Operasi',
            ],
            [
                'account_code' => '1.1.2.1.9',
                'parent_code' => '1.1.2.1',
                'account_name' => 'Belanja SIM RS',
                'kategori_belanja' => 'Operasi',
            ],
            [
                'account_code' => '1.1.2.1.10',
                'parent_code' => '1.1.2.1',
                'account_name' => 'Belanja cetak RS',
                'kategori_belanja' => 'Operasi',
            ],
            [
                'account_code' => '1.1.2.1.11',
                'parent_code' => '1.1.2.1',
                'account_name' => 'Belanja makanan dan minuman pasien',
                'kategori_belanja' => 'Operasi',
            ],
            [
                'account_code' => '1.1.2.1.12',
                'parent_code' => '1.1.2.1',
                'account_name' => 'Belanja pemeliharaan rutin/berkala rumah sakit',
                'kategori_belanja' => 'Operasi',
            ],
            [
                'account_code' => '1.1.2.1.13',
                'parent_code' => '1.1.2.1',
                'account_name' => 'Belanja pemeliharaan rutin/berkala alat-alat kesehatan',
                'kategori_belanja' => 'Operasi',
            ],
            [
                'account_code' => '1.1.2.1.14',
                'parent_code' => '1.1.2.1',
                'account_name' => 'Belanja Bahan Habis Pakai dan Kelengkapan Rehabilitasi Medik',
                'kategori_belanja' => 'Operasi',
            ],
            [
                'account_code' => '1.1.2.1.15',
                'parent_code' => '1.1.2.1',
                'account_name' => 'Belanja jasa pelayanan Rumah Sakit',
                'kategori_belanja' => 'Operasi',
            ],
            [
                'account_code' => '1.1.2.1.16',
                'parent_code' => '1.1.2.1',
                'account_name' => 'Belanja jasa kantor dan pelayanan rumah sakit',
                'kategori_belanja' => 'Operasi',
            ],
            [
                'account_code' => '1.1.2.1.17',
                'parent_code' => '1.1.2.1',
                'account_name' => 'Belanja jasa kegiatan urusan kesehatan dan non kesehatan',
                'kategori_belanja' => 'Operasi',
            ],
            [
                'account_code' => '1.1.2.1.17.1',
                'parent_code' => '1.1.2.1.17',
                'account_name' => 'Jasa Tenaga Dokter dan MOU',
                'kategori_belanja' => 'Operasi',
            ],
            [
                'account_code' => '1.1.2.1.17.2',
                'parent_code' => '1.1.2.1.17',
                'account_name' => 'Jasa Tenaga Honor BLUD',
                'kategori_belanja' => 'Operasi',
            ],
            [
                'account_code' => '1.1.2.1.17.3',
                'parent_code' => '1.1.2.1.17',
                'account_name' => 'Jasa Dewan Pengawas',
                'kategori_belanja' => 'Operasi',
            ],
            [
                'account_code' => '1.1.2.1.17.4',
                'parent_code' => '1.1.2.1.17',
                'account_name' => 'BPJS Ketenagakerjaan Non ASN',
                'kategori_belanja' => 'Operasi',
            ],
            [
                'account_code' => '1.1.2.1.17.5',
                'parent_code' => '1.1.2.1.17',
                'account_name' => 'Biaya Gaji 13 dan THR Non ASN',
                'kategori_belanja' => 'Operasi',
            ],
            [
                'account_code' => '1.1.2.1.17.6',
                'parent_code' => '1.1.2.1.17',
                'account_name' => 'Biaya Gaji 13 dan THR PPPK Paruh Waktu',
                'kategori_belanja' => 'Operasi',
            ],
            [
                'account_code' => '1.1.2.1.18',
                'parent_code' => '1.1.2.1',
                'account_name' => 'Belanja jasa pelayanan rujukan',
                'kategori_belanja' => 'Operasi',
            ],
            [
                'account_code' => '1.1.2.1.19',
                'parent_code' => '1.1.2.1',
                'account_name' => 'Belanja Jasa administrasi bank',
                'kategori_belanja' => 'Operasi',
            ],
            [
                'account_code' => '1.1.2.1.20',
                'parent_code' => '1.1.2.1',
                'account_name' => 'Belanja Makan dan Minum',
                'kategori_belanja' => 'Operasi',
            ],
            [
                'account_code' => '1.1.2.1.21',
                'parent_code' => '1.1.2.1',
                'account_name' => 'Belanja Kelengkapan Pasien',
                'kategori_belanja' => 'Operasi',
            ],
            [
                'account_code' => '1.1.2.1.22',
                'parent_code' => '1.1.2.1',
                'account_name' => 'Belanja Peralatan Kebersihan dan Bahan Pembersih',
                'kategori_belanja' => 'Operasi',
            ],
            [
                'account_code' => '1.1.2.1.23',
                'parent_code' => '1.1.2.1',
                'account_name' => 'Belanja Baju Pasien',
                'kategori_belanja' => 'Operasi',
            ],
            [
                'account_code' => '1.1.2.1.24',
                'parent_code' => '1.1.2.1',
                'account_name' => 'Belanja matras/kasur pasien',
                'kategori_belanja' => 'Operasi',
            ],
            [
                'account_code' => '1.1.2.1.25',
                'parent_code' => '1.1.2.1',
                'account_name' => 'Belanja Jasa Akuntan Publik',
                'kategori_belanja' => 'Operasi',
            ],
            [
                'account_code' => '1.1.2.1.26',
                'parent_code' => '1.1.2.1',
                'account_name' => 'Belanja Bahan Habis Pakai Material Gigi',
                'kategori_belanja' => 'Operasi',
            ],
            [
                'account_code' => '1.1.2.1.27',
                'parent_code' => '1.1.2.1',
                'account_name' => 'Belanja Bahan Habis Pakai dan Kelengkapan Rehabilitasi Psikososial',
                'kategori_belanja' => 'Operasi',
            ],
            [
                'account_code' => '1.1.2.1.28',
                'parent_code' => '1.1.2.1',
                'account_name' => 'Belanja Kelengkapan Pelayanan',
                'kategori_belanja' => 'Operasi',
            ],
            [
                'account_code' => '1.1.2.1.29',
                'parent_code' => '1.1.2.1',
                'account_name' => 'Belanja pemeliharaan rutin/berkala Peralatan dan Perlengkapan rumah sakit',
                'kategori_belanja' => 'Operasi',
            ],
            [
                'account_code' => '1.1.2.1.30',
                'parent_code' => '1.1.2.1',
                'account_name' => 'Belanja jasa kesehatan lingkungan RS',
                'kategori_belanja' => 'Operasi',
            ],
            [
                'account_code' => '1.1.2.1.31',
                'parent_code' => '1.1.2.1',
                'account_name' => 'Belanja Pemulangan Pasien',
                'kategori_belanja' => 'Operasi',
            ],
            [
                'account_code' => '1.1.2.1.32',
                'parent_code' => '1.1.2.1',
                'account_name' => 'Belanja Jasa Kontribusi & Perjalanan Dinas Pelatihan',
                'kategori_belanja' => 'Operasi',
            ],
            [
                'account_code' => '1.1.2.1.33',
                'parent_code' => '1.1.2.1',
                'account_name' => 'Belanja Promosi Kesehatan RS',
                'kategori_belanja' => 'Operasi',
            ],
            [
                'account_code' => '1.1.2.1.34',
                'parent_code' => '1.1.2.1',
                'account_name' => 'Belanja Akreditasi RS',
                'kategori_belanja' => 'Operasi',
            ],
            [
                'account_code' => '1.1.2.1.35',
                'parent_code' => '1.1.2.1',
                'account_name' => 'Belanja Peralatan & Perlengkapan Pendukung RS',
                'kategori_belanja' => 'Operasi',
            ],
            [
                'account_code' => '1.1.2.1.36',
                'parent_code' => '1.1.2.1',
                'account_name' => 'Belanja Alat Tulis Kantor (ATK)',
                'kategori_belanja' => 'Operasi',
            ],

            // --- Under 1.2.1.2 Belanja Peralatan dan Mesin ---
            [
                'account_code' => '1.2.1.2.1',
                'parent_code' => '1.2.1.2',
                'account_name' => 'Belanja Alat Kesehatan RS',
                'kategori_belanja' => 'Modal',
            ],
            [
                'account_code' => '1.2.1.2.2',
                'parent_code' => '1.2.1.2',
                'account_name' => 'Belanja peralatan dan perlengkapan rumah sakit',
                'kategori_belanja' => 'Modal',
            ],

            // --- Under 1.2.1.3 Belanja Gedung dan Bangunan ---
            [
                'account_code' => '1.2.1.3.1',
                'parent_code' => '1.2.1.3',
                'account_name' => 'Belanja Modal Gedung dan Bangunan',
                'kategori_belanja' => 'Modal',
            ],
        ];

        foreach ($accounts as $acc) {
            RbaAccount::updateOrCreate(
                ['account_code' => $acc['account_code']],
                [
                    'parent_code' => $acc['parent_code'],
                    'account_name' => $acc['account_name'],
                    'kategori_belanja' => $acc['kategori_belanja'],
                    'sumber_dana' => 'BLUD',
                    'funding_source' => 'BLUD',
                    'period_year' => 2027,
                    'year' => 2027,
                    'budget_after_revision' => 0,
                    'total_budget' => 0,
                    'remaining_budget' => 0,
                    'spent_budget' => 0,
                ]
            );
        }

        // Migrate any items/requisitions pointing to legacy or non-standard codes
        $mapping = [
            '1.2.02.05.01' => '1.2.1.2.1',
            '1.2.02.10.01' => '1.2.1.2.2',
            '1.2.02.15.01' => '1.2.1.2.2',
            '1.2.03.01.01' => '1.2.1.3.1',
            '5.1.02.01.01.0024' => '1.1.2.1.36',
        ];

        foreach ($mapping as $oldCode => $newCode) {
            $oldAcc = RbaAccount::where('account_code', $oldCode)->first();
            $newAcc = RbaAccount::where('account_code', $newCode)->first();
            if ($oldAcc && $newAcc && $oldAcc->id !== $newAcc->id) {
                Item::where('rba_account_id', $oldAcc->id)->update(['rba_account_id' => $newAcc->id]);
                Requisition::where('rba_account_id', $oldAcc->id)->update(['rba_account_id' => $newAcc->id]);
                if (\Illuminate\Support\Facades\Schema::hasColumn('requisitions', 'budget_id')) {
                    Requisition::where('budget_id', $oldAcc->id)->update(['budget_id' => $newAcc->id]);
                }
                $oldAcc->delete();
            }
        }
    }
}
