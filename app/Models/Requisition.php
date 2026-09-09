<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Requisition extends Model
{
    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'submission_date' => 'date',
            'fiscal_year' => 'integer',
            'total_estimated' => 'decimal:2',
            'total_approved' => 'decimal:2',
        ];
    }

    public function division(): BelongsTo
    {
        return $this->belongsTo(Division::class);
    }

    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function requisitionDetails(): HasMany
    {
        return $this->hasMany(RequisitionDetail::class);
    }

    public function rbaAccount(): BelongsTo
    {
        return $this->belongsTo(RbaAccount::class, 'rba_account_id');
    }

    public function budget(): BelongsTo
    {
        return $this->belongsTo(Budget::class, 'budget_id');
    }
}
