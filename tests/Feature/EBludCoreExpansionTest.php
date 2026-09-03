<?php

namespace Tests\Feature;

use App\Models\Budget;
use App\Models\RbaDraft;
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
            'source' => 'Instalasi Farmasi & Apotek',
            'amount' => 25000000,
            'date' => '2026-09-03',
            'description' => 'Penjualan obat rawat jalan',
        ]);

        $response->assertRedirect(route('revenues.index'));
        $this->assertDatabaseHas('revenues', [
            'source' => 'Instalasi Farmasi & Apotek',
            'amount' => 25000000,
        ]);
    }

    public function test_keuangan_can_destroy_revenue(): void
    {
        $keuangan = User::factory()->create(['role' => 'keuangan']);

        $revenue = Revenue::create([
            'revenue_number' => 'REV-20260903-0001',
            'source' => 'Poliklinik Jiwa Terpadu',
            'amount' => 5000000,
            'date' => '2026-09-03',
        ]);

        $response = $this->actingAs($keuangan)->delete(route('revenues.destroy', $revenue->id));

        $response->assertRedirect(route('revenues.index'));
        $this->assertDatabaseMissing('revenues', ['id' => $revenue->id]);
    }

    public function test_perencanaan_can_view_rba_index_and_create(): void
    {
        $perencanaan = User::factory()->create(['role' => 'perencanaan']);

        RbaDraft::create([
            'year' => 2026,
            'target_revenue' => 300000000,
            'planned_expense' => 250000000,
            'status' => 'Draft',
        ]);

        $response = $this->actingAs($perencanaan)->get(route('perencanaan.rba.index'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Perencanaan/RBA/Index')
            ->has('rbas', 1)
        );
    }

    public function test_perencanaan_can_store_and_sahkan_rba(): void
    {
        $perencanaan = User::factory()->create(['role' => 'perencanaan']);

        $response = $this->actingAs($perencanaan)->post(route('perencanaan.rba.store'), [
            'year' => 2026,
            'target_revenue' => 350000000,
            'planned_expense' => 275000000,
            'notes' => 'Plafon tahun 2026',
        ]);

        $response->assertRedirect(route('perencanaan.rba.index'));

        $rba = RbaDraft::where('year', 2026)->first();
        $this->assertNotNull($rba);
        $this->assertEquals('Draft', $rba->status);

        // Sahkan RBA
        $sahkanResponse = $this->actingAs($perencanaan)->patch(route('perencanaan.rba.sahkan', $rba->id));
        $sahkanResponse->assertRedirect(route('perencanaan.rba.index'));

        $rba->refresh();
        $this->assertEquals('Disahkan', $rba->status);
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
            'account_code' => '5.1.02.01.01.0024',
            'account_name' => 'Belanja ATK',
            'period_year' => 2026,
            'total_budget' => 20000000,
            'remaining_budget' => 15000000, // spent = 5.000.000
        ]);

        $response = $this->actingAs($keuangan)->get(route('reports.surplus-deficit'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Keuangan/Reports/SurplusDeficit')
            ->where('summary.total_revenue', 50000000)
            ->where('summary.total_expense', 5000000)
            ->where('summary.surplus_deficit', 45000000)
            ->where('summary.is_surplus', true)
        );

        $printResponse = $this->actingAs($keuangan)->get(route('reports.surplus-deficit.print'));
        $printResponse->assertOk();
        $printResponse->assertInertia(fn (Assert $page) => $page
            ->component('Shared/PrintSurplusDeficit')
            ->where('summary.surplus_deficit', 45000000)
        );
    }
}

