import type { ChatBubbleConfig, ChatMessage } from '../../components/ChatBubble/ChatBubble.types';

export interface FloatingWidgetRendererConfig extends ChatBubbleConfig {
  defaultOpen?: boolean;
}

export class FloatingWidgetRenderer {
  private container: HTMLElement;
  private wrapper: HTMLElement;
  private config: FloatingWidgetRendererConfig;
  
  // State
  private isOpen: boolean;
  private showNotification = false;
  private isMobile = false;
  private pillVisible = true;
  private unreadCount = 0;
  private isTyping = false;
  private isClosing = false;
  private isAnimating = false; // Flag to control when animations should play
  
  // Notification override
  private overrideNotificationMessage: string | null = null;
  private overrideRef: string | null = null;
  private lastShownAssistantMsgId: string | null = null;
  
  // Timers
  private showTimer?: ReturnType<typeof setTimeout>;
  private hideTimer?: ReturnType<typeof setTimeout>;
  private imageIntervalId?: ReturnType<typeof setInterval>;
  
  // Image animation
  private currentImageIndex = 0;

  // DOM Elements are built via innerHTML and queried when needed

  private onToggleOpenListener: (isOpen: boolean) => void = () => {};

  constructor(container: HTMLElement, config: FloatingWidgetRendererConfig) {
    this.container = container;
    this.config = config;
    this.isOpen = !!config.defaultOpen;
    
    this.wrapper = document.createElement('div');
    this.container.appendChild(this.wrapper);
    
    this.initMobileDetection();
    this.initPingStyle();
  }

  public mount() {
    this.render();
    this.startNotificationCycle();

    // Scroll to bottom if opened by default
    if (this.isOpen) {
      this.scrollToBottomWithRetry();
    }
  }

  public destroy() {
    this.stopNotificationCycle();
    this.stopImageAnimation();
    if (this.wrapper.parentNode) {
      this.wrapper.parentNode.removeChild(this.wrapper);
    }
  }

  public toggleOpen() {
    this.setOpen(!this.isOpen);
  }

  public setOpen(open: boolean) {
    if (this.isOpen === open) return;

    if (!open && this.isOpen) {
      // Closing: trigger animation first
      this.isClosing = true;
      this.isAnimating = true;
      this.render();

      // Wait for animation to complete (250ms for mobile, 300ms for desktop)
      const animationDuration = this.isMobile && this.config.launcher?.mobilePill ? 250 : 300;
      setTimeout(() => {
        this.isOpen = false;
        this.isClosing = false;
        this.isAnimating = false;
        this.onToggleOpenListener(this.isOpen);
        this.render();
      }, animationDuration);
    } else if (open && !this.isOpen) {
      // Opening: set state immediately
      this.isOpen = true;
      this.isClosing = false;
      this.isAnimating = true;
      this.showNotification = false;
      this.unreadCount = 0;
      this.onToggleOpenListener(this.isOpen);
      this.render();

      // Clear animating flag after animation completes
      setTimeout(() => {
        this.isAnimating = false;
      }, this.isMobile && this.config.launcher?.mobilePill ? 250 : 300);

      // Scroll to bottom when opening with retry mechanism
      this.scrollToBottomWithRetry();
    }
  }

  private scrollToBottomWithRetry(attempts: number = 0, maxAttempts: number = 5) {
    // The actual scrollable element is .chat-bubble-messages inside #chat-messages-container
    const scrollableElement = this.wrapper.querySelector('.chat-bubble-messages');

    if (scrollableElement && scrollableElement.scrollHeight > 0) {
      scrollableElement.scrollTop = scrollableElement.scrollHeight;
      return;
    }

    // Retry if container not ready yet
    if (attempts < maxAttempts) {
      requestAnimationFrame(() => {
        this.scrollToBottomWithRetry(attempts + 1, maxAttempts);
      });
    }
  }

  public getIsOpen() {
    return this.isOpen;
  }

  public onToggleOpen(listener: (isOpen: boolean) => void) {
    this.onToggleOpenListener = listener;
  }

  public getChatContainer(): HTMLElement | null {
    return this.wrapper.querySelector('.floating-chat-inner');
  }

  public updateTypingState(isTyping: boolean) {
    if (this.isTyping === isTyping) return;
    this.isTyping = isTyping;
    
    if (isTyping) {
      this.showNotification = false;
    }
    
    this.render();
  }

  public updateMessages(messages: ChatMessage[]) {
    if (!this.config.notification) return;
    
    const msgs = [...messages].reverse();
    const lastAssistant = msgs.find(m => m.role === 'assistant' && m.status === 'sent');
    
    if (!lastAssistant) return;
    if (lastAssistant.id === 'initial-msg') return;
    if (lastAssistant.id === this.lastShownAssistantMsgId) return;

    if (this.isOpen) {
      this.lastShownAssistantMsgId = lastAssistant.id;
      return;
    }

    this.lastShownAssistantMsgId = lastAssistant.id;
    
    const maxLen = 120;
    const rawText = lastAssistant.content;
    const notifText = rawText.length > maxLen ? rawText.slice(0, maxLen).trimEnd() + '…' : rawText;

    this.overrideNotificationMessage = notifText;
    this.overrideRef = notifText;
    this.showNotification = true;
    this.unreadCount += 1;
    
    this.render();

    const durationTime = this.config.notification.duration || 5000;
    clearTimeout(this.hideTimer);
    
    this.hideTimer = setTimeout(() => {
      this.showNotification = false;
      this.overrideNotificationMessage = null;
      this.overrideRef = null;
      this.render();
    }, durationTime);
  }

  private initMobileDetection() {
    const breakpoint = this.config.launcher?.mobilePill?.breakpoint ?? 768;
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    this.isMobile = mq.matches;
    
    mq.addEventListener('change', (e) => {
      this.isMobile = e.matches;
      this.render();
    });
  }

  private startNotificationCycle() {
    if (!this.config.notification) return;

    const intervalTime = this.config.notification.interval || 30000;
    const durationTime = this.config.notification.duration || 5000;
    const showImmediately = this.config.notification.showImmediately !== false;

    const runCycle = () => {
      if (!this.isOpen && !this.overrideRef && !this.isTyping) {
        this.showNotification = true;
        this.renderNotification();
      }

      this.hideTimer = setTimeout(() => {
        if (!this.overrideRef) {
          this.showNotification = false;
          this.renderNotification();
        }
        this.showTimer = setTimeout(runCycle, intervalTime);
      }, durationTime);
    };

    if (showImmediately) {
      runCycle();
    } else {
      this.showTimer = setTimeout(runCycle, intervalTime);
    }
  }

  private stopNotificationCycle() {
    clearTimeout(this.showTimer);
    clearTimeout(this.hideTimer);
  }

  private startImageAnimation() {
    if (this.imageIntervalId) return;
    const images = this.config.launcher?.animationImages;
    if (!images?.length) return;
    
    const intervalTime = this.config.launcher?.animationInterval || 400;
    this.imageIntervalId = setInterval(() => {
      this.currentImageIndex = (this.currentImageIndex + 1) % images.length;
      const img = this.wrapper.querySelector('.floating-launcher-img') as HTMLImageElement;
      if (img) img.src = images[this.currentImageIndex];
    }, intervalTime);
  }

  private stopImageAnimation() {
    if (this.imageIntervalId) {
      clearInterval(this.imageIntervalId);
      this.imageIntervalId = undefined;
    }
    this.currentImageIndex = 0;
  }

  private initPingStyle() {
    const scale = this.config.notification?.dot?.animationScale ?? 2.2;
    const pingKeyframeName = `chat-bubble-ping-${Math.round(scale * 10)}`;
    const styleId = `chat-bubble-ping-style-${Math.round(scale * 10)}`;

    if (document.getElementById(styleId)) return;
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      @keyframes ${pingKeyframeName} {
        0%   { transform: scale(1); opacity: 0.65; }
        70%  { transform: scale(${scale}); opacity: 0; }
        100% { transform: scale(${scale}); opacity: 0; }
      }
      @keyframes chatBubbleSlideUp {
        from { transform: translateY(100%); opacity: 0; }
        to   { transform: translateY(0);    opacity: 1; }
      }
      @keyframes chatBubbleSlideDown {
        from { transform: translateY(0); opacity: 1; }
        to   { transform: translateY(100%); opacity: 0; }
      }
      @keyframes chatBubbleTypingDot {
        0%, 60%, 100% { transform: translateY(0); }
        30% { transform: translateY(-4px); }
      }
    `;
    document.head.appendChild(style);
  }

  private render() {
    const hasMobilePill = !!this.config.launcher?.mobilePill;

    if (hasMobilePill && this.isMobile) {
      this.renderMobilePill();
    } else {
      this.renderDesktop();
    }

    if (this.showNotification && this.config.launcher?.animationImages?.length) {
      this.startImageAnimation();
    } else {
      this.stopImageAnimation();
    }
  }

  private renderNotification() {
    // Only update notification if chat is closed (otherwise it doesn't show anyway)
    if (this.isOpen) return;

    // Just update the notification part without full re-render to preserve scroll
    const hasMobilePill = !!this.config.launcher?.mobilePill;

    if (hasMobilePill && this.isMobile) {
      this.updateMobilePillNotification();
    } else {
      this.updateDesktopNotification();
    }

    // Handle image animation
    if (this.showNotification && this.config.launcher?.animationImages?.length) {
      this.startImageAnimation();
    } else {
      this.stopImageAnimation();
    }
  }

  private updateDesktopNotification() {
    const existingNotif = this.wrapper.querySelector('.floating-notification-wrapper');
    const shouldShowOpen = this.isOpen && !this.isClosing;
    const notifCfg = this.config.notification;

    if (notifCfg && this.showNotification && !shouldShowOpen && !this.isTyping && notifCfg.message) {
      const notifHtml = this.buildDesktopNotificationHTML();

      if (existingNotif) {
        existingNotif.outerHTML = notifHtml;
      } else {
        this.wrapper.insertAdjacentHTML('beforeend', notifHtml);
      }
    } else if (existingNotif) {
      existingNotif.remove();
    }
  }

  private updateMobilePillNotification() {
    const existingNotif = this.wrapper.querySelector('.floating-pill-notification');
    const shouldShowOpen = this.isOpen && !this.isClosing;
    const notifCfg = this.config.notification;

    if (notifCfg && this.showNotification && !shouldShowOpen && !this.isTyping && this.pillVisible && notifCfg.message) {
      const notifHtml = this.buildMobilePillNotificationHTML();

      if (existingNotif) {
        existingNotif.outerHTML = notifHtml;
      } else {
        const pillWrapper = this.wrapper.querySelector('.floating-pill-wrapper');
        if (pillWrapper) {
          pillWrapper.insertAdjacentHTML('afterbegin', notifHtml);
        }
      }
    } else if (existingNotif) {
      existingNotif.remove();
    }
  }

  private buildDesktopNotificationHTML(): string {
    const notifCfg = this.config.notification!;
    const msg = this.overrideNotificationMessage ?? notifCfg.message;
    const dotShow = notifCfg.dot?.show !== false;
    const dotColor = notifCfg.dot?.color || '#ef4444';
    const dotRingColor = notifCfg.dot?.ringColor || dotColor;
    const dotSize = notifCfg.dot?.size ?? 10;
    const dotWrapperSize = dotSize + 4;
    const dotAnimDuration = notifCfg.dot?.animationDuration ?? 1.2;
    const dotTop = notifCfg.dot?.position?.top ?? '4px';
    const dotRight = notifCfg.dot?.position?.right ?? '4px';
    const dotBubbleSide = notifCfg.dot?.bubblePosition?.side ?? 'left';
    const dotBubblePad = dotShow ? `${dotWrapperSize + 8}px` : '10px';
    const bubbleCardPadding = dotBubbleSide === 'left' ? `10px 12px 10px ${dotBubblePad}` : `10px ${dotBubblePad} 10px 12px`;
    const scale = notifCfg.dot?.animationScale ?? 2.2;
    const pingKeyframeName = `chat-bubble-ping-${Math.round(scale * 10)}`;
    const notifStyleStr = notifCfg.style
      ? Object.entries(notifCfg.style).map(([k, v]) => `${k.replace(/[A-Z]/g, m => `-${m.toLowerCase()}`)}:${v}`).join(';')
      : '';
    const minHeight = notifCfg.height || 'auto';

    return `
      <div class="floating-notification-wrapper" style="position: absolute; right: 0; z-index: 10001; display: flex; flex-direction: column; justify-content: flex-end; align-items: flex-end; pointer-events: none; overflow: visible; transform: translateX(-5px) translateY(-60px); width: ${notifCfg.width || '230px'}; min-height: ${minHeight}; ${notifStyleStr}">
        <div class="floating-notification-inner" style="height: 60px; display: flex; flex-direction: column; justify-content: flex-end; align-items: flex-end;">
          <div class="floating-notification-bubble" style="position: relative; background-color: #ffffff; border-radius: 6px; border: 1px solid #e5e7eb; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); width: 100%; text-align: left; font-size: 0.95rem; color: #1f2937; overflow: visible; z-index: 9999; padding: ${bubbleCardPadding}">
            ${dotShow ? `
              <div class="floating-ping-dot-wrapper" style="position: absolute; top: ${dotTop}; right: ${dotRight}; width: ${dotWrapperSize}px; height: ${dotWrapperSize}px">
                <div class="floating-ping-ring" style="position: absolute; inset: 0; border-radius: 50%; background: ${dotRingColor}; animation: ${pingKeyframeName} ${dotAnimDuration}s ease-out infinite"></div>
                <div class="floating-ping-solid" style="position: absolute; top: 2px; left: 2px; border-radius: 50%; border: 2px solid white; width: ${dotSize}px; height: ${dotSize}px; background: ${dotColor}"></div>
              </div>
            ` : ''}
            <span>${msg}</span>
            <div class="floating-notification-arrow" style="position: absolute; top: 100%; right: 16px; width: 0; height: 0; border-left: 10px solid transparent; border-right: 10px solid transparent; border-top: 10px solid #ffffff; filter: drop-shadow(0 2px 1px rgba(0,0,0,0.05));"></div>
          </div>
        </div>
      </div>
    `;
  }

  private buildMobilePillNotificationHTML(): string {
    const notifCfg = this.config.notification!;
    const msg = this.overrideNotificationMessage ?? notifCfg.message;
    const dotShow = notifCfg.dot?.show !== false;
    const dotColor = notifCfg.dot?.color || '#ef4444';
    const dotRingColor = notifCfg.dot?.ringColor || dotColor;
    const dotSize = notifCfg.dot?.size ?? 10;
    const dotWrapperSize = dotSize + 4;
    const dotAnimDuration = notifCfg.dot?.animationDuration ?? 1.2;
    const dotTop = notifCfg.dot?.position?.top ?? '4px';
    const dotRight = notifCfg.dot?.position?.right ?? '4px';
    const dotBubbleSide = notifCfg.dot?.bubblePosition?.side ?? 'left';
    const dotBubblePad = dotShow ? `${dotWrapperSize + 8}px` : '10px';
    const bubbleCardPadding = dotBubbleSide === 'left' ? `10px 12px 10px ${dotBubblePad}` : `10px ${dotBubblePad} 10px 12px`;
    const scale = notifCfg.dot?.animationScale ?? 2.2;
    const pingKeyframeName = `chat-bubble-ping-${Math.round(scale * 10)}`;

    return `
      <div class="floating-pill-notification" style="position: relative; background: #ffffff; border-radius: 10px; box-shadow: 0 4px 16px rgba(0,0,0,0.14); border: 1px solid #e5e7eb; max-width: min(280px, calc(100dvw - 16px)); width: max-content; font-size: 0.875rem; color: #1f2937; pointer-events: none; z-index: 10001; align-self: flex-end; margin-bottom: 8px; margin-right: 6px; box-sizing: border-box; padding: ${bubbleCardPadding}">
        ${dotShow ? `
          <div class="floating-ping-dot-wrapper" style="position: absolute; top: ${dotTop}; right: ${dotRight}; width: ${dotWrapperSize}px; height: ${dotWrapperSize}px">
            <div class="floating-ping-ring" style="position: absolute; inset: 0; border-radius: 50%; background: ${dotRingColor}; animation: ${pingKeyframeName} ${dotAnimDuration}s ease-out infinite"></div>
            <div class="floating-ping-solid" style="position: absolute; top: 2px; left: 2px; border-radius: 50%; border: 2px solid white; width: ${dotSize}px; height: ${dotSize}px; background: ${dotColor}"></div>
          </div>
        ` : ''}
        <span>${msg}</span>
        <div class="floating-pill-notification-arrow" style="position: absolute; bottom: -8px; right: 20px; width: 0; height: 0; border-left: 8px solid transparent; border-right: 8px solid transparent; border-top: 8px solid #ffffff; filter: drop-shadow(0 2px 1px rgba(0,0,0,0.06));"></div>
      </div>
    `;
  }

  private renderDesktop() {
    this.wrapper.className = '';
    // Apply config.style to wrapper (matches React: ...config.style on wrapper div)
    const configStyleStr = this.config.style
      ? Object.entries(this.config.style).map(([k, v]) => `${k.replace(/[A-Z]/g, m => `-${m.toLowerCase()}`)}:${v}`).join(';')
      : '';
    this.wrapper.style.cssText = `position: fixed; bottom: 24px; right: 24px; z-index: 9999; display: flex; flex-direction: column; align-items: flex-end; font-family: var(--font-sans, system-ui, sans-serif); ${configStyleStr}`;

    const launcherImage = (this.showNotification && this.config.launcher?.animationImages?.length)
      ? this.config.launcher.animationImages[this.currentImageIndex]
      : this.config.launcher?.imageUrl;

    // Preserve existing chat inner if it exists
    const existingChatInner = this.wrapper.querySelector('.floating-chat-inner');

    // Determine visual state: show as open if actually open OR currently closing
    const shouldShowOpen = this.isOpen && !this.isClosing;
    const shouldRender = this.isOpen || this.isClosing;

    let html = `
      <div class="floating-chat-window" style="transform-origin: bottom right; transition: all 300ms ease-out; display: flex; flex-direction: column; background-color: var(--color-surface-light, #ffffff); border-radius: 12px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); overflow: hidden; border: 1px solid var(--color-border-light, #e2e8f0); ${shouldShowOpen ? 'opacity: 1; transform: scale(1) translateY(0); pointer-events: auto; width: min(450px, 90dvw); height: min(650px, 80dvh); margin-bottom: 8px;' : 'opacity: 0; transform: scale(0.95) translateY(16px); pointer-events: none; width: min(400px, 90dvw); height: 0px; margin-bottom: 0;'}">
        <div class="floating-chat-inner" id="floating-chat-inner" style="height: 100%; width: 100%; display: grid; grid-template-rows: auto 1fr auto;"></div>
      </div>
      ${shouldRender ? '<div class="floating-chat-tail" style="position: relative; right: 16px; z-index: 50; margin-right: 4px; margin-bottom: 4px; width: 0; height: 0; border-left: 8px solid transparent; border-right: 8px solid transparent; border-top: 10px solid #fb2c36; transition: opacity 150ms ease-out; opacity: ' + (shouldShowOpen ? '1' : '0') + ';"></div>' : ''}
    `;

    const buttonHtml = `
      <button class="floating-toggle-btn" aria-label="${shouldShowOpen ? 'Close chat' : 'Open chat'}" style="position: relative; display: flex; align-items: center; justify-content: center; width: 56px; height: 56px; border-radius: 9999px; background-color: ${this.config.launcher?.color || '#4f46e5'}; color: #ffffff; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05); transition: all 300ms; outline: none; border: none; cursor: pointer; overflow: visible; z-index: 10000; padding: 0;">
        <div class="floating-launcher-content" style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; transition: all 300ms; overflow: hidden; border-radius: 9999px; ${shouldShowOpen ? 'transform: rotate(90deg); opacity: 0;' : 'transform: rotate(0deg); opacity: 1;'}">
          ${launcherImage
            ? `<img class="floating-launcher-img" src="${launcherImage}" alt="Chat" style="width: 100%; height: 100%; object-fit: cover;" />`
            : `<span style="font-size: 24px;">${this.config.launcher?.icon || '💬'}</span>`}
        </div>
        <div class="floating-close-icon" style="display: flex; align-items: center; justify-content: center; font-size: 24px; position: absolute; transition: all 300ms; color: white; ${shouldShowOpen ? 'transform: rotate(0deg); opacity: 1;' : 'transform: rotate(-90deg); opacity: 0;'}">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </div>
        ${!shouldShowOpen && this.isTyping ? `
          <div class="floating-typing-indicator" style="position: absolute; top: -4px; left: -4px; min-width: 32px; height: 24px; border-radius: 12px; background: #ffffff; display: flex; align-items: center; justify-content: center; gap: 3px; padding: 0 8px; border: 2px solid #e5e7eb; box-shadow: 0 2px 8px rgba(0,0,0,0.2); z-index: 1;">
            <div class="floating-typing-dot" style="width: 4px; height: 4px; border-radius: 50%; background: #6b7280; animation: chatBubbleTypingDot 1.4s infinite; animation-delay: 0s;"></div>
            <div class="floating-typing-dot" style="width: 4px; height: 4px; border-radius: 50%; background: #6b7280; animation: chatBubbleTypingDot 1.4s infinite; animation-delay: 0.2s;"></div>
            <div class="floating-typing-dot" style="width: 4px; height: 4px; border-radius: 50%; background: #6b7280; animation: chatBubbleTypingDot 1.4s infinite; animation-delay: 0.4s;"></div>
          </div>
        ` : ''}
        ${!shouldShowOpen && !this.isTyping && this.unreadCount > 0 && !this.showNotification ? `
          <div class="floating-unread-badge" style="position: absolute; top: -4px; left: -4px; min-width: 24px; height: 24px; border-radius: 12px; background: #ef4444; color: white; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; padding: 0 6px; border: 2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.2); z-index: 1;">${this.unreadCount > 9 ? '9+' : this.unreadCount}</div>
        ` : ''}
      </button>
    `;

    const notifCfg = this.config.notification;
    let notifHtml = '';

    if (notifCfg && this.showNotification && !shouldShowOpen && !this.isTyping && notifCfg.message) {
      const msg = this.overrideNotificationMessage ?? notifCfg.message;
      const dotShow = notifCfg.dot?.show !== false;
      const dotColor = notifCfg.dot?.color || '#ef4444';
      const dotRingColor = notifCfg.dot?.ringColor || dotColor;
      const dotSize = notifCfg.dot?.size ?? 10;
      const dotWrapperSize = dotSize + 4;
      const dotAnimDuration = notifCfg.dot?.animationDuration ?? 1.2;
      const dotTop = notifCfg.dot?.position?.top ?? '4px';
      const dotRight = notifCfg.dot?.position?.right ?? '4px';
      const dotBubbleSide = notifCfg.dot?.bubblePosition?.side ?? 'left';
      const dotBubblePad = dotShow ? `${dotWrapperSize + 8}px` : '10px';
      const bubbleCardPadding = dotBubbleSide === 'left' ? `10px 12px 10px ${dotBubblePad}` : `10px ${dotBubblePad} 10px 12px`;
      const scale = notifCfg.dot?.animationScale ?? 2.2;
      const pingKeyframeName = `chat-bubble-ping-${Math.round(scale * 10)}`;
      // Spread notification.style (matches React: ...config.notification.style)
      const notifStyleStr = notifCfg.style
        ? Object.entries(notifCfg.style).map(([k, v]) => `${k.replace(/[A-Z]/g, m => `-${m.toLowerCase()}`)}:${v}`).join(';')
        : '';
      const minHeight = notifCfg.height || 'auto';

      notifHtml = `
        <div class="floating-notification-wrapper" style="position: absolute; right: 0; z-index: 10001; display: flex; flex-direction: column; justify-content: flex-end; align-items: flex-end; pointer-events: none; overflow: visible; transform: translateX(-5px) translateY(-60px); width: ${notifCfg.width || '230px'}; min-height: ${minHeight}; ${notifStyleStr}">
          <div class="floating-notification-inner" style="height: 60px; display: flex; flex-direction: column; justify-content: flex-end; align-items: flex-end;">
            <div class="floating-notification-bubble" style="position: relative; background-color: #ffffff; border-radius: 6px; border: 1px solid #e5e7eb; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); width: 100%; text-align: left; font-size: 0.95rem; color: #1f2937; overflow: visible; z-index: 9999; padding: ${bubbleCardPadding}">
              ${dotShow ? `
                <div class="floating-ping-dot-wrapper" style="position: absolute; top: ${dotTop}; right: ${dotRight}; width: ${dotWrapperSize}px; height: ${dotWrapperSize}px">
                  <div class="floating-ping-ring" style="position: absolute; inset: 0; border-radius: 50%; background: ${dotRingColor}; animation: ${pingKeyframeName} ${dotAnimDuration}s ease-out infinite"></div>
                  <div class="floating-ping-solid" style="position: absolute; top: 2px; left: 2px; border-radius: 50%; border: 2px solid white; width: ${dotSize}px; height: ${dotSize}px; background: ${dotColor}"></div>
                </div>
              ` : ''}
              <span>${msg}</span>
              <div class="floating-notification-arrow" style="position: absolute; top: 100%; right: 16px; width: 0; height: 0; border-left: 10px solid transparent; border-right: 10px solid transparent; border-top: 10px solid #ffffff; filter: drop-shadow(0 2px 1px rgba(0,0,0,0.05));"></div>
            </div>
          </div>
        </div>
      `;
    }

    this.wrapper.innerHTML = html + buttonHtml + notifHtml;
    
    if (existingChatInner) {
      this.wrapper.querySelector('#floating-chat-inner')!.replaceWith(existingChatInner);
    }
    
    // Attach event listeners
    const toggleBtn = this.wrapper.querySelector('.floating-toggle-btn');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => this.toggleOpen());
    }
  }

  private renderMobilePill() {
    const pillCfg = this.config.launcher?.mobilePill;
    const pillColor = pillCfg?.color || '#ff8800';
    const pillBottom = pillCfg?.bottom || '1dvh';

    this.wrapper.className = '';
    this.wrapper.style.cssText = `
      position: fixed;
      bottom: ${pillBottom};
      right: 0;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      font-family: var(--font-sans, system-ui, sans-serif);
      max-width: 100dvw;
      overflow: visible;
    `;

    // Preserving chat instance wrapper
    const existingChatInner = this.wrapper.querySelector('.floating-chat-inner');

    // Determine visual state: show as open if actually open OR currently closing
    const shouldShowOpen = this.isOpen && !this.isClosing;

    // We append chat window conditionally or hide it via css
    const mobileConfigStyleStr = this.config.style
      ? Object.entries(this.config.style).map(([k, v]) => `${k.replace(/[A-Z]/g, m => `-${m.toLowerCase()}`)}:${v}`).join(';')
      : '';
    const mobileFontFamily = `font-family: var(--font-sans, system-ui, sans-serif);`;

    // Always create chat window structure (even when closed) to ensure container exists for initialization
    const display = (this.isOpen || this.isClosing) ? 'flex' : 'none';

    // Only apply animation during actual open/close transitions
    let animationStyle = '';
    if (this.isAnimating) {
      const animation = this.isClosing
        ? 'chatBubbleSlideDown 250ms ease-out forwards'
        : 'chatBubbleSlideUp 250ms ease-out';
      animationStyle = `animation: ${animation};`;
    }

    const chatHTML = `
      <div class="floating-mobile-window" style="position: fixed; bottom: 0; left: 0; right: 0; height: min(650px, 85dvh); z-index: 10000; display: ${display}; flex-direction: column; background-color: var(--color-surface-light, #ffffff); box-shadow: 0 -8px 32px rgba(0,0,0,0.18); border-radius: 16px 16px 0 0; overflow: hidden; ${animationStyle} ${mobileFontFamily} ${mobileConfigStyleStr}">
        <div class="floating-chat-inner" id="floating-chat-inner" style="height: 100%; width: 100%; display: grid; grid-template-rows: auto 1fr auto;"></div>
      </div>
    `;

    const launcherImage = (this.showNotification && this.config.launcher?.animationImages?.length)
      ? this.config.launcher.animationImages[this.currentImageIndex]
      : this.config.launcher?.imageUrl;

    const notifCfg = this.config.notification;
    let notifHtml = '';
    if (notifCfg && this.showNotification && !shouldShowOpen && !this.isTyping && this.pillVisible && notifCfg.message) {
      const msg = this.overrideNotificationMessage ?? notifCfg.message;
      const dotShow = notifCfg.dot?.show !== false;
      const dotColor = notifCfg.dot?.color || '#ef4444';
      const dotRingColor = notifCfg.dot?.ringColor || dotColor;
      const dotSize = notifCfg.dot?.size ?? 10;
      const dotWrapperSize = dotSize + 4;
      const dotAnimDuration = notifCfg.dot?.animationDuration ?? 1.2;
      const dotTop = notifCfg.dot?.position?.top ?? '4px';
      const dotRight = notifCfg.dot?.position?.right ?? '4px';
      const dotBubbleSide = notifCfg.dot?.bubblePosition?.side ?? 'left';
      const dotBubblePad = dotShow ? `${dotWrapperSize + 8}px` : '10px';
      const bubbleCardPadding = dotBubbleSide === 'left' ? `10px 12px 10px ${dotBubblePad}` : `10px ${dotBubblePad} 10px 12px`;
      const scale = notifCfg.dot?.animationScale ?? 2.2;
      const pingKeyframeName = `chat-bubble-ping-${Math.round(scale * 10)}`;
      notifHtml = `
        <div class="floating-pill-notification" style="position: relative; background: #ffffff; border-radius: 10px; box-shadow: 0 4px 16px rgba(0,0,0,0.14); border: 1px solid #e5e7eb; max-width: min(280px, calc(100dvw - 16px)); width: max-content; font-size: 0.875rem; color: #1f2937; pointer-events: none; z-index: 10001; align-self: flex-end; margin-bottom: 8px; margin-right: 6px; box-sizing: border-box; padding: ${bubbleCardPadding}">
          ${dotShow ? `
            <div class="floating-ping-dot-wrapper" style="position: absolute; top: ${dotTop}; right: ${dotRight}; width: ${dotWrapperSize}px; height: ${dotWrapperSize}px">
              <div class="floating-ping-ring" style="position: absolute; inset: 0; border-radius: 50%; background: ${dotRingColor}; animation: ${pingKeyframeName} ${dotAnimDuration}s ease-out infinite"></div>
              <div class="floating-ping-solid" style="position: absolute; top: 2px; left: 2px; border-radius: 50%; border: 2px solid white; width: ${dotSize}px; height: ${dotSize}px; background: ${dotColor}"></div>
            </div>
          ` : ''}
          <span>${msg}</span>
          <div class="floating-pill-notification-arrow" style="position: absolute; bottom: -8px; right: 20px; width: 0; height: 0; border-left: 8px solid transparent; border-right: 8px solid transparent; border-top: 8px solid #ffffff; filter: drop-shadow(0 2px 1px rgba(0,0,0,0.06));"></div>
        </div>
      `;
    }

    let pillHtml = `
      ${chatHTML}
      <div class="floating-pill-wrapper" style="position: fixed; right: 0; bottom: 5px; z-index: 9999; display: flex; flex-direction: column; align-items: flex-end; transition: transform 300ms ease; max-width: 100dvw; overflow: visible; transform: translateX(${this.pillVisible ? '0' : 'calc(100% - 52px)'})">
        ${notifHtml}
        <div class="floating-pill-bar" style="display: flex; align-items: center; border-radius: 9999px 0 0 9999px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.22); border: 2px solid rgba(255,255,255,0.22); border-right: none; background: ${pillColor}">
          <button class="floating-pill-arrow-btn" id="pill-arrow-btn" style="flex-shrink: 0; display: flex; align-items: center; justify-content: center; width: 52px; height: 64px; background: transparent; border: none; cursor: pointer; padding: 0;">
            <div class="floating-pill-arrow-icon-wrapper" style="display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 50%; background: rgba(255,255,255,0.22); border: 2px solid rgba(255,255,255,0.45);">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="transition: transform 300ms ease; transform: ${this.pillVisible ? 'rotate(0deg)' : 'rotate(180deg)'}">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          </button>
          
          <button class="floating-pill-launcher-btn" id="pill-launcher-btn" style="flex-shrink: 0; display: flex; align-items: center; justify-content: center; width: 60px; height: 60px; border-radius: 50%; background: rgba(255,255,255,0.15); border: 2px solid rgba(255,255,255,0.4); cursor: pointer; margin: 0 6px 0 0; overflow: visible; transition: transform 200ms ease; position: relative; padding: 0;">
            <div class="floating-launcher-content" style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; transition: all 300ms; overflow: hidden; border-radius: 50%; ${shouldShowOpen ? 'transform: rotate(90deg) scale(0.8); opacity: 0;' : 'transform: rotate(0deg) scale(1); opacity: 1;'}">
              ${launcherImage
                ? `<img class="floating-launcher-img" src="${launcherImage}" alt="Chat" style="width: 100%; height: 100%; object-fit: cover;" />`
                : `<span style="font-size: 24px;">${this.config.launcher?.icon || '💬'}</span>`}
            </div>
            <div class="floating-close-icon" style="display: flex; align-items: center; justify-content: center; font-size: 24px; position: absolute; transition: all 300ms; color: white; ${shouldShowOpen ? 'transform: rotate(0deg) scale(1); opacity: 1;' : 'transform: rotate(-90deg) scale(0.8); opacity: 0;'}">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </div>

            ${!shouldShowOpen && this.isTyping ? `
              <div class="floating-typing-indicator mobile" style="position: absolute; top: -4px; left: -4px; min-width: 32px; height: 24px; border-radius: 12px; background: #ffffff; display: flex; align-items: center; justify-content: center; gap: 3px; padding: 0 8px; border: 2px solid rgba(255,255,255,0.4); box-shadow: 0 2px 8px rgba(0,0,0,0.2); z-index: 1;">
                <div class="floating-typing-dot" style="width: 4px; height: 4px; border-radius: 50%; background: #6b7280; animation: chatBubbleTypingDot 1.4s infinite; animation-delay: 0s;"></div>
                <div class="floating-typing-dot" style="width: 4px; height: 4px; border-radius: 50%; background: #6b7280; animation: chatBubbleTypingDot 1.4s infinite; animation-delay: 0.2s;"></div>
                <div class="floating-typing-dot" style="width: 4px; height: 4px; border-radius: 50%; background: #6b7280; animation: chatBubbleTypingDot 1.4s infinite; animation-delay: 0.4s;"></div>
              </div>
            ` : ''}
            
            ${!shouldShowOpen && !this.isTyping && this.unreadCount > 0 && !this.showNotification ? `
              <div class="floating-unread-badge" style="position: absolute; top: -4px; left: -4px; min-width: 24px; height: 24px; border-radius: 12px; background: #ef4444; color: white; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; padding: 0 6px; border: 2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.2); z-index: 1;">${this.unreadCount > 9 ? '9+' : this.unreadCount}</div>
            ` : ''}
          </button>
        </div>
      </div>
    `;

    this.wrapper.innerHTML = pillHtml;

    // Restore existing chat content if it exists
    if (existingChatInner) {
      const newChatInner = this.wrapper.querySelector('#floating-chat-inner');
      if (newChatInner) {
        newChatInner.replaceWith(existingChatInner);
      }
    }

    const arrowBtn = this.wrapper.querySelector('#pill-arrow-btn');
    if (arrowBtn) {
      arrowBtn.addEventListener('click', () => {
        this.pillVisible = !this.pillVisible;
        this.render();
      });
    }

    const launcherBtn = this.wrapper.querySelector('#pill-launcher-btn');
    if (launcherBtn) {
      launcherBtn.addEventListener('click', () => this.toggleOpen());
    }
  }
}
