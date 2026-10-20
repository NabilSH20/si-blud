<?php

namespace App\Models;

use Carbon\Carbon;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Notifications\Notifiable;

/**
 * @property int $id
 * @property string $name
 * @property string|null $nip
 * @property string $email
 * @property string|null $email_verified_at
 * @property string $password
 * @property string $role
 * @property string|null $position
 * @property string|null $phone
 * @property string|null $avatar
 * @property-read string|null $avatar_url
 * @property bool $is_active
 * @property int|null $division_id
 * @property int|null $unit_id
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Division|null $division
 * @property-read Unit|null $unit
 * @property-read Collection<int, Requisition> $requisitions
 */
class User extends \Illuminate\Foundation\Auth\User
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     */
    protected $guarded = [];

    /**
     * The attributes that should be hidden for serialization.
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $appends = [
        'avatar_url',
    ];

    public function getAvatarUrlAttribute(): ?string
    {
        return $this->avatar ? asset('storage/'.$this->avatar) : null;
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Get the dashboard path for the user's role.
     */
    public function dashboardPath(): string
    {
        return match ($this->role) {
            'divisi' => '/divisi/dashboard',
            'perencanaan' => '/perencanaan/dashboard',
            'keuangan' => '/keuangan/dashboard',
            'admin' => '/admin/dashboard',
            default => '/',
        };
    }

    public function division(): BelongsTo
    {
        return $this->belongsTo(Division::class);
    }

    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class);
    }

    public function requisitions(): HasMany
    {
        return $this->hasMany(Requisition::class);
    }
}
