# 🍪 Auth Cookie & Session Mechanism Guide

Dokumen ini menjelaskan mekanisme autentikasi berbasis cookie yang digunakan dalam ERP Digital Printing untuk menangani skenario **Cross-Domain** antara Frontend (`made-printing.local`) dan Backend (`wolfmother613.web.id`).

## 🛠️ Cookie Configuration (Backend)

Refresh Token disimpan dalam **HttpOnly Cookie** dengan atribut keamanan tingkat tinggi untuk menghindari pencurian token (XSS) dan pemblokiran browser (Third-party cookie restrictions).

### Attributes:
| Attribute | Value | Description |
|-----------|-------|-------------|
| **Name** | `refresh_token` | Nama cookie untuk rotasi token. |
| **HTTPOnly** | `true` | Mencegah JavaScript mengakses cookie (Proteksi XSS). |
| **Secure** | `true` | Wajib aktif agar cookie hanya dikirim via HTTPS. |
| **SameSite** | `None` | Mengizinkan cookie dikirim dalam request cross-site (beda domain). |
| **Partitioned** | `true` | **CHIPS Mechanism**. Mempartisi cookie agar tidak diblokir oleh kebijakan "Block Third-party Cookies" browser modern. |
| **Path** | `/` | Cookie tersedia untuk seluruh path API. |

---

## 🔄 Authentication Flow

### 1. Login
- User memasukkan kredensial.
- BE merespons dengan:
    - Body: `access_token` (Short-lived, disimpan di RAM/Zustand).
    - Header: `Set-Cookie` (Refresh Token, Partitioned).

### 2. Silent Refresh (Trigger Startup)
Saat aplikasi di-reload (RAM kosong), Frontend menjalankan logic "Initial Auth Check":
1. App memanggil `POST /auth/refresh`.
2. Browser otomatis menyertakan cookie `refresh_token` (karena `withCredentials: true` dan `SameSite=None`).
3. BE memvalidasi cookie dan mengirimkan `access_token` baru.
4. App menyimpan token ke Zustand dan melanjutkan ke Dashboard.

### 3. Automatic Token Rotation (Interceptor)
Jika `access_token` expired saat request sedang berjalan:
1. Interceptor menangkap error `401`.
2. Interceptor memanggil `POST /auth/refresh` di balik layar.
3. Jika sukses, request asli diulang (*retry*) dengan token baru.

---

## ⚠️ Requirements & Troubleshooting

### 1. HTTPS is Mandatory
Atribut `Secure: true` dan `SameSite: None` **WAJIB** berjalan di protokol HTTPS. Gunakan `mkcert` untuk development lokal.

### 2. Chrome DevTools Check
Untuk memastikan mekanisme Partitioned bekerja, cek di tab **Application > Cookies**:
- Kolom **Partition Key Site** harus berisi `https://made-printing.local`.
- Jika kosong, berarti atribut `Partitioned` belum ter-render dengan benar oleh BE.

### 3. Third-Party Cookies
Dengan `Partitioned: true`, user tidak perlu mengaktifkan "Allow all cookies" di browser. Sistem akan tetap bekerja meskipun browser memblokir third-party cookies secara umum, karena cookie kita sudah di-partisi khusus untuk domain ERP ini.

---

## 🚪 Logout Mechanism
Logout harus dilakukan via API agar BE bisa menghapus cookie dengan mengirimkan header `Set-Cookie` yang sudah expired (dan tetap menyertakan atribut `Partitioned: true`).
