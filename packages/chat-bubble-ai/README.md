# Chat Bubble AI Component

A highly customizable, React-based chat bubble component designed for easy integration with AI agents.

## Features

- 💬 **Streaming Support**: Built-in support for streaming AI responses.
- 🎨 **Theming**: Fully customizable themes with support for dark mode and CSS variables.
- 📱 **Responsive**: optimized for both desktop and mobile views.
- 🔌 **Easy Integration**: Simple configuration for API endpoints and authentication.
- 🧩 **Flexible Components**: Use as a full-page chat, an embedded widget, or a floating bubble.

## Installation

```bash
npm install chat-bubble-ai
# or
yarn add chat-bubble-ai
```

## Basic Usage

### 1. Embedded Chat Instance

Use the `ChatBubbleComponent` wrapped in `ChatBubbleProvider` for a standard chat interface.

```tsx
import React from "react";
import {
  ChatBubbleProvider,
  ChatBubbleComponent,
  ChatBubbleConfig,
} from "chat-bubble-ai";

const App = () => {
  const config: ChatBubbleConfig = {
    url: "https://api.your-service.com/stream", // Your AI Stream Endpoint
    token: "your-api-key", // Optional API Key
    darkMode: false, // Initial mode
    header: {
      title: "AI Assistant",
      subtitle: "Ask me anything about travel",
      avatar: {
        type: "image",
        src: "https://placehold.co/100x100?text=AI",
      },
    },
    input: {
      placeholder: "Type your message...",
      showSendButton: true,
    },
  };

  return (
    <ChatBubbleProvider>
      <div
        style={{ height: "600px", width: "400px", border: "1px solid #ccc" }}
      >
        <ChatBubbleComponent config={config} />
      </div>
    </ChatBubbleProvider>
  );
};
```

### 2. Floating Chat Widget

For a quick "support-style" chat bubble that floats in the corner of the screen.

```tsx
import { FloatingChatWidget } from "chat-bubble-ai";

const App = () => {
  return (
    <FloatingChatWidget
      config={{
        url: "https://api.your-service.com/stream",
        token: "your-api-key",
        header: {
          title: "Support Bot",
          avatar: { type: "icon", icon: "robot" },
        },
        launcher: {
          icon: "message", // or imageUrl
          color: "#137fec",
        },
      }}
    />
  );
};
```

## Configuration (`ChatBubbleConfig`)

The `config` prop handles all aspects of the chat instance:

| Property   | Type               | Description                                                  |
| ---------- | ------------------ | ------------------------------------------------------------ |
| `url`      | `string`           | **Required**. The endpoint URL for the streaming AI service. |
| `token`    | `string`           | Optional API key or auth token included in headers.          |
| `darkMode` | `boolean`          | Toggle dark mode on load. Default: `true`.                   |
| `theme`    | `ChatTheme`        | Deeply customize colors, fonts, and message styling.         |
| `header`   | `ChatHeaderConfig` | Configure title, subtitle, and avatar.                       |
| `input`    | `ChatInputConfig`  | Configure placeholder, buttons, and behavior.                |
| `launcher` | `LauncherConfig`   | Configuration for the floating button (FloatingWidget only). |

### Custom Styling (Theming)

You can override specific styles using the `theme` property.

```tsx
const customTheme = {
  cssVariables: {
    colorPrimary: "#ff5722", // Change primary color to Orange
    colorBackgroundLight: "#ffffff",
  },
  messageBubbles: {
    user: {
      background: "#ff5722", // Match primary
      textColor: "#ffffff",
      borderRadius: "20px 20px 0 20px",
    },
    assistant: {
      background: "#f1f1f1",
      textColor: "#333333",
      borderRadius: "20px 20px 20px 0",
    },
  },
};

<ChatBubbleComponent config={{ ...config, theme: customTheme }} />;
```

## API Requirements

The component expects a streaming response (Server-Sent Events) from the configured `url`. The backend should stream chunks of text.

- **Method**: `POST`
- **Headers**:
  - `Content-Type`: `application/json`
  - `x-api-key`: `[token]` (if provided)
- **Body**:
  ```json
  {
    "message": "User's message",
    "conversationId": "uuid-string"
  }
  ```

## HTML & Image Rendering

The chat supports enriched HTML rendering. To render images or cards, simply return standard HTML from your API:

```html
<div>
  <h3>Hotel Paradise</h3>
  <img src="https://example.com/hotel.jpg" class="w-full rounded-lg" />
  <p>Price: $200</p>
</div>
```

**Note**: Do not escape HTML tags (e.g., don't send `&lt;div&gt;`, send `<div>`).

## License

MIT
