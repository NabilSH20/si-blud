<?php

namespace Tests\Feature;

use App\Models\Budget;
use App\Models\Division;
use App\Models\RbaAccount;
use App\Models\Requisition;
use App\Models\Revenue;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ModalCardIntegrationTest extends TestCase
{
    use RefreshDatabase;

    private User $perencanaanUser;
    private User $keuanganUser;
    private Division $division;
    private Unit $unit;
    private RbaAccount $rbaAccount;

    protected function setUp(): void
    {
        parent::setUp();

        session(['active_year' => 2027]);

        $this->division = Division::create([
            'name' => 'Bidang Penunjang Medik',
            'division_code' => 'PENUNJANG',
            'group' => 'Pelayanan_Keperawatan',
        ]);

        $this->unit = Unit::create([
            'division_id' => $this->division->id,
            'name' => 'Instalasi Farmasi',
            'unit_code' => 'FAR',
        ]);

        $this->rbaAccount = RbaAccount::create([
            'account_code' => '5.1.02.01.0001',
            'account_name' => 'Belanja Bahan Obat-Obatan BLUD',
            'kategori_belanja' => 'Operasi',
            'total_budget' => 50000000,
            'remaining_budget' => 50000000,
            'spent_budget' => 0,
        ]);

        $this->perencanaanUser = User::factory()->create([
            'name' => 'Staf Perencanaan',
            'role' => 'perencanaan',
            'division_id' => $this->division->id,
            'unit_id' => $this->unit->id,
        ]);

        $this->keuanganUser = User::factory()->create([
            'name' => 'Staf Keuangan',
            'role' => 'keuangan',
            'division_id' => $this->division->id,
            'unit_id' => $this->unit->id,
        ]);
    }

    public function test_perencanaan_requisitions_index_supplies_requisition_details_for_modal(): void
    {
        $requisition = Requisition::create([
            'requisition_number' => 'REQ-2027-TEST-01',
            'division_id' => $this->division->id,
            'unit_id' => $this->unit->id,
            'user_id' => $this->perencanaanUser->id,
            'rba_account_id' => $this->rbaAccount->id,
            'status' => 'Pending_Perencanaan',
            'submission_date' => now()->toDateString(),
            'fiscal_year' => 2027,
            'total_estimated' => 15000000,
            'jenis_belanja' => 'Operasi',
        ]);

        $response = $this->actingAs($this->perencanaanUser)
            ->get(route('perencanaan.requisitions.index'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Perencanaan/Requisitions/Index')
            ->has('requisitions', 1)
            ->has('requisitions.0.requisition_details')
            ->has('requisitions.0.rba_account')
        );
    }

    public function test_keuangan_requisitions_index_supplies_budgets_and_requisitions_for_modal_disbursement(): void
    {
        $requisition = Requisition::create([
            'requisition_number' => 'REQ-2027-KEU-01',
            'division_id' => $this->division->id,
            'unit_id' => $this->unit->id,
            'user_id' => $this->keuanganUser->id,
            'rba_account_id' => $this->rbaAccount->id,
            'status' => 'Diproses_Keuangan',
            'submission_date' => now()->toDateString(),
            'fiscal_year' => 2027,
            'total_estimated' => 20000000,
            'jenis_belanja' => 'Operasi',
        ]);

        $response = $this->actingAs($this->keuanganUser)
            ->get(route('keuangan.requisitions.index'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Keuangan/Requisitions/Index')
            ->has('requisitions', 1)
            ->has('budgets')
        );
    }

    public function test_keuangan_budgets_modal_store_and_index(): void
    {
        $payload = [
            'account_code' => '5.2.02.01.9999',
            'account_name' => 'Belanja Modal Alat Kesehatan Uji Coba',
            'period_year' => 2027,
            'total_budget' => 75000000,
        ];

        $response = $this->actingAs($this->keuanganUser)
            ->post(route('budgets.store'), $payload);

        $response->assertRedirect(route('budgets.index'));
        $this->assertDatabaseHas('rba_accounts', [
            'account_code' => '5.2.02.01.9999',
            'account_name' => 'Belanja Modal Alat Kesehatan Uji Coba',
            'total_budget' => 75000000,
            'remaining_budget' => 75000000,
        ]);
    }

    public function test_keuangan_revenues_index_supplies_grouped_sources_and_stores_revenue(): void
    {
        $response = $this->actingAs($this->keuanganUser)
            ->get(route('revenues.index'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Keuangan/Revenues/Index')
            ->has('revenues')
            ->has('grouped_sources')
            ->has('sources')
            ->has('default_date')
        );

        $payload = [
            'source' => 'Pendapatan Pelayanan Rawat Jalan',
            'amount' => 12500000,
            'date' => now()->toDateString(),
            'description' => 'Penerimaan poli jiwa terpadu shift pagi',
        ];

        $storeResponse = $this->actingAs($this->keuanganUser)
            ->post(route('revenues.store'), $payload);

        $storeResponse->assertRedirect(route('revenues.index'));
        $this->assertDatabaseHas('revenues', [
            'source' => 'Pendapatan Pelayanan Rawat Jalan',
            'amount' => 12500000,
            'description' => 'Penerimaan poli jiwa terpadu shift pagi',
        ]);
    }
}
