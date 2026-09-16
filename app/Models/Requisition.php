<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Requisition extends Model
{
    protected $fillable = [
        'requisition_number',
        'nomor_surat_unit',
        'division_id',
        'unit_id',
        'user_id',
        'rba_account_id',
        'budget_id',
        'jenis_belanja',
        'sumber_dana',
        'program',
        'kegiatan',
        'sub_kegiatan',
        'tolok_ukur_output',
        'target_output',
        'tolok_ukur_outcome',
        'target_outcome',
        'urgency_reason',
        'fiscal_year',
        'budget_year',
        'status',
        'submission_date',
        'total_estimated',
        'total_operasional',
        'total_modal',
        'total_approved',
        'notes_perencanaan',
        'verified_by_perencanaan_id',
        'verified_perencanaan_at',
        'notes_keuangan',
        'approved_by_keuangan_id',
        'approved_keuangan_at',
        'sp2d_number',
        'receipt_number',
    ];

    protected function casts(): array
    {
        return [
            'submission_date' => 'date',
            'verified_perencanaan_at' => 'datetime',
            'approved_keuangan_at' => 'datetime',
            'fiscal_year' => 'integer',
            'budget_year' => 'integer',
            'total_estimated' => 'decimal:2',
            'total_operasional' => 'decimal:2',
            'total_modal' => 'decimal:2',
            'total_approved' => 'decimal:2',
        ];
    }

    protected static function booted(): void
    {
        static::saving(function ($requisition) {
            if (!$requisition->budget_year && $requisition->fiscal_year) {
                $requisition->budget_year = (int) $requisition->fiscal_year;
            }
            if (!$requisition->fiscal_year && $requisition->budget_year) {
                $requisition->fiscal_year = (int) $requisition->budget_year;
            }
            if (!$requisition->budget_year && !$requisition->fiscal_year) {
                $year = $requisition->submission_date
                    ? (int) date('Y', strtotime($requisition->submission_date))
                    : (int) date('Y');
                $requisition->budget_year = $year;
                $requisition->fiscal_year = $year;
            }
        });
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

    public function verifiedByPerencanaan(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by_perencanaan_id');
    }

    public function approvedByKeuangan(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by_keuangan_id');
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
