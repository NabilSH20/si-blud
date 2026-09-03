<?php

namespace App\Http\Controllers\Keuangan;

use App\Http\Controllers\Controller;
use App\Models\Budget;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the Keuangan dashboard.
     */
    public function index(): Response
    {
        return Inertia::render('Keuangan/Dashboard', [
            'budgetsCount' => Budget::count(),
            'remainingTotal' => Budget::sum('remaining_budget'),
        ]);
    }
}
