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
export { BlocksRenderer } from './blocks-redesign/BlocksRenderer.js';
export { ThinkingBlock } from './blocks-redesign/ThinkingBlock.js';
export { ToolCallBlock } from './blocks-redesign/ToolCallBlock.js';
export { PlanBlock } from './blocks-redesign/PlanBlock.js';
export { ErrorBlock } from './blocks-redesign/ErrorBlock.js';
export { HumanInputBlock } from './blocks-redesign/HumanInputBlock.js';
export { SkillBlock } from './blocks-redesign/SkillBlock.js';
export { A2UIBlock } from './blocks-redesign/A2UIBlock.js';
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
  A2UIBlockMetadata,
  BlockAction,
} from './types.js';

// Component Props types
export type { MessageListProps } from './types.js';
export type { ChatInputProps } from './ChatInput/index.js';
export type { MessageItemProps } from './messages/MessageItem.js';
export type { MessageWrapperProps } from './messages/MessageWrapper.js';
export type { BlocksRendererProps } from './blocks-redesign/BlocksRenderer.js';
export type { MarkdownRendererProps } from './content/MarkdownRenderer.js';
export type { QuickCommandsProps } from './commands/QuickCommands.js';
export type { CommandAutocompleteProps } from './commands/CommandAutocomplete.js';

// Locales
export { NAMESPACE, resources } from './locales/index.js';

// Utility functions
export { extractSearchTerm, filterCommands, groupCommands } from './commands/commandUtils.js';
