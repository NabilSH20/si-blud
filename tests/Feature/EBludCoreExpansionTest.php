<?php

namespace Tests\Feature;

use App\Models\Budget;
use App\Models\RbaRevenueItem;
use App\Models\RbaShift;
use App\Models\Revenue;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class EBludCoreExpansionTest extends TestCase
{
    use RefreshDatabase;

    public function test_keuangan_can_view_revenues_index(): void
    {
        $keuangan = User::factory()->create(['role' => 'keuangan']);

        Revenue::create([
            'revenue_number' => 'REV-20260903-0001',
            'source' => 'Instalasi Gawat Darurat (IGD)',
            'amount' => 15000000,
            'date' => '2026-09-03',
            'description' => 'Penerimaan harian IGD',
        ]);

        $response = $this->actingAs($keuangan)->get(route('revenues.index'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Keuangan/Revenues/Index')
            ->has('revenues', 1)
            ->where('stats.total_revenue', 15000000)
        );
    }

    public function test_keuangan_can_store_revenue(): void
    {
        $keuangan = User::factory()->create(['role' => 'keuangan']);

        $response = $this->actingAs($keuangan)->post(route('revenues.store'), [
            'source' => 'Pendapatan Pelayanan Farmasi',
            'amount' => 25000000,
            'date' => '2026-09-03',
            'description' => 'Penjualan obat rawat jalan',
        ]);

        $response->assertRedirect(route('revenues.index'));
        $this->assertDatabaseHas('revenues', [
            'source' => 'Pendapatan Pelayanan Farmasi',
            'amount' => 25000000,
        ]);
    }

    public function test_keuangan_can_destroy_revenue(): void
    {
        $keuangan = User::factory()->create(['role' => 'keuangan']);

        $revenue = Revenue::create([
            'revenue_number' => 'REV-20260903-0001',
            'source' => 'Pendapatan Pelayanan Rawat Jalan',
            'amount' => 5000000,
            'date' => '2026-09-03',
        ]);

        $response = $this->actingAs($keuangan)->delete(route('revenues.destroy', $revenue->id));

        $response->assertRedirect(route('revenues.index'));
        $this->assertDatabaseMissing('revenues', ['id' => $revenue->id]);
    }

    public function test_keuangan_can_view_surplus_deficit_report_and_print(): void
    {
        $keuangan = User::factory()->create(['role' => 'keuangan']);

        Revenue::create([
            'revenue_number' => 'REV-20260903-0001',
            'source' => 'Instalasi Gawat Darurat (IGD)',
            'amount' => 50000000,
            'date' => '2026-09-03',
        ]);

        Budget::create([
            'account_code' => '5',
            'account_name' => 'Belanja ATK',
            'period_year' => 2026,
            'total_budget' => 20000000,
            'remaining_budget' => 15000000, // spent = 5.000.000
        ]);

        // RequisitionDetail is empty in this test, so total_expense should be 0,
        // while budget_ledger_expense is 5000000, triggering discrepancy flag.

        $response = $this->actingAs($keuangan)->get(route('reports.surplus-deficit'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Keuangan/Reports/SurplusDeficit')
            ->where('summary.total_revenue', 50000000)
            ->where('summary.total_expense', 0) // Changed to 0 because official expense comes from RequisitionDetail
            ->where('summary.surplus_deficit', 50000000)
            ->where('summary.is_surplus', true)
            ->where('summary.has_discrepancy', true)
            ->where('summary.discrepancy_amount', 5000000)
        );

        $printResponse = $this->actingAs($keuangan)->get(route('reports.surplus-deficit.print'));
        $printResponse->assertOk();
        $printResponse->assertInertia(fn (Assert $page) => $page
            ->component('Shared/PrintSurplusDeficit')
            ->where('summary.surplus_deficit', 50000000)
            ->where('summary.has_discrepancy', true)
        );
    }

    public function test_surplus_deficit_calculates_target_revenue_from_category_sums(): void
    {
        $keuangan = User::factory()->create(['role' => 'keuangan']);

        $shift = RbaShift::create([
            'year' => 2026,
            'shift_name' => 'Murni',
            'status' => 'Aktif',
            'doc_title' => 'DPA 2026',
        ]);

        // Instead of a single item_code=0, we mock categories
        RbaRevenueItem::create([
            'rba_shift_id' => $shift->id,
            'item_code' => '4',
            'item_name' => 'Pendapatan BLUD',
            'after_amount' => 150000000,
        ]);

        RbaRevenueItem::create([
            'rba_shift_id' => $shift->id,
            'item_code' => '5',
            'item_name' => 'Pendapatan Lain-lain',
            'after_amount' => 50000000,
        ]);

        $response = $this->actingAs($keuangan)->get(route('reports.surplus-deficit'));
        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Keuangan/Reports/SurplusDeficit')
            ->where('summary.target_revenue', 200000000)
        );
    }
}
