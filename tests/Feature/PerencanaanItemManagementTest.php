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

class PerencanaanItemManagementTest extends TestCase
{
    use RefreshDatabase;

    private User $perencanaanUser;
    private Division $perencanaanDivision;
    private RbaAccount $rbaAccount;

    protected function setUp(): void
    {
        parent::setUp();

        $this->perencanaanDivision = Division::create([
            'name' => 'Bagian Perencanaan',
            'division_code' => 'REN',
            'group' => 'Manajemen',
        ]);

        $this->perencanaanUser = User::factory()->create([
            'name' => 'Staf Perencanaan',
            'nip' => '198501012010011001',
            'position' => 'Staf Perencanaan Anggaran',
            'role' => 'perencanaan',
            'division_id' => $this->perencanaanDivision->id,
            'is_active' => true,
        ]);

        $this->rbaAccount = RbaAccount::create([
            'account_code' => '5.1.02.01.01.0024',
            'account_name' => 'Belanja Alat/Bahan untuk Kegiatan Kantor-Alat Tulis Kantor',
            'kategori_belanja' => 'Operasi',
            'sumber_dana' => 'BLUD',
            'total_budget' => 50000000,
            'spent_budget' => 0,
            'remaining_budget' => 50000000,
            'period_year' => 2026,
        ]);
    }

    public function test_perencanaan_user_can_view_items_index_with_rba_accounts(): void
    {
        Item::create([
            'rba_account_id' => $this->rbaAccount->id,
            'item_code' => 'ITM-0001',
            'name' => 'Kertas HVS F4 70gr',
            'specification' => 'Sinar Dunia 500 lembar',
            'unit_type' => 'Rim',
            'standard_price' => 55000,
        ]);

        $response = $this->actingAs($this->perencanaanUser)
            ->get(route('items.index'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Perencanaan/Items/Index')
            ->has('items', 1)
            ->has('rbaAccounts')
            ->has('nextItemCode')
            ->where('items.0.item_code', 'ITM-0001')
            ->where('items.0.rba_account_id', $this->rbaAccount->id)
            ->where('items.0.rba_account.account_code', '5.1.02.01.01.0024')
        );
    }

    public function test_perencanaan_user_can_store_new_item_with_auto_generated_code(): void
    {
        $response = $this->actingAs($this->perencanaanUser)
            ->post(route('items.store'), [
                'rba_account_id' => $this->rbaAccount->id,
                'item_code' => '', // should auto-generate
                'name' => 'Spidol Whiteboard Hitam',
                'specification' => 'Snowman Boardmarker Bullet Tip',
                'unit_type' => 'Pcs',
                'standard_price' => 12500,
            ]);

        $response->assertRedirect(route('items.index'));
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('items', [
            'rba_account_id' => $this->rbaAccount->id,
            'item_code' => 'ITM-0001',
            'name' => 'Spidol Whiteboard Hitam',
            'unit_type' => 'Pcs',
            'standard_price' => 12500,
        ]);
    }

    public function test_perencanaan_user_can_store_new_item_with_custom_code(): void
    {
        $response = $this->actingAs($this->perencanaanUser)
            ->post(route('items.store'), [
                'rba_account_id' => $this->rbaAccount->id,
                'item_code' => 'ATK-CUSTOM-01',
                'name' => 'Buku Ekspedisi',
                'specification' => 'Hard cover 100 lembar',
                'unit_type' => 'Buku',
                'standard_price' => 20000,
            ]);

        $response->assertRedirect(route('items.index'));
        $this->assertDatabaseHas('items', [
            'rba_account_id' => $this->rbaAccount->id,
            'item_code' => 'ATK-CUSTOM-01',
            'name' => 'Buku Ekspedisi',
        ]);
    }

    public function test_store_item_requires_rba_account_and_valid_fields(): void
    {
        $response = $this->actingAs($this->perencanaanUser)
            ->post(route('items.store'), [
                'rba_account_id' => '',
                'item_code' => '',
                'name' => '',
                'unit_type' => '',
                'standard_price' => '',
            ]);

        $response->assertSessionHasErrors(['rba_account_id', 'name', 'unit_type', 'standard_price']);
    }

    public function test_perencanaan_user_can_update_existing_item(): void
    {
        $item = Item::create([
            'rba_account_id' => $this->rbaAccount->id,
            'item_code' => 'ITM-0001',
            'name' => 'Pulpen Gel Hitam',
            'specification' => 'Standard AE7 0.5',
            'unit_type' => 'Pcs',
            'standard_price' => 4000,
        ]);

        $secondAccount = RbaAccount::create([
            'account_code' => '5.1.02.01.01.0025',
            'account_name' => 'Belanja Alat/Bahan untuk Kegiatan Kantor- Kertas dan Cover',
            'kategori_belanja' => 'Operasi',
            'sumber_dana' => 'BLUD',
            'total_budget' => 30000000,
            'spent_budget' => 0,
            'remaining_budget' => 30000000,
            'period_year' => 2026,
        ]);

        $response = $this->actingAs($this->perencanaanUser)
            ->put(route('items.update', $item->id), [
                'rba_account_id' => $secondAccount->id,
                'item_code' => 'ITM-0001',
                'name' => 'Pulpen Gel Hitam 0.5 Box',
                'specification' => 'Isi 12 pcs per box',
                'unit_type' => 'Box',
                'standard_price' => 45000,
            ]);

        $response->assertRedirect(route('items.index'));
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('items', [
            'id' => $item->id,
            'rba_account_id' => $secondAccount->id,
            'name' => 'Pulpen Gel Hitam 0.5 Box',
            'unit_type' => 'Box',
            'standard_price' => 45000,
        ]);
    }

    public function test_cannot_delete_item_linked_to_requisition(): void
    {
        $item = Item::create([
            'rba_account_id' => $this->rbaAccount->id,
            'item_code' => 'ITM-0001',
            'name' => 'Tinta Printer Epson L3110',
            'specification' => 'Original 003 Black',
            'unit_type' => 'Botol',
            'standard_price' => 95000,
        ]);

        $requisition = Requisition::create([
            'requisition_number' => 'USL-2026-0001',
            'user_id' => $this->perencanaanUser->id,
            'division_id' => $this->perencanaanDivision->id,
            'unit_id' => null,
            'rba_account_id' => $this->rbaAccount->id,
            'fiscal_year' => 2026,
            'submission_date' => now()->toDateString(),
            'urgency_reason' => 'Pengadaan Tinta Kantor',
            'total_estimated' => 95000,
            'status' => 'Pending_Perencanaan',
            'jenis_belanja' => 'Operasi',
            'sub_kegiatan' => 'Penyelenggaraan Tata Kelola dan Administrasi BLUD',
        ]);

        RequisitionDetail::create([
            'requisition_id' => $requisition->id,
            'item_id' => $item->id,
            'quantity_requested' => 1,
            'unit_price' => 95000,
            'subtotal' => 95000,
        ]);

        $response = $this->actingAs($this->perencanaanUser)
            ->delete(route('items.destroy', $item->id));

        $response->assertRedirect(route('items.index'));
        $response->assertSessionHas('error');

        $this->assertDatabaseHas('items', [
            'id' => $item->id,
        ]);
    }

    public function test_can_delete_unlinked_item(): void
    {
        $item = Item::create([
            'rba_account_id' => $this->rbaAccount->id,
            'item_code' => 'ITM-0099',
            'name' => 'Item Salah Input',
            'specification' => 'Tester',
            'unit_type' => 'Pcs',
            'standard_price' => 1000,
        ]);

        $response = $this->actingAs($this->perencanaanUser)
            ->delete(route('items.destroy', $item->id));

        $response->assertRedirect(route('items.index'));
        $response->assertSessionHas('success');

        $this->assertDatabaseMissing('items', [
            'id' => $item->id,
        ]);
    }

    public function test_perencanaan_user_can_view_items_with_source_and_origin_unit(): void
    {
        $unit = Unit::create([
            'division_id' => $this->perencanaanDivision->id,
            'name' => 'Instalasi Farmasi',
            'unit_code' => 'FAR',
        ]);

        $item = Item::create([
            'rba_account_id' => $this->rbaAccount->id,
            'item_code' => 'ITM-0050',
            'name' => 'Obat Khusus Usulan',
            'unit_type' => 'Botol',
            'standard_price' => 75000,
            'source' => 'USULAN_UNIT',
            'origin_unit_id' => $unit->id,
        ]);

        $response = $this->actingAs($this->perencanaanUser)
            ->get(route('items.index'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Perencanaan/Items/Index')
            ->has('items', 1)
            ->where('items.0.source', 'USULAN_UNIT')
            ->where('items.0.origin_unit_id', $unit->id)
            ->where('items.0.origin_unit.name', 'Instalasi Farmasi')
        );
    }

    public function test_perencanaan_user_can_verify_item_from_unit_to_become_standard(): void
    {
        $unit = Unit::create([
            'division_id' => $this->perencanaanDivision->id,
            'name' => 'Instalasi Laboratorium',
            'unit_code' => 'LAB',
        ]);

        $item = Item::create([
            'rba_account_id' => $this->rbaAccount->id,
            'item_code' => 'ITM-0077',
            'name' => 'Reagen Darah Khusus',
            'unit_type' => 'Kit',
            'standard_price' => 1200000,
            'source' => 'USULAN_UNIT',
            'origin_unit_id' => $unit->id,
        ]);

        $this->assertEquals('USULAN_UNIT', $item->source);

        $response = $this->actingAs($this->perencanaanUser)
            ->patch(route('items.verify-standard', $item->id));

        $response->assertRedirect(route('items.index'));
        $response->assertSessionHas('success');

        $item->refresh();
        $this->assertEquals('STANDAR', $item->source);
        $this->assertTrue($item->isStandard());
    }
}
