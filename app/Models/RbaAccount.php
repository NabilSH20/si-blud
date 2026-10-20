<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RbaAccount extends Model
{
    use HasFactory;

    protected $table = 'rba_accounts';

    protected $fillable = [
        'account_code',
        'parent_code',
        'account_name',
        'kategori_belanja',
        'sumber_dana',
        'funding_source',
        'period_year',
        'year',
        'total_budget',
        'budget_after_revision',
        'remaining_budget',
        'spent_budget',
    ];

    protected function casts(): array
    {
        return [
            'period_year' => 'integer',
            'year' => 'integer',
            'total_budget' => 'decimal:2',
            'budget_after_revision' => 'decimal:2',
            'remaining_budget' => 'decimal:2',
            'spent_budget' => 'decimal:2',
        ];
    }

    public function items(): HasMany
    {
        return $this->hasMany(Item::class, 'rba_account_id');
    }

    public function requisitions(): HasMany
    {
        return $this->hasMany(Requisition::class, 'rba_account_id');
    }

    // Accessors for backward compatibility
    public function getKodeRekeningAttribute(): string
    {
        return $this->account_code;
    }

    public function getUraianRekeningAttribute(): string
    {
        return $this->account_name;
    }

    /**
     * Resolve the RbaAccount for a specific target year based on an account ID or account instance.
     * If the account's period_year matches $targetYear, it returns that account.
     * If not, it looks for an RbaAccount with the same account_code and period_year = $targetYear.
     * If none exists for the target year, falls back to the original account.
     */
    public static function resolveForYear(int|string|RbaAccount|null $accountOrId, int $targetYear): ?RbaAccount
    {
        if (! $accountOrId) {
            return null;
        }

        $account = $accountOrId instanceof RbaAccount ? $accountOrId : static::find($accountOrId);
        if (! $account) {
            return null;
        }

        if ((int) $account->period_year === (int) $targetYear) {
            return $account;
        }

        $matchingYearAccount = static::where('account_code', $account->account_code)
            ->where('period_year', $targetYear)
            ->first();

        return $matchingYearAccount ?: $account;
    }
}
