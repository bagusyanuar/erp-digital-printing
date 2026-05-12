### 📄 `frontend-specs.md` (Untuk Agent FE)

# Frontend Technical Specs: Dynamic Order Form

## 1. Objective

Membuat form pemesanan dinamis yang berubah secara reaktif berdasarkan Unit of Measurement (UoM) produk dan menghitung estimasi harga secara real-time.

## 2. Tech Stack & Rules

- **Framework**: React 19 (Functional Components).
- **Styling**: Tailwind CSS v4.
- **State Management**: Zustand.
- **Validation**: Zod (wajib untuk form validation).
- **Architecture**: Modular Monorepo (pnpm/Turborepo). Jaga Tree-Shaking 100%.
- **Strictness**: **NO `any`**.

## 3. UI/UX Flow

- **Product Selection**: User memilih kategori dan produk.
- **Dynamic Fields**:
  - Jika `product.uom === 'm2'`: Tampilkan Input `Panjang (cm)` dan `Lebar (cm)`.
  - Jika `product.uom === 'm_lari'`: Tampilkan Input `Panjang (cm)` saja.
  - Jika `product.uom === 'pcs'`: Sembunyikan input dimensi, tampilkan `Quantity` saja.
- **Real-time Preview**: Setiap perubahan input memicu fungsi debounced untuk hitung harga ke BE atau local logic.

## 4. Component Structure

- `OrderForm.tsx`: Wrapper utama.
- `DimensionInput.tsx`: Input khusus PxL dengan validasi angka.
- `PriceSummary.tsx`: Menampilkan breakdown harga (Harga Satuan vs Tier yang didapat).

## 5. Logic Implementation

- **Schema Validation**: Gunakan Zod untuk memastikan input dimensi tidak nol dan qty minimal 1.
- **UoM Handling**:
  ```typescript
  const calculateTotalUnit = (
    uom: string,
    p: number,
    l: number,
    qty: number,
  ): number => {
    if (uom === "m2") return (p / 100) * (l / 100) * qty;
    if (uom === "m_lari") return (p / 100) * qty;
    return qty;
  };
  ```

## 6. Next Development (Future Scope)

- **Tiered Pricing (Harga Bertingkat)**: Implementasi pricing matrix berdasarkan quantity (e.g., 1-5, 6-10, >10).
- **Customer Segmentation**: Pembedaan harga antara Customer Regular dan Reseller/Biro.
- **Finishing Add-ons**: Integrasi opsi tambahan (Laminasi, Cutting, Jilid) yang menambah total harga per unit atau per order.
- **Admin Price Override**: Fitur bagi admin untuk mengubah harga secara manual (nego) di dalam form order.
