/**
 * Chat 组件上下文
 */
import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import type { ChatRenderers, Message } from './types.js';

export interface ChatContextValue {
  /** 自定义渲染器注册表 */
  renderers: ChatRenderers;
  /** 人机交互确认回调 */
  onConfirmHumanRequest?: (requestId: string, response: unknown) => void;
  /** 消息装饰器 */
  messageDecorator?: (message: Message, element: ReactNode) => ReactNode;
}

export const ChatContext = createContext<ChatContextValue | null>(null);

/** 获取 Chat 上下文 */
export function useChatContext(): ChatContextValue {
  const ctx = useContext(ChatContext);
  if (!ctx) {
    throw new Error('useChatContext 必须在 Chat 组件内部使用');
  }
  return ctx;
}
