import { AuthProvider } from './contexts/AuthContext';
import { ChatBubbleProvider, ChatBubbleComponent, useChatBubble } from './components/ChatBubble';
import { useAuth } from './hooks/useAuth';
import type { ChatBubbleConfig } from './components/ChatBubble';

function ChatApp() {
  const { isAuthenticated, logout, user } = useAuth();
  const { clearMessages } = useChatBubble();

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

  return <ChatBubbleComponent config={chatConfig} />;
}

function App() {
  return (
    <AuthProvider>
      <ChatBubbleProvider>
        <ChatApp />
      </ChatBubbleProvider>
    </AuthProvider>
  );
}

export default App;
