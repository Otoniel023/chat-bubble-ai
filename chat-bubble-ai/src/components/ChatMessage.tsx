import React from 'react';
import { Message, AvatarConfig } from '../types/chat.types';
import { Avatar } from './Avatar';

interface ChatMessageProps {
  message: Message;
  defaultAvatar?: AvatarConfig;
  className?: string;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  defaultAvatar,
  className = '',
}) => {
  const { sender, content, timestamp, avatar, senderLabel } = message;

  const isUser = sender === 'user';

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
  const messageAvatar: AvatarConfig = avatar || defaultAvatar || {
    type: isUser ? 'text' : 'icon',
    text: isUser ? 'U' : undefined,
    icon: isUser ? undefined : 'smart_toy',
    backgroundColor: isUser ? 'bg-slate-200 dark:bg-slate-700' : 'bg-primary/10',
    textColor: isUser ? 'text-slate-700 dark:text-slate-200' : 'text-primary',
    size: 'sm',
  };

  const label = senderLabel || (isUser ? 'You' : 'Assistant');

  return (
    <div
      className={`flex items-end gap-3 group ${
        isUser ? 'justify-end' : ''
      } ${className}`}
    >
      {!isUser && <Avatar config={messageAvatar} />}

      <div
        className={`flex flex-col gap-1 max-w-[85%] sm:max-w-[70%] ${
          isUser ? 'items-end' : 'items-start'
        }`}
      >
        <div
          className={`flex items-center gap-2 px-1 ${
            isUser ? 'flex-row-reverse' : ''
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
          className={`p-4 text-base leading-relaxed shadow-sm ${
            isUser
              ? 'rounded-2xl rounded-br-sm bg-primary text-white shadow-md'
              : 'rounded-2xl rounded-bl-sm bg-slate-100 dark:bg-surface-dark text-slate-800 dark:text-white'
          }`}
        >
          {content}
        </div>
      </div>

      {isUser && <Avatar config={messageAvatar} />}
    </div>
  );
};
