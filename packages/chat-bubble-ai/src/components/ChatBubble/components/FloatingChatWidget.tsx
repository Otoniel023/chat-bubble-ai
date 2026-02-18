
import React, { useState, useEffect } from 'react';
import { ChatBubbleComponent } from '../ChatBubble';
import type { ChatBubbleConfig } from '../ChatBubble.types';
import { ChatBubbleIcon, CloseIcon } from './icons';

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
        // ... (existing logic)
        setIsOpen(!isOpen);
        if (!isOpen) setShowNotification(false);
    };

    // ... (useEffect for notification)
    useEffect(() => {
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

        showCycle();

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
        height: '100%',
        header: {
            ...config.header,
            title: config.header?.title || 'Chat',
            avatar: config.header?.avatar || {
                type: 'image',
                src: 'https://photos.dominicanatours.com/imagenes/domi.webp',
            },
            actions: [
                ...(config.header?.actions || []),
                {
                    id: 'close-widget',
                    icon: <CloseIcon />,
                    ariaLabel: 'Close chat',
                    onClick: () => setIsOpen(false),
                },
            ],
        },
    };

    // Animation logic (unchanged)
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        if (!config.launcher?.animationImages || config.launcher.animationImages.length === 0) {
            return;
        }

        if (!showNotification) {
            setCurrentImageIndex(0);
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

    const baseZIndex = 9999;

    return (
        <div
            style={{
                position: 'fixed',
                bottom: '24px',
                right: '24px',
                zIndex: baseZIndex,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                fontFamily: config.theme?.cssVariables?.fontSans || 'system-ui, sans-serif',
                ...config.style,
            }}
        >
            {/* Chat Window Container */}
            <div
                style={{
                    transformOrigin: 'bottom right',
                    transition: 'all 300ms ease-out',
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: config.theme?.cssVariables?.colorSurfaceLight || '#ffffff',
                    borderRadius: '12px',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                    overflow: 'hidden',
                    border: `1px solid ${config.theme?.cssVariables?.colorBorderLight || '#e2e8f0'}`,
                    opacity: isOpen ? 1 : 0,
                    transform: isOpen ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(16px)',
                    pointerEvents: isOpen ? 'auto' : 'none',
                    width: isOpen ? 'min(450px, 90vw)' : 'min(400px, 90vw)',
                    height: isOpen ? 'min(650px, 80vh)' : '0px',
                    marginBottom: isOpen ? '8px' : '0',
                }}
            >
                <div style={{ height: '100%', width: '100%' }}>
                    <ChatBubbleComponent config={widgetConfig} />
                </div>
            </div>

            {/* Red tail triangle - Only show when open */}
            {isOpen && (
                <div
                    style={{
                        position: 'relative',
                        right: '16px',
                        zIndex: 50,
                        marginRight: '4px',
                        marginBottom: '4px',
                        width: 0,
                        height: 0,
                        borderLeft: '8px solid transparent',
                        borderRight: '8px solid transparent',
                        borderTop: '10px solid #fb2c36',
                    }}
                />
            )}

            {/* Toggle Button */}
            <button
                onClick={toggleOpen}
                aria-label={isOpen ? 'Close chat' : 'Open chat'}
                style={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '56px',
                    height: '56px',
                    borderRadius: '9999px',
                    backgroundColor: config.launcher?.color || '#4f46e5',
                    color: '#ffffff',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                    transition: 'all 300ms',
                    outline: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    overflow: 'hidden',
                    zIndex: baseZIndex + 1,
                }}
            >
                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 300ms',
                        transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                        opacity: isOpen ? 0 : 1,
                    }}
                >
                    {launcherImage ? (
                        <img
                            src={launcherImage}
                            alt="Chat"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    ) : (
                        typeof config.launcher?.icon === 'string' ? (
                            <span style={{ fontSize: '24px' }}>
                                {config.launcher?.icon || 'chat_bubble'}
                            </span>
                        ) : (
                            config.launcher?.icon || <ChatBubbleIcon size={24} />
                        )
                    )}
                </div>

                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '24px',
                        position: 'absolute',
                        transition: 'all 300ms',
                        transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
                        opacity: isOpen ? 1 : 0,
                    }}
                >
                    <CloseIcon size={24} />
                </div>
            </button>


            {/* Notification Bubble */}
            {config.notification && showNotification && !isOpen && (
                <div
                    style={{
                        position: 'absolute',
                        right: 0,
                        zIndex: baseZIndex + 2,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-end',
                        alignItems: 'flex-end',
                        pointerEvents: 'none',
                        overflow: 'visible',
                        transform: 'translateX(-5px) translateY(-60px)', // adjusted from original
                        width: config.notification.width || '230px',
                        minHeight: config.notification.height || 'auto',
                        ...config.notification.style
                    }}
                >
                    {config.notification.message && (
                        <div
                            style={{
                                position: 'relative',
                                backgroundColor: '#ffffff',
                                padding: '8px',
                                borderRadius: '6px',
                                border: '1px solid #e5e7eb', // gray-200
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                width: '100%',
                                textAlign: 'center',
                                fontSize: '1rem',
                                color: '#1f2937', // gray-800
                                overflow: 'visible',
                                zIndex: 9999,
                            }}
                        >
                            {config.notification.message}
                            <div
                                style={{
                                    position: 'absolute',
                                    top: '100%', // Bottom of bubble
                                    right: '16px',
                                    width: '0',
                                    height: '0',
                                    borderLeft: '10px solid transparent',
                                    borderRight: '10px solid transparent',
                                    borderTop: '10px solid #ffffff', // Match bg
                                    filter: 'drop-shadow(0 2px 1px rgba(0,0,0,0.05))' // tricky with border triangle
                                }}
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
