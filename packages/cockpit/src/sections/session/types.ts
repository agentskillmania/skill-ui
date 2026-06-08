/** Session status displayed in the dashboard. */
export type SessionStatus = 'idle' | 'running' | 'error';

/** Session overview data — dashboard summary metrics for the Overview card. */
export interface SessionOverviewData {
  /** Human-readable session title. Missing → display "Untitled". */
  title?: string;
  /** Agent name. */
  agentName: string;
  /** Configured model. */
  model: string;
  /** Cumulative execution steps. */
  stepCount: number;
  /** Total messages. */
  messageCount: number;
  /** Cumulative input tokens. */
  tokensIn?: number;
  /** Cumulative output tokens. */
  tokensOut?: number;
  /** Cumulative total tokens. */
  tokensTotal?: number;
  /** Estimated next-request context tokens. */
  estimatedContextSize?: number;
  /** Context window limit. */
  contextWindow?: number;
  /** Runtime status. */
  status: SessionStatus;
  /** ISO creation timestamp. */
  createdAt: string;
  /** ISO update timestamp. */
  updatedAt: string;
}

/** Session info data — detailed key-value data for the Session Info card. */
export interface SessionInfoData {
  /** Session ID. */
  sessionId: string;
  /** Agent name. */
  agentName: string;
  /** Agent definition file path. */
  agentConfigPath?: string;
  /** Configured model. */
  model: string;
  /** Cumulative input tokens. */
  tokensIn?: number;
  /** Cumulative output tokens. */
  tokensOut?: number;
  /** Cumulative total tokens. */
  tokensTotal?: number;
  /** Workspace root path. */
  workspacePath: string;
  /** Session data directory path. */
  sessionPath?: string;
  /** Skill directories. */
  skillDirs: string[];
  /** MCP config file paths. */
  mcpConfigPaths: string[];
}
