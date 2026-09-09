<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RbaRevenueItem extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'level' => 'integer',
            'is_header' => 'boolean',
            'before_amount' => 'decimal:2',
            'after_amount' => 'decimal:2',
            'difference' => 'decimal:2',
            'order_index' => 'integer',
        ];
    }

    public function shift(): BelongsTo
    {
        return $this->belongsTo(RbaShift::class, 'rba_shift_id');
    }
}
