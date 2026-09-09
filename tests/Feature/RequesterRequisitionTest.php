<?php

namespace Tests\Feature;

use App\Models\Division;
use App\Models\Item;
use App\Models\RbaAccount;
use App\Models\Requisition;
use App\Models\RequisitionDetail;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class RequesterRequisitionTest extends TestCase
{
    use RefreshDatabase;

    private Division $medikDivision;
    private Division $penunjangDivision;
    private Unit $farmasiUnit;
    private Unit $radiologiUnit;
    private User $farmasiUser;
    private User $radiologiUser;
    private RbaAccount $rbaOperasiBlud;
    private RbaAccount $rbaModalBlud;
    private RbaAccount $rbaApbd;
    private Item $itemObat;
    private Item $itemAlkesModal;

    protected function setUp(): void
    {
        parent::setUp();

        // 1. Setup Divisions & Units (RSJ Tampan structure)
        $this->medikDivision = Division::create([
            'name' => 'Bidang Pelayanan Medik',
            'division_code' => 'MEDIK',
            'group' => 'Pelayanan_Keperawatan',
        ]);

        $this->penunjangDivision = Division::create([
            'name' => 'Bidang Penunjang Medik & Diklit',
            'division_code' => 'PENUNJANG_DIKLIT',
            'group' => 'Pelayanan_Keperawatan',
        ]);

        $this->farmasiUnit = Unit::create([
            'division_id' => $this->medikDivision->id,
            'name' => 'Instalasi Farmasi',
            'unit_code' => 'FAR',
        ]);

        $this->radiologiUnit = Unit::create([
            'division_id' => $this->penunjangDivision->id,
            'name' => 'Instalasi Radiologi',
            'unit_code' => 'RAD',
        ]);

        // 2. Setup Users with NIP and Position
        $this->farmasiUser = User::factory()->create([
            'name' => 'apt. Siti Rahma, S.Farm',
            'nip' => '198705122011012003',
            'position' => 'Kepala Instalasi Farmasi',
            'role' => 'divisi',
            'division_id' => $this->medikDivision->id,
            'unit_id' => $this->farmasiUnit->id,
            'is_active' => true,
        ]);

        $this->radiologiUser = User::factory()->create([
            'name' => 'dr. Agus Radiolog, Sp.Rad',
            'nip' => '198302152008011002',
            'position' => 'Kepala Instalasi Radiologi',
            'role' => 'divisi',
            'division_id' => $this->penunjangDivision->id,
            'unit_id' => $this->radiologiUnit->id,
            'is_active' => true,
        ]);

        // 3. Setup RBA Accounts (BLUD vs APBD)
        $this->rbaOperasiBlud = RbaAccount::create([
            'account_code' => '5.1.02.01.01.0001',
            'account_name' => 'Belanja Bahan Obat-Obatan BLUD',
            'kategori_belanja' => 'Operasi',
            'sumber_dana' => 'BLUD',
            'total_budget' => 500000000,
            'remaining_budget' => 500000000,
            'period_year' => 2026,
        ]);

        $this->rbaModalBlud = RbaAccount::create([
            'account_code' => '5.2.02.08.01.0001',
            'account_name' => 'Belanja Modal Alat Kedokteran Radiologi BLUD',
            'kategori_belanja' => 'Modal',
            'sumber_dana' => 'BLUD',
            'total_budget' => 800000000,
            'remaining_budget' => 800000000,
            'period_year' => 2026,
        ]);

        $this->rbaApbd = RbaAccount::create([
            'account_code' => '5.1.02.99.99.9999',
            'account_name' => 'Belanja Bersumber Dana APBD',
            'kategori_belanja' => 'Operasi',
            'sumber_dana' => 'APBD',
            'total_budget' => 100000000,
            'remaining_budget' => 100000000,
            'period_year' => 2026,
        ]);

        // 4. Setup Items
        $this->itemObat = Item::create([
            'rba_account_id' => $this->rbaOperasiBlud->id,
            'item_code' => 'FAR-001',
            'name' => 'Risperidone 2mg Tablet',
            'specification' => 'Box 5 blister @ 10 tablet',
            'unit_type' => 'Box',
            'standard_price' => 75000,
        ]);

        $this->itemAlkesModal = Item::create([
            'rba_account_id' => $this->rbaModalBlud->id,
            'item_code' => 'RAD-001',
            'name' => 'X-Ray Film Digitizer Scanner',
            'specification' => 'High resolution medical scanner DICOM compliant',
            'unit_type' => 'Unit',
            'standard_price' => 150000000,
        ]);
    }

    public function test_create_page_only_provides_blud_accounts_and_planning_options(): void
    {
        $response = $this->actingAs($this->farmasiUser)->get(route('requisitions.create', ['jenis' => 'Operasi']));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Divisi/Requisitions/Create')
            ->where('defaultFiscalYear', 2027)
            ->where('initialJenis', 'Operasi')
            ->has('subKegiatanOptions')
            ->has('rbaAccounts', 2) // only BLUD (Operasi & Modal), APBD is excluded
            ->where('userUnit.unit_code', 'FAR')
            ->where('userDivision.division_code', 'MEDIK')
        );
    }

    public function test_unit_can_submit_belanja_operasi_blud_for_fiscal_year_2027(): void
    {
        $payload = [
            'rba_account_id' => $this->rbaOperasiBlud->id,
            'jenis_belanja' => 'Operasi',
            'sub_kegiatan' => 'Pelayanan dan Penunjang Pelayanan BLUD RS Jiwa Tampan',
            'fiscal_year' => 2027,
            'nomor_surat_unit' => '045/FAR/RSJ/X/2026',
            'urgency_reason' => 'Perencanaan kebutuhan obat antipsikotik pasien rawat inap dan rawat jalan untuk TA 2027.',
            'items' => [
                [
                    'item_id' => $this->itemObat->id,
                    'quantity' => 100,
                ],
            ],
        ];

        $response = $this->actingAs($this->farmasiUser)->post(route('requisitions.store'), $payload);

        $response->assertRedirect(route('requisitions.index'));
        $this->assertDatabaseHas('requisitions', [
            'unit_id' => $this->farmasiUnit->id,
            'division_id' => $this->medikDivision->id,
            'user_id' => $this->farmasiUser->id,
            'rba_account_id' => $this->rbaOperasiBlud->id,
            'jenis_belanja' => 'Operasi',
            'sumber_dana' => 'BLUD',
            'sub_kegiatan' => 'Pelayanan dan Penunjang Pelayanan BLUD RS Jiwa Tampan',
            'fiscal_year' => 2027,
            'nomor_surat_unit' => '045/FAR/RSJ/X/2026',
            'status' => 'Pending_Perencanaan',
            'total_estimated' => 7500000, // 100 * 75,000
        ]);

        $requisition = Requisition::where('user_id', $this->farmasiUser->id)->first();
        $this->assertCount(1, $requisition->requisitionDetails);
        $this->assertEquals(7500000, $requisition->requisitionDetails->first()->subtotal);
    }

    public function test_unit_can_submit_belanja_modal_blud_for_fiscal_year_2027(): void
    {
        $payload = [
            'rba_account_id' => $this->rbaModalBlud->id,
            'jenis_belanja' => 'Modal',
            'sub_kegiatan' => 'Pengadaan Sarana dan Prasarana Medis/Non-Medis (Belanja Modal)',
            'fiscal_year' => 2027,
            'nomor_surat_unit' => '012/RAD/MODAL/2026',
            'urgency_reason' => 'Digitalisasi layanan radiologi RSJ Tampan sesuai standar akreditasi rumah sakit.',
            'items' => [
                [
                    'item_id' => $this->itemAlkesModal->id,
                    'quantity' => 1,
                ],
            ],
        ];

        $response = $this->actingAs($this->radiologiUser)->post(route('requisitions.store'), $payload);

        $response->assertRedirect(route('requisitions.index'));
        $this->assertDatabaseHas('requisitions', [
            'unit_id' => $this->radiologiUnit->id,
            'division_id' => $this->penunjangDivision->id,
            'user_id' => $this->radiologiUser->id,
            'jenis_belanja' => 'Modal',
            'sumber_dana' => 'BLUD',
            'fiscal_year' => 2027,
            'total_estimated' => 150000000,
        ]);
    }

    public function test_data_isolation_unit_only_views_its_own_requisitions(): void
    {
        // 1. Create requisition for Farmasi
        Requisition::create([
            'requisition_number' => 'REQ-20261001-0001',
            'division_id' => $this->medikDivision->id,
            'unit_id' => $this->farmasiUnit->id,
            'user_id' => $this->farmasiUser->id,
            'rba_account_id' => $this->rbaOperasiBlud->id,
            'jenis_belanja' => 'Operasi',
            'sumber_dana' => 'BLUD',
            'sub_kegiatan' => 'Pelayanan dan Penunjang Pelayanan BLUD RS Jiwa Tampan',
            'fiscal_year' => 2027,
            'status' => 'Pending_Perencanaan',
            'submission_date' => today(),
            'total_estimated' => 5000000,
        ]);

        // 2. Create requisition for Radiologi
        Requisition::create([
            'requisition_number' => 'REQ-20261001-0002',
            'division_id' => $this->penunjangDivision->id,
            'unit_id' => $this->radiologiUnit->id,
            'user_id' => $this->radiologiUser->id,
            'rba_account_id' => $this->rbaModalBlud->id,
            'jenis_belanja' => 'Modal',
            'sumber_dana' => 'BLUD',
            'sub_kegiatan' => 'Pengadaan Sarana dan Prasarana Medis/Non-Medis (Belanja Modal)',
            'fiscal_year' => 2027,
            'status' => 'Pending_Perencanaan',
            'submission_date' => today(),
            'total_estimated' => 150000000,
        ]);

        // Acting as Farmasi User -> must ONLY see 1 requisition (Farmasi), NOT Radiologi
        $responseFarmasi = $this->actingAs($this->farmasiUser)->get(route('requisitions.index'));
        $responseFarmasi->assertOk();
        $responseFarmasi->assertInertia(fn (Assert $page) => $page
            ->component('Divisi/Requisitions/Index')
            ->has('requisitions', 1)
            ->where('requisitions.0.requisition_number', 'REQ-20261001-0001')
            ->where('requisitions.0.unit_id', $this->farmasiUnit->id)
        );

        // Acting as Radiologi User -> must ONLY see 1 requisition (Radiologi), NOT Farmasi
        $responseRadiologi = $this->actingAs($this->radiologiUser)->get(route('requisitions.index'));
        $responseRadiologi->assertOk();
        $responseRadiologi->assertInertia(fn (Assert $page) => $page
            ->component('Divisi/Requisitions/Index')
            ->has('requisitions', 1)
            ->where('requisitions.0.requisition_number', 'REQ-20261001-0002')
            ->where('requisitions.0.unit_id', $this->radiologiUnit->id)
        );
    }

    public function test_show_and_print_requisition_page_loads_with_complete_document_data(): void
    {
        $requisition = Requisition::create([
            'requisition_number' => 'REQ-20261001-0003',
            'nomor_surat_unit' => '99/FAR/NOTA/2026',
            'division_id' => $this->medikDivision->id,
            'unit_id' => $this->farmasiUnit->id,
            'user_id' => $this->farmasiUser->id,
            'rba_account_id' => $this->rbaOperasiBlud->id,
            'jenis_belanja' => 'Operasi',
            'sumber_dana' => 'BLUD',
            'sub_kegiatan' => 'Pelayanan dan Penunjang Pelayanan BLUD RS Jiwa Tampan',
            'fiscal_year' => 2027,
            'urgency_reason' => 'Stok obat krisis untuk triwulan I TA 2027.',
            'status' => 'Pending_Perencanaan',
            'submission_date' => today(),
            'total_estimated' => 750000,
        ]);

        RequisitionDetail::create([
            'requisition_id' => $requisition->id,
            'item_id' => $this->itemObat->id,
            'item_name' => $this->itemObat->name,
            'unit_type' => 'Box',
            'specification' => $this->itemObat->specification,
            'quantity_requested' => 10,
            'unit_price' => 75000,
            'subtotal' => 750000,
        ]);

        // Test Show Page
        $showResponse = $this->actingAs($this->farmasiUser)->get(route('requisitions.show', $requisition->id));
        $showResponse->assertOk();
        $showResponse->assertInertia(fn (Assert $page) => $page
            ->component('Divisi/Requisitions/Show')
            ->where('requisition.requisition_number', 'REQ-20261001-0003')
            ->where('requisition.fiscal_year', 2027)
            ->where('requisition.sub_kegiatan', 'Pelayanan dan Penunjang Pelayanan BLUD RS Jiwa Tampan')
            ->where('requisition.nomor_surat_unit', '99/FAR/NOTA/2026')
            ->has('requisition.requisition_details', 1)
        );

        // Test Print Page
        $printResponse = $this->actingAs($this->farmasiUser)->get(route('requisitions.print', $requisition->id));
        $printResponse->assertOk();
        $printResponse->assertInertia(fn (Assert $page) => $page
            ->component('Shared/PrintRequisition')
            ->where('requisition.requisition_number', 'REQ-20261001-0003')
            ->where('requisition.fiscal_year', 2027)
            ->where('requisition.user.nip', '198705122011012003')
        );
    }

    public function test_index_page_provides_master_data_for_popup_modal(): void
    {
        $response = $this->actingAs($this->farmasiUser)->get(route('requisitions.index'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Divisi/Requisitions/Index')
            ->where('defaultFiscalYear', 2027)
            ->has('rbaAccounts', 2) // only BLUD (Operasi & Modal)
            ->has('items', 2)
            ->has('subKegiatanOptions', 5)
            ->where('userUnit.unit_code', 'FAR')
            ->where('userDivision.division_code', 'MEDIK')
        );
    }

    public function test_unit_can_update_pending_requisition(): void
    {
        $requisition = Requisition::create([
            'requisition_number' => 'REQ-20261001-0010',
            'nomor_surat_unit' => '001/FAR/2026',
            'division_id' => $this->medikDivision->id,
            'unit_id' => $this->farmasiUnit->id,
            'user_id' => $this->farmasiUser->id,
            'rba_account_id' => $this->rbaOperasiBlud->id,
            'jenis_belanja' => 'Operasi',
            'sumber_dana' => 'BLUD',
            'sub_kegiatan' => 'Pelayanan dan Penunjang Pelayanan BLUD RS Jiwa Tampan',
            'fiscal_year' => 2027,
            'urgency_reason' => 'Draft awal.',
            'status' => 'Pending_Perencanaan',
            'submission_date' => today(),
            'total_estimated' => 750000,
        ]);

        RequisitionDetail::create([
            'requisition_id' => $requisition->id,
            'item_id' => $this->itemObat->id,
            'item_name' => $this->itemObat->name,
            'unit_type' => 'Box',
            'specification' => $this->itemObat->specification,
            'quantity_requested' => 10,
            'unit_price' => 75000,
            'subtotal' => 750000,
        ]);

        $updatePayload = [
            'rba_account_id' => $this->rbaOperasiBlud->id,
            'jenis_belanja' => 'Operasi',
            'sub_kegiatan' => 'Penyelenggaraan Tata Kelola dan Administrasi BLUD',
            'fiscal_year' => 2027,
            'nomor_surat_unit' => '001/FAR/REV/2026',
            'urgency_reason' => 'Revisi peningkatan kebutuhan obat untuk 1 tahun ke depan.',
            'items' => [
                [
                    'item_id' => $this->itemObat->id,
                    'quantity' => 25, // 25 * 75,000 = 1,875,000
                ],
            ],
        ];

        $response = $this->actingAs($this->farmasiUser)->put(route('requisitions.update', $requisition->id), $updatePayload);

        $response->assertRedirect(route('requisitions.index'));
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('requisitions', [
            'id' => $requisition->id,
            'nomor_surat_unit' => '001/FAR/REV/2026',
            'sub_kegiatan' => 'Penyelenggaraan Tata Kelola dan Administrasi BLUD',
            'total_estimated' => 1875000,
            'status' => 'Pending_Perencanaan',
        ]);

        $this->assertDatabaseHas('requisition_details', [
            'requisition_id' => $requisition->id,
            'item_id' => $this->itemObat->id,
            'quantity_requested' => 25,
            'subtotal' => 1875000,
        ]);
    }

    public function test_unit_cannot_update_non_pending_requisition(): void
    {
        $requisition = Requisition::create([
            'requisition_number' => 'REQ-20261001-0020',
            'nomor_surat_unit' => '002/FAR/2026',
            'division_id' => $this->medikDivision->id,
            'unit_id' => $this->farmasiUnit->id,
            'user_id' => $this->farmasiUser->id,
            'rba_account_id' => $this->rbaOperasiBlud->id,
            'jenis_belanja' => 'Operasi',
            'sumber_dana' => 'BLUD',
            'sub_kegiatan' => 'Pelayanan dan Penunjang Pelayanan BLUD RS Jiwa Tampan',
            'fiscal_year' => 2027,
            'status' => 'Diproses_Keuangan', // Sudah diverifikasi oleh perencanaan
            'submission_date' => today(),
            'total_estimated' => 750000,
        ]);

        $updatePayload = [
            'rba_account_id' => $this->rbaOperasiBlud->id,
            'jenis_belanja' => 'Operasi',
            'sub_kegiatan' => 'Pelayanan dan Penunjang Pelayanan BLUD RS Jiwa Tampan',
            'fiscal_year' => 2027,
            'items' => [
                [
                    'item_id' => $this->itemObat->id,
                    'quantity' => 50,
                ],
            ],
        ];

        $response = $this->actingAs($this->farmasiUser)->put(route('requisitions.update', $requisition->id), $updatePayload);

        $response->assertSessionHas('error');
        $this->assertEquals(750000, $requisition->fresh()->total_estimated);
    }

    public function test_unit_cannot_update_other_units_requisition(): void
    {
        $radiologiReq = Requisition::create([
            'requisition_number' => 'REQ-20261001-0030',
            'division_id' => $this->penunjangDivision->id,
            'unit_id' => $this->radiologiUnit->id,
            'user_id' => $this->radiologiUser->id,
            'rba_account_id' => $this->rbaModalBlud->id,
            'jenis_belanja' => 'Modal',
            'sumber_dana' => 'BLUD',
            'sub_kegiatan' => 'Pengadaan Sarana dan Prasarana Medis/Non-Medis (Belanja Modal)',
            'fiscal_year' => 2027,
            'status' => 'Pending_Perencanaan',
            'submission_date' => today(),
            'total_estimated' => 150000000,
        ]);

        $payload = [
            'rba_account_id' => $this->rbaModalBlud->id,
            'jenis_belanja' => 'Modal',
            'sub_kegiatan' => 'Pengadaan Sarana dan Prasarana Medis/Non-Medis (Belanja Modal)',
            'fiscal_year' => 2027,
            'items' => [
                [
                    'item_id' => $this->itemAlkesModal->id,
                    'quantity' => 2,
                ],
            ],
        ];

        // Farmasi user attempts to update Radiologi's requisition
        $response = $this->actingAs($this->farmasiUser)->put(route('requisitions.update', $radiologiReq->id), $payload);

        $response->assertForbidden();
    }
}

