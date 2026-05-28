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
  - Contoh: `modules/presentation/src/reseller/hooks/useResellerDI.ts`.
  - Isinya: `export const useResellerDI = () => useDI().reseller;`
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

## 5. Mappers & Data Flow
- **Infra Mappers**: Posisikan di `infrastructure/src/[nama_modul]/mappers`. Gunakan mappers untuk memetakan dari schema `Response` API ke `Model` (Core), dan dari parameter form/UI ke `Request` payload.
- **Presentation Adapter**: Jika `Model` (Core) dan bentuk state yang dibutuhkan React Component (ViewModel) berbeda (misal, UI memerlukan object relasional parsial yang tidak ada di Model), maka maping akhir dapat dilakukan di dalam custom hook presentasi menggunakan `useMemo` terhadap respons React Query.
