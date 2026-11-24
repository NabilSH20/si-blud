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
        Schema::create('revenue_targets', function (Blueprint $table) {
            $table->id();
            $table->integer('fiscal_year')->comment('Tahun Anggaran BLUD, e.g. 2027');
            $table->string('source_name')->comment('Nama pos layanan sesuai sistem');
            $table->string('category', 100)->default('Jasa Layanan')->comment('Jasa Layanan, Hasil Kerja Sama, Lain-lain BLUD Sah');
            $table->enum('period_type', ['yearly', 'monthly', 'weekly'])->default('monthly')->comment('Tipe alokasi target');
            $table->decimal('target_yearly', 18, 2)->default(0)->comment('Total target tahunan');

            // Target per Bulan (Januari s/d Desember)
            $table->decimal('target_jan', 18, 2)->default(0);
            $table->decimal('target_feb', 18, 2)->default(0);
            $table->decimal('target_mar', 18, 2)->default(0);
            $table->decimal('target_apr', 18, 2)->default(0);
            $table->decimal('target_may', 18, 2)->default(0);
            $table->decimal('target_jun', 18, 2)->default(0);
            $table->decimal('target_jul', 18, 2)->default(0);
            $table->decimal('target_aug', 18, 2)->default(0);
            $table->decimal('target_sep', 18, 2)->default(0);
            $table->decimal('target_oct', 18, 2)->default(0);
            $table->decimal('target_nov', 18, 2)->default(0);
            $table->decimal('target_dec', 18, 2)->default(0);

            // Opsional breakdown mingguan dalam JSON
            $table->json('weekly_breakdown')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['fiscal_year', 'source_name'], 'revenue_targets_year_source_idx');
            $table->index('fiscal_year', 'revenue_targets_year_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('revenue_targets');
    }
};
