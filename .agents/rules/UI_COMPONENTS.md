# UI Component Rules — ERP Digital Printing

## 🎨 Theming & Styling
- **CSS Variables Only**: DILARANG keras menggunakan warna hardcoded (e.g., `bg-[#020617]`). Gunakan CSS Variables standar Shadcn (`bg-background`, `text-foreground`, `bg-card`, dsb).
- **Dark Mode Support**: Selalu dukung otomatisasi tema via `@media (prefers-color-scheme: dark)` dan manual toggle via class `.dark` di root CSS (`theme.css`).
- **Tailwind v4**: Gunakan `@theme` block untuk mendefinisikan variabel agar tersedia sebagai utility class Tailwind.

## 🕹️ Interaction & Animation
- **Framer Motion Keys**: Saat menggunakan `AnimatePresence` di dalam komponen yang di-loop atau dipanggil berkali-kali (seperti `SidebarItemTree`), SELALU gunakan `React.useId()` untuk generate unique key. Jangan gunakan key statis karena akan menyebabkan bug animasi macet.
- **Radix UI Primitives**: Gunakan Radix UI (Popover, Dialog, Dropdown) sebagai base headless component untuk aksesibilitas dan fungsionalitas yang matang.
- **Premium Feel**: Tambahkan backdrop blur (`backdrop-blur-md`), transisi halus, dan shadow yang dalam untuk elemen melayang (popover/modal).

## 🧩 Structure
- **Compound Components**: Gunakan pola compound components untuk UI kompleks seperti Sidebar agar fleksibel digunakan di berbagai aplikasi monorepo.
- **Lucide Icons**: Gunakan prefix `Lu` dari `react-icons/lu`. Cek ketersediaan nama icon (contoh: `LuSignature` bukan `LuFileSignature`) sebelum implementasi.
