/**
 * EventEmitter base class for vanilla implementation
 * Provides pub/sub pattern for state changes
 */

type EventCallback = (data: any) => void;

export class EventEmitter {
  private events: Map<string, Set<EventCallback>> = new Map();

  /**
   * Subscribe to an event
   */
  on(event: string, callback: EventCallback): void {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    this.events.get(event)!.add(callback);
  }

  /**
   * Unsubscribe from an event
   */
  off(event: string, callback: EventCallback): void {
    const callbacks = this.events.get(event);
    if (callbacks) {
      callbacks.delete(callback);
      if (callbacks.size === 0) {
        this.events.delete(event);
      }
    }
  }

  /**
   * Subscribe to an event once (auto-unsubscribes after first call)
   */
  once(event: string, callback: EventCallback): void {
    const onceCallback = (data: any) => {
      this.off(event, onceCallback);
      callback(data);
    };
    this.on(event, onceCallback);
  }

  /**
   * Emit an event with data
   */
  emit(event: string, data?: any): void {
    const callbacks = this.events.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event handler for "${event}":`, error);
        }
      });
    }
  }

  /**
   * Remove all event listeners
   */
  removeAllListeners(event?: string): void {
    if (event) {
      this.events.delete(event);
    } else {
      this.events.clear();
    }
  }

  /**
   * Get count of listeners for an event
   */
  listenerCount(event: string): number {
    return this.events.get(event)?.size ?? 0;
  }
}
