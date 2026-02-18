import React from 'react';

export const IconProps = {
    size: 24,
    className: '',
};

interface IconComponentProps {
    size?: number;
    className?: string;
}

export const SmartToyIcon: React.FC<IconComponentProps> = ({ size = 24, className = '' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" height={size} viewBox="0 -960 960 960" width={size} fill="currentColor" className={className}>
        <path d="M480-120q-134 0-227-93t-93-227v-60h480v60q0 134-93 227t-227 93Zm-40-520h80v-200h-80v200Zm184 280q17 0 28.5-11.5T664-400q0-17-11.5-28.5T624-440q-17 0-28.5 11.5T584-400q0 17 11.5 28.5T624-360Zm-288 0q17 0 28.5-11.5T376-400q0-17-11.5-28.5T336-440q-17 0-28.5 11.5T296-400q0 17 11.5 28.5T336-360ZM160-520v-80h80v-80h80v-80h320v80h80v80h80v80h-80v60q0 148-97 258.5T480-69q-125 0-222.5-110.5T160-438v-82h-60v-280h60v280h60Z" />
    </svg>
);

export const SendIcon: React.FC<IconComponentProps> = ({ size = 24, className = '' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" height={size} viewBox="0 -960 960 960" width={size} fill="currentColor" className={className}>
        <path d="M120-160v-640l760 320-760 320Zm80-120 474-200-474-200v140l240 60-240 60v140Zm0 0v-400 400Z" />
    </svg>
);

export const CloseIcon: React.FC<IconComponentProps> = ({ size = 24, className = '' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" height={size} viewBox="0 -960 960 960" width={size} fill="currentColor" className={className}>
        <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
    </svg>
);

export const ChatIcon: React.FC<IconComponentProps> = ({ size = 24, className = '' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" height={size} viewBox="0 -960 960 960" width={size} fill="currentColor" className={className}>
        <path d="M240-400h320v-80H240v80Zm0-120h480v-80H240v80Zm0-120h480v-80H240v80ZM80-80v-720q0-33 23.5-56.5T160-880h640q33 0 56.5 23.5T880-800v480q0 33-23.5 56.5T800-240H240L80-80Zm126-240h594v-480H160v525l46-45Zm-46 0v-480 480Z" />
    </svg>
);

export const ChatBubbleIcon: React.FC<IconComponentProps> = ({ size = 24, className = '' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" height={size} viewBox="0 -960 960 960" width={size} fill="currentColor" className={className}>
        <path d="M480-160q-45 0-88.5-10t-82.5-30L160-80v-223q-35-35-57.5-81.5T80-481q0-166 128.5-282.5T480-880q166 0 294.5 116.5T903-481q0 165-128.5 281.5T480-160Zm0-80q131 0 231.5-92.5T812-481q0-130-100.5-222.5T480-796q-131 0-231.5 92.5T148-481q0 60 21 113.5t57 96.5l29 27 6 39v103l90-53 38 12q28 9 56.5 13.5T480-240Zm0-241Z" />
    </svg>
);

export const MoodIcon: React.FC<IconComponentProps> = ({ size = 24, className = '' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" height={size} viewBox="0 -960 960 960" width={size} fill="currentColor" className={className}>
        <path d="M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm-144-420q25 0 42.5-17t17.5-43q0-26-17.5-43T336-600q-25 0-42.5 17T276-540q0 26 17.5 43t42.5 17Zm288 0q25 0 42.5-17t17.5-43q0-26-17.5-43T624-600q-25 0-42.5 17T564-540q0 26 17.5 43t42.5 17ZM480-280q52 0 97-28.5t69-79.5h-332q24 51 69 79.5t97 28.5Z" />
    </svg>
);

export const MicIcon: React.FC<IconComponentProps> = ({ size = 24, className = '' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" height={size} viewBox="0 -960 960 960" width={size} fill="currentColor" className={className}>
        <path d="M480-400q-50 0-85-35t-35-85v-240q0-50 35-85t85-35q50 0 85 35t35 85v240q0 50-35 85t-85 35Zm0-240Zm-40 520v-123q-104-14-172-93t-68-184h80q0 83 58.5 141.5T480-320q83 0 141.5-58.5T680-520h80q0 105-68 184t-172 93v123h-80Zm40-360q17 0 28.5-11.5T520-520v-240q0-17-11.5-28.5T480-800q-17 0-28.5 11.5T440-760v240q0 17 11.5 28.5T480-480Z" />
    </svg>
);
