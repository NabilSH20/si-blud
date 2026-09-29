# PRD: Perbaikan Modul Keuangan — SI BLUD RSJ Tampan Riau

| | |
|---|---|
| **Proyek** | SI BLUD RSJ Tampan Riau (`si-blud`) |
| **Disusun** | 25 September 2026 — Batch 3, review: `BudgetController`, `RevenueController`, `ReportController`, `DashboardController` (Keuangan), model `Budget`/`Revenue` |
| **Konteks** | Lanjutan dari PRD Batch 1 (Otorisasi & Integritas Data) yang sudah selesai dieksekusi dan terverifikasi |
| **Status kode saat ini** | Belum ada perubahan atas temuan di dokumen ini |

## 1. Ringkasan Eksekutif

Dua temuan P0 di sini levelnya setara dengan temuan-temuan kritis di Batch 1:

1. **`Budget` model adalah `RbaAccount` yang sama persis** (`class Budget extends RbaAccount {}`, tanpa tabel sendiri). Ini memberi Keuangan jalur CRUD langsung (buat/ubah/**hapus**) ke tabel pagu yang seharusnya cuma dikelola lewat proses RBA milik Perencanaan — jalur ini sepenuhnya melewati sistem versi/Pergeseran/`activate()` yang sudah kita audit di Batch 1b.
2. **Laporan Surplus/Defisit resmi mengambil `max()` dari dua angka belanja yang dihitung dengan cara berbeda**, bukan memilih satu sumber kebenaran. Kalau kedua angka itu beda (dan berdasarkan temuan #1, sangat mungkin beda), laporan diam-diam menampilkan yang lebih besar tanpa keterangan apapun.

**Keputusan produk untuk poin #1 sudah diambil: Opsi (a) — `/keuangan/budgets` menjadi read-only.** Semua perubahan pagu wajib lewat proses RBA (Perencanaan → Shift → Aktifkan). §2 di bawah sudah ditulis ulang sesuai keputusan ini dan siap dieksekusi, tidak lagi `blocked`.

## 2. P0-1 — KRITIS (Sudah Diputuskan: Opsi A/Read-only): `Budget` = `RbaAccount`, Keuangan Bisa Bypass RBA

### Bukti
```php
// app/Models/Budget.php
class Budget extends RbaAccount
{
    // Extends RbaAccount so all existing calls to Budget::query(), Budget::all(), etc.
    // operate on rba_accounts table
}
```
Tidak ada `protected $table` sendiri — komentarnya sendiri mengonfirmasi ini sengaja dibuat begitu. `Keuangan\BudgetController` (`index`, `create`, `store`, `edit`, `update`, `destroy`) beroperasi penuh di atas tabel `rba_accounts` — tabel yang sama yang disinkronkan `RbaShift::activate()` dari hasil kerja Perencanaan.

### Dampak konkret
- Keuangan bisa membuat baris pagu baru lewat `/keuangan/budgets/create` dengan `account_code` bebas, **tanpa** baris itu pernah terhubung ke `RbaShift`/`RbaExpenseItem` manapun — pagu "siluman" yang tidak tercatat di dokumen RBA resmi manapun.
- `BudgetController::update()` mengizinkan ubah `total_budget` **tanpa** menyesuaikan `remaining_budget` (komentar di kode sendiri: *"remaining_budget tidak diubah di sini"*) — merusak invarian `total_budget - spent_budget = remaining_budget`.
- `BudgetController::destroy()` menghapus baris `rba_accounts` **tanpa cek** apakah baris itu masih dipakai `RbaExpenseItem` atau `Requisition` manapun. Karena FK-nya `nullOnDelete()`, penghapusan ini akan diam-diam meng-NULL-kan `rba_account_id` di baris-baris terkait — bukan mencegah, bukan memberi peringatan.

### Keputusan yang diambil pemilik produk: Opsi (a) — Read-only

Alasan: semua perubahan pagu wajib melalui satu jalur resmi (proses RBA milik Perencanaan), supaya tidak ada lagi akun pagu yang tidak tercatat di dokumen RBA manapun. Kalau nanti kebutuhan "fleksibilitas anggaran BLUD" (Keuangan boleh cepat menyesuaikan belanja saat pendapatan melonjak) ternyata memang dipraktikkan sehari-hari, itu didiskusikan ulang sebagai perubahan terpisah — bukan dieksekusi diam-diam lewat halaman ini.

### Requirement

1. **Backend — `app/Http/Controllers/Keuangan/BudgetController.php`:** hapus method `create()`, `store()`, `edit()`, `update()`, `destroy()`. Sisakan hanya `index()`.
2. **Routes — `routes/web.php`:** ganti
   ```php
   Route::resource('budgets', BudgetController::class)->except(['show']);
   ```
   menjadi
   ```php
   Route::get('/budgets', [BudgetController::class, 'index'])->name('budgets.index');
   ```
3. **Frontend:** hapus `resources/js/Pages/Keuangan/Budgets/Create.jsx` dan `Edit.jsx`. Di `Keuangan/Budgets/Index.jsx`, hapus tombol/tautan "Tambah Pagu", "Edit", "Hapus" beserta modal terkait (`BudgetFormModal.jsx` kalau isinya cuma dipakai untuk create/edit pagu — cek dulu apakah dipakai di tempat lain sebelum dihapus). **Ikuti pola yang sudah benar dari pembersihan `RBA/Create.jsx` sebelumnya**: pastikan tidak ada `route('budgets.create')`/`route('budgets.store')`/dst. yang tersisa di JSX manapun sebelum route-nya benar-benar dihapus, supaya tidak terulang insiden route mati seperti kasus `sahkan`.
4. **Transparansi (tambahan kecil, opsional tapi disarankan):** di `Index.jsx`, tambahkan keterangan kecil di atas tabel: "Pagu ditentukan lewat proses RBA. Untuk mengubah, buka menu RBA di Perencanaan." — supaya staf Keuangan yang terbiasa dengan tombol lama tidak bingung ke mana perginya.
5. **Test yang sudah ada wajib disesuaikan, bukan dihapus:** `ModalCardIntegrationTest::test_keuangan_budgets_modal_store_and_index` saat ini menguji `store()` yang akan dihapus. Ubah test ini agar menguji: (a) `index()` tetap menampilkan data dengan benar, (b) route `budgets.store` sudah tidak terdaftar (`$this->assertFalse(\Illuminate\Support\Facades\Route::has('budgets.store'));` atau request `POST /keuangan/budgets` mengembalikan 404/405). **Jangan hapus test ini** — sesuaikan isinya.

### Acceptance Criteria
- `GET /keuangan/budgets` tetap menampilkan daftar pagu seperti sekarang.
- `POST /keuangan/budgets`, `PATCH/PUT /keuangan/budgets/{id}`, `DELETE /keuangan/budgets/{id}` semuanya mengembalikan 404 (route tidak terdaftar).
- Tidak ada tombol/tautan create-edit-delete pagu yang tersisa di `Keuangan/Budgets/Index.jsx`.
- `php artisan test` hijau, jumlah test tidak berkurang dari baseline.
- `npm run build` sukses tanpa error (memastikan tidak ada import ke `Create.jsx`/`Edit.jsx` yang jadi rusak setelah file itu dihapus).

## 3. P0-2 — KRITIS: Laporan Surplus/Defisit Pakai `max()` dari Dua Sumber Angka Berbeda

### Bukti
`ReportController::getSurplusDeficitData()`:
```php
$requisitionExpense = (float) RequisitionDetail::whereHas('requisition', fn($q) => ...)->sum('subtotal');
// ...
$totalBudgetSpent = (float) $budgetExpenses->sum('spent'); // dari Budget::total_budget - remaining_budget
// ...
$totalExpense = max($requisitionExpense, $totalBudgetSpent);
```
Dua cara menghitung "total belanja" — satu dari jumlah riil `RequisitionDetail` yang statusnya `Disetujui_Selesai`, satu lagi dari selisih `total_budget`/`remaining_budget` di tabel `Budget` (=`rba_accounts`) — **digabung dengan mengambil yang lebih besar**, tanpa keterangan, tanpa peringatan. Ini dipakai di `Keuangan/Reports/SurplusDeficit.jsx` **dan** `Shared/PrintSurplusDeficit.jsx` (Laporan Operasional E-BLUD resmi).

### Requirement
1. Jadikan `$requisitionExpense` sebagai **satu-satunya angka resmi** `total_expense` — ini jumlah transaksi riil yang benar-benar disetujui & dicairkan, bukan angka turunan.
2. `$totalBudgetSpent` tetap dihitung, tapi jadi **angka pembanding**, dikirim terpisah ke frontend sebagai `budget_ledger_expense` atau nama serupa.
3. Kalau selisih `abs($requisitionExpense - $totalBudgetSpent)` melebihi toleransi kecil (mis. Rp 1.000, untuk pembulatan), set flag `has_discrepancy: true` beserta nilai selisihnya, dan tampilkan sebagai notice di halaman (bukan disembunyikan).
4. Hapus baris `$totalExpense = max(...)`.

### Acceptance Criteria
- Buat skenario test di mana `RequisitionDetail` dan `Budget.spent` sengaja dibuat beda nilai → laporan menampilkan angka dari `RequisitionDetail`, dan `has_discrepancy` bernilai `true` dengan selisih yang benar.
- Skenario di mana keduanya sama → `has_discrepancy: false`, tidak ada notice.
- Tambahkan test di `tests/Feature/EBludCoreExpansionTest.php` atau file baru khusus laporan ini.

## 4. P1-1 — TINGGI: Verifikasi Baris Akar Pendapatan (`item_code = '0'`) di Laporan Surplus/Defisit

### Masalah
```php
$rootRevenue = $rba->revenueItems()->where('item_code', '0')->first();
$targetRevenue = $rootRevenue ? (float) $rootRevenue->after_amount : 0;
```
Dari audit `RbaController` di Batch 1b, ,ada cuma `1, 3, 4, 5` (level 1) — belum pernah terkonfirmasi ada baris `item_code = '0'` yang menyimpan total gabungan semua kategori. Kalau baris ini tidak pernah benar-benar dibuat oleh `RbaController::recalculateRevenueHeaders()`/`ensureShiftItemsPopulated()`, maka `$rootRevenue` akan selalu `null`, dan `target_revenue`/`revenue_achievement` di laporan akan selalu `0` — diam-diam salah, tanpa error.

### Requirement
1. Agent cek dulu: apakah ada baris `RbaRevenueItem` dengan `item_code = '0'` yang pernah dibuat di `RbaController.php`/seeder manapun.
2. Kalau **tidak ada**: ganti query ini jadi jumlah dinamis dari kategori level 1 (`$rba->revenueItems()->where('level', 1)->where('item_code', '!=', '0')->sum('after_amount')`), konsisten dengan cara `recalculateRevenueHeaders()` menghitung total keseluruhan.
3. Kalau **ada**: pastikan baris itu memang selalu ter-update setiap kali kategori berubah (cek dipanggil dari fungsi recalculate yang sama).

### Acceptance Criteria
- `target_revenue` di Laporan Surplus/Defisit menunjukkan angka yang benar-benar mencerminkan total seluruh kategori pendapatan versi RBA yang aktif, dibuktikan lewat test dengan data yang diketahui hasilnya.

## 5. P1-2 — TINGGI: Kategori Pendapatan Tidak Divalidasi, Fallback Diam-Diam

### Masalah
`RevenueController::store()` memvalidasi `source` cuma `['required', 'string', 'max:255']` — bebas teks apapun, tidak dibatasi ke daftar resmi di `$groupedSources`. Sementara `resolveCategory()` (dipakai untuk mengelompokkan dashboard & laporan) punya fallback di baris terakhir:
```php
return 'Jasa Layanan'; // default kalau tidak cocok kriteria manapun
```
Kalau ada `source` yang salah ketik atau kategori baru yang belum didaftarkan di `$groupedSources`, itu akan **diam-diam masuk kategori "Jasa Layanan"** — mencemari angka agregat kategori tanpa ada yang sadar.

### Requirement
1. Di `RevenueController::store()`, tambahkan validasi `Rule::in($this->getFlatSources())` untuk `source`.
2. Di `resolveCategory()`, ganti fallback terakhir dari `return 'Jasa Layanan'` menjadi `return 'Tidak Terklasifikasi'` (atau sejenisnya) — supaya kategori yang tidak dikenal **terlihat** sebagai anomali, bukan tersembunyi di kategori terbesar.

### Acceptance Criteria
- Submit `source` yang tidak ada di daftar resmi → validasi gagal dengan pesan jelas.
- Data lama (kalau ada) yang kategorinya tidak cocok kriteria manapun tampil sebagai "Tidak Terklasifikasi" di dashboard, bukan tercampur ke "Jasa Layanan".

## 6. P2-1 — SEDANG: `RevenueController` Belum Punya Guard Role Eksplisit

### Masalah
`store()` dan `destroy()` di `RevenueController` tidak punya `abort_unless(auth()->user()->role === 'keuangan', ...)`, berbeda dari `BudgetController` yang sudah konsisten menerapkannya di semua method mutasi. Middleware route (`role:keuangan`) sudah menutup celah ini di level route, tapi ini P0-1 di Batch 1 mengajarkan kita untuk selalu pasang lapis kedua.

### Requirement
Tambahkan `abort_unless(auth()->user()->role === 'keuangan', 403, 'Akses ditolak.');` di awal `store()` dan `destroy()`, konsisten dengan pola di `BudgetController`.

### Acceptance Criteria
Sama seperti pola pengecekan role di controller lain — tidak perlu test baru kalau sudah tercakup oleh `RoleAuthorizationTest` yang ada, cukup pastikan tidak ada regresi.

## 7. P2-2 — RENDAH: Penomoran `revenue_number` Rawan Race Condition

### Masalah
`RevenueController::store()` membuat nomor urut via hitung `count()` lalu loop cek `exists()` sampai unik — tanpa `DB::transaction()` + `lockForUpdate()` seperti pola yang sudah benar di `Keuangan\RequisitionController`. Constraint `unique()` di level DB mencegah data ganda, tapi submission bersamaan di hari yang sama berpotensi menghasilkan `QueryException` (500) alih-alih penomoran yang mulus.

### Requirement (boleh masuk backlog, tidak mendesak)
Bungkus generasi nomor dalam pola locking yang sama seperti di `Keuangan\RequisitionController::update()`, atau pakai `lockForUpdate()` pada baris counter/terakhir hari itu.

### Acceptance Criteria
Dua request submit revenue di tanggal sama secara nyaris bersamaan (simulasi test) tidak menghasilkan error, keduanya dapat nomor unik berurutan.

## 8. P2-3 — SELESAI DENGAN SENDIRINYA (Tidak Perlu Dikerjakan)

~~Baris `Budget` Baru Tidak Mengisi `kategori_belanja`/`sumber_dana` Eksplisit~~ — isu ini spesifik untuk jalur `store()` di `BudgetController`, yang sudah dihapus lewat keputusan Opsi (a) di §2. Tidak ada tindakan yang perlu diambil di sini. Boleh dilewati agent.

## 9. Batasan Umum untuk Agent

- Isu §2 (P0-1) **blocked** sampai pemilik produk menjawab — jangan dieksekusi, jangan ditebak.
- Migration destruktif apapun (drop/alter kolom, drop tabel) di area ini wajib dilaporkan dan disetujui dulu, tidak boleh langsung dieksekusi — sesuai instruksi standing yang sudah berlaku sejak insiden Batch 1.
- Satu ID isu per commit/PR.
- Test yang gagal harus diperbaiki kodenya, bukan dihapus/dilemahkan.
- `php artisan test` harus tetap hijau, jumlah test tidak boleh berkurang dari baseline saat ini (137).

## 10. Definition of Done

- [ ] P0-1 (§2) `BudgetController` jadi read-only, route create/edit/delete dihapus, `Create.jsx`/`Edit.jsx` dihapus, test `ModalCardIntegrationTest` disesuaikan (bukan dihapus)
- [ ] P0-2 (§3) `max()` dihapus, `has_discrepancy` + selisih ditampilkan
- [ ] P1-1 (§4) baris akar pendapatan diverifikasi & diperbaiki sesuai hasil verifikasi
- [ ] P1-2 (§5) validasi `source` + fallback kategori diperbaiki
- [ ] P2-1 (§6) guard role eksplisit ditambahkan di `RevenueController`
- [ ] P2-2 (§7) dicatat sebagai backlog (opsional untuk batch ini)
- [ ] P2-3 (§8) tidak perlu dikerjakan (selesai dengan sendirinya)
- [ ] Seluruh test suite hijau, tidak ada test yang hilang dari baseline (137)

## 11. Lampiran — File yang Direview

`app/Http/Controllers/Keuangan/BudgetController.php`, `ReportController.php`, `RevenueController.php`, `DashboardController.php`, `app/Models/Budget.php`, `app/Models/Revenue.php`, migration `create_revenues_table`, `remove_budget_id_from_requisitions_table`, `database/seeders/BudgetSeeder.php`.
