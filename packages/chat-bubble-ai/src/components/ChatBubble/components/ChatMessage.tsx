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
    const messageAvatar: AvatarConfig = defaultAvatar || {
        type: isUser ? 'text' : 'image',
        text: isUser ? 'U' : undefined,
        src: isUser ? undefined : 'https://photos.dominicanatours.com/imagenes/domi.webp',
        backgroundColor: isUser ? 'bg-slate-200 dark:bg-slate-700' : 'bg-primary/10',
        textColor: isUser ? 'text-slate-700 dark:text-black-200' : 'text-black',
        size: 'sm',
    };

    const label = isUser ? 'You' : 'Assistant';

    return (
        <div
            className={`flex flex-col gap-3 group ${isUser ? 'items-end' : ''
            } ${className}`}
            >

            <div
                className={`flex flex-col gap-1 max-w-[95%] ${isUser ? 'justify-end' : 'justify-start'
                    }`}
                    >
                <div
                    className={`flex items-center gap-2 px-1 ${isUser ? 'flex-row-reverse' : ''
                        }`}
                        >
                    <span className="text-xs font-medium text-slate-500 dark:text-text-secondary">
                        {label}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-text-tertiary">
                        {formatTime(timestamp)}
                    </span>
                </div>

                <div
                    className={`relative isolate text-base leading-relaxed shadow-sm text-wrap whitespace-pre-wrap ${isUser
                        ? 'rounded-2xl rounded-br-sm shadow-md'
                        : 'rounded-2xl rounded-bl-sm'
                    }`}
                    style={{
                        fontWeight: isUser ? 'var(--message-user-font-weight, 400)' : 'var(--message-assistant-font-weight, 400)',
                        color: isUser
                        ? 'var(--message-user-text, #ffffff)'
                        : 'var(--message-assistant-text, inherit)'
                    }}
                    >
                    {/* Background Layer */}
                    <div
                        className={`absolute inset-0 w-full h-full ${isUser ? 'rounded-2xl rounded-br-sm' : 'rounded-2xl rounded-bl-sm'}`}
                        style={{
                            opacity: isUser ? 'var(--message-user-opacity, 1)' : 'var(--message-assistant-opacity, 1)',
                            background: isUser
                            ? 'var(--message-user-bg, var(--color-primary, #137fec))'
                            : 'var(--message-assistant-bg, #f1f5f9)',
                        }}
                        />

                    {/* Content Layer */}
                    <div className={`relative z-10 p-2 ${isUser ? 'text-end' : 'text-start'}`}>
                        {content}
                    </div>

                    
                </div>
            {isUser && <Avatar config={messageAvatar} className={isUser ? 'flex justify-end' : 'flex justify-start'} />}
            {!isUser && <Avatar config={messageAvatar} />}
            </div>

        </div>
    );
};
