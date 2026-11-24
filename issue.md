# [ISSUE / PLANNING] Restrukturisasi Alur Belanja Unit-Perencanaan, Pembersihan Komponen Warisan, dan Peningkatan Fitur Pendapatan BLUD (Target Fleksibel & Matriks Realisasi 12 Bulan)

**Tipe**: Workflow Simplification / Existing Feature Enhancement / Legacy Cleanup  
**Prioritas**: P0 - Sangat Tinggi (*Critical Feedback Stakeholder*)  
**Status**: Ready for Implementation  
**Label**: `blud-workflow`, `requisitions`, `code-cleanup`, `revenue-enhancement`, `monthly-matrix`, `surplus-deficit`  
**Target Pelaksana**: Junior Programmer & AI Model  
*(Dokumen ini merupakan panduan implementasi hasil evaluasi presentasi stakeholder. Fokus utama adalah penyederhanaan alur belanja unit ke Perencanaan, pembersihan dead code warisan, serta **mengembangkan fitur Pendapatan BLUD yang sudah ada di sistem** tanpa perlu membuat struktur kode rekening atau level yang rumit).*

---

## 1. Latar Belakang & Ringkasan Revisi

Berdasarkan hasil evaluasi presentasi bersama stakeholder RS Jiwa Tampan, sistem diselaraskan dengan tata kelola praktis BLUD:

### 1.1 Alur Pengajuan Belanja Unit: Cukup sampai Bagian Perencanaan
* **Fakta Lapangan**: Usulan belanja kebutuhan harian/rutin dari Unit Kerja (Ruangan, Instalasi, Poliklinik) **titik akhirnya adalah validasi dan persetujuan oleh Bagian Perencanaan**. Berkas **TIDAK SAMPAI KE BAGIAN KEUANGAN**.
* Ketika Bagian Perencanaan menyetujui (**ACC Final / Status: `Disetujui`**), usulan tersebut sah memotong pagu anggaran rekening RBA Belanja dan langsung diakui sebagai realisasi belanja BLUD.
* Apabila pagu belanja tidak mencukupi, Bagian Perencanaan memproses penyesuaian melalui **RBA Pergeseran**.

### 1.2 Revisi & Peningkatan Fitur Pendapatan BLUD yang Sudah Ada
* **Catatan Penting**: Sistem **TIDAK PERLU** membuat hierarki kode rekening bertingkat atau level akun (Level 1 s/d 6).
* Sistem cukup **merevisi dan memperkaya fitur Pendapatan BLUD yang sudah ada** (`RevenueController.php` & `Pages/Keuangan/Revenues/Index.jsx`):
  1. **Penyusunan Target Pendapatan Fleksibel**: Bagian Keuangan dapat menetapkan target pendapatan per pos layanan secara fleksibel dengan pilihan: **Per Minggu, Per Bulan, atau Per Tahun**.
  2. **Matriks Rekapitulasi Realisasi 12 Bulan (Januari - Desember)**: Menampilkan tabel rekapitulasi realisasi pendapatan kas masuk per pos layanan dari bulan Januari hingga Desember dibandingkan dengan target anggaran, dilengkapi total realisasi, sisa anggaran (dalam kurung jika belum tercapai), dan % capaian.
  3. **Laporan Surplus / Defisit BLUD**:
     $$\text{Surplus / (Defisit)} = \text{Total Realisasi Pendapatan BLUD} - \text{Total Belanja (Usulan yang Disetujui Perencanaan)}$$

### 1.3 Pembersihan Komponen Warisan (*Dead Code & Legacy Cleanup*)
Seluruh atribut, controller, rute, dan elemen UI warisan yang terkait verifikasi keuangan/pencairan SP2D unit **dihapus tuntas** agar tidak menimbulkan bug ketidaksinkronan query/database.

---

## 2. Alur Sistem Baru (Sebelum vs Sesudah)

```mermaid
flowchart TD
    subgraph OLD["ALUR LAMA (SALAH - DIHAPUS)"]
        direction TB
        O1["Unit Kerja Ajukan Belanja"] --> O2["Verifikasi Bag. Perencanaan"]
        O2 -->|Diteruskan| O3["Verifikasi Bag. Keuangan (DIHAPUS)"]
        O3 -->|Pencairan SP2D (DIHAPUS)| O4["Selesai Cair (DIHAPUS)"]
    end

    subgraph NEW["ALUR BARU (BENAR & RINGKAS)"]
        direction TB
        N1["Unit Kerja (Ruangan / Instalasi)<br/>Mengajukan Usulan Belanja"] --> N2["Bagian Perencanaan<br/>Telaah SSH & Sisa Pagu Belanja"]
        N2 -->|Disetujui / ACC Final| N3["Status: Disetujui (Final Sah)<br/>Otomatis Memotong Pagu RBA Belanja"]
        N2 -->|Ditolak| N4["Status: Ditolak (Kembali ke Unit)"]
        N3 -.->|Jika Pagu Kurang| N5["Proses RBA Pergeseran"]
        N3 ==>|Diakui Sebagai| N6["Realisasi Belanja Disetujui<br/>(Bahan Laporan Surplus/Defisit)"]
    end
```

---

## 3. Rencana Pembersihan Komponen Warisan (*Cleanup Plan*)

### 3.1 Basis Data (Tabel `requisitions`)
1. **Drop Kolom Warisan**:
   * Drop foreign key `requisitions_approved_by_keuangan_id_foreign`.
   * Drop kolom: `approved_by_keuangan_id`, `approved_keuangan_at`, `notes_keuangan`, `sp2d_number`, `receipt_number`.
2. **Pembersihan Enum Status**:
   * Migrasi data lama: `UPDATE requisitions SET status = 'Disetujui' WHERE status IN ('Diproses_Keuangan', 'Disetujui_Selesai');`
   * Ubah definisi enum menjadi:
     ```sql
     ALTER TABLE requisitions MODIFY COLUMN status ENUM(
         'Draft',
         'Pending_Perencanaan',
         'Disetujui',
         'Ditolak'
     ) NOT NULL DEFAULT 'Pending_Perencanaan';
     ```

### 3.2 Backend Code
1. **Hapus File**: `app/Http/Controllers/Keuangan/RequisitionController.php` *(Keuangan tidak lagi memvalidasi berkas usulan unit)*.
2. **Hapus Rute**: Bersihkan seluruh rute `keuangan.requisitions.*` dari `routes/web.php`.
3. **Model `Requisition.php`**: Hapus relasi `approvedByKeuangan()`, bersihkan `$fillable` dan `$casts`, sesuaikan konstanta status.
4. **Controller Perencanaan**: Pada `Perencanaan\RequisitionController.php::approve()`, status usulan langsung diset `Disetujui` dan langsung kurangi `remaining_budget` serta tambah `spent_budget` pada rekening belanja RBA.

### 3.3 Frontend UI
1. **Hapus Direktori**: `resources/js/Pages/Keuangan/Requisitions/` beserta modal `FinanceDisbursementModal.jsx`.
2. **Layout Keuangan (`KeuanganLayout.jsx`)**: Hapus link menu "Validasi Requisition / SP2D".
3. **Modul Unit (`Divisi/Requisitions/`)**: Hapus step 3 (Keuangan) pada stepper `Show.jsx`, tampilkan status selesai saat `Disetujui` oleh Perencanaan. Hapus filter `Diproses Keuangan` pada `Index.jsx`.
4. **Modul Perencanaan (`Perencanaan/Requisitions/Show.jsx`)**: Tombol aksi diubah menjadi "Setujui & Sahkan Pengajuan (ACC Final)".
5. **Super Admin Monitoring**: Hapus kolom SP2D dan filter status lama.

---

## 4. Peningkatan Fitur Pendapatan BLUD (Pengembangan dari Fitur Eksisting)

Pengembangan ini memanfaatkan daftar pos layanan pendapatan BLUD yang **sudah ada di sistem** (`$groupedSources` pada `RevenueController.php`):
* **Jasa Layanan**: Pelayanan Gawat Darurat (IGD), UPIP, Rawat Jalan, Rawat Inap, Napza, Rehabilitasi Psikososial, Psikologi, Konseling, Forensik Psikiatri, Laboratorium, Radiologi, Gizi, Farmasi, Rekam Medik, Ambulans.
* **Hasil Kerja Sama**: Diklat, Pemanfaatan Fasilitas RSJ Tampan, Parkir.
* **Lain-lain BLUD Sah**: Jasa Giro Rekening BLUD, Bunga Deposito, Pendapatan Lain-lain Sah.

### 4.1 Tabel Target Pendapatan: `revenue_targets`
Tabel pendukung untuk menyimpan target yang diinput oleh Bagian Keuangan:

```sql
CREATE TABLE revenue_targets (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    fiscal_year INT NOT NULL COMMENT 'Tahun Anggaran, e.g. 2027',
    source_name VARCHAR(255) NOT NULL COMMENT 'Nama Pos Layanan (sesuai daftar pos eksisting)',
    category VARCHAR(100) NOT NULL DEFAULT 'Jasa Layanan' COMMENT 'Jasa Layanan, Hasil Kerja Sama, Lain-lain BLUD Sah',
    period_type ENUM('yearly', 'monthly', 'weekly') NOT NULL DEFAULT 'monthly' COMMENT 'Tipe alokasi target',
    target_yearly DECIMAL(18, 2) NOT NULL DEFAULT 0.00 COMMENT 'Target nominal tahunan',
    
    -- Target per Bulan (Januari s/d Desember)
    target_jan DECIMAL(18, 2) NOT NULL DEFAULT 0.00,
    target_feb DECIMAL(18, 2) NOT NULL DEFAULT 0.00,
    target_mar DECIMAL(18, 2) NOT NULL DEFAULT 0.00,
    target_apr DECIMAL(18, 2) NOT NULL DEFAULT 0.00,
    target_may DECIMAL(18, 2) NOT NULL DEFAULT 0.00,
    target_jun DECIMAL(18, 2) NOT NULL DEFAULT 0.00,
    target_jul DECIMAL(18, 2) NOT NULL DEFAULT 0.00,
    target_aug DECIMAL(18, 2) NOT NULL DEFAULT 0.00,
    target_sep DECIMAL(18, 2) NOT NULL DEFAULT 0.00,
    target_oct DECIMAL(18, 2) NOT NULL DEFAULT 0.00,
    target_nov DECIMAL(18, 2) NOT NULL DEFAULT 0.00,
    target_dec DECIMAL(18, 2) NOT NULL DEFAULT 0.00,
    
    -- Breakdown mingguan (opsional format JSON: {"jan": [w1, w2, w3, w4], ...})
    weekly_breakdown JSON NULL,
    
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_target_year_source (fiscal_year, source_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### 4.2 Fitur Input Target Pendapatan Fleksibel
Pada modul Pendapatan Keuangan (`Pages/Keuangan/Revenues/`), sediakan fitur bagi staf Keuangan untuk mengelola target:
1. **Mode Tahunan**: Mengisi target tahunan per pos layanan, disediakan tombol otomatis **"Bagi Rata ke 12 Bulan"** (`target_yearly / 12`).
2. **Mode Bulanan**: Mengisi rincian per bulan (Januari s/d Desember), sistem otomatis menghitung total tahunan.
3. **Mode Mingguan**: Pengaturan breakdown mingguan per bulan untuk perkiraan kas jangka pendek.

---

## 5. Matriks Realisasi Pendapatan 12 Bulan (Januari - Desember)

Pada menu Pendapatan / Laporan Keuangan, sediakan tampilan **Matriks Realisasi 12 Bulan**:

### 5.1 Format Tabel Matriks Bulanan
Tabel menyajikan daftar pos layanan eksisting secara rapi tanpa kolom level/kode rekening yang membingungkan:

```text
+------------------------------------+-------------------+---------------------+-----+----------------------+--------------------+---------------+
| Uraian Pos Layanan Pendapatan BLUD | Target Anggaran   | REALISASI (Jan-Des) | ... | TOTAL REALISASI      | SISA TARGET        | % Capaian     |
| (Nama Pos Eksisting)               | (Target Tahunan)  | (Kolom Jan s.d Des) | ... | (Jumlah Jan s.d Des) | (Target - Real)    | (Real/Target) |
+------------------------------------+-------------------+---------------------+-----+----------------------+--------------------+---------------+
| PENDAPATAN JASA LAYANAN            | 31.393.537.914,00 | Jan: 2.154.434.994  | ... | 23.856.954.615,00    | (7.536.583.299,00) | 75,99%        |
| - Pelayanan Rawat Jalan            |  7.521.895.000,00 | Jan:   504.115.700  | ... |  3.460.744.137,00    | (4.061.150.863,00) | 46,01%        |
| - Pelayanan Rawat Inap             | 18.608.697.914,00 | Jan:   986.248.100  | ... | 15.600.973.732,00    | (3.007.724.182,00) | 83,84%        |
| - Pelayanan Farmasi                |  2.565.500.000,00 | Jan:   114.655.237  | ... |  1.576.600.861,00    |   (988.899.139,00) | 61,45%        |
| - Pelayanan Laboratorium           |    500.000.000,00 | Jan:   281.260.000  | ... |    513.155.000,00    |     13.155.000,00  | 102,63%       |
| HASIL KERJA SAMA                   |    376.350.000,00 | Jan:    34.450.000  | ... |    393.711.700,00    |     17.361.700,00  | 104,61%       |
| - Kerjasama Diklat                 |    150.000.000,00 | Jan:    32.450.000  | ... |    205.911.700,00    |     55.911.700,00  | 137,27%       |
| LAIN-LAIN BLUD SAH                 |    700.000.000,00 | Jan:     3.965.007  | ... |     53.076.745,00    |   (646.923.255,00) | 7,58%         |
| - Jasa Giro Rekening BLUD          |    400.000.000,00 | Jan:     3.965.007  | ... |     47.680.241,00    |   (352.319.759,00) | 11,92%        |
+------------------------------------+-------------------+---------------------+-----+----------------------+--------------------+---------------+
| TOTAL PENDAPATAN BLUD              | 32.469.887.914,00 | Jan: 2.192.849.994  | ... | 24.303.743.060,00    | (8.166.144.854,00) | 74,85%        |
+------------------------------------+-------------------+---------------------+-----+----------------------+--------------------+---------------+
```

### 5.2 Logika Perhitungan
1. **Target Anggaran**: Mengambil nilai `target_yearly` dari tabel `revenue_targets` per pos layanan.
2. **Realisasi Bulanan (Jan s/d Des)**: Mengambil `SUM(amount)` dari tabel `revenues` per pos (`source`) dan bulan (`MONTH(date)`).
3. **Total Realisasi**: Penjumlahan realisasi bulan 1 sampai 12.
4. **Sisa Target**: `Target Anggaran - Total Realisasi`. Jika positif (belum tercapai), tampilkan dalam tanda kurung akuntansi `(Rp xxx)`. Jika terlampaui, tampilkan positif `Rp xxx`.
5. **% Capaian**: `(Total Realisasi / Target Anggaran) * 100%`.
6. **Ekspor & Cetak**: Fitur unduh file Excel dan cetak dokumen mode lanskap ber-kop resmi RSJ Tampan.

---

## 6. Laporan Operasional Surplus / Defisit

Memperbarui formula pada `Keuangan/Reports/SurplusDeficit.jsx`:
$$\text{Surplus / (Defisit)} = \text{Total Realisasi Pendapatan BLUD} - \text{Total Belanja Disetujui}$$

* **Total Pendapatan**: Seluruh kas masuk dari tabel `revenues` pada tahun aktif.
* **Total Belanja**: Seluruh usulan belanja dari tabel `requisitions` yang berstatus `'Disetujui'` (ACC Perencanaan).

---

## 7. Inventaris Komponen yang Dibuat, Diubah, dan Dihapus

### 7.1 Komponen yang DIHAPUS (Purged)
| File / Objek | Layer | Keterangan |
| :--- | :---: | :--- |
| `app/Http/Controllers/Keuangan/RequisitionController.php` | Backend | **Hapus permanen**. Keuangan tidak lagi memproses usulan belanja unit. |
| `routes/web.php` (rute `keuangan.requisitions.*`) | Route | **Hapus rute** pencairan/verifikasi keuangan usulan unit. |
| `resources/js/Pages/Keuangan/Requisitions/` | Frontend | **Hapus folder** antrean verifikasi belanja unit dan modal SP2D. |
| Kolom `approved_by_keuangan_id`, `approved_keuangan_at`, `notes_keuangan`, `sp2d_number`, `receipt_number` | Database | **Drop kolom** dari tabel `requisitions`. |
| Enum `Diproses_Keuangan` & `Disetujui_Selesai` | Database | **Hapus enum** dari kolom `requisitions.status`. |

### 7.2 Komponen Baru yang DIBUAT (Created)
| File Path | Layer | Keterangan |
| :--- | :---: | :--- |
| `database/migrations/xxxx_xx_cleanup_requisitions_and_update_status.php` | Database | Drop kolom keuangan lama & sederhanakan enum `status`. |
| `database/migrations/xxxx_xx_create_revenue_targets_table.php` | Database | Tabel target pendapatan tahunan, bulanan, mingguan per pos layanan. |
| `database/seeders/RevenueTargetSeeder.php` | Database | Seeder target pendapatan default RSJ Tampan TA 2027. |
| `app/Models/RevenueTarget.php` | Model | Model target pendapatan BLUD. |
| `resources/js/Pages/Keuangan/Reports/RevenueMonthlyMatrix.jsx` | Frontend | Halaman matriks realisasi 12 bulan pos pendapatan vs target. |
| `resources/js/Pages/Shared/PrintRevenueMonthlyMatrix.jsx` | Frontend | Template cetak resmi matriks pendapatan 12 bulan (Landscape). |
| `tests/Feature/RevenueWorkflowAndCleanupTest.php` | Test | Pengujian alur belanja, target pendapatan, dan matriks 12 bulan. |

### 7.3 Komponen Eksisting yang DIMODIFIKASI (Updated)
| File Path | Layer | Keterangan |
| :--- | :---: | :--- |
| `app/Http/Controllers/Keuangan/RevenueController.php` | Backend | Tambahkan method simpan/update target pendapatan per pos layanan. |
| `resources/js/Pages/Keuangan/Revenues/Index.jsx` | Frontend | Tambahkan modal/tab kelola target fleksibel (tahunan, bulanan, mingguan). |
| `app/Http/Controllers/Keuangan/ReportController.php` | Backend | Tambahkan method matriks 12 bulan dan sesuaikan formula Surplus/Defisit. |
| `app/Http/Controllers/Perencanaan/RequisitionController.php` | Backend | Status approval langsung `Disetujui`, mutasikan sisa pagu `rba_accounts`. |
| `app/Models/Requisition.php` | Model | Hapus relasi keuangan lama, perbarui konstanta status. |
| `resources/js/Layouts/KeuanganLayout.jsx` | Frontend | Ganti menu validasi belanja dengan menu Matriks Pendapatan 12 Bulan. |
| `resources/js/Pages/Divisi/Requisitions/Show.jsx` & `Index.jsx` | Frontend | Hapus step 3 keuangan pada stepper, sesuaikan badge status `Disetujui`. |
| `resources/js/Pages/Perencanaan/Requisitions/Show.jsx` | Frontend | Ubah tombol menjadi "Setujui & Sahkan Pengajuan (ACC Final)". |

---

## 8. Panduan Langkah demi Langkah (*Step-by-Step Guide*)

1. **Tahap 1: Pembersihan Database & Migrasi Target**
   * Eksekusi migration drop kolom keuangan pada tabel `requisitions` dan update enum `status`.
   * Eksekusi migration tabel `revenue_targets` dan jalankan seeder default 2027.
2. **Tahap 2: Pembersihan Kode Controller & Rute Warisan**
   * Hapus `Keuangan/RequisitionController.php` dan bersihkan rute di `routes/web.php`.
   * Bersihkan model `Requisition.php`.
   * Sesuaikan `Perencanaan/RequisitionController.php` agar status langsung `Disetujui` dan pagu RBA terpotong.
3. **Tahap 3: Pembersihan Antarmuka Pengguna (UI)**
   * Hapus folder `resources/js/Pages/Keuangan/Requisitions/`.
   * Update stepper di `Divisi/Requisitions/Show.jsx` (hanya 2 langkah: Pengajuan Unit &rarr; Verifikasi Perencanaan).
   * Update menu di `KeuanganLayout.jsx`.
4. **Tahap 4: Integrasi Target Fleksibel pada Fitur Pendapatan Eksisting**
   * Pada `RevenueController.php`, sediakan endpoint untuk menyimpan target per pos layanan (tahunan, bulanan, mingguan).
   * Tambahkan modal pengelolaan target di `Keuangan/Revenues/Index.jsx` lengkap dengan tombol "Bagi Rata ke 12 Bulan".
5. **Tahap 5: Implementasi Matriks Realisasi 12 Bulan**
   * Buat method `revenueMonthlyMatrix()` di `ReportController.php`.
   * Buat halaman `RevenueMonthlyMatrix.jsx` dan template cetak landscape `PrintRevenueMonthlyMatrix.jsx`.
   * Sediakan ekspor Excel.
6. **Tahap 6: Pembaruan Laporan Surplus / Defisit**
   * Update formula di `ReportController.php::surplusDeficit()`: $\text{Realisasi Pendapatan} - \text{Belanja Disetujui}$.
7. **Tahap 7: Testing & Verifikasi**
   * Jalankan `php artisan test` dan `npm run build` untuk memastikan nol error dan nol regresi.

---

## 9. Kriteria Penerimaan (*Acceptance Criteria*)

- [ ] **Alur Belanja Unit Berhenti di Perencanaan**: Usulan belanja unit divalidasi dan di-ACC final langsung oleh Perencanaan (`status = 'Disetujui'`), tidak ada lagi antrean ke Keuangan.
- [ ] **Pagu Belanja Terpotong Otomatis**: Nilai usulan yang disetujui Perencanaan langsung memotong `remaining_budget` pada akun RBA belanja terkait.
- [ ] **Pembersihan Tuntas (0% Dead Code)**: Controller, rute, folder view keuangan lama, dan kolom SP2D pada tabel `requisitions` terhapus permanen.
- [ ] **Target Pendapatan Terintegrasi di Modul Eksisting**: Staf Keuangan dapat mengatur target pendapatan per pos layanan (tahunan, bulanan 12 bulan, mingguan) langsung di modul Pendapatan.
- [ ] **Matriks 12 Bulan Akurat & Sederhana**: Menampilkan nama pos layanan eksisting, target tahunan, realisasi 12 kolom bulan (Jan-Des), total realisasi, sisa target dalam kurung `(Rp xxx)`, dan % capaian tanpa perlu kolom level/kode rekening bertingkat.
- [ ] **Surplus / Defisit Akurat**: Menghitung selisih realisasi kas masuk pendapatan BLUD dikurangi total belanja usulan yang telah di-ACC Perencanaan.
- [ ] **Cetak & Ekspor Berfungsi**: Matriks 12 bulan dapat dicetak dalam mode lanskap ber-kop resmi dan diekspor ke Excel.
- [ ] **Zero Regressions**: Seluruh automated test lulus 100% dan aset Vite terkompilasi bersih.
