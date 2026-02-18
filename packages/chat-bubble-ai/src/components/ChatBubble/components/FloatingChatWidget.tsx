
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
    const [isMobile, setIsMobile] = useState(false);
    const [pillVisible, setPillVisible] = useState(true);

    // Detect mobile breakpoint
    const breakpoint = config.launcher?.mobilePill?.breakpoint ?? 768;
    useEffect(() => {
        const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
        const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
        setIsMobile(mq.matches);
        mq.addEventListener('change', handler);
        return () => mq.removeEventListener('change', handler);
    }, [breakpoint]);

    const toggleOpen = () => {
        setIsOpen(!isOpen);
        if (!isOpen) setShowNotification(false);
    };

    // Notification cycle
    useEffect(() => {
        if (isOpen || !config.notification) {
            setShowNotification(false);
            return;
        }
        const intervalTime = config.notification.interval || 30000;
        const durationTime = config.notification.duration || 5000;
        let hideTimer: ReturnType<typeof setTimeout>;
        const showCycle = () => {
            setShowNotification(true);
            hideTimer = setTimeout(() => setShowNotification(false), durationTime);
        };
        showCycle();
        const intervalId = setInterval(showCycle, intervalTime);
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

    // Launcher image animation
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    useEffect(() => {
        if (!config.launcher?.animationImages?.length) return;
        if (!showNotification) { setCurrentImageIndex(0); return; }
        const intervalTime = config.launcher.animationInterval || 400;
        const intervalId = setInterval(() => {
            setCurrentImageIndex(prev =>
                (prev + 1) % (config.launcher?.animationImages?.length || 1)
            );
        }, intervalTime);
        return () => clearInterval(intervalId);
    }, [config.launcher?.animationImages, config.launcher?.animationInterval, showNotification]);

    const launcherImage = (showNotification && config.launcher?.animationImages?.length)
        ? config.launcher.animationImages[currentImageIndex]
        : config.launcher?.imageUrl;

    const baseZIndex = 9999;

    // ─── MOBILE PILL MODE ───────────────────────────────────────────────────────
    const hasMobilePill = !!config.launcher?.mobilePill;

    if (hasMobilePill && isMobile) {
        const pillColor = config.launcher?.mobilePill?.color || '#ff8800';
        const pillBottom = config.launcher?.mobilePill?.bottom || '1dvh';

        return (
            <>
                {/* Chat window — slides up from bottom on mobile */}
                {isOpen && (
                    <div
                        style={{
                            position: 'fixed',
                            bottom: '0',
                            left: '0',
                            right: '0',
                            height: 'min(650px, 85dvh)',
                            zIndex: baseZIndex + 1,
                            display: 'flex',
                            flexDirection: 'column',
                            backgroundColor: config.theme?.cssVariables?.colorSurfaceLight || '#ffffff',
                            boxShadow: '0 -8px 32px rgba(0,0,0,0.18)',
                            borderRadius: '16px 16px 0 0',
                            overflow: 'hidden',
                            animation: 'slideUp 250ms ease-out',
                            fontFamily: config.theme?.cssVariables?.fontSans || 'system-ui, sans-serif',
                            ...config.style,
                        }}
                    >
                        <style>{`
                            @keyframes slideUp {
                                from { transform: translateY(100%); opacity: 0; }
                                to   { transform: translateY(0);    opacity: 1; }
                            }
                        `}</style>
                        <ChatBubbleComponent config={widgetConfig} />
                    </div>
                )}

                {/* Pill — fixed to right edge */}
                <div
                    style={{
                        position: 'fixed',
                        bottom: pillBottom,
                        right: 0,
                        zIndex: baseZIndex,
                        display: 'flex',
                        alignItems: 'center',
                        transition: 'transform 300ms ease',
                        transform: pillVisible ? 'translateX(0)' : 'translateX(calc(100% - 52px))',
                        fontFamily: config.theme?.cssVariables?.fontSans || 'system-ui, sans-serif',
                    }}
                >
                    {/* Pill container */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            borderRadius: '9999px 0 0 9999px',
                            overflow: 'hidden',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.22)',
                            border: '2px solid rgba(255,255,255,0.22)',
                            borderRight: 'none',
                            background: pillColor,
                        }}
                    >
                        {/* Arrow toggle button */}
                        <button
                            onClick={() => setPillVisible(v => !v)}
                            aria-label={pillVisible ? 'Ocultar chat' : 'Mostrar chat'}
                            style={{
                                flexShrink: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '52px',
                                height: '64px',
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                padding: 0,
                            }}
                        >
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                background: 'rgba(255,255,255,0.22)',
                                border: '2px solid rgba(255,255,255,0.45)',
                            }}>
                                <svg
                                    width="18" height="18"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="white"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    style={{
                                        transition: 'transform 300ms ease',
                                        transform: pillVisible ? 'rotate(0deg)' : 'rotate(180deg)',
                                    }}
                                >
                                    <polyline points="9 18 15 12 9 6" />
                                </svg>
                            </div>
                        </button>

                        {/* Launcher button (Domi image) */}
                        <button
                            onClick={toggleOpen}
                            aria-label={isOpen ? 'Cerrar chat' : 'Abrir chat'}
                            style={{
                                flexShrink: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '60px',
                                height: '60px',
                                borderRadius: '50%',
                                background: 'rgba(255,255,255,0.15)',
                                border: '2px solid rgba(255,255,255,0.4)',
                                cursor: 'pointer',
                                margin: '0 6px 0 0',
                                overflow: 'hidden',
                                transition: 'transform 200ms ease',
                                position: 'relative',
                            }}
                        >
                            {/* Launcher image / icon */}
                            <div style={{
                                position: 'absolute', inset: 0,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                transition: 'all 300ms',
                                transform: isOpen ? 'rotate(90deg) scale(0.8)' : 'rotate(0deg) scale(1)',
                                opacity: isOpen ? 0 : 1,
                            }}>
                                {launcherImage ? (
                                    <img
                                        src={launcherImage}
                                        alt="Chat"
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                ) : (
                                    <ChatBubbleIcon size={28} />
                                )}
                            </div>
                            {/* Close icon */}
                            <div style={{
                                position: 'absolute', inset: 0,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                transition: 'all 300ms',
                                transform: isOpen ? 'rotate(0deg) scale(1)' : 'rotate(-90deg) scale(0.8)',
                                opacity: isOpen ? 1 : 0,
                                color: 'white',
                            }}>
                                <CloseIcon size={24} />
                            </div>

                            {/* Notification dot */}
                            {showNotification && !isOpen && (
                                <div style={{
                                    position: 'absolute', top: '4px', right: '4px',
                                    width: '10px', height: '10px',
                                    borderRadius: '50%',
                                    background: '#ef4444',
                                    border: '2px solid white',
                                    animation: 'ping 1s cubic-bezier(0,0,0.2,1) infinite',
                                }} />
                            )}
                        </button>
                    </div>

                    {/* Notification bubble */}
                    {config.notification && showNotification && !isOpen && pillVisible && (
                        <div style={{
                            position: 'absolute',
                            bottom: '72px',
                            right: '6px',
                            background: '#ffffff',
                            borderRadius: '10px',
                            padding: '10px 14px',
                            boxShadow: '0 4px 16px rgba(0,0,0,0.14)',
                            border: '1px solid #e5e7eb',
                            maxWidth: '280px',
                            fontSize: '0.875rem',
                            color: '#1f2937',
                            pointerEvents: 'none',
                            zIndex: baseZIndex + 2,
                            width: 'max-content',
                        }}>
                            {config.notification.message}
                            {/* Triangle pointer */}
                            <div style={{
                                position: 'absolute',
                                bottom: '-8px',
                                right: '20px',
                                width: 0, height: 0,
                                borderLeft: '8px solid transparent',
                                borderRight: '8px solid transparent',
                                borderTop: '8px solid #ffffff',
                                filter: 'drop-shadow(0 2px 1px rgba(0,0,0,0.06))',
                            }} />
                        </div>
                    )}
                </div>
            </>
        );
    }

    // ─── DESKTOP / DEFAULT MODE ─────────────────────────────────────────────────
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
            {/* Chat Window */}
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

            {/* Red tail triangle */}
            {isOpen && (
                <div
                    style={{
                        position: 'relative',
                        right: '16px',
                        zIndex: 50,
                        marginRight: '4px',
                        marginBottom: '4px',
                        width: 0, height: 0,
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
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
                    transition: 'all 300ms',
                    outline: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    overflow: 'hidden',
                    zIndex: baseZIndex + 1,
                }}
            >
                <div style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 300ms',
                    transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                    opacity: isOpen ? 0 : 1,
                }}>
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

                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '24px',
                    position: 'absolute',
                    transition: 'all 300ms',
                    transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
                    opacity: isOpen ? 1 : 0,
                }}>
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
                        transform: 'translateX(-5px) translateY(-60px)',
                        width: config.notification.width || '230px',
                        minHeight: config.notification.height || 'auto',
                        ...config.notification.style,
                    }}
                >
                    {config.notification.message && (
                        <div style={{
                            position: 'relative',
                            backgroundColor: '#ffffff',
                            padding: '8px',
                            borderRadius: '6px',
                            border: '1px solid #e5e7eb',
                            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                            width: '100%',
                            textAlign: 'center',
                            fontSize: '1rem',
                            color: '#1f2937',
                            overflow: 'visible',
                            zIndex: 9999,
                        }}>
                            {config.notification.message}
                            <div style={{
                                position: 'absolute',
                                top: '100%',
                                right: '16px',
                                width: 0, height: 0,
                                borderLeft: '10px solid transparent',
                                borderRight: '10px solid transparent',
                                borderTop: '10px solid #ffffff',
                                filter: 'drop-shadow(0 2px 1px rgba(0,0,0,0.05))',
                            }} />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
