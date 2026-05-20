# Chat Bubble AI - Vanilla JavaScript

Framework-agnostic chat UI component with AI agent integration. No React required!

## 🎯 Features

- **Zero Dependencies**: Pure JavaScript, works with any framework (or none!)
- **CDN Ready**: Import directly via `<script type="module">`
- **Lightweight**: ~51KB JS (12KB gzipped) + ~28KB CSS (6KB gzipped)
- **Full TypeScript Support**: Complete type definitions included
- **Streaming SSE**: Real-time AI responses with Server-Sent Events
- **Customizable**: Full theming, dark mode, custom avatars
- **Production Ready**: Same proven core as React version

## 📦 Installation

### Via npm

```bash
npm install chat-bubble-ai
```

```javascript
import { createChatBubble } from 'chat-bubble-ai/vanilla';
import 'chat-bubble-ai/vanilla/style.css';

const chat = createChatBubble({
  container: '#chat-container',
  url: 'https://api.example.com/stream',
  token: 'your-api-key',
});
```

### Via CDN

```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="https://unpkg.com/chat-bubble-ai@latest/dist/vanilla/chat-bubble-ai-vanilla.css">
</head>
<body>
  <div id="chat"></div>

  <script type="module">
    import { createChatBubble } from 'https://unpkg.com/chat-bubble-ai@latest/dist/vanilla/chat-bubble-ai-vanilla.js';

    const chat = createChatBubble({
      container: '#chat',
      url: 'https://api.example.com/stream',
      token: 'api-key-123',
      initialMessage: 'Hello! How can I help you today?',
    });
  </script>
</body>
</html>
```

## 🚀 Quick Start

### Basic Usage

```javascript
const chat = createChatBubble({
  container: '#my-chat',
  url: 'https://api.example.com/stream',
  token: 'your-api-key',
});
```

### With Theming

```javascript
const chat = createChatBubble({
  container: '#my-chat',
  url: 'https://api.example.com/stream',
  token: 'your-api-key',
  darkMode: false,
  theme: {
    cssVariables: {
      colorPrimary: '#4f46e5',
      colorPrimaryHover: '#4338ca',
    },
  },
});
```

### With Custom Header

```javascript
const chat = createChatBubble({
  container: '#my-chat',
  url: 'https://api.example.com/stream',
  token: 'your-api-key',
  header: {
    title: 'Support Chat',
    subtitle: 'We typically reply in a few minutes',
    avatar: {
      type: 'image',
      src: 'https://example.com/avatar.png',
      size: 'lg',
    },
    actions: [
      {
        id: 'minimize',
        icon: '➖',
        ariaLabel: 'Minimize chat',
        onClick: () => console.log('Minimize clicked'),
      },
    ],
  },
});
```

## 📖 API Reference

### `createChatBubble(config)`

Creates and initializes a chat bubble instance.

**Parameters:**

```typescript
interface VanillaChatBubbleConfig {
  // Required
  container: string | HTMLElement;  // Container selector or element
  url: string;                      // API endpoint for streaming
  token: string;                    // API authentication token

  // Optional
  darkMode?: boolean;               // Enable dark mode (default: false)
  theme?: Partial<ChatTheme>;       // Theme customization
  header?: ChatHeaderConfig;        // Header configuration
  input?: ChatInputConfig;          // Input field configuration
  dateSeparator?: DateSeparatorConfig;  // Date separator options
  feedback?: { apiError?: string }; // Custom error messages
  initialMessage?: string;          // Initial greeting message
}
```

**Returns:**

```typescript
interface ChatBubbleAPI {
  sendMessage(message: string): Promise<void>;
  getMessages(): ChatMessage[];
  clearMessages(): void;
  injectMessage(message: Omit<ChatMessage, 'id' | 'timestamp'>): void;
  setDarkMode(darkMode: boolean): void;
  destroy(): void;
}
```

### Public Methods

#### `chat.sendMessage(message: string)`

Send a message programmatically.

```javascript
await chat.sendMessage('Hello, AI!');
```

#### `chat.getMessages()`

Get all messages in the conversation.

```javascript
const messages = chat.getMessages();
console.log(messages);
// [
//   { id: '...', content: 'Hello', role: 'user', timestamp: '...', status: 'sent' },
//   { id: '...', content: 'Hi!', role: 'assistant', timestamp: '...', status: 'sent' }
// ]
```

#### `chat.clearMessages()`

Clear all messages from the chat.

```javascript
chat.clearMessages();
```

#### `chat.injectMessage(message)`

Inject a message programmatically (without sending to API).

```javascript
chat.injectMessage({
  content: 'System notification',
  role: 'assistant',
  status: 'sent',
});
```

#### `chat.setDarkMode(enabled: boolean)`

Toggle dark mode.

```javascript
chat.setDarkMode(true);
```

#### `chat.destroy()`

Destroy the chat instance and cleanup.

```javascript
chat.destroy();
```

## 🎨 Theming

### CSS Variables

```javascript
const chat = createChatBubble({
  // ...
  theme: {
    cssVariables: {
      // Colors
      colorPrimary: '#137fec',
      colorPrimaryHover: '#0d6edb',
      colorBackgroundLight: '#f6f7f8',
      colorBackgroundDark: '#101922',
      colorSurfaceLight: '#ffffff',
      colorSurfaceDark: '#283039',
      colorBorderLight: '#e2e8f0',
      colorBorderDark: '#283039',
      colorTextSecondary: '#9dabb9',
      colorTextTertiary: '#6b7a8a',

      // Fonts
      fontSans: 'Inter, system-ui, sans-serif',

      // Animations
      animateBounce: 'bounce 1.4s infinite',
    },
  },
});
```

### Message Bubbles

```javascript
const chat = createChatBubble({
  // ...
  theme: {
    messageBubbles: {
      assistant: {
        background: '#f1f5f9',
        textColor: '#000000',
        borderRadius: '1rem',
        opacity: 1,
        fontWeight: 'base',
      },
      user: {
        background: '#137fec',
        textColor: '#ffffff',
        borderRadius: '1rem',
        opacity: 1,
        fontWeight: 'base',
      },
    },
  },
});
```

## 🌐 Backend Integration

The chat component expects a **Server-Sent Events (SSE)** streaming endpoint:

### Expected Request

```http
POST /api/stream
Content-Type: application/json
x-api-key: your-token

{
  "message": "User message here",
  "conversationId": "uuid-v4"
}
```

### Expected Response

```
Content-Type: text/event-stream

data: {"type":"token","content":"Hello"}
data: {"type":"token","content":" there"}
data: {"type":"token","content":"!"}
data: {"type":"done"}
```

## 🔧 Advanced Examples

### Using with Vue.js

```vue
<template>
  <div ref="chatContainer"></div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { createChatBubble } from 'chat-bubble-ai/vanilla';
import 'chat-bubble-ai/vanilla/style.css';

const chatContainer = ref(null);
let chatInstance = null;

onMounted(() => {
  chatInstance = createChatBubble({
    container: chatContainer.value,
    url: 'https://api.example.com/stream',
    token: 'api-key',
  });
});

onUnmounted(() => {
  chatInstance?.destroy();
});
</script>
```

### Using with Angular

```typescript
import { Component, ElementRef, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { createChatBubble, ChatBubbleAPI } from 'chat-bubble-ai/vanilla';

@Component({
  selector: 'app-chat',
  template: '<div #chatContainer></div>',
})
export class ChatComponent implements OnInit, OnDestroy {
  @ViewChild('chatContainer') chatContainer!: ElementRef;
  private chat?: ChatBubbleAPI;

  ngOnInit() {
    this.chat = createChatBubble({
      container: this.chatContainer.nativeElement,
      url: 'https://api.example.com/stream',
      token: 'api-key',
    });
  }

  ngOnDestroy() {
    this.chat?.destroy();
  }
}
```

### Using with Svelte

```svelte
<script>
  import { onMount, onDestroy } from 'svelte';
  import { createChatBubble } from 'chat-bubble-ai/vanilla';
  import 'chat-bubble-ai/vanilla/style.css';

  let chatContainer;
  let chat;

  onMount(() => {
    chat = createChatBubble({
      container: chatContainer,
      url: 'https://api.example.com/stream',
      token: 'api-key',
    });
  });

  onDestroy(() => {
    chat?.destroy();
  });
</script>

<div bind:this={chatContainer}></div>
```

## 📊 Bundle Size

- **JavaScript**: 51.66 KB (12.45 KB gzipped)
- **CSS**: 28 KB (6.26 KB gzipped)
- **Total**: ~80 KB (~18 KB gzipped)

## 🆚 Vanilla vs React

| Feature | Vanilla | React |
|---------|---------|-------|
| Bundle Size | ~18 KB gzipped | ~30 KB gzipped (+ React) |
| Dependencies | Zero | React 18/19 |
| TypeScript | ✅ Full support | ✅ Full support |
| Dark Mode | ✅ | ✅ |
| Theming | ✅ | ✅ |
| SSE Streaming | ✅ | ✅ |
| Widgets | ⏳ Coming soon | ✅ |

## 🐛 Troubleshooting

### Chat not appearing

Make sure:
1. CSS is imported
2. Container element exists before calling `createChatBubble()`
3. Container has a defined height

```css
#chat-container {
  width: 100%;
  height: 600px;
}
```

### Streaming not working

Verify:
1. API endpoint returns `Content-Type: text/event-stream`
2. Chunks are formatted as `data: {...}\n\n`
3. API key is correct
4. CORS is configured if calling from different domain

### TypeScript errors

Make sure `chat-bubble-ai` is installed and types are being resolved:

```typescript
import type { ChatBubbleAPI, VanillaChatBubbleConfig } from 'chat-bubble-ai/vanilla';
```

## 📄 License

MIT

## 🙋 Support

- [GitHub Issues](https://github.com/yourusername/chat-bubble-ai/issues)
- [Documentation](https://github.com/yourusername/chat-bubble-ai)

---

**Made with ❤️ using vanilla JavaScript**
