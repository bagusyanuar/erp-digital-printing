# 📖 Panduan Referensi Atribut & Varian Produk Digital Printing

Dokumen ini berfungsi sebagai panduan referensi standar untuk melakukan input master data **Produk, Atribut, dan Variasi Harga** pada sistem ERP Digital Printing TamTech. Panduan ini disusun berdasarkan studi kasus operasional percetakan digital nyata (MMT, Kertas Sheet A3+, dan Stiker).

---

## 1. Kategori Kertas Sheet A3+ (Art Paper, Linen, dll)

Karakteristik utama kategori kertas sheet A3+ adalah opsi pencetakan satu sisi atau dua sisi yang memengaruhi harga jual secara signifikan.

### Rekomendasi Setup:
*   **Pendekatan**: Produk Tunggal dengan Variasi Sisi Cetak.
*   **Contoh Nama Produk**: `Art Paper 260g A3+` atau `Linen Paper A3+`
*   **Satuan UoM**: `pcs` / `lembar`

### Konfigurasi Varian:
*   **Nama Atribut Varian**: `Sisi Cetak`
*   **Opsi Nilai Atribut**:
    *   `1 Sisi` (Biaya tambahan: `0` / Sesuai harga dasar)
    *   `2 Sisi` (Biaya tambahan: Penyesuaian harga lembar kedua)

### Ilustrasi Struktur Payload JSON:
```json
{
  "name": "Art Paper 260g A3+",
  "category_id": "uuid-kategori-a3-plus",
  "sku": "AP-260G-A3",
  "uom": "pcs",
  "base_price": 0,
  "variants": [
    {
      "variant_name": "1 Sisi",
      "attributes": [
        {
          "attribute_id": "uuid-atribut-sisi-cetak",
          "value": "1 Sisi"
        }
      ],
      "price_tiers": [
        { "customer_level_id": "uuid-reseller", "min_qty": 1, "max_qty": 4, "price_per_unit": 3000 },
        { "customer_level_id": "uuid-end-user", "min_qty": 1, "max_qty": 4, "price_per_unit": 4000 }
      ]
    },
    {
      "variant_name": "2 Sisi",
      "attributes": [
        {
          "attribute_id": "uuid-atribut-sisi-cetak",
          "value": "2 Sisi"
        }
      ],
      "price_tiers": [
        { "customer_level_id": "uuid-reseller", "min_qty": 1, "max_qty": 4, "price_per_unit": 5200 },
        { "customer_level_id": "uuid-end-user", "min_qty": 1, "max_qty": 4, "price_per_unit": 6500 }
      ]
    }
  ]
}
```

---

## 2. Kategori Cetak Stiker A3+ (Miror, Vinyl, Transparan, Hologram)

Karakteristik stiker adalah dicetak satu sisi (karena sisi belakang berperekat), namun memiliki variasi kompleks pada **Finishing Tipe Potong** dan **Laminasi Pelindung**.

### Rekomendasi Setup (Pilihan Terbaik):
*   **Pendekatan**: Produk Terpisah Berdasarkan Jenis Bahan Stiker, dengan varian tipe potong.
*   **Contoh Nama Produk**: `Cetak Stiker Vinyl A3+`
*   **Satuan UoM**: `pcs` / `lembar`

### Konfigurasi Varian:
*   **Nama Atribut Varian**: `Finishing Potong`
*   **Opsi Nilai Atribut**:
    *   `Tanpa Potong / Lembaran` (Biaya tambahan: `0`)
    *   `Kiss Cut (Setengah Putus)` (Biaya tambahan: `+Rp 2.000` per lembar)
    *   `Die Cut (Potong Putus Satuan)` (Biaya tambahan: `+Rp 3.500` per lembar)

*(Opsional)* Anda juga dapat menyertakan atribut laminasi (`Tanpa Laminasi`, `Glossy`, `Doff`) jika ingin dihitung sebagai variasi harga di sistem.

---

## 3. Kategori Cetak Spanduk MMT / Banner Outdoor

Karakteristik utama MMT adalah harga dihitung per meter persegi (`m2`), serta adanya kebutuhan pelanggan untuk membeli **Bahan Polosan (Tanpa Cetak)** untuk keperluan proyek non-cetak.

### Rekomendasi Setup (Pendekatan Model Layanan):
Untuk kemudahan pembukuan inventaris bahan baku dan pelaporan omset jasa cetak vs penjualan barang polos, MMT direkomendasikan dibagi menjadi 2 produk terpisah:

### Produk A: `Jasa Cetak MMT Outdoor`
*   **Satuan UoM**: `m2` (Meter Persegi)
*   **Nama Atribut Varian**: `Spesifikasi Ketebalan`
*   **Opsi Nilai Varian**:
    *   `280 gr` (Harga cetak standar per meter: `Rp 14.000`)
    *   `280 gr (Dibalik)` (Harga cetak balik per meter: `Rp 19.000`)
    *   `340 gr` (Harga cetak per meter: `Rp 25.000`)
    *   `440 gr` (Harga cetak per meter: `Rp 35.000`)
    *   `Backlite - 1 Side` (Harga cetak per meter: `Rp 80.000`)
    *   `Backlite - 2 Side` (Harga cetak per meter: `Rp 100.000`)

### Produk B: `Bahan MMT Polosan (Non-Cetak)`
*   **Satuan UoM**: `m2` (Meter Persegi)
*   **Nama Atribut Varian**: `Spesifikasi Ketebalan`
*   **Opsi Nilai Varian**:
    *   `280 gr` (Harga bahan per meter: `Rp 11.000`)
    *   `340 gr` (Harga bahan per meter: `Rp 18.000`)
    *   `440 gr` (Harga bahan per meter: `Rp 22.000`)
    *   `Backlite - 1 Side` (Harga bahan per meter: `Rp 50.000`)

---

## 4. Kategori Cetak Spanduk Kain (TC & Satin)

Kategori spanduk kain menggunakan pendekatan modular reusable, di mana spesifikasi bahan (TC / Satin) dipisahkan di tingkat Nama Produk untuk mempermudah perubahan harga bahan baku di masa depan secara independen. Sedangkan **Lebar Kain** diatur sebagai atribut global yang dapat digunakan kembali.

### Rekomendasi Setup (Pendekatan Modular & Reusable):

#### A. Atribut Global (Dibuat di Master Atribut)
*   **Nama Atribut**: `Lebar Kain (cm)`
*   **Opsi Nilai Atribut**: `90`, `120`, `150`, `200`

#### B. Setup Produk A: `Spanduk Kain TC`
*   **Satuan UoM**: `m_lari` (Meter Lari)
*   **Atribut Varian Terpilih**: `Lebar Kain (cm)`
*   **Opsi Varian Aktif**: `90`, `120`, `150`, `200`
*   **Tiering Harga**: Flat `Rp 20.000` per meter lari untuk seluruh ukuran lebar.

#### C. Setup Produk B: `Spanduk Kain Satin`
*   **Satuan UoM**: `m_lari` (Meter Lari)
*   **Atribut Varian Terpilih**: `Lebar Kain (cm)`
*   **Opsi Varian Aktif**: `90`, `120`, `150` (Lebar `200` tidak diaktifkan karena keterbatasan gulungan fisik roll Satin)
*   **Tiering Harga**: Flat `Rp 35.000` per meter lari untuk seluruh ukuran lebar.

---

## 5. Opsi Produk Standar (Tanpa Varian)

Jika kasir menginginkan alur yang cepat tanpa perlu memilih atribut apa pun (misalnya untuk produk retail siap pakai atau jasa *flat*), gunakan **Opsi Tanpa Varian (Off)** di Step 2 sistem ERP.

*   Sistem akan otomatis menghasilkan satu varian bernama `"Default"`.
*   Field `attributes` akan terkirim berupa array kosong (`[]`).
*   Kasir tinggal menentukan matriks tiering harga global saja.
