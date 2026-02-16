/**
 * Agent service
 * Handles all AI agent-related API calls
 */


import { processSSEStream } from '../utils/streaming';
import type {
  StreamCallbacks,
} from '../types/agent.types';

export class AgentService {
  private conversationId: string | null = null;

  private apiKey: string = '';
  private streamUrl: string = '';

  constructor() {}

  /**
   * Configure the agent service with custom URL and token
   */
  configure(url?: string, token?: string) {
    if (url) this.streamUrl = url;
    if (token) this.apiKey = token;
  }

  /**
   * Send a message to the agent with streaming response
   * POST https://ai.grupovdt.com/api/agents/stream/domi
   */
  async sendMessageStream(
    message: string,
    callbacks: StreamCallbacks,
    signal?: AbortSignal
  ): Promise<void> {
    // Get or create conversation ID for this session
    if (!this.conversationId) {
      this.conversationId = crypto.randomUUID();
    }

    const requestBody = {
      message,
      conversationId: this.conversationId
    };

    const API_KEY = this.apiKey;
    const STREAM_URL = this.streamUrl;

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
