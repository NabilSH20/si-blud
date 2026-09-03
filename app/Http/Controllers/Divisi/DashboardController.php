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

        return Inertia::render('Divisi/Dashboard', [
            'total_requests' => Requisition::where('user_id', $userId)->count(),
            'pending_requests' => Requisition::where('user_id', $userId)->where('status', 'Pending_Perencanaan')->count(),
            'approved_requests' => Requisition::where('user_id', $userId)->where('status', 'Disetujui_Selesai')->count(),
        ]);
    }
}
