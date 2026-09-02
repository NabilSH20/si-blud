<?php

namespace App\Http\Controllers\Perencanaan;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the Perencanaan dashboard.
     */
    public function index(): Response
    {
        return Inertia::render('Perencanaan/Dashboard');
    }
}
