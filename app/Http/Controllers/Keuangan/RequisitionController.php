<?php

namespace App\Http\Controllers\Keuangan;

use App\Http\Controllers\Controller;
use App\Models\Budget;
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
    public function index(): Response
    {
        $requisitions = Requisition::with(['division', 'user', 'requisitionDetails.item', 'budget'])
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

        return Inertia::render('Keuangan/Requisitions/Index', [
            'requisitions' => $requisitions,
            'success' => session('success'),
            'error' => session('error'),
        ]);
    }

    /**
     * Display the specified requisition for budget allocation and approval.
     */
    public function show(string $id): Response
    {
        $requisition = Requisition::with(['division', 'user', 'requisitionDetails.item', 'budget'])
            ->findOrFail($id);

        $budgets = Budget::orderBy('account_code')->get();

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
        $requisition = Requisition::with(['requisitionDetails.item'])->findOrFail($id);

        $validated = $request->validate([
            'status' => ['required', 'string', 'in:Disetujui_Selesai,Ditolak'],
            'budget_id' => ['nullable', 'required_if:status,Disetujui_Selesai', 'exists:budgets,id'],
        ], [
            'status.required' => 'Status persetujuan wajib dipilih.',
            'status.in' => 'Status tidak valid.',
            'budget_id.required_if' => 'Pilih rekening sumber pagu anggaran untuk memproses alokasi dana.',
            'budget_id.exists' => 'Rekening pagu anggaran yang dipilih tidak ditemukan.',
        ]);

        if ($validated['status'] === 'Disetujui_Selesai') {
            DB::transaction(function () use ($requisition, $validated) {
                // Calculate grand total from approved quantities and standard price
                $grandTotal = 0;
                foreach ($requisition->requisitionDetails as $detail) {
                    $qty = $detail->quantity_approved !== null
                        ? (int) $detail->quantity_approved
                        : (int) $detail->quantity_requested;
                    $price = (float) ($detail->unit_price ?? $detail->item?->standard_price ?? 0);
                    $grandTotal += ($qty * $price);
                }

                // Lock the budget record for update
                $budget = Budget::lockForUpdate()->findOrFail($validated['budget_id']);

                if ((float) $budget->remaining_budget < (float) $grandTotal) {
                    $formattedRemaining = 'Rp ' . number_format($budget->remaining_budget, 0, ',', '.');
                    $formattedTotal = 'Rp ' . number_format($grandTotal, 0, ',', '.');

                    throw ValidationException::withMessages([
                        'budget_id' => "Sisa pagu anggaran pada rekening {$budget->account_name} ({$formattedRemaining}) tidak mencukupi untuk membiayai total pengajuan sebesar {$formattedTotal}.",
                    ]);
                }

                // Deduct from remaining_budget
                $budget->remaining_budget = (float) $budget->remaining_budget - (float) $grandTotal;
                $budget->save();

                // Finalize requisition
                $requisition->update([
                    'status' => 'Disetujui_Selesai',
                    'budget_id' => $budget->id,
                ]);
            });

            return redirect()->route('keuangan.requisitions.index')
                ->with('success', "Pengajuan {$requisition->requisition_number} telah disetujui, dan saldo pagu anggaran berhasil dipotong.");
        } else {
            // Status Ditolak
            $requisition->update([
                'status' => 'Ditolak',
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
        $requisition = Requisition::with(['division', 'user', 'requisitionDetails.item'])->findOrFail($id);

        return Inertia::render('Shared/PrintRequisition', [
            'requisition' => $requisition,
        ]);
    }
}

