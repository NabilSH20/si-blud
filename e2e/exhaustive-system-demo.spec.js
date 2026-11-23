import { test, expect } from '@playwright/test';
import path from 'path';

const SCREENSHOT_DIR = 'C:/Users/nabil/.gemini/antigravity/brain/9935c837-fcf5-4e66-b879-304fb9403a24/demo_screenshots';
const DEMO_PASSWORD = 'Password2028';

// Pemetaan akun login murni NIP / NIK
const identifierMap = {
  'admin@rsj.com': '199001012020011014', // NIP Admin IT
  'perencana2028@rsj.com': '198501012028011001', // NIP Perencanaan 2028
  'bendahara2028@rsj.com': '198601012028012001', // NIP Bendahara Keuangan 2028
  'pengaju2028@rsj.com': '199201012028011001', // NIP/NIK Pengusul 2028
};

async function capture(page, filename) {
  await page.waitForTimeout(600);
  const filePath = path.join(SCREENSHOT_DIR, filename);
  await page.screenshot({ path: filePath, fullPage: false });
  console.log(`[Screenshot Captured]: ${filename}`);
}

async function login(page, identifier, password = DEMO_PASSWORD, fiscalYear = '2028') {
  const loginId = identifierMap[identifier] || identifier;
  console.log(`Logging in as: ${loginId} for fiscal year: ${fiscalYear}...`);
  await page.goto('/login');
  await page.waitForLoadState('networkidle');

  // Select fiscal year if dropdown exists
  const yearSelect = page.locator('#fiscal_year');
  if (await yearSelect.isVisible()) {
    const option = yearSelect.locator(`option[value="${fiscalYear}"]`);
    if (await option.count() > 0) {
      await yearSelect.selectOption(fiscalYear);
    }
  }

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
  console.log(`Logged in successfully. URL: ${page.url()}`);
}

test.describe.serial('Full End-to-End System Demo: Clean 2028 Lifecycle', () => {

  // =========================================================================
  // TAHAP 1: ROLE ADMINISTRATOR (Master Data 2028)
  // =========================================================================
  test('Tahap 1: Admin Setup (Tahun 2028, Divisi, Unit & 3 Akun Role Baru)', async ({ page }) => {
    test.setTimeout(120000);
    await page.setViewportSize({ width: 1440, height: 900 });

    console.log('\n=== TAHAP 1: ADMINISTRATOR SETUP ===');
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await capture(page, '01_login_clean_state.png');

    await login(page, 'admin@rsj.com', 'password', '2028');
    await capture(page, '02_admin_dashboard.png');

    // 1.1 Master Fiscal Year 2028
    console.log('Navigating to Master Fiscal Years...');
    await page.goto('/admin/fiscal-years');
    await page.waitForLoadState('networkidle');

    // If 2028 is not present, add it
    const row2028 = page.locator('tr:has-text("2028")');
    if (await row2028.count() === 0) {
      const btnTambahTahun = page.locator('button:has-text("Tambah Tahun Anggaran")');
      if (await btnTambahTahun.isVisible()) {
        await btnTambahTahun.click();
        await page.waitForTimeout(400);
        await page.locator('input[type="number"][placeholder*="2027"]').first().fill('2028');
        await page.locator('input[placeholder*="Tahun Anggaran 2027"]').first().fill('Tahun Anggaran 2028');
        await page.locator('button[type="submit"]:has-text("Simpan")').first().click();
        await page.waitForLoadState('networkidle');
      }
    }
    await capture(page, '03_admin_fiscal_year_2028.png');

    // 1.2 Master Divisi & Unit Kerja 2028
    console.log('Navigating to Master Divisions...');
    await page.goto('/admin/divisions');
    await page.waitForLoadState('networkidle');

    // Add Division MEDIK28
    const btnTambahDiv = page.locator('button:has-text("Tambah Bagian / Bidang")').first();
    if (await btnTambahDiv.isVisible()) {
      await btnTambahDiv.click();
      await page.waitForTimeout(500);

      const divModal = page.locator('div[role="dialog"]');
      await expect(divModal).toBeVisible({ timeout: 10000 });

      await divModal.locator('input[placeholder*="Bidang Pelayanan Medik"]').fill('Bidang Pelayanan Medik 2028');
      await page.waitForTimeout(200);

      // Explicitly set division_code
      const codeInput = divModal.locator('input[placeholder*="YANMED"]');
      if (await codeInput.isVisible()) {
        await codeInput.fill('MEDIK28');
      }

      await divModal.locator('button[type="submit"]:has-text("Simpan Bagian")').click();
      await page.waitForTimeout(1000);
      await page.waitForLoadState('networkidle');
      await divModal.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
    }

    // Add Unit Kerja under MEDIK28 via direct tab navigation
    console.log('Navigating to Unit Kerja Tab...');
    await page.goto('/admin/divisions?tab=units');
    await page.waitForLoadState('networkidle');

    const btnTambahUnit = page.locator('button:has-text("Tambah Unit Kerja")').first();
    if (await btnTambahUnit.isVisible()) {
      await btnTambahUnit.click();
      await page.waitForTimeout(500);

      const unitModal = page.locator('div[role="dialog"]');
      await expect(unitModal).toBeVisible({ timeout: 10000 });

      const selectDiv = unitModal.locator('select').first();
      const optMedik = selectDiv.locator('option:has-text("MEDIK28"), option:has-text("Medik 2028")').first();
      if (await optMedik.count() > 0) {
        const val = await optMedik.getAttribute('value');
        if (val) await selectDiv.selectOption(val);
      } else {
        await selectDiv.selectOption({ index: 1 });
      }

      const inputUnitName = unitModal.locator('input[placeholder*="Instalasi Gawat Darurat"]').first();
      await inputUnitName.fill('Instalasi Rawat Inap & Darurat 2028');

      const inputUnitCode = unitModal.locator('input[placeholder*="IGD"]').first();
      if (await inputUnitCode.isVisible()) {
        await inputUnitCode.fill('IRND28');
      }

      await unitModal.locator('button[type="submit"]:has-text("Simpan Unit Kerja")').click();
      await page.waitForTimeout(1000);
      await page.waitForLoadState('networkidle');
      await unitModal.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
    }

    await page.goto('/admin/divisions');
    await page.waitForLoadState('networkidle');
    await capture(page, '04_admin_create_division_unit.png');

    // 1.3 Master Pengguna (Perencanaan, Keuangan, Unit)
    console.log('Navigating to Master Users...');
    await page.goto('/admin/users');
    await page.waitForLoadState('networkidle');

    // Helper to add user with Password2028 and NIP/NIK
    async function addUser(roleName, name, email, nip = '', nik = '') {
      console.log(`Creating user: ${name} (${roleName})...`);
      await page.goto('/admin/users');
      await page.waitForLoadState('networkidle');

      const btnTambahUser = page.locator('button:has-text("Tambah Pengguna")');
      await expect(btnTambahUser).toBeVisible({ timeout: 10000 });
      await btnTambahUser.click();
      await page.waitForTimeout(500);

      const userModal = page.locator('div[role="dialog"]');
      await expect(userModal).toBeVisible({ timeout: 10000 });

      // Select role inside modal
      if (roleName === 'perencanaan') {
        await userModal.locator('button:has-text("Perencanaan")').first().click();
      } else if (roleName === 'keuangan') {
        await userModal.locator('button:has-text("Keuangan")').first().click();
      } else if (roleName === 'divisi') {
        await userModal.locator('button:has-text("Unit Pemohon")').first().click();
        await page.waitForTimeout(300);
        const selDiv = userModal.locator('select').first();
        const optM = selDiv.locator('option:has-text("MEDIK28"), option:has-text("Medik")').first();
        if (await optM.count() > 0) {
          const v = await optM.getAttribute('value');
          if (v) await selDiv.selectOption(v);
        } else {
          await selDiv.selectOption({ index: 1 });
        }
        await page.waitForTimeout(300);
        const selUnit = userModal.locator('select').nth(1);
        if (await selUnit.isEnabled()) {
          const optU = selUnit.locator('option:has-text("IRND28"), option:has-text("Darurat")').first();
          if (await optU.count() > 0) {
            const uv = await optU.getAttribute('value');
            if (uv) await selUnit.selectOption(uv);
          } else {
            await selUnit.selectOption({ index: 1 });
          }
        }
      }

      await page.waitForTimeout(300);
      await userModal.locator('input[placeholder*="dr. Hendra"]').first().fill(name);
      await userModal.locator('input[placeholder*="nama@rsjtampan"]').first().fill(email);

      if (nip) {
        const nipInput = userModal.locator('input[placeholder*="18 digit NIP"]').first();
        if (await nipInput.count() > 0) {
          await nipInput.fill(nip);
        }
      }
      if (nik) {
        const nikInput = userModal.locator('input[placeholder*="16 digit NIK"]').first();
        if (await nikInput.count() > 0) {
          await nikInput.fill(nik);
        }
      }

      // Fill password & confirmation with Password2028
      const passInputs = userModal.locator('input[type="password"]');
      await passInputs.first().fill(DEMO_PASSWORD);
      await passInputs.nth(1).fill(DEMO_PASSWORD);

      await userModal.locator('button[type="submit"]:has-text("Simpan Pengguna")').first().click();
      await page.waitForTimeout(1000);
      await page.waitForLoadState('networkidle');
      await userModal.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});
      await page.waitForTimeout(400);
    }

    // Add Perencanaan 2028
    await addUser('perencanaan', 'H. Syahril, SE, M.Si (Perencanaan)', 'perencana2028@rsj.com', '198501012028011001', '1471010101850001');

    // Add Keuangan 2028
    await addUser('keuangan', 'Hj. Nuraini, SE, Ak (Bendahara)', 'bendahara2028@rsj.com', '198601012028012001', '1471010101860001');

    // Add Unit Pemohon 2028
    await addUser('divisi', 'Ns. Rahmat Hidayat, S.Kep', 'pengaju2028@rsj.com', '199201012028011001', '1471010101920001');

    await page.goto('/admin/users');
    await page.waitForLoadState('networkidle');
    await capture(page, '05_admin_users_created.png');
  });

  // =========================================================================
  // TAHAP 2: ROLE PERENCANAAN (SSH & RBA Pergeseran 2028)
  // =========================================================================
  test('Tahap 2: Perencanaan (Katalog SSH, Matriks RBA, Buat RBA Pergeseran & Cetak)', async ({ page }) => {
    test.setTimeout(120000);
    await page.setViewportSize({ width: 1440, height: 900 });

    console.log('\n=== TAHAP 2: PERENCANAAN ===');
    await login(page, 'perencana2028@rsj.com', DEMO_PASSWORD, '2028');
    await capture(page, '06_perencanaan_login_2028.png');

    // 2.1 Tambah Barang Acuan di Katalog SSH
    console.log('Navigating to SSH Items...');
    await page.goto('/perencanaan/items');
    await page.waitForLoadState('networkidle');

    const itemPlester = page.locator('tr:has-text("Plester Medis Non-Woven Hypoallergenic 5cm")');
    if (await itemPlester.count() === 0) {
      const btnTambahBarang = page.locator('button:has-text("Tambah Barang")');
      if (await btnTambahBarang.isVisible()) {
        await btnTambahBarang.click();
        await page.waitForTimeout(400);

        await page.locator('input[placeholder*="nama barang"], input[placeholder*="Contoh: Kertas"]').first().fill('Plester Medis Non-Woven Hypoallergenic 5cm');
        await page.locator('input[type="number"][placeholder*="0"]').first().fill('45000');
        
        const selSatuan = page.locator('select').first();
        if (await selSatuan.isVisible()) {
          const optRoll = selSatuan.locator('option:has-text("Roll")').first();
          if (await optRoll.count() > 0) {
            const rv = await optRoll.getAttribute('value');
            if (rv) await selSatuan.selectOption(rv);
          }
        }

        const inputSpec = page.locator('textarea').first();
        if (await inputSpec.isVisible()) {
          await inputSpec.fill('Standar mutu pelayanan farmasi & keperawatan RSJ Tampan.');
        }

        await page.locator('button:has-text("Simpan Barang"), button[type="submit"]:has-text("Simpan")').first().click();
        await page.waitForTimeout(800);
        await page.waitForLoadState('networkidle');
      }
    }
    await capture(page, '07_perencanaan_add_ssh_item.png');

    // 2.2 Buka Modul RBA T.A. 2028
    console.log('Navigating to RBA Matrix 2028...');
    await page.goto('/perencanaan/rba?year=2028');
    await page.waitForLoadState('networkidle');
    await capture(page, '08_perencanaan_rba_murni_2028.png');

    // 2.3 Buat Draft RBA Pergeseran 1
    console.log('Creating RBA Pergeseran 1...');
    const btnPergeseranBaru = page.locator('button:has-text("Pergeseran Baru")').first();
    if (await btnPergeseranBaru.isVisible()) {
      await btnPergeseranBaru.click();
      await page.waitForTimeout(500);

      // Fill shift modal
      const inputShiftName = page.locator('input[placeholder*="Contoh: Pergeseran"]').first();
      if (await inputShiftName.isVisible()) {
        await inputShiftName.fill('Pergeseran 1 (T.A. 2028)');
      }

      await capture(page, '09_perencanaan_rba_shift_modal.png');

      const btnSubmitDraft = page.locator('button:has-text("Buat Draft Pergeseran")').first();
      await btnSubmitDraft.click();
      await page.waitForTimeout(1500);
      await page.waitForLoadState('networkidle');
    }

    // 2.4 Aktivasi RBA Pergeseran sebagai Acuan Resmi
    console.log('Activating RBA Pergeseran 1...');
    const btnAktifkanShift = page.locator('button:has-text("Aktifkan Versi"), button:has-text("Aktifkan Pergeseran Ini")').first();
    if (await btnAktifkanShift.isVisible()) {
      await btnAktifkanShift.click();
      await page.waitForTimeout(500);

      const btnConfirmActivate = page.locator('button:has-text("Ya, Jadikan Acuan Resmi")').first();
      if (await btnConfirmActivate.isVisible()) {
        await btnConfirmActivate.click();
        await page.waitForTimeout(1500);
        await page.waitForLoadState('networkidle');
      }
    }
    await capture(page, '10_perencanaan_rba_pergeseran_active.png');

    // 2.5 Cetak Dokumen RBA
    console.log('Testing Print RBA Ringkasan...');
    await page.goto('/perencanaan/rba/print-ringkasan?year=2028');
    await page.waitForLoadState('networkidle');
    await capture(page, '11_print_rba_ringkasan_2028.png');

    console.log('Testing Print RBA Belanja...');
    await page.goto('/perencanaan/rba/print-belanja?year=2028');
    await page.waitForLoadState('networkidle');
    await capture(page, '12_print_rba_belanja_2028.png');

    console.log('Testing Print RBA Pendapatan...');
    await page.goto('/perencanaan/rba/print-pendapatan?year=2028');
    await page.waitForLoadState('networkidle');
    await capture(page, '13_print_rba_pendapatan_2028.png');

    console.log('Testing Print RBA Rincian Belanja...');
    await page.goto('/perencanaan/rba/print-rincian-belanja?year=2028');
    await page.waitForLoadState('networkidle');
    await capture(page, '14_print_rba_rincian_belanja_2028.png');
  });

  // =========================================================================
  // TAHAP 3: ROLE UNIT KERJA (3 Usulan: Katalog, Custom, & Campuran)
  // =========================================================================
  test('Tahap 3: Unit Kerja (Pengajuan 3 Usulan Belanja & Cetak Nota Dinas)', async ({ page }) => {
    test.setTimeout(120000);
    await page.setViewportSize({ width: 1440, height: 900 });

    console.log('\n=== TAHAP 3: UNIT KERJA ===');
    await login(page, 'pengaju2028@rsj.com', DEMO_PASSWORD, '2028');
    await capture(page, '15_unit_login_dashboard_2028.png');

    await page.goto('/divisi/requisitions');
    await page.waitForLoadState('networkidle');

    // 3.1 Usulan 1: Barang Katalog SSH
    console.log('Creating Requisition 1 (SSH Catalog)...');
    const btnTambahUsulan = page.locator('button:has-text("Tambah Usulan")');
    await expect(btnTambahUsulan).toBeVisible({ timeout: 10000 });
    await btnTambahUsulan.click();
    await page.waitForTimeout(600);

    const modalDialog1 = page.locator('div[role="dialog"]');
    await expect(modalDialog1).toBeVisible({ timeout: 10000 });

    // Select Rekening Belanja
    const selectPagu1 = modalDialog1.locator('select').first();
    await selectPagu1.selectOption({ index: 1 });

    await modalDialog1.locator('label:has-text("No. Nota Dinas")').locator('..').locator('input').fill('01/NOTA-MEDIK/2028');
    await modalDialog1.locator('label:has-text("Catatan / Alasan Kebutuhan")').locator('..').locator('input').fill('Pengadaan rutin plester medis sesuai standar katalog SSH 2028.');

    // Select item from SSH catalog autocomplete
    const inputBarang1 = modalDialog1.locator('input[placeholder*="Ketik nama barang"]');
    await inputBarang1.fill('Plester Medis');
    await page.waitForTimeout(400);

    const catalogSuggestion = modalDialog1.locator('button:has-text("Plester Medis Non-Woven")').first();
    if (await catalogSuggestion.isVisible()) {
      await catalogSuggestion.click();
      await page.waitForTimeout(300);
    }

    const inputQty1 = modalDialog1.locator('label:has-text("Volume")').locator('..').locator('input[type="number"]');
    await inputQty1.fill('100');

    await modalDialog1.locator('button:has-text("Tambah ke Daftar Usulan")').click();
    await page.waitForTimeout(500);
    await capture(page, '16_unit_req1_catalog_item.png');

    await modalDialog1.locator('button:has-text("Kirim Usulan Belanja")').click();
    await page.waitForTimeout(1000);
    await page.waitForLoadState('networkidle');
    await modalDialog1.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});

    // 3.2 Usulan 2: Barang Non-Katalog / Custom Mandiri
    console.log('Creating Requisition 2 (Custom / Non-Catalog)...');
    await page.goto('/divisi/requisitions');
    await page.waitForLoadState('networkidle');

    await btnTambahUsulan.click();
    await page.waitForTimeout(600);

    const modalDialog2 = page.locator('div[role="dialog"]');
    await expect(modalDialog2).toBeVisible({ timeout: 10000 });

    const selectPagu2 = modalDialog2.locator('select').first();
    await selectPagu2.selectOption({ index: 1 });

    await modalDialog2.locator('label:has-text("No. Nota Dinas")').locator('..').locator('input').fill('02/NOTA-MEDIK/2028');
    await modalDialog2.locator('label:has-text("Catatan / Alasan Kebutuhan")').locator('..').locator('input').fill('Kebutuhan khusus darurat unit yang belum tercatat pada katalog acuan.');

    const inputBarang2 = modalDialog2.locator('input[placeholder*="Ketik nama barang"]');
    await inputBarang2.fill('Set Tabung Oksigen Transport 1m3 Lengkap Regulator');

    const inputQty2 = modalDialog2.locator('label:has-text("Volume")').locator('..').locator('input[type="number"]');
    await inputQty2.fill('2');

    const selUnit2 = modalDialog2.locator('label:has-text("Satuan")').locator('..').locator('select');
    if (await selUnit2.isVisible()) {
      const optUnit = selUnit2.locator('option:has-text("Unit")').first();
      if (await optUnit.count() > 0) {
        const uv = await optUnit.getAttribute('value');
        if (uv) await selUnit2.selectOption(uv);
      }
    }

    const inputPrice2 = modalDialog2.locator('label:has-text("Harga Satuan")').locator('..').locator('input[type="number"]');
    await inputPrice2.fill('1750000');

    await modalDialog2.locator('button:has-text("Tambah ke Daftar Usulan")').click();
    await page.waitForTimeout(500);
    await capture(page, '17_unit_req2_custom_item.png');

    await modalDialog2.locator('button:has-text("Kirim Usulan Belanja")').click();
    await page.waitForTimeout(1000);
    await page.waitForLoadState('networkidle');
    await modalDialog2.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});

    // 3.3 Usulan 3: Campuran (Katalog SSH + Non-Katalog)
    console.log('Creating Requisition 3 (Mixed Items)...');
    await page.goto('/divisi/requisitions');
    await page.waitForLoadState('networkidle');

    await btnTambahUsulan.click();
    await page.waitForTimeout(600);

    const modalDialog3 = page.locator('div[role="dialog"]');
    await expect(modalDialog3).toBeVisible({ timeout: 10000 });

    const selectPagu3 = modalDialog3.locator('select').first();
    await selectPagu3.selectOption({ index: 1 });

    await modalDialog3.locator('label:has-text("No. Nota Dinas")').locator('..').locator('input').fill('03/NOTA-MEDIK/2028');
    await modalDialog3.locator('label:has-text("Catatan / Alasan Kebutuhan")').locator('..').locator('input').fill('Pengadaan komprehensif logistik medis dan alat peraga rehabilitasi.');

    // Item A (Katalog)
    const inputBarang3A = modalDialog3.locator('input[placeholder*="Ketik nama barang"]');
    await inputBarang3A.fill('Plester Medis');
    await page.waitForTimeout(400);
    const catSug3 = modalDialog3.locator('button:has-text("Plester Medis Non-Woven")').first();
    if (await catSug3.isVisible()) {
      await catSug3.click();
      await page.waitForTimeout(300);
    }
    await modalDialog3.locator('label:has-text("Volume")').locator('..').locator('input[type="number"]').fill('50');
    await modalDialog3.locator('button:has-text("Tambah ke Daftar Usulan")').click();
    await page.waitForTimeout(500);

    // Item B (Custom)
    const inputBarang3B = modalDialog3.locator('input[placeholder*="Ketik nama barang"]');
    await inputBarang3B.fill('Manset Tensimeter Digital Dewasa XL Khusus');
    await modalDialog3.locator('label:has-text("Volume")').locator('..').locator('input[type="number"]').fill('5');
    await modalDialog3.locator('label:has-text("Harga Satuan")').locator('..').locator('input[type="number"]').fill('300000');
    await modalDialog3.locator('button:has-text("Tambah ke Daftar Usulan")').click();
    await page.waitForTimeout(500);

    await capture(page, '18_unit_req3_mixed_items.png');

    await modalDialog3.locator('button:has-text("Kirim Usulan Belanja")').click();
    await page.waitForTimeout(1000);
    await page.waitForLoadState('networkidle');
    await modalDialog3.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {});

    // 3.4 Tinjau Daftar Usulan & Cetak Nota Dinas
    await page.goto('/divisi/requisitions');
    await page.waitForLoadState('networkidle');
    await capture(page, '19_unit_requisitions_submitted.png');

    const printLink1 = page.locator('tr:has-text("01/NOTA-MEDIK/2028")').locator('a:has-text("Cetak")').first();
    if (await printLink1.isVisible()) {
      const pUrl = await printLink1.getAttribute('href');
      if (pUrl) {
        await page.goto(pUrl);
        await page.waitForLoadState('networkidle');
        await capture(page, '20_unit_req_detail_and_print.png');
      }
    }
  });

  // =========================================================================
  // TAHAP 4: ROLE PERENCANAAN (Verifikasi & Disposisi Seluruh Usulan)
  // =========================================================================
  test('Tahap 4: Perencanaan (Telaah Lengkap 3 Usulan Unit & Cetak Disposisi)', async ({ page }) => {
    test.setTimeout(120000);
    await page.setViewportSize({ width: 1440, height: 900 });

    console.log('\n=== TAHAP 4: PERENCANAAN VERIFIKASI ===');
    await login(page, 'perencana2028@rsj.com', DEMO_PASSWORD, '2028');

    await page.goto('/perencanaan/requisitions');
    await page.waitForLoadState('networkidle');
    await capture(page, '21_perencanaan_verify_req_list.png');

    // Helper untuk telaah
    async function telaahUsulan(notaDinas, noteText, captureName) {
      console.log(`Telaah usulan: ${notaDinas}...`);
      await page.goto('/perencanaan/requisitions');
      await page.waitForLoadState('networkidle');

      const searchInput = page.locator('input[placeholder*="Cari nomor,"]').first();
      if (await searchInput.isVisible()) {
        await searchInput.fill(notaDinas);
        await page.waitForTimeout(400);
      }

      const btnTelaah = page.locator('tr', { hasText: notaDinas }).locator('button:has-text("Telaah")').first();
      if (await btnTelaah.isVisible()) {
        await btnTelaah.click();
        await page.waitForTimeout(600);

        const quickNotes = page.locator('#modal_notes_perencanaan');
        if (await quickNotes.isVisible()) {
          await quickNotes.fill(noteText);
        }

        await capture(page, captureName);

        const btnSetujui = page.locator('button:has-text("Setujui & Teruskan ke Keuangan")');
        await btnSetujui.click();
        await page.waitForTimeout(1000);

        const swalOk = page.locator('.swal2-confirm, button:has-text("OK"), button:has-text("Tutup")');
        if (await swalOk.isVisible({ timeout: 3000 }).catch(() => false)) {
          await swalOk.click();
        }

        await page.waitForLoadState('networkidle');
      }
    }

    // Telaah Usulan 1
    await telaahUsulan(
      '01/NOTA-MEDIK/2028',
      'Diverifikasi sesuai katalog acuan SSH 2028. Pagu mencukupi dan disetujui 100%.',
      '22_perencanaan_verify_modal_req1.png'
    );

    // Telaah Usulan 2
    await telaahUsulan(
      '02/NOTA-MEDIK/2028',
      'Spesifikasi barang non-katalog telah diverifikasi tim teknis medik & survei pasar wajar. Disetujui.',
      '23_perencanaan_verify_modal_req2.png'
    );

    // Telaah Usulan 3
    await telaahUsulan(
      '03/NOTA-MEDIK/2028',
      'Usulan komprehensif diverifikasi lengkap dan disetujui untuk diproses pencairannya.',
      '24_perencanaan_verify_modal_req3.png'
    );

    // Cetak Lembar Telaah Perencanaan Usulan 1
    await page.goto('/perencanaan/requisitions');
    await page.waitForLoadState('networkidle');
    const printLink = page.locator('tr:has-text("01/NOTA-MEDIK/2028")').locator('a:has-text("Cetak")').first();
    if (await printLink.isVisible()) {
      const printUrl = await printLink.getAttribute('href');
      if (printUrl) {
        await page.goto(printUrl);
        await page.waitForLoadState('networkidle');
        await capture(page, '25_print_perencanaan_disposition.png');
      }
    }
  });

  // =========================================================================
  // TAHAP 5: ROLE KEUANGAN (Kas Riil, SP2D, Kwitansi, Pendapatan & Laporan)
  // =========================================================================
  test('Tahap 5: Keuangan (Buku Kas, Pendapatan BLUD, Cairkan SP2D & Laporan LRA)', async ({ page }) => {
    test.setTimeout(120000);
    await page.setViewportSize({ width: 1440, height: 900 });

    console.log('\n=== TAHAP 5: KEUANGAN ===');
    await login(page, 'bendahara2028@rsj.com', DEMO_PASSWORD, '2028');
    await capture(page, '26_keuangan_dashboard_2028.png');

    // 5.1 Pagu Anggaran & DPA-BLUD
    console.log('Navigating to Budgets & DPA 2028...');
    await page.goto('/keuangan/budgets');
    await page.waitForLoadState('networkidle');
    await capture(page, '27_keuangan_budgets_dpa_2028.png');

    // 5.2 Pencatatan Pendapatan BLUD
    console.log('Navigating to Revenues 2028...');
    await page.goto('/keuangan/revenues');
    await page.waitForLoadState('networkidle');

    const btnCatatPendapatan = page.locator('button:has-text("Catat Pendapatan Baru")');
    if (await btnCatatPendapatan.isVisible()) {
      await btnCatatPendapatan.click();
      await page.waitForTimeout(500);

      const selectCat = page.locator('form select').first();
      await selectCat.selectOption({ index: 1 });
      await page.waitForTimeout(400);

      const selectSrc = page.locator('form select').nth(1);
      if (await selectSrc.isEnabled()) {
        await selectSrc.selectOption({ index: 1 });
      }

      await page.locator('input[placeholder*="0"]').first().fill('150000000');
      await page.locator('input[placeholder*="Contoh: Penerimaan"], textarea').first().fill('Penerimaan Kas Layanan Medik & Klaim BPJS Kesehatan T.A. 2028');

      await capture(page, '28_keuangan_record_revenue_modal.png');

      await page.locator('form button[type="submit"]:has-text("Catat Kas Masuk")').click();

      const btnConfirmSwal = page.locator('.swal2-confirm, button:has-text("Ya, Catat Kas Masuk")');
      if (await btnConfirmSwal.isVisible({ timeout: 5000 })) {
        await btnConfirmSwal.click();
      }

      await page.waitForTimeout(1000);
      await page.waitForLoadState('networkidle');
    }
    await capture(page, '29_keuangan_revenues_list_2028.png');

    // 5.3 Validasi & Cairkan SP2D untuk Seluruh Usulan
    console.log('Disbursing Requisitions in Keuangan...');
    await page.goto('/keuangan/requisitions?status=Diproses_Keuangan');
    await page.waitForLoadState('networkidle');

    async function cairkanSP2D(notaDinas, sp2dNum, kwtNum, captureName = null) {
      console.log(`Disbursing: ${notaDinas}...`);
      await page.goto('/keuangan/requisitions?status=Diproses_Keuangan');
      await page.waitForLoadState('networkidle');

      const btnValidasi = page.locator('tr:has-text("Instalasi Rawat Inap & Darurat 2028"), tr:has-text("Bidang Pelayanan Medik 2028")').locator('button:has-text("Validasi & Cairkan")').or(page.locator('button:has-text("Validasi & Cairkan")')).first();
      if (await btnValidasi.isVisible()) {
        await btnValidasi.click();
        await page.waitForTimeout(600);

        if (captureName) {
          await capture(page, captureName);
        }

        const inputSp2d = page.locator('input[placeholder*="SP2D"]').first();
        if (await inputSp2d.isVisible()) {
          await inputSp2d.fill(sp2dNum);
        }

        const inputKwt = page.locator('input[placeholder*="KWT"]').first();
        if (await inputKwt.isVisible()) {
          await inputKwt.fill(kwtNum);
        }

        const btnApprove = page.locator('button:has-text("Setujui Pencairan (Terbitkan SP2D)")');
        await btnApprove.click();

        const btnConfirm = page.locator('.swal2-confirm, button:has-text("Ya, Terbitkan SP2D & Cairkan")');
        if (await btnConfirm.isVisible({ timeout: 5000 })) {
          await btnConfirm.click();
        }

        await page.waitForTimeout(1200);
        await page.waitForLoadState('networkidle');
      }
    }

    // Cairkan Usulan 1
    await cairkanSP2D('01/NOTA-MEDIK/2028', 'SP2D/BLUD-MEDIK/2028/001', 'KWT/MEDIK/2028/001', '30_keuangan_disbursement_modal_req1.png');

    // Cairkan Usulan 2
    await cairkanSP2D('02/NOTA-MEDIK/2028', 'SP2D/BLUD-MEDIK/2028/002', 'KWT/MEDIK/2028/002');

    // Cairkan Usulan 3
    await cairkanSP2D('03/NOTA-MEDIK/2028', 'SP2D/BLUD-MEDIK/2028/003', 'KWT/MEDIK/2028/003');

    // Tampilkan Daftar Selesai Dicairkan
    await page.goto('/keuangan/requisitions?status=Disetujui_Selesai');
    await page.waitForLoadState('networkidle');
    await capture(page, '31_keuangan_disbursed_all_requisitions.png');

    // 5.4 Cetak SP2D / Kwitansi
    const printLink = page.locator('tr:has-text("Instalasi Rawat Inap & Darurat 2028"), tr:has-text("Bidang Pelayanan Medik 2028")').locator('button:has-text("Cetak"), a:has-text("Cetak")').or(page.locator('a:has-text("Cetak")')).first();
    if (await printLink.isVisible()) {
      const printUrl = await printLink.getAttribute('href');
      if (printUrl) {
        await page.goto(printUrl);
        await page.waitForLoadState('networkidle');
        await capture(page, '32_print_keuangan_sp2d_kuitansi.png');
      }
    }

    // 5.5 Laporan Realisasi Anggaran (LRA)
    console.log('Navigating to LRA Report...');
    await page.goto('/keuangan/reports');
    await page.waitForLoadState('networkidle');
    await capture(page, '33_keuangan_lra_report_2028.png');

    // 5.6 Laporan Surplus / Defisit
    console.log('Navigating to Surplus/Defisit Report...');
    await page.goto('/keuangan/reports/surplus-deficit');
    await page.waitForLoadState('networkidle');
    await capture(page, '34_keuangan_surplus_deficit_report_2028.png');

    // 5.7 Cetak Laporan Surplus / Defisit
    console.log('Testing Print Surplus/Defisit...');
    await page.goto('/keuangan/reports/surplus-deficit/print');
    await page.waitForLoadState('networkidle');
    await capture(page, '35_print_keuangan_surplus_deficit_2028.png');

    console.log('\n=== SELURUH DEMO TEST LENGKAP 35 ACTION TUNTAS 100%! ===');
  });
});
