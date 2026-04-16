/**
 * InputRenderer - Renders input field with send button and actions
 * Handles keyboard events, disabled states, and auto-resize
 */

import type { ChatInputConfig } from '../../components/ChatBubble/ChatBubble.types';
import { DOMRenderer } from '../core/DOMRenderer';
import { on, qs } from '../utils/dom';

export class InputRenderer extends DOMRenderer {
  private inputValue: string = '';
  private isHoveringSend: boolean = false;
  private cleanupFunctions: Array<() => void> = [];
  private onSubmitCallback?: (message: string) => void;

  constructor(
    private isLoading: boolean = false,
    private config: ChatInputConfig = {},
    private className: string = ''
  ) {
    super();
  }

  /**
   * Set submit callback
   */
  onSubmit(callback: (message: string) => void): void {
    this.onSubmitCallback = callback;
  }

  /**
   * Update loading state
   */
  updateLoadingState(isLoading: boolean): void {
    this.isLoading = isLoading;

    if (this.element) {
      const input = qs<HTMLInputElement>('input[type="text"]', this.element);
      const sendButton = qs<HTMLButtonElement>('button[type="submit"]', this.element);
      const actions = this.element.querySelectorAll('button[type="button"]');

      if (input) {
        input.disabled = isLoading;
        input.style.opacity = isLoading ? '0.5' : '1';
      }

      if (sendButton) {
        const isSendDisabled = !this.inputValue.trim() || isLoading;
        sendButton.disabled = isSendDisabled;
        sendButton.style.cursor = isSendDisabled ? 'not-allowed' : 'pointer';
        this.updateSendButtonStyle(sendButton, isSendDisabled);

        // Update spinner
        const spinner = qs<HTMLElement>('.send-button-spinner', sendButton);
        const icon = qs<HTMLElement>('.send-button-icon', sendButton);
        if (spinner && icon) {
          spinner.style.display = isLoading ? 'inline-block' : 'none';
          icon.style.display = isLoading ? 'none' : 'block';
        }
      }

      actions.forEach(button => {
        (button as HTMLButtonElement).disabled = isLoading;
        (button as HTMLElement).style.opacity = isLoading ? '0.5' : '1';
        (button as HTMLElement).style.cursor = isLoading ? 'not-allowed' : 'pointer';
      });
    }
  }

  /**
   * Get send button background
   */
  private getSendButtonBackground(isSendDisabled: boolean): string {
    const { sendButtonColor, sendButtonDisabledColor } = this.config;

    if (isSendDisabled) {
      if (sendButtonDisabledColor) return sendButtonDisabledColor;
      if (sendButtonColor) return sendButtonColor;
      return '#94a3b8';
    }
    if (sendButtonColor) return sendButtonColor;
    return 'linear-gradient(135deg, #3b82f6, #4f46e5)';
  }

  /**
   * Get send button filter
   */
  private getSendButtonFilter(isSendDisabled: boolean): string {
    const { sendButtonColor, sendButtonDisabledColor } = this.config;

    if (isSendDisabled && !sendButtonDisabledColor && sendButtonColor) {
      return 'brightness(0.5) saturate(0.5)';
    }
    if (!isSendDisabled && this.isHoveringSend && sendButtonColor) {
      return 'brightness(1.15)';
    }
    return 'none';
  }

  /**
   * Update send button style
   */
  private updateSendButtonStyle(button: HTMLButtonElement, isSendDisabled: boolean): void {
    const { sendButtonColor } = this.config;

    button.style.background = this.getSendButtonBackground(isSendDisabled);
    button.style.filter = this.getSendButtonFilter(isSendDisabled);
    button.style.boxShadow = isSendDisabled
      ? '0 2px 8px rgba(0,0,0,0.1)'
      : sendButtonColor
      ? '0 4px 12px rgba(0,0,0,0.2)'
      : '0 4px 12px rgba(59, 130, 246, 0.35)';
    button.style.transform =
      this.isHoveringSend && !isSendDisabled ? 'scale(1.08)' : 'scale(1)';
  }

  /**
   * Handle form submit
   */
  private handleSubmit(e: Event): void {
    e.preventDefault();

    if (!this.inputValue.trim() || this.isLoading) return;

    const message = this.inputValue.trim();
    this.inputValue = '';

    // Update input element
    if (this.element) {
      const input = qs<HTMLInputElement>('input[type="text"]', this.element);
      if (input) {
        input.value = '';
      }
    }

    // Call callback
    if (this.onSubmitCallback) {
      this.onSubmitCallback(message);
    }
  }

  /**
   * Render input component
   */
  protected render(): string {
    const {
      placeholder = 'Type a message...',
      showSendButton = true,
      disclaimer = 'AI can make mistakes. Consider checking important information.',
      maxLength,
      sendButtonColor,
    } = this.config;

    const isSendDisabled = !this.inputValue.trim() || this.isLoading;

    // Render send icon
    const sendIconSVG = `
      <svg class="send-button-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="22" y1="2" x2="11" y2="13"></line>
        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
      </svg>
    `;

    return `
      <footer
        class="chat-input-container ${this.className}"
        style="
          padding: 0.75rem 1rem 1.5rem 1rem;
          background: linear-gradient(to top, rgba(248, 250, 252, 0.9), transparent);
          backdrop-filter: blur(8px);
          box-sizing: border-box;
          width: 100%;
          flex-shrink: 0;
        "
      >
        <div style="max-width: 800px; margin: 0 auto; width: 100%;">
          <form>
            <div style="
              position: relative;
              display: flex;
              align-items: center;
              width: 100%;
              background: rgba(255, 255, 255, 0.95);
              backdrop-filter: blur(12px);
              border-radius: 1rem;
              box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
              border: 1px solid rgba(226, 232, 240, 0.6);
              padding: 0 0.5rem;
              transition: box-shadow 0.3s ease, border-color 0.3s ease;
            ">
              <!-- Text Input -->
              <input
                type="text"
                placeholder="${placeholder}"
                ${maxLength ? `maxlength="${maxLength}"` : ''}
                value="${this.inputValue}"
                ${this.isLoading ? 'disabled' : ''}
                style="
                  flex: 1;
                  background: transparent;
                  border: none;
                  outline: none;
                  color: #1e293b;
                  font-size: 1rem;
                  padding: 1rem 0.5rem;
                  opacity: ${this.isLoading ? 0.5 : 1};
                "
              />

              <!-- Right Actions & Send Button -->
              <div style="
                display: flex;
                align-items: center;
                padding-right: 0.25rem;
                gap: 0.25rem;
              ">
                ${
                  showSendButton
                    ? `
                  <button
                    type="submit"
                    aria-label="Send message"
                    ${isSendDisabled ? 'disabled' : ''}
                    style="
                      position: relative;
                      margin-left: 0.25rem;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      width: 2.75rem;
                      height: 2.75rem;
                      border-radius: 50%;
                      background: ${this.getSendButtonBackground(isSendDisabled)};
                      color: #fff;
                      border: none;
                      cursor: ${isSendDisabled ? 'not-allowed' : 'pointer'};
                      filter: ${this.getSendButtonFilter(isSendDisabled)};
                      box-shadow: ${
                        isSendDisabled
                          ? '0 2px 8px rgba(0,0,0,0.1)'
                          : sendButtonColor
                          ? '0 4px 12px rgba(0,0,0,0.2)'
                          : '0 4px 12px rgba(59, 130, 246, 0.35)'
                      };
                      transform: ${
                        this.isHoveringSend && !isSendDisabled ? 'scale(1.08)' : 'scale(1)'
                      };
                      transition: all 0.25s ease;
                      overflow: hidden;
                    "
                  >
                    <!-- Spinner (hidden by default) -->
                    <span class="send-button-spinner" style="
                      display: ${this.isLoading ? 'inline-block' : 'none'};
                      width: 20px;
                      height: 20px;
                      border: 2px solid rgba(255,255,255,0.3);
                      border-top-color: #fff;
                      border-radius: 50%;
                      animation: spin 0.8s linear infinite;
                    "></span>

                    <!-- Send Icon -->
                    <span style="display: ${this.isLoading ? 'none' : 'block'}">
                      ${sendIconSVG}
                    </span>

                    <!-- Pulse effect when enabled -->
                    ${
                      !isSendDisabled
                        ? `
                      <span style="
                        position: absolute;
                        inset: 0;
                        border-radius: 50%;
                        animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
                        opacity: 0.2;
                        background-color: ${sendButtonColor ?? '#3b82f6'};
                      "></span>
                    `
                        : ''
                    }
                  </button>
                `
                    : ''
                }
              </div>
            </div>
          </form>

          ${
            disclaimer
              ? `
            <div style="
              margin-top: 0.5rem;
              text-align: center;
              font-size: 0.625rem;
              color: var(--color-text-tertiary, #94a3b8);
            ">
              ${disclaimer}
            </div>
          `
              : ''
          }
        </div>

        <!-- Animations -->
        <style>
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes ping {
            75%, 100% {
              transform: scale(2);
              opacity: 0;
            }
          }
        </style>
      </footer>
    `;
  }

  /**
   * Hook called after mount - attach event listeners
   */
  protected onMount(): void {
    if (!this.element) return;

    const form = qs<HTMLFormElement>('form', this.element);
    const input = qs<HTMLInputElement>('input[type="text"]', this.element);
    const sendButton = qs<HTMLButtonElement>('button[type="submit"]', this.element);

    // Form submit
    if (form) {
      this.cleanupFunctions.push(
        on(form, 'submit', (e) => this.handleSubmit(e))
      );
    }

    // Input change
    if (input) {
      this.cleanupFunctions.push(
        on(input, 'input', (e) => {
          this.inputValue = (e.target as HTMLInputElement).value;

          // Update send button state
          if (sendButton) {
            const isSendDisabled = !this.inputValue.trim() || this.isLoading;
            sendButton.disabled = isSendDisabled;
            this.updateSendButtonStyle(sendButton, isSendDisabled);
          }
        })
      );

      // Enter key to submit
      this.cleanupFunctions.push(
        on(input, 'keydown', (e: any) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (form) {
              this.handleSubmit(e);
            }
          }
        })
      );
    }

    // Send button hover
    if (sendButton) {
      this.cleanupFunctions.push(
        on(sendButton, 'mouseenter', () => {
          this.isHoveringSend = true;
          this.updateSendButtonStyle(sendButton, sendButton.disabled);
        })
      );

      this.cleanupFunctions.push(
        on(sendButton, 'mouseleave', () => {
          this.isHoveringSend = false;
          this.updateSendButtonStyle(sendButton, sendButton.disabled);
        })
      );
    }
  }

  /**
   * Hook called before unmount - cleanup event listeners
   */
  protected onUnmount(): void {
    this.cleanupFunctions.forEach(cleanup => cleanup());
    this.cleanupFunctions = [];
  }
}
