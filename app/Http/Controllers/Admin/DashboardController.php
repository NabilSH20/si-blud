<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Division;
use App\Models\Item;
use App\Models\Requisition;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the Admin dashboard.
     */
    public function index(): Response
    {
        $activeYear = (int) session('active_year', date('Y'));
        $authUser = auth()->user()->load(['division', 'unit']);

        $roleMap = [
            'admin' => 'Admin Sistem',
            'divisi' => 'Unit / Divisi',
            'perencanaan' => 'Perencanaan',
            'keuangan' => 'Keuangan',
        ];

        $totalUsers = User::count();
        $activeUsers = User::where('is_active', true)->count();
        $inactiveUsers = $totalUsers - $activeUsers;

        $usersByRole = User::select('role', DB::raw('count(*) as total'))
            ->groupBy('role')
            ->get()
            ->map(function ($item) use ($roleMap, $totalUsers) {
                $count = (int) $item->total;
                $pct = $totalUsers > 0 ? round(($count / $totalUsers) * 100, 1) : 0;
                return [
                    'role_key' => $item->role,
                    'name' => $roleMap[$item->role] ?? ucfirst($item->role),
                    'total' => $count,
                    'percentage' => $pct,
                ];
            });

        // Requisitions in active budget year
        $reqQuery = Requisition::where(function ($q) use ($activeYear) {
            $q->where('budget_year', $activeYear)
              ->orWhere('fiscal_year', $activeYear);
        });

        $totalRequisitions = (clone $reqQuery)->count();
        $pendingPerencanaan = (clone $reqQuery)->where('status', 'Pending_Perencanaan')->count();
        $diprosesKeuangan = (clone $reqQuery)->where('status', 'Diproses_Keuangan')->count();
        $disetujuiSelesai = (clone $reqQuery)->where('status', 'Disetujui_Selesai')->count();
        $ditolak = (clone $reqQuery)->where('status', 'Ditolak')->count();
        $totalEstimatedPagu = (float) (clone $reqQuery)->sum('total_estimated');

        // Recent 5 requisitions across hospital
        $recentRequisitions = (clone $reqQuery)
            ->with(['division:id,name', 'unit:id,name', 'user:id,name'])
            ->latest()
            ->limit(5)
            ->get([
                'id',
                'requisition_number',
                'division_id',
                'unit_id',
                'user_id',
                'jenis_belanja',
                'total_estimated',
                'status',
                'created_at',
            ]);

        // Recent 5 registered users
        $recentUsers = User::with(['division:id,name', 'unit:id,name'])
            ->latest()
            ->limit(5)
            ->get([
                'id',
                'name',
                'email',
                'nip',
                'role',
                'position',
                'division_id',
                'unit_id',
                'is_active',
                'created_at',
            ]);

        // Requisitions per division
        $requisitionsByDivision = Division::withCount(['requisitions' => function ($q) use ($activeYear) {
            $q->where('budget_year', $activeYear)->orWhere('fiscal_year', $activeYear);
        }])
            ->orderByDesc('requisitions_count')
            ->limit(5)
            ->get()
            ->map(function ($division) {
                return [
                    'name' => $division->name,
                    'total' => (int) $division->requisitions_count,
                ];
            });

        // Divisions with units for cascading filter dropdowns
        $divisions = Division::with(['units:id,division_id,name'])
            ->orderBy('name')
            ->get(['id', 'name']);

        // Apply server-side filtering for users
        $usersQuery = User::with(['division:id,name', 'unit:id,name'])->orderBy('name');

        if (request()->filled('division')) {
            $usersQuery->where('division_id', request('division'));
        }
        if (request()->filled('unit')) {
            $usersQuery->where('unit_id', request('unit'));
        }
        if (request()->filled('role')) {
            $usersQuery->where('role', request('role'));
        }
        if (request()->filled('status')) {
            $usersQuery->where('is_active', request('status') === '1');
        }
        if (request()->filled('search')) {
            $search = request('search');
            $usersQuery->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('nip', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('position', 'like', "%{$search}%");
            });
        }

        // Unpaginated filtered users for charts
        $chartUsers = clone $usersQuery;
        $chartUsers = $chartUsers->get([
            'id', 'name', 'email', 'nip', 'role', 'position', 'division_id', 'unit_id', 'is_active', 'created_at'
        ]);

        // Paginated users for the table
        $allUsers = $usersQuery->paginate(10)->withQueryString();

        // Users count per division for distribution chart (Overall system stat)
        $usersByDivision = Division::withCount('users')
            ->orderByDesc('users_count')
            ->get()
            ->map(function ($div) {
                return [
                    'id' => $div->id,
                    'name' => $div->name,
                    'total' => (int) $div->users_count,
                ];
            });

        return Inertia::render('Admin/Dashboard', [
            'admin_profile' => [
                'name' => $authUser->name,
                'nip' => $authUser->nip ?: '-',
                'email' => $authUser->email,
                'role' => $authUser->role,
                'role_label' => $roleMap[$authUser->role] ?? 'Administrator',
                'position' => $authUser->position ?: 'Pranata Komputer / IT SIM-RS',
                'division_name' => $authUser->division?->name ?: 'Sub Bagian Tata Usaha',
                'unit_name' => $authUser->unit?->name ?: 'Instalasi SIM-RS & IT',
            ],
            'system_stats' => [
                'total_users' => $totalUsers,
                'active_users' => $activeUsers,
                'inactive_users' => $inactiveUsers,
                'total_divisions' => Division::count(),
                'total_units' => Unit::count(),
                'total_items' => Item::count(),
            ],
            'requisition_stats' => [
                'active_year' => $activeYear,
                'total' => $totalRequisitions,
                'pending_perencanaan' => $pendingPerencanaan,
                'diproses_keuangan' => $diprosesKeuangan,
                'disetujui_selesai' => $disetujuiSelesai,
                'ditolak' => $ditolak,
                'total_amount' => $totalEstimatedPagu,
            ],
            'users_by_role' => $usersByRole,
            'recent_requisitions' => $recentRequisitions,
            'recent_users' => $recentUsers,
            'requisitions_by_division' => $requisitionsByDivision,
            'divisions' => $divisions,
            'all_users' => $allUsers,
            'chart_users' => $chartUsers,
            'users_by_division' => $usersByDivision,
            'server_status' => [
                'php_version' => PHP_VERSION,
                'laravel_version' => app()->version(),
                'environment' => config('app.env'),
                'server_time' => now()->translatedFormat('l, d F Y H:i:s'),
            ],
            // Backwards compatibility props
            'total_users' => $totalUsers,
            'total_divisions' => Division::count(),
        ]);
    }
}
