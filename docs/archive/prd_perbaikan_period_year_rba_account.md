# PRD: `period_year` Tidak Ter-update Saat Sinkronisasi RBA ke Akun yang Sudah Ada

| | |
|---|---|
| **Proyek** | SI BLUD RSJ Tampan Riau (`si-blud`) |
| **Sifat** | Pencegahan (bug belum aktif — baru akan muncul saat RBA tahun berikutnya diaktifkan) |
| **Status data saat ini** | Aman, tidak perlu pemulihan data |

## 1. Masalah

`app/Models/RbaShift.php`, method `activate()`, blok untuk akun yang **sudah ada** (ditemukan via `account_code`):
```php
if ($account) {
    $account->update([
        'total_budget' => $item->after_total,
        'remaining_budget' => max(0, $item->after_total - $account->spent_budget),
        'account_name' => $item->account_name,
    ]);
}
```
`period_year` tidak ikut di-update. Kolom ini cuma terisi benar saat baris **pertama kali dibuat** (blok `else` di method yang sama, yang sudah benar menyertakan `'period_year' => $this->year`).

**Kenapa belum ketahuan sekarang:** saat shift TA 2027 diaktifkan, tabel `rba_accounts` kebetulan kosong total, jadi semua baris lewat jalur "buat baru" (benar). Begitu ada tahun berikutnya (2028) yang account_code-nya sudah ada dari 2027, baris itu akan lewat jalur `update()` ini — dan `period_year`-nya akan nyangkut di 2027 selamanya, padahal `total_budget`/`remaining_budget` sudah mencerminkan 2028.

**Dampak kalau tidak diperbaiki:** `Keuangan\BudgetController`, `ReportController`, `DashboardController` — semuanya filter `where('period_year', $activeYear)` — akan menampilkan kosong/salah untuk TA 2028 dan seterusnya, walau datanya sebenarnya sudah live dan benar.

## 2. Perbaikan

Tambahkan satu baris di `app/Models/RbaShift.php`, method `activate()`:
```php
if ($account) {
    $account->update([
        'total_budget' => $item->after_total,
        'remaining_budget' => max(0, $item->after_total - $account->spent_budget),
        'account_name' => $item->account_name,
        'period_year' => $this->year, // BARIS BARU
    ]);
}
```
Blok `else` (buat akun baru) tidak perlu diubah — sudah benar.

## 3. Test Wajib

Tambahkan di `tests/Feature/RbaBelanjaPergeseranTest.php`:
- Buat `RbaAccount` dengan `account_code` tertentu dan `period_year` = tahun A (simulasi sisa dari aktivasi sebelumnya).
- Buat `RbaShift` + `RbaExpenseItem` untuk tahun B (B > A) dengan `account_code` yang **sama persis**.
- Panggil `$shift->activate()`.
- Assert: `RbaAccount` dengan `account_code` itu sekarang `period_year` = tahun B (bukan tetap A), dan `total_budget`/`remaining_budget` ikut ter-update seperti biasa.

## 4. Acceptance Criteria

- [ ] Baris `'period_year' => $this->year,` ditambahkan di blok akun-yang-sudah-ada pada `RbaShift::activate()`.
- [ ] Test baru di atas lulus.
- [ ] `php artisan test` hijau, jumlah test tidak berkurang dari baseline.
- [ ] Tidak ada perubahan lain di luar method `activate()` ini — perbaikan ini sengaja sekecil mungkin, satu baris.

## 5. Catatan

Tidak perlu migration atau perbaikan data manual — data `rba_accounts` saat ini (TA 2027) sudah benar. Perbaikan ini murni mencegah masalah yang sama terulang saat RBA TA 2028 nanti diaktifkan.
