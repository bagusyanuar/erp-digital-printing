# 🍞 Skill: Toast Usage & Feedback

Gunakan skill ini untuk memberikan feedback instan kepada user setelah aksi (CRUD).

### 1. Registration
Pastikan `<Toaster />` sudah terpasang di root aplikasi (`App.tsx`).

### 2. Import & Trigger
Gunakan singleton `toast` dari `@erp-digital-printing/ui/Toast`.

```tsx
import { toast } from "@erp-digital-printing/ui/Toast";

// Success feedback
toast.success("Judul", "Deskripsi opsional");

// Error feedback
toast.error("Gagal", "Pesan error");

// Warning/Info
toast.warning("Peringatan", "Cek kembali data");
toast.info("Informasi", "Update tersedia");
```

### 3. Best Practices
- **Timing**: Panggil toast segera setelah state optimistik berubah atau setelah API response sukses.
- **Clarity**: Gunakan bahasa yang "Bosku" banget (To-the-point dan jelas).
- **Auto-close**: Secara default toast akan hilang dalam 3 detik. Jangan gunakan durasi manual kecuali sangat penting.
