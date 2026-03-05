import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import fs from 'fs'
import path from 'path'

export default defineConfig({
  base: '/Copilot-Testing/',
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      strategies: 'generateSW',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      },
      includeAssets: ['favicon.ico'],
      manifest: {
        name: 'Copilot Task Manager',
        short_name: 'Copilot Tasks',
        description: 'Gestor de tareas inteligente con PWA',
        theme_color: '#6366f1',
        background_color: '#f8fafc',
        icons: []
      }
    }),
    {
      name: 'copy-github-pages-files',
      apply: 'build',
      enforce: 'post',
      async writeBundle() {
        // Copy .nojekyll file
        const nojekyllPath = path.join(__dirname, 'dist', '.nojekyll')
        fs.writeFileSync(nojekyllPath, '')
        
        // Copy 404.html file
        const notFoundPath = path.join(__dirname, 'dist', '404.html')
        const notFoundContent = `<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Redirigiendo...</title>
    <script>
      const path = location.pathname.replace(/^\\/Copilot-Testing/, '') || '/';
      sessionStorage.redirect = path;
      location.href = '/Copilot-Testing/';
    </script>
  </head>
  <body>
    <h1>Redirigiendo...</h1>
    <p>Si no eres redirigido en unos segundos, por favor <a href="/Copilot-Testing/">haz clic aquí</a>.</p>
  </body>
</html>`
        fs.writeFileSync(notFoundPath, notFoundContent)
      }
    }
  ],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['vue', 'axios'],
          'ui': ['pinia']
        }
      }
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
})
