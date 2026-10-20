<?php

namespace Database\Seeders;

use App\Models\RbaAccount;
use App\Models\RbaExpenseItem;
use App\Models\RbaRevenueItem;
use App\Models\RbaShift;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RbaMurni2027Seeder extends Seeder
{
    /**
     * Run the database seeds for RBA Murni TA 2027.
     */
    public function run(): void
    {
        DB::transaction(function () {
            // 1. Buat Dokumen RBA Murni TA 2027 (Status Aktif)
            $shift = RbaShift::updateOrCreate(
                [
                    'year' => 2027,
                    'shift_name' => 'Murni',
                ],
                [
                    'doc_title' => 'RENCANA BISNIS DAN ANGGARAN MURNI T.A. 2027',
                    'period_month' => 'Januari 2027',
                    'status' => 'Aktif',
                    'notes' => 'RBA Definitif Murni Tahun Anggaran 2027 RS Jiwa Tampan Provinsi Riau disahkan per Januari 2027.',
                    'penerimaan_silpa' => 500000000,
                    'penerimaan_divestasi' => 0,
                    'penerimaan_pinjaman' => 0,
                    'pengeluaran_investasi' => 0,
                    'pengeluaran_pokok_utang' => 0,
                ]
            );

            // Bersihkan item lama shift ini jika ada
            RbaRevenueItem::where('rba_shift_id', $shift->id)->delete();
            RbaExpenseItem::where('rba_shift_id', $shift->id)->delete();

            // =========================================================================
            // 2. TARGET PENDAPATAN BLUD RSJ TAMPAN TA 2027 (Total Rp 45.000.000.000)
            // =========================================================================
            $revenues = [
                // Root
                ['code' => '0', 'name' => 'PENDAPATAN', 'parent' => null, 'level' => 1, 'is_header' => true, 'amount' => 45000000000],

                // 1. Jasa Layanan BLUD (Total: Rp 25.500.000.000)
                ['code' => '1', 'name' => 'JASA LAYANAN', 'parent' => '0', 'level' => 1, 'is_header' => true, 'amount' => 25500000000],
                ['code' => 'a', 'name' => 'Pendapatan Pelayanan Gawat Darurat (IGD)', 'parent' => '1', 'level' => 2, 'is_header' => false, 'amount' => 120000000],
                ['code' => 'b', 'name' => 'Pendapatan Pelayanan Intensif/UPIP', 'parent' => '1', 'level' => 2, 'is_header' => false, 'amount' => 250000000],
                ['code' => 'c', 'name' => 'Pendapatan Pelayanan Rawat Jalan (Poliklinik)', 'parent' => '1', 'level' => 2, 'is_header' => false, 'amount' => 6500000000],
                ['code' => 'd', 'name' => 'Pendapatan Pelayanan Rawat Inap Psikiatri', 'parent' => '1', 'level' => 2, 'is_header' => false, 'amount' => 14500000000],
                ['code' => 'e', 'name' => 'Pendapatan Pelayanan Rawat Inap-Napza', 'parent' => '1', 'level' => 2, 'is_header' => false, 'amount' => 900000000],
                ['code' => 'f', 'name' => 'Pendapatan Pelayanan Rehabilitasi Psikososial', 'parent' => '1', 'level' => 2, 'is_header' => false, 'amount' => 150000000],
                ['code' => 'g', 'name' => 'Pendapatan Pelayanan Psikologi & Psikometri', 'parent' => '1', 'level' => 2, 'is_header' => false, 'amount' => 750000000],
                ['code' => 'h', 'name' => 'Pendapatan Pelayanan Konseling Keperawatan Jiwa', 'parent' => '1', 'level' => 2, 'is_header' => false, 'amount' => 50000000],
                ['code' => 'i', 'name' => 'Pendapatan Pelayanan Forensik Psikiatri (Visum)', 'parent' => '1', 'level' => 2, 'is_header' => false, 'amount' => 180000000],
                ['code' => 'j', 'name' => 'Pendapatan Pelayanan Laboratorium', 'parent' => '1', 'level' => 2, 'is_header' => false, 'amount' => 1200000000],
                ['code' => 'k', 'name' => 'Pendapatan Pelayanan Radiologi', 'parent' => '1', 'level' => 2, 'is_header' => false, 'amount' => 50000000],
                ['code' => 'l', 'name' => 'Pendapatan Pelayanan Gizi', 'parent' => '1', 'level' => 2, 'is_header' => false, 'amount' => 50000000],
                ['code' => 'm', 'name' => 'Pendapatan Pelayanan Farmasi & Apotek', 'parent' => '1', 'level' => 2, 'is_header' => false, 'amount' => 2500000000],
                ['code' => 'n', 'name' => 'Pendapatan Pelayanan Rekam Medik', 'parent' => '1', 'level' => 2, 'is_header' => false, 'amount' => 400000000],
                ['code' => 'o', 'name' => 'Pendapatan Pelayanan Ambulance/Kereta Jenazah', 'parent' => '1', 'level' => 2, 'is_header' => false, 'amount' => 50000000],

                // 2. Hibah
                ['code' => '2', 'name' => 'HIBAH', 'parent' => '0', 'level' => 1, 'is_header' => true, 'amount' => 0],

                // 3. Hasil Kerja Sama (Total: Rp 500.000.000)
                ['code' => '3', 'name' => 'HASIL KERJA SAMA', 'parent' => '0', 'level' => 1, 'is_header' => true, 'amount' => 500000000],
                ['code' => 'a', 'name' => 'Hasil Kerjasama Diklat & Praktik Mahasiswa', 'parent' => '3', 'level' => 2, 'is_header' => false, 'amount' => 250000000],
                ['code' => 'b', 'name' => 'Pendapatan Pengelolaan Parkir Rumah Sakit', 'parent' => '3', 'level' => 2, 'is_header' => false, 'amount' => 60000000],
                ['code' => 'c', 'name' => 'Hasil Kerjasama Sewa Lahan & Kantin RS', 'parent' => '3', 'level' => 2, 'is_header' => false, 'amount' => 190000000],

                // 4. APBD (Total: Rp 18.600.000.000)
                ['code' => '4', 'name' => 'ANGGARAN PENDAPATAN BELANJA DAERAH (APBD)', 'parent' => '0', 'level' => 1, 'is_header' => true, 'amount' => 18600000000],
                ['code' => '-', 'name' => 'Bantuan Operasional APBD Provinsi Riau', 'parent' => '4', 'level' => 2, 'is_header' => false, 'amount' => 18600000000],

                // 5. Lain-lain Pendapatan BLUD Sah (Total: Rp 400.000.000)
                ['code' => '5', 'name' => 'LAIN-LAIN PENDAPATAN BADAN LAYANAN UMUM DAERAH YANG SAH', 'parent' => '0', 'level' => 1, 'is_header' => true, 'amount' => 400000000],
                ['code' => '-', 'name' => 'Jasa Giro Operasional BLUD', 'parent' => '5', 'level' => 2, 'is_header' => false, 'amount' => 350000000],
                ['code' => '-', 'name' => 'Pendapatan Bunga Deposito BLUD', 'parent' => '5', 'level' => 2, 'is_header' => false, 'amount' => 50000000],
            ];

            $orderRev = 1;
            foreach ($revenues as $rev) {
                RbaRevenueItem::create([
                    'rba_shift_id' => $shift->id,
                    'item_code' => $rev['code'],
                    'item_name' => $rev['name'],
                    'parent_code' => $rev['parent'],
                    'level' => $rev['level'],
                    'is_header' => $rev['is_header'],
                    'before_amount' => $rev['amount'],
                    'after_amount' => $rev['amount'],
                    'difference' => 0,
                    'order_index' => $orderRev++,
                ]);
            }

            // =========================================================================
            // 3. PAGU BELANJA BLUD RSJ TAMPAN TA 2027 (Total Rp 44.500.000.000)
            // =========================================================================
            // Pagu nominal realistis per akun daun/transaksi
            $leafBudgetMap = [
                // 1.1.1 Belanja Pegawai (Total Rp 18.000.000.000)
                '1.1.1.1.1' => 12500000000, // Belanja Jasa Pelayanan Medik & Keperawatan (Jaspen BLUD)
                '1.1.1.1.2' => 3500000000,  // Belanja Pegawai Non PNS / Tenaga Kontrak BLUD
                '1.1.1.1.3' => 1500000000,  // Belanja Lembur & Uang Saku Petugas Jiwa
                '1.1.1.1.4' => 500000000,   // Belanja Iuran Jaminan Kesehatan & Ketenagakerjaan Pegawai Non-PNS

                // 1.1.2 Belanja Barang dan Jasa Operasional (Total Rp 23.500.000.000)
                '1.1.2.1.1' => 3500000000,  // Belanja Bahan Medis Habis Pakai (BMHP)
                '1.1.2.1.2' => 4200000000,  // Belanja Obat-obatan & Psikofarmaka
                '1.1.2.1.3' => 1200000000,  // Belanja Reagen & Bahan Kimia Laboratorium
                '1.1.2.1.4' => 450000000,   // Belanja Alat Tulis Kantor (ATK)
                '1.1.2.1.5' => 250000000,   // Belanja Bahan Cetak & Penggandaan Formulir RM
                '1.1.2.1.6' => 350000000,   // Belanja Alat & Bahan Kebersihan Ruangan
                '1.1.2.1.7' => 2800000000,  // Belanja Bahan Makanan & Minuman Pasien Rawat Inap
                '1.1.2.1.8' => 1500000000,  // Belanja Pemeliharaan Sarana, Prasarana & Alkes (IPSRS)
                '1.1.2.1.9' => 1800000000,  // Belanja Langganan Daya & Jasa (Listrik PLN, PDAM, Internet)
                '1.1.2.1.10' => 1600000000, // Belanja Jasa Kebersihan (Cleaning Service Pihak Ketiga)
                '1.1.2.1.11' => 900000000,  // Belanja Jasa Keamanan (Security Pihak Ketiga)
                '1.1.2.1.12' => 350000000,  // Belanja Bahan Bakar Minyak & Gas Medis
                '1.1.2.1.13' => 400000000,  // Belanja Pengolahan Limbah Medis B3
                '1.1.2.1.14' => 550000000,  // Belanja Perjalanan Dinas & Konsultasi Teknis
                '1.1.2.1.15' => 450000000,  // Belanja Pendidikan, Pelatihan & Akreditasi Rumah Sakit
                '1.1.2.1.16' => 200000000,  // Belanja Pakaian Dinas & Alat Pelindung Diri (APD)
                '1.1.2.1.17' => 300000000,  // Belanja Premi Asuransi Aset & Gedung RS
                '1.1.2.1.18' => 700000000,  // Belanja Jasa Konsultansi & Audit Eksternal BLUD
                '1.1.2.1.19' => 500000000,  // Belanja Operasional & Pemeliharaan Kendaraan / Ambulance
                '1.1.2.1.20' => 1700000000, // Belanja Operasional Pelayanan Lainnya

                // 1.2.1 Belanja Modal BLUD (Total Rp 3.000.000.000)
                '1.2.1.1' => 0,          // Belanja Modal Tanah
                '1.2.1.2.1' => 1800000000, // Belanja Modal Alat Kedokteran & Kesehatan (Alkes)
                '1.2.1.2.2' => 450000000,  // Belanja Modal Komputer, Server & Jaringan SIMRS
                '1.2.1.2.3' => 250000000,  // Belanja Modal Kendaraan Operasional / Ambulance
                '1.2.1.2.4' => 200000000,  // Belanja Modal Mebel & Peralatan Kantor Ruangan
                '1.2.1.3' => 300000000,  // Belanja Modal Renovasi Gedung & Bangunan Pelayanan
            ];

            // Muat master RBA accounts
            $accounts = RbaAccount::orderBy('account_code')->get();
            $parentCodes = RbaAccount::pluck('parent_code')->filter()->unique()->toArray();

            $orderExp = 1;
            foreach ($accounts as $acc) {
                $isHeader = in_array($acc->account_code, $parentCodes);
                $level = substr_count($acc->account_code, '.') + 1;
                $allocatedAmount = $leafBudgetMap[$acc->account_code] ?? 0;

                // Proporsi sumber dana standar BLUD: 70% Jasa Layanan, 30% APBD/Lainnya
                $jasaLayananPart = $allocatedAmount > 0 ? round($allocatedAmount * 0.70) : 0;
                $apbdPart = $allocatedAmount > 0 ? ($allocatedAmount - $jasaLayananPart) : 0;

                RbaExpenseItem::create([
                    'rba_shift_id' => $shift->id,
                    'rba_account_id' => $acc->id,
                    'account_code' => $acc->account_code,
                    'account_name' => $acc->account_name,
                    'parent_code' => $acc->parent_code,
                    'level' => $level,
                    'is_header' => $isHeader,
                    'before_jasa_layanan' => $jasaLayananPart,
                    'before_hasil_kerjasama' => 0,
                    'before_lain_lain_sah' => 0,
                    'before_silpa' => 0,
                    'before_apbd' => $apbdPart,
                    'before_total' => $allocatedAmount,
                    'after_jasa_layanan' => $jasaLayananPart,
                    'after_hasil_kerjasama' => 0,
                    'after_lain_lain_sah' => 0,
                    'after_silpa' => 0,
                    'after_apbd' => $apbdPart,
                    'after_total' => $allocatedAmount,
                    'difference' => 0,
                    'keterangan' => null,
                    'order_index' => $orderExp++,
                ]);
            }

            // Hitung Roll-up otomatis untuk Header Belanja
            $this->rollUpExpenseHeaders($shift->id);

            // Sinkronisasi data ke master rba_accounts
            $shiftExpenseItems = RbaExpenseItem::where('rba_shift_id', $shift->id)->get();
            foreach ($shiftExpenseItems as $item) {
                $acc = RbaAccount::where('account_code', $item->account_code)->where('period_year', 2027)->first();
                if ($acc) {
                    $acc->update([
                        'total_budget' => $item->after_total,
                        'budget_after_revision' => $item->after_total,
                        'remaining_budget' => $item->after_total,
                        'spent_budget' => 0,
                    ]);
                }
            }

            $shift->activate();
        });
    }

    /**
     * Hitung akumulasi header bertingkat dari akun daun sampai ke akar (1 BELANJA)
     */
    protected function rollUpExpenseHeaders(int $shiftId): void
    {
        $items = RbaExpenseItem::where('rba_shift_id', $shiftId)->get();

        // 1. Level 5 -> Level 4
        $level4Headers = $items->where('level', 4)->where('is_header', true);
        foreach ($level4Headers as $h4) {
            $children = $items->where('parent_code', $h4->account_code);
            $this->updateSingleHeader($h4, $children);
        }

        // 2. Level 4 -> Level 3
        $items = RbaExpenseItem::where('rba_shift_id', $shiftId)->get();
        $level3Headers = $items->where('level', 3)->where('is_header', true);
        foreach ($level3Headers as $h3) {
            $children = $items->where('parent_code', $h3->account_code);
            $this->updateSingleHeader($h3, $children);
        }

        // 3. Level 3 -> Level 2
        $items = RbaExpenseItem::where('rba_shift_id', $shiftId)->get();
        $level2Headers = $items->where('level', 2)->where('is_header', true);
        foreach ($level2Headers as $h2) {
            $children = $items->where('parent_code', $h2->account_code);
            $this->updateSingleHeader($h2, $children);
        }

        // 4. Level 2 -> Level 1 (Root '1' BELANJA)
        $items = RbaExpenseItem::where('rba_shift_id', $shiftId)->get();
        $root = $items->firstWhere('account_code', '1');
        if ($root) {
            $children = $items->where('parent_code', '1');
            $this->updateSingleHeader($root, $children);
        }
    }

    protected function updateSingleHeader($header, $children): void
    {
        if ($children->isEmpty()) {
            return;
        }

        $bJl = $children->sum('before_jasa_layanan');
        $bKs = $children->sum('before_hasil_kerjasama');
        $bLl = $children->sum('before_lain_lain_sah');
        $bSilpa = $children->sum('before_silpa');
        $bApbd = $children->sum('before_apbd');
        $bTot = $bJl + $bKs + $bLl + $bSilpa + $bApbd;

        $aJl = $children->sum('after_jasa_layanan');
        $aKs = $children->sum('after_hasil_kerjasama');
        $aLl = $children->sum('after_lain_lain_sah');
        $aSilpa = $children->sum('after_silpa');
        $aApbd = $children->sum('after_apbd');
        $aTot = $aJl + $aKs + $aLl + $aSilpa + $aApbd;

        $header->update([
            'before_jasa_layanan' => $bJl,
            'before_hasil_kerjasama' => $bKs,
            'before_lain_lain_sah' => $bLl,
            'before_silpa' => $bSilpa,
            'before_apbd' => $bApbd,
            'before_total' => $bTot,
            'after_jasa_layanan' => $aJl,
            'after_hasil_kerjasama' => $aKs,
            'after_lain_lain_sah' => $aLl,
            'after_silpa' => $aSilpa,
            'after_apbd' => $aApbd,
            'after_total' => $aTot,
            'difference' => $aTot - $bTot,
        ]);
    }
}
