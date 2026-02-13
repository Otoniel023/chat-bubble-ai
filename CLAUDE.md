# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **monorepo** for `chat-bubble-ai`, a highly customizable React chat UI component library with AI agent integration. The package is designed to be embedded in other applications with full theming and configuration support.

## Monorepo Structure

- **Root**: npm workspace manager
- **`packages/chat-bubble-ai/`**: Main component library (publishable npm package)
- **`apps/playground/`**: Development playground for testing the library

## Common Commands

### Development
```bash
# Run the playground demo app
npm run dev

# Run library in dev mode (watch mode)
npm run dev:lib

# Run linting across all workspaces
npm run lint
```

### Building
```bash
# Build the library for npm publishing (ES + UMD bundles + types)
npm run build:lib

# Build all workspaces
npm run build
```

### Working in the Monorepo
```bash
# Install dependencies for all workspaces
npm install

# Run commands in specific workspace
npm run dev --workspace=apps/playground
npm run build --workspace=packages/chat-bubble-ai
```

## Architecture Overview

### Core Design Pattern: Provider-Based Component System

The library uses a **React Context architecture** with three layers:

1. **Provider Layer** (`ChatBubbleProvider`)
   - Manages message state, streaming, and errors
   - Located in `packages/chat-bubble-ai/src/components/ChatBubble/ChatBubbleContext.tsx`
   - Must wrap any component that uses chat functionality

2. **Component Layer** (`ChatBubbleComponent`)
   - Orchestrates UI: header, messages, input
   - Consumes context via `useChatBubble()` hook
   - Merges user config with `defaultTheme`
   - Located in `packages/chat-bubble-ai/src/components/ChatBubble/ChatBubble.tsx`

3. **Widget Wrappers** (`EmbeddedChatWidget` / `FloatingChatWidget`)
   - Pre-configured components that include the Provider
   - `EmbeddedChatWidget`: Full-page or container chat
   - `FloatingChatWidget`: Floating bubble with launcher button
   - Located in `packages/chat-bubble-ai/src/components/ChatBubble/components/`

### Message Flow & Streaming

Messages use **Server-Sent Events (SSE)** streaming:

1. User types message → `ChatInput` calls `sendMessage()` from context
2. Context creates user message immediately, shows typing indicator
3. `agentService.sendMessageStream()` opens SSE connection
4. Server streams chunks → `onChunk()` updates assistant message in real-time
5. Stream completes → `onComplete()` marks message as sent, hides typing

Key files:
- **`src/services/agent.service.ts`**: API client for agent streaming endpoint
- **`src/utils/streaming.ts`**: SSE parsing utilities
- **`src/components/ChatBubble/ChatBubbleContext.tsx`**: Message state management

### Configuration System

Everything is configured through a single `ChatBubbleConfig` object:

```typescript
interface ChatBubbleConfig {
  darkMode?: boolean;
  theme?: Partial<ChatTheme>;
  header?: ChatHeaderConfig;
  input?: ChatInputConfig;
  dateSeparator?: DateSeparatorConfig;
  feedback?: { apiErrorMessage?: string };
  // ... more options
}
```

**Important**: See `CONFIGURATION.md` for exhaustive config documentation (800+ lines). This is the source of truth for all theme options, avatar types, button configs, and customization examples.

### Type System

All types are centralized in:
- **`src/components/ChatBubble/ChatBubble.types.ts`**: Main component types
- **`src/types/agent.types.ts`**: Agent/streaming types
- **`src/types/auth.types.ts`**: Auth types (legacy, mostly unused now)

### Styling Architecture

Uses **Tailwind CSS v4** with:
- Dynamic CSS variables for theming (`--color-primary`, `--message-assistant-bg`, etc.)
- Dark mode via class strategy (`dark` class on container)
- Custom properties defined in `ChatBubble.tsx` `buildCssVariables()`
- Global styles in `ChatBubble.styles.css`

## Build System Details

### Vite Dual-Mode Configuration

The `vite.config.ts` supports two modes:

1. **Library Mode** (`--mode lib`)
   - Entry: `src/index.ts`
   - Output: ES + UMD bundles + TypeScript declarations
   - Externals: react, react-dom (peer dependencies)
   - Used for `npm run build:lib`

2. **Dev/Demo Mode** (default)
   - Entry: `index.html` + `embedded.html`
   - Full dev server with HMR
   - Used for `npm run dev`

### Published Package Structure

When built, the library exports:
- `dist/chat-bubble-ai.js` (ES module)
- `dist/chat-bubble-ai.umd.cjs` (UMD for script tags)
- `dist/index.d.ts` (TypeScript types)
- `dist/style.css` (Tailwind styles)

Public API is defined in `src/index.ts` (exports components, hooks, types).

## Key Implementation Notes

### Authentication
- Authentication logic exists but is **mostly unused** in current implementation
- Agent endpoint uses API key (`x-api-key` header) instead of JWT
- `agentService.isAuthenticated()` always returns `true`
- Auth context (`src/contexts/AuthContext.tsx`) is legacy code from earlier architecture

### Message State
- Messages are stored only in React state (no persistence by default)
- Each message has: `id`, `content`, `role` (user/assistant), `timestamp`, `status`
- Status progression: `sending` → `sent` or `error`
- Streaming messages update content incrementally via `onChunk` callback

### Error Handling
- API errors can show custom message via `feedback.apiErrorMessage` config
- If set, errors appear as assistant messages instead of error state
- Errors during streaming are caught and handled by context

### Conversation Persistence
- Conversation ID stored in localStorage via `storage.getConversationId()`
- Generated with `crypto.randomUUID()` on first message
- Sent with each request to maintain conversation context on backend

## Important Files Reference

### Entry Points
- `src/index.ts` - Public API (what consumers import)
- `src/App.tsx` - Demo app entry
- `src/embedded.tsx` - Embedded widget demo entry

### Core Components
- `src/components/ChatBubble/ChatBubble.tsx` - Main orchestrator
- `src/components/ChatBubble/ChatBubbleContext.tsx` - State management provider
- `src/components/ChatBubble/components/ChatMessage.tsx` - Message renderer
- `src/components/ChatBubble/components/ChatInput.tsx` - Input field with actions
- `src/components/ChatBubble/components/ChatHeader.tsx` - Header with avatar/actions

### Services & Utils
- `src/services/agent.service.ts` - AI agent API client
- `src/utils/streaming.ts` - SSE stream parsing
- `src/utils/storage.ts` - localStorage wrapper
- `src/utils/api.ts` - HTTP client utilities

### Configuration & Types
- `CONFIGURATION.md` - **Complete configuration guide (read this for customization)**
- `src/components/ChatBubble/ChatBubble.types.ts` - Type definitions
- `src/types/` - Supporting type definitions

## Development Workflow

### Adding a New Feature
1. Add types to `ChatBubble.types.ts` if needed
2. Update `defaultTheme` if theme-related
3. Implement in component layer
4. Update `CONFIGURATION.md` with examples
5. Test in playground app (`npm run dev`)
6. Build library (`npm run build:lib`) and verify types

### Making Theme Changes
- Modify `defaultTheme` in `ChatBubble.types.ts`
- Update CSS variables in `buildCssVariables()` in `ChatBubble.tsx`
- Add Tailwind classes if needed
- Document in `CONFIGURATION.md`

### Modifying Message Behavior
- Edit `sendMessage()` in `ChatBubbleContext.tsx` for message flow
- Edit `agentService.sendMessageStream()` for API changes
- Update `processSSEStream()` in `streaming.ts` for parsing changes
- Update `ChatMessage.tsx` for rendering changes

## Testing the Library

Since this is a component library:

1. **Use the playground**: Make changes, run `npm run dev`, test in browser
2. **Build and inspect**: Run `npm run build:lib`, check `dist/` output
3. **Test integration**: Link locally with `npm link` in another project
4. **Check types**: Verify `dist/index.d.ts` exports expected types

## Notes on Dependencies

- **React 19** is used (latest)
- **Tailwind CSS v4** (note: breaking changes from v3)
- **Vite 6** for build tooling
- **SWC** for fast compilation instead of Babel
- **vite-plugin-dts** for TypeScript declaration generation

## Configuration Deep Dive

The `CONFIGURATION.md` file contains:
- Complete theme customization options (colors, fonts, spacing)
- Avatar configuration (icon/image/text types)
- Header and input button customization
- Message bubble styling (background, text, opacity, borders)
- Date separator formats
- Backend API integration patterns
- Full working examples for different use cases

**Always refer to `CONFIGURATION.md` when users ask about customization options.**