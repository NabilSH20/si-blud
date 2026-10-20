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
            $table->dropUnique(['account_code']);
            $table->unique(['account_code', 'period_year']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('rba_accounts', function (Blueprint $table) {
            $table->dropUnique(['account_code', 'period_year']);
            $table->unique('account_code');
        });
    }
};
