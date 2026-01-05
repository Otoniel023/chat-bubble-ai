/**
 * Agent service
 * Handles all AI agent-related API calls
 */

import { API_BASE_URL } from '../utils/api';
import { storage } from '../utils/storage';
import { processSSEStream } from '../utils/streaming';
import type {
  AgentStreamRequest,
  StreamCallbacks,
} from '../types/agent.types';

export class AgentService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * Get authorization headers with JWT token
   */
  private getAuthHeaders(): HeadersInit {
    const token = storage.getAccessToken();

    if (!token) {
      throw new Error('Not authenticated. Please login first.');
    }

    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  /**
   * Send a message to the agent with streaming response
   * POST /agents/run-stream
   */
  async sendMessageStream(
    message: string,
    callbacks: StreamCallbacks,
    signal?: AbortSignal
  ): Promise<void> {
    const requestBody: AgentStreamRequest = { message };

    try {
      const response = await fetch(`${this.baseUrl}/agents/run-stream`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
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
    return !!storage.getAccessToken();
  }
}

// Export singleton instance
export const agentService = new AgentService(API_BASE_URL);
