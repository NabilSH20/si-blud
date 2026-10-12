<?php

namespace Tests\Feature;

use App\Models\FiscalYear;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class A8ActiveYearNormalizationTest extends TestCase
{
    use RefreshDatabase;

    public function test_when_active_year_in_session_becomes_inactive_next_request_reverts_to_default_year(): void
    {
        $defaultYear = FiscalYear::create([
            'year' => 2027,
            'name' => 'TA 2027',
            'is_active' => true,
            'is_default' => true,
        ]);

        $customYear = FiscalYear::create([
            'year' => 2028,
            'name' => 'TA 2028',
            'is_active' => true,
            'is_default' => false,
        ]);

        $user = User::factory()->create(['role' => 'admin']);

        // User memiliki active_year = 2028 dalam sesinya
        $response = $this->actingAs($user)
            ->withSession(['active_year' => 2028])
            ->get(route('admin.dashboard'));

        $response->assertOk();
        $this->assertEquals(2028, session('active_year'));

        // Admin kemudian menonaktifkan tahun 2028
        $customYear->update(['is_active' => false]);

        // Request berikutnya dari user otomatis dinormalisasi kembali ke default (2027)
        $response2 = $this->actingAs($user)
            ->withSession(['active_year' => 2028])
            ->get(route('admin.dashboard'));

        $response2->assertOk();
        $this->assertEquals(2027, session('active_year'));
    }

    public function test_empty_session_year_initializes_with_default_year(): void
    {
        FiscalYear::create([
            'year' => 2027,
            'name' => 'TA 2027',
            'is_active' => true,
            'is_default' => true,
        ]);

        $user = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($user)->get(route('admin.dashboard'));

        $response->assertOk();
        $this->assertEquals(2027, session('active_year'));
    }
}
