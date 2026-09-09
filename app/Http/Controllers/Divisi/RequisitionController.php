<?php

namespace App\Http\Controllers\Divisi;

use App\Http\Controllers\Controller;
use App\Models\Item;
use App\Models\RbaAccount;
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
     * Display a listing of requisitions for the division.
     */
    public function index(Request $request): Response
    {
        $user = auth()->user()->load(['division', 'unit']);

        $query = Requisition::with(['division', 'unit', 'user', 'requisitionDetails.item', 'rbaAccount'])
            ->latest();

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

        if ($request->filled('fiscal_year') && $request->fiscal_year !== 'ALL') {
            $query->where('fiscal_year', $request->fiscal_year);
        }

        $requisitions = $query->get();

        // Data master belanja BLUD untuk Form Pop-Up Usulan (Create & Edit)
        $rbaAccounts = RbaAccount::where('sumber_dana', 'BLUD')
            ->orderBy('account_code')
            ->get([
                'id', 'account_code', 'account_name', 'kategori_belanja', 'sumber_dana', 'remaining_budget'
            ]);

        $items = Item::orderBy('name')->get([
            'id', 'rba_account_id', 'item_code', 'name', 'specification', 'unit_type', 'standard_price'
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
            'defaultFiscalYear' => 2027,
            'userDivision' => $user->division,
            'userUnit' => $user->unit,
            'selectedJenis' => $request->query('jenis', 'ALL'),
            'selectedYear' => $request->query('fiscal_year', 'ALL'),
            'success' => session('success'),
            'error' => session('error'),
        ]);
    }

    /**
     * Show the form for creating a new requisition with cascading RBA accounts and items.
     */
    public function create(Request $request): Response
    {
        $user = auth()->user()->load(['division', 'unit']);

        $initialJenis = in_array($request->query('jenis'), ['Operasi', 'Modal'])
            ? $request->query('jenis')
            : 'Operasi';

        // Hanya pos rekening belanja yang bersumber dana BLUD
        $rbaAccounts = RbaAccount::where('sumber_dana', 'BLUD')
            ->orderBy('account_code')
            ->get([
                'id', 'account_code', 'account_name', 'kategori_belanja', 'sumber_dana', 'remaining_budget'
            ]);

        $items = Item::orderBy('name')->get([
            'id', 'rba_account_id', 'item_code', 'name', 'specification', 'unit_type', 'standard_price'
        ]);

        $subKegiatanOptions = [
            'Pelayanan dan Penunjang Pelayanan BLUD RS Jiwa Tampan',
            'Penyelenggaraan Tata Kelola dan Administrasi BLUD',
            'Pemeliharaan Sarana, Prasarana, dan Alat Kesehatan Rumah Sakit',
            'Peningkatan Kompetensi SDM, Pendidikan, Pelatihan & Akreditasi Rumah Sakit',
            'Pengadaan Sarana dan Prasarana Medis/Non-Medis (Belanja Modal)',
        ];

        return Inertia::render('Divisi/Requisitions/Create', [
            'rbaAccounts' => $rbaAccounts,
            'items' => $items,
            'userDivision' => $user->division,
            'userUnit' => $user->unit,
            'initialJenis' => $initialJenis,
            'subKegiatanOptions' => $subKegiatanOptions,
            'defaultFiscalYear' => 2027,
            'currentDate' => now()->translatedFormat('d F Y'),
        ]);
    }

    /**
     * Store a newly created requisition in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $user = auth()->user();

        if (!$user->division_id || !$user->unit_id) {
            return back()->withErrors([
                'division' => 'Akun Anda belum lengkap dikaitkan dengan Bidang dan Unit Kerja. Hubungi Administrator untuk mengatur Bidang & Unit Anda.',
            ]);
        }

        $validated = $request->validate([
            'rba_account_id' => ['required', 'exists:rba_accounts,id'],
            'jenis_belanja' => ['required', 'string', 'in:Operasi,Modal'],
            'sub_kegiatan' => ['required', 'string', 'max:255'],
            'fiscal_year' => ['required', 'integer', 'min:2025', 'max:2035'],
            'nomor_surat_unit' => ['nullable', 'string', 'max:255'],
            'urgency_reason' => ['nullable', 'string'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.item_id' => ['required', 'exists:items,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
        ], [
            'rba_account_id.required' => 'Pilih pos kode rekening belanja RBA BLUD terlebih dahulu.',
            'rba_account_id.exists' => 'Pos rekening belanja yang dipilih tidak valid.',
            'jenis_belanja.required' => 'Pilih klasifikasi belanja (Operasi atau Modal).',
            'sub_kegiatan.required' => 'Sub Kegiatan rumah sakit wajib dipilih.',
            'fiscal_year.required' => 'Tahun anggaran perencanaan kebutuhan wajib diisi.',
            'items.required' => 'Daftar barang yang diajukan tidak boleh kosong.',
            'items.min' => 'Minimal ajukan satu barang dalam usulan belanja.',
            'items.*.item_id.required' => 'Pilih barang dari katalog.',
            'items.*.quantity.required' => 'Jumlah barang wajib diisi.',
            'items.*.quantity.min' => 'Jumlah barang minimal 1 unit.',
        ]);

        DB::transaction(function () use ($user, $validated) {
            // Generate unique requisition number: REQ-YYYYMMDD-XXXX
            $datePrefix = 'REQ-' . now()->format('Ymd') . '-';
            $countToday = Requisition::whereDate('created_at', today())->count() + 1;
            $requisitionNumber = $datePrefix . str_pad($countToday, 4, '0', STR_PAD_LEFT);

            while (Requisition::where('requisition_number', $requisitionNumber)->exists()) {
                $countToday++;
                $requisitionNumber = $datePrefix . str_pad($countToday, 4, '0', STR_PAD_LEFT);
            }

            $rbaAccount = RbaAccount::findOrFail($validated['rba_account_id']);

            // Calculate estimated grand total
            $totalEstimated = 0;
            foreach ($validated['items'] as $itemData) {
                $item = Item::findOrFail($itemData['item_id']);
                $qty = (int) $itemData['quantity'];
                $price = (float) $item->standard_price;
                $totalEstimated += ($qty * $price);
            }

            // Create Requisition Header
            $requisition = Requisition::create([
                'requisition_number' => $requisitionNumber,
                'nomor_surat_unit' => $validated['nomor_surat_unit'] ?? null,
                'division_id' => $user->division_id,
                'unit_id' => $user->unit_id,
                'user_id' => $user->id,
                'rba_account_id' => $rbaAccount->id,
                'budget_id' => $rbaAccount->id,
                'jenis_belanja' => $validated['jenis_belanja'],
                'sumber_dana' => 'BLUD',
                'sub_kegiatan' => $validated['sub_kegiatan'],
                'fiscal_year' => (int) $validated['fiscal_year'],
                'urgency_reason' => $validated['urgency_reason'] ?? null,
                'status' => 'Pending_Perencanaan',
                'submission_date' => today(),
                'total_estimated' => $totalEstimated,
                'total_approved' => 0,
            ]);

            // Create Requisition Details
            foreach ($validated['items'] as $itemData) {
                $item = Item::findOrFail($itemData['item_id']);
                $quantity = (int) $itemData['quantity'];
                $unitPrice = (float) $item->standard_price;
                $subtotal = $unitPrice * $quantity;

                RequisitionDetail::create([
                    'requisition_id' => $requisition->id,
                    'item_id' => $item->id,
                    'item_name' => $item->name,
                    'unit_type' => $item->unit_type,
                    'specification' => $item->specification,
                    'quantity_requested' => $quantity,
                    'quantity_approved' => null,
                    'unit_price' => $unitPrice,
                    'subtotal' => $subtotal,
                ]);
            }
        });

        return redirect()->route('requisitions.index')
            ->with('success', 'Pengajuan belanja E-BLUD berhasil diajukan untuk perencanaan 1 tahun ke depan dan diteruskan ke Tim Perencanaan.');
    }

    /**
     * Update the specified requisition in storage.
     */
    public function update(Request $request, Requisition $requisition): RedirectResponse
    {
        $user = auth()->user();

        // Check ownership / data isolation
        if ($user->unit_id && $requisition->unit_id !== $user->unit_id) {
            abort(403, 'Anda tidak memiliki hak untuk mengubah usulan belanja unit lain.');
        } elseif (!$user->unit_id && $user->division_id && $requisition->division_id !== $user->division_id) {
            abort(403, 'Anda tidak memiliki hak untuk mengubah usulan belanja divisi lain.');
        } elseif (!$user->unit_id && !$user->division_id && $requisition->user_id !== $user->id) {
            abort(403, 'Anda tidak memiliki akses ke usulan ini.');
        }

        // Only allow update if status is Pending_Perencanaan
        if ($requisition->status !== 'Pending_Perencanaan') {
            return back()->with('error', 'Usulan belanja tidak dapat diubah karena telah diproses atau diverifikasi oleh Tim Perencanaan / Keuangan.');
        }

        $validated = $request->validate([
            'rba_account_id' => ['required', 'exists:rba_accounts,id'],
            'jenis_belanja' => ['required', 'string', 'in:Operasi,Modal'],
            'sub_kegiatan' => ['required', 'string', 'max:255'],
            'fiscal_year' => ['required', 'integer', 'min:2025', 'max:2035'],
            'nomor_surat_unit' => ['nullable', 'string', 'max:255'],
            'urgency_reason' => ['nullable', 'string'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.item_id' => ['required', 'exists:items,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
        ], [
            'rba_account_id.required' => 'Pilih pos kode rekening belanja RBA BLUD terlebih dahulu.',
            'rba_account_id.exists' => 'Pos rekening belanja yang dipilih tidak valid.',
            'jenis_belanja.required' => 'Pilih klasifikasi belanja (Operasi atau Modal).',
            'sub_kegiatan.required' => 'Sub Kegiatan rumah sakit wajib dipilih.',
            'fiscal_year.required' => 'Tahun anggaran perencanaan kebutuhan wajib diisi.',
            'items.required' => 'Daftar barang yang diajukan tidak boleh kosong.',
            'items.min' => 'Minimal ajukan satu barang dalam usulan belanja.',
            'items.*.item_id.required' => 'Pilih barang dari katalog.',
            'items.*.quantity.required' => 'Jumlah barang wajib diisi.',
            'items.*.quantity.min' => 'Jumlah barang minimal 1 unit.',
        ]);

        DB::transaction(function () use ($requisition, $validated) {
            $rbaAccount = RbaAccount::findOrFail($validated['rba_account_id']);

            // Calculate estimated grand total
            $totalEstimated = 0;
            foreach ($validated['items'] as $itemData) {
                $item = Item::findOrFail($itemData['item_id']);
                $qty = (int) $itemData['quantity'];
                $price = (float) $item->standard_price;
                $totalEstimated += ($qty * $price);
            }

            // Update Requisition Header
            $requisition->update([
                'nomor_surat_unit' => $validated['nomor_surat_unit'] ?? null,
                'rba_account_id' => $rbaAccount->id,
                'budget_id' => $rbaAccount->id,
                'jenis_belanja' => $validated['jenis_belanja'],
                'sumber_dana' => 'BLUD',
                'sub_kegiatan' => $validated['sub_kegiatan'],
                'fiscal_year' => (int) $validated['fiscal_year'],
                'urgency_reason' => $validated['urgency_reason'] ?? null,
                'total_estimated' => $totalEstimated,
            ]);

            // Sync Requisition Details (delete old and insert new)
            $requisition->requisitionDetails()->delete();

            foreach ($validated['items'] as $itemData) {
                $item = Item::findOrFail($itemData['item_id']);
                $quantity = (int) $itemData['quantity'];
                $unitPrice = (float) $item->standard_price;
                $subtotal = $unitPrice * $quantity;

                RequisitionDetail::create([
                    'requisition_id' => $requisition->id,
                    'item_id' => $item->id,
                    'item_name' => $item->name,
                    'unit_type' => $item->unit_type,
                    'specification' => $item->specification,
                    'quantity_requested' => $quantity,
                    'quantity_approved' => null,
                    'unit_price' => $unitPrice,
                    'subtotal' => $subtotal,
                ]);
            }
        });

        return redirect()->route('requisitions.index')
            ->with('success', 'Usulan belanja E-BLUD berhasil diperbarui.');
    }

    /**
     * Display the specified requisition.
     */
    public function show(Requisition $requisition): Response
    {
        $requisition->load(['division', 'unit', 'user', 'requisitionDetails.item', 'rbaAccount']);

        return Inertia::render('Divisi/Requisitions/Show', [
            'requisition' => $requisition,
        ]);
    }

    /**
     * Print the specified requisition.
     */
    public function print($id): Response
    {
        $requisition = Requisition::with(['division', 'unit', 'user', 'requisitionDetails.item', 'rbaAccount'])->findOrFail($id);

        return Inertia::render('Shared/PrintRequisition', [
            'requisition' => $requisition,
        ]);
    }
}
