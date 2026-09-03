<?php

namespace App\Http\Controllers\Perencanaan;

use App\Http\Controllers\Controller;
use App\Models\RbaDraft;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class RbaController extends Controller
{
    /**
     * Display a listing of RBA drafts.
     */
    public function index(): Response
    {
        $rbas = RbaDraft::orderBy('year', 'desc')->orderBy('id', 'desc')->get();

        return Inertia::render('Perencanaan/RBA/Index', [
            'rbas' => $rbas,
            'current_year' => (int) Carbon::now()->format('Y'),
        ]);
    }

    /**
     * Show the form for creating a new RBA draft.
     */
    public function create(): Response
    {
        $defaultYear = (int) Carbon::now()->format('Y');

        return Inertia::render('Perencanaan/RBA/Create', [
            'default_year' => $defaultYear,
        ]);
    }

    /**
     * Store a newly created RBA draft.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'year' => ['required', 'integer', 'min:2020', 'max:2099'],
            'target_revenue' => ['required', 'numeric', 'min:0'],
            'planned_expense' => ['required', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        DB::transaction(function () use ($validated) {
            RbaDraft::create([
                'year' => $validated['year'],
                'target_revenue' => $validated['target_revenue'],
                'planned_expense' => $validated['planned_expense'],
                'status' => 'Draft',
                'notes' => $validated['notes'] ?? null,
            ]);
        });

        return redirect()->route('perencanaan.rba.index')
            ->with('success', 'Draft Rencana Bisnis dan Anggaran (RBA) berhasil disusun.');
    }

    /**
     * Lock and legalize the RBA draft.
     */
    public function sahkan(int $id): RedirectResponse
    {
        $rba = RbaDraft::findOrFail($id);

        DB::transaction(function () use ($rba) {
            $rba->status = 'Disahkan';
            $rba->save();
        });

        return redirect()->route('perencanaan.rba.index')
            ->with('success', "RBA Tahun Anggaran {$rba->year} berhasil disahkan dan dikunci secara resmi.");
    }
}

