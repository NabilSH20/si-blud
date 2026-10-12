<?php

namespace Database\Seeders;

use App\Models\Item;
use App\Models\RbaAccount;
use App\Models\Requisition;
use App\Models\RequisitionDetail;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RequisitionWorkflowSeeder extends Seeder
{
    /**
     * Run the database seeds for full end-to-end requisitions workflow TA 2027.
     */
    public function run(): void
    {
        DB::transaction(function () {
            // Ambil akun aktor
            $userIgd = User::where('email', 'igd@rsj.com')->first();
            $userFarmasi = User::where('email', 'farmasi@rsj.com')->first();
            $userPoli = User::where('email', 'poliklinik@rsj.com')->first();
            $userUpip = User::where('email', 'upip@rsj.com')->first();
            $userLab = User::where('email', 'lab@rsj.com')->first();
            $userIpsrs = User::where('email', 'ipsrs@rsj.com')->first();
            $userRanap = User::where('email', 'ranappria@rsj.com')->first();

            $userPerencanaan = User::where('role', 'perencanaan')->first();
            $userKeuangan = User::where('role', 'keuangan')->first();

            // Ambil akun rekening belanja
            $accBhpMedis = RbaAccount::where('account_code', '1.1.2.1.1')->first();
            $accObat = RbaAccount::where('account_code', '1.1.2.1.2')->first() ?? $accBhpMedis;
            $accLab = RbaAccount::where('account_code', '1.1.2.1.3')->first() ?? $accBhpMedis;
            $accPemeliharaan = RbaAccount::where('account_code', '1.1.2.1.8')->first() ?? $accBhpMedis;
            $accAlkes = RbaAccount::where('account_code', '1.2.1.2.1')->first() ?? $accBhpMedis;

            // Reset serapan belanja pada rba_accounts sebelum memulai seeding transaksi
            RbaAccount::query()->update([
                'spent_budget' => 0,
                'remaining_budget' => DB::raw('total_budget'),
            ]);

            // Bersihkan data transaksi lama
            RequisitionDetail::query()->delete();
            Requisition::query()->delete();

            // =========================================================================
            // SKENARIO 1: PENDING PERENCANAAN (Baru Diajukan Unit, Menunggu Telaah)
            // =========================================================================

            // 1.1 IGD: Pengajuan Bahan Medis Habis Pakai Emergency
            $this->createRequisition([
                'number' => 'REQ-20270310-0001',
                'user' => $userIgd,
                'account' => $accBhpMedis,
                'jenis' => 'Operasi',
                'sub_kegiatan' => 'PELAYANAN GAWAT DARURAT (IGD) 2027',
                'nomor_surat' => '021/IGD/2027',
                'urgency' => 'Kebutuhan mendesak pengadaan BHP medis steril untuk penanganan pasien gaduh gelisah dan darurat psikiatri bulan Maret 2027.',
                'date' => '2027-03-10',
                'status' => 'Pending_Perencanaan',
                'items' => [
                    ['name' => 'ABBOCATH NO 20 Terumo', 'unit' => 'Pcs', 'price' => 18000, 'qty' => 50, 'spec' => 'Jarum infus no 20 Terumo steril'],
                    ['name' => 'ALKOHOL SWAB', 'unit' => 'Box', 'price' => 25000, 'qty' => 30, 'spec' => 'Kapas alkohol sachet isi 100 pcs'],
                    ['name' => 'DARYANT-TULE', 'unit' => 'Box', 'price' => 195000, 'qty' => 10, 'spec' => 'Kasa pembalut luka steril isi 10'],
                    ['name' => 'HANSCOON M / PASANG', 'unit' => 'Pasang', 'price' => 6000, 'qty' => 200, 'spec' => 'Sarung tangan bedah steril ukuran M'],
                    ['name' => 'HANDRUB /ASEPTAN 500 ML', 'unit' => 'Botol', 'price' => 45000, 'qty' => 20, 'spec' => 'Cairan pembersih tangan berbasis alkohol 500 ml'],
                ],
            ]);

            // 1.2 Farmasi: Pengadaan Bahan Baku Kapsul & Perlengkapan Resep
            $this->createRequisition([
                'number' => 'REQ-20270312-0002',
                'user' => $userFarmasi,
                'account' => $accBhpMedis,
                'jenis' => 'Operasi',
                'sub_kegiatan' => 'PELAYANAN KEFARMASIAN DAN PENGELOLAAN RESEP 2027',
                'nomor_surat' => '034/IFRS/2027',
                'urgency' => 'Stok cangkang kapsul racikan puyer pasien jiwa menipis, diperlukan pengadaan cepat untuk pelayanan rawat jalan dan inap.',
                'date' => '2027-03-12',
                'status' => 'Pending_Perencanaan',
                'items' => [
                    ['name' => 'CANGKANG CAPSUL NO  0', 'unit' => 'Botol', 'price' => 65000, 'qty' => 25, 'spec' => 'Cangkang kapsul kosong ukuran 0 isi 1000'],
                    ['name' => 'CANGKANG CAPSUL NO 1', 'unit' => 'Botol', 'price' => 60000, 'qty' => 25, 'spec' => 'Cangkang kapsul kosong ukuran 1 isi 1000'],
                    ['name' => 'CATGUT CHROMIC 3/0 ONEMED', 'unit' => 'Box', 'price' => 175000, 'qty' => 12, 'spec' => 'Benang bedah chromic 3/0 isi 24 pcs'],
                    ['name' => 'ELASTIC VERBAN 4 INC', 'unit' => 'Roll', 'price' => 20000, 'qty' => 40, 'spec' => 'Pembalut elastis ukuran lebar 4 inch'],
                ],
            ]);

            // 1.3 Poliklinik: Pengadaan Obat-Obatan Suportif Poliklinik
            $this->createRequisition([
                'number' => 'REQ-20270314-0003',
                'user' => $userPoli,
                'account' => $accObat,
                'jenis' => 'Operasi',
                'sub_kegiatan' => 'PELAYANAN RAWAT JALAN SPESIALIS 2027',
                'nomor_surat' => '019/POLI/2027',
                'urgency' => 'Kebutuhan obat analgesik dan antihistamin untuk pasien poliklinik jiwa terpadu dan konsultasi anak/remaja.',
                'date' => '2027-03-14',
                'status' => 'Pending_Perencanaan',
                'items' => [
                    ['name' => 'PARACETAMOL TAB 500 MG', 'unit' => 'Tablet', 'price' => 300, 'qty' => 2000, 'spec' => 'Antipiretik analgesik paracetamol 500 mg'],
                    ['name' => 'CETIRIZINE 10 MG TAB', 'unit' => 'Tablet', 'price' => 450, 'qty' => 1000, 'spec' => 'Antihistamin cetirizine HCl 10 mg'],
                    ['name' => 'DOMPERIDONE 10 MG', 'unit' => 'Tablet', 'price' => 500, 'qty' => 800, 'spec' => 'Antiemetik domperidone 10 mg'],
                    ['name' => 'VITAMIN B KOMPLEKS', 'unit' => 'Tablet', 'price' => 200, 'qty' => 3000, 'spec' => 'Multivitamin B kompleks salut gula'],
                ],
            ]);

            // =========================================================================
            // SKENARIO 2: DIPROSES KEUANGAN (Lolos Perencanaan, Menunggu Verifikasi SPP/SPM)
            // =========================================================================

            // 2.1 Laboratorium: Pengadaan Alat Skrining Narkoba & Strip Tes
            $this->createRequisition([
                'number' => 'REQ-20270222-0004',
                'user' => $userLab,
                'account' => $accLab,
                'jenis' => 'Operasi',
                'sub_kegiatan' => 'PELAYANAN LABORATORIUM DAN PATOLOGI KLINIK 2027',
                'nomor_surat' => '011/LAB/2027',
                'urgency' => 'Kebutuhan rutin uji bebas narkoba 6 parameter untuk permohonan SKBN dan tes darah rutin pasien NAPZA.',
                'date' => '2027-02-22',
                'status' => 'Diproses_Keuangan',
                'verified_by_perencanaan_id' => $userPerencanaan?->id,
                'verified_perencanaan_at' => '2027-02-24 10:15:00',
                'notes_perencanaan' => 'Telah ditelaah dan diverifikasi. Alokasi rekening 1.1.2.1.3 mencukupi dan barang sesuai dengan standar RS.',
                'items' => [
                    ['name' => 'MULTI 6 DRUG TEST DEVICE', 'unit' => 'Pcs', 'price' => 85000, 'qty' => 100, 'spec' => 'Alat rapid test urin 6 parameter narkoba'],
                    ['name' => 'TABUNG EDTA 3 ML', 'unit' => 'Box', 'price' => 120000, 'qty' => 15, 'spec' => 'Tabung vakum darah hematologi isi 100'],
                    ['name' => 'STIK GLUCOSE', 'unit' => 'Box', 'price' => 180000, 'qty' => 20, 'spec' => 'Strip uji gula darah glukometer isi 50'],
                    ['name' => 'DISPOSIBLE LANCET', 'unit' => 'Box', 'price' => 35000, 'qty' => 20, 'spec' => 'Jarum lancet steril tusuk jari isi 100'],
                ],
            ]);

            // 2.2 IPSRS: Pemeliharaan Sarana Sanitasi & Kebersihan Ruang Rawat
            $this->createRequisition([
                'number' => 'REQ-20270226-0005',
                'user' => $userIpsrs,
                'account' => $accPemeliharaan,
                'jenis' => 'Operasi',
                'sub_kegiatan' => 'PEMELIHARAAN SARANA, PRASARANA DAN ALKES 2027',
                'nomor_surat' => '016/IPSRS/2027',
                'urgency' => 'Perbaikan dan pemeliharaan rutin sarana ruang perawatan intensif dan pencegahan infeksi nosokomial.',
                'date' => '2027-02-26',
                'status' => 'Diproses_Keuangan',
                'verified_by_perencanaan_id' => $userPerencanaan?->id,
                'verified_perencanaan_at' => '2027-02-28 14:30:00',
                'notes_perencanaan' => 'Spesifikasi material sesuai dengan pengajuan berkala instalasi sarana prasarana.',
                'items' => [
                    ['name' => 'HANDWASH / ONE SCRUB 2% 500 ML', 'unit' => 'Botol', 'price' => 55000, 'qty' => 60, 'spec' => 'Sabun antiseptik klorheksidin 2% 500 ml'],
                    ['name' => 'ALKOHOL 70 %', 'unit' => 'Botol', 'price' => 35000, 'qty' => 50, 'spec' => 'Cairan disinfektan 70% 1000 ml'],
                    ['name' => 'H2O2 3% 100 ML', 'unit' => 'Botol', 'price' => 12000, 'qty' => 40, 'spec' => 'Hidrogen peroksida 3% 100 ml pembersih luka'],
                ],
            ]);

            // =========================================================================
            // SKENARIO 3: DISETUJUI SELESAI (Lolos Keuangan, SP2D Terbit, Pagu Terpotong)
            // =========================================================================

            // 3.1 IGD: Pengadaan Obat Emergensi Jiwa (Awal Januari 2027)
            $this->createRequisition([
                'number' => 'REQ-20270110-0006',
                'user' => $userIgd,
                'account' => $accObat,
                'jenis' => 'Operasi',
                'sub_kegiatan' => 'PELAYANAN GAWAT DARURAT (IGD) 2027',
                'nomor_surat' => '003/IGD/2027',
                'urgency' => 'Persediaan obat penenang cepat dan sedatif darurat untuk penanganan pasien gaduh gelisah di IGD awal tahun.',
                'date' => '2027-01-10',
                'status' => 'Disetujui_Selesai',
                'verified_by_perencanaan_id' => $userPerencanaan?->id,
                'verified_perencanaan_at' => '2027-01-12 09:00:00',
                'notes_perencanaan' => 'Disetujui penuh untuk pengamanan pelayanan IGD.',
                'approved_by_keuangan_id' => $userKeuangan?->id,
                'approved_keuangan_at' => '2027-01-15 11:20:00',
                'notes_keuangan' => 'Dokumen verifikasi lengkap, alokasi kas BLUD tersedia. Diterbitkan SP2D-BLUD/001/2027.',
                'sp2d_number' => 'SP2D-BLUD/001/2027',
                'receipt_number' => 'KWT-20270115-001',
                'items' => [
                    ['name' => 'DIAZEPAM INJEKSI 5MG/ML', 'unit' => 'Ampul', 'price' => 9500, 'qty' => 400, 'spec' => 'Injeksi diazepam 10 mg/2 ml'],
                    ['name' => 'HALOPERIDOL  5 MG  INJ', 'unit' => 'Ampul', 'price' => 12500, 'qty' => 400, 'spec' => 'Injeksi haloperidol 5 mg/ml ampul'],
                    ['name' => 'CHLORPROMAZINE INJEKSI', 'unit' => 'Ampul', 'price' => 8500, 'qty' => 300, 'spec' => 'Injeksi CPZ 25 mg/ml ampul 2 ml'],
                    ['name' => 'DIPHENHYDRAMINE 10 MG INJ', 'unit' => 'Ampul', 'price' => 7500, 'qty' => 300, 'spec' => 'Antihistamin injeksi diphenhydramine 10 mg/ml'],
                    ['name' => 'RINGER LACTAS', 'unit' => 'Kolf', 'price' => 14000, 'qty' => 350, 'spec' => 'Cairan infus Ringer Laktat 500 ml'],
                ],
            ]);

            // 3.2 Farmasi: Pengadaan Obat Psikofarmaka Oral Rutin
            $this->createRequisition([
                'number' => 'REQ-20270120-0007',
                'user' => $userFarmasi,
                'account' => $accObat,
                'jenis' => 'Operasi',
                'sub_kegiatan' => 'PELAYANAN KEFARMASIAN DAN PENGELOLAAN RESEP 2027',
                'nomor_surat' => '008/IFRS/2027',
                'urgency' => 'Kebutuhan obat psikotropika rutin pasien rawat inap dan rawat jalan periode bulan Januari - Februari.',
                'date' => '2027-01-20',
                'status' => 'Disetujui_Selesai',
                'verified_by_perencanaan_id' => $userPerencanaan?->id,
                'verified_perencanaan_at' => '2027-01-22 10:00:00',
                'notes_perencanaan' => 'Sesuai dengan formularium RSJ Tampan.',
                'approved_by_keuangan_id' => $userKeuangan?->id,
                'approved_keuangan_at' => '2027-01-25 14:00:00',
                'notes_keuangan' => 'Alokasi belanja obat telah disahkan. SP2D nomor SP2D-BLUD/002/2027.',
                'sp2d_number' => 'SP2D-BLUD/002/2027',
                'receipt_number' => 'KWT-20270125-002',
                'items' => [
                    ['name' => 'RISPERIDONE 2 MG', 'unit' => 'Tablet', 'price' => 1200, 'qty' => 10000, 'spec' => 'Antipsikotik atipikal risperidone 2 mg'],
                    ['name' => 'CLOZAPINE 100 MG TABLET', 'unit' => 'Tablet', 'price' => 4800, 'qty' => 3000, 'spec' => 'Antipsikotik atipikal clozapine 100 mg'],
                    ['name' => 'HALOPERIDOL  5 MG', 'unit' => 'Tablet', 'price' => 450, 'qty' => 10000, 'spec' => 'Antipsikotik tipikal haloperidol 5 mg strip'],
                    ['name' => 'TRIHEXYHENIDYL 2 MG', 'unit' => 'Tablet', 'price' => 350, 'qty' => 12000, 'spec' => 'Antikolinergik mengatasi efek ekstrapyramidal THP 2 mg'],
                ],
            ]);

            // 3.3 UPIP / Perawatan Intensif: Pengadaan BHP Pasien Gaduh Gelisah
            $this->createRequisition([
                'number' => 'REQ-20270205-0008',
                'user' => $userUpip,
                'account' => $accBhpMedis,
                'jenis' => 'Operasi',
                'sub_kegiatan' => 'PELAYANAN KEPERAWATAN INTENSIF (UPIP) 2027',
                'nomor_surat' => '005/UPIP/2027',
                'urgency' => 'Kebutuhan sarung tangan steril, perban, dan perlengkapan fiksasi fisik pasien rawat intensif.',
                'date' => '2027-02-05',
                'status' => 'Disetujui_Selesai',
                'verified_by_perencanaan_id' => $userPerencanaan?->id,
                'verified_perencanaan_at' => '2027-02-07 11:30:00',
                'notes_perencanaan' => 'Terverifikasi.',
                'approved_by_keuangan_id' => $userKeuangan?->id,
                'approved_keuangan_at' => '2027-02-10 15:45:00',
                'notes_keuangan' => 'Pencairan dana disetujui.',
                'sp2d_number' => 'SP2D-BLUD/003/2027',
                'receipt_number' => 'KWT-20270210-003',
                'items' => [
                    ['name' => 'HANSCOON L / PASANG', 'unit' => 'Pasang', 'price' => 6000, 'qty' => 500, 'spec' => 'Sarung tangan bedah steril ukuran L'],
                    ['name' => 'ELASTIC VERBAN 6 INC', 'unit' => 'Roll', 'price' => 28000, 'qty' => 60, 'spec' => 'Pembalut elastis ukuran lebar 6 inch'],
                    ['name' => 'ARM SLING L', 'unit' => 'Pcs', 'price' => 45000, 'qty' => 20, 'spec' => 'Penyangga lengan ukuran L'],
                ],
            ]);

            // 3.4 Rawat Inap Pria: Pengadaan Cairan Infus & Nutrisi Pasien
            $this->createRequisition([
                'number' => 'REQ-20270215-0009',
                'user' => $userRanap,
                'account' => $accBhpMedis,
                'jenis' => 'Operasi',
                'sub_kegiatan' => 'PELAYANAN RAWAT INAP PSIKIATRI PRIA 2027',
                'nomor_surat' => '009/RANAP/2027',
                'urgency' => 'Penyediaan cairan infus fisiologis dan selang infus ruang rawat inap psikiatri pria.',
                'date' => '2027-02-15',
                'status' => 'Disetujui_Selesai',
                'verified_by_perencanaan_id' => $userPerencanaan?->id,
                'verified_perencanaan_at' => '2027-02-17 09:40:00',
                'notes_perencanaan' => 'Disetujui.',
                'approved_by_keuangan_id' => $userKeuangan?->id,
                'approved_keuangan_at' => '2027-02-20 13:10:00',
                'notes_keuangan' => 'Telah dicairkan via kasir pengeluaran BLUD.',
                'sp2d_number' => 'SP2D-BLUD/004/2027',
                'receipt_number' => 'KWT-20270220-004',
                'items' => [
                    ['name' => 'NACL 0.9 %', 'unit' => 'Kolf', 'price' => 13500, 'qty' => 500, 'spec' => 'Cairan infus normal saline 0.9% 500 ml'],
                    ['name' => 'BLOOD TRANSFUSION SET', 'unit' => 'Set', 'price' => 22000, 'qty' => 50, 'spec' => 'Selang transfusi darah dengan filter'],
                    ['name' => 'EXTENSION TUBE', 'unit' => 'Pcs', 'price' => 18000, 'qty' => 80, 'spec' => 'Selang sambung infus fleksibel'],
                ],
            ]);

            // 3.5 Laboratorium: Pengadaan Bahan Uji Kimia & Darah (Januari 2027)
            $this->createRequisition([
                'number' => 'REQ-20270118-0010',
                'user' => $userLab,
                'account' => $accLab,
                'jenis' => 'Operasi',
                'sub_kegiatan' => 'PELAYANAN LABORATORIUM DAN PATOLOGI KLINIK 2027',
                'nomor_surat' => '004/LAB/2027',
                'urgency' => 'Kebutuhan reagen skrining infeksi menular dan hepatitis untuk pasien baru rawat inap.',
                'date' => '2027-01-18',
                'status' => 'Disetujui_Selesai',
                'verified_by_perencanaan_id' => $userPerencanaan?->id,
                'verified_perencanaan_at' => '2027-01-20 11:00:00',
                'notes_perencanaan' => 'Disetujui sesuai program penunjang diagnostik.',
                'approved_by_keuangan_id' => $userKeuangan?->id,
                'approved_keuangan_at' => '2027-01-23 16:00:00',
                'notes_keuangan' => 'SP2D diterbitkan.',
                'sp2d_number' => 'SP2D-BLUD/005/2027',
                'receipt_number' => 'KWT-20270123-005',
                'items' => [
                    ['name' => 'REAGEN HBs Ag', 'unit' => 'Kit', 'price' => 450000, 'qty' => 8, 'spec' => 'Reagen screening Hepatitis B surface antigen'],
                    ['name' => 'ANTI HIV RAPID TEST', 'unit' => 'Kit', 'price' => 650000, 'qty' => 6, 'spec' => 'Alat uji cepat antibodi HIV 1/2'],
                    ['name' => 'TABUNG NON EDTA 3 ML', 'unit' => 'Box', 'price' => 110000, 'qty' => 15, 'spec' => 'Tabung vakum darah kimia serum isi 100'],
                ],
            ]);

            // =========================================================================
            // SKENARIO 4: DITOLAK (Ditolak oleh Perencanaan dengan Catatan Revisi)
            // =========================================================================

            // 4.1 Ruang Rawat Inap: Usulan Pengadaan Non-Standar
            $this->createRequisition([
                'number' => 'REQ-20270228-0011',
                'user' => $userRanap,
                'account' => $accBhpMedis,
                'jenis' => 'Operasi',
                'sub_kegiatan' => 'PELAYANAN RAWAT INAP PSIKIATRI PRIA 2027',
                'nomor_surat' => '014/RANAP/2027',
                'urgency' => 'Pengajuan tambahan perban elastis dan arm sling dalam jumlah sangat besar di luar rasio bulanan.',
                'date' => '2027-02-28',
                'status' => 'Ditolak',
                'verified_by_perencanaan_id' => $userPerencanaan?->id,
                'verified_perencanaan_at' => '2027-03-02 14:00:00',
                'notes_perencanaan' => 'Ditolak. Jumlah volume usulan melebihi standar pemakaian triwulan unit rawat inap (rasio over-budget). Harap ajukan ulang dengan volume rasional sesuai histori kebutuhan 3 bulan terakhir.',
                'items' => [
                    ['name' => 'ARM SLING L', 'unit' => 'Pcs', 'price' => 45000, 'qty' => 250, 'spec' => 'Penyangga lengan ukuran L'],
                    ['name' => 'ELASTIC VERBAN 6 INC', 'unit' => 'Roll', 'price' => 28000, 'qty' => 300, 'spec' => 'Pembalut elastis ukuran lebar 6 inch'],
                ],
            ]);
        });
    }

    /**
     * Helper untuk membuat requisition beserta rincian itemnya & memotong pagu jika Disetujui_Selesai
     */
    protected function createRequisition(array $data): void
    {
        $user = $data['user'];
        $account = $data['account'];

        $grandEstimated = 0;
        foreach ($data['items'] as $it) {
            $grandEstimated += ($it['price'] * $it['qty']);
        }

        $isApproved = ($data['status'] === 'Disetujui_Selesai');
        $grandApproved = $isApproved ? $grandEstimated : 0;

        $operasional = $data['jenis'] === 'Operasi' ? $grandEstimated : 0;
        $modal = $data['jenis'] === 'Modal' ? $grandEstimated : 0;

        $requisition = Requisition::create([
            'requisition_number' => $data['number'],
            'nomor_surat_unit' => $data['nomor_surat'],
            'division_id' => $user?->division_id,
            'unit_id' => $user?->unit_id,
            'user_id' => $user?->id,
            'rba_account_id' => $account?->id,
            'jenis_belanja' => $data['jenis'],
            'sumber_dana' => 'BLUD',
            'program' => 'Program Peningkatan Pelayanan Kesehatan Pada BLUD',
            'kegiatan' => '1. Pelayanan Kesehatan',
            'sub_kegiatan' => $data['sub_kegiatan'],
            'tolok_ukur_output' => "1. Terpenuhinya kebutuhan bahan dan penunjang operasional {$data['sub_kegiatan']}\n2. Kelancaran kegiatan administrasi dan pelayanan pasien",
            'target_output' => '100%',
            'tolok_ukur_outcome' => "1. Terlaksananya pelayanan pasien secara bermutu dan tepat waktu sesuai standar SPM\n2. Meningkatnya kepuasan pelanggan terhadap pelayanan RS Jiwa Tampan",
            'target_outcome' => '100%',
            'urgency_reason' => $data['urgency'],
            'fiscal_year' => 2027,
            'budget_year' => 2027,
            'status' => $data['status'],
            'submission_date' => $data['date'],
            'total_estimated' => $grandEstimated,
            'total_operasional' => $operasional,
            'total_modal' => $modal,
            'total_approved' => $grandApproved,
            'notes_perencanaan' => $data['notes_perencanaan'] ?? null,
            'verified_by_perencanaan_id' => $data['verified_by_perencanaan_id'] ?? null,
            'verified_perencanaan_at' => $data['verified_perencanaan_at'] ?? null,
            'notes_keuangan' => $data['notes_keuangan'] ?? null,
            'approved_by_keuangan_id' => $data['approved_by_keuangan_id'] ?? null,
            'approved_keuangan_at' => $data['approved_keuangan_at'] ?? null,
            'sp2d_number' => $data['sp2d_number'] ?? null,
            'receipt_number' => $data['receipt_number'] ?? null,
            'created_at' => Carbon::parse($data['date'])->setTime(9, 30),
            'updated_at' => Carbon::parse($data['date'])->setTime(14, 45),
        ]);

        foreach ($data['items'] as $it) {
            $itemModel = Item::where('name', $it['name'])->first();
            $subtotal = $it['price'] * $it['qty'];

            RequisitionDetail::create([
                'requisition_id' => $requisition->id,
                'item_id' => $itemModel?->id,
                'item_name' => $it['name'],
                'unit_type' => $it['unit'],
                'specification' => $it['spec'],
                'quantity_requested' => $it['qty'],
                'quantity_approved' => $isApproved ? $it['qty'] : null,
                'unit_price' => $it['price'],
                'exceeds_ssh' => false,
                'subtotal' => $subtotal,
            ]);
        }

        // Jika Disetujui_Selesai, potong pagu belanja pada rba_accounts terkait
        if ($isApproved && $account) {
            $account->spent_budget = (float) $account->spent_budget + $grandApproved;
            $account->remaining_budget = max(0, (float) $account->total_budget - (float) $account->spent_budget);
            $account->save();
        }
    }
}
