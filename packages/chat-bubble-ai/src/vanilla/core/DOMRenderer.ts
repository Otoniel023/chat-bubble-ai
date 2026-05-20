/**
 * DOMRenderer - Base class for component renderers
 * Provides template-based rendering with efficient updates
 */

import { htmlToElement } from '../utils/templates';
import { clearChildren } from '../utils/dom';

export abstract class DOMRenderer {
  protected element: HTMLElement | null = null;
  protected mounted = false;

  /**
   * Render the component to HTML string
   * Must be implemented by subclasses
   */
  protected abstract render(): string;

  /**
   * Create or update the element
   */
  createElement(): HTMLElement {
    const html = this.render();
    this.element = htmlToElement(html);
    return this.element;
  }

  /**
   * Get the current element
   */
  getElement(): HTMLElement | null {
    return this.element;
  }

  /**
   * Mount the component to a parent element
   */
  mount(parent: HTMLElement): void {
    if (this.mounted) {
      console.warn('DOMRenderer: Component already mounted');
      return;
    }

    const element = this.createElement();
    parent.appendChild(element);
    this.mounted = true;
    this.onMount();
  }

  /**
   * Unmount the component from its parent
   */
  unmount(): void {
    if (!this.mounted || !this.element) {
      return;
    }

    this.onUnmount();
    this.element.remove();
    this.element = null;
    this.mounted = false;
  }

  /**
   * Update the component in place
   */
  update(): void {
    if (!this.mounted || !this.element) {
      console.warn('DOMRenderer: Cannot update unmounted component');
      return;
    }

    const parent = this.element.parentElement;
    if (!parent) {
      console.warn('DOMRenderer: Element has no parent');
      return;
    }

    // Store scroll position if applicable
    const scrollTop = this.element.scrollTop;

    // Replace element
    const newElement = this.createElement();
    parent.replaceChild(newElement, this.element);

    // Restore scroll position
    if (scrollTop > 0) {
      newElement.scrollTop = scrollTop;
    }

    this.onUpdate();
  }

  /**
   * Update inner HTML of the element
   * More efficient than full update if structure is the same
   */
  updateInnerHTML(html: string): void {
    if (!this.element) {
      console.warn('DOMRenderer: No element to update');
      return;
    }

    this.element.innerHTML = html;
  }

  /**
   * Replace children of the element
   */
  replaceChildren(...children: (HTMLElement | string)[]): void {
    if (!this.element) {
      console.warn('DOMRenderer: No element to update');
      return;
    }

    clearChildren(this.element);
    children.forEach(child => {
      if (typeof child === 'string') {
        this.element!.appendChild(document.createTextNode(child));
      } else {
        this.element!.appendChild(child);
      }
    });
  }

  /**
   * Hook called after mount
   */
  protected onMount(): void {
    // Override in subclasses if needed
  }

  /**
   * Hook called before unmount
   */
  protected onUnmount(): void {
    // Override in subclasses if needed
  }

  /**
   * Hook called after update
   */
  protected onUpdate(): void {
    // Override in subclasses if needed
  }

  /**
   * Check if component is mounted
   */
  isMounted(): boolean {
    return this.mounted;
  }

  /**
   * Destroy and cleanup
   */
  destroy(): void {
    this.unmount();
  }
}

/**
 * Batch multiple DOM updates
 */
export function batchUpdates(fn: () => void): void {
  requestAnimationFrame(() => {
    fn();
  });
}

/**
 * Simple virtual DOM-like diffing for lists
 * Returns operations to transform old list to new list
 */
export interface ListDiff<T> {
  added: T[];
  removed: T[];
  unchanged: T[];
}

export function diffList<T>(
  oldList: T[],
  newList: T[],
  keyFn: (item: T) => string
): ListDiff<T> {
  const oldKeys = new Set(oldList.map(keyFn));
  const newKeys = new Set(newList.map(keyFn));

  const added: T[] = [];
  const removed: T[] = [];
  const unchanged: T[] = [];

  newList.forEach(item => {
    const key = keyFn(item);
    if (oldKeys.has(key)) {
      unchanged.push(item);
    } else {
      added.push(item);
    }
  });

  oldList.forEach(item => {
    const key = keyFn(item);
    if (!newKeys.has(key)) {
      removed.push(item);
    }
  });

  return { added, removed, unchanged };
}
