<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Cache;

class SystemSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'key_name',
        'value',
        'label',
        'group_name',
        'type',
        'updated_by',
    ];

    public function updatedByUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public static function get(string $key, mixed $default = null): mixed
    {
        return Cache::remember("system_setting_{$key}", 3600, function () use ($key, $default) {
            $setting = static::where('key_name', $key)->first();
            return $setting ? $setting->value : $default;
        });
    }

    public static function set(string $key, mixed $value, ?int $userId = null): static
    {
        Cache::forget("system_setting_{$key}");
        Cache::forget('system_settings_all');

        $setting = static::firstOrNew(['key_name' => $key]);
        $setting->value = $value;
        if (! $setting->label) {
            $setting->label = ucwords(str_replace('_', ' ', $key));
        }
        if ($userId) {
            $setting->updated_by = $userId;
        }
        $setting->save();

        return $setting;
    }

    public static function getAllKeyValues(): array
    {
        return Cache::remember('system_settings_all', 3600, function () {
            return static::pluck('value', 'key_name')->toArray();
        });
    }
}
