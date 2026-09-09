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
        Schema::table('rba_shifts', function (Blueprint $table) {
            $table->decimal('penerimaan_silpa', 18, 2)->default(0)->after('period_month');
            $table->decimal('penerimaan_divestasi', 18, 2)->default(0)->after('penerimaan_silpa');
            $table->decimal('penerimaan_pinjaman', 18, 2)->default(0)->after('penerimaan_divestasi');
            $table->decimal('pengeluaran_investasi', 18, 2)->default(0)->after('penerimaan_pinjaman');
            $table->decimal('pengeluaran_pokok_utang', 18, 2)->default(0)->after('pengeluaran_investasi');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('rba_shifts', function (Blueprint $table) {
            $table->dropColumn([
                'penerimaan_silpa',
                'penerimaan_divestasi',
                'penerimaan_pinjaman',
                'pengeluaran_investasi',
                'pengeluaran_pokok_utang',
            ]);
        });
    }
};
