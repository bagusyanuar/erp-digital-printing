# ERP Digital Printing

Monorepo aplikasi ERP Digital Printing menggunakan **pnpm workspace** dan **Turborepo**.

---

## 🚀 Panduan Rilis (CI/CD Release Guide)

Project ini memiliki alur rilis terpisah antara **Development** dan **Production** yang otomatis terintegrasi dengan GitHub Container Registry (GHCR) dan GitHub Actions.

### Ringkasan Alur

| Target | Format Tag Git | Workflow GitHub Actions | Hasil Docker Image (GHCR) | Deployment |
| :--- | :--- | :--- | :--- | :--- |
| **Development** | `dev-vX.Y.Z` | `.github/workflows/docker-dev.yml` | `dev-latest`, `dev-<sha>`, `dev-X.Y.Z` | Manual (CI Only) |
| **Production** | `vX.Y.Z` | `.github/workflows/docker-prod.yml` | `latest`, `X.Y.Z`, `major.minor` | Otomatis via SSH (CI/CD) |

---

### Cara Melakukan Release

Gunakan script release otomatis yang sudah disediakan:

#### 1. Mode Interaktif (Paling Direkomendasikan)
Cukup jalankan:
```bash
pnpm release
```
Kamu akan dipandu memilih:
1. **Target:** `1) dev` atau `2) prod`
2. **Tipe Bump Versi:**
   - `0) initial` (contoh: `1.0.0` -> rilis pertama kali)
   - `1) patch` (contoh: `1.0.0` -> `1.0.1`)
   - `2) minor` (contoh: `1.0.0` -> `1.1.0`)
   - `3) major` (contoh: `1.0.0` -> `2.0.0`)
   - `4) custom` (masukkan versi manual)
3. Script akan otomatis:
   - Mengupdate versi di root `package.json` dan `apps/back-office-app/package.json`.
   - Membuat git commit (`chore(release): ...`).
   - Membuat git tag beranotasi (`dev-v...` atau `v...`).
   - Menanyakan konfirmasi untuk langsung push ke GitHub origin.

---

#### 2. Mode Shortcut (Cepat)

##### Rilis ke Development:
```bash
# Menjalankan wizard dev
pnpm release:dev

# Atau langsung bump patch dev
pnpm release dev patch

# Atau tentukan versi langsung
pnpm release dev 2.2.0
```
> **Output:** Tag `dev-vX.Y.Z` terbuat dan di-push ke GitHub. GitHub Actions akan mem-build Docker image untuk testing tanpa mengotori image production.

##### Rilis ke Production:
```bash
# Menjalankan wizard prod
pnpm release:prod

# Atau langsung bump patch prod
pnpm release prod patch

# Atau tentukan versi langsung
pnpm release prod 2.2.0
```
> **Output:** Tag `vX.Y.Z` terbuat dan di-push ke GitHub. GitHub Actions akan mem-build Docker image `latest` dan otomatis mendeploy ke server Production via SSH.

---

## 🛠️ GitHub Actions Secrets (Production Deployment)

Agar Continuous Deployment (CD) ke server production berjalan otomatis, pastikan Secrets berikut telah diatur di **GitHub Repository > Settings > Secrets and variables > Actions**:

- `PROD_SERVER_HOST`: IP Address atau Hostname VPS Production.
- `PROD_SERVER_USER`: Username SSH server (contoh: `ubuntu`, `root`).
- `PROD_SSH_PRIVATE_KEY`: Private Key SSH server.
- `PROD_SERVER_PORT`: Port SSH (default: `22` jika tidak diisi).
- `PROD_APP_PATH`: Lokasi folder docker compose di server (default: `/var/www/prod-app`).

---

## 💻 Menjalankan Project di Lokal

```bash
# Install dependensi
pnpm install

# Jalankan semua aplikasi
pnpm dev

# Jalankan hanya Back-Office App
pnpm dev:back-office
```

