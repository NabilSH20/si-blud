<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class RbaShift extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'year' => 'integer',
            'penerimaan_silpa' => 'decimal:2',
            'penerimaan_divestasi' => 'decimal:2',
            'penerimaan_pinjaman' => 'decimal:2',
            'pengeluaran_investasi' => 'decimal:2',
            'pengeluaran_pokok_utang' => 'decimal:2',
        ];
    }

    public function expenseItems(): HasMany
    {
        return $this->hasMany(RbaExpenseItem::class, 'rba_shift_id')->orderBy('order_index');
    }

    public function revenueItems(): HasMany
    {
        return $this->hasMany(RbaRevenueItem::class, 'rba_shift_id')->orderBy('order_index');
    }

    /**
     * Activate this shift and synchronize leaf items to rba_accounts (Budgets).
     */
    public function activate(): void
    {
        DB::transaction(function () {
            $items = $this->expenseItems()->get();

            // Proteksi Defisit Pagu: pastikan tidak ada rekening yang digeser di bawah realisasi belanja + komitmen pengajuan
            foreach ($items as $item) {
                if ($item->is_header) {
                    continue;
                }

                $account = RbaAccount::where('account_code', $item->account_code)
                    ->where('period_year', $this->year)
                    ->first();

                if ($account) {
                    $committedBudget = (float) Requisition::where('rba_account_id', $account->id)
                        ->where('status', 'Diproses_Keuangan')
                        ->sum('total_approved');

                    $minRequired = (float) $account->spent_budget + $committedBudget;

                    if ((float) $item->after_total < $minRequired) {
                        $formattedSpent = 'Rp '.number_format($account->spent_budget, 0, ',', '.');
                        $formattedCommitted = 'Rp '.number_format($committedBudget, 0, ',', '.');
                        $formattedMin = 'Rp '.number_format($minRequired, 0, ',', '.');

                        throw ValidationException::withMessages([
                            'after_total' => "Pagu setelah pergeseran pada rekening [{$item->account_code} - {$item->account_name}] tidak boleh lebih kecil dari batas minimum pagu yang dibutuhkan ({$formattedMin}), terdiri dari realisasi belanja dicairkan ({$formattedSpent}) dan komitmen pengajuan yang sedang diproses Keuangan ({$formattedCommitted}).",
                        ]);
                    }
                }
            }

            // Set all other shifts for the same year to Arsip
            static::where('year', $this->year)
                ->where('id', '!=', $this->id)
                ->update(['status' => 'Arsip']);

            $this->update(['status' => 'Aktif']);

            // Sync with rba_accounts for this specific period_year
            foreach ($items as $item) {
                // Find or create matching RbaAccount by account_code and period_year
                $account = RbaAccount::where('account_code', $item->account_code)
                    ->where('period_year', $this->year)
                    ->first();

                if ($account) {
                    $item->update(['rba_account_id' => $account->id]);
                    $account->update([
                        'total_budget' => $item->after_total,
                        'remaining_budget' => max(0, (float) $item->after_total - (float) $account->spent_budget),
                        'account_name' => $item->account_name,
                        'period_year' => $this->year,
                        'year' => $this->year,
                    ]);
                } else {
                    $kategori = str_starts_with($item->account_code, '1.2') ? 'Modal' : 'Operasi';
                    $sumber = ($item->after_apbd > 0 && $item->after_jasa_layanan == 0) ? 'APBD' : 'BLUD';

                    $newAccount = RbaAccount::create([
                        'account_code' => $item->account_code,
                        'account_name' => $item->account_name,
                        'kategori_belanja' => $kategori,
                        'sumber_dana' => $sumber,
                        'period_year' => $this->year,
                        'year' => $this->year,
                        'total_budget' => $item->after_total,
                        'remaining_budget' => $item->after_total,
                        'spent_budget' => 0,
                    ]);

                    $item->update(['rba_account_id' => $newAccount->id]);
                }
            }
        });
    }
}
