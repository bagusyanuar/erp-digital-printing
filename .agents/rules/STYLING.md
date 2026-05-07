# Styling Rules (Tailwind v4 Monorepo)

## 📁 CSS Architecture
- **packages/ui/theme.css**: Tempat definisi `@theme` dan `@layer base`. Berisi variabel desain global.
- **apps/[app-name]/index.css**: Entry point CSS aplikasi. Harus meng-import `theme.css` dari package UI.

## 🚀 Tailwind v4 Integration
- **@source directive**: Di dalam `index.css` aplikasi, tambahkan `@source "../../../packages/ui/src";` (sesuaikan path) agar Tailwind men-scan class yang digunakan di komponen UI eksternal.
- **PostCSS Order**: Pastikan urutan import benar:
    1. Fonts (@import)
    2. Tailwind (@import "tailwindcss")
    3. UI Theme (@import "../../packages/ui/src/theme.css")
- **Plugin Vite**: Pastikan `@tailwindcss/vite` terpasang di `vite.config.ts` aplikasi.

## 🚫 Common Gotchas
- Jangan menambahkan `@import` di tengah-tengah file CSS; PostCSS v4 sangat ketat bahwa semua import harus di bagian paling atas.
- Hindari penggunaan `tailwindcss` via `npx` jika project sudah menggunakan Vite Plugin resmi.
