# 🔐 Wiki Modul: Auth (Autentikasi & Sesi)

Dokumentasi spesifikasi modul Autentikasi untuk migrasi dari React ke Svelte.

---

## 1. Konsep & Token Lifecycle
* **Access Token**: Disimpan di **in-memory / client state** (Zustand di React $\to$ Runes `$state` / Svelte Store di Svelte). Tidak disimpan di `localStorage` demi keamanan XSS.
* **Refresh Token**: Disimpan di **HTTP-Only Cookie** oleh backend. Dikirim otomatis oleh browser melalui header `withCredentials: true` / `credentials: 'include'`.
* **Silent Refresh saat Bootstrapping**: Saat aplikasi dibuka/direfresh pertama kali, app memicu `Refresh` usecase. Jika cookie valid, token baru di-set ke in-memory store; jika 401/expired, user diarahkan ke login.
* **Auto-Retry Interceptor (401 Handler)**: Jika request API gagal dengan kode HTTP `401 Unauthorized` (dan bukan request ke `/auth/refresh`), interceptor otomatis memanggil `/auth/refresh`, memperbarui token di store, lalu mengulang request awal.

---

## 2. Kontrak API Backend

| Action | Method | Endpoint | Request Body | Response Body |
| :--- | :--- | :--- | :--- | :--- |
| **Login** | `POST` | `/auth/login` | `{ "username": "string", "password": "string" }` | `{ "message": "string", "data": { "access_token": "string" } }` (+ set-cookie `refresh_token`) |
| **Refresh** | `POST` | `/auth/refresh` | *None* (kirim cookie) | `{ "message": "string", "data": { "access_token": "string" } }` |
| **Logout** | `POST` | `/auth/logout` | *None* | `{ "message": "string" }` (+ clear cookie) |

---

## 3. Layer `@core` (100% Agnostik - Reusable di Svelte)

Path di React: `modules/core/src/auth/`

### A. Models & Inputs
```typescript
// Models
export interface LoginModel {
  accessToken: string;
}

// Inputs
export interface LoginInput {
  username: string;
  password: string;
}
```

### B. Repository Interface
```typescript
export interface AuthRepository {
  login(input: LoginInput): Promise<LoginModel>;
  refresh(): Promise<LoginModel>;
  logout(): Promise<void>;
}
```

### C. UseCases
* `Login.execute(input: LoginInput): Promise<LoginModel>`
* `Refresh.execute(): Promise<LoginModel>`
* `Logout.execute(): Promise<void>`

---

## 4. Layer `@infrastructure` (100% Agnostik - Reusable di Svelte)

Path di React: `modules/infrastructure/src/auth/`

### A. Schemas (DTO)
```typescript
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
}
```

### B. Validation Schema (Zod)
```typescript
import { z } from "zod";
import type { LoginInput } from "@core/auth/applications/inputs";

export const loginInputSchema = z.object({
  username: z.string().min(1, "username is required"),
  password: z
    .string()
    .min(1, "password is required")
    .min(6, "password must be at least 6 characters"),
}) as z.ZodType<LoginInput>;
```

### C. Mappers
* `mapLoginInputToRequest(input: LoginInput): LoginRequest` $\to$ `{ username: input.username, password: input.password }`
* `mapLoginResponseToModel(response: LoginResponse): LoginModel` $\to$ `{ accessToken: response.access_token }`

### D. Repository Implementation (`ApiAuthRepository`)
* Menggunakan `HttpClient` (Axios / Fetch wrapper dengan `withCredentials: true`).
* Membungkus call dengan helper `safeApiCall()` untuk standardisasi error parsing.

---

## 5. Layer `@presentation` (Implementasi Legacy React $\to$ Target Svelte)

### A. Global State (Token & Status Sesi)
* **React (Lama)**: Zustand `useAuthStore`
  * State: `{ accessToken: string | null, isAuthenticated: boolean }`
  * Actions: `setToken(token: string)`, `clearToken()`
* **Svelte Target**:
  * Svelte 5 Runes (`auth.svelte.ts`) menggunakan class dengan `$state`:
  ```typescript
  class AuthState {
    accessToken = $state<string | null>(null);
    isAuthenticated = $derived(this.accessToken !== null);

    setToken(token: string) {
      this.accessToken = token;
    }
    clearToken() {
      this.accessToken = null;
    }
  }
  export const authStore = new AuthState();
  ```

### B. Alur Login & Redirect
1. Form input (`username`, `password`) divalidasi via `loginInputSchema` (Zod).
2. Panggil usecase `loginUseCase.execute(input)`.
3. Pada saat sukses:
   * Simpan `data.accessToken` ke state client.
   * Panggil `getProfileUseCase.execute()` untuk mengambil profile & role user.
   * Lakukan redirect berdasarkan role (`getDefaultHomePath`):
     * `administrator` / `admin` $\to$ `/dashboard` (atau `/order`)
     * `designer` $\to$ `/ticket-order`
     * default $\to$ `/dashboard`
4. Pada saat gagal:
   * Tampilkan toast error (`errorMessage` dari response backend atau fallback error).

### C. Alur Logout
1. Panggil usecase `logoutUseCase.execute()`.
2. Clear token dari state (`clearToken()`).
3. Reset/clear semua query cache (TanStack Query / Svelte Query cache).
4. Tampilkan toast informasi & redirect ke `/login`.
5. Catatan: Jika request API logout gagal (misal server error), state lokal **tetap wajib dibersihkan** & tetap redirect ke login demi keamanan.

### D. Route Protection / Guards
* **Public Route** (`/` atau `/login`):
  * Jika user sudah terautentikasi (`accessToken` ada), cegah akses form login dan langsung redirect ke beranda sesuai role (`getDefaultHomePath`).
* **Protected Route**:
  * Jika `accessToken === null`, redirect ke `/login`.
* **Role Guard**:
  * Cek user roles terhadap `allowedRoles` (contoh: `["administrator", "admin"]`). Jika tidak cocok, redirect atau beri tampilan 403 Forbidden.

---

## 6. Checklist Migrasi Svelte untuk Modul Auth
- [ ] Salin folder `@core/auth` ke project Svelte (langsung jalan tanpa modifikasi).
- [ ] Salin folder `@infrastructure/auth` ke project Svelte (langsung jalan tanpa modifikasi).
- [ ] Konfigurasi `HttpClient` (Axios / Fetch) dengan interceptor request `Bearer` & refresh 401 retry.
- [ ] Buat store `auth.svelte.ts` (Svelte 5 runes).
- [ ] Buat form login Svelte dengan validasi Zod + Shadcn-Svelte / Bits UI.
- [ ] Pasang navigation guard di router Svelte (SvelteKit `hooks.server.ts` / layout load atau client-side router guard).

