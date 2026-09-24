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
            $table->boolean('exceeds_ssh')->default(false)->after('unit_price');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('requisition_details', function (Blueprint $table) {
            $table->dropColumn('exceeds_ssh');
        });
    }
};
