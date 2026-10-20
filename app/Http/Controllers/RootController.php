<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class RootController extends Controller
{
    public function index()
    {
        /** @var User|null $user */
        $user = Auth::user();

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
