<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('requisitions', function (Blueprint $table) {
            $table->index(['budget_year', 'status'], 'requisitions_budget_year_status_idx');
            $table->index('status', 'requisitions_status_idx');
            $table->index(['unit_id', 'budget_year'], 'requisitions_unit_id_budget_year_idx');
            $table->index(['division_id', 'budget_year'], 'requisitions_division_id_budget_year_idx');
        });

        Schema::table('rba_accounts', function (Blueprint $table) {
            $table->index('period_year', 'rba_accounts_period_year_idx');
            $table->index(['period_year', 'kategori_belanja'], 'rba_accounts_period_year_kategori_idx');
        });

        Schema::table('revenues', function (Blueprint $table) {
            $table->index('date', 'revenues_date_idx');
            $table->index(['date', 'source'], 'revenues_date_source_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('requisitions', function (Blueprint $table) {
            $table->dropIndex('requisitions_budget_year_status_idx');
            $table->dropIndex('requisitions_status_idx');
            $table->dropIndex('requisitions_unit_id_budget_year_idx');
            $table->dropIndex('requisitions_division_id_budget_year_idx');
        });

        Schema::table('rba_accounts', function (Blueprint $table) {
            $table->dropIndex('rba_accounts_period_year_idx');
            $table->dropIndex('rba_accounts_period_year_kategori_idx');
        });

        Schema::table('revenues', function (Blueprint $table) {
            $table->dropIndex('revenues_date_idx');
            $table->dropIndex('revenues_date_source_idx');
        });
    }
};
