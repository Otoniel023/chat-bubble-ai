import { AuthProvider } from './contexts/AuthContext';
import { ChatProvider } from './contexts/ChatContext';
import { useAuth } from './hooks/useAuth';
import { useChat } from './hooks/useChat';
import { ChatBubble } from './components/ChatBubble';
import type { ChatBubbleConfig } from './types/chat.types';

function ChatApp() {
  const { isAuthenticated, logout, user } = useAuth();
  const { clearMessages } = useChat();

  // Chat configuration
  const chatConfig: ChatBubbleConfig = {
    darkMode: true,
    header: {
      avatar: {
        type: 'icon',
        icon: 'smart_toy',
        backgroundColor: 'bg-primary/20',
        textColor: 'text-primary',
        showOnlineStatus: isAuthenticated,
      },
      title: 'Virtual Assistant',
      subtitle: isAuthenticated ? `Connected as ${user?.email}` : 'Always here to help',
      actions: [
        {
          id: 'settings',
          icon: 'settings',
          ariaLabel: 'Settings',
          onClick: () => console.log('Settings clicked'),
        },
        {
          id: 'logout',
          icon: 'logout',
          ariaLabel: 'Logout',
          onClick: () => {
            clearMessages();
            logout();
          },
          visible: isAuthenticated,
        },
        {
          id: 'delete',
          icon: 'delete',
          ariaLabel: 'Delete conversation',
          onClick: clearMessages,
        },
      ],
    },
    input: {
      placeholder: isAuthenticated ? 'Type a message...' : 'Please sign in to chat',
      showAttachment: true,
      showEmoji: true,
      showVoice: true,
      showSendButton: true,
    },
  };

  return <ChatBubble config={chatConfig} />;
}

function App() {
  return (
    <AuthProvider>
      <ChatProvider>
        <ChatApp />
      </ChatProvider>
    </AuthProvider>
  );
}

export default App;
