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
        return Inertia::render('Perencanaan/Dashboard', [
            'total_to_verify' => Requisition::where('status', 'Pending_Perencanaan')->count(),
            'total_items' => Item::count(),
        ]);
    }
}
