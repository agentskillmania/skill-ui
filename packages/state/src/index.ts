/**
 * @fileoverview @agentskillmania/skill-ui-state
 *
 * State layer for skill-studio frontends. Transport-agnostic — consumers
 * fetch data and push it in via hooks. No dependency on daemon/colts/chat.
 *
 * Slice:
 * - conversation: event reducer for chat (token/thinking/tool/skill/...)
 */

// ─── Shared types ─────────────────────────────────────────────────
export type { SSEEvent, EventFeed, ColtsMessageInput, ColtsContentPart } from './core/types.js';

// ─── Types ────────────────────────────────────────────────────────
export type {
  TokenStats,
  BlockStatus,
  MessageStatus,
  MessageRole,
  AgentBlock,
  AgentMessage,
  MessageAttachment,
  TurnUsage,
  AgentRunState,
  SubAgentRunState,
  SessionRunState,
  TodoItem,
  TodoListSnapshot,
} from './core/conversation/types.js';

export {
  ZERO_TOKENS,
  createEmptyRunState,
  createEmptySessionState,
} from './core/conversation/types.js';

// ─── Reducer ──────────────────────────────────────────────────────
export { reducer } from './core/conversation/reducer.js';

// ─── Selectors ────────────────────────────────────────────────────
export {
  selectMainMessages,
  selectTotalTokens,
  selectStepCount,
  selectTodoList,
  selectLastInputTokens,
} from './core/conversation/selectors.js';

// ─── History loading ──────────────────────────────────────────────
export { fromHistory } from './core/conversation/fromHistory.js';
export { normalizeTurnUsage } from './core/conversation/fromHistory.js';
export type { FromHistoryExtras } from './core/conversation/fromHistory.js';

// ─── React hook ───────────────────────────────────────────────────
// `useConversationState` is the primary name; `useSessionState` is kept
// as a backward-compatible alias so existing consumers keep working.
export { useConversationState } from './hooks/useConversationState.js';
export { useConversationState as useSessionState } from './hooks/useConversationState.js';
export type { UseConversationStateReturn } from './hooks/useConversationState.js';
export type { UseConversationStateReturn as UseSessionStateReturn } from './hooks/useConversationState.js';
