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
            $table->enum('status', [
                'Pending_Perencanaan',
                'Diproses_Keuangan',
                'Disetujui_Selesai',
                'Ditolak',
            ]);
            $table->date('submission_date');
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
