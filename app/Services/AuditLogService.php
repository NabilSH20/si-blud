<?php

namespace App\Services;

use App\Models\ActivityLog;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

class AuditLogService
{
    /**
     * Record a system activity log.
     */
    public static function log(
        string $module,
        string $action,
        string $description,
        ?array $before = null,
        ?array $after = null,
        ?int $targetUserId = null
    ): ActivityLog {
        $userId = $targetUserId ?? Auth::id();
        $impersonatorId = session('impersonator_id');

        return ActivityLog::create([
            'user_id' => $userId,
            'impersonator_id' => $impersonatorId,
            'action' => strtoupper($action),
            'module' => strtoupper($module),
            'description' => $description,
            'ip_address' => Request::ip(),
            'user_agent' => Request::userAgent(),
            'payload_before' => $before,
            'payload_after' => $after,
            'created_at' => now(),
        ]);
    }
}
