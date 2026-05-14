# 🏗️ Modular Dependency Injection Guide

Dokumen ini menjelaskan cara melakukan "Wiring" menggunakan pola **Single DI Context + Selector Hooks**.

---

## 📌 Filosofi

Arsitektur DI kita dibangun di atas prinsip-prinsip berikut:

1. **Use Case bersifat statis** — dibuat sekali saat startup, tidak pernah berubah.
2. **Satu Context sudah cukup** — karena referensinya stabil, tidak akan menyebabkan re-render.
3. **Selector hooks per modul** — tiap modul punya hook kecil (4 baris) untuk mengambil use case-nya.
4. **Composition Root di Shell App** — hanya di sini object benar-benar dibuat.

---

## 🗂️ Struktur File

```
modules/presentation/src/
  shared/
    di/
      DIContext.ts         ← Satu context untuk seluruh app
      DIProvider.tsx        ← Satu provider, tanpa nesting
  auth/
    hooks/
      useAuthDI.ts         ← Selector hook (4 baris)
      useLogin.ts          ← Memanggil useAuthDI()
  product/
    hooks/
      useProductDI.ts      ← Selector hook (4 baris)

modules/infrastructure/src/
  libs/
    http.ts                ← HttpClient factory
    api-response.ts        ← Standard API response wrapper
  auth/
    containers/
      auth.container.ts    ← Factory function per use case
    repositories/
      auth.repository.ts   ← Implementasi konkret
    mappers/
      auth.mapper.ts       ← Konversi data antar layer

apps/back-office-app/src/
  di/
    app.container.ts       ← Composition Root (rakit semua modul)
  providers/
    AppProviders.tsx        ← Wrapper provider (stabil, jarang diubah)
  main.tsx                 ← Entry point (sangat bersih)
```

---

## 🚀 Cara Menambah Modul Baru (Contoh: Product)

Hanya **3 langkah**, tidak perlu membuat Provider/Context baru.

### Langkah 1: Infrastructure — Buat Factory

```typescript
// modules/infrastructure/src/product/containers/product.container.ts
import { ApiProductRepository } from "@infrastructure/product/repositories/product.repository";
import { GetProducts } from "@core/product/applications/usecases/product.usecase";
import type { HttpClient } from "@erp-digital-printing/http";

export function createGetProductsUseCase(http: HttpClient): GetProducts {
  const repo = new ApiProductRepository(http);
  return new GetProducts(repo);
}
```

### Langkah 2: Presentation — Tambah Type + Selector Hook

**A. Update `DIContext.ts`** — Tambah 2 baris:

```diff
+ import type { GetProducts } from "@core/product/applications/usecases/product.usecase";

+ export interface ProductUseCases {
+   getProductsUseCase: GetProducts;
+ }

  export interface AppContainer {
    auth: AuthUseCases;
+   product: ProductUseCases;
  }
```

**B. Buat selector hook** — 1 file baru (4 baris):

```typescript
// modules/presentation/src/product/hooks/useProductDI.ts
import { useDI } from "../../shared/di/DIContext";
import type { ProductUseCases } from "../../shared/di/DIContext";

export const useProductDI = (): ProductUseCases => useDI().product;
```

### Langkah 3: Shell App — Update Container

```diff
  // apps/back-office-app/src/di/app.container.ts
+ import { createGetProductsUseCase } from "@infrastructure/product/containers/product.container";

  return {
    auth: { loginUseCase: createLoginUseCase(httpClient) },
+   product: { getProductsUseCase: createGetProductsUseCase(httpClient) },
  };
```

**Selesai.** Tidak perlu membuat Provider baru. `AppProviders.tsx` dan `main.tsx` **tidak berubah sama sekali**.

---

## 📈 Skala Besar (10+ Modul)

Saat aplikasi sudah punya 10 modul, yang berubah hanyalah:

### `DIContext.ts` — Daftar type modul

```typescript
export interface AppContainer {
  auth: AuthUseCases;
  product: ProductUseCases;
  category: CategoryUseCases;
  order: OrderUseCases;
  customer: CustomerUseCases;
  supplier: SupplierUseCases;
  warehouse: WarehouseUseCases;
  invoice: InvoiceUseCases;
  report: ReportUseCases;
  setting: SettingUseCases;
}
```

### `app.container.ts` — Perakitan use cases

```typescript
export function createAppContainer(): AppContainer {
  const http = createHttpClient(() => useAuthStore.getState().accessToken);

  return {
    auth:      { loginUseCase: createLoginUseCase(http) },
    product:   { listUseCase: createListProduct(http), createUseCase: createCreateProduct(http) },
    category:  { listUseCase: createListCategory(http) },
    order:     { checkoutUseCase: createCheckout(http), historyUseCase: createOrderHistory(http) },
    customer:  { listUseCase: createListCustomer(http) },
    supplier:  { listUseCase: createListSupplier(http) },
    warehouse: { listUseCase: createListWarehouse(http) },
    invoice:   { generateUseCase: createGenerateInvoice(http) },
    report:    { salesUseCase: createSalesReport(http) },
    setting:   { updateUseCase: createUpdateSetting(http) },
  };
}
```

### File-file yang **TIDAK berubah** saat modul bertambah:
- ✅ `DIProvider.tsx` — tetap 1 provider
- ✅ `AppProviders.tsx` — tetap tanpa nesting
- ✅ `main.tsx` — tetap bersih

### Perbandingan dengan Scoped DI (Pola Sebelumnya):

| Aspek | Scoped DI (Lama) | Single DI (Sekarang) |
|---|---|---|
| File per modul baru | 3 (Context + Provider + Hook) | **1** (Selector hook saja) |
| Provider nesting | Bertambah per modul | **Selalu 1** |
| 10 modul = total file DI | 30+ file | **12 file** |
| Re-render risk | Isolated per context | **Zero** (referensi stabil) |
| Complexity | Tinggi | **Rendah** |

---

## 🛠️ Cara Penggunaan di Component/Hook

```typescript
// Di hook atau komponen manapun:
const { loginUseCase } = useAuthDI();
const { getProductsUseCase } = useProductDI();
```

---

## ✅ Keuntungan Pola Ini
1. **Minimal boilerplate** — Modul baru hanya butuh 1 selector hook (4 baris).
2. **Zero re-render** — Container statis, referensi tidak pernah berubah.
3. **Tree-shakeable** — Selector hook yang tidak di-import akan dibuang bundler.
4. **Testable** — Bungkus komponen dengan `<DIProvider container={mockContainer}>` saat testing.
5. **Decoupled** — Infrastructure tidak tahu Presentation, dan sebaliknya.
