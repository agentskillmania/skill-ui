/**
 * Message routing component
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

/** Built-in message renderers */
const builtinMessageRenderers: Record<string, React.ComponentType<{ message: Message }>> = {
  user: UserMessage,
  assistant: AssistantMessage,
  system: SystemMessage,
};

export function MessageItem({ message }: MessageItemProps) {
  const { renderers, messageDecorator } = useChatContext();

  // Find renderer: custom first, then built-in, fallback to SystemMessage
  const customRenderer = renderers.messages?.[message.role];
  const BuiltinRenderer = builtinMessageRenderers[message.role];
  const Renderer = customRenderer ?? BuiltinRenderer ?? SystemMessage;

  const element = (
    <MessageWrapper message={message}>
      <Renderer message={message} />
    </MessageWrapper>
  );

  // Apply message decorator
  if (messageDecorator) {
    return <>{messageDecorator(message, element)}</>;
  }

  return <>{element}</>;
}
