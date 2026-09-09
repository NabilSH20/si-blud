<?php

namespace Tests\Feature;

use App\Models\Revenue;
use App\Models\User;
use Database\Seeders\RbaPergeseran3Seeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class RevenuePosSyncTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RbaPergeseran3Seeder::class);
    }

    public function test_keuangan_can_view_revenue_create_form_with_grouped_sources(): void
    {
        $keuangan = User::factory()->create(['role' => 'keuangan']);

        $response = $this->actingAs($keuangan)->get(route('revenues.create'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Keuangan/Revenues/Create')
            ->has('grouped_sources')
            ->has('sources')
            ->where('sources.0', 'Pendapatan Pelayanan Gawat Darurat')
        );
    }

    public function test_keuangan_can_record_revenue_and_see_category_in_index(): void
    {
        $keuangan = User::factory()->create(['role' => 'keuangan']);

        $response = $this->actingAs($keuangan)->post(route('revenues.store'), [
            'source' => 'Pendapatan Pelayanan Rawat Jalan',
            'amount' => 75000000,
            'date' => '2026-09-04',
            'description' => 'Penerimaan rawat jalan poli spesialis kejiwaan',
        ]);

        $response->assertRedirect(route('revenues.index'));

        $revenue = Revenue::where('source', 'Pendapatan Pelayanan Rawat Jalan')->first();
        $this->assertNotNull($revenue);
        $this->assertEquals(75000000, (float) $revenue->amount);

        // Verify index view has categorized items
        $indexResponse = $this->actingAs($keuangan)->get(route('revenues.index'));
        $indexResponse->assertOk();
        $indexResponse->assertInertia(fn (Assert $page) => $page
            ->component('Keuangan/Revenues/Index')
            ->has('revenues', 1)
            ->where('revenues.0.category', 'Jasa Layanan')
            ->where('stats.jasa_layanan', 75000000)
            ->where('stats.total_revenue', 75000000)
        );
    }

    public function test_recorded_revenue_aggregates_into_rba_tab_pendapatan(): void
    {
        $keuangan = User::factory()->create(['role' => 'keuangan']);
        $perencanaan = User::factory()->create(['role' => 'perencanaan']);

        // Record 1: Rawat Inap (Jasa Layanan) Rp 100.000.000
        $res1 = $this->actingAs($keuangan)->post(route('revenues.store'), [
            'source' => 'Pendapatan Pelayanan Rawat Inap',
            'amount' => 100000000,
            'date' => '2026-09-04',
            'description' => 'Penerimaan rawat inap',
        ]);
        $res1->assertRedirect(route('revenues.index'));

        // Record 2: Hasil Kerjasama Diklat Rp 25.000.000
        $res2 = $this->actingAs($keuangan)->post(route('revenues.store'), [
            'source' => 'Hasil Kerjasama Diklat',
            'amount' => 25000000,
            'date' => '2026-09-04',
            'description' => 'Penerimaan magang mahasiswa kedokteran',
        ]);
        $res2->assertRedirect(route('revenues.index'));

        $this->assertEquals(2, Revenue::count());

        // Check Perencanaan RBA Index
        $response = $this->actingAs($perencanaan)->get(route('perencanaan.rba.index'));
        $response->assertOk();

        $response->assertInertia(fn (Assert $page) => $page
            ->component('Perencanaan/RBA/Index')
            ->where('revenue_summary.realized_total', 125000000)
            ->where('revenue_summary.realized_jasa_layanan', 100000000)
            ->where('revenue_summary.realized_hasil_kerjasama', 25000000)
        );
    }
}
