<?php

namespace App\Http\Controllers\Keuangan;

use App\Http\Controllers\Controller;
use App\Models\RbaAccount;
use App\Models\Requisition;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class RequisitionController extends Controller
{
    /**
     * Display a listing of requisitions for finance validation.
     * Prioritizes requests with status 'Diproses_Keuangan' and 'Disetujui_Selesai'.
     */
    public function index(Request $request): Response
    {
        $activeYear = (int) session('active_year', date('Y'));
        $selectedYear = $request->filled('fiscal_year')
            ? $request->fiscal_year
            : ($request->filled('budget_year') ? $request->budget_year : $activeYear);

        $query = Requisition::with(['division', 'unit', 'user', 'requisitionDetails.item', 'rbaAccount', 'verifiedByPerencanaan', 'approvedByKeuangan']);

        if ($selectedYear !== 'ALL') {
            $query->where(function ($q) use ($selectedYear) {
                $q->where('budget_year', $selectedYear)
                  ->orWhere(function ($sq) use ($selectedYear) {
                      $sq->whereNull('budget_year')->where('fiscal_year', $selectedYear);
                  });
            });
        }

        $requisitions = $query
            ->orderByRaw("
                CASE
                    WHEN status = 'Diproses_Keuangan' THEN 0
                    WHEN status = 'Disetujui_Selesai' THEN 1
                    WHEN status = 'Pending_Perencanaan' THEN 2
                    ELSE 3
                END
            ")
            ->latest('submission_date')
            ->latest('id')
            ->get();

        $budgets = RbaAccount::orderBy('account_code')->get();

        return Inertia::render('Keuangan/Requisitions/Index', [
            'requisitions' => $requisitions,
            'budgets' => $budgets,
            'selectedYear' => $selectedYear,
            'active_year' => $activeYear,
            'success' => session('success'),
            'error' => session('error'),
        ]);
    }

    /**
     * Display the specified requisition for budget allocation and approval.
     */
    public function show(string $id): Response
    {
        $requisition = Requisition::with(['division', 'unit', 'user', 'requisitionDetails.item', 'rbaAccount', 'verifiedByPerencanaan', 'approvedByKeuangan'])
            ->findOrFail($id);

        $budgets = RbaAccount::orderBy('account_code')->get();

        return Inertia::render('Keuangan/Requisitions/Show', [
            'requisition' => $requisition,
            'budgets' => $budgets,
        ]);
    }

    /**
     * Update the finance approval status and deduct from the selected budget.
     */
    public function update(Request $request, string $id): RedirectResponse
    {
        $requisition = Requisition::with(['requisitionDetails.item', 'rbaAccount'])->findOrFail($id);

        $validated = $request->validate([
            'status' => ['required', 'string', 'in:Disetujui_Selesai,Ditolak'],
            'budget_id' => ['nullable', 'exists:rba_accounts,id'],
            'sp2d_number' => ['nullable', 'string', 'max:255'],
            'receipt_number' => ['nullable', 'string', 'max:255'],
            'notes_keuangan' => ['nullable', 'string', 'max:500'],
        ], [
            'status.required' => 'Status persetujuan wajib dipilih.',
            'status.in' => 'Status tidak valid.',
            'budget_id.exists' => 'Rekening pagu anggaran yang dipilih tidak ditemukan.',
        ]);

        if ($validated['status'] === 'Disetujui_Selesai') {
            DB::transaction(function () use ($requisition, $validated) {
                // Calculate grand total from approved quantities and price
                $grandTotal = 0;
                foreach ($requisition->requisitionDetails as $detail) {
                    $qty = $detail->quantity_approved !== null
                        ? (int) $detail->quantity_approved
                        : (int) $detail->quantity_requested;
                    $price = (float) ($detail->unit_price ?? $detail->item?->standard_price ?? 0);
                    $grandTotal += ($qty * $price);
                }

                // Determine budget ID (either passed from form or original requisition RBA account)
                $budgetId = $validated['budget_id'] ?? $requisition->rba_account_id;

                if (!$budgetId) {
                    throw ValidationException::withMessages([
                        'budget_id' => 'Rekening pagu anggaran belum ditentukan untuk pengajuan ini.',
                    ]);
                }

                // Lock the budget record for update
                $budget = RbaAccount::lockForUpdate()->findOrFail($budgetId);

                if ((float) $budget->remaining_budget < (float) $grandTotal) {
                    $formattedRemaining = 'Rp ' . number_format($budget->remaining_budget, 0, ',', '.');
                    $formattedTotal = 'Rp ' . number_format($grandTotal, 0, ',', '.');

                    throw ValidationException::withMessages([
                        'budget_id' => "Sisa pagu anggaran pada rekening {$budget->account_name} ({$formattedRemaining}) tidak mencukupi untuk membiayai total pengajuan sebesar {$formattedTotal}.",
                    ]);
                }

                // Deduct from remaining_budget, add to spent_budget
                $budget->remaining_budget = (float) $budget->remaining_budget - (float) $grandTotal;
                $budget->spent_budget = (float) $budget->spent_budget + (float) $grandTotal;
                $budget->save();

                // Finalize requisition
                $requisition->update([
                    'status' => 'Disetujui_Selesai',
                    'rba_account_id' => $budget->id,
                    'budget_id' => $budget->id,
                    'total_approved' => $grandTotal,
                    'sp2d_number' => $validated['sp2d_number'] ?? null,
                    'receipt_number' => $validated['receipt_number'] ?? null,
                    'notes_keuangan' => $validated['notes_keuangan'] ?? null,
                    'approved_by_keuangan_id' => auth()->id(),
                    'approved_keuangan_at' => now(),
                ]);
            });

            return redirect()->route('keuangan.requisitions.index')
                ->with('success', "Pengajuan {$requisition->requisition_number} telah disetujui, dan saldo pagu anggaran berhasil dicairkan.");
        } else {
            // Status Ditolak
            $requisition->update([
                'status' => 'Ditolak',
                'notes_keuangan' => $validated['notes_keuangan'] ?? null,
                'approved_by_keuangan_id' => auth()->id(),
                'approved_keuangan_at' => now(),
            ]);

            return redirect()->route('keuangan.requisitions.index')
                ->with('success', "Pengajuan {$requisition->requisition_number} telah ditolak oleh Bagian Keuangan.");
        }
    }

    /**
     * Print the specified requisition.
     */
    public function print($id): Response
    {
        $requisition = Requisition::with(['division', 'unit', 'user', 'requisitionDetails.item', 'rbaAccount', 'verifiedByPerencanaan', 'approvedByKeuangan'])->findOrFail($id);

        return Inertia::render('Shared/PrintRequisition', [
            'requisition' => $requisition,
        ]);
    }
}
