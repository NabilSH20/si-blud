<?php

namespace Tests\Feature;

use App\Models\Division;
use App\Models\FiscalYear;
use App\Models\RbaAccount;
use App\Models\RbaShift;
use App\Models\Requisition;
use App\Models\RequisitionDetail;
use App\Models\Revenue;
use App\Models\RevenueTarget;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Schema;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class RevenueWorkflowAndCleanupTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        FiscalYear::create([
            'year' => 2027,
            'name' => 'Tahun Anggaran 2027',
            'is_active' => true,
            'is_default' => true,
            'is_locked' => false,
        ]);
    }

    public function test_keuangan_requisitions_route_is_completely_removed(): void
    {
        $keuangan = User::factory()->create(['role' => 'keuangan']);

        $response = $this->actingAs($keuangan)->get('/keuangan/requisitions');
        $response->assertNotFound();
    }

    public function test_requisitions_table_does_not_have_legacy_keuangan_columns(): void
    {
        $this->assertFalse(Schema::hasColumn('requisitions', 'approved_by_keuangan_id'));
        $this->assertFalse(Schema::hasColumn('requisitions', 'sp2d_number'));
        $this->assertFalse(Schema::hasColumn('requisitions', 'receipt_number'));
        $this->assertFalse(Schema::hasColumn('requisitions', 'notes_keuangan'));
        $this->assertFalse(Schema::hasColumn('requisitions', 'approved_keuangan_at'));
    }

    public function test_unit_and_perencanaan_approval_flow_acc_final(): void
    {
        $division = Division::create([
            'division_code' => 'DIV-01',
            'name' => 'Bidang Pelayanan Medik',
        ]);

        $perencanaan = User::factory()->create(['role' => 'perencanaan', 'division_id' => $division->id]);
        $unitUser = User::factory()->create(['role' => 'divisi', 'division_id' => $division->id]);

        $rbaShift = RbaShift::create([
            'shift_name' => 'RBA Murni 2027',
            'status' => 'Aktif',
            'year' => 2027,
        ]);

        $account = RbaAccount::create([
            'account_code' => '5.1.02.01.01.0024',
            'account_name' => 'Belanja Alat Tulis Kantor',
            'kategori_belanja' => 'Operasional',
            'total_budget' => 50000000,
            'spent_budget' => 0,
            'remaining_budget' => 50000000,
            'year' => 2027,
            'period_year' => 2027,
        ]);

        $requisition = Requisition::create([
            'requisition_number' => 'REQ-20270101-0001',
            'user_id' => $unitUser->id,
            'division_id' => $division->id,
            'submission_date' => '2027-01-01',
            'status' => 'Pending_Perencanaan',
            'budget_year' => 2027,
            'rba_account_id' => $account->id,
            'title' => 'Pengadaan ATK Pelayanan',
            'description' => 'Kebutuhan ATK Ruang IGD',
            'total_amount' => 5000000,
        ]);

        $detail = RequisitionDetail::create([
            'requisition_id' => $requisition->id,
            'item_name' => 'Kertas A4 80gr',
            'quantity_requested' => 10,
            'unit_type' => 'Rim',
            'unit_price' => 500000,
            'subtotal' => 5000000,
        ]);

        // Perencanaan memverifikasi dan menyetujui -> ACC Final
        $response = $this->actingAs($perencanaan)->put(route('perencanaan.requisitions.update', $requisition->id), [
            'status' => 'Disetujui',
            'rba_account_id' => $account->id,
            'notes_perencanaan' => 'Disetujui untuk operasional IGD',
            'items' => [
                [
                    'id' => $detail->id,
                    'quantity_approved' => 10,
                ],
            ],
        ]);

        $response->assertRedirect();
        $requisition->refresh();
        $account->refresh();

        // Status langsung 'Disetujui' (ACC Final)
        $this->assertEquals('Disetujui', $requisition->status);
        $this->assertEquals($perencanaan->id, $requisition->verified_by_perencanaan_id);
        $this->assertNotNull($requisition->verified_perencanaan_at);

        // Pagu rekening RBA berkurang
        $this->assertEquals(5000000, (float) $account->spent_budget);
        $this->assertEquals(45000000, (float) $account->remaining_budget);
    }

    public function test_keuangan_can_set_revenue_targets(): void
    {
        $keuangan = User::factory()->create(['role' => 'keuangan']);

        $response = $this->actingAs($keuangan)->post(route('revenues.targets.store'), [
            'fiscal_year' => 2027,
            'targets' => [
                [
                    'source_name' => 'Pendapatan Pelayanan Gawat Darurat',
                    'category' => 'Jasa Layanan',
                    'target_yearly' => 135195000,
                    'target_weekly' => 2599903,
                    'target_jan' => 11266250,
                    'target_feb' => 11266250,
                    'target_mar' => 11266250,
                    'target_apr' => 11266250,
                    'target_mei' => 11266250,
                    'target_jun' => 11266250,
                    'target_jul' => 11266250,
                    'target_agu' => 11266250,
                    'target_sep' => 11266250,
                    'target_okt' => 11266250,
                    'target_nov' => 11266250,
                    'target_des' => 11266250,
                ],
            ],
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('revenue_targets', [
            'fiscal_year' => 2027,
            'source_name' => 'Pendapatan Pelayanan Gawat Darurat',
            'target_yearly' => 135195000,
        ]);
    }

    public function test_keuangan_can_view_12_month_revenue_matrix(): void
    {
        $keuangan = User::factory()->create(['role' => 'keuangan']);

        RevenueTarget::create([
            'fiscal_year' => 2027,
            'category' => 'Jasa Layanan',
            'source_name' => 'Pendapatan Pelayanan Gawat Darurat',
            'target_yearly' => 120000000,
            'target_weekly' => 2307692,
        ]);

        Revenue::create([
            'revenue_number' => 'REV-20270115-0001',
            'source' => 'Pendapatan Pelayanan Gawat Darurat',
            'amount' => 10000000,
            'date' => '2027-01-15',
            'description' => 'Penerimaan IGD Januari',
        ]);

        $response = $this->actingAs($keuangan)->get(route('reports.revenue-monthly-matrix', ['year' => 2027]));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Keuangan/Reports/RevenueMonthlyMatrix')
            ->where('selected_year', 2027)
            ->has('matrix')
            ->where('grand_total.total_realisasi', 10000000)
            ->where('grand_total.target_yearly', 120000000)
        );

        $printResponse = $this->actingAs($keuangan)->get(route('reports.revenue-monthly-matrix.print', ['year' => 2027]));
        $printResponse->assertOk();
        $printResponse->assertInertia(fn (Assert $page) => $page
            ->component('Shared/PrintRevenueMonthlyMatrix')
            ->where('selected_year', 2027)
        );
    }

    public function test_surplus_deficit_report_computes_from_approved_requisitions(): void
    {
        $division = Division::create([
            'division_code' => 'DIV-02',
            'name' => 'Bidang Penunjang Medik',
        ]);

        $keuangan = User::factory()->create(['role' => 'keuangan']);
        $unitUser = User::factory()->create(['role' => 'divisi', 'division_id' => $division->id]);

        // Revenue
        Revenue::create([
            'revenue_number' => 'REV-20270115-0002',
            'source' => 'Pendapatan Pelayanan Rawat Jalan',
            'amount' => 50000000,
            'date' => '2027-01-15',
        ]);

        // Approved requisition (ACC Final Perencanaan)
        $requisition = Requisition::create([
            'requisition_number' => 'REQ-20270115-0001',
            'user_id' => $unitUser->id,
            'division_id' => $division->id,
            'submission_date' => '2027-01-15',
            'status' => 'Disetujui',
            'budget_year' => 2027,
            'title' => 'Pengadaan Obat',
            'total_amount' => 20000000,
        ]);

        RequisitionDetail::create([
            'requisition_id' => $requisition->id,
            'item_name' => 'Obat A',
            'quantity_requested' => 100,
            'unit_type' => 'Box',
            'unit_price' => 200000,
            'subtotal' => 20000000,
        ]);

        session(['active_year' => 2027]);

        $response = $this->actingAs($keuangan)->get(route('reports.surplus-deficit'));
        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Keuangan/Reports/SurplusDeficit')
            ->where('summary.total_revenue', 50000000)
            ->where('summary.total_expense', 20000000)
            ->where('summary.surplus_deficit', 30000000)
            ->where('summary.is_surplus', true)
        );
    }

    public function test_superadmin_monitoring_finance_executes_without_column_errors(): void
    {
        $superAdmin = User::factory()->superAdmin()->create();
        $division = Division::create(['division_code' => 'DIV-02', 'name' => 'Bidang Keperawatan']);
        $unitUser = User::factory()->create(['role' => 'divisi', 'division_id' => $division->id]);

        $requisition = Requisition::create([
            'requisition_number' => 'REQ-20270120-0002',
            'user_id' => $unitUser->id,
            'division_id' => $division->id,
            'submission_date' => '2027-01-20',
            'status' => 'Disetujui',
            'budget_year' => 2027,
            'verified_perencanaan_at' => now(),
            'total_estimated' => 1000000,
            'total_approved' => 1000000,
        ]);

        session(['active_year' => 2027]);

        $response = $this->actingAs($superAdmin)->get('/super-admin/monitoring/finance');
        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('SuperAdmin/Monitoring/Finance')
            ->has('disbursed_requisitions')
            ->where('disbursed_requisitions.0.id', $requisition->id)
        );
    }

    public function test_keuangan_dashboard_loads_without_error(): void
    {
        $keuangan = User::factory()->create(['role' => 'keuangan']);
        session(['active_year' => 2027]);

        $response = $this->actingAs($keuangan)->get(route('keuangan.dashboard'));
        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Keuangan/Dashboard')
            ->has('total_revenue')
            ->has('total_processed')
        );
    }

    public function test_user_deletion_does_not_fail_with_approved_by_keuangan_column_error(): void
    {
        $superAdmin = User::factory()->superAdmin()->create();
        $admin = User::factory()->create(['role' => 'admin']);
        $targetUser1 = User::factory()->create(['role' => 'keuangan']);
        $targetUser2 = User::factory()->create(['role' => 'perencanaan']);

        $response1 = $this->actingAs($admin)->delete(route('users.destroy', $targetUser1->id));
        $response1->assertRedirect();
        $this->assertDatabaseMissing('users', ['id' => $targetUser1->id]);

        $response2 = $this->actingAs($superAdmin)->delete(route('superadmin.users.destroy', $targetUser2->id));
        $response2->assertRedirect();
        $this->assertDatabaseMissing('users', ['id' => $targetUser2->id]);
    }

    public function test_divisi_cannot_update_approved_requisition_and_gets_perencanaan_message(): void
    {
        $division = Division::create(['division_code' => 'DIV-03', 'name' => 'Bidang Penunjang']);
        $unitUser = User::factory()->create(['role' => 'divisi', 'division_id' => $division->id]);

        $requisition = Requisition::create([
            'requisition_number' => 'REQ-20270201-0003',
            'user_id' => $unitUser->id,
            'division_id' => $division->id,
            'submission_date' => '2027-02-01',
            'status' => 'Disetujui',
            'budget_year' => 2027,
            'total_estimated' => 500000,
            'total_approved' => 500000,
        ]);

        $response = $this->actingAs($unitUser)->put(route('requisitions.update', $requisition->id), [
            'sub_kegiatan' => 'Ubah Sub Kegiatan',
            'items' => [
                ['name' => 'Test', 'unit_type' => 'Pcs', 'quantity' => 1, 'unit_price' => 1000],
            ],
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('error', 'Usulan belanja tidak dapat diubah karena telah disetujui atau disahkan oleh Tim Perencanaan.');
    }

    public function test_divisi_and_perencanaan_status_disetujui_filter_routes_load(): void
    {
        $division = Division::create(['division_code' => 'DIV-04', 'name' => 'Bidang Medik']);
        $unitUser = User::factory()->create(['role' => 'divisi', 'division_id' => $division->id]);
        $perencanaan = User::factory()->create(['role' => 'perencanaan', 'division_id' => $division->id]);

        Requisition::create([
            'requisition_number' => 'REQ-20270210-0004',
            'user_id' => $unitUser->id,
            'division_id' => $division->id,
            'submission_date' => '2027-02-10',
            'status' => 'Disetujui',
            'budget_year' => 2027,
            'total_estimated' => 750000,
            'total_approved' => 750000,
        ]);

        session(['active_year' => 2027]);

        $divisiResp = $this->actingAs($unitUser)->get(route('requisitions.index', ['status' => 'Disetujui']));
        $divisiResp->assertOk();
        $divisiResp->assertInertia(fn (Assert $page) => $page
            ->component('Divisi/Requisitions/Index')
            ->has('requisitions', 1)
            ->where('requisitions.0.status', 'Disetujui')
        );

        $perencanaanResp = $this->actingAs($perencanaan)->get(route('perencanaan.requisitions.index', ['status' => 'Disetujui']));
        $perencanaanResp->assertOk();
        $perencanaanResp->assertInertia(fn (Assert $page) => $page
            ->component('Perencanaan/Requisitions/Index')
            ->has('requisitions', 1)
            ->where('requisitions.0.status', 'Disetujui')
        );
    }
}
