<?php

$files = [
    'tests/Feature/Auth/PasswordUpdateTest.php',
    'tests/Feature/BidangUnitHierarchyTest.php',
    'tests/Feature/UserLoginAndCrudTest.php',
    'tests/Feature/UserProfileTest.php',
];

foreach ($files as $file) {
    $path = __DIR__ . '/../' . $file;
    if (file_exists($path)) {
        $content = file_get_contents($path);
        
        // Match generic weak passwords used in tests
        $content = str_replace("'new-secure-password-456'", "'RahasiaBaru2026'", $content);
        $content = str_replace("'new-password-789'", "'RahasiaGagal2026'", $content);
        $content = str_replace("'password123'", "'Rahasia2026Aman'", $content);
        
        file_put_contents($path, $content);
        echo "Updated $file\n";
    }
}
