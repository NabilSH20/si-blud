<?php

namespace Tests\Feature;

use App\Models\Budget;
use App\Models\Division;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ExecutiveAnalyticsAndTimelineTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_dashboard_receives_chart_datasets(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        Division::create(['name' => 'Rawat Inap', 'division_code' => 'RWI-01']);

        $response = $this->actingAs($admin)->get(route('admin.dashboard'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Admin/Dashboard')
            ->has('users_by_role')
            ->has('requisitions_by_division')
        );
    }

    public function test_keuangan_dashboard_receives_chart_datasets(): void
    {
        $keuangan = User::factory()->create(['role' => 'keuangan']);

        Budget::create([
            'account_code' => '5.1.02.01.01.0001',
            'account_name' => 'Belanja Medis Habis Pakai',
            'period_year' => 2026,
            'total_budget' => 50000000,
            'remaining_budget' => 30000000,
        ]);

        $response = $this->actingAs($keuangan)->get(route('keuangan.dashboard'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Keuangan/Dashboard')
            ->has('budget_chart_data', 2)
            ->has('top_budgets')
            ->where('total_spent', 20000000)
        );
    }

    public function test_inertia_shares_flash_messages(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)
            ->withSession(['success' => 'Operasi berhasil dieksekusi!'])
            ->get(route('admin.dashboard'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->has('flash.success')
            ->where('flash.success', 'Operasi berhasil dieksekusi!')
        );
    }
}

