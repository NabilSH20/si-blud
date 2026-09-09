<?php

namespace Tests\Feature;

use App\Models\Division;
use App\Models\Item;
use App\Models\RbaAccount;
use App\Models\RbaExpenseItem;
use App\Models\RbaRevenueItem;
use App\Models\RbaShift;
use App\Models\Requisition;
use App\Models\RequisitionDetail;
use App\Models\Unit;
use App\Models\User;
use Database\Seeders\RbaPergeseran3Seeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PerencanaanRbaPlanningTest extends TestCase
{
    use RefreshDatabase;

    private User $perencanaanUser;
    private Division $perencanaanDivision;
    private RbaShift $activeShift;

    protected function setUp(): void
    {
        parent::setUp();

        $this->perencanaanDivision = Division::create([
            'name' => 'Bagian Perencanaan',
            'division_code' => 'REN',
            'group' => 'Manajemen',
        ]);

        $this->perencanaanUser = User::factory()->create([
            'name' => 'Hawari Dinal, S.Sos.M.Si',
            'nip' => '197002111997031005',
            'position' => 'Kepala Bagian Perencanaan',
            'role' => 'perencanaan',
            'division_id' => $this->perencanaanDivision->id,
            'is_active' => true,
        ]);

        // Seed RBA Pergeseran III baseline data
        $this->seed(RbaPergeseran3Seeder::class);
        $this->activeShift = RbaShift::where('shift_name', 'Pergeseran III')->first();
    }

    public function test_perencanaan_can_view_rba_index_with_ringkasan_and_surplus_deficit(): void
    {
        $response = $this->actingAs($this->perencanaanUser)
            ->get(route('perencanaan.rba.index', ['shift_id' => $this->activeShift->id]));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Perencanaan/RBA/Index')
            ->has('shifts')
            ->has('revenue_items')
            ->has('expense_items')
            ->has('catalog_items')
            ->has('ringkasan_rba')
            ->where('ringkasan_rba.surplus_defisit.after', 89224000)
            ->where('ringkasan_rba.pendapatan.total.after', 44281028836)
            ->where('ringkasan_rba.belanja.total.after', 44191804836)
        );
    }

    public function test_perencanaan_can_update_revenue_target_and_recalculate_headers(): void
    {
        $revItem = RbaRevenueItem::where('rba_shift_id', $this->activeShift->id)
            ->where('item_name', 'Pendapatan Pelayanan Farmasi')
            ->firstOrFail();

        $originalAmount = (float) $revItem->before_amount;
        $newTarget = 2500000000; // 2.5 Billion

        $response = $this->actingAs($this->perencanaanUser)
            ->patch(route('perencanaan.rba.revenue-items.update', $revItem->id), [
                'after_amount' => $newTarget,
            ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('rba_revenue_items', [
            'id' => $revItem->id,
            'after_amount' => $newTarget,
            'difference' => $newTarget - $originalAmount,
        ]);

        // Assert Jasa Layanan category header recalculated
        $jasaLayananHeader = RbaRevenueItem::where('rba_shift_id', $this->activeShift->id)
            ->where('item_code', '1')
            ->first();
        $this->assertGreaterThan(25047246628, (float) $jasaLayananHeader->after_amount);
    }

    public function test_perencanaan_can_batch_update_revenue_targets(): void
    {
        $item1 = RbaRevenueItem::where('rba_shift_id', $this->activeShift->id)
            ->where('item_name', 'Pendapatan Pelayanan Gawat Darurat')
            ->firstOrFail();

        $item2 = RbaRevenueItem::where('rba_shift_id', $this->activeShift->id)
            ->where('item_name', 'Hasil Kerjasama Diklat')
            ->firstOrFail();

        $payload = [
            'items' => [
                ['id' => $item1->id, 'after_amount' => 50000000],
                ['id' => $item2->id, 'after_amount' => 300000000],
            ],
        ];

        $response = $this->actingAs($this->perencanaanUser)
            ->patch(route('perencanaan.rba.batch-revenue.update', $this->activeShift->id), $payload);

        $response->assertRedirect();
        $this->assertDatabaseHas('rba_revenue_items', [
            'id' => $item1->id,
            'after_amount' => 50000000,
        ]);
        $this->assertDatabaseHas('rba_revenue_items', [
            'id' => $item2->id,
            'after_amount' => 300000000,
        ]);
    }

    public function test_perencanaan_can_update_pembiayaan_and_silpa(): void
    {
        $payload = [
            'penerimaan_silpa' => 150000000,
            'penerimaan_divestasi' => 0,
            'penerimaan_pinjaman' => 0,
            'pengeluaran_investasi' => 50000000,
            'pengeluaran_pokok_utang' => 0,
        ];

        $response = $this->actingAs($this->perencanaanUser)
            ->patch(route('perencanaan.rba.pembiayaan.update', $this->activeShift->id), $payload);

        $response->assertRedirect();
        $this->assertDatabaseHas('rba_shifts', [
            'id' => $this->activeShift->id,
            'penerimaan_silpa' => 150000000,
            'pengeluaran_investasi' => 50000000,
        ]);
    }

    public function test_all_rba_print_pages_render_correctly(): void
    {
        // 1. Print Ringkasan RBA
        $resRingkasan = $this->actingAs($this->perencanaanUser)
            ->get(route('perencanaan.rba.print-ringkasan', ['shift_id' => $this->activeShift->id]));
        $resRingkasan->assertOk();
        $resRingkasan->assertInertia(fn (Assert $page) => $page
            ->component('Perencanaan/RBA/PrintRingkasan')
            ->has('ringkasan')
        );

        // 2. Print Pendapatan BLUD
        $resPendapatan = $this->actingAs($this->perencanaanUser)
            ->get(route('perencanaan.rba.print-pendapatan', ['shift_id' => $this->activeShift->id]));
        $resPendapatan->assertOk();
        $resPendapatan->assertInertia(fn (Assert $page) => $page
            ->component('Perencanaan/RBA/PrintPendapatan')
            ->has('items')
        );

        // 3. Print Belanja BLUD
        $resBelanja = $this->actingAs($this->perencanaanUser)
            ->get(route('perencanaan.rba.print-belanja', ['shift_id' => $this->activeShift->id]));
        $resBelanja->assertOk();
        $resBelanja->assertInertia(fn (Assert $page) => $page
            ->component('Perencanaan/RBA/PrintBelanja')
            ->has('items')
        );
    }

    public function test_perencanaan_can_verify_and_approve_unit_requisition(): void
    {
        $medikDivision = Division::create([
            'name' => 'Bidang Pelayanan Medik',
            'division_code' => 'MEDIK',
            'group' => 'Pelayanan_Keperawatan',
        ]);

        $farmasiUnit = Unit::create([
            'division_id' => $medikDivision->id,
            'name' => 'Instalasi Farmasi',
            'unit_code' => 'FAR',
        ]);

        $requester = User::factory()->create([
            'name' => 'apt. Siti Rahma, S.Farm',
            'nip' => '198705122011012003',
            'position' => 'Kepala Instalasi Farmasi',
            'role' => 'divisi',
            'division_id' => $medikDivision->id,
            'unit_id' => $farmasiUnit->id,
        ]);

        $rbaAccount = RbaAccount::first();

        $item = Item::create([
            'rba_account_id' => $rbaAccount->id,
            'item_code' => 'FAR-999',
            'name' => 'Obat Uji Coba Risperidone',
            'unit_type' => 'Box',
            'standard_price' => 50000,
        ]);

        $requisition = Requisition::create([
            'requisition_number' => 'REQ-20261010-0001',
            'nomor_surat_unit' => '05/FAR/2026',
            'division_id' => $medikDivision->id,
            'unit_id' => $farmasiUnit->id,
            'user_id' => $requester->id,
            'rba_account_id' => $rbaAccount->id,
            'jenis_belanja' => 'Operasi',
            'sumber_dana' => 'BLUD',
            'sub_kegiatan' => 'Pelayanan dan Penunjang Pelayanan BLUD RS Jiwa Tampan',
            'fiscal_year' => 2027,
            'urgency_reason' => 'Kebutuhan obat mendesak untuk triwulan I TA 2027.',
            'status' => 'Pending_Perencanaan',
            'submission_date' => today(),
            'total_estimated' => 1000000,
        ]);

        $detail = RequisitionDetail::create([
            'requisition_id' => $requisition->id,
            'item_id' => $item->id,
            'item_name' => $item->name,
            'unit_type' => $item->unit_type,
            'quantity_requested' => 20,
            'unit_price' => 50000,
            'subtotal' => 1000000,
        ]);

        // Perencanaan views show page
        $showRes = $this->actingAs($this->perencanaanUser)
            ->get(route('perencanaan.requisitions.show', $requisition->id));
        $showRes->assertOk();
        $showRes->assertInertia(fn (Assert $page) => $page
            ->component('Perencanaan/Requisitions/Show')
            ->where('requisition.fiscal_year', 2027)
            ->where('requisition.sub_kegiatan', 'Pelayanan dan Penunjang Pelayanan BLUD RS Jiwa Tampan')
        );

        // Perencanaan approves with 15 quantity (volume adjusted)
        $approvalPayload = [
            'status' => 'Diproses_Keuangan',
            'notes_perencanaan' => 'Disetujui 15 unit sesuai pagu efisiensi RBA BLUD Farmasi.',
            'items' => [
                [
                    'id' => $detail->id,
                    'quantity_approved' => 15,
                ],
            ],
        ];

        $updateRes = $this->actingAs($this->perencanaanUser)
            ->put(route('perencanaan.requisitions.update', $requisition->id), $approvalPayload);

        $updateRes->assertRedirect(route('perencanaan.requisitions.index'));

        $this->assertDatabaseHas('requisitions', [
            'id' => $requisition->id,
            'status' => 'Diproses_Keuangan',
            'total_approved' => 750000, // 15 * 50,000
            'notes_perencanaan' => 'Disetujui 15 unit sesuai pagu efisiensi RBA BLUD Farmasi.',
        ]);

        $this->assertDatabaseHas('requisition_details', [
            'id' => $detail->id,
            'quantity_approved' => 15,
            'subtotal' => 750000,
        ]);
    }
}
