# PRD: Perbaikan Modul Admin — Division, Unit, Fiscal Year

| | |
|---|---|
| **Proyek** | SI BLUD RSJ Tampan Riau (`si-blud`) |
| **Cakupan review** | `Admin\DivisionController`, `UnitController`, `FiscalYearController`, model terkait, `DivisionFormModal.jsx`, `UnitFormModal.jsx`, `Admin/FiscalYears/Index.jsx` |
| **Tidak sempat direview** | `Admin/Divisions/Index.jsx` (file tidak sampai karena duplikat nama upload) — akan menyusul terpisah |
| **Status kode saat ini** | Belum ada perubahan atas temuan di dokumen ini |

## 1. Ringkasan Eksekutif

Satu temuan **TINGGI** yang levelnya sama dengan pola "dua sumber kebenaran" yang berkali-kali jadi biang insiden di project ini (`budget_id`, kolom bayangan `year`, dst): daftar kode divisi yang boleh punya staf ber-role `divisi` ternyata **di-hardcode terpisah** di `UserController`, sama sekali tidak tersambung ke tabel `divisions` yang sesungguhnya dikelola `DivisionController`. Selebihnya modul ini relatif rapi — logika `is_default`/`is_active` di `FiscalYearController` justru salah satu implementasi paling solid yang pernah kita review.

## 2. P1 — TINGGI: Whitelist Divisi "Pengusul" Terpisah dari Data Divisi Sesungguhnya

### Masalah
Di `Admin\UserController` (sudah kita audit jauh sebelumnya), ada whitelist hardcoded:
```php
$allowedDivisions = Division::whereIn('division_code', ['MEDIK', 'RAWAT', 'PENUNJANG_DIKLIT', 'YAN', 'PENUNJANG'])
    ->pluck('id')->toArray();
```
Ini menentukan divisi mana saja yang boleh punya user ber-role `divisi` (Unit Pengaju). Tapi `Admin\DivisionController::store()`/`update()` **tidak tahu-menahu** soal whitelist ini — admin bebas membuat `division_code` apa saja (asal unik), dan bebas **mengubah** `division_code` divisi yang sudah ada.

**Dua skenario nyata yang akan rusak:**
1. Admin membuat divisi baru, misal `division_code = 'FARMASI'`, lalu coba buat user `role: divisi` untuk divisi itu → **ditolak**, padahal divisinya sah dan baru saja dibuat lewat UI resmi.
2. Admin mengubah `division_code` dari `MEDIK` menjadi `MEDIK_2027` (sekadar rename, texas yang wajar dilakukan admin) → **seluruh** user `divisi` yang sudah ada di bawah divisi itu tetap jalan (datanya tidak berubah), tapi admin manapun yang mencoba membuat user `divisi` BARU untuk divisi itu akan ditolak, karena whitelist masih mencari literal `'MEDIK'` yang sudah tidak ada.

### Verifikasi wajib sebelum memperbaiki (pelajaran dari insiden kolom `year`)
Model `Division` sudah punya kolom `group` (`Pelayanan_Keperawatan` / `Umum_Kepegawaian`) yang kemungkinan besar **sudah merepresentasikan hal yang sama** dengan maksud whitelist ini (lihat `DivisionFormModal.jsx`: pilihan "Pelayanan & Keperawatan" dideskripsikan sebagai "Unit medis, ruang rawat, dan pelayanan pasien" — persis semangat whitelist).

**Agent wajib jalankan ini dulu dan laporkan hasilnya:**
```
php artisan tinker --execute="dump(\App\Models\Division::whereIn('division_code',['MEDIK','RAWAT','PENUNJANG_DIKLIT','YAN','PENUNJANG'])->pluck('group','division_code')->toArray()); dump(\App\Models\Division::where('group','Pelayanan_Keperawatan')->pluck('division_code')->toArray());"
```
- **Kalau kedua himpunan itu identik** (lima kode whitelist semuanya `group = Pelayanan_Keperawatan`, dan tidak ada divisi `Pelayanan_Keperawatan` lain di luar lima itu) → lanjut ke Opsi A.
- **Kalau tidak identik** → jangan asumsikan sendiri, laporkan selisihnya ke pemilik produk dan tunggu keputusan (apakah `group` perlu disesuaikan dulu, atau whitelist memang harus jadi kolom terpisah — Opsi B).

### Opsi A (disarankan, kalau verifikasi di atas cocok)
Ganti whitelist hardcoded di `Admin\UserController::store()` dan `update()` dari:
```php
$allowedDivisions = Division::whereIn('division_code', [...])->pluck('id')->toArray();
```
menjadi:
```php
$allowedDivisions = Division::where('group', 'Pelayanan_Keperawatan')->pluck('id')->toArray();
```
Dengan ini, menambah/mengubah divisi lewat `DivisionController` otomatis konsisten dengan siapa yang boleh jadi Unit Pengaju — satu sumber kebenaran, bukan dua.

### Opsi B (kalau `group` tidak cocok 1:1)
Tambahkan kolom eksplisit baru di tabel `divisions`, misal `allows_requester_role` (boolean, default `false`), migration baru, tampilkan sebagai toggle di `DivisionFormModal.jsx`, dan `UserController` query dari kolom itu alih-alih whitelist literal. **Jangan pilih opsi ini tanpa konfirmasi pemilik produk** — ini perubahan skema, bukan sekadar refactor kode.

### Acceptance Criteria
- Hasil verifikasi (query di atas) dilaporkan ke pemilik produk sebelum opsi manapun dieksekusi.
- Setelah fix: membuat divisi baru dengan `group = Pelayanan_Keperawatan` lewat `DivisionController`, lalu langsung membuat user `role: divisi` untuk divisi itu → berhasil, tanpa perlu ubah kode apapun di `UserController`.
- Mengubah `division_code` divisi yang sudah ada (rename) tidak mematahkan kemampuan membuat user `divisi` baru untuk divisi itu.
- Test baru di `tests/Feature/UserLoginAndCrudTest.php` atau `BidangUnitHierarchyTest.php`: buat divisi baru via factory dengan `group = Pelayanan_Keperawatan` dan `division_code` di luar lima kode lama, pastikan bisa dipakai membuat user `divisi`.
- `php artisan test` hijau, jumlah test tidak berkurang dari baseline.

## 3. P2 — SEDANG: Tiga Controller Admin Tidak Punya `abort_unless(role === 'admin')`

### Masalah
Berbeda dari `UserController` (sudah dibenahi di Batch 1) dan `BudgetController` Keuangan (sudah dibenahi di Batch 3), **tidak satupun** method di `DivisionController`, `UnitController`, `FiscalYearController` punya pengecekan role eksplisit. Middleware `role:admin` di `routes/web.php` sudah menutup celah akses lintas-role (ini bukan P0 seperti insiden awal dulu), tapi ini P0-1 di Batch 1 eksplisit meminta pola ini diterapkan sebagai lapis kedua di **semua** controller sensitif — tiga file ini terlewat.

### Requirement
Tambahkan `abort_unless(auth()->user()->role === 'admin', 403, 'Akses ditolak.');` di baris pertama setiap method yang mengubah data: `DivisionController::store/update/destroy`, `UnitController::store/update/destroy`, `FiscalYearController::store/update/toggleStatus/setDefault/destroy`. Method `index`/`create`/`edit` (read-only) tidak wajib, tapi boleh disertakan untuk konsistensi.

### Acceptance Criteria
- Tidak ada test yang berubah perilakunya (middleware sudah menutup akses lintas-role, jadi ini murni lapis tambahan, bukan perubahan fungsional).
- `php artisan test` hijau.

## 4. P2 — RENDAH: Tombol "Aktif/Ditutup" di FiscalYears Tidak Mengikuti Guard Backend

### Masalah
`Admin/FiscalYears/Index.jsx`: tombol **"Set Default"** dan **"Hapus"** sudah benar disembunyikan untuk tahun yang sedang default (`{!fy.is_default && (...)}`). Tapi badge **"Aktif/Ditutup"** (pemicu `toggleStatus`) **tidak** punya guard serupa — tetap bisa diklik untuk tahun default. Backend sudah benar menolak (`'Tahun anggaran default tidak dapat dinonaktifkan...'`), jadi ini bukan celah keamanan — cuma admin bisa klik, dapat pesan error di flash message yang gampang tidak disadari, bukan tombolnya langsung terlihat nonaktif.

### Requirement
Tambahkan kondisi visual: kalau `fy.is_default`, badge status ditampilkan non-interaktif (atau tetap bisa diklik tapi dengan tooltip "Tidak bisa menonaktifkan tahun default" sebelum submit, bukan sesudah).

### Acceptance Criteria
- Mengklik badge status pada tahun default tidak mengirim request yang pasti ditolak — baik lewat disable total, atau konfirmasi dialog yang menjelaskan kenapa sebelum submit.

## 5. P2 — RENDAH: Menonaktifkan Fiscal Year Tidak Mempengaruhi Sesi User yang Sedang Memakainya

### Masalah
`session('active_year')` disimpan per-sesi user saat login (atau lewat `/set-year`). Kalau Admin menonaktifkan (bukan menghapus) tahun yang sedang dipakai seorang user di sesinya, tidak ada mekanisme yang memberi tahu/memindahkan user tersebut — dia akan terus melihat data tahun yang sudah "ditutup" sampai logout/pilih tahun lain manual.

### Requirement (boleh backlog, tidak mendesak)
Opsional: saat `toggleStatus` menonaktifkan sebuah tahun, tidak perlu solusi real-time — cukup dicatat sebagai keterbatasan yang diketahui. Kalau ingin diperbaiki: tambahkan pengecekan di middleware/awal request bahwa `session('active_year')` masih `is_active`, kalau tidak, fallback ke `FiscalYear::getDefaultYear()`.

### Acceptance Criteria
Tidak wajib untuk batch ini — cukup dicatat di backlog.

## 6. ✅ Temuan Positif (tidak perlu tindakan)

- **Logika `is_default`/`is_active` di `FiscalYearController`** konsisten di tiga jalur tulis (`store`, `update`, `setDefault`) — semuanya membersihkan `is_default` lama sebelum set yang baru, mencegah dua tahun sama-sama default. `toggleStatus` punya guard yang benar mencegah menonaktifkan tahun default+aktif. Ini salah satu bagian kode paling rapi yang pernah kita audit.
- **Guard hapus Division/Unit** (`units()->exists()`, `users()->exists()`, `requisitions()->exists()`) terverifikasi nyata dari kode, bukan cuma nama test — tiga relasi dicek sebelum hapus diizinkan.
- **Validasi `division_id`/`exists:divisions,id`** di `UnitController` sudah benar mencegah unit menempel ke divisi yang tidak valid.

## 7. Batasan Umum untuk Agent

- §2 (whitelist) **wajib** verifikasi data dulu sebelum memilih Opsi A/B — ikuti perintah tinker yang sudah disediakan, jangan menebak.
- Jangan ubah lima kode `MEDIK/RAWAT/PENUNJANG_DIKLIT/YAN/PENUNJANG` yang sudah ada di seed data — perbaikan ini soal *cara mengecek*-nya, bukan mengubah data yang sudah benar.
- Satu ID isu per commit/PR.
- `php artisan test` hijau, jumlah test tidak berkurang dari baseline (139).

## 8. Definition of Done

- [ ] §2 — hasil verifikasi dilaporkan, opsi dipilih sesuai bukti, whitelist tidak lagi hardcoded terpisah dari data `divisions`
- [ ] §3 — `abort_unless(role==='admin')` ditambahkan di tiga controller
- [ ] §4 — tombol status FiscalYear menyesuaikan guard backend
- [ ] §5 — dicatat sebagai backlog (opsional)
- [ ] Seluruh test suite hijau, jumlah test tidak berkurang

## 9. Lampiran

`app/Http/Controllers/Admin/DivisionController.php`, `UnitController.php`, `FiscalYearController.php`, `app/Models/Division.php`, `Unit.php`, `FiscalYear.php`, `resources/js/Pages/Admin/FiscalYears/Index.jsx`, `Partials/DivisionFormModal.jsx`, `Partials/UnitFormModal.jsx`, `tests/Feature/AdminDivisionAndUnitTest.php`, `FiscalYearManagementAndLoginTest.php`. **Belum direview:** `resources/js/Pages/Admin/Divisions/Index.jsx` (menyusul).
