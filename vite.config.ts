import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Configuración de Vite para el proyecto GameFind
// https://vite.dev/config/
export default defineConfig({
  // Base path './' asegura que los assets se carguen correctamente en GitHub Pages
  base: '/GameFind/',
  plugins: [
    // Habilita el soporte para React
    react(),
    // Habilita la integración de Tailwind CSS v4 (compilación ultra rápida)
    tailwindcss(),
  ],
})
