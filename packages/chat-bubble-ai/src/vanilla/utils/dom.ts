/**
 * DOM utility functions for vanilla implementation
 */

/**
 * Create an element with classes and attributes
 */
export function createElement<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  options?: {
    classes?: string[];
    attributes?: Record<string, string>;
    dataset?: Record<string, string>;
    style?: Partial<CSSStyleDeclaration>;
    innerHTML?: string;
    textContent?: string;
  }
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag);

  if (options?.classes) {
    element.classList.add(...options.classes);
  }

  if (options?.attributes) {
    Object.entries(options.attributes).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });
  }

  if (options?.dataset) {
    Object.entries(options.dataset).forEach(([key, value]) => {
      element.dataset[key] = value;
    });
  }

  if (options?.style) {
    Object.assign(element.style, options.style);
  }

  if (options?.innerHTML !== undefined) {
    element.innerHTML = options.innerHTML;
  }

  if (options?.textContent !== undefined) {
    element.textContent = options.textContent;
  }

  return element;
}

/**
 * Query selector with type safety
 */
export function qs<T extends Element = Element>(
  selector: string,
  parent: Element | Document = document
): T | null {
  return parent.querySelector<T>(selector);
}

/**
 * Query selector all with type safety
 */
export function qsa<T extends Element = Element>(
  selector: string,
  parent: Element | Document = document
): T[] {
  return Array.from(parent.querySelectorAll<T>(selector));
}

/**
 * Add event listener with cleanup function
 */
export function on<K extends keyof HTMLElementEventMap>(
  element: HTMLElement | Window | Document,
  event: K,
  handler: (event: HTMLElementEventMap[K]) => void,
  options?: boolean | AddEventListenerOptions
): () => void {
  element.addEventListener(event as string, handler as EventListener, options);
  return () => element.removeEventListener(event as string, handler as EventListener, options);
}

/**
 * Remove all children from an element
 */
export function clearChildren(element: HTMLElement): void {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

/**
 * Append multiple children to an element
 */
export function appendChildren(parent: HTMLElement, children: (HTMLElement | string)[]): void {
  children.forEach(child => {
    if (typeof child === 'string') {
      parent.appendChild(document.createTextNode(child));
    } else {
      parent.appendChild(child);
    }
  });
}

/**
 * Get scroll parent of an element
 */
export function getScrollParent(element: HTMLElement): HTMLElement {
  let parent = element.parentElement;

  while (parent) {
    const overflowY = window.getComputedStyle(parent).overflowY;
    if (overflowY === 'auto' || overflowY === 'scroll') {
      return parent;
    }
    parent = parent.parentElement;
  }

  return document.documentElement as HTMLElement;
}

/**
 * Scroll element to bottom smoothly
 */
export function scrollToBottom(element: HTMLElement, smooth = true): void {
  element.scrollTo({
    top: element.scrollHeight,
    behavior: smooth ? 'smooth' : 'auto',
  });
}

/**
 * Check if element is scrolled to bottom
 */
export function isScrolledToBottom(element: HTMLElement, threshold = 50): boolean {
  const scrollTop = element.scrollTop;
  const scrollHeight = element.scrollHeight;
  const clientHeight = element.clientHeight;

  return scrollHeight - scrollTop - clientHeight < threshold;
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: number | undefined;

  return (...args: Parameters<T>) => {
    if (timeoutId !== undefined) {
      window.clearTimeout(timeoutId);
    }

    timeoutId = window.setTimeout(() => {
      fn(...args);
    }, delay);
  };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: any[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;

  return (...args: Parameters<T>) => {
    const now = Date.now();

    if (now - lastCall >= delay) {
      lastCall = now;
      fn(...args);
    }
  };
}
