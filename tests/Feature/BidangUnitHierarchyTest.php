<?php

namespace Tests\Feature;

use App\Models\Division;
use App\Models\Item;
use App\Models\RbaAccount;
use App\Models\Requisition;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class BidangUnitHierarchyTest extends TestCase
{
    use RefreshDatabase;

    private Division $pelayanan;
    private Division $keperawatan;
    private Unit $igd;
    private Unit $rawatJalan;
    private Unit $upip;
    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->pelayanan = Division::create([
            'name' => 'Bidang Pelayanan',
            'division_code' => 'YAN',
            'group' => 'Pelayanan_Keperawatan',
        ]);

        $this->keperawatan = Division::create([
            'name' => 'Bidang Keperawatan',
            'division_code' => 'RAWAT',
            'group' => 'Pelayanan_Keperawatan',
        ]);

        $this->igd = Unit::create([
            'division_id' => $this->pelayanan->id,
            'name' => 'Instalasi Gawat Darurat (IGD)',
            'unit_code' => 'IGD',
            'description' => 'Unit IGD',
        ]);

        $this->rawatJalan = Unit::create([
            'division_id' => $this->pelayanan->id,
            'name' => 'Instalasi Rawat Jalan',
            'unit_code' => 'IRJ',
            'description' => 'Unit IRJ',
        ]);

        $this->upip = Unit::create([
            'division_id' => $this->keperawatan->id,
            'name' => 'Unit Perawatan Intensif Psikiatri (UPIP)',
            'unit_code' => 'UPIP',
            'description' => 'Unit UPIP',
        ]);

        $this->admin = User::factory()->create([
            'role' => 'admin',
        ]);
    }

    public function test_admin_can_view_users_with_bidang_and_unit(): void
    {
        User::factory()->create([
            'name' => 'dr. Staf IGD',
            'role' => 'divisi',
            'division_id' => $this->pelayanan->id,
            'unit_id' => $this->igd->id,
        ]);

        $response = $this->actingAs($this->admin)->get(route('users.index'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Users/Index')
            ->has('users')
            ->has('divisions', 2)
            ->has('divisions.0.units')
        );
    }

    public function test_admin_can_view_create_user_page_with_divisions_and_units(): void
    {
        $response = $this->actingAs($this->admin)->get(route('users.create'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Users/Create')
            ->has('divisions', 2)
            ->has('divisions.0.units')
        );
    }

    public function test_admin_can_create_divisi_user_with_bidang_and_unit(): void
    {
        $userData = [
            'name' => 'Ns. Budi Santoso',
            'email' => 'budi.igd@rsj.com',
            'password' => 'password123',
            'role' => 'divisi',
            'division_id' => $this->pelayanan->id,
            'unit_id' => $this->igd->id,
        ];

        $response = $this->actingAs($this->admin)->post(route('users.store'), $userData);

        $response->assertRedirect(route('users.index'));
        $this->assertDatabaseHas('users', [
            'name' => 'Ns. Budi Santoso',
            'email' => 'budi.igd@rsj.com',
            'role' => 'divisi',
            'division_id' => $this->pelayanan->id,
            'unit_id' => $this->igd->id,
        ]);
    }

    public function test_divisi_role_requires_division_and_unit(): void
    {
        $userData = [
            'name' => 'Staf Tanpa Unit',
            'email' => 'tanpaunit@rsj.com',
            'password' => 'password123',
            'role' => 'divisi',
            'division_id' => '',
            'unit_id' => '',
        ];

        $response = $this->actingAs($this->admin)->post(route('users.store'), $userData);

        $response->assertSessionHasErrors(['division_id', 'unit_id']);
    }

    public function test_divisi_unit_must_belong_to_selected_division(): void
    {
        // Try selecting Pelayanan division, but with UPIP unit (which belongs to Keperawatan)
        $userData = [
            'name' => 'Mismatch Unit User',
            'email' => 'mismatch@rsj.com',
            'password' => 'password123',
            'role' => 'divisi',
            'division_id' => $this->pelayanan->id,
            'unit_id' => $this->upip->id,
        ];

        $response = $this->actingAs($this->admin)->post(route('users.store'), $userData);

        $response->assertSessionHasErrors(['unit_id']);
    }

    public function test_admin_can_update_user_unit(): void
    {
        $user = User::factory()->create([
            'role' => 'divisi',
            'division_id' => $this->pelayanan->id,
            'unit_id' => $this->igd->id,
        ]);

        $updateData = [
            'name' => 'dr. Staf Pindah Rawat Jalan',
            'email' => $user->email,
            'role' => 'divisi',
            'division_id' => $this->pelayanan->id,
            'unit_id' => $this->rawatJalan->id,
        ];

        $response = $this->actingAs($this->admin)->put(route('users.update', $user->id), $updateData);

        $response->assertRedirect(route('users.index'));
        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'name' => 'dr. Staf Pindah Rawat Jalan',
            'unit_id' => $this->rawatJalan->id,
        ]);
    }

    public function test_requisition_automatically_records_user_unit_id(): void
    {
        $requester = User::factory()->create([
            'role' => 'divisi',
            'division_id' => $this->pelayanan->id,
            'unit_id' => $this->igd->id,
        ]);

        $rbaAccount = RbaAccount::create([
            'account_code' => '5.1.02.01.01.0001',
            'account_name' => 'Belanja Bahan Medis',
            'kategori_belanja' => 'Operasi',
            'sumber_dana' => 'BLUD',
            'total_budget' => 100000000,
            'remaining_budget' => 100000000,
            'period_year' => 2026,
        ]);

        $item = Item::create([
            'rba_account_id' => $rbaAccount->id,
            'item_code' => 'MED-001',
            'name' => 'Kasa Steril 10x10',
            'specification' => 'Steril Box',
            'unit_type' => 'Box',
            'standard_price' => 25000,
        ]);

        $payload = [
            'rba_account_id' => $rbaAccount->id,
            'jenis_belanja' => 'Operasi',
            'sub_kegiatan' => 'Pelayanan dan Penunjang Pelayanan BLUD RS Jiwa Tampan',
            'fiscal_year' => 2027,
            'nomor_surat_unit' => '001/IGD/XI/2026',
            'urgency_reason' => 'Kebutuhan kassa steril IGD untuk pelayanan medis darurat TA 2027.',
            'items' => [
                [
                    'item_id' => $item->id,
                    'quantity' => 10,
                ],
            ],
        ];

        $response = $this->actingAs($requester)->post(route('requisitions.store'), $payload);

        $response->assertRedirect(route('requisitions.index'));

        $this->assertDatabaseHas('requisitions', [
            'user_id' => $requester->id,
            'division_id' => $this->pelayanan->id,
            'unit_id' => $this->igd->id,
            'status' => 'Pending_Perencanaan',
        ]);

        $requisition = Requisition::where('user_id', $requester->id)->first();
        $this->assertNotNull($requisition->unit);
        $this->assertEquals('Instalasi Gawat Darurat (IGD)', $requisition->unit->name);
    }
}