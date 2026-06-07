# Setup Local HTTPS with mkcert

To enable local HTTPS with a wildcard domain for development (e.g., `*.made-printing.local` and `made-printing.local`), follow these steps:

## 1. Install `mkcert`

On macOS, install via Homebrew:

```bash
brew install mkcert
# If you are using Firefox, also install nss:
brew install nss
```

## 2. Set Up Local CA

Run the following command to register the local Certificate Authority (CA) into your system keychain and browser stores:

```bash
mkcert -install
```

## 3. Generate the Wildcard Certificate

Navigate to your SSL storage folder (e.g., `.ssl` at the root of the project) and run:

```bash
mkcert "*.made-printing.local" "made-printing.local"
```

This will generate the following two files:
- **Certificate:** `_wildcard.made-printing.local+1.pem`
- **Private Key:** `_wildcard.made-printing.local+1-key.pem`

## 4. Vite Configuration Example

In your Vite configuration (e.g., `vite.config.ts`), load the generated certificate files:

```typescript
import { defineConfig } from 'vite'
import fs from 'fs'
import path from 'path'

export default defineConfig({
  server: {
    https: {
      key: fs.readFileSync(path.resolve(__dirname, "../../.ssl/_wildcard.made-printing.local+1-key.pem")),
      cert: fs.readFileSync(path.resolve(__dirname, "../../.ssl/_wildcard.made-printing.local+1.pem")),
    },
    host: "made-printing.local",
    port: 5173,
  },
})
```
