import React, { useState, FormEvent } from 'react';
import type { ChatInputConfig, InputActionButton } from '../ChatBubble.types';
import { useChatBubble } from '../useChatBubble';

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
        showAttachment = true,
        showEmoji = false,
        showVoice = true,
        disclaimer = 'AI can make mistakes. Consider checking important information.',
        maxLength,
        sendButtonColor,
        sendButtonDisabledColor,
    } = config;

    const { sendMessage, isLoading } = useChatBubble();
    const [inputValue, setInputValue] = useState('');

    const isSendDisabled = !inputValue.trim() || isLoading;

    // Separate actions by position
    const leftActions = actions.filter((a) => a.position === 'left' && a.visible !== false);
    const rightActions = actions.filter((a) => a.position === 'right' && a.visible !== false);

    // Default actions
    const defaultLeftActions: InputActionButton[] = showAttachment
        ? [
            {
                id: 'attachment',
                icon: 'add_circle',
                ariaLabel: 'Add attachment',
                position: 'left' as const,
                onClick: undefined,
            },
        ]
        : [];

    const defaultRightActions: InputActionButton[] = [
        ...(showEmoji
            ? [
                {
                    id: 'emoji',
                    icon: 'mood',
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
                    icon: 'mic',
                    ariaLabel: 'Voice input',
                    position: 'right' as const,
                    onClick: undefined,
                },
            ]
            : []),
    ];

    const finalLeftActions = leftActions.length > 0 ? leftActions : defaultLeftActions;
    const finalRightActions = rightActions.length > 0 ? rightActions : defaultRightActions;

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!inputValue.trim() || isLoading) return;

        const messageText = inputValue.trim();
        setInputValue(''); // Clear input immediately

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

    return (
        <footer className={`p-4 sm:px-6 pb-6 pt-3 bg-gradient-to-t from-slate-50/80 to-transparent dark:from-slate-900/80 dark:to-transparent backdrop-blur-sm ${className}`}>
            <div className="max-w-[800px] mx-auto w-full">
                <form onSubmit={handleSubmit}>
                    <div className="relative px-4 flex items-center w-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700/50 ring-2 ring-transparent focus-within:ring-primary/30 focus-within:border-primary/50 transition-all duration-300 hover:shadow-2xl group">
                        {/* Left Actions */}
                        

                        {/* Text Input */}
                        <input
                            type="text"
                            placeholder={placeholder}
                            maxLength={maxLength}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={isLoading}
                            className="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-base py-4 px-2 disabled:opacity-50 font-normal"
                        />

                        {/* Right Actions & Send Button */}
                        <div className="flex items-center pr-2 gap-1">
                            {finalRightActions.map((action) => (
                                <button
                                    key={action.id}
                                    type="button"
                                    onClick={action.onClick}
                                    aria-label={action.ariaLabel}
                                    disabled={isLoading}
                                    className="p-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-all duration-200 hidden sm:block disabled:opacity-50 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg hover:scale-110 active:scale-95"
                                >
                                    <span className="material-symbols-outlined text-[20px]">
                                        {action.icon}
                                    </span>
                                </button>
                            ))}

                            {showSendButton && (
                                <button
                                    type="submit"
                                    aria-label="Send message"
                                    disabled={isSendDisabled}
                                    className={`
                                        relative ml-1 flex items-center justify-center
                                        size-12 rounded-full
                                        ${!sendButtonColor && (!isSendDisabled || !sendButtonDisabledColor) ? 'bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 hover:from-blue-600 hover:via-blue-700 hover:to-indigo-700' : ''}
                                        text-white
                                        shadow-lg ${!sendButtonColor ? 'shadow-blue-500/30' : 'shadow-black/20'}
                                        hover:shadow-2xl ${!sendButtonColor ? 'hover:shadow-blue-600/50' : 'hover:shadow-black/40'}
                                        transition-all duration-300
                                        hover:scale-110 active:scale-95
                                        disabled:opacity-100 disabled:cursor-not-allowed
                                        disabled:hover:scale-100 disabled:shadow-md
                                        ${!sendButtonColor && !sendButtonDisabledColor ? 'disabled:from-slate-400 disabled:via-slate-500 disabled:to-slate-500' : ''}
                                        group/send
                                        overflow-hidden
                                        before:absolute before:inset-0
                                        before:bg-gradient-to-br before:from-white/20 before:to-transparent
                                        before:opacity-0 before:hover:opacity-100
                                        before:transition-opacity before:duration-300
                                    `}
                                    style={{
                                        ...(sendButtonColor && { backgroundColor: sendButtonColor }),
                                        ...(isSendDisabled && sendButtonDisabledColor && { backgroundColor: sendButtonDisabledColor }),
                                        ...(isSendDisabled && !sendButtonDisabledColor && sendButtonColor && { filter: 'brightness(0.5) saturate(0.5)' }),
                                        ...(isSendDisabled && sendButtonDisabledColor && { opacity: 1, filter: 'none' }) // Ensure no filter if specific color set
                                    }}
                                    onMouseEnter={(e) => {
                                        if (sendButtonColor && !isSendDisabled) {
                                            e.currentTarget.style.filter = 'brightness(1.15)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (sendButtonColor && !isSendDisabled) {
                                            e.currentTarget.style.filter = 'brightness(1)';
                                        }
                                    }}
                                >
                                    {isLoading ? (
                                        <span className="material-symbols-outlined text-[24px] animate-spin relative z-10">
                                            progress_activity
                                        </span>
                                    ) : (
                                        <span className="material-symbols-outlined text-[24px] font-bold relative z-10 group-hover/send:rotate-45 transition-transform duration-300">
                                            send
                                        </span>
                                    )}

                                    {/* Pulse effect when enabled */}
                                    {!isSendDisabled && (
                                        <span
                                            className="absolute inset-0 rounded-full animate-ping opacity-20"
                                            style={sendButtonColor ? { backgroundColor: sendButtonColor } : { backgroundColor: '#3b82f6' }}
                                        ></span>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </form>

                {disclaimer && (
                    <p className="text-center text-[11px] text-slate-500 dark:text-slate-400 mt-3 font-light tracking-wide">
                        {disclaimer}
                    </p>
                )}
            </div>
        </footer>
    );
};
