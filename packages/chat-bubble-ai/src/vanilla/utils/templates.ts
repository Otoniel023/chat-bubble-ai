/**
 * Template utilities for safe HTML rendering
 */

/**
 * Escape HTML to prevent XSS attacks
 */
export function escapeHtml(str: string): string {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Unescape HTML entities
 */
export function unescapeHtml(str: string): string {
  const div = document.createElement('div');
  div.innerHTML = str;
  return div.textContent || '';
}

/**
 * Tagged template literal for safe HTML
 * Escapes all interpolated values
 */
export function html(strings: TemplateStringsArray, ...values: any[]): string {
  let result = strings[0];

  for (let i = 0; i < values.length; i++) {
    const value = values[i];

    // If value is SafeHTML, don't escape
    if (value && typeof value === 'object' && value.__safe_html) {
      result += value.html;
    }
    // If value is array, join and escape
    else if (Array.isArray(value)) {
      result += value.map(v => (typeof v === 'string' ? escapeHtml(v) : v)).join('');
    }
    // Otherwise escape
    else if (value != null) {
      result += escapeHtml(String(value));
    }

    result += strings[i + 1];
  }

  return result;
}

/**
 * Mark HTML as safe (already escaped)
 * Use with caution - only for trusted content
 */
export function unsafeHtml(html: string): { __safe_html: true; html: string } {
  return { __safe_html: true, html };
}

/**
 * Create element from HTML string
 */
export function htmlToElement<T extends HTMLElement = HTMLElement>(html: string): T {
  const template = document.createElement('template');
  template.innerHTML = html.trim();
  return template.content.firstElementChild as T;
}

/**
 * Create elements from HTML string (multiple root elements)
 */
export function htmlToElements<T extends HTMLElement = HTMLElement>(html: string): T[] {
  const template = document.createElement('template');
  template.innerHTML = html.trim();
  return Array.from(template.content.children) as T[];
}

/**
 * Sanitize user input for display in messages
 * Allows basic formatting but removes scripts and dangerous attributes
 */
export function sanitizeMessage(content: string): string {
  // For now, just escape everything
  // In the future, could allow safe HTML tags like <b>, <i>, <a>
  return escapeHtml(content);
}

/**
 * Convert newlines to <br> tags
 */
export function nl2br(str: string): string {
  return escapeHtml(str).replace(/\n/g, '<br>');
}

/**
 * Truncate text with ellipsis
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength - 3) + '...';
}

/**
 * Strip HTML tags from string
 */
export function stripHtml(html: string): string {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || '';
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Generate unique ID
 */
export function generateId(prefix = 'id'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
