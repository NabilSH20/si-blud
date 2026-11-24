<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Perluas ENUM status terlebih dahulu agar memuat nilai baru 'Draft' dan 'Disetujui'
        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE requisitions MODIFY COLUMN status ENUM('Draft', 'Pending_Perencanaan', 'Diproses_Keuangan', 'Disetujui_Selesai', 'Disetujui', 'Ditolak') NOT NULL DEFAULT 'Pending_Perencanaan'");
        }

        // 2. Migrasikan data lama: Ubah status warisan menjadi Disetujui
        DB::table('requisitions')
            ->whereIn('status', ['Diproses_Keuangan', 'Disetujui_Selesai'])
            ->update(['status' => 'Disetujui']);

        // 3. Drop kolom warisan keuangan dari tabel requisitions
        Schema::table('requisitions', function (Blueprint $table) {
            if (Schema::hasColumn('requisitions', 'approved_by_keuangan_id')) {
                try {
                    $table->dropForeign(['approved_by_keuangan_id']);
                } catch (\Throwable $e) {
                    // Ignore if foreign key already dropped
                }
                $table->dropColumn('approved_by_keuangan_id');
            }

            $columnsToDrop = [];
            foreach (['approved_keuangan_at', 'notes_keuangan', 'sp2d_number', 'receipt_number'] as $col) {
                if (Schema::hasColumn('requisitions', $col)) {
                    $columnsToDrop[] = $col;
                }
            }

            if (!empty($columnsToDrop)) {
                $table->dropColumn($columnsToDrop);
            }
        });

        // 4. Kunci ENUM status akhir (buang Diproses_Keuangan dan Disetujui_Selesai)
        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE requisitions MODIFY COLUMN status ENUM('Draft', 'Pending_Perencanaan', 'Disetujui', 'Ditolak') NOT NULL DEFAULT 'Pending_Perencanaan'");
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('requisitions', function (Blueprint $table) {
            if (!Schema::hasColumn('requisitions', 'notes_keuangan')) {
                $table->text('notes_keuangan')->nullable();
            }
            if (!Schema::hasColumn('requisitions', 'approved_by_keuangan_id')) {
                $table->foreignId('approved_by_keuangan_id')->nullable()->constrained('users')->nullOnDelete();
            }
            if (!Schema::hasColumn('requisitions', 'approved_keuangan_at')) {
                $table->timestamp('approved_keuangan_at')->nullable();
            }
            if (!Schema::hasColumn('requisitions', 'sp2d_number')) {
                $table->string('sp2d_number')->nullable();
            }
            if (!Schema::hasColumn('requisitions', 'receipt_number')) {
                $table->string('receipt_number')->nullable();
            }
        });

        if (DB::getDriverName() === 'mysql') {
            DB::statement("ALTER TABLE requisitions MODIFY COLUMN status ENUM('Pending_Perencanaan', 'Diproses_Keuangan', 'Disetujui_Selesai', 'Ditolak', 'Draft', 'Disetujui') NOT NULL DEFAULT 'Pending_Perencanaan'");
        }
    }
};
