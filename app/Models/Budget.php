<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Budget extends Model
{
    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'period_year' => 'integer',
            'total_budget' => 'decimal:2',
            'remaining_budget' => 'decimal:2',
        ];
    }
}
