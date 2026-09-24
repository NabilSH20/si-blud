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
        Schema::table('requisition_details', function (Blueprint $table) {
            if (Schema::hasColumn('requisition_details', 'rba_account_id')) {
                $table->dropConstrainedForeignId('rba_account_id');
            }
            if (Schema::hasColumn('requisition_details', 'jenis_belanja')) {
                $table->dropColumn('jenis_belanja');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('requisition_details', function (Blueprint $table) {
            if (!Schema::hasColumn('requisition_details', 'rba_account_id')) {
                $table->foreignId('rba_account_id')->nullable()->constrained('rba_accounts')->nullOnDelete();
            }
            if (!Schema::hasColumn('requisition_details', 'jenis_belanja')) {
                $table->string('jenis_belanja', 30)->default('Operasi');
            }
        });
    }
};
