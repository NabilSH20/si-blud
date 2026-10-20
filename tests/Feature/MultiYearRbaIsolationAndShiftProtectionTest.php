<?php

namespace Tests\Feature;

use App\Models\Division;
use App\Models\FiscalYear;
use App\Models\Item;
use App\Models\RbaAccount;
use App\Models\RbaExpenseItem;
use App\Models\RbaShift;
use App\Models\Requisition;
use App\Models\RequisitionDetail;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

class MultiYearRbaIsolationAndShiftProtectionTest extends TestCase
{
    use RefreshDatabase;

    private User $adminUser;

    private User $perencanaanUser;

    private User $keuanganUser;

    private User $divisiUser;

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

        $this->adminUser = User::factory()->create([
            'name' => 'Admin User',
            'role' => 'admin',
            'division_id' => $this->division->id,
            'unit_id' => $this->unit->id,
            'is_active' => true,
        ]);

        $this->perencanaanUser = User::factory()->create([
            'name' => 'Staf Perencanaan',
            'role' => 'perencanaan',
            'division_id' => $this->division->id,
            'unit_id' => $this->unit->id,
            'is_active' => true,
        ]);

        $this->keuanganUser = User::factory()->create([
            'name' => 'Bendahara Keuangan',
            'role' => 'keuangan',
            'division_id' => $this->division->id,
            'unit_id' => $this->unit->id,
            'is_active' => true,
        ]);

        $this->divisiUser = User::factory()->create([
            'name' => 'Pengusul Divisi',
            'role' => 'divisi',
            'division_id' => $this->division->id,
            'unit_id' => $this->unit->id,
            'is_active' => true,
        ]);

        FiscalYear::create(['year' => 2026, 'name' => 'TA 2026', 'is_active' => true, 'is_default' => true]);
        FiscalYear::create(['year' => 2027, 'name' => 'TA 2027', 'is_active' => true, 'is_default' => false]);
    }

    /**
     * Test 1: Aktivasi RBA tahun 2027 mengisolasi akun dan tidak menimpa / merusak saldo tahun 2026
     */
    public function test_activate_rba_shift_isolates_multi_year_accounts(): void
    {
        // 1. Setup RBA 2026 yang sudah memiliki realisasi belanja
        $account2026 = RbaAccount::create([
            'account_code' => '5.1.02.01.01.0024',
            'account_name' => 'Belanja Bahan Medis Habis Pakai',
            'kategori_belanja' => 'Operasi',
            'sumber_dana' => 'BLUD',
            'period_year' => 2026,
            'year' => 2026,
            'total_budget' => 50000000,
            'spent_budget' => 20000000,
            'remaining_budget' => 30000000,
        ]);

        $shift2026 = RbaShift::create([
            'year' => 2026,
            'shift_name' => 'Murni 2026',
            'doc_title' => 'RBA MURNI 2026',
            'period_month' => 'Januari 2026',
            'status' => 'Aktif',
        ]);

        // 2. Setup RBA 2027 Baru
        $shift2027 = RbaShift::create([
            'year' => 2027,
            'shift_name' => 'Murni 2027',
            'doc_title' => 'RBA MURNI 2027',
            'period_month' => 'Januari 2027',
            'status' => 'Draft',
        ]);

        $expenseItem2027 = RbaExpenseItem::create([
            'rba_shift_id' => $shift2027->id,
            'account_code' => '5.1.02.01.01.0024',
            'account_name' => 'Belanja Bahan Medis Habis Pakai TA 2027',
            'is_header' => false,
            'after_jasa_layanan' => 60000000,
            'after_total' => 60000000,
        ]);

        // 3. Aktivasi Shift 2027
        $shift2027->activate();

        // 4. Assert isolasi tahun 2026 tetap utuh
        $account2026->refresh();
        $this->assertEquals(2026, $account2026->period_year);
        $this->assertEquals(50000000, (float) $account2026->total_budget);
        $this->assertEquals(20000000, (float) $account2026->spent_budget);
        $this->assertEquals(30000000, (float) $account2026->remaining_budget);

        // 5. Assert akun 2027 baru tercipta secara terpisah tanpa merusak 2026
        $account2027 = RbaAccount::where('account_code', '5.1.02.01.01.0024')
            ->where('period_year', 2027)
            ->first();

        $this->assertNotNull($account2027);
        $this->assertNotEquals($account2026->id, $account2027->id);
        $this->assertEquals(2027, $account2027->period_year);
        $this->assertEquals(60000000, (float) $account2027->total_budget);
        $this->assertEquals(0, (float) $account2027->spent_budget);
        $this->assertEquals(60000000, (float) $account2027->remaining_budget);

        // Membuktikan ada 2 baris rba_accounts dengan kode rekening yang sama namun beda period_year
        $count = RbaAccount::where('account_code', '5.1.02.01.01.0024')->count();
        $this->assertEquals(2, $count);
    }

    /**
     * Test 2: Proteksi defisit pada updateItem() saat pagu digeser di bawah spent_budget
     */
    public function test_update_item_prevents_budget_reduction_below_spent_budget(): void
    {
        $account = RbaAccount::create([
            'account_code' => '5.1.02.01.01.0025',
            'account_name' => 'Belanja Obat-Obatan',
            'kategori_belanja' => 'Operasi',
            'sumber_dana' => 'BLUD',
            'period_year' => 2026,
            'year' => 2026,
            'total_budget' => 10000000,
            'spent_budget' => 7000000,
            'remaining_budget' => 3000000,
        ]);

        $shift = RbaShift::create([
            'year' => 2026,
            'shift_name' => 'Pergeseran 1',
            'doc_title' => 'RBA PERGESERAN 1',
            'period_month' => 'Maret 2026',
            'status' => 'Aktif',
        ]);

        $item = RbaExpenseItem::create([
            'rba_shift_id' => $shift->id,
            'rba_account_id' => $account->id,
            'account_code' => '5.1.02.01.01.0025',
            'account_name' => 'Belanja Obat-Obatan',
            'is_header' => false,
            'before_total' => 10000000,
            'after_total' => 10000000,
        ]);

        // Coba kurangi pagu menjadi 5.000.000 (di bawah spent_budget 7.000.000)
        $response = $this->actingAs($this->perencanaanUser)
            ->patch(route('perencanaan.rba.items.update', $item->id), [
                'after_jasa_layanan' => 5000000,
                'after_hasil_kerjasama' => 0,
                'after_lain_lain_sah' => 0,
                'after_silpa' => 0,
                'after_apbd' => 0,
            ]);

        $response->assertSessionHasErrors('after_total');

        // Pastikan nilai database tidak berubah
        $account->refresh();
        $this->assertEquals(10000000, (float) $account->total_budget);
        $this->assertEquals(3000000, (float) $account->remaining_budget);

        // Lakukan pergeseran yang valid (misal: 8.000.000 >= 7.000.000)
        $validResponse = $this->actingAs($this->perencanaanUser)
            ->patch(route('perencanaan.rba.items.update', $item->id), [
                'after_jasa_layanan' => 8000000,
                'after_hasil_kerjasama' => 0,
                'after_lain_lain_sah' => 0,
                'after_silpa' => 0,
                'after_apbd' => 0,
            ]);

        $validResponse->assertSessionHasNoErrors();
        $account->refresh();
        $this->assertEquals(8000000, (float) $account->total_budget);
        $this->assertEquals(1000000, (float) $account->remaining_budget); // 8jt - 7jt = 1jt
    }

    /**
     * Test 3: Proteksi defisit pada RbaShift::activate() saat ada item dengan after_total < spent_budget
     */
    public function test_activate_shift_throws_exception_if_after_total_is_less_than_spent_budget(): void
    {
        $account = RbaAccount::create([
            'account_code' => '5.1.02.01.01.0026',
            'account_name' => 'Belanja Reagen Laboratorium',
            'kategori_belanja' => 'Operasi',
            'sumber_dana' => 'BLUD',
            'period_year' => 2026,
            'year' => 2026,
            'total_budget' => 20000000,
            'spent_budget' => 15000000,
            'remaining_budget' => 5000000,
        ]);

        $shift = RbaShift::create([
            'year' => 2026,
            'shift_name' => 'Pergeseran Defisit',
            'doc_title' => 'RBA PERGESERAN DEFISIT',
            'period_month' => 'April 2026',
            'status' => 'Draft',
        ]);

        RbaExpenseItem::create([
            'rba_shift_id' => $shift->id,
            'rba_account_id' => $account->id,
            'account_code' => '5.1.02.01.01.0026',
            'account_name' => 'Belanja Reagen Laboratorium',
            'is_header' => false,
            'before_total' => 20000000,
            'after_total' => 12000000, // Di bawah spent 15.000.000
        ]);

        $this->expectException(ValidationException::class);
        $shift->activate();
    }

    /**
     * Test 4: Verifikasi Perencanaan memvalidasi komitmen pagu (Diproses_Keuangan)
     */
    public function test_perencanaan_verification_validates_budget_commitments(): void
    {
        $account = RbaAccount::create([
            'account_code' => '5.1.02.01.01.0027',
            'account_name' => 'Belanja Alat Tulis Kantor',
            'kategori_belanja' => 'Operasi',
            'sumber_dana' => 'BLUD',
            'period_year' => 2026,
            'year' => 2026,
            'total_budget' => 1000000,
            'spent_budget' => 0,
            'remaining_budget' => 1000000,
        ]);

        $item = Item::create([
            'rba_account_id' => $account->id,
            'item_code' => 'ATK-001',
            'name' => 'Kertas A4',
            'unit_type' => 'Rim',
            'standard_price' => 50000,
            'source' => 'STANDAR',
        ]);

        // Pengajuan 1: Sudah Diproses_Keuangan sebesar Rp 700.000
        Requisition::create([
            'requisition_number' => 'REQ-20261015-0001',
            'division_id' => $this->division->id,
            'unit_id' => $this->unit->id,
            'user_id' => $this->divisiUser->id,
            'rba_account_id' => $account->id,
            'fiscal_year' => 2026,
            'budget_year' => 2026,
            'status' => 'Diproses_Keuangan',
            'total_approved' => 700000,
            'submission_date' => today(),
            'sub_kegiatan' => 'Penyelenggaraan Tata Kelola dan Administrasi BLUD',
        ]);

        // Pengajuan 2: Baru diajukan (Pending_Perencanaan) dengan usulan 10 rim (Rp 500.000)
        // Padahal sisa pagu tersedia setelah komitmen Rp 700.000 tinggal Rp 300.000!
        $req2 = Requisition::create([
            'requisition_number' => 'REQ-20261015-0002',
            'division_id' => $this->division->id,
            'unit_id' => $this->unit->id,
            'user_id' => $this->divisiUser->id,
            'rba_account_id' => $account->id,
            'fiscal_year' => 2026,
            'budget_year' => 2026,
            'status' => 'Pending_Perencanaan',
            'total_estimated' => 500000,
            'submission_date' => today(),
            'sub_kegiatan' => 'Penyelenggaraan Tata Kelola dan Administrasi BLUD',
        ]);

        $detail2 = RequisitionDetail::create([
            'requisition_id' => $req2->id,
            'item_id' => $item->id,
            'item_name' => $item->name,
            'unit_type' => $item->unit_type,
            'quantity_requested' => 10,
            'unit_price' => 50000,
            'subtotal' => 500000,
        ]);

        // Perencanaan mencoba menyetujui 10 rim (total Rp 500.000) -> Harus Ditolak karena pagu tersedia tinggal 300.000
        $failResponse = $this->actingAs($this->perencanaanUser)
            ->put(route('perencanaan.requisitions.update', $req2->id), [
                'status' => 'Diproses_Keuangan',
                'notes_perencanaan' => 'Disetujui 10 rim.',
                'items' => [
                    [
                        'id' => $detail2->id,
                        'quantity_approved' => 10,
                    ],
                ],
            ]);

        $failResponse->assertSessionHasErrors('rba_account_id');
        $req2->refresh();
        $this->assertEquals('Pending_Perencanaan', $req2->status);

        // Perencanaan menyesuaikan volume menjadi 5 rim (Rp 250.000 <= Rp 300.000) -> Harus Berhasil!
        $successResponse = $this->actingAs($this->perencanaanUser)
            ->put(route('perencanaan.requisitions.update', $req2->id), [
                'status' => 'Diproses_Keuangan',
                'notes_perencanaan' => 'Disetujui 5 rim sesuai sisa pagu komitmen.',
                'items' => [
                    [
                        'id' => $detail2->id,
                        'quantity_approved' => 5,
                    ],
                ],
            ]);

        $successResponse->assertSessionHasNoErrors();
        $req2->refresh();
        $this->assertEquals('Diproses_Keuangan', $req2->status);
        $this->assertEquals(250000, (float) $req2->total_approved);
    }

    /**
     * Test 5: Item dibuat di 2026, diajukan pada tahun 2027 otomatis me-resolve dan memotong pagu 2027,
     * serta tidak menyentuh saldo rekening 2026.
     */
    public function test_cross_year_item_catalog_resolves_and_deducts_target_year_account_leaving_original_account_intact(): void
    {
        // 1. Akun 2026
        $account2026 = RbaAccount::create([
            'account_code' => '5.1.02.01.01.0028',
            'account_name' => 'Belanja Pemeliharaan Komputer',
            'kategori_belanja' => 'Operasi',
            'sumber_dana' => 'BLUD',
            'period_year' => 2026,
            'year' => 2026,
            'total_budget' => 50000000,
            'spent_budget' => 0,
            'remaining_budget' => 50000000,
        ]);

        // 2. Akun 2027 (kode sama, beda baris di DB)
        $account2027 = RbaAccount::create([
            'account_code' => '5.1.02.01.01.0028',
            'account_name' => 'Belanja Pemeliharaan Komputer',
            'kategori_belanja' => 'Operasi',
            'sumber_dana' => 'BLUD',
            'period_year' => 2027,
            'year' => 2027,
            'total_budget' => 70000000,
            'spent_budget' => 0,
            'remaining_budget' => 70000000,
        ]);

        // 3. Item di master SSH dibuat pada tahun 2026 dan menunjuk ke account2026->id
        $item = Item::create([
            'rba_account_id' => $account2026->id,
            'item_code' => 'IT-001',
            'name' => 'SSD NVMe 1TB',
            'unit_type' => 'Unit',
            'standard_price' => 1000000,
            'source' => 'STANDAR',
        ]);

        // 4. Divisi membuat pengajuan untuk tahun anggaran 2027
        $divisiResponse = $this->actingAs($this->divisiUser)
            ->post(route('requisitions.store'), [
                'budget_year' => 2027,
                'fiscal_year' => 2027,
                'sub_kegiatan' => 'Pemeliharaan Sarana, Prasarana, dan Alat Kesehatan Rumah Sakit',
                'items' => [
                    [
                        'item_id' => $item->id,
                        'is_new' => false,
                        'quantity' => 5,
                        'unit_price' => 1000000,
                    ],
                ],
            ]);

        $divisiResponse->assertSessionHasNoErrors();

        $requisition = Requisition::latest('id')->first();
        $this->assertNotNull($requisition);
        $this->assertEquals(2027, $requisition->budget_year);
        // Membuktikan bahwa rba_account_id pada pengajuan otomatis ter-resolve ke akun 2027, bukan akun 2026!
        $this->assertEquals($account2027->id, $requisition->rba_account_id);

        $detail = $requisition->requisitionDetails->first();

        // 5. Perencanaan menelaah dan menyetujui pengajuan
        $perencanaanResponse = $this->actingAs($this->perencanaanUser)
            ->put(route('perencanaan.requisitions.update', $requisition->id), [
                'status' => 'Diproses_Keuangan',
                'notes_perencanaan' => 'Disetujui 5 unit SSD untuk T.A. 2027.',
                'items' => [
                    [
                        'id' => $detail->id,
                        'quantity_approved' => 5,
                    ],
                ],
            ]);

        $perencanaanResponse->assertSessionHasNoErrors();
        $requisition->refresh();
        $this->assertEquals('Diproses_Keuangan', $requisition->status);
        $this->assertEquals($account2027->id, $requisition->rba_account_id);
        $this->assertEquals(5000000, (float) $requisition->total_approved);

        // 6. Keuangan mencairkan / menyetujui pengajuan
        $keuanganResponse = $this->actingAs($this->keuanganUser)
            ->put(route('keuangan.requisitions.update', $requisition->id), [
                'status' => 'Disetujui_Selesai',
                'sp2d_number' => 'SP2D/2027/001',
                'receipt_number' => 'BND/2027/001',
                'notes_keuangan' => 'Pencairan dana T.A. 2027 selesai.',
            ]);

        $keuanganResponse->assertSessionHasNoErrors();
        $requisition->refresh();
        $this->assertEquals('Disetujui_Selesai', $requisition->status);
        $this->assertEquals($account2027->id, $requisition->rba_account_id);

        // 7. Assert: Pagu tahun 2027 terpotong Rp 5.000.000
        $account2027->refresh();
        $this->assertEquals(5000000, (float) $account2027->spent_budget);
        $this->assertEquals(65000000, (float) $account2027->remaining_budget);

        // 8. Assert: Pagu tahun 2026 TETAP UTUH (spent = 0, remaining = 50.000.000)
        $account2026->refresh();
        $this->assertEquals(0, (float) $account2026->spent_budget);
        $this->assertEquals(50000000, (float) $account2026->remaining_budget);
    }

    /**
     * Test 6: Proteksi pergeseran RBA (updateItem & activate) memperhitungkan komitmen pagu (Diproses_Keuangan)
     */
    public function test_rba_shift_update_and_activation_prevents_reduction_below_spent_plus_committed_budget(): void
    {
        // 1. Akun dengan spent_budget 40jt
        $account = RbaAccount::create([
            'account_code' => '5.1.02.01.01.0029',
            'account_name' => 'Belanja Cetak dan Penggandaan',
            'kategori_belanja' => 'Operasi',
            'sumber_dana' => 'BLUD',
            'period_year' => 2026,
            'year' => 2026,
            'total_budget' => 100000000,
            'spent_budget' => 40000000,
            'remaining_budget' => 60000000,
        ]);

        // 2. Ada pengajuan yang sedang Diproses_Keuangan sebesar 30jt
        Requisition::create([
            'requisition_number' => 'REQ-20261015-0099',
            'division_id' => $this->division->id,
            'unit_id' => $this->unit->id,
            'user_id' => $this->divisiUser->id,
            'rba_account_id' => $account->id,
            'fiscal_year' => 2026,
            'budget_year' => 2026,
            'status' => 'Diproses_Keuangan',
            'total_approved' => 30000000,
            'submission_date' => today(),
            'sub_kegiatan' => 'Penyelenggaraan Tata Kelola dan Administrasi BLUD',
        ]);

        // Total minimal required = 40jt + 30jt = 70jt.

        $shift = RbaShift::create([
            'year' => 2026,
            'shift_name' => 'Pergeseran 2',
            'doc_title' => 'RBA PERGESERAN 2',
            'period_month' => 'Mei 2026',
            'status' => 'Aktif',
        ]);

        $item = RbaExpenseItem::create([
            'rba_shift_id' => $shift->id,
            'rba_account_id' => $account->id,
            'account_code' => '5.1.02.01.01.0029',
            'account_name' => 'Belanja Cetak dan Penggandaan',
            'is_header' => false,
            'before_total' => 100000000,
            'after_total' => 100000000,
        ]);

        // 3. Coba turunkan pagu menjadi 50jt via Perencanaan\RbaController::updateItem()
        // Karena 50jt < 70jt (40jt realisasi + 30jt komitmen), harus GAGAL
        $failResponse = $this->actingAs($this->perencanaanUser)
            ->patch(route('perencanaan.rba.items.update', $item->id), [
                'after_jasa_layanan' => 50000000,
                'after_hasil_kerjasama' => 0,
                'after_lain_lain_sah' => 0,
                'after_silpa' => 0,
                'after_apbd' => 0,
            ]);

        $failResponse->assertSessionHasErrors('after_total');

        // Pastikan total_budget di akun tidak berubah
        $account->refresh();
        $this->assertEquals(100000000, (float) $account->total_budget);

        // 4. Coba aktivasi draft shift yang memiliki item < 70jt via RbaShift::activate()
        $draftShift = RbaShift::create([
            'year' => 2026,
            'shift_name' => 'Draft Pergeseran Kurang',
            'doc_title' => 'RBA PERGESERAN DRAFT',
            'period_month' => 'Juni 2026',
            'status' => 'Draft',
        ]);

        RbaExpenseItem::create([
            'rba_shift_id' => $draftShift->id,
            'rba_account_id' => $account->id,
            'account_code' => '5.1.02.01.01.0029',
            'account_name' => 'Belanja Cetak dan Penggandaan',
            'is_header' => false,
            'before_total' => 100000000,
            'after_total' => 60000000, // < 70jt
        ]);

        try {
            $draftShift->activate();
            $this->fail('Expected ValidationException was not thrown on activate() when budget is below spent + committed.');
        } catch (ValidationException $e) {
            $this->assertArrayHasKey('after_total', $e->errors());
            $this->assertStringContainsString('komitmen pengajuan yang sedang diproses Keuangan', $e->errors()['after_total'][0]);
        }

        // 5. Pergeseran dengan nominal yang mencukupi (misal 75jt >= 70jt) harus BERHASIL
        $validResponse = $this->actingAs($this->perencanaanUser)
            ->patch(route('perencanaan.rba.items.update', $item->id), [
                'after_jasa_layanan' => 75000000,
                'after_hasil_kerjasama' => 0,
                'after_lain_lain_sah' => 0,
                'after_silpa' => 0,
                'after_apbd' => 0,
            ]);

        $validResponse->assertSessionHasNoErrors();
        $account->refresh();
        $this->assertEquals(75000000, (float) $account->total_budget);
        $this->assertEquals(35000000, (float) $account->remaining_budget); // 75jt - 40jt = 35jt
    }

    /**
     * Test 7: Perencanaan dapat mengubah rba_account_id dan perubahan tersimpan di database
     */
    public function test_perencanaan_update_explicitly_persists_chosen_rba_account_id(): void
    {
        $accountA = RbaAccount::create([
            'account_code' => '5.1.02.01.01.0030',
            'account_name' => 'Rekening Pagu A',
            'kategori_belanja' => 'Operasi',
            'sumber_dana' => 'BLUD',
            'period_year' => 2026,
            'year' => 2026,
            'total_budget' => 20000000,
            'spent_budget' => 0,
            'remaining_budget' => 20000000,
        ]);

        $accountB = RbaAccount::create([
            'account_code' => '5.1.02.01.01.0031',
            'account_name' => 'Rekening Pagu B',
            'kategori_belanja' => 'Operasi',
            'sumber_dana' => 'BLUD',
            'period_year' => 2026,
            'year' => 2026,
            'total_budget' => 30000000,
            'spent_budget' => 0,
            'remaining_budget' => 30000000,
        ]);

        $item = Item::create([
            'rba_account_id' => $accountA->id,
            'item_code' => 'ITEM-AB',
            'name' => 'Barang Fleksibel',
            'unit_type' => 'Pcs',
            'standard_price' => 100000,
            'source' => 'STANDAR',
        ]);

        $req = Requisition::create([
            'requisition_number' => 'REQ-20261015-AB01',
            'division_id' => $this->division->id,
            'unit_id' => $this->unit->id,
            'user_id' => $this->divisiUser->id,
            'rba_account_id' => $accountA->id,
            'fiscal_year' => 2026,
            'budget_year' => 2026,
            'status' => 'Pending_Perencanaan',
            'total_estimated' => 200000,
            'submission_date' => today(),
            'sub_kegiatan' => 'Penyelenggaraan Tata Kelola dan Administrasi BLUD',
        ]);

        $detail = RequisitionDetail::create([
            'requisition_id' => $req->id,
            'item_id' => $item->id,
            'item_name' => $item->name,
            'unit_type' => $item->unit_type,
            'quantity_requested' => 2,
            'unit_price' => 100000,
            'subtotal' => 200000,
        ]);

        // Perencanaan memverifikasi dan mengubah rba_account_id ke Account B
        $response = $this->actingAs($this->perencanaanUser)
            ->put(route('perencanaan.requisitions.update', $req->id), [
                'status' => 'Diproses_Keuangan',
                'rba_account_id' => $accountB->id,
                'notes_perencanaan' => 'Dialihkan pembebanannya ke Rekening B.',
                'items' => [
                    [
                        'id' => $detail->id,
                        'quantity_approved' => 2,
                    ],
                ],
            ]);

        $response->assertSessionHasNoErrors();
        $req->refresh();
        $this->assertEquals($accountB->id, $req->rba_account_id);
    }
}
