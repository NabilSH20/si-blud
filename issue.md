# [ISSUE / PLANNING] Perbaikan Penolakan Akses (HTTP 403 Forbidden) pada Tombol Cetak Dokumen Modul Perencanaan & Keuangan

## 1. Ringkasan Masalah (*Problem Statement*)

Saat pengguna yang sedang login sebagai **Perencanaan** (`role: 'perencanaan'`) atau **Keuangan** (`role: 'keuangan'`) menekan tombol cetak dokumen di beberapa halaman modul Perencanaan dan Keuangan, terjadi kegagalan akses (**HTTP 403 Forbidden / Akses Ditolak**). Akibatnya, pengguna tidak dapat mencetak dokumen resmi seperti Nota Dinas Usulan Belanja, Kuitansi/SP2D, maupun Dokumen Cetak RBA/Laporan Realisasi.

### Batasan Pengerjaan (*Strict Constraints*):
- **HANYA perbaiki logika otorisasi dan penautan rute yang bermasalah**.
- **DILARANG mengubah atau merombak tampilan UI/desain komponen antarmuka** (tidak mengubah layout visual, warna, styling, atau struktur komponen yang sudah rapi).
- **DILARANG mengotak-atik modul atau kode di luar permasalahan cetak**.
- **JANGAN melakukan git commit maupun git push** ke remote repositori tanpa instruksi eksplisit dari pemilik proyek.

---

## 2. Analisis Akar Masalah (*Root Cause Analysis*)

Berdasarkan penelusuran arsitektur kode saat ini, ditemukan **3 (tiga) akar masalah utama** yang menyebabkan penolakan akses:

### Akar Masalah A: Otorisasi Berjenjang yang Salah Sasaran pada Dokumen Usulan Belanja
- **File Terdampak**: `app/Http/Controllers/Divisi/RequisitionController.php` (Method `print()` baris 575 & `authorizeAccess()` baris 609).
- **Mekanisme Kegagalan**:
  1. Tombol cetak usulan belanja di halaman Perencanaan (`Perencanaan/Requisitions/Index.jsx` & `Show.jsx`) serta halaman Keuangan (`Keuangan/Requisitions/Index.jsx` & `Show.jsx`) mengarahkan tautan ke named route `route('requisitions.print', req.id)`.
  2. Rute `requisitions.print` di `routes/web.php` (baris 106) ditangani oleh `App\Http\Controllers\Divisi\RequisitionController::print`.
  3. Di dalam method `print()`, dipanggil fungsi keamanan `$this->authorizeAccess($requisition)`:
     ```php
     private function authorizeAccess(Requisition $requisition): void
     {
         /** @var User $user */
         $user = Auth::user();
         if ($user->unit_id && $requisition->unit_id !== $user->unit_id) {
             abort(403, 'Anda tidak memiliki akses ke usulan belanja ini.');
         } elseif (! $user->unit_id && $user->division_id && $requisition->division_id !== $user->division_id) {
             abort(403, 'Anda tidak memiliki akses ke usulan belanja ini.');
         } elseif (! $user->unit_id && ! $user->division_id && $requisition->user_id !== $user->id) {
             abort(403, 'Anda tidak memiliki akses ke usulan belanja ini.');
         }
     }
     ```
  4. Pengguna dengan role **`perencanaan`**, **`keuangan`**, dan **`admin`** **tidak memiliki `unit_id` maupun `division_id`**, serta **bukan merupakan pembuat awal berkas usulan (`$requisition->user_id !== $user->id`)**.
  5. Akibatnya, kondisi ketiga (`!$user->unit_id && !$user->division_id && $requisition->user_id !== $user->id`) langsung bernilai `TRUE` dan memicu **`abort(403, 'Anda tidak memiliki akses ke usulan belanja ini.')`**!
  6. Hak verifikasi dan pencairan yang sah dari staf Perencanaan & Keuangan terblokir saat hendak mencetak berkas usulan.

---

### Akar Masalah B: Inkonsistensi Penamaan Rute Cetak pada Modul Keuangan
- **File Terdampak**:
  - `resources/js/Pages/Keuangan/Requisitions/Index.jsx` (baris 335)
  - `resources/js/Pages/Keuangan/Requisitions/Show.jsx` (baris 231)
- **Mekanisme Kegagalan**:
  - Di `routes/web.php` (baris 80-81), rute cetak khusus modul Keuangan sebenarnya sudah disediakan:
    ```php
    Route::get('/requisitions/{id}/print', [KeuanganRequisitionController::class, 'print'])
        ->name('keuangan.requisitions.print');
    ```
    Method `KeuanganRequisitionController::print` ini **sudah benar dan tidak membatasi `unit_id`**.
  - Namun di kode antarmuka frontend `Index.jsx` dan `Show.jsx`, tombol cetak keliru memanggil named route milik modul Divisi:
    ```jsx
    // KELIRU: Mengarah ke controller divisi yang menerapkan isolasi unit
    href={route('requisitions.print', req.id)}
    
    // SEHARUSNYA: Mengarah ke controller keuangan
    href={route('keuangan.requisitions.print', req.id)}
    ```

---

### Akar Masalah C: Pembatasan Middleware Role Tunggal pada Dokumen Cetak Lintas-Divisi
- **File Terdampak**: `routes/web.php` (grup middleware `perencanaan` dan `keuangan`).
- **Mekanisme Kegagalan**:
  1. Rute cetak dokumen RBA (`print-ringkasan`, `print-belanja`, `print-pendapatan`, `print-rincian-belanja`) berada di dalam grup `Route::prefix('perencanaan')->middleware(['auth', 'role:perencanaan'])`. Jika staf Keuangan atau Administrator membutuhkan referensi cetak RBA, mereka langsung diblokir oleh middleware `EnsureUserHasRole` dengan kode 403.
  2. Rute cetak laporan pertanggungjawaban Keuangan (`reports.print` dan `reports.surplus-deficit.print`) dibatasi hanya untuk `role:keuangan`.
  3. Dokumen cetak (*Print Views*) bersifat *read-only* (hanya baca untuk dicetak/arsip), sehingga seharusnya dapat diakses secara sah oleh seluruh peran pengawas (Perencanaan, Keuangan, dan Administrator).
  4. Pada `resources/js/Pages/Perencanaan/RBA/Index.jsx`, parameter query `{ shift_id: current_shift?.id }` berpotensi mengirimkan `shift_id=undefined` jika data shift aktif belum ter-load sempurna, memicu `findOrFail('undefined')` atau error 404/403.

---

## 3. Matriks Titik Kerusakan (*Error Hotspots*)

| No | Modul / Lokasi Tombol | File Sumber | Kode Saat Ini | Dampak Error |
| :---: | :--- | :--- | :--- | :--- |
| **1** | **Keuangan** &bull; Tabel Daftar Usulan Belanja | `Keuangan/Requisitions/Index.jsx:335` | `href={route('requisitions.print', req.id)}` | 403 Forbidden via `DivisiRequisitionController` |
| **2** | **Keuangan** &bull; Detail Usulan Belanja | `Keuangan/Requisitions/Show.jsx:231` | `href={route('requisitions.print', requisition.id)}` | 403 Forbidden via `DivisiRequisitionController` |
| **3** | **Perencanaan** &bull; Tabel Usulan Belanja | `Perencanaan/Requisitions/Index.jsx:393` | `href={route('requisitions.print', req.id)}` | 403 Forbidden via `DivisiRequisitionController` |
| **4** | **Perencanaan** &bull; Detail Usulan Belanja | `Perencanaan/Requisitions/Show.jsx:283` | `href={route('requisitions.print', requisition.id)}` | 403 Forbidden via `DivisiRequisitionController` |
| **5** | **Divisi** &bull; Logika Otorisasi Backend | `Divisi/RequisitionController.php:617` | `authorizeAccess()` memblokir non-owner tanpa cek role | 403 Forbidden untuk role `admin`, `perencanaan`, `keuangan` |
| **6** | **Perencanaan** &bull; Dropdown Cetak RBA | `Perencanaan/RBA/Index.jsx:547-592` | Query param `shift_id: current_shift?.id` | Berpotensi 404/403 jika param `undefined` |
| **7** | **Routes** &bull; Otorisasi Middleware Print | `routes/web.php:61-68, 80-86` | Rute cetak terkurung dalam middleware role eksklusif | 403 Forbidden antar staf Perencanaan & Keuangan |

---

## 4. Panduan Eksekusi Langkah-demi-Langkah (*Step-by-Step Implementation*)

> [!NOTE]
> Panduan ini dirancang agar dapat langsung diterapkan oleh junior programmer atau dieksekusi secara terstruktur oleh model AI tanpa mengubah antarmuka pengguna.

### Langkah 1: Perbaiki Logika Otorisasi pada `DivisiRequisitionController`
**File Target**: `app/Http/Controllers/Divisi/RequisitionController.php`

**Instruksi**:
1. Buka method `authorizeAccess(Requisition $requisition): void` (sekitar baris 609).
2. Tambahkan pengecekan role di bagian teratas method: jika pengguna memiliki role `'admin'`, `'perencanaan'`, atau `'keuangan'`, maka izinkan akses (*bypass unit check*) karena peran tersebut adalah verifikator dan pemeriksa anggaran resmi.
3. Pertahankan aturan isolasi unit untuk role `'divisi'` (agar staf unit A tetap tidak bisa mengintip dokumen unit B).

**Contoh Perbaikan Kode**:
```php
private function authorizeAccess(Requisition $requisition): void
{
    /** @var User $user */
    $user = Auth::user();

    // 1. Role pengawas dan verifikator memiliki izin sah meninjau dan mencetak seluruh berkas usulan belanja
    if (in_array($user->role, ['admin', 'perencanaan', 'keuangan'])) {
        return;
    }

    // 2. Isolasi akses untuk pengguna unit/divisi operasional
    if ($user->unit_id && $requisition->unit_id !== $user->unit_id) {
        abort(403, 'Anda tidak memiliki akses ke usulan belanja ini.');
    } elseif (! $user->unit_id && $user->division_id && $requisition->division_id !== $user->division_id) {
        abort(403, 'Anda tidak memiliki akses ke usulan belanja ini.');
    } elseif (! $user->unit_id && ! $user->division_id && $requisition->user_id !== $user->id) {
        abort(403, 'Anda tidak memiliki akses ke usulan belanja ini.');
    }
}
```

---

### Langkah 2: Sediakan Rute Cetak Usulan untuk Modul Perencanaan & Perluas Akses Middleware
**File Target**: `routes/web.php`

**Instruksi**:
1. Di dalam grup `perencanaan`, tambahkan alias rute cetak usulan belanja agar konsisten:
   ```php
   Route::get('/requisitions/{id}/print', [PerencanaanRequisitionController::class, 'print'])
       ->name('perencanaan.requisitions.print');
   ```
2. Atau izinkan dokumen cetak bersama (RBA Print & Report Print) agar dapat diakses oleh peran gabungan:
   - Pada rute cetak RBA (`rba/print-ringkasan`, `print-belanja`, `print-pendapatan`, `print-rincian-belanja`): pastikan middleware mengizinkan `role:perencanaan,keuangan,admin`.
   - Pada rute cetak laporan keuangan (`reports/print`, `reports/surplus-deficit/print`): pastikan middleware mengizinkan `role:keuangan,perencanaan,admin`.

---

### Langkah 3: Tambahkan Method `print()` pada `PerencanaanRequisitionController` (Jika Menggunakan Rute Khusus)
**File Target**: `app/Http/Controllers/Perencanaan/RequisitionController.php`

**Instruksi**:
Tambahkan method `print(int|string $id)` yang merender `Shared/PrintRequisition` serupa dengan milik Keuangan:
```php
public function print($id): Response
{
    $requisition = Requisition::with([
        'division',
        'unit',
        'user',
        'requisitionDetails.item',
        'rbaAccount',
        'verifiedByPerencanaan',
        'approvedByKeuangan',
    ])->findOrFail($id);

    return Inertia::render('Shared/PrintRequisition', [
        'requisition' => $requisition,
    ]);
}
```

---

### Langkah 4: Sesuaikan Tautan Tombol Cetak di Frontend (Tanpa Mengubah Tampilan UI)
**File Target**:
1. `resources/js/Pages/Keuangan/Requisitions/Index.jsx`
   - Ganti target link tombol cetak dari `route('requisitions.print', req.id)` menjadi `route('keuangan.requisitions.print', req.id)`.
2. `resources/js/Pages/Keuangan/Requisitions/Show.jsx`
   - Ganti target link tombol cetak dari `route('requisitions.print', requisition.id)` menjadi `route('keuangan.requisitions.print', requisition.id)`.
3. `resources/js/Pages/Perencanaan/Requisitions/Index.jsx`
   - Jika Langkah 3 diterapkan, arahkan ke `route('perencanaan.requisitions.print', req.id)`. (Jika Langkah 1 sudah mengizinkan role perencanaan pada `requisitions.print`, rute eksisting juga akan otomatis berfungsi 100%).
4. `resources/js/Pages/Perencanaan/Requisitions/Show.jsx`
   - Sesuaikan serupa dengan poin 3.
5. `resources/js/Pages/Perencanaan/RBA/Index.jsx`
   - Pada pemanggilan tombol cetak RBA dropdown, tambahkan fallback parameter agar tidak mengirimkan `undefined`:
     ```jsx
     href={route('perencanaan.rba.print-ringkasan', current_shift?.id ? { shift_id: current_shift.id } : {})}
     ```

---

### Langkah 5: Perkuat Validasi Fallback Shift ID di `PerencanaanRbaController`
**File Target**: `app/Http/Controllers/Perencanaan/RbaController.php`

**Instruksi**:
Pada method `printRingkasan`, `printBelanja`, `printPendapatan`, dan `printRincianBelanja`:
Pastikan pembacaan `$shiftId` menangani nilai non-numerik seperti string `"undefined"` atau `"null"`:
```php
$shiftId = $request->query('shift_id');
if ($shiftId === 'undefined' || $shiftId === 'null' || empty($shiftId)) {
    $shiftId = null;
}
$shift = $shiftId
    ? RbaShift::find($shiftId)
    : (RbaShift::where('status', 'Aktif')->first() ?? RbaShift::latest('id')->firstOrFail());

if (!$shift) {
    $shift = RbaShift::where('status', 'Aktif')->first() ?? RbaShift::latest('id')->firstOrFail();
}
```

---

## 5. Rencana Pengujian Otomatis (*Automated Testing Plan*)

Buat berkas pengujian baru `tests/Feature/PrintAuthorizationTest.php` untuk membuktikan bahwa seluruh tombol cetak kini dapat diakses bebas dari 403 Forbidden:

```php
<?php

namespace Tests\Feature;

use App\Models\FiscalYear;
use App\Models\Requisition;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PrintAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    protected User $perencanaanUser;
    protected User $keuanganUser;
    protected User $divisiUser;
    protected Requisition $requisition;

    protected function setUp(): void
    {
        parent::setUp();

        FiscalYear::create([
            'name' => 'T.A. 2026',
            'year' => 2026,
            'status' => 'ACTIVE',
            'is_default' => true,
        ]);

        $this->perencanaanUser = User::factory()->create(['role' => 'perencanaan']);
        $this->keuanganUser = User::factory()->create(['role' => 'keuangan']);
        $this->divisiUser = User::factory()->create(['role' => 'divisi']);

        $this->requisition = Requisition::factory()->create([
            'user_id' => $this->divisiUser->id,
            'status' => 'Diajukan',
        ]);
    }

    public function test_perencanaan_user_can_access_requisition_print(): void
    {
        $response = $this->actingAs($this->perencanaanUser)
            ->get(route('requisitions.print', $this->requisition->id));

        $response->assertOk();
    }

    public function test_keuangan_user_can_access_requisition_print(): void
    {
        $response = $this->actingAs($this->keuanganUser)
            ->get(route('requisitions.print', $this->requisition->id));

        $response->assertOk();
    }

    public function test_keuangan_user_can_access_keuangan_requisition_print(): void
    {
        $response = $this->actingAs($this->keuanganUser)
            ->get(route('keuangan.requisitions.print', $this->requisition->id));

        $response->assertOk();
    }
}
```

---

## 6. Kriteria Keberhasilan (*Definition of Done*)

Fitur perbaikan dianggap selesai dan siap diajukan bila memenuhi checklist berikut:
1. [ ] Staf **Perencanaan** dapat membuka dan mencetak dokumen usulan belanja dari menu daftar maupun detail usulan tanpa mengalami HTTP 403.
2. [ ] Staf **Keuangan** dapat membuka dan mencetak dokumen usulan belanja dari menu validasi maupun detail usulan tanpa mengalami HTTP 403.
3. [ ] Dropdown cetak RBA pada halaman Perencanaan (`Ringkasan`, `Pendapatan`, `Belanja`, `Rincian Belanja`) terbuka sempurna di tab baru tanpa kendala `undefined shift`.
4. [ ] Menu cetak laporan Keuangan (`reports.print` dan `reports.surplus-deficit.print`) dapat diakses lancar.
5. [ ] **Tampilan UI (desain komponen, tombol, warna, dan tata letak) tetap 100% identik dengan kondisi saat ini**.
6. [ ] Tidak ada berkas migrasi database yang diubah atau ditambahkan.
7. [ ] Seluruh pengujian otomatis existing dan test baru menghasilkan status **100% PASS** (`php artisan test`).
8. [ ] **TIDAK ADA git commit maupun git push yang dilakukan**.
