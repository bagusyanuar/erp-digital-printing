# Product Planning - Made Printing (General Printing)

## 📌 Business Focus
Aplikasi menangani berbagai jenis layanan percetakan (General Printing) dengan metode perhitungan harga yang fleksibel (per meter, per lembar, per box, atau per pcs).

## 🗂️ Product Categories

### 1. Banner (MMT & Kain)
- **Produk**: Spanduk, Baliho, X-Banner, Roll-up, Bendera.
- **Satuan**: Meter Persegi (m2).
- **Variabel**: Panjang (m), Lebar (m), Jenis Bahan (Flexi 280g, 340g, Korchin, Kain).

### 2. A3+
- **Produk**: Stiker Label, Poster, Sertifikat, Kartu Nama, Brosur.
- **Satuan**: Lembar A3+.
- **Variabel**: Jenis Kertas (Art Paper, Ivory, Chromo), Laminasi (Doff, Glossy), Cutting (Kiss-cut, Die-cut).

### 3. Indoor Media
- **Produk**: Stiker Vinyl, Albatros, Duratrans, Canvas.
- **Satuan**: Meter Persegi (m2).
- **Variabel**: Panjang (m), Lebar (m), Laminasi.

## ⚙️ Core Attributes (Master Data Requirements)

### Materials (Bahan)
Setiap produk harus terikat ke satu atau lebih bahan.
- Nama Bahan (e.g., Flexi 280g)
- Harga Beli/Modal (Optional, for profit tracking)
- Stok (Optional)

### Finishing
Opsi tambahan yang mempengaruhi harga total.
- Laminasi (Doff/Glossy)
- Mata Ayam (buat Banner)
- Lipat / Pon
- Jilid (Spiral, Baut, Lem Panas)

## 🏗️ Foundational Master Data (Level 1)

Sebelum membuat Produk, sistem harus memiliki data dasar berikut sebagai referensi utama:

### 1. Master Satuan Dasar (UoM) - Kontrak API Backend (BE)
Sistem membatasi pilihan satuan dasar produk berdasarkan kontrak enum BE berikut:

| Label UI | Value API (Database) | Keterangan / Penggunaan |
| :--- | :--- | :--- |
| **Meter Persegi** | `m2` | Banner MMT, Kain, Stiker meteran. |
| **PCS** | `pcs` | Brosur eceran, Merchandise, gantungan kunci, dll. |
| **Meter Lari** | `m_lari` | Cetak roll banner tanpa perhitungan lebar custom. |
| **Box** | `box` | Kartu nama, id card pack, dll. |

### 2. Master Kategori Produk
- **Tujuan**: Folder utama untuk grouping produk dan laporan.
- **Data**: A3+, Banner (MMT & Kain), Indoor Media.


### 3. Master Varian / Material Base
- **Tujuan**: List bahan mentah/kertas yang tersedia di gudang.
- **Data**: HVS 80g, AP 120, AC 260, Stiker Vinyl, Flexi 280g, dll.
- **Benefit**: Menghindari typo saat input produk dan mempermudah inventory.

### 4. Master Grup Pelanggan (Customer Segment)
- **Tujuan**: Menentukan segmentasi harga (Tabs di Pricing Matrix).
- **Data**: Regular, Reseller / Biro, Corporate, VIP.

## 🏗️ Product Hierarchy (Master Data Structure - Level 2)

Khusus untuk kategori **A3+**, struktur data diatur dalam hirarki berikut untuk mendukung kompleksitas harga:

### 1. Product: Digital Print A3+
- **Variants**: HVS 80g, AP 120, AP 150, AC 230, AC 260, Linen.
- **Options**: 1 Sisi, 2 Sisi.
- **Tiering Patterns**: [1-4], [5-99], [100-249], [250+].

### 2. Product: Stiker A3+
- **Variants**: Stiker Miror, Stiker Vinyl, Stiker Transparan, Stiker Hologram.
- **Options**: 1 Sisi (Default).
- **Tiering Patterns**: [1-4], [5-99], [100-249], [250+].

### 3. Product: Cutting A3+
- **Variants**: Kiss Cut, Die Cut.
- **Tiering Patterns**: [1-99], [100+].

### 4. Product: Kartu Nama
- **Variants**: Tanpa Laminasi, Lam. Glossy/Doft.
- **Options**: 1 Sisi, 2 Sisi.
- **Unit**: Box.

## 📈 Dynamic Pricing & Multi-Tier Reseller System (Brainstorming Results)

Sistem akan mendukung harga varian produk yang dinamis berbasis volume (Tier Pricing) dan segmentasi pelanggan (End-User vs Reseller).

### 1. Model Data Variant Pricing
Setiap **Product Variant** menyimpan properti harga dasar serta sub-tabel harga bertingkat:
*   `base_price`: Harga eceran / ritel standar untuk End-User.
*   `base_reseller_price`: Harga dasar khusus untuk pelanggan berstatus Reseller/Biro.
*   `price_tiers` (Tabel Anak): Menyimpan daftar aturan harga grosir berdasarkan kuantitas minimal (`min_qty`).
    *   `min_qty`: Jumlah minimum pembelian untuk mengaktifkan harga ini.
    *   `price`: Harga per unit untuk End-User di tier ini.
    *   `reseller_price`: Harga per unit khusus Reseller di tier ini.

#### Ilustrasi JSON Schema Model:
```json
{
  "variant_id": "var_ap150_1sisi",
  "sku": "PRD-AP150-1S",
  "name": "Art Paper 150g - 1 Sisi",
  "base_price": 5000,
  "base_reseller_price": 4500,
  "price_tiers": [
    {
      "min_qty": 100,
      "price": 4500,
      "reseller_price": 4000
    },
    {
      "min_qty": 500,
      "price": 4000,
      "reseller_price": 3500
    }
  ]
}
```

### 2. Konsep UI/UX Form Produk & Penentuan Harga
Untuk mengakomodir input data yang kaya ini tanpa membingungkan user, form produk dirancang menggunakan **Multi-Tab Layout** yang elegan:

#### 📂 Tab 1: Informasi Dasar
*   Nama Produk, Deskripsi, Kategori (Dropdown), dan UoM Utama (e.g. Lembar, m2).

#### 📂 Tab 2: Varian & Atribut (EAV)
*   **Pilih Atribut**: Dropdown dinamis dari Master Atribut (contoh: *Bahan*, *Sisi*, *Finishing*).
*   **Input Nilai / Options**: Memasukkan opsi nilai per atribut.
*   **Generator Grid**: Tombol otomatis untuk me-render daftar kombinasi varian berdasarkan atribut yang dipilih.

#### 📂 Tab 3: Matrix Harga & Grosir (Tier Pricing Grid)
*   Menampilkan daftar varian yang ter-generate dalam bentuk grid/tabel.
*   Setiap baris varian memiliki input langsung untuk `Harga Retail` & `Harga Reseller`.
*   Tombol akselerator **"Atur Tiering"** di setiap baris varian untuk memunculkan modal mini guna mengelola baris kuantitas minimum (`Min Qty`) dan diskon harga grosir per segmen.

---
**Next Move**: 
Mempersiapkan pembuatan antarmuka visual terpadu ini di dalam modul produk untuk demo interaktif yang solid.

