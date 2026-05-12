# Product Planning - Made Printing (General Printing)

## 📌 Business Focus
Aplikasi menangani berbagai jenis layanan percetakan (General Printing) dengan metode perhitungan harga yang fleksibel (per meter, per lembar, per box, atau per pcs).

## 🗂️ Product Categories

### 1. Large Format / Outdoor
- **Produk**: Banner, Spanduk, Baliho, X-Banner, Roll-up.
- **Satuan**: Meter Persegi (m2).
- **Variabel**: Panjang (m), Lebar (m), Jenis Bahan (Flexi 280g, 340g, Korchin).

### 2. Digital Printing (A3+)
- **Produk**: Stiker Label, Poster, Sertifikat, Kartu Nama, Brosur.
- **Satuan**: Lembar A3+, Box (Kartu Nama), atau Pcs.
- **Variabel**: Jenis Kertas (Art Paper, Ivory, Chromo), Laminasi (Doff, Glossy), Cutting (Kiss-cut, Die-cut).

### 3. Stationery & Office Supplies
- **Produk**: Nota/Invoice (NCR), Map, Kop Surat, Amplop.
- **Satuan**: Buku, Rim, atau Pack.
- **Variabel**: Jumlah Rangkap (Top, Middle, Bottom), Warna Tinta.

### 4. Custom Merchandise
- **Produk**: Kaos (DTF), Mug, Totebag, Pin.
- **Satuan**: Pcs / Satuan.

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

## 📊 Database Schema Considerations (Phase 2)
1. **categories**: Id, name, slug.
2. **products**: Id, category_id, name, base_price, unit_type (m2, pcs, box, etc).
3. **product_materials**: Pivot table untuk menentukan bahan apa saja yang bisa dipakai oleh produk tersebut.
4. **finishing_options**: List opsi finishing dan harganya.

---
**Next Move**: 
Implementasi Master Data (Categories & Materials) di Phase 2.
