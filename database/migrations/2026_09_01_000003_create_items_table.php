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
        Schema::create('items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('rba_account_id')->nullable()->constrained('rba_accounts')->nullOnDelete();
            $table->string('item_code')->unique();
            $table->string('name');
            $table->text('specification')->nullable();
            $table->string('unit_type');
            $table->string('source')->default('STANDAR');
            $table->foreignId('origin_unit_id')->nullable()->constrained('units')->nullOnDelete();
            $table->decimal('standard_price', 18, 2)->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('items');
    }
};
