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
 * Blocks are the primary UI render unit (thinking, tool_call, skill, etc.).
 */
export interface AgentBlock {
  id: string;
  type: string;
  status: BlockStatus;
  content: string;
  metadata?: Record<string, unknown>;
}

/**
 * A conversation message. Assistant messages carry blocks.
 */
export interface AgentMessage {
  id: string;
  role: MessageRole;
  content: string;
  blocks?: AgentBlock[];
  status: MessageStatus;
  createdAt?: number;
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
  lastLLMRequest?: { messages: unknown[]; tools: string[]; skill: string | null };
  activeSkill: string | null;
  compression?: { summary: string; removedCount: number };
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
  };
}

export function createEmptySessionState(): SessionRunState {
  return {
    main: createEmptyRunState(),
    subAgents: new Map(),
    events: [],
  };
}
