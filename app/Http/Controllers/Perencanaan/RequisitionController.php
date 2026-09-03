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
        $requisitions = Requisition::with(['division', 'user', 'requisitionDetails.item'])
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
        $requisition = Requisition::with(['division', 'user', 'requisitionDetails.item'])
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
        $requisition = Requisition::findOrFail($id);

        $validated = $request->validate([
            'status' => ['required', 'string', 'in:Diproses_Keuangan,Ditolak'],
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
            // Update requisition status
            $requisition->update([
                'status' => $validated['status'],
            ]);

            // Update quantity_approved for each requisition detail
            foreach ($validated['items'] as $itemData) {
                RequisitionDetail::where('id', $itemData['id'])
                    ->where('requisition_id', $requisition->id)
                    ->update([
                        'quantity_approved' => (int) $itemData['quantity_approved'],
                    ]);
            }
        });

        $message = $validated['status'] === 'Diproses_Keuangan'
            ? "Pengajuan {$requisition->requisition_number} berhasil disetujui dan diteruskan ke Bagian Keuangan."
            : "Pengajuan {$requisition->requisition_number} telah ditolak.";

        return redirect()->route('perencanaan.requisitions.index')
            ->with('success', $message);
    }
}

