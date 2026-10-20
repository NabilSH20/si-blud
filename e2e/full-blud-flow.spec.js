import { test, expect } from '@playwright/test';

test.describe('Alur Lengkap Bisnis E-BLUD RSJ Tampan (Multi-Role Flow)', () => {
  test('Menjalankan siklus usulan belanja: Divisi -> Perencanaan -> Keuangan -> Laporan Surplus/Defisit', async ({ page }) => {
    test.setTimeout(90000);

    // 0. Tangkap setiap error di browser console
    const pageErrors = [];
    page.on('pageerror', (err) => {
      console.error('[Browser Console Error]:', err.message);
      pageErrors.push(err.message);
    });

    // Helper: Login
    async function login(email, password = 'password') {
      await page.goto('/login');
      await page.waitForLoadState('networkidle');

      await page.fill('#email', email);
      await page.fill('#password', password);

      // Tangani captcha (ekstrak SVG text atau gunakan bypass testing)
      try {
        const captchaElements = page.locator('div svg text');
        const count = await captchaElements.count();
        if (count > 0) {
          const texts = await captchaElements.allInnerTexts();
          const svgCode = texts.join('').trim();
          await page.fill('#captcha', svgCode || 'TEST1');
        } else {
          await page.fill('#captcha', 'TEST1');
        }
      } catch {
        await page.fill('#captcha', 'TEST1');
      }

      await page.click('button[type="submit"]');
      await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 15000 });
      await page.waitForLoadState('networkidle');
    }

    // Helper: Logout
    async function logout() {
      console.log('Logging out...');
      const profileTrigger = page.locator('header button').last();
      await profileTrigger.click();
      await page.waitForTimeout(400);

      const logoutBtn = page.locator('button:has-text("Keluar (Log Out)"), a:has-text("Keluar (Log Out)")');
      await expect(logoutBtn).toBeVisible({ timeout: 5000 });
      await logoutBtn.click();
      await page.waitForURL('**/login*', { timeout: 15000 });
      await page.waitForLoadState('networkidle');
      console.log('Logged out successfully');
    }

    const uniqueLetterNumber = `099/E2E/IGD/${Date.now().toString().slice(-6)}`;

    // =========================================================================
    // TAHAP 1: ROLE DIVISI (Input Usulan Belanja Baru)
    // =========================================================================
    console.log('--- Step 1: Login sebagai Divisi & Buat Usulan Belanja ---');
    await login('igd@rsj.com', 'password');

    // Buka menu Usulan Belanja
    await page.goto('/divisi/requisitions');
    await page.waitForLoadState('networkidle');

    // Buka Modal Tambah Usulan
    const tambahBtn = page.locator('button:has-text("Tambah Usulan")');
    await expect(tambahBtn).toBeVisible({ timeout: 10000 });
    await tambahBtn.click();

    // Tunggu modal form terbuka
    const modalTitle = page.locator('text=Formulir Usulan Belanja E-BLUD').first();
    await expect(modalTitle).toBeVisible({ timeout: 10000 });

    // Pilih Pos Rekening Belanja yang memiliki pagu aktif (BHP Medis / 1.1.2.1.1)
    const optionBhp = page.locator('select option').filter({ hasText: '1.1.2.1.1' }).first();
    if (await optionBhp.count() > 0) {
      const val = await optionBhp.getAttribute('value');
      if (val) {
        await page.locator('select').filter({ hasText: '1.1.2.1.1' }).first().selectOption(val);
        await page.waitForTimeout(300);
      }
    }

    // Isi Nomor Surat & Alasan Kebutuhan
    const inputNotaDinas = page.locator('label:has-text("No. Nota Dinas")').locator('..').locator('input');
    if (await inputNotaDinas.isVisible()) {
      await inputNotaDinas.fill(uniqueLetterNumber);
    }

    const inputUrgensi = page.locator('label:has-text("Catatan / Alasan Kebutuhan")').locator('..').locator('input');
    if (await inputUrgensi.isVisible()) {
      await inputUrgensi.fill('Kebutuhan mendesak pelayanan medis darurat IGD sesuai standar akreditasi RSJ.');
    }

    // Input rincian barang di Section 4
    const inputNamaBarang = page.locator('input[placeholder*="Ketik nama barang"]');
    await inputNamaBarang.fill('Kasa Steril Hidrofil E2E');
    await page.waitForTimeout(300);

    // Isi volume & harga satuan
    const inputQty = page.locator('label:has-text("Volume")').locator('..').locator('input[type="number"]');
    if (await inputQty.isVisible()) {
      await inputQty.fill('10');
    }

    const inputPrice = page.locator('label:has-text("Harga Satuan")').locator('..').locator('input[type="number"]');
    if (await inputPrice.isVisible()) {
      await inputPrice.fill('25000');
    }

    // Klik tombol Tambah ke Daftar Usulan
    const btnTambahKeDaftar = page.locator('button:has-text("Tambah ke Daftar Usulan")');
    await btnTambahKeDaftar.click();

    // Verifikasi item masuk ke tabel sementara
    await expect(page.locator('text=Kasa Steril Hidrofil E2E').first()).toBeVisible({ timeout: 5000 });

    // Submit usulan belanja
    const btnKirim = page.locator('button:has-text("Kirim Usulan Belanja")');
    await expect(btnKirim).toBeEnabled();
    await btnKirim.click();

    // Tunggu kembali ke halaman indeks usulan
    await page.waitForTimeout(1000);
    await page.waitForLoadState('networkidle');

    // Logout Divisi
    await logout();

    // =========================================================================
    // TAHAP 2: ROLE PERENCANAAN (Verifikasi & Telaah Teknis)
    // =========================================================================
    console.log('--- Step 2: Login sebagai Perencanaan & Verifikasi Usulan ---');
    await login('perencanaan@rsj.com', 'password');

    // Buka menu Verifikasi Usulan Belanja
    await page.goto('/perencanaan/requisitions');
    await page.waitForLoadState('networkidle');

    // Cari usulan yang baru saja dibuat
    const searchInput = page.locator('input[placeholder*="Cari nomor,"]').first();
    await searchInput.fill(uniqueLetterNumber);
    await page.waitForTimeout(500);

    // Klik tombol Telaah
    const btnTelaah = page.locator('tr', { hasText: uniqueLetterNumber }).locator('button:has-text("Telaah")').first();
    await expect(btnTelaah).toBeVisible({ timeout: 10000 });
    await btnTelaah.click();

    // Tunggu Modal Quick Verification muncul
    const quickModal = page.locator('#modal_notes_perencanaan');
    await expect(quickModal).toBeVisible({ timeout: 10000 });
    await quickModal.fill('Telah ditelaah dan diverifikasi sesuai prioritas rencana kerja operasional BLUD.');

    // Klik tombol Setujui & Teruskan ke Keuangan
    const btnSetujuiPerencanaan = page.locator('button:has-text("Setujui & Teruskan ke Keuangan")');
    await btnSetujuiPerencanaan.click();

    // Tunggu modal telaah tertutup setelah sukses
    await expect(page.locator('#modal_notes_perencanaan')).not.toBeVisible({ timeout: 10000 });
    await page.waitForLoadState('networkidle');

    // Logout Perencanaan
    await logout();

    // =========================================================================
    // TAHAP 3: ROLE KEUANGAN (Validasi, Terbitkan SP2D & Cek Laporan Surplus/Defisit)
    // =========================================================================
    console.log('--- Step 3: Login sebagai Keuangan, Cairkan SP2D & Cek Surplus/Defisit ---');
    await login('keuangan@rsj.com', 'password');

    // Buka daftar usulan belanja di Keuangan berstatus siap validasi
    await page.goto('/keuangan/requisitions?status=Diproses_Keuangan');
    await page.waitForLoadState('networkidle');

    // Klik tombol Validasi & Cairkan pada baris usulan pertama yang siap diproses
    const btnValidasiCairkan = page.locator('button:has-text("Validasi & Cairkan")').first();
    await expect(btnValidasiCairkan).toBeVisible({ timeout: 10000 });
    await btnValidasiCairkan.click();

    // Tunggu Modal FinanceDisbursementModal muncul
    const inputSp2d = page.locator('input[placeholder*="contoh: SP2D/BLUD/"]').first();
    await expect(inputSp2d).toBeVisible({ timeout: 10000 });
    await inputSp2d.fill(`SP2D/BLUD/E2E/${Date.now().toString().slice(-4)}`);

    // Klik tombol Setujui Pencairan (Terbitkan SP2D)
    const btnApproveKeuangan = page.locator('button:has-text("Setujui Pencairan (Terbitkan SP2D)")');
    await btnApproveKeuangan.click();

    // Konfirmasi dialog SweetAlert2
    const btnConfirmSwal = page.locator('.swal2-confirm, button:has-text("Ya, Terbitkan SP2D & Cairkan")');
    await expect(btnConfirmSwal).toBeVisible({ timeout: 5000 });
    await btnConfirmSwal.click();

    await page.waitForTimeout(1500);
    await page.waitForLoadState('networkidle');

    // =========================================================================
    // TAHAP 4: BUKA HALAMAN LAPORAN SURPLUS / DEFISIT
    // =========================================================================
    console.log('--- Step 4: Membuka Halaman Laporan Surplus/Defisit ---');
    await page.goto('/keuangan/reports/surplus-deficit');
    await page.waitForLoadState('networkidle');

    // Verifikasi elemen halaman Laporan Surplus / Defisit
    await expect(page).toHaveURL(/.*keuangan\/reports\/surplus-deficit.*/);
    const headingSurplus = page.locator('text=Laporan Operasional (Surplus / Defisit)').or(page.locator('text=Surplus / Defisit'));
    await expect(headingSurplus.first()).toBeVisible({ timeout: 10000 });

    // Pastikan tidak ada unhandled page error di console
    expect(pageErrors, `Ditemukan error console browser: ${pageErrors.join('; ')}`).toHaveLength(0);
    console.log('--- Seluruh Alur E2E BLUD Berhasil Dijalankan Tanpa Error! ---');
  });
});
