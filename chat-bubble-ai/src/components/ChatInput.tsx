import React, { useState, FormEvent } from 'react';
import { ChatInputConfig, InputActionButton } from '../types/chat.types';
import { useChat } from '../hooks/useChat';

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
    showEmoji = true,
    showVoice = true,
    disclaimer = 'AI can make mistakes. Consider checking important information.',
    maxLength,
  } = config;

  const { sendMessage, isLoading } = useChat();
  const [inputValue, setInputValue] = useState('');

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
    <footer className={`p-4 sm:px-10 pb-6 pt-2 bg-background-light dark:bg-background-dark ${className}`}>
      <div className="max-w-[800px] mx-auto w-full">
        <form onSubmit={handleSubmit}>
          <div className="relative flex items-center w-full bg-white dark:bg-surface-dark rounded-xl shadow-lg border border-slate-200 dark:border-transparent ring-1 ring-transparent focus-within:ring-primary/50 transition-all">
            {/* Left Actions */}
            {finalLeftActions.map((action) => (
              <button
                key={action.id}
                type="button"
                onClick={action.onClick || undefined}
                aria-label={action.ariaLabel}
                disabled={isLoading}
                className="pl-4 pr-2 py-3 text-slate-400 hover:text-primary transition-colors disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[24px]">
                  {action.icon}
                </span>
              </button>
            ))}

            {/* Text Input */}
            <input
              type="text"
              placeholder={placeholder}
              maxLength={maxLength}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              className="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-text-secondary text-base py-4 disabled:opacity-50"
            />

            {/* Right Actions & Send Button */}
            <div className="flex items-center pr-3 gap-2">
              {finalRightActions.map((action) => (
                <button
                  key={action.id}
                  type="button"
                  onClick={action.onClick}
                  aria-label={action.ariaLabel}
                  disabled={isLoading}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors hidden sm:block disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[20px] font-light">
                    {action.icon}
                  </span>
                </button>
              ))}

              {showSendButton && (
                <button
                  type="submit"
                  aria-label="Send message"
                  disabled={!inputValue.trim() || isLoading}
                  className="ml-2 flex items-center justify-center size-10 rounded-lg bg-primary hover:bg-primary/90 text-white shadow-md transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isLoading ? (
                    <span className="material-symbols-outlined text-[20px] animate-spin">
                      progress_activity
                    </span>
                  ) : (
                    <span className="material-symbols-outlined text-[20px]">send</span>
                  )}
                </button>
              )}
            </div>
          </div>
        </form>

        {disclaimer && (
          <p className="text-center text-[10px] text-slate-400 dark:text-text-tertiary mt-3">
            {disclaimer}
          </p>
        )}
      </div>
    </footer>
  );
};
