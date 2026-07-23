/**
 * Message routing component
 */
import { memo } from 'react';
import type { ReactNode } from 'react';

import type { Message, ChatRenderers, BlockAction } from '../types.js';
import { AssistantMessage } from './AssistantMessage.js';
import { MessageWrapper } from './MessageWrapper.js';
import { SystemMessage } from './SystemMessage.js';
import { UserMessage } from './UserMessage.js';

export interface MessageItemProps {
  message: Message;
  renderers?: ChatRenderers;
  messageDecorator?: (message: Message, element: ReactNode) => ReactNode;
  onConfirmHumanRequest?: (requestId: string, response: unknown) => void;
  onBlockAction?: (action: BlockAction) => void;
  onCopyMessage?: (message: Message) => void;
  onResendMessage?: (message: Message) => void;
  onRegenerateMessage?: (message: Message) => void;
  onRollbackMessage?: (message: Message) => void;
  onForkMessage?: (message: Message) => void;
}

/** Built-in message renderers */
const builtinMessageRenderers: Record<string, React.ComponentType<{ message: Message }>> = {
  user: UserMessage,
  assistant: AssistantMessage,
  system: SystemMessage,
};

export const MessageItem = memo(function MessageItem({
  message,
  renderers,
  messageDecorator,
  onConfirmHumanRequest,
  onBlockAction,
  onCopyMessage,
  onResendMessage,
  onRegenerateMessage,
  onRollbackMessage,
  onForkMessage,
}: MessageItemProps) {
  // Find renderer: custom first, then built-in, fallback to SystemMessage
  const customRenderer = renderers?.messages?.[message.role];
  const BuiltinRenderer = builtinMessageRenderers[message.role];
  const Renderer = customRenderer ?? BuiltinRenderer ?? SystemMessage;

  const element = (
    <MessageWrapper
      message={message}
      onCopy={onCopyMessage}
      onResend={onResendMessage}
      onRegenerate={onRegenerateMessage}
      onRollback={onRollbackMessage}
      onFork={onForkMessage}
    >
      <Renderer
        message={message}
        onConfirmHumanRequest={onConfirmHumanRequest}
        onBlockAction={onBlockAction}
        renderers={renderers}
      />
    </MessageWrapper>
  );

  // Apply message decorator
  if (messageDecorator) {
    return <>{messageDecorator(message, element)}</>;
  }

  return <>{element}</>;
});
