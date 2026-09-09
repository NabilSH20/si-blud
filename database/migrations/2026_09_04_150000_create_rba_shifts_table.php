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
            $table->string('shift_name'); // e.g. 'Murni', 'Pergeseran I', 'Pergeseran II', 'Pergeseran III', 'Pergeseran IV'
            $table->string('doc_title')->default('RENCANA BISNIS DAN ANGGARAN PERGESERAN III');
            $table->string('period_month')->default('Juli 2026');
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
