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
        Schema::create('rba_shifts', function (Blueprint $table) {
            $table->id();
            $table->year('year')->default(2026);
            $table->string('shift_name');
            $table->string('doc_title')->nullable()->default(null);
            $table->string('period_month')->default('Juli 2026');
            $table->decimal('penerimaan_silpa', 18, 2)->default(0);
            $table->decimal('penerimaan_divestasi', 18, 2)->default(0);
            $table->decimal('penerimaan_pinjaman', 18, 2)->default(0);
            $table->decimal('pengeluaran_investasi', 18, 2)->default(0);
            $table->decimal('pengeluaran_pokok_utang', 18, 2)->default(0);
            $table->enum('status', ['Draft', 'Aktif', 'Arsip'])->default('Aktif');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rba_shifts');
    }
};
