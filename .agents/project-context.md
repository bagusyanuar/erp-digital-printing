# 📑 ERP Digital Printing — Project Context & Memory

### 🎯 Project Vision
Membangun sistem ERP (Enterprise Resource Planning) khusus untuk industri **Digital Printing** dengan fokus pada kecepatan, akurasi data, dan UI/UX yang premium (Shadcn-like).

### 🏗️ Architecture (Modular)
- **`apps/back-office-app`**: Shell aplikasi utama (Admin Dashboard).
- **`packages/ui`**: Design System (Typography, Button, Card, Dialog, Toast, dll).
- **`modules/presentation`**: Tempat slicing fitur per-modul (Category, Products, Orders, dll).

### 🚀 Current Progress
1. **Design System**: 
   - Typography, Button, TextField sudah stabil.
   - **Dialog (Modal)**: Custom native + Framer Motion (React 19 compatible).
   - **Toast (Toaster)**: Custom native + Framer Motion dengan stacking system.
2. **Feature Slicing**:
   - **Category Module**: Tabel kategori dan form tambah kategori (Modal) sudah selesai dislice.

### 🛠️ Tech Stack Baseline
- **Frontend**: React 19, TypeScript, Vite.
- **Styling**: Tailwind CSS v4, Framer Motion (Animations).
- **Components**: Class Variance Authority (CVA) for variants.
- **Icons**: Lucide Icons (react-icons/lu).

### 📝 Next Steps (Roadmap)
- [ ] Implementasi Form Validation di modal kategori.
- [ ] Integrasi API untuk CRUD Kategori.
- [ ] Slicing Modul Produk & Inventaris.
- [ ] Sistem Role & Permission.
