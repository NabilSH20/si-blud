# Perencanaan Implementasi: Perbaikan Input Barang Pengajuan Unit & Pembaruan Validasi Barang/Harga serta Filter Verifikasi di Perencanaan

> **Target Pengembang**: Junior Programmer & AI Assistant Model  
> **Repository**: `rsj-req-app` (E-BLUD RS Jiwa Tampan Provinsi Riau)  
> **Status Dokumen**: Siap Diimplementasikan (*Ready for Implementation*)  
> **Branch Kerja yang Disarankan**: Buat branch baru dari `master`, misalnya `fix/pengajuan-unit-dan-validasi-perencanaan`

---

## 1. Konteks, Masalah Saat Ini & Tujuan Pembaruan

Berdasarkan pengujian alur pengajuan belanja antara role **Unit / Divisi** (`divisi`) dan role **Perencanaan** (`perencanaan`), terdapat beberapa bug dan kekurangan fungsional yang perlu diperbaiki secara menyeluruh:

### A. Masalah di Role Unit (`Divisi/Requisitions/Partials/RequisitionFormModal.jsx` & `Divisi\RequisitionController`)
1. **Field "Nama Barang / Uraian" Bisa Diedit Bebas Setelah Memilih Barang Katalog (Bug Select)**:
   - Di Section 4 (*Input Rincian Barang*), saat user memilih kode rekening (misal *Barang Habis Pakai*), lalu memilih barang katalog (misal *Alkohol*), field `inputName` terisi nama barang tersebut sebelum dimasukkan ke tabel daftar usulan.
   - **Bug**: `<input type="text">` tetap bisa diklik dan diubah teks uraiannya, padahal `selectedCatalogItem` masih mengacu pada `item_id` lama (karena `onChange` tidak mereset `selectedCatalogItem`). Jika user memilih barang dari katalog, field uraian barang harus terkunci (*select/read-only*), sehingga yang boleh diubah hanya **Volume**, **Satuan**, dan **Harga Satuan**.
   - **Kebutuhan**: Sediakan **tombol silang (`X`)** di field tersebut agar user dapat membatalkan pilihan barang katalog saat ini dan mencari ulang barang lain dari katalog, serta pastikan user tidak bisa mengetik teks bebas di mode *Select Katalog* tanpa memilih item atau berpindah ke mode input manual.
2. **Belum Ada Tombol Dedicated untuk Input Manual Barang Baru (`+ Barang Baru`)**:
   - Saat barang yang dicari tidak tersedia di katalog, user saat ini hanya mengetik di kotak pencarian yang sama tanpa pemisahan mode yang jelas.
   - **Kebutuhan**: Tambahkan **tombol khusus di samping field barang** (misalnya tombol **`+ Barang Baru` / `Input Manual`** dan tautan cepat saat hasil pencarian katalog kosong) yang membuka/mengaktifkan kolom input manual nama barang (dan spesifikasi opsional) dengan **label/badge mencolok `BARU`**.
3. **Tidak Ada Tombol `+` / `-` (Stepper) untuk Mengubah Volume di Tabel "Daftar Barang yang Diusulkan"**:
   - Di Section 5 (*Daftar Barang yang Diusulkan*), kolom `VOL` saat ini hanya menampilkan angka statis (`{it.quantity}`). Jika user salah input volume (misalnya terketik `500` padahal ingin `50`), user terpaksa menekan ikon hapus (Trash) dan menginput ulang barang dari awal.
   - **Kebutuhan**: Tambahkan tombol stepper **`-`** dan **`+`** ala e-commerce (Shopee) lengkap dengan input angka di tengah pada kolom `VOL` di tabel Section 5 agar unit dapat langsung menambah, mengurangi, atau mengetik ulang jumlah volume dan langsung memperbarui `subtotal`, `totalOperasional`, `totalModal`, dan `grandTotal`.
4. **Bug Backend — Harga Satuan yang Diubah Unit Langsung Menimpa `items.standard_price` Tanpa Validasi Perencanaan**:
   - Pada `App\Http\Controllers\Divisi\RequisitionController::store()` dan `update()`, jika unit mengubah `unit_price` barang katalog, backend langsung memanggil `$item->update(['standard_price' => $unitPrice])` **sebelum** Perencanaan memeriksa usulan tersebut!
   - Akibatnya, saat Perencanaan membuka pengajuan, `detail.unit_price` sudah sama dengan `detail.item.standard_price` sehingga perubahan harga tidak terdeteksi, tidak tercatat histori harga awalnya, dan Perencanaan tidak bisa menolak/mengesahkan pembaruan harga tersebut.

### B. Masalah di Role Perencanaan (`Perencanaan\RequisitionController`, `Perencanaan\ItemController`, `Perencanaan/Requisitions/*`, `Perencanaan/Items/*`)
1. **Validasi Barang Baru (`BARU`) & Pembaruan Harga (`HARGA DIPERBARUI`) di Menu Verifikasi maupun Menu Usulan Unit Baru**:
   - Menu **Usulan Unit Baru** (`/perencanaan/items?source=USULAN_UNIT`) saat ini hanya menampilkan item baru dengan satu tombol **`Sahkan`** tanpa opsi **`Tidak Sah`** (dan tombol Hapus gagal bila item sudah terhubung ke `requisition_details`), serta sama sekali tidak menampilkan item yang mengalami perubahan harga oleh unit.
   - Pada halaman/modal **Verifikasi Usulan Belanja** (`QuickVerificationModal.jsx` & `Perencanaan/Requisitions/Show.jsx`), belum terdapat badge **`BARU`** untuk barang baru dan belum terdapat badge **`HARGA DIPERBARUI`** beserta perbandingan harga awal vs usulan dan kontrol validasi **Sah / Tidak Sah**.
   - **Kebutuhan**:
     - Barang baru usulan unit wajib memiliki label **`BARU`** saat divalidasi oleh Perencanaan, dengan pilihan aksi **Sah** (disahkan ke Katalog Standar RS / disetujui) atau **Tidak Sah** (ditolak / kuantitas disetujui 0, tidak disahkan jadi standar RS).
     - Barang katalog yang harganya diubah oleh unit wajib menampilkan label **`HARGA DIPERBARUI`** beserta perbandingan **Harga Katalog Awal vs Harga Baru**, dan Perencanaan dapat memvalidasi **Sah** (harga baru disetujui dan memperbarui `items.standard_price` katalog RS) atau **Tidak Sah** (perubahan harga ditolak sehingga katalog tetap memakai `standard_price` lama dan harga detail dikembalikan ke harga standar / atau item ditolak).
2. **Urutan Tabel Verifikasi Pengajuan & Kurangnya Filter Tanggal + Unit Pengusul**:
   - Pada `App\Http\Controllers\Perencanaan\RequisitionController::index()`, query saat ini memakai `orderByRaw("CASE WHEN status = 'Pending_Perencanaan' THEN 0 ELSE 1 END")`, yang mengacak urutan kronologis tanggal pengajuan (misal pengajuan 14 Januari masih pending tampil di atas pengajuan 16 Maret).
   - **Kebutuhan**: Tampilkan data **berdasarkan pengajuan terbaru di baris paling atas** secara rapi dan konsisten (misal ada pengajuan tanggal `14 Januari` dan `16 Maret`, maka `16 Maret` selalu tampil di atas `14 Januari`).
   - Pada toolbar `resources/js/Pages/Perencanaan/Requisitions/Index.jsx`, saat ini baru ada filter pencarian teks dan `Filter Jenis Belanja`. Tambahkan **Filter Tanggal Pengajuan** (rentang tanggal *Dari* – *Sampai*) dan **Filter Unit Pengusul**, serta tombol **Reset Filter**.

---

## 2. Daftar File yang Akan Dibuat / Dimodifikasi

| No | File Target | Peran Perubahan |
|---|---|---|
| 1 | `database/migrations/2026_11_25_000001_add_validation_tracking_to_items_and_requisition_details.php` *(baru)* | Menambah kolom tracking validasi barang baru (`is_new_item`, `item_validation_status`) & pembaruan harga (`original_unit_price`, `is_price_updated`, `price_validation_status`) di `requisition_details`, serta kolom usulan harga pending (`pending_price`, `price_status`, `price_origin_unit_id`) di `items`. |
| 2 | `app/Models/Item.php` | Menambahkan cast `pending_price`, konstanta/helper status (`STANDAR`, `USULAN_UNIT`, `DITOLAK`), dan relasi `priceOriginUnit()`. |
| 3 | `app/Models/RequisitionDetail.php` | Menambahkan cast boolean & decimal untuk kolom validasi baru (`is_new_item`, `original_unit_price`, `is_price_updated`). |
| 4 | `app/Http/Controllers/Divisi/RequisitionController.php` | Menyaring barang `'DITOLAK'` dari katalog unit; berhenti menimpa `items.standard_price` secara sepihak; mencatat `pending_price`, `original_unit_price`, `is_new_item`, `is_price_updated`, dan status validasi pending saat `store()` / `update()`. |
| 5 | `resources/js/Pages/Divisi/Requisitions/Partials/RequisitionFormModal.jsx` | Kunci input nama saat barang katalog dipilih + tombol silang (`X`), tombol `+ Barang Baru` + input manual berlabel `BARU`, stepper `-` / `+` pada tabel Section 5 + edit volume langsung, badge `BARU` & `Harga Diperbarui`, serta perbaikan hidrasi mode Edit. |
| 6 | `resources/js/Pages/Divisi/Requisitions/Show.jsx` & `resources/js/Pages/Shared/RequisitionDetailModal.jsx` | Menampilkan fallback `detail.item_name` yang konsisten dan badge `BARU` / `HARGA DIPERBARUI` pada rincian detail. |
| 7 | `routes/web.php` | Menambahkan route `items.reject-standard`, `items.verify-price`, dan `items.reject-price` di grup `perencanaan`. |
| 8 | `app/Http/Controllers/Perencanaan/ItemController.php` | Mengirim relasi `priceOriginUnit`, menambahkan method `rejectStandard()`, `verifyPrice()`, `rejectPrice()`, serta menyinkronkan status validasi ke `requisition_details` pending terkait. |
| 9 | `resources/js/Pages/Perencanaan/Items/Index.jsx` & `Partials/ItemFormModal.jsx` | Menampilkan barang `BARU` (`USULAN_UNIT`) dan barang `HARGA DIPERBARUI` (`price_status === 'PENDING'`) pada daftar Usulan Unit Baru beserta tombol `Sah` dan `Tidak Sah`. |
| 10 | `app/Http/Controllers/Perencanaan/RequisitionController.php` | Mengurutkan `index()` berdasarkan pengajuan terbaru (`submission_date DESC`, `created_at DESC`, `id DESC`), mengirim prop `units`, dan memproses `item_validation_status` & `price_validation_status` di `update()`. |
| 11 | `resources/js/Pages/Perencanaan/Requisitions/Index.jsx` | Menambahkan Filter Tanggal Pengajuan (`dateFrom` & `dateTo`), Filter Unit Pengusul (`unitFilter`), tombol `Reset`, dan indikator ringkas item baru / pembaruan harga. |
| 12 | `resources/js/Pages/Perencanaan/Requisitions/Partials/QuickVerificationModal.jsx` & `Show.jsx` | Menampilkan badge `BARU` & `HARGA DIPERBARUI`, perbandingan harga awal vs usulan, kontrol pilihan validasi **Sah / Tidak Sah** per baris barang, dan kalkulasi live `totalEstimatedApproved`. |
| 13 | `tests/Feature/RequesterRequisitionTest.php`, `PerencanaanItemManagementTest.php`, `PerencanaanRbaPlanningTest.php`, `EndToEndRequisitionWorkflowTest.php` | Menyesuaikan assertion perubahan harga pada test lama dan menambah skenario test baru lengkap (unit input manual, perubahan harga, validasi Sah/Tidak Sah Perencanaan, pengurutan terbaru, filter tanggal & unit). |

---

## 3. Rancangan Skema Database & Aturan Bisnis

> [!IMPORTANT]
> Gunakan tipe kolom `string(...)` (bukan `enum(...)`) di migration baru agar migration kompatibel penuh dengan **MySQL** (Laragon/produksi) maupun **SQLite in-memory** (PHPUnit `RefreshDatabase`).

### A. Perubahan Tabel `items`
Tambahkan kolom berikut (setelah `standard_price` / `origin_unit_id`):
- `pending_price` (`decimal(18, 2)`, `nullable`): Menyimpan harga satuan baru usulan unit yang menunggu validasi Perencanaan.
- `price_status` (`string(30)`, `default('NONE')`): Status pembaruan harga di katalog (`'NONE'`, `'PENDING'`, `'SAH'`, `'TIDAK_SAH'`). Catatan: setelah divalidasi (`SAH` atau `TIDAK_SAH`), status katalog dapat kembali ke `'NONE'` dan `pending_price` diset `null`, sementara riwayat persetujuannya tetap tersimpan di `requisition_details.price_validation_status`.
- `price_origin_unit_id` (`foreignId` ke `units`, `nullable`, `nullOnDelete()`): Unit terakhir yang mengusulkan pembaruan harga barang tersebut.

> Nilai kolom `items.source` tetap bertipe `string`:
> - `'STANDAR'`: Barang resmi katalog RS.
> - `'USULAN_UNIT'`: Barang baru usulan unit yang belum disahkan Perencanaan.
> - `'DITOLAK'`: Barang baru usulan unit yang dinyatakan **Tidak Sah** oleh Perencanaan (tidak tampil di katalog pencarian unit, tetapi histori `requisition_details` tetap utuh tanpa melanggar foreign key).

### B. Perubahan Tabel `requisition_details`
Tambahkan kolom berikut:
- `is_new_item` (`boolean`, `default(false)`): Penanda apakah item pada baris pengajuan ini adalah barang baru usulan manual unit (`true`) atau barang yang sudah ada di katalog (`false`).
- `item_validation_status` (`string(30)`, `nullable`): Status validasi Perencanaan untuk barang baru (`null` jika barang standar lama, atau `'PENDING'` -> `'SAH'` / `'TIDAK_SAH'` jika barang baru).
- `original_unit_price` (`decimal(18, 2)`, `nullable`): Snapshot `items.standard_price` pada saat unit mengajukan/mengedit pengajuan (diisi ketika item diambil dari katalog).
- `is_price_updated` (`boolean`, `default(false)`): `true` apabila unit mengubah `unit_price` berbeda dari `original_unit_price` (baik naik maupun turun, i.e., `(float) $unitPrice !== (float) $originalPrice`).
- `price_validation_status` (`string(30)`, `default('NONE')`): Status validasi Perencanaan atas perubahan harga pada pengajuan ini (`'NONE'` jika harga tidak diubah, `'PENDING'` saat menunggu telaah, lalu `'SAH'` atau `'TIDAK_SAH'`).

---

## 4. Tahapan Implementasi Terperinci (*Step-by-Step Guide*)

### Tahap 1: Migrasi Database & Pembaruan Model Eloquent

1. **Buat Migration Baru** `database/migrations/2026_11_25_000001_add_validation_tracking_to_items_and_requisition_details.php`:
   - Pada tabel `items`: gunakan guard `if (! Schema::hasColumn(...))` sebelum menambah:
     - `pending_price` (`decimal('pending_price', 18, 2)->nullable()->after('standard_price')`)
     - `price_status` (`string('price_status', 30)->default('NONE')->after('pending_price')`)
     - `price_origin_unit_id` (`foreignId('price_origin_unit_id')->nullable()->after('origin_unit_id')->constrained('units')->nullOnDelete()`)
   - Pada tabel `requisition_details`: tambah:
     - `is_new_item` (`boolean('is_new_item')->default(false)->after('specification')`)
     - `item_validation_status` (`string('item_validation_status', 30)->nullable()->after('is_new_item')`)
     - `original_unit_price` (`decimal('original_unit_price', 18, 2)->nullable()->after('unit_price')`)
     - `is_price_updated` (`boolean('is_price_updated')->default(false)->after('original_unit_price')`)
     - `price_validation_status` (`string('price_validation_status', 30)->default('NONE')->after('is_price_updated')`)
   - Isi method `down()` dengan aman (`dropForeign` sebelum `dropColumn`).

2. **Perbarui `app/Models/Item.php`**:
   - Tambahkan cast di `casts()`:
     ```php
     'standard_price' => 'decimal:2',
     'pending_price' => 'decimal:2',
     ```
   - Tambahkan relasi baru:
     ```php
     public function priceOriginUnit(): BelongsTo
     {
         return $this->belongsTo(Unit::class, 'price_origin_unit_id');
     }
     ```
   - Tambahkan helper method opsional agar bersih: `isRejected(): bool` (`$this->source === 'DITOLAK'`) dan `hasPendingPriceUpdate(): bool` (`$this->price_status === 'PENDING'`).

3. **Perbarui `app/Models/RequisitionDetail.php`**:
   - Tambahkan cast di `casts()`:
     ```php
     'unit_price' => 'decimal:2',
     'original_unit_price' => 'decimal:2',
     'subtotal' => 'decimal:2',
     'is_new_item' => 'boolean',
     'is_price_updated' => 'boolean',
     'exceeds_ssh' => 'boolean',
     ```

---

### Tahap 2: Pembaruan Backend Role Unit (`app/Http/Controllers/Divisi/RequisitionController.php`)

1. **Filter Katalog di `index()` (Lines ~102–104)**:
   - Ubah query `$items` agar barang yang sudah ditolak Perencanaan (`source === 'DITOLAK'`) tidak muncul lagi sebagai pilihan katalog, serta sertakan `source` dan `origin_unit_id` dalam kolom yang dikirim ke frontend:
     ```php
     $items = Item::where('source', '!=', 'DITOLAK')
         ->orderBy('name')
         ->get([
             'id', 'rba_account_id', 'item_code', 'name', 'specification', 'unit_type', 'standard_price', 'source', 'origin_unit_id',
         ]);
     ```

2. **Perbaiki Logika Item Baru & Perubahan Harga pada `store()` (Lines ~177–342) dan `update()` (Lines ~396–549)**:
   Ekstrak atau terapkan logika yang seragam dan bebas duplikasi di kedua method (`store` dan `update`) dengan memperhatikan hal berikut:
   - **Kasus A — Barang Baru (`$isNew === true`)**:
     - Cek kondisi `$isNew`: `! empty($itemData['is_new']) || empty($itemData['item_id'])`.
     - Jika pada `update()` unit mengirim `item_id` yang berasal dari `USULAN_UNIT` milik pengajuan tersebut (`is_new = true` + `item_id` sudah ada):
       - Cari `$existingItem = ! empty($itemData['item_id']) ? Item::find($itemData['item_id']) : null`.
       - Jika `$existingItem && $existingItem->source === 'USULAN_UNIT'`, perbarui atribut `$existingItem` (`name`, `unit_type`, `specification`, `standard_price`) daripada membuat baris item duplikat.
       - Jika tidak ada, cari berdasarkan `name` + `rba_account_id` yang tidak berstatus `DITOLAK`; jika tidak ketemu, buat `Item::create([... 'source' => 'USULAN_UNIT', 'origin_unit_id' => $unitId ...])`.
     - Tandai metadata detail untuk `RequisitionDetail::create(...)`:
       - `is_new_item => true` (atau tetap `false` hanya jika item tersebut ternyata sudah berstatus `'STANDAR'` sebelum transaksi). Praktisnya: `is_new_item => ($item->source !== 'STANDAR')`, dan `item_validation_status => ($item->source === 'STANDAR' ? 'SAH' : 'PENDING')`.
       - `original_unit_price => null`, `is_price_updated => false`, `price_validation_status => 'NONE'`.
   - **Kasus B — Barang Katalog yang Sudah Ada (`$isNew === false` / `item_id` dipilih dari katalog)**:
     - Ambil `$item = Item::findOrFail($itemData['item_id'])`.
     - Simpan `$originalStandardPrice = (float) $item->standard_price`.
     - Hitung `$unitPrice = isset($itemData['unit_price']) && $itemData['unit_price'] !== '' ? (float) $itemData['unit_price'] : $originalStandardPrice`.
     - Deteksi perubahan harga:
       `$isPriceUpdated = abs($unitPrice - $originalStandardPrice) > 0.001;`
     - **PENTING — JANGAN TIMPA `items.standard_price` secara langsung!**
       - Hapus baris lama `$item->update(['standard_price' => $unitPrice]);`!
       - Sebagai gantinya, jika `$isPriceUpdated === true`:
         ```php
         $item->update([
             'pending_price' => $unitPrice,
             'price_status' => 'PENDING',
             'price_origin_unit_id' => $user->unit_id ?? $requisition->unit_id,
         ]);
         ```
     - Simpan metadata ke `RequisitionDetail`:
       ```php
       'is_new_item' => $item->source === 'USULAN_UNIT',
       'item_validation_status' => $item->source === 'USULAN_UNIT' ? 'PENDING' : null,
       'original_unit_price' => $originalStandardPrice,
       'unit_price' => $unitPrice,
       'is_price_updated' => $isPriceUpdated,
       'price_validation_status' => $isPriceUpdated ? 'PENDING' : 'NONE',
       ```
   - **Pengecekan Satuan (`unit_type`) saat Pilih Barang Katalog**:
     - Pastikan pada `store()` / `update()`, bila unit mengubah `unit_type` pada saat mengajukan barang katalog (karena user diizinkan mengubah Volume, Satuan, dan Harga Satuan), `RequisitionDetail::create()` memakai `$itemData['unit_type'] ?: $item->unit_type`, BUKAN memaksakan `$item->unit_type` terus-menerus! Cek lines 335 & 541: ubah `'unit_type' => trim($itemData['unit_type'] ?? '') ?: $item->unit_type`.

---

### Tahap 3: Pembaruan UI Formulir Pengajuan Unit (`resources/js/Pages/Divisi/Requisitions/Partials/RequisitionFormModal.jsx`)

1. **Tambahkan State Mode Manual & Harga Katalog Asal (Lines ~183–200)**:
   - Tambahkan state:
     - `const [isManualMode, setIsManualMode] = useState(false);`
     - `const nameInputRef = useRef(null);`
   - Tambahkan helper `resetItemInputRow(keepManual = false)`:
     ```jsx
     const resetItemInputRow = (keepManual = false) => {
         setInputName('');
         setSelectedCatalogItem(null);
         setInputQty(1);
         setInputUnit('Pcs');
         setInputPrice('');
         setInputSpec('');
         setIsCatalogDropdownOpen(false);
         setQuickAddError(null);
         setIsManualMode(keepManual);
     };
     ```
   - **Auto-reset ketika ganti Rekening RBA (`selectedRincianObjekId` berubah)**:
     Tambahkan `useEffect` agar jika user masih dalam mode katalog (`!isManualMode`) lalu mengganti kode rekening di Section 3, `selectedCatalogItem`, `inputName`, `inputPrice`, `inputUnit`, dan `inputSpec` direset agar tidak terjadi barang rekening A tertaut ke rekening B.

2. **Ubah Section 4 (`4. Input Rincian Barang`, Lines ~888–1041) Menjadi 2 Mode Jelas**:
   - **Mode A — Mode Select Katalog (`isManualMode === false`, default)**:
     - Ubah layout kolom `Nama Barang / Uraian` (`sm:col-span-4` atau `sm:col-span-5` agar lega, sesuaikan grid 12 kolom dengan kolom Volume, Satuan, Harga Satuan, Total Biaya atau letakkan tombol `+ Barang Baru` berdampingan rapi di dalam blok `Input Rincian Barang`):
     - Buat field **Pilih Barang Katalog**:
       - Ketika `selectedCatalogItem === null`: input bertipe searchable select (user bisa mengetik untuk memfilter `filteredCatalogItems` di dropdown dan klik barang, misalnya *Alkohol*). Tambahkan ikon kaca pembesar di kiri, chevron/indikator dropdown, dan tombol **`X`** kecil bila teks pencarian sedang terisi untuk membersihkan pencarian.
       - **Ketika `selectedCatalogItem !== null` (FIX BUG UTAMA)**:
         - Pasang **`readOnly={true}`** (atau tampilkan sebagai pill/box select terkunci dengan nama barang & kode item) sehingga **user TIDAK bisa mengklik lalu mengetik/mengubah nama uraian barang tersebut!** Hanya field **Volume**, **Satuan**, dan **Harga Satuan** yang tetap aktif diedit.
         - Beri penanda visual bahwa item ini dari katalog (misal border `border-teal-400 bg-teal-50/60 font-bold text-slate-900 cursor-default` dan mini label `Katalog • ${selectedCatalogItem.item_code}`).
         - **Tampilkan tombol silang (`X`)** di sisi kanan dalam field (`type="button"`, warna `text-slate-400 hover:text-rose-600`, `title="Batalkan pilihan & cari barang lain"`). Saat diklik: memanggil `resetItemInputRow(false)` lalu langsung fokus ke `nameInputRef.current?.focus()` dan membuka kembali dropdown (`setIsCatalogDropdownOpen(true)`).
       - **Tombol `+ Barang Baru` di samping field katalog**:
         - Tepat di sebelah field Select Katalog (atau di baris atas/sebelah kanan kotak field nama barang), sediakan tombol **`+ Barang Baru`** (`type="button"`, border `border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800`): saat diklik, mengaktifkan `setIsManualMode(true)`, mereset `selectedCatalogItem(null)`, dan memfokuskan input manual.
         - Selain itu, **di dalam dropdown katalog ketika `filteredCatalogItems.length === 0`**: jangan diam saja! Render box info *"Barang tidak ditemukan di katalog rekening ini"* disertai tombol klik cepat **`+ Input sebagai Barang Baru (${inputName})`** yang langsung memanggil `setIsManualMode(true)` dengan mempertahankan teks pencarian yang sudah diketik user.
   - **Mode B — Mode Input Manual Barang Baru (`isManualMode === true`)**:
     - Header/label field menampilkan **badge mencolok `BARU`**:
       ```jsx
       <span className="inline-flex items-center rounded-md bg-amber-100 border border-amber-300 px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-800">
           BARU
       </span>
       ```
     - Field input **Nama Barang Baru** dapat diketik bebas (ditambah input opsional **Spesifikasi Barang Baru** di bawah/sebelahnya agar usulan unit lengkap saat diperiksa Perencanaan).
     - Sediakan tombol **`Pilih dari Katalog`** / ikon **`X`** di sebelah field manual agar user bisa membatalkan mode manual dan kembali ke Select Katalog kapan saja.
   - **Validasi `handleAddItem()` (Lines ~246–302)**:
     - Jika `!isManualMode && !selectedCatalogItem`:
       - Tampilkan `setQuickAddError('Pilih barang dari daftar katalog terlebih dahulu, atau klik tombol "+ Barang Baru" untuk input manual.')` dan **jangan masukkan item**!
     - Pada objek `newItem` yang ditambahkan ke `data.items`:
       - Sertakan field tambahan:
         ```jsx
         original_unit_price: selectedCatalogItem ? Number(selectedCatalogItem.standard_price || 0) : null,
         is_price_updated: selectedCatalogItem ? Number(priceNum) !== Number(selectedCatalogItem.standard_price || 0) : false,
         is_new: Boolean(isManualMode),
         ```
     - Setelah item ditambahkan (`handleAddItem` sukses), panggil `resetItemInputRow(false)` agar siap memilih item berikutnya.
   - **Info Peringatan Perubahan Harga di Input Harga Satuan**:
     - Jika `!isManualMode && selectedCatalogItem && inputPrice !== '' && Number(inputPrice) !== Number(selectedCatalogItem.standard_price || 0)`, tampilkan keterangan kecil di bawah input Harga Satuan:
       `Harga katalog awal: ${formatRupiah(selectedCatalogItem.standard_price)} (akan ditandai Harga Diperbarui)`.

3. **Tambahkan Stepper `+` dan `-` pada Kolom `VOL` di Section 5 (`5. Daftar Barang yang Diusulkan`, Lines ~1056–1121)**:
   - Buat handler baru:
     ```jsx
     const handleUpdateItemQuantity = (index, nextQty) => {
         const parsedQty = Math.max(1, parseInt(nextQty, 10) || 1);
         const updatedItems = data.items.map((item, idx) => {
             if (idx !== index) return item;
             return {
                 ...item,
                 quantity: parsedQty,
                 subtotal: parsedQty * Number(item.unit_price || 0),
             };
         });
         setData('items', updatedItems);
     };
     ```
   - Pada kolom `VOL` di `<tbody>` tabel Section 5 (ganti `<th className="w-16">` menjadi `w-32` agar muat stepper):
     ```jsx
     <td className="px-3 py-3 text-center">
         <div className="inline-flex items-center rounded-xl border border-slate-300 bg-white p-0.5 shadow-2xs">
             <button
                 type="button"
                 disabled={Number(it.quantity) <= 1}
                 onClick={() => handleUpdateItemQuantity(idx, Number(it.quantity || 1) - 1)}
                 className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-600 hover:bg-teal-50 hover:text-teal-700 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition cursor-pointer font-bold"
                 title="Kurangi volume"
             >
                 &minus;
             </button>
             <input
                 type="number"
                 min="1"
                 value={it.quantity}
                 onChange={(e) => {
                     const val = e.target.value;
                     if (val === '') return;
                     handleUpdateItemQuantity(idx, val);
                 }}
                 onBlur={(e) => handleUpdateItemQuantity(idx, e.target.value || 1)}
                 className="w-12 border-none bg-transparent px-1 py-1 text-center text-xs font-bold text-slate-900 focus:outline-none focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
             />
             <button
                 type="button"
                 onClick={() => handleUpdateItemQuantity(idx, Number(it.quantity || 1) + 1)}
                 className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-600 hover:bg-teal-50 hover:text-teal-700 active:scale-95 transition cursor-pointer font-bold"
                 title="Tambah volume"
             >
                 +
             </button>
         </div>
     </td>
     ```
     *(Tips untuk AI/programmer: bila ingin mendukung mengetik bebas misal menghapus angka sebelum ketik `50`, izinkan state sementara saat `onChange` atau gunakan fallback `Math.max(1, parseInt(val, 10) || 1)` saat `onBlur` — perhatikan agar `subtotal` dan `handleSubmit` selalu memakai angka minimal `1`!)*
   - Pada kolom `URAIAN BARANG` di Section 5:
     - Tampilkan badge **`BARU`** jika `it.is_new` bernilai `true`.
     - Tampilkan badge **`Harga Diperbarui`** + info harga standar awal jika `!it.is_new && it.original_unit_price !== null && Number(it.unit_price) !== Number(it.original_unit_price)`.

4. **Perbaiki Hidrasi Mode Edit (`useEffect` lines ~327–382)**:
   - Ubah mapping `loadedItems`:
     ```jsx
     const isItemNew = Boolean(d.is_new_item || d.item?.source === 'USULAN_UNIT' || !d.item_id);
     const basePrice = d.original_unit_price !== null && d.original_unit_price !== undefined
         ? Number(d.original_unit_price)
         : (d.item ? Number(d.item.standard_price || 0) : null);
     const isPriceUpdated = Boolean(
         d.is_price_updated || (!isItemNew && basePrice !== null && Number(d.unit_price || 0) !== basePrice)
     );
     ```
   - Reset juga state `isManualMode` dan `selectedCatalogItem` saat modal dibuka/tutup (`useEffect` pada `[show]`).

---

### Tahap 4: Pembaruan Backend & Routing Role Perencanaan (`routes/web.php`, `Perencanaan\ItemController.php`, `Perencanaan\RequisitionController.php`)

1. **Tambahkan Route Validasi Barang & Harga di `routes/web.php` (Grup `perencanaan`, Lines ~41–46)**:
   ```php
   Route::patch('/items/{item}/verify-standard', [ItemController::class, 'verifyStandard'])
       ->name('items.verify-standard');
   Route::patch('/items/{item}/reject-standard', [ItemController::class, 'rejectStandard'])
       ->name('items.reject-standard');
   Route::patch('/items/{item}/verify-price', [ItemController::class, 'verifyPrice'])
       ->name('items.verify-price');
   Route::patch('/items/{item}/reject-price', [ItemController::class, 'rejectPrice'])
       ->name('items.reject-price');
   ```

2. **Perbarui `app/Http/Controllers/Perencanaan/ItemController.php`**:
   - Di `index()`: tambahkan eager load `'priceOriginUnit:id,name,unit_code'` dan tambahkan `'pending_price'`, `'price_status'`, `'price_origin_unit_id'` ke daftar kolom `.get([...])`.
   - Di `verifyStandard(Item $item)`:
     - Ubah `source` menjadi `'STANDAR'`.
     - Sinkronkan semua `RequisitionDetail` milik item tersebut pada pengajuan yang masih `Pending_Perencanaan`: set `item_validation_status = 'SAH'`.
   - Tambahkan **`rejectStandard(Item $item)`**:
     - Bungkus dalam `DB::transaction`:
       - Ubah `source` menjadi `'DITOLAK'`.
       - Cari semua `RequisitionDetail` untuk `$item->id` yang masih berada pada `Requisition` berstatus `Pending_Perencanaan`, lalu update `item_validation_status = 'TIDAK_SAH'`, `quantity_approved = 0`, `subtotal = 0`.
     - Redirect ke `route('items.index', ['source' => 'USULAN_UNIT'])` dengan flash `success`.
   - Tambahkan **`verifyPrice(Item $item)`**:
     - Validasi bahwa `$item->price_status === 'PENDING'` dan `$item->pending_price !== null`.
     - Dalam `DB::transaction`:
       - `$newPrice = (float) $item->pending_price;`
       - Update `$item`: `'standard_price' => $newPrice`, `'pending_price' => null`, `'price_status' => 'NONE'`, `'price_origin_unit_id' => null`.
       - Update `RequisitionDetail` yang masih berada di pengajuan `Pending_Perencanaan` dan `is_price_updated = true`: set `'price_validation_status' => 'SAH'`, `'unit_price' => $newPrice`, `'subtotal' => DB::raw('quantity_requested * '.$newPrice)` (atau hitung per baris PHP dalam loop agar aman di SQLite & MySQL!).
   - Tambahkan **`rejectPrice(Item $item)`**:
     - Dalam `DB::transaction`:
       - Simpan `$oldStandardPrice = (float) $item->standard_price;`
       - Bersihkan pending harga di `$item`: `'pending_price' => null`, `'price_status' => 'NONE'`, `'price_origin_unit_id' => null` (harga resmi `standard_price` tetap dipertahankan!).
       - Untuk setiap `RequisitionDetail` dengan `item_id = $item->id` dan `price_validation_status = 'PENDING'` yang induk `Requisition`-nya masih `Pending_Perencanaan`:
         - Kembalikan `unit_price = $detail->original_unit_price ?? $oldStandardPrice`
         - Update `subtotal = (int) $detail->quantity_requested * (float) $restoredPrice`
         - Update `price_validation_status = 'TIDAK_SAH'`, `exceeds_ssh = false`
         - Hitung ulang `total_estimated`, `total_operasional`, `total_modal` pada induk `Requisition` tersebut agar total dokumen tetap akurat!

3. **Perbarui `app/Http/Controllers/Perencanaan/RequisitionController.php`**:
   - **Di `index()` (Lines ~24–67)**:
     - Hapus `->orderByRaw("CASE WHEN status = 'Pending_Perencanaan' THEN 0 ELSE 1 END")`, dan ganti dengan urutan kronologis terbaru di atas:
       ```php
       $requisitions = $query
           ->orderByDesc('submission_date')
           ->orderByDesc('created_at')
           ->orderByDesc('id')
           ->get();
       ```
     - Query daftar master unit untuk Filter Unit Pengusul dan kirim sebagai prop:
       ```php
       $units = \App\Models\Unit::orderBy('name')->get(['id', 'name', 'unit_code', 'division_id']);
       ```
       Lalu kirim `'units' => $units` ke `Inertia::render('Perencanaan/Requisitions/Index', [...])`.
     - Pastikan `requisitionDetails.item` yang di-eager load sudah otomatis menyertakan kolom `source`, `standard_price`, `pending_price`, `price_status`.
   - **Di `update()` (Lines ~111–246)**:
     - Tambahkan validasi opsional (*backward-compatible* dengan test lama!) untuk array `items`:
       ```php
       'items.*.item_validation_status' => ['nullable', 'string', 'in:SAH,TIDAK_SAH'],
       'items.*.price_validation_status' => ['nullable', 'string', 'in:SAH,TIDAK_SAH'],
       ```
     - Sebelum menghitung total approved dan cek SSH / pagu RBA, proses keputusan per item saat `$validated['status'] === 'Disetujui'`:
       1. Jika item berstatus baru (`$detail->is_new_item || $detail->item?->source === 'USULAN_UNIT'`):
          - Jika `$itemData['item_validation_status'] === 'TIDAK_SAH'`:
            - Paksa `$qtyApproved = 0` untuk baris ini!
            - Set `$detail->item_validation_status = 'TIDAK_SAH'`.
            - Jika `$detail->item && $detail->item->source === 'USULAN_UNIT'`, tandai `$detail->item->update(['source' => 'DITOLAK'])`.
          - Jika `$itemData['item_validation_status'] === 'SAH'` (atau bila disetujui `qty > 0` dan belum ditandai tidak sah):
            - Set `$detail->item_validation_status = 'SAH'`.
            - Jika `$detail->item && $detail->item->source === 'USULAN_UNIT'`, sahkan master item menjadi `$detail->item->update(['source' => 'STANDAR'])`.
       2. Jika item mengalami pembaruan harga (`$detail->is_price_updated || ($detail->original_unit_price !== null && (float) $detail->unit_price !== (float) $detail->original_unit_price)`):
          - Jika `$itemData['price_validation_status'] === 'TIDAK_SAH'`:
            - Gunakan harga katalog awal `$effectiveUnitPrice = (float) ($detail->original_unit_price ?? $detail->item?->standard_price ?? $detail->unit_price)`.
            - Update `detail`: `unit_price = $effectiveUnitPrice`, `price_validation_status = 'TIDAK_SAH'`, `exceeds_ssh = false`.
            - Bersihkan `pending_price = null`, `price_status = 'NONE'`, `price_origin_unit_id = null` pada `$detail->item` **tanpa mengubah** `items.standard_price`.
          - Jika `$itemData['price_validation_status'] === 'SAH'`:
            - Gunakan harga baru `$effectiveUnitPrice = (float) $detail->unit_price`.
            - Update `detail`: `price_validation_status = 'SAH'`.
            - Perbarui katalog resmi `$detail->item`: `'standard_price' => $effectiveUnitPrice`, `'pending_price' => null`, `'price_status' => 'NONE'`, `'price_origin_unit_id' => null`.
          - **Perhatikan Pengecekan `$exceedsSSH`**:
            - Bandingkan `$effectiveUnitPrice` terhadap harga standar referensi awal (`$baseStandardPrice = (float) ($detail->original_unit_price ?? $detail->item?->standard_price ?? $effectiveUnitPrice)`).
            - Jika `$itemData['price_validation_status'] !== 'TIDAK_SAH'` dan `$effectiveUnitPrice > $baseStandardPrice`, barulah `$exceedsSSH = true`! (Jika Perencanaan menolak perubahan harga menjadi `TIDAK_SAH`, maka harga sudah kembali ke standar awal sehingga tidak perlu meminta catatan justifikasi SSH).
            - Catat di detail: saat menghitung `$calculatedTotalApproved` untuk pengecekan pagu RBA, gunakan `$effectiveUnitPrice * $qtyApproved` agar konsisten 100% dengan jumlah yang disimpan ke DB!

---

### Tahap 5: Pembaruan UI Tabel Verifikasi Usulan (`resources/js/Pages/Perencanaan/Requisitions/Index.jsx`)

1. **Terima prop `units = []`** pada `export default function Index({ requisitions = [], units = [], success, error, selectedYear = '2026' })`.
2. **Tambahkan Filter Unit Pengusul & Filter Tanggal Pengajuan**:
   - State baru:
     - `const [unitFilter, setUnitFilter] = useState('ALL');`
     - `const [dateFrom, setDateFrom] = useState('');`
     - `const [dateTo, setDateTo] = useState('');`
   - Daftar opsi unit (fallback gabungan dari prop `units` dan unit yang muncul di `requisitions` bila prop belum ada).
   - Normalisasi tanggal agar aman dari pergeseran zona waktu UTC/WIB:
     ```jsx
     const normalizeDateStr = (raw) => {
         if (!raw) return '';
         return String(raw).slice(0, 10); // format YYYY-MM-DD
     };
     ```
   - Perbarui logika `filteredRequisitions`:
     - `matchesUnit`: `unitFilter === 'ALL' || String(req.unit_id) === String(unitFilter)`
     - `matchesDate`: ambil `const reqDate = normalizeDateStr(req.submission_date || req.created_at);`, cocokkan `(!dateFrom || (reqDate && reqDate >= dateFrom)) && (!dateTo || (reqDate && reqDate <= dateTo))`
   - Perbarui `useEffect(() => setCurrentPage(1), [search, statusFilter, jenisFilter, unitFilter, dateFrom, dateTo]);`.
   - Tambahkan kontrol UI di toolbar (`Perencanaan/Requisitions/Index.jsx` lines ~179–226):
     - Dropdown **`Filter Unit Pengusul`** (`Semua Unit Pengusul` + nama unit).
     - Input tanggal **`Dari`** (`type="date"`, `aria-label="Dari tanggal pengajuan"`) dan **`Sampai`** (`type="date"`, `aria-label="Sampai tanggal pengajuan"`).
     - Tombol **`Reset`** (ukuran standar `px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-700`) saat salah satu filter aktif.
   - *(Opsional namun sangat membantu verifikator)*: Di kolom `Nomor & Rekening RBA` atau `Jenis Belanja` pada tabel `Index.jsx`, tampilkan micro-badge jika `detailsList` mengandung item baru (`Ada Barang Baru`) atau perubahan harga (`Ada Harga Diperbarui`), sambil memastikan **setiap baris merepresentasikan 1 dokumen pengajuan berurut dari tanggal pengajuan terbaru di paling atas**.

---

### Tahap 6: Pembaruan UI Validasi Item Baru & Harga Diperbarui di Perencanaan

1. **Modal Verifikasi Cepat (`resources/js/Pages/Perencanaan/Requisitions/Partials/QuickVerificationModal.jsx`) & Halaman Detail Telaah (`resources/js/Pages/Perencanaan/Requisitions/Show.jsx`)**:
   Lakukan pembaruan konsisten pada kedua komponen verifikasi ini:
   - Inisialisasi `itemsState` (atau `data.items`):
     Untuk setiap detail `d`, deteksi:
     - `const isNewItem = Boolean(d.is_new_item || d.item?.source === 'USULAN_UNIT');`
     - `const basePrice = d.original_unit_price !== null && d.original_unit_price !== undefined ? Number(d.original_unit_price) : (d.item ? Number(d.item.standard_price || 0) : null);`
     - `const isPriceUpdated = Boolean(d.is_price_updated || (!isNewItem && basePrice !== null && Number(d.unit_price || 0) !== basePrice));`
     - Tambahkan field ke `itemsState` / `data.items`:
       - `item_validation_status`: `isNewItem ? (d.item_validation_status && d.item_validation_status !== 'PENDING' ? d.item_validation_status : (d.item?.source === 'STANDAR' ? 'SAH' : (d.item?.source === 'DITOLAK' ? 'TIDAK_SAH' : 'SAH'))) : null`
         *(atau gunakan `'PENDING'` agar Perencanaan memilih eksplisit sebelum klik **Setujui**, lalu tampilkan alert jika ada item baru/harga berubah yang belum dipilih — pilihan terbaik & paling aman agar tidak keliru adalah menyediakan toggle **`Sah`** vs **`Tidak Sah`** yang jelas terlihat pada setiap baris, misalnya default menunggu pilihan atau pra-pilih yang dapat diganti)*!
         - Rekomendasi paling ramah operator & jelas: Untuk item `BARU`, default ke `'SAH'` bila `quantity_approved > 0` atau sediakan tombol 2-pilihan **`Sah` | `Tidak Sah`**; jika Perencanaan menekan **`Tidak Sah`**, `quantity_approved` baris tersebut langsung berubah ke `0` dan input stepper dinonaktifkan (`disabled`) agar visualnya langsung terkunci sebagai ditolak! Jika menekan **`Sah`**, `quantity_approved` dikembalikan ke `detail.quantity_requested` (atau minimal `1`) dan bisa diatur jumlahnya.
       - `price_validation_status`: jika `isPriceUpdated`, sediakan tombol 2-pilihan **`Sah Harga Baru`** vs **`Tidak Sah (Pakai Harga Awal)`**.
         - Jika memilih **`Tidak Sah (Pakai Harga Awal)`**, hitung preview live subtotal & `totalEstimatedApproved` di modal/halaman menggunakan `basePrice` (harga katalog awal) sehingga **Total Nilai Disetujui** langsung akurat!
   - **Tampilan Badge pada Baris Barang**:
     - Tampilkan badge **`BARU`** (`bg-amber-100 text-amber-800 border-amber-300 font-black uppercase text-[10px]`) di samping nama barang jika `isNewItem`.
     - Tampilkan badge **`HARGA DIPERBARUI`** (`bg-sky-50 text-sky-800 border-sky-200 font-black uppercase text-[10px]`) + teks perbandingan `Awal: ${formatRupiah(basePrice)} → Usulan: ${formatRupiah(unitPrice)}` di kolom Harga Satuan jika `isPriceUpdated`.
     - Kirim `item_validation_status` dan `price_validation_status` pada payload `router.put(...)` / `put(...)`.

2. **Halaman Katalog & Usulan Unit Baru (`resources/js/Pages/Perencanaan/Items/Index.jsx` & `ItemFormModal.jsx`)**:
   - Di `Perencanaan/Items/Index.jsx`:
     - Perbarui hitungan `sourceCounts`:
       `const usulan = items.filter((i) => i.source === 'USULAN_UNIT' || i.price_status === 'PENDING').length;`
     - Perbarui logika filter `matchesSource`:
       - Jika `selectedSource === 'STANDAR'`: `itemSource === 'STANDAR'`.
       - Jika `selectedSource === 'USULAN_UNIT'`: `itemSource === 'USULAN_UNIT' || item.price_status === 'PENDING'`.
     - Pada baris tabel ketika menampilkan tab **Usulan Unit Baru**:
       - Jika `item.source === 'USULAN_UNIT'`: tampilkan badge **`BARU`** + asal unit (`Usulan: {item.origin_unit?.name}`), dan di kolom **Aksi** tampilkan tombol **`Sah`** (`items.verify-standard`) dan tombol **`Tidak Sah`** (`items.reject-standard`).
       - Jika `item.price_status === 'PENDING'`: tampilkan badge **`HARGA DIPERBARUI`** + asal unit (`Update Harga: {item.price_origin_unit?.name || 'Unit'}`), tampilkan perbandingan `Harga Lama (dicoret)` vs `Harga Usulan Baru (${formatRupiah(item.pending_price)})`, dan di kolom **Aksi** tampilkan tombol **`Sah Harga`** (`items.verify-price`) dan tombol **`Tidak Sah`** (`items.reject-price`).
   - Di `Perencanaan/Items/Partials/ItemFormModal.jsx`:
     - Tambahkan informasi pembaruan harga pending jika modal dibuka pada item dengan `item.price_status === 'PENDING'`.

3. **Konsistensi Tampilan Detail (`resources/js/Pages/Shared/RequisitionDetailModal.jsx` & `resources/js/Pages/Divisi/Requisitions/Show.jsx`)**:
   - Di `Divisi/Requisitions/Show.jsx` baris ~303, perbaiki fallback nama barang agar konsisten memakai `detail.item?.name || detail.item_name || detail.manual_item_name` dan satuan `detail.unit_type || detail.item?.unit_type || 'Unit'`.
   - Di `RequisitionDetailModal.jsx` dan `Divisi/Requisitions/Show.jsx`, tampilkan badge **`BARU`** (`detail.is_new_item`) dan **`HARGA DIPERBARUI`** (`detail.is_price_updated`) beserta status validasinya (`Sah` / `Tidak Sah` / `Menunggu`) bila sudah divalidasi Perencanaan.

---

### Tahap 7: Pembaruan & Penambahan Automated Tests (`tests/Feature/`)

> [!WARNING]
> **Perhatian untuk Programmer / AI**: Dua test yang sudah ada di `tests/Feature/RequesterRequisitionTest.php` (baris ~496–531 `test_unit_can_submit_requisition_with_adjusted_item_price_and_updates_master_item` dan baris ~585–648 `test_unit_can_update_requisition_with_price_changes_and_manual_items`) saat ini masih menguji perilaku LAMA yang langsung menimpa `items.standard_price` saat Unit submit! Test tersebut **wajib diperbarui** mengikuti aturan bisnis baru.

1. **Perbarui `tests/Feature/RequesterRequisitionTest.php`**:
   - Ubah 2 test di atas untuk memverifikasi bahwa saat Unit mengubah `unit_price` barang katalog:
     - `items.standard_price` **tetap di harga asli (`75000`)** (tidak langsung tertimpa!).
     - `items.pending_price` tercatat (`85000` / `90000`) dan `items.price_status` bernilai `'PENDING'`.
     - `requisition_details` menyimpan `unit_price`, `original_unit_price` (`75000`), `is_price_updated = true`, dan `price_validation_status = 'PENDING'`.
   - Tambahkan assertion bahwa barang `is_new = true` menyimpan `is_new_item = true` dan `item_validation_status = 'PENDING'` di `requisition_details`.

2. **Tambahkan Test Baru di `tests/Feature/PerencanaanRbaPlanningTest.php` dan `tests/Feature/PerencanaanItemManagementTest.php`**:
   - **Validasi Barang Baru di Perencanaan**:
     - Test Perencanaan menandai item `BARU` sebagai **`SAH`** saat verifikasi pengajuan -> `items.source` berubah dari `'USULAN_UNIT'` ke `'STANDAR'`, `requisition_details.item_validation_status = 'SAH'`, dan `quantity_approved` tersimpan.
     - Test Perencanaan menandai item `BARU` sebagai **`TIDAK_SAH`** -> `items.source` menjadi `'DITOLAK'`, `requisition_details.item_validation_status = 'TIDAK_SAH'`, `quantity_approved = 0`, dan item tersebut tidak lagi muncul di catalog prop pada `Divisi\RequisitionController::index()`.
   - **Validasi Pembaruan Harga di Perencanaan**:
     - Test Perencanaan menandai pembaruan harga sebagai **`SAH`** -> `items.standard_price` diperbarui ke harga usulan baru, `items.price_status = 'NONE'`, `items.pending_price = null`, dan `requisition_details.price_validation_status = 'SAH'`.
     - Test Perencanaan menandai pembaruan harga sebagai **`TIDAK_SAH`** -> `items.standard_price` tetap di harga lama, `items.price_status = 'NONE'`, `requisition_details.unit_price` dikembalikan ke `original_unit_price`, dan `subtotal` / `total_approved` terhitung ulang memakai harga lama.
     - Test validasi via menu **Usulan Unit Baru** (`items.reject-standard`, `items.verify-price`, `items.reject-price`).
   - **Urutan Tabel Verifikasi & Data Prop Filter**:
     - Test `perencanaan.requisitions.index` dengan 3 pengajuan berbeda tanggal (misalnya `2026-01-14` berstatus `Pending_Perencanaan` dan dua pengajuan `2026-03-16` berstatus `Disetujui`/`Pending_Perencanaan`) memastikan data paling atas (`requisitions.0`) adalah pengajuan terbaru `2026-03-16`, serta memastikan prop `units` dikirim ke komponen Inertia.

---

## 5. Checklist QA & Verifikasi Akhir (*Definition of Done*)

Jalankan verifikasi berikut setelah seluruh perubahan selesai:

1. **Migrasi & Build Produksi**:
   ```powershell
   php artisan migrate
   npm run build
   ```
   Pastikan migrasi berjalan bersih tanpa error di MySQL maupun SQLite, dan Vite build berhasil 100%.

2. **Automated Test Suite**:
   ```powershell
   php artisan test
   ```
   Pastikan seluruh test (termasuk test baru) lulus **100% passed** tanpa satu pun error atau assertion yang di-skip.

3. **Uji Manual / Browser Checklist per Skenario**:
   - **Role Unit — Select Katalog & Tombol `X`**: Pilih rekening *Barang Habis Pakai* -> cari & pilih *Alkohol* -> pastikan field **Nama Barang / Uraian** terkunci (`readOnly`), Volume/Satuan/Harga Satuan bisa diubah, dan tombol silang (`X`) membatalkan pilihan serta memungkinkan cari barang lain.
   - **Role Unit — Tombol `+ Barang Baru`**: Klik tombol **`+ Barang Baru`** -> pastikan muncul input manual berlabel **`BARU`** -> isi nama barang baru, volume, satuan, harga -> klik *Tambah ke Daftar Usulan*.
   - **Role Unit — Stepper `+` / `-` di Daftar Usulan**: Masukkan barang dengan volume `500`, lalu ubah di tabel *Daftar Barang yang Diusulkan* menggunakan tombol `-` / `+` maupun ketik langsung menjadi `50`, pastikan `Total Biaya` dan `Total Estimasi Usulan` ikut berubah real-time sebelum dikirim.
   - **Role Unit — Ubah Harga Barang Katalog**: Pilih barang katalog dan ubah harganya, lalu kirim usulan. Pastikan di database `items.standard_price` masih harga lama dan `items.pending_price` berisi harga baru.
   - **Role Perencanaan — Tabel Verifikasi Usulan**:
     - Pastikan pengajuan tanggal terbaru (`16 Maret`) berada di paling atas di atas tanggal lama (`14 Januari`).
     - Uji filter **Tanggal Pengajuan** (`Dari` – `Sampai`) dan filter **Unit Pengusul** bekerja akurat sendiri-sendiri maupun kombinasi dengan Search dan Jenis Belanja.
   - **Role Perencanaan — Validasi `BARU` & `HARGA DIPERBARUI`**:
     - Buka *Telaah* pada pengajuan yang memuat item baru & perubahan harga -> pastikan label **`BARU`** dan **`HARGA DIPERBARUI`** tampil jelas -> uji aksi **`Sah`** dan **`Tidak Sah`**.
     - Buka menu **Katalog & Standar → Usulan Unit Baru** -> pastikan baik item **`BARU`** maupun item **`HARGA DIPERBARUI`** muncul dengan opsi aksi **Sah** dan **Tidak Sah**.
