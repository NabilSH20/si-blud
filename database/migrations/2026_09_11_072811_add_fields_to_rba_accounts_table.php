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
        Schema::table('rba_accounts', function (Blueprint $table) {
            if (!Schema::hasColumn('rba_accounts', 'year')) {
                $table->integer('year')->nullable()->after('period_year');
            }
            if (!Schema::hasColumn('rba_accounts', 'funding_source')) {
                $table->string('funding_source')->nullable()->after('sumber_dana');
            }
            if (!Schema::hasColumn('rba_accounts', 'budget_after_revision')) {
                $table->decimal('budget_after_revision', 18, 2)->nullable()->after('total_budget');
            }
        });

        // Widen kategori_belanja to allow 'Operasional' (MySQL specific)
        if (\Illuminate\Support\Facades\DB::getDriverName() !== 'sqlite') {
            \Illuminate\Support\Facades\DB::statement("ALTER TABLE rba_accounts MODIFY kategori_belanja VARCHAR(50) DEFAULT 'Operasi'");
        }

        // Sync existing data
        \Illuminate\Support\Facades\DB::statement("UPDATE rba_accounts SET year = period_year WHERE year IS NULL");
        \Illuminate\Support\Facades\DB::statement("UPDATE rba_accounts SET funding_source = sumber_dana WHERE funding_source IS NULL");
        \Illuminate\Support\Facades\DB::statement("UPDATE rba_accounts SET budget_after_revision = total_budget WHERE budget_after_revision IS NULL");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('rba_accounts', function (Blueprint $table) {
            if (Schema::hasColumn('rba_accounts', 'year')) {
                $table->dropColumn('year');
            }
            if (Schema::hasColumn('rba_accounts', 'funding_source')) {
                $table->dropColumn('funding_source');
            }
            if (Schema::hasColumn('rba_accounts', 'budget_after_revision')) {
                $table->dropColumn('budget_after_revision');
            }
        });
    }
};
