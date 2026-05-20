/**
 * ChatBubbleInstance - Main orchestrator for vanilla chat bubble
 * Manages state, theme, renderers, and message flow
 */

import type { ChatBubbleConfig, ChatMessage } from '../../components/ChatBubble/ChatBubble.types';
import { StateManager } from './StateManager';
import { ThemeManager } from './ThemeManager';
import { HeaderRenderer } from '../renderers/HeaderRenderer';
import { MessageListRenderer } from '../renderers/MessageListRenderer';
import { InputRenderer } from '../renderers/InputRenderer';
import { agentService } from '../../services/agent.service';
import { qs, clearChildren } from '../utils/dom';
import { generateId } from '../utils/templates';

export class ChatBubbleInstance {
  private container: HTMLElement;
  private config: ChatBubbleConfig;
  private stateManager: StateManager;
  private themeManager: ThemeManager;
  private headerRenderer?: HeaderRenderer;
  private messageListRenderer?: MessageListRenderer;
  private inputRenderer?: InputRenderer;
  private initialized = false;

  constructor(container: HTMLElement | string, config: ChatBubbleConfig) {
    // Resolve container
    if (typeof container === 'string') {
      const el = document.querySelector<HTMLElement>(container);
      if (!el) {
        throw new Error(`Container not found: ${container}`);
      }
      this.container = el;
    } else {
      this.container = container;
    }

    // Store config
    this.config = {
      darkMode: false,
      ...config,
    };

    // Validate required config
    if (!config.url) {
      throw new Error('ChatBubbleConfig.url is required');
    }
    if (!config.token) {
      throw new Error('ChatBubbleConfig.token is required');
    }

    // Configure agent service
    agentService.configure(config.url, config.token);

    // Initialize state manager
    const initialMessages: ChatMessage[] = [];
    if (config.initialMessage) {
      initialMessages.push({
        id: 'initial-msg',
        content: config.initialMessage,
        role: 'assistant',
        timestamp: new Date().toISOString(),
        status: 'sent',
      });
    }
    this.stateManager = new StateManager(initialMessages);

    // Initialize theme manager
    this.themeManager = new ThemeManager(this.container, this.config);
  }

  /**
   * Initialize the chat bubble
   */
  init(): void {
    if (this.initialized) {
      console.warn('ChatBubbleInstance: Already initialized');
      return;
    }

    // Apply theme
    this.themeManager.applyTheme();

    // Render main structure
    this.render();

    // Create renderers
    this.createRenderers();

    // Subscribe to state changes
    this.subscribeToState();

    this.initialized = true;
  }

  /**
   * Render main structure
   */
  private render(): void {
    // Add container class
    this.container.classList.add('chat-bubble-container');

    // Set container styles
    this.container.style.display = 'flex';
    this.container.style.flexDirection = 'column';
    this.container.style.height = '100%';
    this.container.style.width = '100%';
    this.container.style.overflow = 'hidden';
    this.container.style.backgroundColor = 'var(--color-background-light, #f6f7f8)';

    // Clear and create structure
    clearChildren(this.container);

    // Create header container
    const headerContainer = document.createElement('div');
    headerContainer.id = 'chat-header-container';
    headerContainer.style.flexShrink = '0';
    this.container.appendChild(headerContainer);

    // Create messages container
    const messagesContainer = document.createElement('div');
    messagesContainer.id = 'chat-messages-container';
    messagesContainer.style.flex = '1';
    messagesContainer.style.overflow = 'hidden';
    messagesContainer.style.minHeight = '0'; // Important for flex children to scroll
    this.container.appendChild(messagesContainer);

    // Create input container
    const inputContainer = document.createElement('div');
    inputContainer.id = 'chat-input-container';
    inputContainer.style.flexShrink = '0';
    this.container.appendChild(inputContainer);
  }

  /**
   * Create all renderers
   */
  private createRenderers(): void {
    const headerContainer = qs<HTMLElement>('#chat-header-container', this.container);
    const messagesContainer = qs<HTMLElement>('#chat-messages-container', this.container);
    const inputContainer = qs<HTMLElement>('#chat-input-container', this.container);

    if (!headerContainer || !messagesContainer || !inputContainer) {
      throw new Error('Failed to find renderer containers');
    }

    // Header renderer
    if (this.config.header) {
      // Merge header config with defaults
      const headerConfig = {
        avatar: this.config.header.avatar || {
          type: 'icon' as const,
          icon: 'smart_toy',
          backgroundColor: 'rgba(19, 127, 236, 0.1)',
          textColor: '#137fec',
          size: 'md' as const,
        },
        title: this.config.header.title || 'Chat',
        subtitle: this.config.header.subtitle,
        actions: this.config.header.actions || [],
        showBorder: this.config.header.showBorder ?? true,
        style: this.config.header.style,
      };

      this.headerRenderer = new HeaderRenderer(headerConfig);
      this.headerRenderer.mount(headerContainer);
    }

    // Message list renderer
    this.messageListRenderer = new MessageListRenderer(
      this.stateManager.getMessages(),
      this.stateManager.getIsTyping(),
      this.config.header?.avatar, // Default avatar for messages
      this.config.dateSeparator
    );
    this.messageListRenderer.mount(messagesContainer);

    // Input renderer
    this.inputRenderer = new InputRenderer(
      this.stateManager.getIsLoading(),
      this.config.input
    );
    this.inputRenderer.onSubmit((message) => this.sendMessage(message));
    this.inputRenderer.mount(inputContainer);
  }

  /**
   * Subscribe to state changes
   */
  private subscribeToState(): void {
    // Messages changed
    this.stateManager.on('messages:changed', (messages: ChatMessage[]) => {
      if (this.messageListRenderer) {
        this.messageListRenderer.updateMessages(
          messages,
          this.stateManager.getIsTyping(),
          true
        );
      }
    });

    // Typing changed
    this.stateManager.on('typing:changed', (isTyping: boolean) => {
      if (this.messageListRenderer) {
        this.messageListRenderer.updateMessages(
          this.stateManager.getMessages(),
          isTyping,
          true
        );
      }
    });

    // Loading changed
    this.stateManager.on('loading:changed', (isLoading: boolean) => {
      if (this.inputRenderer) {
        this.inputRenderer.updateLoadingState(isLoading);
      }
    });

    // Error changed (could show error message UI here)
    this.stateManager.on('error:changed', (error: string | null) => {
      if (error) {
        console.error('Chat error:', error);
      }
    });
  }

  /**
   * Send a message with streaming response
   * Based on ChatBubbleContext.tsx sendMessage logic
   */
  async sendMessage(content: string): Promise<void> {
    // Validate input
    if (!content.trim() || this.stateManager.getIsLoading()) {
      return;
    }

    // Clear previous errors
    this.stateManager.clearError();

    // Add user message
    const userMessage: ChatMessage = {
      id: generateId('msg'),
      content: content.trim(),
      role: 'user',
      timestamp: new Date().toISOString(),
      status: 'sent',
    };
    this.stateManager.addMessage(userMessage);

    // Set loading and typing states
    this.stateManager.setLoading(true);
    this.stateManager.setTyping(true);

    // Prepare assistant message
    const assistantMessageId = generateId('msg');
    let fullContent = '';

    try {
      await agentService.sendMessageStream(content.trim(), {
        onChunk: (chunk: string) => {
          fullContent += chunk;

          // Check if message exists
          const existing = this.stateManager
            .getMessages()
            .find(m => m.id === assistantMessageId);

          if (existing) {
            this.stateManager.updateMessage(assistantMessageId, {
              content: fullContent,
            });
          } else {
            this.stateManager.addMessage({
              id: assistantMessageId,
              content: fullContent,
              role: 'assistant',
              timestamp: new Date().toISOString(),
              status: 'streaming',
            });
          }
        },
        onComplete: () => {
          this.stateManager.updateMessage(assistantMessageId, {
            status: 'sent',
          });
          this.stateManager.setTyping(false);
          this.stateManager.setLoading(false);
        },
        onError: (err: Error) => {
          // Check if we should show error as message
          const apiErrorMsg = this.config.feedback?.apiError;

          if (apiErrorMsg) {
            // Show error as assistant message
            const existing = this.stateManager
              .getMessages()
              .find(m => m.id === assistantMessageId);

            if (existing) {
              this.stateManager.updateMessage(assistantMessageId, {
                content: apiErrorMsg,
                status: 'sent',
              });
            } else {
              this.stateManager.addMessage({
                id: assistantMessageId,
                content: apiErrorMsg,
                role: 'assistant',
                timestamp: new Date().toISOString(),
                status: 'sent',
              });
            }
          } else {
            // Show error state
            this.stateManager.setError(err.message || 'Failed to get response');
          }

          this.stateManager.setTyping(false);
          this.stateManager.setLoading(false);
        },
      });
    } catch (err) {
      this.stateManager.setError(
        err instanceof Error ? err.message : 'Failed to send message'
      );
      this.stateManager.setTyping(false);
      this.stateManager.setLoading(false);
    }
  }

  /**
   * Get all messages
   */
  getMessages(): ChatMessage[] {
    return this.stateManager.getMessages();
  }

  /**
   * Clear all messages
   */
  clearMessages(): void {
    this.stateManager.clearMessages();
  }

  /**
   * Inject a message programmatically
   */
  injectMessage(message: Omit<ChatMessage, 'id' | 'timestamp'>): void {
    this.stateManager.addMessage({
      ...message,
      id: generateId('msg'),
      timestamp: new Date().toISOString(),
    } as ChatMessage);
  }

  /**
   * Set dark mode
   */
  setDarkMode(darkMode: boolean): void {
    this.themeManager.setDarkMode(darkMode);
  }

  /**
   * Destroy and cleanup
   */
  destroy(): void {
    // Cleanup renderers
    this.headerRenderer?.destroy();
    this.messageListRenderer?.destroy();
    this.inputRenderer?.destroy();

    // Cleanup state
    this.stateManager.destroy();

    // Clear container
    clearChildren(this.container);
    this.container.classList.remove('chat-bubble-container');

    this.initialized = false;
  }
}
