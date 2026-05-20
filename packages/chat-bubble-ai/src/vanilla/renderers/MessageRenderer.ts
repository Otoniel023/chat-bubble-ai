/**
 * MessageRenderer - Renders individual chat message
 * Handles user and assistant messages with avatars
 */

import type { ChatMessage, AvatarConfig } from '../../components/ChatBubble/ChatBubble.types';
import { AvatarRenderer } from './AvatarRenderer';
import { CarouselRenderer } from './CarouselRenderer';
import { escapeHtml } from '../utils/templates';

export class MessageRenderer {
  constructor(
    private message: ChatMessage,
    private defaultAvatar?: AvatarConfig,
    private className: string = ''
  ) {}

  private formatTime(time: Date | string): string {
    const date = typeof time === 'string' ? new Date(time) : time;
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }

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

  private getDisplayContent(): string {
    const { content, status } = this.message;
    // Strip carousel/suggestions JSON while message is still streaming
    if (status !== 'sent') {
      return content
        .replace(/\{"type":"carousel","images":\[[\s\S]*?\]\}/, '')
        .replace(/\{"type":"suggestions","items":\[[\s\S]*?\]\}/, '')
        .trim();
    }
    return content;
  }

  render(): string {
    const { role, timestamp, type, images, id } = this.message;
    const isUser = role === 'user';
    const isCarousel = type === 'carousel' && Array.isArray(images) && images.length > 0;
    const label = isUser ? 'You' : 'Assistant';
    const avatarConfig = this.getAvatarConfig();
    const displayContent = this.getDisplayContent();

    const avatarHtml = `
      <div style="display: flex; justify-content: ${isUser ? 'flex-end' : 'flex-start'}; margin-bottom: 0.25rem;">
        ${AvatarRenderer.render(avatarConfig)}
      </div>
    `;

    const labelRowHtml = `
      <div style="
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding-left: 0.25rem;
        padding-right: 0.25rem;
        flex-direction: ${isUser ? 'row-reverse' : 'row'};
      ">
        <span style="font-size: 0.75rem; font-weight: 500; color: var(--color-text-secondary, #64748b);">
          ${label}
        </span>
        <span style="font-size: 0.625rem; color: var(--color-text-tertiary, #94a3b8);">
          ${this.formatTime(timestamp)}
        </span>
      </div>
    `;

    let bubbleHtml: string;

    if (isCarousel) {
      const textBubble = displayContent ? `
        <div style="
          position: relative;
          font-size: 1rem;
          line-height: 1.625;
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
          white-space: pre-wrap;
          overflow-wrap: break-word;
          border-radius: 1rem;
          border-bottom-left-radius: 0.125rem;
          font-weight: var(--message-assistant-font-weight, 400);
          color: var(--message-assistant-text, inherit);
          margin-bottom: 0.25rem;
        ">
          <div style="
            position: absolute; inset: 0; width: 100%; height: 100%;
            border-radius: inherit;
            opacity: var(--message-assistant-opacity, 1);
            background: var(--message-assistant-bg, #f1f5f9);
            z-index: 0;
          "></div>
          <div style="position: relative; z-index: 10; padding: 0.5rem;">
            ${displayContent}
          </div>
        </div>
      ` : '';

      bubbleHtml = textBubble + CarouselRenderer.render(images!);
    } else {
      const bgStyle = isUser
        ? 'var(--message-user-bg, var(--color-primary, #137fec))'
        : 'var(--message-assistant-bg, #f1f5f9)';
      const opacityVar = isUser
        ? 'var(--message-user-opacity, 1)'
        : 'var(--message-assistant-opacity, 1)';
      const colorStyle = isUser
        ? 'var(--message-user-text, #ffffff)'
        : 'var(--message-assistant-text, inherit)';
      const fontWeightStyle = isUser
        ? 'var(--message-user-font-weight, 400)'
        : 'var(--message-assistant-font-weight, 400)';
      const shadowStyle = isUser
        ? '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
        : '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
      const borderRadiusBR = isUser ? '0.125rem' : '1rem';
      const borderRadiusBL = isUser ? '1rem' : '0.125rem';

      const contentHtml = role === 'assistant'
        ? displayContent
        : escapeHtml(displayContent);

      bubbleHtml = `
        <div style="
          position: relative;
          font-size: 1rem;
          line-height: 1.625;
          box-shadow: ${shadowStyle};
          white-space: pre-wrap;
          overflow-wrap: break-word;
          border-radius: 1rem;
          border-bottom-right-radius: ${borderRadiusBR};
          border-bottom-left-radius: ${borderRadiusBL};
          font-weight: ${fontWeightStyle};
          color: ${colorStyle};
        ">
          <div style="
            position: absolute; inset: 0; width: 100%; height: 100%;
            border-radius: inherit;
            opacity: ${opacityVar};
            background: ${bgStyle};
            z-index: 0;
          "></div>
          <div style="
            position: relative;
            z-index: 10;
            padding: 0.5rem;
            text-align: ${isUser ? 'right' : 'left'};
          ">${contentHtml}</div>
        </div>
      `;
    }

    return `
      <div
        class="chat-message ${this.className}"
        data-role="${role}"
        data-message-id="${id}"
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
          ${avatarHtml}
          ${labelRowHtml}
          ${bubbleHtml}
        </div>
      </div>
    `;
  }

  static render(
    message: ChatMessage,
    defaultAvatar?: AvatarConfig,
    className: string = ''
  ): string {
    return new MessageRenderer(message, defaultAvatar, className).render();
  }
}
