<?php

namespace App\Http\Controllers\Divisi;

use App\Http\Controllers\Controller;
use App\Models\Requisition;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the Divisi dashboard.
     */
    public function index(): Response
    {
        $userId = auth()->id();
        $activeYear = session('active_year', date('Y'));

        $baseQuery = Requisition::where('user_id', $userId)
            ->where(function ($q) use ($activeYear) {
                $q->where('budget_year', $activeYear)
                  ->orWhere(function ($sq) use ($activeYear) {
                      $sq->whereNull('budget_year')->where('fiscal_year', $activeYear);
                  });
            });

        $recentRequisitions = (clone $baseQuery)
            ->with(['rbaAccount', 'division'])
            ->latest('id')
            ->take(5)
            ->get();

        $totalEstimated = (float) (clone $baseQuery)->sum('total_estimated');
        $totalApproved = (float) (clone $baseQuery)
            ->where('status', 'Disetujui_Selesai')
            ->sum('total_approved');

        return Inertia::render('Divisi/Dashboard', [
            'total_requests' => (clone $baseQuery)->count(),
            'pending_requests' => (clone $baseQuery)->where('status', 'Pending_Perencanaan')->count(),
            'in_finance_requests' => (clone $baseQuery)->where('status', 'Diproses_Keuangan')->count(),
            'approved_requests' => (clone $baseQuery)->where('status', 'Disetujui_Selesai')->count(),
            'total_estimated' => $totalEstimated,
            'total_approved' => $totalApproved,
            'recent_requisitions' => $recentRequisitions,
            'active_year' => $activeYear,
        ]);
    }
}
