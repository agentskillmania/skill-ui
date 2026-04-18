/**
 * @agentskillmania/skill-ui-chat 统一导出
 */

// 组件
export { Chat } from './Chat/index.js';
export { MessageList } from './MessageList/index.js';
export { ChatInput } from './ChatInput/index.js';
export { MessageItem } from './messages/MessageItem.js';
export { MessageWrapper } from './messages/MessageWrapper.js';
export { UserMessage } from './messages/UserMessage.js';
export { AssistantMessage } from './messages/AssistantMessage.js';
export { SystemMessage } from './messages/SystemMessage.js';
export { BlocksRenderer } from './blocks/BlocksRenderer.js';
export { BlockCard } from './blocks/BlockCard.js';
export { ThinkingBlock } from './blocks/ThinkingBlock.js';
export { ToolCallBlock } from './blocks/ToolCallBlock.js';
export { PlanBlock } from './blocks/PlanBlock.js';
export { ErrorBlock } from './blocks/ErrorBlock.js';
export { HumanInputBlock } from './blocks/HumanInputBlock.js';
export { MarkdownRenderer } from './content/MarkdownRenderer.js';

// 类型
export type {
  Message,
  Block,
  MessageStatus,
  MessageRole,
  BlockStatus,
  HumanInputType,
  ChatProps,
  ChatRenderers,
  MessageProps,
  BlockProps,
  ToolCallMetadata,
  PlanStep,
  PlanMetadata,
  HumanInputMetadata,
  ErrorMetadata,
} from './types.js';

// 组件 Props 类型
export type { MessageListProps } from './MessageList/index.js';
export type { ChatInputProps } from './ChatInput/index.js';
export type { MessageItemProps } from './messages/MessageItem.js';
export type { MessageWrapperProps } from './messages/MessageWrapper.js';
export type { BlockCardProps } from './blocks/BlockCard.js';
export type { BlocksRendererProps } from './blocks/BlocksRenderer.js';
export type { MarkdownRendererProps } from './content/MarkdownRenderer.js';
