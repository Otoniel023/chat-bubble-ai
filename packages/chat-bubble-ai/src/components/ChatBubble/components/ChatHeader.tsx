import React from 'react';
import type { ChatHeaderConfig } from '../ChatBubble.types';
import { Avatar } from './Avatar';

interface ChatHeaderProps {
    config: ChatHeaderConfig;
    className?: string;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ config, className = '' }) => {
    const { avatar, title, subtitle, actions = [], style: configStyle } = config;

    // Wave fill matches the header background so it looks like a wavy bottom edge
    const waveColor = (configStyle?.backgroundColor as string | undefined) ?? 'var(--color-surface-light)';

    return (
        <>
            <header
                className={className}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1rem 1.5rem',
                    backgroundColor: 'var(--color-surface-light)',
                    zIndex: 10,
                    ...configStyle,
                    borderBottom: 'none' as const,
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
                                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)';
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

            {/* Wave bottom edge — same fill as header background */}
            <div
                aria-hidden="true"
                style={{ position: 'relative', height: 0, zIndex: 10, pointerEvents: 'none', flexShrink: 0 }}
            >
                <svg
                    viewBox="0 0 1200 40"
                    preserveAspectRatio="none"
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 40 }}
                >
                    <path
                        d="M0,0 L1200,0 L1200,30 C950,8 700,38 450,16 C250,2 100,32 0,16 Z"
                        style={{ fill: waveColor }}
                    />
                </svg>
            </div>
        </>
    );
};
