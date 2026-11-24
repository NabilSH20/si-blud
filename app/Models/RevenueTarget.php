<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RevenueTarget extends Model
{
    use HasFactory;

    protected $table = 'revenue_targets';

    protected $fillable = [
        'fiscal_year',
        'source_name',
        'category',
        'period_type',
        'target_yearly',
        'target_jan',
        'target_feb',
        'target_mar',
        'target_apr',
        'target_may',
        'target_jun',
        'target_jul',
        'target_aug',
        'target_sep',
        'target_oct',
        'target_nov',
        'target_dec',
        'weekly_breakdown',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'fiscal_year' => 'integer',
            'target_yearly' => 'decimal:2',
            'target_jan' => 'decimal:2',
            'target_feb' => 'decimal:2',
            'target_mar' => 'decimal:2',
            'target_apr' => 'decimal:2',
            'target_may' => 'decimal:2',
            'target_jun' => 'decimal:2',
            'target_jul' => 'decimal:2',
            'target_aug' => 'decimal:2',
            'target_sep' => 'decimal:2',
            'target_oct' => 'decimal:2',
            'target_nov' => 'decimal:2',
            'target_dec' => 'decimal:2',
            'weekly_breakdown' => 'array',
        ];
    }

    /**
     * Helper to distribute a yearly target evenly across 12 months.
     */
    public function distributeYearlyToMonths(): void
    {
        $monthly = round((float) $this->target_yearly / 12, 2);
        $totalRounded = $monthly * 11;
        $remainder = round((float) $this->target_yearly - $totalRounded, 2);

        $this->target_jan = $monthly;
        $this->target_feb = $monthly;
        $this->target_mar = $monthly;
        $this->target_apr = $monthly;
        $this->target_may = $monthly;
        $this->target_jun = $monthly;
        $this->target_jul = $monthly;
        $this->target_aug = $monthly;
        $this->target_sep = $monthly;
        $this->target_oct = $monthly;
        $this->target_nov = $monthly;
        $this->target_dec = $remainder;
    }

    /**
     * Helper to sum all 12 months into target_yearly.
     */
    public function calculateYearlyFromMonths(): float
    {
        $sum = (float) $this->target_jan +
            (float) $this->target_feb +
            (float) $this->target_mar +
            (float) $this->target_apr +
            (float) $this->target_may +
            (float) $this->target_jun +
            (float) $this->target_jul +
            (float) $this->target_aug +
            (float) $this->target_sep +
            (float) $this->target_oct +
            (float) $this->target_nov +
            (float) $this->target_dec;

        $this->target_yearly = $sum;

        return $sum;
    }
}
