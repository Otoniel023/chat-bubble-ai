/**
 * AvatarRenderer - Renders avatar component
 * Supports: icon, image, text types with online status indicator
 */

import type { AvatarConfig } from '../../components/ChatBubble/ChatBubble.types';
import { escapeHtml } from '../utils/templates';

const sizeMap = {
  sm: '2rem',   // 32px
  md: '2.5rem', // 40px
  lg: '3rem',   // 48px
};

const iconSizeMap = {
  sm: '0.875rem',
  md: '1.25rem',
  lg: '1.5rem',
};

const textSizeMap = {
  sm: '0.75rem',
  md: '1rem',
  lg: '1.25rem',
};

export class AvatarRenderer {
  constructor(private config: AvatarConfig, private className: string = '') {}

  /**
   * Render avatar content based on type
   */
  private renderContent(): string {
    const { type, src, icon, text, alt = 'Avatar', size = 'md' } = this.config;

    switch (type) {
      case 'image':
        return `
          <img
            src="${escapeHtml(src || '')}"
            alt="${escapeHtml(alt)}"
            style="width: 100%; height: 100%; object-fit: cover;"
          />
        `;

      case 'icon':
        // If icon is a string
        if (typeof icon === 'string') {
          // Check if it's 'smart_toy' or default icon
          if (icon === 'smart_toy' || !icon) {
            // Return default avatar (empty for now, could be a default image)
            return `
              <span style="font-size: ${iconSizeMap[size]}">🤖</span>
            `;
          }
          // Generic string icon
          return `
            <span style="font-size: ${iconSizeMap[size]}">
              ${escapeHtml(icon)}
            </span>
          `;
        }
        // Fallback
        return `<span style="font-size: ${iconSizeMap[size]}">👤</span>`;

      case 'text':
        return `
          <span style="font-size: ${textSizeMap[size]}; font-weight: 600;">
            ${escapeHtml(text || '?')}
          </span>
        `;

      default:
        return '';
    }
  }

  /**
   * Render online status indicator
   */
  private renderOnlineStatus(): string {
    if (!this.config.showOnlineStatus) return '';

    return `
      <div style="
        position: absolute;
        bottom: 0;
        right: 0;
        width: 0.75rem;
        height: 0.75rem;
        background-color: #22c55e;
        border-radius: 50%;
        border: 2px solid white;
      "></div>
    `;
  }

  /**
   * Render complete avatar
   */
  render(): string {
    const {
      type,
      backgroundColor = 'rgba(19, 127, 236, 0.1)',
      textColor = '#137fec',
      size = 'md',
    } = this.config;

    const sizePx = sizeMap[size];
    const border = type === 'image' ? '1px solid rgba(0,0,0,0.1)' : 'none';

    return `
      <div
        class="chat-avatar ${this.className}"
        style="position: relative; flex-shrink: 0;"
      >
        <div style="
          width: ${sizePx};
          height: ${sizePx};
          background-color: ${backgroundColor};
          color: ${textColor};
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          border: ${border};
          flex-shrink: 0;
        ">
          ${this.renderContent()}
        </div>
        ${this.renderOnlineStatus()}
      </div>
    `;
  }

  /**
   * Static render method for convenience
   */
  static render(config: AvatarConfig, className: string = ''): string {
    return new AvatarRenderer(config, className).render();
  }
}
