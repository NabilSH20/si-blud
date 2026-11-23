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
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('impersonator_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('action', 100)->comment('LOGIN, LOGOUT, CREATE_USER, UPDATE_ROLE, RBA_SHIFT, SP2D_DISBURSE, SETTING_UPDATE, EMERGENCY_OVERRIDE, IMPERSONATE_START, IMPERSONATE_STOP');
            $table->string('module', 50)->comment('AUTH, USERS, RBA, REQUISITIONS, FINANCE, SETTINGS, FISCAL_YEAR');
            $table->text('description');
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->json('payload_before')->nullable();
            $table->json('payload_after')->nullable();
            $table->timestamp('created_at')->nullable()->useCurrent();

            $table->index('module');
            $table->index('action');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
    }
};
