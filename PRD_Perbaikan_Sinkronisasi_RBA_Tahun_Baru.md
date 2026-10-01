# PRD: Perbaikan Sinkronisasi RBA — Shift Pertama di Tahun Baru Tidak Ter-populate

| | |
|---|---|
| **Proyek** | SI BLUD RSJ Tampan Riau (`si-blud`) |
| **Disusun** | 26 September 2026 — ditemukan saat pengujian manual TA 2027 |
| **Bukti** | `rba_accounts` 0 baris (semua tahun), `RbaShift` id=17 (TA 2027, "Murni", status Aktif) punya 0 `RbaExpenseItem` |
| **Dampak nyata** | Dropdown "Rekening Belanja Aktif" kosong di form usulan Divisi untuk TA 2027 |
| **Status** | Belum ada perubahan kode/data atas temuan ini |

## 1. Ringkasan Eksekutif

`RbaController::ensureShiftItemsPopulated()` mengisi item sebuah `RbaShift` dari "shift lain yang sudah punya item" sebagai template. Sejak diperbaiki (isu §8, batch sebelumnya) supaya hanya mencari template **di tahun yang sama**, method ini tidak punya jalur cadangan kalau shift yang sedang dibuka adalah **shift pertama untuk tahun itu** — tidak ada "shift lain di tahun yang sama" untuk dicontoh, jadi baris item tidak pernah dibuat, dan `RbaShift::activate()` tidak punya apapun untuk disinkronkan ke `rba_accounts`.

Ini murni bug kode (regresi dari perbaikan §8 yang kurang mempertimbangkan kasus tahun pertama), bukan sesuatu yang dihapus agent secara sengaja.

## 2. Langkah 0 — WAJIB Dilakukan Lebih Dulu: Diagnosis Data

**Sebelum menulis kode apapun**, agent wajib menjalankan ini dan melaporkan hasilnya persis:
```
php artisan tinker --execute="dump(\App\Models\RbaShift::orderBy('year')->pluck('year','id')->toArray()); dump(\App\Models\RbaExpenseItem::select('rba_shift_id')->distinct()->pluck('rba_shift_id')->toArray());"
```

Hasilnya menentukan jalur pemulihan data di §5:
- **Jalur A** — ada `RbaShift` tahun sebelumnya (mis. 2026) yang ID-nya muncul di hasil kedua (berarti dia punya `RbaExpenseItem`) → datanya secara historis ada, tinggal ditarik.
- **Jalur B** — tidak ada satupun shift tahun manapun yang pernah punya item (database ini kosong sejak awal secara historis, kemungkinan bekas `migrate:fresh` tanpa seed lengkap) → tidak ada yang bisa diwariskan, perlu baseline baru.

**Laporkan hasil ini dan jalur mana yang berlaku sebelum lanjut ke §5.**

## 3. Perbaikan Kode (wajib dikerjakan terlepas dari Jalur A/B)

### Root cause
`app/Http/Controllers/Perencanaan/RbaController.php`, method `ensureShiftItemsPopulated()`:
```php
$template = RbaShift::where('id', '!=', $shift->id)
    ->whereHas('expenseItems')
    ->orderByDesc('id')
    ->first();
```
Tidak ada jalur cadangan kalau shift ini adalah shift pertama di tahunnya — sedangkan kode rekening BLUD memang baku dan tidak berubah tiap tahun (dikonfirmasi dari dokumen RBA Pergeseran III 2026 yang jadi acuan awal pembangunan sistem), jadi mewarisi struktur dari tahun sebelumnya itu memang perilaku yang benar dan diperlukan — bukan cuma "tambal sementara".

### Requirement
Ganti pencarian `$template` menjadi:
```php
$template = RbaShift::where('year', $shift->year)
    ->where('id', '!=', $shift->id)
    ->whereHas('expenseItems')
    ->orderByDesc('id')
    ->first();

if (!$template) {
    $template = RbaShift::where('year', '<', $shift->year)
        ->whereHas('expenseItems')
        ->orderByDesc('year')
        ->orderByDesc('id')
        ->first();
}
```

### Acceptance Criteria (kode)
- Test baru: buat `RbaShift` untuk tahun yang belum pernah ada shift lain sama sekali (baik di tahun itu maupun tahun-tahun sebelumnya di lingkungan test) → shift tetap kosong dengan wajar (tidak error), bukan silent-fail yang tidak terdeteksi.
- Test baru: buat `RbaShift` untuk tahun baru dengan `RbaShift` tahun sebelumnya yang punya item → shift baru otomatis terisi item dari tahun sebelumnya, dengan `account_code`/`account_name` yang sama.
- Test lama tidak berubah perilakunya (shift kedua dst di tahun yang sama tetap mengambil dari tahun yang sama seperti sebelumnya, bukan lompat ke tahun lalu).
- `php artisan test` hijau, jumlah test tidak berkurang dari baseline.

## 4. Batasan Perbaikan Kode

- Jangan ubah urutan pencarian: tahun yang sama tetap prioritas pertama, tahun sebelumnya cuma fallback.
- Jangan sentuh `RbaShift::activate()` — logikanya sudah benar, masalahnya murni di titik pencarian template ini.
- Satu commit untuk perbaikan §3 ini saja, terpisah dari tindakan pemulihan data di §5.

## 5. Pemulihan Data (dilakukan SETELAH §3 selesai dan test hijau)

### Jalur A — Ada data historis
1. Buka halaman RBA di Perencanaan, TA 2027, tab Versi.
2. Klik **"Aktifkan"** lagi pada shift Murni (id=17) yang sama. Dengan kode yang sudah diperbaiki, ini akan menarik struktur dari shift tahun sebelumnya yang datanya sudah lengkap.
3. Verifikasi: `php artisan tinker --execute="dump(\App\Models\RbaExpenseItem::where('rba_shift_id', 17)->count()); dump(\App\Models\RbaAccount::count());"` — dua-duanya harus lebih dari 0.

### Jalur B — Tidak ada data historis sama sekali (database kosong sejak awal)
**Jangan isi `rba_accounts` secara manual satu-satu.** Project ini sudah punya seeder yang dibuat mengikuti dokumen resmi (`RbaAccountSeeder`, `RbaSeeder`, kemungkinan juga `RbaPergeseran3Seeder` — nama-nama ini sudah terlihat sejak awal proyek). Langkah:
1. Agent membaca isi seeder-seeder tersebut dan melaporkan: apakah datanya sudah cocok dengan dokumen resmi (`4__RBA_PERGESERAN_3_TAHUN_2026...pdf` yang jadi acuan — total belanja `Rp 44.191.804.836`, sesuai kolom "Setelah Pergeseran III"). **Jangan dijalankan dulu sebelum ini dikonfirmasi cocok**, karena kalau seeder-nya sudah usang/beda dari dokumen resmi, menjalankannya cuma memindahkan masalah "data salah" ke tempat baru.
2. Kalau cocok: jalankan seeder yang relevan untuk membuat baseline TA 2026 (bukan `migrate:fresh` — itu akan menghapus SEMUA data termasuk user dan requisition yang sudah ada di database ini; **hanya jalankan seeder spesifiknya**, misal `php artisan db:seed --class=RbaAccountSeeder`, setelah dicek isinya idempotent/aman dijalankan di database yang sudah berisi data lain).
3. Setelah baseline 2026 ada, lanjut sama seperti Jalur A langkah 1–3 di atas untuk shift 2027.

**Agent wajib melaporkan dan menunggu konfirmasi sebelum menjalankan seeder apapun di Jalur B** — ini menyentuh data, bukan cuma kode.

## 6. Acceptance Criteria Akhir

- `RbaAccount::count()` > 0.
- Dropdown "Rincian Objek (Rekening Belanja Aktif)" di form usulan Divisi untuk TA 2027 terisi dan bisa dipilih.
- Total pagu di `rba_accounts` untuk kode-kode yang ada di dokumen resmi mendekati/sama dengan angka di kolom "Jumlah (Rp) Setelah Pergeseran III" pada dokumen tersebut (uji sampel beberapa baris, tidak perlu seluruhnya).
- `php artisan test` hijau.

## 7. Lampiran

`app/Http/Controllers/Perencanaan/RbaController.php` (method `ensureShiftItemsPopulated`), `app/Models/RbaShift.php` (method `activate`), seeder `RbaAccountSeeder.php`/`RbaSeeder.php`/`RbaPergeseran3Seeder.php`, dokumen acuan `4__RBA_PERGESERAN_3_TAHUN_2026__31_Agustus_2026__-_Rincian_Belanja_2.pdf`.
