# 🛠️ Tech Stack & Coding Standards

- **Stack**: React 19, Vite, TypeScript, Tailwind v4, Vitest.
- **Project**: Modular ERP Digital Printing.
- **CVA First**: Gunakan `class-variance-authority` (CVA) untuk setiap component yang memiliki variant.
- **CVA Separation**: File CVA variants wajib dipisah menjadi file tersendiri (`*.variants.ts`).
- **Icon Naming**: Gunakan standar Lucide v0.400+ untuk `react-icons/lu` (v5+). Contoh: `LuCircleCheck` (bukan `LuCheckCircle`), `LuEllipsisVertical` (bukan `LuMoreVertical`).
- **Flow**: NO auto-run. Manual trigger only.
- **Strict Typing**: Dilarang keras menggunakan `any`. Gunakan tipe data yang spesifik atau `unknown` jika tipe data benar-benar tidak diketahui. Pastikan ESLint rule `@typescript-eslint/no-explicit-any` selalu aktif dengan level `error`.
