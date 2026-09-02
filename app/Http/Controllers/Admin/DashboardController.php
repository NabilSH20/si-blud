<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the Admin dashboard.
     */
    public function index(): Response
    {
        return Inertia::render('Admin/Dashboard');
    }
}
