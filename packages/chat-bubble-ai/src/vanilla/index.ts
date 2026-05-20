import { ChatBubbleInstance } from './core/ChatBubbleInstance';
import { FloatingChatBubbleInstance } from './core/FloatingChatBubbleInstance';
import type { ChatBubbleConfig, ChatMessage } from '../components/ChatBubble/ChatBubble.types';
import type { FloatingWidgetRendererConfig } from './widgets/FloatingWidgetRenderer';

export interface ChatBubbleAPI {
  sendMessage(message: string): Promise<void>;
  getMessages(): ChatMessage[];
  clearMessages(): void;
  injectMessage(message: Omit<ChatMessage, 'id' | 'timestamp'>): void;
  setDarkMode(darkMode: boolean): void;
  destroy(): void;
}

export interface FloatingChatBubbleAPI extends ChatBubbleAPI {
  toggle(): void;
  open(): void;
  close(): void;
}

export interface VanillaChatBubbleConfig extends ChatBubbleConfig {
  container: string | HTMLElement;
  url: string;
  token: string;
}

export interface VanillaFloatingChatBubbleConfig extends FloatingWidgetRendererConfig {
  container: string | HTMLElement;
  url: string;
  token: string;
}

export function createChatBubble(config: VanillaChatBubbleConfig): ChatBubbleAPI {
  if (!config.container) throw new Error('createChatBubble: config.container is required');
  if (!config.url) throw new Error('createChatBubble: config.url is required');
  if (!config.token) throw new Error('createChatBubble: config.token is required');

  const instance = new ChatBubbleInstance(config.container, config);
  instance.init();

  return {
    sendMessage: (message: string) => instance.sendMessage(message),
    getMessages: () => instance.getMessages(),
    clearMessages: () => instance.clearMessages(),
    injectMessage: (message) => instance.injectMessage(message),
    setDarkMode: (darkMode: boolean) => instance.setDarkMode(darkMode),
    destroy: () => instance.destroy(),
  };
}

export function createFloatingChatBubble(config: VanillaFloatingChatBubbleConfig): FloatingChatBubbleAPI {
  if (!config.container) throw new Error('createFloatingChatBubble: config.container is required');
  if (!config.url) throw new Error('createFloatingChatBubble: config.url is required');
  if (!config.token) throw new Error('createFloatingChatBubble: config.token is required');

  const instance = new FloatingChatBubbleInstance(config.container, config);
  instance.init();

  return {
    sendMessage: (message: string) => instance.sendMessage(message),
    getMessages: () => instance.getMessages(),
    clearMessages: () => instance.clearMessages(),
    injectMessage: (message) => instance.injectMessage(message),
    setDarkMode: (darkMode: boolean) => instance.setDarkMode(darkMode),
    destroy: () => instance.destroy(),
    toggle: () => instance.toggle(),
    open: () => instance.open(),
    close: () => instance.close(),
  };
}

export type {
  ChatBubbleConfig,
  ChatMessage,
  ChatTheme,
  ChatHeaderConfig,
  ChatInputConfig,
  AvatarConfig,
  DateSeparatorConfig,
} from '../components/ChatBubble/ChatBubble.types';

export { defaultTheme } from '../components/ChatBubble/ChatBubble.types';
