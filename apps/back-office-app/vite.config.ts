import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import path from 'path'
import fs from 'fs'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    tsconfigPaths(),
  ],
  server: {
    https: {
      key: fs.readFileSync(path.resolve(__dirname, "../../.ssl/_wildcard.made-printing.local+1-key.pem")),
      cert: fs.readFileSync(path.resolve(__dirname, "../../.ssl/_wildcard.made-printing.local+1.pem")),
    },
    host: "made-printing.local",
    port: 5173,
  },
})
