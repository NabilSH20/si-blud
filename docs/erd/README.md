# Dokumentasi Desain ERD Terintegrasi SI-BLUD RS Jiwa Tampan Provinsi Riau (v1.0)

Dokumen ini merupakan implementasi resmi dari [GitHub Issue #3](https://github.com/NabilSH20/si-blud/issues/3).  
Sesuai arahan teknis dan prinsip tata kelola data BLUD (Permendagri No. 79 Tahun 2018), **Modul Perencanaan, Modul Unit Pengaju, Modul Keuangan, dan Master Admin digabungkan ke dalam 1 (satu) ERD yang sama**, bukan dipisah-pisah per modul.

---

## 1. Daftar Berkas Aset ERD

Seluruh berkas desain database dan visualisasi telah digenerate dan tersimpan pada folder `docs/erd/`:

| Nama Berkas | Format | Deskripsi & Kegunaan |
| :--- | :---: | :--- |
| [`ERD_SIBLUD_RSJTampan_v1.0.png`](./ERD_SIBLUD_RSJTampan_v1.0.png) | **PNG (High-Res 4K)** | Gambar visual resolusi tinggi (2x scale DPI) untuk slide presentasi, dokumen laporan, dan tinjauan arsitektur. |
| [`ERD_SIBLUD_RSJTampan_v1.0.pdf`](./ERD_SIBLUD_RSJTampan_v1.0.pdf) | **PDF (Vector A2)** | Dokumen cetak berskala A2 landscape, teks dan garis berupa vektor tajam tanpa pecah. |
| [`ERD_SIBLUD_RSJTampan_v1.0.drawio`](./ERD_SIBLUD_RSJTampan_v1.0.drawio) | **Draw.io / XML** | Berkas sumber diagram yang dapat dibuka dan diedit langsung melalui [app.diagrams.net](https://app.diagrams.net). |
| [`ERD_SIBLUD_RSJTampan_v1.0.dbml`](./ERD_SIBLUD_RSJTampan_v1.0.dbml) | **DBML** | Format teks standar Database Markup Language, dapat di-copy-paste langsung ke [dbdiagram.io](https://dbdiagram.io). |
| [`ERD_SIBLUD_RSJTampan_v1.0.mmd`](./ERD_SIBLUD_RSJTampan_v1.0.mmd) | **Mermaid** | Kode sumber Mermaid ERD untuk rendering di GitHub, Notion, dan IDE markdown preview. |
| [`render-erd.html`](./render-erd.html) | **HTML5** | File viewer lokal berbasis Mermaid.js untuk visualisasi di browser. |

---

## 2. Struktur Data Dictionary (12 Tabel Lengkap)

Sesuai instruksi pada Issue #3, seluruh kolom `created_at` dan `updated_at` **tidak ditampilkan**. Seluruh kondisi `ENUM`, `PK`, `FK`, dan `UNIQUE` disajikan secara eksplisit.

### 2.1 Cluster Master Organisasi & Pengguna

#### A. Tabel `divisions` (Master Bidang / Bagian)
- **File Migrasi**: `database/migrations/0000_01_01_000000_create_divisions_table.php`

| Nama Kolom | Tipe Data | Constraint | Keterangan & Kondisi ENUM |
| :--- | :--- | :---: | :--- |
| `id` | `bigint unsigned` | **PK** | Kunci utama |
| `division_code` | `varchar(255)` | **UK**, NOT NULL | Kode unik bidang (cth: `YANMED`, `MEDIK28`) |
| `name` | `varchar(255)` | NOT NULL | Nama bidang (cth: `Bidang Pelayanan Medik`) |
| `group` | `varchar(255)` | NOT NULL | **ENUM**: `'Pelayanan_Keperawatan'`, `'Umum_Kepegawaian'` |

#### B. Tabel `units` (Master Unit Kerja / Ruangan)
- **File Migrasi**: `database/migrations/0000_01_01_000001_create_units_table.php`

| Nama Kolom | Tipe Data | Constraint | Keterangan |
| :--- | :--- | :---: | :--- |
| `id` | `bigint unsigned` | **PK** | Kunci utama |
| `division_id` | `bigint unsigned` | **FK** | Menginduk ke `divisions.id` (CASCADE DELETE) |
| `unit_code` | `varchar(255)` | **UK**, NOT NULL | Kode unik unit (cth: `IGD`, `IRND28`) |
| `name` | `varchar(255)` | NOT NULL | Nama ruangan/instalasi |
| `description` | `text` | NULLABLE | Deskripsi tugas unit |

#### C. Tabel `users` (Pengguna Sistem & Hak Akses)
- **File Migrasi**: `database/migrations/0001_01_01_000000_create_users_table.php`

| Nama Kolom | Tipe Data | Constraint | Keterangan & Kondisi ENUM |
| :--- | :--- | :---: | :--- |
| `id` | `bigint unsigned` | **PK** | Kunci utama |
| `name` | `varchar(255)` | NOT NULL | Nama lengkap pegawai |
| `nip` | `varchar(30)` | **UK**, NULLABLE | Nomor Induk Pegawai |
| `email` | `varchar(255)` | **UK**, NOT NULL | Email login sistem |
| `email_verified_at` | `timestamp` | NULLABLE | Verifikasi email |
| `password` | `varchar(255)` | NOT NULL | Password terenkripsi bcrypt/argon |
| `division_id` | `bigint unsigned` | **FK**, NULLABLE | Menginduk ke `divisions.id` (SET NULL) |
| `unit_id` | `bigint unsigned` | **FK**, NULLABLE | Menginduk ke `units.id` (SET NULL) |
| `role` | `enum` | NOT NULL | **ENUM**: `'admin'`, `'perencanaan'`, `'keuangan'`, `'divisi'` |
| `position` | `varchar(255)` | NULLABLE | Jabatan struktural / fungsional |
| `phone` | `varchar(30)` | NULLABLE | Nomor telepon/WhatsApp |
| `is_active` | `boolean` | NOT NULL | Status aktif akun (default: `true`) |
| `remember_token` | `varchar(100)` | NULLABLE | Token sesi login "Ingat Saya" |
| `avatar` | `varchar(255)` | NULLABLE | Path file foto profil |

#### D. Tabel `fiscal_years` (Tahun Anggaran Fiskal)
- **File Migrasi**: `database/migrations/2026_09_01_000001_create_fiscal_years_table.php`

| Nama Kolom | Tipe Data | Constraint | Keterangan |
| :--- | :--- | :---: | :--- |
| `id` | `bigint unsigned` | **PK** | Kunci utama |
| `year` | `int` | **UK**, NOT NULL | Tahun fiskal (cth: `2027`, `2028`) |
| `name` | `varchar(255)` | NOT NULL | Label tahun (cth: `"Tahun Anggaran 2028"`) |
| `is_active` | `boolean` | NOT NULL | Status aktif (default: `true`) |
| `is_default` | `boolean` | NOT NULL | Default terpilih saat login (default: `false`) |
| `description` | `varchar(255)` | NULLABLE | Catatan / dasar hukum SK |

---

### 2.2 Cluster Modul Perencanaan & RBA

#### E. Tabel `rba_shifts` (Versi Dokumen RBA: Murni & Pergeseran)
- **File Migrasi**: `database/migrations/2026_09_01_000007_create_rba_shifts_table.php`

| Nama Kolom | Tipe Data | Constraint | Keterangan & Kondisi ENUM |
| :--- | :--- | :---: | :--- |
| `id` | `bigint unsigned` | **PK** | Kunci utama |
| `year` | `int / year` | NOT NULL | Tahun anggaran dokumen RBA (default: `2026`) |
| `shift_name` | `varchar(255)` | NOT NULL | Nama versi (cth: `"Murni"`, `"Pergeseran 1"`) |
| `doc_title` | `varchar(255)` | NULLABLE | Judul resmi dokumen cetak |
| `period_month` | `varchar(255)` | NOT NULL | Periode bulan pengesahan (default: `'Juli 2026'`) |
| `penerimaan_silpa` | `decimal(18,2)` | NOT NULL | Penerimaan Pembiayaan SiLPA (default: `0`) |
| `penerimaan_divestasi` | `decimal(18,2)` | NOT NULL | Penerimaan hasil divestasi |
| `penerimaan_pinjaman` | `decimal(18,2)` | NOT NULL | Penerimaan pinjaman daerah/bank |
| `pengeluaran_investasi` | `decimal(18,2)` | NOT NULL | Pengeluaran investasi jangka panjang |
| `pengeluaran_pokok_utang` | `decimal(18,2)` | NOT NULL | Pembayaran pokok utang |
| `status` | `enum` | NOT NULL | **ENUM**: `'Draft'`, `'Aktif'`, `'Arsip'` |
| `notes` | `text` | NULLABLE | Catatan telaah RBA |

#### F. Tabel `rba_expense_items` (Matriks RBA Belanja Sebelum & Sesudah Pergeseran)
- **File Migrasi**: `database/migrations/2026_09_01_000008_create_rba_expense_items_table.php`

| Nama Kolom | Tipe Data | Constraint | Keterangan |
| :--- | :--- | :---: | :--- |
| `id` | `bigint unsigned` | **PK** | Kunci utama |
| `rba_shift_id` | `bigint unsigned` | **FK** | Menginduk ke `rba_shifts.id` (CASCADE DELETE) |
| `rba_account_id` | `bigint unsigned` | **FK**, NULLABLE | Terhubung ke `rba_accounts.id` (SET NULL) |
| `account_code` | `varchar(255)` | NOT NULL | Kode rekening (cth: `1.2.03.01`) |
| `account_name` | `varchar(255)` | NOT NULL | Uraian rekening belanja |
| `parent_code` | `varchar(255)` | NULLABLE | Kode induk hierarki akun |
| `level` | `tinyint unsigned` | NOT NULL | Level hierarki akun (1: Akun, 2: Kelompok, dst) |
| `is_header` | `boolean` | NOT NULL | `true` jika baris judul/header, `false` jika leaf node |
| `before_jasa_layanan` | `decimal(18,2)` | NOT NULL | Pagu Jasa Layanan sebelum pergeseran |
| `before_hasil_kerjasama`| `decimal(18,2)` | NOT NULL | Pagu Hasil Kerja Sama sebelum pergeseran |
| `before_lain_lain_sah` | `decimal(18,2)` | NOT NULL | Pagu Lain-lain BLUD Sah sebelum pergeseran |
| `before_silpa` | `decimal(18,2)` | NOT NULL | Pagu SiLPA sebelum pergeseran |
| `before_apbd` | `decimal(18,2)` | NOT NULL | Pagu subsidi APBD sebelum pergeseran |
| `before_total` | `decimal(18,2)` | NOT NULL | Total pagu sebelum pergeseran |
| `after_jasa_layanan` | `decimal(18,2)` | NOT NULL | Pagu Jasa Layanan sesudah pergeseran |
| `after_hasil_kerjasama`| `decimal(18,2)` | NOT NULL | Pagu Hasil Kerja Sama sesudah pergeseran |
| `after_lain_lain_sah` | `decimal(18,2)` | NOT NULL | Pagu Lain-lain BLUD Sah sesudah pergeseran |
| `after_silpa` | `decimal(18,2)` | NOT NULL | Pagu SiLPA sesudah pergeseran |
| `after_apbd` | `decimal(18,2)` | NOT NULL | Pagu APBD sesudah pergeseran |
| `after_total` | `decimal(18,2)` | NOT NULL | Total pagu sesudah pergeseran |
| `difference` | `decimal(18,2)` | NOT NULL | Selisih pergeseran (`after_total - before_total`) |
| `keterangan` | `text` | NULLABLE | Catatan / justifikasi pergeseran |
| `order_index` | `int` | NOT NULL | Urutan tampilan cetak dokumen |

#### G. Tabel `rba_revenue_items` (Target Pendapatan BLUD Sebelum & Sesudah Pergeseran)
- **File Migrasi**: `database/migrations/2026_09_01_000009_create_rba_revenue_items_table.php`

| Nama Kolom | Tipe Data | Constraint | Keterangan |
| :--- | :--- | :---: | :--- |
| `id` | `bigint unsigned` | **PK** | Kunci utama |
| `rba_shift_id` | `bigint unsigned` | **FK** | Menginduk ke `rba_shifts.id` (CASCADE DELETE) |
| `item_code` | `varchar(255)` | NOT NULL | Kode pos pendapatan (cth: `1`, `1.1`, `1.1.1`) |
| `item_name` | `varchar(255)` | NOT NULL | Uraian pos pendapatan |
| `parent_code` | `varchar(255)` | NULLABLE | Kode induk pos |
| `level` | `tinyint unsigned` | NOT NULL | Level hierarki pos |
| `is_header` | `boolean` | NOT NULL | Baris judul kelompok pos |
| `before_amount` | `decimal(18,2)` | NOT NULL | Target pendapatan sebelum pergeseran |
| `after_amount` | `decimal(18,2)` | NOT NULL | Target pendapatan sesudah pergeseran |
| `difference` | `decimal(18,2)` | NOT NULL | Selisih target (`after_amount - before_amount`) |
| `keterangan` | `text` | NULLABLE | Catatan dasar penetapan target |
| `order_index` | `int` | NOT NULL | Urutan cetak dokumen |

#### H. Tabel `rba_accounts` (Buku Kas Rekening DPA / Pagu Belanja Resmi)
- **File Migrasi**: `database/migrations/2026_09_01_000002_create_rba_accounts_table.php`  
*(Dalam kode Eloquent juga diakses via alias model `Budget`)*

| Nama Kolom | Tipe Data | Constraint | Keterangan & Kondisi ENUM |
| :--- | :--- | :---: | :--- |
| `id` | `bigint unsigned` | **PK** | Kunci utama |
| `account_code` | `varchar(255)` | NOT NULL | Kode rekening belanja |
| `parent_code` | `varchar(255)` | NULLABLE | Kode induk rekening |
| `account_name` | `varchar(255)` | NOT NULL | Nama rekening belanja |
| `kategori_belanja` | `varchar(50)` | NOT NULL | **ENUM**: `'Operasi'`, `'Modal'` |
| `sumber_dana` | `varchar(255)` | NOT NULL | **ENUM**: `'BLUD'`, `'APBD'` |
| `funding_source` | `varchar(255)` | NULLABLE | Sumber pendanaan tambahan |
| `period_year` | `int / year` | NOT NULL | Tahun anggaran berlakunya buku kas |
| `year` | `int` | NULLABLE | Alias tahun fiskal |
| `total_budget` | `decimal(18,2)` | NOT NULL | Total pagu belanja definitif aktif |
| `budget_after_revision` | `decimal(18,2)` | NULLABLE | Pagu hasil revisi pergeseran |
| `remaining_budget` | `decimal(18,2)` | NOT NULL | Sisa pagu belanja yang masih dapat dibelanjakan |
| `spent_budget` | `decimal(18,2)` | NOT NULL | Realisasi belanja yang sudah dicairkan SP2D |

**Index Khusus**: `UNIQUE(account_code, period_year)`

---

### 2.3 Cluster Katalog Acuan SSH

#### I. Tabel `items` (Katalog Barang Standar Satuan Harga)
- **File Migrasi**: `database/migrations/2026_09_01_000003_create_items_table.php`

| Nama Kolom | Tipe Data | Constraint | Keterangan & Kondisi ENUM |
| :--- | :--- | :---: | :--- |
| `id` | `bigint unsigned` | **PK** | Kunci utama |
| `rba_account_id` | `bigint unsigned` | **FK**, NULLABLE | Terhubung ke rekening `rba_accounts.id` (SET NULL) |
| `item_code` | `varchar(255)` | **UK**, NOT NULL | Kode barang (format: `ITM-0001`) |
| `name` | `varchar(255)` | NOT NULL | Nama barang |
| `specification` | `text` | NULLABLE | Spesifikasi teknis standar |
| `unit_type` | `varchar(255)` | NOT NULL | Satuan ukuran (cth: `Rim`, `Roll`, `Unit`, `Botol`) |
| `source` | `varchar(255)` | NOT NULL | **ENUM**: `'STANDAR'` (SSH resmi), `'USULAN_UNIT'` (barang custom) |
| `origin_unit_id` | `bigint unsigned` | **FK**, NULLABLE | Unit pengusul awal barang (`units.id`) |
| `standard_price` | `decimal(18,2)` | NOT NULL | Harga satuan acuan tertinggi (SSH) |

---

### 2.4 Cluster Pengajuan, Telaah, & Pencairan

#### J. Tabel `requisitions` (Nota Dinas Usulan Belanja)
- **File Migrasi**: `database/migrations/2026_09_01_000004_create_requisitions_table.php`

| Nama Kolom | Tipe Data | Constraint | Keterangan & Kondisi ENUM |
| :--- | :--- | :---: | :--- |
| `id` | `bigint unsigned` | **PK** | Kunci utama |
| `requisition_number` | `varchar(255)` | **UK**, NOT NULL | Nomor registrasi sistem otomatis |
| `nomor_surat_unit` | `varchar(255)` | NULLABLE | Nomor nota dinas pengajuan dari unit |
| `division_id` | `bigint unsigned` | **FK**, NOT NULL | Bidang pengaju (`divisions.id`) |
| `unit_id` | `bigint unsigned` | **FK**, NULLABLE | Unit kerja pengaju (`units.id`, SET NULL) |
| `user_id` | `bigint unsigned` | **FK**, NOT NULL | Pegawai pembuat pengajuan (`users.id`) |
| `rba_account_id` | `bigint unsigned` | **FK**, NULLABLE | Mata anggaran yang dibebankan (`rba_accounts.id`) |
| `jenis_belanja` | `varchar(30)` | NOT NULL | **ENUM**: `'Operasi'`, `'Modal'` |
| `sumber_dana` | `varchar(255)` | NOT NULL | Sumber pendanaan (default: `'BLUD'`) |
| `program` | `varchar(255)` | NULLABLE | Nama program kegiatan |
| `kegiatan` | `varchar(255)` | NULLABLE | Nama kegiatan BLUD |
| `sub_kegiatan` | `varchar(255)` | NULLABLE | Nama sub kegiatan |
| `tolok_ukur_output` | `text` | NULLABLE | Indikator keluaran kegiatan |
| `target_output` | `varchar(50)` | NULLABLE | Target volume capaian output |
| `tolok_ukur_outcome` | `text` | NULLABLE | Indikator hasil / dampak kegiatan |
| `target_outcome` | `varchar(50)` | NULLABLE | Target outcome |
| `urgency_reason` | `text` | NULLABLE | Justifikasi urgensi kebutuhan |
| `fiscal_year` | `int` | NOT NULL | Tahun anggaran fiskal pengajuan |
| `budget_year` | `int` | NULLABLE | Alias tahun anggaran |
| `status` | `enum` | NOT NULL | **ENUM**: `'Pending_Perencanaan'`, `'Diproses_Keuangan'`, `'Disetujui_Selesai'`, `'Ditolak'` |
| `submission_date` | `date` | NOT NULL | Tanggal pengajuan nota dinas |
| `total_estimated` | `decimal(18,2)` | NOT NULL | Total nilai usulan awal unit |
| `total_operasional` | `decimal(18,2)` | NOT NULL | Total porsi komponen operasional |
| `total_modal` | `decimal(18,2)` | NOT NULL | Total porsi komponen modal |
| `total_approved` | `decimal(18,2)` | NOT NULL | Total nilai yang disetujui cair |
| `notes_perencanaan` | `text` | NULLABLE | Catatan telaah verifikator Perencanaan |
| `verified_by_perencanaan_id` | `bigint unsigned` | **FK**, NULLABLE | User Perencanaan yang menelaah (`users.id`) |
| `verified_perencanaan_at` | `timestamp` | NULLABLE | Waktu verifikasi Perencanaan |
| `notes_keuangan` | `text` | NULLABLE | Catatan pejabat Keuangan |
| `approved_by_keuangan_id` | `bigint unsigned` | **FK**, NULLABLE | User Keuangan pencair SP2D (`users.id`) |
| `approved_keuangan_at` | `timestamp` | NULLABLE | Waktu persetujuan pencairan SP2D |
| `sp2d_number` | `varchar(255)` | NULLABLE | Nomor SP2D resmi terbit |
| `receipt_number` | `varchar(255)` | NULLABLE | Nomor kuitansi pembayaran kas |

#### K. Tabel `requisition_details` (Rincian Barang per Usulan Belanja)
- **File Migrasi**: `database/migrations/2026_09_01_000005_create_requisition_details_table.php`

| Nama Kolom | Tipe Data | Constraint | Keterangan |
| :--- | :--- | :---: | :--- |
| `id` | `bigint unsigned` | **PK** | Kunci utama |
| `requisition_id` | `bigint unsigned` | **FK**, NOT NULL | Menginduk ke `requisitions.id` (CASCADE DELETE) |
| `item_id` | `bigint unsigned` | **FK**, NULLABLE | Referensi katalog `items.id` (SET NULL jika custom) |
| `item_name` | `varchar(255)` | NULLABLE | Nama barang manual jika non-katalog |
| `unit_type` | `varchar(255)` | NULLABLE | Satuan barang |
| `specification` | `text` | NULLABLE | Spesifikasi teknis kebutuhan unit |
| `quantity_requested`| `int` | NOT NULL | Jumlah volume yang dimohon |
| `quantity_approved` | `int` | NULLABLE | Jumlah volume yang disetujui |
| `unit_price` | `decimal(18,2)` | NOT NULL | Harga satuan |
| `exceeds_ssh` | `boolean` | NOT NULL | `true` jika harga melebihi acuan SSH |
| `subtotal` | `decimal(18,2)` | NOT NULL | Subtotal harga (`qty * unit_price`) |

---

### 2.5 Cluster Modul Keuangan & Pendapatan BLUD

#### L. Tabel `revenues` (Realisasi Kas Masuk Harian BLUD)
- **File Migrasi**: `database/migrations/2026_09_01_000006_create_revenues_table.php`

| Nama Kolom | Tipe Data | Constraint | Keterangan |
| :--- | :--- | :---: | :--- |
| `id` | `bigint unsigned` | **PK** | Kunci utama |
| `revenue_number` | `varchar(255)` | **UK**, NOT NULL | Nomor unik bukti penerimaan kas |
| `source` | `varchar(255)` | NOT NULL | Pos pendapatan resmi BLUD |
| `amount` | `decimal(15,2)` | NOT NULL | Nilai uang kas yang masuk |
| `date` | `date` | NOT NULL | Tanggal transaksi penerimaan |
| `description` | `text` | NULLABLE | Uraian penerimaan |

**Nilai Pos Pendapatan Resmi (`source`)**:
1. **Jasa Layanan**: *Pendapatan Pelayanan Gawat Darurat, Pendapatan Pelayanan Rawat Jalan, Pendapatan Pelayanan Rawat Inap, Pendapatan Pelayanan Farmasi, Pendapatan Pelayanan Laboratorium, Pendapatan Pelayanan Radiologi, dll.*
2. **Hasil Kerja Sama**: *Hasil Kerjasama Diklat, Pendapatan Hasil Kerja Sama Fasilitas (Parkir)*
3. **APBD**: *APBD*
4. **Lain-lain BLUD Sah**: *Jasa Giro, Pendapatan Bunga*

---

## 3. Pemetaan 21 Relasi Garis Antar Tabel

Seluruh relasi fisik (Foreign Key) dan relasi logis tahun anggaran terhubung tanpa ada tabel yang terisolasi:

```
[1]  divisions.id                     ──1:N──→  units.division_id               (FK: CASCADE DELETE)
[2]  divisions.id                     ──1:N──→  users.division_id                (FK: SET NULL)
[3]  divisions.id                     ──1:N──→  requisitions.division_id         (FK: RESTRICT)

[4]  units.id                         ──1:N──→  users.unit_id                    (FK: SET NULL)
[5]  units.id                         ──1:N──→  requisitions.unit_id             (FK: SET NULL)
[6]  units.id                         ──1:N──→  items.origin_unit_id             (FK: SET NULL)

[7]  fiscal_years.year                ──1:N──→  rba_shifts.year                  (Logis: Tahun RBA)
[8]  fiscal_years.year                ──1:N──→  rba_accounts.period_year         (Logis: Tahun Buku Kas)
[9]  fiscal_years.year                ──1:N──→  requisitions.fiscal_year         (Logis: Tahun Usulan Belanja)
[10] fiscal_years.year                ──1:N──→  revenues.date [YEAR(date)]       (Logis: Tahun Realisasi Kas)

[11] rba_shifts.id                    ──1:N──→  rba_expense_items.rba_shift_id   (FK: CASCADE DELETE)
[12] rba_shifts.id                    ──1:N──→  rba_revenue_items.rba_shift_id   (FK: CASCADE DELETE)

[13] rba_accounts.id                  ──1:N──→  rba_expense_items.rba_account_id (FK: SET NULL)
[14] rba_accounts.id                  ──1:N──→  items.rba_account_id              (FK: SET NULL)
[15] rba_accounts.id                  ──1:N──→  requisitions.rba_account_id       (FK: SET NULL - Kontrol Pagu)

[16] users.id                         ──1:N──→  requisitions.user_id             (FK: Pembuat Usulan Unit)
[17] users.id                         ──1:N──→  requisitions.verified_by_perencanaan_id (FK: Verifikator Perencanaan)
[18] users.id                         ──1:N──→  requisitions.approved_by_keuangan_id    (FK: Pencair SP2D Keuangan)

[19] requisitions.id                  ──1:N──→  requisition_details.requisition_id (FK: CASCADE DELETE)
[20] items.id                         ──1:N──→  requisition_details.item_id       (FK: SET NULL - Referensi SSH)

[21] rba_revenue_items.item_name      ──1:N──→  revenues.source                  (Logis: Target RBA vs Realisasi Kas)
```

---

## 4. Panduan Membuka & Menggunakan File ERD

### A. Untuk Presentasi Slide / Tinjauan Cepat
- Gunakan file gambar [`ERD_SIBLUD_RSJTampan_v1.0.png`](./ERD_SIBLUD_RSJTampan_v1.0.png) dengan resolusi 5600×4000 piksel yang jernih saat di-zoom.
- Untuk dokumen cetak atau lampiran laporan, gunakan [`ERD_SIBLUD_RSJTampan_v1.0.pdf`](./ERD_SIBLUD_RSJTampan_v1.0.pdf) yang berbasis vektor tanpa penurunan kualitas grafis.

### B. Untuk Mengedit di Draw.io
1. Buka peramban ke [app.diagrams.net](https://app.diagrams.net).
2. Pilih menu **File** $\rightarrow$ **Open From** $\rightarrow$ **Device...**
3. Pilih file [`ERD_SIBLUD_RSJTampan_v1.0.drawio`](./ERD_SIBLUD_RSJTampan_v1.0.drawio).

### C. Untuk Mengedit di dbdiagram.io
1. Buka peramban ke [dbdiagram.io](https://dbdiagram.io).
2. Salin seluruh isi dari file [`ERD_SIBLUD_RSJTampan_v1.0.dbml`](./ERD_SIBLUD_RSJTampan_v1.0.dbml) dan tempelkan (*paste*) pada editor teks dbdiagram di sisi kiri.
3. Diagram visual otomatis terbentuk secara rapi.

---

## 5. Konfirmasi Definisi Selesai (Definition of Done)

- [x] **1. Diagram ERD memuat seluruh 12 tabel dalam satu gambar terintegrasi**: `divisions`, `units`, `users`, `fiscal_years`, `rba_shifts`, `rba_expense_items`, `rba_revenue_items`, `rba_accounts`, `items`, `requisitions`, `requisition_details`, `revenues`.
- [x] **2. Setiap tabel menampilkan spesifikasi lengkap**: Nama tabel, nama kolom, tipe data, label PK/FK, dan kondisi ENUM eksplisit.
- [x] **3. Kolom timestamp tidak ditampilkan**: Kolom `created_at` dan `updated_at` dihilangkan di semua diagram dan data dictionary.
- [x] **4. Seluruh 21 garis relasi tergambar**: Terhubung dengan kardinalitas (1:N) dan label peran yang tepat.
- [x] **5. Berkas ERD lengkap multi-format**: Tersedia dalam format PNG (4K), PDF (A2), Draw.io (.drawio), DBML (.dbml), dan Mermaid (.mmd).
- [x] **6. Tersimpan pada struktur folder standar**: Berada di dalam direktori `docs/erd/`.
- [x] **7. Tidak ada perubahan kode aplikasi**: Murni pekerjaan dokumentasi dan desain arsitektur database.
