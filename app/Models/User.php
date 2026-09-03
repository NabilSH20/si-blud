<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
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
        return $this->avatar ? asset('storage/' . $this->avatar) : null;
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

    public function requisitions(): HasMany
    {
        return $this->hasMany(Requisition::class);
    }
}
