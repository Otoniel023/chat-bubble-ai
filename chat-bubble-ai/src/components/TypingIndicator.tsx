import React from 'react';
import { TypingIndicatorConfig, AvatarConfig } from '../types/chat.types';
import { Avatar } from './Avatar';

interface TypingIndicatorProps {
  config?: TypingIndicatorConfig;
  className?: string;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  config = { show: false },
  className = '',
}) => {
  const { show, avatar, dotColor = 'bg-slate-400 dark:bg-slate-500' } = config;

  if (!show) return null;

  const defaultAvatar: AvatarConfig = avatar || {
    type: 'icon',
    icon: 'smart_toy',
    backgroundColor: 'bg-primary/10',
    textColor: 'text-primary',
    size: 'sm',
  };

  return (
    <div className={`flex items-end gap-3 ${className}`}>
      <Avatar config={defaultAvatar} />

      <div className="flex flex-col gap-1 items-start">
        <div className="px-4 py-3 rounded-2xl rounded-bl-sm bg-slate-100 dark:bg-surface-dark shadow-sm flex gap-1 items-center h-[46px]">
          <span
            className={`block size-1.5 ${dotColor} rounded-full animate-bounce`}
          />
          <span
            className={`block size-1.5 ${dotColor} rounded-full animate-bounce [animation-delay:0.2s]`}
          />
          <span
            className={`block size-1.5 ${dotColor} rounded-full animate-bounce [animation-delay:0.4s]`}
          />
        </div>
      </div>
    </div>
  );
};
