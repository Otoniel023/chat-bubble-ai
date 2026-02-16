
import { useState, useEffect } from 'react';
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
    const [showNotification, setShowNotification] = useState(false);

    const toggleOpen = () => {
        setIsOpen(!isOpen);
        if (!isOpen) setShowNotification(false);
    };

    // Unified notification logic
    useEffect(() => {
        // Don't show notification if chat is open or notification not configured
        if (isOpen || !config.notification) {
            setShowNotification(false);
            return;
        }

        const intervalTime = config.notification.interval || 30000;
        const durationTime = config.notification.duration || 5000;

        let hideTimer: NodeJS.Timeout;

        const showCycle = () => {
            setShowNotification(true);
            hideTimer = setTimeout(() => {
                setShowNotification(false);
            }, durationTime);
        };

        // Show immediately on mount
        showCycle();

        // Then show periodically
        const intervalId = setInterval(() => {
            showCycle();
        }, intervalTime);

        return () => {
            clearInterval(intervalId);
            clearTimeout(hideTimer);
        };
    }, [isOpen, config.notification]);

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

    // Animation logic
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        if (!config.launcher?.animationImages || config.launcher.animationImages.length === 0) {
            return;
        }

        // Only animate if notification is visible
        if (!showNotification) {
            setCurrentImageIndex(0); // Reset for next time
            return;
        }

        const intervalTime = config.launcher.animationInterval || 400;
        const intervalId = setInterval(() => {
            setCurrentImageIndex((prev) =>
                (prev + 1) % (config.launcher?.animationImages?.length || 1)
            );
        }, intervalTime);

        return () => clearInterval(intervalId);
    }, [config.launcher?.animationImages, config.launcher?.animationInterval, showNotification]);

    const launcherImage = (showNotification && config.launcher?.animationImages?.length)
        ? config.launcher.animationImages[currentImageIndex]
        : config.launcher?.imageUrl;

    return (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-1">
            {/* Chat Window Container */}
            <div
                className={`
                    origin-bottom-right transition-all duration-300 ease-out
                    flex flex-col
                    bg-white dark:bg-slate-900
                    rounded-md shadow-2xl
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
                }}
            >
                <div className="h-full w-full">
                    <ChatBubbleComponent config={widgetConfig} />
                </div>
            </div>
            {/* Red tail triangle */}
            {(isOpen) && <div
                className="relative -bottom-6 right-4 z-50 mr-4"
                style={{
                    width: 0,
                    height: 0,
                    borderLeft: '8px solid transparent',
                    borderRight: '8px solid transparent',
                    borderTop: '10px solid #fb2c36'
                }}
            >
            </div>}
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
                    overflow-hidden
                `}
                style={{
                    backgroundColor: config.launcher?.color
                }}
                aria-label={isOpen ? 'Close chat' : 'Open chat'}
            >
                <div
                    className={`
                         absolute inset-0 flex items-center justify-center
                        transition-all duration-300
                        ${isOpen ? 'rotate-90 opacity-0' : 'rotate-0 opacity-100'}
                    `}
                >
                    {launcherImage ? (
                        <img
                            src={launcherImage}
                            alt="Chat"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <span className="material-symbols-outlined text-2xl">
                            {config.launcher?.icon || 'chat_bubble'}
                        </span>
                    )}
                </div>

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

            {/* Notification Bubble */}
            {config.notification && showNotification && !isOpen && (
                <div
                    className="overflow-visible pointer-events-none gap-1 rounded-md flex-col absolute -top-[190px] md:top[-100px] right-0 font-semibold z-10 flex justify-end items-end"
                    style={{
                        transform: 'translateX(-20px) translateY(-210px)',
                        width: config.notification.width || '230px',
                        minHeight: config.notification.height || '220px',
                        ...config.notification.style
                    }}
                >
                    {config.notification.message &&


                        <div
                            className=" text-wrap relative rounded-md bg-white p-2 border border-gray-200 shadow-md h-max w-full text-center text-base overflow-visible"

                        >
                            {config.notification.message}
                            <div className=" bg-white top-1 right-4 absolute"
                                style={{
                                    clipPath: "polygon(2% 0, 75% 0, 100% 100%)",
                                    transform: "translateY(-10%)",
                                    height: "30px",
                                    width: "30px"
                                }}>

                            </div>
                        </div>

                    }


                </div>
            )}

        </div>
    );
};
