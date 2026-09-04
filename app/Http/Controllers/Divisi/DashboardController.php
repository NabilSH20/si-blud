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

        $recentRequisitions = Requisition::with(['rbaAccount', 'division'])
            ->where('user_id', $userId)
            ->latest('id')
            ->take(5)
            ->get();

        $totalEstimated = (float) Requisition::where('user_id', $userId)->sum('total_estimated');
        $totalApproved = (float) Requisition::where('user_id', $userId)
            ->where('status', 'Disetujui_Selesai')
            ->sum('total_approved');

        return Inertia::render('Divisi/Dashboard', [
            'total_requests' => Requisition::where('user_id', $userId)->count(),
            'pending_requests' => Requisition::where('user_id', $userId)->where('status', 'Pending_Perencanaan')->count(),
            'in_finance_requests' => Requisition::where('user_id', $userId)->where('status', 'Diproses_Keuangan')->count(),
            'approved_requests' => Requisition::where('user_id', $userId)->where('status', 'Disetujui_Selesai')->count(),
            'total_estimated' => $totalEstimated,
            'total_approved' => $totalApproved,
            'recent_requisitions' => $recentRequisitions,
        ]);
    }
}
