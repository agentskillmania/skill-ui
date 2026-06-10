/**
 * @agentskillmania/skill-ui-cockpit unified exports
 */

// Types
export type {
  CockpitProps,
  PanelId,
  SessionBoardData,
  AgentRenderData,
  AgentContextRenderData,
  LLMSnapshotData,
  SessionInfo,
} from './types.js';

export type {
  CockpitEvent,
  CockpitEventType,
  EventCategory,
  EventLogPanelProps,
} from './panels/event-log/types.js';

export type { ChatPanelProps } from './panels/chat/types.js';
export type { SessionBoardPanelProps } from './panels/session-board/types.js';
export type { SessionsPanelProps } from './panels/sessions/types.js';

export type {
  SkillStateData,
  SkillStackFrameData,
  CompressionData,
  AgentStateSectionProps,
} from './sections/agent-state/types.js';

export type {
  RunnerFeatureFlags,
  RunnerToolInfo,
  RunnerSkillInfo,
  RunnerDiagnosticsData,
  RunnerSectionProps,
} from './sections/runner/types.js';

export type {
  SessionOverviewData,
  SessionInfoData,
  SessionStatus,
} from './sections/session/types.js';

// Main component
export { Cockpit } from './cockpit/index.js';

// Hooks
export { useCockpitLayout } from './hooks/index.js';

// Panels
export { ChatPanel } from './panels/chat/index.js';
export { EventLogPanel } from './panels/event-log/index.js';
export { SessionBoardPanel } from './panels/session-board/index.js';
export { SessionsPanel } from './panels/sessions/index.js';

// Event log sub-components
export { EventFilterBar } from './panels/event-log/EventFilterBar.js';
export type { EventFilterBarProps } from './panels/event-log/EventFilterBar.js';
export { EventRow } from './panels/event-log/EventRow.js';
export type { EventRowProps } from './panels/event-log/EventRow.js';

// Session sub-components
export { SessionSection, SessionOverviewCard, SessionInfoCard } from './sections/session/index.js';

// Agent state sub-components
export {
  AgentStateSection,
  ActiveSkillCard,
  CompressionCard,
  LLMContextCard,
} from './sections/agent-state/index.js';

// Runner sub-components
export { RunnerSection, FeatureTagsCard, ToolsCard, SkillsCard } from './sections/runner/index.js';

// Locales
export { NAMESPACE, resources } from './locales/index.js';
