/**
 * TypingIndicatorRenderer - Renders animated typing indicator
 * Shows three bouncing dots with avatar
 */

import type { TypingIndicatorConfig, AvatarConfig } from '../../components/ChatBubble/ChatBubble.types';
import { AvatarRenderer } from './AvatarRenderer';

export class TypingIndicatorRenderer {
  constructor(
    private config: TypingIndicatorConfig = { show: false },
    private className: string = ''
  ) {}

  /**
   * Get avatar for typing indicator (assistant avatar)
   */
  private getAvatar(): AvatarConfig {
    const baseAvatar = this.config.avatar;

    return {
      ...(baseAvatar || {}),
      type: 'image',
      src: baseAvatar?.src || 'https://photos.dominicanatours.com/imagenes/domi.webp',
      backgroundColor: 'rgba(19, 127, 236, 0.1)',
      textColor: '#000000',
      size: 'sm',
    };
  }

  /**
   * Render typing indicator
   */
  render(): string {
    const { show = false, dotColor = '#94a3b8' } = this.config;

    if (!show) return '';

    const avatar = this.getAvatar();
    const finalDotColor = dotColor.startsWith('bg-') ? '#94a3b8' : dotColor;

    return `
      <div
        class="chat-typing-indicator ${this.className}"
        style="display: flex; align-items: flex-end; gap: 0.75rem;"
      >
        ${AvatarRenderer.render(avatar)}

        <div style="display: flex; flex-direction: column; gap: 0.25rem; align-items: flex-start;">
          <div style="
            padding: 0.75rem 1rem;
            border-radius: 1rem;
            border-bottom-left-radius: 0.125rem;
            background-color: var(--color-background-light, #f1f5f9);
            box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
            display: flex;
            gap: 0.25rem;
            align-items: center;
            height: 46px;
          ">
            <span style="
              display: block;
              width: 0.375rem;
              height: 0.375rem;
              border-radius: 9999px;
              background-color: ${finalDotColor};
              animation: chat-bubble-bounce 1s infinite;
            "></span>
            <span style="
              display: block;
              width: 0.375rem;
              height: 0.375rem;
              border-radius: 9999px;
              background-color: ${finalDotColor};
              animation: chat-bubble-bounce 1s infinite;
              animation-delay: 0.2s;
            "></span>
            <span style="
              display: block;
              width: 0.375rem;
              height: 0.375rem;
              border-radius: 9999px;
              background-color: ${finalDotColor};
              animation: chat-bubble-bounce 1s infinite;
              animation-delay: 0.4s;
            "></span>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Static render method for convenience
   */
  static render(config: TypingIndicatorConfig = { show: false }, className: string = ''): string {
    return new TypingIndicatorRenderer(config, className).render();
  }
}
