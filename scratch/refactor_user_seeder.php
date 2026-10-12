<?php

$file = 'd:/Kampus/Nabil_2SIB/laragon-6.0-minimal/www/rsj-req-app/database/seeders/UserSeeder.php';
$content = file_get_contents($file);

// Replace names
$replacements = [
    "'dr. Hendra Setiawan, Sp.KJ'" => "'dr. Demo IGD, Sp.KJ'",
    "'Admin Bidang Pelayanan (IGD)'" => "'Admin Demo IGD'",
    "'dr. Maya Anggraini, Sp.KJ'" => "'dr. Demo Poli'",
    "'Ns. Rahmat Hidayat, S.Kep'" => "'Ns. Demo UPIP'",
    "'Admin Bidang Keperawatan (UPIP)'" => "'Admin Demo UPIP'",
    "'Ns. Budi Santoso, S.Kep'" => "'Ns. Demo Ranap'",
    "'apt. Siti Nurhaliza, S.Farm'" => "'apt. Demo Farmasi'",
    "'Admin Bidang Penunjang (Farmasi)'" => "'Admin Demo Penunjang'",
    "'dr. Ratna Dewi, Sp.PK'" => "'dr. Demo Lab'",
    "'Ir. Doni Prasetya, ST'" => "'Ir. Demo IPSRS'",
    "'Drs. Zulfikar, M.Pd'" => "'Drs. Demo Diklit'",
    "'Hawari Dinal, S.Sos, M.Si'" => "'Pegawai Demo Perencanaan'",
    "'Ns. Widodo, S.Kep, SH'" => "'Pegawai Demo Keuangan'",
    "'Administrator SIM-RS & E-BLUD'" => "'Admin Demo IT'",
];

foreach ($replacements as $search => $replace) {
    $content = str_replace($search, $replace, $content);
}

// Replace NIPs with fictional ones, e.g. 199001012020011001, 1002, etc.
$content = preg_replace_callback("/'nip' => '\d+'/", function($matches) {
    static $counter = 1;
    return "'nip' => '199001012020011" . str_pad($counter++, 3, '0', STR_PAD_LEFT) . "'";
}, $content);

// Change updateOrCreate to firstOrCreate
$content = str_replace('User::updateOrCreate(', 'User::firstOrCreate(', $content);

// Change password Hash::make('password') to dynamic
$passwordLogic = <<<PHP
        \$defaultPassword = app()->environment(['local', 'testing'])
            ? 'password'
            : env('SEED_DEFAULT_PASSWORD', \Illuminate\Support\Str::random(12));
        \$passwordHash = Hash::make(\$defaultPassword);

        if (!app()->environment(['local', 'testing']) && !env('SEED_DEFAULT_PASSWORD')) {
            \$this->command->info("Demo user passwords set to: " . \$defaultPassword);
        }

        \$users = [
PHP;

$content = str_replace('$users = [', $passwordLogic, $content);
$content = str_replace("Hash::make('password')", '$passwordHash', $content);

file_put_contents($file, $content);
echo "UserSeeder rewritten successfully.\n";
