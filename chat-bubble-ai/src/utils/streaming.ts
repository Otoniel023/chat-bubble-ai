/**
 * Server-Sent Events (SSE) streaming utilities
 */

import type { StreamCallbacks } from '../types/agent.types';

/**
 * Process SSE stream from fetch response
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
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        callbacks.onComplete();
        break;
      }

      // Decode chunk and add to buffer
      buffer += decoder.decode(value, { stream: true });

      // Process complete lines from buffer
      const lines = buffer.split('\n');

      // Keep the last incomplete line in the buffer
      buffer = lines.pop() || '';

      for (const line of lines) {
        // Skip empty lines
        if (!line.trim()) continue;

        // Parse SSE format: "data: <content>"
        if (line.startsWith('data: ')) {
          const data = line.substring(6); // Remove "data: " prefix

          // Check for stream completion signal
          if (data === '[DONE]') {
            callbacks.onComplete();
            return;
          }

          // Send chunk to callback
          callbacks.onChunk(data);
        }
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
