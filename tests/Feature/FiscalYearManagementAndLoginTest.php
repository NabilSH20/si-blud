<?php

namespace Tests\Feature;

use App\Models\FiscalYear;
use App\Models\Requisition;
use App\Models\Revenue;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class FiscalYearManagementAndLoginTest extends TestCase
{
    use RefreshDatabase;

    protected User $adminUser;
    protected User $divisiUser;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(\Database\Seeders\DivisionSeeder::class);
        $this->seed(\Database\Seeders\UnitSeeder::class);
        $this->seed(\Database\Seeders\FiscalYearSeeder::class);

        $this->adminUser = User::factory()->create([
            'email' => 'admin.test@rsj.com',
            'role' => 'admin',
            'is_active' => true,
        ]);

        $this->divisiUser = User::factory()->create([
            'email' => 'lab.test@rsj.com',
            'role' => 'divisi',
            'is_active' => true,
        ]);
    }

    public function test_login_page_renders_active_fiscal_years(): void
    {
        $response = $this->get('/login');

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Auth/Login')
            ->has('fiscalYears', 4)
            ->where('defaultYear', 2026)
        );
    }

    public function test_user_can_login_with_specific_fiscal_year(): void
    {
        $response = $this->post('/login', [
            'email' => $this->divisiUser->email,
            'password' => 'password',
            'fiscal_year' => 2025,
        ]);

        $this->assertAuthenticatedAs($this->divisiUser);
        $this->assertEquals(2025, session('active_year'));
    }

    public function test_admin_can_view_fiscal_years_management_page(): void
    {
        $response = $this->actingAs($this->adminUser)
            ->get(route('fiscal-years.index'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Admin/FiscalYears/Index')
            ->has('fiscalYears')
        );
    }

    public function test_admin_can_create_new_fiscal_year(): void
    {
        $response = $this->actingAs($this->adminUser)
            ->post(route('fiscal-years.store'), [
                'year' => 2029,
                'name' => 'Tahun Anggaran 2029',
                'description' => 'Proyeksi 2029',
                'is_active' => true,
                'is_default' => false,
            ]);

        $response->assertRedirect(route('fiscal-years.index'));
        $this->assertDatabaseHas('fiscal_years', [
            'year' => 2029,
            'name' => 'Tahun Anggaran 2029',
            'is_active' => true,
        ]);
    }

    public function test_admin_can_toggle_fiscal_year_status(): void
    {
        $fy2028 = FiscalYear::where('year', 2028)->first();

        $response = $this->actingAs($this->adminUser)
            ->patch(route('fiscal-years.toggle-status', $fy2028->id));

        $response->assertRedirect(route('fiscal-years.index'));
        $this->assertFalse((bool) $fy2028->fresh()->is_active);
    }

    public function test_admin_can_set_default_fiscal_year(): void
    {
        $fy2027 = FiscalYear::where('year', 2027)->first();

        $response = $this->actingAs($this->adminUser)
            ->patch(route('fiscal-years.set-default', $fy2027->id));

        $response->assertRedirect(route('fiscal-years.index'));
        $this->assertTrue((bool) $fy2027->fresh()->is_default);
        $this->assertFalse((bool) FiscalYear::where('year', 2026)->first()->is_default);
    }

    public function test_requisitions_are_isolated_by_active_year(): void
    {
        // Requisition for 2025
        $req2025 = Requisition::create([
            'requisition_number' => 'REQ-2025-001',
            'division_id' => $this->divisiUser->division_id ?? 1,
            'unit_id' => $this->divisiUser->unit_id,
            'user_id' => $this->divisiUser->id,
            'jenis_belanja' => 'Operasi',
            'sumber_dana' => 'BLUD',
            'budget_year' => 2025,
            'fiscal_year' => 2025,
            'status' => 'Pending_Perencanaan',
            'submission_date' => today(),
            'total_estimated' => 500000,
        ]);

        // Requisition for 2026
        $req2026 = Requisition::create([
            'requisition_number' => 'REQ-2026-001',
            'division_id' => $this->divisiUser->division_id ?? 1,
            'unit_id' => $this->divisiUser->unit_id,
            'user_id' => $this->divisiUser->id,
            'jenis_belanja' => 'Operasi',
            'sumber_dana' => 'BLUD',
            'budget_year' => 2026,
            'fiscal_year' => 2026,
            'status' => 'Pending_Perencanaan',
            'submission_date' => today(),
            'total_estimated' => 1000000,
        ]);

        // When user is in active session 2026
        session(['active_year' => 2026]);

        $response = $this->actingAs($this->divisiUser)
            ->get(route('requisitions.index'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Divisi/Requisitions/Index')
            ->has('requisitions', 1)
            ->where('requisitions.0.requisition_number', 'REQ-2026-001')
        );

        // When user switches to session 2025
        session(['active_year' => 2025]);

        $response2025 = $this->actingAs($this->divisiUser)
            ->get(route('requisitions.index'));

        $response2025->assertOk();
        $response2025->assertInertia(fn (Assert $page) => $page
            ->component('Divisi/Requisitions/Index')
            ->has('requisitions', 1)
            ->where('requisitions.0.requisition_number', 'REQ-2025-001')
        );
    }

    public function test_revenues_are_isolated_by_active_year(): void
    {
        $keuanganUser = User::factory()->create([
            'email' => 'keuangan.test@rsj.com',
            'role' => 'keuangan',
            'is_active' => true,
        ]);

        // Revenue in 2025
        Revenue::create([
            'revenue_number' => 'REV-20250101-0001',
            'source' => 'Instalasi Laboratorium',
            'amount' => 2500000,
            'date' => '2025-05-10',
        ]);

        // Revenue in 2026
        Revenue::create([
            'revenue_number' => 'REV-20260101-0001',
            'source' => 'Instalasi Laboratorium',
            'amount' => 5000000,
            'date' => '2026-06-15',
        ]);

        // Session 2026
        session(['active_year' => 2026]);

        $response = $this->actingAs($keuanganUser)
            ->get(route('revenues.index'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Keuangan/Revenues/Index')
            ->has('revenues', 1)
            ->where('revenues.0.revenue_number', 'REV-20260101-0001')
            ->where('stats.total_revenue', 5000000)
        );
    }
}
