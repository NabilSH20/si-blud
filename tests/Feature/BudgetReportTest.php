<?php

namespace Tests\Feature;

use App\Models\Budget;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class BudgetReportTest extends TestCase
{
    use RefreshDatabase;

    public function test_keuangan_can_view_budget_realization_report(): void
    {
        $keuangan = User::factory()->create(['role' => 'keuangan']);

        Budget::create([
            'account_code' => '5.1.02.01.01.0001',
            'account_name' => 'Belanja Bahan Medis Habis Pakai',
            'period_year' => 2026,
            'total_budget' => 50000000,
            'remaining_budget' => 35000000,
        ]);

        $response = $this->actingAs($keuangan)->get(route('reports.index'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Keuangan/Reports/Index')
            ->has('budgets', 1)
            ->where('budgets.0.total_budget', 50000000)
            ->where('budgets.0.total_spent', 15000000)
            ->where('budgets.0.remaining_budget', 35000000)
            ->where('budgets.0.percentage', 30)
            ->where('summary.total_initial', 50000000)
            ->where('summary.total_spent', 15000000)
            ->where('summary.total_remaining', 35000000)
            ->where('summary.overall_percentage', 30)
        );
    }

    public function test_keuangan_can_view_printable_budget_realization_report(): void
    {
        $keuangan = User::factory()->create(['role' => 'keuangan']);

        Budget::create([
            'account_code' => '5.1.02.01.01.0002',
            'account_name' => 'Belanja Alat Tulis Kantor',
            'period_year' => 2026,
            'total_budget' => 20000000,
            'remaining_budget' => 12000000,
        ]);

        $response = $this->actingAs($keuangan)->get(route('reports.print'));

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Shared/PrintReport')
            ->has('budgets', 1)
            ->where('budgets.0.total_spent', 8000000)
            ->has('summary')
        );
    }

    public function test_guest_cannot_access_reports(): void
    {
        $response = $this->get(route('reports.index'));
        $response->assertRedirect(route('login'));
    }
}

