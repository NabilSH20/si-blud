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
        Schema::create('rba_revenue_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('rba_shift_id')->constrained('rba_shifts')->cascadeOnDelete();
            $table->string('item_code'); // e.g. '1', '1.a', '1.b', ..., '2', '3', '3.a', '4', '5'
            $table->string('item_name'); // e.g. 'JASA LAYANAN', 'Pendapatan Pelayanan Rawat Jalan'
            $table->string('parent_code')->nullable();
            $table->unsignedTinyInteger('level')->default(1); // 1 = Main Category / Header, 2 = Sub item
            $table->boolean('is_header')->default(false);
            $table->decimal('before_amount', 18, 2)->default(0);
            $table->decimal('after_amount', 18, 2)->default(0);
            $table->decimal('difference', 18, 2)->default(0);
            $table->text('keterangan')->nullable();
            $table->integer('order_index')->default(0);
            $table->timestamps();

            $table->index(['rba_shift_id', 'order_index']);
            $table->index('item_code');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rba_revenue_items');
    }
};
