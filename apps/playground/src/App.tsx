/**
 * Playground App
 * Tests the ChatBubble component imported from the local workspace package.
 */

import {
    ChatBubbleProvider,
    FloatingChatWidget,
    useChatBubble,
} from 'chat-bubble-ai';
import type { ChatBubbleConfig } from 'chat-bubble-ai';

// Wrapper that shows chat state for debugging
function DebugPanel() {
    const { messages, isTyping, isLoading, error } = useChatBubble();

    return (
        <div className="fixed top-4 right-4 z-50 bg-black/80 text-green-400 text-xs font-mono p-4 rounded-lg max-w-xs max-h-64 overflow-auto backdrop-blur-sm border border-green-500/30">
            <h3 className="text-green-300 font-bold mb-2">🐛 Debug Panel</h3>
            <p>Messages: {messages.length}</p>
            <p>Typing: {isTyping ? '✅' : '❌'}</p>
            <p>Loading: {isLoading ? '✅' : '❌'}</p>
            <p>Error: {error || 'none'}</p>
            {messages.length > 0 && (
                <div className="mt-2 border-t border-green-500/30 pt-2">
                    <p className="text-green-300">Last message:</p>
                    <p className="truncate">{messages[messages.length - 1].content}</p>
                </div>
            )}
        </div>
    );
}

// Chat configuration
const chatConfig: ChatBubbleConfig = {
    darkMode: true,
    maxWidth: '900px',
    height: '100vh',
    theme: {
        colors: {
            primary: '#6366f1',
            primaryHover: '#4f46e5',
        },
        fonts: {
            family: "'Inter', sans-serif",
            sizes: {
                xs: '0.75rem',
                sm: '0.875rem',
                base: '1rem',
                lg: '1.125rem',
                xl: '1.25rem',
            },
        },
    },
    header: {
        avatar: {
            type: 'icon',
            icon: 'smart_toy',
            backgroundColor: 'bg-indigo-500/20',
            textColor: 'text-indigo-400',
        },
        title: 'ChatBubble Playground',
        subtitle: 'Testing the component locally',
        actions: [
            {
                id: 'settings',
                icon: 'settings',
                ariaLabel: 'Settings',
                onClick: () => alert('Settings clicked!'),
            },
        ],
    },
    input: {
        placeholder: 'Type something to test...',
        showAttachment: true,
        showEmoji: true,
        showVoice: false,
        showSendButton: true,
        disclaimer: '🧪 Playground mode — messages connect to your configured API.',
    },
};

function App() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans selection:bg-indigo-500/30">
            {/* Dummy Landing Page Content */}
            <div className="container mx-auto px-6 py-12">
                <header className="flex justify-between items-center mb-20">
                    <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
                        ChatBubble AI
                    </div>
                    <nav className="hidden md:flex gap-6 text-sm font-medium text-slate-500 dark:text-slate-400">
                        <a href="#" className="hover:text-indigo-500 transition-colors">Features</a>
                        <a href="#" className="hover:text-indigo-500 transition-colors">Pricing</a>
                        <a href="#" className="hover:text-indigo-500 transition-colors">Documentation</a>
                    </nav>
                </header>

                <main className="max-w-4xl">
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8">
                        The <span className="text-indigo-500">smartest</span> way to chat with your users.
                    </h1>
                    <p className="text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl leading-relaxed">
                        Add a powerful, customizable AI chat widget to your React application in minutes.
                        Give it a spin by clicking the button in the bottom right corner! 👇
                    </p>
                    <div className="flex gap-4">
                        <button className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-semibold transition-all hover:scale-105 shadow-lg shadow-indigo-500/25">
                            Get Started
                        </button>
                        <button className="px-8 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 rounded-full font-semibold transition-all">
                            View Documentation
                        </button>
                    </div>

                    <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { title: 'Easy Integration', icon: '⚡' },
                            { title: 'Fully Customizable', icon: '🎨' },
                            { title: 'AI Powered', icon: '🤖' },
                        ].map((feature) => (
                            <div key={feature.title} className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                                <div className="text-4xl mb-4">{feature.icon}</div>
                                <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor.
                                </p>
                            </div>
                        ))}
                    </div>
                </main>
            </div>

            {/* Chat Bubble Implementation */}
            <ChatBubbleProvider agentId="playground-test">
                <FloatingChatWidget config={chatConfig} defaultOpen={false} />
                <DebugPanel />
            </ChatBubbleProvider>
        </div>
    );
}

export default App;
