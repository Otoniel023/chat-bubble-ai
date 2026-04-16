import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Vanilla build mode (framework-agnostic version)
  if (mode === 'vanilla') {
    return {
      plugins: [
        tailwindcss(),
        dts({
          include: ['src/vanilla', 'src/services', 'src/utils', 'src/types', 'src/components/ChatBubble/ChatBubble.types.ts'],
          tsconfigPath: './tsconfig.app.json',
          insertTypesEntry: true,
          outDir: 'dist/vanilla',
        }),
      ],
      build: {
        lib: {
          entry: resolve(__dirname, 'src/vanilla/index.ts'),
          name: 'ChatBubbleAIVanilla',
          formats: ['es'],
          fileName: 'chat-bubble-ai-vanilla',
        },
        outDir: 'dist/vanilla',
        rollupOptions: {
          // No externals - bundle everything
          output: {
            inlineDynamicImports: true,
            assetFileNames: 'chat-bubble-ai-vanilla.[ext]',
          },
        },
      },
    }
  }

  // Library build mode (npm publish - React version)
  if (mode === 'lib') {
    return {
      plugins: [
        react(),
        tailwindcss(),
        dts({
          include: ['src'],
          tsconfigPath: './tsconfig.app.json',
          insertTypesEntry: true,
        }),
      ],
      build: {
        lib: {
          entry: resolve(__dirname, 'src/index.ts'),
          name: 'ChatBubbleAI',
          formats: ['es', 'umd'],
          fileName: 'chat-bubble-ai',
        },
        rollupOptions: {
          external: ['react', 'react-dom', 'react/jsx-runtime'],
          output: {
            globals: {
              react: 'React',
              'react-dom': 'ReactDOM',
              'react/jsx-runtime': 'jsxRuntime',
            },
          },
        },
      },
    }
  }

  // Default dev/build mode (demo app)
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
