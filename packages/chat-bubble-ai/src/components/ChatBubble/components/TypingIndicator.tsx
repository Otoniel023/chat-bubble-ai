import React from 'react';
import type { TypingIndicatorConfig, AvatarConfig } from '../ChatBubble.types';
import { Avatar } from './Avatar';

interface TypingIndicatorProps {
    config?: TypingIndicatorConfig;
    className?: string;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
    config = { show: false },
    className = '',
}) => {
    const { show, avatar, dotColor = '#94a3b8' } = config; // default to slate-400

    if (!show) return null;

    const defaultAvatar: AvatarConfig = avatar || {
        type: 'icon',
        icon: 'smart_toy',
        backgroundColor: 'rgba(19, 127, 236, 0.1)', // bg-primary/10
        textColor: '#137fec', // text-primary
        size: 'sm',
    };

    return (
        <div className={className} style={{ display: 'flex', alignItems: 'flex-end', gap: '0.75rem' }}>
            <style>
                {`
                @keyframes bounce {
                    0%, 100% { transform: translateY(-25%); animation-timing-function: cubic-bezier(0.8,0,1,1); }
                    50% { transform: none; animation-timing-function: cubic-bezier(0,0,0.2,1); }
                }
                `}
            </style>
            <Avatar config={defaultAvatar} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', alignItems: 'flex-start' }}>
                <div style={{
                    padding: '0.75rem 1rem', // px-4 py-3
                    borderRadius: '1rem', // rounded-2xl
                    borderBottomLeftRadius: '0.125rem', // rounded-bl-sm
                    backgroundColor: 'var(--color-background-light, #f1f5f9)', // bg-slate-100 / surface-dark fallback needed?
                    // Note: dark mode background handling might be tricky without CSS classes. Using a compassionate default.
                    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                    display: 'flex',
                    gap: '0.25rem',
                    alignItems: 'center',
                    height: '46px',
                }}>
                    <span
                        style={{
                            display: 'block',
                            width: '0.375rem',
                            height: '0.375rem',
                            borderRadius: '9999px',
                            backgroundColor: dotColor.startsWith('bg-') ? '#94a3b8' : dotColor, // Handle legacy tailwind classes helper if possible, else default
                            animation: 'bounce 1s infinite',
                        }}
                    />
                    <span
                        style={{
                            display: 'block',
                            width: '0.375rem',
                            height: '0.375rem',
                            borderRadius: '9999px',
                            backgroundColor: dotColor.startsWith('bg-') ? '#94a3b8' : dotColor,
                            animation: 'bounce 1s infinite',
                            animationDelay: '0.2s',
                        }}
                    />
                    <span
                        style={{
                            display: 'block',
                            width: '0.375rem',
                            height: '0.375rem',
                            borderRadius: '9999px',
                            backgroundColor: dotColor.startsWith('bg-') ? '#94a3b8' : dotColor,
                            animation: 'bounce 1s infinite',
                            animationDelay: '0.4s',
                        }}
                    />
                </div>
            </div>
        </div>
    );
};
