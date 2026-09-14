<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Item extends Model
{
    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'standard_price' => 'decimal:2',
        ];
    }

    public function rbaAccount(): BelongsTo
    {
        return $this->belongsTo(RbaAccount::class, 'rba_account_id');
    }

    public function originUnit(): BelongsTo
    {
        return $this->belongsTo(Unit::class, 'origin_unit_id');
    }

    public function requisitionDetails(): HasMany
    {
        return $this->hasMany(RequisitionDetail::class);
    }

    public function isStandard(): bool
    {
        return $this->source === 'STANDAR';
    }

    public function isFromUnit(): bool
    {
        return $this->source === 'USULAN_UNIT';
    }

    public function scopeStandard($query)
    {
        return $query->where('source', 'STANDAR');
    }

    public function scopeUnitProposed($query)
    {
        return $query->where('source', 'USULAN_UNIT');
    }

    /**
     * Generate sequential, unique item code with format ITM-XXXX
     */
    public static function generateNextItemCode(): string
    {
        $maxNumber = 0;
        $codes = self::where('item_code', 'like', 'ITM-%')->pluck('item_code');

        foreach ($codes as $code) {
            $numPart = (int) substr($code, 4);
            if ($numPart > $maxNumber) {
                $maxNumber = $numPart;
            }
        }

        $nextNumber = $maxNumber + 1;
        $candidate = 'ITM-' . str_pad($nextNumber, 4, '0', STR_PAD_LEFT);

        while (self::where('item_code', $candidate)->exists()) {
            $nextNumber++;
            $candidate = 'ITM-' . str_pad($nextNumber, 4, '0', STR_PAD_LEFT);
        }

        return $candidate;
    }
}
