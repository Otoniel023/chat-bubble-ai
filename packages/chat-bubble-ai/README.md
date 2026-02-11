# Chat Bubble AI - Highly Customizable Chat UI Component

A modern, highly customizable chat bubble UI component system built with React, TypeScript, and Tailwind CSS. Perfect for creating professional chat interfaces with full dark mode support and extensive theming options.

## Features

- **Fully Typed with TypeScript** - Complete type safety and IntelliSense support
- **Dark Mode Support** - Beautiful dark and light themes out of the box
- **Highly Customizable** - Theme colors, avatars, buttons, styling, and more
- **Modern Design** - Based on contemporary chat UI patterns with smooth animations
- **Responsive** - Works seamlessly on desktop and mobile devices
- **Modular Architecture** - Use individual components or the complete chat bubble
- **Material Icons** - Built-in support for Material Symbols
- **Custom Scrollbar** - Styled scrollbar that matches your theme

## Components

### Main Components

- **ChatBubble** - Main container component that orchestrates all parts
- **ChatHeader** - Customizable header with avatar, title, subtitle, and action buttons
- **ChatMessage** - Message component for both user and assistant messages
- **ChatInput** - Input area with attachment, emoji, voice, and send buttons
- **TypingIndicator** - Animated typing indicator
- **DateSeparator** - Smart date separator (Today, Yesterday, etc.)
- **Avatar** - Flexible avatar component (icon, image, or text)

## Installation

```bash
npm install
```

## Usage

### Basic Example

```tsx
import { ChatBubble } from './components/ChatBubble';
import type { ChatBubbleConfig } from './types/chat.types';

function App() {
  const config: ChatBubbleConfig = {
    darkMode: true,
    header: {
      avatar: {
        type: 'icon',
        icon: 'smart_toy',
        showOnlineStatus: true,
      },
      title: 'Virtual Assistant',
      subtitle: 'Always here to help',
      actions: [
        {
          id: 'settings',
          icon: 'settings',
          ariaLabel: 'Settings',
          onClick: () => console.log('Settings clicked'),
        },
      ],
    },
    messages: [
      {
        id: '1',
        sender: 'assistant',
        content: 'Hello! How can I help you?',
        timestamp: new Date(),
      },
      {
        id: '2',
        sender: 'user',
        content: 'I need help with my account.',
        timestamp: new Date(),
      },
    ],
    typingIndicator: {
      show: true,
    },
    input: {
      placeholder: 'Type a message...',
    },
  };

  return <ChatBubble config={config} />;
}
```

### Custom Theme

```tsx
const customConfig: ChatBubbleConfig = {
  theme: {
    colors: {
      primary: '#ff6b6b',
      primaryHover: '#ff5252',
    },
    backgrounds: {
      dark: '#1a1a2e',
      surfaceDark: '#16213e',
    },
  },
  // ... rest of config
};
```

### Custom Avatar

```tsx
// Icon avatar
const iconAvatar = {
  type: 'icon',
  icon: 'smart_toy',
  backgroundColor: 'bg-blue-100',
  textColor: 'text-blue-600',
};

// Image avatar
const imageAvatar = {
  type: 'image',
  src: 'https://example.com/avatar.jpg',
  alt: 'User avatar',
  showOnlineStatus: true,
};

// Text avatar (initials)
const textAvatar = {
  type: 'text',
  text: 'JD',
  backgroundColor: 'bg-purple-100',
  textColor: 'text-purple-600',
};
```

## Configuration Options

### ChatBubbleConfig

```typescript
interface ChatBubbleConfig {
  theme?: Partial<ChatTheme>;
  header?: ChatHeaderConfig;
  input?: ChatInputConfig;
  messages?: Message[];
  typingIndicator?: TypingIndicatorConfig;
  dateSeparator?: DateSeparatorConfig;
  maxWidth?: string;
  height?: string;
  className?: string;
  darkMode?: boolean;
}
```

### Theme Configuration

```typescript
interface ChatTheme {
  backgrounds: {
    light: string;
    dark: string;
    surfaceLight: string;
    surfaceDark: string;
  };
  colors: {
    primary: string;
    primaryHover?: string;
    success?: string;
    error?: string;
    warning?: string;
  };
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    onPrimary: string;
  };
  // ... more options
}
```

## Customization Examples

### Change Primary Color

```tsx
const config: ChatBubbleConfig = {
  theme: {
    colors: {
      primary: '#10b981', // Green
    },
  },
};
```

### Custom Input Actions

```tsx
const config: ChatBubbleConfig = {
  input: {
    actions: [
      {
        id: 'custom-action',
        icon: 'attach_file',
        ariaLabel: 'Attach file',
        position: 'left',
        onClick: () => handleFileAttach(),
      },
    ],
    showEmoji: false,
    showVoice: false,
  },
};
```

### Custom Header Actions

```tsx
const config: ChatBubbleConfig = {
  header: {
    actions: [
      {
        id: 'refresh',
        icon: 'refresh',
        ariaLabel: 'Refresh chat',
        onClick: () => refreshChat(),
      },
      {
        id: 'close',
        icon: 'close',
        ariaLabel: 'Close chat',
        onClick: () => closeChat(),
      },
    ],
  },
};
```

## TypeScript Support

All components are fully typed. Import types as needed:

```tsx
import type {
  ChatBubbleConfig,
  Message,
  AvatarConfig,
  ChatTheme,
} from './types/chat.types';
```

## Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Lint code
npm run lint
```

## Project Structure

```
src/
├── components/
│   ├── Avatar.tsx
│   ├── ChatBubble.tsx
│   ├── ChatHeader.tsx
│   ├── ChatInput.tsx
│   ├── ChatMessage.tsx
│   ├── DateSeparator.tsx
│   ├── TypingIndicator.tsx
│   └── index.ts
├── types/
│   └── chat.types.ts
├── App.tsx
└── index.css
```

## Next Steps (Phase 2)

The current implementation focuses on UI components and styling. Phase 2 will add:

- Message state management
- Real-time messaging functionality
- WebSocket integration
- Message persistence
- File upload handling
- Emoji picker
- Voice input
- And more...

## Design

The design is based on modern chat interfaces with:
- Clean, professional aesthetic
- Smooth animations and transitions
- Responsive layout
- Accessible components
- Material Design icons

## License

MIT

## Contributing

This is a template project designed to be highly customizable for different use cases. Feel free to fork and adapt to your needs!
