<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FiscalYear extends Model
{
    use HasFactory;

    protected $fillable = [
        'year',
        'name',
        'is_active',
        'is_default',
        'description',
    ];

    protected $casts = [
        'year' => 'integer',
        'is_active' => 'boolean',
        'is_default' => 'boolean',
    ];

    /**
     * Get active fiscal years ordered by year descending.
     */
    public static function getActiveYears()
    {
        try {
            if (\Illuminate\Support\Facades\Schema::hasTable('fiscal_years')) {
                return static::where('is_active', true)
                    ->orderByDesc('year')
                    ->get();
            }
        } catch (\Throwable $e) {
            // fallback
        }

        return collect([]);
    }

    /**
     * Get the default fiscal year (e.g. 2026).
     */
    public static function getDefaultYear(): int
    {
        try {
            if (\Illuminate\Support\Facades\Schema::hasTable('fiscal_years')) {
                $default = static::where('is_default', true)->where('is_active', true)->first();
                if ($default) {
                    return (int) $default->year;
                }

                $active = static::where('is_active', true)->orderByDesc('year')->first();
                if ($active) {
                    return (int) $active->year;
                }
            }
        } catch (\Throwable $e) {
            // fallback
        }

        return (int) date('Y');
    }

    /**
     * Get count of requisitions for this fiscal year.
     */
    public function getRequisitionsCountAttribute(): int
    {
        return Requisition::where('budget_year', $this->year)
            ->orWhere(function ($q) {
                $q->whereNull('budget_year')->where('fiscal_year', $this->year);
            })
            ->count();
    }

    /**
     * Get sum of revenues for this fiscal year.
     */
    public function getRevenuesTotalAttribute(): float
    {
        return (float) Revenue::whereYear('date', $this->year)->sum('amount');
    }
}
