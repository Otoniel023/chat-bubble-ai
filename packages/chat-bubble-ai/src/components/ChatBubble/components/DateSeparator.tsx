import React from 'react';
import type { DateSeparatorConfig } from '../ChatBubble.types';

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
        <div className={className} style={{ display: 'flex', justifyContent: 'center' }}>
            <span style={{
                fontSize: '0.75rem',
                fontWeight: 500,
                color: 'var(--color-text-tertiary, #94a3b8)',
                padding: '0.25rem 0.75rem',
                backgroundColor: 'var(--color-background-light, #f1f5f9)',
                borderRadius: '9999px',
            }}>
                {formatDate(date)}
            </span>
        </div>
    );
};
