/**
 * ChatBubbleContext
 * Manages chat messages, typing status, loading, and errors.
 * Provides sendMessage, clearMessages, and clearError functions.
 */

import React, { createContext, useState, useCallback, useRef } from 'react';
import type {
    ChatMessage,
    ChatContextValue,
} from './ChatBubble.types';
import { storage } from '../../utils/storage';
import { processSSEStream, createStreamController } from '../../utils/streaming';
import { API_BASE_URL } from '../../utils/api';

export const ChatBubbleContext = createContext<ChatContextValue | undefined>(undefined);

interface ChatBubbleProviderProps {
    children: React.ReactNode;
    agentId?: string;
}

export const ChatBubbleProvider: React.FC<ChatBubbleProviderProps> = ({
    children,
    agentId,
}) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const abortControllerRef = useRef<{ abort: () => void } | null>(null);

    /**
     * Send a message stream to the agent service
     */
    const sendMessageStreamInternal = async (
        message: string,
        onChunk: (chunk: string) => void,
        onComplete: () => void,
        onError: (err: Error) => void,
    ): Promise<void> => {
        const token = storage.getAccessToken();
        if (!token) {
            throw new Error('No access token found. Please login first.');
        }

        // Create abort controller for this request
        const streamCtrl = createStreamController();
        abortControllerRef.current = streamCtrl;

        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/agents/stream`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    message,
                    agent_id: agentId,
                }),
                signal: streamCtrl.signal,
            });

            if (!response.ok) {
                // Handle token refresh if 401
                if (response.status === 401) {
                    const refreshToken = storage.getRefreshToken();
                    if (refreshToken) {
                        try {
                            const refreshResponse = await fetch(
                                `${API_BASE_URL}/auth/refresh`,
                                {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        accessToken: token,
                                        refreshToken,
                                    }),
                                }
                            );

                            if (refreshResponse.ok) {
                                const data = await refreshResponse.json();
                                storage.setAccessToken(data.accessToken);
                                if (data.refreshToken) {
                                    storage.setRefreshToken(data.refreshToken);
                                }
                                // Retry with new token
                                return sendMessageStreamInternal(message, onChunk, onComplete, onError);
                            }
                        } catch {
                            storage.clearAuth();
                            throw new Error('Session expired. Please login again.');
                        }
                    }
                    storage.clearAuth();
                    throw new Error('Authentication failed. Please login again.');
                }
                throw new Error(`API request failed with status ${response.status}`);
            }

            // processSSEStream expects Response and StreamCallbacks with onChunk/onComplete/onError
            await processSSEStream(response, {
                onChunk,
                onComplete,
                onError,
            });
        } catch (err: unknown) {
            if (err instanceof DOMException && err.name === 'AbortError') {
                onComplete();
                return;
            }
            throw err;
        }
    };

    /**
     * Send a message and handle the streaming response
     */
    const sendMessage = useCallback(
        async (content: string) => {
            if (!content.trim()) return;

            // Clear any previous errors
            setError(null);

            // Create user message
            const userMessage: ChatMessage = {
                id: `msg-${Date.now()}`,
                content: content.trim(),
                role: 'user',
                timestamp: new Date().toISOString(),
                status: 'sent',
            };

            setMessages((prev) => [...prev, userMessage]);
            setIsTyping(true);
            setIsLoading(true);

            // Create assistant message placeholder
            const assistantMessageId = `msg-${Date.now() + 1}`;
            let fullContent = '';

            try {
                // Cancel any ongoing stream
                if (abortControllerRef.current) {
                    abortControllerRef.current.abort();
                }

                await sendMessageStreamInternal(
                    content.trim(),
                    // onChunk
                    (chunk: string) => {
                        fullContent += chunk;
                        setMessages((prev) => {
                            const existing = prev.find((m) => m.id === assistantMessageId);
                            if (existing) {
                                return prev.map((m) =>
                                    m.id === assistantMessageId
                                        ? { ...m, content: fullContent }
                                        : m
                                );
                            } else {
                                return [
                                    ...prev,
                                    {
                                        id: assistantMessageId,
                                        content: fullContent,
                                        role: 'assistant' as const,
                                        timestamp: new Date().toISOString(),
                                        status: 'sending' as const,
                                    },
                                ];
                            }
                        });
                    },
                    // onComplete
                    () => {
                        setMessages((prev) =>
                            prev.map((m) =>
                                m.id === assistantMessageId
                                    ? { ...m, status: 'sent' as const }
                                    : m
                            )
                        );
                        setIsTyping(false);
                        setIsLoading(false);
                    },
                    // onError
                    (err: Error) => {
                        setError(err.message || 'Failed to get response');
                        setIsTyping(false);
                        setIsLoading(false);
                    },
                );
            } catch (err) {
                const errorMessage =
                    err instanceof Error ? err.message : 'An unexpected error occurred';
                setError(errorMessage);
                setIsTyping(false);
                setIsLoading(false);
            }
        },
        [agentId]
    );

    const clearMessages = useCallback(() => {
        setMessages([]);
    }, []);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    const value: ChatContextValue = {
        messages,
        isTyping,
        isLoading,
        error,
        sendMessage,
        clearMessages,
        clearError,
    };

    return (
        <ChatBubbleContext.Provider value={value}>
            {children}
        </ChatBubbleContext.Provider>
    );
};
