/**
 * Agent service
 * Handles all AI agent-related API calls
 */

import { storage } from '../utils/storage';
import { processSSEStream } from '../utils/streaming';
import type {
  StreamCallbacks,
} from '../types/agent.types';

export class AgentService {
  constructor() {}

  /**
   * Send a message to the agent with streaming response
   * POST https://ai.grupovdt.com/api/agents/stream/domi
   */
  async sendMessageStream(
    message: string,
    callbacks: StreamCallbacks,
    signal?: AbortSignal
  ): Promise<void> {
    // Get or create conversation ID
    let conversationId = storage.getConversationId();
    if (!conversationId) {
      conversationId = crypto.randomUUID();
      storage.setConversationId(conversationId);
    }

    const requestBody = {
      message,
      conversationId
    };

    const API_KEY = 'dev-test-key-2026';
    const STREAM_URL = 'https://localhost:7133/api/agents/stream/domi';

    try {
      const response = await fetch(STREAM_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY,
        },
        body: JSON.stringify(requestBody),
        signal,
      });

      if (!response.ok) {
        // Try to parse error message
        const contentType = response.headers.get('content-type');
        if (contentType?.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Process the SSE stream
      await processSSEStream(response, callbacks);
    } catch (error) {
      // Don't call error callback if request was aborted
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Stream request aborted');
        return;
      }

      const err = error instanceof Error ? error : new Error('Failed to send message');
      callbacks.onError(err);
      throw err;
    }
  }

  /**
   * Check if user is authenticated before making requests
   */
  isAuthenticated(): boolean {
    // Agent chat no longer requires user authentication
    return true;
  }
}

// Export singleton instance
export const agentService = new AgentService();
