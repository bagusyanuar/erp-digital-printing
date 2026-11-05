# 📚 Migration Wiki: React to Svelte

Koleksi dokumentasi spesifikasi domain, arsitektur, dan kontrak sistem ERP Digital Printing untuk memandu migrasi dari React ke Svelte.

---

## 🏛️ Arsitektur & Aturan Clean Architecture
Aplikasi ini memisahkan layer secara tegas:
1. **`@core` (Agnostik)**: UseCases, Models, Interfaces, Inputs. Bebas dari dependensi framework/UI. Dapat disalin langsung ke project Svelte tanpa modifikasi.
2. **`@infrastructure` (Agnostik)**: Repositories (HTTP / API), Schemas, Mappers, Zod Validators, Query Keys. Kompatibel penuh dengan Svelte (Node/Vite/TS).
3. **`@presentation` (Framework Specific)**: State management (Zustand $\to$ Svelte 5 Runes), Komponen UI (React/Radix $\to$ Svelte/Bits UI), Form (RHF $\to$ SvelteKit Form/Runes), Router Guards.

---

## 📑 Indeks Modul

| No | Modul | Dokumen Wiki | Status |
| :--- | :--- | :--- | :--- |
| 1 | **Auth & Session** | [auth.md](./modules/auth.md) | ✅ Siap Dimigrasi |
| 2 | **User & Profile** | `modules/user.md` | ⏳ Pending |
| 3 | **Category** | `modules/category.md` | ⏳ Pending |
| 4 | **Product** | `modules/product.md` | ⏳ Pending |
| 5 | **Attribute** | `modules/attribute.md` | ⏳ Pending |
| 6 | **Customer & Reseller** | `modules/customer-reseller.md` | ⏳ Pending |
| 7 | **Supplier** | `modules/supplier.md` | ⏳ Pending |
| 8 | **Order & Job Entry** | `modules/order.md` | ⏳ Pending |
| 9 | **Expense & Expense Category** | `modules/expense.md` | ⏳ Pending |
| 10 | **Cash Flow & Capital** | `modules/finance.md` | ⏳ Pending |
| 11 | **Reports & Dashboard** | `modules/reports.md` | ⏳ Pending |

---

## 🚀 Panduan untuk AI Agent di Project Baru
Saat mengerjakan migrasi pada repo Svelte baru:
1. Baca modul wiki yang relevan di folder ini terlebih dahulu.
2. Pastikan `@core` dan `@infrastructure` mengikuti type contract yang tercantum di wiki.
3. Implementasikan komponen UI Svelte 5 mengikuti alur bisnis dan state lifecycle yang tertera di dokumen modul.

