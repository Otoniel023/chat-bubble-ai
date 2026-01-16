import { useState, useEffect } from 'react';
import { ChatBubble } from './ChatBubble';
import type { ChatBubbleConfig } from '../types/chat.types';
import './EmbeddedChatWidget.css';

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
    height: '100%', // Use 100% to fill the container instead of 100vh
    header: {
      avatar: {
        type: 'icon',
        icon: 'smart_toy',
        backgroundColor: 'bg-primary/20',
        textColor: 'text-primary',
      },
      title: 'Virtual Assistant',
      subtitle: 'Always here to help',
      actions: [
        {
          id: 'close',
          icon: 'close',
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
    <div className={`chat-widget-container ${isOpen ? 'chat-open' : ''}`}>
      {/* Chat Bubble */}
      <div className={`chat-bubble-container ${isOpen ? 'open' : ''}`}>
        <ChatBubble config={chatConfig} />
      </div>

      {/* Toggle Button */}
      <button
        className="chat-toggle-button"
        onClick={toggleChat}
        aria-label="Open chat"
        type="button"
      >
        <span className="material-symbols-outlined">chat</span>
        {showNotificationBadge && notificationCount > 0 && (
          <span className="chat-notification-badge">
            {notificationCount > 99 ? '99+' : notificationCount}
          </span>
        )}
      </button>
    </div>
  );
}
