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
        $user = auth()->user()->load(['division', 'unit']);
        $userId = $user->id;
        $activeYear = session('active_year', date('Y'));

        $baseQuery = Requisition::query();

        // Isolasi data pengajuan per unit kerja staf yang login (selaras dengan RequisitionController)
        if ($user->unit_id) {
            $baseQuery->where('unit_id', $user->unit_id);
        } elseif ($user->division_id) {
            $baseQuery->where('division_id', $user->division_id);
        } else {
            $baseQuery->where('user_id', $userId);
        }

        $baseQuery->where(function ($q) use ($activeYear) {
            $q->where('budget_year', $activeYear)
              ->orWhere(function ($sq) use ($activeYear) {
                  $sq->whereNull('budget_year')->where('fiscal_year', $activeYear);
              });
        });

        $recentRequisitions = (clone $baseQuery)
            ->with(['rbaAccount', 'division', 'unit'])
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
            'rejected_requests' => (clone $baseQuery)->where('status', 'Ditolak')->count(),
            'total_estimated' => $totalEstimated,
            'total_approved' => $totalApproved,
            'recent_requisitions' => $recentRequisitions,
            'active_year' => $activeYear,
            'user_division' => $user->division,
            'user_unit' => $user->unit,
        ]);
    }
}
