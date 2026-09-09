<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\DB;

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
            // Set all other shifts for the same year to Arsip
            static::where('year', $this->year)
                ->where('id', '!=', $this->id)
                ->update(['status' => 'Arsip']);

            $this->update(['status' => 'Aktif']);

            // Sync with rba_accounts
            $items = $this->expenseItems()->where('is_header', false)->get();

            foreach ($items as $item) {
                // Find or create matching RbaAccount by account_code
                $account = RbaAccount::where('account_code', $item->account_code)->first();

                if ($account) {
                    $item->update(['rba_account_id' => $account->id]);
                    $account->update([
                        'total_budget' => $item->after_total,
                        'remaining_budget' => max(0, $item->after_total - $account->spent_budget),
                        'account_name' => $item->account_name,
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
