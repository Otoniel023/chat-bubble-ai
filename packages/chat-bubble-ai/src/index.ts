/**
 * chat-bubble-ai - Public Entry Point
 *
 * This is the main export for the npm package.
 * Import the ChatBubble component and its provider from here.
 *
 * Usage:
 *   import { ChatBubbleComponent, ChatBubbleProvider } from 'chat-bubble-ai';
 */

// Main ChatBubble component & provider
export {
    ChatBubbleComponent,
    ChatBubbleProvider,
    ChatBubbleContext,
    useChatBubble,
    EmbeddedChatWidget,
    FloatingChatWidget,
    AuthModal,
    defaultTheme,
} from './components/ChatBubble';

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
} from './components/ChatBubble';
