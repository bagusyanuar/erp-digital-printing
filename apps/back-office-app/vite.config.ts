import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const devProxyTarget = env.VITE_DEV_PROXY_TARGET || 'http://localhost:8000'

  return {
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
      port: 5173,
      proxy: {
        '/api': {
          target: devProxyTarget,
          changeOrigin: true,
          secure: false,
          configure: (proxy) => {
            proxy.on('proxyRes', (proxyRes) => {
              const setCookie = proxyRes.headers['set-cookie']
              if (!setCookie) return

              // Rewrite cookie agar browser di localhost (HTTP biasa) bisa menerima cookie:
              // 1. Hapus Domain & Secure
              // 2. Ganti SameSite=None menjadi SameSite=Lax
              // 3. Hapus Partitioned
              proxyRes.headers['set-cookie'] = setCookie.map((cookie) =>
                cookie
                  .replace(/;\s*Domain=[^;]+/gi, '')
                  .replace(/;\s*Secure/gi, '')
                  .replace(/;\s*SameSite=None/gi, '; SameSite=Lax')
                  .replace(/;\s*Partitioned/gi, '')
              )
            })
          },
        },
      },
    },
  }
})
