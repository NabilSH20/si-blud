# SI-BLUD RS Jiwa Tampan Provinsi Riau
**Sistem Informasi Pengadaan Barang/Jasa & Pengelolaan Anggaran RBA (Pola Pengelolaan Keuangan BLUD)**

Aplikasi web modern berbasis **Laravel 11**, **Inertia.js (React)**, dan **Tailwind CSS** untuk mendigitalisasi alur pengajuan kebutuhan barang instalasi medis/penunjang, telaah rencana bisnis dan anggaran (RBA), serta pencairan SP2D di Rumah Sakit Jiwa Tampan Provinsi Riau.

---

## Arsitektur Alur Bisnis (4 Peran Pengguna)
1. **Admin Master Data**: Konfigurasi Tahun Anggaran aktif, Master Bidang & Unit Kerja, Katalog SSH (Standar Satuan Harga), serta Manajemen Akun Pengguna.
2. **Divisi / Unit Pengusul**: Input usulan belanja barang/jasa, cetak Nota Dinas, serta fitur *Revisi & Ajukan Ulang* jika berkas dikembalikan/ditolak.
3. **Bagian Perencanaan & Pengadaan**: Verifikasi kelayakan usulan, telaah kesesuaian harga terhadap SSH, pemetaan kode rekening belanja RBA, penyesuaian volume disetujui, dan penyusunan RBA Pergeseran.
4. **Bagian Keuangan**: Validasi pagu rekening DPA-BLUD, validasi ketersediaan saldo, pembebanan anggaran otomatis, penerbitan SP2D/Kuitansi, serta laporan surplus/defisit operasional.

---

## Panduan Perintah Terminal (Command Guide)

### (a) Setup Local / Demo Environment (Pengembangan & Demo)
Gunakan urutan perintah berikut untuk setup awal di komputer lokal dengan data contoh:

```bash
# 1. Install dependensi backend & frontend
composer install
npm install

# 2. Salin environment lokal dan buat App Key
cp .env.example .env
php artisan key:generate

# 3. Jalankan migrasi dan seeder data awal
php artisan migrate:fresh --seed

# 4. (Opsional) Suntikkan data akun demo & alur transaksi simulasi
php artisan db:seed --class=DemoSeeder

# 5. Jalankan server lokal
npm run dev
php artisan serve
```
> **Catatan Pengguna Windows PowerShell**: Jalankan perintah per baris atau gunakan tanda titik koma (`;`) sebagai pemisah perintah.
> **Akun Default Demo**: `admin@rsj.com`, `perencanaan@rsj.com`, `keuangan@rsj.com`, `igd@rsj.com` (Password: `password`).

---

### (b) Setup Server Production Bersih (Fresh Go-Live)
Gunakan urutan perintah berikut untuk deployment resmi hari-H di server produksi RSJ Tampan tanpa data transaksi tiruan:

```bash
# 1. Install dependensi mode produksi (tanpa paket dev)
composer install --no-dev --optimize-autoloader
npm install
npm run build

# 2. Salin konfigurasi keamanan produksi
cp .env.production.example .env

# 3. Sesuaikan koneksi database & kredensial non-root di .env
# nano .env

# 4. Generate Application Key produksi
php artisan key:generate --force

# 5. Eksekusi migrasi tabel & database indexing
php artisan migrate --force

# 6. Suntikkan Master Data Resmi (Tahun Anggaran 2027, Bidang, Unit, RBA, & SSH)
php artisan db:seed --class=ProductionMasterSeeder --force

# 7. Buat akun Super Admin utama melalui CLI terminal server
php artisan app:create-admin

# 8. Optimasi performa caching Laravel
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

---

### (c) Menjalankan Automated Testing

#### 1. Backend Unit & Feature Test (PHPUnit)
Menguji 173 skenario logika bisnis, validasi pagu anggaran, otorisasi role, dan integritas database:
```bash
php artisan test --compact
```

#### 2. End-to-End (E2E) Browser Test (Playwright)
Menguji simulasi navigasi nyata browser Chromium untuk alur lengkap:
*(Login Divisi -> Buat Usulan -> Login Perencanaan -> Verifikasi -> Login Keuangan -> Cairkan SP2D & Cek Laporan)*
```bash
# Jalankan E2E test headless
npx playwright test

# Tampilkan visualisasi laporan hasil test
npx playwright show-report
```

---

## Standar Keamanan Produksi
- **Session Hardening**: Cookie terenkripsi dengan flag `Secure`, `HttpOnly`, dan `SameSite=Lax`.
- **Database Indexing**: Indeks komposit pada `requisitions(budget_year, status)`, `rba_accounts(period_year)`, dan `revenues(date)`.
- **Audit Trail**: Jejak waktu dan identitas verifikator tercatat permanen pada tiap tahap persetujuan.
- **Master Data Guard**: `DemoSeeder` dicegah secara otomatis untuk dieksekusi di environment `production`.

---
*Pemerintah Provinsi Riau - Rumah Sakit Jiwa Tampan &copy; 2026*
