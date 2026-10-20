<?php

namespace Tests\Feature;

use App\Models\Item;
use App\Models\RbaAccount;
use App\Models\RbaShift;
use App\Models\Requisition;
use App\Models\Revenue;
use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Database\Seeders\DemoSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class A1ProductionReadinessTest extends TestCase
{
    use RefreshDatabase;

    public function test_database_seeder_in_production_does_not_create_users_with_literal_password()
    {
        $this->app['env'] = 'production';

        $this->artisan('db:seed', [
            '--class' => DatabaseSeeder::class,
            '--force' => true,
        ])->assertExitCode(0);

        $users = User::all();

        foreach ($users as $user) {
            $this->assertFalse(Hash::check('password', $user->password));
        }

        $this->assertCount(0, $users);
    }

    public function test_demo_seeder_fails_in_production()
    {
        $this->app['env'] = 'production';

        // In artisan, an unhandled exception in a command usually returns exit code 1
        // or we can expect the exception if withoutExceptionHandling is on
        $this->withoutExceptionHandling();

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('DemoSeeder cannot be run in production.');

        $this->artisan('db:seed', [
            '--class' => DemoSeeder::class,
            '--force' => true,
        ]);
    }

    public function test_create_admin_command_creates_user_and_rejects_duplicate_email()
    {
        $this->artisan('app:create-admin')
            ->expectsQuestion('Name', 'Admin Baru')
            ->expectsQuestion('Email', 'adminbaru@rsj.com')
            ->expectsQuestion('NIP', '1234567890')
            ->expectsQuestion('Password', 'Rahasia2026Aman')
            ->expectsQuestion('Confirm Password', 'Rahasia2026Aman')
            ->assertExitCode(0);

        $this->assertDatabaseHas('users', [
            'email' => 'adminbaru@rsj.com',
            'role' => 'admin',
        ]);

        // Second time with same email should fail
        $this->artisan('app:create-admin')
            ->expectsQuestion('Name', 'Admin Lain')
            ->expectsQuestion('Email', 'adminbaru@rsj.com')
            ->expectsQuestion('NIP', '0987654321')
            ->expectsQuestion('Password', 'Rahasia2026Aman')
            ->expectsQuestion('Confirm Password', 'Rahasia2026Aman')
            ->assertExitCode(1);
    }

    public function test_database_seeder_in_local_seeds_clean_2027_data_and_users()
    {
        $this->artisan('db:seed', [
            '--class' => DatabaseSeeder::class,
            '--force' => true,
        ])->assertExitCode(0);

        // Hanya ada TA 2027
        $this->assertDatabaseHas('fiscal_years', ['year' => 2027, 'is_default' => 1]);
        $this->assertDatabaseMissing('fiscal_years', ['year' => 2026]);
        $this->assertDatabaseMissing('fiscal_years', ['year' => 2025]);

        // Akun RBA bersih untuk TA 2027 dengan pagu 0
        $this->assertGreaterThan(0, RbaAccount::count());
        $this->assertEquals(0, RbaAccount::where('period_year', '!=', 2027)->count());
        $this->assertEquals(0, RbaAccount::where('total_budget', '>', 0)->count());

        // Master barang tersedia, semua item terikat ke kode rekening RBA, dan tidak menabur user default
        $this->assertGreaterThan(0, Item::count());
        $this->assertEquals(0, Item::whereNull('rba_account_id')->count());
        $this->assertEquals(0, User::count());

        // Struktur kode rekening rapi dan hierarkis
        $this->assertDatabaseHas('rba_accounts', ['account_code' => '1', 'parent_code' => null]);
        $this->assertDatabaseHas('rba_accounts', ['account_code' => '1.1', 'parent_code' => '1']);
        $this->assertDatabaseHas('rba_accounts', ['account_code' => '1.1.2.1.36', 'parent_code' => '1.1.2.1']);
        $this->assertDatabaseHas('rba_accounts', ['account_code' => '1.2.1.2.1', 'parent_code' => '1.2.1.2']);
        $this->assertDatabaseMissing('rba_accounts', ['account_code' => '1.2.02.05.01']);
        $this->assertDatabaseMissing('rba_accounts', ['account_code' => '5.1.02.01.01.0024']);

        // Tidak ada pergeseran, pendapatan, atau usulan
        $this->assertEquals(0, RbaShift::count());
        $this->assertEquals(0, Revenue::count());
        $this->assertEquals(0, Requisition::count());
    }
}
