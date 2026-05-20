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
import { agentService } from '../../services/agent.service';
import { ChatHeader } from './components/ChatHeader';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { TypingIndicator } from './components/TypingIndicator';
import { DateSeparator } from './components/DateSeparator';
import { SuggestedReplies } from './components/SuggestedReplies';

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
        height = '100dvh',
        className = '',
        style = {},
        darkMode = true,
        url,
        token,
    } = config;

    // Configure agent service
    useEffect(() => {
        if (url || token) {
            agentService.configure(url, token);
        }
    }, [url, token]);

    // Get messages from ChatBubbleContext
    const { messages, isTyping } = useChatBubble();

    // Ref for auto-scrolling
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const lastAssistantRef = useRef<HTMLDivElement>(null);
    const wasTypingRef = useRef(false);

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
        cssVariables: {
            ...defaultTheme.cssVariables,
            ...theme?.cssVariables,
        },
    };

    // Build CSS variables object for inline styles
    const buildCssVariables = (): React.CSSProperties => {
        const vars: Record<string, string> = {};

        if (mergedTheme.cssVariables) {
            const { cssVariables } = mergedTheme;

            // Map camelCase to kebab-case CSS variables
            if (cssVariables.colorPrimary) vars['--color-primary'] = cssVariables.colorPrimary;
            if (cssVariables.colorPrimaryHover) vars['--color-primary-hover'] = cssVariables.colorPrimaryHover;
            if (cssVariables.colorBackgroundLight) vars['--color-background-light'] = cssVariables.colorBackgroundLight;
            if (cssVariables.colorBackgroundDark) vars['--color-background-dark'] = cssVariables.colorBackgroundDark;
            if (cssVariables.colorSurfaceLight) vars['--color-surface-light'] = cssVariables.colorSurfaceLight;
            if (cssVariables.colorSurfaceDark) vars['--color-surface-dark'] = cssVariables.colorSurfaceDark;
            if (cssVariables.colorBorderLight) vars['--color-border-light'] = cssVariables.colorBorderLight;
            if (cssVariables.colorBorderDark) vars['--color-border-dark'] = cssVariables.colorBorderDark;
            if (cssVariables.colorTextSecondary) vars['--color-text-secondary'] = cssVariables.colorTextSecondary;
            if (cssVariables.colorTextTertiary) vars['--color-text-tertiary'] = cssVariables.colorTextTertiary;
            if (cssVariables.fontSans) vars['--font-sans'] = cssVariables.fontSans;
            if (cssVariables.animateBounce) vars['--animate-bounce'] = cssVariables.animateBounce;
        }

        // Backgrounds
        if (mergedTheme.backgrounds?.chat) {
            vars['--chat-background'] = mergedTheme.backgrounds.chat.startsWith('http')
                ? `url(${mergedTheme.backgrounds.chat})`
                : mergedTheme.backgrounds.chat;
        }

        // Message Opacity
        if (mergedTheme.messageBubbles?.assistant?.opacity !== undefined) {
            vars['--message-assistant-opacity'] = mergedTheme.messageBubbles.assistant.opacity.toString();
        }
        if (mergedTheme.messageBubbles?.user?.opacity !== undefined) {
            vars['--message-user-opacity'] = mergedTheme.messageBubbles.user.opacity.toString();
        }

        // Message Backgrounds
        if (mergedTheme.messageBubbles?.assistant?.background) {
            vars['--message-assistant-bg'] = mergedTheme.messageBubbles.assistant.background;
        }
        if (mergedTheme.messageBubbles?.user?.background) {
            vars['--message-user-bg'] = mergedTheme.messageBubbles.user.background;
        }

        // Message Text Colors
        if (mergedTheme.messageBubbles?.assistant?.textColor) {
            vars['--message-assistant-text'] = mergedTheme.messageBubbles.assistant.textColor;
        }
        if (mergedTheme.messageBubbles?.user?.textColor) {
            vars['--message-user-text'] = mergedTheme.messageBubbles.user.textColor;
        }

        // Message Font Weight
        const getFontWeight = (weight?: 'base' | 'semi-bold' | 'bold') => {
            switch (weight) {
                case 'base': return '400';
                case 'semi-bold': return '600';
                case 'bold': return '700';
                default: return undefined;
            }
        };

        const assistantFontWeight = getFontWeight(mergedTheme.messageBubbles?.assistant?.fontWeight);
        if (assistantFontWeight) {
            vars['--message-assistant-font-weight'] = assistantFontWeight;
        }

        const userFontWeight = getFontWeight(mergedTheme.messageBubbles?.user?.fontWeight);
        if (userFontWeight) {
            vars['--message-user-font-weight'] = userFontWeight;
        }

        // Backward compatibility: support old color properties
        if (mergedTheme.colors.primary && !mergedTheme.cssVariables?.colorPrimary) {
            vars['--color-primary'] = mergedTheme.colors.primary;
        }
        if (mergedTheme.colors.primaryHover && !mergedTheme.cssVariables?.colorPrimaryHover) {
            vars['--color-primary-hover'] = mergedTheme.colors.primaryHover;
        }

        return vars as React.CSSProperties;
    };

    // Auto-scroll: follow bottom while streaming, jump to top of response when done
    useEffect(() => {
        if (isTyping) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            wasTypingRef.current = true;
        } else if (wasTypingRef.current) {
            // Agent just finished — scroll to the start of the response so user reads top-down
            lastAssistantRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            wasTypingRef.current = false;
        }
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

    // ID of the last assistant message — used to scroll its top into view when done
    const lastAssistantId = [...messages].reverse().find((m) => m.role === 'assistant')?.id ?? null;

    // Helper to get theme value
    const getThemeVar = (lightVar: string, darkVar: string) => {
        return darkMode ? `var(${darkVar})` : `var(${lightVar})`;
    };

    return (
        <div
            id="chat-bubble-container"
            className={className} // Keep className for user override if needed
            style={{
                display: 'flex',
                flexDirection: 'column',
                overflow: 'visible',
                position: 'relative',
                maxWidth,
                height,
                fontFamily: mergedTheme.fonts.family,
                ...buildCssVariables(),
                ...style,
            }}
        >
            {/* Header */}
            {header && <ChatHeader config={header} />}

            {/* Main Chat Area */}
            <main
                style={{
                    flex: 1,
                    overflowY: 'auto',
                    paddingLeft: '1rem',
                    paddingRight: '1rem',
                    paddingTop: '1.5rem',
                    paddingBottom: '1.5rem',
                    scrollBehavior: 'smooth',
                    backgroundColor: getThemeVar('--color-background-light', '--color-background-dark'),
                    backgroundImage: 'var(--chat-background)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                }}
            >
                <div style={{
                    maxWidth: '800px',
                    marginLeft: 'auto',
                    marginRight: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.5rem',
                }}>
                    {Object.entries(groupedMessages).map(([dateKey, dateMessages]) => (
                        <React.Fragment key={dateKey}>
                            {/* Date Separator */}
                            <DateSeparator date={new Date(dateKey)} config={dateSeparator} />

                            {/* Messages for this date */}
                            {dateMessages.map((message) => (
                                <div
                                    key={message.id}
                                    ref={message.id === lastAssistantId ? lastAssistantRef : null}
                                >
                                    <ChatMessage message={message} />
                                </div>
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
            {/* Suggested replies — shown between messages and input when available */}
            <SuggestedReplies />

            {input && <ChatInput config={input} />}

        </div>
    );
};

