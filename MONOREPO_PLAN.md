# Monorepo Migration Plan for ChatBubble Playground

This plan outlines the steps to convert the current project into a Monorepo using **npm workspaces**, allowing for a dedicated playground application to consume and test the `chat-bubble-ai` package locally.

## 1. Directory Structure

```
chat-bubble-ai/                          (Root - Monorepo)
├── package.json                         (Workspace root config)
├── package-lock.json
├── node_modules/                        (Hoisted dependencies)
├── packages/
│   └── chat-bubble-ai/                  (The component library)
│       ├── package.json
│       ├── vite.config.ts
│       ├── tsconfig.*.json
│       └── src/
│           ├── index.ts                 (Public entry point)
│           └── components/ChatBubble/   (Component module)
└── apps/
    └── playground/                      (Vite React app for testing)
        ├── package.json
        ├── vite.config.ts
        └── src/
            ├── main.tsx
            └── App.tsx                  (Imports from 'chat-bubble-ai')
```

## 2. Migration Steps

### Phase 1: Infrastructure Setup ✅
1. ✅ **Initialize Root**: Created `package.json` with `workspaces: ["packages/*", "apps/*"]`
2. ✅ **Move Current Project**: Moved `chat-bubble-ai/` → `packages/chat-bubble-ai/`
3. ✅ **Link Dependencies**: `npm install` at root links all workspaces

### Phase 2: Package Configuration ✅
4. ✅ **Source Export**: Added `"source": "./src/index.ts"` to library exports (allows Vite to resolve raw TS without building)
5. ✅ **Workspace Link Verified**: `playground → chat-bubble-ai@0.1.0` symlink active

### Phase 3: Create Playground ✅
6. ✅ **Scaffold Playground**: Created `apps/playground/` with Vite + React + TypeScript
7. ✅ **Consume Package**: Added `"chat-bubble-ai": "*"` as dependency
8. ✅ **Setup App**: Created `App.tsx` with ChatBubble import + Debug Panel
9. ✅ **Vite Config**: Added `resolve.conditions: ['source']` + React alias to avoid duplicates

### Phase 4: Developer Experience (Optional)
10. ⬜ **Turborepo**: Add for build caching (`npm install turbo -D`)
11. ⬜ **.gitignore**: Update for monorepo root

## 3. Available Scripts (from root)

| Command | Description |
|---|---|
| `npm run dev` | Start playground dev server (port 3000) |
| `npm run dev:lib` | Start library demo dev server |
| `npm run build:lib` | Build library for npm publication |
| `npm run build` | Build all workspaces |
| `npm run lint` | Lint all workspaces |

## 4. Key Technical Decisions

- **`"source"` export condition**: Allows Vite to import raw TypeScript from the library during development, bypassing the need for a `dist/` build.
- **React alias**: Playground Vite config aliases `react`/`react-dom` to root `node_modules` to prevent duplicate React instances.
- **npm workspaces**: Chosen over pnpm for compatibility with existing `package-lock.json`.

## 5. Cleanup Note

The old `chat-bubble-ai/` directory at root level may still exist if VS Code had files locked during the move. It can be safely deleted once all VS Code tabs are closed:
```powershell
cmd /c "rmdir /s /q chat-bubble-ai"
```
