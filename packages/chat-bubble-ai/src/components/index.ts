/**
 * Components barrel export
 * Re-exports from the new ChatBubble module.
 */
export {
    ChatBubbleComponent,
    ChatBubbleProvider,
    ChatBubbleContext,
    useChatBubble,
    EmbeddedChatWidget,
    AuthModal,
    defaultTheme,
} from './ChatBubble';

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
} from './ChatBubble';
