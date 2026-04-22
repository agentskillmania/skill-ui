/**
 * Chat component context
 */
import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import type { ChatRenderers, Message } from './types.js';

export interface ChatContextValue {
  /** Custom renderer registry */
  renderers: ChatRenderers;
  /** Human interaction confirmation callback */
  onConfirmHumanRequest?: (requestId: string, response: unknown) => void;
  /** Message decorator */
  messageDecorator?: (message: Message, element: ReactNode) => ReactNode;
}

export const ChatContext = createContext<ChatContextValue | null>(null);

/** Get Chat context */
export function useChatContext(): ChatContextValue {
  const ctx = useContext(ChatContext);
  if (!ctx) {
    throw new Error('useChatContext must be used inside Chat component');
  }
  return ctx;
}
