<?php

$content = file_get_contents(__DIR__ . '/../database/seeders/RbaAccountSeeder.php');
preg_match_all("/'account_code'\s*=>\s*'([^']+)'[^\n]*\n\s*'parent_code'\s*=>\s*([^,\n]+)[^\n]*\n\s*'account_name'\s*=>\s*'([^']+)'/", $content, $matches, PREG_SET_ORDER);

echo "Found " . count($matches) . " accounts in RbaAccountSeeder:\n";
foreach ($matches as $m) {
    echo sprintf("%-15s | %-12s | %s\n", $m[1], trim($m[2], "' \t\r\n"), $m[3]);
}
