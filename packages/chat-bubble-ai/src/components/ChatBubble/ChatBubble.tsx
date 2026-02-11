/**
 * ChatBubble - main component
 * Orchestrates the display of messages, header, input, and handles theming.
 */

import React, { useEffect, useRef } from 'react';
import type {
    ChatBubbleConfig,
    ChatTheme,
} from './ChatBubble.types';
import { defaultTheme } from './ChatBubble.types';
import { useChatBubble } from './useChatBubble';
import { ChatHeader } from './components/ChatHeader';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { TypingIndicator } from './components/TypingIndicator';
import { DateSeparator } from './components/DateSeparator';

interface ChatBubbleComponentProps {
    config: ChatBubbleConfig;
}

/**
 * Internal ChatBubble component that must be rendered inside a ChatBubbleProvider.
 */
export const ChatBubbleComponent: React.FC<ChatBubbleComponentProps> = ({ config }) => {
    const {
        theme,
        header,
        input,
        dateSeparator,
        maxWidth = '100%',
        height = '100vh',
        className = '',
        darkMode = true,
    } = config;

    // Get messages from ChatBubbleContext
    const { messages, isTyping } = useChatBubble();

    // Ref for auto-scrolling
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Merge theme with defaults
    const mergedTheme: ChatTheme = {
        ...defaultTheme,
        ...theme,
        backgrounds: { ...defaultTheme.backgrounds, ...theme?.backgrounds },
        colors: { ...defaultTheme.colors, ...theme?.colors },
        text: { ...defaultTheme.text, ...theme?.text },
        borders: { ...defaultTheme.borders, ...theme?.borders },
        messageBubbles: {
            assistant: {
                ...defaultTheme.messageBubbles.assistant,
                ...theme?.messageBubbles?.assistant,
            },
            user: {
                ...defaultTheme.messageBubbles.user,
                ...theme?.messageBubbles?.user,
            },
        },
        fonts: {
            ...defaultTheme.fonts,
            ...theme?.fonts,
            sizes: { ...defaultTheme.fonts.sizes, ...theme?.fonts?.sizes },
        },
    };

    // Apply dark mode class to container
    useEffect(() => {
        const container = document.getElementById('chat-bubble-container');
        if (container) {
            if (darkMode) {
                container.classList.add('dark');
            } else {
                container.classList.remove('dark');
            }
        }
    }, [darkMode]);

    // Auto-scroll to latest message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    // Group messages by date
    const groupMessagesByDate = () => {
        const grouped: { [key: string]: typeof messages } = {};

        messages.forEach((message) => {
            const date = new Date(message.timestamp);
            const dateKey = date.toDateString();

            if (!grouped[dateKey]) {
                grouped[dateKey] = [];
            }
            grouped[dateKey].push(message);
        });

        return grouped;
    };

    const groupedMessages = groupMessagesByDate();

    return (
        <div
            id="chat-bubble-container"
            className={`flex flex-col overflow-hidden ${darkMode ? 'dark' : ''} ${className}`}
            style={
                {
                    maxWidth,
                    height,
                    fontFamily: mergedTheme.fonts.family,
                    '--color-primary': mergedTheme.colors.primary,
                    '--color-primary-hover':
                        mergedTheme.colors.primaryHover || mergedTheme.colors.primary,
                } as React.CSSProperties
            }
        >
            {/* Header */}
            {header && <ChatHeader config={header} />}

            {/* Main Chat Area */}
            <main className="flex-1 overflow-y-auto px-4 sm:px-10 py-6 scroll-smooth bg-background-light dark:bg-background-dark">
                <div className="max-w-[800px] mx-auto flex flex-col gap-6">
                    {Object.entries(groupedMessages).map(([dateKey, dateMessages]) => (
                        <React.Fragment key={dateKey}>
                            {/* Date Separator */}
                            <DateSeparator date={new Date(dateKey)} config={dateSeparator} />

                            {/* Messages for this date */}
                            {dateMessages.map((message) => (
                                <ChatMessage key={message.id} message={message} />
                            ))}
                        </React.Fragment>
                    ))}

                    {/* Typing Indicator */}
                    {isTyping && (
                        <TypingIndicator
                            config={{
                                show: true,
                            }}
                        />
                    )}

                    {/* Auto-scroll anchor */}
                    <div ref={messagesEndRef} />
                </div>
            </main>

            {/* Input */}
            {input && <ChatInput config={input} />}
        </div>
    );
};
