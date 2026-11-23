import { test, expect } from '@playwright/test';
import path from 'path';

const SCREENSHOT_DIR = 'C:/Users/nabil/.gemini/antigravity/brain/9935c837-fcf5-4e66-b879-304fb9403a24/demo_screenshots';

// Shared requisition number across stages
let sharedLetterNumber = `045/DEMO/RSJ/${Date.now().toString().slice(-5)}`;
let sharedRequisitionId = '';

async function capture(page, filename) {
  await page.waitForTimeout(600);
  const filePath = path.join(SCREENSHOT_DIR, filename);
  await page.screenshot({ path: filePath, fullPage: false });
  console.log(`[Screenshot Captured]: ${filename}`);
}

const emailToNipMap = {
  'admin@rsj.com': '199001012020011014',
  'perencanaan@rsj.com': '199001012020011010',
  'keuangan@rsj.com': '199001012020011012',
  'igd@rsj.com': '199001012020011001',
  'farmasi@rsj.com': '199001012020011005',
};

async function login(page, identifier, password = 'password') {
  const loginId = emailToNipMap[identifier] || identifier;
  console.log(`Logging in as: ${loginId} (${identifier})`);
  await page.goto('/login');
  await page.waitForLoadState('networkidle');

  await page.fill('#email', loginId);
  await page.fill('#password', password);

  try {
    await page.fill('#captcha', 'TEST1');
  } catch {
    // ignore
  }

  await page.click('button[type="submit"]');
  await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 15000 });
  await page.waitForLoadState('networkidle');
  console.log(`Logged in successfully: ${page.url()}`);
}

test.describe.serial('Demonstrasi Lengkap E-BLUD RSJ Tampan', () => {

  // =========================================================================
  // TAHAP 1: ROLE ADMINISTRATOR
  // =========================================================================
  test('Tahap 1: Administrator (Setup Tahun Anggaran, Unit & Pengguna)', async ({ page }) => {
    test.setTimeout(90000);
    await page.setViewportSize({ width: 1440, height: 900 });

    console.log('\n=== TAHAP 1: ADMINISTRATOR ===');
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await capture(page, '01_login_page.png');

    await login(page, 'admin@rsj.com', 'password');
    await capture(page, '02_admin_dashboard.png');

    // 1.1 Buat Tahun Anggaran Baru
    console.log('Navigating to Fiscal Years...');
    await page.goto('/admin/fiscal-years');
    await page.waitForLoadState('networkidle');

    const btnTambahTahun = page.locator('button:has-text("Tambah Tahun Anggaran")');
    if (await btnTambahTahun.isVisible()) {
      await btnTambahTahun.click();
      await page.waitForTimeout(500);

      const inputYear = page.locator('input[type="number"][placeholder*="2027"]').first();
      if (await inputYear.isVisible()) {
        await inputYear.fill('2028');
        const inputName = page.locator('input[placeholder*="Tahun Anggaran 2027"]').first();
        if (await inputName.isVisible()) {
          await inputName.fill('Tahun Anggaran 2028');
        }
        await page.locator('button:has-text("Simpan"), button[type="submit"]:has-text("Simpan")').first().click();
        await page.waitForTimeout(1000);
        await page.waitForLoadState('networkidle');
      }
    }
    await capture(page, '03_admin_fiscal_years.png');

    // 1.2 Buat Unit Baru
    console.log('Navigating to Divisions & Units...');
    await page.goto('/admin/divisions');
    await page.waitForLoadState('networkidle');

    const btnTambahUnit = page.locator('button:has-text("Tambah Unit Kerja")').first();
    if (await btnTambahUnit.isVisible()) {
      await btnTambahUnit.click();
      await page.waitForTimeout(500);

      const selectDiv = page.locator('select').first();
      await selectDiv.selectOption({ index: 1 });

      const inputUnitName = page.locator('input[placeholder*="Instalasi Gawat Darurat"]').first();
      if (await inputUnitName.isVisible()) {
        await inputUnitName.fill('Unit Radiologi & Diagnostik');
        await page.waitForTimeout(300);
      }

      await page.locator('button[type="submit"]:has-text("Simpan")').first().click();
      await page.waitForTimeout(1000);
      await page.waitForLoadState('networkidle');
    }
    await capture(page, '04_admin_divisions_units.png');

    // 1.3 Buat Pengguna Baru
    console.log('Navigating to Users...');
    await page.goto('/admin/users');
    await page.waitForLoadState('networkidle');

    const btnTambahUser = page.locator('button:has-text("Tambah Pengguna")');
    if (await btnTambahUser.isVisible()) {
      await btnTambahUser.click();
      await page.waitForTimeout(500);

      const inputName = page.locator('input[placeholder*="dr. Hendra"]').first();
      await inputName.fill('dr. Demo Radiologi, Sp.Rad');

      const inputEmail = page.locator('input[placeholder*="nama.pegawai@rsjtampan"]').first();
      if (await inputEmail.isVisible()) {
        await inputEmail.fill('radiologi@rsj.com');
      }

      const inputPass = page.locator('input[type="password"]').first();
      if (await inputPass.isVisible()) {
        await inputPass.fill('password');
      }
      const inputPassConf = page.locator('input[type="password"]').nth(1);
      if (await inputPassConf.isVisible()) {
        await inputPassConf.fill('password');
      }

      await page.locator('button:has-text("Simpan Pengguna"), button[type="submit"]:has-text("Simpan")').first().click();
      await page.waitForTimeout(1000);
      await page.waitForLoadState('networkidle');
    }
    await capture(page, '05_admin_users.png');
  });

  // =========================================================================
  // TAHAP 2: ROLE PERENCANAAN
  // =========================================================================
  test('Tahap 2: Perencanaan (SSH Items, RBA Matrix & Cetak RBA)', async ({ page }) => {
    test.setTimeout(90000);
    await page.setViewportSize({ width: 1440, height: 900 });

    console.log('\n=== TAHAP 2: PERENCANAAN ===');
    await login(page, 'perencanaan@rsj.com', 'password');
    await capture(page, '06_perencanaan_dashboard.png');

    // 2.1 Katalog Standar Harga Satuan (SSH)
    console.log('Navigating to SSH Items...');
    await page.goto('/perencanaan/items');
    await page.waitForLoadState('networkidle');

    const btnTambahBarang = page.locator('button:has-text("Tambah Barang")');
    if (await btnTambahBarang.isVisible()) {
      await btnTambahBarang.click();
      await page.waitForTimeout(500);

      const inputItemName = page.locator('input[placeholder*="Contoh: Kertas HVS"], input[placeholder*="nama barang"]').first();
      if (await inputItemName.isVisible()) {
        await inputItemName.fill('Film Rontgen 30x40 Digital');
      }

      const inputPrice = page.locator('input[type="number"][placeholder*="0"]').first();
      if (await inputPrice.isVisible()) {
        await inputPrice.fill('350000');
      }

      const inputSpec = page.locator('textarea').first();
      if (await inputSpec.isVisible()) {
        await inputSpec.fill('Standar mutu diagnostik radiologi RSJ Tampan.');
      }

      await page.locator('button:has-text("Simpan Barang"), button[type="submit"]:has-text("Simpan")').first().click();
      await page.waitForTimeout(1000);
      await page.waitForLoadState('networkidle');
    }
    await capture(page, '07_perencanaan_ssh_items.png');

    // 2.2 Halaman RBA & Banner Keuangan
    console.log('Navigating to RBA Matrix...');
    await page.goto('/perencanaan/rba');
    await page.waitForLoadState('networkidle');
    await capture(page, '08_perencanaan_rba_matrix.png');

    // 2.3 Cetak RBA Ringkasan
    console.log('Testing Print RBA Ringkasan...');
    await page.goto('/perencanaan/rba/print-ringkasan');
    await page.waitForLoadState('networkidle');
    await capture(page, '09_print_rba_ringkasan.png');

    // 2.4 Cetak RBA Belanja
    console.log('Testing Print RBA Belanja...');
    await page.goto('/perencanaan/rba/print-belanja');
    await page.waitForLoadState('networkidle');
    await capture(page, '10_print_rba_belanja.png');
  });

  // =========================================================================
  // TAHAP 3: ROLE DIVISI / UNIT PENGAJU
  // =========================================================================
  test('Tahap 3: Unit Kerja (Buat Usulan Belanja, Rincian & Cetak Nota)', async ({ page }) => {
    test.setTimeout(90000);
    await page.setViewportSize({ width: 1440, height: 900 });

    console.log('\n=== TAHAP 3: UNIT KERJA (DIVISI) ===');
    await login(page, 'farmasi@rsj.com', 'password');
    await capture(page, '11_unit_dashboard.png');

    // 3.1 Buat Usulan Belanja
    console.log('Navigating to Requisitions...');
    await page.goto('/divisi/requisitions');
    await page.waitForLoadState('networkidle');

    const btnTambahUsulan = page.locator('button:has-text("Tambah Usulan")');
    await expect(btnTambahUsulan).toBeVisible({ timeout: 10000 });
    await btnTambahUsulan.click();
    await page.waitForTimeout(500);
    await capture(page, '12_unit_requisition_form.png');

    // Pilih Rekening Belanja
    const selectPagu = page.locator('select').first();
    const optPagu = selectPagu.locator('option').filter({ hasText: '1.1.2.1.1' }).first();
    if (await optPagu.count() > 0) {
      const val = await optPagu.getAttribute('value');
      if (val) await selectPagu.selectOption(val);
    } else {
      await selectPagu.selectOption({ index: 1 });
    }

    const inputNota = page.locator('label:has-text("No. Nota Dinas")').locator('..').locator('input');
    if (await inputNota.isVisible()) {
      await inputNota.fill(sharedLetterNumber);
    }

    const inputAlasan = page.locator('label:has-text("Catatan / Alasan Kebutuhan")').locator('..').locator('input');
    if (await inputAlasan.isVisible()) {
      await inputAlasan.fill('Kebutuhan logistik pelayanan farmasi & BHP medis operasional RSJ.');
    }

    // Tambah Item Usulan
    const inputNamaBarang = page.locator('input[placeholder*="Ketik nama barang"]');
    await inputNamaBarang.fill('Kasa Steril Hidrofil Roll E2E');

    const inputQty = page.locator('label:has-text("Volume")').locator('..').locator('input[type="number"]');
    if (await inputQty.isVisible()) {
      await inputQty.fill('25');
    }

    const inputItemPrice = page.locator('label:has-text("Harga Satuan")').locator('..').locator('input[type="number"]');
    if (await inputItemPrice.isVisible()) {
      await inputItemPrice.fill('20000');
    }

    await page.locator('button:has-text("Tambah ke Daftar Usulan")').click();
    await page.waitForTimeout(500);

    // Kirim Usulan
    const btnKirimUsulan = page.locator('button:has-text("Kirim Usulan Belanja")');
    await btnKirimUsulan.click();
    await page.waitForTimeout(1000);
    await page.waitForLoadState('networkidle');
    await capture(page, '13_unit_requisitions_list.png');

    // 3.2 Buka Detail & Cetak Nota Dinas Usulan
    console.log('Testing Unit Requisition Detail & Print...');
    const btnDetail = page.locator('tr', { hasText: sharedLetterNumber }).locator('button:has-text("Detail"), button:has-text("Rincian")').first();
    if (await btnDetail.isVisible()) {
      await btnDetail.click();
      await page.waitForTimeout(600);
      await capture(page, '14_unit_requisition_detail.png');

      const closeBtn = page.locator('button:has-text("Tutup"), button:has-text("Kembali")').first();
      if (await closeBtn.isVisible()) {
        await closeBtn.click();
      }
    }

    const printLink = page.locator('tr', { hasText: sharedLetterNumber }).locator('a:has-text("Cetak")').first();
    if (await printLink.isVisible()) {
      const printUrl = await printLink.getAttribute('href') || '';
      if (printUrl) {
        const idMatch = printUrl.match(/requisitions\/(\d+)\/print/);
        if (idMatch) sharedRequisitionId = idMatch[1];
        await page.goto(printUrl);
        await page.waitForLoadState('networkidle');
        await capture(page, '15_print_unit_requisition.png');
      }
    }
  });

  // =========================================================================
  // TAHAP 4: ROLE PERENCANAAN (Verifikasi Usulan Belanja)
  // =========================================================================
  test('Tahap 4: Perencanaan (Verifikasi SSH, Disposisi & Cek Cetak)', async ({ page }) => {
    test.setTimeout(90000);
    await page.setViewportSize({ width: 1440, height: 900 });

    console.log('\n=== TAHAP 4: PERENCANAAN (VERIFIKASI) ===');
    await login(page, 'perencanaan@rsj.com', 'password');

    await page.goto('/perencanaan/requisitions');
    await page.waitForLoadState('networkidle');
    await capture(page, '16_perencanaan_verification_list.png');

    const searchInput = page.locator('input[placeholder*="Cari nomor,"]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill(sharedLetterNumber);
      await page.waitForTimeout(500);
    }

    const btnTelaah = page.locator('tr', { hasText: sharedLetterNumber }).locator('button:has-text("Telaah")').first();
    if (await btnTelaah.isVisible()) {
      await btnTelaah.click();
      await page.waitForTimeout(600);
      await capture(page, '17_perencanaan_quick_verification_modal.png');

      const quickNotes = page.locator('#modal_notes_perencanaan');
      if (await quickNotes.isVisible()) {
        await quickNotes.fill('Diverifikasi lengkap dan disetujui untuk diproses pencairannya oleh Bagian Keuangan.');
      }

      const btnSetujui = page.locator('button:has-text("Setujui & Teruskan ke Keuangan")');
      await btnSetujui.click();
      await page.waitForTimeout(1000);
      await page.waitForLoadState('networkidle');
    }

    if (sharedRequisitionId) {
      await page.goto(`/perencanaan/requisitions/${sharedRequisitionId}/print`);
      await page.waitForLoadState('networkidle');
      await capture(page, '18_perencanaan_print_view.png');
    }
  });

  // =========================================================================
  // TAHAP 5: ROLE KEUANGAN (Validasi, SP2D, Pendapatan & Laporan)
  // =========================================================================
  test('Tahap 5: Keuangan (Kas Riil, DPA-BLUD, Pendapatan, SP2D & Laporan LRA)', async ({ page }) => {
    test.setTimeout(90000);
    await page.setViewportSize({ width: 1440, height: 900 });

    console.log('\n=== TAHAP 5: KEUANGAN ===');
    await login(page, 'keuangan@rsj.com', 'password');
    await capture(page, '19_keuangan_dashboard.png');

    // 5.1 Pagu Anggaran & DPA-BLUD
    console.log('Navigating to Budgets & DPA...');
    await page.goto('/keuangan/budgets');
    await page.waitForLoadState('networkidle');
    await capture(page, '20_keuangan_budgets_dpa.png');

    // 5.2 Pencatatan Pendapatan BLUD
    console.log('Navigating to Revenues...');
    await page.goto('/keuangan/revenues');
    await page.waitForLoadState('networkidle');

    const btnCatatPendapatan = page.locator('button:has-text("Catat Pendapatan Baru")');
    if (await btnCatatPendapatan.isVisible()) {
      await btnCatatPendapatan.click();
      await page.waitForTimeout(500);

      // Pilih Kategori & Sumber Pendapatan
      const selectCat = page.locator('form select').first();
      await selectCat.selectOption({ index: 1 });
      await page.waitForTimeout(400);

      const selectSrc = page.locator('form select').nth(1);
      if (await selectSrc.isEnabled()) {
        await selectSrc.selectOption({ index: 1 });
      }

      const inputNominal = page.locator('input[placeholder*="0"]').first();
      if (await inputNominal.isVisible()) {
        await inputNominal.fill('50000000');
      }

      const inputKet = page.locator('input[placeholder*="Contoh: Penerimaan"], textarea').first();
      if (await inputKet.isVisible()) {
        await inputKet.fill('Penerimaan Kas Layanan Medik & Farmasi Semester I');
      }

      await capture(page, '21_keuangan_revenue_modal.png');

      await page.locator('form button[type="submit"]:has-text("Catat Kas Masuk")').click();

      const btnConfirmRevenueSwal = page.locator('.swal2-confirm, button:has-text("Ya, Catat Kas Masuk")');
      if (await btnConfirmRevenueSwal.isVisible({ timeout: 5000 })) {
        await btnConfirmRevenueSwal.click();
      }

      await page.waitForTimeout(1000);
      await page.waitForLoadState('networkidle');
    }
    await capture(page, '22_keuangan_revenues_list.png');

    // 5.3 Validasi & Terbitkan SP2D
    console.log('Navigating to Keuangan Requisitions...');
    await page.goto('/keuangan/requisitions?status=Diproses_Keuangan');
    await page.waitForLoadState('networkidle');

    const btnValidasi = page.locator('tr', { hasText: sharedLetterNumber }).locator('button:has-text("Validasi & Cairkan")').or(page.locator('button:has-text("Validasi & Cairkan")')).first();
    if (await btnValidasi.isVisible()) {
      await btnValidasi.click();
      await page.waitForTimeout(600);
      await capture(page, '23_keuangan_disbursement_modal.png');

      const inputSp2d = page.locator('input[placeholder*="contoh: SP2D/BLUD/"]').first();
      if (await inputSp2d.isVisible()) {
        await inputSp2d.fill(`SP2D/BLUD/2026/${Date.now().toString().slice(-4)}`);
      }

      const inputKwitansi = page.locator('input[placeholder*="contoh: KWT/"]').first();
      if (await inputKwitansi.isVisible()) {
        await inputKwitansi.fill(`KWT/2026/${Date.now().toString().slice(-4)}`);
      }

      const btnApproveKeuangan = page.locator('button:has-text("Setujui Pencairan (Terbitkan SP2D)")');
      await btnApproveKeuangan.click();

      const btnConfirmSwal = page.locator('.swal2-confirm, button:has-text("Ya, Terbitkan SP2D & Cairkan")');
      if (await btnConfirmSwal.isVisible({ timeout: 5000 })) {
        await btnConfirmSwal.click();
      }

      await page.waitForTimeout(1500);
      await page.waitForLoadState('networkidle');
    }

    await page.goto('/keuangan/requisitions?status=Disetujui_Selesai');
    await page.waitForLoadState('networkidle');
    await capture(page, '24_keuangan_requisitions_disbursed.png');

    // 5.4 Cetak SP2D / Kuitansi
    const printKeuanganLink = page.locator('tr', { hasText: sharedLetterNumber }).locator('a:has-text("Cetak")').or(page.locator('a:has-text("Cetak")')).first();
    if (await printKeuanganLink.isVisible()) {
      const sp2dPrintUrl = await printKeuanganLink.getAttribute('href') || '';
      if (sp2dPrintUrl) {
        await page.goto(sp2dPrintUrl);
        await page.waitForLoadState('networkidle');
        await capture(page, '25_print_keuangan_sp2d.png');
      }
    }

    // 5.5 Laporan Realisasi Anggaran (LRA)
    console.log('Navigating to LRA Report...');
    await page.goto('/keuangan/reports');
    await page.waitForLoadState('networkidle');
    await capture(page, '26_keuangan_lra_report.png');

    // 5.6 Laporan Surplus / Defisit
    console.log('Navigating to Surplus/Defisit Report...');
    await page.goto('/keuangan/reports/surplus-deficit');
    await page.waitForLoadState('networkidle');
    await capture(page, '27_keuangan_surplus_deficit_report.png');

    // 5.7 Cetak Laporan Surplus / Defisit
    console.log('Testing Print Surplus/Defisit...');
    await page.goto('/keuangan/reports/surplus-deficit/print');
    await page.waitForLoadState('networkidle');
    await capture(page, '28_print_surplus_deficit.png');

    console.log('\n=== SELURUH DEMO FITUR SELESAI DENGAN SUKSES! ===');
  });
});
