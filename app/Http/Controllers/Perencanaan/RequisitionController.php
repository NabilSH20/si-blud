<?php

namespace App\Http\Controllers\Perencanaan;

use App\Http\Controllers\Controller;
use App\Models\FiscalYear;
use App\Models\RbaAccount;
use App\Models\Requisition;
use App\Models\RequisitionDetail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
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
            return class_exists(FiscalYear::class)
                ? FiscalYear::getDefaultYear()
                : (int) date('Y');
        });

        $selectedYear = $request->filled('budget_year')
            ? $request->budget_year
            : ($request->filled('fiscal_year') ? $request->fiscal_year : $activeYear);

        $query = Requisition::with(['division', 'unit', 'user', 'requisitionDetails.item', 'rbaAccount', 'verifiedByPerencanaan', 'approvedByKeuangan'])
            ->where(function ($q) use ($selectedYear, $request) {
                if ($request->filled('budget_year')) {
                    $q->where('budget_year', (int) $request->budget_year)
                        ->orWhere(function ($sq) use ($request) {
                            $sq->whereNull('budget_year')->where('fiscal_year', (int) $request->budget_year);
                        });
                } elseif ($request->filled('fiscal_year')) {
                    $q->where('budget_year', (int) $request->fiscal_year)
                        ->orWhere('fiscal_year', (int) $request->fiscal_year);
                } else {
                    $q->where('budget_year', $selectedYear)
                        ->orWhere(function ($sq) use ($selectedYear) {
                            $sq->whereNull('budget_year')->where('fiscal_year', $selectedYear);
                        });
                }
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

        $year = (int) ($requisition->budget_year ?? $requisition->fiscal_year ?? session('active_year', date('Y')));

        $rawAccountId = $requisition->rba_account_id ?: $requisition->requisitionDetails->first(fn ($d) => ! empty($d->item?->rba_account_id))?->item?->rba_account_id;
        if ($rawAccountId) {
            $resolvedAcc = RbaAccount::resolveForYear($rawAccountId, $year);
            if ($resolvedAcc) {
                $requisition->setRelation('rbaAccount', $resolvedAcc);
                $requisition->rba_account_id = $resolvedAcc->id;
            }
        }

        $rbaList = RbaAccount::where('period_year', $year)
            ->orderBy('account_code')
            ->get();

        if ($rbaList->isEmpty()) {
            $rbaList = RbaAccount::orderBy('account_code')->get();
        }

        // Hitung komitmen pagu yang sedang diproses di Keuangan (status 'Diproses_Keuangan')
        $committedByAccount = Requisition::where('status', 'Diproses_Keuangan')
            ->where(function ($q) use ($year) {
                $q->where('budget_year', $year)->orWhere('fiscal_year', $year);
            })
            ->whereNotNull('rba_account_id')
            ->selectRaw('rba_account_id, sum(total_approved) as total_committed')
            ->groupBy('rba_account_id')
            ->pluck('total_committed', 'rba_account_id')
            ->toArray();

        $rbaList->transform(function ($acc) use ($committedByAccount) {
            $committed = (float) ($committedByAccount[$acc->id] ?? 0);
            $acc->committed_budget = $committed;
            $acc->available_budget = max(0, (float) $acc->remaining_budget - $committed);

            return $acc;
        });

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
        abort_unless(Auth::user()?->role === 'perencanaan', 403, 'Akses ditolak.');

        $requisition = Requisition::with(['requisitionDetails.item'])->findOrFail($id);

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

        $reqYear = (int) ($requisition->budget_year ?? $requisition->fiscal_year ?? date('Y'));
        $chosenAccountId = ! empty($validated['rba_account_id'])
            ? $validated['rba_account_id']
            : ($requisition->rba_account_id ?: $requisition->requisitionDetails->first(fn ($d) => ! empty($d->item?->rba_account_id))?->item?->rba_account_id);
        $resolvedAccount = RbaAccount::resolveForYear($chosenAccountId, $reqYear);
        $targetAccountId = $resolvedAccount?->id;

        if ($validated['status'] === 'Diproses_Keuangan') {
            $exceedsSSH = false;
            $calculatedTotalApproved = 0;

            foreach ($validated['items'] as $itemData) {
                $detail = clone $requisition->requisitionDetails->firstWhere('id', $itemData['id']);
                // Load item if not loaded
                if ($detail && ! $detail->relationLoaded('item')) {
                    $detail->load('item');
                }

                if ($detail && $detail->item && $detail->unit_price > $detail->item->standard_price) {
                    $exceedsSSH = true;
                }

                if ($detail) {
                    $calculatedTotalApproved += (int) $itemData['quantity_approved'] * (float) $detail->unit_price;
                }
            }

            if ($exceedsSSH && empty($validated['notes_perencanaan'])) {
                throw ValidationException::withMessages([
                    'notes_perencanaan' => 'Terdapat item dengan harga pengajuan melebihi Standar Satuan Harga (SSH). Wajib mengisi catatan alasan persetujuan.',
                ]);
            }

            // Task 3: Pengecekan Komitmen Pagu (Pagu Terikat / Diproses_Keuangan)
            if ($resolvedAccount) {
                $committedBudget = (float) Requisition::where('rba_account_id', $resolvedAccount->id)
                    ->where('status', 'Diproses_Keuangan')
                    ->where('id', '!=', $requisition->id)
                    ->sum('total_approved');

                $availableBudget = (float) $resolvedAccount->remaining_budget - $committedBudget;

                if ((float) $calculatedTotalApproved > $availableBudget) {
                    $formattedAvailable = 'Rp '.number_format(max(0, $availableBudget), 0, ',', '.');
                    $formattedTotal = 'Rp '.number_format($calculatedTotalApproved, 0, ',', '.');
                    $formattedRemaining = 'Rp '.number_format($resolvedAccount->remaining_budget, 0, ',', '.');
                    $formattedCommitted = 'Rp '.number_format($committedBudget, 0, ',', '.');

                    throw ValidationException::withMessages([
                        'rba_account_id' => "Sisa pagu anggaran tersedia pada rekening [{$resolvedAccount->account_code} - {$resolvedAccount->account_name}] ({$formattedAvailable}) tidak mencukupi untuk menyetujui pengajuan sebesar {$formattedTotal}. Sisa pagu buku: {$formattedRemaining}, komitmen pengajuan lain: {$formattedCommitted}.",
                    ]);
                }
            }
        }

        DB::transaction(function () use ($requisition, $validated, $targetAccountId, $resolvedAccount) {
            $totalApproved = 0;

            // Update quantity_approved for each requisition detail
            foreach ($validated['items'] as $itemData) {
                $detail = RequisitionDetail::where('id', $itemData['id'])
                    ->where('requisition_id', $requisition->id)
                    ->first();

                if ($detail) {
                    $qtyApproved = (int) $itemData['quantity_approved'];
                    $subtotal = $qtyApproved * (float) $detail->unit_price;

                    if (! $detail->relationLoaded('item')) {
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

            // Update requisition status, verifier audit, total approved, and target rba_account_id
            $updateData = [
                'status' => $validated['status'],
                'total_approved' => $validated['status'] === 'Diproses_Keuangan' ? $totalApproved : 0,
                'notes_perencanaan' => $validated['notes_perencanaan'] ?? null,
                'verified_by_perencanaan_id' => Auth::id(),
                'verified_perencanaan_at' => now(),
            ];

            if ($targetAccountId) {
                $updateData['rba_account_id'] = $targetAccountId;
                if ($resolvedAccount) {
                    $updateData['jenis_belanja'] = in_array($resolvedAccount->kategori_belanja, ['Modal']) ? 'Modal' : 'Operasi';
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
