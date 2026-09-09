<?php

namespace Tests\Feature;

use App\Models\RbaAccount;
use App\Models\RbaExpenseItem;
use App\Models\RbaRevenueItem;
use App\Models\RbaShift;
use App\Models\User;
use Database\Seeders\RbaPergeseran3Seeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class RbaBelanjaPergeseranTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RbaPergeseran3Seeder::class);
    }

    public function test_perencanaan_can_view_rba_shifts_and_matrix_items(): void
    {
        $perencanaan = User::factory()->create(['role' => 'perencanaan']);

        $response = $this->actingAs($perencanaan)->get(route('perencanaan.rba.index'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Perencanaan/RBA/Index')
            ->has('shifts')
            ->has('current_shift')
            ->has('expense_items')
            ->has('revenue_items')
            ->has('summary')
            ->has('revenue_summary')
            ->where('current_shift.shift_name', 'Pergeseran III')
            ->where('current_shift.status', 'Aktif')
        );
    }

    public function test_perencanaan_can_create_new_shift_cloning_baseline(): void
    {
        $perencanaan = User::factory()->create(['role' => 'perencanaan']);

        $response = $this->actingAs($perencanaan)->post(route('perencanaan.rba.shifts.store'), [
            'year' => 2026,
            'shift_name' => 'Pergeseran IV',
            'doc_title' => 'RENCANA BISNIS DAN ANGGARAN PERGESERAN IV',
            'period_month' => 'November 2026',
            'notes' => 'Penyusunan pergeseran akhir tahun 2026',
        ]);

        $newShift = RbaShift::where('shift_name', 'Pergeseran IV')->first();
        $this->assertNotNull($newShift);
        $this->assertEquals('Draft', $newShift->status);
        $this->assertGreaterThan(0, $newShift->expenseItems()->count());
        $this->assertGreaterThan(0, $newShift->revenueItems()->count());

        $response->assertRedirect(route('perencanaan.rba.index', ['shift_id' => $newShift->id]));
    }

    public function test_perencanaan_can_update_expense_item_and_recalculate_headers(): void
    {
        $perencanaan = User::factory()->create(['role' => 'perencanaan']);
        $item = RbaExpenseItem::where('account_code', '1.1.2.1.2')->firstOrFail(); // Belanja obat-obatan

        $response = $this->actingAs($perencanaan)->patch(route('perencanaan.rba.items.update', $item->id), [
            'after_jasa_layanan' => 2500000000,
            'after_hasil_kerjasama' => 0,
            'after_lain_lain_sah' => 0,
            'after_silpa' => 0,
            'after_apbd' => 0,
            'keterangan' => 'Penambahan anggaran kebutuhan obat triwulan IV',
        ]);

        $response->assertRedirect();

        $item->refresh();
        $this->assertEquals(2500000000, (float) $item->after_total);
        $this->assertEquals('Penambahan anggaran kebutuhan obat triwulan IV', $item->keterangan);

        // Verify parent 1.1.2.1 is updated
        $header1121 = RbaExpenseItem::where('account_code', '1.1.2.1')->firstOrFail();
        $this->assertGreaterThan(0, (float) $header1121->after_total);
    }

    public function test_perencanaan_can_update_revenue_item_and_recalculate_headers(): void
    {
        $perencanaan = User::factory()->create(['role' => 'perencanaan']);
        // Find leaf revenue item for Rawat Jalan
        $revItem = RbaRevenueItem::where('item_name', 'Pendapatan Pelayanan Rawat Jalan')->firstOrFail();

        $response = $this->actingAs($perencanaan)->patch(route('perencanaan.rba.revenue-items.update', $revItem->id), [
            'after_amount' => 6000000000, // Rp 6 Milyar
        ]);

        $response->assertRedirect();

        $revItem->refresh();
        $this->assertEquals(6000000000, (float) $revItem->after_amount);

        // Verify root header '0' total reflects the update
        $rootHeader = RbaRevenueItem::where('item_code', '0')->firstOrFail();
        $this->assertGreaterThan(0, (float) $rootHeader->after_amount);
    }

    public function test_perencanaan_can_activate_shift_and_sync_to_budgets(): void
    {
        $perencanaan = User::factory()->create(['role' => 'perencanaan']);
        $shift = RbaShift::where('shift_name', 'Pergeseran II')->firstOrFail();

        $response = $this->actingAs($perencanaan)->patch(route('perencanaan.rba.activate', $shift->id));

        $response->assertRedirect(route('perencanaan.rba.index', ['shift_id' => $shift->id]));

        $shift->refresh();
        $this->assertEquals('Aktif', $shift->status);

        // Other shifts set to Arsip
        $shift3 = RbaShift::where('shift_name', 'Pergeseran III')->firstOrFail();
        $this->assertEquals('Arsip', $shift3->status);
    }

    public function test_perencanaan_can_view_print_belanja_landscape(): void
    {
        $perencanaan = User::factory()->create(['role' => 'perencanaan']);

        $response = $this->actingAs($perencanaan)->get(route('perencanaan.rba.print-belanja'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Perencanaan/RBA/PrintBelanja')
            ->has('shift')
            ->has('items')
        );
    }

    public function test_perencanaan_can_view_print_pendapatan(): void
    {
        $perencanaan = User::factory()->create(['role' => 'perencanaan']);

        $response = $this->actingAs($perencanaan)->get(route('perencanaan.rba.print-pendapatan'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Perencanaan/RBA/PrintPendapatan')
            ->has('shift')
            ->has('items')
        );
    }
}
