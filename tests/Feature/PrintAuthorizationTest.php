<?php

namespace Tests\Feature;

use App\Models\Division;
use App\Models\FiscalYear;
use App\Models\RbaShift;
use App\Models\Requisition;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PrintAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    protected User $perencanaanUser;

    protected User $keuanganUser;

    protected User $divisiUser1;

    protected User $divisiUser2;

    protected Requisition $requisition1;

    protected Requisition $requisition2;

    protected RbaShift $activeShift;

    protected function setUp(): void
    {
        parent::setUp();

        FiscalYear::create([
            'name' => 'T.A. 2026',
            'year' => 2026,
            'status' => 'ACTIVE',
            'is_default' => true,
        ]);

        $division = Division::create(['name' => 'Pelayanan Medik', 'division_code' => 'MED-01']);
        $unit1 = Unit::create(['name' => 'Rawat Inap', 'unit_code' => 'RI-01', 'division_id' => $division->id]);
        $unit2 = Unit::create(['name' => 'Farmasi', 'unit_code' => 'FAR-01', 'division_id' => $division->id]);

        $this->perencanaanUser = User::factory()->create(['role' => 'perencanaan']);
        $this->keuanganUser = User::factory()->create(['role' => 'keuangan']);

        $this->divisiUser1 = User::factory()->create([
            'role' => 'divisi',
            'unit_id' => $unit1->id,
        ]);

        $this->divisiUser2 = User::factory()->create([
            'role' => 'divisi',
            'unit_id' => $unit2->id,
        ]);

        $this->requisition1 = Requisition::create([
            'requisition_number' => 'REQ-TEST-001',
            'division_id' => $division->id,
            'user_id' => $this->divisiUser1->id,
            'unit_id' => $unit1->id,
            'submission_date' => now(),
            'status' => 'Pending_Perencanaan',
        ]);

        $this->requisition2 = Requisition::create([
            'requisition_number' => 'REQ-TEST-002',
            'division_id' => $division->id,
            'user_id' => $this->divisiUser2->id,
            'unit_id' => $unit2->id,
            'submission_date' => now(),
            'status' => 'Diproses_Keuangan',
        ]);

        $this->activeShift = RbaShift::create([
            'year' => 2026,
            'shift_name' => 'RBA Murni 2026',
            'doc_title' => 'RBA MURNI T.A. 2026',
            'period_month' => 'Januari - Desember',
            'status' => 'Aktif',
            'penerimaan_silpa' => 0,
        ]);
    }

    public function test_perencanaan_user_can_access_requisition_print(): void
    {
        $response = $this->actingAs($this->perencanaanUser)
            ->get(route('requisitions.print', $this->requisition1->id));

        $response->assertOk();
    }

    public function test_perencanaan_user_can_access_perencanaan_requisition_print(): void
    {
        $response = $this->actingAs($this->perencanaanUser)
            ->get(route('perencanaan.requisitions.print', $this->requisition1->id));

        $response->assertOk();
    }

    public function test_keuangan_user_can_access_requisition_print(): void
    {
        $response = $this->actingAs($this->keuanganUser)
            ->get(route('requisitions.print', $this->requisition1->id));

        $response->assertOk();
    }

    public function test_keuangan_user_can_access_keuangan_requisition_print(): void
    {
        $response = $this->actingAs($this->keuanganUser)
            ->get(route('keuangan.requisitions.print', $this->requisition1->id));

        $response->assertOk();
    }

    public function test_divisi_isolation_remains_active_for_other_units(): void
    {
        // Divisi user 1 can print their own unit's requisition
        $responseOwner = $this->actingAs($this->divisiUser1)
            ->get(route('requisitions.print', $this->requisition1->id));
        $responseOwner->assertOk();

        // Divisi user 1 CANNOT print unit 2's requisition (403 Forbidden)
        $responseForbidden = $this->actingAs($this->divisiUser1)
            ->get(route('requisitions.print', $this->requisition2->id));
        $responseForbidden->assertForbidden();
    }

    public function test_rba_print_routes_accessible_with_fallback_or_undefined_shift_id(): void
    {
        // Perencanaan access with undefined string
        $resRingkasan = $this->actingAs($this->perencanaanUser)
            ->get(route('perencanaan.rba.print-ringkasan', ['shift_id' => 'undefined']));
        $resRingkasan->assertOk();

        $resBelanja = $this->actingAs($this->perencanaanUser)
            ->get(route('perencanaan.rba.print-belanja', ['shift_id' => 'undefined']));
        $resBelanja->assertOk();

        $resPendapatan = $this->actingAs($this->perencanaanUser)
            ->get(route('perencanaan.rba.print-pendapatan', ['shift_id' => 'undefined']));
        $resPendapatan->assertOk();

        $resRincian = $this->actingAs($this->perencanaanUser)
            ->get(route('perencanaan.rba.print-rincian-belanja', ['year' => 2026, 'shift_id' => 'undefined']));
        $resRincian->assertOk();

        // Keuangan also has access to RBA print views
        $resKeuanganRba = $this->actingAs($this->keuanganUser)
            ->get(route('perencanaan.rba.print-ringkasan', ['shift_id' => $this->activeShift->id]));
        $resKeuanganRba->assertOk();
    }

    public function test_keuangan_report_print_routes_accessible_by_keuangan_and_perencanaan(): void
    {
        // Keuangan access
        $resPrint = $this->actingAs($this->keuanganUser)
            ->get(route('reports.print'));
        $resPrint->assertOk();

        $resSurplusDeficit = $this->actingAs($this->keuanganUser)
            ->get(route('reports.surplus-deficit.print'));
        $resSurplusDeficit->assertOk();

        // Perencanaan cross-access
        $resPerencanaanPrint = $this->actingAs($this->perencanaanUser)
            ->get(route('reports.print'));
        $resPerencanaanPrint->assertOk();
    }
}
