/**
 * Chat UI component type definitions
 */
import type { ComponentType, ReactNode, CSSProperties } from 'react';

// ---- Basic Enums ----

/** Message status */
export type MessageStatus = 'streaming' | 'completed' | 'error';

/** Message role */
export type MessageRole = 'user' | 'assistant' | 'system' | 'tool';

/** Block status */
export type BlockStatus = 'streaming' | 'completed' | 'error' | 'pending';

/** Human interaction type */
export type HumanInputType = 'confirmation' | 'input' | 'single-select' | 'multi-select';

// ---- Core Data Models ----

/** Message */
export interface Message {
  /** Unique identifier */
  id: string;
  /** Sender role */
  role: MessageRole;
  /** Text content (Markdown) */
  content: string;
  /** Block list (assistant messages) */
  blocks?: Block[];
  /** Message status */
  status: MessageStatus;
  /** Creation timestamp */
  createdAt?: number;
}

/** Execution block */
export interface Block {
  /** Unique identifier */
  id: string;
  /** Block type */
  type: string;
  /** Block status */
  status: BlockStatus;
  /** Text content */
  content: string;
  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

// ---- Metadata Convention Structures ----

/** Tool call metadata */
export interface ToolCallMetadata {
  toolName?: string;
  toolType?: 'mcp' | 'script' | 'builtin';
  toolArgs?: string;
  toolResult?: string;
}

/** Plan step */
export interface PlanStep {
  content: string;
  status: 'completed' | 'running' | 'pending' | 'error' | 'skipped';
}

/** Plan metadata */
export interface PlanMetadata {
  steps?: PlanStep[];
}

/** Human interaction metadata */
export interface HumanInputMetadata {
  requestId?: string;
  inputType?: HumanInputType;
  title?: string;
  message?: string;
  options?: Array<{ label: string; value: string }>;
  defaultValue?: string;
}

/** Error metadata */
export interface ErrorMetadata {
  errorCode?: string;
}

/** Skill block metadata */
export interface SkillBlockMetadata {
  /** Skill name */
  skillName?: string;
  /** Skill execution phase */
  phase?: 'loading' | 'loaded' | 'executing' | 'completed';
  /** Execution task description */
  task?: string;
  /** Skill document token count */
  tokenCount?: number;
  /** Execution result summary */
  result?: string;
}

// ---- Command System ----

/** Command */
export interface ChatCommand {
  /** Unique identifier */
  id: string;
  /** Display name */
  label: string;
  /** Trigger command (without "/", e.g. "search" means /search) */
  command: string;
  /** Command description (shown in dropdown menu) */
  description?: string;
  /** Command icon */
  icon?: ReactNode;
  /** Group name (grouped display in dropdown menu) */
  group?: string;
  /** Search keywords (for fuzzy matching, aliases beyond label and command) */
  keywords?: string[];
}

// ---- Component Props ----

/** Message rendering component props */
export interface MessageProps {
  message: Message;
  children?: ReactNode;
}

/** Block rendering component props */
export interface BlockProps {
  block: Block;
  onConfirm?: (requestId: string, response: unknown) => void;
}

// ---- Renderer Registry ----

/** Custom renderer registry */
export interface ChatRenderers {
  /** Register custom renderers by message role (can override built-in, extend new roles) */
  messages?: Record<string, ComponentType<MessageProps>>;
  /** Register custom renderers by block type (can override built-in, extend new types) */
  blocks?: Record<string, ComponentType<BlockProps>>;
}

// ---- Top-level Component Props ----

/** Chat component props */
export interface ChatProps {
  /** Message list */
  messages: Message[];

  // Message interactions
  /** Send message callback */
  onSendMessage?: (content: string) => void;
  /** Stop generation callback */
  onStop?: () => void;
  /** Human interaction confirmation callback */
  onConfirmHumanRequest?: (requestId: string, response: unknown) => void;

  // Controlled input
  /** Input value (controlled mode) */
  inputValue?: string;
  /** Input value change callback */
  onInputChange?: (value: string) => void;

  // Status
  /** Chat overall status */
  status?: 'idle' | 'streaming' | 'error';
  /** Whether input is disabled */
  disabled?: boolean;

  // Extensibility
  /** Custom renderer registry */
  renderers?: ChatRenderers;
  /** Input prefix content */
  inputPrefix?: ReactNode;
  /** Input suffix content */
  inputSuffix?: ReactNode;
  /** Message decorator (add content before/after messages, e.g. timestamps, action buttons) */
  messageDecorator?: (message: Message, element: ReactNode) => ReactNode;

  // Layout
  /** Content area max width */
  maxWidth?: string;
  /** Input placeholder text */
  placeholder?: string;
  /** Custom class name */
  className?: string;
  /** Custom style */
  style?: CSSProperties;

  // Command system
  /** Command list */
  commands?: ChatCommand[];
  /** Select command callback (unified exit for quick commands + autocomplete) */
  onCommand?: (command: ChatCommand) => void;
  /** Maximum number of quick commands to display (default 5) */
  maxQuickCommands?: number;
  /** Slash trigger character (default "/") */
  commandTrigger?: string;
}
