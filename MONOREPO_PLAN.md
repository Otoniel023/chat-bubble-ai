# Monorepo Migration Plan for ChatBubble Playground

This plan outlines the steps to convert the current project into a Monorepo using **pnpm workspaces** (or npm workspaces), allowing for a dedicated playground application to consume and test the `chat-bubble-ai` package locally.

## 1. Directory Structure Goal

We will restructure the project from:

```
chat-bubble-ai/ (Root)
└── chat-bubble-ai/ (Current Project)
    ├── package.json
    ├── src/
    └── ...
```

To a Monorepo structure:

```
chat-bubble-ai-monorepo/ (Root)
├── package.json (Root Workspace Config)
├── pnpm-workspace.yaml (If using pnpm)
├── packages/
│   └── chat-bubble-ui/ (The component library - renamed from chat-bubble-ai)
│       ├── package.json
│       └── src/
└── apps/ (or examples/)
    └── playground/ (New Vite App)
        ├── package.json
        └── src/ (Imports ChatBubble form local package)
```

## 2. Migration Steps

### Phase 1: Infrastructure Setup
1.  **Initialize Root**: Create a valid `package.json` at the root (`.../chat-bubble-ai/package.json`) with workspace configuration.
    *   *Decision*: Use **pnpm** for better performance and workspace support, or stick to **npm** if preferred. I will assume **npm** (since it's currently used) unless pnpm is requested, but pnpm is recommended for monorepos. *Let's stick to npm workspaces for simplicity as `package-lock.json` exists.*
2.  **Move Current Project**: Move the contents of the inner `chat-bubble-ai` folder into `packages/chat-bubble-ai`.

### Phase 2: Package Configuration
3.  **Update Library Package**: Ensure `packages/chat-bubble-ai/package.json` has the correct name (e.g., `@chat-bubble/react` or keep `chat-bubble-ai`) and exports.
4.  **Link Dependencies**: Run `npm install` at the root to link workspaces.

### Phase 3: Create Playground
5.  **Initialize Playground**: Create a new Vite React app in `apps/playground`.
    *   Command: `npm create vite@latest apps/playground -- --template react-ts`
6.  **Consume Package**: In `apps/playground/package.json`, add dependency: `"chat-bubble-ai": "*"` (or workspace version).
7.  **Setup App**: Modify `apps/playground/src/App.tsx` to import `ChatBubble` from the local package.

### Phase 4: Developer Experience (Optional)
8.  **Turborepo**: (Optional) Add Turborepo for optimized build caching (`npm install turbo -D`).
9.  **Root Scripts**: Add convenience scripts in root `package.json` (e.g., `"dev": "npm run dev --workspaces"`, `"build": "npm run build --workspaces"`).

## 3. Benefits
- **Immediate Feedback**: Changes in `packages/chat-bubble-ai` are immediately reflected in `apps/playground` (especially with HMR if configured correctly).
- **Isolation**: Clean separation between the library logic and the implementation testing.
- **Scalability**: Easy to add more packages (e.g., specific adapters) or apps (e.g., docs site) later.

## 4. Immediate Action Plan
If you approve this plan, I will:
1.  Create the root workspace configuration.
2.  Move the existing project to `packages/`.
3.  Scaffold the playground app.
4.  Wire everything together.
