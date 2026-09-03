<?php

namespace Database\Seeders;

use App\Models\Item;
use Illuminate\Database\Seeder;

class ItemSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $items = [
            // ATK & Cetakan
            [
                'item_code' => 'ITM-ATK-001',
                'name' => 'Kertas HVS A4 80gr PaperOne',
                'specification' => 'Ukuran 210 x 297 mm, 80 gsm, isi 500 lembar per rim',
                'unit_type' => 'Rim',
                'standard_price' => 55000,
            ],
            [
                'item_code' => 'ITM-ATK-002',
                'name' => 'Tinta Printer Hitam Canon GI-790',
                'specification' => 'Tinta botol original hitam isi 135 ml untuk printer G-Series',
                'unit_type' => 'Botol',
                'standard_price' => 120000,
            ],
            [
                'item_code' => 'ITM-ATK-003',
                'name' => 'Spidol Whiteboard Snowman Hitam',
                'specification' => 'Spidol papan tulis non-permanent warna hitam cepat kering',
                'unit_type' => 'Pcs',
                'standard_price' => 10000,
            ],
            [
                'item_code' => 'ITM-ATK-004',
                'name' => 'Buku Ekspedisi Surat Masuk',
                'specification' => 'Hard cover batik isi 100 lembar folio berkolom tanda terima',
                'unit_type' => 'Buku',
                'standard_price' => 22000,
            ],
            [
                'item_code' => 'ITM-ATK-005',
                'name' => 'Map Snellhecter Kertas Kuning',
                'specification' => 'Kertas tebal buffalo kuning dengan jepitan acco isi 50 pcs',
                'unit_type' => 'Pak',
                'standard_price' => 45000,
            ],

            // Medis & Habis Pakai
            [
                'item_code' => 'ITM-MED-001',
                'name' => 'Masker Medis 3-Ply Earloop',
                'specification' => 'Masker bedah 3 lapis BFE > 98% terstandarisasi Kemenkes isi 50 pcs',
                'unit_type' => 'Box',
                'standard_price' => 30000,
            ],
            [
                'item_code' => 'ITM-MED-002',
                'name' => 'Hand Sanitizer Gel 500ml Pump',
                'specification' => 'Alkohol 70% dengan moisturizer aloe vera botol pump 500 ml',
                'unit_type' => 'Botol',
                'standard_price' => 35000,
            ],
            [
                'item_code' => 'ITM-MED-003',
                'name' => 'Sarung Tangan Latex Non-Steril Size M',
                'specification' => 'Exam gloves pre-powdered bahan lateks natural isi 100 pcs',
                'unit_type' => 'Box',
                'standard_price' => 65000,
            ],
            [
                'item_code' => 'ITM-MED-004',
                'name' => 'Alkohol Swab 70% OneMed',
                'specification' => 'Tissue alkohol pembersih luka non-woven 2 lapis isi 100 pcs',
                'unit_type' => 'Box',
                'standard_price' => 25000,
            ],
            [
                'item_code' => 'ITM-MED-005',
                'name' => 'Spuit Disposible 3cc Terumo',
                'specification' => 'Alat suntik steril sekali pakai 3 ml dengan jarum 23G x 1¼',
                'unit_type' => 'Box',
                'standard_price' => 145000,
            ],
            [
                'item_code' => 'ITM-MED-006',
                'name' => 'Spuit Disposible 5cc Terumo',
                'specification' => 'Alat suntik steril sekali pakai 5 ml dengan jarum 22G x 1½',
                'unit_type' => 'Box',
                'standard_price' => 160000,
            ],
            [
                'item_code' => 'ITM-MED-007',
                'name' => 'Kasa Hidrofil Steril 16x16 cm',
                'specification' => 'Kasa pembalut medis steril kemasan individual isi 16 lembar',
                'unit_type' => 'Box',
                'standard_price' => 18000,
            ],
            [
                'item_code' => 'ITM-MED-008',
                'name' => 'Sabun Cuci Tangan Antiseptik 5 Liter',
                'specification' => 'Hand soap cair antiseptik chlorhexidine kemasan jerigen 5 Liter',
                'unit_type' => 'Jerigen',
                'standard_price' => 95000,
            ],
            [
                'item_code' => 'ITM-MED-009',
                'name' => 'Plastik Klip Obat 10x15 cm',
                'specification' => 'Klip transparan tebal 0.05 mm untuk obat tablet isi 100 pcs',
                'unit_type' => 'Pak',
                'standard_price' => 15000,
            ],

            // Peralatan Medis & Penunjang
            [
                'item_code' => 'ITM-EQP-001',
                'name' => 'Termometer Inframerah Non-Contact',
                'specification' => 'Pengukur suhu dahi digital akurasi 0.2°C respon 1 detik bersertifikat',
                'unit_type' => 'Unit',
                'standard_price' => 275000,
            ],
            [
                'item_code' => 'ITM-EQP-002',
                'name' => 'Tensi Meter Digital Omron HEM-7120',
                'specification' => 'Sphygmomanometer digital lengan atas dengan teknologi IntelliSense',
                'unit_type' => 'Unit',
                'standard_price' => 650000,
            ],
        ];

        foreach ($items as $item) {
            Item::updateOrCreate(
                ['item_code' => $item['item_code']],
                [
                    'name' => $item['name'],
                    'specification' => $item['specification'],
                    'unit_type' => $item['unit_type'],
                    'standard_price' => $item['standard_price'],
                ]
            );
        }
    }
}

