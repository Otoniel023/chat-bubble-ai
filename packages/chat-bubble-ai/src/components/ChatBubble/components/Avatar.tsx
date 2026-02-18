import React from 'react';
import type { AvatarConfig } from '../ChatBubble.types';

interface AvatarProps {
    config: AvatarConfig;
    className?: string;
}

const sizeMap = {
    sm: '2rem',   // 32px
    md: '2.5rem', // 40px
    lg: '3rem',   // 48px
};

export const Avatar: React.FC<AvatarProps> = ({ config, className = '' }) => {
    const {
        type,
        src,
        icon,
        text,
        alt = 'Avatar',
        backgroundColor = 'rgba(19, 127, 236, 0.1)',
        textColor = '#137fec',
        showOnlineStatus = false,
        size = 'md',
    } = config;

    const sizePx = sizeMap[size];

    const renderAvatarContent = () => {
        switch (type) {
            case 'image':
                return (
                    <img
                        src={src}
                        alt={alt}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                );

            case 'icon':
                if (React.isValidElement(icon)) {
                    return icon;
                }

                if (typeof icon === 'string') {
                    if (icon === 'smart_toy') {
                        return (
                            <img
                                src="https://photos.dominicanatours.com/imagenes/domi.webp"
                                alt={alt}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        );
                    }
                    // Generic string icon fallback
                    return (
                        <span style={{ fontSize: size === 'sm' ? '0.875rem' : size === 'lg' ? '1.5rem' : '1.25rem' }}>
                            {icon}
                        </span>
                    );
                }

                // Fallback: default avatar image
                return (
                    <img
                        src="https://photos.dominicanatours.com/imagenes/domi.webp"
                        alt={alt}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                );

            case 'text':
                return (
                    <span style={{
                        fontSize: size === 'sm' ? '0.75rem' : size === 'lg' ? '1.25rem' : '1rem',
                        fontWeight: 600,
                    }}>
                        {text || '?'}
                    </span>
                );

            default:
                return null;
        }
    };

    return (
        <div
            className={className}
            style={{ position: 'relative', flexShrink: 0 }}
        >
            <div
                style={{
                    width: sizePx,
                    height: sizePx,
                    backgroundColor,
                    color: textColor,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    border: type === 'image' ? '1px solid rgba(0,0,0,0.1)' : 'none',
                    flexShrink: 0,
                }}
            >
                {renderAvatarContent()}
            </div>

            {showOnlineStatus && (
                <div style={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: '0.75rem',
                    height: '0.75rem',
                    backgroundColor: '#22c55e',
                    borderRadius: '50%',
                    border: '2px solid white',
                }} />
            )}
        </div>
    );
};
