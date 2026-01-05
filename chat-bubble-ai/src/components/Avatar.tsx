import React from 'react';
import { AvatarConfig } from '../types/chat.types';

interface AvatarProps {
  config: AvatarConfig;
  className?: string;
}

const sizeClasses = {
  sm: 'size-8',
  md: 'size-10',
  lg: 'size-12',
};

export const Avatar: React.FC<AvatarProps> = ({ config, className = '' }) => {
  const {
    type,
    src,
    icon,
    text,
    alt = 'Avatar',
    backgroundColor = 'bg-primary/20',
    textColor = 'text-primary',
    showOnlineStatus = false,
    size = 'md',
  } = config;

  const sizeClass = sizeClasses[size];

  const renderAvatarContent = () => {
    switch (type) {
      case 'image':
        return (
          <img
            src={src}
            alt={alt}
            className="w-full h-full object-cover"
          />
        );

      case 'icon':
        return (
          <span className={`material-symbols-outlined ${size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-2xl' : 'text-xl'}`}>
            {icon || 'smart_toy'}
          </span>
        );

      case 'text':
        return (
          <span className={`font-bold ${size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-lg' : 'text-base'}`}>
            {text || '?'}
          </span>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`relative shrink-0 ${className}`}>
      <div
        className={`${sizeClass} ${backgroundColor} ${textColor} rounded-full flex items-center justify-center overflow-hidden ${
          type === 'image' ? 'border border-slate-200 dark:border-border-dark' : ''
        }`}
      >
        {renderAvatarContent()}
      </div>

      {showOnlineStatus && (
        <div className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full border-2 border-white dark:border-background-dark" />
      )}
    </div>
  );
};
