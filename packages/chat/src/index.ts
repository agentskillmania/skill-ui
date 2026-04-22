/**
 * @agentskillmania/skill-ui-chat unified exports
 */

// Components
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
export { SkillBlock } from './blocks/SkillBlock.js';
export { MarkdownRenderer } from './content/MarkdownRenderer.js';
export { QuickCommands } from './commands/QuickCommands.js';
export { CommandAutocomplete } from './commands/CommandAutocomplete.js';

// Types
export type {
  Message,
  Block,
  MessageStatus,
  MessageRole,
  BlockStatus,
  HumanInputType,
  ChatCommand,
  ChatProps,
  ChatRenderers,
  MessageProps,
  BlockProps,
  ToolCallMetadata,
  PlanStep,
  PlanMetadata,
  HumanInputMetadata,
  ErrorMetadata,
  SkillBlockMetadata,
} from './types.js';

// Component Props types
export type { MessageListProps } from './MessageList/index.js';
export type { ChatInputProps } from './ChatInput/index.js';
export type { MessageItemProps } from './messages/MessageItem.js';
export type { MessageWrapperProps } from './messages/MessageWrapper.js';
export type { BlockCardProps } from './blocks/BlockCard.js';
export type { BlocksRendererProps } from './blocks/BlocksRenderer.js';
export type { MarkdownRendererProps } from './content/MarkdownRenderer.js';
export type { QuickCommandsProps } from './commands/QuickCommands.js';
export type { CommandAutocompleteProps } from './commands/CommandAutocomplete.js';

// Utility functions
export { extractSearchTerm, filterCommands, groupCommands } from './commands/commandUtils.js';
