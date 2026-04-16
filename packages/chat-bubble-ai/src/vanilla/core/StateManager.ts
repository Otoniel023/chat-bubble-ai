/**
 * StateManager - Manages chat state and emits events on changes
 * Extends EventEmitter to provide reactive updates
 */

import { EventEmitter } from './EventEmitter';
import type { ChatMessage } from '../../components/ChatBubble/ChatBubble.types';

export interface ChatState {
  messages: ChatMessage[];
  isTyping: boolean;
  isLoading: boolean;
  error: string | null;
}

/**
 * Events emitted by StateManager:
 * - 'messages:changed': Emitted when messages array changes
 * - 'typing:changed': Emitted when typing status changes
 * - 'loading:changed': Emitted when loading status changes
 * - 'error:changed': Emitted when error state changes
 * - 'state:changed': Emitted on any state change
 */
export class StateManager extends EventEmitter {
  private state: ChatState;

  constructor(initialMessages: ChatMessage[] = []) {
    super();
    this.state = {
      messages: initialMessages,
      isTyping: false,
      isLoading: false,
      error: null,
    };
  }

  /**
   * Get current state (immutable)
   */
  getState(): Readonly<ChatState> {
    return { ...this.state };
  }

  /**
   * Get messages array
   */
  getMessages(): ChatMessage[] {
    return [...this.state.messages];
  }

  /**
   * Add a new message
   */
  addMessage(message: ChatMessage): void {
    this.state.messages = [...this.state.messages, message];
    this.emit('messages:changed', this.state.messages);
    this.emit('state:changed', this.state);
  }

  /**
   * Update an existing message by id
   */
  updateMessage(id: string, updates: Partial<ChatMessage>): void {
    const index = this.state.messages.findIndex(msg => msg.id === id);
    if (index === -1) {
      console.warn(`StateManager: Message with id "${id}" not found`);
      return;
    }

    const updatedMessage = { ...this.state.messages[index], ...updates };
    this.state.messages = [
      ...this.state.messages.slice(0, index),
      updatedMessage,
      ...this.state.messages.slice(index + 1),
    ];

    this.emit('messages:changed', this.state.messages);
    this.emit('state:changed', this.state);
  }

  /**
   * Clear all messages
   */
  clearMessages(): void {
    this.state.messages = [];
    this.emit('messages:changed', this.state.messages);
    this.emit('state:changed', this.state);
  }

  /**
   * Set typing indicator status
   */
  setTyping(isTyping: boolean): void {
    if (this.state.isTyping === isTyping) return;
    this.state.isTyping = isTyping;
    this.emit('typing:changed', isTyping);
    this.emit('state:changed', this.state);
  }

  /**
   * Get typing status
   */
  getIsTyping(): boolean {
    return this.state.isTyping;
  }

  /**
   * Set loading status
   */
  setLoading(isLoading: boolean): void {
    if (this.state.isLoading === isLoading) return;
    this.state.isLoading = isLoading;
    this.emit('loading:changed', isLoading);
    this.emit('state:changed', this.state);
  }

  /**
   * Get loading status
   */
  getIsLoading(): boolean {
    return this.state.isLoading;
  }

  /**
   * Set error message
   */
  setError(error: string | null): void {
    if (this.state.error === error) return;
    this.state.error = error;
    this.emit('error:changed', error);
    this.emit('state:changed', this.state);
  }

  /**
   * Get error message
   */
  getError(): string | null {
    return this.state.error;
  }

  /**
   * Clear error
   */
  clearError(): void {
    this.setError(null);
  }

  /**
   * Reset to initial state
   */
  reset(): void {
    this.state = {
      messages: [],
      isTyping: false,
      isLoading: false,
      error: null,
    };
    this.emit('messages:changed', this.state.messages);
    this.emit('typing:changed', this.state.isTyping);
    this.emit('loading:changed', this.state.isLoading);
    this.emit('error:changed', this.state.error);
    this.emit('state:changed', this.state);
  }

  /**
   * Destroy and cleanup
   */
  destroy(): void {
    this.removeAllListeners();
    this.state.messages = [];
  }
}
