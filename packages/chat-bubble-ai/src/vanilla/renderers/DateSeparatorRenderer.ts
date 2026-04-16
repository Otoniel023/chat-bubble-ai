/**
 * DateSeparatorRenderer - Renders date separator between messages
 * Supports: relative (Today, Yesterday), absolute, and custom formats
 */

import type { DateSeparatorConfig } from '../../components/ChatBubble/ChatBubble.types';

export class DateSeparatorRenderer {
  constructor(
    private date: Date | string,
    private config: DateSeparatorConfig = {},
    private className: string = ''
  ) {}

  /**
   * Format date based on configuration
   */
  private formatDate(dateValue: Date | string): string {
    const dateObj = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;

    const { format = 'relative', customFormatter } = this.config;

    // Use custom formatter if provided
    if (customFormatter) {
      return customFormatter(dateObj);
    }

    // Relative format
    if (format === 'relative') {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const isToday =
        dateObj.getDate() === today.getDate() &&
        dateObj.getMonth() === today.getMonth() &&
        dateObj.getFullYear() === today.getFullYear();

      const isYesterday =
        dateObj.getDate() === yesterday.getDate() &&
        dateObj.getMonth() === yesterday.getMonth() &&
        dateObj.getFullYear() === yesterday.getFullYear();

      if (isToday) return 'Today';
      if (isYesterday) return 'Yesterday';

      // Check if within this week
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);

      if (dateObj > weekAgo) {
        return dateObj.toLocaleDateString('en-US', { weekday: 'long' });
      }
    }

    // Absolute format or fallback
    return dateObj.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: dateObj.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
    });
  }

  /**
   * Render date separator
   */
  render(): string {
    const formattedDate = this.formatDate(this.date);

    return `
      <div class="chat-date-separator ${this.className}" style="display: flex; justify-content: center; margin: 1rem 0;">
        <span style="
          font-size: 0.75rem;
          font-weight: 500;
          color: var(--color-text-tertiary, #94a3b8);
          padding: 0.25rem 0.75rem;
          background-color: var(--color-background-light, #f1f5f9);
          border-radius: 9999px;
        ">
          ${formattedDate}
        </span>
      </div>
    `;
  }

  /**
   * Static render method for convenience
   */
  static render(
    date: Date | string,
    config: DateSeparatorConfig = {},
    className: string = ''
  ): string {
    return new DateSeparatorRenderer(date, config, className).render();
  }

  /**
   * Group messages by date
   */
  static groupByDate(messages: Array<{ timestamp: string }>): Map<string, Array<any>> {
    const groups = new Map<string, Array<any>>();

    messages.forEach(message => {
      const date = new Date(message.timestamp);
      const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

      if (!groups.has(dateKey)) {
        groups.set(dateKey, []);
      }
      groups.get(dateKey)!.push(message);
    });

    return groups;
  }

  /**
   * Check if two timestamps are on different days
   */
  static isDifferentDay(timestamp1: string, timestamp2: string): boolean {
    const date1 = new Date(timestamp1);
    const date2 = new Date(timestamp2);

    return (
      date1.getDate() !== date2.getDate() ||
      date1.getMonth() !== date2.getMonth() ||
      date1.getFullYear() !== date2.getFullYear()
    );
  }
}
