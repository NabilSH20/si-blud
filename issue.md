# Perencanaan Implementasi: Standarisasi & Penyelarasan Tampilan UI Role Super Admin

> **Target Pengembang**: Junior Programmer & AI Assistant Model  
> **Repository**: `rsj-req-app` (E-BLUD RS Jiwa Tampan Provinsi Riau)  
> **Status Dokumen**: Siap Diimplementasikan (*Ready for Implementation*)  
> **Branch Kerja yang Disarankan**: Buat branch baru dari `master`, misalnya `ui_super_admin`  

---

## 1. Konteks & Latar Belakang Masalah

Berdasarkan hasil evaluasi antarmuka (*User Interface*), tampilan halaman pada role **Super Admin** saat ini belum selaras dengan tampilan keempat role lainnya (**Admin**, **Divisi / Unit**, **Perencanaan**, dan **Keuangan**).

Meskipun keempat role lainnya sudah memiliki standar desain Tailwind CSS yang seragam, halaman Super Admin masih menggunakan gaya terpisah yang menyebabkan ketidaksinkronan visual:
1. **Skema Warna & Tema Berbeda**: Keempat role lain seragam menggunakan tema dasar **Slate + Emerald/Teal** (`bg-teal-600`, `emerald-50/70`, `border-slate-200`), sedangkan Super Admin menggunakan warna **Indigo/Ungu** (`bg-indigo-600`, `border-indigo-200`, `from-indigo-50/90`).
2. **Ukuran Font Header & Struktur Layout Tidak Sama**:
   - Pada halaman **Dashboard** role lain (`Admin/Dashboard.jsx`, `Divisi/Dashboard.jsx`, `Keuangan/Dashboard.jsx`), konten utama dibungkus kanvas putih bersih (`bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs`) dengan judul `<h1>` berukuran **`text-2xl sm:text-3xl font-bold`**, divider bawah header, serta info *"Update terakhir"*. Sementara `SuperAdmin/Dashboard.jsx` menggunakan `text-xl sm:text-2xl` tanpa kanvas putih dan memiliki badge pill ekstra (*"3-in-1 Master"*) di sebelah judul.
   - Pada halaman **CRUD / Tabel** role lain (`Admin/Users/Index.jsx`, `Admin/FiscalYears/Index.jsx`, `Divisi/Requisitions/Index.jsx`), `<h1>` menggunakan **`text-xl sm:text-2xl font-black text-slate-900 tracking-tight`** tanpa badge pill di samping judul, dan **tombol aksi `+ Tambah`** diletakkan **di dalam toolbar kartu tabel sebelah kanan**, bukan di pojok kanan header halaman atas.
3. **Ukuran, Padding, Warna Background, dan Jenis Button Tidak Konsisten**:
   - **Tombol Utama (Primary CTA)**: Role lain selalu menggunakan `bg-teal-600 hover:bg-teal-700 px-4 py-2 text-xs font-bold text-white rounded-xl`. Di Super Admin tombol utama memakai `bg-indigo-600` dengan tinggi berbeda-beda (`py-2.5`, `px-4.5 py-2`, `px-5 py-2.5`, `px-6 py-2.5`).
   - **Tombol Sekunder / Reset / Batal / Detail**: Di Super Admin ukurannya bermacam-macam (`px-3 py-2`, `px-3.5 py-2`, `px-4 py-2`), dan tombol `Detail` di Monitoring masih memakai background Indigo (`bg-indigo-50 text-indigo-700 px-2.5 py-1`) alih-alih netral putih (`border-slate-200 bg-white text-slate-700 px-2.5 py-1.5`).
   - **Tombol Aksi Baris Tabel (`Edit`, `Hapus`, `Set Default`, dll.)**: Di role lain, tombol `Edit` selalu berbackground **Amber** (`border-amber-300 bg-amber-50 text-amber-800 px-3 py-1.5`), tombol `Set Default` berbackground **Teal** (`border-teal-200 bg-teal-50 text-teal-800 px-2.5 py-1.5`), dan tombol `Hapus` berpadding `px-2.5 py-1.5`. Di Super Admin, tombol `Edit` masih putih polos (`bg-white`), `Default` memakai warna Amber, dan tingginya `py-1` sehingga tampak lebih pendek serta tidak seragam.
   - **Perataan Kolom Aksi**: Role lain merata-tengahkan (`text-center` / `justify-center`) kolom aksi tabel; Super Admin masih rata kanan (`text-right` / `justify-end`).

---

## 2. Acuan Resmi Design System (Standar Role Lainnya)

Gunakan daftar *Tailwind class* resmi berikut yang diambil langsung dari implementasi `AdminLayout.jsx`, `Admin/Users/Index.jsx`, `Admin/FiscalYears/Index.jsx`, `Divisi/Dashboard.jsx`, `Divisi/Requisitions/Index.jsx`, dan `Pagination.jsx` sebagai satu-satunya acuan selama pengerjaan:

### A. Shell & Layout (`*Layout.jsx`)
| Elemen UI | Class Acuan Resmi (Standar Role Lain) |
|---|---|
| **Page Background** | `min-h-screen bg-gradient-to-br from-slate-100/90 via-slate-50 to-emerald-50/50 bg-fixed font-sans text-slate-800 antialiased` |
| **Sidebar Container** | `fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r-2 border-slate-300/80 bg-white shadow-lg transition-transform duration-300 lg:translate-x-0` |
| **Sidebar Logo Header** | `border-b-2 border-emerald-100/90 bg-emerald-50/70 p-4` |
| **Sidebar Role Badge** | Pill kecil di samping teks `E-BLUD`: `inline-flex items-center rounded-md bg-slate-800 px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white shadow-2xs` *(warna badge dapat memakai `bg-slate-800` atau `bg-emerald-700` agar tetap membedakan peran secara elegan tanpa mengubah tema layout)* |
| **Sidebar Group Label** | `px-3 pb-2 text-[11px] font-black uppercase tracking-wider text-slate-400` |
| **Menu Item Aktif** | `bg-emerald-50 text-emerald-900 font-bold border-l-4 border-emerald-600 pl-3 shadow-2xs` *(text `text-sm`, icon `h-5 w-5 shrink-0 text-emerald-600`, dot kanan `ml-auto h-2 w-2 rounded-full bg-emerald-600`)* |
| **Menu Item Inaktif** | `text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-semibold pl-4` *(text `text-sm`, icon `h-5 w-5 shrink-0 text-slate-400 group-hover:text-slate-600`)* |
| **Topbar Subtitle** | `text-xs font-semibold text-slate-500 truncate` |
| **Topbar Profile Button** | `flex items-center gap-2.5 rounded-2xl border-2 border-slate-200 bg-white p-1.5 pr-3 hover:bg-slate-50 active:scale-95 transition-all duration-200 shadow-2xs cursor-pointer` |
| **Main Wrapper Padding** | `<main className="flex-1 p-4 sm:p-6 lg:p-8"><div className="animate-fade-in-up transition-all duration-300">{children}</div></main>` |

### B. Header Halaman & Container
| Jenis Halaman | Class Acuan Resmi (Standar Role Lain) |
|---|---|
| **Dashboard Canvas** | `min-h-screen bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6` |
| **Dashboard Header Row** | `flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-slate-100` |
| **Dashboard `<h1>`** | `text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl` |
| **Dashboard Subtitle `<p>`** | `mt-1 text-xs sm:text-sm text-slate-500` |
| **CRUD / List Page Wrapper** | `<div className="mb-6">` (Header terpisah dari tabel, tanpa pill badge di samping `<h1>`) |
| **CRUD / List `<h1>`** | `text-xl sm:text-2xl font-black text-slate-900 tracking-tight` |
| **CRUD / List Subtitle `<p>`** | `mt-1 text-xs sm:text-sm text-slate-500 font-medium` |
| **Table Card Container** | `overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs` |
| **Table Toolbar Row** | `flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 bg-white` |
| **Table `<thead>`** | `bg-slate-50 font-bold border-b border-slate-200 text-slate-700 uppercase tracking-wider text-xs` |

### C. Kamus Standar Button (Ukuran, Padding, Warna Background & Varian)
| Jenis Button | Kegunaan | Class Acuan Resmi (Standar Role Lain) |
|---|---|---|
| **Primary CTA Button** | `+ Tambah Pengguna`, `+ Tambah Tahun Anggaran`, `Simpan Perubahan`, `Terapkan Filter` | `inline-flex items-center justify-center gap-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-95 px-4 py-2 text-xs font-bold text-white shadow-2xs transition cursor-pointer whitespace-nowrap disabled:opacity-50` |
| **Secondary / Cancel / Reset** | `Batal`, `Reset`, `Tutup`, Link `TA: 2026` | `inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 active:scale-95 px-4 py-2 text-xs font-bold text-slate-700 shadow-2xs transition cursor-pointer whitespace-nowrap` |
| **Row Action: `Detail`** | Melihat modal rincian di baris tabel | `inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:text-slate-900 active:scale-95 px-2.5 py-1.5 text-xs font-bold text-slate-700 shadow-2xs transition cursor-pointer` |
| **Row Action: `Edit`** | Mengubah baris data pengguna / tahun anggaran | `inline-flex items-center gap-1 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 hover:text-amber-900 active:scale-95 px-3 py-1.5 text-xs font-bold text-amber-800 shadow-2xs transition cursor-pointer` |
| **Row Action: `Set Default` / `Troubleshoot` / `JSON`** | Aksi positif/inspeksi sekunder pada baris tabel | `inline-flex items-center gap-1 rounded-xl border border-teal-200 bg-teal-50 hover:bg-teal-100 hover:text-teal-900 active:scale-95 px-2.5 py-1.5 text-xs font-bold text-teal-800 shadow-2xs transition cursor-pointer` |
| **Row Action: `Reset Password`** | Aksi peringatan pada baris tabel (`KeyRound`) | `inline-flex items-center gap-1 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 hover:text-amber-900 active:scale-95 px-2.5 py-1.5 text-xs font-bold text-amber-800 shadow-2xs transition cursor-pointer` |
| **Row Action: `Hapus` (Trash)** | Menghapus baris data | `inline-flex items-center gap-1 rounded-xl border border-transparent hover:border-rose-300 bg-white hover:bg-rose-50 hover:text-rose-700 active:scale-95 px-2.5 py-1.5 text-xs font-bold text-slate-400 transition cursor-pointer` |
| **Danger Action** | `Ya, Tutup Buku Sekarang` | `inline-flex items-center gap-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 px-4 py-2 text-xs font-bold text-white shadow-2xs transition cursor-pointer` |
| **Pagination Active Page** | Halaman aktif pagination (`Pagination.jsx`) | `bg-emerald-600 text-white shadow-xs` |

---

## 3. Daftar File yang Harus Dimodifikasi

| No | File Target | Ringkasan Perubahan Utama |
|---|---|---|
| 1 | `resources/js/Layouts/SuperAdminLayout.jsx` | Ganti tema layout Indigo menjadi Slate + Emerald/Teal agar seragam dengan `AdminLayout`, `DivisiLayout`, `PerencanaanLayout`, `KeuanganLayout`. |
| 2 | `resources/js/Pages/SuperAdmin/Dashboard.jsx` | Bungkus dengan kanvas putih dashboard standar; perbesar `<h1>` ke `text-2xl sm:text-3xl`; tambahkan *"Update terakhir"*; ubah aksen kartu & link ke Teal/Emerald. |
| 3 | `resources/js/Pages/SuperAdmin/Users/Index.jsx` | Samakan header `font-black` tanpa pill badge; pindahkan tombol `+ Tambah Pengguna` ke dalam toolbar tabel (`bg-teal-600 px-4 py-2`); rapikan filter `<select>` tanpa wrapper ganda; ubah tombol `Edit` (Amber), `Troubleshoot` (Teal), `Reset Password`, & `Hapus` agar tingginya seragam (`py-1.5`); ratakan kolom Aksi ke tengah (`text-center`). |
| 4 | `resources/js/Pages/SuperAdmin/FiscalYears/Index.jsx` | Samakan header `font-black`; pindahkan tombol `+ Tambah Tahun Anggaran` ke dalam toolbar tabel (`bg-teal-600 px-4 py-2`); tambahkan kolom `No` (`#1`, `#2`); ubah tombol `Edit` ke Amber (`px-3 py-1.5`), `Set Default` ke Teal (`px-2.5 py-1.5`), `Tutup Buku`/`Buka Kunci` ke `px-2.5 py-1.5`, dan `Hapus` ke `px-2.5 py-1.5`; ubah button modal ke `bg-teal-600 px-4 py-2`. |
| 5 | `resources/js/Pages/SuperAdmin/Settings/Index.jsx` | Samakan header `font-black`; seragamkan kedua tombol *Simpan* (atas & bawah) ke `bg-teal-600 hover:bg-teal-700 px-4 py-2`; ganti aksen fokus input dan dot subbagian dari Indigo ke Teal. |
| 6 | `resources/js/Pages/SuperAdmin/AuditLogs/Index.jsx` | Samakan header `font-black`; ubah tombol `Terapkan Filter` menjadi `bg-teal-600 hover:bg-teal-700 px-4 py-2` dan `Reset` menjadi `px-4 py-2`; ubah tombol `JSON` menjadi `border-teal-200 bg-teal-50 text-teal-800 px-2.5 py-1.5`; seragamkan `<thead>` dan kolom `Aksi`. |
| 7 | `resources/js/Pages/SuperAdmin/Monitoring/Rba.jsx` | Samakan header `font-black`; ubah warna active tab dari `border-indigo-600 text-indigo-600` ke `border-teal-600 text-teal-700`; ganti warna badge TA dan banner aksen dari Indigo ke Teal/Slate standar. |
| 8 | `resources/js/Pages/SuperAdmin/Monitoring/Requisitions.jsx` | Samakan header `font-black`; ubah tombol `Filter` menjadi `bg-teal-600 hover:bg-teal-700 px-4 py-2`; ubah tombol `Detail` baris tabel menjadi standar netral `border-slate-200 bg-white text-slate-700 px-2.5 py-1.5`; ubah pagination aktif ke `bg-emerald-600`. |
| 9 | `resources/js/Pages/SuperAdmin/Monitoring/Finance.jsx` | Samakan header `font-black`; ubah pagination aktif dari `bg-indigo-600` ke `bg-emerald-600`; seragamkan `<thead>` tabel pendapatan & kartu ikhtisar. |

---

## 4. Tahapan Implementasi Terperinci (*Step-by-Step Guide*)

### Tahap 1: Penyelarasan Shell & Navigasi (`SuperAdminLayout.jsx`)
Buka `resources/js/Layouts/SuperAdminLayout.jsx` dan bandingkan dengan `resources/js/Layouts/AdminLayout.jsx`:

1. **Background Halaman Utama (Line ~99)**:
   ```jsx
   // Sebelum:
   <div className="min-h-screen bg-gradient-to-br from-slate-100/90 via-slate-50 to-indigo-50/50 bg-fixed font-sans text-slate-800 antialiased">

   // Sesudah (Samakan dengan AdminLayout, DivisiLayout, PerencanaanLayout, KeuanganLayout):
   <div className="min-h-screen bg-gradient-to-br from-slate-100/90 via-slate-50 to-emerald-50/50 bg-fixed font-sans text-slate-800 antialiased">
   ```
2. **Sidebar Border & Header Logo Area (Lines ~124–158)**:
   - Ubah `<aside>` border dari `border-r-2 border-indigo-200/80 bg-white shadow-xl` menjadi `border-r-2 border-slate-300/80 bg-white shadow-lg`.
   - Ubah container logo atas dari `border-b-2 border-indigo-100 bg-gradient-to-b from-indigo-50/90 to-slate-50 p-4` menjadi `border-b-2 border-emerald-100/90 bg-emerald-50/70 p-4`.
   - Ubah tombol tutup mobile (`lg:hidden`) dari `border border-indigo-200` menjadi `rounded-xl border-2 border-emerald-200 bg-white p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-300 active:scale-95 transition shadow-2xs`.
   - Badge `SUPER ADMIN` di bawah logo dapat menggunakan `bg-slate-800` (atau `bg-emerald-700`) dengan ukuran seragam `px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white rounded-md shadow-2xs`.
3. **Navigasi Sidebar (Lines ~161–211)**:
   - Judul grup menu: ganti `text-[10px] font-black uppercase tracking-wider text-indigo-400` menjadi `text-[11px] font-black uppercase tracking-wider text-slate-400`.
   - Link menu aktif: ganti `bg-indigo-50 font-black text-indigo-950 border-l-4 border-indigo-600` menjadi `bg-emerald-50 text-emerald-900 font-bold border-l-4 border-emerald-600 pl-3 shadow-2xs` (link inaktif memakai `pl-4`, font `text-sm`, icon ukuran `h-5 w-5 shrink-0` dengan warna aktif `text-emerald-600` dan dot aktif `bg-emerald-600`).
   - Footer sidebar: samakan dengan `AdminLayout` (`border-t-2 border-slate-200/90 bg-slate-50 px-4 py-3`), badge `TA {active_year}` memakai `rounded-md bg-emerald-100 text-emerald-800 px-1.5 py-0.5 border border-emerald-300`.
4. **Topbar & Profile Dropdown (Lines ~217–340)**:
   - Greeting subtitle (Line ~231): ganti `text-indigo-700` menjadi `text-slate-500`.
   - Notification bell dot (Line ~255): samakan menjadi `bg-rose-500 ring-2 ring-white animate-pulse` (atau `bg-emerald-500` sesuai status sistem, dengan ukuran `h-2.5 w-2.5` dan button icon `h-5 w-5`).
   - Profile trigger button (Line ~283): ganti `border-2 border-indigo-200 hover:bg-indigo-50/50` menjadi `border-2 border-slate-200 hover:bg-slate-50`, avatar kotak `bg-emerald-600` (bukan `bg-indigo-700`), dan subtext role `text-slate-500` (bukan `text-indigo-700`).
   - Dropdown popup (Line ~304): ganti `border-2 border-indigo-100` menjadi `border-2 border-slate-300`, dan item menu *"Pengaturan Profil"* tambahkan ikon & hover `hover:bg-emerald-50 hover:text-emerald-700` seperti `AdminLayout`.
   - Main container (Line ~340): ubah menjadi `<main className="flex-1 p-4 sm:p-6 lg:p-8"><div className="animate-fade-in-up transition-all duration-300">{children}</div></main>`.

---

### Tahap 2: Penyelarasan Halaman Dashboard (`SuperAdmin/Dashboard.jsx`)
Buka `resources/js/Pages/SuperAdmin/Dashboard.jsx` dan bandingkan dengan `Admin/Dashboard.jsx` serta `Divisi/Dashboard.jsx`:

1. **Tambahkan Clock / Last Updated State** (mengikuti `Admin/Dashboard.jsx` & `Divisi/Dashboard.jsx`):
   Tambahkan `useState(new Date())` dan `useEffect` interval 1 detik untuk menampilkan `Update terakhir: {formattedDate} pukul {formattedTime}` pada sisi kanan header dashboard.
2. **Bungkus Konten dengan Kanvas Putih Standar Dashboard (Line ~81)**:
   ```jsx
   // Sebelum:
   <div className="space-y-6">
       {/* 1. Header Title & Status Badges */}
       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
           <div>
               <div className="flex items-center gap-2">
                   <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                       Dashboard Eksekutif Global
                   </h1>
                   <span className="... 3-in-1 Master ...">...</span>
               </div>
   ...

   // Sesudah (Standar Dashboard Role Lain):
   <div className="min-h-screen bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
       {/* 1. Header Row */}
       <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-slate-100">
           <div>
               <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                   Dashboard Eksekutif Global
               </h1>
               <p className="mt-1 text-xs sm:text-sm text-slate-500">
                   Pemantauan terpadu lintas modul Perencanaan, Keuangan, Unit Kerja, dan Integritas Sistem E-BLUD RSJ Tampan &bull; TA <span className="font-bold text-slate-700">{active_year}</span>
               </p>
           </div>

           <div className="flex flex-col sm:items-end gap-2.5 shrink-0">
               <div className="text-xs text-slate-500">
                   Update terakhir:{' '}
                   <strong className="font-semibold text-slate-800">
                       {formattedDate} pukul {formattedTime}
                   </strong>
               </div>
               <div className="flex items-center gap-2">
                   <Link
                       href={route('superadmin.fiscal-years.index')}
                       className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 active:scale-95 px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs transition cursor-pointer"
                   >
                       <Calendar className="h-3.5 w-3.5 text-teal-600" />
                       TA: <span className="font-mono text-teal-800 font-bold">{active_year}</span>
                   </Link>
                   {/* Badge status Terkunci / Terbuka */}
               </div>
           </div>
       </div>
   ```
3. **Kartu KPI, Pintasan Cepat & Audit Feed**:
   - Pada KPI Card 3 (`Penerimaan Pendapatan`, Line ~163): ubah aksen ikon dari `bg-indigo-50 text-indigo-600 border-indigo-200` ke `bg-teal-50 text-teal-600 border-teal-200`, angka utama dari `text-indigo-900` ke `text-teal-800` atau `text-slate-900`.
   - Pada Quick Shortcuts Card 1 (`Manajemen Akun`, Line ~206): ubah hover & ikon dari `indigo` menjadi `teal` (`hover:border-teal-300 hover:bg-teal-50/30`, ikon `bg-teal-50 text-teal-600 group-hover:bg-teal-600 group-hover:text-white border-teal-100`).
   - Pada header Live Audit Feed (`Lihat Semua`, Lines ~265, ~272) & header `Status Usulan Belanja` (Line ~338): ubah ikon dan link `text-indigo-600` menjadi `text-teal-600 hover:text-teal-800`.

---

### Tahap 3: Penyelarasan Halaman Manajemen Akun (`SuperAdmin/Users/Index.jsx`)
Buka `resources/js/Pages/SuperAdmin/Users/Index.jsx` dan samakan persis dengan pola `resources/js/Pages/Admin/Users/Index.jsx`:

1. **Header Halaman (Lines ~246–270)**:
   - Hapus tombol `+ Tambah Pengguna Baru` dari header atas dan hapus badge pill `Root Authority` di samping judul.
   - Gunakan struktur header minimalis standar `Admin/Users/Index.jsx`:
     ```jsx
     <div className="mb-6">
         <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
             Manajemen Akun Pengguna
         </h1>
         <p className="mt-1 text-xs sm:text-sm text-slate-500 font-medium">
             Otoritas penuh mengelola akun seluruh pegawai, role sistem, reset password darurat, dan impersonasi troubleshooting.
         </p>
     </div>
     ```
2. **Inline Success/Error Alert Banners**:
   Tambahkan blok render alert `{success && (...)}` dan `{error && (...)}` tepat di bawah header sebelum kartu tabel (persis `Admin/Users/Index.jsx` lines 202–221) agar konsisten.
3. **Toolbar Kartu Tabel Putih & Penempatan Button `+ Tambah Pengguna` (Lines ~273–365)**:
   - Ubah container tabel menjadi `overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs`.
   - Ubah background toolbar dari `border-b border-slate-200/80 p-4 sm:p-5 bg-slate-50/50` menjadi `flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 bg-white`.
   - Hilangkan `div` pembungkus tambahan pada 3 `<select>` filter (`roleFilter`, `divisionFilter`, `statusFilter`); gunakan `<select>` langsung dengan class standar `rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition cursor-pointer`.
   - Ubah `focus:border-indigo-500 focus:ring-indigo-500` pada input pencarian menjadi `focus:border-teal-500 focus:ring-teal-500`.
   - Letakkan tombol **`+ Tambah Pengguna`** di sisi kanan toolbar menggunakan class standar Primary CTA (**`bg-teal-600 hover:bg-teal-700 px-4 py-2`**).
4. **Header Tabel (`<thead>`) & Nomor Baris**:
   - Ubah `<thead>` menjadi `bg-slate-50 font-bold border-b border-slate-200 text-slate-700 uppercase tracking-wider text-xs`.
   - Ubah header kolom terakhir menjadi `<th className="px-4 py-3.5 text-center">Aksi</th>` (rata tengah).
   - Ubah format nomor baris menjadi `#{(currentPage - 1) * itemsPerPage + idx + 1}` (`text-center text-xs font-semibold text-slate-400`).
5. **Penyeragaman Ukuran & Warna Button Aksi Baris Tabel (Lines ~471–523)**:
   Ubah kontainer button menjadi `flex items-center justify-center gap-1.5` dan perbarui setiap tombolnya:
   - **Tombol `Troubleshoot`**:
     ```jsx
     className="inline-flex items-center gap-1 rounded-xl border border-teal-200 bg-teal-50 hover:bg-teal-100 hover:text-teal-900 active:scale-95 px-2.5 py-1.5 text-xs font-bold text-teal-800 shadow-2xs transition cursor-pointer"
     ```
   - **Tombol `Edit`** (wajib **Amber** persis `Admin/Users/Index.jsx`):
     ```jsx
     className="inline-flex items-center gap-1 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 hover:text-amber-900 active:scale-95 px-3 py-1.5 text-xs font-bold text-amber-800 shadow-2xs transition cursor-pointer"
     ```
   - **Tombol `Reset Password`**:
     ```jsx
     className="inline-flex items-center gap-1 rounded-xl border border-amber-200 bg-amber-50 hover:bg-amber-100 hover:text-amber-900 active:scale-95 px-2.5 py-1.5 text-xs font-bold text-amber-800 shadow-2xs transition cursor-pointer"
     ```
   - **Tombol `Hapus` (Trash)**:
     ```jsx
     className="inline-flex items-center gap-1 rounded-xl border border-transparent hover:border-rose-300 bg-white hover:bg-rose-50 hover:text-rose-700 active:scale-95 px-2.5 py-1.5 text-xs font-bold text-slate-400 transition cursor-pointer"
     ```
6. **Button & Input Modal (Lines ~543–803)**:
   - Ubah ikon header modal dari `bg-indigo-50 text-indigo-700 border-indigo-200` ke `bg-teal-50 text-teal-700 border-teal-200`.
   - Ubah semua focus ring input/select dari `focus:border-indigo-500 focus:ring-indigo-500` ke `focus:border-teal-500 focus:ring-teal-500`.
   - Samakan tombol `Batal` (`px-4 py-2`) dan tombol submit `Buat Pengguna`/`Simpan Perubahan` menjadi `bg-teal-600 hover:bg-teal-700 active:scale-95 px-4 py-2 text-xs font-bold text-white rounded-xl`.

---

### Tahap 4: Penyelarasan Halaman Tahun Anggaran & Tutup Buku (`SuperAdmin/FiscalYears/Index.jsx`)
Buka `resources/js/Pages/SuperAdmin/FiscalYears/Index.jsx` dan samakan dengan `resources/js/Pages/Admin/FiscalYears/Index.jsx`:

1. **Header Halaman (Lines ~161–185)**:
   - Hapus pill `Master Root` di samping `<h1>`, gunakan `<div className="mb-6">` dengan `<h1>` `text-xl sm:text-2xl font-black text-slate-900 tracking-tight`.
   - Pindahkan tombol `+ Tambah Tahun Anggaran` ke dalam toolbar tabel sebelah kanan.
2. **Kartu Metrik Ringkasan (Lines ~188–269)**:
   - Ubah border/radius kartu agar bersih (`rounded-2xl border border-slate-200 bg-white p-5 shadow-xs`), serta ubah ikon card ke-4 (`Total Periode Terdata`) dari Indigo ke `bg-teal-50 text-teal-600 border-teal-200`.
3. **Toolbar Kartu Tabel (Lines ~272–317)**:
   - Ubah ke latar putih standar `flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 bg-white`.
   - Rapikan `<select>` `statusFilter` agar langsung memakai class standar tanpa wrapper `div` ganda; ubah tombol `Reset` ke `px-4 py-2`; letakkan tombol **`+ Tambah Tahun Anggaran`** di kanan toolbar memakai `bg-teal-600 hover:bg-teal-700 px-4 py-2`.
4. **Tabel & Penyeragaman Button Aksi (Lines ~320–504)**:
   - Ubah `<thead>` menjadi `bg-slate-50 font-bold border-b border-slate-200 text-slate-700 uppercase tracking-wider text-xs` dan tambahkan kolom `No` (`#1`, `#2`, dst.) seperti `Admin/FiscalYears/Index.jsx`, serta ratakan kolom `Aksi` ke tengah (`text-center`).
   - Ubah kotak angka tahun (Line ~352) dari `bg-indigo-50 border-indigo-200 text-indigo-700` ke gaya badge `Admin/FiscalYears` atau `bg-teal-50 border-teal-200 text-teal-800`.
   - Ubah tombol aksi pada setiap baris (`justify-center gap-1.5`) dengan tinggi seragam `py-1.5`:
     * **`Set Default`**: `inline-flex items-center gap-1 rounded-xl border border-teal-200 bg-teal-50 hover:bg-teal-100 hover:text-teal-900 active:scale-95 px-2.5 py-1.5 text-xs font-bold text-teal-800 shadow-2xs transition cursor-pointer` (label **`Set Default`** persis `Admin/FiscalYears/Index.jsx`, bukan `Default` warna Amber).
     * **`Edit`**: `inline-flex items-center gap-1 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 hover:text-amber-900 active:scale-95 px-3 py-1.5 text-xs font-bold text-amber-800 shadow-2xs transition cursor-pointer` (**Amber**, bukan putih!).
     * **`Hapus`**: `inline-flex items-center gap-1 rounded-xl border border-transparent hover:border-rose-300 bg-white hover:bg-rose-50 hover:text-rose-700 active:scale-95 px-2.5 py-1.5 text-xs font-bold text-slate-400 transition cursor-pointer`.
     * **`Tutup Buku` / `Buka Kunci`**: Samakan padding `px-2.5 py-1.5 text-xs` (sebelumnya `px-2.5 py-1 text-[11px]`).
5. **Modal Tambah/Edit & Modal Tutup Buku (Lines ~508–685)**:
   - Ganti aksen header modal, checkbox, dan focus input dari `indigo` ke `teal`.
   - Samakan seluruh button modal (`Batal`, `Simpan Tahun Anggaran`, `Ya, Buka Kunci`, `Ya, Tutup Buku Sekarang`) menggunakan `px-4 py-2 text-xs font-bold rounded-xl` dengan primary button `bg-teal-600 hover:bg-teal-700`.
   - *(Opsional pembersihan teks)*: Pada Line ~659 hapus frase *"memproses SP2D"* karena alur SP2D Keuangan sudah dihapus (ganti dengan *"mencatat transaksi atau mengubah data RBA"*).

---

### Tahap 5: Penyelarasan Pengaturan Dokumen Cetak (`SuperAdmin/Settings/Index.jsx`)
Buka `resources/js/Pages/SuperAdmin/Settings/Index.jsx`:
1. **Header (Lines ~42–67)**:
   - Ubah `<h1>` menjadi `text-xl sm:text-2xl font-black text-slate-900 tracking-tight` dan hapus badge pill `Dynamic Master`.
   - Ubah tombol **`Simpan Semua Pengaturan`** dari `bg-indigo-600 hover:bg-indigo-700 px-5 py-2.5` menjadi standar `inline-flex items-center justify-center gap-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-95 px-4 py-2 text-xs font-bold text-white shadow-2xs transition cursor-pointer`.
2. **Form & Tombol Submit Bawah (Lines ~79–330)**:
   - Ubah ikon section 1 (`Building2`), label subjudul bagian A (`text-indigo-900` & dot `bg-indigo-600`), dan `focus:border-indigo-500` seluruh input/textarea ke `teal`/`slate-900`.
   - Ubah tombol **`Simpan Perubahan Pengaturan`** di bagian bawah form (Line ~324) dari `bg-indigo-600 hover:bg-indigo-700 px-6 py-2.5` menjadi `bg-teal-600 hover:bg-teal-700 px-4 py-2` agar ukurannya identik dengan tombol atas dan seluruh role lain.
   - *(Opsional pembersihan teks)*: Pada Line ~183 perbarui teks *"RBA, LRA, Surplus-Defisit, dan SP2D"* menjadi *"RBA, LRA, Surplus-Defisit, dan Usulan Belanja"*.

---

### Tahap 6: Penyelarasan Halaman Audit Logs (`SuperAdmin/AuditLogs/Index.jsx`)
Buka `resources/js/Pages/SuperAdmin/AuditLogs/Index.jsx`:
1. **Header (Lines ~112–125)**:
   - Ubah `<h1>` menjadi `text-xl sm:text-2xl font-black text-slate-900 tracking-tight` dan hapus badge pill `Forensic Trail`.
   - *(Opsional pembersihan teks)*: Pada Line ~123 hapus penyebutan *"otorisasi SP2D"*.
2. **Toolbar Filter & Button (Lines ~130–238)**:
   - Ubah container kartu utama menjadi `overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs`, dan toolbar menjadi latar putih/bersih `border-b border-slate-100 p-4 bg-white`.
   - Ubah focus input/select ke `focus:border-teal-500 focus:ring-teal-500`.
   - Ubah tombol `Reset` ke `px-4 py-2` (`border-slate-300 bg-white hover:bg-slate-50`) dan tombol **`Terapkan Filter`** dari `bg-indigo-600 hover:bg-indigo-700` menjadi **`bg-teal-600 hover:bg-teal-700 px-4 py-2`**.
3. **Tabel, Tombol `JSON`, & Modal (Lines ~241–423)**:
   - Ubah `<thead>` menjadi `bg-slate-50 font-bold border-b border-slate-200 text-slate-700 uppercase tracking-wider text-xs`.
   - Ubah format nomor baris menjadi `#{(logs.current_page - 1) * logs.per_page + idx + 1}`.
   - Ubah tombol **`JSON`** (Line ~325) dari Indigo `px-2.5 py-1` menjadi `inline-flex items-center gap-1 rounded-xl border border-teal-200 bg-teal-50 hover:bg-teal-100 hover:text-teal-900 text-teal-800 px-2.5 py-1.5 text-xs font-bold shadow-2xs transition cursor-pointer active:scale-95`.
   - Di Modal Inspect Payload (Lines ~360–423): ubah ikon modal dari `indigo` ke `teal` dan seragamkan tombol `Tutup` menjadi `px-4 py-2`.

---

### Tahap 7: Penyelarasan 3 Halaman Monitoring (`Monitoring/Rba.jsx`, `Requisitions.jsx`, `Finance.jsx`)
Lakukan penyesuaian seragam pada ketiga halaman di folder `resources/js/Pages/SuperAdmin/Monitoring/`:

1. **Header Seragam di Ketiga File (`Rba.jsx`, `Requisitions.jsx`, `Finance.jsx`)**:
   - Ubah `<h1>` menjadi `text-xl sm:text-2xl font-black text-slate-900 tracking-tight` dan hapus pill badge tambahan (`Oversight`, `Pipeline Oversight`, `Financial Oversight`) di sebelah `<h1>`.
   - Ubah badge tahun `TA: {active_year}` di kanan header dari `text-indigo-600` / `text-indigo-900` ke `text-teal-700` / `border-teal-200 bg-teal-50` atau ikon `text-teal-600`.
2. **Monitoring RBA (`Monitoring/Rba.jsx`)**:
   - Ubah Segregation of Duties banner dari `bg-indigo-50/70 border-indigo-200/80 text-indigo-950` menjadi `bg-teal-50/70 border-teal-200/80 text-teal-950` (atau `bg-slate-50 border-slate-200` agar netral rapi).
   - Ubah kartu metrik net pergeseran (Line ~124) dan total periode (Line ~149): ubah aksen ikon Indigo menjadi Teal.
   - Ubah tab aktif (`Rekening RBA` / `Riwayat Pergeseran`, Lines ~173–190) dari `border-indigo-600 text-indigo-600` ke **`border-teal-600 text-teal-700`**.
   - Ubah focus ring search & select filter ke `focus:border-teal-500 focus:ring-teal-500`, serta seragamkan `<thead>` menjadi `bg-slate-50 font-bold border-b border-slate-200 text-slate-700 uppercase tracking-wider text-xs`.
3. **Monitoring Pengajuan Belanja (`Monitoring/Requisitions.jsx`)**:
   - Ubah toolbar filter menjadi latar putih bersih `border-b border-slate-100 p-4 bg-white`.
   - Ubah tombol **`Filter`** (Line ~175) dari `bg-indigo-600 hover:bg-indigo-700` menjadi **`bg-teal-600 hover:bg-teal-700 px-4 py-2`**, dan tombol `Reset` menjadi `px-4 py-2`.
   - Ubah tombol **`Detail`** di dalam baris tabel (Line ~270) dari Indigo `px-2.5 py-1` menjadi tombol `Detail` standar role lain:
     `inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:text-slate-900 active:scale-95 px-2.5 py-1.5 text-xs font-bold text-slate-700 shadow-2xs transition cursor-pointer`
   - Ratakan kolom `Aksi` ke tengah (`text-center`).
   - Ubah pagination aktif (Line ~300) dari `bg-indigo-600 text-white` menjadi **`bg-emerald-600 text-white`** (seragam dengan `Pagination.jsx`).
   - Di modal Inspect (Lines ~315–401): ubah aksen Indigo menjadi Teal (`bg-teal-50 text-teal-700`), tombol `Tutup` `px-4 py-2`.
   - *(Opsional pembersihan teks)*: Pada Line ~109 ubah *"status otorisasi 3-tahap"* menjadi *"status verifikasi Perencanaan"*, dan pada Line ~386 ubah *"pejabat perencana dan bendahara pengeluaran"* menjadi *"Bagian Perencanaan"*.
4. **Monitoring Kas & Realisasi (`Monitoring/Finance.jsx`)**:
   - Ubah Segregation of Duties banner dan kartu metrik Surplus/Defisit dari Indigo ke Teal.
   - Seragamkan `<thead>` tabel penerimaan menjadi `bg-slate-50 font-bold border-b border-slate-200 text-slate-700 uppercase tracking-wider text-xs`.
   - Ubah pagination aktif (Line ~226) dari `bg-indigo-600 text-white` menjadi **`bg-emerald-600 text-white`**.

---

## 5. Rencana Pengujian & Verifikasi (*Quality Assurance*)

Setelah seluruh perubahan UI selesai diimplementasikan, pengembang atau model AI wajib melakukan pengecekan berikut:

### 1. Build Aset Frontend (Vite)
```sh
npm run build
```
*Pastikan tidak ada error sintaks JSX atau referensi komponen yang hilang (`✓ built in ...s`).*

### 2. Pengujian Otomatis Backend (PHPUnit)
```sh
php artisan test
```
*Pastikan seluruh test suite (termasuk `SuperAdminSuiteTest` dan `RevenueWorkflowAndCleanupTest`) lulus 100% tanpa kegagalan.*

### 3. Audit Visual & Konsistensi Lintas Role
Buka browser sebagai `super_admin` dan bandingkan berdampingan dengan akun `admin`, lakukan pemeriksaan:
- [ ] **Layout & Sidebar**: Background gradasi, header logo sidebar, menu aktif, dan topbar `SuperAdminLayout` terlihat serasi (tidak ada lagi warna ungu/indigo mencolok) dengan `AdminLayout` / `DivisiLayout`.
- [ ] **Dashboard**: Halaman `SuperAdmin/Dashboard` berada di kanvas putih penuh dengan header `text-2xl sm:text-3xl`, divider bawah, dan teks *"Update terakhir"*.
- [ ] **Manajemen Akun & Tahun Anggaran**: Tombol `+ Tambah` berada di sebelah kanan toolbar tabel berwarna Teal (`bg-teal-600`), berukuran seragam (`px-4 py-2`), kolom aksi rata tengah, tombol `Edit` berbackground Amber (`px-3 py-1.5`), tombol `Set Default` & `Troubleshoot` berwarna Teal (`px-2.5 py-1.5`), dan tombol `Hapus` sejajar tingginya (`px-2.5 py-1.5`).
- [ ] **Pengaturan, Audit Logs & Monitoring**: Semua header memakai `font-black` tanpa badge ekstra; semua primary button (`Simpan`, `Terapkan Filter`, `Filter`) berwarna Teal (`bg-teal-600 px-4 py-2`); tombol `Detail` memakai gaya netral putih `border-slate-200`; tab dan pagination aktif memakai warna Teal/Emerald seragam dengan role lain.
- [ ] **Responsif Mobile**: Periksa lebar layar `375px` dan `1280px` memastikan tidak ada button terpotong, meluap keluar kontainer, atau bertabrakan.

---

## 6. Definisi Selesai (*Definition of Done*)

- [ ] Seluruh 9 berkas UI Super Admin (`SuperAdminLayout.jsx` + 8 halaman `Pages/SuperAdmin/**`) telah disesuaikan ke standar Design System role lain.
- [ ] Tidak ada lagi kelas `bg-indigo-600` atau button primary/secondary/aksi tabel dengan ukuran/warna menyimpang pada halaman Super Admin.
- [ ] `npm run build` berjalan sukses tanpa error.
- [ ] `php artisan test` lulus 100%.
- [ ] Perubahan di-commit ke branch kerja baru dan siap direview.
