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
                paddingBottom: '0.5rem',
                paddingLeft: '1rem',
                scrollbarWidth: 'thin',
                scrollbarColor: 'var(--color-border-light, #e2e8f0) transparent',
                borderTop: '1px solid var(--color-border-light, #e2e8f0)',
            }}
        >
            {suggestions.map((item, i) => (
                <button
                    key={i}
                    onClick={() => handleClick(item)}
                    style={{
                        flexShrink: 0,
                        padding: '0.375rem 0.875rem',
                        borderRadius: '9999px',
                        border: '1.5px solid var(--color-primary, #137fec)',
                        color: 'var(--color-primary, #137fec)',
                        background: 'transparent',
                        cursor: 'pointer',
                        fontSize: '0.8125rem',
                        fontWeight: 500,
                        whiteSpace: 'nowrap',
                        transition: 'background 0.15s, color 0.15s',
                        fontFamily: 'inherit',
                    }}
                    onMouseEnter={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-primary, #137fec)';
                        (e.currentTarget as HTMLButtonElement).style.color = '#ffffff';
                    }}
                    onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                        (e.currentTarget as HTMLButtonElement).style.color = 'var(--color-primary, #137fec)';
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
