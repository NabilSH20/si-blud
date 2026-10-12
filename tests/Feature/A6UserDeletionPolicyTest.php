<?php

namespace Tests\Feature;

use App\Models\Division;
use App\Models\RbaAccount;
use App\Models\Requisition;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class A6UserDeletionPolicyTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_cannot_delete_user_who_has_requisitions(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $division = Division::create(['name' => 'Pelayanan Medik', 'division_code' => 'DIV-MEDIK', 'group' => 'Pelayanan_Keperawatan']);
        $unit = Unit::create(['name' => 'IGD', 'unit_code' => 'UNT-IGD', 'division_id' => $division->id]);
        $account = RbaAccount::create([
            'account_code' => '1.1.2.1.1',
            'account_name' => 'BHP Medis',
            'period_year' => 2027,
            'kategori_belanja' => 'Operasi',
        ]);

        $user = User::factory()->create([
            'role' => 'divisi',
            'division_id' => $division->id,
            'unit_id' => $unit->id,
        ]);

        Requisition::create([
            'requisition_number' => 'REQ/2027/001',
            'submission_date' => '2027-01-10',
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

        $response = $this->actingAs($admin)->delete(route('users.destroy', $user));

        $response->assertSessionHas('error');
        $this->assertDatabaseHas('users', ['id' => $user->id]);
    }

    public function test_admin_cannot_delete_user_involved_in_audit_verification(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $division = Division::create(['name' => 'Pelayanan Medik', 'division_code' => 'DIV-MEDIK', 'group' => 'Pelayanan_Keperawatan']);
        $unit = Unit::create(['name' => 'IGD', 'unit_code' => 'UNT-IGD', 'division_id' => $division->id]);
        $account = RbaAccount::create([
            'account_code' => '1.1.2.1.1',
            'account_name' => 'BHP Medis',
            'period_year' => 2027,
            'kategori_belanja' => 'Operasi',
        ]);
        $requester = User::factory()->create(['role' => 'divisi', 'division_id' => $division->id, 'unit_id' => $unit->id]);
        $verifier = User::factory()->create(['role' => 'perencanaan']);

        Requisition::create([
            'requisition_number' => 'REQ/2027/002',
            'submission_date' => '2027-01-11',
            'fiscal_year' => 2027,
            'jenis_belanja' => 'Operasi',
            'sub_kegiatan' => 'Pelayanan Medik',
            'user_id' => $requester->id,
            'division_id' => $division->id,
            'unit_id' => $unit->id,
            'rba_account_id' => $account->id,
            'total_estimated' => 75000,
            'status' => 'Diproses_Keuangan',
            'verified_by_perencanaan_id' => $verifier->id,
        ]);

        $response = $this->actingAs($admin)->delete(route('users.destroy', $verifier));

        $response->assertSessionHas('error');
        $this->assertDatabaseHas('users', ['id' => $verifier->id]);
    }

    public function test_admin_can_delete_user_without_requisitions(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $user = User::factory()->create(['role' => 'divisi']);

        $response = $this->actingAs($admin)->delete(route('users.destroy', $user));

        $response->assertSessionHas('success');
        $this->assertDatabaseMissing('users', ['id' => $user->id]);
    }

    public function test_admin_cannot_delete_themselves(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($admin)->delete(route('users.destroy', $admin));

        $response->assertSessionHas('error');
        $this->assertDatabaseHas('users', ['id' => $admin->id]);
    }
}
