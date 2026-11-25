# Perencanaan Implementasi: Perbaikan Fungsi & Tata Letak Modal Verifikasi Perencanaan (`Sah` / `Tidak Sah` & `Sah Semua`)

> **Target Pengembang**: Junior Programmer & AI Assistant Model  
> **Repository**: `rsj-req-app` (E-BLUD RS Jiwa Tampan Provinsi Riau)  
> **Status Dokumen**: Siap Diimplementasikan (*Ready for Implementation*)  
> **Branch Kerja**: Lanjutkan di branch `perbaikan_usulan`

---

## 1. Konteks & Diagnosis Masalah dari Hasil Uji UI

Berdasarkan tangkapan layar modal **Verifikasi Usulan Belanja** (`QuickVerificationModal.jsx`) dan laporan uji coba klik tombol, ditemukan **4 masalah** beserta akar penyebabnya di kode saat ini:

### Masalah 1: Tombol `Setujui Semua`, `Sah Harga`, dan `Sah` (Barang Baru) Tidak Berfungsi Saat Diklik, Hanya `Reset (0)` yang Jalan
- **Akar Penyebab (3 Bug Sekaligus)**:
  1. **State Awal Modal Langsung Terisi `'SAH'` & Volume Penuh**:
     Di `QuickVerificationModal.jsx` (lines ~50–70) dan `Show.jsx` (`mapDetailToFormItem`, lines ~76–106), saat modal dibuka pada pengajuan berstatus `Pending_Perencanaan`:
     - `item_validation_status` langsung dipaksa menjadi `'SAH'` (`d.item_validation_status === 'TIDAK_SAH' ? 'TIDAK_SAH' : 'SAH'`) meski di database bernilai `'PENDING'`.
     - `price_validation_status` langsung dipaksa menjadi `'SAH'` meskipun di database bernilai `'PENDING'`.
     - `quantity_approved` langsung terisi penuh (`10`, `20`).
     Akibatnya ketika user pertama kali membuka modal, semua tombol **`Sah Harga`** dan **`Sah`** SUDAH menyala aktif dan semua volume SUDAH terisi penuh — sehingga mengklik `Setujui Semua`, `Sah Harga`, atau `Sah` tidak menimbulkan perubahan visual maupun state apa pun! Sedangkan **`Reset (0)`** mengubah angka menjadi `0` sehingga hanya `Reset (0)` yang terlihat bekerja.
  2. **Logika Salah di `ValidationSegmentedToggle.jsx` (Line ~9)**:
     Komponen memakai `const isSahSelected = value !== 'TIDAK_SAH';`. Akibatnya walaupun state-nya bernilai `'PENDING'`, `null`, atau `undefined`, tombol **`Sah`** selalu menyala hijau aktif (`bg-teal-600 text-white`). Seharusnya:
     - `isSahSelected` hanya bernilai `true` jika `value === 'SAH'`
     - `isTidakSahSelected` hanya bernilai `true` jika `value === 'TIDAK_SAH'`
     - Jika `value === 'PENDING'`, **kedua tombol tampil netral** agar user jelas tahu item tersebut belum divalidasi dan terlihat langsung bereaksi berubah warna saat diklik!
  3. **`handleApproveAll`, `handleResetAll`, & `updatePriceValidation` Tidak Sinkron Penuh**:
     - `handleApproveAll()` hanya mengubah `quantity_approved` & `item_validation_status`, tetapi **lupa** ikut mengesahkan `price_validation_status: isPriceUpdated ? 'SAH' : ...`.
     - `handleResetAll()` hanya me-reset `quantity_approved` menjadi `0`, tidak mereset `item_validation_status` dan `price_validation_status` kembali ke `'PENDING'`.
     - `updatePriceValidation(idx, 'SAH')` tidak memulihkan `quantity_approved` jika sebelumnya `0` (misal setelah `Reset (0)`).

### Masalah 2: Tampilan Modal Sempit, Terpotong Scroll Horizontal & Padding Ringkasan Kurang Rapi
- **Lokasi**: `QuickVerificationModal.jsx` (dan konsistensi halaman `Perencanaan/Requisitions/Show.jsx`).
- **Kondisi Saat Ini pada Screenshot**:
  1. Modal memakai `maxWidth="4xl"` (`QuickVerificationModal.jsx` line ~276), terlalu sempit untuk tabel 7–8 kolom sehingga muncul **scrollbar horizontal** dan kolom paling kanan (`SUBTOTAL DISETUJUI` terpotong jadi `SU... DI...` dan nominalnya jadi `Rp ...`).
  2. Footer ringkasan tabel bawah (`Total Volume Disetujui` & `Total Nilai Disetujui`, lines ~528–541) tidak memiliki padding horizontal (`px-6 py-4 bg-slate-50/70`) sehingga menempel rapat ke tepi kiri-kanan card.
  3. Informasi penting pengajuan di Section 1 (seperti **Tanggal Pengajuan** dan **Nomor Nota Dinas**) belum ditampilkan.

### Masalah 3: Posisi Button `Sah / Tidak Sah` pada Barang Baru Berada di Bawah Nama Barang, Tidak Sejajar dengan `Sah Harga`
- **Kondisi Saat Ini pada Screenshot**:
  - Pada Baris 1 (`ABBOCATH NO 20 Terumo`, `HARGA DIPERBARUI`), tombol `[✓ Sah Harga | × Tidak Sah]` berada di area tengah-kanan (kolom Harga Satuan).
  - Pada Baris 2 (`PARAMAX DEWASA`, `BARU`), tombol `Validasi Barang: [✓ Sah | × Tidak Sah]` terselip di bawah nama barang pada kolom `NAMA BARANG & SPESIFIKASI`.
- **Perbaikan**:
  - Dengan melebarkan modal menjadi **`maxWidth="6xl"`**, tambahkan **1 kolom khusus `VALIDASI`** tepat di sebelah kanan kolom `HARGA SATUAN` (sebelum kolom `DIMINTA`).
  - Seluruh kontrol validasi (`[✓ Sah | × Tidak Sah]` untuk barang `BARU` maupun `[✓ Sah Harga | × Tidak Sah]` untuk `HARGA DIPERBARUI`, serta badge statis `Standar RS` untuk item biasa) ditempatkan **pada kolom `VALIDASI` yang sama dan sejajar vertikal ke kanan dari kolom Nama/Harga**.

### Masalah 4: Ganti Kata `"Setuju"` / `"Setujui"` Menjadi `"Sah"` / `"Disahkan"` pada Verifikasi Perencanaan
- **Aturan Penting (*Database & Test Compatibility*)**:
  - **JANGAN ubah** value enum database `'Disetujui'` pada kolom `requisitions.status` maupun validasi API `status => 'in:Disetujui,Ditolak'` di `Perencanaan\RequisitionController` agar seluruh tabel RBA, relasi, dan 212 PHPUnit test tetap berjalan 100%.
  - **UBAH seluruh kata/label UI bertuliskan `Setuju` / `Setujui` / `Disetujui`** pada alur validasi di `QuickVerificationModal.jsx` dan `Perencanaan/Requisitions/Show.jsx` (serta pesan toast/alert/heading terkait):
    - `Setujui Semua` &rarr; **`Sah Semua`**
    - Header kolom `Disetujui *` &rarr; **`Disahkan *`**
    - Header kolom `Subtotal Disetujui` &rarr; **`Subtotal Disahkan`**
    - Ringkasan `Total Volume Disetujui:` &rarr; **`Total Volume Disahkan:`**
    - Ringkasan `Total Nilai Disetujui:` &rarr; **`Total Nilai Disahkan:`**
    - Tombol aksi utama `Setujui & Sahkan Pengajuan (ACC Final)` &rarr; **`Sah & Sahkan Pengajuan (ACC Final)`** *(atau **`Sahkan Pengajuan (ACC Final)`**)*
    - Teks peringatan SSH / catatan persetujuan: `...Wajib mengisi Catatan Pengesahan` / `Catatan Pengesahan`, toast sukses: `Usulan belanja berhasil disahkan (ACC Final)`.

---

## 2. Daftar File yang Harus Dimodifikasi

| No | File Target | Ringkasan Perubahan |
|---|---|---|
| 1 | `resources/js/Components/ValidationSegmentedToggle.jsx` | Perbaiki highlight agar hanya `value === 'SAH'` yang menyala Teal dan `value === 'TIDAK_SAH'` yang menyala Rose; bila `'PENDING'`, kedua tombol tampil netral sehingga klik `Sah` / `Sah Harga` langsung bereaksi secara visual. |
| 2 | `resources/js/Pages/Perencanaan/Requisitions/Partials/QuickVerificationModal.jsx` | Inisialisasi state `'PENDING'` dari DB (bukan dipaksa `'SAH'`); perbaiki `handleApproveAll` (`Sah Semua`), `handleResetAll`, `updateItemValidation`, & `updatePriceValidation` + validasi sebelum submit final; lebarkan modal ke `maxWidth="6xl"`; pindahkan semua tombol `Sah / Tidak Sah` & `Sah Harga / Tidak Sah` ke kolom `VALIDASI` yang sejajar di sebelah kanan `HARGA SATUAN`; rapikan Section 1 & footer summary bar (`px-6 py-4`); ubah label `Setuju`/`Setujui` ke `Sah`/`Disahkan`. |
| 3 | `resources/js/Pages/Perencanaan/Requisitions/Show.jsx` | Terapkan logika `'PENDING'` yang sama, perbaiki `handleApproveAll` (`Sah Semua`), `handleResetAll`, validasi sebelum submit, perlebar kontainer (`max-w-6xl`), sejajarkan kolom `VALIDASI` untuk barang `BARU` dan `HARGA DIPERBARUI`, serta ubah label `Setuju`/`Setujui` ke `Sah`/`Disahkan`. |

---

## 3. Tahapan Implementasi Terperinci (*Step-by-Step Guide*)

### Tahap 1: Perbaiki `resources/js/Components/ValidationSegmentedToggle.jsx`

1. Buka `resources/js/Components/ValidationSegmentedToggle.jsx`.
2. Ganti logika penentuan tombol aktif:
   ```jsx
   export default function ValidationSegmentedToggle({
       value,
       onChange,
       sahLabel = 'Sah',
       tidakSahLabel = 'Tidak Sah',
   }) {
       const isSahSelected = value === 'SAH';
       const isTidakSahSelected = value === 'TIDAK_SAH';

       return (
           <div className="inline-flex items-center rounded-xl border border-slate-200 bg-slate-100/90 p-0.5 gap-0.5 shadow-2xs">
               <button
                   type="button"
                   onClick={() => onChange('SAH')}
                   className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold transition cursor-pointer whitespace-nowrap ${
                       isSahSelected
                           ? 'bg-teal-600 text-white shadow-2xs'
                           : 'text-slate-600 hover:bg-white hover:text-teal-700'
                   }`}
               >
                   <svg className="h-3 w-3 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                   </svg>
                   <span>{sahLabel}</span>
               </button>
               <button
                   type="button"
                   onClick={() => onChange('TIDAK_SAH')}
                   className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold transition cursor-pointer whitespace-nowrap ${
                       isTidakSahSelected
                           ? 'bg-rose-600 text-white shadow-2xs'
                           : 'text-slate-600 hover:bg-white hover:text-rose-700'
                   }`}
               >
                   <svg className="h-3 w-3 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                   </svg>
                   <span>{tidakSahLabel}</span>
               </button>
           </div>
       );
   }
   ```
   > **Hasil**: Saat `value === 'PENDING'`, kedua tombol tampil bersih netral (belum terpilih). Saat user mengklik **`Sah`** / **`Sah Harga`**, tombol langsung menyala Teal.

---

### Tahap 2: Perbaiki Logika State & Interaksi Tombol pada `QuickVerificationModal.jsx` dan `Show.jsx`

Terapkan aturan yang identik pada `QuickVerificationModal.jsx` dan `Perencanaan/Requisitions/Show.jsx`:

1. **Inisialisasi State Item saat Modal/Halaman Dibuka**:
   ```jsx
   const itemValidation = isNewItem
       ? (d.item_validation_status === 'SAH' || d.item?.source === 'STANDAR'
           ? 'SAH'
           : (d.item_validation_status === 'TIDAK_SAH' || d.item?.source === 'DITOLAK'
               ? 'TIDAK_SAH'
               : 'PENDING'))
       : null;

   const priceValidation = isPriceUpdated
       ? (d.price_validation_status === 'SAH'
           ? 'SAH'
           : (d.price_validation_status === 'TIDAK_SAH'
               ? 'TIDAK_SAH'
               : 'PENDING'))
       : null;
   ```
   - Catatan: Dengan inisialisasi `'PENDING'` saat item belum divalidasi di database, **user langsung melihat bahwa `Sah Harga` dan `Sah` perlu dikonfirmasi/diklik**, serta langsung merasakan respon perubahan warna & status saat diklik!

2. **Perbaiki Handler `updateItemValidation`, `updatePriceValidation`, `handleApproveAll` (`Sah Semua`), & `handleResetAll`**:
   - **`updateItemValidation(idx, nextValidation, requestedQty)`**:
     - Set `item_validation_status: nextValidation`.
     - Jika `nextValidation === 'TIDAK_SAH'`, set `quantity_approved: 0`.
     - Jika `nextValidation === 'SAH'`, pastikan `quantity_approved` minimal `Number(requestedQty || 1)` apabila sebelumnya bernilai `0`!
   - **`updatePriceValidation(idx, nextValidation, requestedQty)`**:
     - Set `price_validation_status: nextValidation`.
     - Jika `nextValidation === 'SAH'` dan `quantity_approved === 0` (misal setelah `Reset (0)`), kembalikan `quantity_approved` ke `Number(requestedQty || 1)`!
   - **`handleApproveAll()` (`Sah Semua`)**:
     ```jsx
     const handleApproveAll = () => {
         setItemsState((prev) =>
             details.map((d, idx) => {
                 const { isNewItem, isPriceUpdated } = getDetailFlags(d);
                 return {
                     ...prev[idx],
                     id: d.id,
                     item_validation_status: isNewItem ? 'SAH' : null,
                     price_validation_status: isPriceUpdated ? 'SAH' : null,
                     quantity_approved: Number(d.quantity_requested || 0),
                 };
             })
         );
     };
     ```
   - **`handleResetAll()` (`Reset (0)`)**:
     ```jsx
     const handleResetAll = () => {
         setItemsState((prev) =>
             details.map((d, idx) => {
                 const { isNewItem, isPriceUpdated } = getDetailFlags(d);
                 return {
                     ...prev[idx],
                     id: d.id,
                     item_validation_status: isNewItem ? 'PENDING' : null,
                     price_validation_status: isPriceUpdated ? 'PENDING' : null,
                     quantity_approved: 0,
                 };
             })
         );
     };
     ```
   *(Lakukan pola persis sama menggunakan `setData('items', ...)` pada `Show.jsx`)*.

3. **Tambahkan Penjaga Validasi Sebelum Submit Pengesahan (`handleSubmitApprove` / `handleApprove`)**:
   - Cek apakah masih ada item yang `quantity_approved > 0` namun statusnya masih `'PENDING'` (baik `item_validation_status === 'PENDING'` maupun `price_validation_status === 'PENDING'`):
     ```jsx
     const hasUnvalidatedPending = itemsState.some((it) => {
         if (Number(it.quantity_approved || 0) <= 0) return false;
         return it.item_validation_status === 'PENDING' || it.price_validation_status === 'PENDING';
     });
     if (hasUnvalidatedPending) {
         Swal.fire({
             icon: 'warning',
             title: 'Validasi Belum Lengkap',
             text: 'Masih ada barang baru atau pembaruan harga yang belum dipilih Sah / Tidak Sah. Pilih per baris atau klik tombol "Sah Semua".',
         });
         return;
     }
     ```
   - Pertahankan pengecekan `isAnyItemExceedingSSH` seperti semula, dan perbarui teks pesan warning menjadi: *"Terdapat usulan dengan harga melebihi Standar Satuan Harga (SSH). Mohon isi Catatan Pengesahan."*

---

### Tahap 3: Rapikan Tampilan Modal, Kolom `VALIDASI` Sejajar, dan Ganti Kata `"Setuju"` ke `"Sah"`

1. **Perlebar Kontainer Modal & Halaman**:
   - Di `QuickVerificationModal.jsx`: ubah `<Modal show={show} onClose={onClose} maxWidth="4xl">` menjadi **`maxWidth="6xl"`**.
   - Di `Perencanaan/Requisitions/Show.jsx`: ubah `max-w-5xl` menjadi **`max-w-6xl`**.

2. **Rapikan Section 1 (`Identitas Dokumen Pengajuan`) di `QuickVerificationModal.jsx`**:
   - Ubah grid menjadi 4 item ringkas (`grid gap-4 sm:grid-cols-2 lg:grid-cols-4`):
     1. **Pos Rekening Belanja RBA**: `[{code}] {name}`
     2. **Unit & Bidang Pengusul**: `{unitName}` (subtext bidang jika ada)
     3. **Tanggal & No. Nota Dinas**: tanggal pengajuan diformat rapi + `Nota: {nomor_surat_unit || '-'}`
     4. **Sub Kegiatan RS**: `{sub_kegiatan}`
   - Catatan urgensi di baris penuh bawah (`sm:col-span-2 lg:col-span-4`) dengan box lembut `rounded-xl bg-slate-50 border border-slate-200/80 px-3.5 py-2.5` jika ada catatan.

3. **Sejajarkan Tombol `Sah / Tidak Sah` Barang Baru & `Sah Harga / Tidak Sah` dalam Kolom Khusus `VALIDASI`**:
   Ubah struktur `<thead>` dan `<tbody>` tabel rincian pada `QuickVerificationModal.jsx` & `Show.jsx` menjadi **8 kolom presisi tanpa horizontal overflow**:
   - `NO` (`w-10 text-center`)
   - `NAMA BARANG & SPESIFIKASI` (`min-w-[180px] text-left` — **HANYA** berisi kode item, nama barang, badge `BARU` / `HARGA DIPERBARUI`, dan spesifikasi singkat; **tidak ada lagi tombol di bawah nama barang!**)
   - `SATUAN` (`w-20 text-center`)
   - `HARGA SATUAN` (`w-36 text-right` — harga efektif, ditambah keterangan `Awal -> Usulan` bila `HARGA DIPERBARUI`, atau `SSH: ...`)
   - **`VALIDASI USULAN`** (`w-44 text-center whitespace-nowrap` — di sini tombol `Sah / Tidak Sah` untuk barang `BARU` **dan** `Sah Harga / Tidak Sah` untuk `HARGA DIPERBARUI` tampil sejajar persis pada baris yang sama!)
     - Jika `isNewItem`: tampilkan `ValidationSegmentedToggle` (`sahLabel="Sah"`) + caption status kecil (`Belum divalidasi` / `Disahkan ke Standar RS` / `Ditolak (Tidak Sah)`).
     - Else jika `isPriceUpdated`: tampilkan `ValidationSegmentedToggle` (`sahLabel="Sah Harga"`) + caption status kecil (`Belum divalidasi` / `Harga baru disahkan` / `Pakai harga awal`).
     - Else (item standar normal): tampilkan badge bersih `✓ Standar RS`.
     - *(Jika `isNewItem && isPriceUpdated` tidak mungkin terjadi bersamaan karena item baru belum punya harga lama, kondisi `if / else if / else` sudah saling eksklusif!).*
   - `DIMINTA` (`w-20 text-center`)
   - `DISAHKAN *` (`w-36 text-center bg-teal-50/70 text-teal-950 border-x border-teal-200`)
   - `SUBTOTAL DISAHKAN` (`w-32 text-right`)

4. **Rapikan Footer Ringkasan Card Section 2 di `QuickVerificationModal.jsx`**:
   Berikan class padding penuh agar rapi dan tidak menempel ke border card:
   ```jsx
   <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 px-6 py-4 bg-slate-50/70 border-t border-slate-200">
       <span className="text-xs text-slate-600">
           Total Volume Disahkan: <strong className="text-slate-900 font-bold">{totalApprovedQty} Unit</strong>{' '}
           <span className="text-slate-400">(dari {totalRequestedQty} diminta)</span>
       </span>
       <div className="flex items-center gap-2 self-end sm:self-auto">
           <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
               Total Nilai Disahkan:
           </span>
           <span className="text-sm sm:text-base font-bold text-teal-800 font-mono bg-teal-50 px-3 py-1 rounded-lg border border-teal-200">
               {formatRupiah(totalEstimatedApproved)}
           </span>
       </div>
   </div>
   ```

5. **Ganti Seluruh Label Tombol `"Setuju"` / `"Setujui"` Menjadi `"Sah"` pada `QuickVerificationModal.jsx` & `Show.jsx`**:
   - Tombol header Section 2: `Setujui Semua` &rarr; **`Sah Semua`** (title: `"Sahkan seluruh kuantitas dan usulan barang/harga sesuai permintaan unit"`).
   - Kolom tabel & ringkasan: `Disetujui *` &rarr; **`Disahkan *`**, `Subtotal Disetujui` &rarr; **`Subtotal Disahkan`**, `Total Volume Disetujui` &rarr; **`Total Volume Disahkan`**, `Total Nilai Disetujui` &rarr; **`Total Nilai Disahkan`**.
   - Tombol submit utama di footer modal & halaman Show:
     `Setujui & Sahkan Pengajuan (ACC Final)` &rarr; **`Sahkan Pengajuan (ACC Final)`**.
   - Teks catatan & toast:
     - Label SSH warning & catatan: `Catatan Pengesahan` / `Catatan / Rekomendasi Tim Perencanaan (* Wajib untuk penyesuaian SSH)`.
     - Toast sukses submit: `'Usulan belanja berhasil disahkan (ACC Final)'`.

---

## 4. Checklist QA & Verifikasi Akhir

1. Jalankan build & test suite penuh:
   ```powershell
   npm run build
   php artisan test
   ```
   Pastikan Vite build sukses tanpa error dan **seluruh PHPUnit test lulus 100% passed**.
2. Uji langsung modal **Verifikasi Usulan Belanja** (`QuickVerificationModal.jsx`) dan halaman detail (`Show.jsx`) di browser:
   - Buka modal pada pengajuan baru (`Pending_Perencanaan`) yang memuat barang `BARU` dan barang `HARGA DIPERBARUI`.
   - Pastikan kedua pill `Sah / Tidak Sah` dan `Sah Harga / Tidak Sah` pada awal dibuka tampil netral (belum menyala sebelum diklik), berada pada **kolom `VALIDASI USULAN` yang sejajar lurus** (tidak lagi di bawah nama barang!).
   - Klik **`✓ Sah Harga`**, klik **`✓ Sah`** pada barang baru, lalu uji **`Reset (0)`** dan klik **`✓ Sah Semua`** — pastikan semuanya merespons langsung secara visual (warna pill aktif Teal & angka volume + total nilai langsung ter-update).
   - Pastikan **tidak ada horizontal scrollbar** yang memotong kolom kanan (`SUBTOTAL DISAHKAN`), dan footer ringkasan `Total Volume Disahkan` / `Total Nilai Disahkan` memiliki padding rapi.
   - Pastikan tidak ada tombol bertuliskan *"Setujui"* tersisa di modal maupun halaman verifikasi (semua memakai **`Sah`** / **`Disahkan`** / **`Sahkan Pengajuan (ACC Final)`**).
