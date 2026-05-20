
import React, { useState, useEffect, useRef, useContext } from 'react';
import { ChatBubbleComponent } from '../ChatBubble';
import { ChatBubbleContext } from '../ChatBubbleContext';
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
    // Initialize unreadCount to 1 if there's an initialMessage and chat is not defaultOpen
    const [unreadCount, setUnreadCount] = useState(
        config.initialMessage && !defaultOpen ? 1 : 0
    );

    // Override message: when the AI responds while the chat is closed, show that
    // message as a temporary notification before resuming the normal cycle.
    const [overrideNotificationMessage, setOverrideNotificationMessage] = useState<string | null>(null);
    const overrideRef = useRef<string | null>(null);
    useEffect(() => { overrideRef.current = overrideNotificationMessage; }, [overrideNotificationMessage]);

    // Ref para leer isOpen dentro de timers sin reiniciar el ciclo de notificaciones
    const isOpenRef = useRef(isOpen);
    useEffect(() => { isOpenRef.current = isOpen; }, [isOpen]);

    // Inject initialMessage from config into the external ChatBubbleProvider
    const chatCtx = useContext(ChatBubbleContext);
    const initialMsgInjected = useRef(false);
    const isTyping = chatCtx?.isTyping || false;

    // Check if we should prioritize the notification over initial message
    const showImmediately = config.notification?.showImmediately !== false; // default true
    const shouldPrioritizeNotification = config.notification && showImmediately;

    useEffect(() => {
        if (
            config.initialMessage &&
            chatCtx &&
            chatCtx.messages.length === 0 &&
            chatCtx.injectMessage &&
            !initialMsgInjected.current
        ) {
            // If we should prioritize notification and chat is not open, delay initial message
            if (shouldPrioritizeNotification && !isOpen) {
                return; // Don't inject yet, wait until chat opens
            }

            // Inject the initial message (either immediately or when chat opens)
            initialMsgInjected.current = true;
            // Use setTimeout to ensure injection happens after state updates
            setTimeout(() => {
                if (chatCtx.injectMessage) {
                    chatCtx.injectMessage(config.initialMessage!, 'assistant');
                }
            }, 0);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [config.initialMessage, shouldPrioritizeNotification, isOpen]);

    // When the AI finishes responding while the chat is closed, show its message
    // as a temporary override notification.
    const lastShownAssistantMsgId = useRef<string | null>(null);
    useEffect(() => {
        if (!config.notification) return;
        if (!chatCtx?.messages) return;

        // Find the most recent completed assistant message
        const msgs = chatCtx.messages;
        const lastAssistant = [...msgs].reverse().find(
            (m) => m.role === 'assistant' && m.status === 'sent'
        );

        if (!lastAssistant) return;
        // Skip the initial injected message  
        if (lastAssistant.id === 'initial-msg') return;
        // Skip already-shown messages
        if (lastAssistant.id === lastShownAssistantMsgId.current) return;

        // Only trigger the override when the chat panel is closed
        if (isOpenRef.current) {
            // If the chat is open just mark it as seen so we don't show it later
            lastShownAssistantMsgId.current = lastAssistant.id;
            return;
        }

        lastShownAssistantMsgId.current = lastAssistant.id;

        // Truncate long responses for the notification bubble
        const maxLen = 120;
        const rawText = lastAssistant.content;
        const notifText = rawText.length > maxLen
            ? rawText.slice(0, maxLen).trimEnd() + '…'
            : rawText;

        // Show the AI response as the notification message
        setOverrideNotificationMessage(notifText);
        setShowNotification(true);

        // Increment unread count
        setUnreadCount(prev => prev + 1);

        const durationTime = config.notification.duration || 5000;
        const hideTimer = setTimeout(() => {
            setShowNotification(false);
            setOverrideNotificationMessage(null);
        }, durationTime);

        return () => clearTimeout(hideTimer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [chatCtx?.messages]);

    // Inject ping keyframe once
    // Keyframe injection is deferred to after dot config is computed (see below)

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
        const willOpen = !isOpen;
        setIsOpen(willOpen);

        if (willOpen) {
            setShowNotification(false);
            setUnreadCount(0); // Reset unread count when opening chat
            // Note: initial message injection is handled by the useEffect above
        }
    };

    // Ocultar notificación al abrir el chat (efecto ligero, no reinicia el ciclo)
    useEffect(() => {
        if (isOpen) {
            setShowNotification(false);
            setUnreadCount(0); // Reset unread count when chat opens
        }
    }, [isOpen]);

    // Ocultar notificación cuando el asistente comienza a escribir
    useEffect(() => {
        if (isTyping) {
            setShowNotification(false);
        }
    }, [isTyping]);

    // Ciclo de notificaciones — corre de forma independiente sin depender de isOpen.
    // Usa isOpenRef para saber si el chat está abierto sin reiniciar los timers.
    useEffect(() => {
        if (!config.notification) return;

        const intervalTime = config.notification.interval || 30000;
        const durationTime = config.notification.duration || 5000;
        const showImmediately = config.notification.showImmediately !== false; // default true

        let showTimer: ReturnType<typeof setTimeout>;
        let hideTimer: ReturnType<typeof setTimeout>;

        const runCycle = () => {
            // Solo mostrar si el chat está cerrado, no hay un override activo, y no está escribiendo
            if (!isOpenRef.current && !overrideRef.current && !isTyping) setShowNotification(true);
            hideTimer = setTimeout(() => {
                // Only clear the notification if it hasn't already been replaced by an override
                if (!overrideRef.current) setShowNotification(false);
                // Programar la siguiente aparición sin importar si el chat estaba abierto
                showTimer = setTimeout(runCycle, intervalTime);
            }, durationTime);
        };

        if (showImmediately) {
            runCycle();
        } else {
            showTimer = setTimeout(runCycle, intervalTime);
        }

        return () => {
            clearTimeout(showTimer);
            clearTimeout(hideTimer);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [config.notification]); // isOpen eliminado: el ciclo ya no se reinicia al cerrar el chat


    // Override config for widget mode
    const widgetConfig: ChatBubbleConfig = {
        ...config,
        height: '100%',
        header: {
            ...config.header,
            title: config.header?.title || 'Chat',
            avatar: config.header?.avatar || {
                type: 'image',
                src: '',
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

    // ─── DOT CONFIG ─────────────────────────────────────────────────────────────
    const dotCfg = config.notification?.dot;
    const dotShow = dotCfg?.show !== false; // default true
    const dotColor = dotCfg?.color || '#ef4444';
    const dotSize = dotCfg?.size ?? 10;
    const dotRingColor = dotCfg?.ringColor || dotColor;
    const dotAnimDuration = dotCfg?.animationDuration ?? 1.2;
    const dotAnimScale = dotCfg?.animationScale ?? 2.2;
    const dotTop = dotCfg?.position?.top ?? '4px';
    const dotRight = dotCfg?.position?.right ?? '4px';
    // Wrapper is dotSize + 4px padding on each side
    const dotWrapperSize = dotSize + 4;
    // Bubble dot position
    const dotBubbleSide = dotCfg?.bubblePosition?.side ?? 'left';
    // const dotBubbleOffset = dotCfg?.bubblePosition?.offset ?? '10px';
    // Card padding: leave room for the dot on whichever side it's on
    const dotBubblePad = dotShow ? `${dotWrapperSize + 8}px` : '10px';
    const bubbleCardPadding = dotBubbleSide === 'left'
        ? `10px 12px 10px ${dotBubblePad}`
        : `10px ${dotBubblePad} 10px 12px`;

    // Inject ping keyframe with current scale (unique per scale value)
    const pingKeyframeName = `chat-bubble-ping-${Math.round(dotAnimScale * 10)}`;

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        const styleId = `chat-bubble-ping-style-${Math.round(dotAnimScale * 10)}`;
        if (document.getElementById(styleId)) return;
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            @keyframes ${pingKeyframeName} {
                0%   { transform: scale(1);              opacity: 0.65; }
                70%  { transform: scale(${dotAnimScale}); opacity: 0;   }
                100% { transform: scale(${dotAnimScale}); opacity: 0;   }
            }
        `;
        document.head.appendChild(style);
    }, [dotAnimScale, pingKeyframeName]);

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
                            @keyframes typingDot {
                                0%, 60%, 100% {
                                    transform: translateY(0);
                                }
                                30% {
                                    transform: translateY(-4px);
                                }
                            }
                        `}</style>
                        <ChatBubbleComponent config={widgetConfig} isOpen={isOpen} />
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
                        flexDirection: 'column',
                        alignItems: 'flex-end',
                        transition: 'transform 300ms ease',
                        transform: pillVisible ? 'translateX(0)' : 'translateX(calc(100% - 52px))',
                        fontFamily: config.theme?.cssVariables?.fontSans || 'system-ui, sans-serif',
                        maxWidth: '100dvw',
                        overflow: 'visible',
                    }}
                >
                    {/* Pill container */}
                    {/* Notification bubble */}
                    {config.notification && showNotification && !isOpen && !isTyping && pillVisible && (
                        <div style={{
                            position: 'relative',
                            background: '#ffffff',
                            borderRadius: '10px',
                            padding: bubbleCardPadding,
                            boxShadow: '0 4px 16px rgba(0,0,0,0.14)',
                            border: '1px solid #e5e7eb',
                            maxWidth: 'min(280px, calc(100dvw - 16px))',
                            width: 'max-content',
                            fontSize: '0.875rem',
                            color: '#1f2937',
                            pointerEvents: 'none',
                            zIndex: baseZIndex + 2,
                            alignSelf: 'flex-end',
                            marginBottom: '8px',
                            marginRight: '6px',
                            boxSizing: 'border-box',
                        }}>
                            {/* Ping dot inside mobile bubble */}
                            {showNotification && !isOpen && dotShow && (
                                <div style={{
                                    position: 'absolute',
                                    top: dotTop,
                                    right: dotRight,
                                    width: `${dotWrapperSize}px`,
                                    height: `${dotWrapperSize}px`,
                                }}>
                                    {/* Ripple ring */}
                                    <div style={{
                                        position: 'absolute',
                                        inset: 0,
                                        borderRadius: '50%',
                                        background: dotRingColor,
                                        animation: `${pingKeyframeName} ${dotAnimDuration}s ease-out infinite`,
                                    }} />
                                    {/* Solid dot */}
                                    <div style={{
                                        position: 'absolute',
                                        top: '2px', left: '2px',
                                        width: `${dotSize}px`, height: `${dotSize}px`,
                                        borderRadius: '50%',
                                        background: dotColor,
                                        border: '2px solid white',
                                    }} />
                                </div>
                            )}
                            <span dangerouslySetInnerHTML={{ __html: overrideNotificationMessage ?? config.notification.message ?? '' }} />
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
                                overflow: 'visible',
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
                                overflow: 'hidden',
                                borderRadius: '50%',
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

                            {/* Typing indicator */}
                            {!isOpen && isTyping && (
                                <div style={{
                                    position: 'absolute',
                                    top: '-4px',
                                    left: '-4px',
                                    minWidth: '32px',
                                    height: '24px',
                                    borderRadius: '12px',
                                    background: '#ffffff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '3px',
                                    padding: '0 8px',
                                    border: '2px solid rgba(255,255,255,0.4)',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                                    zIndex: 1,
                                }}>
                                    <div style={{
                                        width: '4px',
                                        height: '4px',
                                        borderRadius: '50%',
                                        background: '#6b7280',
                                        animation: 'typingDot 1.4s infinite',
                                        animationDelay: '0s',
                                    }} />
                                    <div style={{
                                        width: '4px',
                                        height: '4px',
                                        borderRadius: '50%',
                                        background: '#6b7280',
                                        animation: 'typingDot 1.4s infinite',
                                        animationDelay: '0.2s',
                                    }} />
                                    <div style={{
                                        width: '4px',
                                        height: '4px',
                                        borderRadius: '50%',
                                        background: '#6b7280',
                                        animation: 'typingDot 1.4s infinite',
                                        animationDelay: '0.4s',
                                    }} />
                                </div>
                            )}

                            {/* Unread badge */}
                            {!isOpen && !isTyping && unreadCount > 0 && !showNotification && (
                                <div style={{
                                    position: 'absolute',
                                    top: '-4px',
                                    left: '-4px',
                                    minWidth: '24px',
                                    height: '24px',
                                    borderRadius: '12px',
                                    background: '#ef4444',
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    padding: '0 6px',
                                    border: '2px solid white',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                                    zIndex: 1,
                                }}>
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </div>
                            )}

                        </button>
                    </div>

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
            <style>{`
                @keyframes typingDot {
                    0%, 60%, 100% {
                        transform: translateY(0);
                    }
                    30% {
                        transform: translateY(-4px);
                    }
                }
            `}</style>
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
                    width: isOpen ? 'min(450px, 90dvw)' : 'min(400px, 90dvw)',
                    height: isOpen ? 'min(650px, 80dvh)' : '0px',
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
                    overflow: 'visible',
                    zIndex: baseZIndex + 1,
                }}
            >
                <div style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 300ms',
                    transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                    opacity: isOpen ? 0 : 1,
                    overflow: 'hidden',
                    borderRadius: '9999px',
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

                {/* Typing indicator */}
                {!isOpen && isTyping && (
                    <div style={{
                        position: 'absolute',
                        top: '-4px',
                        left: '-4px',
                        minWidth: '32px',
                        height: '24px',
                        borderRadius: '12px',
                        background: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '3px',
                        padding: '0 8px',
                        border: '2px solid #e5e7eb',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                        zIndex: 1,
                    }}>
                        <div style={{
                            width: '4px',
                            height: '4px',
                            borderRadius: '50%',
                            background: '#6b7280',
                            animation: 'typingDot 1.4s infinite',
                            animationDelay: '0s',
                        }} />
                        <div style={{
                            width: '4px',
                            height: '4px',
                            borderRadius: '50%',
                            background: '#6b7280',
                            animation: 'typingDot 1.4s infinite',
                            animationDelay: '0.2s',
                        }} />
                        <div style={{
                            width: '4px',
                            height: '4px',
                            borderRadius: '50%',
                            background: '#6b7280',
                            animation: 'typingDot 1.4s infinite',
                            animationDelay: '0.4s',
                        }} />
                    </div>
                )}

                {/* Unread badge */}
                {!isOpen && !isTyping && unreadCount > 0 && !showNotification && (
                    <div style={{
                        position: 'absolute',
                        top: '-4px',
                        left: '-4px',
                        minWidth: '24px',
                        height: '24px',
                        borderRadius: '12px',
                        background: '#ef4444',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: '600',
                        padding: '0 6px',
                        border: '2px solid white',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                        zIndex: 1,
                    }}>
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </div>
                )}
            </button>



            {/* Notification Bubble */}
            {config.notification && showNotification && !isOpen && !isTyping && (
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
                            height: '60px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'flex-end',
                            alignItems: 'flex-end',
                        }}>
                            <div style={{
                                position: 'relative',
                                backgroundColor: '#ffffff',
                                padding: bubbleCardPadding,
                                borderRadius: '6px',
                                border: '1px solid #e5e7eb',
                                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                                width: '100%',
                                textAlign: 'left',
                                fontSize: '0.95rem',
                                color: '#1f2937',
                                overflow: 'visible',
                                zIndex: 9999,
                            }}>
                                {/* Ping dot inside the bubble */}
                                {showNotification && !isOpen && dotShow && (
                                    <div style={{
                                        position: 'absolute',
                                        top: dotTop,
                                        right: dotRight,
                                        width: `${dotWrapperSize}px`,
                                        height: `${dotWrapperSize}px`,
                                    }}>
                                        {/* Ripple ring */}
                                        <div style={{
                                            position: 'absolute',
                                            inset: 0,
                                            borderRadius: '50%',
                                            background: dotRingColor,
                                            animation: `${pingKeyframeName} ${dotAnimDuration}s ease-out infinite`,
                                        }} />
                                        {/* Solid dot */}
                                        <div style={{
                                            position: 'absolute',
                                            top: '2px', left: '2px',
                                            width: `${dotSize}px`, height: `${dotSize}px`,
                                            borderRadius: '50%',
                                            background: dotColor,
                                            border: '2px solid white',
                                        }} />
                                    </div>
                                )}
                                <span dangerouslySetInnerHTML={{ __html: overrideNotificationMessage ?? config.notification.message ?? '' }} />
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
                        </div>

                    )}
                </div>

            )}
        </div>
    );
};
