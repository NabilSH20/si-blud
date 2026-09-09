<?php

namespace Tests\Feature;

use App\Models\Division;
use App\Models\Item;
use App\Models\RbaAccount;
use App\Models\Requisition;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AdminDivisionAndUnitTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;
    private User $regularUser;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create([
            'name' => 'Administrator',
            'email' => 'admin@rsjtampan.riau.go.id',
            'role' => 'admin',
        ]);

        $this->regularUser = User::factory()->create([
            'role' => 'divisi',
        ]);
    }

    public function test_admin_can_view_divisions_index_with_both_divisions_and_units(): void
    {
        $division = Division::create([
            'division_code' => 'MEDIK',
            'name' => 'Bidang Pelayanan Medik',
            'group' => 'Pelayanan_Keperawatan',
        ]);

        Unit::create([
            'division_id' => $division->id,
            'unit_code' => 'IGD',
            'name' => 'Instalasi Gawat Darurat',
            'description' => 'Pelayanan gawat darurat psikiatri 24 jam',
        ]);

        $response = $this->actingAs($this->admin)->get(route('divisions.index'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Divisions/Index')
            ->has('divisions', 1)
            ->has('divisions.0.units', 1)
            ->has('units', 1)
            ->where('divisions.0.division_code', 'MEDIK')
            ->where('units.0.unit_code', 'IGD')
            ->where('units.0.division.name', 'Bidang Pelayanan Medik')
        );
    }

    public function test_unauthenticated_user_cannot_access_divisions_and_units(): void
    {
        $response = $this->get(route('divisions.index'));
        $response->assertRedirect(route('login'));

        $storeResponse = $this->post(route('units.store'), [
            'name' => 'Unit Ilegal',
            'unit_code' => 'ILEGAL',
        ]);
        $storeResponse->assertRedirect(route('login'));
    }

    public function test_admin_can_create_new_division(): void
    {
        $response = $this->actingAs($this->admin)->post(route('divisions.store'), [
            'division_code' => 'diklit',
            'name' => 'Bidang Diklit & Mutu',
            'group' => 'Pelayanan_Keperawatan',
        ]);

        $response->assertRedirect(route('divisions.index'));
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('divisions', [
            'division_code' => 'DIKLIT',
            'name' => 'Bidang Diklit & Mutu',
            'group' => 'Pelayanan_Keperawatan',
        ]);
    }

    public function test_admin_can_update_existing_division(): void
    {
        $division = Division::create([
            'division_code' => 'KEU',
            'name' => 'Bagian Keuangan Lama',
            'group' => 'Umum_Kepegawaian',
        ]);

        $response = $this->actingAs($this->admin)->put(route('divisions.update', $division), [
            'division_code' => 'KEU_BARU',
            'name' => 'Bagian Keuangan & Akuntansi',
            'group' => 'Umum_Kepegawaian',
        ]);

        $response->assertRedirect(route('divisions.index'));
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('divisions', [
            'id' => $division->id,
            'division_code' => 'KEU_BARU',
            'name' => 'Bagian Keuangan & Akuntansi',
        ]);
    }

    public function test_admin_cannot_delete_division_with_associated_units(): void
    {
        $division = Division::create([
            'division_code' => 'MEDIK',
            'name' => 'Bidang Pelayanan Medik',
            'group' => 'Pelayanan_Keperawatan',
        ]);

        Unit::create([
            'division_id' => $division->id,
            'unit_code' => 'RAWAT_INAP',
            'name' => 'Instalasi Rawat Inap',
        ]);

        $response = $this->actingAs($this->admin)->delete(route('divisions.destroy', $division));

        $response->assertRedirect();
        $response->assertSessionHas('error');
        $this->assertDatabaseHas('divisions', ['id' => $division->id]);
    }

    public function test_admin_can_delete_unlinked_division(): void
    {
        $division = Division::create([
            'division_code' => 'TEMP',
            'name' => 'Bidang Sementara',
            'group' => 'Umum_Kepegawaian',
        ]);

        $response = $this->actingAs($this->admin)->delete(route('divisions.destroy', $division));

        $response->assertRedirect(route('divisions.index'));
        $response->assertSessionHas('success');
        $this->assertDatabaseMissing('divisions', ['id' => $division->id]);
    }

    public function test_admin_can_create_new_unit(): void
    {
        $division = Division::create([
            'division_code' => 'PENUNJANG',
            'name' => 'Bidang Penunjang Medik & Diklit',
            'group' => 'Pelayanan_Keperawatan',
        ]);

        $response = $this->actingAs($this->admin)->post(route('units.store'), [
            'division_id' => $division->id,
            'unit_code' => 'farmasi',
            'name' => 'Instalasi Farmasi RSJ',
            'description' => 'Pengelolaan obat dan alkes rumah sakit',
        ]);

        $response->assertRedirect(route('divisions.index'));
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('units', [
            'division_id' => $division->id,
            'unit_code' => 'FARMASI',
            'name' => 'Instalasi Farmasi RSJ',
            'description' => 'Pengelolaan obat dan alkes rumah sakit',
        ]);
    }

    public function test_admin_can_update_existing_unit(): void
    {
        $division1 = Division::create([
            'division_code' => 'MEDIK',
            'name' => 'Bidang Pelayanan Medik',
            'group' => 'Pelayanan_Keperawatan',
        ]);

        $division2 = Division::create([
            'division_code' => 'PENUNJANG',
            'name' => 'Bidang Penunjang Medik & Diklit',
            'group' => 'Pelayanan_Keperawatan',
        ]);

        $unit = Unit::create([
            'division_id' => $division1->id,
            'unit_code' => 'LAB',
            'name' => 'Laboratorium Awal',
            'description' => 'Deskripsi lama',
        ]);

        $response = $this->actingAs($this->admin)->put(route('units.update', $unit), [
            'division_id' => $division2->id,
            'unit_code' => 'lab_pk',
            'name' => 'Instalasi Laboratorium Patologi Klinik',
            'description' => 'Pemeriksaan sampel dan tes penunjang',
        ]);

        $response->assertRedirect(route('divisions.index'));
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('units', [
            'id' => $unit->id,
            'division_id' => $division2->id,
            'unit_code' => 'LAB_PK',
            'name' => 'Instalasi Laboratorium Patologi Klinik',
            'description' => 'Pemeriksaan sampel dan tes penunjang',
        ]);
    }

    public function test_admin_cannot_delete_unit_with_linked_users(): void
    {
        $division = Division::create([
            'division_code' => 'MEDIK',
            'name' => 'Bidang Pelayanan Medik',
            'group' => 'Pelayanan_Keperawatan',
        ]);

        $unit = Unit::create([
            'division_id' => $division->id,
            'unit_code' => 'IGD',
            'name' => 'Instalasi Gawat Darurat',
        ]);

        User::factory()->create([
            'division_id' => $division->id,
            'unit_id' => $unit->id,
        ]);

        $response = $this->actingAs($this->admin)->delete(route('units.destroy', $unit));

        $response->assertRedirect();
        $response->assertSessionHas('error');
        $this->assertDatabaseHas('units', ['id' => $unit->id]);
    }

    public function test_admin_cannot_delete_unit_with_linked_requisitions(): void
    {
        $division = Division::create([
            'division_code' => 'MEDIK',
            'name' => 'Bidang Pelayanan Medik',
            'group' => 'Pelayanan_Keperawatan',
        ]);

        $unit = Unit::create([
            'division_id' => $division->id,
            'unit_code' => 'IGD',
            'name' => 'Instalasi Gawat Darurat',
        ]);

        $account = RbaAccount::create([
            'account_code' => '5.2.02.01.01.0001',
            'account_name' => 'Belanja Bahan Obat',
            'kategori_belanja' => 'Operasi',
            'sumber_dana' => 'BLUD',
            'period_year' => 2027,
            'total_budget' => 100000000,
            'remaining_budget' => 100000000,
        ]);

        $user = User::factory()->create([
            'division_id' => $division->id,
            'unit_id' => $unit->id,
            'role' => 'divisi',
        ]);

        Requisition::create([
            'requisition_number' => 'REQ/2026/001',
            'submission_date' => '2026-09-08',
            'fiscal_year' => 2027,
            'jenis_belanja' => 'Operasi',
            'sub_kegiatan' => 'Pelayanan Medik',
            'user_id' => $user->id,
            'division_id' => $division->id,
            'unit_id' => $unit->id,
            'rba_account_id' => $account->id,
            'total_estimated' => 50000,
            'status' => 'Pending_Perencanaan',
        ]);

        $response = $this->actingAs($this->admin)->delete(route('units.destroy', $unit));

        $response->assertRedirect();
        $response->assertSessionHas('error');
        $this->assertDatabaseHas('units', ['id' => $unit->id]);
    }

    public function test_admin_can_delete_unlinked_unit(): void
    {
        $division = Division::create([
            'division_code' => 'MEDIK',
            'name' => 'Bidang Pelayanan Medik',
            'group' => 'Pelayanan_Keperawatan',
        ]);

        $unit = Unit::create([
            'division_id' => $division->id,
            'unit_code' => 'KOSONG',
            'name' => 'Unit Tanpa Kaitan',
        ]);

        $response = $this->actingAs($this->admin)->delete(route('units.destroy', $unit));

        $response->assertRedirect(route('divisions.index'));
        $response->assertSessionHas('success');
        $this->assertDatabaseMissing('units', ['id' => $unit->id]);
    }
}
