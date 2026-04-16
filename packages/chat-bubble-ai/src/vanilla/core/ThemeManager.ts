/**
 * ThemeManager - Handles theme configuration and CSS variable injection
 * Merges user config with defaultTheme and applies styles to container
 */

import type { ChatTheme, ChatBubbleConfig } from '../../components/ChatBubble/ChatBubble.types';
import { defaultTheme } from '../../components/ChatBubble/ChatBubble.types';

export class ThemeManager {
  private mergedTheme: ChatTheme;
  private container: HTMLElement;
  private darkMode: boolean;
  private static globalStylesInjected = false;

  constructor(container: HTMLElement, config: ChatBubbleConfig) {
    this.container = container;
    this.darkMode = config.darkMode ?? false;

    // Deep merge user theme with defaultTheme
    this.mergedTheme = this.mergeTheme(defaultTheme, config.theme);
  }

  /**
   * Deep merge user theme with default theme
   */
  private mergeTheme(defaultTheme: ChatTheme, userTheme?: any): ChatTheme {
    if (!userTheme) return { ...defaultTheme };

    return {
      cssVariables: {
        ...defaultTheme.cssVariables,
        ...userTheme.cssVariables,
      },
      backgrounds: {
        ...defaultTheme.backgrounds,
        ...userTheme.backgrounds,
      },
      colors: {
        ...defaultTheme.colors,
        ...userTheme.colors,
      },
      text: {
        ...defaultTheme.text,
        ...userTheme.text,
      },
      borders: {
        ...defaultTheme.borders,
        ...userTheme.borders,
      },
      messageBubbles: {
        assistant: {
          ...defaultTheme.messageBubbles.assistant,
          ...userTheme.messageBubbles?.assistant,
        },
        user: {
          ...defaultTheme.messageBubbles.user,
          ...userTheme.messageBubbles?.user,
        },
      },
      fonts: {
        ...defaultTheme.fonts,
        ...userTheme.fonts,
      },
    };
  }

  /**
   * Build CSS variables object from merged theme
   * Based on ChatBubble.tsx buildCssVariables() logic (lines 86-167)
   */
  private buildCssVariables(): Record<string, string> {
    const vars: Record<string, string> = {};

    // CSS Variables (new preferred way)
    if (this.mergedTheme.cssVariables) {
      const { cssVariables } = this.mergedTheme;

      if (cssVariables.colorPrimary) vars['--color-primary'] = cssVariables.colorPrimary;
      if (cssVariables.colorPrimaryHover) vars['--color-primary-hover'] = cssVariables.colorPrimaryHover;
      if (cssVariables.colorBackgroundLight) vars['--color-background-light'] = cssVariables.colorBackgroundLight;
      if (cssVariables.colorBackgroundDark) vars['--color-background-dark'] = cssVariables.colorBackgroundDark;
      if (cssVariables.colorSurfaceLight) vars['--color-surface-light'] = cssVariables.colorSurfaceLight;
      if (cssVariables.colorSurfaceDark) vars['--color-surface-dark'] = cssVariables.colorSurfaceDark;
      if (cssVariables.colorBorderLight) vars['--color-border-light'] = cssVariables.colorBorderLight;
      if (cssVariables.colorBorderDark) vars['--color-border-dark'] = cssVariables.colorBorderDark;
      if (cssVariables.colorTextSecondary) vars['--color-text-secondary'] = cssVariables.colorTextSecondary;
      if (cssVariables.colorTextTertiary) vars['--color-text-tertiary'] = cssVariables.colorTextTertiary;
      if (cssVariables.fontSans) vars['--font-sans'] = cssVariables.fontSans;
      if (cssVariables.animateBounce) vars['--animate-bounce'] = cssVariables.animateBounce;
    }

    // Backgrounds
    if (this.mergedTheme.backgrounds?.chat) {
      vars['--chat-background'] = this.mergedTheme.backgrounds.chat.startsWith('http')
        ? `url(${this.mergedTheme.backgrounds.chat})`
        : this.mergedTheme.backgrounds.chat;
    }

    // Message Opacity
    if (this.mergedTheme.messageBubbles?.assistant?.opacity !== undefined) {
      vars['--message-assistant-opacity'] = this.mergedTheme.messageBubbles.assistant.opacity.toString();
    }
    if (this.mergedTheme.messageBubbles?.user?.opacity !== undefined) {
      vars['--message-user-opacity'] = this.mergedTheme.messageBubbles.user.opacity.toString();
    }

    // Message Backgrounds
    if (this.mergedTheme.messageBubbles?.assistant?.background) {
      vars['--message-assistant-bg'] = this.mergedTheme.messageBubbles.assistant.background;
    }
    if (this.mergedTheme.messageBubbles?.user?.background) {
      vars['--message-user-bg'] = this.mergedTheme.messageBubbles.user.background;
    }

    // Message Text Colors
    if (this.mergedTheme.messageBubbles?.assistant?.textColor) {
      vars['--message-assistant-text'] = this.mergedTheme.messageBubbles.assistant.textColor;
    }
    if (this.mergedTheme.messageBubbles?.user?.textColor) {
      vars['--message-user-text'] = this.mergedTheme.messageBubbles.user.textColor;
    }

    // Message Font Weight
    const getFontWeight = (weight?: 'base' | 'semi-bold' | 'bold') => {
      switch (weight) {
        case 'base': return '400';
        case 'semi-bold': return '600';
        case 'bold': return '700';
        default: return undefined;
      }
    };

    const assistantFontWeight = getFontWeight(this.mergedTheme.messageBubbles?.assistant?.fontWeight);
    if (assistantFontWeight) {
      vars['--message-assistant-font-weight'] = assistantFontWeight;
    }

    const userFontWeight = getFontWeight(this.mergedTheme.messageBubbles?.user?.fontWeight);
    if (userFontWeight) {
      vars['--message-user-font-weight'] = userFontWeight;
    }

    // Backward compatibility: support old color properties
    if (this.mergedTheme.colors.primary && !this.mergedTheme.cssVariables?.colorPrimary) {
      vars['--color-primary'] = this.mergedTheme.colors.primary;
    }
    if (this.mergedTheme.colors.primaryHover && !this.mergedTheme.cssVariables?.colorPrimaryHover) {
      vars['--color-primary-hover'] = this.mergedTheme.colors.primaryHover;
    }

    return vars;
  }

  /**
   * Apply theme to container by injecting CSS variables
   */
  applyTheme(): void {
    // Add dark mode class if enabled
    if (this.darkMode) {
      this.container.classList.add('dark');
    } else {
      this.container.classList.remove('dark');
    }

    // Inject CSS variables
    const cssVars = this.buildCssVariables();
    Object.entries(cssVars).forEach(([key, value]) => {
      this.container.style.setProperty(key, value);
    });

    // Inject global styles once
    this.injectGlobalStyles();
  }

  /**
   * Inject global styles into <head> (only once per page)
   */
  private injectGlobalStyles(): void {
    if (ThemeManager.globalStylesInjected) return;

    const styleId = 'chat-bubble-ai-vanilla-global';
    if (document.getElementById(styleId)) {
      ThemeManager.globalStylesInjected = true;
      return;
    }

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      /* ChatBubble AI Vanilla - Global Styles */
      .chat-bubble-container * {
        box-sizing: border-box;
      }

      /* Bounce animation for typing indicator */
      @keyframes chat-bubble-bounce {
        0%, 80%, 100% {
          transform: translateY(0);
        }
        40% {
          transform: translateY(-8px);
        }
      }

      /* Smooth transitions */
      .chat-bubble-container button,
      .chat-bubble-container textarea {
        transition: all 0.2s ease;
      }

      /* Scrollbar styling */
      .chat-bubble-messages::-webkit-scrollbar {
        width: 6px;
      }

      .chat-bubble-messages::-webkit-scrollbar-track {
        background: transparent;
      }

      .chat-bubble-messages::-webkit-scrollbar-thumb {
        background: var(--color-border-light);
        border-radius: 3px;
      }

      .dark .chat-bubble-messages::-webkit-scrollbar-thumb {
        background: var(--color-border-dark);
      }
    `;

    document.head.appendChild(style);
    ThemeManager.globalStylesInjected = true;
  }

  /**
   * Update dark mode
   */
  setDarkMode(darkMode: boolean): void {
    this.darkMode = darkMode;
    if (darkMode) {
      this.container.classList.add('dark');
    } else {
      this.container.classList.remove('dark');
    }
  }

  /**
   * Get merged theme
   */
  getTheme(): ChatTheme {
    return this.mergedTheme;
  }

  /**
   * Get dark mode status
   */
  isDarkMode(): boolean {
    return this.darkMode;
  }
}
