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
import { createStreamController } from '../../utils/streaming';
import { agentService } from '../../services/agent.service';

export const ChatBubbleContext = createContext<ChatContextValue | undefined>(undefined);

interface ChatBubbleProviderProps {
    children: React.ReactNode;
    agentId?: string;
}

export const ChatBubbleProvider: React.FC<ChatBubbleProviderProps> = ({
    children,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
        // Create abort controller for this request
        const streamCtrl = createStreamController();
        abortControllerRef.current = streamCtrl;

        try {
            await agentService.sendMessageStream(
                message,
                { onChunk, onComplete, onError },
                streamCtrl.signal
            );
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
        []
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
