/**
 * MessageRenderer - Renders individual chat message
 * Handles user and assistant messages with avatars
 */

import type { ChatMessage, AvatarConfig } from '../../components/ChatBubble/ChatBubble.types';
import { AvatarRenderer } from './AvatarRenderer';
import { escapeHtml } from '../utils/templates';

export class MessageRenderer {
  constructor(
    private message: ChatMessage,
    private defaultAvatar?: AvatarConfig,
    private className: string = ''
  ) {}

  /**
   * Format timestamp to time string
   */
  private formatTime(time: Date | string): string {
    const date = typeof time === 'string' ? new Date(time) : time;
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }

  /**
   * Get avatar config for message
   */
  private getAvatarConfig(): AvatarConfig {
    const isUser = this.message.role === 'user';

    return {
      ...this.defaultAvatar,
      type: isUser ? 'text' : 'image',
      text: isUser ? 'U' : undefined,
      src: isUser
        ? undefined
        : this.defaultAvatar?.src || 'https://photos.dominicanatours.com/imagenes/domi.webp',
      backgroundColor: isUser ? '#e2e8f0' : 'rgba(19, 127, 236, 0.1)',
      textColor: isUser ? '#334155' : '#000000',
      size: 'sm',
    };
  }

  /**
   * Render message content
   */
  private renderContent(): string {
    const { role, content } = this.message;

    // Assistant messages: allow HTML (already sanitized by backend)
    if (role === 'assistant') {
      return content; // Don't escape - use dangerouslySetInnerHTML equivalent
    }

    // User messages: escape HTML for safety
    return escapeHtml(content);
  }

  /**
   * Render complete message
   */
  render(): string {
    const { role, timestamp } = this.message;
    const isUser = role === 'user';
    const label = isUser ? 'You' : 'Assistant';
    const avatarConfig = this.getAvatarConfig();

    return `
      <div
        class="chat-message ${this.className}"
        data-role="${role}"
        style="
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          align-items: ${isUser ? 'flex-end' : 'flex-start'};
        "
      >
        <div style="
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          max-width: 95%;
          justify-content: ${isUser ? 'flex-end' : 'flex-start'};
        ">
          <div style="
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding-left: 0.25rem;
            padding-right: 0.25rem;
            flex-direction: ${isUser ? 'row-reverse' : 'row'};
          ">
            <span style="
              font-size: 0.75rem;
              font-weight: 500;
              color: var(--color-text-secondary, #64748b);
            ">
              ${label}
            </span>
            <span style="
              font-size: 0.625rem;
              color: var(--color-text-tertiary, #94a3b8);
            ">
              ${this.formatTime(timestamp)}
            </span>
          </div>

          <div style="
            position: relative;
            font-size: 1rem;
            line-height: 1.625;
            box-shadow: ${
              isUser
                ? '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                : '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
            };
            white-space: pre-wrap;
            overflow-wrap: break-word;
            border-radius: 1rem;
            border-bottom-right-radius: ${isUser ? '0.125rem' : '1rem'};
            border-bottom-left-radius: ${isUser ? '1rem' : '0.125rem'};
            font-weight: ${
              isUser
                ? 'var(--message-user-font-weight, 400)'
                : 'var(--message-assistant-font-weight, 400)'
            };
            color: ${
              isUser
                ? 'var(--message-user-text, #ffffff)'
                : 'var(--message-assistant-text, inherit)'
            };
            background: ${
                isUser
                  ? 'var(--message-user-bg, var(--color-primary, #137fec))'
                  : 'var(--message-assistant-bg, #f1f5f9)'
              };
          "><div style="
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              border-radius: inherit;
              opacity: ${
                isUser
                  ? 'var(--message-user-opacity, 1)'
                  : 'var(--message-assistant-opacity, 1)'
              };
              
              z-index: 0;
            "></div><div style="
              position: relative;
              z-index: 10;
              padding: 0.5rem;
              text-align: ${isUser ? 'right' : 'left'};
              max-height: max-content;
            ">${this.renderContent()}</div></div>
            <div style="display: flex; justify-content: ${isUser ? 'flex-end' : 'flex-start'};">
            ${AvatarRenderer.render(avatarConfig)}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Static render method for convenience
   */
  static render(
    message: ChatMessage,
    defaultAvatar?: AvatarConfig,
    className: string = ''
  ): string {
    return new MessageRenderer(message, defaultAvatar, className).render();
  }
}
