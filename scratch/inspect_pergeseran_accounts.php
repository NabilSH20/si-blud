<?php

$content = file_get_contents(__DIR__ . '/../database/seeders/RbaPergeseran3Seeder.php');
preg_match_all("/'code'\s*=>\s*'([^']+)'[^\n]*\n\s*'name'\s*=>\s*'([^']+)'[^\n]*\n\s*'parent'\s*=>\s*([^,\n]+)/", $content, $matches, PREG_SET_ORDER);

echo "Found " . count($matches) . " accounts in RbaPergeseran3Seeder:\n";
foreach ($matches as $m) {
    echo sprintf("%-15s | %-12s | %s\n", $m[1], trim($m[3], "' \t\r\n"), $m[2]);
}
