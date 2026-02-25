import React from 'react';

/**
 * CSS Color type for better TypeScript autocomplete
 */
export type CSSColor = string & { __brand?: 'CSSColor' };

/**
 * CSS Variables configuration
 * All variables from index.css @theme block
 */
export interface CSSVariables {
    // Colors
    colorPrimary?: CSSColor;
    colorPrimaryHover?: CSSColor;
    colorBackgroundLight?: CSSColor;
    colorBackgroundDark?: CSSColor;
    colorSurfaceLight?: CSSColor;
    colorSurfaceDark?: CSSColor;
    colorBorderLight?: CSSColor;
    colorBorderDark?: CSSColor;
    colorTextSecondary?: CSSColor;
    colorTextTertiary?: CSSColor;

    // Fonts
    fontSans?: string;

    // Animations
    animateBounce?: string;
}

/**
 * Theme configuration for the chat bubble
 */
export interface ChatTheme {
    // CSS Variables - NEW: Preferred way to customize styles
    cssVariables?: CSSVariables;

    // Background colors
    /** @deprecated Use cssVariables.colorBackgroundLight and cssVariables.colorBackgroundDark instead */
    backgrounds: {
        light: string;
        dark: string;
        surfaceLight: string;
        surfaceDark: string;
        chat?: string; // Custom background for the chat area (color or image url)
    };

    // Primary and accent colors
    /** @deprecated Use cssVariables.colorPrimary and cssVariables.colorPrimaryHover instead */
    colors: {
        primary: string;
        primaryHover?: string;
        success?: string;
        error?: string;
        warning?: string;
    };

    // Text colors
    /** @deprecated Use cssVariables.colorTextSecondary and cssVariables.colorTextTertiary instead */
    text: {
        primary: string;
        secondary: string;
        tertiary: string;
        onPrimary: string;
    };

    // Border colors
    /** @deprecated Use cssVariables.colorBorderLight and cssVariables.colorBorderDark instead */
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
            opacity?: number;
            fontWeight?: 'base' | 'semi-bold' | 'bold';
        };
        user: {
            background: string;
            textColor: string;
            borderRadius: string;
            opacity?: number;
            fontWeight?: 'base' | 'semi-bold' | 'bold';
        };
    };

    // Fonts
    /** @deprecated Use cssVariables.fontSans instead */
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
    icon?: string | React.ReactNode; // For icon type (e.g., Material Icons name or Component)
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
    icon: string | React.ReactNode;
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
    style?: React.CSSProperties;
    className?: string;
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
 * Chat message (role-based, used internally by context/hooks)
 */
export interface ChatMessage {
    id: string;
    content: string;
    role: 'user' | 'assistant';
    timestamp: string;
    status?: MessageStatus;
}

/**
 * Input action button configuration
 */
export interface InputActionButton {
    id: string;
    icon: string | React.ReactNode;
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
    sendButtonColor?: string; // Custom background color for send button (hex, rgb, etc.)
    sendButtonDisabledColor?: string; // Custom background color for disabled send button
    style?: React.CSSProperties;
    className?: string;
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
 * Mobile pill configuration — renders the launcher as a side-tab pill on mobile
 */
export interface MobilePillConfig {
    /** Background color/gradient of the pill. Default: '#ff8800' */
    color?: string;
    /** Bottom offset. Default: '1dvh' */
    bottom?: string;
    /** Breakpoint in px below which the pill is shown. Default: 768 */
    breakpoint?: number;
}

/**
 * Launcher button configuration for floating widget
 */
export interface LauncherConfig {
    imageUrl?: string;
    icon?: string | React.ReactNode; // Optional override for icon name or component if not using image
    color?: string; // Optional override for background color
    animationImages?: string[]; // Array of image URLs to animate
    animationInterval?: number; // Time in milliseconds between frames
    /** When set, renders a pill-shaped side-tab on mobile instead of the standard floating button */
    mobilePill?: MobilePillConfig;
}

/**
 * Recursive Partial<T>
 */
export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Main chat bubble configuration
 */
/**
 * Notification dot (ping) customization
 */
export interface NotificationDotConfig {
    /** Show or hide the dot entirely. Default: true */
    show?: boolean;
    /** Dot color. Default: '#ef4444' */
    color?: string;
    /** Dot diameter in px. Default: 10 */
    size?: number;
    /** Ripple ring color. Defaults to same as `color` */
    ringColor?: string;
    /** Animation duration in seconds. Default: 1.2 */
    animationDuration?: number;
    /** Max scale the ring reaches. Default: 2.2 */
    animationScale?: number;
    /** Position offset from top-right corner of the launcher button */
    position?: { top?: string; right?: string };
    /** Position of the dot inside the notification bubble card. Default: left-center */
    bubblePosition?: { side?: 'left' | 'right'; offset?: string };
}

/**
 * Notification configuration for floating widget
 */
export interface NotificationConfig {
    title?: string;
    message: string;
    icon?: string | React.ReactNode;
    interval?: number; // Time between appearances in ms (default: 60000)
    duration?: number; // Time visible in ms (default: 5000)
    /**
     * Whether to show the notification immediately on mount.
     * - `true` (default): notification appears right away.
     * - `false`: waits for the first `interval` before appearing.
     */
    showImmediately?: boolean;
    className?: string;
    style?: React.CSSProperties;
    onClick?: () => void;
    width?: string | number;
    height?: string | number;
    /** Customize the ping dot that appears on the launcher button */
    dot?: NotificationDotConfig;
}

/**
 * Main chat bubble configuration
 */
export interface ChatBubbleConfig {
    theme?: DeepPartial<ChatTheme>;
    header?: ChatHeaderConfig;
    input?: ChatInputConfig;
    messages?: Message[];
    typingIndicator?: TypingIndicatorConfig;
    dateSeparator?: DateSeparatorConfig;
    feedback?: {
        apiError?: string; // Message to show when API fails
    };
    launcher?: LauncherConfig;
    notification?: NotificationConfig;
    /** Initial greeting message shown by the assistant when the chat opens for the first time */
    initialMessage?: string;
    maxWidth?: string;
    height?: string;
    className?: string;
    darkMode?: boolean;
    url?: string;
    token?: string;
    style?: React.CSSProperties;
}

/**
 * Default theme configuration
 */
export const defaultTheme: ChatTheme = {
    // Default CSS Variables matching index.css @theme
    cssVariables: {
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
        fontSans: 'Inter, system-ui, -apple-system, sans-serif',
        animateBounce: 'bounce 1.4s infinite',
    },
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

/**
 * Agent API types
 */
export interface AgentStreamRequest {
    message: string;
}

export type StreamChunkCallback = (chunk: string) => void;
export type StreamCompleteCallback = () => void;
export type StreamErrorCallback = (error: Error) => void;

export interface StreamCallbacks {
    onToken?: (token: string) => void;
    onComplete?: () => void;
    onError?: (error: Error) => void;
}

/**
 * Parameters for sending a message stream
 */
export interface SendMessageStreamParams {
    message: string;
    conversationId?: string;
    metadata?: Record<string, unknown>;
}

/**
 * Authentication types
 */
export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    userId: string;
    email: string;
}

export interface User {
    id: string;
    email: string;
}

export interface AuthState {
    isAuthenticated: boolean;
    user: User | null;
    accessToken: string | null;
    refreshToken: string | null;
    isLoading: boolean;
    error: string | null;
}

export interface AuthContextValue extends AuthState {
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string) => Promise<void>;
    logout: () => void;
    clearError: () => void;
}

export interface ChatContextValue {
    messages: ChatMessage[];
    isTyping: boolean;
    isLoading: boolean;
    error: string | null;
    sendMessage: (content: string) => Promise<void>;
    clearMessages: () => void;
    clearError: () => void;
    /** Inject a message directly into the chat history (e.g. initial greeting) */
    injectMessage: (content: string, role?: 'assistant' | 'user') => void;
    updateMessages: (newMessages: ChatMessage[]) => void;
}
