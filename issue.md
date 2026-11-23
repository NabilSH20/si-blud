# [ISSUE / PLANNING] Penyelarasan Desain UI/UX Super Admin & Pemisahan Fitur Mandiri Tahun Anggaran

**Tipe**: Refactoring / UI/UX Modernization / Navigation Architecture  
**Prioritas**: Tinggi (*High*)  
**Status**: Ready for Implementation  
**Label**: `ui-ux`, `super-admin`, `design-system`, `tailwind`, `sidebar-navigation`, `fiscal-years`  
**Target Pelaksana**: Junior Programmer & AI Model  
*(Dokumen ini berisi spesifikasi teknis dan tahapan implementasi terperinci untuk menyelaraskan antarmuka pengguna Super Admin dengan Design System E-BLUD serta memisahkan manajemen tahun anggaran menjadi modul mandiri tanpa tautan ke halaman admin biasa).*

---

## 1. Latar Belakang & Analisis Masalah

Implementasi fungsional role Super Admin dan 6 pilar pendukungnya telah berhasil dibuat. Namun, berdasarkan evaluasi antarmuka dan interaksi pengguna, terdapat dua permasalahan mendasar yang perlu diperbaiki:

### 1.1 Masalah 1: Inkonsistensi Visual UI/UX, Tipografi, Button, dan Elemen Antarmuka
Halaman-halaman Super Admin yang ada saat ini (`Dashboard`, `Users`, `AuditLogs`, `Settings`, `Monitoring`) terasa berantakan dan tidak serasi dengan bahasa desain (*Design Language*) yang telah matang pada halaman role lain (`Admin`, `Perencanaan`, `Keuangan`, `Divisi`).
- **Tipografi & Hirarki**: Ukuran font, ketebalan (*font weight*), dan jarak (*line-height*) antar-elemen teks tidak seimbang, membuat keterbacaan data angka anggaran berkurang.
- **Komponen Button & Kontrol**: Bentuk tombol, padding, ukuran ikon, dan efek interaksi (*hover / active scale*) berbeda-beda dan belum mengikuti standar button kit aplikasi.
- **Tabel & Kartu Kontainer**: Card pembungkus data, warna header tabel, padding sel, serta badge status belum serasi dengan gaya minimalis-elegan aplikasi E-BLUD RSJ Tampan.
- **PENTING**: Prinsip perbaikan UI ini **BUKAN** meng-copy-paste mentah halaman role lain, melainkan menerapkan token desain (*Design Tokens*), layout rhythm, palet warna berkarakter (*Deep Indigo / Slate Neutral*), dan komponen standar agar terasa sebagai satu kesatuan sistem yang harmonis dan profesional.

### 1.2 Masalah 2: Kebocoran Navigasi & Ketergantungan ke Halaman Admin Biasa pada Sidebar
Pada navigasi sidebar `SuperAdminLayout.jsx`, masih terdapat elemen yang tidak tepat:
1. **Link "Portal Administrator Biasa"**: Tautan ini menuju `/admin/dashboard`. Super Admin adalah pengawas tertinggi (*Root Master*), sehingga jalan pintas untuk melompat ke dashboard admin operasional biasa ini membingungkan batasan wewenang dan harus **dihapus**.
2. **"Tahun Anggaran & Tutup Buku" masih mengarah ke halaman Admin**: Saat ini link tersebut mengarah ke `/admin/fiscal-years`. Seharusnya Super Admin memiliki halaman dan controller manajemen Tahun Anggaran sendiri (`/super-admin/fiscal-years`), dengan antarmuka elegan khusus Super Admin yang memiliki kendali penuh:
   - Pengalihan Tahun Anggaran Aktif.
   - Kunci / Tutup Buku Anggaran (*Lock/Unlock Toggle*) dengan perekaman jejak audit darurat.
   - Penetapan Tahun Default.
   - Pembuatan dan pengeditan tahun anggaran baru.

---

## 2. Arsitektur Perubahan

```mermaid
flowchart TD
    subgraph S1["Sidebar Navigasi SuperAdminLayout.jsx"]
        direction TB
        M1["Dashboard Global (/super-admin/dashboard)"]
        M2["Manajemen Akun Root (/super-admin/users)"]
        M3["Monitoring RBA (/super-admin/monitoring/rba)"]
        M4["Monitoring Usulan (/super-admin/monitoring/requisitions)"]
        M5["Monitoring Keuangan (/super-admin/monitoring/finance)"]
        M6["System Audit Log (/super-admin/audit-logs)"]
        M7["Pengaturan Cetak (/super-admin/settings)"]
        M8["Tahun Anggaran & Tutup Buku (/super-admin/fiscal-years)"]
        
        DEL["HAPUS: Portal Admin Biasa (/admin/dashboard)"] -.->|Dihapus Total| S1
    end

    subgraph S2["Modul Baru: Dedicated Fiscal Years Super Admin"]
        M8 --> C1["SuperAdmin/FiscalYearController.php"]
        C1 --> V1["SuperAdmin/FiscalYears/Index.jsx"]
        V1 --> A1["Modal Tambah/Edit Tahun Anggaran"]
        V1 --> A2["Kontrol Kunci / Tutup Buku (Lock Toggle)"]
        V1 --> A3["Penetapan Default & Status Aktif"]
    end

    subgraph S3["Harmonisasi UI Design System"]
        T1["Typography: Barlow / Poppins / Mono IDR"]
        T2["Button System: Primary, Secondary, Danger, Icon Pill"]
        T3["Card & Tables: rounded-2xl, border-slate-200, bg-slate-50 thead"]
        T4["Status Badges: Dot Indicator + Soft Tint Pill"]
    end
```

---

## 3. Standar Design System E-BLUD RS Jiwa Tampan

Junior Programmer atau AI Model wajib mengacu pada panduan visual berikut untuk menata ulang seluruh halaman Super Admin:

### 3.1 Tipografi & Hirarki Teks
| Elemen | Kelas Tailwind | Keterangan |
| :--- | :--- | :--- |
| **Header Judul Halaman** | `text-xl sm:text-2xl font-bold tracking-tight text-slate-900` | Judul utama di atas halaman |
| **Subjudul / Deskripsi** | `text-xs sm:text-sm font-medium text-slate-500 mt-0.5` | Penjelasan ringkas fungsi halaman |
| **Section Title di Card**| `text-sm sm:text-base font-bold text-slate-900` | Header pada kontainer card |
| **Label Form Input** | `block text-xs font-bold text-slate-700 mb-1.5` | Di atas kolom input form |
| **Teks Angka Moneter** | `font-mono font-bold text-slate-900` | Format Rupiah `Intl.NumberFormat` |
| **Header Kolom Tabel** | `px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-700` | Bagian `thead` tabel |
| **Isi Baris Tabel** | `px-4 py-3.5 text-xs text-slate-600` | Baris data `tbody` |

### 3.2 Gaya Tombol (*Button System*)
1. **Primary Action Button (Tambah Data / Simpan / Aksi Utama)**:
   ```jsx
   <button
       type="button"
       className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 px-4 py-2 text-xs font-bold text-white shadow-2xs transition cursor-pointer"
   >
       <Plus className="h-4 w-4" />
       Tambah Pengguna
   </button>
   ```
2. **Secondary / Outline Button (Filter, Reset, Batal, Kembali)**:
   ```jsx
   <button
       type="button"
       className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 active:scale-95 px-3.5 py-2 text-xs font-bold text-slate-700 shadow-2xs transition cursor-pointer"
   >
       <Filter className="h-3.5 w-3.5" />
       Reset Filter
   </button>
   ```
3. **Table Row Action Buttons (Edit / Aksi Cepat / Detail)**:
   - **Edit / Warning Action**:
     `className="inline-flex items-center gap-1 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 active:scale-95 px-2.5 py-1 text-xs font-bold transition cursor-pointer"`
   - **Inspect / Detail Action**:
     `className="inline-flex items-center gap-1 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 active:scale-95 px-2.5 py-1 text-xs font-bold transition cursor-pointer"`
   - **Danger / Hapus Action**:
     `className="inline-flex items-center gap-1 rounded-xl border border-transparent hover:border-rose-300 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-700 active:scale-95 px-2 py-1 text-xs font-bold transition cursor-pointer"`

### 3.3 Status Badges (*Pill with Dot Indicator*)
Gunakan struktur seragam dengan indikator titik bulat:
```jsx
<span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold border ${badgeConfig.bg}`}>
    <span className={`h-1.5 w-1.5 rounded-full ${badgeConfig.dot}`} />
    {badgeConfig.label}
</span>
```
- **Aktif / Selesai (Emerald)**: `bg-emerald-50 text-emerald-800 border-emerald-200`, dot `bg-emerald-500`
- **Terkunci / Warning (Amber)**: `bg-amber-50 text-amber-800 border-amber-200`, dot `bg-amber-500`
- **Tolak / Nonaktif (Rose)**: `bg-rose-50 text-rose-700 border-rose-200`, dot `bg-rose-500`
- **Info / Diproses (Blue/Indigo)**: `bg-indigo-50 text-indigo-800 border-indigo-200`, dot `bg-indigo-500`

### 3.4 Card & Container Standard
- Kontainer Utama: `bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden`
- Toolbar Pencarian & Filter: Wadah tersendiri dengan padding `p-4 sm:p-5`, input ber-radius `rounded-xl border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-xs`.
- Table Wrapper: `overflow-x-auto`, `thead` warna `bg-slate-50 border-b border-slate-200 text-slate-700`, `tbody divide-y divide-slate-100`.

---

## 4. Rincian Perubahan Teknis & File Terdampak

### 4.1 Modul Baru: Tahun Anggaran Mandiri Super Admin
Super Admin membutuhkan pengelolaan tahun anggaran yang berdiri sendiri di dalam namespace `SuperAdmin`:
- **Controller**: Buat [app/Http/Controllers/SuperAdmin/FiscalYearController.php](file:///d:/Kampus/Nabil_2SIB/laragon-6.0-minimal/www/rsj-req-app/app/Http/Controllers/SuperAdmin/FiscalYearController.php)
  - Method: `index()`, `store()`, `update()`, `destroy()`, `toggleStatus()`, `setDefault()`, `toggleLock()`.
  - Merekam setiap aksi perubahan ke `AuditLogService` (`MODULE: FISCAL_YEAR`).
- **View**: Buat [resources/js/Pages/SuperAdmin/FiscalYears/Index.jsx](file:///d:/Kampus/Nabil_2SIB/laragon-6.0-minimal/www/rsj-req-app/resources/js/Pages/SuperAdmin/FiscalYears/Index.jsx)
  - Berisi tabel daftar tahun anggaran, badge status (Aktif, Default, Terkunci/Tutup Buku).
  - Tombol aksi: Tutup Buku / Buka Kunci (dengan modal alasan jika diperlukan), Jadikan Default, Ubah Status, Edit, Hapus.
  - Modal form tambah/edit tahun anggaran mandiri (`FiscalYearModal.jsx` atau inline).
- **Routes**: Daftarkan di [routes/web.php](file:///d:/Kampus/Nabil_2SIB/laragon-6.0-minimal/www/rsj-req-app/routes/web.php) di dalam grup `Route::prefix('super-admin')->name('superadmin.')`:
  ```php
  Route::patch('/fiscal-years/{fiscal_year}/toggle-lock', [SuperAdminFiscalYearController::class, 'toggleLock'])->name('fiscal-years.toggle-lock');
  Route::patch('/fiscal-years/{fiscal_year}/toggle-status', [SuperAdminFiscalYearController::class, 'toggleStatus'])->name('fiscal-years.toggle-status');
  Route::patch('/fiscal-years/{fiscal_year}/set-default', [SuperAdminFiscalYearController::class, 'setDefault'])->name('fiscal-years.set-default');
  Route::resource('fiscal-years', SuperAdminFiscalYearController::class)->except(['create', 'show', 'edit']);
  ```

### 4.2 Pembaruan Navigasi Sidebar `SuperAdminLayout.jsx`
Di dalam [resources/js/Layouts/SuperAdminLayout.jsx](file:///d:/Kampus/Nabil_2SIB/laragon-6.0-minimal/www/rsj-req-app/resources/js/Layouts/SuperAdminLayout.jsx):
1. **Hapus Item**: Hapus entri `{ name: 'Portal Administrator Biasa', href: route('admin.dashboard'), ... }`.
2. **Perbarui Item Tahun Anggaran**:
   - Ganti `href: route('fiscal-years.index')` menjadi `href: route('superadmin.fiscal-years.index')`.
   - Ganti `routeName: 'fiscal-years.*'` menjadi `routeName: 'superadmin.fiscal-years.*'`.
3. **Penyelarasan Desain Sidebar**:
   - Samakan ritme padding, border, drop-shadow, dan ukuran ikon sidebar dengan layout standar aplikasi.

### 4.3 Refactor Halaman-Halaman Super Admin
1. **[resources/js/Pages/SuperAdmin/Dashboard.jsx](file:///d:/Kampus/Nabil_2SIB/laragon-6.0-minimal/www/rsj-req-app/resources/js/Pages/SuperAdmin/Dashboard.jsx)**:
   - Bersihkan penataan kartu KPI eksekutif (RBA, Usulan, Keuangan, User).
   - Samakan font heading, ukuran badge persentase, dan border card.
   - Rapikan tabel feed 10 aktivitas log terbaru agar selaras dengan tabel master.
2. **[resources/js/Pages/SuperAdmin/Users/Index.jsx](file:///d:/Kampus/Nabil_2SIB/laragon-6.0-minimal/www/rsj-req-app/resources/js/Pages/SuperAdmin/Users/Index.jsx)**:
   - Tata ulang toolbar pencarian dan filter peran/status agar sejajar rapi.
   - Standarisasi tabel pengguna (kolom NIP, Nama, Divisi/Unit, Peran, Status, Aksi).
   - Rapikan modal Reset Password Darurat dan modal Tambah/Edit User agar proporsional dan tidak berantakan.
3. **[resources/js/Pages/SuperAdmin/AuditLogs/Index.jsx](file:///d:/Kampus/Nabil_2SIB/laragon-6.0-minimal/www/rsj-req-app/resources/js/Pages/SuperAdmin/AuditLogs/Index.jsx)**:
   - Rapikan filter dropdown modul dan aksi.
   - Sempurnakan tampilan tabel audit log dan perbaiki modal *JSON Payload Inspector* agar rapi dan mudah dibaca oleh teknisi IT.
4. **[resources/js/Pages/SuperAdmin/Settings/Index.jsx](file:///d:/Kampus/Nabil_2SIB/laragon-6.0-minimal/www/rsj-req-app/resources/js/Pages/SuperAdmin/Settings/Index.jsx)**:
   - Tata ulang form pengaturan kop surat, logo, dan pejabat penandatangan dengan pengelompokan card (*section card*) yang rapi, label teks yang tegas, dan tombol simpan yang konsisten.
5. **[resources/js/Pages/SuperAdmin/Monitoring/](file:///d:/Kampus/Nabil_2SIB/laragon-6.0-minimal/www/rsj-req-app/resources/js/Pages/SuperAdmin/Monitoring/) (`Rba.jsx`, `Requisitions.jsx`, `Finance.jsx`)**:
   - Selaraskan tab navigasi, kartu ringkasan, kolom tabel, dan badge read-only pengawas.

---

## 5. Tahapan Implementasi Langkah Demi Langkah (Step-by-Step)

Junior programmer atau AI model diharapkan mengikuti urutan langkah ini secara berurutan:

### Tahap 1: Backend Controller & Routing Tahun Anggaran Super Admin
1. Buat controller `app/Http/Controllers/SuperAdmin/FiscalYearController.php`.
2. Implementasikan method `index()`, `store()`, `update()`, `destroy()`, `toggleStatus()`, `setDefault()`, `toggleLock()`.
3. Daftarkan rute-rute tersebut pada `routes/web.php` di dalam grup `Route::prefix('super-admin')->name('superadmin.')`.
4. Pastikan middleware `auth` dan `role:super_admin` melindungi controller ini.
5. Jalankan `php artisan route:list --path=super-admin/fiscal-years` untuk memastikan rute terdaftar dengan benar.

### Tahap 2: Pembersihan & Perbaikan Sidebar `SuperAdminLayout.jsx`
1. Buka `resources/js/Layouts/SuperAdminLayout.jsx`.
2. Hapus entri item `Portal Administrator Biasa` dari `menuGroups`.
3. Ubah rute menu `Tahun Anggaran & Tutup Buku` mengarah ke `route('superadmin.fiscal-years.index')` dengan `routeName: 'superadmin.fiscal-years.*'`.
4. Periksa styling font dan warna sidebar agar selaras dengan `AdminLayout.jsx`, namun tetap mempertahankan aksen khas Super Admin (*Indigo / Dark Slate*).

### Tahap 3: Pembuatan Halaman Mandiri `SuperAdmin/FiscalYears/Index.jsx`
1. Buat berkas `resources/js/Pages/SuperAdmin/FiscalYears/Index.jsx`.
2. Gunakan pembungkus `<SuperAdminLayout>`.
3. Tampilkan kartu metrik tahun anggaran (Tahun Aktif, Tahun Terkunci, Total Tahun Terdaftar).
4. Buat tabel daftar tahun anggaran dengan kolom:
   - Tahun & Keterangan
   - Status Aktif (Badge + Toggle)
   - Status Tutup Buku / Terkunci (`is_locked` Badge + Toggle Kunci)
   - Status Default (Badge bintang / label default)
   - Aksi (Edit, Jadikan Default, Hapus)
5. Sediakan modal Tambah / Edit Tahun Anggaran yang rapi dengan validasi form Inertia.

### Tahap 4: Penataan Ulang UI Halaman Dashboard Global
1. Buka `resources/js/Pages/SuperAdmin/Dashboard.jsx`.
2. Susun ulang kartu metrik eksekutif menjadi grid 4 kolom responsif yang proporsional.
3. Gunakan tipografi standar (`text-xs font-bold text-slate-500`, angka `text-xl font-bold font-mono text-slate-900`).
4. Rapikan badge persentase dan ikon Lucide agar seimbang (tidak terlalu besar / tidak terlalu kecil).
5. Perbaiki tampilan daftar riwayat aktivitas log terbaru dengan badge aksi yang rapi.

### Tahap 5: Penataan Ulang UI Halaman Manajemen Pengguna (Users)
1. Buka `resources/js/Pages/SuperAdmin/Users/Index.jsx`.
2. Rapikan wadah filter bar (Search input + Filter Role + Filter Status) agar sejajar dengan tombol aksi "Tambah Pengguna".
3. Perbaiki tabel daftar user:
   - Gunakan `bg-slate-50 border-b border-slate-200` pada `thead`.
   - Gunakan badge status seragam dengan titik indikator.
   - Rapikan tombol aksi: Impersonate (Troubleshooting), Reset Password, Edit, dan Hapus.
4. Periksa dan rapikan modal form Tambah/Edit Pengguna serta modal Reset Password Darurat.

### Tahap 6: Penataan Ulang UI Halaman Log Audit & Pengaturan Sistem
1. Buka `resources/js/Pages/SuperAdmin/AuditLogs/Index.jsx`:
   - Selaraskan filter dan tabel log.
   - Sempurnakan modal tampilan payload JSON (*Before & After*) dengan styling `pre` / `code` yang bersih dan berlatar `bg-slate-900 text-emerald-400 font-mono text-xs`.
2. Buka `resources/js/Pages/SuperAdmin/Settings/Index.jsx`:
   - Kelompokkan input ke dalam kartu-kartu tematik: *Identitas Rumah Sakit & Kop Surat*, *Pejabat Direktur & Penandatangan*, *Pejabat Perencanaan & Keuangan*.
   - Standarisasi kolom input form dan tombol "Simpan Perubahan".

### Tahap 7: Penataan Ulang UI Halaman Monitoring Global
1. Buka `resources/js/Pages/SuperAdmin/Monitoring/Rba.jsx`, `Requisitions.jsx`, dan `Finance.jsx`.
2. Samakan komponen tab switcher, filter toolbar, indikator "Mode Pengawas (Read-Only)", tabel data, dan pagination.

### Tahap 8: Pengujian Otomatis (*Feature Testing*)
1. Perbarui [tests/Feature/SuperAdminSuiteTest.php](file:///d:/Kampus/Nabil_2SIB/laragon-6.0-minimal/www/rsj-req-app/tests/Feature/SuperAdminSuiteTest.php):
   - Tambahkan test untuk rute baru `superadmin.fiscal-years.index`, `store`, `update`, `toggle-lock`, `toggle-status`, `set-default`.
   - Pastikan non-super_admin diblokir (403) saat mengakses `/super-admin/fiscal-years`.
   - Pastikan toggle lock dan audit logging bekerja sempurna.
2. Jalankan `php artisan test --filter=SuperAdminSuiteTest`.
3. Jalankan rangkaian tes penuh: `php artisan test`.

### Tahap 9: Kompilasi Aset Frontend & Verifikasi Visual
1. Jalankan `npm run build` untuk memverifikasi tidak ada kesalahan sintaks JSX / Tailwind.
2. Lakukan inspeksi visual di browser: pastikan font, button, jarak margin/padding, dan warna terlihat serasi dan harmonis dengan modul-modul lainnya.

---

## 6. Kriteria Penerimaan (*Acceptance Criteria*)

- [ ] **Sidebar Bersih**: Item "Portal Administrator Biasa" telah dihapus dari sidebar Super Admin.
- [ ] **Modul Tahun Anggaran Mandiri**: Super Admin memiliki halaman `/super-admin/fiscal-years` tersendiri dan tidak lagi berpindah/redirect ke `/admin/fiscal-years`.
- [ ] **Fitur Tutup Buku Berfungsi**: Tombol kunci/buka kunci tahun anggaran (*toggle lock*) dapat diakses langsung dari modul tahun anggaran Super Admin dan tercatat di `activity_logs`.
- [ ] **Desain Harmonis & Rapi**: Tipografi, ukuran button, badge status ber-dot, tabel data, dan modal form di seluruh halaman Super Admin (`Dashboard`, `Users`, `AuditLogs`, `Settings`, `FiscalYears`, `Monitoring`) menggunakan Design System yang serasi dengan aplikasi SI-BLUD.
- [ ] **Bukan Copy-Paste Mentah**: Halaman Super Admin tetap memiliki identitas eksekutif tersendiri (aksen *Deep Indigo / Slate*) tanpa menduplikasi mentah tampilan role operasional.
- [ ] **100% Tests Passed**: Semua pengujian otomatis (`php artisan test`) berhasil lulus tanpa kegagalan.
- [ ] **Zero Build Error**: Perintah `npm run build` selesai tanpa peringatan error komponen.

---

## 7. Referensi File Utama Proyek

- **Layout Super Admin**: [resources/js/Layouts/SuperAdminLayout.jsx](file:///d:/Kampus/Nabil_2SIB/laragon-6.0-minimal/www/rsj-req-app/resources/js/Layouts/SuperAdminLayout.jsx)
- **Halaman Super Admin Eksisting**: [resources/js/Pages/SuperAdmin/](file:///d:/Kampus/Nabil_2SIB/laragon-6.0-minimal/www/rsj-req-app/resources/js/Pages/SuperAdmin/)
- **Referensi Design Token Elemen**: [resources/js/Layouts/AdminLayout.jsx](file:///d:/Kampus/Nabil_2SIB/laragon-6.0-minimal/www/rsj-req-app/resources/js/Layouts/AdminLayout.jsx) & [resources/js/Pages/Admin/Users/Index.jsx](file:///d:/Kampus/Nabil_2SIB/laragon-6.0-minimal/www/rsj-req-app/resources/js/Pages/Admin/Users/Index.jsx)
- **Routing Web**: [routes/web.php](file:///d:/Kampus/Nabil_2SIB/laragon-6.0-minimal/www/rsj-req-app/routes/web.php)
- **Automated Tests**: [tests/Feature/SuperAdminSuiteTest.php](file:///d:/Kampus/Nabil_2SIB/laragon-6.0-minimal/www/rsj-req-app/tests/Feature/SuperAdminSuiteTest.php)
