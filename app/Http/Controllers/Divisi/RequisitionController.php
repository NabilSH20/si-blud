<?php

namespace App\Http\Controllers\Divisi;

use App\Http\Controllers\Controller;
use App\Models\FiscalYear;
use App\Models\Item;
use App\Models\RbaAccount;
use App\Models\Requisition;
use App\Models\RequisitionDetail;
use App\Models\User;
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
     * Helper to get RBA accounts scoped to given year with fallback.
     */
    private function getScopedRbaAccounts(int $year)
    {
        $accounts = RbaAccount::where('period_year', $year)
            ->where('sumber_dana', 'BLUD')
            ->orderBy('account_code')
            ->get([
                'id', 'account_code', 'account_name', 'kategori_belanja', 'parent_code', 'sumber_dana', 'remaining_budget', 'period_year',
            ]);

        if ($accounts->isEmpty()) {
            $accounts = RbaAccount::where('sumber_dana', 'BLUD')
                ->orderBy('account_code')
                ->get([
                    'id', 'account_code', 'account_name', 'kategori_belanja', 'parent_code', 'sumber_dana', 'remaining_budget', 'period_year',
                ])
                ->unique('account_code')
                ->values();
        }

        return $accounts;
    }

    /**
     * Display a listing of requisitions for the division.
     */
    public function index(Request $request): Response
    {
        /** @var User $user */
        $user = $request->user();
        $user->load(['division', 'unit']);

        $query = Requisition::with(['division', 'unit', 'user', 'requisitionDetails.item', 'rbaAccount', 'verifiedByPerencanaan'])
            ->orderByDesc('id');

        // Isolasi data pengajuan per unit kerja staf yang login
        if ($user->unit_id) {
            $query->where('unit_id', $user->unit_id);
        } elseif ($user->division_id) {
            $query->where('division_id', $user->division_id);
        } else {
            $query->where('user_id', $user->id);
        }

        if ($request->filled('jenis') && $request->jenis !== 'ALL') {
            $query->where('jenis_belanja', $request->jenis);
        }

        $activeYear = (int) session('active_year', function () {
            return class_exists(FiscalYear::class)
                ? FiscalYear::getDefaultYear()
                : (int) date('Y');
        });
        $selectedYear = $request->filled('budget_year')
            ? $request->budget_year
            : ($request->filled('fiscal_year') ? $request->fiscal_year : $activeYear);

        $query->where(function ($q) use ($selectedYear, $request) {
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

        $requisitions = $query->get();

        // Data master belanja BLUD untuk Form Pop-Up Usulan (Create & Edit)
        $rbaAccounts = $this->getScopedRbaAccounts((int) $selectedYear);

        $items = Item::where('source', '!=', 'DITOLAK')
            ->orderBy('name')
            ->get([
                'id', 'rba_account_id', 'item_code', 'name', 'specification', 'unit_type', 'standard_price', 'source', 'origin_unit_id',
            ]);

        $subKegiatanOptions = [
            'Pelayanan dan Penunjang Pelayanan BLUD RS Jiwa Tampan',
            'Penyelenggaraan Tata Kelola dan Administrasi BLUD',
            'Pemeliharaan Sarana, Prasarana, dan Alat Kesehatan Rumah Sakit',
            'Peningkatan Kompetensi SDM, Pendidikan, Pelatihan & Akreditasi Rumah Sakit',
            'Pengadaan Sarana dan Prasarana Medis/Non-Medis (Belanja Modal)',
        ];

        return Inertia::render('Divisi/Requisitions/Index', [
            'requisitions' => $requisitions,
            'rbaAccounts' => $rbaAccounts,
            'items' => $items,
            'subKegiatanOptions' => $subKegiatanOptions,
            'defaultFiscalYear' => $activeYear,
            'userDivision' => $user->division,
            'userUnit' => $user->unit,
            'selectedJenis' => $request->query('jenis', 'ALL'),
            'selectedYear' => $selectedYear,
            'active_year' => $activeYear,
            'success' => session('success'),
            'error' => session('error'),
        ]);
    }

    /**
     * Store a newly created requisition in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();

        if (! $user->division_id || ! $user->unit_id) {
            return back()->withErrors([
                'division' => 'Akun Anda belum lengkap dikaitkan dengan Bidang dan Unit Kerja. Hubungi Administrator untuk mengatur Bidang & Unit Anda.',
            ]);
        }

        $validated = $this->validateRequisitionPayload($request);

        DB::transaction(function () use ($user, $validated) {
            // Generate unique requisition number: REQ-YYYYMMDD-XXXX
            $datePrefix = 'REQ-'.now()->format('Ymd').'-';
            $countToday = Requisition::whereDate('created_at', today())->count() + 1;
            $requisitionNumber = $datePrefix.str_pad($countToday, 4, '0', STR_PAD_LEFT);

            while (Requisition::where('requisition_number', $requisitionNumber)->exists()) {
                $countToday++;
                $requisitionNumber = $datePrefix.str_pad($countToday, 4, '0', STR_PAD_LEFT);
            }

            $targetBudgetYear = (int) ($validated['budget_year'] ?? $validated['fiscal_year'] ?? session('active_year', date('Y')));
            $inputFiscalYear = (int) ($validated['fiscal_year'] ?? date('Y'));
            $firstAccountId = ! empty($validated['rba_account_id'])
                ? RbaAccount::resolveForYear($validated['rba_account_id'], $targetBudgetYear)?->id
                : null;

            $summary = $this->processRequisitionItems(
                $validated['items'],
                $validated,
                $targetBudgetYear,
                (int) $user->unit_id,
                $firstAccountId
            );

            $requisition = Requisition::create([
                'requisition_number' => $requisitionNumber,
                'nomor_surat_unit' => $validated['nomor_surat_unit'] ?? null,
                'division_id' => $user->division_id,
                'unit_id' => $user->unit_id,
                'user_id' => $user->id,
                'rba_account_id' => $summary['firstAccountId'],
                'jenis_belanja' => $summary['overallJenis'],
                'sumber_dana' => 'BLUD',
                'program' => $validated['program'] ?? 'Program Peningkatan Pelayanan Kesehatan Pada BLUD',
                'kegiatan' => $validated['kegiatan'] ?? '1. Pelayanan Kesehatan',
                'sub_kegiatan' => $validated['sub_kegiatan'],
                'tolok_ukur_output' => $validated['tolok_ukur_output'] ?? null,
                'target_output' => $validated['target_output'] ?? '100%',
                'tolok_ukur_outcome' => $validated['tolok_ukur_outcome'] ?? null,
                'target_outcome' => $validated['target_outcome'] ?? '100%',
                'fiscal_year' => $inputFiscalYear,
                'budget_year' => $targetBudgetYear,
                'urgency_reason' => $validated['urgency_reason'] ?? null,
                'status' => 'Pending_Perencanaan',
                'submission_date' => today(),
                'total_operasional' => $summary['totalOperasional'],
                'total_modal' => $summary['totalModal'],
                'total_estimated' => $summary['totalEstimated'],
                'total_approved' => 0,
            ]);

            $this->persistRequisitionDetails($requisition, $summary['processedItems']);
        });

        return redirect()->route('requisitions.index')
            ->with('success', 'Pengajuan belanja E-BLUD berhasil diajukan untuk perencanaan 1 tahun ke depan dan diteruskan ke Tim Perencanaan.');
    }

    /**
     * Update the specified requisition in storage.
     */
    public function update(Request $request, Requisition $requisition): RedirectResponse
    {
        $this->authorizeAccess($requisition);

        // Only allow update if status is Pending_Perencanaan or Ditolak (Revisi & Ajukan Ulang)
        if (! in_array($requisition->status, ['Pending_Perencanaan', 'Ditolak'])) {
            return back()->with('error', 'Usulan belanja tidak dapat diubah karena telah disetujui atau disahkan oleh Tim Perencanaan.');
        }

        $wasRejected = ($requisition->status === 'Ditolak');
        $validated = $this->validateRequisitionPayload($request);

        DB::transaction(function () use ($requisition, $validated, $request) {
            $targetBudgetYear = (int) ($validated['budget_year'] ?? $requisition->budget_year ?? $validated['fiscal_year'] ?? session('active_year', date('Y')));
            $inputFiscalYear = (int) ($validated['fiscal_year'] ?? $requisition->fiscal_year ?? date('Y'));
            $firstAccountId = ! empty($validated['rba_account_id'])
                ? RbaAccount::resolveForYear($validated['rba_account_id'], $targetBudgetYear)?->id
                : RbaAccount::resolveForYear($requisition->rba_account_id, $targetBudgetYear)?->id;

            $unitId = (int) ($requisition->unit_id ?: $request->user()?->unit_id);

            $summary = $this->processRequisitionItems(
                $validated['items'],
                $validated,
                $targetBudgetYear,
                $unitId,
                $firstAccountId,
                $requisition->rba_account_id,
                $requisition->jenis_belanja
            );

            $requisition->update([
                'nomor_surat_unit' => $validated['nomor_surat_unit'] ?? null,
                'rba_account_id' => $summary['firstAccountId'],
                'jenis_belanja' => $summary['overallJenis'],
                'sumber_dana' => 'BLUD',
                'program' => $validated['program'] ?? $requisition->program ?? 'Program Peningkatan Pelayanan Kesehatan Pada BLUD',
                'kegiatan' => $validated['kegiatan'] ?? $requisition->kegiatan ?? '1. Pelayanan Kesehatan',
                'sub_kegiatan' => $validated['sub_kegiatan'],
                'tolok_ukur_output' => $validated['tolok_ukur_output'] ?? $requisition->tolok_ukur_output,
                'target_output' => $validated['target_output'] ?? $requisition->target_output ?? '100%',
                'tolok_ukur_outcome' => $validated['tolok_ukur_outcome'] ?? $requisition->tolok_ukur_outcome,
                'target_outcome' => $validated['target_outcome'] ?? $requisition->target_outcome ?? '100%',
                'fiscal_year' => $inputFiscalYear,
                'budget_year' => $targetBudgetYear,
                'urgency_reason' => $validated['urgency_reason'] ?? null,
                'status' => 'Pending_Perencanaan',
                'total_approved' => 0,
                'total_operasional' => $summary['totalOperasional'],
                'total_modal' => $summary['totalModal'],
                'total_estimated' => $summary['totalEstimated'],
            ]);

            $requisition->requisitionDetails()->delete();
            $this->persistRequisitionDetails($requisition, $summary['processedItems']);
        });

        $message = $wasRejected
            ? "Pengajuan {$requisition->requisition_number} berhasil direvisi dan diajukan ulang ke Tim Perencanaan."
            : "Usulan belanja {$requisition->requisition_number} berhasil diperbarui.";

        return redirect()->route('requisitions.index')
            ->with('success', $message);
    }

    /**
     * Validate request payload for storing or updating a unit requisition.
     */
    private function validateRequisitionPayload(Request $request): array
    {
        $validated = $request->validate([
            'rba_account_id' => ['nullable', 'exists:rba_accounts,id'],
            'jenis_belanja' => ['nullable', 'string', 'in:Operasi,Modal,Campuran,Gabungan,Operasional'],
            'program' => ['nullable', 'string', 'max:255'],
            'kegiatan' => ['nullable', 'string', 'max:255'],
            'sub_kegiatan' => ['required', 'string', 'max:255'],
            'tolok_ukur_output' => ['nullable', 'string'],
            'target_output' => ['nullable', 'string', 'max:50'],
            'tolok_ukur_outcome' => ['nullable', 'string'],
            'target_outcome' => ['nullable', 'string', 'max:50'],
            'budget_year' => ['nullable', 'integer', 'min:2020', 'max:2035'],
            'fiscal_year' => ['nullable', 'integer', 'min:2020', 'max:2035'],
            'nomor_surat_unit' => ['nullable', 'string', 'max:255'],
            'urgency_reason' => ['nullable', 'string'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.is_new' => ['nullable', 'boolean'],
            'items.*.item_id' => ['nullable'],
            'items.*.name' => ['nullable', 'string', 'max:255'],
            'items.*.unit_type' => ['nullable', 'string', 'max:255'],
            'items.*.specification' => ['nullable', 'string'],
            'items.*.unit_price' => ['nullable', 'numeric', 'min:0'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'items.*.jenis_belanja' => ['nullable', 'string', 'in:Operasi,Modal'],
            'items.*.rba_account_id' => ['nullable', 'exists:rba_accounts,id'],
        ], [
            'sub_kegiatan.required' => 'Sub Kegiatan rumah sakit wajib diisi.',
            'items.required' => 'Daftar barang yang diajukan tidak boleh kosong.',
            'items.min' => 'Minimal ajukan satu barang dalam usulan belanja.',
            'items.*.quantity.required' => 'Jumlah barang wajib diisi.',
            'items.*.quantity.min' => 'Jumlah barang minimal 1 unit.',
        ]);

        foreach ($validated['items'] as $idx => $itemData) {
            $isNew = ! empty($itemData['is_new']) || empty($itemData['item_id']);
            if ($isNew) {
                if (empty(trim($itemData['name'] ?? ''))) {
                    throw ValidationException::withMessages([
                        "items.{$idx}.name" => 'Nama barang baru wajib diisi.',
                    ]);
                }
                if (empty(trim($itemData['unit_type'] ?? ''))) {
                    throw ValidationException::withMessages([
                        "items.{$idx}.unit_type" => 'Satuan barang baru wajib diisi.',
                    ]);
                }
            } elseif (! Item::where('id', $itemData['item_id'])->exists()) {
                throw ValidationException::withMessages([
                    "items.{$idx}.item_id" => 'Barang yang dipilih tidak valid.',
                ]);
            }
        }

        return $validated;
    }

    /**
     * Resolve catalog/new items, track pending price updates without overwriting official catalog standard_price,
     * and calculate requisition subtotals.
     */
    private function processRequisitionItems(
        array $itemsData,
        array $validated,
        int $targetBudgetYear,
        int $unitId,
        ?int $firstAccountId,
        ?int $fallbackRequisitionAccountId = null,
        ?string $fallbackRequisitionJenis = null
    ): array {
        $processedItems = [];
        $totalOperasional = 0;
        $totalModal = 0;

        foreach ($itemsData as $itemData) {
            $isNewInput = ! empty($itemData['is_new']) || empty($itemData['item_id']);
            $qty = (int) $itemData['quantity'];
            $fallbackJenis = ($validated['jenis_belanja'] ?? $fallbackRequisitionJenis ?? 'Operasi') === 'Modal' ? 'Modal' : 'Operasi';
            $itemJenis = ! empty($itemData['jenis_belanja']) ? ($itemData['jenis_belanja'] === 'Modal' ? 'Modal' : 'Operasi') : $fallbackJenis;
            $rawAccountId = $itemData['rba_account_id'] ?? $validated['rba_account_id'] ?? $fallbackRequisitionAccountId;
            $itemAccountId = $rawAccountId ? RbaAccount::resolveForYear($rawAccountId, $targetBudgetYear)?->id : null;

            if (! $firstAccountId && $itemAccountId) {
                $firstAccountId = $itemAccountId;
            }

            if ($isNewInput) {
                $itemName = trim($itemData['name'] ?? '');
                $unitType = trim($itemData['unit_type'] ?? 'Pcs') ?: 'Pcs';
                $spec = trim($itemData['specification'] ?? '') ?: null;
                $unitPrice = isset($itemData['unit_price']) && $itemData['unit_price'] !== '' ? (float) $itemData['unit_price'] : 0;

                $existingItem = ! empty($itemData['item_id']) ? Item::find($itemData['item_id']) : null;
                if ($existingItem && $existingItem->source === 'USULAN_UNIT') {
                    $existingItem->update([
                        'rba_account_id' => $itemAccountId ?: $existingItem->rba_account_id,
                        'name' => $itemName ?: $existingItem->name,
                        'specification' => $spec ?? $existingItem->specification,
                        'unit_type' => $unitType,
                        'standard_price' => $unitPrice,
                    ]);
                    $item = $existingItem;
                } else {
                    $queryItem = Item::where('source', '!=', 'DITOLAK')->where('name', $itemName);
                    if ($itemAccountId) {
                        $queryItem->where('rba_account_id', $itemAccountId);
                    }
                    $item = $queryItem->first();

                    if ($item) {
                        if ($item->source === 'USULAN_UNIT' && $unitPrice > 0 && (float) $item->standard_price !== $unitPrice) {
                            $item->update(['standard_price' => $unitPrice]);
                        }
                    } else {
                        $item = Item::create([
                            'rba_account_id' => $itemAccountId,
                            'item_code' => Item::generateNextItemCode(),
                            'name' => $itemName,
                            'specification' => $spec,
                            'unit_type' => $unitType,
                            'standard_price' => $unitPrice,
                            'source' => 'USULAN_UNIT',
                            'origin_unit_id' => $unitId ?: null,
                        ]);
                    }
                }

                $isNewDetail = ($item->source !== 'STANDAR');
                $itemValidationStatus = $isNewDetail ? 'PENDING' : 'SAH';
                $originalUnitPrice = $isNewDetail ? null : (float) $item->standard_price;
                $isPriceUpdated = ! $isNewDetail && abs($unitPrice - (float) $item->standard_price) > 0.001;
                $priceValidationStatus = $isPriceUpdated ? 'PENDING' : 'NONE';

                if ($isPriceUpdated && $item->source === 'STANDAR') {
                    $item->update([
                        'pending_price' => $unitPrice,
                        'price_status' => 'PENDING',
                        'price_origin_unit_id' => $unitId ?: null,
                    ]);
                }
            } else {
                $item = Item::findOrFail($itemData['item_id']);
                $baseStandardPrice = (float) $item->standard_price;
                $unitPrice = isset($itemData['unit_price']) && $itemData['unit_price'] !== '' ? (float) $itemData['unit_price'] : $baseStandardPrice;
                $unitType = trim($itemData['unit_type'] ?? '') ?: $item->unit_type;
                $spec = trim($itemData['specification'] ?? '') ?: $item->specification;

                if (! $itemAccountId && $item->rba_account_id) {
                    $itemAccountId = RbaAccount::resolveForYear($item->rba_account_id, $targetBudgetYear)?->id;
                }

                if (! $firstAccountId && $itemAccountId) {
                    $firstAccountId = $itemAccountId;
                }

                $isNewDetail = ($item->source === 'USULAN_UNIT');
                $itemValidationStatus = $isNewDetail ? 'PENDING' : null;
                $originalUnitPrice = $baseStandardPrice;
                $isPriceUpdated = ! $isNewDetail && abs($unitPrice - $baseStandardPrice) > 0.001;
                $priceValidationStatus = $isPriceUpdated ? 'PENDING' : 'NONE';

                // Catat usulan perubahan harga sebagai pending untuk divalidasi Perencanaan
                // tanpa langsung menimpa standard_price katalog resmi.
                if ($isPriceUpdated) {
                    $item->update([
                        'pending_price' => $unitPrice,
                        'price_status' => 'PENDING',
                        'price_origin_unit_id' => $unitId ?: null,
                    ]);
                } elseif ($item->price_status === 'PENDING' && abs($unitPrice - $baseStandardPrice) <= 0.001) {
                    $item->update([
                        'pending_price' => null,
                        'price_status' => 'NONE',
                        'price_origin_unit_id' => null,
                    ]);
                }
            }

            $subtotal = $qty * $unitPrice;
            if ($itemJenis === 'Modal') {
                $totalModal += $subtotal;
            } else {
                $totalOperasional += $subtotal;
            }

            $processedItems[] = [
                'item' => $item,
                'unit_type' => $unitType,
                'specification' => $spec,
                'quantity' => $qty,
                'unit_price' => $unitPrice,
                'original_unit_price' => $originalUnitPrice,
                'is_new_item' => $isNewDetail,
                'item_validation_status' => $itemValidationStatus,
                'is_price_updated' => $isPriceUpdated,
                'price_validation_status' => $priceValidationStatus,
                'subtotal' => $subtotal,
            ];
        }

        $totalEstimated = $totalOperasional + $totalModal;
        if ($totalOperasional > 0 && $totalModal > 0) {
            $overallJenis = 'Campuran';
        } elseif ($totalModal > 0) {
            $overallJenis = 'Modal';
        } else {
            $overallJenis = 'Operasi';
        }

        return [
            'firstAccountId' => $firstAccountId,
            'overallJenis' => $overallJenis,
            'totalOperasional' => $totalOperasional,
            'totalModal' => $totalModal,
            'totalEstimated' => $totalEstimated,
            'processedItems' => $processedItems,
        ];
    }

    /**
     * Persist processed requisition detail rows.
     */
    private function persistRequisitionDetails(Requisition $requisition, array $processedItems): void
    {
        foreach ($processedItems as $pItem) {
            /** @var Item $item */
            $item = $pItem['item'];
            RequisitionDetail::create([
                'requisition_id' => $requisition->id,
                'item_id' => $item->id,
                'item_name' => $item->name,
                'unit_type' => $pItem['unit_type'] ?? $item->unit_type,
                'specification' => $pItem['specification'] ?? $item->specification,
                'is_new_item' => $pItem['is_new_item'],
                'item_validation_status' => $pItem['item_validation_status'],
                'quantity_requested' => $pItem['quantity'],
                'quantity_approved' => null,
                'unit_price' => $pItem['unit_price'],
                'original_unit_price' => $pItem['original_unit_price'],
                'is_price_updated' => $pItem['is_price_updated'],
                'price_validation_status' => $pItem['price_validation_status'],
                'subtotal' => $pItem['subtotal'],
            ]);
        }
    }

    /**
     * Display the specified requisition.
     */
    public function show(Requisition $requisition): Response
    {
        $this->authorizeAccess($requisition);
        $requisition->load(['division', 'unit', 'user', 'requisitionDetails.item', 'rbaAccount', 'verifiedByPerencanaan']);

        return Inertia::render('Divisi/Requisitions/Show', [
            'requisition' => $requisition,
        ]);
    }

    /**
     * Print the specified requisition.
     */
    public function print(int|string $id): Response
    {
        $requisition = Requisition::with(['division', 'unit', 'user', 'requisitionDetails.item', 'rbaAccount', 'verifiedByPerencanaan'])->findOrFail($id);
        $this->authorizeAccess($requisition);

        return Inertia::render('Shared/PrintRequisition', [
            'requisition' => $requisition,
        ]);
    }

    /**
     * Remove the specified requisition from storage.
     */
    public function destroy(Requisition $requisition): RedirectResponse
    {
        $this->authorizeAccess($requisition);

        // Hanya usulan dengan status Pending_Perencanaan atau Ditolak yang boleh dihapus oleh unit
        if (! in_array($requisition->status, ['Pending_Perencanaan', 'Ditolak'])) {
            return back()->with('error', 'Usulan belanja yang sedang diproses atau sudah disetujui tidak dapat dihapus.');
        }

        DB::transaction(function () use ($requisition) {
            $requisition->requisitionDetails()->delete();
            $requisition->delete();
        });

        return redirect()->route('requisitions.index')
            ->with('success', 'Usulan belanja berhasil dihapus.');
    }

    /**
     * Authorize access to the specified requisition.
     */
    private function authorizeAccess(Requisition $requisition): void
    {
        /** @var User $user */
        $user = Auth::user();

        // 1. Role pengawas dan verifikator memiliki izin sah meninjau dan mencetak seluruh berkas usulan belanja
        if (in_array($user->role, ['admin', 'perencanaan', 'keuangan'])) {
            return;
        }

        // 2. Isolasi akses untuk pengguna unit/divisi operasional
        if ($user->unit_id && $requisition->unit_id !== $user->unit_id) {
            abort(403, 'Anda tidak memiliki akses ke usulan belanja ini.');
        } elseif (! $user->unit_id && $user->division_id && $requisition->division_id !== $user->division_id) {
            abort(403, 'Anda tidak memiliki akses ke usulan belanja ini.');
        } elseif (! $user->unit_id && ! $user->division_id && $requisition->user_id !== $user->id) {
            abort(403, 'Anda tidak memiliki akses ke usulan belanja ini.');
        }
    }
}
