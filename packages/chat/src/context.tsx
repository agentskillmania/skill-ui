/**
 * Chat component context
 */
import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import type { ChatRenderers, Message, BlockAction } from './types.js';

export interface ChatContextValue {
  /** Custom renderer registry */
  renderers: ChatRenderers;
  /** Human interaction confirmation callback */
  onConfirmHumanRequest?: (requestId: string, response: unknown) => void;
  /** Callback for block-emitted actions (e.g. A2UI surface interactions) */
  onBlockAction?: (action: BlockAction) => void;
  /** Message decorator */
  messageDecorator?: (message: Message, element: ReactNode) => ReactNode;
  /** Copy message callback */
  onCopyMessage?: (message: Message) => void;
  /** Resend user message callback */
  onResendMessage?: (message: Message) => void;
  /** Regenerate assistant message callback */
  onRegenerateMessage?: (message: Message) => void;
  /** Rollback to message callback */
  onRollbackMessage?: (message: Message) => void;
  /** Fork from message callback */
  onForkMessage?: (message: Message) => void;
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
