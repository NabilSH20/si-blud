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
            $table->string('program')->nullable()->default('Program Peningkatan Pelayanan Kesehatan Pada BLUD')->after('sumber_dana');
            $table->text('tolok_ukur_output')->nullable()->after('sub_kegiatan');
            $table->string('target_output')->nullable()->default('100%')->after('tolok_ukur_output');
            $table->text('tolok_ukur_outcome')->nullable()->after('target_output');
            $table->string('target_outcome')->nullable()->default('100%')->after('tolok_ukur_outcome');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('requisitions', function (Blueprint $table) {
            $table->dropColumn([
                'program',
                'tolok_ukur_output',
                'target_output',
                'tolok_ukur_outcome',
                'target_outcome',
            ]);
        });
    }
};
