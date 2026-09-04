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
    public function index(): Response
    {
        $user = auth()->user();

        $query = Requisition::with(['division', 'user', 'requisitionDetails.item', 'rbaAccount'])
            ->latest();

        if ($user->division_id) {
            $query->where('division_id', $user->division_id);
        } else {
            $query->where('user_id', $user->id);
        }

        $requisitions = $query->get();

        return Inertia::render('Divisi/Requisitions/Index', [
            'requisitions' => $requisitions,
            'success' => session('success'),
            'error' => session('error'),
        ]);
    }

    /**
     * Show the form for creating a new requisition with cascading RBA accounts and items.
     */
    public function create(): Response
    {
        $user = auth()->user()->load('division');
        $rbaAccounts = RbaAccount::orderBy('account_code')->get([
            'id', 'account_code', 'account_name', 'kategori_belanja', 'sumber_dana', 'remaining_budget'
        ]);
        $items = Item::orderBy('name')->get([
            'id', 'rba_account_id', 'item_code', 'name', 'specification', 'unit_type', 'standard_price'
        ]);

        return Inertia::render('Divisi/Requisitions/Create', [
            'rbaAccounts' => $rbaAccounts,
            'items' => $items,
            'userDivision' => $user->division,
            'currentDate' => now()->translatedFormat('d F Y'),
        ]);
    }

    /**
     * Store a newly created requisition in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $user = auth()->user();

        if (!$user->division_id) {
            return back()->withErrors([
                'division' => 'Akun Anda belum dikaitkan dengan Divisi atau Instalasi. Hubungi Admin untuk mengatur divisi Anda.',
            ]);
        }

        $validated = $request->validate([
            'rba_account_id' => ['required', 'exists:rba_accounts,id'],
            'jenis_belanja' => ['required', 'string', 'in:Operasi,Modal'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.item_id' => ['required', 'exists:items,id'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
        ], [
            'rba_account_id.required' => 'Pilih pos rekening belanja RBA terlebih dahulu.',
            'rba_account_id.exists' => 'Pos rekening belanja yang dipilih tidak valid.',
            'jenis_belanja.required' => 'Pilih klasifikasi belanja (Operasi atau Modal).',
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
                'division_id' => $user->division_id,
                'user_id' => $user->id,
                'rba_account_id' => $rbaAccount->id,
                'budget_id' => $rbaAccount->id,
                'jenis_belanja' => $validated['jenis_belanja'],
                'sumber_dana' => $rbaAccount->sumber_dana ?? 'BLUD',
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
            ->with('success', 'Pengajuan barang (E-Requisition) berhasil dibuat dan diteruskan ke Tim Perencanaan.');
    }

    /**
     * Display the specified requisition.
     */
    public function show(Requisition $requisition): Response
    {
        $requisition->load(['division', 'user', 'requisitionDetails.item', 'rbaAccount']);

        return Inertia::render('Divisi/Requisitions/Show', [
            'requisition' => $requisition,
        ]);
    }

    /**
     * Print the specified requisition.
     */
    public function print($id): Response
    {
        $requisition = Requisition::with(['division', 'user', 'requisitionDetails.item', 'rbaAccount'])->findOrFail($id);

        return Inertia::render('Shared/PrintRequisition', [
            'requisition' => $requisition,
        ]);
    }
}
