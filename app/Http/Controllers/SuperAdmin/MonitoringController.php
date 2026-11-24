<?php

namespace App\Http\Controllers\SuperAdmin;

use App\Http\Controllers\Controller;
use App\Models\Budget;
use App\Models\Division;
use App\Models\RbaAccount;
use App\Models\RbaShift;
use App\Models\Requisition;
use App\Models\Revenue;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MonitoringController extends Controller
{
    /**
     * Global monitoring of RBA and budget shifts (Read-Only).
     */
    public function rba(Request $request): Response
    {
        $activeYear = (int) session('active_year', date('Y'));

        $accounts = RbaAccount::where(function ($q) use ($activeYear) {
            $q->where('period_year', $activeYear)->orWhere('year', $activeYear);
        })
            ->orderBy('account_code')
            ->get();

        $shifts = RbaShift::where('year', $activeYear)
            ->orderByDesc('id')
            ->get();

        $totalOriginal = (float) $accounts->sum('total_budget');
        $totalAllocated = (float) $accounts->sum(function ($acc) {
            return $acc->budget_after_revision !== null ? (float) $acc->budget_after_revision : (float) $acc->total_budget;
        });

        return Inertia::render('SuperAdmin/Monitoring/Rba', [
            'active_year' => $activeYear,
            'accounts' => $accounts,
            'shifts' => $shifts,
            'total_original' => $totalOriginal,
            'total_allocated' => $totalAllocated,
        ]);
    }

    /**
     * Global monitoring of requisitions across all hospital units (Read-Only).
     */
    public function requisitions(Request $request): Response
    {
        $activeYear = (int) session('active_year', date('Y'));

        $query = Requisition::where(function ($q) use ($activeYear) {
            $q->where('budget_year', $activeYear)
                ->orWhere('fiscal_year', $activeYear);
        })->with([
            'division:id,name,division_code',
            'unit:id,name,unit_code',
            'user:id,name,nip',
            'verifiedByPerencanaan:id,name',
        ]);

        if ($request->filled('status') && $request->status !== 'ALL') {
            $query->where('status', $request->status);
        }

        if ($request->filled('division_id') && $request->division_id !== 'ALL') {
            $query->where('division_id', $request->division_id);
        }

        if ($request->filled('q')) {
            $q = $request->q;
            $query->where(function ($sub) use ($q) {
                $sub->where('requisition_number', 'like', "%{$q}%")
                    ->orWhere('urgency_reason', 'like', "%{$q}%")
                    ->orWhere('sub_kegiatan', 'like', "%{$q}%");
            });
        }

        $requisitions = $query->latest('created_at')->paginate(15)->withQueryString();
        $divisions = Division::orderBy('name')->get(['id', 'name', 'division_code']);

        return Inertia::render('SuperAdmin/Monitoring/Requisitions', [
            'active_year' => $activeYear,
            'requisitions' => $requisitions,
            'divisions' => $divisions,
            'filters' => $request->only(['status', 'division_id', 'q']),
        ]);
    }

    /**
     * Global monitoring of finance, revenues, and disbursements (Read-Only).
     */
    public function finance(Request $request): Response
    {
        $activeYear = (int) session('active_year', date('Y'));

        $revenues = Revenue::whereYear('date', $activeYear)
            ->latest('date')
            ->paginate(15)
            ->withQueryString();

        $totalRevenue = (float) Revenue::whereYear('date', $activeYear)->sum('amount');
        $budgets = Budget::where(function ($q) use ($activeYear) {
            $q->where('period_year', $activeYear)->orWhere('year', $activeYear);
        })->get();
        $totalDpa = (float) $budgets->sum('total_budget');

        $disbursedReqs = Requisition::where(function ($q) use ($activeYear) {
            $q->where('budget_year', $activeYear)->orWhere('fiscal_year', $activeYear);
        })
            ->where('status', 'Disetujui_Selesai')
            ->with(['division:id,name', 'unit:id,name'])
            ->latest('approved_keuangan_at')
            ->limit(10)
            ->get();

        return Inertia::render('SuperAdmin/Monitoring/Finance', [
            'active_year' => $activeYear,
            'revenues' => $revenues,
            'total_revenue' => $totalRevenue,
            'total_dpa' => $totalDpa,
            'disbursed_requisitions' => $disbursedReqs,
        ]);
    }
}
