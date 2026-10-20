# PRD: Kesiapan Produksi — Lanjutan (A11–A13)

| | |
|---|---|
| **Proyek** | SI BLUD RSJ Tampan Riau (`si-blud`) |
| **Dasar** | Review Fase 3 dari `PRD_Kesiapan_Produksi_SI_BLUD.md` dan keputusan pemilik produk |
| **Status** | Belum dikerjakan |

## 1. Keputusan pemilik produk yang menjadi dasar

- Reset password **hanya oleh Admin**. Lupa-password lewat email dinonaktifkan (alasan: `MAIL_MAILER=log` menulis tautan reset ke file log, dan email staf di data demo fiktif).
- Hapus-akun-sendiri dicabut (sudah selesai di A6).
- Captcha dipertahankan apa adanya.
- Paksa ganti password saat login pertama: ya (A12).
- Jejak audit aksi sensitif: PRD terpisah, setelah hosting diputuskan.

## 2. A11. P1. Matikan lupa-password, reset hanya oleh Admin

**Requirement**
1. Hapus route `password.request`, `password.email`, `password.reset`, `password.store` dari `routes/auth.php`.
2. Hapus **semua** pemakaiannya di frontend. Jalankan:
   ```
   Get-ChildItem resources\js -Recurse -Include *.jsx,*.js | Select-String -Pattern "password.request|password.email|password.reset|password.store|forgot-password|reset-password"
   ```
   Ziggy melempar galat untuk nama route yang tidak ada, sehingga satu sisa pemanggilan `route('password.request')` bisa membuat halaman login kosong (pola yang sama dengan insiden route `sahkan`). Tautan "Lupa kata sandi?" di `Login.jsx` diganti teks biasa: "Lupa kata sandi? Hubungi Administrator SIM-RS."
3. Hapus halaman `Auth/ForgotPassword.jsx` dan `Auth/ResetPassword.jsx`, serta controller `PasswordResetLinkController` dan `NewPasswordController`.
4. `PasswordResetTest` (4 test) **tidak dihapus**: ubah menjadi 4 test yang memastikan masing-masing route sekarang mengembalikan 404. Jumlah test tidak boleh turun.
5. Tambahkan test: Admin mengisi password baru untuk user lain lewat `UserController::update`, lalu user itu bisa login dengan password baru dan gagal dengan yang lama.

**Acceptance criteria**
- `php artisan route:list --name=password` hanya menampilkan `password.update`, `password.confirm`.
- `npm run build` sukses, dan halaman `/login` terbuka normal (agent melaporkan hasil `grep` di atas dan hasil build).
- `php artisan test` hijau.

## 3. A12. P2. Paksa ganti password saat login pertama

**Alasan:** Admin mengetahui password awal akun yang ia buat.

**Requirement**
1. Migration baru, **aditif**: kolom `users.must_change_password` boolean default `false`. Pengguna yang sudah ada tidak terkunci. Agent melaporkan isi migration dan **tidak menjalankannya pada database `siblud`** (hanya lewat test).
2. Nilai `true` saat Admin membuat user (`UserController::store`) atau mengisi password untuk **user lain** (`UserController::update`, bila `$user->id !== auth()->id()`). Nilai `false` saat user mengganti passwordnya sendiri (`ProfileController::updatePassword`) dan untuk akun yang dibuat `app:create-admin`.
3. Middleware pada grup `web`: bila user login dan `must_change_password` true, hanya `profile.edit`, `password.update`, dan `logout` yang boleh diakses. Request lain dialihkan ke `profile.edit` dengan pesan "Anda harus mengganti kata sandi sebelum melanjutkan." Tidak boleh ada loop pengalihan.
4. `Profile/Edit.jsx` menampilkan pesan itu di atas form kata sandi.

**Acceptance criteria**
- Test: user baru buatan Admin otomatis `true`; mengakses `/divisi/dashboard` dialihkan ke `profile.edit`; setelah mengganti password menjadi `false` dan akses pulih; `logout` tetap bisa diakses; user lama (flag `false`) tidak terdampak.
- `php artisan test` hijau.

## 4. A13. Verifikasi pasca-Fase 3 (laporkan, perbaiki hanya bila tercantum)

1. Jalankan dan tempel hasil **asli dari terminal**: `git status --short`, `git log --oneline -15`, `php artisan test`, `npm run build`.
2. Pastikan tidak ada sisa referensi frontend ke fitur yang dicabut:
   ```
   Get-ChildItem resources\js -Recurse -Include *.jsx,*.js | Select-String -Pattern "profile.destroy|DeleteUserForm"
   ```
   Hasil harus kosong.
3. Tampilkan `database/seeders/DatabaseSeeder.php` terbaru dan jelaskan test `database seeder in local seeds clean 2027 data and users`. Kalau `DatabaseSeeder` memanggil `DemoSeeder` (atau `UserSeeder`) pada environment `local`, **hapus pemanggilan itu**: `.env.example` berisi `APP_ENV=local`, jadi server yang salah konfigurasi bisa membuat akun admin berpassword `password`. Seeder demo hanya dijalankan manual dengan `php artisan db:seed --class=DemoSeeder`.
4. Bersihkan sisa kecil: `use Illuminate\Support\Facades\Auth` yang tidak terpakai di `ProfileController`, dan `ProfileUpdateRequest.php` bila tidak dipakai di mana pun.

## 5. Batasan untuk agent

- **Dilarang menjalankan `db:seed`, `migrate`, `migrate:fresh`, atau `migrate:rollback` pada database `siblud`** (database lokal pemilik produk). Gunakan hanya SQLite in-memory dari test. Di Fase 1–3 agent melaporkan pernah menjalankan `db:seed` di database itu tanpa persetujuan.
- Laporan wajib memuat keluaran **asli** `php artisan test` (salin dari terminal, bukan ringkasan atau rekonstruksi) dan `git log --oneline`.
- Kerjakan A11, **berhenti dan laporkan**, baru A12, berhenti, baru A13.
- Satu item per commit. Test tidak boleh dihapus atau dilemahkan.
- Migration (A12) dilaporkan dulu sebelum dijalankan.

## 6. Definition of Done

- [x] A11: route lupa-password hilang, tidak ada sisa referensi frontend, build sukses
- [x] A12: Dibatalkan atas keputusan pemilik produk (tidak diperlukan agar staf tidak bingung)
- [x] A13: hasil verifikasi dilaporkan, `DatabaseSeeder` tidak memanggil seeder demo otomatis
- [x] Jumlah test tidak turun dari hasil `php artisan test` terakhir yang valid (160 test, 1244 assertions)
