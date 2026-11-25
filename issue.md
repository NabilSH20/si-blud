# Perencanaan Implementasi: Penyesuaian UI Tombol Barang Baru, Urutan Usulan Terbaru di Atas & Perapian Button Aksi Sah/Tidak Sah

> **Target Pengembang**: Junior Programmer & AI Assistant Model  
> **Repository**: `rsj-req-app` (E-BLUD RS Jiwa Tampan Provinsi Riau)  
> **Status Dokumen**: Siap Diimplementasikan (*Ready for Implementation*)  
> **Branch Kerja**: Lanjutkan di branch `perbaikan_usulan` (atau buat branch turunan baru bila diperlukan)

---

## 1. Konteks & Analisis 3 Masalah dari Hasil Review UI

Berdasarkan pengecekan langsung terhadap tampilan UI setelah implementasi sebelumnya, ditemukan 3 hal yang membuat pengguna bingung dan tampilannya belum rapi:

### Masalah 1: Posisi & Ukuran Tombol `+ Barang Baru` Belum Sejajar dengan Tombol Tambah Usulan
- **Lokasi**: `resources/js/Pages/Divisi/Requisitions/Partials/RequisitionFormModal.jsx` (Section `4. Input Rincian Barang`, baris ~1018–1193 & ~1281–1300).
- **Kondisi Saat Ini**:
  - Tombol `+ Barang Baru` (`border-amber-300 bg-amber-50 text-amber-900 px-3 py-2`) ditempatkan di baris input atas tepat di sebelah kanan field `Pilih Barang Katalog / Uraian *`. Akibatnya kotak pencarian katalog menjadi sempit, dan user bingung melihat dua tombol berbeda posisi.
  - Tombol utama `+ Tambah ke Daftar Usulan` berada di pojok kanan baris aksi bawah (*Action Bar Terpadu*) dengan padding `px-4 py-2` (sedangkan tombol `+ Barang Baru` di atas memakai `px-3 py-2` sehingga ukuran box dan posisinya tidak serasi).
- **Perbaikan yang Diminta**:
  - Pindahkan tombol **`+ Barang Baru`** ke **sebelah kiri tombol `+ Tambah ke Daftar Usulan`** di baris aksi bawah (`Action Bar Terpadu`).
  - Pertahankan warna dan gaya tombolnya (tema Amber: `border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900`), **dan samakan ukuran box, padding, radius, tinggi, dan tipografinya** dengan tombol `+ Tambah ke Daftar Usulan` (`px-4 py-2 text-xs font-bold rounded-xl border`).
  - Dengan dipindahkannya tombol tersebut ke bawah, field `Pilih Barang Katalog / Uraian *` (maupun field input manual `BARU` saat aktif) dapat membentang penuh (`w-full`) dan terlihat jauh lebih lapang.

---

### Masalah 2: Data Usulan Terbaru Tidak Tampil di Bagian Atas Tabel
- **Lokasi**:
  - `app/Http/Controllers/Perencanaan/RequisitionController.php` (`index()`, baris ~55–59)
  - `app/Http/Controllers/Divisi/RequisitionController.php` (`index()`, baris ~56–57)
  - `app/Http/Controllers/Perencanaan/DashboardController.php` (`index()`, baris ~30–36)
  - `resources/js/Pages/Perencanaan/Requisitions/Index.jsx`
- **Akar Masalah (*Root Cause* Sebenarnya)**:
  - Data demo bawaan di `database/seeders/RequisitionWorkflowSeeder.php` (baris ~57–372) menyetel `submission_date` dan `created_at` pada **tahun 2027 (Januari–Maret 2027)**, misalnya `2027-03-14 09:30:00`.
  - Ketika user mengajukan **usulan baru secara nyata hari ini** (tanggal sistem berjalan tahun **2026**, misalnya `2026-11-25`) walaupun untuk Tahun Anggaran 2027 (`budget_year = 2027`), controller menyimpan `'submission_date' => today()` (`2026-11-25`) dan `'created_at' => now()` (`2026-11-25 15:xx:xx`), dengan auto-increment **`id` tertinggi** (misal `#12`, `#13` dari 13 total pengajuan).
  - Karena `Perencanaan\RequisitionController::index()` saat ini mengurutkan dengan:
    ```php
    ->orderByDesc('submission_date')
    ->orderByDesc('created_at')
    ->orderByDesc('id')
    ```
    maka tanggal demo **`2027-03-14` (`Disetujui ACC Final`) dianggap lebih besar daripada pengajuan baru hari ini `2026-11-25` (`Pending_Perencanaan`)**! Akibatnya usulan terbaru yang barusan diajukan unit terlempar ke baris paling bawah / halaman 2!
  - Hal yang sama berisiko terjadi pada `Divisi\RequisitionController::index()` (memakai `->latest()` = `ORDER BY created_at DESC`) dan `Perencanaan\DashboardController::index()` (memakai `->latest('submission_date')`), sedangkan `Divisi\DashboardController::index()` (baris 48) sudah memakai `->latest('id')`.
- **Perbaikan yang Diminta**:
  - Ubah urutan default di controller (`Perencanaan\RequisitionController::index()`, `Divisi\RequisitionController::index()`, dan `Perencanaan\DashboardController::index()`) agar mengutamakan **usulan terbaru yang masuk ke sistem (`orderByDesc('id')`)**.
  - Dengan `->orderByDesc('id')`:
    - Usulan terbaru yang barusan diajukan oleh unit (`id = 13`, `id = 12`) **langsung tampil di baris `#1` (paling atas)** tanpa terkalahkan oleh timestamp demo 2027.
    - Pengajuan-pengajuan lain yang masuk berurutan (misal 14 Januari lalu 16 Maret) juga tetap memiliki `id` lebih besar untuk yang lebih baru sehingga urut dari atas ke bawah.

---

### Masalah 3: Button Aksi pada Bagian `Sah` dan `Tidak Sah` Terlihat Bertumpuk & Ukuran Tidak Seragam
- **Lokasi**:
  - `resources/js/Pages/Perencanaan/Items/Index.jsx` (kolom `Aksi`, baris ~338 & ~448–515)
  - `resources/js/Pages/Perencanaan/Requisitions/Partials/QuickVerificationModal.jsx` (tombol validasi `Sah` / `Tidak Sah`, baris ~463–527)
  - `resources/js/Pages/Perencanaan/Requisitions/Show.jsx` (tombol validasi `Sah` / `Tidak Sah`, baris ~655–730)
- **Kondisi Saat Ini (Dari Screenshot `Usulan Unit Baru` / `Perencanaan/Items/Index.jsx`)**:
  - Kolom header `Aksi` memakai lebar terbatas `w-52` dengan container `flex-wrap`, sehingga tombol **`[Sah Harga]` / `[✓ Sah]`** + **`[Tidak Sah]`** menumpuk di baris pertama dan tombol **`[Edit]`** + **`[Trash]`** terdorong jatuh ke baris kedua di bawahnya.
  - Warna, padding, dan tinggi tombolnya tidak seragam:
    - `Sah` memakai `bg-teal-600 px-2 py-1 rounded-lg`
    - `Sah Harga` memakai `bg-sky-600 px-2 py-1 rounded-lg`
    - `Tidak Sah` memakai `border-rose-200 bg-rose-50 px-2 py-1 rounded-lg`
    - `Edit` memakai `border-slate-300 bg-white px-2 py-1 rounded-lg` (padahal standar aplikasi memakai Amber `border-amber-300 bg-amber-50 text-amber-800` atau seragam `px-2.5 py-1.5 rounded-xl`)
    - Ikon `Trash` hanya `p-1 rounded-lg`, terlihat jauh lebih pendek dibanding tombol teks di sebelahnya.
  - Di `QuickVerificationModal.jsx` & `Show.jsx`, tombol `Sah` / `Tidak Sah` (`px-2 py-0.5 rounded-md`) dan `Sah Harga` / `Tidak Sah` (`px-1.5 py-0.5 rounded`) juga memiliki padding serta border-radius yang berbeda satu sama lain.
- **Perbaikan yang Diminta**:
  - Rapikan susunan dan ukuran semua tombol pada kolom **Aksi** di `Perencanaan/Items/Index.jsx` agar **berjajar rapi dalam 1 baris sejajar (`whitespace-nowrap`)**, **tinggi & radius seragam (`rounded-xl px-2.5 py-1.5 text-xs font-bold border`)**, warna konsisten (`Sah` / `Sah Harga` memakai Teal `border-teal-600 bg-teal-600 hover:bg-teal-700 text-white`, `Tidak Sah` memakai Rose `border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-700`, `Edit` memakai Amber standar `border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800`, dan `Trash` memakai `px-2.5 py-1.5 rounded-xl border border-transparent hover:border-rose-300`).
  - Rapikan pula tombol **`Sah` / `Tidak Sah`** pada `QuickVerificationModal.jsx` & `Perencanaan/Requisitions/Show.jsx` memakai komponen/gaya **Segmented Control Pill** yang seragam ukuran dan posisinya.

---

## 2. Daftar File yang Harus Dimodifikasi

| No | File Target | Ringkasan Perubahan |
|---|---|---|
| 1 | `resources/js/Pages/Divisi/Requisitions/Partials/RequisitionFormModal.jsx` | Pindahkan tombol `+ Barang Baru` ke sebelah kiri `+ Tambah ke Daftar Usulan` dengan ukuran box yang sama persis (`px-4 py-2`, `rounded-xl`, `border`, tinggi identik), pertahankan warna Amber; perlebar field katalog/manual di baris atas. |
| 2 | `app/Http/Controllers/Perencanaan/RequisitionController.php` | Ubah sorting `index()` menjadi `->orderByDesc('id')` agar pengajuan terbaru selalu tampil paling atas. |
| 3 | `app/Http/Controllers/Divisi/RequisitionController.php` | Ubah sorting `index()` dari `->latest()` menjadi `->orderByDesc('id')` agar konsisten menampilkan usulan terbaru paling atas. |
| 4 | `app/Http/Controllers/Perencanaan/DashboardController.php` | Ubah sorting `$pendingRequisitions` dari `->latest('submission_date')->latest('id')` menjadi `->orderByDesc('id')`. |
| 5 | `resources/js/Pages/Perencanaan/Items/Index.jsx` | Rapikan kolom Aksi: hapus pembatasan `w-52` yang bikin wrap 2 baris, sejajarkan tombol `Sah`, `Tidak Sah`, `Edit`, `Hapus` dalam 1 baris lurus dengan tinggi (`px-2.5 py-1.5 rounded-xl`) & warna standar seragam (Teal, Rose, Amber). |
| 6 | `resources/js/Pages/Perencanaan/Requisitions/Partials/QuickVerificationModal.jsx` | Seragamkan tampilan tombol `Sah` / `Tidak Sah` barang baru & harga dalam *Segmented Pill Group* yang rapi dan konsisten ukurannya. |
| 7 | `resources/js/Pages/Perencanaan/Requisitions/Show.jsx` | Selaraskan tampilan tombol *Segmented Pill Group* `Sah` / `Tidak Sah` seperti pada `QuickVerificationModal.jsx`. |
| 8 | `tests/Feature/PerencanaanRbaPlanningTest.php` | Tambah skenario test yang memastikan pengajuan baru (misal tanggal `2026-11-25`, `id` tertinggi) tetap muncul di indeks 0 di atas data demo lama bertanggal masa depan (`2027-03-14`). |

---

## 3. Tahapan Implementasi Terperinci (*Step-by-Step Guide*)

### Tahap 1: Pindahkan & Samakan Ukuran Tombol `+ Barang Baru` (`RequisitionFormModal.jsx`)

Buka file `resources/js/Pages/Divisi/Requisitions/Partials/RequisitionFormModal.jsx`:

1. **Perlebar Field Nama Barang / Uraian pada Baris Input Atas (Lines ~1018–1193)**:
   - Pada mode katalog (`!isManualMode`), **hapus** `<div className="flex items-center gap-2">` wrapper dan **hapus** tombol `<button>+ Barang Baru</button>` yang berada di samping kotak pencarian (lines ~1019 & ~1141–1151). Biarkan `<div className="relative" ref={dropdownRef}>` langsung menempati seluruh lebar kolom `lg:flex-1`.
   - Pada mode manual (`isManualMode`), **hapus** juga tombol `Pilih Katalog` di samping kanan `<input>` (lines ~1154 & ~1174–1182) agar input nama barang baru selebar 100% kolomnya (aksi untuk kembali ke katalog dipindahkan ke tombol pengganti di baris aksi bawah, sebelah kiri `+ Tambah ke Daftar Usulan`).
   - Pertahankan tombol shortcut `+ Input Manual sebagai Barang Baru` di dalam empty-state dropdown (lines ~1125–1132) sebagai kemudahan tambahan saat pencarian katalog bernilai 0.

2. **Pindahkan Tombol ke Sebelah Kiri `+ Tambah ke Daftar Usulan` pada Action Bar Bawah (Lines ~1281–1300)**:
   Ubah bagian `Action Bar Terpadu` menjadi seperti ini (perhatikan bahwa kedua tombol memakai `border`, `px-4 py-2`, `rounded-xl`, `text-xs font-bold`, sehingga tinggi dan ukuran box-nya sejajar presisi):
   ```jsx
   {/* Action Bar Terpadu */}
   <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-2.5 border-t border-slate-200/70 gap-2.5">
       <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
           <span className={`inline-block w-2 h-2 rounded-full shrink-0 ${isManualMode ? 'bg-amber-500' : 'bg-teal-500'}`}></span>
           <span>
               {isManualMode
                   ? 'Mode Barang Baru aktif: isi detail barang baru lalu tambahkan ke daftar.'
                   : 'Pilih barang dari katalog atau klik "+ Barang Baru" jika barang tidak tersedia.'}
           </span>
       </div>

       <div className="flex flex-wrap items-center justify-end gap-2 self-end sm:self-auto">
           {!isManualMode ? (
               <button
                   type="button"
                   onClick={() => handleSwitchToManualMode(selectedCatalogItem ? '' : inputName)}
                   title="Barang tidak ada di katalog? Klik untuk input barang baru secara manual"
                   className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 active:scale-95 px-4 py-2 text-xs font-bold text-amber-900 shadow-2xs transition cursor-pointer whitespace-nowrap"
               >
                   <Plus className="h-4 w-4" />
                   <span>Barang Baru</span>
               </button>
           ) : (
               <button
                   type="button"
                   onClick={() => resetItemInputRow(false)}
                   title="Batalkan mode barang baru & kembali ke pilih katalog"
                   className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 active:scale-95 px-4 py-2 text-xs font-bold text-slate-700 shadow-2xs transition cursor-pointer whitespace-nowrap"
               >
                   <X className="h-4 w-4" />
                   <span>Pilih Katalog</span>
               </button>
           )}

           <button
               type="button"
               onClick={handleAddItem}
               className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-teal-600 bg-teal-600 hover:bg-teal-700 active:scale-95 px-4 py-2 text-xs font-bold text-white shadow-2xs transition cursor-pointer whitespace-nowrap"
           >
               <Plus className="h-4 w-4" />
               <span>Tambah ke Daftar Usulan</span>
           </button>
       </div>
   </div>
   ```
   > **Catatan Detail Teknis**: Menambahkan `border border-teal-600` pada tombol `Tambah ke Daftar Usulan` sangat penting agar total tinggi box (`padding-top/bottom + line-height + 2px border`) benar-benar **sama piksel-demi-piksel** dengan tombol `Barang Baru` yang memakai `border border-amber-300`.

---

### Tahap 2: Pastikan Data Usulan Terbaru Selalu di Atas (Backend Controllers)

1. **Perbaiki `app/Http/Controllers/Perencanaan/RequisitionController.php` (`index()`, Lines ~55–59)**:
   Ubah query pengurutan dari:
   ```php
   $requisitions = $query
       ->orderByDesc('submission_date')
       ->orderByDesc('created_at')
       ->orderByDesc('id')
       ->get();
   ```
   menjadi:
   ```php
   $requisitions = $query
       ->orderByDesc('id')
       ->get();
   ```
   *(Menghapus `orderByDesc('submission_date')` dan `orderByDesc('created_at')` sebagai primary sort mencegah data demo bertanggal masa depan `2027-03-14` mendorong usulan baru tahun berjalan `2026-11-25` ke halaman bawah).*

2. **Perbaiki `app/Http/Controllers/Divisi/RequisitionController.php` (`index()`, Lines ~55–57)**:
   Ubah:
   ```php
   $query = Requisition::with(['division', 'unit', 'user', 'requisitionDetails.item', 'rbaAccount', 'verifiedByPerencanaan'])
       ->latest();
   ```
   menjadi:
   ```php
   $query = Requisition::with(['division', 'unit', 'user', 'requisitionDetails.item', 'rbaAccount', 'verifiedByPerencanaan'])
       ->orderByDesc('id');
   ```

3. **Perbaiki `app/Http/Controllers/Perencanaan/DashboardController.php` (`index()`, Lines ~30–36)**:
   Ubah:
   ```php
   $pendingRequisitions = (clone $baseQuery)
       ->with(['division', 'rbaAccount'])
       ->where('status', 'Pending_Perencanaan')
       ->latest('submission_date')
       ->latest('id')
       ->take(5)
       ->get();
   ```
   menjadi:
   ```php
   $pendingRequisitions = (clone $baseQuery)
       ->with(['division', 'rbaAccount'])
       ->where('status', 'Pending_Perencanaan')
       ->orderByDesc('id')
       ->take(5)
       ->get();
   ```
   *(Cek juga `Divisi/DashboardController.php` line 48: sudah memakai `->latest('id')`, sehingga tidak perlu diubah).*

4. **Tambahan Opsional Rapi pada `resources/js/Pages/Perencanaan/Items/Index.jsx`**:
   Saat tab aktif adalah `Usulan Unit Baru` (`selectedSource === 'USULAN_UNIT'`), urutkan daftar hasil filter berdasarkan `id` terbesar (`b.id - a.id`) atau letakkan barang yang baru diusulkan di atas agar barang yang barusan diinput unit langsung terlihat paling atas saat Perencanaan membuka menu *Usulan Unit Baru*.

---

### Tahap 3: Rapikan Button Aksi pada Bagian `Sah` dan `Tidak Sah`

#### A. Tabel Katalog & Usulan Unit Baru (`resources/js/Pages/Perencanaan/Items/Index.jsx`)
Buka `resources/js/Pages/Perencanaan/Items/Index.jsx`:

1. **Perbaiki Lebar Kolom `<thead>` Aksi (Line ~338)**:
   Ubah `<th className="w-52 px-3 py-3 text-center">Aksi</th>` menjadi `<th className="px-4 py-3 text-center whitespace-nowrap">Aksi</th>` agar kolom fleksibel mengikuti deretan tombol dalam **1 baris rapi**.
2. **Standarisasi Sel `<td>` Aksi & Seluruh Tombolnya (Lines ~448–515)**:
   - Ubah `<td>` menjadi `<td className="px-4 py-3 text-center whitespace-nowrap">`.
   - Ubah container tombol dari `flex items-center justify-center gap-1.5 flex-wrap` menjadi **`inline-flex items-center justify-center gap-1.5 whitespace-nowrap`**.
   - Samakan tinggi, radius, border, dan warna semua tombol aksi sesuai standar role lain:
     - **Tombol `Sah` (Barang Baru `USULAN_UNIT`) & `Sah` (Pembaruan Harga `price_status === 'PENDING'`)**:
       Keduanya memakai desain Teal yang identik (`inline-flex items-center justify-center gap-1 rounded-xl border border-teal-600 bg-teal-600 hover:bg-teal-700 active:scale-95 text-white px-2.5 py-1.5 text-xs font-bold shadow-2xs transition cursor-pointer`), dengan label konsisten **`Sah`** (untuk barang baru) dan **`Sah Harga`** (untuk harga diperbarui, atau gunakan ikon centang yang sama di kedua tombol agar sejajar).
     - **Tombol `Tidak Sah`** (baik barang baru maupun pembaruan harga):
       Memakai `inline-flex items-center justify-center gap-1 rounded-xl border border-rose-300 bg-rose-50 hover:bg-rose-100 active:scale-95 text-rose-700 px-2.5 py-1.5 text-xs font-bold shadow-2xs transition cursor-pointer`, lengkap dengan ikon silang `h-3.5 w-3.5`.
     - **Tombol `Edit`**:
       Samakan dengan standar aplikasi: `inline-flex items-center justify-center gap-1 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 hover:text-amber-900 active:scale-95 text-amber-800 px-2.5 py-1.5 text-xs font-bold shadow-2xs transition cursor-pointer`.
     - **Tombol `Hapus` (Trash)**:
       Samakan tingginya (`px-2.5 py-1.5 rounded-xl`): `inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 active:scale-95 px-2.5 py-1.5 text-xs font-bold text-slate-400 shadow-2xs transition cursor-pointer`.

   Contoh hasil yang akan tampil pada 1 baris horizontal rapi:
   ```jsx
   <td className="px-4 py-3 text-center whitespace-nowrap">
       <div className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap">
           {item.source === 'USULAN_UNIT' && (
               <>
                   <button
                       type="button"
                       onClick={() => handleVerifyStandard(item)}
                       title="Sahkan Menjadi Standar Baku RS"
                       className="inline-flex items-center justify-center gap-1 rounded-xl border border-teal-600 bg-teal-600 hover:bg-teal-700 active:scale-95 text-white px-2.5 py-1.5 text-xs font-bold shadow-2xs transition cursor-pointer"
                   >
                       <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                       </svg>
                       <span>Sah</span>
                   </button>
                   <button
                       type="button"
                       onClick={() => handleRejectStandard(item)}
                       title="Tandai Barang Baru Tidak Sah"
                       className="inline-flex items-center justify-center gap-1 rounded-xl border border-rose-300 bg-rose-50 hover:bg-rose-100 active:scale-95 text-rose-700 px-2.5 py-1.5 text-xs font-bold shadow-2xs transition cursor-pointer"
                   >
                       <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                       </svg>
                       <span>Tidak Sah</span>
                   </button>
               </>
           )}
           {item.price_status === 'PENDING' && (
               <>
                   <button
                       type="button"
                       onClick={() => handleVerifyPrice(item)}
                       title="Sahkan Perubahan Harga Menjadi Standar Katalog"
                       className="inline-flex items-center justify-center gap-1 rounded-xl border border-teal-600 bg-teal-600 hover:bg-teal-700 active:scale-95 text-white px-2.5 py-1.5 text-xs font-bold shadow-2xs transition cursor-pointer"
                   >
                       <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                       </svg>
                       <span>Sah Harga</span>
                   </button>
                   <button
                       type="button"
                       onClick={() => handleRejectPrice(item)}
                       title="Tolak Perubahan Harga (Pakai Harga Standar Lama)"
                       className="inline-flex items-center justify-center gap-1 rounded-xl border border-rose-300 bg-rose-50 hover:bg-rose-100 active:scale-95 text-rose-700 px-2.5 py-1.5 text-xs font-bold shadow-2xs transition cursor-pointer"
                   >
                       <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                       </svg>
                       <span>Tidak Sah</span>
                   </button>
               </>
           )}
           <button
               type="button"
               onClick={() => openEditModal(item)}
               title="Ubah Data Barang"
               className="inline-flex items-center justify-center gap-1 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 hover:text-amber-900 active:scale-95 text-amber-800 px-2.5 py-1.5 text-xs font-bold shadow-2xs transition cursor-pointer"
           >
               <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
               </svg>
               <span>Edit</span>
           </button>
           <button
               type="button"
               onClick={() => setConfirmingDelete(item)}
               title="Hapus Barang"
               className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 active:scale-95 px-2.5 py-1.5 text-xs font-bold text-slate-400 shadow-2xs transition cursor-pointer"
           >
               <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
               </svg>
           </button>
       </div>
   </td>
   ```

#### B. Segmented Pill Group `Sah` / `Tidak Sah` pada `QuickVerificationModal.jsx` & `Perencanaan/Requisitions/Show.jsx`
Rapikan kontrol tombol validasi `Sah` vs `Tidak Sah` (untuk item `BARU` maupun pembaruan harga) agar tampil menyatu dalam wadah pill yang rapi dan ukurannya seragam di kedua komponen:
```jsx
<div className="inline-flex items-center rounded-xl border border-slate-200 bg-slate-100/80 p-0.5 gap-0.5">
    <button
        type="button"
        onClick={() => /* set SAH */}
        className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition cursor-pointer whitespace-nowrap ${
            isSahSelected
                ? 'bg-teal-600 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-white/80 hover:text-slate-900'
        }`}
    >
        &#10003; Sah
    </button>
    <button
        type="button"
        onClick={() => /* set TIDAK_SAH */}
        className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition cursor-pointer whitespace-nowrap ${
            isTidakSahSelected
                ? 'bg-rose-600 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-white/80 hover:text-slate-900'
        }`}
    >
        &times; Tidak Sah
    </button>
</div>
```

---

### Tahap 4: Penambahan Automated Test Kasus Nyata (`tests/Feature/PerencanaanRbaPlanningTest.php`)

Tambahkan assertion di `test_perencanaan_requisitions_index_orders_newest_date_first_and_provides_units` (atau buat test terpisah `test_perencanaan_requisitions_index_places_newly_submitted_today_above_future_seeded_dates`) pada `tests/Feature/PerencanaanRbaPlanningTest.php`:
- Buat record lama dengan `submission_date = '2027-03-14'` dan `created_at = '2027-03-14 09:30:00'` (`status = 'Disetujui'`).
- Buat record baru sesudahnya dengan `submission_date = '2026-11-25'` dan `created_at = '2026-11-25 15:00:00'` (`status = 'Pending_Perencanaan'`, `id` lebih besar).
- Panggil `route('perencanaan.requisitions.index', ['budget_year' => 2027])`.
- Pastikan record baru (`2026-11-25`, `Pending_Perencanaan`) menempati indeks `requisitions.0` (baris paling atas!).

---

## 4. Checklist QA & Verifikasi Akhir

1. Jalankan build & test suite penuh:
   ```powershell
   npm run build
   php artisan test
   ```
   Pastikan `npm run build` selesai tanpa error dan `php artisan test` lulus **100% passed**.
2. Uji visual langsung di browser:
   - **Form Pengajuan Unit (Modal Input Rincian Barang)**: Pastikan tombol `+ Barang Baru` berada tepat di sebelah kiri `+ Tambah ke Daftar Usulan` dengan tinggi/lebar kotak yang seimbang dan warna Amber tetap terjaga.
   - **Verifikasi Usulan Belanja (`Perencanaan/Requisitions`)**: Submit usulan baru dari role Unit, lalu buka menu Verifikasi Perencanaan. Pastikan pengajuan terbaru yang barusan dikirim tampil di **baris `#1` paling atas** di atas data lama 2027.
   - **Usulan Unit Baru (`Perencanaan/Items?source=USULAN_UNIT`) & Modal Telaah**: Pastikan seluruh tombol pada kolom `Aksi` (`Sah` / `Sah Harga`, `Tidak Sah`, `Edit`, `Hapus`) berjajar rapi sejajar horizontal dalam satu baris dengan tinggi dan padding seragam.
