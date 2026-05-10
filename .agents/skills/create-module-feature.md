# 📦 Skill: Create Module Feature

Gunakan skill ini untuk menambahkan fitur atau modul baru ke dalam sistem ERP.

### 1. Struktur Folder Modul
Setiap modul di `modules/presentation/src/` wajib mengikuti struktur:
- `[module-name]/`:
  - `components/`: Komponen internal khusus fitur ini.
  - `hooks/`: Custom hooks untuk logic fitur.
  - `pages/`: Entry point halaman (misal: `ProductPage.tsx`).
  - `services/`: API calls khusus modul ini.
  - `store/`: State management lokal (jika butuh).

### 2. Standar Slicing
- **Layout Consistency**: Selalu gunakan `Card` dan `Typography` dari `@erp-digital-printing/ui`.
- **Search & Filter**: Wajib sediakan area filter di atas tabel menggunakan `TextField` dan `Button`.
- **Modals**: Gunakan `Dialog` untuk form Tambah/Edit. Jangan buat halaman baru untuk form sederhana.
- **Loading States**: Sediakan skeleton atau loading spinner saat transisi data.

### 3. Routing
Setelah page dibuat, daftarkan ke `apps/back-office-app/src/router/AppRouter.tsx` dan tambahkan menu di `NavSidebar.tsx`.
