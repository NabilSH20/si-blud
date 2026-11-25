<?php

namespace App\Http\Controllers\Perencanaan;

use App\Http\Controllers\Controller;
use App\Models\FiscalYear;
use App\Models\RbaAccount;
use App\Models\Requisition;
use App\Models\RequisitionDetail;
use App\Models\Unit;
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
     * Orders by newest submitted requisition on top.
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

        $query = Requisition::with(['division', 'unit', 'user', 'requisitionDetails.item', 'rbaAccount', 'verifiedByPerencanaan'])
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
            ->orderByDesc('id')
            ->get();

        $units = Unit::with('division:id,name')
            ->orderBy('name')
            ->get(['id', 'name', 'unit_code', 'division_id']);

        return Inertia::render('Perencanaan/Requisitions/Index', [
            'requisitions' => $requisitions,
            'units' => $units,
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
        $requisition = Requisition::with(['division', 'unit', 'user', 'requisitionDetails.item', 'rbaAccount', 'verifiedByPerencanaan'])
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

        $rbaList->transform(function ($acc) {
            $acc->available_budget = (float) $acc->remaining_budget;

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
            'status' => ['required', 'string', 'in:Disetujui,Ditolak'],
            'rba_account_id' => ['nullable', 'exists:rba_accounts,id'],
            'notes_perencanaan' => ['nullable', 'string', 'max:500'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.id' => ['required', 'exists:requisition_details,id'],
            'items.*.item_validation_status' => ['nullable', 'string', 'in:SAH,TIDAK_SAH'],
            'items.*.price_validation_status' => ['nullable', 'string', 'in:SAH,TIDAK_SAH'],
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
            'status.in' => 'Status verifikasi harus berupa Disetujui atau Ditolak.',
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

        $resolvedItems = $this->resolveDetailVerificationOutcomes($requisition, $validated['items'], $validated['status']);

        if ($validated['status'] === 'Disetujui') {
            $exceedsSSH = false;
            $calculatedTotalApproved = 0;

            foreach ($resolvedItems as $resolved) {
                if ($resolved['exceeds_ssh'] && $resolved['quantity_approved'] > 0) {
                    $exceedsSSH = true;
                }
                $calculatedTotalApproved += $resolved['subtotal'];
            }

            if ($exceedsSSH && empty($validated['notes_perencanaan'])) {
                throw ValidationException::withMessages([
                    'notes_perencanaan' => 'Terdapat item dengan harga pengajuan melebihi Standar Satuan Harga (SSH). Wajib mengisi catatan alasan persetujuan.',
                ]);
            }

            // Pengecekan Ketersediaan Pagu Rekening RBA Belanja
            if ($resolvedAccount) {
                $availableBudget = (float) $resolvedAccount->remaining_budget;

                if ((float) $calculatedTotalApproved > $availableBudget) {
                    $formattedAvailable = 'Rp '.number_format(max(0, $availableBudget), 0, ',', '.');
                    $formattedTotal = 'Rp '.number_format($calculatedTotalApproved, 0, ',', '.');
                    throw ValidationException::withMessages([
                        'rba_account_id' => "Sisa pagu anggaran pada rekening [{$resolvedAccount->account_code} - {$resolvedAccount->account_name}] ({$formattedAvailable}) tidak mencukupi untuk menyetujui pengajuan sebesar {$formattedTotal}. Silakan lakukan penyesuaian melalui RBA Pergeseran.",
                    ]);
                }
            }
        }

        DB::transaction(function () use ($requisition, $validated, $resolvedItems, $targetAccountId, $resolvedAccount) {
            $totalApproved = 0;

            foreach ($resolvedItems as $resolved) {
                /** @var RequisitionDetail $detail */
                $detail = $resolved['detail'];

                $detailUpdate = [
                    'quantity_approved' => $resolved['quantity_approved'],
                    'unit_price' => $resolved['effective_unit_price'],
                    'subtotal' => $resolved['subtotal'],
                    'exceeds_ssh' => $resolved['exceeds_ssh'],
                ];

                if ($resolved['new_item_validation_status'] !== null) {
                    $detailUpdate['item_validation_status'] = $resolved['new_item_validation_status'];
                }
                if ($resolved['new_price_validation_status'] !== null) {
                    $detailUpdate['price_validation_status'] = $resolved['new_price_validation_status'];
                }

                $detail->update($detailUpdate);

                // Sinkronkan validasi item baru & pembaruan harga ke master katalog items bila disahkan
                if ($validated['status'] === 'Disetujui' && $detail->item) {
                    $item = $detail->item;
                    $masterUpdates = [];

                    if ($resolved['is_new_item'] && $item->source === 'USULAN_UNIT') {
                        if ($resolved['new_item_validation_status'] === 'TIDAK_SAH') {
                            $masterUpdates['source'] = 'DITOLAK';
                        } elseif ($resolved['new_item_validation_status'] === 'SAH' || $resolved['quantity_approved'] > 0) {
                            $masterUpdates['source'] = 'STANDAR';
                        }
                    }

                    if ($resolved['is_price_updated']) {
                        if ($resolved['new_price_validation_status'] === 'SAH') {
                            $masterUpdates['standard_price'] = $resolved['effective_unit_price'];
                            $masterUpdates['pending_price'] = null;
                            $masterUpdates['price_status'] = 'NONE';
                            $masterUpdates['price_origin_unit_id'] = null;
                        } elseif ($resolved['new_price_validation_status'] === 'TIDAK_SAH') {
                            $masterUpdates['pending_price'] = null;
                            $masterUpdates['price_status'] = 'NONE';
                            $masterUpdates['price_origin_unit_id'] = null;
                        }
                    }

                    if (! empty($masterUpdates)) {
                        $item->update($masterUpdates);
                    }
                }

                $totalApproved += $resolved['subtotal'];
            }

            // Update status usulan menjadi Disetujui (ACC Final) atau Ditolak
            $updateData = [
                'status' => $validated['status'],
                'total_approved' => $validated['status'] === 'Disetujui' ? $totalApproved : 0,
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

            // Jika Disetujui, langsung mutasikan sisa pagu rekening belanja RBA
            if ($validated['status'] === 'Disetujui' && $resolvedAccount && $totalApproved > 0) {
                $resolvedAccount->remaining_budget = max(0, (float) $resolvedAccount->remaining_budget - (float) $totalApproved);
                $resolvedAccount->spent_budget = (float) $resolvedAccount->spent_budget + (float) $totalApproved;
                $resolvedAccount->save();
            }
        });

        $message = $validated['status'] === 'Disetujui'
            ? "Pengajuan {$requisition->requisition_number} berhasil disetujui (ACC Final) dan memotong pagu RBA belanja."
            : "Pengajuan {$requisition->requisition_number} telah ditolak.";

        return redirect()->route('perencanaan.requisitions.index')
            ->with('success', $message);
    }

    /**
     * Resolve effective quantities, unit prices, SSH compliance, and item/price validation outcomes per detail row.
     */
    private function resolveDetailVerificationOutcomes(Requisition $requisition, array $submittedItems, string $overallStatus): array
    {
        $resolved = [];

        foreach ($submittedItems as $itemData) {
            /** @var RequisitionDetail|null $detail */
            $detail = $requisition->requisitionDetails->firstWhere('id', $itemData['id']);
            if (! $detail) {
                continue;
            }
            $detail->loadMissing('item');

            $isNewItem = (bool) ($detail->is_new_item || $detail->item?->source === 'USULAN_UNIT');
            $itemValidationInput = $itemData['item_validation_status'] ?? null;

            $qtyApproved = (int) $itemData['quantity_approved'];
            if ($isNewItem && $itemValidationInput === 'TIDAK_SAH') {
                $qtyApproved = 0;
            }

            $basePrice = $detail->original_unit_price !== null
                ? (float) $detail->original_unit_price
                : (float) ($detail->item?->standard_price ?? $detail->unit_price);

            $isPriceUpdated = (bool) (
                $detail->is_price_updated
                || (! $isNewItem && $detail->item && abs((float) $detail->unit_price - $basePrice) > 0.001)
            );
            $priceValidationInput = $itemData['price_validation_status'] ?? null;

            $effectiveUnitPrice = (float) $detail->unit_price;
            if ($isPriceUpdated && $priceValidationInput === 'TIDAK_SAH') {
                $effectiveUnitPrice = $basePrice;
            }

            $exceedsSsh = false;
            if (! ($isPriceUpdated && $priceValidationInput === 'TIDAK_SAH')) {
                $exceedsSsh = $detail->item && $effectiveUnitPrice > $basePrice;
            }

            $newItemValidationStatus = null;
            if ($isNewItem) {
                if ($itemValidationInput !== null) {
                    $newItemValidationStatus = $itemValidationInput;
                } elseif ($overallStatus === 'Disetujui') {
                    $newItemValidationStatus = $qtyApproved > 0 ? 'SAH' : 'TIDAK_SAH';
                }
            }

            $newPriceValidationStatus = null;
            if ($isPriceUpdated && $priceValidationInput !== null) {
                $newPriceValidationStatus = $priceValidationInput;
            }

            $resolved[] = [
                'detail' => $detail,
                'is_new_item' => $isNewItem,
                'is_price_updated' => $isPriceUpdated,
                'quantity_approved' => $qtyApproved,
                'effective_unit_price' => $effectiveUnitPrice,
                'subtotal' => $qtyApproved * $effectiveUnitPrice,
                'exceeds_ssh' => $exceedsSsh,
                'new_item_validation_status' => $newItemValidationStatus,
                'new_price_validation_status' => $newPriceValidationStatus,
            ];
        }

        return $resolved;
    }

    /**
     * Print the specified requisition.
     */
    public function print(int|string $id): Response
    {
        $requisition = Requisition::with([
            'division',
            'unit',
            'user',
            'requisitionDetails.item',
            'rbaAccount',
            'verifiedByPerencanaan',
        ])->findOrFail($id);

        return Inertia::render('Shared/PrintRequisition', [
            'requisition' => $requisition,
        ]);
    }
}
