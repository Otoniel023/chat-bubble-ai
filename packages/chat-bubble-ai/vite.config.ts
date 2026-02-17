import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig(({ mode }) => {
  // 📦 LIBRARY MODE (npm)
  if (mode === 'lib') {
    return {
      plugins: [
        react(),
        tailwindcss(),
        dts({
          entryRoot: 'src',
          insertTypesEntry: true,
          tsconfigPath: 'tsconfig.build.json'
        })
      ],
      build: {
        lib: {
          entry: resolve(__dirname, 'src/index.ts'),
          name: 'ChatBubbleAI',
          formats: ['es', 'cjs'],
          fileName: (format) =>
            format === 'es' ? 'index.js' : 'index.cjs'
        },
        rollupOptions: {
          external: ['react', 'react-dom', 'react/jsx-runtime'],
          output: {
            assetFileNames: 'style.css'
          }
        }
      }
    }
  }

  // 🧪 DEV / DEMO APP
  return {
    plugins: [react(), tailwindcss()],
    server: {
      allowedHosts: [
        'rehabilitation-oven-magazine-voice.trycloudflare.com'
      ]
    },
    build: {
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
          embedded: resolve(__dirname, 'embedded.html')
        }
      }
    }
  }
})
