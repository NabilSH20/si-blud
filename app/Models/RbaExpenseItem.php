<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RbaExpenseItem extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'level' => 'integer',
            'is_header' => 'boolean',
            'before_jasa_layanan' => 'decimal:2',
            'before_hasil_kerjasama' => 'decimal:2',
            'before_lain_lain_sah' => 'decimal:2',
            'before_silpa' => 'decimal:2',
            'before_apbd' => 'decimal:2',
            'before_total' => 'decimal:2',
            'after_jasa_layanan' => 'decimal:2',
            'after_hasil_kerjasama' => 'decimal:2',
            'after_lain_lain_sah' => 'decimal:2',
            'after_silpa' => 'decimal:2',
            'after_apbd' => 'decimal:2',
            'after_total' => 'decimal:2',
            'difference' => 'decimal:2',
            'order_index' => 'integer',
        ];
    }

    public function shift(): BelongsTo
    {
        return $this->belongsTo(RbaShift::class, 'rba_shift_id');
    }

    public function account(): BelongsTo
    {
        return $this->belongsTo(RbaAccount::class, 'rba_account_id');
    }
}
