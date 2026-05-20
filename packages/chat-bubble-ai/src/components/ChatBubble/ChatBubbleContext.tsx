/**
 * ChatBubbleContext
 * Manages chat messages, typing status, loading, errors, and suggested replies.
 */

import React, { createContext, useState, useCallback, useRef, useEffect } from 'react';
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
    apiErrorMessage?: string;
    /** Initial greeting message shown by the assistant when the chat first loads */
    initialMessage?: string;
}

export const ChatBubbleProvider: React.FC<ChatBubbleProviderProps> = ({
    children,
    // agentId,
    apiErrorMessage,
    initialMessage,
}) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const abortControllerRef = useRef<{ abort: () => void } | null>(null);
    const initialMessageInjected = useRef(false);

    // Inject initial assistant message, and update it when the language changes
    useEffect(() => {
        if (!initialMessage) return;

        if (!initialMessageInjected.current) {
            // First mount: inject the message
            initialMessageInjected.current = true;
            setMessages([
                {
                    id: 'initial-msg',
                    content: initialMessage,
                    role: 'assistant',
                    timestamp: new Date().toISOString(),
                    status: 'sent',
                },
            ]);
        } else {
            // Language changed: replace the existing initial message in-place
            setMessages((prev) =>
                prev.map((m) =>
                    m.id === 'initial-msg' ? { ...m, content: initialMessage } : m
                )
            );
        }
    }, [initialMessage]);

    const sendMessageStreamInternal = async (
        message: string,
        onChunk: (chunk: string) => void,
        onComplete: () => void,
        onError: (err: Error) => void,
        onCarousel?: (images: string[]) => void,
        onSuggestions?: (items: string[]) => void,
    ): Promise<void> => {
        const streamCtrl = createStreamController();
        abortControllerRef.current = streamCtrl;

        try {
            await agentService.sendMessageStream(
                message,
                { onChunk, onComplete, onError, onCarousel, onSuggestions },
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

    const sendMessage = useCallback(
        async (content: string) => {
            if (!content.trim()) return;

            setError(null);
            setSuggestions([]);

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

            const assistantMessageId = `msg-${Date.now() + 1}`;
            let fullContent = '';

            try {
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
                    // onComplete — also detects inline carousel/suggestions JSON
                    () => {
                        setMessages((prev) =>
                            prev.map((m) => {
                                if (m.id !== assistantMessageId) return m;

                                let text = fullContent;
                                let messageUpdates: Partial<ChatMessage> = { status: 'sent' as const };

                                // Detect inline carousel JSON
                                const carouselMatch = text.match(/\{"type":"carousel","images":\[[\s\S]*?\]\}/);
                                if (carouselMatch) {
                                    try {
                                        const parsed = JSON.parse(carouselMatch[0]) as { type: string; images?: string[] };
                                        if (parsed.type === 'carousel' && Array.isArray(parsed.images) && parsed.images.length > 0) {
                                            text = text.replace(carouselMatch[0], '').trim();
                                            messageUpdates = { ...messageUpdates, type: 'carousel' as const, images: parsed.images };
                                        }
                                    } catch { /* treat as plain text */ }
                                }

                                // Detect inline suggestions JSON
                                const suggestionsMatch = text.match(/\{"type":"suggestions","items":\[[\s\S]*?\]\}/);
                                if (suggestionsMatch) {
                                    try {
                                        const parsed = JSON.parse(suggestionsMatch[0]) as { type: string; items?: string[] };
                                        if (parsed.type === 'suggestions' && Array.isArray(parsed.items) && parsed.items.length > 0) {
                                            text = text.replace(suggestionsMatch[0], '').trim();
                                            setSuggestions(parsed.items);
                                        }
                                    } catch { /* treat as plain text */ }
                                }

                                return { ...m, ...messageUpdates, content: text };
                            })
                        );
                        setIsTyping(false);
                        setIsLoading(false);
                    },
                    // onError
                    (err: Error) => {
                        if (apiErrorMessage) {
                            setMessages((prev) => {
                                const existing = prev.find((m) => m.id === assistantMessageId);
                                if (existing) {
                                    return prev.map((m) =>
                                        m.id === assistantMessageId
                                            ? { ...m, content: apiErrorMessage, status: 'sent' as const }
                                            : m
                                    );
                                }
                                return [
                                    ...prev,
                                    {
                                        id: assistantMessageId,
                                        content: apiErrorMessage,
                                        role: 'assistant' as const,
                                        timestamp: new Date().toISOString(),
                                        status: 'sent' as const,
                                    },
                                ];
                            });
                        } else {
                            setError(err.message || 'Failed to get response');
                        }
                        setIsTyping(false);
                        setIsLoading(false);
                    },
                    // onCarousel — via SSE "event: carousel"
                    (images: string[]) => {
                        setMessages((prev) =>
                            prev.map((m) =>
                                m.id === assistantMessageId
                                    ? { ...m, type: 'carousel' as const, images }
                                    : m
                            )
                        );
                    },
                    // onSuggestions — via SSE "event: suggestions"
                    (items: string[]) => {
                        setSuggestions(items);
                    },
                );
            } catch (err) {
                if (apiErrorMessage) {
                    setMessages((prev) => {
                        const existing = prev.find((m) => m.id === assistantMessageId);
                        if (existing) {
                            return prev.map((m) =>
                                m.id === assistantMessageId
                                    ? { ...m, content: apiErrorMessage, status: 'sent' as const }
                                    : m
                            );
                        }
                        return [
                            ...prev,
                            {
                                id: assistantMessageId,
                                content: apiErrorMessage,
                                role: 'assistant' as const,
                                timestamp: new Date().toISOString(),
                                status: 'sent' as const,
                            },
                        ];
                    });
                } else {
                    const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
                    setError(errorMessage);
                }
                setIsTyping(false);
                setIsLoading(false);
            }
        },
        [apiErrorMessage]
    );

    const clearMessages = useCallback(() => {
        setMessages([]);
    }, []);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    const clearSuggestions = useCallback(() => {
        setSuggestions([]);
    }, []);

    const injectMessage = useCallback((content: string, role: 'assistant' | 'user' = 'assistant') => {
        setMessages((prev) => [
            ...prev,
            {
                id: `injected-${Date.now()}`,
                content,
                role,
                timestamp: new Date().toISOString(),
                status: 'sent' as const,
            },
        ]);
    }, []);

    const value: ChatContextValue = {
        messages,
        isTyping,
        isLoading,
        error,
        suggestions,
        sendMessage,
        clearMessages,
        clearError,
        clearSuggestions,
        injectMessage,
        updateMessages: (newMessages: ChatMessage[]) => setMessages(newMessages),
    };

    return (
        <ChatBubbleContext.Provider value={value}>
            {children}
        </ChatBubbleContext.Provider>
    );
};
