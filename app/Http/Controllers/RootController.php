<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class RootController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        if ($user) {
            return redirect($user->dashboardPath());
        }

        return redirect('/login');
    }

    public function setYear(Request $request)
    {
        $request->validate([
            'year' => [
                'required',
                'integer',
                Rule::exists('fiscal_years', 'year')->where('is_active', true),
            ],
        ]);

        session(['active_year' => (int) $request->year]);
        return back();
    }
}
