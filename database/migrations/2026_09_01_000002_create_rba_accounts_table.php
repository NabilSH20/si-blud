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
        Schema::create('rba_accounts', function (Blueprint $table) {
            $table->id();
            $table->string('account_code');
            $table->string('parent_code')->nullable()->index();
            $table->string('account_name');
            $table->string('kategori_belanja', 50)->default('Operasi');
            $table->string('sumber_dana')->default('BLUD');
            $table->string('funding_source')->nullable();
            $table->year('period_year')->default(2026);
            $table->integer('year')->nullable();
            $table->decimal('total_budget', 18, 2)->default(0);
            $table->decimal('budget_after_revision', 18, 2)->nullable();
            $table->decimal('remaining_budget', 18, 2)->default(0);
            $table->decimal('spent_budget', 18, 2)->default(0);
            $table->timestamps();

            $table->unique(['account_code', 'period_year']);
            $table->index('period_year', 'rba_accounts_period_year_idx');
            $table->index(['period_year', 'kategori_belanja'], 'rba_accounts_period_year_kategori_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rba_accounts');
    }
};
