<?php

namespace App\Http\Controllers\Perencanaan;

use App\Http\Controllers\Controller;
use App\Models\Item;
use App\Models\Requisition;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the Perencanaan dashboard.
     */
    public function index(): Response
    {
        $activeYear = session('active_year', date('Y'));

        $baseQuery = Requisition::where(function ($q) use ($activeYear) {
            $q->where('budget_year', $activeYear)
              ->orWhere(function ($sq) use ($activeYear) {
                  $sq->whereNull('budget_year')->where('fiscal_year', $activeYear);
              });
        });

        $pendingRequisitions = (clone $baseQuery)
            ->with(['division', 'rbaAccount'])
            ->where('status', 'Pending_Perencanaan')
            ->latest('submission_date')
            ->latest('id')
            ->take(5)
            ->get();

        return Inertia::render('Perencanaan/Dashboard', [
            'total_to_verify' => (clone $baseQuery)->where('status', 'Pending_Perencanaan')->count(),
            'total_verified' => (clone $baseQuery)->whereIn('status', ['Diproses_Keuangan', 'Disetujui_Selesai'])->count(),
            'total_items' => Item::count(),
            'pending_requisitions' => $pendingRequisitions,
            'active_year' => $activeYear,
        ]);
    }
}
