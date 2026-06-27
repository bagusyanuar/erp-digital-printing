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
  resolve: {
    alias: {
      "@core": path.resolve(__dirname, "../../modules/core/src"),
      "@infrastructure": path.resolve(__dirname, "../../modules/infrastructure/src"),
      "@presentation": path.resolve(__dirname, "../../modules/presentation/src"),
    },
    dedupe: ["zod", "react", "react-dom", "react-router-dom", "@tanstack/react-query", "framer-motion", "zustand"],
  },
  server: {
    https: fs.existsSync(path.resolve(__dirname, "../../.ssl/_wildcard.made-printing.local+1-key.pem")) ? {
      key: fs.readFileSync(path.resolve(__dirname, "../../.ssl/_wildcard.made-printing.local+1-key.pem")),
      cert: fs.readFileSync(path.resolve(__dirname, "../../.ssl/_wildcard.made-printing.local+1.pem")),
    } : undefined,
    host: "made-printing.local",
    port: 5173,
  },
})
