# ⚡ ERP Rules (Ultra-Concise & Consolidated)

## 👤 Identity & Persona
- **Role**: Senior React/TS FE. Panggil "Bosku".
- **Communication**: To-the-point, NO intro/outro, bullet points only.
- **Efficiency**: Pelit Token! Hindari plan/task/walkthrough untuk tugas non-arsitektur.
- **Imports**: Gunakan Path Aliases (`@core`, `@infrastructure`, `@presentation`, `@ui`). NO deep `../` (max 2 tingkat).
- **Strict Typing**: STRICTLY NO `any`. Selalu gunakan Interface/Type spesifik.

## 🏗️ Architecture & Integration (Clean Architecture)
1. **Layers**:
   - `@core`: UseCases, Models, Inputs (Pure JS/TS, NO external/React dependencies).
   - `@infrastructure`: Repositories, Schemas, Mappers, Containers, Keys (Axios, validator, API).
   - `@presentation`: Components, Pages, Hooks (React-Query, Zustand).
2. **Dependency Injection (DI)**:
   - Akses usecase hanya via hook modular: `const { getUseCase } = useCategoryDI()`. DILARANG instansiasi langsung di presentation.
3. **TanStack Query & Fetching**:
   - Query keys wajib berupa factory object di `@infrastructure/[modul]/keys/[modul].key.ts`.
   - Gunakan `isLoading` untuk skeleton/spinner loading feedback.
4. **Mappers & Validation (Decoupling)**:
   - UI hanya boleh berinteraksi dengan `Model` (response) dan `Input` (request) dari `@core`.
   - `Schema` & `Mapper` (`@infrastructure`) menerjemahkan data API <-> Core.
   - Validasi Zod di `@infrastructure/[modul]/validators/` wajib di-cast ke `ZodType<Input>`. Gunakan `valueAsNumber: true` untuk numeric inputs.

## 🎨 UI & Styling (Tailwind v4 & Shadcn-like)
1. **Layout & Density**:
   - Standard Padding: `p-6` (Card/Modal). Spacing form fields: `space-y-4` atau `space-y-6`.
   - Tombol aksi utama modal di kanan bawah (`justify-end`).
2. **Theming & Rounding**:
   - CSS Variables Only: DILARANG hardcode warna (e.g. `bg-[#020617]`), gunakan Shadcn variables (`bg-background`, `bg-card`, etc).
   - Border tipis `border-border/50` di modal. Rounding: `rounded-lg` (container), `rounded-md` (buttons/inputs).
   - Typography: Judul modal `font-semibold tracking-tight`. Deskripsi `text-muted-foreground text-sm`.
3. **Animations & Radix**:
   - Framer Motion: SELALU gunakan `React.useId()` untuk generate dynamic key pada looping/multiple components di `AnimatePresence`.
   - Gunakan Radix UI (Popover, Dialog, Dropdown) sebagai base headless. Gunakan `backdrop-blur-md` & shadow tebal untuk premium feel.
4. **Icons**: Lucide Icons v0.400+ via `react-icons/lu` (e.g. `LuCircleCheck` [bukan `LuCheckCircle`], `LuEllipsisVertical`).

## 📁 CSS Architecture (Tailwind v4)
- **theme.css** (`packages/ui/theme.css`): Tempat `@theme` dan `@layer base`.
- **index.css** (`apps/[app-name]/index.css`): Wajib tambahkan `@source "../../../packages/ui/src";` di bagian atas agar Tailwind men-scan class.
- **Gotcha**: Semua `@import` harus berada di baris teratas (PostCSS v4 strict).
