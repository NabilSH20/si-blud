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
        Schema::create('rba_expense_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('rba_shift_id')->constrained('rba_shifts')->cascadeOnDelete();
            $table->foreignId('rba_account_id')->nullable()->constrained('rba_accounts')->nullOnDelete();
            $table->string('account_code'); // e.g. '1', '1.1', '1.1.2.1.1'
            $table->string('account_name'); // e.g. 'Belanja obat-obatan'
            $table->string('parent_code')->nullable();
            $table->unsignedTinyInteger('level')->default(1); // 1 to 5
            $table->boolean('is_header')->default(false);

            // Sumber Dana Sebelum Pergeseran
            $table->decimal('before_jasa_layanan', 18, 2)->default(0);
            $table->decimal('before_hasil_kerjasama', 18, 2)->default(0);
            $table->decimal('before_lain_lain_sah', 18, 2)->default(0);
            $table->decimal('before_silpa', 18, 2)->default(0);
            $table->decimal('before_apbd', 18, 2)->default(0);
            $table->decimal('before_total', 18, 2)->default(0);

            // Sumber Dana Setelah Pergeseran
            $table->decimal('after_jasa_layanan', 18, 2)->default(0);
            $table->decimal('after_hasil_kerjasama', 18, 2)->default(0);
            $table->decimal('after_lain_lain_sah', 18, 2)->default(0);
            $table->decimal('after_silpa', 18, 2)->default(0);
            $table->decimal('after_apbd', 18, 2)->default(0);
            $table->decimal('after_total', 18, 2)->default(0);

            // Perubahan (Setelah - Sebelum) & Keterangan telaahan staf
            $table->decimal('difference', 18, 2)->default(0);
            $table->text('keterangan')->nullable();
            $table->integer('order_index')->default(0);
            $table->timestamps();

            $table->index(['rba_shift_id', 'order_index']);
            $table->index('account_code');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rba_expense_items');
    }
};
