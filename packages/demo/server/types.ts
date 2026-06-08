/**
 * Shared types for chat-demo server
 */

/** Configuration for creating a new agent session */
export interface CreateSessionRequest {
  agentPath?: string;
  workspacePath?: string;
  skillPath?: string;
}

/** Agent info returned by launcher API */
export interface AgentInfo {
  id: string;
  name: string;
  description: string;
  path: string;
  toolCount: number;
  skillCount: number;
}

/** Skill info returned by launcher API */
export interface SkillInfo {
  id: string;
  name: string;
  description: string;
  path: string;
}

/** Session info returned by launcher/sessions API */
export interface SessionInfo {
  id: string;
  workspacePath: string;
  agentName: string;
  model: string;
  status: 'idle' | 'running' | 'error' | 'completed';
  createdAt: string;
  updatedAt: string;
  messageCount: number;
}

/** Launcher data response */
export interface LauncherData {
  agents: AgentInfo[];
  skills: SkillInfo[];
  sessions: SessionInfo[];
}

/** Options for creating an AgentSession */
export interface AgentSessionOptions {
  workspacePath: string;
  agentName: string;
  agentInstructions: string;
  model?: string;
  skillDirs?: string[];
  mcpConfigPaths?: string[];
  sessionId?: string;
  sessionBaseDir?: string;
}

/** Cockpit event pushed to frontend */
export interface CockpitSSEEvent {
  event: 'cockpit-event';
  data: {
    type: CockpitEventType;
    subtype: string;
    label: string;
    payload?: Record<string, unknown>;
    timestamp: number;
    relatedMessageId?: string;
  };
}

export type CockpitEventType =
  | 'lifecycle'
  | 'phase'
  | 'token'
  | 'tool'
  | 'error'
  | 'compressing'
  | 'skill'
  | 'subagent'
  | 'llm'
  | 'thinking';

/** Agent state snapshot pushed to frontend */
export interface AgentStateSnapshot {
  agentName: string;
  model: string;
  status: 'idle' | 'running' | 'paused' | 'error' | 'completed';
  duration?: number;
  startedAt?: number;
  tokensIn: number;
  tokensOut: number;
  tokensTotal: number;
  contextLimit: number;
  messageCount: number;
  stepCount: number;
  skills: Array<{
    name: string;
    description: string;
    source: string;
    status: string;
    tokenCount: number;
    visible: boolean;
  }>;
  tools: Array<{
    name: string;
    description: string;
    enabled: boolean;
    type: string;
    visible: boolean;
  }>;
  estimatedContextSize: number;
  compressionHistory: Array<{
    summary: string;
    removedCount: number;
    timestamp: number;
  }>;
}
