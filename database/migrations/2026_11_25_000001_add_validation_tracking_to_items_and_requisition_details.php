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
        Schema::table('items', function (Blueprint $table) {
            if (! Schema::hasColumn('items', 'pending_price')) {
                $table->decimal('pending_price', 18, 2)->nullable()->after('standard_price');
            }
            if (! Schema::hasColumn('items', 'price_status')) {
                $table->string('price_status', 30)->default('NONE')->after('pending_price');
            }
            if (! Schema::hasColumn('items', 'price_origin_unit_id')) {
                $table->foreignId('price_origin_unit_id')
                    ->nullable()
                    ->after('origin_unit_id')
                    ->constrained('units')
                    ->nullOnDelete();
            }
        });

        Schema::table('requisition_details', function (Blueprint $table) {
            if (! Schema::hasColumn('requisition_details', 'is_new_item')) {
                $table->boolean('is_new_item')->default(false)->after('specification');
            }
            if (! Schema::hasColumn('requisition_details', 'item_validation_status')) {
                $table->string('item_validation_status', 30)->nullable()->after('is_new_item');
            }
            if (! Schema::hasColumn('requisition_details', 'original_unit_price')) {
                $table->decimal('original_unit_price', 18, 2)->nullable()->after('unit_price');
            }
            if (! Schema::hasColumn('requisition_details', 'is_price_updated')) {
                $table->boolean('is_price_updated')->default(false)->after('original_unit_price');
            }
            if (! Schema::hasColumn('requisition_details', 'price_validation_status')) {
                $table->string('price_validation_status', 30)->default('NONE')->after('is_price_updated');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('requisition_details', function (Blueprint $table) {
            $cols = [];
            foreach (['is_new_item', 'item_validation_status', 'original_unit_price', 'is_price_updated', 'price_validation_status'] as $col) {
                if (Schema::hasColumn('requisition_details', $col)) {
                    $cols[] = $col;
                }
            }
            if (! empty($cols)) {
                $table->dropColumn($cols);
            }
        });

        Schema::table('items', function (Blueprint $table) {
            if (Schema::hasColumn('items', 'price_origin_unit_id')) {
                try {
                    $table->dropForeign(['price_origin_unit_id']);
                } catch (\Throwable $e) {
                    // Ignore if foreign key name differs or already dropped
                }
                $table->dropColumn('price_origin_unit_id');
            }
            $cols = [];
            foreach (['pending_price', 'price_status'] as $col) {
                if (Schema::hasColumn('items', $col)) {
                    $cols[] = $col;
                }
            }
            if (! empty($cols)) {
                $table->dropColumn($cols);
            }
        });
    }
};
