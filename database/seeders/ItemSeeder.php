<?php

namespace Database\Seeders;

use App\Models\Item;
use App\Models\RbaAccount;
use Illuminate\Database\Seeder;

class ItemSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $accounts = RbaAccount::all()->keyBy('account_code');

        $catalog = [
            // 1.1.2.1.1 Belanja Bahan Habis Pakai Material Kesehatan
            '1.1.2.1.1' => [
                ['name' => 'ABBOCATH NO 20 Terumo', 'unit' => 'Pcs', 'price' => 18000, 'spec' => 'Jarum infus no 20 Terumo steril'],
                ['name' => 'ABBOCATH NO 22 Terumo', 'unit' => 'Pcs', 'price' => 18000, 'spec' => 'Jarum infus no 22 Terumo steril'],
                ['name' => 'ALKOHOL 70 %', 'unit' => 'Botol', 'price' => 35000, 'spec' => 'Cairan disinfektan 70% 1000 ml'],
                ['name' => 'ALKOHOL 96 %', 'unit' => 'Botol', 'price' => 42000, 'spec' => 'Cairan alkohol murni 96% 1000 ml'],
                ['name' => 'ALKOHOL SWAB', 'unit' => 'Box', 'price' => 25000, 'spec' => 'Kapas alkohol sachet isi 100 pcs'],
                ['name' => 'ARM SLING L', 'unit' => 'Pcs', 'price' => 45000, 'spec' => 'Penyangga lengan ukuran L'],
                ['name' => 'BLOOD TRANSFUSION SET', 'unit' => 'Set', 'price' => 22000, 'spec' => 'Selang transfusi darah dengan filter'],
                ['name' => 'CANGKANG CAPSUL NO  0', 'unit' => 'Botol', 'price' => 65000, 'spec' => 'Cangkang kapsul kosong ukuran 0 isi 1000'],
                ['name' => 'CANGKANG CAPSUL NO 00', 'unit' => 'Botol', 'price' => 70000, 'spec' => 'Cangkang kapsul kosong ukuran 00 isi 1000'],
                ['name' => 'CANGKANG CAPSUL NO 1', 'unit' => 'Botol', 'price' => 60000, 'spec' => 'Cangkang kapsul kosong ukuran 1 isi 1000'],
                ['name' => 'CANGKANG CAPSUL NO 2', 'unit' => 'Botol', 'price' => 55000, 'spec' => 'Cangkang kapsul kosong ukuran 2 isi 1000'],
                ['name' => 'CANGKANG CAPSUL NO 3', 'unit' => 'Botol', 'price' => 50000, 'spec' => 'Cangkang kapsul kosong ukuran 3 isi 1000'],
                ['name' => 'CATGUT CHROMIC 3/0 ONEMED', 'unit' => 'Box', 'price' => 175000, 'spec' => 'Benang bedah chromic 3/0 isi 24 pcs'],
                ['name' => 'ETHYLCLORIDE SPRAY', 'unit' => 'Botol', 'price' => 145000, 'spec' => 'Spray anestesi lokal 100 ml'],
                ['name' => 'DARYANT-TULE', 'unit' => 'Box', 'price' => 195000, 'spec' => 'Kasa pembalut luka steril mengandung antibiotik isi 10'],
                ['name' => 'ELASTIC VERBAN 3 INC', 'unit' => 'Roll', 'price' => 16000, 'spec' => 'Pembalut elastis ukuran lebar 3 inch'],
                ['name' => 'ELASTIC VERBAN 4 INC', 'unit' => 'Roll', 'price' => 20000, 'spec' => 'Pembalut elastis ukuran lebar 4 inch'],
                ['name' => 'ELASTIC VERBAN 6 INC', 'unit' => 'Roll', 'price' => 28000, 'spec' => 'Pembalut elastis ukuran lebar 6 inch'],
                ['name' => 'ENDO TRACHEAL TUBE (ETT) NO.4,5', 'unit' => 'Pcs', 'price' => 42000, 'spec' => 'Pipa intubasi endotrakeal ukuran 4.5'],
                ['name' => 'ENDO TRACHEAL TUBE (ETT) NO.5,5', 'unit' => 'Pcs', 'price' => 42000, 'spec' => 'Pipa intubasi endotrakeal ukuran 5.5'],
                ['name' => 'ENDO TRACHEAL TUBE (ETT) NO.6,5', 'unit' => 'Pcs', 'price' => 42000, 'spec' => 'Pipa intubasi endotrakeal ukuran 6.5'],
                ['name' => 'ENDO TRACHEAL TUBE (ETT) NO.7', 'unit' => 'Pcs', 'price' => 42000, 'spec' => 'Pipa intubasi endotrakeal ukuran 7.0'],
                ['name' => 'ENDO TRACHEAL TUBE (ETT) NO.7,5', 'unit' => 'Pcs', 'price' => 42000, 'spec' => 'Pipa intubasi endotrakeal ukuran 7.5'],
                ['name' => 'EXTENSION TUBE', 'unit' => 'Pcs', 'price' => 18000, 'spec' => 'Selang sambung infus fleksibel'],
                ['name' => 'H2O2 3% 100 ML', 'unit' => 'Botol', 'price' => 12000, 'spec' => 'Hidrogen peroksida 3% 100 ml pembersih luka'],
                ['name' => 'HANDRUB /ASEPTAN 500 ML', 'unit' => 'Botol', 'price' => 45000, 'spec' => 'Cairan pembersih tangan berbasis alkohol dispenser 500 ml'],
                ['name' => 'HANDWASH / ONE SCRUB 2% 500 ML', 'unit' => 'Botol', 'price' => 55000, 'spec' => 'Sabun antiseptik klorheksidin 2% 500 ml'],
                ['name' => 'HANSCOON L / PASANG', 'unit' => 'Pasang', 'price' => 6000, 'spec' => 'Sarung tangan bedah steril ukuran L'],
                ['name' => 'HANSCOON M / PASANG', 'unit' => 'Pasang', 'price' => 6000, 'spec' => 'Sarung tangan bedah steril ukuran M'],
                ['name' => 'HANSCOON S / PASANG', 'unit' => 'Pasang', 'price' => 6000, 'spec' => 'Sarung tangan bedah steril ukuran S'],
                ['name' => 'INFUSION SET MAKRO', 'unit' => 'Set', 'price' => 14000, 'spec' => 'Selang infus makro tetes 20 drops/ml'],
                ['name' => 'KANTONG ASOY', 'unit' => 'Pak', 'price' => 15000, 'spec' => 'Kantong plastik pembungkus obat'],
                ['name' => 'KASA GULUNG BESAR DRC', 'unit' => 'Roll', 'price' => 85000, 'spec' => 'Kasa hidrofil rol besar 40 yard x 80 cm'],
                ['name' => 'KERTAS EKG KOTAK (UPIP)', 'unit' => 'Roll', 'price' => 65000, 'spec' => 'Kertas termal EKG kotak kotak'],
                ['name' => 'MASKER HIJAB', 'unit' => 'Box', 'price' => 38000, 'spec' => 'Masker medis headloop 3 lapis isi 50'],
                ['name' => 'MASKER KARET', 'unit' => 'Box', 'price' => 35000, 'spec' => 'Masker medis earloop 3 lapis isi 50'],
                ['name' => 'MASKER NEBULIZER DEWASA', 'unit' => 'Pcs', 'price' => 25000, 'spec' => 'Masker uap inhalasi dewasa dengan selang'],
                ['name' => 'MASKER NRM ANAK', 'unit' => 'Pcs', 'price' => 32000, 'spec' => 'Non rebreathing mask anak dengan reservoir bag'],
                ['name' => 'NALD HECTING DOUBLE EYE', 'unit' => 'Lusin', 'price' => 55000, 'spec' => 'Jarum jahit bedah mata ganda isi 12'],
                ['name' => 'NALD HECTING SEGITIGA NO.12', 'unit' => 'Lusin', 'price' => 55000, 'spec' => 'Jarum jahit bedah segitiga no 12'],
                ['name' => 'NASAL CANULA DEWASA', 'unit' => 'Pcs', 'price' => 12000, 'spec' => 'Kanula hidung oksigen dewasa 2 meter'],
                ['name' => 'NOVOVINE', 'unit' => 'Box', 'price' => 185000, 'spec' => 'Benang jahit operasi monofilamen sintetis'],
                ['name' => 'PISAU BISTURI NO. 15', 'unit' => 'Box', 'price' => 85000, 'spec' => 'Mata pisau bedah no 15 isi 100 pcs'],
                ['name' => 'PLASTIK OBAT 13 X 22 CM BIRU', 'unit' => 'Pak', 'price' => 28000, 'spec' => 'Klip obat ukuran 13x22 cm warna biru'],
                ['name' => 'PLASTIK OBAT 7 X 10 MERAH', 'unit' => 'Pak', 'price' => 18000, 'spec' => 'Klip obat ukuran 7x10 cm warna merah'],
                ['name' => 'PLASTIK OBAT 7 X 10 HIJAU', 'unit' => 'Pak', 'price' => 18000, 'spec' => 'Klip obat ukuran 7x10 cm warna hijau'],
                ['name' => 'PLASTIK OBAT 7X10 CM PUTIH', 'unit' => 'Pak', 'price' => 18000, 'spec' => 'Klip obat ukuran 7x10 cm bening'],
                ['name' => 'POVIDONE 10% 60 ML', 'unit' => 'Botol', 'price' => 15000, 'spec' => 'Povidone iodine 10% kemasan 60 ml'],
                ['name' => 'RIVANOL 100ML', 'unit' => 'Botol', 'price' => 8000, 'spec' => 'Cairan kompres luka rivanol 100 ml'],
                ['name' => 'SILK 3/0 TAPER 26 MM', 'unit' => 'Box', 'price' => 190000, 'spec' => 'Benang bedah sutera 3/0 dengan jarum taper 26 mm'],
                ['name' => 'SPUIT 10 CC Terumo', 'unit' => 'Pcs', 'price' => 5500, 'spec' => 'Alat suntik steril 10 ml Terumo'],
                ['name' => 'SPUIT 3 CC Terumo', 'unit' => 'Pcs', 'price' => 3500, 'spec' => 'Alat suntik steril 3 ml Terumo'],
                ['name' => 'SPUIT 5 CC Terumo', 'unit' => 'Pcs', 'price' => 4500, 'spec' => 'Alat suntik steril 5 ml Terumo'],
                ['name' => 'STOMACH TUBE NO 16', 'unit' => 'Pcs', 'price' => 22000, 'spec' => 'Selang bilas lambung ukuran 16'],
                ['name' => 'STOMACH TUBE NO 18', 'unit' => 'Pcs', 'price' => 22000, 'spec' => 'Selang bilas lambung ukuran 18'],
                ['name' => 'SUCTION CATHETER NO 6', 'unit' => 'Pcs', 'price' => 16000, 'spec' => 'Kateter penyedot lendir ukuran 6'],
                ['name' => 'TONG SPATEL BESI', 'unit' => 'Pcs', 'price' => 35000, 'spec' => 'Penekan lidah bahan stainless steel medis'],
                ['name' => 'TORNIQUET', 'unit' => 'Pcs', 'price' => 25000, 'spec' => 'Tali pembendung darah elastis dengan klip kunci'],
                ['name' => 'ULTRAFIX  5 CM x 5M', 'unit' => 'Roll', 'price' => 42000, 'spec' => 'Plester non-woven elastis 5 cm x 5 meter'],
                ['name' => 'ULTRASONIC GEL', 'unit' => 'Galon', 'price' => 175000, 'spec' => 'Gel konduktor USG dan ECG kemasan 5 liter'],
            ],

            // 1.1.2.1.2.1 Belanja Obat Generik
            '1.1.2.1.2.1' => [
                ['name' => 'ACETYLCYSTEINE CAP 200 MG', 'unit' => 'Kapsul', 'price' => 950, 'spec' => 'Mukolitik acetylcysteine 200 mg'],
                ['name' => 'ACYCLOVIR TAB 400 MG', 'unit' => 'Tablet', 'price' => 850, 'spec' => 'Antivirus acyclovir 400 mg'],
                ['name' => 'ADRENALIN / EPINEPHRINE INJ', 'unit' => 'Ampul', 'price' => 12500, 'spec' => 'Injeksi epinefrin 1 mg/ml'],
                ['name' => 'ALLOPURINOL 300 MG', 'unit' => 'Tablet', 'price' => 600, 'spec' => 'Obat asam urat allopurinol 300 mg'],
                ['name' => 'ALPRAZOLAM  0,5 MG', 'unit' => 'Tablet', 'price' => 1200, 'spec' => 'Anksiolitik alprazolam 0.5 mg strip'],
                ['name' => 'ALPRAZOLAM  1 MG', 'unit' => 'Tablet', 'price' => 1800, 'spec' => 'Anksiolitik alprazolam 1 mg strip'],
                ['name' => 'AMBROXOL 30 MG', 'unit' => 'Tablet', 'price' => 350, 'spec' => 'Mukolitik batuk ambroxol 30 mg'],
                ['name' => 'AMBROXOL SYR 60 ML', 'unit' => 'Botol', 'price' => 8500, 'spec' => 'Sirup ambroxol 15 mg/5 ml botol 60 ml'],
                ['name' => 'AMINORAL TABLET', 'unit' => 'Tablet', 'price' => 3200, 'spec' => 'Suplemen asam amino esensial ginjal'],
                ['name' => 'AMITRIPTYLLINE 25 MG', 'unit' => 'Tablet', 'price' => 450, 'spec' => 'Antidepresan trisiklik amitriptyline 25 mg'],
                ['name' => 'AMLODIPIN 10 MG', 'unit' => 'Tablet', 'price' => 650, 'spec' => 'Antihipertensi amlodipine 10 mg'],
                ['name' => 'AMLODIPINE 5 MG', 'unit' => 'Tablet', 'price' => 450, 'spec' => 'Antihipertensi amlodipine 5 mg'],
                ['name' => 'AMOXICILLIN  500 MG', 'unit' => 'Kapsul', 'price' => 750, 'spec' => 'Antibiotik amoxicillin 500 mg'],
                ['name' => 'ANTACIDA DOEN TAB', 'unit' => 'Tablet', 'price' => 250, 'spec' => 'Tablet kunyah antasida maag'],
                ['name' => 'ANTACIDA SUSP', 'unit' => 'Botol', 'price' => 7000, 'spec' => 'Suspensi antasida lambung 60 ml'],
                ['name' => 'AQUA PRO INJ', 'unit' => 'Vial', 'price' => 6500, 'spec' => 'Air steril pelarut obat suntik 25 ml'],
                ['name' => 'ARIPIPRAZOLE 10 MG ODT', 'unit' => 'Tablet', 'price' => 12000, 'spec' => 'Antipsikotik atipikal aripiprazole 10 mg ODT'],
                ['name' => 'ARIPIPRAZOLE 5 MG', 'unit' => 'Tablet', 'price' => 8500, 'spec' => 'Antipsikotik atipikal aripiprazole 5 mg'],
                ['name' => 'ASAM FOLAT 1 MG', 'unit' => 'Tablet', 'price' => 200, 'spec' => 'Vitamin asam folat 1 mg'],
                ['name' => 'ASAM MEFENAMAT 500 MG', 'unit' => 'Tablet', 'price' => 450, 'spec' => 'Analgesik antiinflamasi mefenamat 500 mg'],
                ['name' => 'ASAM TRANEKSAMAT  500 MG', 'unit' => 'Tablet', 'price' => 1800, 'spec' => 'Antifibrinolitik asam traneksamat 500 mg'],
                ['name' => 'ASAM TRANEXAMIC INJ 100 mg/ml', 'unit' => 'Ampul', 'price' => 14500, 'spec' => 'Injeksi asam traneksamat 500 mg/5 ml'],
                ['name' => 'ASAM VALPROAT 250 MG SYR', 'unit' => 'Botol', 'price' => 35000, 'spec' => 'Antikonvulsan penstabil mood sirup 120 ml'],
                ['name' => 'ATROPIN SULFAS INJEKSI', 'unit' => 'Ampul', 'price' => 9000, 'spec' => 'Injeksi atropin sulfat 0.25 mg/ml'],
                ['name' => 'AZITHROMYCIN 500 MG', 'unit' => 'Tablet', 'price' => 4500, 'spec' => 'Antibiotik makrolida azitromisin 500 mg'],
                ['name' => 'BETAHISTINE 6 MG', 'unit' => 'Tablet', 'price' => 850, 'spec' => 'Obat vertigo betahistine mesilat 6 mg'],
                ['name' => 'BISAKODIL 5 MG TAB', 'unit' => 'Tablet', 'price' => 1100, 'spec' => 'Laksatif pencahar bisakodil 5 mg'],
                ['name' => 'BISOPROLOL 5 MG TABLET', 'unit' => 'Tablet', 'price' => 1250, 'spec' => 'Beta blocker bisoprolol 5 mg'],
                ['name' => 'CALCIUM GLUCONATE INJ', 'unit' => 'Ampul', 'price' => 18000, 'spec' => 'Kalsium glukonat 10% injeksi 10 ml'],
                ['name' => 'CANDESARTAN 16 MG TABLET', 'unit' => 'Tablet', 'price' => 2100, 'spec' => 'Antihipertensi candesartan 16 mg'],
                ['name' => 'CANDESARTAN 8 MG TABLET', 'unit' => 'Tablet', 'price' => 1400, 'spec' => 'Antihipertensi candesartan 8 mg'],
                ['name' => 'CAPTOPRIL 25 MG', 'unit' => 'Tablet', 'price' => 350, 'spec' => 'Antihipertensi captopril 25 mg'],
                ['name' => 'CARBAMAZEPINE 200', 'unit' => 'Tablet', 'price' => 750, 'spec' => 'Antikonvulsan carbamazepine 200 mg'],
                ['name' => 'CEFADROXYL 500 MG KAPS', 'unit' => 'Kapsul', 'price' => 1450, 'spec' => 'Antibiotik sefalosporin cefadroxil 500 mg'],
                ['name' => 'CEFIXIME 200 MG TABLET', 'unit' => 'Tablet', 'price' => 2800, 'spec' => 'Antibiotik sefalosporin generasi 3 cefixime 200 mg'],
                ['name' => 'CEFTRIAXONE INJ 1 GR', 'unit' => 'Vial', 'price' => 19500, 'spec' => 'Antibiotik injeksi ceftriaxone 1 gram steril'],
                ['name' => 'CETIRIZINE 10 MG TAB', 'unit' => 'Tablet', 'price' => 450, 'spec' => 'Antihistamin cetirizine HCl 10 mg'],
                ['name' => 'CHLORPHENIRAMINE MALEATE', 'unit' => 'Tablet', 'price' => 150, 'spec' => 'Antihistamin CTM 4 mg'],
                ['name' => 'CHLORPROMAZINE 100 MG', 'unit' => 'Tablet', 'price' => 600, 'spec' => 'Antipsikotik tipikal chlorpromazine 100 mg'],
                ['name' => 'CHLORPROMAZINE INJEKSI', 'unit' => 'Ampul', 'price' => 8500, 'spec' => 'Injeksi CPZ 25 mg/ml ampul 2 ml'],
                ['name' => 'CITICOLIN INJ 250 MG/2ML', 'unit' => 'Ampul', 'price' => 14000, 'spec' => 'Neuroprotektor citicoline 250 mg/2 ml'],
                ['name' => 'CLOBAZAM 10 MG', 'unit' => 'Tablet', 'price' => 1600, 'spec' => 'Anksiolitik clobazam 10 mg'],
                ['name' => 'CLOPIDOGREL 75 MG TABLET', 'unit' => 'Tablet', 'price' => 2800, 'spec' => 'Antiplatelet clopidogrel 75 mg'],
                ['name' => 'CLOZAPINE 100 MG TABLET', 'unit' => 'Tablet', 'price' => 4800, 'spec' => 'Antipsikotik atipikal clozapine 100 mg'],
                ['name' => 'CLOZAPINE 25 MG TABLET', 'unit' => 'Tablet', 'price' => 2200, 'spec' => 'Antipsikotik atipikal clozapine 25 mg'],
                ['name' => 'DEXAMETHASONE INJ', 'unit' => 'Ampul', 'price' => 6500, 'spec' => 'Kortikosteroid deksametason 5 mg/ml'],
                ['name' => 'DEXTROSE 5%', 'unit' => 'Kolf', 'price' => 14500, 'spec' => 'Cairan infus dextrose 5% 500 ml'],
                ['name' => 'DIAZEPAM 5 MG TABLET', 'unit' => 'Tablet', 'price' => 500, 'spec' => 'Sedatif anksiolitik diazepam 5 mg'],
                ['name' => 'DIAZEPAM INJEKSI 5MG/ML', 'unit' => 'Ampul', 'price' => 9500, 'spec' => 'Injeksi diazepam 10 mg/2 ml'],
                ['name' => 'DIAZEPAM RT 5 MG', 'unit' => 'Tube', 'price' => 24000, 'spec' => 'Diazepam rektal suppositoria 5 mg'],
                ['name' => 'DIAZEPAM RT 10 MG', 'unit' => 'Tube', 'price' => 29000, 'spec' => 'Diazepam rektal suppositoria 10 mg'],
                ['name' => 'DICLOFENAC SODIUM 50 MG', 'unit' => 'Tablet', 'price' => 400, 'spec' => 'Antiinflamasi natrium diklofenak 50 mg'],
                ['name' => 'DIPHENHYDRAMINE 10 MG INJ', 'unit' => 'Ampul', 'price' => 7500, 'spec' => 'Antihistamin injeksi diphenhydramine 10 mg/ml'],
                ['name' => 'DIVALPROEX 250 MG KAP', 'unit' => 'Kapsul', 'price' => 3800, 'spec' => 'Penstabil mood divalproex sodium 250 mg'],
                ['name' => 'DOMPERIDONE 10 MG', 'unit' => 'Tablet', 'price' => 500, 'spec' => 'Antiemetik domperidone 10 mg'],
                ['name' => 'FUROSEMIDE 40 MG', 'unit' => 'Tablet', 'price' => 450, 'spec' => 'Diuretik furosemide 40 mg'],
                ['name' => 'FUROSEMIDE INJ', 'unit' => 'Ampul', 'price' => 8000, 'spec' => 'Injeksi furosemide 20 mg/2 ml'],
                ['name' => 'GABAPENTIN 300 MG', 'unit' => 'Kapsul', 'price' => 3200, 'spec' => 'Antikonvulsan nyeri neuropati gabapentin 300 mg'],
                ['name' => 'HALOPERIDOL  5 MG', 'unit' => 'Tablet', 'price' => 450, 'spec' => 'Antipsikotik tipikal haloperidol 5 mg strip'],
                ['name' => 'HALOPERIDOL  5 MG  INJ', 'unit' => 'Ampul', 'price' => 12500, 'spec' => 'Injeksi haloperidol 5 mg/ml ampul'],
                ['name' => 'HALOPERIDOL 0,5 MG', 'unit' => 'Tablet', 'price' => 350, 'spec' => 'Antipsikotik haloperidol dosis rendah 0.5 mg'],
                ['name' => 'HALOPERIDOL 1,5 MG', 'unit' => 'Tablet', 'price' => 400, 'spec' => 'Antipsikotik haloperidol 1.5 mg'],
                ['name' => 'HALOPERIDOL 2 MG TABLET', 'unit' => 'Tablet', 'price' => 420, 'spec' => 'Antipsikotik haloperidol 2 mg'],
                ['name' => 'LORAZEPAM 2 MG', 'unit' => 'Tablet', 'price' => 1800, 'spec' => 'Sedatif anksiolitik lorazepam 2 mg'],
                ['name' => 'METFORMIN 500 MG', 'unit' => 'Tablet', 'price' => 400, 'spec' => 'Antidiabetes oral metformin 500 mg'],
                ['name' => 'METHYLPREDNISOLONE TAB 4 MG', 'unit' => 'Tablet', 'price' => 750, 'spec' => 'Kortikosteroid methylprednisolone 4 mg'],
                ['name' => 'NACL 0.9 %', 'unit' => 'Kolf', 'price' => 13500, 'spec' => 'Cairan infus normal saline 0.9% 500 ml'],
                ['name' => 'OLANZAPINE  5 MG', 'unit' => 'Tablet', 'price' => 3200, 'spec' => 'Antipsikotik atipikal olanzapine 5 mg'],
                ['name' => 'OLANZAPINE  10 MG', 'unit' => 'Tablet', 'price' => 5500, 'spec' => 'Antipsikotik atipikal olanzapine 10 mg'],
                ['name' => 'OMEPRAZOL 20 MG', 'unit' => 'Kapsul', 'price' => 850, 'spec' => 'Proton pump inhibitor omeprazole 20 mg'],
                ['name' => 'ONDANSETRON 4 MG', 'unit' => 'Tablet', 'price' => 1200, 'spec' => 'Antiemetik mual ondansetron 4 mg'],
                ['name' => 'PARACETAMOL INFUS', 'unit' => 'Botol', 'price' => 28000, 'spec' => 'Infus paracetamol 1000 mg/100 ml'],
                ['name' => 'PARACETAMOL TAB 500 MG', 'unit' => 'Tablet', 'price' => 300, 'spec' => 'Antipiretik analgesik paracetamol 500 mg'],
                ['name' => 'PHENOBARBITAL 30 MG', 'unit' => 'Tablet', 'price' => 450, 'spec' => 'Antikonvulsan penenang phenobarbital 30 mg'],
                ['name' => 'PHENYTOIN 100 MG', 'unit' => 'Kapsul', 'price' => 850, 'spec' => 'Antikonvulsan epilepsi phenytoin 100 mg'],
                ['name' => 'PHENYTOIN INJ 50 MG/ ML', 'unit' => 'Ampul', 'price' => 16000, 'spec' => 'Injeksi phenytoin sodium 100 mg/2 ml'],
                ['name' => 'PIRACETAM 800 MG', 'unit' => 'Tablet', 'price' => 1400, 'spec' => 'Nootropik piracetam 800 mg'],
                ['name' => 'PIRACETAM INJ 1 G', 'unit' => 'Ampul', 'price' => 14000, 'spec' => 'Injeksi piracetam 1 gram/5 ml'],
                ['name' => 'PIRACETAM INJ 3 G', 'unit' => 'Ampul', 'price' => 26000, 'spec' => 'Injeksi piracetam 3 gram/15 ml'],
                ['name' => 'QUETIAPINE XR 200', 'unit' => 'Tablet', 'price' => 14500, 'spec' => 'Antipsikotik atipikal quetiapine lepas lambat 200 mg'],
                ['name' => 'RANITIDIN INJ', 'unit' => 'Ampul', 'price' => 7500, 'spec' => 'Injeksi ranitidine 50 mg/2 ml'],
                ['name' => 'RANITIDINE TAB', 'unit' => 'Tablet', 'price' => 450, 'spec' => 'H2 blocker ranitidine 150 mg'],
                ['name' => 'RINGER LACTAS', 'unit' => 'Kolf', 'price' => 14000, 'spec' => 'Cairan infus Ringer Laktat 500 ml'],
                ['name' => 'RISPERIDONE 1 MG', 'unit' => 'Tablet', 'price' => 950, 'spec' => 'Antipsikotik atipikal risperidone 1 mg'],
                ['name' => 'RISPERIDONE 2 MG', 'unit' => 'Tablet', 'price' => 1200, 'spec' => 'Antipsikotik atipikal risperidone 2 mg'],
                ['name' => 'RISPERIDONE 3 MG', 'unit' => 'Tablet', 'price' => 1600, 'spec' => 'Antipsikotik atipikal risperidone 3 mg'],
                ['name' => 'SERTRALINE 50 MG', 'unit' => 'Tablet', 'price' => 3500, 'spec' => 'Antidepresan SSRI sertraline 50 mg'],
                ['name' => 'SIMVASTATIN TAB 10 MG', 'unit' => 'Tablet', 'price' => 650, 'spec' => 'Obat penurun kolesterol simvastatin 10 mg'],
                ['name' => 'TRIFLUOPERAZINE 5 MG', 'unit' => 'Tablet', 'price' => 800, 'spec' => 'Antipsikotik trifluoperazine 5 mg'],
                ['name' => 'TRIHEXYHENIDYL 2 MG', 'unit' => 'Tablet', 'price' => 350, 'spec' => 'Antikolinergik mengatasi efek ekstrapyramidal THP 2 mg'],
                ['name' => 'VITAMIN B KOMPLEKS', 'unit' => 'Tablet', 'price' => 200, 'spec' => 'Multivitamin B kompleks salut gula'],
            ],

            // 1.1.2.1.2.2 Belanja Obat Non Generik (Paten)
            '1.1.2.1.2.2' => [
                ['name' => 'ARIPIPRAZOL SYRUP (Abilify Syrup)', 'unit' => 'Botol', 'price' => 350000, 'spec' => 'Sirup Abilify original 150 ml'],
                ['name' => 'ARIPIPRAZOLE 10 MG ODT (Abilify)', 'unit' => 'Tablet', 'price' => 28000, 'spec' => 'Abilify orodispersible 10 mg'],
                ['name' => 'ARIPIPRAZOLE 15 MG ODT (Arzola)', 'unit' => 'Tablet', 'price' => 32000, 'spec' => 'Arzola 15 mg ODT'],
                ['name' => 'CURCUMA FORCE', 'unit' => 'Tablet', 'price' => 2100, 'spec' => 'Suplemen ekstrak temulawak dan piperin'],
                ['name' => 'DAYVIGO TABLET 5 MG', 'unit' => 'Tablet', 'price' => 25000, 'spec' => 'Obat insomnia lemborexant 5 mg'],
                ['name' => 'DONEPEZIL (ARICEPT) 10MG', 'unit' => 'Tablet', 'price' => 34000, 'spec' => 'Obat alzheimer demensia Aricept 10 mg'],
                ['name' => 'EUFORISS TAB (CLONAZEPAM 2 MG)', 'unit' => 'Tablet', 'price' => 7500, 'spec' => 'Clonazepam 2 mg Euforiss'],
                ['name' => 'FRIMANIA 200 MG (LITHIUM CARBONATE 200 MG)', 'unit' => 'Tablet', 'price' => 4500, 'spec' => 'Penstabil mood bipolar Frimania 200 mg'],
                ['name' => 'HALDOL DEC  INJ', 'unit' => 'Ampul', 'price' => 125000, 'spec' => 'Haloperidol decanoat injeksi depo 50 mg/ml'],
                ['name' => 'INVEGA SUSTENA 75/100/150', 'unit' => 'Vial', 'price' => 2450000, 'spec' => 'Paliperidone palmitat injeksi rilis lambat 100 mg'],
                ['name' => 'KETESSE-25', 'unit' => 'Tablet', 'price' => 6500, 'spec' => 'Dexketoprofen trometamol 25 mg analgesik'],
                ['name' => 'LASAL NEBU', 'unit' => 'Respule', 'price' => 14000, 'spec' => 'Salbutamol cair untuk nebulizer'],
                ['name' => 'LEVEMIR FLEX PEN', 'unit' => 'Pen', 'price' => 165000, 'spec' => 'Insulin detemir basal pen 100 U/ml'],
                ['name' => 'LUVOX 50 MG', 'unit' => 'Tablet', 'price' => 15000, 'spec' => 'Fluvoxamine maleate 50 mg obat OCD'],
                ['name' => 'MICROLAX', 'unit' => 'Tube', 'price' => 28000, 'spec' => 'Enema pencahar rektal cepat 5 ml'],
                ['name' => 'MILOZ  5 MG  INJ', 'unit' => 'Ampul', 'price' => 38000, 'spec' => 'Midazolam 5 mg/5 ml sedatif anestesi'],
                ['name' => 'MILOZ  15 MG  INJ', 'unit' => 'Ampul', 'price' => 72000, 'spec' => 'Midazolam 15 mg/3 ml sedatif berat'],
                ['name' => 'QUETIAPINE IR 100 (QPIN)', 'unit' => 'Tablet', 'price' => 9500, 'spec' => 'Qpin 100 mg quetiapine immediate release'],
                ['name' => 'SCABIMITE LOTION 1% 30 ML', 'unit' => 'Botol', 'price' => 65000, 'spec' => 'Lotion permethrin 5% antiskabies pasien rawat jiwa'],
                ['name' => 'VOLTAREN EMULGEL 10  GR', 'unit' => 'Tube', 'price' => 42000, 'spec' => 'Gel pereda nyeri otot dan sendi'],
                ['name' => 'ZYPIN INJ', 'unit' => 'Ampul', 'price' => 145000, 'spec' => 'Injeksi olanzapine 10 mg serbuk liofilisasi'],
            ],

            // 1.1.2.1.3 Belanja Bahan Habis Pakai Material Laboratorium
            '1.1.2.1.3' => [
                ['name' => 'MULTI 6 DRUG TEST DEVICE', 'unit' => 'Pcs', 'price' => 85000, 'spec' => 'Alat rapid test urin 6 parameter narkoba'],
                ['name' => 'COCAINE TEST DEVICE', 'unit' => 'Pcs', 'price' => 35000, 'spec' => 'Alat uji cepat screening kokain'],
                ['name' => 'METAMPHETAMIN TEST DEVICE', 'unit' => 'Pcs', 'price' => 35000, 'spec' => 'Alat uji cepat sabu metamfetamin'],
                ['name' => 'TABUNG EDTA 3 ML', 'unit' => 'Box', 'price' => 120000, 'spec' => 'Tabung vakum darah hematologi isi 100'],
                ['name' => 'TABUNG NON EDTA 3 ML', 'unit' => 'Box', 'price' => 110000, 'spec' => 'Tabung vakum darah kimia serum isi 100'],
                ['name' => 'STIK GLUCOSE', 'unit' => 'Box', 'price' => 180000, 'spec' => 'Strip uji gula darah glukometer isi 50'],
                ['name' => 'STIK URINE 10 PARAMETER', 'unit' => 'Box', 'price' => 195000, 'spec' => 'Strip urinalisis lengkap isi 100'],
                ['name' => 'TES KEHAMILAN (HCG)', 'unit' => 'Pcs', 'price' => 8500, 'spec' => 'Uji kehamilan cepat strip urin'],
                ['name' => 'REAGEN HBs Ag', 'unit' => 'Kit', 'price' => 450000, 'spec' => 'Reagen screening Hepatitis B surface antigen'],
                ['name' => 'REAGEN ANTI HBs Ag', 'unit' => 'Kit', 'price' => 480000, 'spec' => 'Reagen antibodi hepatitis B'],
                ['name' => 'ANTI HIV RAPID TEST', 'unit' => 'Kit', 'price' => 650000, 'spec' => 'Alat uji cepat antibodi HIV 1/2'],
                ['name' => 'ANTI HCV RAPID TEST', 'unit' => 'Kit', 'price' => 580000, 'spec' => 'Alat uji cepat hepatitis C'],
                ['name' => 'WIDAL KOMPLIT', 'unit' => 'Set', 'price' => 240000, 'spec' => 'Reagen uji serologi demam tifoid widal'],
                ['name' => 'AGUADEST 20 L', 'unit' => 'Jerigen', 'price' => 65000, 'spec' => 'Air deionisasi steril laboratorium 20 liter'],
                ['name' => 'GOLONGAN DARAH + RHESUS+KARTU', 'unit' => 'Set', 'price' => 280000, 'spec' => 'Reagen serum anti A, B, AB, D dan kartu'],
                ['name' => 'DISPOSIBLE LANCET', 'unit' => 'Box', 'price' => 35000, 'spec' => 'Jarum lancet steril tusuk jari isi 100'],
                ['name' => 'BLUE TIP', 'unit' => 'Pak', 'price' => 65000, 'spec' => 'Tip mikropipet 1000 ul isi 500'],
                ['name' => 'YELLOW TIP', 'unit' => 'Pak', 'price' => 60000, 'spec' => 'Tip mikropipet 200 ul isi 1000'],
                ['name' => 'TABUNG REAKSI KACA', 'unit' => 'Pcs', 'price' => 7500, 'spec' => 'Tabung reaksi kimia 15 ml borosilikat'],
            ],

            // 1.1.2.1.9 Belanja SIM RS
            '1.1.2.1.9' => [
                ['name' => 'Perbaikan dan penggantian Jaringan LAN', 'unit' => 'Paket', 'price' => 15000000, 'spec' => 'Pemasangan kabel UTP Cat6, patch panel, dan crimping gedung poli'],
                ['name' => 'Perbaikan dan penggantian hardware server', 'unit' => 'Paket', 'price' => 18000000, 'spec' => 'Upgrade RAM server database ECC 64GB dan SSD NVMe Enterprise'],
                ['name' => 'Perbaikan dan pembaruan software SIMRS', 'unit' => 'Paket', 'price' => 25000000, 'spec' => 'Integrasi bridging BPJS Antrean Online dan E-Rekam Medis'],
                ['name' => 'Pembayaran jasa Service layanan SIMRS', 'unit' => 'Bulan', 'price' => 5000000, 'spec' => 'Biaya SLA pemeliharaan teknis bulanan vendor sistem'],
            ],

            // 1.1.2.1.10 Belanja Cetak RS
            '1.1.2.1.10' => [
                ['name' => 'Belanja Cetak Rekam Medik (Map & Berkas)', 'unit' => 'Rim', 'price' => 85000, 'spec' => 'Map rekam medis pasien tebal dengan pengikat fastener'],
                ['name' => 'Belanja Cetak Farmasi (Etiket & Resep)', 'unit' => 'Roll', 'price' => 45000, 'spec' => 'Label stiker etiket putih dan biru termal isi 1000'],
                ['name' => 'Belanja Cetak dokumen/laporan RS', 'unit' => 'Rim', 'price' => 75000, 'spec' => 'Kertas formulir standar RS dengan kop resmi'],
                ['name' => 'Belanja Cetak Kotak Arsip Sedang', 'unit' => 'Pcs', 'price' => 18000, 'spec' => 'Boks karton tebal penyimpanan status rekam medis'],
                ['name' => 'Belanja Cetak Stampel Dokter DPJP', 'unit' => 'Pcs', 'price' => 65000, 'spec' => 'Stempel otomatis nama & SIP dokter spesialis'],
            ],

            // 1.2.02.05.01 Belanja Modal Peralatan Medis & Keperawatan
            '1.2.02.05.01' => [
                ['name' => 'Defibrillator Biphasic Portable', 'unit' => 'Unit', 'price' => 65000000, 'spec' => 'Alat pacu jantung defibrillator dengan monitor dan AED'],
                ['name' => 'Patient Monitor 5 Parameter', 'unit' => 'Unit', 'price' => 28000000, 'spec' => 'Monitor tanda vital ECG, NIBP, SpO2, Temp, Resp'],
                ['name' => 'Suction Pump Medis Mobile', 'unit' => 'Unit', 'price' => 8500000, 'spec' => 'Alat penyedot dahak/cairan pasien daya hisap ganda'],
                ['name' => 'Electrocardiograph (EKG 12 Channel)', 'unit' => 'Unit', 'price' => 32000000, 'spec' => 'Mesin rekam jantung 12 lead layar sentuh dan printer'],
            ],

            // 1.2.02.10.01 Belanja Modal Komputer & Jaringan
            '1.2.02.10.01' => [
                ['name' => 'PC Komputer Staf Poliklinik Core i5', 'unit' => 'Unit', 'price' => 9500000, 'spec' => 'PC All-in-One Core i5, RAM 16GB, SSD 512GB, Windows 11'],
                ['name' => 'Printer Laser Rekam Medis', 'unit' => 'Unit', 'price' => 3800000, 'spec' => 'Printer monokrom kecepatan tinggi duplex network'],
                ['name' => 'Switch Hub 24 Port Gigabit', 'unit' => 'Unit', 'price' => 2400000, 'spec' => 'Managed switch 24 port 10/100/1000 Mbps'],
            ],

            // 5.1.02.01.01.0024 Belanja ATK
            '5.1.02.01.01.0024' => [
                ['name' => 'Kertas HVS A4 80gr PaperOne', 'unit' => 'Rim', 'price' => 55000, 'spec' => 'Ukuran 210 x 297 mm, 80 gsm, isi 500 lembar'],
                ['name' => 'Tinta Printer Hitam Canon GI-790', 'unit' => 'Botol', 'price' => 120000, 'spec' => 'Tinta original hitam 135 ml'],
                ['name' => 'Spidol Whiteboard Snowman Hitam', 'unit' => 'Pcs', 'price' => 10000, 'spec' => 'Spidol papan tulis non-permanent'],
                ['name' => 'Map Snellhecter Kertas Kuning', 'unit' => 'Pak', 'price' => 45000, 'spec' => 'Kertas buffalo kuning jepit acco isi 50'],
            ],
        ];

        $itemIndex = 1;

        foreach ($catalog as $accCode => $itemsList) {
            $account = $accounts->get($accCode);
            $accId = $account?->id;

            foreach ($itemsList as $it) {
                $code = 'ITM-' . str_pad($itemIndex++, 4, '0', STR_PAD_LEFT);

                Item::updateOrCreate(
                    ['name' => $it['name']],
                    [
                        'item_code' => $code,
                        'rba_account_id' => $accId,
                        'specification' => $it['spec'],
                        'unit_type' => $it['unit'],
                        'standard_price' => $it['price'],
                    ]
                );
            }
        }
    }
}
