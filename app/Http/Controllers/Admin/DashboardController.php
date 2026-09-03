<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Division;
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
        $roleMap = [
            'admin' => 'Admin Sistem',
            'divisi' => 'Unit / Divisi',
            'perencanaan' => 'Perencanaan',
            'keuangan' => 'Keuangan',
        ];

        $usersByRole = User::select('role', DB::raw('count(*) as total'))
            ->groupBy('role')
            ->get()
            ->map(function ($item) use ($roleMap) {
                return [
                    'name' => $roleMap[$item->role] ?? ucfirst($item->role),
                    'total' => (int) $item->total,
                ];
            });

        $requisitionsByDivision = Division::withCount('requisitions')
            ->orderByDesc('requisitions_count')
            ->limit(6)
            ->get()
            ->map(function ($division) {
                return [
                    'name' => $division->name,
                    'total' => (int) $division->requisitions_count,
                ];
            });

        return Inertia::render('Admin/Dashboard', [
            'total_users' => User::count(),
            'total_divisions' => Division::count(),
            'users_by_role' => $usersByRole,
            'requisitions_by_division' => $requisitionsByDivision,
        ]);
    }
}
