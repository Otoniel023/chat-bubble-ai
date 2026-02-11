/**
 * ChatBubble barrel export
 * This is the public API of the ChatBubble component module.
 */

// Main component
export { ChatBubbleComponent } from './ChatBubble';

// Context & Provider
export { ChatBubbleContext, ChatBubbleProvider } from './ChatBubbleContext';

// Hook
export { useChatBubble } from './useChatBubble';

// Embedded widget
export { EmbeddedChatWidget } from './components/EmbeddedChatWidget';

// Auth modal (optional)
export { AuthModal } from './components/AuthModal';

// Types
export type {
    ChatBubbleConfig,
    ChatTheme,
    ChatHeaderConfig,
    ChatInputConfig,
    AvatarConfig,
    HeaderActionButton,
    InputActionButton,
    Message,
    ChatMessage,
    MessageSender,
    MessageStatus,
    TypingIndicatorConfig,
    DateSeparatorConfig,
    ChatContextValue,
    StreamCallbacks,
    SendMessageStreamParams,
    AuthState,
    AuthContextValue,
    AuthResponse,
    LoginRequest,
    RegisterRequest,
    User,
} from './ChatBubble.types';

export { defaultTheme } from './ChatBubble.types';

// Styles
import './ChatBubble.styles.css';
