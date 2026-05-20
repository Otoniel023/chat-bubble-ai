/**
 * SuggestedRepliesRenderer - Renders suggested reply chip buttons
 * Mounted once; chips are updated via innerHTML. Event listener lives on the container.
 */

import { DOMRenderer } from '../core/DOMRenderer';
import { escapeHtml } from '../utils/templates';

export class SuggestedRepliesRenderer extends DOMRenderer {
  private suggestions: string[] = [];
  private onSendCallback?: (message: string) => void;

  onSend(callback: (message: string) => void): void {
    this.onSendCallback = callback;
  }

  updateSuggestions(suggestions: string[]): void {
    this.suggestions = suggestions;
    if (!this.element) return;

    if (suggestions.length === 0) {
      this.element.style.display = 'none';
      this.updateInnerHTML('');
    } else {
      this.element.style.display = 'flex';
      this.updateInnerHTML(this.renderChips());
    }
  }

  private renderChips(): string {
    return `
      ${this.suggestions.map(s => `
        <button
          class="suggested-reply-chip"
          data-reply="${s.replace(/"/g, '&quot;').replace(/'/g, '&#39;')}"
          style="
            flex-shrink: 0;
            padding: 0.375rem 0.875rem;
            border: 1.5px solid var(--color-primary, #137fec);
            border-radius: 9999px;
            background: transparent;
            color: var(--color-primary, #137fec);
            font-size: 0.875rem;
            cursor: pointer;
            white-space: nowrap;
            transition: background 0.15s, color 0.15s;
            font-family: inherit;
          "
          onmouseover="this.style.background='var(--color-primary, #137fec)';this.style.color='#ffffff';"
          onmouseout="this.style.background='transparent';this.style.color='var(--color-primary, #137fec)';"
        >${escapeHtml(s)}</button>
      `).join('')}
      <div style="flex-shrink: 0; width: 1rem;" aria-hidden="true"></div>
    `;
  }

  protected render(): string {
    return `
      <div
        class="suggested-replies-container"
        style="
          display: none;
          flex-direction: row;
          gap: 0.5rem;
          overflow-x: auto;
          padding: 0.5rem 0 0.5rem 1rem;
          scrollbar-width: thin;
          scrollbar-color: var(--color-border-light, #e2e8f0) transparent;
        "
      ></div>
    `;
  }

  protected onMount(): void {
    if (!this.element) return;
    this.element.addEventListener('click', (e) => {
      const btn = (e.target as HTMLElement).closest('.suggested-reply-chip') as HTMLElement | null;
      if (btn && this.onSendCallback) {
        const reply = btn.getAttribute('data-reply') || '';
        this.onSendCallback(reply);
      }
    });
  }
}
