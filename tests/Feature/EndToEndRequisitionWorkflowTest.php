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

class EndToEndRequisitionWorkflowTest extends TestCase
{
    use RefreshDatabase;

    private User $divisiUser;
    private User $perencanaanUser;
    private User $keuanganUser;
    private Division $medikDivision;
    private Unit $igdUnit;
    private RbaAccount $rbaAccount;

    protected function setUp(): void
    {
        parent::setUp();

        $this->medikDivision = Division::create([
            'name' => 'Bidang Pelayanan Medik',
            'division_code' => 'YANMED',
            'group' => 'Pelayanan_Keperawatan',
        ]);

        $this->igdUnit = Unit::create([
            'division_id' => $this->medikDivision->id,
            'name' => 'Instalasi Gawat Darurat (IGD)',
            'unit_code' => 'IGD',
        ]);

        $this->divisiUser = User::factory()->create([
            'name' => 'dr. PIC IGD',
            'role' => 'divisi',
            'division_id' => $this->medikDivision->id,
            'unit_id' => $this->igdUnit->id,
            'is_active' => true,
        ]);

        $this->perencanaanUser = User::factory()->create([
            'name' => 'Staf Perencanaan',
            'role' => 'perencanaan',
            'is_active' => true,
        ]);

        $this->keuanganUser = User::factory()->create([
            'name' => 'Bendahara Pengeluaran',
            'role' => 'keuangan',
            'is_active' => true,
        ]);

        $this->rbaAccount = RbaAccount::create([
            'account_code' => '5.1.02.01.01.0024',
            'account_name' => 'Belanja Bahan Medis Habis Pakai',
            'kategori_belanja' => 'Operasi',
            'sumber_dana' => 'BLUD',
            'total_budget' => 100000000,
            'spent_budget' => 0,
            'remaining_budget' => 100000000,
            'period_year' => 2026,
        ]);
    }

    public function test_full_end_to_end_requisition_lifecycle(): void
    {
        // 1. DIVISI SUBMITS REQUISITION WITH MANUAL ITEM & CATALOG ITEM
        $catalogItem = Item::create([
            'rba_account_id' => $this->rbaAccount->id,
            'item_code' => 'ITM-0001',
            'name' => 'Kasa Steril 16x16',
            'specification' => 'Kotak isi 10 pouch',
            'unit_type' => 'Box',
            'standard_price' => 25000,
        ]);

        $storeResponse = $this->actingAs($this->divisiUser)
            ->post(route('requisitions.store'), [
                'fiscal_year' => 2027,
                'jenis_belanja' => 'Operasi',
                'rba_account_id' => $this->rbaAccount->id,
                'sub_kegiatan' => 'Pelayanan dan Penunjang Pelayanan BLUD RS Jiwa Tampan',
                'nomor_surat_unit' => 'ND/IGD/01/2026',
                'urgency_reason' => 'Kebutuhan mendesak pelayanan gawat darurat pasien psikiatri.',
                'items' => [
                    [
                        'item_id' => $catalogItem->id,
                        'unit_price' => 27000, // custom price
                        'quantity' => 10,
                    ],
                    [
                        'is_new' => true,
                        'name' => 'Hand Sanitizer Gel 500ml',
                        'specification' => 'Alkohol 70% dengan pump',
                        'unit_type' => 'Botol',
                        'unit_price' => 35000,
                        'quantity' => 5,
                    ],
                ],
            ]);

        $storeResponse->assertRedirect(route('requisitions.index'));

        $requisition = Requisition::latest('id')->first();
        $this->assertNotNull($requisition);
        $this->assertEquals('Pending_Perencanaan', $requisition->status);
        $this->assertEquals(2, $requisition->requisitionDetails()->count());

        // 2. PERENCANAAN VERIFIES AND APPROVES QUANTITY
        $indexResponse = $this->actingAs($this->perencanaanUser)
            ->get(route('perencanaan.requisitions.index'));
        $indexResponse->assertOk();

        $itemsPayload = $requisition->requisitionDetails->map(function ($d) {
            return [
                'id' => $d->id,
                'quantity_approved' => str_contains($d->item_name, 'Hand Sanitizer') ? 4 : 10,
            ];
        })->toArray();

        $verifyResponse = $this->actingAs($this->perencanaanUser)
            ->put(route('perencanaan.requisitions.update', $requisition->id), [
                'status' => 'Diproses_Keuangan',
                'notes_perencanaan' => 'Disetujui dengan penyesuaian kuantitas hand sanitizer menjadi 4 botol.',
                'items' => $itemsPayload,
            ]);

        $verifyResponse->assertRedirect(route('perencanaan.requisitions.index'));

        $requisition->refresh();
        $this->assertEquals('Diproses_Keuangan', $requisition->status);
        // Total approved: (10 * 27000) + (4 * 35000) = 270000 + 140000 = 410000
        $this->assertEquals(410000, (float) $requisition->total_approved);
        $this->assertEquals($this->perencanaanUser->id, $requisition->verified_by_perencanaan_id);
        $this->assertNotNull($requisition->verified_perencanaan_at);

        // 3. PRINT VIEW RENDERS WITH ACCURATE MANUAL ITEM DATA, UNIT, AND VERIFIER INFO
        $printResponse = $this->actingAs($this->divisiUser)
            ->get(route('requisitions.print', $requisition->id));

        $printResponse->assertOk();
        $printResponse->assertInertia(fn (Assert $page) => $page
            ->component('Shared/PrintRequisition')
            ->where('requisition.id', $requisition->id)
            ->where('requisition.unit.name', 'Instalasi Gawat Darurat (IGD)')
            ->where('requisition.verified_by_perencanaan.name', 'Staf Perencanaan')
            ->where('requisition.requisition_details.0.item_name', 'Hand Sanitizer Gel 500ml')
            ->where('requisition.requisition_details.0.quantity_approved', 4)
            ->where('requisition.requisition_details.1.item_name', 'Kasa Steril 16x16')
            ->where('requisition.requisition_details.1.quantity_approved', 10)
        );

        // Also test print from Keuangan route
        $keuanganPrintResponse = $this->actingAs($this->keuanganUser)
            ->get(route('keuangan.requisitions.print', $requisition->id));
        $keuanganPrintResponse->assertOk();

        // 4. KEUANGAN DISBURSES WITH SP2D NUMBER & DEDUCTS RBA BUDGET
        $disburseResponse = $this->actingAs($this->keuanganUser)
            ->put(route('keuangan.requisitions.update', $requisition->id), [
                'status' => 'Disetujui_Selesai',
                'rba_account_id' => $this->rbaAccount->id,
                'sp2d_number' => 'SP2D-BLUD-2026-0089',
                'receipt_number' => 'KWT-2026-0045',
                'notes_keuangan' => 'Pencairan dana transfer kas BLUD selesai.',
            ]);

        $disburseResponse->assertRedirect(route('keuangan.requisitions.index'));

        $requisition->refresh();
        $this->assertEquals('Disetujui_Selesai', $requisition->status);
        $this->assertEquals('SP2D-BLUD-2026-0089', $requisition->sp2d_number);
        $this->assertEquals($this->keuanganUser->id, $requisition->approved_by_keuangan_id);
        $this->assertNotNull($requisition->approved_keuangan_at);

        // Check budget deduction
        $this->rbaAccount->refresh();
        $this->assertEquals(410000, (float) $this->rbaAccount->spent_budget);
        $this->assertEquals(99590000, (float) $this->rbaAccount->remaining_budget);
    }
}
