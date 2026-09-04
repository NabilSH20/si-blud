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
            $table->string('account_code')->unique(); // e.g. '1.1.2.1.1', '1.1.2.1.2.1', '1.2.02.05.01'
            $table->string('account_name');           // e.g. 'Belanja bahan habis pakai material kesehatan'
            $table->enum('kategori_belanja', ['Operasi', 'Modal'])->default('Operasi');
            $table->string('sumber_dana')->default('BLUD'); // BLUD, APBD
            $table->year('period_year')->default(2026);
            $table->decimal('total_budget', 18, 2)->default(0);
            $table->decimal('remaining_budget', 18, 2)->default(0);
            $table->decimal('spent_budget', 18, 2)->default(0);
            $table->timestamps();
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
