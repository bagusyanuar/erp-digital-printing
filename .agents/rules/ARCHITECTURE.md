# Architecture Rules — DDD & Clean Architecture

Aplikasi ini menggunakan struktur 3-layer utama untuk memisahkan tanggung jawab (Separation of Concerns).

## 1. Core Layer (Domain & Application)
- **Tujuan**: Jantung dari aplikasi. Berisi logika bisnis murni tanpa dependensi ke library eksternal atau framework.
- **Isi**:
    - `entities/`: Objek bisnis utama (contoh: `Order`, `Product`).
    - `value-objects/`: Objek kecil yang immutable (contoh: `Price`, `StockQuantity`).
    - `repositories/`: **Interface** (kontrak) untuk akses data.
    - `use-cases/`: Logika alur kerja spesifik (contoh: `CreateOrder`, `CalculateProductionCost`).
- **Aturan**: DILARANG mengimport apa pun dari layer Infrastructure atau Presentation.

## 2. Infrastructure Layer
- **Tujuan**: Implementasi teknis dari kebutuhan Core.
- **Isi**:
    - `repositories/`: Implementasi nyata dari interface repo (contoh: `ApiOrderRepository` menggunakan Axios).
    - `api/`: Konfigurasi API client, interceptors, dan DTO (Data Transfer Objects).
    - `persistence/`: Local storage atau caching logic.
- **Aturan**: Mengetahui tentang Core, tapi tidak boleh mengatur UI.

## 3. Presentation Layer
- **Tujuan**: Tempat interaksi user.
- **Isi**:
    - `components/`: UI atom/modular (React).
    - `hooks/`: "View Model" logic yang menghubungkan UI ke Use Cases.
    - `store/`: State management (Zustand/Pinia) untuk global state.
    - `pages/`: Komposisi komponen menjadi halaman utuh.
- **Aturan**: Hanya boleh mengakses Core (Use Cases/Entities) dan Infrastructure (lewat Dependency Injection jika perlu).

## 🧩 Dependency Rule
- **Arah Dependensi**: `Presentation` -> `Core` <- `Infrastructure`.
- Layer yang lebih dalam tidak boleh tahu tentang layer yang lebih luar. 
- Gunakan **Dependency Injection** atau interface untuk memutus ketergantungan langsung antar layer.
