<?php

$files = [
    'tests/Feature/Auth/PasswordResetTest.php',
    'tests/Feature/Auth/PasswordUpdateTest.php',
    'tests/Feature/BidangUnitHierarchyTest.php',
    'tests/Feature/UserLoginAndCrudTest.php',
    'tests/Feature/UserProfileTest.php',
];

foreach ($files as $file) {
    $path = __DIR__ . '/../' . $file;
    if (file_exists($path)) {
        $content = file_get_contents($path);
        
        // Replace 'password' => 'password' with 'Rahasia2026Aman'
        $content = preg_replace("/'password'\s*=>\s*'password'/", "'password' => 'Rahasia2026Aman'", $content);
        $content = preg_replace("/'password_confirmation'\s*=>\s*'password'/", "'password_confirmation' => 'Rahasia2026Aman'", $content);
        
        $content = preg_replace("/'password'\s*=>\s*'new-password'/", "'password' => 'RahasiaBaru2026'", $content);
        $content = preg_replace("/'password_confirmation'\s*=>\s*'new-password'/", "'password_confirmation' => 'RahasiaBaru2026'", $content);
        
        file_put_contents($path, $content);
        echo "Updated $file\n";
    }
}
