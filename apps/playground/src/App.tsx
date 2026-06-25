/**
 * Playground App
 * Tests the ChatBubble component imported from the local workspace package.
 */

import { useState } from 'react';
import {
    ChatBubbleProvider,
    FloatingChatWidget,
    useChatBubble,
} from 'chat-bubble-ai';
import type { ChatBubbleConfig } from 'chat-bubble-ai';
import MLDashboard from './MLDashboard';

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

// Paleta caribeña
// Primary   #FB923C  orange-400
// Darker    #EA580C  orange-600
// Lighter   #FDBA74  orange-300
// Contrast  #3B82F6  blue-500
// Soft bg   #FFEDD5  orange-100

const chatConfig: ChatBubbleConfig = {
    darkMode: false,
    maxWidth: '900px',
    height: '100vh',
    theme: {
        cssVariables: {
            colorPrimary:           '#FB923C',
            colorPrimaryHover:      '#EA580C',
            colorBackgroundLight:   '#FFEDD5',
            colorSurfaceLight:      'rgba(255, 255, 255, 0.15)',
            colorBorderLight:       'rgba(255, 255, 255, 0.2)',
            fontSans: "'Inter', sans-serif",
        },
    },
    style: {
        '--color-text-primary':      '#1e293b',
        '--color-text-secondary':    '#475569',
        '--color-text-tertiary':     '#94a3b8',
        '--message-user-bg':         '#FB923C',
        '--message-user-text':       '#ffffff',
        '--message-assistant-bg':    'rgba(255, 255, 255, 0.72)',
        '--message-assistant-text':  '#1e293b',
        // Beach image de fondo — cubre todo el widget incluido el header
        '--chat-background':         'url(/beach.png)',
    } as React.CSSProperties,
    header: {
        avatar: {
            type: 'image',
            src: 'https://photos.dominicanatours.com/imagenes/domi.webp',
            backgroundColor: 'rgba(255,255,255,0.2)',
            textColor: '#ffffff',
        },
        title: 'DominicanaTours',
        subtitle: 'Nº1 en Viajes al Caribe',
        actions: [],
        // Header transparente — la playa se ve detrás
        style: {
            backgroundColor:    'rgba(0, 0, 0, 0.18)',
            backdropFilter:     'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            borderBottom:       '1px solid rgba(255, 255, 255, 0.15)',
            // Texto blanco solo dentro del header
            '--color-text-primary':   '#ffffff',
            '--color-text-secondary': 'rgba(255, 255, 255, 0.8)',
        } as React.CSSProperties,
    },
    input: {
        placeholder: 'Escribe tu consulta aquí...',
        showAttachment: true,
        showEmoji: true,
        showVoice: false,
        showSendButton: true,
        disclaimer: 'Asistente Virtual de Dominicana Tours',
        sendButtonColor: '#3B82F6',          // contraste azul
        sendButtonDisabledColor: '#FDBA74',  // naranja claro deshabilitado
    },
    launcher: {
        imageUrl: 'https://photos.dominicanatours.com/imagenes/domi.webp',
        animationImages: [
            'https://photos.dominicanatours.com/imagenes/domi-1.webp',
            'https://photos.dominicanatours.com/imagenes/domi.webp',
        ],
        animationInterval: 400,
        color: '#FB923C',
        mobilePill: {
            color: 'linear-gradient(135deg, #FB923C 0%, #EA580C 100%)',
            bottom: '1dvh',
            breakpoint: 768,
        },
    },
    feedback: {
        apiError: '¡Oops! Parece que estoy teniendo problemas para conectar. Por favor intenta de nuevo en unos momentos.',
    },
    notification: {
        title: '¡Hola! Soy Domi, tu asistente virtual en DominicanaTours.',
        message: '¡Estoy aquí para cualquier duda que puedas tener! lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quod.',
        interval: 10000,
        duration: 10000,
        dot: {
            show: true,
            color: '#FB923C',
            ringColor: '#FDBA74',
            size: 10,
            animationDuration: 1.2,
            animationScale: 2.2,
            position: { top: '4%', right: '92%' },
        },
    },
    url: 'https://ai.grupovdt.com/api/agents/stream/domi-v2',
    token: '4XPNFnS4Ew4k8dkDhw+6sqMAPBkaT5KjZcUt4NqGsz0=',
    initialMessage: '¡Hola, bienvenido! <br><br> Soy el agente virtual de DominicanaTours.<br><br>Estoy encantado de ayudarte con información sobre tus reservas y cualquier inquietud que tengas.',
    animatedBackground: {
        enabled: true,
        waves: true,
        particles: true,
        waveColor:     'rgba(255, 255, 255, 0.25)',
        particleColor: 'rgba(255, 255, 255, 0.55)',
    },
    themeToggle: true,
};

type Tab = 'chat' | 'ml';

function App() {
    const [activeTab, setActiveTab] = useState<Tab>('chat');

    const tabs: { id: Tab; label: string; icon: string }[] = [
        { id: 'chat',  label: 'Chat Sandbox', icon: '💬' },
        { id: 'ml',    label: 'ML Dashboard', icon: '🤖' },
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans">

            {/* Tab bar */}
            <div className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700">
                <div className="container mx-auto px-6 flex gap-1 py-2">
                    {tabs.map((t) => (
                        <button
                            key={t.id}
                            onClick={() => setActiveTab(t.id)}
                            className={`
                                flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                                ${activeTab === t.id
                                    ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }
                            `}
                        >
                            <span>{t.icon}</span>
                            {t.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab: Chat (contenido original) */}
            {activeTab === 'chat' && (
                <div className="container mx-auto px-6 py-12 selection:bg-indigo-500/30">
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

                    {/* Chat Bubble */}
                    <ChatBubbleProvider
                        agentId="playground-test"
                        apiErrorMessage={chatConfig.feedback?.apiError}
                        initialMessage={chatConfig.initialMessage}
                    >
                        <FloatingChatWidget config={chatConfig} defaultOpen={false} />
                        <DebugPanel />
                    </ChatBubbleProvider>
                </div>
            )}

            {/* Tab: ML Dashboard */}
            {activeTab === 'ml' && <MLDashboard />}
        </div>
    );
}

export default App;

