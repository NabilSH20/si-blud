<?php

namespace Tests\Feature;

use App\Models\Division;
use App\Models\Item;
use App\Models\RbaAccount;
use App\Models\RbaExpenseItem;
use App\Models\RbaRevenueItem;
use App\Models\RbaShift;
use App\Models\Requisition;
use App\Models\Revenue;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class MultiYearRevenueAndRbaShiftEquilibriumTest extends TestCase
{
    use RefreshDatabase;

    private User $divisiUser;

    private User $perencanaanUser;

    private User $keuanganUser;

    private Division $division;

    private Unit $unit;

    protected function setUp(): void
    {
        parent::setUp();

        $this->division = Division::create([
            'name' => 'Bidang Pelayanan Medik',
            'division_code' => 'MEDIK',
            'group' => 'Pelayanan_Keperawatan',
        ]);

        $this->unit = Unit::create([
            'division_id' => $this->division->id,
            'name' => 'Instalasi Farmasi & Apotek',
            'unit_code' => 'FARMASI',
            'description' => 'Instalasi Farmasi',
        ]);

        $this->divisiUser = User::factory()->create([
            'name' => 'Staf Farmasi',
            'role' => 'divisi',
            'division_id' => $this->division->id,
            'unit_id' => $this->unit->id,
        ]);

        $this->perencanaanUser = User::factory()->create([
            'name' => 'Staf Perencanaan',
            'role' => 'perencanaan',
        ]);

        $this->keuanganUser = User::factory()->create([
            'name' => 'Staf Keuangan',
            'role' => 'keuangan',
        ]);
    }

    public function test_requisition_stored_and_updated_with_distinct_fiscal_year_and_budget_year(): void
    {
        // Setup RBA account for target budget year 2028
        $account2028 = RbaAccount::create([
            'account_code' => '5.1.02.01',
            'account_name' => 'Belanja Obat-Obatan 2028',
            'kategori_belanja' => 'Operasi',
            'sumber_dana' => 'BLUD',
            'period_year' => 2028,
            'total_budget' => 50000000,
            'remaining_budget' => 50000000,
            'spent_budget' => 0,
        ]);

        $item = Item::create([
            'item_code' => 'BRG-OBAT-01',
            'name' => 'Paracetamol Tablet 500mg',
            'unit_type' => 'Box',
            'standard_price' => 50000,
            'rba_account_id' => $account2028->id,
        ]);

        // Input usulan pada tahun penginputan berjalan (fiscal_year = 2027) untuk tahun anggaran target (budget_year = 2028)
        $response = $this->actingAs($this->divisiUser)
            ->post(route('requisitions.store'), [
                'fiscal_year' => 2027,
                'budget_year' => 2028,
                'sub_kegiatan' => 'Penyediaan Obat dan Perbekalan Kesehatan 2028',
                'items' => [
                    [
                        'item_id' => $item->id,
                        'quantity' => 10,
                        'unit_price' => 50000,
                        'jenis_belanja' => 'Operasi',
                        'rba_account_id' => $account2028->id,
                    ],
                ],
            ]);

        $response->assertRedirect(route('requisitions.index'));

        $this->assertDatabaseHas('requisitions', [
            'fiscal_year' => 2027,
            'budget_year' => 2028,
            'total_estimated' => 500000,
            'total_operasional' => 500000,
            'total_modal' => 0,
        ]);

        $requisition = Requisition::where('budget_year', 2028)->first();
        $this->assertNotNull($requisition);
        $this->assertEquals(2027, $requisition->fiscal_year);
        $this->assertEquals(2028, $requisition->budget_year);

        // Test update: ubah quantity dan pastikan pemisahan tahun tetap terjaga
        $updateResponse = $this->actingAs($this->divisiUser)
            ->put(route('requisitions.update', $requisition->id), [
                'fiscal_year' => 2027,
                'budget_year' => 2028,
                'sub_kegiatan' => 'Penyediaan Obat dan Perbekalan Kesehatan 2028 (Revisi)',
                'items' => [
                    [
                        'item_id' => $item->id,
                        'quantity' => 20,
                        'unit_price' => 50000,
                        'jenis_belanja' => 'Operasi',
                        'rba_account_id' => $account2028->id,
                    ],
                ],
            ]);

        $updateResponse->assertRedirect(route('requisitions.index'));

        $requisition->refresh();
        $this->assertEquals(2027, $requisition->fiscal_year);
        $this->assertEquals(2028, $requisition->budget_year);
        $this->assertEquals(1000000, (float) $requisition->total_estimated);
    }

    public function test_requisitions_list_prioritizes_budget_year_filtering_across_roles(): void
    {
        // Buat pengajuan A: input di 2027, target anggaran 2028
        $reqA = Requisition::create([
            'requisition_number' => 'REQ-2027-001',
            'division_id' => $this->division->id,
            'unit_id' => $this->unit->id,
            'user_id' => $this->divisiUser->id,
            'sub_kegiatan' => 'Kegiatan Target 2028',
            'fiscal_year' => 2027,
            'budget_year' => 2028,
            'status' => 'Pending_Perencanaan',
            'submission_date' => '2027-05-10',
            'total_estimated' => 5000000,
            'total_operasional' => 5000000,
            'total_modal' => 0,
        ]);

        // Buat pengajuan B: input di 2027, target anggaran 2027
        $reqB = Requisition::create([
            'requisition_number' => 'REQ-2027-002',
            'division_id' => $this->division->id,
            'unit_id' => $this->unit->id,
            'user_id' => $this->divisiUser->id,
            'sub_kegiatan' => 'Kegiatan Target 2027',
            'fiscal_year' => 2027,
            'budget_year' => 2027,
            'status' => 'Pending_Perencanaan',
            'submission_date' => '2027-02-15',
            'total_estimated' => 3000000,
            'total_operasional' => 3000000,
            'total_modal' => 0,
        ]);

        // 1. Filter Divisi dengan budget_year=2028 harus hanya mengembalikan reqA
        $this->actingAs($this->divisiUser)
            ->get(route('requisitions.index', ['budget_year' => 2028]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Divisi/Requisitions/Index')
                ->has('requisitions', 1)
                ->where('requisitions.0.id', $reqA->id)
            );

        // 2. Filter Perencanaan dengan budget_year=2028 harus hanya mengembalikan reqA
        $this->actingAs($this->perencanaanUser)
            ->get(route('perencanaan.requisitions.index', ['budget_year' => 2028]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Perencanaan/Requisitions/Index')
                ->has('requisitions', 1)
                ->where('requisitions.0.id', $reqA->id)
            );

        // 3. Filter Keuangan dengan budget_year=2028 harus hanya mengembalikan reqA
        $this->actingAs($this->keuanganUser)
            ->get(route('keuangan.requisitions.index', ['budget_year' => 2028]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Keuangan/Requisitions/Index')
                ->has('requisitions', 1)
                ->where('requisitions.0.id', $reqA->id)
            );
    }

    public function test_keuangan_revenue_synchronizes_with_rba_shift_and_computes_achievement_and_baseline(): void
    {
        // 1. Buat RBA Aktif untuk tahun 2028 dengan target pendapatan
        $shift2028 = RbaShift::create([
            'year' => 2028,
            'shift_name' => 'Murni',
            'doc_title' => 'RBA MURNI 2028',
            'period_month' => 'Januari 2028',
            'status' => 'Aktif',
            'penerimaan_silpa' => 1000000000,
        ]);

        $rootRevenue = RbaRevenueItem::create([
            'rba_shift_id' => $shift2028->id,
            'item_code' => '0',
            'item_name' => 'PENDAPATAN',
            'is_header' => true,
            'after_amount' => 10000000000, // 10 Miliar
            'order_index' => 0,
        ]);

        $jasaRevenue = RbaRevenueItem::create([
            'rba_shift_id' => $shift2028->id,
            'item_code' => '1',
            'item_name' => 'JASA LAYANAN',
            'is_header' => true,
            'after_amount' => 8000000000,
            'order_index' => 1,
        ]);

        // 2. Buat transaksi pendapatan riil tahun berjalan saat ini (date('Y'))
        Revenue::create([
            'revenue_number' => 'REV-CALENDAR-001',
            'source' => 'Pendapatan Pelayanan Rawat Inap',
            'amount' => 500000000,
            'date' => date('Y').'-04-15',
        ]);

        // 3. Buat transaksi pendapatan di tahun 2028
        Revenue::create([
            'revenue_number' => 'REV-2028-001',
            'source' => 'Pendapatan Pelayanan Rawat Jalan',
            'amount' => 2000000000, // 2 Miliar
            'date' => '2028-03-20',
        ]);

        // Akses Keuangan Revenue Index dengan filter tahun 2028
        $this->actingAs($this->keuanganUser)
            ->get(route('revenues.index', ['year' => 2028]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Keuangan/Revenues/Index')
                ->where('stats.total_revenue', 2000000000)
                ->where('stats.target_rba', 10000000000)
                ->where('stats.achievement_rate', 20) // 2 Miliar dari 10 Miliar = 20%
                ->where('stats.ongoing_year_realized', 500000000)
                ->where('selected_year', 2028)
            );
    }

    public function test_store_shift_clones_pembiayaan_fields_and_preserves_silpa_continuity(): void
    {
        // 1. Buat shift Murni dengan pembiayaan SiLPA dan Investasi
        $murniShift = RbaShift::create([
            'year' => 2027,
            'shift_name' => 'Murni',
            'doc_title' => 'RBA MURNI 2027',
            'period_month' => 'Januari 2027',
            'status' => 'Aktif',
            'penerimaan_silpa' => 2500000000,
            'penerimaan_divestasi' => 100000000,
            'penerimaan_pinjaman' => 0,
            'pengeluaran_investasi' => 500000000,
            'pengeluaran_pokok_utang' => 50000000,
        ]);

        // Buat Pergeseran I melalui storeShift
        $this->actingAs($this->perencanaanUser)
            ->post(route('perencanaan.rba.shifts.store'), [
                'year' => 2027,
                'shift_name' => 'Pergeseran I',
                'doc_title' => 'RBA PERGESERAN I 2027',
                'period_month' => 'April 2027',
                'notes' => 'Pergeseran tahap 1',
            ])
            ->assertRedirect();

        $shift1 = RbaShift::where('year', 2027)->where('shift_name', 'Pergeseran I')->first();
        $this->assertNotNull($shift1);
        $this->assertEquals(2500000000, (float) $shift1->penerimaan_silpa);
        $this->assertEquals(100000000, (float) $shift1->penerimaan_divestasi);
        $this->assertEquals(500000000, (float) $shift1->pengeluaran_investasi);

        // Aktifkan shift1 lalu buat Pergeseran II
        $shift1->update(['status' => 'Aktif']);
        $murniShift->update(['status' => 'Arsip']);

        $this->actingAs($this->perencanaanUser)
            ->post(route('perencanaan.rba.shifts.store'), [
                'year' => 2027,
                'shift_name' => 'Pergeseran II',
                'doc_title' => 'RBA PERGESERAN II 2027',
                'period_month' => 'Juni 2027',
                'notes' => 'Pergeseran tahap 2',
            ])
            ->assertRedirect();

        $shift2 = RbaShift::where('year', 2027)->where('shift_name', 'Pergeseran II')->first();
        $this->assertNotNull($shift2);
        $this->assertEquals(2500000000, (float) $shift2->penerimaan_silpa);
        $this->assertEquals(100000000, (float) $shift2->penerimaan_divestasi);
        $this->assertEquals(500000000, (float) $shift2->pengeluaran_investasi);
    }

    public function test_ringkasan_rba_computes_equilibrium_balance_correctly(): void
    {
        // 1. Kasus Seimbang: Pendapatan (10M) + SiLPA (2M) = 12M >= Belanja (11M) + Pengeluaran (0.5M) = 11.5M
        $shiftBalanced = RbaShift::create([
            'year' => 2028,
            'shift_name' => 'Murni',
            'doc_title' => 'RBA MURNI 2028',
            'period_month' => 'Januari 2028',
            'status' => 'Aktif',
            'penerimaan_silpa' => 2000000000,
            'pengeluaran_investasi' => 500000000,
        ]);

        RbaRevenueItem::create([
            'rba_shift_id' => $shiftBalanced->id,
            'item_code' => '0',
            'item_name' => 'PENDAPATAN',
            'is_header' => true,
            'before_amount' => 10000000000,
            'after_amount' => 10000000000,
            'order_index' => 0,
        ]);

        RbaExpenseItem::create([
            'rba_shift_id' => $shiftBalanced->id,
            'account_code' => '1',
            'account_name' => 'BELANJA',
            'is_header' => true,
            'before_total' => 11000000000,
            'after_total' => 11000000000,
            'order_index' => 0,
        ]);

        $this->actingAs($this->perencanaanUser)
            ->get(route('perencanaan.rba.index', ['year' => 2028, 'shift_id' => $shiftBalanced->id]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Perencanaan/RBA/Index')
                ->where('ringkasan_rba.keseimbangan.is_balanced', true)
                ->where('ringkasan_rba.keseimbangan.total_pendapatan_dan_penerimaan', 12000000000)
                ->where('ringkasan_rba.keseimbangan.total_belanja_dan_pengeluaran', 11500000000)
                ->where('ringkasan_rba.keseimbangan.selisih', 500000000)
                ->where('ringkasan_rba.keseimbangan.status', 'Berimbang')
            );

        // 2. Kasus Defisit Tanpa Pembiayaan: Pendapatan (5M) + SiLPA (0) = 5M < Belanja (8M) = Defisit 3M
        $shiftDeficit = RbaShift::create([
            'year' => 2029,
            'shift_name' => 'Murni',
            'doc_title' => 'RBA MURNI 2029',
            'period_month' => 'Januari 2029',
            'status' => 'Aktif',
            'penerimaan_silpa' => 0,
        ]);

        RbaRevenueItem::create([
            'rba_shift_id' => $shiftDeficit->id,
            'item_code' => '0',
            'item_name' => 'PENDAPATAN',
            'is_header' => true,
            'before_amount' => 5000000000,
            'after_amount' => 5000000000,
            'order_index' => 0,
        ]);

        RbaExpenseItem::create([
            'rba_shift_id' => $shiftDeficit->id,
            'account_code' => '1',
            'account_name' => 'BELANJA',
            'is_header' => true,
            'before_total' => 8000000000,
            'after_total' => 8000000000,
            'order_index' => 0,
        ]);

        $this->actingAs($this->perencanaanUser)
            ->get(route('perencanaan.rba.index', ['year' => 2029, 'shift_id' => $shiftDeficit->id]))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Perencanaan/RBA/Index')
                ->where('ringkasan_rba.keseimbangan.is_balanced', false)
                ->where('ringkasan_rba.keseimbangan.selisih', -3000000000)
                ->where('ringkasan_rba.keseimbangan.status', 'Defisit Tanpa Pembiayaan')
            );
    }
}
