import { useState, useEffect } from 'react';
import { ChatBubbleComponent } from '../ChatBubble';
import type { ChatBubbleConfig } from '../ChatBubble.types';
import { ChatIcon, CloseIcon } from './icons';

interface EmbeddedChatWidgetProps {
    config?: Partial<ChatBubbleConfig>;
    showNotificationBadge?: boolean;
    notificationCount?: number;
}

// Helper to notify parent window about state changes (for iframe embedding)
const notifyParent = (state: 'expand' | 'collapse') => {
    if (window.parent !== window) {
        window.parent.postMessage(state, '*');
    }
};

export function EmbeddedChatWidget({
    config,
    showNotificationBadge = false,
    notificationCount = 0,
}: EmbeddedChatWidgetProps) {
    const [isOpen, setIsOpen] = useState(false);

    // Notify parent when chat opens/closes
    useEffect(() => {
        notifyParent(isOpen ? 'expand' : 'collapse');
    }, [isOpen]);

    const toggleChat = () => {
        setIsOpen(!isOpen);
    };

    const closeChat = () => {
        setIsOpen(false);
    };

    // Merge default config with provided config
    const chatConfig: ChatBubbleConfig = {
        darkMode: true,
        height: '100%',
        header: {
            avatar: {
                type: 'image',
                src: 'https://photos.dominicanatours.com/imagenes/domi.webp',
                backgroundColor: 'rgba(19, 127, 236, 0.1)',
                textColor: '#137fec',
            },
            title: 'Virtual Assistant',
            subtitle: 'Always here to help',
            actions: [
                {
                    id: 'close',
                    icon: <CloseIcon />,
                    ariaLabel: 'Close chat',
                    onClick: closeChat,
                },
            ],
        },
        input: {
            placeholder: 'Type a message...',
            showAttachment: true,
            showEmoji: true,
            showVoice: true,
            showSendButton: true,
        },
        ...config,
    };

    return (
        <div
            style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                width: '100%',
                height: '100%',
            }}
        >
            {/* Chat Panel */}
            <div
                style={{
                    width: '100%',
                    height: isOpen ? '100%' : '0',
                    overflow: 'hidden',
                    transition: 'height 300ms ease',
                    flexShrink: 1,
                    flexGrow: isOpen ? 1 : 0,
                }}
            >
                <ChatBubbleComponent config={chatConfig} />
            </div>

            {/* Toggle Button */}
            <button
                onClick={toggleChat}
                aria-label="Open chat"
                type="button"
                style={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    backgroundColor: '#4f46e5',
                    color: '#ffffff',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                    flexShrink: 0,
                    marginTop: '8px',
                }}
            >
                <ChatIcon />
                {showNotificationBadge && notificationCount > 0 && (
                    <span
                        style={{
                            position: 'absolute',
                            top: '-4px',
                            right: '-4px',
                            minWidth: '1.25rem',
                            height: '1.25rem',
                            backgroundColor: '#ef4444',
                            color: '#ffffff',
                            borderRadius: '9999px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '0 0.25rem',
                        }}
                    >
                        {notificationCount > 99 ? '99+' : notificationCount}
                    </span>
                )}
            </button>
        </div>
    );
}
