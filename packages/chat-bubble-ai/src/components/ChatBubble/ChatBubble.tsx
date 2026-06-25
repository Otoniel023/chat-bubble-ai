/**
 * ChatBubble - main component
 * Orchestrates the display of messages, header, input, and handles theming.
 */


import React, { useEffect, useRef, useState } from 'react';
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
import { AnimatedBackground } from './components/AnimatedBackground';

// Caribbean-themed color presets — each overrides CSS variables
const THEME_PRESETS: Record<string, Record<string, string>> = {
    amanecer: {
        '--color-primary':           '#f97316',
        '--color-primary-hover':     '#ea6c10',
        '--color-background-light':  '#fff7ed',
        '--color-background-dark':   '#7c2d12',
        '--color-surface-light':     '#fffbf5',
        '--color-surface-dark':      '#9a3412',
        '--color-border-light':      '#fed7aa',
        '--color-border-dark':       '#c2521a',
        '--color-text-primary':      '#7c2d12',
        '--color-text-secondary':    '#c2410c',
        '--color-text-tertiary':     '#ea580c',
        '--message-assistant-bg':    '#fff7ed',
        '--message-assistant-text':  '#7c2d12',
        '--message-user-bg':         '#f97316',
        '--message-user-text':       '#ffffff',
        '--chat-background':         'linear-gradient(180deg, #fed7aa 0%, #fdba74 55%, #fb923c 100%)',
    },
    noche: {
        '--color-primary':           '#00b4d8',
        '--color-primary-hover':     '#0096c7',
        '--color-background-light':  '#0d1b2a',
        '--color-background-dark':   '#070e18',
        '--color-surface-light':     '#1b2f45',
        '--color-surface-dark':      '#0d1b2a',
        '--color-border-light':      '#2d4a6e',
        '--color-border-dark':       '#1a3050',
        '--color-text-primary':      '#e2e8f0',
        '--color-text-secondary':    '#7fb3d0',
        '--color-text-tertiary':     '#4a8aad',
        '--message-assistant-bg':    '#1b2f45',
        '--message-assistant-text':  '#e2e8f0',
        '--message-user-bg':         '#00b4d8',
        '--message-user-text':       '#ffffff',
        '--chat-background':         'linear-gradient(180deg, #0d1b2a 0%, #0a2540 55%, #051220 100%)',
    },
};

interface ChatBubbleComponentProps {
    config: ChatBubbleConfig;
    isOpen?: boolean;
}

/**
 * Internal ChatBubble component that must be rendered inside a ChatBubbleProvider.
 */
export const ChatBubbleComponent: React.FC<ChatBubbleComponentProps> = ({ config, isOpen }) => {
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
        animatedBackground,
        themePreset,
        themeToggle = false,
    } = config;

    // Active preset — starts from config, can be toggled at runtime
    const [activePreset, setActivePreset] = useState<'amanecer' | 'noche' | undefined>(themePreset);

    const togglePreset = () =>
        setActivePreset(prev => prev === 'amanecer' ? 'noche' : 'amanecer');

    // Default wave/particle colors based on active preset
    const defaultWaveColor = activePreset === 'amanecer'
        ? 'rgba(251, 146, 60, 0.35)'
        : activePreset === 'noche'
        ? 'rgba(0, 180, 216, 0.35)'
        : 'rgba(255, 255, 255, 0.2)';

    const defaultParticleColor = activePreset === 'amanecer'
        ? 'rgba(251, 146, 60, 0.6)'
        : activePreset === 'noche'
        ? 'rgba(0, 180, 216, 0.6)'
        : 'rgba(255, 255, 255, 0.5)';

    // Configure agent service
    useEffect(() => {
        if (url || token) {
            agentService.configure(url, token);
        }
    }, [url, token]);

    // Get messages from ChatBubbleContext
    const { messages, isTyping, toolCallLabel } = useChatBubble();

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

    // Scroll to bottom when chat opens (widget becomes visible)
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: 'instant' });
            }, 50); // small delay lets the panel animation start first
        }
    }, [isOpen]);

    // Auto-scroll: follow bottom while streaming, jump to top of response when done
    useEffect(() => {
        if (isTyping) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            wasTypingRef.current = true;
        } else if (wasTypingRef.current) {
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

    // Inject theme toggle button into header actions if requested
    const headerConfig = header ? {
        ...header,
        actions: [
            ...(themeToggle ? [{
                id: '__theme-toggle__',
                icon: activePreset === 'amanecer' ? '🌙' : '☀️',
                ariaLabel: activePreset === 'amanecer' ? 'Modo Noche' : 'Modo Amanecer',
                onClick: togglePreset,
                visible: true,
            }] : []),
            ...(header.actions || []),
        ],
    } : undefined;

    const animBgEnabled = animatedBackground?.enabled === true;

    return (
        <div
            id="chat-bubble-container"
            className={className}
            style={{
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                position: 'relative',
                maxWidth,
                height,
                fontFamily: mergedTheme.fonts.family,
                // Background on outer container so header + messages both show it
                backgroundColor: getThemeVar('--color-background-light', '--color-background-dark'),
                backgroundImage: 'var(--chat-background)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                ...buildCssVariables(),
                // Preset vars override theme, user style overrides preset
                ...(activePreset ? THEME_PRESETS[activePreset] : {}),
                ...style,
            }}
        >
            {/* Header */}
            {headerConfig && <ChatHeader config={headerConfig} />}

            {/* Messages area — background lives on outer container so header shows it too */}
            <div style={{
                position: 'relative',
                flex: 1,
                overflow: 'hidden',
            }}>
                {animBgEnabled && (
                    <AnimatedBackground
                        waves={animatedBackground?.waves !== false}
                        particles={animatedBackground?.particles !== false}
                        waveColor={animatedBackground?.waveColor ?? defaultWaveColor}
                        particleColor={animatedBackground?.particleColor ?? defaultParticleColor}
                    />
                )}

                <main
                    style={{
                        position: 'relative',
                        zIndex: 1,
                        height: '100%',
                        overflowY: 'auto',
                        paddingLeft: '1rem',
                        paddingRight: '1rem',
                        paddingTop: '1.5rem',
                        paddingBottom: '1.5rem',
                        scrollBehavior: 'smooth',
                        backgroundColor: 'transparent',
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
                                <DateSeparator date={new Date(dateKey)} config={dateSeparator} />

                                {dateMessages.map((message) => (
                                    <div
                                        key={message.id}
                                        ref={message.id === lastAssistantId ? lastAssistantRef : null}
                                    >
                                        <ChatMessage message={message} defaultAvatar={header?.avatar} />
                                    </div>
                                ))}
                            </React.Fragment>
                        ))}

                        {/* Typing Indicator — shown only while waiting for first chunk */}
                        {isTyping && !messages.some(m => m.role === 'assistant' && m.status === 'streaming') && (
                            <TypingIndicator
                                config={{
                                    show: true,
                                    avatar: header?.avatar,
                                    toolCallLabel,
                                }}
                            />
                        )}

                        <div ref={messagesEndRef} />
                    </div>
                </main>
            </div>

            {/* Suggested replies + Input */}
            <SuggestedReplies />
            {input && <ChatInput config={input} />}

        </div>
    );
};

