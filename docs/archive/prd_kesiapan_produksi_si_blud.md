# PRD: Kesiapan Produksi — SI BLUD RSJ Tampan Riau

| | |
|---|---|
| **Proyek** | SI BLUD RSJ Tampan Riau (`si-blud`), Laravel 13 + Inertia + React |
| **Dasar review** | `.env.example`, `config/app.php`, `config/session.php`, `composer.json`, `routes/web.php`, `routes/auth.php`, `LoginRequest`, `AuthenticatedSessionController`, `HandleInertiaRequests`, `DatabaseSeeder`, `UserSeeder`, plus seluruh review modul sebelumnya |
| **Belum direview** | `ProfileController.php`, seeder lain (`DivisionSeeder`, `UnitSeeder`, `FiscalYearSeeder`, `ItemSeeder`, `RevenueSeeder`, `RequisitionSeeder`, `RbaAccountSeeder`, `RbaPergeseran3Seeder`), keluaran `php artisan route:list` |
| **Status** | Belum ada perubahan atas temuan di dokumen ini |

## 1. Ringkasan

Dokumen ini punya tiga bagian dengan pelaksana berbeda:

- **Bagian A. Perbaikan kode** (untuk AI agent). Sembilan item, diurutkan P0 sampai P2.
- **Bagian B. Checklist operasional** (untuk Anda bersama pihak IT RS). Sebagian bergantung pada keputusan hosting yang belum diambil, jadi ditandai.
- **Bagian C. Keputusan produk** (untuk pemilik produk). Agent tidak boleh memutuskan sendiri.

Temuan paling mendesak: **seluruh 17 akun di `UserSeeder` memakai password `password`, termasuk akun admin, keuangan, dan perencanaan, dan beberapa memakai nama serta NIP pejabat sungguhan.** Login mendukung NIP, dan NIP tercetak di dokumen resmi RBA. Kalau seeder itu pernah dijalankan di server produksi, siapa pun yang membaca dokumen RBA bisa masuk sebagai Keuangan. Selain itu `updateOrCreate` menimpa password akun yang sudah ada, jadi menjalankan ulang seeder di produksi akan mereset password mereka.

## 2. Bagian A. Perbaikan kode

### A1. P0. Seeder dan akun awal produksi

**Masalah (bukti dari kode)**
- `UserSeeder`: semua akun memakai `Hash::make('password')`.
- `User::updateOrCreate(['email' => ...], $userData)`: `$userData` memuat password, jadi menjalankan ulang seeder menimpa password akun yang sudah ada.
- Nama dan NIP di seeder cocok dengan penandatangan dokumen resmi RBA (mis. NIP `197002111997031005`, `197410031993121001`).
- `DatabaseSeeder` memanggil sembilan seeder sekaligus, termasuk `RevenueSeeder` dan `RequisitionSeeder` yang kemungkinan berisi data demo.

**Langkah 0 (wajib, sebelum mengubah apa pun):** agent membaca kesembilan seeder dan melaporkan tabel klasifikasi: tiap seeder masuk **data referensi** (dibutuhkan produksi) atau **data demo**. Dugaan awal, yang harus dikonfirmasi dari isi seeder:
- Referensi: `FiscalYearSeeder`, `DivisionSeeder`, `UnitSeeder`, dan `RbaPergeseran3Seeder` (data RBA resmi, juga menjadi template tahun berikutnya lewat `ensureShiftItemsPopulated`).
- Demo: `UserSeeder`, `RevenueSeeder`, `RequisitionSeeder`.
- Belum diketahui: `ItemSeeder`, `RbaAccountSeeder`. Agent memeriksa apakah isinya data resmi atau contoh.

Pemilik produk mengonfirmasi tabel itu, baru lanjut.

**Requirement**
1. `DatabaseSeeder` hanya memanggil seeder referensi. Seeder demo dipindah ke `DemoSeeder` yang **menolak berjalan** (throw exception) saat `app()->environment('production')`.
2. Di seeder demo, tidak ada password literal `'password'` di luar environment `local` dan `testing`. Ambil dari `env('SEED_DEFAULT_PASSWORD')`, atau buat acak per akun dan tampilkan di konsol.
3. Seeder tidak boleh menimpa password akun yang sudah ada: ganti `updateOrCreate` dengan `firstOrCreate`, atau keluarkan `password` dari atribut update.
4. Seeder demo memakai nama dan NIP **fiktif**, bukan data pejabat sungguhan.
5. Buat perintah `php artisan app:create-admin` yang meminta nama, email, NIP, dan password (input tersembunyi, divalidasi aturan A5). Perintah ini menolak membuat akun dengan email yang sudah ada.
6. Nama class seeder yang dipanggil test (`DivisionSeeder`, `UnitSeeder`, `FiscalYearSeeder`, `RbaPergeseran3Seeder`, dan lainnya) **tidak boleh berubah**. Agent menjalankan `grep -rn "seed(" tests/` untuk memastikan.

**Acceptance criteria**
- Test baru: menjalankan `DatabaseSeeder` pada environment `production` tidak membuat satu pun user dengan password `password` (`Hash::check`).
- Test baru: `DemoSeeder` gagal pada environment `production`.
- Test baru: `app:create-admin` membuat admin yang bisa login, dan menolak email ganda.
- `php artisan test` hijau, jumlah test tidak berkurang dari baseline (140).

### A2. P0. Pastikan rahasia tidak pernah masuk repo (hanya verifikasi, laporkan hasilnya)

Agent menjalankan dan melaporkan hasil persisnya:
```
git ls-files | grep -E "(^|/)\.env$"
git log --all --full-history --oneline -- .env
grep -n "^\.env" .gitignore
```
Hasil yang diharapkan: dua perintah pertama kosong, dan `.gitignore` memuat `.env`. Kalau `.env` pernah ter-commit, **berhenti dan laporkan**: semua rahasia (`APP_KEY`, password database) dianggap bocor dan harus diganti.

Agent juga menambahkan `.env.production.example` sebagai dokumentasi nilai wajib produksi:
```
APP_ENV=production
APP_DEBUG=false
APP_URL=https://<isi-domain>
APP_TIMEZONE=Asia/Jakarta
APP_LOCALE=id
LOG_STACK=daily
LOG_LEVEL=warning
SESSION_SECURE_COOKIE=true
DB_USERNAME=<akun-khusus-bukan-root>
DB_PASSWORD=<kuat>
```
`.env.example` untuk pengembangan tidak diubah, kecuali kalau diperlukan oleh A3.

### A3. P1. Zona waktu dan bahasa

**Masalah**
- `config/app.php` memakai `'timezone' => 'UTC'` yang di-hardcode. Riau berada di WIB (UTC+7), jadi antara 00.00 dan 07.00 WIB "hari ini" di sistem masih kemarin. Dampak: tanggal default pendapatan (`Carbon::now()`), nomor `REV-Ymd`, angka "pendapatan hari ini", dan tanggal cetak laporan.
- `APP_LOCALE=en`. `ReportController` mencetak `Carbon::now()->translatedFormat('d F Y')`. Kemungkinan besar bulan tampil dalam bahasa Inggris di dokumen resmi. Agent harus memeriksa keluaran nyatanya, bukan menebak.

**Waktu pengerjaan penting:** lakukan **sebelum ada data produksi**. Timestamp lama yang tersimpan sebagai UTC akan terbaca sebagai WIB (selisih 7 jam) setelah zona waktu diganti. Kalau ternyata sudah ada data nyata, laporkan dulu, jangan langsung mengganti.

**Requirement**
1. `'timezone' => env('APP_TIMEZONE', 'Asia/Jakarta')`, `APP_LOCALE=id` (dengan `fallback_locale` tetap `en`).
2. Di `AppServiceProvider::boot()`, panggil `\Carbon\Carbon::setLocale(config('app.locale'))`.
3. Agent memverifikasi dengan keluaran nyata, mis. `php artisan tinker --execute="echo now()->translatedFormat('d F Y H:i');"`, dan melaporkannya.

**Acceptance criteria**
- Test baru: `now()->getTimezone()->getName()` bernilai `Asia/Jakarta`.
- Test baru: `printed_at` di laporan surplus/defisit memakai nama bulan Indonesia.
- `php artisan test` hijau. Kalau ada test yang bergantung pada tanggal dan gagal karena zona waktu, perbaiki data test-nya, bukan aturannya.

### A4. P1. Route closure, validasi tahun anggaran aktif

**Masalah**
- `routes/web.php` punya dua route berbentuk closure (`/` dan `/set-year`). Closure **menggagalkan `php artisan route:cache`**, yang merupakan langkah optimasi standar produksi (termasuk di `php artisan optimize`).
- `POST /set-year` menyimpan `$request->year` ke sesi **tanpa validasi**: bisa teks, array, tahun yang tidak ada, atau tahun yang sudah ditutup. Tidak ada celah injeksi, tetapi dampaknya halaman kosong dan perilaku aneh.
- `LoginRequest` hanya memvalidasi `fiscal_year` sebagai `nullable|integer`, juga tanpa memeriksa `fiscal_years`.

**Requirement**
1. Pindahkan `/` ke controller invokable (mis. `HomeController`) dan `/set-year` ke `ActiveYearController` dengan FormRequest. Nama route `set-year` **tetap**, karena dipakai frontend.
2. Aturan `year`: `required`, `integer`, `Rule::exists('fiscal_years', 'year')->where('is_active', true)`.
3. `LoginRequest`: `fiscal_year` diberi aturan `exists` yang sama (tetap `nullable`).
4. Agent menjalankan `php artisan route:cache`. Kalau gagal karena alasan lain (mis. nama route ganda di A9), perbaiki. Setelah itu `php artisan route:clear`.

**Acceptance criteria**
- `php artisan route:cache` sukses.
- Test baru: `year` tidak valid, array, atau tahun nonaktif ditolak dan `session('active_year')` tidak berubah. Tahun aktif diterima.
- Test `user can login with specific fiscal year` tetap lulus.

### A5. P1. Kebijakan password

**Masalah:** `UserController` hanya mensyaratkan `min:8`. `password` atau `12345678` lolos.

**Requirement**
1. Satu aturan terpusat: `Password::min(10)->letters()->mixedCase()->numbers()`. **Jangan** pakai `uncompromised()`, karena butuh koneksi internet keluar.
2. Terapkan di `Admin\UserController` (`store`, `update`), pembaruan password di `ProfileController`, dan `NewPasswordController`. Pesan galat dalam Bahasa Indonesia.
3. Test yang memakai password lemah (mis. `new-password` di `ProfileTest`) **disesuaikan data testnya**. Aturannya tidak boleh dilonggarkan supaya test lama lulus.

**Acceptance criteria**
- Test baru: `password`, `Password1` (kurang dari 10 karakter), dan `passwordpassword1` (tanpa huruf besar) ditolak. `Rahasia2026Aman` diterima.
- Jumlah test tidak berkurang.

### A6. P1. Penghapusan akun pengguna

**Masalah**
- `Admin\UserController::destroy()` hanya menjaga "tidak bisa hapus akun sendiri". `requisitions.user_id` adalah foreign key tanpa cascade (migration `create_requisitions_table`), jadi menghapus user yang pernah mengajukan usulan akan memicu **error database (500)**. Guard seperti di `DivisionController` dan `UnitController` tidak ada di sini.
- Untuk jejak audit (siapa yang memverifikasi dan menyetujui), akun yang terlibat seharusnya **dinonaktifkan, bukan dihapus**.
- Test `user can delete their account` menunjukkan setiap pengguna bisa menghapus akunnya sendiri lewat `/profile`. Itu mem-bypass kebijakan "akun dikelola Admin".

**Requirement**
1. `destroy()` menolak (dengan pesan yang menyarankan menonaktifkan) bila user punya `requisitions`, atau muncul di kolom `verified_by_perencanaan_id` / `approved_by_keuangan_id`. Agent memeriksa migration `add_verifier_fields_to_requisitions_table` untuk definisi FK-nya, lalu tetap memasang guard walau FK-nya tidak ketat.
2. Hapus fitur hapus-akun-sendiri: route `profile.destroy`, method `ProfileController::destroy`, dan komponen `DeleteUserForm.jsx` beserta pemakaiannya di `Profile/Edit.jsx`. **Default: hapus.** Pemilik produk boleh membatalkan di Bagian C.
3. Agent membaca `ProfileController` dan **melaporkan** validasi unggah avatar (jenis file, ukuran maksimum, nama file acak). Hanya laporan, perubahan menunggu persetujuan.

**Acceptance criteria**
- Test baru: menghapus user yang punya requisition ditolak dengan pesan, user tetap ada.
- Test `user can delete their account` diubah menjadi memastikan fitur itu tidak ada lagi. Jangan dihapus begitu saja.

### A7. P2. Urutan pengecekan akun nonaktif di login

**Masalah:** `LoginRequest::authenticate()` memeriksa `is_active` **sebelum** memverifikasi password, lalu menampilkan pesan khusus "Akun Anda sedang dinonaktifkan". Siapa pun bisa mengetahui akun mana yang ada dan nonaktif tanpa tahu passwordnya. Pengecekan setelah `Auth::attempt` sudah ada dan cukup.

**Requirement:** hapus blok pre-check. Pengecekan setelah login berhasil (yang melakukan `Auth::logout()` bila nonaktif) dipertahankan.

**Acceptance criteria:** test `inactive user cannot login` tetap lulus (password benar, akun nonaktif → ditolak dengan pesan nonaktif). Test baru: password salah pada akun nonaktif mendapat pesan gagal login yang sama dengan akun aktif.

**Catatan captcha (tidak perlu dikerjakan sekarang):** `renderCaptchaSvg` menulis kode captcha sebagai elemen `<text>` di dalam SVG yang dikirim ke browser, sehingga bot bisa membacanya langsung dari respons. Captcha ini menahan pengguna biasa, bukan skrip. Perlindungan sebenarnya adalah pembatas percobaan login (5 kali per email+IP) dan password kuat (A5). Lihat Bagian C untuk keputusan.

### A8. P2. Normalisasi tahun aktif di setiap request

**Masalah:** `session('active_year')` dipercaya apa adanya oleh banyak controller. Kalau Admin menonaktifkan tahun yang sedang dipakai seorang user, user itu tetap melihat data tahun tertutup sampai ia memilih ulang. Ini juga item backlog §5 dari PRD Admin. Selain itu `Divisi\DashboardController` memakai `session('active_year', date('Y'))` (tahun kalender, tanpa cast integer), berbeda dari controller lain.

**Requirement**
1. Middleware kecil pada grup `web`, setelah session dimulai: bila `session('active_year')` bukan tahun yang aktif di `fiscal_years`, ganti dengan `FiscalYear::getDefaultYear()`.
2. `Divisi\DashboardController` memakai pola yang sama dengan controller lain.

**Acceptance criteria**
- Test baru: nonaktifkan tahun, lalu request berikutnya dari user yang sesinya memakai tahun itu otomatis kembali ke tahun default.

### A9. P2. Log dan route ganda

1. Nama route `password.update` didefinisikan **dua kali**: di `routes/web.php` (grup `auth`) dan di `routes/auth.php`. Pertahankan satu. Acceptance: `php artisan route:list --name=password.update` hanya menampilkan satu baris.
2. Jalankan `php artisan route:list --except-vendor` dan **laporkan** semua route yang hanya dilindungi `auth` tanpa middleware `role:`. Daftar yang sudah diketahui: `/requisitions/{id}/print`, `/profile`, `/password`, `/set-year`, dan route auth bawaan. Kalau ada yang di luar daftar itu, laporkan.

## 3. Bagian B. Checklist operasional (Anda bersama IT RS)

Kolom **Hosting** menandai item yang bergantung pada keputusan hosting (Bagian C).

| # | Item | Penanggung jawab | Hosting? |
|---|---|---|---|
| B1 | **Web root menunjuk ke folder `public/` saja.** Kalau root proyek ikut terbuka, `.env` bisa diunduh dari browser. Uji dengan membuka `https://<domain>/.env`, hasilnya harus 404. | IT | Ya |
| B2 | `.env` produksi sesuai `.env.production.example`. `APP_KEY` baru (`php artisan key:generate`), **bukan** kunci dari komputer pengembangan. Izin file `.env` 640. | Anda + IT | Tidak |
| B3 | `APP_DEBUG=false`, `APP_ENV=production`. Uji dengan memicu satu galat: halaman tidak boleh menampilkan kode, query, atau path. | Anda | Tidak |
| B4 | HTTPS dengan sertifikat valid, redirect http→https, `SESSION_SECURE_COOKIE=true`. Bila di balik reverse proxy atau Cloudflare, tambahkan konfigurasi `trustProxies` di `bootstrap/app.php`. Tanpa itu, IP pengguna terbaca sama untuk semua orang (pembatas login jadi tidak akurat) dan tautan dibuat sebagai `http://`. | IT | Ya |
| B5 | Database memakai akun khusus (bukan `root`) dengan password kuat, hak akses hanya ke database aplikasi, dan **tidak terbuka ke jaringan luar**. | IT | Sebagian |
| B6 | **Backup database harian**, salinan disimpan di lokasi terpisah dari server utama, backup folder `storage/app/public` (foto profil), dan **uji restore minimal sekali sebelum go-live**. Backup yang belum pernah diuji restore belum bisa dianggap ada. | IT | Ya |
| B7 | Firewall: hanya port 80/443 terbuka untuk umum, SSH dibatasi ke IP tertentu. phpMyAdmin/Adminer tidak dipasang di server produksi. | IT | Ya |
| B8 | Zona waktu server `Asia/Jakarta` dan sinkronisasi jam (NTP). | IT | Ya |
| B9 | Perintah deploy: `composer install --no-dev --optimize-autoloader`, `npm ci && npm run build` (boleh di mesin lain), `php artisan migrate --force`, `php artisan storage:link` (foto profil butuh ini), `php artisan optimize`. | Anda | Tidak |
| B10 | Izin tulis folder `storage/` dan `bootstrap/cache/` hanya untuk user web server. | IT | Ya |
| B11 | Rotasi log (`LOG_STACK=daily`, simpan 30 hari) dan tentukan siapa yang memeriksa log saat ada keluhan. | IT | Tidak |
| B12 | Pemantauan sederhana (uptime check) dan nomor yang dihubungi bila sistem tidak bisa dibuka. | IT | Ya |
| B13 | Jadwal pembaruan keamanan: siapa yang menjalankan `composer audit` dan memperbarui PHP serta Laravel, dan seberapa sering. | IT | Ya |
| B14 | **Akun awal:** buat satu admin dengan `app:create-admin`. Admin membuat akun tiap bidang dengan password kuat. Pastikan **tidak ada** akun demo (`igd@rsj.com`, `admin@rsj.com`, dst.) di tabel `users`. | Anda | Tidak |
| B15 | **Rekonsiliasi data sebelum go-live:** bandingkan beberapa baris angka RBA di sistem dengan dokumen resmi (total belanja Pergeseran III: `Rp 44.191.804.836`). | Anda + Perencanaan | Tidak |
| B16 | **UAT** di database terpisah (staging): satu staf asli per peran (Admin, Unit Pengaju, Perencanaan, Keuangan) menjalankan alur lengkap dari usulan sampai pencairan. Setelah selesai, database produksi dimulai dari kosong. | Anda | Tidak |
| B17 | Rencana rollback: backup tepat sebelum deploy, dan langkah tertulis untuk kembali ke versi sebelumnya. | Anda + IT | Tidak |
| B18 | SOP singkat untuk operasional: reset password oleh Admin, menonaktifkan staf yang pindah atau keluar, menutup tahun anggaran. | Anda + Admin RS | Tidak |

## 4. Bagian C. Keputusan produk (agent jangan memutuskan sendiri)

1. **Hosting.** On-premise, VPS, atau shared hosting? Siapa yang merawat server? Apakah sistem hanya dibuka dari jaringan internal RS atau juga dari luar? Pertanyaan ke bagian IT RS atau Diskominfo Riau: adakah aturan yang mewajibkan data berada di server tertentu? Saya tidak bisa memastikan aturan itu, jadi tolong dikonfirmasi ke pihak yang memahami regulasi.
2. **Reset password.** Route lupa-password aktif, tetapi `MAIL_MAILER=log` (email hanya tertulis di file log, siapa pun yang bisa membaca log bisa mengambil tautannya) dan email di seeder fiktif. *Rekomendasi:* nonaktifkan route lupa-password, reset hanya oleh Admin lewat menu pengguna. Kalau tetap ingin lewat email: butuh SMTP resmi RS dan email asli tiap staf.
3. **Paksa ganti password saat login pertama** untuk akun buatan Admin (butuh kolom baru di `users`). *Rekomendasi:* ya, karena Admin mengetahui password awal staf.
4. **Jejak audit aksi sensitif.** Saat ini hanya persetujuan usulan yang tercatat pelakunya. Belum tercatat: siapa mengubah angka RBA yang sedang aktif, menghapus catatan pendapatan (`RevenueController::destroy` menghapus permanen), mengubah role pengguna, atau mengganti tahun default. Untuk dokumen keuangan BLUD yang bisa diperiksa BPK, ini sebaiknya ada sebelum go-live. *Rekomendasi:* PRD terpisah (soft delete untuk pendapatan dan tabel log aksi sensitif).
5. **Kerahasiaan repo GitHub.** Apakah repo `si-blud` berstatus **private**? Seeder saat ini berisi nama dan NIP pejabat sungguhan. Kalau repo pernah publik: jadikan private, ganti data seed dengan data fiktif (A1 poin 4), dan pertimbangkan membersihkan riwayat git.
6. **Captcha.** Dipertahankan apa adanya (hanya menahan pengguna biasa), atau diganti layanan seperti Cloudflare Turnstile bila sistem bisa diakses dari internet publik?
7. **Hapus akun sendiri** (A6 poin 2): setuju dihapus, atau ada alasan untuk mempertahankannya?

## 5. Batasan untuk agent

- Kerjakan berfase dan **berhenti** di akhir tiap fase untuk dilaporkan. Jangan lanjut sebelum dikonfirmasi.
  - **Fase 1:** A2 (verifikasi), lalu A1. Berhenti dan laporkan tabel klasifikasi seeder serta hasil verifikasi `.env`.
  - **Fase 2:** A3, A4, A5. Berhenti.
  - **Fase 3:** A6 sampai A9. Berhenti.
- Migration destruktif atau perubahan skema wajib dilaporkan dan disetujui dulu. Item di atas seharusnya tidak membutuhkannya.
- **Jangan menjalankan `db:seed`, `migrate:fresh`, atau seeder apa pun pada database yang berisi data tanpa persetujuan eksplisit.**
- Temuan di luar scope: berhenti dan laporkan, jangan diperbaiki dalam commit yang sama.
- Test yang gagal harus diperbaiki penyebabnya. Dilarang menghapus atau melemahkan test. Mengubah data test supaya sesuai aturan baru (A5, A3) diperbolehkan dan harus disebut jelas di laporan.
- Satu item per commit.
- Laporan tiap fase menyertakan: file yang berubah, **hasil `php artisan test` dalam format teks biasa (daftar nama test)**, dan temuan di luar scope.

## 6. Definition of Done

- [ ] A1: seeder dipisah, tidak ada password literal di luar local/testing, `app:create-admin` ada, test hijau
- [ ] A2: hasil verifikasi `.env` dilaporkan, `.env.production.example` ada
- [ ] A3: zona waktu `Asia/Jakarta`, bahasa `id`, keluaran nyata dilaporkan
- [ ] A4: `route:cache` sukses, tahun aktif divalidasi di `/set-year` dan login
- [ ] A5: kebijakan password terpusat dan teruji
- [ ] A6: guard hapus user, fitur hapus-akun-sendiri dicabut (sesuai keputusan), validasi avatar dilaporkan
- [ ] A7: pre-check akun nonaktif dihapus
- [ ] A8: middleware normalisasi tahun aktif
- [ ] A9: route ganda dibereskan, daftar route tanpa `role:` dilaporkan
- [ ] Seluruh test suite hijau, jumlah test tidak berkurang dari 140
- [ ] Bagian B terisi penanggung jawab dan tanggal
- [ ] Bagian C terjawab

## 7. Lampiran

Item yang **sudah dicek dan tidak bermasalah:** `config/app.php` memakai `debug` default `false` dan `env` default `production` (aman bila `.env` tidak menimpa); `register` dinonaktifkan; sesi diregenerasi setelah login dan di-invalidate setelah logout; cookie sesi `http_only` dan `same_site=lax`; `HandleInertiaRequests` hanya membagikan data pengguna yang sedang login, dengan `password` dan `remember_token` tersembunyi lewat `$hidden`; `composer.json` memisahkan paket pengembangan (`breeze`, `pint`, `phpunit`, dll.) ke `require-dev`.
