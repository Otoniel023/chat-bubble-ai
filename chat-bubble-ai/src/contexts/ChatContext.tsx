/**
 * Chat Context
 * Manages chat messages and agent interactions
 */

import React, { createContext, useState, useCallback } from 'react';
import { agentService } from '../services/agent.service';
import { createStreamController } from '../utils/streaming';
import type { Message } from '../types/chat.types';

export interface ChatContextValue {
  messages: Message[];
  isTyping: boolean;
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
  clearError: () => void;
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined);

interface ChatProviderProps {
  children: React.ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    // Check authentication
    if (!agentService.isAuthenticated()) {
      setError('Please login to send messages');
      return;
    }

    setIsLoading(true);
    setError(null);

    // Generate unique IDs
    const userMessageId = `user-${Date.now()}`;
    const assistantMessageId = `assistant-${Date.now() + 1}`;

    // Add user message
    const userMessage: Message = {
      id: userMessageId,
      sender: 'user',
      content,
      timestamp: new Date(),
      status: 'sent',
    };

    setMessages((prev) => [...prev, userMessage]);

    // Create placeholder for assistant message
    const assistantMessage: Message = {
      id: assistantMessageId,
      sender: 'assistant',
      content: '',
      timestamp: new Date(),
      status: 'streaming',
    };

    setMessages((prev) => [...prev, assistantMessage]);
    setIsTyping(true);

    // Create abort controller for cancellation
    const { signal } = createStreamController();

    try {
      let accumulatedContent = '';

      await agentService.sendMessageStream(
        content,
        {
          onChunk: (chunk: string) => {
            // Accumulate content
            accumulatedContent += chunk;

            // Update assistant message with accumulated content
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantMessageId
                  ? { ...msg, content: accumulatedContent, status: 'streaming' }
                  : msg
              )
            );
          },
          onComplete: () => {
            // Mark message as sent
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantMessageId
                  ? { ...msg, status: 'sent' }
                  : msg
              )
            );
            setIsTyping(false);
            setIsLoading(false);
          },
          onError: (err: Error) => {
            console.error('Stream error:', err);
            setError(err.message);

            // Mark message as error
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantMessageId
                  ? {
                      ...msg,
                      status: 'error',
                      error: err.message,
                      content: accumulatedContent || 'Failed to receive response',
                    }
                  : msg
              )
            );
            setIsTyping(false);
            setIsLoading(false);
          },
        },
        signal
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMessage);
      setIsTyping(false);
      setIsLoading(false);
    }
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
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

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export { ChatContext };
