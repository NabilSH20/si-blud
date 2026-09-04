<?php

namespace App\Http\Controllers\Perencanaan;

use App\Http\Controllers\Controller;
use App\Models\Requisition;
use App\Models\RequisitionDetail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class RequisitionController extends Controller
{
    /**
     * Display a listing of requisitions for verification.
     * Prioritizes requests with status 'Pending_Perencanaan'.
     */
    public function index(): Response
    {
        $requisitions = Requisition::with(['division', 'user', 'requisitionDetails.item', 'rbaAccount'])
            ->orderByRaw("CASE WHEN status = 'Pending_Perencanaan' THEN 0 ELSE 1 END")
            ->latest('submission_date')
            ->latest('id')
            ->get();

        return Inertia::render('Perencanaan/Requisitions/Index', [
            'requisitions' => $requisitions,
            'success' => session('success'),
            'error' => session('error'),
        ]);
    }

    /**
     * Display the specified requisition for verification.
     */
    public function show(string $id): Response
    {
        $requisition = Requisition::with(['division', 'user', 'requisitionDetails.item', 'rbaAccount'])
            ->findOrFail($id);

        return Inertia::render('Perencanaan/Requisitions/Show', [
            'requisition' => $requisition,
        ]);
    }

    /**
     * Update the verification status and approved quantities.
     */
    public function update(Request $request, string $id): RedirectResponse
    {
        $requisition = Requisition::with(['requisitionDetails'])->findOrFail($id);

        $validated = $request->validate([
            'status' => ['required', 'string', 'in:Diproses_Keuangan,Ditolak'],
            'notes_perencanaan' => ['nullable', 'string', 'max:500'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.id' => ['required', 'exists:requisition_details,id'],
            'items.*.quantity_approved' => ['required', 'integer', 'min:0'],
        ], [
            'status.required' => 'Status verifikasi wajib dipilih.',
            'status.in' => 'Status verifikasi harus berupa persetujuan atau penolakan.',
            'items.required' => 'Rincian barang wajib disertakan.',
            'items.*.quantity_approved.required' => 'Jumlah yang disetujui wajib diisi.',
            'items.*.quantity_approved.min' => 'Jumlah yang disetujui minimal 0.',
        ]);

        DB::transaction(function () use ($requisition, $validated) {
            $totalApproved = 0;

            // Update quantity_approved for each requisition detail
            foreach ($validated['items'] as $itemData) {
                $detail = RequisitionDetail::where('id', $itemData['id'])
                    ->where('requisition_id', $requisition->id)
                    ->first();

                if ($detail) {
                    $qtyApproved = (int) $itemData['quantity_approved'];
                    $subtotal = $qtyApproved * (float) $detail->unit_price;

                    $detail->update([
                        'quantity_approved' => $qtyApproved,
                        'subtotal' => $subtotal,
                    ]);

                    $totalApproved += $subtotal;
                }
            }

            // Update requisition status and total approved
            $requisition->update([
                'status' => $validated['status'],
                'total_approved' => $validated['status'] === 'Diproses_Keuangan' ? $totalApproved : 0,
                'notes_perencanaan' => $validated['notes_perencanaan'] ?? null,
            ]);
        });

        $message = $validated['status'] === 'Diproses_Keuangan'
            ? "Pengajuan {$requisition->requisition_number} berhasil disetujui dan diteruskan ke Bagian Keuangan."
            : "Pengajuan {$requisition->requisition_number} telah ditolak.";

        return redirect()->route('perencanaan.requisitions.index')
            ->with('success', $message);
    }
}
