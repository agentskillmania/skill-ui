/**
 * @fileoverview Diagnostics slice type definitions
 *
 * Types for the diagnostics snapshot state machine. Unlike the conversation
 * slice (which is incremental), the diagnostics slice uses snapshot
 * semantics: each 'agent-diagnostics' event replaces the entire state.
 *
 * The event shape mirrors the daemon's buildDiagnostics() output from
 * wrangler-daemon agent-session.ts — runner (features + tools + skills),
 * agent, llm, systemPrompt, and session (overview + info).
 */

export interface DiagnosticsFeatureFlags {
  sandbox: boolean;
  thinkingEnabled: boolean;
  enablePromptThinking: boolean;
  a2uiEnabled: boolean;
  compressorEnabled: boolean;
  enableSession: boolean;
  enableTodolist: boolean;
  enableCommands: boolean;
}

export interface DiagnosticsToolMeta {
  name: string;
  description?: string;
  type?: string;
  enabled?: boolean;
}

export interface DiagnosticsSkillMeta {
  name: string;
  description?: string;
  source?: string;
}

export interface DiagnosticsRunnerState {
  features: DiagnosticsFeatureFlags | null;
  tools: DiagnosticsToolMeta[];
  skills: DiagnosticsSkillMeta[];
}

export interface DiagnosticsSessionOverview {
  title?: string;
  agentName: string;
  model: string;
  stepCount: number;
  messageCount: number;
  tokensIn?: number;
  tokensOut?: number;
  tokensTotal?: number;
  estimatedContextSize?: number;
  contextWindow?: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface DiagnosticsSessionInfo {
  sessionId: string;
  agentName: string;
  agentConfigPath?: string;
  model: string;
  tokensIn?: number;
  tokensOut?: number;
  tokensTotal?: number;
  workspacePath: string;
  sessionPath?: string;
  skillDirs?: string[];
  mcpConfigPaths?: string[];
}

export interface DiagnosticsState {
  runner: DiagnosticsRunnerState | null;
  agent: Record<string, unknown> | null;
  llm: { messages: unknown[]; tools?: unknown[]; skill?: string } | null;
  systemPrompt: string | null;
  session: {
    overview: DiagnosticsSessionOverview | null;
    info: DiagnosticsSessionInfo | null;
  };
}

export function createEmptyDiagnosticsState(): DiagnosticsState {
  return {
    runner: null,
    agent: null,
    llm: null,
    systemPrompt: null,
    session: { overview: null, info: null },
  };
}

export const DIAGNOSTICS_EVENT = 'agent-diagnostics';
