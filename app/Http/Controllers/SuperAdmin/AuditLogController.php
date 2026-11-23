<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AuditLogController extends Controller
{
    /**
     * Display a listing of system audit logs.
     */
    public function index(Request $request): Response
    {
        $query = ActivityLog::with([
            'user:id,name,email,role,nip',
            'impersonator:id,name,email',
        ]);

        if ($request->filled('module') && $request->module !== 'ALL') {
            $query->where('module', $request->module);
        }

        if ($request->filled('action') && $request->action !== 'ALL') {
            $query->where('action', $request->action);
        }

        if ($request->filled('user_id') && $request->user_id !== 'ALL') {
            $query->where('user_id', $request->user_id);
        }

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        if ($request->filled('q')) {
            $q = $request->q;
            $query->where(function ($sub) use ($q) {
                $sub->where('description', 'like', "%{$q}%")
                    ->orWhere('action', 'like', "%{$q}%")
                    ->orWhere('ip_address', 'like', "%{$q}%")
                    ->orWhereHas('user', fn ($u) => $u->where('name', 'like', "%{$q}%")->orWhere('nip', 'like', "%{$q}%"));
            });
        }

        $logs = $query->latest('created_at')->paginate(20)->withQueryString();

        $modules = ActivityLog::select('module')->distinct()->pluck('module');
        $actions = ActivityLog::select('action')->distinct()->pluck('action');
        $users = User::select('id', 'name', 'role')->orderBy('name')->get();

        return Inertia::render('SuperAdmin/AuditLogs/Index', [
            'logs' => $logs,
            'filters' => $request->only(['module', 'action', 'user_id', 'date_from', 'date_to', 'q']),
            'available_modules' => $modules,
            'available_actions' => $actions,
            'users' => $users,
        ]);
    }
}
