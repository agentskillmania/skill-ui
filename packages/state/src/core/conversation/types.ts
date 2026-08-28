/**
 * @fileoverview Conversation slice type definitions
 *
 * Types for the conversation state machine: agent runs, messages, and blocks.
 * These describe the render targets consumed by chat UIs via selectors.
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

// ─── Todo List ────────────────────────────────────────────────────

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

// ─── A2UI Surfaces ────────────────────────────────────────────────

/**
 * Materialized state of one A2UI surface. The a2ui_* tools carry their whole
 * payload in the tool-start args (backend is ack-only), so the frontend keeps
 * the resolved component tree / data model / title here to serialize
 * self-contained genui protocol blocks — including the reopen replay when a
 * later turn touches a surface created in an earlier one.
 */
export interface A2uiSurfaceState {
  components: unknown[];
  dataModel: unknown;
  title?: string;
}

/** Per-conversation surface registry, keyed by surfaceId. */
export type A2uiSurfaces = Record<string, A2uiSurfaceState>;

// ─── Agent Run State ──────────────────────────────────────────────

/**
 * State of a single agent run instance (main agent or sub-agent).
 */
export interface AgentRunState {
  /**
   * Run liveness. 'streaming' iff a turn is currently open (a live assistant
   * bubble exists); 'idle' at rest; 'error' if the last turn failed.
   * For the main agent this is wired by user-message / first content event /
   * done / error / session-cleared; sub-agent runs flip at subagent-start/end.
   *
   * NOTE: 'idle' is ambiguous by design — it covers both "no turn yet" and
   * "turn finished". Where that distinction matters (terminal guard), use
   * `turnClosed`, not status.
   */
  status: 'idle' | 'streaming' | 'error';
  /**
   * Terminal-event latch: true once this reducer has consumed a `done` or
   * `error` for the current turn, until `user-message` (new turn) or
   * `session-cleared` resets it. This is EVENT HISTORY, not state shape —
   * the three legal scenarios "fresh state", "post-done", and
   * "loadHistory landed mid-run" (sim_split) are message-shape-identical
   * yet require opposite answers to "may a late frame open a stream?".
   * fromHistory-built states therefore always carry `false` (loadHistory
   * means the reducer has not seen a terminal event), which is what allows
   * the live event tail to reopen a bubble on a mid-run-restored state.
   */
  turnClosed: boolean;
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
  /**
   * A2UI surface registry (reducer-private bookkeeping, never serialized):
   * materialized component trees and data models for surfaces touched by
   * a2ui_* tool calls in this run. Maintained by the a2ui.ts pure helpers on
   * both the live path (reducer) and the resume path (fromHistory), so a
   * block reopened in a later turn can replay full state. Sub-agent runs
   * each carry their own registry.
   */
  a2uiSurfaces: A2uiSurfaces;
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
 * Top-level session state — main agent + all sub-agents.
 */
export interface SessionRunState {
  main: AgentRunState;
  subAgents: Map<string, SubAgentRunState>;
}

// ─── Factory ──────────────────────────────────────────────────────

export function createEmptyRunState(): AgentRunState {
  return {
    status: 'idle',
    turnClosed: false,
    stepCount: 0,
    tokens: { ...ZERO_TOKENS },
    duration: 0,
    messages: [],
    turnTokens: { ...ZERO_TOKENS },
    turnDurationMs: 0,
    a2uiSurfaces: {},
  };
}

export function createEmptySessionState(): SessionRunState {
  return {
    main: createEmptyRunState(),
    subAgents: new Map(),
  };
}
