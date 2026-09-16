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
            $table->unsignedBigInteger('rba_account_id')->nullable()->change();
            $table->string('jenis_belanja', 30)->default('Operasi')->change();
            if (!Schema::hasColumn('requisitions', 'total_operasional')) {
                $table->decimal('total_operasional', 18, 2)->default(0)->after('total_estimated');
            }
            if (!Schema::hasColumn('requisitions', 'total_modal')) {
                $table->decimal('total_modal', 18, 2)->default(0)->after('total_operasional');
            }
        });

        Schema::table('requisition_details', function (Blueprint $table) {
            if (!Schema::hasColumn('requisition_details', 'rba_account_id')) {
                $table->foreignId('rba_account_id')->nullable()->after('requisition_id')->constrained('rba_accounts')->nullOnDelete();
            }
            if (!Schema::hasColumn('requisition_details', 'jenis_belanja')) {
                $table->string('jenis_belanja', 30)->default('Operasi')->after('rba_account_id');
            }
        });

        // Backfill data eksisting agar sinkron
        if (DB::getDriverName() === 'sqlite') {
            DB::statement("UPDATE requisition_details SET rba_account_id = (SELECT rba_account_id FROM requisitions WHERE requisitions.id = requisition_details.requisition_id), jenis_belanja = COALESCE((SELECT jenis_belanja FROM requisitions WHERE requisitions.id = requisition_details.requisition_id), 'Operasi') WHERE rba_account_id IS NULL");
        } else {
            DB::statement("UPDATE requisition_details d JOIN requisitions r ON d.requisition_id = r.id SET d.rba_account_id = r.rba_account_id, d.jenis_belanja = COALESCE(r.jenis_belanja, 'Operasi') WHERE d.rba_account_id IS NULL");
        }
        DB::statement("UPDATE requisitions SET total_operasional = total_estimated WHERE jenis_belanja = 'Operasi' AND (total_operasional = 0 OR total_operasional IS NULL)");
        DB::statement("UPDATE requisitions SET total_modal = total_estimated WHERE jenis_belanja = 'Modal' AND (total_modal = 0 OR total_modal IS NULL)");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('requisition_details', function (Blueprint $table) {
            if (Schema::hasColumn('requisition_details', 'rba_account_id')) {
                $table->dropConstrainedForeignId('rba_account_id');
            }
            if (Schema::hasColumn('requisition_details', 'jenis_belanja')) {
                $table->dropColumn('jenis_belanja');
            }
        });

        Schema::table('requisitions', function (Blueprint $table) {
            if (Schema::hasColumn('requisitions', 'total_modal')) {
                $table->dropColumn('total_modal');
            }
            if (Schema::hasColumn('requisitions', 'total_operasional')) {
                $table->dropColumn('total_operasional');
            }
            $table->enum('jenis_belanja', ['Operasi', 'Modal'])->default('Operasi')->change();
        });
    }
};
