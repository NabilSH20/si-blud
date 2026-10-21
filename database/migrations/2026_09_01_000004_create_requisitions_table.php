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
        Schema::create('requisitions', function (Blueprint $table) {
            $table->id();
            $table->string('requisition_number')->unique();
            $table->string('nomor_surat_unit')->nullable();
            $table->foreignId('division_id')->constrained('divisions');
            $table->foreignId('unit_id')->nullable()->constrained('units')->nullOnDelete();
            $table->foreignId('user_id')->constrained('users');
            $table->foreignId('rba_account_id')->nullable()->constrained('rba_accounts')->nullOnDelete();
            $table->string('jenis_belanja', 30)->default('Operasi');
            $table->string('sumber_dana')->default('BLUD');
            $table->string('program')->nullable()->default('Program Peningkatan Pelayanan Kesehatan Pada BLUD');
            $table->string('kegiatan')->nullable()->default('1. Pelayanan Kesehatan');
            $table->string('sub_kegiatan')->nullable();
            $table->text('tolok_ukur_output')->nullable();
            $table->string('target_output', 50)->nullable()->default('100%');
            $table->text('tolok_ukur_outcome')->nullable();
            $table->string('target_outcome', 50)->nullable()->default('100%');
            $table->text('urgency_reason')->nullable();
            $table->integer('fiscal_year')->default(2027);
            $table->integer('budget_year')->nullable();
            $table->enum('status', [
                'Pending_Perencanaan',
                'Diproses_Keuangan',
                'Disetujui_Selesai',
                'Ditolak',
            ])->default('Pending_Perencanaan');
            $table->date('submission_date');
            $table->decimal('total_estimated', 18, 2)->default(0);
            $table->decimal('total_operasional', 18, 2)->default(0);
            $table->decimal('total_modal', 18, 2)->default(0);
            $table->decimal('total_approved', 18, 2)->default(0);
            $table->text('notes_perencanaan')->nullable();
            $table->foreignId('verified_by_perencanaan_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('verified_perencanaan_at')->nullable();
            $table->text('notes_keuangan')->nullable();
            $table->foreignId('approved_by_keuangan_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('approved_keuangan_at')->nullable();
            $table->string('sp2d_number')->nullable();
            $table->string('receipt_number')->nullable();
            $table->timestamps();

            $table->index(['budget_year', 'status'], 'requisitions_budget_year_status_idx');
            $table->index('status', 'requisitions_status_idx');
            $table->index(['unit_id', 'budget_year'], 'requisitions_unit_id_budget_year_idx');
            $table->index(['division_id', 'budget_year'], 'requisitions_division_id_budget_year_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('requisitions');
    }
};
