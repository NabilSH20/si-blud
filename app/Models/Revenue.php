<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Revenue extends Model
{
    use HasFactory;

    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'date' => 'date',
            'amount' => 'decimal:2',
        ];
    }

    /**
     * Map transaction revenue source or legacy name into official RBA revenue pos name.
     */
    public static function normalizeSourceToPosName(?string $source): string
    {
        if (empty($source)) {
            return '';
        }

        return match ($source) {
            'Instalasi Gawat Darurat (IGD)' => 'Pendapatan Pelayanan Gawat Darurat',
            'Instalasi Farmasi & Apotek' => 'Pendapatan Pelayanan Farmasi',
            'Poliklinik Jiwa Terpadu' => 'Pendapatan Pelayanan Rawat Jalan',
            'Instalasi Laboratorium' => 'Pendapatan Pelayanan Laboratorium',
            'Instalasi Rawat Inap Jiwa' => 'Pendapatan Pelayanan Rawat Inap',
            'Instalasi Radiologi' => 'Pendapatan Pelayanan Radiologi',
            'Pelayanan Visum & Mediko-Legal' => 'Pendapatan Pelayanan Forensik Psikiatri',
            'Pendapatan Jasa Giro & Non-Operasional' => 'Jasa Giro',
            default => $source,
        };
    }

    /**
     * Resolve official BLUD funding/revenue category for a given revenue source.
     */
    public static function resolveCategory(?string $source): string
    {
        $normalized = static::normalizeSourceToPosName($source);

        if (str_contains($normalized, 'Pelayanan') || str_contains($normalized, 'Instalasi')) {
            return 'Jasa Layanan';
        }
        if (str_contains($normalized, 'Kerjasama') || str_contains($normalized, 'Parkir') || str_contains($normalized, 'Fasilitas')) {
            return 'Hasil Kerja Sama';
        }
        if (str_contains($normalized, 'APBD')) {
            return 'APBD';
        }
        if (str_contains($normalized, 'Giro') || str_contains($normalized, 'Bunga') || str_contains($normalized, 'Lain')) {
            return 'Lain-lain BLUD Sah';
        }

        return 'Jasa Layanan';
    }
}
