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
            $table->integer('budget_year')->nullable()->after('status');
        });

        // Initialize existing records with fiscal_year if available
        if (Schema::hasColumn('requisitions', 'fiscal_year')) {
            \Illuminate\Support\Facades\DB::statement('UPDATE requisitions SET budget_year = fiscal_year WHERE budget_year IS NULL');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('requisitions', function (Blueprint $table) {
            $table->dropColumn('budget_year');
        });
    }
};
