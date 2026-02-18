# chat-bubble-ai

A highly customizable, zero-dependency-on-icon-fonts React chat bubble component designed for seamless integration with AI streaming agents.

## Features

- 💬 **Streaming Support** — Built-in Server-Sent Events (SSE) streaming for real-time AI responses.
- 🎨 **Fully Themeable** — CSS variables, dark mode, custom message bubble styles, and fonts.
- 📦 **Zero Font Dependencies** — All icons are inline SVGs; no Material Symbols or icon font required.
- 🖼️ **HTML Rendering** — Assistant messages support rich HTML (cards, images, lists, etc.).
- 📱 **Responsive** — Works on desktop and mobile out of the box.
- 🧩 **Multiple Modes** — Use as a full-page chat, a floating bubble, or an embedded iframe widget.
- 🔌 **Easy Integration** — One config object controls everything: URL, auth, theme, header, and input.

## Installation

```bash
npm install chat-bubble-ai
# or
yarn add chat-bubble-ai
```

### Import CSS

Import the bundled stylesheet once in your app entry point:

```ts
import 'chat-bubble-ai/dist/chat-bubble-ai.css';
```

---

## Usage

### 1. Full-page / Embedded Chat

Wrap `ChatBubbleComponent` in a `ChatBubbleProvider` and place it inside any sized container.

```tsx
import {
  ChatBubbleProvider,
  ChatBubbleComponent,
} from 'chat-bubble-ai';
import type { ChatBubbleConfig } from 'chat-bubble-ai';

const config: ChatBubbleConfig = {
  url: 'https://api.your-service.com/stream', // SSE streaming endpoint
  token: 'your-api-key',                      // Optional auth token
  darkMode: false,
  header: {
    title: 'AI Assistant',
    subtitle: 'Ask me anything',
    avatar: {
      type: 'image',
      src: 'https://example.com/avatar.webp',
    },
  },
  input: {
    placeholder: 'Type your message...',
    showSendButton: true,
    showVoice: false,
  },
};

export default function App() {
  return (
    <ChatBubbleProvider>
      <div style={{ height: '600px', width: '400px' }}>
        <ChatBubbleComponent config={config} />
      </div>
    </ChatBubbleProvider>
  );
}
```

---

### 2. Floating Chat Widget

A self-contained floating button that expands into a chat panel — no provider needed.

```tsx
import { FloatingChatWidget } from 'chat-bubble-ai';

export default function App() {
  return (
    <FloatingChatWidget
      config={{
        url: 'https://api.your-service.com/stream',
        token: 'your-api-key',
        header: {
          title: 'Support Bot',
        },
        launcher: {
          color: '#137fec',        // Button background color
          // imageUrl: '/bot.png', // Optional custom launcher image
        },
      }}
    />
  );
}
```

---

### 3. Embedded Widget (Iframe-friendly)

Designed for embedding inside an iframe. Notifies the parent window via `postMessage` when the chat opens or closes.

```tsx
import { EmbeddedChatWidget } from 'chat-bubble-ai';

export default function App() {
  return (
    <EmbeddedChatWidget
      config={{
        url: 'https://api.your-service.com/stream',
        token: 'your-api-key',
      }}
      showNotificationBadge={true}
      notificationCount={3}
    />
  );
}
```

---

## Configuration Reference

### `ChatBubbleConfig`

| Property       | Type               | Default     | Description                                              |
| -------------- | ------------------ | ----------- | -------------------------------------------------------- |
| `url`          | `string`           | —           | **Required.** SSE streaming endpoint URL.                |
| `token`        | `string`           | —           | Optional API key sent as `x-api-key` header.             |
| `darkMode`     | `boolean`          | `true`      | Enable dark mode on load.                                |
| `height`       | `string`           | `'100vh'`   | Container height (CSS value).                            |
| `maxWidth`     | `string`           | `'100%'`    | Container max-width (CSS value).                         |
| `theme`        | `ChatTheme`        | —           | Customize colors, fonts, and message bubble styles.      |
| `header`       | `ChatHeaderConfig` | —           | Title, subtitle, avatar, and action buttons.             |
| `input`        | `ChatInputConfig`  | —           | Placeholder, send button, emoji, voice, and more.        |
| `launcher`     | `LauncherConfig`   | —           | Floating button color, icon, and notification animation. |
| `notification` | `NotificationConfig` | —         | Notification bubble message, interval, duration, and dot styling. |
| `initialMessage` | `string`         | —           | Initial greeting message shown by the assistant when chat opens. |
| `style`        | `React.CSSProperties` | —        | Additional inline styles for the root container.         |

---

### `NotificationConfig`

| Property   | Type                    | Default | Description                                      |
| ---------- | ----------------------- | ------- | ------------------------------------------------ |
| `message`  | `string`                | —       | **Required.** Text to show in the notification bubble. |
| `interval` | `number`                | `30000` | Time in ms between notification appearances.     |
| `duration` | `number`                | `5000`  | Time in ms the notification stays visible.       |
| `dot`      | `NotificationDotConfig` | —       | Customization for the red notification dot.      |

#### `NotificationDotConfig`

| Property            | Type      | Default     | Description                                                                 |
| ------------------- | --------- | ----------- | --------------------------------------------------------------------------- |
| `show`              | `boolean` | `true`      | Show or hide the dot entirely.                                              |
| `color`             | `string`  | `'#ef4444'` | Dot color (hex, rgb, etc.).                                                 |
| `size`              | `number`  | `10`        | Dot diameter in pixels.                                                     |
| `ringColor`         | `string`  | `color`     | Color of the animating ripple ring.                                         |
| `animationDuration` | `number`  | `1.2`       | Animation cycle duration in seconds.                                        |
| `animationScale`    | `number`  | `2.2`       | Max scale the ring reaches during animation.                                |
| `bubblePosition`    | `object`  | `{ side: 'left', offset: '10px' }` | Position of the dot **inside** the notification message bubble. |

---

### `AvatarConfig`

| Property    | Type                        | Description                                      |
| ----------- | --------------------------- | ------------------------------------------------ |
| `type`      | `'image' \| 'icon' \| 'text'` | How to render the avatar.                      |
| `src`       | `string`                    | Image URL (when `type: 'image'`).                |
| `icon`      | `React.ReactNode \| string` | SVG component or string (when `type: 'icon'`).   |
| `text`      | `string`                    | Initials or short text (when `type: 'text'`).    |
| `size`      | `'sm' \| 'md' \| 'lg'`     | Avatar size. Default: `'md'`.                    |
| `backgroundColor` | `string`              | CSS color for the avatar background.             |
| `textColor` | `string`                    | CSS color for text/icon inside the avatar.       |

---

### Theming (`ChatTheme`)

Override colors and message bubble styles via the `theme` prop:

```tsx
const config: ChatBubbleConfig = {
  // ...
  theme: {
    cssVariables: {
      colorPrimary: '#137fec',
      colorBackgroundLight: '#f8fafc',
      colorSurfaceLight: '#ffffff',
      colorBorderLight: '#e2e8f0',
    },
    messageBubbles: {
      user: {
        background: '#137fec',
        textColor: '#ffffff',
      },
      assistant: {
        background: '#f1f5f9',
        textColor: '#1e293b',
      },
    },
  },
};
```

#### Available CSS Variables

| Variable                  | Description                        |
| ------------------------- | ---------------------------------- |
| `colorPrimary`            | Primary accent color               |
| `colorPrimaryHover`       | Primary color on hover             |
| `colorBackgroundLight`    | Chat area background (light mode)  |
| `colorBackgroundDark`     | Chat area background (dark mode)   |
| `colorSurfaceLight`       | Header/input surface (light mode)  |
| `colorSurfaceDark`        | Header/input surface (dark mode)   |
| `colorBorderLight`        | Border color (light mode)          |
| `colorBorderDark`         | Border color (dark mode)           |
| `colorTextSecondary`      | Secondary text color               |
| `fontSans`                | Font family override               |

---

## API Requirements

The component expects a **Server-Sent Events (SSE)** streaming response from the configured `url`.

- **Method**: `POST`
- **Headers**:
  - `Content-Type: application/json`
  - `x-api-key: [token]` *(if `token` is provided)*
- **Body**:
  ```json
  {
    "message": "User's message text",
    "conversationId": "uuid-v4-string"
  }
  ```
- **Response**: A stream of text chunks (SSE format), which are appended to the assistant message in real time.

---

## HTML Rendering

Assistant messages support rich HTML. Return HTML directly from your API — the component renders it with `dangerouslySetInnerHTML`:

```html
<div>
  <h3>Hotel Paradise</h3>
  <img src="https://example.com/hotel.jpg" style="width:100%;border-radius:8px" />
  <p>Price: <strong>$200/night</strong></p>
</div>
```

> **Note:** Send raw HTML tags — do **not** HTML-encode them (e.g., send `<div>`, not `&lt;div&gt;`).

---

## Changelog

### v0.1.9
- Added `initialMessage` property to `ChatBubbleConfig` for custom welcome messages.
- Added `NotificationDotConfig` to supported granular customization of the notification dot (color, size, animation, position).
- Improved notification bubble positioning on mobile devices to prevent overflow.
- Refactored `ChatBubbleProvider` to support message injection from config.



### v0.1.7
- Replaced all Material Symbols icon font references with inline SVG components.
- Replaced all Tailwind CSS utility classes with inline styles for zero-CSS-framework dependency at runtime.
- Fixed `Avatar` size mapping (was passing Tailwind class strings to `style.width/height`).
- Default assistant avatar now uses a configurable image URL instead of an SVG icon.
- `EmbeddedChatWidget` rewritten to use inline styles (removed dependency on `ChatBubble.styles.css` classes).

### v0.1.6
- Added `styles.css` with Tailwind import to ensure CSS is bundled in `dist/chat-bubble-ai.css`.
- Created `icons.tsx` with inline SVG components (`SendIcon`, `CloseIcon`, `ChatBubbleIcon`, `MoodIcon`, `MicIcon`).
- Updated `ChatBubble.types.ts` to accept `React.ReactNode` for icon props.

---

## License

MIT
