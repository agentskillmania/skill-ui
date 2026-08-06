/**
 * @fileoverview Resource type definitions
 *
 * Typed shapes for daemon-exposed resources (sessions, agents, skills, crews).
 * Normalizers in the sibling modules convert loose raw API payloads into these
 * typed objects with safe defaults so downstream UIs can render without null
 * guards everywhere.
 */

/** A session's high-level metadata for list/detail views. */
export interface SessionMeta {
  id: string;
  title?: string;
  agentName: string;
  model: string;
  workspacePath: string;
  status: 'idle' | 'running' | 'error';
  messageCount: number;
  stepCount: number;
  tokensIn?: number;
  tokensOut?: number;
  tokensTotal?: number;
  contextWindow?: number;
  estimatedContextSize?: number;
  createdAt: string;
  updatedAt: string;
}

/** An agent definition parsed from an AGENT.md config. */
export interface AgentResource {
  name: string;
  description?: string;
  model?: string;
  thinking?: { enabled: boolean };
  instructions?: string;
  skillDirs?: string[];
  mcpPaths?: string[];
  configPath: string;
}

/** A skill definition parsed from a SKILL.md config. */
export interface SkillResource {
  name: string;
  description: string;
  files?: string[];
  configPath: string;
}

/** A crew definition parsed from a CREW.md config. */
export interface CrewResource {
  name: string;
  description?: string;
  primaryAgent: string;
  memory?: string;
  agentDefs: string[];
  skillDirs?: string[];
  configPath: string;
}

/** A loose, untyped daemon API payload object. */
export type RawResource = Record<string, unknown>;
