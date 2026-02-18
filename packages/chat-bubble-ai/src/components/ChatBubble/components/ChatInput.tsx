import React, { useState, FormEvent } from 'react';
import type { ChatInputConfig, InputActionButton } from '../ChatBubble.types';
import { useChatBubble } from '../useChatBubble';
import { SendIcon, MicIcon, MoodIcon } from './icons';

interface ChatInputProps {
    config?: ChatInputConfig;
    className?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
    config = {},
    className = '',
}) => {
    const {
        placeholder = 'Type a message...',
        actions = [],
        showSendButton = true,
        showEmoji = false,
        showVoice = true,
        disclaimer = 'AI can make mistakes. Consider checking important information.',
        maxLength,
        sendButtonColor,
        sendButtonDisabledColor,
    } = config;

    const { sendMessage, isLoading } = useChatBubble();
    const [inputValue, setInputValue] = useState('');
    const [isHoveringSend, setIsHoveringSend] = useState(false);

    const isSendDisabled = !inputValue.trim() || isLoading;

    const rightActions = actions.filter((a) => a.position === 'right' && a.visible !== false);

    const defaultRightActions: InputActionButton[] = [
        ...(showEmoji
            ? [
                {
                    id: 'emoji',
                    icon: <MoodIcon />,
                    ariaLabel: 'Add emoji',
                    position: 'right' as const,
                    onClick: undefined,
                },
            ]
            : []),
        ...(showVoice
            ? [
                {
                    id: 'voice',
                    icon: <MicIcon />,
                    ariaLabel: 'Voice input',
                    position: 'right' as const,
                    onClick: undefined,
                },
            ]
            : []),
    ];

    const finalRightActions = rightActions.length > 0 ? rightActions : defaultRightActions;

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim() || isLoading) return;
        const messageText = inputValue.trim();
        setInputValue('');
        try {
            await sendMessage(messageText);
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    const getSendButtonBackground = () => {
        if (isSendDisabled) {
            if (sendButtonDisabledColor) return sendButtonDisabledColor;
            if (sendButtonColor) return sendButtonColor;
            return '#94a3b8';
        }
        if (sendButtonColor) return sendButtonColor;
        return 'linear-gradient(135deg, #3b82f6, #4f46e5)';
    };

    const getSendButtonFilter = () => {
        if (isSendDisabled && !sendButtonDisabledColor && sendButtonColor) {
            return 'brightness(0.5) saturate(0.5)';
        }
        if (!isSendDisabled && isHoveringSend && sendButtonColor) {
            return 'brightness(1.15)';
        }
        return 'none';
    };

    return (
        <footer
            style={{
                padding: '0.75rem 1rem 1.5rem 1rem',
                background: 'linear-gradient(to top, rgba(248, 250, 252, 0.9), transparent)',
                backdropFilter: 'blur(8px)',
            }}
            className={className}
        >
            <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
                <form onSubmit={handleSubmit}>
                    <div
                        style={{
                            position: 'relative',
                            display: 'flex',
                            alignItems: 'center',
                            width: '100%',
                            background: 'rgba(255, 255, 255, 0.95)',
                            backdropFilter: 'blur(12px)',
                            borderRadius: '1rem',
                            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.08)',
                            border: '1px solid rgba(226, 232, 240, 0.6)',
                            padding: '0 0.5rem',
                            transition: 'box-shadow 0.3s ease, border-color 0.3s ease',
                        }}
                    >
                        {/* Text Input */}
                        <input
                            type="text"
                            placeholder={placeholder}
                            maxLength={maxLength}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={isLoading}
                            style={{
                                flex: 1,
                                background: 'transparent',
                                border: 'none',
                                outline: 'none',
                                color: '#1e293b',
                                fontSize: '1rem',
                                padding: '1rem 0.5rem',
                                opacity: isLoading ? 0.5 : 1,
                            }}
                        />

                        {/* Right Actions & Send Button */}
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                paddingRight: '0.25rem',
                                gap: '0.25rem',
                            }}
                        >
                            {finalRightActions.map((action) => (
                                <button
                                    key={action.id}
                                    type="button"
                                    onClick={action.onClick}
                                    aria-label={action.ariaLabel}
                                    disabled={isLoading}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: '0.5rem',
                                        color: '#94a3b8',
                                        background: 'transparent',
                                        border: 'none',
                                        borderRadius: '0.5rem',
                                        cursor: isLoading ? 'not-allowed' : 'pointer',
                                        opacity: isLoading ? 0.5 : 1,
                                        transition: 'color 0.2s ease, background 0.2s ease',
                                    }}
                                >
                                    {typeof action.icon === 'string' ? (
                                        <span style={{ fontSize: '20px' }}>
                                            {action.icon}
                                        </span>
                                    ) : (
                                        action.icon
                                    )}
                                </button>
                            ))}

                            {showSendButton && (
                                <button
                                    type="submit"
                                    aria-label="Send message"
                                    disabled={isSendDisabled}
                                    onMouseEnter={() => setIsHoveringSend(true)}
                                    onMouseLeave={() => setIsHoveringSend(false)}
                                    style={{
                                        position: 'relative',
                                        marginLeft: '0.25rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: '2.75rem',
                                        height: '2.75rem',
                                        borderRadius: '50%',
                                        background: getSendButtonBackground(),
                                        color: '#fff',
                                        border: 'none',
                                        cursor: isSendDisabled ? 'not-allowed' : 'pointer',
                                        filter: getSendButtonFilter(),
                                        boxShadow: isSendDisabled
                                            ? '0 2px 8px rgba(0,0,0,0.1)'
                                            : sendButtonColor
                                                ? '0 4px 12px rgba(0,0,0,0.2)'
                                                : '0 4px 12px rgba(59, 130, 246, 0.35)',
                                        transform: isHoveringSend && !isSendDisabled ? 'scale(1.08)' : 'scale(1)',
                                        transition: 'all 0.25s ease',
                                        overflow: 'hidden',
                                    }}
                                >
                                    {isLoading ? (
                                        <span
                                            style={{
                                                display: 'inline-block',
                                                width: '20px',
                                                height: '20px',
                                                border: '2px solid rgba(255,255,255,0.3)',
                                                borderTopColor: '#fff',
                                                borderRadius: '50%',
                                                animation: 'spin 0.8s linear infinite',
                                            }}
                                        />
                                    ) : (
                                        <SendIcon size={20} />
                                    )}

                                    {/* Pulse effect when enabled */}
                                    {!isSendDisabled && (
                                        <span
                                            style={{
                                                position: 'absolute',
                                                inset: 0,
                                                borderRadius: '50%',
                                                animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite',
                                                opacity: 0.2,
                                                backgroundColor: sendButtonColor ?? '#3b82f6',
                                            }}
                                        />
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </form>

                {disclaimer && (
                    <p
                        style={{
                            textAlign: 'center',
                            fontSize: '0.6875rem',
                            color: '#94a3b8',
                            marginTop: '0.75rem',
                            fontWeight: 300,
                            letterSpacing: '0.025em',
                        }}
                    >
                        {disclaimer}
                    </p>
                )}
            </div>

            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                @keyframes ping {
                    75%, 100% { transform: scale(2); opacity: 0; }
                }
            `}</style>
        </footer>
    );
};
