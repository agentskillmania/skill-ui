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

/**
 * A binary attachment (multimodal input — currently images), either pending
 * in the composer or already sent on a user message. `url` is renderable
 * as-is: a data URL for local files, http(s) for remote.
 */
export interface ChatAttachment {
  /** Unique identifier */
  id: string;
  /** File name */
  name: string;
  /** MIME type (image/*) */
  mimeType: string;
  /** Renderable URL (data URL / http(s)) */
  url: string;
  /** Byte size */
  size?: number;
}

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
  /** Attachments (user messages; rendered above the text) */
  attachments?: ChatAttachment[];
  /** Message status */
  status: MessageStatus;
  /** Creation timestamp */
  createdAt?: number;
  /** Turn usage (assistant messages; stamped at turn end). Render-only —
   * the authoritative shape lives in skill-ui-state's TurnUsage; this
   * standalone copy keeps the chat package dependency-free (fields must
   * stay in sync, hosts bridge the two). */
  usage?: TurnUsage;
}

/**
 * Per-turn usage summary displayed in the message footer. Standalone copy
 * of skill-ui-state's TurnUsage (see Message.usage note).
 */
export interface TurnUsage {
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheWriteTokens: number;
  /** Whole-turn wall-clock (ms), tool execution included. */
  durationMs: number;
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

/** Todo item。`subject` 是 wire/daemon 的真实字段(state 包 TodoItem);
 * `content` 是旧形状,保留兼容(stories 在用)。渲染时 subject 优先。 */
export interface TodoItem {
  id?: number;
  subject?: string;
  content?: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed';
}

/** Todo metadata */
export interface TodoMetadata {
  title?: string;
  items?: TodoItem[];
}

/** Shell tool metadata */
export interface ShellMetadata {
  /** Command line being executed */
  command?: string;
  /** Combined stdout/stderr text (may contain ANSI escape codes) */
  output?: string;
  /** Process exit code; undefined while running */
  exitCode?: number;
}

/** File edit tool metadata — parsed from the file_edit tool call args and receipt */
export interface FileEditMetadata {
  /** Path to the edited file, relative to workspace */
  filePath?: string;
  /** Exact text being replaced (before) */
  oldString?: string;
  /** Replacement text (after) */
  newString?: string;
  /** Whether all occurrences were replaced */
  replaceAll?: boolean;
  /** Parsed from receipt: number of replacements (>1 when replaceAll hit multiple sites) */
  occurrences?: number;
  /** Parsed from receipt: line number of the updated region start (1-based, new-content coordinates) */
  startLine?: number;
  /** Parsed from receipt: raw guard message when the edit was rejected (receipt starts with "Error:") */
  errorMessage?: string;
}

/** Human interaction metadata */
/** A single question in a multi-question human-input request (mirrors the
 * daemon's HumanQuestion). */
export interface HumanInputQuestion {
  id: string;
  question: string;
  type: 'text' | 'number' | 'single-select' | 'multi-select';
  options?: string[];
}

export interface HumanInputMetadata {
  requestId?: string;
  inputType?: HumanInputType;
  title?: string;
  message?: string;
  options?: Array<{ label: string; value: string }>;
  defaultValue?: string;
  response?: unknown;
  /** Full question list (multi-question ask_human). When present, the block
   * renders one input per question instead of a single input. */
  questions?: HumanInputQuestion[];
}

/** Error metadata */
export interface ErrorMetadata {
  errorCode?: string;
  /** User-friendly recovery hint (generated by backend) */
  hint?: string;
}

/** Skill block metadata — load_skill 工具调用的展示形状:一次调用一个块,
 * 块状态即工具调用状态(streaming/completed/error),无独立生命周期。 */
export interface SkillBlockMetadata {
  /** Skill name */
  skillName?: string;
  /** Task description (from the load_skill tool arguments) */
  task?: string;
  /** Loaded skill instructions (raw tool result) */
  result?: string;
}

/** A2UI block metadata */
export interface A2UIBlockMetadata {
  /** Display title (default: "A2UI Surface") */
  title?: string;
  /** A2UI surface ID — used to aggregate multiple tool calls into one block */
  surfaceId?: string;
  /** Max height of rendered surface (CSS value, default: "400px") */
  maxHeight?: string;
}

/** Sub-agent delegation block metadata */
export interface SubAgentBlockMetadata {
  /** Sub-agent name */
  name?: string;
  /** Delegation task description */
  task?: string;
  /** Step count */
  steps?: number;
  /** Input token count */
  inputTokens?: number;
  /** Output token count */
  outputTokens?: number;
  /** Duration in milliseconds */
  duration?: number;
  /** Sub-agent's conversation messages (for modal display) */
  messages?: Message[];
  /** Final result status */
  resultStatus?: 'success' | 'max_steps' | 'error' | 'abort' | 'timeout';
  /** Error message (when resultStatus is error) */
  error?: string;
}

/** Structured action emitted by interactive blocks (e.g. A2UI surface) */
export interface BlockAction {
  /** Action type (e.g. 'a2ui-action') */
  type: string;
  /** A2UI surface ID — backend-recognizable identifier */
  surfaceId?: string;
  /** A2UI component ID that triggered the action */
  componentId?: string;
  /** Action payload data */
  payload: unknown;
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

// ---- Model & Context (input toolbar) ----

/** Model option — a leaf in the model tree, also the selected-value shape */
export interface ChatModelOption {
  /** Model id, e.g. "gpt-4o" */
  id: string;
  /** Display label (defaults to id) */
  label?: string;
}

/** Ordered model group (array order = display order). Typically one per provider. */
export interface ChatModelGroup {
  /** Group identifier */
  key: string;
  /** Group title (defaults to key) */
  label?: string;
  /** Models in this group */
  models: ChatModelOption[];
}

/** Context window usage (display-only) */
export interface ChatContextUsage {
  /** Tokens used */
  used: number;
  /** Context window limit */
  total: number;
}

// ---- Component Props ----

/** Message rendering component props */
export interface MessageProps {
  message: Message;
  children?: ReactNode;
  /** Human interaction confirmation (forwarded to BlocksRenderer for HumanInputBlock) */
  onConfirmHumanRequest?: (requestId: string, response: unknown) => void;
  /** Block action callback (forwarded to BlocksRenderer for A2UIBlock) */
  onBlockAction?: (action: BlockAction) => void;
  /** Custom renderer registry (forwards blocks sub-registry to BlocksRenderer) */
  renderers?: ChatRenderers;
}

/** Block rendering component props */
export interface BlockProps {
  block: Block;
  onConfirm?: (requestId: string, response: unknown) => void;
  /** Callback for block-emitted actions (e.g. A2UI surface interactions) */
  onAction?: (action: BlockAction) => void;
}

// ---- Renderer Registry ----

/** Custom renderer registry */
export interface ChatRenderers {
  /** Register custom renderers by message role (can override built-in, extend new roles) */
  messages?: Record<string, ComponentType<MessageProps>>;
  /** Register custom renderers by block type (can override built-in, extend new types) */
  blocks?: Record<string, ComponentType<BlockProps>>;
}

// ---- Message List Props ----

/** MessageList component props (forwards callbacks to MessageItem) */
export interface MessageListProps {
  messages: Message[];
  /** Custom renderer registry */
  renderers?: ChatRenderers;
  /** Message decorator */
  messageDecorator?: (message: Message, element: ReactNode) => ReactNode;
  /** Message footer meta renderer (timestamp / usage line). Rendered on the
   * left end of the footer row (right end for user messages), sharing the
   * row with the hover-revealed action buttons. */
  messageMeta?: (message: Message) => ReactNode;
  /** Human interaction confirmation (forwarded to blocks) */
  onConfirmHumanRequest?: (requestId: string, response: unknown) => void;
  /** Block action callback (forwarded to blocks) */
  onBlockAction?: (action: BlockAction) => void;
  /** Hide all message action buttons (e.g. while the chat is streaming) */
  hideActions?: boolean;
  /** Message action callbacks — a button renders only when its callback is wired */
  onCopyMessage?: (message: Message) => void;
  onEditMessage?: (message: Message) => void;
  onRegenerateMessage?: (message: Message) => void;
  onRollbackMessage?: (message: Message) => void;
  onForkMessage?: (message: Message) => void;
}

// ---- Top-level Component Props ----

/** Chat component props */
export interface ChatProps {
  /** Message list */
  messages: Message[];

  // Message interactions
  /** Send message callback (attachments present when the composer holds any) */
  onSendMessage?: (content: string, attachments?: ChatAttachment[]) => void;
  /** Stop generation callback */
  onStop?: () => void;
  /** Human interaction confirmation callback */
  onConfirmHumanRequest?: (requestId: string, response: unknown) => void;
  /** Callback for block-emitted actions (e.g. A2UI surface interactions) */
  onBlockAction?: (action: BlockAction) => void;
  // Message action callbacks. Buttons appear only when their callback is
  // provided — wiring a callback is the switch. Position rules: edit targets
  // the last user message; regenerate targets the last completed assistant
  // message; rollback/fork target earlier completed assistant messages.
  /** Copy message callback */
  onCopyMessage?: (message: Message) => void;
  /** Edit-and-resend the last user message callback */
  onEditMessage?: (message: Message) => void;
  /** Regenerate the last completed assistant message callback */
  onRegenerateMessage?: (message: Message) => void;
  /** Rollback (truncate) history after this message callback */
  onRollbackMessage?: (message: Message) => void;
  /** Fork a new conversation from this message callback */
  onForkMessage?: (message: Message) => void;

  // Controlled input
  /** Input value (controlled mode) */
  inputValue: string;
  /** Input value change callback */
  onInputChange: (value: string) => void;

  // Attachments (composer, controlled — mirrors inputValue/onInputChange)
  /** Pending attachments in the composer. Pair with onAttachmentsChange to
   * enable the attach button / paste / drop flows and the chip strip. */
  attachments?: ChatAttachment[];
  /** Pending-attachments change callback */
  onAttachmentsChange?: (attachments: ChatAttachment[]) => void;
  /** Disable attaching (e.g. current model lacks image input). Paste/drop
   * are rejected via onAttachmentsRejected; the attach button shows
   * attachmentsDisabledReason in its tooltip. */
  attachmentsDisabled?: boolean;
  /** Why attaching is disabled (attach-button tooltip) */
  attachmentsDisabledReason?: string;
  /** Max pending attachments (default 5) */
  maxAttachments?: number;
  /** Max size per attachment in MB (default 10) */
  maxAttachmentMB?: number;
  /** Rejected attach attempts (host surfaces its own toast/i18n) */
  onAttachmentsRejected?: (
    reason: 'disabled' | 'too-many' | 'too-large' | 'unsupported-type',
    files: File[]
  ) => void;

  // Status
  /** Chat overall status */
  status?: 'idle' | 'streaming' | 'error';
  /** Whether input is disabled */
  disabled?: boolean;

  // Extensibility
  /** Custom renderer registry */
  renderers?: ChatRenderers;
  /** Content shown above the composer while the conversation is empty — the
   * composer centers itself on screen until the first message exists, then
   * slides to the bottom. undefined = default localized greeting; null = off;
   * a node = fully custom content (interactive nodes stay clickable). */
  welcome?: ReactNode;
  /** When the composer grabs focus. 'empty' (default) = only empty
   * conversations (ChatGPT-style: an opened history is for reading).
   * 'always' = focus on every mount — note-taking hosts where opening a
   * conversation means continuing to write. Refocuses after composer remounts
   * too (the ChatInput callback ref covers node churn while the flag is on). */
  autoFocusComposer?: 'empty' | 'always';
  /** Input prefix content */
  inputPrefix?: ReactNode;
  /** Input suffix content */
  inputSuffix?: ReactNode;
  /** Full-width banner on its own row above the input (mode banners, e.g. an
   * editing notice). Unlike inputPrefix/inputSuffix (inline adornments), the
   * banner stacks above the whole input row. */
  inputBanner?: ReactNode;
  /** Message decorator (add content before/after messages, e.g. timestamps, action buttons) */
  messageDecorator?: (message: Message, element: ReactNode) => ReactNode;
  /** Message footer meta renderer (timestamp / usage line). Rendered on the
   * left end of the footer row (right end for user messages), sharing the
   * row with the hover-revealed action buttons. */
  messageMeta?: (message: Message) => ReactNode;

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

  // Model / thinking / context — input toolbar (all optional & controlled)
  /** Available model groups (enables model selector when paired with onModelChange) */
  models?: ChatModelGroup[];
  /** Currently selected model */
  selectedModel?: ChatModelOption;
  /** Select model callback */
  onModelChange?: (model: ChatModelOption) => void;
  /** Thinking state: null=Auto, true=on, false=off */
  thinking?: boolean | null;
  /** Thinking state change callback (enables thinking toggle) */
  onThinkingChange?: (value: boolean | null) => void;
  /** Context window usage (enables context indicator) */
  contextUsage?: ChatContextUsage;
}
