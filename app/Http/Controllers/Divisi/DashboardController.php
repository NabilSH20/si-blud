<?php

namespace App\Http\Controllers\Divisi;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Display the Divisi dashboard.
     */
    public function index(): Response
    {
        return Inertia::render('Divisi/Dashboard');
    }
}
