import React from 'react';
import { DateSeparatorConfig } from '../types/chat.types';

interface DateSeparatorProps {
  date: Date | string;
  config?: DateSeparatorConfig;
  className?: string;
}

export const DateSeparator: React.FC<DateSeparatorProps> = ({
  date,
  config = {},
  className = '',
}) => {
  const { format = 'relative', customFormatter } = config;

  const formatDate = (dateValue: Date | string): string => {
    const dateObj = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;

    if (customFormatter) {
      return customFormatter(dateObj);
    }

    if (format === 'relative') {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const isToday =
        dateObj.getDate() === today.getDate() &&
        dateObj.getMonth() === today.getMonth() &&
        dateObj.getFullYear() === today.getFullYear();

      const isYesterday =
        dateObj.getDate() === yesterday.getDate() &&
        dateObj.getMonth() === yesterday.getMonth() &&
        dateObj.getFullYear() === yesterday.getFullYear();

      if (isToday) return 'Today';
      if (isYesterday) return 'Yesterday';

      // Check if within this week
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);

      if (dateObj > weekAgo) {
        return dateObj.toLocaleDateString('en-US', { weekday: 'long' });
      }
    }

    // Absolute format or fallback
    return dateObj.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: dateObj.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
    });
  };

  return (
    <div className={`flex justify-center ${className}`}>
      <span className="text-xs font-medium text-slate-400 dark:text-text-tertiary py-1 px-3 bg-slate-100 dark:bg-surface-dark rounded-full">
        {formatDate(date)}
      </span>
    </div>
  );
};
