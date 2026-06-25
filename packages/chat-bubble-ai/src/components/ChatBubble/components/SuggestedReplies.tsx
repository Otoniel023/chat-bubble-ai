import React from 'react';
import { useChatBubble } from '../useChatBubble';

export const SuggestedReplies: React.FC = () => {
    const { suggestions, sendMessage } = useChatBubble();

    if (suggestions.length === 0) return null;

    const handleClick = (item: string) => {
        sendMessage(item);
    };

    return (
        <div
            style={{
                display: 'flex',
                gap: '0.5rem',
                overflowX: 'auto',
                paddingTop: '0.625rem',
                paddingBottom: '0.625rem',
                paddingLeft: '1rem',
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(255,255,255,0.4) transparent',
                background: 'rgba(255, 255, 255, 0.55)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                borderTop: '1px solid rgba(255,255,255,0.35)',
            }}
        >
            {suggestions.map((item, i) => (
                <button
                    key={i}
                    onClick={() => handleClick(item)}
                    style={{
                        flexShrink: 0,
                        padding: '0.4rem 1rem',
                        borderRadius: '9999px',
                        border: '1.5px solid rgba(255,255,255,0.7)',
                        color: 'var(--color-primary, #137fec)',
                        background: 'rgba(255, 255, 255, 0.92)',
                        backdropFilter: 'blur(8px)',
                        WebkitBackdropFilter: 'blur(8px)',
                        cursor: 'pointer',
                        fontSize: '0.8125rem',
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                        transition: 'background 0.15s, color 0.15s, box-shadow 0.15s',
                        fontFamily: 'inherit',
                        boxShadow: '0 1px 6px rgba(0,0,0,0.1)',
                    }}
                    onMouseEnter={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-primary, #137fec)';
                        (e.currentTarget as HTMLButtonElement).style.color = '#ffffff';
                        (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 2px 10px rgba(0,0,0,0.18)';
                    }}
                    onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255, 255, 255, 0.92)';
                        (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-primary, #137fec)';
                        (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 1px 6px rgba(0,0,0,0.1)';
                    }}
                >
                    {item}
                </button>
            ))}
            {/* Spacer: padding-right doesn't apply to overflow content, so we use a trailing element */}
            <div style={{ flexShrink: 0, width: '1rem' }} aria-hidden="true" />
        </div>
    );
};
