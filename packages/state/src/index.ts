/**
 * @fileoverview @agentskillmania/skill-ui-state
 *
 * State layer for skill-studio frontends. Transport-agnostic — consumers
 * fetch data and push it in via hooks. No dependency on daemon/colts/chat.
 *
 * Slices:
 * - conversation: event reducer for chat (token/thinking/tool/skill/...)
 * - diagnostics: event reducer for agent-diagnostics snapshots
 * - resources: typed normalizers for agents/skills/crews/sessions/files
 */

// ─── Shared types (cross-slice) ───────────────────────────────────
export type { SSEEvent, EventFeed, ColtsMessageInput } from './core/types.js';

// ─── Conversation slice: types ────────────────────────────────────
export type {
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
  TodoItem,
  TodoListSnapshot,
} from './core/conversation/types.js';

export {
  ZERO_TOKENS,
  createEmptyRunState,
  createEmptySessionState,
} from './core/conversation/types.js';

// ─── Conversation slice: reducer ──────────────────────────────────
export { reducer } from './core/conversation/reducer.js';

// ─── Conversation slice: selectors ────────────────────────────────
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
  selectTodoList,
  selectLastInputTokens,
  selectActivityTimeline,
} from './core/conversation/selectors.js';

// ─── Conversation slice: history loading ──────────────────────────
export { fromHistory } from './core/conversation/fromHistory.js';
export type { FromHistoryExtras } from './core/conversation/fromHistory.js';

// ─── Diagnostics slice: types ─────────────────────────────────────
export type {
  DiagnosticsState,
  DiagnosticsFeatureFlags,
  DiagnosticsToolMeta,
  DiagnosticsSkillMeta,
  DiagnosticsRunnerState,
  DiagnosticsSessionOverview,
  DiagnosticsSessionInfo,
} from './core/diagnostics/types.js';

export { createEmptyDiagnosticsState, DIAGNOSTICS_EVENT } from './core/diagnostics/types.js';

// ─── Diagnostics slice: reducer ───────────────────────────────────
export { diagnosticsReducer } from './core/diagnostics/reducer.js';

// ─── Diagnostics slice: selectors ─────────────────────────────────
export {
  selectDiagnosticsRunner,
  selectDiagnosticsTools,
  selectDiagnosticsSkills,
  selectDiagnosticsFeatures,
  selectDiagnosticsOverview,
  selectDiagnosticsInfo,
  selectDiagnosticsLLM,
  selectDiagnosticsSystemPrompt,
  selectDiagnosticsAgent,
} from './core/diagnostics/selectors.js';

// ─── Resources: types + normalizers ───────────────────────────────
export type {
  SessionMeta,
  AgentResource,
  SkillResource,
  CrewResource,
  RawResource,
} from './core/resources/types.js';

export { normalizeSession, normalizeSessionList, findSession } from './core/resources/sessions.js';
export { normalizeAgent, normalizeAgentList } from './core/resources/agents.js';
export { normalizeSkill, normalizeSkillList } from './core/resources/skills.js';
export { normalizeCrew, normalizeCrewList } from './core/resources/crews.js';

// ─── Resources: file tree helpers ─────────────────────────────────
export type { FileNode } from './core/resources/files.js';
export { findFileNode, toggleDirExpanded, flattenTree } from './core/resources/files.js';

// ─── React hook ───────────────────────────────────────────────────
// `useConversationState` is the primary name; `useSessionState` is kept
// as a backward-compatible alias so existing consumers keep working.
export { useConversationState } from './hooks/useConversationState.js';
export { useConversationState as useSessionState } from './hooks/useConversationState.js';
export type { UseConversationStateReturn } from './hooks/useConversationState.js';
export type { UseConversationStateReturn as UseSessionStateReturn } from './hooks/useConversationState.js';

export { useDiagnosticsState } from './hooks/useDiagnosticsState.js';
export type { UseDiagnosticsStateReturn } from './hooks/useDiagnosticsState.js';

// ─── React hook: generic resource list state ─────────────────────
export { useResourceState } from './hooks/useResourceState.js';
export type { UseResourceStateReturn } from './hooks/useResourceState.js';
