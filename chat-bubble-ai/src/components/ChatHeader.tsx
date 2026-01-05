import React from 'react';
import { ChatHeaderConfig } from '../types/chat.types';
import { Avatar } from './Avatar';

interface ChatHeaderProps {
  config: ChatHeaderConfig;
  className?: string;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ config, className = '' }) => {
  const { avatar, title, subtitle, actions = [], showBorder = true } = config;

  return (
    <header
      className={`flex items-center justify-between px-6 py-4 bg-surface-light dark:bg-background-dark z-10 ${
        showBorder ? 'border-b border-solid border-slate-200 dark:border-border-dark' : ''
      } ${className}`}
    >
      <div className="flex items-center gap-4">
        <Avatar config={avatar} />

        <div>
          <h2 className="text-base font-bold leading-tight text-slate-900 dark:text-white">
            {title}
          </h2>
          {subtitle && (
            <p className="text-slate-500 dark:text-text-secondary text-xs">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        {actions
          .filter((action) => action.visible !== false)
          .map((action) => (
            <button
              key={action.id}
              onClick={action.onClick}
              aria-label={action.ariaLabel}
              className="flex size-10 cursor-pointer items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-surface-dark text-slate-600 dark:text-white transition-colors"
            >
              <span className="material-symbols-outlined">{action.icon}</span>
            </button>
          ))}
      </div>
    </header>
  );
};
