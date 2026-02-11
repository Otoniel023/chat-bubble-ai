import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { AuthProvider } from './contexts/AuthContext';
import { ChatBubbleProvider, EmbeddedChatWidget } from './components/ChatBubble';

// Allow configuration from window object
declare global {
  interface Window {
    ChatBubbleConfig?: {
      apiUrl?: string;
      email?: string;
      password?: string;
      darkMode?: boolean;
      showNotificationBadge?: boolean;
      notificationCount?: number;
    };
  }
}

const config = window.ChatBubbleConfig || {};

createRoot(document.getElementById('chat-widget-root')!).render(
  <StrictMode>
    <AuthProvider>
      <ChatBubbleProvider>
        <EmbeddedChatWidget
          config={{
            darkMode: config.darkMode ?? true,
          }}
          showNotificationBadge={config.showNotificationBadge}
          notificationCount={config.notificationCount}
        />
      </ChatBubbleProvider>
    </AuthProvider>
  </StrictMode>
);
