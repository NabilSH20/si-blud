<?php
function encode6bit($b) {
    if ($b < 10) return chr(48 + $b);
    $b -= 10;
    if ($b < 26) return chr(65 + $b);
    $b -= 26;
    if ($b < 26) return chr(97 + $b);
    $b -= 26;
    if ($b == 0) return '-';
    if ($b == 1) return '_';
    return '?';
}

function append3bytes($b1, $b2, $b3) {
    $c1 = $b1 >> 2;
    $c2 = (($b1 & 0x3) << 4) | ($b2 >> 4);
    $c3 = (($b2 & 0xF) << 2) | ($b3 >> 6);
    $c4 = $b3 & 0x3F;
    return encode6bit($c1 & 0x3F) . encode6bit($c2 & 0x3F) . encode6bit($c3 & 0x3F) . encode6bit($c4 & 0x3F);
}

function encodePlantuml($text) {
    $data = gzdeflate($text, 9);
    $res = '';
    $len = strlen($data);
    for ($i = 0; $i < $len; $i += 3) {
        $b1 = ord($data[$i]);
        $b2 = ($i + 1 < $len) ? ord($data[$i + 1]) : 0;
        $b3 = ($i + 2 < $len) ? ord($data[$i + 2]) : 0;
        $res .= append3bytes($b1, $b2, $b3);
    }
    return $res;
}

$uml = <<<EOD
@startuml
left to right direction
skinparam packageStyle rectangle
skinparam handwritten false
skinparam usecase {
  BackgroundColor lightcyan
  BorderColor black
}
skinparam actor {
  BackgroundColor white
  BorderColor black
}

actor "Admin" as Admin
actor "Divisi / Unit" as Divisi
actor "Bag. Perencanaan" as Perencanaan
actor "Bag. Keuangan" as Keuangan

rectangle "Sistem E-BLUD RSJ Tampan" {
  usecase "Login ke Sistem" as UC1
  usecase "Kelola User & Divisi" as UC2
  usecase "Set Tahun Anggaran" as UC3
  
  usecase "Ajukan Usulan Belanja" as UC4
  usecase "Pantau Status Usulan" as UC5
  
  usecase "Kelola Master RBA" as UC6
  usecase "Kelola Master Item" as UC7
  usecase "Verifikasi Usulan (1)" as UC8
  
  usecase "Validasi Akhir Usulan" as UC9
  usecase "Kelola Pendapatan" as UC10
  usecase "Pantau & Cetak Laporan" as UC11
}

Admin -- UC1
Admin -- UC2
Admin -- UC3

Divisi -- UC1
Divisi -- UC4
Divisi -- UC5

Perencanaan -- UC1
Perencanaan -- UC6
Perencanaan -- UC7
Perencanaan -- UC8

Keuangan -- UC1
Keuangan -- UC9
Keuangan -- UC10
Keuangan -- UC11
@enduml
EOD;

$encoded = encodePlantuml($uml);
echo "https://www.plantuml.com/plantuml/png/" . $encoded;
