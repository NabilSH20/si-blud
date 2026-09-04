<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RbaAccount extends Model
{
    use HasFactory;

    protected $table = 'rba_accounts';
    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'period_year' => 'integer',
            'total_budget' => 'decimal:2',
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
}
