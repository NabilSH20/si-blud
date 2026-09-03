<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RbaDraft extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'year' => 'integer',
            'target_revenue' => 'decimal:2',
            'planned_expense' => 'decimal:2',
        ];
    }
}

