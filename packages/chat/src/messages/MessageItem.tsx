/**
 * 消息路由分发组件
 */
import type { Message } from '../types.js';
import { useChatContext } from '../context.js';
import { MessageWrapper } from './MessageWrapper.js';
import { UserMessage } from './UserMessage.js';
import { AssistantMessage } from './AssistantMessage.js';
import { SystemMessage } from './SystemMessage.js';

export interface MessageItemProps {
  message: Message;
}

/** 内置消息渲染器 */
const builtinMessageRenderers: Record<string, React.ComponentType<{ message: Message }>> = {
  user: UserMessage,
  assistant: AssistantMessage,
  system: SystemMessage,
};

export function MessageItem({ message }: MessageItemProps) {
  const { renderers, messageDecorator } = useChatContext();

  // 查找渲染器：自定义优先，然后内置，最后兜底 SystemMessage
  const customRenderer = renderers.messages?.[message.role];
  const BuiltinRenderer = builtinMessageRenderers[message.role];
  const Renderer = customRenderer ?? BuiltinRenderer ?? SystemMessage;

  const element = (
    <MessageWrapper message={message}>
      <Renderer message={message} />
    </MessageWrapper>
  );

  // 应用消息装饰器
  if (messageDecorator) {
    return <>{messageDecorator(message, element)}</>;
  }

  return <>{element}</>;
}
