/**
 * HeaderRenderer - Renders chat header with avatar, title, and actions
 */

import type { ChatHeaderConfig } from '../../components/ChatBubble/ChatBubble.types';
import { AvatarRenderer } from './AvatarRenderer';
import { DOMRenderer } from '../core/DOMRenderer';
import { on, qsa } from '../utils/dom';
import { escapeHtml } from '../utils/templates';

export class HeaderRenderer extends DOMRenderer {
  private cleanupFunctions: Array<() => void> = [];

  constructor(
    private config: ChatHeaderConfig,
    private className: string = ''
  ) {
    super();
  }

  /**
   * Render header component
   */
  protected render(): string {
    const {
      avatar,
      title,
      subtitle,
      actions = [],
      showBorder = true,
      style: configStyle = {},
    } = this.config;

    // Build inline styles from config
    const styleEntries = Object.entries(configStyle);
    const customStyles = styleEntries
      .map(([key, value]) => {
        // Convert camelCase to kebab-case
        const kebabKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
        return `${kebabKey}: ${value};`;
      })
      .join(' ');

    // Filter visible actions
    const visibleActions = actions.filter(action => action.visible !== false);

    return `
      <header
        class="chat-header ${this.className}"
        style="
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 1.5rem;
          background-color: var(--color-surface-light);
          z-index: 10;
          border-bottom: ${showBorder ? '1px solid var(--color-border-light)' : 'none'};
          ${customStyles}
        "
      >
        <div style="display: flex; align-items: center; gap: 1rem;">
          ${AvatarRenderer.render(avatar)}

          <div>
            <h2 style="
              margin: 0;
              font-size: 1rem;
              font-weight: 700;
              line-height: 1.25;
              color: var(--color-text-primary, #0f172a);
            ">
              ${escapeHtml(title)}
            </h2>
            ${
              subtitle
                ? `
              <p style="
                margin: 0;
                color: var(--color-text-secondary, #64748b);
                font-size: 0.75rem;
              ">
                ${escapeHtml(subtitle)}
              </p>
            `
                : ''
            }
          </div>
        </div>

        <div class="chat-bubble-header-actions" style="display: flex; gap: 0.5rem;">
          ${visibleActions
            .map(
              action => `
            <button
              data-action-id="${action.id}"
              aria-label="${escapeHtml(action.ariaLabel)}"
              class="header-action-button"
              style="
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
              "
            >
              ${
                typeof action.icon === 'string'
                  ? `<span style="font-size: 20px;">${escapeHtml(action.icon)}</span>`
                  : '📋'
              }
            </button>
          `
            )
            .join('')}
        </div>
      </header>
    `;
  }

  /**
   * Hook called after mount - attach event listeners
   */
  protected onMount(): void {
    if (!this.element) return;

    // Attach hover effects to action buttons
    const buttons = qsa<HTMLButtonElement>('.header-action-button', this.element);

    buttons.forEach(button => {
      this.cleanupFunctions.push(
        on(button, 'mouseenter', () => {
          button.style.backgroundColor = 'var(--color-background-light, #f1f5f9)';
        })
      );

      this.cleanupFunctions.push(
        on(button, 'mouseleave', () => {
          button.style.backgroundColor = 'transparent';
        })
      );

      // Attach click handler
      const actionId = button.dataset.actionId;
      if (actionId) {
        const action = this.config.actions?.find(a => a.id === actionId);
        if (action && action.onClick) {
          this.cleanupFunctions.push(
            on(button, 'click', (e) => {
              e.preventDefault();
              action.onClick!();
            })
          );
        }
      }
    });
  }

  /**
   * Hook called before unmount - cleanup event listeners
   */
  protected onUnmount(): void {
    this.cleanupFunctions.forEach(cleanup => cleanup());
    this.cleanupFunctions = [];
  }
}
