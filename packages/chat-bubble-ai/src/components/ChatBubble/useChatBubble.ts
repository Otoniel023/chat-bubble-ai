/**
 * useChatBubble hook
 * A convenience hook to access the ChatBubbleContext.
 */

import { useContext } from 'react';
import { ChatBubbleContext } from './ChatBubbleContext';
import type { ChatContextValue } from './ChatBubble.types';

export const useChatBubble = (): ChatContextValue => {
    const context = useContext(ChatBubbleContext);
    if (context === undefined) {
        throw new Error('useChatBubble must be used within a ChatBubbleProvider');
    }
    return context;
};
