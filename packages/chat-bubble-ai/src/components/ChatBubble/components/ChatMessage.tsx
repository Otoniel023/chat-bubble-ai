import React from 'react';
import type { ChatMessage as ChatMessageType, AvatarConfig } from '../ChatBubble.types';
import { Avatar } from './Avatar';


interface ChatMessageProps {
    message: ChatMessageType;
    defaultAvatar?: AvatarConfig;
    className?: string;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
    message,
    defaultAvatar,
    className = '',
}) => {
    const { role, content, timestamp } = message;

    const isUser = role === 'user';

    // Format timestamp
    const formatTime = (time: Date | string) => {
        const date = typeof time === 'string' ? new Date(time) : time;
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
    };

    // Default avatars if not provided
   
    const messageAvatar: AvatarConfig =  {
        ...defaultAvatar,
        type: isUser ? 'text' : 'image',
        text: isUser ? 'U' : undefined,
        src: isUser ? undefined : (defaultAvatar?.src || 'https://photos.dominicanatours.com/imagenes/domi.webp'),
        // Note: Avatar component needs to be checked if it supports style overrides via config,
        // or if we rely on its internal handling. The config interface supports backgroundColor string.
        // We'll leave these strings as they might be used by Avatar logic if it supports arbitrary class/style injection,
        // OR we should change them to hex codes if Avatar expects colors.
        // Looking at ChatBubble.types, backgroundColor is string. Avatar implementation likely uses it as class or style?
        // Let's assume Avatar handles it, or we might need to refactor Avatar too.
        // For now, keeping these as defaults but they look like Tailwind classes.
        // We should probably change them to hex if we want true independence.
        backgroundColor: isUser ? '#e2e8f0' : 'rgba(19, 127, 236, 0.1)', // slate-200 / primary/10
        textColor: isUser ? '#334155' : '#000000', // slate-700 / black
        size: 'sm',
    };

    const label = isUser ? 'You' : 'Assistant';

    return (
        <div
            className={className}
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem', // gap-3
                alignItems: isUser ? 'flex-end' : 'flex-start',
            }}
        >

            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.25rem', // gap-1
                    maxWidth: '95%',
                    justifyContent: isUser ? 'flex-end' : 'flex-start',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem', // gap-2
                        paddingLeft: '0.25rem', // px-1
                        paddingRight: '0.25rem',
                        flexDirection: isUser ? 'row-reverse' : 'row',
                    }}
                >
                    <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--color-text-secondary, #64748b)' }}>
                        {label}
                    </span>
                    <span style={{ fontSize: '0.625rem', color: 'var(--color-text-tertiary, #94a3b8)' }}>
                        {formatTime(timestamp)}
                    </span>
                </div>

                <div
                    style={{
                        position: 'relative',
                        fontSize: '1rem',
                        lineHeight: 1.625,
                        boxShadow: isUser ? '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' : '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                        whiteSpace: 'pre-wrap',
                        overflowWrap: 'break-word',
                        borderRadius: '1rem', // rounded-2xl
                        borderBottomRightRadius: isUser ? '0.125rem' : '1rem',
                        borderBottomLeftRadius: isUser ? '1rem' : '0.125rem',
                        fontWeight: isUser ? 'var(--message-user-font-weight, 400)' : 'var(--message-assistant-font-weight, 400)',
                        color: isUser
                            ? 'var(--message-user-text, #ffffff)'
                            : 'var(--message-assistant-text, inherit)',
                    }}
                >
                    {/* Background Layer */}
                    <div
                        style={{
                            position: 'absolute',
                            inset: 0,
                            width: '100%',
                            height: '100%',
                            borderRadius: 'inherit',
                            opacity: isUser ? 'var(--message-user-opacity, 1)' : 'var(--message-assistant-opacity, 1)',
                            background: isUser
                                ? 'var(--message-user-bg, var(--color-primary, #137fec))'
                                : 'var(--message-assistant-bg, #f1f5f9)',
                            zIndex: 0,
                        }}
                    />

                    {/* Content Layer */}
                    <div
                        style={{
                            position: 'relative',
                            zIndex: 10,
                            padding: '0.5rem',
                            textAlign: isUser ? 'right' : 'left',
                        }}
                    >
                        {role === 'assistant' ? (
                            <div dangerouslySetInnerHTML={{ __html: content }} />
                        ) : (
                            content
                        )}
                    </div>


                </div>
                {/* Avatars */}
                <div style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
                    <Avatar config={messageAvatar} />
                </div>
            </div>

        </div>
    );
};
