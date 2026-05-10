# 🎨 UI Layout & Aesthetics (Shadcn-like)

### 📐 Whitespace & Density
- **Standard Padding**: Gunakan `p-6` (24px) sebagai padding standar untuk Card, Modal, dan Container utama.
- **High Density Layout**: Untuk form dalam modal, gunakan padding header `px-6 py-4` dan content `px-6 py-4` agar compact.
- **Input Spacing**: Jarak antara Label dan Input maksimal `space-y-2`. Jarak antar grup input (form fields) `space-y-4` atau `space-y-6`.

### 🔲 Borders & Rounding
- **Container Rounding**: Gunakan `rounded-lg` untuk Modal/Dialog dan Card utama.
- **Component Rounding**: Gunakan `rounded-md` untuk Button dan Input (TextField) kecuali diminta khusus.
- **Separators**: Gunakan border tipis `border-border/50` sebagai pemisah antara Header, Content, dan Footer pada Modal.

### ✍️ Typography
- **Header Weight**: Gunakan `font-semibold` (bukan bold/black berlebihan) untuk judul modal/card.
- **Header Tracking**: Gunakan `tracking-tight` untuk judul berukuran besar (`text-lg` ke atas).
- **Description**: Subtitle atau deskripsi selalu gunakan `text-muted-foreground` dengan ukuran `text-sm` atau `text-xs`.

### 🔘 Buttons
- **Placement**: Tombol aksi utama di Modal selalu di kanan bawah (`justify-end`).
- **Symmetry**: Gunakan lebar tombol yang proporsional sesuai konten (tidak harus full-width unless requested).
