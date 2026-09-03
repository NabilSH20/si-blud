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
        Schema::create('rba_drafts', function (Blueprint $table) {
            $table->id();
            $table->integer('year');
            $table->decimal('target_revenue', 15, 2);
            $table->decimal('planned_expense', 15, 2);
            $table->enum('status', ['Draft', 'Disahkan'])->default('Draft');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rba_drafts');
    }
};

