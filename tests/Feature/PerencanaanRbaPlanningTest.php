<?php

namespace Tests\Feature;

use App\Models\Division;
use App\Models\Item;
use App\Models\RbaAccount;
use App\Models\RbaRevenueItem;
use App\Models\RbaShift;
use App\Models\Requisition;
use App\Models\RequisitionDetail;
use App\Models\Unit;
use App\Models\User;
use Database\Seeders\RbaPergeseran3Seeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PerencanaanRbaPlanningTest extends TestCase
{
    use RefreshDatabase;

    private User $perencanaanUser;

    private Division $perencanaanDivision;

    private RbaShift $activeShift;

    protected function setUp(): void
    {
        parent::setUp();

        $this->perencanaanDivision = Division::create([
            'name' => 'Bagian Perencanaan',
            'division_code' => 'REN',
            'group' => 'Manajemen',
        ]);

        $this->perencanaanUser = User::factory()->create([
            'name' => 'Hawari Dinal, S.Sos.M.Si',
            'nip' => '197002111997031005',
            'position' => 'Kepala Bagian Perencanaan',
            'role' => 'perencanaan',
            'division_id' => $this->perencanaanDivision->id,
            'is_active' => true,
        ]);

        // Seed RBA Pergeseran III baseline data
        $this->seed(RbaPergeseran3Seeder::class);
        $this->activeShift = RbaShift::where('shift_name', 'Pergeseran III')->first();
    }

    public function test_perencanaan_can_view_rba_index_with_ringkasan_and_surplus_deficit(): void
    {
        $response = $this->actingAs($this->perencanaanUser)
            ->get(route('perencanaan.rba.index', ['shift_id' => $this->activeShift->id]));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Perencanaan/RBA/Index')
            ->has('shifts')
            ->has('revenue_items')
            ->has('expense_items')
            ->has('catalog_items')
            ->has('ringkasan_rba')
            ->where('ringkasan_rba.surplus_defisit.after', 89224000)
            ->where('ringkasan_rba.pendapatan.total.after', 44281028836)
            ->where('ringkasan_rba.belanja.total.after', 44191804836)
        );
    }

    public function test_perencanaan_can_update_revenue_target_and_recalculate_headers(): void
    {
        $revItem = RbaRevenueItem::where('rba_shift_id', $this->activeShift->id)
            ->where('item_name', 'Pendapatan Pelayanan Farmasi')
            ->firstOrFail();

        $originalAmount = (float) $revItem->before_amount;
        $newTarget = 2500000000; // 2.5 Billion

        $response = $this->actingAs($this->perencanaanUser)
            ->patch(route('perencanaan.rba.revenue-items.update', $revItem->id), [
                'after_amount' => $newTarget,
            ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('rba_revenue_items', [
            'id' => $revItem->id,
            'after_amount' => $newTarget,
            'difference' => $newTarget - $originalAmount,
        ]);

        // Assert Jasa Layanan category header recalculated
        $jasaLayananHeader = RbaRevenueItem::where('rba_shift_id', $this->activeShift->id)
            ->where('item_code', '1')
            ->first();
        $this->assertGreaterThan(25047246628, (float) $jasaLayananHeader->after_amount);
    }

    public function test_perencanaan_can_batch_update_revenue_targets(): void
    {
        $item1 = RbaRevenueItem::where('rba_shift_id', $this->activeShift->id)
            ->where('item_name', 'Pendapatan Pelayanan Gawat Darurat')
            ->firstOrFail();

        $item2 = RbaRevenueItem::where('rba_shift_id', $this->activeShift->id)
            ->where('item_name', 'Hasil Kerjasama Diklat')
            ->firstOrFail();

        $payload = [
            'items' => [
                ['id' => $item1->id, 'after_amount' => 50000000],
                ['id' => $item2->id, 'after_amount' => 300000000],
            ],
        ];

        $response = $this->actingAs($this->perencanaanUser)
            ->patch(route('perencanaan.rba.batch-revenue.update', $this->activeShift->id), $payload);

        $response->assertRedirect();
        $this->assertDatabaseHas('rba_revenue_items', [
            'id' => $item1->id,
            'after_amount' => 50000000,
        ]);
        $this->assertDatabaseHas('rba_revenue_items', [
            'id' => $item2->id,
            'after_amount' => 300000000,
        ]);
    }

    public function test_perencanaan_can_update_pembiayaan_and_silpa(): void
    {
        $payload = [
            'penerimaan_silpa' => 150000000,
            'penerimaan_divestasi' => 0,
            'penerimaan_pinjaman' => 0,
            'pengeluaran_investasi' => 50000000,
            'pengeluaran_pokok_utang' => 0,
        ];

        $response = $this->actingAs($this->perencanaanUser)
            ->patch(route('perencanaan.rba.pembiayaan.update', $this->activeShift->id), $payload);

        $response->assertRedirect();
        $this->assertDatabaseHas('rba_shifts', [
            'id' => $this->activeShift->id,
            'penerimaan_silpa' => 150000000,
            'pengeluaran_investasi' => 50000000,
        ]);
    }

    public function test_all_rba_print_pages_render_correctly(): void
    {
        // 1. Print Ringkasan RBA
        $resRingkasan = $this->actingAs($this->perencanaanUser)
            ->get(route('perencanaan.rba.print-ringkasan', ['shift_id' => $this->activeShift->id]));
        $resRingkasan->assertOk();
        $resRingkasan->assertInertia(fn (Assert $page) => $page
            ->component('Perencanaan/RBA/PrintRingkasan')
            ->has('ringkasan')
        );

        // 2. Print Pendapatan BLUD
        $resPendapatan = $this->actingAs($this->perencanaanUser)
            ->get(route('perencanaan.rba.print-pendapatan', ['shift_id' => $this->activeShift->id]));
        $resPendapatan->assertOk();
        $resPendapatan->assertInertia(fn (Assert $page) => $page
            ->component('Perencanaan/RBA/PrintPendapatan')
            ->has('items')
        );

        // 3. Print Belanja BLUD
        $resBelanja = $this->actingAs($this->perencanaanUser)
            ->get(route('perencanaan.rba.print-belanja', ['shift_id' => $this->activeShift->id]));
        $resBelanja->assertOk();
        $resBelanja->assertInertia(fn (Assert $page) => $page
            ->component('Perencanaan/RBA/PrintBelanja')
            ->has('items')
        );
    }

    public function test_perencanaan_can_verify_and_approve_unit_requisition(): void
    {
        $medikDivision = Division::create([
            'name' => 'Bidang Pelayanan Medik',
            'division_code' => 'MEDIK',
            'group' => 'Pelayanan_Keperawatan',
        ]);

        $farmasiUnit = Unit::create([
            'division_id' => $medikDivision->id,
            'name' => 'Instalasi Farmasi',
            'unit_code' => 'FAR',
        ]);

        $requester = User::factory()->create([
            'name' => 'apt. Siti Rahma, S.Farm',
            'nip' => '198705122011012003',
            'position' => 'Kepala Instalasi Farmasi',
            'role' => 'divisi',
            'division_id' => $medikDivision->id,
            'unit_id' => $farmasiUnit->id,
        ]);

        $rbaAccount = RbaAccount::first();

        $item = Item::create([
            'rba_account_id' => $rbaAccount->id,
            'item_code' => 'FAR-999',
            'name' => 'Obat Uji Coba Risperidone',
            'unit_type' => 'Box',
            'standard_price' => 50000,
        ]);

        $requisition = Requisition::create([
            'requisition_number' => 'REQ-20261010-0001',
            'nomor_surat_unit' => '05/FAR/2026',
            'division_id' => $medikDivision->id,
            'unit_id' => $farmasiUnit->id,
            'user_id' => $requester->id,
            'rba_account_id' => $rbaAccount->id,
            'jenis_belanja' => 'Operasi',
            'sumber_dana' => 'BLUD',
            'sub_kegiatan' => 'Pelayanan dan Penunjang Pelayanan BLUD RS Jiwa Tampan',
            'fiscal_year' => 2027,
            'urgency_reason' => 'Kebutuhan obat mendesak untuk triwulan I TA 2027.',
            'status' => 'Pending_Perencanaan',
            'submission_date' => today(),
            'total_estimated' => 1000000,
        ]);

        $detail = RequisitionDetail::create([
            'requisition_id' => $requisition->id,
            'item_id' => $item->id,
            'item_name' => $item->name,
            'unit_type' => $item->unit_type,
            'quantity_requested' => 20,
            'unit_price' => 50000,
            'subtotal' => 1000000,
        ]);

        // Perencanaan views show page
        $showRes = $this->actingAs($this->perencanaanUser)
            ->get(route('perencanaan.requisitions.show', $requisition->id));
        $showRes->assertOk();
        $showRes->assertInertia(fn (Assert $page) => $page
            ->component('Perencanaan/Requisitions/Show')
            ->where('requisition.fiscal_year', 2027)
            ->where('requisition.sub_kegiatan', 'Pelayanan dan Penunjang Pelayanan BLUD RS Jiwa Tampan')
        );

        // Perencanaan approves with 15 quantity (volume adjusted) - ACC Final
        $approvalPayload = [
            'status' => 'Disetujui',
            'notes_perencanaan' => 'Disetujui 15 unit sesuai pagu efisiensi RBA BLUD Farmasi.',
            'items' => [
                [
                    'id' => $detail->id,
                    'quantity_approved' => 15,
                ],
            ],
        ];

        $updateRes = $this->actingAs($this->perencanaanUser)
            ->put(route('perencanaan.requisitions.update', $requisition->id), $approvalPayload);

        $updateRes->assertRedirect(route('perencanaan.requisitions.index'));

        $this->assertDatabaseHas('requisitions', [
            'id' => $requisition->id,
            'status' => 'Disetujui',
            'total_approved' => 750000, // 15 * 50,000
            'notes_perencanaan' => 'Disetujui 15 unit sesuai pagu efisiensi RBA BLUD Farmasi.',
        ]);

        $this->assertDatabaseHas('requisition_details', [
            'id' => $detail->id,
            'quantity_approved' => 15,
            'subtotal' => 750000,
        ]);
    }

    public function test_perencanaan_can_filter_rba_by_multi_year_realtime(): void
    {
        $response = $this->actingAs($this->perencanaanUser)
            ->get(route('perencanaan.rba.index', ['year' => 2027]));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Perencanaan/RBA/Index')
            ->where('selected_year', 2027)
            ->has('accounts_with_proposed')
            ->has('available_years')
        );
    }

    public function test_perencanaan_can_view_print_rincian_belanja(): void
    {
        $response = $this->actingAs($this->perencanaanUser)
            ->get(route('perencanaan.rba.print-rincian-belanja', ['year' => 2026]));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Perencanaan/RBA/PrintRincianBelanja')
            ->where('selected_year', 2026)
            ->has('accounts_with_proposed')
        );
    }

    public function test_perencanaan_can_filter_requisitions_by_fiscal_year(): void
    {
        $rbaAcc = RbaAccount::first();

        $req2026 = Requisition::create([
            'requisition_number' => 'REQ-2026-001',
            'division_id' => $this->perencanaanDivision->id,
            'user_id' => $this->perencanaanUser->id,
            'rba_account_id' => $rbaAcc ? $rbaAcc->id : null,
            'jenis_belanja' => 'Operasi',
            'sumber_dana' => 'BLUD',
            'fiscal_year' => 2026,
            'status' => 'Pending_Perencanaan',
            'submission_date' => today(),
            'total_estimated' => 500000,
        ]);

        $req2027 = Requisition::create([
            'requisition_number' => 'REQ-2027-001',
            'division_id' => $this->perencanaanDivision->id,
            'user_id' => $this->perencanaanUser->id,
            'rba_account_id' => $rbaAcc ? $rbaAcc->id : null,
            'jenis_belanja' => 'Operasi',
            'sumber_dana' => 'BLUD',
            'fiscal_year' => 2027,
            'status' => 'Pending_Perencanaan',
            'submission_date' => today(),
            'total_estimated' => 750000,
        ]);

        $response = $this->actingAs($this->perencanaanUser)
            ->get(route('perencanaan.requisitions.index', ['fiscal_year' => 2027]));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Perencanaan/Requisitions/Index')
            ->where('selectedYear', '2027')
            ->has('requisitions', 1)
            ->where('requisitions.0.id', $req2027->id)
        );
    }

    public function test_perencanaan_requisitions_index_orders_newest_date_first_and_provides_units(): void
    {
        $rbaAcc = RbaAccount::first();
        $unitA = Unit::create([
            'division_id' => $this->perencanaanDivision->id,
            'name' => 'Instalasi Farmasi',
            'unit_code' => 'FAR',
        ]);
        $unitB = Unit::create([
            'division_id' => $this->perencanaanDivision->id,
            'name' => 'Instalasi Laboratorium',
            'unit_code' => 'LAB',
        ]);

        // Pengajuan lama (14 Januari) meski masih Pending harus tetap berada di bawah tanggal terbaru (16 Maret)
        $reqJanPending = Requisition::create([
            'requisition_number' => 'REQ-JAN-001',
            'division_id' => $this->perencanaanDivision->id,
            'unit_id' => $unitA->id,
            'user_id' => $this->perencanaanUser->id,
            'rba_account_id' => $rbaAcc?->id,
            'jenis_belanja' => 'Operasi',
            'sumber_dana' => 'BLUD',
            'fiscal_year' => 2026,
            'budget_year' => 2026,
            'status' => 'Pending_Perencanaan',
            'submission_date' => '2026-01-14',
            'total_estimated' => 100000,
        ]);

        $reqMarApproved = Requisition::create([
            'requisition_number' => 'REQ-MAR-001',
            'division_id' => $this->perencanaanDivision->id,
            'unit_id' => $unitB->id,
            'user_id' => $this->perencanaanUser->id,
            'rba_account_id' => $rbaAcc?->id,
            'jenis_belanja' => 'Operasi',
            'sumber_dana' => 'BLUD',
            'fiscal_year' => 2026,
            'budget_year' => 2026,
            'status' => 'Disetujui',
            'submission_date' => '2026-03-16',
            'total_estimated' => 200000,
        ]);

        $reqMarLatest = Requisition::create([
            'requisition_number' => 'REQ-MAR-002',
            'division_id' => $this->perencanaanDivision->id,
            'unit_id' => $unitA->id,
            'user_id' => $this->perencanaanUser->id,
            'rba_account_id' => $rbaAcc?->id,
            'jenis_belanja' => 'Operasi',
            'sumber_dana' => 'BLUD',
            'fiscal_year' => 2026,
            'budget_year' => 2026,
            'status' => 'Pending_Perencanaan',
            'submission_date' => '2026-03-16',
            'total_estimated' => 300000,
        ]);

        $response = $this->actingAs($this->perencanaanUser)
            ->get(route('perencanaan.requisitions.index', ['budget_year' => 2026]));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Perencanaan/Requisitions/Index')
            ->has('requisitions', 3)
            ->has('units', 2)
            ->where('requisitions.0.id', $reqMarLatest->id)
            ->where('requisitions.1.id', $reqMarApproved->id)
            ->where('requisitions.2.id', $reqJanPending->id)
        );
    }

    public function test_perencanaan_can_validate_new_items_and_price_updates_during_verification(): void
    {
        $unit = Unit::create([
            'division_id' => $this->perencanaanDivision->id,
            'name' => 'Instalasi Gawat Darurat',
            'unit_code' => 'IGD',
        ]);
        $divisiUser = User::factory()->create([
            'name' => 'Staf IGD',
            'role' => 'divisi',
            'division_id' => $this->perencanaanDivision->id,
            'unit_id' => $unit->id,
            'is_active' => true,
        ]);

        $rbaAccount = RbaAccount::first();
        $catalogItemAcceptPrice = Item::create([
            'rba_account_id' => $rbaAccount->id,
            'item_code' => 'ITM-STD-01',
            'name' => 'Alkohol 70%',
            'unit_type' => 'Botol',
            'standard_price' => 20000,
            'source' => 'STANDAR',
        ]);
        $catalogItemRejectPrice = Item::create([
            'rba_account_id' => $rbaAccount->id,
            'item_code' => 'ITM-STD-02',
            'name' => 'Masker Medis',
            'unit_type' => 'Box',
            'standard_price' => 30000,
            'source' => 'STANDAR',
        ]);

        // Unit mengajukan: 2 harga diperbarui + 2 barang baru
        $this->actingAs($divisiUser)
            ->post(route('requisitions.store'), [
                'rba_account_id' => $rbaAccount->id,
                'sub_kegiatan' => 'Pelayanan IGD 2026',
                'budget_year' => 2026,
                'fiscal_year' => 2026,
                'items' => [
                    [
                        'item_id' => $catalogItemAcceptPrice->id,
                        'quantity' => 5,
                        'unit_price' => 25000, // naik dari 20,000
                        'is_new' => false,
                    ],
                    [
                        'item_id' => $catalogItemRejectPrice->id,
                        'quantity' => 4,
                        'unit_price' => 45000, // naik dari 30,000 (akan ditolak Perencanaan -> kembali 30,000)
                        'is_new' => false,
                    ],
                    [
                        'is_new' => true,
                        'name' => 'Alat Baru Sah',
                        'unit_type' => 'Pcs',
                        'unit_price' => 10000,
                        'quantity' => 3,
                    ],
                    [
                        'is_new' => true,
                        'name' => 'Alat Baru Tidak Sah',
                        'unit_type' => 'Pcs',
                        'unit_price' => 50000,
                        'quantity' => 2,
                    ],
                ],
            ])
            ->assertRedirect(route('requisitions.index'));

        $requisition = Requisition::latest('id')->with('requisitionDetails')->first();
        $this->assertNotNull($requisition);

        $detailAcceptPrice = $requisition->requisitionDetails->firstWhere('item_id', $catalogItemAcceptPrice->id);
        $detailRejectPrice = $requisition->requisitionDetails->firstWhere('item_id', $catalogItemRejectPrice->id);
        $detailNewSah = $requisition->requisitionDetails->firstWhere('item_name', 'Alat Baru Sah');
        $detailNewReject = $requisition->requisitionDetails->firstWhere('item_name', 'Alat Baru Tidak Sah');

        $verifyRes = $this->actingAs($this->perencanaanUser)
            ->put(route('perencanaan.requisitions.update', $requisition->id), [
                'status' => 'Disetujui',
                'rba_account_id' => $rbaAccount->id,
                'notes_perencanaan' => 'Validasi harga baru Alkohol disetujui karena kenaikan pemasok.',
                'items' => [
                    [
                        'id' => $detailAcceptPrice->id,
                        'quantity_approved' => 5,
                        'price_validation_status' => 'SAH',
                    ],
                    [
                        'id' => $detailRejectPrice->id,
                        'quantity_approved' => 4,
                        'price_validation_status' => 'TIDAK_SAH',
                    ],
                    [
                        'id' => $detailNewSah->id,
                        'quantity_approved' => 3,
                        'item_validation_status' => 'SAH',
                    ],
                    [
                        'id' => $detailNewReject->id,
                        'quantity_approved' => 2, // meskipun dikirim > 0, harus dipaksa 0 karena TIDAK_SAH
                        'item_validation_status' => 'TIDAK_SAH',
                    ],
                ],
            ]);

        $verifyRes->assertRedirect(route('perencanaan.requisitions.index'));

        // Harga Alkohol disahkan -> katalog resmi terupdate ke 25,000
        $freshAccept = $catalogItemAcceptPrice->fresh();
        $this->assertEquals(25000, (float) $freshAccept->standard_price);
        $this->assertEquals('NONE', $freshAccept->price_status);
        $this->assertNull($freshAccept->pending_price);
        $this->assertEquals('SAH', $detailAcceptPrice->fresh()->price_validation_status);

        // Harga Masker ditolak -> katalog tetap 30,000 & harga detail kembali ke 30,000
        $freshReject = $catalogItemRejectPrice->fresh();
        $this->assertEquals(30000, (float) $freshReject->standard_price);
        $this->assertEquals('NONE', $freshReject->price_status);
        $this->assertEquals(30000, (float) $detailRejectPrice->fresh()->unit_price);
        $this->assertEquals('TIDAK_SAH', $detailRejectPrice->fresh()->price_validation_status);

        // Barang baru Sah menjadi STANDAR; Tidak Sah menjadi DITOLAK dengan qty 0
        $this->assertEquals('STANDAR', Item::find($detailNewSah->item_id)->source);
        $this->assertEquals('SAH', $detailNewSah->fresh()->item_validation_status);
        $this->assertEquals(3, $detailNewSah->fresh()->quantity_approved);

        $this->assertEquals('DITOLAK', Item::find($detailNewReject->item_id)->source);
        $this->assertEquals('TIDAK_SAH', $detailNewReject->fresh()->item_validation_status);
        $this->assertEquals(0, $detailNewReject->fresh()->quantity_approved);

        // Total disetujui = (5*25000) + (4*30000) + (3*10000) + 0 = 125000 + 120000 + 30000 = 275000
        $this->assertEquals(275000, (float) $requisition->fresh()->total_approved);

        // Barang DITOLAK tidak tampil lagi di katalog unit
        $divisiIndex = $this->actingAs($divisiUser)->get(route('requisitions.index'));
        $divisiIndex->assertInertia(fn (Assert $page) => $page
            ->where('items', function ($items) use ($detailNewReject) {
                return collect($items)->every(fn ($it) => $it['id'] !== $detailNewReject->item_id);
            })
        );
    }

    public function test_perencanaan_requisitions_index_places_newly_submitted_today_above_future_seeded_dates(): void
    {
        $rbaAcc = RbaAccount::first();

        // Simulasi data demo/seeder bertanggal masa depan (TA 2027) yang masuk lebih dulu
        $seededFutureReq = Requisition::create([
            'requisition_number' => 'REQ-20270314-0003',
            'division_id' => $this->perencanaanDivision->id,
            'user_id' => $this->perencanaanUser->id,
            'rba_account_id' => $rbaAcc?->id,
            'jenis_belanja' => 'Operasi',
            'sumber_dana' => 'BLUD',
            'fiscal_year' => 2027,
            'budget_year' => 2027,
            'status' => 'Disetujui',
            'submission_date' => '2027-03-14',
            'created_at' => '2027-03-14 09:30:00',
            'total_estimated' => 2050000,
        ]);

        // Simulasi pengajuan baru oleh unit pada tanggal sistem hari ini (2026-11-25) untuk TA 2027
        $brandNewTodayReq = Requisition::create([
            'requisition_number' => 'REQ-20261125-0013',
            'division_id' => $this->perencanaanDivision->id,
            'user_id' => $this->perencanaanUser->id,
            'rba_account_id' => $rbaAcc?->id,
            'jenis_belanja' => 'Operasi',
            'sumber_dana' => 'BLUD',
            'fiscal_year' => 2026,
            'budget_year' => 2027,
            'status' => 'Pending_Perencanaan',
            'submission_date' => '2026-11-25',
            'created_at' => '2026-11-25 15:00:00',
            'total_estimated' => 500000,
        ]);

        $response = $this->actingAs($this->perencanaanUser)
            ->get(route('perencanaan.requisitions.index', ['budget_year' => 2027]));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Perencanaan/Requisitions/Index')
            ->has('requisitions', 2)
            ->where('requisitions.0.id', $brandNewTodayReq->id)
            ->where('requisitions.1.id', $seededFutureReq->id)
        );
    }
}
