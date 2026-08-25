/**
 * @fileoverview Conversation slice type definitions
 *
 * Types for the conversation state machine: agent runs, messages, blocks,
 * the event log, and the top-level SessionRunState. These describe the
 * render targets consumed by chat and cockpit UIs via selectors.
 */

// ─── Token Stats ──────────────────────────────────────────────────

export interface TokenStats {
  input: number;
  output: number;
  cacheRead: number;
  cacheWrite: number;
}

export const ZERO_TOKENS: TokenStats = {
  input: 0,
  output: 0,
  cacheRead: 0,
  cacheWrite: 0,
};

// ─── Agent Message & Block (render targets) ───────────────────────

export type BlockStatus = 'streaming' | 'completed' | 'error' | 'pending';
export type MessageStatus = 'streaming' | 'completed' | 'error';
export type MessageRole = 'user' | 'assistant' | 'system' | 'tool';

/**
 * A structured block within an assistant message.
 * Blocks are the primary UI render unit AND the single chronological
 * source: thinking, text, tool_call, skill, subagent, human_input, error.
 * A message's render order is its blocks array order — producers (the
 * reducer, fromHistory) append only, never prepend.
 *
 * 'text' is a plain assistant prose segment (markdown in `content`). One
 * message typically holds several: each tool call / thinking segment that
 * interrupts the prose starts a new text block, so interleaved ordering
 * survives.
 */
export interface AgentBlock {
  id: string;
  type: string;
  status: BlockStatus;
  content: string;
  metadata?: Record<string, unknown>;
}

/**
 * A binary attachment on a user message (multimodal input — currently images).
 * `url` is renderable as-is: a data URL for local files, http(s) for remote.
 * Attachments live at message level (orthogonal to blocks, which are the
 * assistant's chronological render units).
 */
export interface MessageAttachment {
  id: string;
  name: string;
  mimeType: string;
  url: string;
  size?: number;
}

/**
 * Per-turn usage summary, stamped on the turn's final assistant message.
 * Values come from the daemon's `done` SSE frame when it arrives
 * (authoritative turn totals), falling back to the step-end deltas the
 * reducer accumulated (aborted / errored turns where no done payload exists).
 * fromHistory restores the same shape from the daemon-persisted colts
 * `Message.usage` (written at run end); old archives lack the key and
 * simply degrade to time-only display.
 */
export interface TurnUsage {
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheWriteTokens: number;
  /** Whole-turn wall-clock (ms), tool execution included. */
  durationMs: number;
}

/**
 * A conversation message. Assistant messages carry blocks.
 */
export interface AgentMessage {
  id: string;
  role: MessageRole;
  /**
   * Derived field: concatenation of the message's text blocks, kept in sync
   * by the reducer and fromHistory. Exists for backward compatibility
   * (legacy renderers, copy handlers) — the chat UI renders text blocks
   * inline and only falls back to `content` when no text blocks exist.
   */
  content: string;
  blocks?: AgentBlock[];
  /** Multimodal attachments (user messages; currently images). */
  attachments?: MessageAttachment[];
  status: MessageStatus;
  createdAt?: number;
  /** Turn usage (assistant messages; stamped at turn end). */
  usage?: TurnUsage;
}

// ─── Event Log Entry (for cockpit) ────────────────────────────────

export type EventCategory =
  | 'lifecycle'
  | 'phase'
  | 'thinking'
  | 'token'
  | 'llm'
  | 'tool'
  | 'skill'
  | 'subagent'
  | 'compressing'
  | 'human'
  | 'error';

/**
 * A flat event log entry — one per upstream SSE event, nothing dropped.
 * Used by cockpit's event-log panel.
 */
export interface AgentEvent {
  id: string;
  timestamp: number;
  /** Original event type string (hyphenated SSE name) */
  type: string;
  /** Category for grouping/filtering */
  category: EventCategory;
  /** Human-readable label */
  label: string;
  /** Raw payload */
  payload?: Record<string, unknown>;
  /** Link to parent message (for cross-referencing with chat) */
  relatedMessageId?: string;
}

/**
 * A single todo item. Wire shape shared by both daemons (TS & Rust emit
 * identical JSON — snake_case `blocked_by`, empty arrays omitted).
 */
export interface TodoItem {
  id: number;
  subject: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed';
  /** Ids of todo items this one blocks */
  blocks?: number[];
  /** Ids of todo items that block this one */
  blocked_by?: number[];
}

/** Live todo-list snapshot, fed by the `todo-list` SSE event. */
export interface TodoListSnapshot {
  items: TodoItem[];
}

// ─── Agent Run State ──────────────────────────────────────────────

/**
 * State of a single agent run instance (main agent or sub-agent).
 */
export interface AgentRunState {
  status: 'idle' | 'streaming' | 'error';
  stepCount: number;
  tokens: TokenStats;
  duration: number;
  startedAt?: number;
  totalSteps?: number;
  messages: AgentMessage[];
  lastLLMRequest?: {
    messages: unknown[];
    tools: string[];
    skill: string | null;
    /** Model used for this LLM call (may differ from session default if overridden per-request). */
    model?: string;
    /** Context window (tokens) of the model — from llm:request event. */
    contextWindow?: number;
  };
  /** Input tokens of the LAST llm-response — the size of the context window
   *  actually in use (system prompt + history + this turn). Distinct from
   *  cumulative `tokens` which is the billing total across all turns. */
  lastInputTokens?: number;
  /** Latest todo-list snapshot (updated only when the list changes) */
  todoList?: TodoListSnapshot;
  activeSkill: string | null;
  compression?: { summary: string; removedCount: number };
  /**
   * Turn-scoped accumulators (reducer-private bookkeeping): per-step
   * token/duration deltas since the last user-message. The `done`/`error`
   * handlers stamp them onto the turn's final assistant message as
   * `usage` when the terminal payload lacks authoritative totals (abort,
   * error). Reset by user-message (new turn) and session-cleared. Unlike
   * `tokens`/`duration`, these never accumulate across turns.
   */
  turnTokens: TokenStats;
  turnDurationMs: number;
}

/**
 * Sub-agent run — extends AgentRunState with identity and parent linkage.
 */
export interface SubAgentRunState extends AgentRunState {
  name: string;
  task: string;
  parentBlockId: string;
  resultStatus?: 'success' | 'max_steps' | 'error' | 'abort' | 'timeout';
  error?: string;
}

/**
 * Top-level session state — main agent + all sub-agents + global event log.
 */
export interface SessionRunState {
  main: AgentRunState;
  subAgents: Map<string, SubAgentRunState>;
  events: AgentEvent[];
}

// ─── Factory ──────────────────────────────────────────────────────

export function createEmptyRunState(): AgentRunState {
  return {
    status: 'idle',
    stepCount: 0,
    tokens: { ...ZERO_TOKENS },
    duration: 0,
    messages: [],
    activeSkill: null,
    turnTokens: { ...ZERO_TOKENS },
    turnDurationMs: 0,
  };
}

export function createEmptySessionState(): SessionRunState {
  return {
    main: createEmptyRunState(),
    subAgents: new Map(),
    events: [],
  };
}
