# Perencanaan Modul Pencatatan Pengeluaran (Expenses Planning)

Dokumen ini mendefinisikan rencana perubahan konsep pencatatan pengeluaran pada aplikasi ERP Digital Printing dari transaksi tunggal menjadi **Berbasis Nota/Tagihan (Bill-based)** dengan dukungan pembayaran parsial/hutang.

---

## 1. Latar Belakang & Perubahan Konsep

### Konsep Lama:
- Pengeluaran dicatat sebagai transaksi tunggal dan dikelompokkan secara kaku sejak awal ke dalam dua tab terpisah: **Biaya Produksi** dan **Biaya Operasional**.
- Pembayaran diasumsikan langsung lunas saat pencatatan dibuat.

### Konsep Baru:
1. **Berbasis Nota (Bill-based):** Pengeluaran dicatat berdasarkan **Nota/Faktur/Faktur Tagihan** dari Supplier maupun Non-Supplier.
2. **Campuran Biaya (Itemized Cost):** Dalam satu Nota, bisa terdapat beberapa item pembelanjaan dengan tipe biaya yang berbeda (contoh: membeli Bahan Baku Kertas [Produksi] dan Kopi/Teh Kantor [Operasional] dalam satu nota belanja).
3. **Pembayaran Parsial & Hutang (Debt / Partial Payment):** Status pembayaran nota mendukung `UNPAID` (Belum Dibayar/Hutang), `PARTIAL_PAID` (Dibayar Sebagian/Dicicil), dan `PAID` (Lunas).
4. **Pelaporan & Filter Dinamis:** Di tingkat dashboard/laporan keuangan, pengeluaran akan dipisahkan/difilter berdasarkan tipe item (Produksi vs Operasional), bukan dari jenis notanya.

---

## 2. Struktur Data (Interface Model)

Berikut usulan struktur data di sisi Frontend untuk mendukung integrasi dengan API Backend:

### A. Objek Utama: `ExpenseBill` (Nota Pengeluaran)
```typescript
export interface ExpenseBill {
  id: string;                      // ID unik internal
  billNumber: string;              // Nomor nota fisik/faktur supplier
  date: string;                    // Tanggal transaksi nota
  supplierId?: string;             // ID Supplier (opsional jika dari supplier terdaftar)
  supplierName: string;            // Nama supplier/pihak ketiga (manual jika non-supplier)
  totalAmount: number;             // Total nilai nota (penjumlahan otomatis seluruh item)
  paidAmount: number;              // Nominal total yang telah dibayarkan
  paymentStatus: "UNPAID" | "PARTIAL_PAID" | "PAID" | "VOID";
  description?: string;            // Catatan umum nota
  items: ExpenseBillItem[];        // Baris detail belanjaan
  payments: ExpensePaymentHistory[]; // Riwayat cicilan/pembayaran nota ini
}
```

### B. Objek Detail: `ExpenseBillItem` (Detail Item Nota)
```typescript
export interface ExpenseBillItem {
  id: string;
  description: string;             // Deskripsi barang/jasa
  amount: number;                  // Nominal biaya untuk item ini
  categoryId: string;              // ID Kategori pengeluaran (gaji, bahan baku, listrik, dll)
  categoryName: string;            // Nama kategori pengeluaran
  expenseType: "PRODUCTION" | "OPERATIONAL"; // Pengelompokan jenis biaya untuk filter laporan
}
```

### C. Objek Riwayat Pembayaran: `ExpensePaymentHistory`
```typescript
export interface ExpensePaymentHistory {
  id: string;                      // ID unik transaksi pembayaran
  expenseBillId: string;           // Referensi ke ExpenseBill
  paymentDate: string;             // Tanggal bayar cicilan
  paymentAccount: string;          // Kas/Bank pembayaran (e.g. Cash, Bank Transfer)
  amountPaid: number;              // Nominal yang dibayarkan saat itu
  proofOfPayment?: string;         // Bukti transfer/nota (opsional)
}
```

---

## 3. Rencana Perubahan UI / UX

### A. Halaman Utama (`ExpensePage.tsx`)
- **Penyatuan Tabel:** Mengganti tab filter "Biaya Produksi vs Biaya Operasional" dengan **satu tabel daftar nota terpadu**.
- **Kolom Tabel Baru:**
  - Tanggal Nota
  - No. Nota
  - Supplier / Vendor
  - Total Tagihan (Rp)
  - Sudah Dibayar (Rp)
  - Sisa Hutang (Rp) -> *Dihitung dari `totalAmount - paidAmount`*
  - Status Pembayaran (Lunas, Sebagian, Belum Dibayar, Dibatalkan)
  - Aksi: `Detail` (Lihat Nota & Riwayat Cicilan), `Bayar Cicilan` (Muncul jika status belum lunas), `Batalkan Nota (Void)`.
- **Rangkuman Keuangan (Summary Cards):**
  - **Total Pengeluaran Bulan Ini:** Total seluruh nota (baik lunas maupun belum).
  - **Total Terbayar:** Akumulasi kas keluar.
  - **Sisa Hutang Dagang:** Total kewajiban yang belum dilunasi.

### B. Form Dialog Input Pengeluaran (`ExpenseFormDialog.tsx`)
*Merupakan penggabungan dan pengembangan dari `ProductionFormDialog` dan `OperationalFormDialog`.*
- **Pemilihan Pihak Kedua:** Dropdown Supplier (mengambil data dari Master Supplier) dengan opsi checkbox "Bukan Supplier Terdaftar" untuk input nama supplier manual (Cash/Umum).
- **Detail Item Belanja (Dynamic Multi-Row Input):**
  - Grid input dinamis yang memungkinkan user menambah/menghapus baris item belanja.
  - Setiap baris memiliki input: Kategori Pengeluaran (Dropdown), Deskripsi/Keterangan Item, Tipe Biaya (Produksi/Operasional - *otomatis terisi berdasarkan kategori*), dan Nominal.
- **Form Pembayaran Pertama (DP/Uang Muka):**
  - Dropdown Sumber Dana/Kas (Cash, Bank).
  - Input Nominal Uang Muka (jika diisi lunas = total nominal nota; jika diisi parsial = terisi sebagian; jika diisi 0 = hutang penuh).

### C. Dialog Riwayat Pembayaran & Pembayaran Baru (`ExpensePaymentDialog.tsx`)
- Tombol "Bayar Cicilan" di tabel utama akan membuka dialog ringkas ini.
- Menampilkan sisa hutang nota.
- Input nominal pembayaran baru, tanggal pembayaran, sumber dana, dan bukti upload.

---

## 4. Langkah Implementasi (Sisi Frontend)

1. **Persiapan Model & Mock Data:**
   - Definisikan interface baru sesuai poin 2.
   - Buat mock data nota pengeluaran baru yang mendukung relasi multi-item dan status `PARTIAL_PAID`/`UNPAID`.
2. **Refaktor / Pembuatan Form Terpadu:**
   - Satukan `ProductionFormDialog` dan `OperationalFormDialog` menjadi `ExpenseFormDialog` dengan form row yang dinamis.
3. **Refaktor Halaman Utama (`ExpensePage.tsx`):**
   - Hapus pemisahan tab table, buat satu table nota terintegrasi.
   - Perbarui header dan widget rangkuman biaya.
4. **Pembuatan Dialog Cicilan:**
   - Tambahkan form sederhana untuk mencatat cicilan pembayaran baru.
5. **Integrasi & Pengujian:**
   - Pengujian alur pembuatan nota hutang baru, pembayaran cicilan, hingga status berubah menjadi lunas.
