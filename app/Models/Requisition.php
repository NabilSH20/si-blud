<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Requisition extends Model
{
    public const STATUS_DRAFT = 'Draft';
    public const STATUS_PENDING_PERENCANAAN = 'Pending_Perencanaan';
    public const STATUS_DISETUJUI = 'Disetujui';
    public const STATUS_DITOLAK = 'Ditolak';

    protected $fillable = [
        'requisition_number',
        'nomor_surat_unit',
        'division_id',
        'unit_id',
        'user_id',
        'rba_account_id',
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
    ];

    protected $appends = [
        'purpose',
        'total_amount',
        'approved_at',
    ];

    public function getPurposeAttribute(): ?string
    {
        return $this->urgency_reason ?: $this->sub_kegiatan;
    }

    public function getTotalAmountAttribute(): float
    {
        return (float) ($this->total_approved > 0 ? $this->total_approved : $this->total_estimated);
    }

    public function getApprovedAtAttribute(): ?\DateTimeInterface
    {
        return $this->verified_perencanaan_at;
    }

    public function isApproved(): bool
    {
        return $this->status === self::STATUS_DISETUJUI;
    }

    protected function casts(): array
    {
        return [
            'submission_date' => 'date',
            'verified_perencanaan_at' => 'datetime',
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
            if (! $requisition->budget_year && $requisition->fiscal_year) {
                $requisition->budget_year = (int) $requisition->fiscal_year;
            }
            if (! $requisition->fiscal_year && $requisition->budget_year) {
                $requisition->fiscal_year = (int) $requisition->budget_year;
            }
            if (! $requisition->budget_year && ! $requisition->fiscal_year) {
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

    public function requisitionDetails(): HasMany
    {
        return $this->hasMany(RequisitionDetail::class);
    }

    public function rbaAccount(): BelongsTo
    {
        return $this->belongsTo(RbaAccount::class, 'rba_account_id');
    }
}
