import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
  base: '/ShinyDex-Site/ShinyDex-Site/',
  css: {
    preprocessorOptions: {
      scss: {
        // On ignore les warnings qui viennent des dépendances (Bootstrap)
        quietDeps: true,
        // On force l'utilisation de l'api moderne de Sass
        api: 'modern-compiler' 
      },
    },
  },
})