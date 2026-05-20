import { ChatBubbleInstance } from './ChatBubbleInstance';
import { FloatingWidgetRenderer, FloatingWidgetRendererConfig } from '../widgets/FloatingWidgetRenderer';

export class FloatingChatBubbleInstance extends ChatBubbleInstance {
  private widgetRenderer: FloatingWidgetRenderer;
  private rootConfig: FloatingWidgetRendererConfig;
  private initialMessageInjected = false;

  constructor(container: HTMLElement | string, config: FloatingWidgetRendererConfig) {
    // Resolve container
    let parentEl: HTMLElement;
    if (typeof container === 'string') {
      const el = document.querySelector<HTMLElement>(container);
      if (!el) {
        throw new Error(`Container not found: ${container}`);
      }
      parentEl = el;
    } else {
      parentEl = container;
    }

    // Override header config to append close button
    const enhancedConfig = { ...config };
    enhancedConfig.header = enhancedConfig.header || {
      title: 'Chat',
      avatar: { type: 'icon', icon: '💬' }
    };

    // Check if we should prioritize notification over initial message
    const showImmediately = config.notification?.showImmediately !== false;
    const shouldPrioritizeNotification = config.notification && showImmediately;

    // If prioritizing notification and chat is not defaultOpen, remove initialMessage
    // from config passed to super (will be injected later when chat opens)
    const configForSuper = { ...enhancedConfig };
    if (shouldPrioritizeNotification && !config.defaultOpen) {
      delete configForSuper.initialMessage;
    }

    // We pass a dummy element to super so that it doesn't overwrite parentEl styles and innerHTML
    const dummyInner = document.createElement('div');
    super(dummyInner as HTMLElement, configForSuper);
    this.rootConfig = enhancedConfig; // Keep original config with initialMessage

    // Initialize widget renderer which attaches itself to parentEl
    this.widgetRenderer = new FloatingWidgetRenderer(parentEl, config);
  }

  init(): void {
    super.init(); // Initialize the internal instance in the dummy container

    // Mount renderer to the actual parentEl
    this.widgetRenderer.mount();

    // Get the inner container created by the renderer
    const chatContainer = this.widgetRenderer.getChatContainer();
    if (!chatContainer) {
      throw new Error('Floating widget did not create a chat container');
    }

    const dummyInner = (this as any).container as HTMLElement;
    
    // Move standard chat DOM structures to the floating chat window
    // (chat-header-container, chat-messages-container, chat-input-container)
    Array.from(dummyInner.childNodes).forEach((node: unknown) => {
      chatContainer.appendChild(node as Node);
    });
    
    // Replace the internal reference to the container
    (this as any).container = chatContainer;

    // Re-apply theme CSS variables to the new chatContainer
    const themeManager = (this as any).themeManager;
    if (themeManager) {
      themeManager.container = chatContainer;
      themeManager.applyTheme();
    }
    const closeBtnSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
    const headerEl = chatContainer.querySelector('#chat-header-container .chat-bubble-header-actions');
    if (headerEl) {
      const closeBtn = document.createElement('button');
      closeBtn.className = 'header-action-button';
      closeBtn.setAttribute('aria-label', 'Close chat');
      closeBtn.style.cssText = `
        display: flex;
        width: 2.5rem;
        height: 2.5rem;
        cursor: pointer;
        align-items: center;
        justify-content: center;
        border-radius: 9999px;
        background: transparent;
        border: none;
        color: var(--color-text-secondary, #475569);
        transition: background-color 0.2s, color 0.2s;
      `;
      closeBtn.innerHTML = `<span style="font-size: 20px;">${closeBtnSvg}</span>`;
      closeBtn.onclick = () => this.close();

      // Add hover effects
      closeBtn.addEventListener('mouseenter', () => {
        closeBtn.style.backgroundColor = 'var(--color-background-light, #f1f5f9)';
      });
      closeBtn.addEventListener('mouseleave', () => {
        closeBtn.style.backgroundColor = 'transparent';
      });

      headerEl.appendChild(closeBtn);
    }
    
    // Subscribe widget renderer to state changes
    const stateManager = (this as any).stateManager;
    if (stateManager) {
      stateManager.on('messages:changed', () => {
        this.widgetRenderer.updateMessages(stateManager.getMessages());
      });
      stateManager.on('typing:changed', (isTyping: boolean) => {
        this.widgetRenderer.updateTypingState(isTyping);
      });

      // Handle initial message injection for notification priority
      // If notification is configured with showImmediately: true and chat is not defaultOpen,
      // the initialMessage was removed from config in constructor and needs to be injected
      // when chat opens for the first time
      const showImmediately = this.rootConfig.notification?.showImmediately !== false;
      const shouldPrioritizeNotification = this.rootConfig.notification && showImmediately;

      if (this.rootConfig.initialMessage && shouldPrioritizeNotification && !this.rootConfig.defaultOpen) {
        // Inject when chat opens for the first time
        this.widgetRenderer.onToggleOpen((isOpen: boolean) => {
          if (isOpen && !this.initialMessageInjected) {
            this.initialMessageInjected = true;
            this.injectMessage({
              content: this.rootConfig.initialMessage!,
              role: 'assistant',
              status: 'sent'
            });
          }
        });
      }
    }
  }

  toggle(): void {
    this.widgetRenderer.toggleOpen();
  }

  open(): void {
    this.widgetRenderer.setOpen(true);
  }

  close(): void {
    this.widgetRenderer.setOpen(false);
  }

  destroy(): void {
    super.destroy();
    this.widgetRenderer.destroy();
  }
}
