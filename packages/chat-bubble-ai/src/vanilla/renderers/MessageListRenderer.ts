/**
 * MessageListRenderer - Renders list of messages with date separators
 * Handles auto-scroll and efficient updates
 */

import type { ChatMessage, DateSeparatorConfig, AvatarConfig } from '../../components/ChatBubble/ChatBubble.types';
import { MessageRenderer } from './MessageRenderer';
import { DateSeparatorRenderer } from './DateSeparatorRenderer';
import { TypingIndicatorRenderer } from './TypingIndicatorRenderer';
import { DOMRenderer } from '../core/DOMRenderer';
import { scrollToBottom } from '../utils/dom';

export class MessageListRenderer extends DOMRenderer {
  constructor(
    private messages: ChatMessage[] = [],
    private isTyping: boolean = false,
    private defaultAvatar?: AvatarConfig,
    private dateSeparatorConfig?: DateSeparatorConfig,
    private className: string = '',
    private toolCallLabel: string = ''
  ) {
    super();
  }

  /**
   * Update tool call label in typing indicator without full re-render
   */
  updateToolCallLabel(label: string): void {
    this.toolCallLabel = label;
    if (this.element) {
      this.updateInnerHTML(this.renderMessages());
    }
  }

  /**
   * Update messages and re-render
   */
  updateMessages(
    messages: ChatMessage[],
    isTyping: boolean,
    shouldScroll: boolean = true
  ): void {
    this.messages = messages;
    this.isTyping = isTyping;

    if (this.element) {
      // Save scroll state before update
      const wasAtBottom = this.isScrolledToBottom();
      const previousScrollTop = this.element.scrollTop;
      const previousScrollHeight = this.element.scrollHeight;

      // Update HTML
      this.updateInnerHTML(this.renderMessages());

      // Restore or adjust scroll position
      if (shouldScroll || wasAtBottom) {
        // Scroll to bottom if requested or user was already at bottom
        requestAnimationFrame(() => this.scrollToBottom());
      } else {
        // Preserve scroll position relative to new content height
        const newScrollHeight = this.element.scrollHeight;
        const scrollDiff = newScrollHeight - previousScrollHeight;
        this.element.scrollTop = previousScrollTop + scrollDiff;
      }
    }
  }

  /**
   * Check if scrolled to bottom
   */
  private isScrolledToBottom(threshold: number = 100): boolean {
    if (!this.element) return false;

    const { scrollTop, scrollHeight, clientHeight } = this.element;
    return scrollHeight - scrollTop - clientHeight < threshold;
  }

  /**
   * Scroll to bottom
   */
  scrollToBottom(smooth: boolean = true): void {
    if (this.element) {
      scrollToBottom(this.element, smooth);
    }
  }

  /**
   * Render messages with date separators
   */
  private renderMessages(): string {
    if (this.messages.length === 0) {
      return '<div class="chat-empty-state" style="display: flex; align-items: center; justify-content: center; height: 100%; color: var(--color-text-tertiary, #94a3b8); font-size: 0.875rem;">No messages yet</div>';
    }

    const messageHtmlParts: string[] = [];
    let previousDate: string | null = null;

    this.messages.forEach((message) => {
      const currentDate = new Date(message.timestamp).toDateString();

      // Add date separator if date changed
      if (currentDate !== previousDate) {
        messageHtmlParts.push(
          DateSeparatorRenderer.render(message.timestamp, this.dateSeparatorConfig || {})
        );
        previousDate = currentDate;
      }

      // Add message
      messageHtmlParts.push(MessageRenderer.render(message, this.defaultAvatar));
    });

    // Show typing indicator only while waiting for first chunk
    // Once streaming starts, the indicator disappears
    const hasStreamingMessage = this.messages.some(
      m => m.role === 'assistant' && m.status === 'streaming'
    );

    if (this.isTyping && !hasStreamingMessage) {
      messageHtmlParts.push(
        TypingIndicatorRenderer.render({
          show: true,
          avatar: this.defaultAvatar,
          toolCallLabel: this.toolCallLabel,
        })
      );
    }

    return messageHtmlParts.join('\n');
  }

  /**
   * Render message list container
   */
  protected render(): string {
    return `
      <div
        class="chat-bubble-messages ${this.className}"
        style="
          flex: 1;
          overflow-y: auto;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          scroll-behavior: smooth;
          background: var(--chat-background, var(--color-background-light, #f6f7f8));
          height: 100%;
        "
      >
        ${this.renderMessages()}
      </div>
    `;
  }

  /**
   * Scroll so the top of the given message id is visible (used after streaming completes)
   */
  scrollToMessage(messageId: string): void {
    if (!this.element) return;
    const msgEl = this.element.querySelector<HTMLElement>(`[data-message-id="${messageId}"]`);
    if (msgEl) {
      msgEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  /**
   * Hook called after mount - scroll to bottom and wire carousel delegation
   */
  protected onMount(): void {
    setTimeout(() => this.scrollToBottom(false), 100);

    // Event delegation for carousel navigation — survives innerHTML updates
    if (this.element) {
      this.element.addEventListener('click', (e: Event) => {
        const target = e.target as HTMLElement;
        const carousel = target.closest('.image-carousel') as HTMLElement | null;
        if (!carousel) return;

        const images = JSON.parse(
          carousel.getAttribute('data-carousel-images') || '[]'
        ) as string[];
        let current = parseInt(carousel.getAttribute('data-current') || '0', 10);

        if (target.closest('.carousel-prev')) {
          current = (current - 1 + images.length) % images.length;
        } else if (target.closest('.carousel-next')) {
          current = (current + 1) % images.length;
        } else {
          const dot = target.closest('[data-dot-index]') as HTMLElement | null;
          if (dot) {
            current = parseInt(dot.dataset.dotIndex || '0', 10);
          } else {
            return;
          }
        }

        carousel.setAttribute('data-current', String(current));

        const img = carousel.querySelector<HTMLImageElement>('.carousel-img');
        if (img) {
          img.src = images[current];
          img.alt = `Image ${current + 1} of ${images.length}`;
        }

        const counter = carousel.querySelector<HTMLElement>('.carousel-counter');
        if (counter) counter.textContent = `${current + 1}/${images.length}`;

        carousel.querySelectorAll<HTMLElement>('[data-dot-index]').forEach((dot, i) => {
          dot.style.background =
            i === current ? 'var(--color-primary, #137fec)' : '#cbd5e1';
        });
      });
    }
  }
}
