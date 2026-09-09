/**
 * @agentskillmania/skill-ui-chat 公共面
 *
 * 会话域：Chat（一体式）、MessageList / ChatInput / BlocksRenderer（组合件）、
 * QuickCommands（快捷命令条）+ 全部类型。
 *
 * 内置默认实现（消息子件、各 Block、输入框子件、CommandAutocomplete、
 * MarkdownRenderer）属于包内实现，不经公共面导出 —— 外部自定义走
 * ChatRenderers 注册表（messages/blocks 覆盖）。
 */

// ─── Core components ────────────────────────────────────────
export { Chat } from './Chat/index.js';
export { MessageList } from './MessageList/index.js';
export { ChatInput } from './ChatInput/index.js';
export { BlocksRenderer } from './blocks-redesign/BlocksRenderer.js';
export { QuickCommands } from './commands/QuickCommands.js';

// ─── Types ──────────────────────────────────────────────────
export type {
  Message,
  Block,
  ChatAttachment,
  MessageStatus,
  MessageRole,
  BlockStatus,
  HumanInputType,
  ChatCommand,
  ChatProps,
  ChatRenderers,
  ChatModelOption,
  ChatModelGroup,
  ChatContextUsage,
  MessageProps,
  BlockProps,
  ToolCallMetadata,
  PlanStep,
  PlanMetadata,
  HumanInputMetadata,
  ErrorMetadata,
  SkillBlockMetadata,
  A2UIBlockMetadata,
  SubAgentBlockMetadata,
  BlockAction,
  ChatMarkdownConfig,
  ChatMarkdownDompurifyConfig,
} from './types.js';

// Component Props types
export type { MessageListProps } from './types.js';
export type { ChatInputProps } from './ChatInput/index.js';
export type { BlocksRendererProps } from './blocks-redesign/BlocksRenderer.js';
export type { QuickCommandsProps } from './commands/QuickCommands.js';

// Locales
export { NAMESPACE, resources } from './locales/index.js';
