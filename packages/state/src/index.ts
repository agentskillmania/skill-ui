/**
 * @fileoverview @agentskillmania/skill-ui-state
 *
 * Event reducer state machine for agent runtime state.
 * Consumes SSE events via EventFeed, produces structured SessionRunState
 * for chat and cockpit UIs. No dependencies on daemon/colts/chat/cockpit.
 */

// Types
export type {
  SSEEvent,
  TokenStats,
  BlockStatus,
  MessageStatus,
  MessageRole,
  AgentBlock,
  AgentMessage,
  EventCategory,
  AgentEvent,
  AgentRunState,
  SubAgentRunState,
  SessionRunState,
  EventFeed,
  ColtsMessageInput,
} from './types.js';

export { ZERO_TOKENS, createEmptyRunState, createEmptySessionState } from './types.js';

// Reducer
export { reducer } from './reducer.js';

// Selectors
export {
  selectMainMessages,
  selectSubAgent,
  selectSubAgentMessages,
  selectSubAgentMetrics,
  selectAllSubAgents,
  selectEvents,
  selectTotalTokens,
  selectStatus,
  selectStepCount,
  selectActiveSkill,
} from './selectors.js';

// History loading
export { fromHistory } from './fromHistory.js';

// React hook
export { useSessionState } from './useSessionState.js';
export type { UseSessionStateReturn } from './useSessionState.js';
