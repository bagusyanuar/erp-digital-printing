# 🏗️ Architecture & Integration Guidelines

Proyek ERP Digital Printing ini menggunakan pendekatan **Clean Architecture**, **Dependency Injection (DI)**, dan **React Query**. Berikut adalah panduan konsistensi yang wajib diikuti:

## 1. Clean Architecture Layers
Proyek dibagi menjadi tiga modul utama:
- **Core (`@core`)**: Berisi Use Cases, Models, dan Inputs. Tidak boleh bergantung pada library eksternal spesifik (seperti React atau Axios).
- **Infrastructure (`@infrastructure`)**: Berisi implementasi Repositories, Schemas, Mappers, Containers, dan Keys. Di sinilah interaksi API atau library eksternal (Axios) berada.
- **Presentation (`@presentation`)**: Berisi UI/React Components, Pages, Hooks, dan State Management (Zustand).

## 2. Dependency Injection (DI)
- **AppContainer**: Semua use case digabungkan ke dalam satu `AppContainer` di `modules/presentation/src/shared/di/DIContext.ts`.
- **Selector Hook Modular**: Setiap modul di Presentation harus memiliki sebuah selector hook.
  - Contoh: `modules/presentation/src/reseller/hooks/useResellerDI.ts` atau `modules/presentation/src/category/hooks/useCategoryDI.ts`.
  - Isinya: `export const useCategoryDI = () => useDI().category;`
  - *Dilarang keras* menginisiasi UseCase atau Repository secara langsung di dalam komponen presentasi.

## 3. TanStack Query Keys (Query Factory)
- **Letak**: Query Keys di-maintain di layer Infrastructure, contoh: `modules/infrastructure/src/[nama_modul]/keys/[nama_modul].key.ts`.
- **Pola Factory**: Gunakan standar factory const object (seperti pola TkDodo):
  ```typescript
  export const moduleKeys = {
    all: ["moduleName"] as const,
    lists: () => [...moduleKeys.all, "list"] as const,
    list: (params: ParamsType) => [...moduleKeys.lists(), params] as const,
    details: () => [...moduleKeys.all, "detail"] as const,
    detail: (id: string) => [...moduleKeys.details(), id] as const,
  };
  ```
- **Akses**: Diekspor melalui `modules/infrastructure/src/[nama_modul]/keys/index.ts`. Komponen React mengimpornya dari `@infrastructure/[nama_modul]/keys`.

## 4. TanStack React Query & API Fetching
- **Hooks**: Pemanggilan API dilakukan di dalam custom hook (misalnya `useResellerTable.ts` atau `useLogin.ts`) menggunakan `@tanstack/react-query` (`useQuery` atau `useMutation`).
- **Integrasi**: 
  1. Ambil UseCase melalui DI: `const { getUseCase } = useModuleDI();`
  2. Eksekusi di dalam QueryFn: `queryFn: () => getUseCase.execute(params)`
  3. Gunakan factory QueryKey: `queryKey: moduleKeys.list(params)`
- **Loading State**: Selalu gunakan properti `isLoading` dari `useQuery` atau `useMutation` untuk me-render feedback UI (seperti Skeleton loading table atau spinner form) kepada pengguna.

## 5. Mappers & Data Flow (Konsep Decoupling)
- **Prinsip Utama**: Layer Presentation (UI) TIDAK BOLEH tahu struktur data eksak (JSON/payload) yang diminta atau dikembalikan oleh API Backend. Presentation layer hanya murni berinteraksi dengan **Model** dan **Input** yang didefinisikan secara independen di layer Core.
- **Layer Core (Input & Model)**:
  - `Input` (`core/src/[modul]/applications/inputs`): Mendefinisikan kontrak interface/tipe data yang akan di-supply oleh UI/Form saat proses Create atau Update.
  - `Model` (`core/src/[modul]/models`): Mendefinisikan struktur data entitas bisnis murni hasil respons.
- **Layer Infrastructure (Schemas & Mappers)**:
  - `Schema` (`infrastructure/src/[modul]/schemas`): Mendefinisikan secara 1:1 bentuk JSON request body dan response dari/ke Backend API.
  - `Mappers` (`infrastructure/src/[modul]/mappers`): Bertugas sebagai penerjemah mutlak (adapter) di batas infrastruktur. 
    - *To Model*: Memetakan dari `Response Schema` API menjadi `Model` (Core).
    - *To Schema*: Memetakan dari parameter `Input` (Core) menjadi `Request Schema` (Payload API).
- **Keuntungan**: Jika sewaktu-waktu ada perubahan struktur (keys) JSON dari sisi Backend, kita **HANYA** perlu mengubah `Schema` dan `Mapper` di layer Infrastructure. Kode pada layer Core dan Presentation akan tetap aman dan tidak perlu disentuh sama sekali.
- **Presentation Adapter**: Jika bentuk state yang dibutuhkan React Component (ViewModel) berbeda dari Model murni, lakukan ekstraksi menggunakan `useMemo` langsung di dalam custom hook presentasi (hindari logic transformasi kompleks di dalam komponen TSX).

## 6. Form Validation & Schema Validation (Zod & React Hook Form)
- **Letak Validator**: Skema validasi Zod wajib diletakkan di layer Infrastructure: `modules/infrastructure/src/[nama_modul]/validators/[nama_modul].validator.ts`.
- **Ekspor Entrypoint**: Setiap validator wajib diekspor dari index file `modules/infrastructure/src/[nama_modul]/validators/index.ts` untuk mempermudah konsumsi di modul presentation.
- **Strict Casting DTO/Input**: Skema Zod wajib di-cast secara kuat (*strongly typed*) ke interface DTO/Input yang didefinisikan di layer Core:
  ```typescript
  export const resellerInputSchema = z.object({ ... }) as z.ZodType<CreateResellerInput>;
  export const categoryInputSchema = z.object({ name: z.string().min(1, "Nama kategori wajib diisi") }) as z.ZodType<CreateCategoryInput>;
  ```
- **Form Binding (Presentation)**:
  - Gunakan `react-hook-form` dikombinasikan dengan `@hookform/resolvers/zod` di komponen/halaman formulir.
  - Gunakan opsi binding `{ valueAsNumber: true }` untuk input bertipe angka agar terjadi *automatic casting* sebelum masuk ke validasi Zod.
  - Gunakan komponen `<HelperText variant="error">` di bawah kolom input untuk menampilkan umpan balik validasi secara responsif kepada pengguna.
