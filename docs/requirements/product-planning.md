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

### 1. Master Satuan Dasar (UoM)
- **Tujuan**: Standarisasi cara hitung produk.
- **Data**: Lembar (Sheet), Meter Persegi (m2), Meter Lari (m), Box, Pcs, Pack.

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

## 📊 Database Schema Mapping & EAV Structure (Phase 2)

Sistem menggunakan pendekatan **Entity-Attribute-Value (EAV)** yang dinamis di sisi Backend. Berikut adalah pemetaan antara konsep Frontend dan tabel Backend:

### 1. Mapping Terminologi FE vs BE
| Konsep UI / Frontend | Tabel Backend (`be-table-schema.md`) | Penjelasan & Contoh |
| :--- | :--- | :--- |
| **Kategori** | `categories` | Payung besar pengelompokan (A3+, MMT, Indoor Media). |
| **Bahan / Material Dasar** | `products` | Di BE, bahan fisik adalah "Produk" utama. Menentukan UoM (e.g., Art Paper 150 -> Lembar, Flexi 280g -> m2). |
| **Opsi Sisi / Finishing** | `product_variants` | Variasi dari produk tersebut (e.g., 1 Sisi, 2 Sisi, Kiss Cut, Die Cut). Bisa memiliki `additional_cost`. |
| **Spesifikasi Detail** | `attributes` & `values` | EAV system. Menyimpan atribut dinamis (e.g., Gramasi: 280g, Resolusi: High Res) tanpa menambah kolom tabel. |
| **Grup Harga (Tab)** | `customer_levels` | Segmentasi harga (Regular, Reseller, Biro). |
| **Matriks Harga (Grid)** | `price_tiers` | Tabel pusat harga. Menyimpan harga berdasarkan rentang `min_qty` & `max_qty` untuk spesifik `variant_id` dan `customer_level_id`. |

### 2. Alur Pengisian Form berdasarkan Skema EAV
1.  **Level 1**: Buat Kategori, Customer Level, dan Atribut EAV (Warna, Sisi, dll).
2.  **Level 2**: Buat `Product` (Nama Bahan, UoM, Kategori).
3.  **Level 3**: Tambahkan `product_variants` (Opsi 1 sisi / 2 sisi) ke dalam Product tersebut.
4.  **Level 4**: Isi tabel `price_tiers` untuk setiap variant, berdasarkan customer level dan range qty.

---
**Next Move**: 
Menyesuaikan UI Form Master Data (`FormProduct.tsx`) agar selaras dengan hirarki EAV Backend ini (Bahan = Product, Sisi = Variant).
