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
            $table->string('sub_kegiatan')->nullable()->after('sumber_dana');
            $table->integer('fiscal_year')->default(2027)->after('sub_kegiatan');
            $table->string('nomor_surat_unit')->nullable()->after('requisition_number');
            $table->text('urgency_reason')->nullable()->after('sub_kegiatan');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('requisitions', function (Blueprint $table) {
            $table->dropColumn(['sub_kegiatan', 'fiscal_year', 'nomor_surat_unit', 'urgency_reason']);
        });
    }
};
