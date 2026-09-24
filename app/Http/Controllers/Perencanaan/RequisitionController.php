<?php

namespace App\Http\Controllers\Perencanaan;

use App\Http\Controllers\Controller;
use App\Models\Requisition;
use App\Models\RequisitionDetail;
use App\Models\RbaAccount;
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
    public function index(Request $request): Response
    {
        $activeYear = (int) session('active_year', function () {
            return class_exists(\App\Models\FiscalYear::class)
                ? \App\Models\FiscalYear::getDefaultYear()
                : (int) date('Y');
        });

        $selectedYear = $request->filled('fiscal_year')
            ? $request->fiscal_year
            : ($request->filled('budget_year') ? $request->budget_year : $activeYear);

        $query = Requisition::with(['division', 'unit', 'user', 'requisitionDetails.item', 'rbaAccount', 'verifiedByPerencanaan', 'approvedByKeuangan'])
            ->where(function ($q) use ($selectedYear) {
                $q->where('budget_year', $selectedYear)
                  ->orWhere(function ($sq) use ($selectedYear) {
                      $sq->whereNull('budget_year')->where('fiscal_year', $selectedYear);
                  });
            });

        $requisitions = $query
            ->orderByRaw("CASE WHEN status = 'Pending_Perencanaan' THEN 0 ELSE 1 END")
            ->latest('submission_date')
            ->latest('id')
            ->get();

        return Inertia::render('Perencanaan/Requisitions/Index', [
            'requisitions' => $requisitions,
            'selectedYear' => $selectedYear,
            'active_year' => $activeYear,
            'success' => session('success'),
            'error' => session('error'),
        ]);
    }

    /**
     * Display the specified requisition for verification.
     */
    public function show(string $id): Response
    {
        $requisition = Requisition::with(['division', 'unit', 'user', 'requisitionDetails.item', 'rbaAccount', 'verifiedByPerencanaan', 'approvedByKeuangan'])
            ->findOrFail($id);

        $rbaList = RbaAccount::orderBy('account_code')->get();

        return Inertia::render('Perencanaan/Requisitions/Show', [
            'requisition' => $requisition,
            'rbaList' => $rbaList,
        ]);
    }

    /**
     * Update the verification status and approved quantities.
     */
    public function update(Request $request, string $id): RedirectResponse
    {
        abort_unless(auth()->user()->role === 'perencanaan', 403, 'Akses ditolak.');

        $requisition = Requisition::with(['requisitionDetails'])->findOrFail($id);

        $validated = $request->validate([
            'status' => ['required', 'string', 'in:Diproses_Keuangan,Ditolak'],
            'rba_account_id' => ['nullable', 'exists:rba_accounts,id'],
            'notes_perencanaan' => ['nullable', 'string', 'max:500'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.id' => ['required', 'exists:requisition_details,id'],
            'items.*.quantity_approved' => ['required', 'integer', 'min:0', function ($attribute, $value, $fail) use ($requisition) {
                $index = explode('.', $attribute)[1];
                $detailId = request()->input("items.{$index}.id");
                
                $detail = $requisition->requisitionDetails->firstWhere('id', $detailId);
                if ($detail && $value > $detail->quantity_requested) {
                    $fail("Jumlah disetujui tidak boleh melebihi jumlah diminta ({$detail->quantity_requested}).");
                }
            }],
        ], [
            'status.required' => 'Status verifikasi wajib dipilih.',
            'status.in' => 'Status verifikasi harus berupa persetujuan atau penolakan.',
            'items.required' => 'Rincian barang wajib disertakan.',
            'items.*.quantity_approved.required' => 'Jumlah yang disetujui wajib diisi.',
            'items.*.quantity_approved.min' => 'Jumlah yang disetujui minimal 0.',
        ]);

        if ($validated['status'] === 'Diproses_Keuangan') {
            $exceedsSSH = false;
            foreach ($validated['items'] as $itemData) {
                $detail = clone $requisition->requisitionDetails->firstWhere('id', $itemData['id']);
                // Load item if not loaded
                if ($detail && !$detail->relationLoaded('item')) {
                    $detail->load('item');
                }
                
                if ($detail && $detail->item && $detail->unit_price > $detail->item->standard_price) {
                    $exceedsSSH = true;
                    break;
                }
            }

            if ($exceedsSSH && empty($validated['notes_perencanaan'])) {
                throw \Illuminate\Validation\ValidationException::withMessages([
                    'notes_perencanaan' => 'Terdapat item dengan harga pengajuan melebihi Standar Satuan Harga (SSH). Wajib mengisi catatan alasan persetujuan.'
                ]);
            }
        }

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
                    
                    if (!$detail->relationLoaded('item')) {
                        $detail->load('item');
                    }
                    $isExceeding = $detail->item && $detail->unit_price > $detail->item->standard_price;

                    $detail->update([
                        'quantity_approved' => $qtyApproved,
                        'subtotal' => $subtotal,
                        'exceeds_ssh' => $isExceeding,
                    ]);

                    $totalApproved += $subtotal;
                }
            }

            // Update requisition status, verifier audit, total approved, and optionally rba_account_id
            $updateData = [
                'status' => $validated['status'],
                'total_approved' => $validated['status'] === 'Diproses_Keuangan' ? $totalApproved : 0,
                'notes_perencanaan' => $validated['notes_perencanaan'] ?? null,
                'verified_by_perencanaan_id' => auth()->id(),
                'verified_perencanaan_at' => now(),
            ];

            if (!empty($validated['rba_account_id'])) {
                $updateData['rba_account_id'] = $validated['rba_account_id'];
                $acc = RbaAccount::find($validated['rba_account_id']);
                if ($acc) {
                    $updateData['jenis_belanja'] = in_array($acc->kategori_belanja, ['Modal']) ? 'Modal' : 'Operasi';
                }
            }

            $requisition->update($updateData);
        });

        $message = $validated['status'] === 'Diproses_Keuangan'
            ? "Pengajuan {$requisition->requisition_number} berhasil disetujui dan diteruskan ke Bagian Keuangan."
            : "Pengajuan {$requisition->requisition_number} telah ditolak.";

        return redirect()->route('perencanaan.requisitions.index')
            ->with('success', $message);
    }
}
