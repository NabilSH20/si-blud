<?php

namespace Database\Seeders;

use App\Models\RbaExpenseItem;
use App\Models\RbaRevenueItem;
use App\Models\RbaShift;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RbaPergeseran3Seeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function () {
            // 1. Create or retrieve Pergeseran III
            $shift = RbaShift::updateOrCreate(
                [
                    'year' => 2026,
                    'shift_name' => 'Pergeseran III',
                ],
                [
                    'doc_title' => 'RENCANA BISNIS DAN ANGGARAN PERGESERAN III',
                    'period_month' => 'Juli 2026',
                    'status' => 'Aktif',
                    'notes' => 'RBA Pergeseran III Tahun Anggaran 2026 RS Jiwa Tampan Provinsi Riau disahkan pada Juli 2026.',
                ]
            );

            // Clear old items if any
            RbaExpenseItem::where('rba_shift_id', $shift->id)->delete();

            $rawItems = [
                // 1. BELANJA
                [
                    'code' => '1',
                    'name' => 'BELANJA',
                    'parent' => null,
                    'level' => 1,
                    'is_header' => true,
                    'b_jl' => 25047246628, 'b_ks' => 445167500, 'b_ll' => 315000000, 'b_silpa' => 0, 'b_apbd' => 18473614708, 'b_tot' => 44281028836,
                    'a_jl' => 24958022628, 'a_ks' => 445167500, 'a_ll' => 315000000, 'a_silpa' => 0, 'a_apbd' => 18473614708, 'a_tot' => 44191804836,
                    'diff' => -89224000,
                    'ket' => null,
                ],
                // 1.1 BELANJA OPERASI
                [
                    'code' => '1.1',
                    'name' => 'BELANJA OPERASI',
                    'parent' => '1',
                    'level' => 2,
                    'is_header' => true,
                    'b_jl' => 25047246628, 'b_ks' => 445167500, 'b_ll' => 315000000, 'b_silpa' => 0, 'b_apbd' => 17271214708, 'b_tot' => 42078628836,
                    'a_jl' => 24958022628, 'a_ks' => 445167500, 'a_ll' => 315000000, 'a_silpa' => 0, 'a_apbd' => 17271214708, 'a_tot' => 41989404836,
                    'diff' => -89224000,
                    'ket' => null,
                ],
                // 1.1.1 Belanja Pegawai
                [
                    'code' => '1.1.1',
                    'name' => 'Belanja Pegawai',
                    'parent' => '1.1',
                    'level' => 3,
                    'is_header' => true,
                    'b_jl' => 0, 'b_ks' => 0, 'b_ll' => 0, 'b_silpa' => 0, 'b_apbd' => 0, 'b_tot' => 0,
                    'a_jl' => 0, 'a_ks' => 0, 'a_ll' => 0, 'a_silpa' => 0, 'a_apbd' => 0, 'a_tot' => 0,
                    'diff' => 0,
                    'ket' => null,
                ],
                [
                    'code' => '1.1.1.1',
                    'name' => 'Belanja Pegawai BLUD',
                    'parent' => '1.1.1',
                    'level' => 4,
                    'is_header' => false,
                    'b_jl' => 0, 'b_ks' => 0, 'b_ll' => 0, 'b_silpa' => 0, 'b_apbd' => 0, 'b_tot' => 0,
                    'a_jl' => 0, 'a_ks' => 0, 'a_ll' => 0, 'a_silpa' => 0, 'a_apbd' => 0, 'a_tot' => 0,
                    'diff' => 0,
                    'ket' => null,
                ],
                // 1.1.2 Belanja Barang dan jasa
                [
                    'code' => '1.1.2',
                    'name' => 'Belanja Barang dan jasa',
                    'parent' => '1.1',
                    'level' => 3,
                    'is_header' => true,
                    'b_jl' => 24047246628, 'b_ks' => 445167500, 'b_ll' => 315000000, 'b_silpa' => 0, 'b_apbd' => 17271214708, 'b_tot' => 42078628836,
                    'a_jl' => 23958022628, 'a_ks' => 445167500, 'a_ll' => 315000000, 'a_silpa' => 0, 'a_apbd' => 17271214708, 'a_tot' => 41989404836,
                    'diff' => -89224000,
                    'ket' => null,
                ],
                // 1.1.2.1 Belanja Barang dan jasa BLUD
                [
                    'code' => '1.1.2.1',
                    'name' => 'Belanja Barang dan jasa BLUD',
                    'parent' => '1.1.2',
                    'level' => 4,
                    'is_header' => true,
                    'b_jl' => 24047246628, 'b_ks' => 445167500, 'b_ll' => 315000000, 'b_silpa' => 0, 'b_apbd' => 0, 'b_tot' => 24807414128,
                    'a_jl' => 23958022628, 'a_ks' => 445167500, 'a_ll' => 315000000, 'a_silpa' => 0, 'a_apbd' => 0, 'a_tot' => 24718190128,
                    'diff' => -89224000,
                    'ket' => null,
                ],
                // Leaf items 1.1.2.1.1 to 1.1.2.1.35
                [
                    'code' => '1.1.2.1.1', 'name' => 'Belanja bahan habis pakai material kesehatan',
                    'parent' => '1.1.2.1', 'level' => 5, 'is_header' => false,
                    'b_jl' => 366228500, 'b_ks' => 0, 'b_ll' => 0, 'b_silpa' => 0, 'b_apbd' => 0, 'b_tot' => 366228500,
                    'a_jl' => 366228500, 'a_ks' => 0, 'a_ll' => 0, 'a_silpa' => 0, 'a_apbd' => 0, 'a_tot' => 366228500,
                    'diff' => 0, 'ket' => null,
                ],
                [
                    'code' => '1.1.2.1.2', 'name' => 'Belanja obat-obatan',
                    'parent' => '1.1.2.1', 'level' => 5, 'is_header' => false,
                    'b_jl' => 2320436690, 'b_ks' => 0, 'b_ll' => 0, 'b_silpa' => 0, 'b_apbd' => 0, 'b_tot' => 2320436690,
                    'a_jl' => 2320436690, 'a_ks' => 0, 'a_ll' => 0, 'a_silpa' => 0, 'a_apbd' => 0, 'a_tot' => 2320436690,
                    'diff' => 0, 'ket' => null,
                ],
                [
                    'code' => '1.1.2.1.3', 'name' => 'Belanja bahan habis pakai material laboratorium',
                    'parent' => '1.1.2.1', 'level' => 5, 'is_header' => false,
                    'b_jl' => 955151302, 'b_ks' => 0, 'b_ll' => 0, 'b_silpa' => 0, 'b_apbd' => 0, 'b_tot' => 955151302,
                    'a_jl' => 955151302, 'a_ks' => 0, 'a_ll' => 0, 'a_silpa' => 0, 'a_apbd' => 0, 'a_tot' => 955151302,
                    'diff' => 0, 'ket' => null,
                ],
                [
                    'code' => '1.1.2.1.4', 'name' => 'Belanja radiologi',
                    'parent' => '1.1.2.1', 'level' => 5, 'is_header' => false,
                    'b_jl' => 5500000, 'b_ks' => 0, 'b_ll' => 0, 'b_silpa' => 0, 'b_apbd' => 0, 'b_tot' => 5500000,
                    'a_jl' => 5500000, 'a_ks' => 0, 'a_ll' => 0, 'a_silpa' => 0, 'a_apbd' => 0, 'a_tot' => 5500000,
                    'diff' => 0, 'ket' => null,
                ],
                [
                    'code' => '1.1.2.1.5', 'name' => 'Belanja bahan habis pakai material laundry',
                    'parent' => '1.1.2.1', 'level' => 5, 'is_header' => false,
                    'b_jl' => 108457648, 'b_ks' => 0, 'b_ll' => 0, 'b_silpa' => 0, 'b_apbd' => 0, 'b_tot' => 108457648,
                    'a_jl' => 108457648, 'a_ks' => 0, 'a_ll' => 0, 'a_silpa' => 0, 'a_apbd' => 0, 'a_tot' => 108457648,
                    'diff' => 0, 'ket' => null,
                ],
                [
                    'code' => '1.1.2.1.6', 'name' => 'Belanja bahan habis pakai material Sterilisasi',
                    'parent' => '1.1.2.1', 'level' => 5, 'is_header' => false,
                    'b_jl' => 41875000, 'b_ks' => 0, 'b_ll' => 0, 'b_silpa' => 0, 'b_apbd' => 0, 'b_tot' => 41875000,
                    'a_jl' => 41875000, 'a_ks' => 0, 'a_ll' => 0, 'a_silpa' => 0, 'a_apbd' => 0, 'a_tot' => 41875000,
                    'diff' => 0, 'ket' => null,
                ],
                [
                    'code' => '1.1.2.1.7', 'name' => 'Belanja bahan habis pakai psikologi/psikometri',
                    'parent' => '1.1.2.1', 'level' => 5, 'is_header' => false,
                    'b_jl' => 10000000, 'b_ks' => 0, 'b_ll' => 0, 'b_silpa' => 0, 'b_apbd' => 0, 'b_tot' => 10000000,
                    'a_jl' => 10000000, 'a_ks' => 0, 'a_ll' => 0, 'a_silpa' => 0, 'a_apbd' => 0, 'a_tot' => 10000000,
                    'diff' => 0, 'ket' => null,
                ],
                [
                    'code' => '1.1.2.1.8', 'name' => 'Belanja Bahan Bakar Minyak/Gas',
                    'parent' => '1.1.2.1', 'level' => 5, 'is_header' => false,
                    'b_jl' => 5500000, 'b_ks' => 0, 'b_ll' => 0, 'b_silpa' => 0, 'b_apbd' => 0, 'b_tot' => 5500000,
                    'a_jl' => 5500000, 'a_ks' => 0, 'a_ll' => 0, 'a_silpa' => 0, 'a_apbd' => 0, 'a_tot' => 5500000,
                    'diff' => 0, 'ket' => null,
                ],
                [
                    'code' => '1.1.2.1.9', 'name' => 'Belanja SIM RS',
                    'parent' => '1.1.2.1', 'level' => 5, 'is_header' => false,
                    'b_jl' => 90000000, 'b_ks' => 0, 'b_ll' => 0, 'b_silpa' => 0, 'b_apbd' => 0, 'b_tot' => 90000000,
                    'a_jl' => 90000000, 'a_ks' => 0, 'a_ll' => 0, 'a_silpa' => 0, 'a_apbd' => 0, 'a_tot' => 90000000,
                    'diff' => 0, 'ket' => null,
                ],
                [
                    'code' => '1.1.2.1.10', 'name' => 'Belanja cetak RS',
                    'parent' => '1.1.2.1', 'level' => 5, 'is_header' => false,
                    'b_jl' => 66999200, 'b_ks' => 0, 'b_ll' => 0, 'b_silpa' => 0, 'b_apbd' => 0, 'b_tot' => 66999200,
                    'a_jl' => 66999200, 'a_ks' => 0, 'a_ll' => 0, 'a_silpa' => 0, 'a_apbd' => 0, 'a_tot' => 66999200,
                    'diff' => 0, 'ket' => null,
                ],
                [
                    'code' => '1.1.2.1.11', 'name' => 'Belanja makanan dan minuman pasien',
                    'parent' => '1.1.2.1', 'level' => 5, 'is_header' => false,
                    'b_jl' => 146751400, 'b_ks' => 0, 'b_ll' => 0, 'b_silpa' => 0, 'b_apbd' => 0, 'b_tot' => 146751400,
                    'a_jl' => 146751400, 'a_ks' => 0, 'a_ll' => 0, 'a_silpa' => 0, 'a_apbd' => 0, 'a_tot' => 146751400,
                    'diff' => 0, 'ket' => null,
                ],
                [
                    'code' => '1.1.2.1.12', 'name' => 'Belanja pemeliharaan rutin/berkala rumah sakit',
                    'parent' => '1.1.2.1', 'level' => 5, 'is_header' => false,
                    'b_jl' => 1707620000, 'b_ks' => 0, 'b_ll' => 0, 'b_silpa' => 0, 'b_apbd' => 0, 'b_tot' => 1707620000,
                    'a_jl' => 1707620000, 'a_ks' => 0, 'a_ll' => 0, 'a_silpa' => 0, 'a_apbd' => 0, 'a_tot' => 1707620000,
                    'diff' => 0, 'ket' => null,
                ],
                [
                    'code' => '1.1.2.1.13', 'name' => 'Belanja pemeliharaan rutin/berkala alat-alat kesehatan',
                    'parent' => '1.1.2.1', 'level' => 5, 'is_header' => false,
                    'b_jl' => 287000000, 'b_ks' => 0, 'b_ll' => 0, 'b_silpa' => 0, 'b_apbd' => 0, 'b_tot' => 287000000,
                    'a_jl' => 287000000, 'a_ks' => 0, 'a_ll' => 0, 'a_silpa' => 0, 'a_apbd' => 0, 'a_tot' => 287000000,
                    'diff' => 0,
                    'ket' => 'Berdasarkan Telaahan Staf dari PPTK Kegiatan perihal permohonan penambahan dan pergeseran anggaran.',
                ],
                [
                    'code' => '1.1.2.1.14', 'name' => 'Belanja Bahan Habis Pakai dan Kelengkapan Rehabilitasi Medik',
                    'parent' => '1.1.2.1', 'level' => 5, 'is_header' => false,
                    'b_jl' => 20000000, 'b_ks' => 0, 'b_ll' => 0, 'b_silpa' => 0, 'b_apbd' => 0, 'b_tot' => 20000000,
                    'a_jl' => 20000000, 'a_ks' => 0, 'a_ll' => 0, 'a_silpa' => 0, 'a_apbd' => 0, 'a_tot' => 20000000,
                    'diff' => 0, 'ket' => null,
                ],
                [
                    'code' => '1.1.2.1.15', 'name' => 'Belanja jasa pelayanan Rumah Sakit',
                    'parent' => '1.1.2.1', 'level' => 5, 'is_header' => false,
                    'b_jl' => 11996902888, 'b_ks' => 445167500, 'b_ll' => 315000000, 'b_silpa' => 0, 'b_apbd' => 0, 'b_tot' => 12757070388,
                    'a_jl' => 11378646888, 'a_ks' => 445167500, 'a_ll' => 315000000, 'a_silpa' => 0, 'a_apbd' => 0, 'a_tot' => 12138814388,
                    'diff' => -618256000, 'ket' => null,
                ],
                [
                    'code' => '1.1.2.1.16', 'name' => 'Belanja jasa kantor dan pelayanan rumah sakit',
                    'parent' => '1.1.2.1', 'level' => 5, 'is_header' => false,
                    'b_jl' => 616720000, 'b_ks' => 0, 'b_ll' => 0, 'b_silpa' => 0, 'b_apbd' => 0, 'b_tot' => 616720000,
                    'a_jl' => 616720000, 'a_ks' => 0, 'a_ll' => 0, 'a_silpa' => 0, 'a_apbd' => 0, 'a_tot' => 616720000,
                    'diff' => 0, 'ket' => null,
                ],
                [
                    'code' => '1.1.2.1.17', 'name' => 'Belanja jasa kegiatan urusan kesehatan dan non kesehatan',
                    'parent' => '1.1.2.1', 'level' => 5, 'is_header' => false,
                    'b_jl' => 2786400000, 'b_ks' => 0, 'b_ll' => 0, 'b_silpa' => 0, 'b_apbd' => 0, 'b_tot' => 2786400000,
                    'a_jl' => 2703900000, 'a_ks' => 0, 'a_ll' => 0, 'a_silpa' => 0, 'a_apbd' => 0, 'a_tot' => 2703900000,
                    'diff' => -82500000, 'ket' => null,
                ],
                [
                    'code' => '1.1.2.1.18', 'name' => 'Belanja jasa pelayanan rujukan',
                    'parent' => '1.1.2.1', 'level' => 5, 'is_header' => false,
                    'b_jl' => 52842000, 'b_ks' => 0, 'b_ll' => 0, 'b_silpa' => 0, 'b_apbd' => 0, 'b_tot' => 52842000,
                    'a_jl' => 87842000, 'a_ks' => 0, 'a_ll' => 0, 'a_silpa' => 0, 'a_apbd' => 0, 'a_tot' => 87842000,
                    'diff' => 35000000,
                    'ket' => 'Berdasarkan Telaahan Staf dari Bidang Keperawatan sebagai PPTK Kegiatan perihal permohonan penambahan anggaran.',
                ],
                [
                    'code' => '1.1.2.1.19', 'name' => 'Belanja Jasa administrasi bank',
                    'parent' => '1.1.2.1', 'level' => 5, 'is_header' => false,
                    'b_jl' => 5000000, 'b_ks' => 0, 'b_ll' => 0, 'b_silpa' => 0, 'b_apbd' => 0, 'b_tot' => 5000000,
                    'a_jl' => 5000000, 'a_ks' => 0, 'a_ll' => 0, 'a_silpa' => 0, 'a_apbd' => 0, 'a_tot' => 5000000,
                    'diff' => 0, 'ket' => null,
                ],
                [
                    'code' => '1.1.2.1.20', 'name' => 'Belanja Makan dan Minum',
                    'parent' => '1.1.2.1', 'level' => 5, 'is_header' => false,
                    'b_jl' => 109770000, 'b_ks' => 0, 'b_ll' => 0, 'b_silpa' => 0, 'b_apbd' => 0, 'b_tot' => 109770000,
                    'a_jl' => 109770000, 'a_ks' => 0, 'a_ll' => 0, 'a_silpa' => 0, 'a_apbd' => 0, 'a_tot' => 109770000,
                    'diff' => 0, 'ket' => null,
                ],
                [
                    'code' => '1.1.2.1.21', 'name' => 'Belanja Kelengkapan Pasien',
                    'parent' => '1.1.2.1', 'level' => 5, 'is_header' => false,
                    'b_jl' => 181050000, 'b_ks' => 0, 'b_ll' => 0, 'b_silpa' => 0, 'b_apbd' => 0, 'b_tot' => 181050000,
                    'a_jl' => 181050000, 'a_ks' => 0, 'a_ll' => 0, 'a_silpa' => 0, 'a_apbd' => 0, 'a_tot' => 181050000,
                    'diff' => 0, 'ket' => null,
                ],
                [
                    'code' => '1.1.2.1.22', 'name' => 'Belanja Peralatan Kebersihan dan Bahan Pembersih',
                    'parent' => '1.1.2.1', 'level' => 5, 'is_header' => false,
                    'b_jl' => 99596000, 'b_ks' => 0, 'b_ll' => 0, 'b_silpa' => 0, 'b_apbd' => 0, 'b_tot' => 99596000,
                    'a_jl' => 99596000, 'a_ks' => 0, 'a_ll' => 0, 'a_silpa' => 0, 'a_apbd' => 0, 'a_tot' => 99596000,
                    'diff' => 0, 'ket' => null,
                ],
                [
                    'code' => '1.1.2.1.23', 'name' => 'Belanja Baju Pasien',
                    'parent' => '1.1.2.1', 'level' => 5, 'is_header' => false,
                    'b_jl' => 387500000, 'b_ks' => 0, 'b_ll' => 0, 'b_silpa' => 0, 'b_apbd' => 0, 'b_tot' => 387500000,
                    'a_jl' => 387500000, 'a_ks' => 0, 'a_ll' => 0, 'a_silpa' => 0, 'a_apbd' => 0, 'a_tot' => 387500000,
                    'diff' => 0, 'ket' => null,
                ],
                [
                    'code' => '1.1.2.1.24', 'name' => 'Belanja matras/kasur pasien',
                    'parent' => '1.1.2.1', 'level' => 5, 'is_header' => false,
                    'b_jl' => 75000000, 'b_ks' => 0, 'b_ll' => 0, 'b_silpa' => 0, 'b_apbd' => 0, 'b_tot' => 75000000,
                    'a_jl' => 75000000, 'a_ks' => 0, 'a_ll' => 0, 'a_silpa' => 0, 'a_apbd' => 0, 'a_tot' => 75000000,
                    'diff' => 0, 'ket' => null,
                ],
                [
                    'code' => '1.1.2.1.25', 'name' => 'Belanja Jasa Akuntan Publik',
                    'parent' => '1.1.2.1', 'level' => 5, 'is_header' => false,
                    'b_jl' => 75000000, 'b_ks' => 0, 'b_ll' => 0, 'b_silpa' => 0, 'b_apbd' => 0, 'b_tot' => 75000000,
                    'a_jl' => 75000000, 'a_ks' => 0, 'a_ll' => 0, 'a_silpa' => 0, 'a_apbd' => 0, 'a_tot' => 75000000,
                    'diff' => 0, 'ket' => null,
                ],
                [
                    'code' => '1.1.2.1.26', 'name' => 'Belanja Bahan Habis Pakai Material Gigi',
                    'parent' => '1.1.2.1', 'level' => 5, 'is_header' => false,
                    'b_jl' => 10000000, 'b_ks' => 0, 'b_ll' => 0, 'b_silpa' => 0, 'b_apbd' => 0, 'b_tot' => 10000000,
                    'a_jl' => 10000000, 'a_ks' => 0, 'a_ll' => 0, 'a_silpa' => 0, 'a_apbd' => 0, 'a_tot' => 10000000,
                    'diff' => 0, 'ket' => null,
                ],
                [
                    'code' => '1.1.2.1.27', 'name' => 'Belanja Bahan Habis Pakai dan Kelengkapan Rehabilitasi Psikososial',
                    'parent' => '1.1.2.1', 'level' => 5, 'is_header' => false,
                    'b_jl' => 53491000, 'b_ks' => 0, 'b_ll' => 0, 'b_silpa' => 0, 'b_apbd' => 0, 'b_tot' => 53491000,
                    'a_jl' => 53491000, 'a_ks' => 0, 'a_ll' => 0, 'a_silpa' => 0, 'a_apbd' => 0, 'a_tot' => 53491000,
                    'diff' => 0, 'ket' => null,
                ],
                [
                    'code' => '1.1.2.1.28', 'name' => 'Belanja Kelengkapan Pelayanan',
                    'parent' => '1.1.2.1', 'level' => 5, 'is_header' => false,
                    'b_jl' => 101200000, 'b_ks' => 0, 'b_ll' => 0, 'b_silpa' => 0, 'b_apbd' => 0, 'b_tot' => 101200000,
                    'a_jl' => 105387000, 'a_ks' => 0, 'a_ll' => 0, 'a_silpa' => 0, 'a_apbd' => 0, 'a_tot' => 105387000,
                    'diff' => 4187000,
                    'ket' => 'Berdasarkan Telaahan Staf dari Bagian Umum dan Instalasi IPSRS',
                ],
                [
                    'code' => '1.1.2.1.29', 'name' => 'Belanja pemeliharaan rutin/berkala Peralatan dan Perlengkapan rumah sakit',
                    'parent' => '1.1.2.1', 'level' => 5, 'is_header' => false,
                    'b_jl' => 438600000, 'b_ks' => 0, 'b_ll' => 0, 'b_silpa' => 0, 'b_apbd' => 0, 'b_tot' => 438600000,
                    'a_jl' => 692600000, 'a_ks' => 0, 'a_ll' => 0, 'a_silpa' => 0, 'a_apbd' => 0, 'a_tot' => 692600000,
                    'diff' => 254000000,
                    'ket' => 'Berdasarkan Telaahan Staf dari Bagian Umum, IPSRS dan Instalasi Sterilisasi',
                ],
                [
                    'code' => '1.1.2.1.30', 'name' => 'Belanja jasa kesehatan lingkungan RS',
                    'parent' => '1.1.2.1', 'level' => 5, 'is_header' => false,
                    'b_jl' => 693800000, 'b_ks' => 0, 'b_ll' => 0, 'b_silpa' => 0, 'b_apbd' => 0, 'b_tot' => 693800000,
                    'a_jl' => 693800000, 'a_ks' => 0, 'a_ll' => 0, 'a_silpa' => 0, 'a_apbd' => 0, 'a_tot' => 693800000,
                    'diff' => 0, 'ket' => null,
                ],
                [
                    'code' => '1.1.2.1.31', 'name' => 'Belanja Pemulangan Pasien',
                    'parent' => '1.1.2.1', 'level' => 5, 'is_header' => false,
                    'b_jl' => 50000000, 'b_ks' => 0, 'b_ll' => 0, 'b_silpa' => 0, 'b_apbd' => 0, 'b_tot' => 50000000,
                    'a_jl' => 50000000, 'a_ks' => 0, 'a_ll' => 0, 'a_silpa' => 0, 'a_apbd' => 0, 'a_tot' => 50000000,
                    'diff' => 0, 'ket' => null,
                ],
                [
                    'code' => '1.1.2.1.32', 'name' => 'Belanja Jasa Kontribusi & Perjalanan Dinas Pelatihan',
                    'parent' => '1.1.2.1', 'level' => 5, 'is_header' => false,
                    'b_jl' => 116342000, 'b_ks' => 0, 'b_ll' => 0, 'b_silpa' => 0, 'b_apbd' => 0, 'b_tot' => 116342000,
                    'a_jl' => 231592000, 'a_ks' => 0, 'a_ll' => 0, 'a_silpa' => 0, 'a_apbd' => 0, 'a_tot' => 231592000,
                    'diff' => 115250000,
                    'ket' => 'Berdasarkan Telaahan Staf dari Bidang Penunjang Medik',
                ],
                [
                    'code' => '1.1.2.1.33', 'name' => 'Belanja Promosi Kesehatan RS',
                    'parent' => '1.1.2.1', 'level' => 5, 'is_header' => false,
                    'b_jl' => 66513000, 'b_ks' => 0, 'b_ll' => 0, 'b_silpa' => 0, 'b_apbd' => 0, 'b_tot' => 66513000,
                    'a_jl' => 72533000, 'a_ks' => 0, 'a_ll' => 0, 'a_silpa' => 0, 'a_apbd' => 0, 'a_tot' => 72533000,
                    'diff' => 6020000,
                    'ket' => 'Berdasarkan Telaahan Staf dari Bagian Umum dan Instalasi IPSRS',
                ],
                [
                    'code' => '1.1.2.1.34', 'name' => 'Belanja Akreditasi RS',
                    'parent' => '1.1.2.1', 'level' => 5, 'is_header' => false,
                    'b_jl' => 0, 'b_ks' => 0, 'b_ll' => 0, 'b_silpa' => 0, 'b_apbd' => 0, 'b_tot' => 0,
                    'a_jl' => 188030000, 'a_ks' => 0, 'a_ll' => 0, 'a_silpa' => 0, 'a_apbd' => 0, 'a_tot' => 188030000,
                    'diff' => 188030000,
                    'ket' => 'Berdasarkan Telaahan Staf dari Ketua Tim Akreditasi',
                ],
                [
                    'code' => '1.1.2.1.35', 'name' => 'Belanja Peralatan & Perlengkapan Pendukung RS',
                    'parent' => '1.1.2.1', 'level' => 5, 'is_header' => false,
                    'b_jl' => 0, 'b_ks' => 0, 'b_ll' => 0, 'b_silpa' => 0, 'b_apbd' => 0, 'b_tot' => 0,
                    'a_jl' => 9045000, 'a_ks' => 0, 'a_ll' => 0, 'a_silpa' => 0, 'a_apbd' => 0, 'a_tot' => 9045000,
                    'diff' => 9045000, 'ket' => null,
                ],

                // 1.2 BELANJA MODAL
                [
                    'code' => '1.2',
                    'name' => 'BELANJA MODAL',
                    'parent' => '1',
                    'level' => 2,
                    'is_header' => true,
                    'b_jl' => 1000000000, 'b_ks' => 0, 'b_ll' => 0, 'b_silpa' => 0, 'b_apbd' => 1202400000, 'b_tot' => 2202400000,
                    'a_jl' => 1000000000, 'a_ks' => 0, 'a_ll' => 0, 'a_silpa' => 0, 'a_apbd' => 1202400000, 'a_tot' => 2202400000,
                    'diff' => 0,
                    'ket' => null,
                ],
                // 1.2.1 Belanja Modal BLUD
                [
                    'code' => '1.2.1',
                    'name' => 'Belanja Modal BLUD',
                    'parent' => '1.2',
                    'level' => 3,
                    'is_header' => true,
                    'b_jl' => 1000000000, 'b_ks' => 0, 'b_ll' => 0, 'b_silpa' => 0, 'b_apbd' => 0, 'b_tot' => 1000000000,
                    'a_jl' => 1000000000, 'a_ks' => 0, 'a_ll' => 0, 'a_silpa' => 0, 'a_apbd' => 0, 'a_tot' => 1000000000,
                    'diff' => 0,
                    'ket' => null,
                ],
                [
                    'code' => '1.2.1.1',
                    'name' => 'Belanja Tanah',
                    'parent' => '1.2.1',
                    'level' => 4,
                    'is_header' => false,
                    'b_jl' => 0, 'b_ks' => 0, 'b_ll' => 0, 'b_silpa' => 0, 'b_apbd' => 0, 'b_tot' => 0,
                    'a_jl' => 0, 'a_ks' => 0, 'a_ll' => 0, 'a_silpa' => 0, 'a_apbd' => 0, 'a_tot' => 0,
                    'diff' => 0,
                    'ket' => null,
                ],
                // 1.2.1.2 Belanja Peralatan dan Mesin
                [
                    'code' => '1.2.1.2',
                    'name' => 'Belanja Peralatan dan Mesin',
                    'parent' => '1.2.1',
                    'level' => 4,
                    'is_header' => true,
                    'b_jl' => 500000000, 'b_ks' => 0, 'b_ll' => 0, 'b_silpa' => 0, 'b_apbd' => 0, 'b_tot' => 500000000,
                    'a_jl' => 500000000, 'a_ks' => 0, 'a_ll' => 0, 'a_silpa' => 0, 'a_apbd' => 0, 'a_tot' => 500000000,
                    'diff' => 0,
                    'ket' => null,
                ],
                [
                    'code' => '1.2.1.2.1',
                    'name' => 'Belanja Alat Kesehatan RS',
                    'parent' => '1.2.1.2',
                    'level' => 5,
                    'is_header' => false,
                    'b_jl' => 278004200, 'b_ks' => 0, 'b_ll' => 0, 'b_silpa' => 0, 'b_apbd' => 0, 'b_tot' => 278004200,
                    'a_jl' => 278004200, 'a_ks' => 0, 'a_ll' => 0, 'a_silpa' => 0, 'a_apbd' => 0, 'a_tot' => 278004200,
                    'diff' => 0,
                    'ket' => null,
                ],
                [
                    'code' => '1.2.1.2.2',
                    'name' => 'Belanja peralatan dan perlengkapan rumah sakit',
                    'parent' => '1.2.1.2',
                    'level' => 5,
                    'is_header' => false,
                    'b_jl' => 221995800, 'b_ks' => 0, 'b_ll' => 0, 'b_silpa' => 0, 'b_apbd' => 0, 'b_tot' => 221995800,
                    'a_jl' => 221995800, 'a_ks' => 0, 'a_ll' => 0, 'a_silpa' => 0, 'a_apbd' => 0, 'a_tot' => 221995800,
                    'diff' => 0,
                    'ket' => null,
                ],
                // 1.2.1.3 Belanja Gedung dan Bangunan
                [
                    'code' => '1.2.1.3',
                    'name' => 'Belanja Gedung dan Bangunan',
                    'parent' => '1.2.1',
                    'level' => 4,
                    'is_header' => true,
                    'b_jl' => 500000000, 'b_ks' => 0, 'b_ll' => 0, 'b_silpa' => 0, 'b_apbd' => 0, 'b_tot' => 500000000,
                    'a_jl' => 500000000, 'a_ks' => 0, 'a_ll' => 0, 'a_silpa' => 0, 'a_apbd' => 0, 'a_tot' => 500000000,
                    'diff' => 0,
                    'ket' => null,
                ],
                [
                    'code' => '1.2.1.3.1',
                    'name' => 'Belanja Modal Gedung dan Bangunan',
                    'parent' => '1.2.1.3',
                    'level' => 5,
                    'is_header' => false,
                    'b_jl' => 500000000, 'b_ks' => 0, 'b_ll' => 0, 'b_silpa' => 0, 'b_apbd' => 0, 'b_tot' => 500000000,
                    'a_jl' => 500000000, 'a_ks' => 0, 'a_ll' => 0, 'a_silpa' => 0, 'a_apbd' => 0, 'a_tot' => 500000000,
                    'diff' => 0,
                    'ket' => null,
                ],
                [
                    'code' => '1.2.1.4',
                    'name' => 'Belanja Jalan/ Irigasi Dan jaringan',
                    'parent' => '1.2.1',
                    'level' => 4,
                    'is_header' => false,
                    'b_jl' => 0, 'b_ks' => 0, 'b_ll' => 0, 'b_silpa' => 0, 'b_apbd' => 0, 'b_tot' => 0,
                    'a_jl' => 0, 'a_ks' => 0, 'a_ll' => 0, 'a_silpa' => 0, 'a_apbd' => 0, 'a_tot' => 0,
                    'diff' => 0,
                    'ket' => null,
                ],
                [
                    'code' => '1.2.1.5',
                    'name' => 'Belanja Aset tetap lainnya',
                    'parent' => '1.2.1',
                    'level' => 4,
                    'is_header' => false,
                    'b_jl' => 0, 'b_ks' => 0, 'b_ll' => 0, 'b_silpa' => 0, 'b_apbd' => 0, 'b_tot' => 0,
                    'a_jl' => 0, 'a_ks' => 0, 'a_ll' => 0, 'a_silpa' => 0, 'a_apbd' => 0, 'a_tot' => 0,
                    'diff' => 0,
                    'ket' => null,
                ],
                [
                    'code' => '1.2.1.6',
                    'name' => 'Belanja Aset lainnya',
                    'parent' => '1.2.1',
                    'level' => 4,
                    'is_header' => false,
                    'b_jl' => 0, 'b_ks' => 0, 'b_ll' => 0, 'b_silpa' => 0, 'b_apbd' => 0, 'b_tot' => 0,
                    'a_jl' => 0, 'a_ks' => 0, 'a_ll' => 0, 'a_silpa' => 0, 'a_apbd' => 0, 'a_tot' => 0,
                    'diff' => 0,
                    'ket' => null,
                ],
            ];

            $order = 1;
            foreach ($rawItems as $row) {
                RbaExpenseItem::create([
                    'rba_shift_id' => $shift->id,
                    'account_code' => $row['code'],
                    'account_name' => $row['name'],
                    'parent_code' => $row['parent'],
                    'level' => $row['level'],
                    'is_header' => $row['is_header'],
                    'before_jasa_layanan' => $row['b_jl'],
                    'before_hasil_kerjasama' => $row['b_ks'],
                    'before_lain_lain_sah' => $row['b_ll'],
                    'before_silpa' => $row['b_silpa'],
                    'before_apbd' => $row['b_apbd'],
                    'before_total' => $row['b_tot'],
                    'after_jasa_layanan' => $row['a_jl'],
                    'after_hasil_kerjasama' => $row['a_ks'],
                    'after_lain_lain_sah' => $row['a_ll'],
                    'after_silpa' => $row['a_silpa'],
                    'after_apbd' => $row['a_apbd'],
                    'after_total' => $row['a_tot'],
                    'difference' => $row['diff'],
                    'keterangan' => $row['ket'],
                    'order_index' => $order++,
                ]);
            }

            // Clear old revenue items for this shift
            RbaRevenueItem::where('rba_shift_id', $shift->id)->delete();

            $rawRevenues = [
                ['code' => '0', 'name' => 'PENDAPATAN', 'parent' => null, 'level' => 1, 'is_header' => true, 'before' => 44281028836, 'after' => 44281028836, 'diff' => 0],
                ['code' => '1', 'name' => 'JASA LAYANAN', 'parent' => '0', 'level' => 1, 'is_header' => true, 'before' => 25047246628, 'after' => 25047246628, 'diff' => 0],
                ['code' => 'a', 'name' => 'Pendapatan Pelayanan Gawat Darurat', 'parent' => '1', 'level' => 2, 'is_header' => false, 'before' => 26110500, 'after' => 26110500, 'diff' => 0],
                ['code' => 'b', 'name' => 'Pendapatan Pelayanan Intensif/UPIP', 'parent' => '1', 'level' => 2, 'is_header' => false, 'before' => 108283900, 'after' => 108283900, 'diff' => 0],
                ['code' => 'c', 'name' => 'Pendapatan Pelayanan Rawat Jalan', 'parent' => '1', 'level' => 2, 'is_header' => false, 'before' => 5833900127, 'after' => 5833900127, 'diff' => 0],
                ['code' => 'd', 'name' => 'Pendapatan Pelayanan Rawat Inap', 'parent' => '1', 'level' => 2, 'is_header' => false, 'before' => 13956912239, 'after' => 13956912239, 'diff' => 0],
                ['code' => 'e', 'name' => 'Pendapatan Pelayanan Rawat Inap-Napza', 'parent' => '1', 'level' => 2, 'is_header' => false, 'before' => 840329862, 'after' => 840329862, 'diff' => 0],
                ['code' => 'f', 'name' => 'Pendapatan Pelayanan Rehabilitasi Psikososial', 'parent' => '1', 'level' => 2, 'is_header' => false, 'before' => 0, 'after' => 0, 'diff' => 0],
                ['code' => 'g', 'name' => 'Pendapatan Pelayanan Psikologi & Psikometri', 'parent' => '1', 'level' => 2, 'is_header' => false, 'before' => 669500000, 'after' => 669500000, 'diff' => 0],
                ['code' => 'h', 'name' => 'Pendapatan Pelayanan Konseling Keperawatan Jiwa', 'parent' => '1', 'level' => 2, 'is_header' => false, 'before' => 13390000, 'after' => 13390000, 'diff' => 0],
                ['code' => 'i', 'name' => 'Pendapatan Pelayanan Forensik Psikiatri', 'parent' => '1', 'level' => 2, 'is_header' => false, 'before' => 15450000, 'after' => 15450000, 'diff' => 0],
                ['code' => 'j', 'name' => 'Pendapatan Pelayanan Laboratorium', 'parent' => '1', 'level' => 2, 'is_header' => false, 'before' => 1133000000, 'after' => 1133000000, 'diff' => 0],
                ['code' => 'k', 'name' => 'Pendapatan Pelayanan Radiologi', 'parent' => '1', 'level' => 2, 'is_header' => false, 'before' => 12360000, 'after' => 12360000, 'diff' => 0],
                ['code' => 'l', 'name' => 'Pendapatan Pelayanan Gizi', 'parent' => '1', 'level' => 2, 'is_header' => false, 'before' => 8240000, 'after' => 8240000, 'diff' => 0],
                ['code' => 'm', 'name' => 'Pendapatan Pelayanan Farmasi', 'parent' => '1', 'level' => 2, 'is_header' => false, 'before' => 2060000000, 'after' => 2060000000, 'diff' => 0],
                ['code' => 'n', 'name' => 'Pendapatan Pelayanan Rekam Medik', 'parent' => '1', 'level' => 2, 'is_header' => false, 'before' => 369770000, 'after' => 369770000, 'diff' => 0],
                ['code' => 'o', 'name' => 'Pendapatan Pelayanan Ambulance/Kereta Jenazah', 'parent' => '1', 'level' => 2, 'is_header' => false, 'before' => 0, 'after' => 0, 'diff' => 0],
                ['code' => '2', 'name' => 'HIBAH', 'parent' => '0', 'level' => 1, 'is_header' => true, 'before' => 0, 'after' => 0, 'diff' => 0],
                ['code' => '3', 'name' => 'HASIL KERJA SAMA', 'parent' => '0', 'level' => 1, 'is_header' => true, 'before' => 445167500, 'after' => 445167500, 'diff' => 0],
                ['code' => 'a', 'name' => 'Hasil Kerjasama Diklat', 'parent' => '3', 'level' => 2, 'is_header' => false, 'before' => 210000000, 'after' => 210000000, 'diff' => 0],
                ['code' => 'b', 'name' => 'Pendapatan Hasil Kerja Sama Fasilitas ( Parkir )', 'parent' => '3', 'level' => 2, 'is_header' => false, 'before' => 50000000, 'after' => 50000000, 'diff' => 0],
                ['code' => 'c', 'name' => 'Hasil Kerjasama Penggunaan Fasilitas RSJ Tampan', 'parent' => '3', 'level' => 2, 'is_header' => false, 'before' => 185167500, 'after' => 185167500, 'diff' => 0],
                ['code' => '4', 'name' => 'ANGGARAN PENDAPATAN BELANJA DAERAH', 'parent' => '0', 'level' => 1, 'is_header' => true, 'before' => 18473614708, 'after' => 18473614708, 'diff' => 0],
                ['code' => '-', 'name' => 'APBD', 'parent' => '4', 'level' => 2, 'is_header' => false, 'before' => 18473614708, 'after' => 18473614708, 'diff' => 0],
                ['code' => '5', 'name' => 'LAIN-LAIN PENDAPATAN BADAN LAYANAN UMUM DAERAH YANG SAH', 'parent' => '0', 'level' => 1, 'is_header' => true, 'before' => 315000000, 'after' => 315000000, 'diff' => 0],
                ['code' => '-', 'name' => 'Jasa Giro', 'parent' => '5', 'level' => 2, 'is_header' => false, 'before' => 315000000, 'after' => 315000000, 'diff' => 0],
                ['code' => '-', 'name' => 'Pendapatan Bunga', 'parent' => '5', 'level' => 2, 'is_header' => false, 'before' => 0, 'after' => 0, 'diff' => 0],
            ];

            $revOrder = 1;
            foreach ($rawRevenues as $rev) {
                RbaRevenueItem::create([
                    'rba_shift_id' => $shift->id,
                    'item_code' => $rev['code'],
                    'item_name' => $rev['name'],
                    'parent_code' => $rev['parent'],
                    'level' => $rev['level'],
                    'is_header' => $rev['is_header'],
                    'before_amount' => $rev['before'],
                    'after_amount' => $rev['after'],
                    'difference' => $rev['diff'],
                    'order_index' => $revOrder++,
                ]);
            }

            // Also create historical "Murni" and "Pergeseran II" shifts for realistic versioning
            $shiftMurni = RbaShift::firstOrCreate(
                ['year' => 2026, 'shift_name' => 'Murni'],
                [
                    'doc_title' => 'RENCANA BISNIS DAN ANGGARAN MURNI',
                    'period_month' => 'Januari 2026',
                    'status' => 'Arsip',
                    'notes' => 'RBA Murni Awal Tahun Anggaran 2026 RS Jiwa Tampan.',
                ]
            );

            $shiftPergeseran2 = RbaShift::firstOrCreate(
                ['year' => 2026, 'shift_name' => 'Pergeseran II'],
                [
                    'doc_title' => 'RENCANA BISNIS DAN ANGGARAN PERGESERAN II',
                    'period_month' => 'Mei 2026',
                    'status' => 'Arsip',
                    'notes' => 'RBA Pergeseran II Tahun Anggaran 2026 RS Jiwa Tampan.',
                ]
            );

            // Activate Pergeseran III and sync to rba_accounts
            $shift->activate();
        });
    }
}
