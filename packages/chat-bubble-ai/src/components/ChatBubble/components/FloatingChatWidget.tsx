
import { useState } from 'react';
import { ChatBubbleComponent } from '../ChatBubble';
import type { ChatBubbleConfig } from '../ChatBubble.types';

interface FloatingChatWidgetProps {
    config: ChatBubbleConfig;
    defaultOpen?: boolean;
}

export const FloatingChatWidget: React.FC<FloatingChatWidgetProps> = ({
    config,
    defaultOpen = false,
}) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    const toggleOpen = () => setIsOpen(!isOpen);

    // Override config for widget mode
    const widgetConfig: ChatBubbleConfig = {
        ...config,
        height: '100%', // Take full height of container
        header: {
            ...config.header,
            // Ensure title/avatar exist
            title: config.header?.title || 'Chat',
            avatar: config.header?.avatar || {
                type: 'icon',
                icon: 'smart_toy',
            },
            actions: [
                ...(config.header?.actions || []),
                {
                    id: 'close-widget',
                    icon: 'close',
                    ariaLabel: 'Close chat',
                    onClick: () => setIsOpen(false),
                },
            ],
        },
    };

    return (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-4">
            {/* Chat Window Container */}
            <div
                className={`
                    origin-bottom-right transition-all duration-300 ease-out
                    flex flex-col
                    bg-white dark:bg-slate-900 
                    rounded-2xl shadow-2xl 
                    overflow-hidden
                    border border-gray-200 dark:border-gray-800
                    ${isOpen
                        ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
                        : 'opacity-0 scale-95 translate-y-4 pointer-events-none'
                    }
                `}
                style={{
                    width: isOpen ? 'min(400px, 90vw)' : 'min(400px, 90vw)',
                    height: isOpen ? 'min(600px, 80vh)' : '0px',
                    // When closed, height 0 prevents layout issues, though scale/opacity handles visual.
                    // Actually, keep height fixed but hide it visually to allow animation.
                    // Using tailwind classes above is better.
                }}
            >
                {/* Only render component when "open" or keeping it mounted? 
                    Keeping it mounted preserves state (chat history). 
                    So we render it always but hide it. 
                */}
                <div className="h-full w-full">
                    <ChatBubbleComponent config={widgetConfig} />
                </div>
            </div>

            {/* Toggle Button */}
            <button
                onClick={toggleOpen}
                className={`
                    group relative flex items-center justify-center
                    w-14 h-14 
                    rounded-full 
                    bg-indigo-600 hover:bg-indigo-700 
                    text-white 
                    shadow-lg hover:shadow-xl hover:scale-105 active:scale-95
                    transition-all duration-300
                    outline-none focus:ring-4 focus:ring-indigo-500/30
                    pointer-events-auto
                `}
                aria-label={isOpen ? 'Close chat' : 'Open chat'}
            >
                <span
                    className={`
                        material-symbols-outlined text-2xl absolute
                        transition-all duration-300
                        ${isOpen ? 'rotate-90 opacity-0' : 'rotate-0 opacity-100'}
                    `}
                >
                    chat_bubble
                </span>
                <span
                    className={`
                        material-symbols-outlined text-2xl absolute
                        transition-all duration-300
                        ${isOpen ? 'rotate-0 opacity-100' : '-rotate-90 opacity-0'}
                    `}
                >
                    close
                </span>
            </button>
        </div>
    );
};
