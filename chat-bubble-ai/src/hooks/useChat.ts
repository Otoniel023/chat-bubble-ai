/**
 * useChat Hook
 * Provides easy access to chat context
 */

import { useContext } from 'react';
import { ChatContext } from '../contexts/ChatContext';
import type { ChatContextValue } from '../contexts/ChatContext';

export const useChat = (): ChatContextValue => {
  const context = useContext(ChatContext);

  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }

  return context;
};
