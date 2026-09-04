<?php

namespace Tests\Feature;

use App\Models\Budget;
use App\Models\Division;
use App\Models\Item;
use App\Models\Requisition;
use App\Models\RequisitionDetail;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class DashboardAndPrintTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_dashboard_receives_analytics(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        Division::create(['name' => 'IGD', 'division_code' => 'IGD-01']);

        $response = $this->actingAs($admin)->get(route('admin.dashboard'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Dashboard')
            ->has('total_users')
            ->has('total_divisions')
        );
    }

    public function test_divisi_dashboard_receives_analytics(): void
    {
        $division = Division::create(['name' => 'Farmasi', 'division_code' => 'FAR-01']);
        $user = User::factory()->create(['role' => 'divisi', 'division_id' => $division->id]);

        Requisition::create([
            'requisition_number' => 'REQ-TEST-001',
            'division_id' => $division->id,
            'user_id' => $user->id,
            'submission_date' => now(),
            'status' => 'Pending_Perencanaan',
        ]);

        $response = $this->actingAs($user)->get(route('divisi.dashboard'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Divisi/Dashboard')
            ->where('total_requests', 1)
            ->where('pending_requests', 1)
            ->where('approved_requests', 0)
        );
    }

    public function test_perencanaan_dashboard_receives_analytics(): void
    {
        $perencanaan = User::factory()->create(['role' => 'perencanaan']);
        Item::create([
            'name' => 'Spuit 5cc',
            'item_code' => 'ITM-001',
            'specification' => 'Spuit 5ml terstandarisasi',
            'unit_type' => 'Box',
            'standard_price' => 25000,
        ]);

        $response = $this->actingAs($perencanaan)->get(route('perencanaan.dashboard'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Perencanaan/Dashboard')
            ->has('total_to_verify')
            ->where('total_items', 1)
        );
    }

    public function test_keuangan_dashboard_receives_analytics(): void
    {
        $keuangan = User::factory()->create(['role' => 'keuangan']);
        Budget::create([
            'account_code' => '5.1.02.01.01.0001',
            'account_name' => 'Belanja Medis Habis Pakai',
            'period_year' => 2026,
            'total_budget' => 10000000,
            'remaining_budget' => 8000000,
        ]);

        $response = $this->actingAs($keuangan)->get(route('keuangan.dashboard'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Keuangan/Dashboard')
            ->where('total_budgets', 1)
            ->where('total_budget_remaining', 8000000)
            ->has('total_processed')
        );
    }

    public function test_requisition_print_page_renders(): void
    {
        $division = Division::create(['name' => 'Laboratorium', 'division_code' => 'LAB-01']);
        $user = User::factory()->create(['role' => 'divisi', 'division_id' => $division->id]);

        $item = Item::create([
            'name' => 'Tabung EDTA',
            'item_code' => 'ITM-002',
            'specification' => 'Tabung vacuum darah EDTA 3ml',
            'unit_type' => 'Pack',
            'standard_price' => 45000,
        ]);

        $requisition = Requisition::create([
            'requisition_number' => 'REQ-TEST-PRINT',
            'division_id' => $division->id,
            'user_id' => $user->id,
            'submission_date' => now(),
            'status' => 'Disetujui_Selesai',
        ]);

        RequisitionDetail::create([
            'requisition_id' => $requisition->id,
            'item_id' => $item->id,
            'quantity_requested' => 2,
            'quantity_approved' => 2,
            'unit_price' => 45000,
            'subtotal' => 90000,
        ]);

        $response = $this->actingAs($user)->get(route('requisitions.print', $requisition->id));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Shared/PrintRequisition')
            ->has('requisition.division')
            ->has('requisition.requisition_details')
        );
    }
}

