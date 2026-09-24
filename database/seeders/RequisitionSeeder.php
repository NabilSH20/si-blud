<?php

namespace Database\Seeders;

use App\Models\Budget;
use App\Models\Item;
use App\Models\RbaAccount;
use App\Models\Requisition;
use App\Models\RequisitionDetail;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class RequisitionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $divisiUsers = User::where('role', 'divisi')->whereNotNull('division_id')->get();
        $items = Item::with('rbaAccount')->get();
        $budgets = RbaAccount::all();

        if ($divisiUsers->isEmpty() || $items->isEmpty() || $budgets->isEmpty()) {
            return;
        }

        // 15 Planned Requisitions with realistic status mix
        $plannedRequisitions = [
            // 3 Pending Perencanaan (recent: 1 - 3 days ago)
            ['status' => 'Pending_Perencanaan', 'days_ago' => 1],
            ['status' => 'Pending_Perencanaan', 'days_ago' => 2],
            ['status' => 'Pending_Perencanaan', 'days_ago' => 3],

            // 2 Diproses Keuangan (4 - 7 days ago)
            ['status' => 'Diproses_Keuangan', 'days_ago' => 4],
            ['status' => 'Diproses_Keuangan', 'days_ago' => 6],

            // 2 Ditolak (8 - 14 days ago)
            ['status' => 'Ditolak', 'days_ago' => 8],
            ['status' => 'Ditolak', 'days_ago' => 12],

            // 8 Disetujui Selesai (spread over 5 - 28 days ago)
            ['status' => 'Disetujui_Selesai', 'days_ago' => 5],
            ['status' => 'Disetujui_Selesai', 'days_ago' => 9],
            ['status' => 'Disetujui_Selesai', 'days_ago' => 13],
            ['status' => 'Disetujui_Selesai', 'days_ago' => 16],
            ['status' => 'Disetujui_Selesai', 'days_ago' => 19],
            ['status' => 'Disetujui_Selesai', 'days_ago' => 22],
            ['status' => 'Disetujui_Selesai', 'days_ago' => 25],
            ['status' => 'Disetujui_Selesai', 'days_ago' => 28],
        ];

        // Reset budgets remaining to initial before seeding transactions
        foreach ($budgets as $budget) {
            $budget->remaining_budget = $budget->total_budget;
            $budget->spent_budget = 0;
            $budget->save();
        }

        foreach ($plannedRequisitions as $index => $plan) {
            $user = $divisiUsers->random();
            $date = Carbon::now()->subDays($plan['days_ago'])->setTime(rand(8, 15), rand(10, 50));
            $reqNumber = sprintf('REQ-%s-%04d', $date->format('Ymd'), $index + 1);

            // Group items under one RBA account
            $account = $budgets->random();
            $accountItems = $items->where('rba_account_id', $account->id);

            if ($accountItems->isEmpty()) {
                $accountItems = $items->take(5);
            }

            $itemCount = min($accountItems->count(), rand(2, 4));
            $selectedItems = $accountItems->random($itemCount);

            $requisition = Requisition::updateOrCreate(
                ['requisition_number' => $reqNumber],
                [
                    'division_id' => $user->division_id,
                    'user_id' => $user->id,
                    'rba_account_id' => $account->id,
                    'jenis_belanja' => $account->kategori_belanja ?? 'Operasi',
                    'status' => $plan['status'],
                    'submission_date' => $date->toDateString(),
                    'created_at' => $date,
                    'updated_at' => $plan['status'] === 'Pending_Perencanaan' ? $date : (clone $date)->addHours(rand(2, 24)),
                ]
            );

            RequisitionDetail::where('requisition_id', $requisition->id)->delete();

            $grandTotalEstimated = 0;
            $grandTotalApproved = 0;

            foreach ($selectedItems as $item) {
                $qtyRequested = rand(2, 8);
                $qtyApproved = null;

                if ($plan['status'] === 'Pending_Perencanaan') {
                    $qtyApproved = null;
                } elseif ($plan['status'] === 'Ditolak') {
                    $qtyApproved = 0;
                } else {
                    $qtyApproved = rand(max(1, $qtyRequested - 2), $qtyRequested);
                }

                $unitPrice = (float) $item->standard_price;
                $effectiveQty = $qtyApproved !== null ? $qtyApproved : $qtyRequested;
                $subtotal = $effectiveQty * $unitPrice;

                $grandTotalEstimated += ($qtyRequested * $unitPrice);
                if ($qtyApproved !== null) {
                    $grandTotalApproved += ($qtyApproved * $unitPrice);
                }

                RequisitionDetail::create([
                    'requisition_id' => $requisition->id,
                    'item_id' => $item->id,
                    'item_name' => $item->name,
                    'unit_type' => $item->unit_type,
                    'quantity_requested' => $qtyRequested,
                    'quantity_approved' => $qtyApproved,
                    'unit_price' => $unitPrice,
                    'subtotal' => $subtotal,
                ]);
            }

            $requisition->total_estimated = $grandTotalEstimated;
            $requisition->total_approved = $grandTotalApproved;
            $requisition->save();

            // Deduct budget if finalized
            if ($plan['status'] === 'Disetujui_Selesai') {
                $account->remaining_budget = max(0, (float) $account->remaining_budget - (float) $grandTotalApproved);
                $account->spent_budget = (float) $account->spent_budget + (float) $grandTotalApproved;
                $account->save();
            }
        }
    }
}
