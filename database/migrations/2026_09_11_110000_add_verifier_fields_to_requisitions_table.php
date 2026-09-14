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
            $table->foreignId('verified_by_perencanaan_id')
                ->nullable()
                ->after('notes_perencanaan')
                ->constrained('users')
                ->nullOnDelete();
            $table->timestamp('verified_perencanaan_at')
                ->nullable()
                ->after('verified_by_perencanaan_id');

            $table->foreignId('approved_by_keuangan_id')
                ->nullable()
                ->after('notes_keuangan')
                ->constrained('users')
                ->nullOnDelete();
            $table->timestamp('approved_keuangan_at')
                ->nullable()
                ->after('approved_by_keuangan_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('requisitions', function (Blueprint $table) {
            $table->dropForeign(['verified_by_perencanaan_id']);
            $table->dropColumn(['verified_by_perencanaan_id', 'verified_perencanaan_at']);

            $table->dropForeign(['approved_by_keuangan_id']);
            $table->dropColumn(['approved_by_keuangan_id', 'approved_keuangan_at']);
        });
    }
};
