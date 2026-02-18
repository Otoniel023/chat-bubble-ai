import React from 'react';
import type { ChatHeaderConfig } from '../ChatBubble.types';
import { Avatar } from './Avatar';

interface ChatHeaderProps {
    config: ChatHeaderConfig;
    className?: string;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ config, className = '' }) => {
    const { avatar, title, subtitle, actions = [], showBorder = true, style: configStyle } = config;

    return (
        <header
            className={className}
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem 1.5rem',
                backgroundColor: 'var(--color-surface-light)',
                zIndex: 10,
                borderBottom: showBorder ? '1px solid var(--color-border-light)' : 'none',
                ...configStyle,
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Avatar config={avatar} />

                <div>
                    <h2 style={{
                        marginTop: 0,
                        marginBottom: 0,
                        fontSize: '1rem',
                        fontWeight: 700,
                        lineHeight: 1.25,
                        color: 'var(--color-text-primary, #0f172a)',
                    }}>
                        {title}
                    </h2>
                    {subtitle && (
                        <p style={{
                            marginTop: 0,
                            marginBottom: 0,
                            color: 'var(--color-text-secondary, #64748b)',
                            fontSize: '0.75rem',
                        }}>
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
                {actions
                    .filter((action) => action.visible !== false)
                    .map((action) => (
                        <button
                            key={action.id}
                            onClick={action.onClick}
                            aria-label={action.ariaLabel}
                            style={{
                                display: 'flex',
                                width: '2.5rem',
                                height: '2.5rem',
                                cursor: 'pointer',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: '9999px',
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--color-text-secondary, #475569)',
                                transition: 'background-color 0.2s, color 0.2s',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = 'var(--color-background-light, #f1f5f9)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                        >
                            {typeof action.icon === 'string' ? (
                                <span style={{ fontSize: '20px' }}>{action.icon}</span>
                            ) : (
                                action.icon
                            )}
                        </button>
                    ))}
            </div>
        </header>
    );
};
