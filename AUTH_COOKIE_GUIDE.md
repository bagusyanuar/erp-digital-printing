# 🍪 Auth Cookie & Session Mechanism Guide

Dokumen ini menjelaskan arsitektur autentikasi berbasis cookie yang digunakan dalam ERP Digital Printing, baik saat **Local Development (HTTP)** maupun saat **Server Production (HTTPS)**.

---

## 🏗️ Ringkasan Arsitektur

| Environment | Frontend URL | Backend URL | Cookie Attributes | Mekanisme |
|---|---|---|---|---|
| **Local Dev** | `http://localhost:5173` | `http://localhost:8000` | `SameSite=Lax`, `Secure=false`, `HttpOnly=true` | Vite Proxy (`/api` -> `8000`) + Cookie Rewrite |
| **Production** | `https://app.domain.com` | `https://api.domain.com` | `SameSite=None`, `Secure=true`, `Partitioned=true`, `HttpOnly=true` | Direct HTTPS + CHIPS Cross-Domain Cookie |

---

## 🛠️ 1. Local Development (Tanpa Local SSL)

Untuk menyederhanakan proses development tanpa perlu `mkcert`, sertifikat lokal, atau edit `/etc/hosts`:

1. **Frontend Vite Dev Proxy:**
   * Frontend berjalan di `http://localhost:5173`.
   * Request API dipanggil via path relatif: `/api/v1/...` (diatur di `VITE_API_URL=/api/v1`).
   * Vite mem-proxy request tersebut ke backend (`VITE_DEV_PROXY_TARGET=http://localhost:8000`).
   * Vite otomatis membersihkan atribut `Domain` dan `Secure`, serta menyesuaikan `SameSite=Lax` agar browser menerima cookie di atas protokol HTTP biasa.
2. **Backend Development Mode:**
   * Diatur via `APP_ENV=development`.
   * Backend otomatis mengatur `Secure: false`, `SameSite: "Lax"`, dan `Partitioned: false`.

---

## 🚀 2. Server Production Deployment

Saat aplikasi di-upload dan dijalankan di server:

### A. Konfigurasi Backend (`.env` Backend Server)
```env
APP_ENV=production
APP_CORS_ALLOWED_ORIGINS=https://app.made-printing.com
```
* Dengan `APP_ENV=production`, backend otomatis mengaktifkan:
  * `Secure: true` (Hanya dikirim via HTTPS).
  * `SameSite: "None"` (Bisa dikirim antar-domain / cross-site).
  * `Partitioned: true` (CHIPS mechanism agar tidak diblokir fitur pemblokiran third-party cookie browser).

### B. Konfigurasi Frontend (Docker Container)
Saat menjalankan container Docker frontend di server:
```bash
# Environment variable di docker run atau docker-compose:
VITE_API_URL=https://api-made.wolfmother613.web.id/api/v1
```
* Script `entrypoint.sh` pada Docker container akan otomatis menginjeksi nilai `VITE_API_URL` ke `window.__ENV__` saat container pertama kali start.
* Kode frontend runtime membaca `window.__ENV__.VITE_API_URL` secara dinamis.

### C. Persyaratan SSL / HTTPS di Server
* Domain Frontend dan Domain Backend **wajib** memiliki SSL/HTTPS aktif (di-handle oleh Reverse Proxy seperti Nginx host, Traefik, Certbot, atau Cloudflare).
* Browser modern memblokir cookie dengan atribut `SameSite=None` jika tidak menggunakan protokol HTTPS (`Secure: true`).

---

## 🔄 Authentication Flow

### 1. Login
- User memasukkan kredensial via `/api/v1/auth/login`.
- Response backend:
  - Body: `access_token` (disimpan di RAM / Zustand).
  - Header: `Set-Cookie` (Refresh Token, HttpOnly).

### 2. Silent Refresh (Trigger Reload / Startup)
Saat aplikasi di-reload:
1. RAM ter-reset kosong. Hook `useInitializeAuth` memanggil `POST /api/v1/auth/refresh`.
2. Browser menyertakan cookie `refresh_token` (`withCredentials: true`).
3. Backend memvalidasi token, melakukan rotasi token baru ke cookie, dan mengembalikan `access_token` baru.
4. Token disimpan kembali ke Zustand store, dan user tetap berada di halaman tujuan tanpa ter-logout.

### 3. Automatic Token Rotation (Interceptor)
Jika `access_token` kedaluwarsa saat request API berjalan:
1. Axios response interceptor menangkap status `401`.
2. Interceptor otomatis memanggil `POST /api/v1/auth/refresh` di balik layar.
3. Setelah sukses, request yang tadi sempat gagal diulang (*retry*) secara transparan.

### 4. Logout
- Logout dilakukan via `POST /api/v1/auth/logout`.
- Backend mengirim header `Set-Cookie` dengan nilai kosong dan expired time lampau untuk menghapus cookie di browser.
- Frontend membersihkan token di Zustand dan me-redirect user ke halaman login.
