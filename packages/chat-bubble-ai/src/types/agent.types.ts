/**
 * Agent API types based on API documentation
 */

export interface AgentRequest {
  message: string;
}

export interface AgentStreamRequest {
  message: string;
}

export interface AgentImageRequest {
  message: string;
  imageBase64: string;
  imageMimeType: string;
}

export interface AgentResponse {
  message: string;
  success: boolean;
  error: string | null;
}

export interface AgentError {
  error: string;
}

/**
 * Streaming callback for SSE chunks
 */
export type StreamChunkCallback = (chunk: string) => void;

/**
 * Streaming completion callback
 */
export type StreamCompleteCallback = () => void;

/**
 * Streaming error callback
 */
export type StreamErrorCallback = (error: Error) => void;

export interface StreamCallbacks {
  onChunk: StreamChunkCallback;
  onComplete: StreamCompleteCallback;
  onError: StreamErrorCallback;
}
