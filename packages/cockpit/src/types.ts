/**
 * Cockpit types — shared across modules
 */

import type { CSSProperties, ReactNode } from 'react';
import type {
  Message,
  ChatRenderers,
  ChatCommand,
  BlockAction,
} from '@agentskillmania/skill-ui-chat';
import type { SessionOverviewData, SessionInfoData } from './sections/session/types.js';
import type { SkillStateData, CompressionData } from './sections/agent-state/types.js';
import type { RunnerDiagnosticsData } from './sections/runner/types.js';
import type { CockpitEvent, EventCategory } from './panels/event-log/types.js';

// ---- Panel IDs ----

export type PanelId = 'sessions' | 'event-log' | 'session-board';

// ---- Session Board Data ----

/**
 * Structural type for colts AgentContext — only the fields cockpit renders.
 * Compatible with colts AgentContext by structure (duck typing).
 */
export interface AgentContextRenderData {
  /** Active skill state from colts AgentContext.skillState. */
  skillState?: SkillStateData | null;
  /** Current compression state from colts AgentContext.compression. */
  compression?: CompressionData | null;
}

/**
 * Structural type for colts AgentState — only what cockpit renders.
 * The full AgentState has additional fields; this is the renderable subset.
 */
export interface AgentRenderData {
  context?: AgentContextRenderData;
}

/**
 * Daemon's lastLLMRequest snapshot — strict mapping of what buildDiagnostics() sends.
 * Captured from the 'llm-request' SSE event in agent-session.ts.
 */
export interface LLMSnapshotData {
  messages: unknown[];
  tools?: unknown[];
  skill?: string;
}

/**
 * SessionBoardData — strict 1:1 mapping of daemon's agent-diagnostics SSE event.
 * Top-level keys and nesting match buildDiagnostics() output exactly.
 * No data transformation should occur between daemon and this type.
 */
export interface SessionBoardData {
  /** Runner capabilities: features, tools, skills. */
  runner: RunnerDiagnosticsData;
  /** Full colts AgentState, passed through as structural type. */
  agent: AgentRenderData;
  /** Last LLM request snapshot from daemon. */
  llm: LLMSnapshotData | null;
  /** System prompt used in last LLM request. */
  systemPrompt?: string | null;
  /** Session diagnostics: overview summary + detailed info. */
  session: {
    overview: SessionOverviewData;
    info: SessionInfoData;
  };
}

// ---- Sessions ----

/** Session metadata — aligned with wrangler-daemon SessionMeta */
export interface SessionInfo {
  id: string;
  agentName: string;
  model: string;
  workspacePath: string;
  createdAt: string;
  updatedAt: string;
}

// ---- Component Props ----

export interface CockpitProps {
  // --- Chat props (prefixed to avoid collisions) ---
  chatMessages: Message[];
  onChatSendMessage?: (content: string) => void;
  onChatStop?: () => void;
  onChatConfirmHumanRequest?: (requestId: string, response: unknown) => void;
  onChatBlockAction?: (action: BlockAction) => void;
  onChatCopyMessage?: (message: Message) => void;
  onChatResendMessage?: (message: Message) => void;
  onChatRegenerateMessage?: (message: Message) => void;
  onChatRollbackMessage?: (message: Message) => void;
  onChatForkMessage?: (message: Message) => void;
  chatInputValue: string;
  onChatInputChange: (value: string) => void;
  chatStatus?: 'idle' | 'streaming' | 'error';
  chatDisabled?: boolean;
  chatRenderers?: ChatRenderers;
  chatInputPrefix?: ReactNode;
  chatInputSuffix?: ReactNode;
  chatMessageDecorator?: (message: Message, element: ReactNode) => ReactNode;
  chatMaxWidth?: string;
  chatPlaceholder?: string;
  chatCommands?: ChatCommand[];
  onChatCommand?: (command: ChatCommand) => void;
  chatMaxQuickCommands?: number;
  chatCommandTrigger?: string;

  // --- Cockpit-specific props (prefixed per panel) ---

  // Event log
  eventLogEvents?: CockpitEvent[];
  eventLogActiveCategories?: Set<EventCategory>;
  defaultEventLogActiveCategories?: Set<EventCategory>;
  onEventLogCategoriesChange?: (categories: Set<EventCategory>) => void;

  // Session board — strict mapping of daemon agent-diagnostics event
  sessionBoardState?: SessionBoardData;

  // Sessions
  sessionsSessions?: SessionInfo[];
  sessionsActiveId?: string;
  onSessionsSelect?: (sessionId: string) => void;

  className?: string;
  style?: CSSProperties;
}
