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
            $table->foreignId('division_id')->constrained('divisions');
            $table->foreignId('user_id')->constrained('users');
            $table->foreignId('rba_account_id')->nullable()->constrained('rba_accounts')->nullOnDelete();
            $table->foreignId('budget_id')->nullable()->constrained('rba_accounts')->nullOnDelete();
            $table->enum('jenis_belanja', ['Operasi', 'Modal'])->default('Operasi');
            $table->string('sumber_dana')->default('BLUD');
            $table->enum('status', [
                'Pending_Perencanaan',
                'Diproses_Keuangan',
                'Disetujui_Selesai',
                'Ditolak',
            ])->default('Pending_Perencanaan');
            $table->date('submission_date');
            $table->decimal('total_estimated', 18, 2)->default(0);
            $table->decimal('total_approved', 18, 2)->default(0);
            $table->text('notes_perencanaan')->nullable();
            $table->text('notes_keuangan')->nullable();
            $table->string('sp2d_number')->nullable();
            $table->string('receipt_number')->nullable();
            $table->timestamps();
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
