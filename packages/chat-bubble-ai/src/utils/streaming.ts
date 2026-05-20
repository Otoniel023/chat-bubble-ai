/**
 * Server-Sent Events (SSE) streaming utilities
 */

import type { StreamCallbacks } from '../types/agent.types';

/**
 * Process SSE stream from fetch response.
 *
 * Handles named events (event: + data:) and default message events (data: only).
 * Supported named events:
 *   - event: thinking  → ignored (future use)
 *   - event: carousel  → calls callbacks.onCarousel with parsed image array
 * Special data values:
 *   - [DONE]      → calls onComplete and stops
 *   - [CANCELLED] → calls onComplete and stops
 */
export async function processSSEStream(
  response: Response,
  callbacks: StreamCallbacks
): Promise<void> {
  if (!response.body) {
    throw new Error('Response body is null');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let rawBuffer = '';

  // Current SSE event fields (reset on empty line)
  let currentEvent = '';
  let currentData = '';

  /**
   * Dispatch the buffered SSE event. Returns true if the stream should stop.
   */
  const dispatch = (): boolean => {
    if (!currentData) {
      currentEvent = '';
      return false;
    }

    if (currentEvent === 'carousel') {
      try {
        const parsed = JSON.parse(currentData) as { type?: string; images?: unknown };
        if (Array.isArray(parsed.images) && parsed.images.length > 0) {
          callbacks.onCarousel?.(parsed.images as string[]);
        }
      } catch { /* malformed JSON — ignore */ }
    } else if (currentEvent === 'suggestions') {
      try {
        const parsed = JSON.parse(currentData) as { type?: string; items?: unknown };
        if (Array.isArray(parsed.items) && parsed.items.length > 0) {
          callbacks.onSuggestions?.(parsed.items as string[]);
        }
      } catch { /* malformed JSON — ignore */ }
    } else if (currentEvent !== 'thinking') {
      // Default message event
      if (currentData === '[DONE]' || currentData === '[CANCELLED]') {
        callbacks.onComplete();
        currentEvent = '';
        currentData = '';
        return true;
      }

      if (currentData.startsWith('{"error":')) {
        try {
          const errorData = JSON.parse(currentData) as { error?: string };
          callbacks.onError(new Error(errorData.error || 'Unknown error'));
          currentEvent = '';
          currentData = '';
          return true;
        } catch { /* not valid JSON — treat as regular chunk */ }
      }

      callbacks.onChunk(currentData);
    }

    currentEvent = '';
    currentData = '';
    return false;
  };

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        callbacks.onComplete();
        break;
      }

      rawBuffer += decoder.decode(value, { stream: true });

      const lines = rawBuffer.split('\n');
      rawBuffer = lines.pop() ?? '';

      for (const line of lines) {
        if (line === '' || line === '\r') {
          // Empty line = end of SSE event block
          if (dispatch()) return;
        } else if (line.startsWith('event: ')) {
          currentEvent = line.substring(7).trim();
        } else if (line.startsWith('data: ')) {
          currentData = line.substring(6);
        }
        // Other fields (id:, retry:, comments) are intentionally ignored
      }
    }
  } catch (error) {
    const err = error instanceof Error ? error : new Error('Stream processing failed');
    callbacks.onError(err);
  } finally {
    reader.releaseLock();
  }
}

/**
 * Create an AbortController for canceling streams
 */
export function createStreamController(): {
  controller: AbortController;
  signal: AbortSignal;
  abort: () => void;
} {
  const controller = new AbortController();

  return {
    controller,
    signal: controller.signal,
    abort: () => controller.abort(),
  };
}
