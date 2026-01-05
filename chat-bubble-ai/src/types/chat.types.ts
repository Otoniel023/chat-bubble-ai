/**
 * Theme configuration for the chat bubble
 */
export interface ChatTheme {
  // Background colors
  backgrounds: {
    light: string;
    dark: string;
    surfaceLight: string;
    surfaceDark: string;
  };

  // Primary and accent colors
  colors: {
    primary: string;
    primaryHover?: string;
    success?: string;
    error?: string;
    warning?: string;
  };

  // Text colors
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    onPrimary: string;
  };

  // Border colors
  borders: {
    light: string;
    dark: string;
  };

  // Message bubble styling
  messageBubbles: {
    assistant: {
      background: string;
      textColor: string;
      borderRadius: string;
    };
    user: {
      background: string;
      textColor: string;
      borderRadius: string;
    };
  };

  // Fonts
  fonts: {
    family: string;
    sizes: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
    };
  };
}

/**
 * Avatar configuration
 */
export interface AvatarConfig {
  type: 'icon' | 'image' | 'text';
  src?: string; // For image type
  icon?: string; // For icon type (e.g., Material Icons name)
  text?: string; // For text type (initials)
  alt?: string;
  backgroundColor?: string;
  textColor?: string;
  showOnlineStatus?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Header action button configuration
 */
export interface HeaderActionButton {
  id: string;
  icon: string;
  ariaLabel: string;
  onClick?: () => void;
  visible?: boolean;
}

/**
 * Chat header configuration
 */
export interface ChatHeaderConfig {
  avatar: AvatarConfig;
  title: string;
  subtitle?: string;
  actions?: HeaderActionButton[];
  showBorder?: boolean;
}

/**
 * Message sender type
 */
export type MessageSender = 'assistant' | 'user';

/**
 * Message status
 */
export type MessageStatus = 'sending' | 'streaming' | 'sent' | 'error';

/**
 * Individual message data
 */
export interface Message {
  id: string;
  sender: MessageSender;
  content: string;
  timestamp: Date | string;
  avatar?: AvatarConfig;
  senderLabel?: string;
  status?: MessageStatus;
  error?: string;
}

/**
 * Input action button configuration
 */
export interface InputActionButton {
  id: string;
  icon: string;
  ariaLabel: string;
  onClick?: () => void;
  visible?: boolean;
  position?: 'left' | 'right';
}

/**
 * Chat input configuration
 */
export interface ChatInputConfig {
  placeholder?: string;
  actions?: InputActionButton[];
  showSendButton?: boolean;
  showAttachment?: boolean;
  showEmoji?: boolean;
  showVoice?: boolean;
  disclaimer?: string;
  maxLength?: number;
}

/**
 * Typing indicator configuration
 */
export interface TypingIndicatorConfig {
  show: boolean;
  avatar?: AvatarConfig;
  dotColor?: string;
}

/**
 * Date separator configuration
 */
export interface DateSeparatorConfig {
  format?: 'relative' | 'absolute' | 'custom';
  customFormatter?: (date: Date) => string;
}

/**
 * Main chat bubble configuration
 */
export interface ChatBubbleConfig {
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

/**
 * Default theme configuration
 */
export const defaultTheme: ChatTheme = {
  backgrounds: {
    light: '#f6f7f8',
    dark: '#101922',
    surfaceLight: '#ffffff',
    surfaceDark: '#1e242b',
  },
  colors: {
    primary: '#137fec',
    primaryHover: '#0d6edb',
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
  },
  text: {
    primary: '#ffffff',
    secondary: '#9dabb9',
    tertiary: '#6b7a8a',
    onPrimary: '#ffffff',
  },
  borders: {
    light: '#e2e8f0',
    dark: '#283039',
  },
  messageBubbles: {
    assistant: {
      background: '#283039',
      textColor: '#ffffff',
      borderRadius: '1rem',
    },
    user: {
      background: '#137fec',
      textColor: '#ffffff',
      borderRadius: '1rem',
    },
  },
  fonts: {
    family: 'Inter, system-ui, sans-serif',
    sizes: {
      xs: '0.625rem',
      sm: '0.75rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
    },
  },
};
