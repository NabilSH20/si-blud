import zlib
import base64
import string

def encode_plantuml(text):
    zlibbed_str = zlib.compress(text.encode('utf-8'))
    compressed_string = zlibbed_str[2:-4]
    
    b64 = base64.b64encode(compressed_string).decode('ascii')
    
    # PlantUML custom base64 encoding map
    b64_chars = string.ascii_uppercase + string.ascii_lowercase + string.digits + '+/'
    plantuml_chars = string.digits + string.ascii_uppercase + string.ascii_lowercase + '-_'
    
    translation_table = str.maketrans(b64_chars, plantuml_chars)
    return b64.translate(translation_table)

uml = """@startuml
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
"""

encoded = encode_plantuml(uml)
print(f"https://www.plantuml.com/plantuml/png/{encoded}")
