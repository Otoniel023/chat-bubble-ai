import React, { useState, useCallback } from 'react';
import type { ChatMessage as ChatMessageType, AvatarConfig } from '../ChatBubble.types';
import { Avatar } from './Avatar';
import { ImageCarousel } from './ImageCarousel';

const MSG_CSS = `
  @keyframes cb-msg-in {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes cb-overlay-in {
    from { opacity: 0; transform: translateY(4px) scale(0.95); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
`;

interface ChatMessageProps {
    message: ChatMessageType;
    defaultAvatar?: AvatarConfig;
    className?: string;
}

const HOVER_ACTIONS = [
    { icon: '👍', label: 'Me gusta' },
    { icon: '❤️', label: 'Me encanta' },
    { icon: '📋', label: 'Copiar' },
];

export const ChatMessage: React.FC<ChatMessageProps> = ({
    message,
    defaultAvatar,
    className = '',
}) => {
    const { role, content, timestamp, status } = message;
    const isUser = role === 'user';
    const isCarousel = message.type === 'carousel' && Array.isArray(message.images) && message.images.length > 0;
    const [hovered, setHovered] = useState(false);
    const [copied, setCopied] = useState(false);

    const displayContent = (!isCarousel && status !== 'sent')
        ? content
            .replace(/\{"type":"carousel","images":\[[\s\S]*?\]\}/, '')
            .replace(/\{"type":"suggestions","items":\[[\s\S]*?\]\}/, '')
            .trim()
        : content;

    const formatTime = (time: Date | string) => {
        const date = typeof time === 'string' ? new Date(time) : time;
        return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    };

    const handleAction = useCallback((icon: string) => {
        if (icon === '📋') {
            const plain = displayContent.replace(/<[^>]+>/g, '');
            navigator.clipboard?.writeText(plain).catch(() => {});
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        }
    }, [displayContent]);

    const assistantAvatar: AvatarConfig = {
        ...defaultAvatar,
        type: defaultAvatar?.type ?? 'image',
        src: defaultAvatar?.src ?? 'https://photos.dominicanatours.com/imagenes/domi.webp',
        backgroundColor: defaultAvatar?.backgroundColor ?? 'rgba(19, 127, 236, 0.1)',
        textColor: defaultAvatar?.textColor ?? '#000000',
        size: 'sm',
    };

    const bubbleRadius = isUser
        ? '1.25rem 1.25rem 0.25rem 1.25rem'
        : '0 1.25rem 1.25rem 1.25rem';

    const statusMark = isUser
        ? status === 'sending'
            ? <span style={{ fontSize: '0.625rem', opacity: 0.5, letterSpacing: '-1px' }}>●●●</span>
            : status === 'error'
            ? <span style={{ fontSize: '0.625rem', color: '#ef4444' }}>⚠</span>
            : <span style={{ fontSize: '0.625rem', opacity: 0.5 }}>✓</span>
        : null;

    // Hover action overlay — glass morphism pill
    const hoverOverlay = (
        <div style={{
            position: 'absolute',
            top: '-2.25rem',
            // Align to the bubble origin side
            ...(isUser ? { right: 0 } : { left: 0 }),
            display: 'flex',
            gap: '0.125rem',
            padding: '0.25rem 0.5rem',
            borderRadius: '999px',
            background: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.6)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
            opacity: hovered ? 1 : 0,
            pointerEvents: hovered ? 'auto' : 'none',
            animation: hovered ? 'cb-overlay-in 0.18s ease-out' : 'none',
            transition: 'opacity 0.15s ease',
            zIndex: 20,
            whiteSpace: 'nowrap',
        }}>
            {HOVER_ACTIONS.map(({ icon, label }) => (
                <button
                    key={icon}
                    title={icon === '📋' && copied ? '¡Copiado!' : label}
                    onClick={() => handleAction(icon)}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        lineHeight: 1,
                        padding: '0.25rem',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'transform 0.12s ease, background 0.12s ease',
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.transform = 'scale(1.25)';
                        e.currentTarget.style.background = 'rgba(0,0,0,0.06)';
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.background = 'transparent';
                    }}
                >
                    {icon === '📋' && copied ? '✓' : icon}
                </button>
            ))}
        </div>
    );

    const bubble = isCarousel ? (
        <>
            {content && (
                <div style={{
                    position: 'relative',
                    borderRadius: bubbleRadius,
                    padding: '0.75rem 1rem',
                    marginBottom: '0.5rem',
                    fontSize: '0.9375rem',
                    lineHeight: 1.7,
                    overflowWrap: 'break-word',
                    wordBreak: 'break-word',
                    color: 'var(--message-assistant-text, inherit)',
                    backdropFilter: 'blur(14px)',
                    WebkitBackdropFilter: 'blur(14px)',
                    border: '1px solid rgba(255, 255, 255, 0.4)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                }}>
                    <div style={{
                        position: 'absolute', inset: 0, borderRadius: 'inherit',
                        opacity: 'var(--message-assistant-opacity, 1)',
                        background: 'var(--message-assistant-bg, #f1f5f9)',
                        zIndex: 0,
                    }} />
                    <div style={{ position: 'relative', zIndex: 1 }}
                        dangerouslySetInnerHTML={{ __html: content }} />
                </div>
            )}
            <ImageCarousel images={message.images!} />
        </>
    ) : (
        <div style={{
            position: 'relative',
            borderRadius: bubbleRadius,
            padding: isUser ? '0.75rem 1.125rem' : '0.75rem 1rem',
            fontSize: '0.9375rem',
            lineHeight: 1.7,
            overflowWrap: 'break-word',
            wordBreak: 'break-word',
            fontWeight: isUser
                ? 'var(--message-user-font-weight, 400)'
                : 'var(--message-assistant-font-weight, 400)',
            color: isUser
                ? 'var(--message-user-text, #ffffff)'
                : 'var(--message-assistant-text, inherit)',
            boxShadow: isUser
                ? '0 2px 10px rgba(0,0,0,0.15), 0 1px 3px rgba(0,0,0,0.08)'
                : '0 4px 20px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.05)',
            backdropFilter: isUser ? undefined : 'blur(14px)',
            WebkitBackdropFilter: isUser ? undefined : 'blur(14px)',
            border: isUser ? undefined : '1px solid rgba(255, 255, 255, 0.4)',
        }}>
            {/* Background layer — supports opacity CSS var */}
            <div style={{
                position: 'absolute', inset: 0, borderRadius: 'inherit',
                opacity: isUser
                    ? 'var(--message-user-opacity, 1)'
                    : 'var(--message-assistant-opacity, 1)',
                background: isUser
                    ? 'var(--message-user-bg, var(--color-primary, #137fec))'
                    : 'var(--message-assistant-bg, #f1f5f9)',
                zIndex: 0,
            }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
                {role === 'assistant'
                    ? <div dangerouslySetInnerHTML={{ __html: displayContent }} />
                    : displayContent
                }
            </div>
        </div>
    );

    return (
        <div
            className={className}
            style={{
                display: 'flex',
                flexDirection: isUser ? 'row-reverse' : 'row',
                alignItems: 'flex-end',
                gap: '0.625rem',
                animation: 'cb-msg-in 0.22s ease-out',
            }}
        >
            <style>{MSG_CSS}</style>

            {/* Avatar — only for assistant */}
            {!isUser && (
                <div style={{ flexShrink: 0, alignSelf: 'flex-end', marginBottom: '1.25rem' }}>
                    <Avatar config={assistantAvatar} />
                </div>
            )}

            {/* Bubble + hover overlay + meta */}
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.2rem',
                    alignItems: isUser ? 'flex-end' : 'flex-start',
                    maxWidth: isUser ? '76%' : '85%',
                    // Only show pointer when sent (not streaming)
                    position: 'relative',
                }}
                onMouseEnter={() => status === 'sent' && setHovered(true)}
                onMouseLeave={() => setHovered(false)}
            >
                {/* Hover action overlay */}
                {status === 'sent' && hoverOverlay}

                {bubble}

                {/* Timestamp + status */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    paddingLeft: isUser ? 0 : '0.375rem',
                    paddingRight: isUser ? '0.375rem' : 0,
                }}>
                    <span style={{
                        fontSize: '0.6875rem',
                        color: 'var(--color-text-tertiary, #94a3b8)',
                        opacity: 0.75,
                    }}>
                        {formatTime(timestamp)}
                    </span>
                    {statusMark}
                </div>
            </div>
        </div>
    );
};
