# PRD: Perbaikan Otorisasi & Integritas Data — SI BLUD RSJ Tampan Riau

| | |
|---|---|
| **Proyek** | Sistem Informasi BLUD RSJ Tampan Provinsi Riau (repo `si-blud`) |
| **Stack** | Laravel 11 + Inertia.js + React + Tailwind |
| **Disusun** | 23 September 2026 — v2, berdasarkan code review manual: Batch 1a (Admin/Perencanaan/Keuangan/Requisition) + Batch 1b (RbaController & model RBA) |
| **Status kode saat ini** | Belum ada perubahan yang dilakukan atas temuan di dokumen ini |
| **Tujuan dokumen** | Input siap-pakai untuk AI coding agent (mis. di AntiGravity IDE) mengeksekusi perbaikan, dikerjakan bertahap per batch |

## 1. Ringkasan Eksekutif

Review menemukan **dua isu level KRITIS (P0)** yang levelnya setara meski jenisnya beda:
1. Tidak ada pengecekan role di backend (celah akses/keamanan).
2. Angka finansial di-hardcode sebagai fallback di generator dokumen RBA resmi (celah akurasi laporan yang berpotensi dicetak dan diserahkan ke Pemprov Riau/BPK).

Ditambah beberapa isu P1/P2: integritas relasi data, kesenjangan proses bisnis (verifikasi SSH), dan dua titik yang butuh **keputusan produk** (bukan keputusan teknis) sebelum agent boleh mengerjakannya.

**Prinsip kerja untuk agent:** kerjakan P0 dulu sampai teruji, baru P1, baru P2. Satu ID isu per commit/PR. Jangan sentuh isu yang ditandai `blocked: butuh keputusan produk` sampai ada jawaban eksplisit dari pemilik produk.

## 2. Konteks Ringkas Sistem

4 role: `admin`, `divisi` (Unit Pengaju), `perencanaan`, `keuangan`. Alur utama pengajuan barang:

```
Unit Pengaju (divisi) ajukan → status: Pending_Perencanaan
     → Perencanaan verifikasi & tetapkan qty disetujui + rba_account → status: Diproses_Keuangan (atau Ditolak)
     → Keuangan cek sisa pagu & cairkan → status: Disetujui_Selesai (atau Ditolak)
```

Terpisah dari alur usulan, ada mesin **RBA** (`RbaShift` + `RbaExpenseItem`/`RbaRevenueItem`, berjenjang per `account_code`/`parent_code`) yang menyusun & mengesahkan Rencana Bisnis Anggaran per tahun, termasuk versi "Pergeseran". Saat sebuah `RbaShift` diaktifkan, datanya disinkronkan ke `rba_accounts` — tabel yang dipakai modul Requisition untuk cek sisa pagu.

Kolom `role` sudah ada di tabel `users` sejak migration awal (divalidasi di kode sebagai salah satu dari `admin,divisi,perencanaan,keuangan`, tapi bukan `enum` di level DB).

---

## 3. P0-1 — KRITIS: Tidak ada pengecekan role di backend (route & controller)

### Masalah
Seluruh route group (`routes/web.php`: prefix `divisi`, `perencanaan`, `keuangan`, `admin`) hanya dibungkus `middleware('auth')`. Tidak ada middleware role, tidak ada `Gate`/`Policy` (`app/Providers/AppServiceProvider.php` kosong, tidak ada folder `app/Policies`), dan tidak ada pengecekan `auth()->user()->role` di dalam controller manapun yang sudah direview.

**Dampak nyata yang terkonfirmasi dari kode:**
- Kode `Admin\UserController::store()`/`update()` **sudah aman dari mass-assignment** (field di-allow-list eksplisit) — jadi ini bukan soal validasi input. Tapi karena route `/admin/users/*` cuma butuh login (bukan login **sebagai admin**), user berrole apapun bisa memanggil endpoint ini langsung dan mengganti field `role` akun manapun — termasuk akunnya sendiri — menjadi `admin`.
- User berrole `divisi` bisa memanggil `PATCH /keuangan/requisitions/{id}` langsung dengan `status=Disetujui_Selesai`, memicu pencairan anggaran di `Keuangan\RequisitionController::update()` tanpa pernah melalui tahap Perencanaan.
- Pola yang sama berlaku untuk seluruh endpoint di keempat prefix tersebut, termasuk seluruh endpoint RBA (`/perencanaan/rba/**`) yang bisa diaktifkan/dihapus oleh siapapun yang login.

### Requirement
1. Buat middleware role-check, misal `app/Http/Middleware/EnsureUserHasRole.php`, yang menerima parameter role (bisa lebih dari satu) dan mengembalikan `403` (bukan redirect diam-diam) kalau `auth()->user()->role` tidak cocok.
2. Daftarkan sebagai alias di `bootstrap/app.php`:
   ```php
   $middleware->alias(['role' => \App\Http\Middleware\EnsureUserHasRole::class]);
   ```
3. Terapkan ke tiap grup di `routes/web.php`:
   ```php
   Route::prefix('divisi')->middleware(['auth', 'role:divisi'])->group(...)
   Route::prefix('perencanaan')->middleware(['auth', 'role:perencanaan'])->group(...)
   Route::prefix('keuangan')->middleware(['auth', 'role:keuangan'])->group(...)
   Route::prefix('admin')->middleware(['auth', 'role:admin'])->group(...)
   ```
4. Route generik di luar prefix (`/requisitions/{id}/print`, `/profile`, dst.) tetap cukup `auth`, tapi untuk `/requisitions/{id}/print` pertimbangkan scoping tambahan (lihat isu Batch 2 soal kebocoran data lintas unit).
5. Tambahkan pengecekan eksplisit di dalam method-method sensitif sebagai lapisan kedua (defense in depth) — jangan andalkan middleware saja.

### Acceptance Criteria
- `tests/Feature/RoleAuthorizationTest.php` baru: untuk **setiap** kombinasi (role login) × (prefix bukan miliknya) memastikan response `403`, termasuk prefix `perencanaan/rba/**`.
- Login sebagai `divisi`, coba `PATCH /keuangan/requisitions/{id}` → `403`, `rba_accounts.remaining_budget` tidak berubah.
- Login sebagai `divisi`, coba `PATCH /admin/users/{id}` dengan `role=admin` → `403`, kolom `role` tidak berubah.
- Seluruh test di `tests/Feature/*` yang sudah ada tetap lulus (`php artisan test`).

---

## 4. P0-2 — KRITIS: Angka finansial di-hardcode sebagai fallback di dokumen RBA resmi

### Masalah
Di `Perencanaan\RbaController::buildRingkasanData()`, ketika shift bukan 'Murni' dan baris akun tertentu tidak ditemukan di `rba_expense_items`, kode jatuh ke **nilai nominal tetap**, contoh:
```php
$bApbdBefore = 18473614708;
$bOperasiBefore = $expOperasiRow ? (...) : 24807414128;
$bModalBefore   = $expModalRow ? (...) : 1000000000;
$bPeralatanBefore = $expPeralatanRow ? (...) : 500000000;
$bGedungBefore    = $expGedungRow ? (...) : 500000000;
$totExpBefore = $rootExpense ? (...) : 44281028836;
$totExpAfter  = $rootExpense ? (...) : 44191804836;
```
Angka-angka ini sangat spesifik (terlihat seperti nilai riil dari salah satu dokumen RBA yang jadi acuan pengembangan). Method ini dipakai langsung oleh `printRingkasan()` — endpoint yang menghasilkan **dokumen resmi yang dicetak**. Kalau baris akun terkait tidak ditemukan (shift baru yang belum lengkap ter-populate, kode akun berubah, atau data belum sinkron), dokumen cetak akan menampilkan angka-angka ini **tanpa peringatan apapun** — berpotensi jadi laporan resmi dengan angka salah yang tidak disadari.

### Requirement
1. Hapus seluruh nilai fallback numerik hardcode di `buildRingkasanData()`. Ganti dengan `0`.
2. Tambahkan flag eksplisit di return value, mis. `'data_incomplete' => true` beserta daftar `account_code` yang barisnya tidak ditemukan, supaya frontend bisa menampilkan peringatan visual ("Data belum lengkap untuk tahun/versi ini") alih-alih menampilkan angka seolah valid.
3. `printRingkasan.jsx` / halaman cetak terkait harus menampilkan watermark atau banner peringatan kalau `data_incomplete === true`, supaya dokumen tidak tercetak bersih tanpa disadari datanya tidak lengkap.

### Acceptance Criteria
- Panggil `buildRingkasanData()` untuk shift yang sengaja dibuat tanpa baris `account_code` tertentu (mis. hapus baris `1.2.1.3`) → hasil untuk kategori itu `0`, bukan `500000000`, dan `data_incomplete === true`.
- Tambahkan test baru, mis. `tests/Feature/RbaRingkasanDataIntegrityTest.php`.
- Review manual: pastikan tidak ada literal angka nominal (selain `0`) yang jadi fallback di seluruh `RbaController.php`.

---

## 5. P1 — TINGGI: Pencegahan ganti role diri sendiri (pelengkap P0-1)

### Masalah
`Admin\UserController` sudah punya guard "tidak bisa nonaktifkan/hapus akun sendiri" (`toggleStatus`, `destroy`), tapi tidak ada guard serupa untuk mengganti role diri sendiri di `update()`.

### Requirement
Di `Admin\UserController::update()`, tambahkan pengecekan: jika `$user->id === auth()->id()` dan `$validated['role'] !== $user->role`, tolak dengan pesan `"Anda tidak dapat mengubah role akun Anda sendiri."`.

### Acceptance Criteria
- Admin login mencoba ubah role akunnya sendiri → ditolak, role di DB tidak berubah.
- Admin mengubah role user lain → tetap berhasil seperti biasa.

---

## 6. P1 — TINGGI: Kolom `budget_id` merujuk tabel yang salah / duplikat `rba_account_id`

### Masalah
Migration `create_requisitions_table` men-`constrained('rba_accounts')` untuk `budget_id`, tapi `Requisition.php` punya relasi `belongsTo(Budget::class, 'budget_id')`. Validasi & penulisan nilainya di `Keuangan\RequisitionController::update()` konsisten memakai `rba_accounts`. Jadi `budget_id` selalu berisi ID dari `rba_accounts`, tapi relasi Eloquent-nya menunjuk tabel `budgets` yang tidak berhubungan.

### Requirement
Agent inspeksi dulu `app/Models/Budget.php`, migration `budgets`, dan `resources/js/Pages/Keuangan/Budgets/*.jsx`, lalu pilih:
- **Opsi A (default kalau `Budget` tidak dipakai di alur requisition manapun):** hapus kolom `budget_id` dari `requisitions` via migration baru, hapus relasi `budget()`, bersihkan referensinya di `Keuangan\RequisitionController`.
- **Opsi B (kalau `Budget` punya fungsi nyata terpisah):** ganti nama kolom (mis. `selected_rba_account_id`) dan pastikan FK+validasi+relasi konsisten ke `rba_accounts`.

### Acceptance Criteria
- Tidak ada lagi kolom yang FK-nya menunjuk satu tabel tapi divalidasi/diisi dengan ID dari tabel lain.
- `php artisan test` tetap lulus, termasuk `BudgetReportTest.php`.

---

## 7. P1 — TINGGI: Verifikasi SSH (Standar Satuan Harga) belum ada di tahap Perencanaan

### Masalah
Proses bisnis mengharuskan Perencanaan menyaring usulan belanja pakai SSH. `items.standard_price` ada (dipakai sebagai fallback harga di Keuangan), dan route `verify-standard` ada — tapi untuk data master item, bukan verifikasi per-requisition. `Perencanaan\RequisitionController::update()` tidak membandingkan `unit_price` vs `standard_price` sama sekali.

### Requirement
1. Tampilkan `standard_price` bersebelahan dengan `unit_price` di halaman verifikasi Perencanaan.
2. Di `Perencanaan\RequisitionController::update()`: kalau ada baris `unit_price > standard_price` (toleransi configurable, default 0%), **wajib** isi `notes_perencanaan` yang menjelaskan alasan.
3. Simpan indikator "melebihi SSH" per baris untuk ditampilkan di laporan/print.

### Acceptance Criteria
- Baris `unit_price > standard_price` + `notes_perencanaan` kosong → validasi gagal.
- Baris sama + `notes_perencanaan` terisi → berhasil disimpan.
- Tambahkan test di `tests/Feature/PerencanaanRbaPlanningTest.php` atau file baru.

---

## 8. P1 — TINGGI: `ensureShiftItemsPopulated()` bisa mengambil template lintas-tahun secara acak

### Masalah
```php
$template = RbaShift::where('id', '!=', $shift->id)
    ->whereHas('expenseItems')
    ->first();
```
Tidak ada filter `year`, tidak ada `orderBy` eksplisit — bergantung pada urutan implisit database. Method ini dipanggil berulang kali di `index()` (termasuk di dalam loop `$shifts->transform()`), sehingga shift tahun manapun yang belum punya item berisiko ter-populate dari struktur akun tahun lain.

### Requirement
Tambahkan `->where('year', $shift->year)` dan `->orderByDesc('id')` pada query template, atau ambil eksplisit dari Murni shift tahun yang sama alih-alih "shift manapun yang kebetulan punya item".

### Acceptance Criteria
- Membuat shift baru untuk tahun X hanya ter-populate dari shift tahun X lain (atau kosong kalau tidak ada), tidak pernah dari tahun lain.

---

## 9. P1 — TINGGI (Perlu Keputusan Produk): Edit manual pada shift Murni bisa tertimpa otomatis

### Masalah
Blok sinkronisasi di `ensureShiftItemsPopulated()` untuk shift bertipe Murni **selalu jalan setiap method ini dipanggil** (setiap kali halaman RBA index dibuka), menimpa ulang baris expense item Murni dari total `Requisition` berstatus `Disetujui_Selesai`. Kalau Perencanaan pernah mengedit manual angka Murni lewat `updateItem()`, perubahan itu bisa hilang diam-diam saat halaman dibuka lagi.

### Keputusan yang perlu diambil pemilik produk
- **(a)** Murni memang seharusnya read-only/auto-hitung dari requisition yang disetujui (live rollup) — kalau ini yang benar, sebaiknya field edit untuk shift Murni di UI dikunci/disembunyikan supaya tidak menyesatkan pengguna.
- **(b)** Murni seharusnya bisa diisi target manual dan persisten — kalau ini yang benar, hapus auto-resync tak bersyarat ini, jadikan hanya jalan sekali saat shift benar-benar baru dibuat (item masih kosong).

**Agent: jangan pilih sendiri — tandai `blocked: butuh keputusan produk`.**

---

## 10. P2 — SEDANG: `quantity_approved` tidak divalidasi terhadap `quantity_requested`

### Masalah
Rule validasi di `Perencanaan\RequisitionController::update()` adalah `'items.*.quantity_approved' => ['required','integer','min:0']` — tidak ada batas atas.

### Requirement
```php
'items.*.quantity_approved' => ['required', 'integer', 'min:0', function ($attribute, $value, $fail) use ($requisition) {
    // cocokkan index dari $attribute ke requisition->requisitionDetails
    // gagal kalau $value > detail->quantity_requested
}],
```

### Acceptance Criteria
- Submit `quantity_approved` lebih besar dari `quantity_requested` → validasi gagal, pesan dalam Bahasa Indonesia.

---

## 11. P2 — SEDANG (Perlu Keputusan Produk): Fitur multi-akun per baris usulan setengah jalan

### Masalah
Migration `add_multi_account_and_jenis_to_requisition_details` menambahkan `rba_account_id`+`jenis_belanja` ke `requisition_details`, tapi `Perencanaan\RequisitionController::update()` hanya menyimpan satu `rba_account_id` di level header. `Keuangan\RequisitionController` membaca kolom per-baris ini sebagai prioritas pertama, tapi tidak ada yang pernah menulis nilai berbeda ke sana — di praktiknya semua baris selalu satu akun yang sama.

### Keputusan yang perlu diambil pemilik produk
- **(a) Implementasikan penuh:** UI & controller Perencanaan memungkinkan tiap baris dipilihkan akun berbeda.
- **(b) Descope:** hapus kolom per-baris ini, kembali ke satu akun per requisition di header saja.

**Agent: jangan pilih sendiri — tandai `blocked: butuh keputusan produk`.**

---

## 12. P2 — SEDANG: `sahkan()` mengecek dua model berbeda pakai ID yang sama

### Masalah
```php
$rba = \App\Models\RbaDraft::find($id);
if ($rba) { $rba->update(['status' => 'Disahkan']); }
$shift = RbaShift::find($id);
if ($shift) { $shift->activate(); }
```
`RbaDraft` dan `RbaShift` adalah tabel terpisah dengan auto-increment ID masing-masing. ID yang kebetulan sama pada kedua tabel akan membuat keduanya ikut berubah status meski tidak berhubungan. `RbaDraft` beserta method `create()`/`store()` (berkomentar eksplisit **"(backward compatible)"** di kode) tampak seperti sisa sistem lama yang sudah digantikan penuh oleh `RbaShift`.

### Requirement
1. Cek apakah halaman `Perencanaan/RBA/Create.jsx` masih ditautkan di navigasi manapun.
2. Kalau tidak dipakai: hapus `RbaDraft` (model + tabel via migration baru + route `create`/`store`) dan bagian `RbaDraft` di `sahkan()`.
3. Kalau ternyata masih dipakai: pisahkan route `sahkan` untuk draft vs shift supaya tidak berbagi satu parameter `{id}` generik untuk dua tabel berbeda.

### Acceptance Criteria
- Tidak ada lagi satu route/method yang mencari ID yang sama di dua tabel independen.

---

## 13. P2 — RENDAH: Rollup header di-hardcode per kode akun, bukan rekursif generik

### Masalah
`recalculateHeaders()`/`recalculateRevenueHeaders()` memanggil `updateHeaderRow()` untuk daftar kode akun yang ditulis eksplisit satu-satu, bukan menaiki hierarki `parent_code` secara generik. Urutan pemanggilan saat ini sudah benar (anak dihitung sebelum induk), jadi tidak salah untuk struktur akun yang ada sekarang — tapi kalau struktur Bagan Akun BLUD berubah, baris kode baru tidak akan ikut ter-rollup sampai ada yang menambah manual di PHP.

### Requirement (tidak mendesak, boleh masuk backlog)
Refactor jadi rollup rekursif berbasis `parent_code`+`level` (proses level tertinggi ke terendah), sehingga menambah cabang akun baru tidak perlu ubah kode `RbaController`.

### Acceptance Criteria
- Menambah `RbaExpenseItem` dengan `parent_code` baru yang belum pernah ada otomatis ikut ter-rollup ke induknya tanpa perubahan kode.

---

## 14. P2 — RENDAH: Default `doc_title` di `RbaShift` ter-hardcode

### Masalah
`rba_shifts.doc_title` default-nya string statis `'RENCANA BISNIS DAN ANGGARAN PERGESERAN III'`.

### Requirement
Hapus default hardcode; wajibkan diisi saat create, atau generate otomatis dari `shift_name`+`year`.

### Acceptance Criteria
- Membuat `RbaShift` baru tanpa `doc_title` eksplisit tidak menghasilkan judul "PERGESERAN III" untuk shift lain.

---

## 15. Batasan Umum untuk Agent

- **Jangan edit migration lama yang sudah pernah dijalankan** — perubahan skema apapun wajib lewat migration baru.
- **Jangan ubah nama route yang sudah dipakai di frontend** tanpa menyesuaikan pemanggilnya.
- **Tambahkan/perluas test untuk setiap acceptance criteria**, ikuti pola yang sudah ada di `tests/Feature/`.
- Jalankan `php artisan test` sampai hijau sebelum menganggap satu isu selesai.
- Semua pesan ke pengguna tetap Bahasa Indonesia.
- Satu ID isu per commit/PR.
- Isu berlabel `blocked: butuh keputusan produk` (§9, §11) dilewati sampai ada jawaban eksplisit — jangan diasumsikan sendiri oleh agent.

## 16. Definition of Done (Batch 1: §3–§14)

- [ ] P0-1 (§3) RBAC selesai + `RoleAuthorizationTest.php` hijau
- [ ] P0-2 (§4) fallback hardcode di `buildRingkasanData()` dihapus + flag `data_incomplete`
- [ ] P1 (§5) guard ganti-role-sendiri selesai
- [ ] P1 (§6) `budget_id` konsisten (Opsi A/B dipilih & diimplementasikan)
- [ ] P1 (§7) verifikasi SSH tampil & tervalidasi di tahap Perencanaan
- [ ] P1 (§8) template `ensureShiftItemsPopulated` di-scope per tahun
- [ ] P1 (§9) diberi label `blocked` sampai keputusan produk turun
- [ ] P2 (§10) validasi `quantity_approved` selesai
- [ ] P2 (§11) diberi label `blocked` sampai keputusan produk turun
- [ ] P2 (§12) `sahkan()`/`RbaDraft` dibereskan
- [ ] P2 (§13) dicatat sebagai backlog (opsional untuk batch ini)
- [ ] P2 (§14) `doc_title` tidak lagi hardcode
- [ ] Seluruh test suite (`php artisan test`) hijau

## 17. Area yang Belum Direview — Batch 2 (jangan dikerjakan bersamaan Batch 1)

Supaya scope tidak membengkak sebelum Batch 1 selesai dieksekusi & diverifikasi, area berikut sengaja **belum** dimasukkan requirement teknisnya dan menunggu putaran review berikutnya:

- `Divisi\RequisitionController` — terutama isolasi data: apakah `index()`/`show()` sudah di-scope ke `unit_id` milik user yang login, atau lintas-unit bisa saling intip/edit usulan.
- `Perencanaan\ItemController` — alur `verify-standard` untuk data master SSH.
- Perbandingan form React (`Divisi/Requisitions/*.jsx`) vs field-field di form kertas asli (`USULAN_RBA_LABOR.xlsx`) — memastikan tidak ada field penting yang hilang saat migrasi ke digital.

## 18. Lampiran — File yang Direview untuk Menyusun Dokumen Ini

**Batch 1a:** `routes/web.php`, `bootstrap/app.php`, `app/Providers/AppServiceProvider.php`, `app/Models/User.php`, `app/Models/Requisition.php`, `app/Models/RequisitionDetail.php`, `app/Http/Controllers/Admin/UserController.php`, `app/Http/Controllers/Perencanaan/RequisitionController.php`, `app/Http/Controllers/Keuangan/RequisitionController.php`, migration `create_rba_accounts_table`, `create_requisitions_table`, `create_requisition_details_table`, `create_rba_drafts_table`, `create_rba_shifts_table`, `create_rba_expense_items_table`, `create_rba_revenue_items_table`, `create_units_table`, `add_nip_position_phone_status_to_users_table`, `add_multi_account_and_jenis_to_requisition_details`.

**Batch 1b:** `app/Http/Controllers/Perencanaan/RbaController.php`, `app/Models/RbaShift.php`, `app/Models/RbaDraft.php`, `app/Models/RbaExpenseItem.php`, `app/Models/RbaRevenueItem.php`.
