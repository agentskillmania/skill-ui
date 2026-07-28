/**
 * Shared types for chat-demo client
 */

/** Route state for client-side navigation */
export type Route = { page: 'launcher' } | { page: 'workspace'; sessionId: string };

/** View mode within a workspace */
export type ViewMode = 'cockpit' | 'editor';

/** Agent info from launcher API */
export interface DemoAgent {
  id: string;
  name: string;
  description: string;
  path: string;
  toolCount: number;
  skillCount: number;
}

/** Skill info from launcher API */
export interface DemoSkill {
  id: string;
  name: string;
  description: string;
  path: string;
}

/** Session info returned by sessions API */
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

/** Launcher API response */
export interface LauncherData {
  agents: DemoAgent[];
  skills: DemoSkill[];
  sessions: SessionInfo[];
}
